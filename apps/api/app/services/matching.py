import uuid
import os
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload

from app.models.execution import ExecutionEvent, EventStatus
from app.models.schedule import Activity, ScheduleVersion, ScheduleStatus
from app.ai.fallback_provider import FreeEmbeddingProvider
import structlog
from pinecone import Pinecone, ServerlessSpec
import cohere

logger = structlog.get_logger(__name__)

class MatchEngine:
    def __init__(self):
        self.embedding_provider = FreeEmbeddingProvider()
        
        # Thresholds
        self.AUTO_MATCH_THRESHOLD = 0.85
        self.REVIEW_THRESHOLD = 0.65
        
        self.pinecone_key = os.getenv("PINECONE_API_KEY", "")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "nexus")
        self.cohere_key = os.getenv("COHERE_API_KEY", "")
        
        self.pc = None
        self.index = None
        if self.pinecone_key:
            self.pc = Pinecone(api_key=self.pinecone_key)
            try:
                self.index = self.pc.Index(self.index_name)
            except Exception as e:
                logger.error("Failed to connect to Pinecone index", error=str(e))
                
        self.cohere_client = None
        if self.cohere_key:
            self.cohere_client = cohere.ClientV2(self.cohere_key)

    async def run_matching(self, session: AsyncSession, event_id: uuid.UUID):
        event = await session.get(ExecutionEvent, event_id)
        if not event or event.status != EventStatus.EXTRACTED:
            return

        # 1. Get embedding for the event text
        search_text = event.normalized_text
        if not search_text:
            logger.warn("MatchEngine: No normalized text", event_id=str(event.id))
            event.status = EventStatus.REVIEW_REQUIRED
            await session.commit()
            return
            
        vector = await self.embedding_provider.embed(search_text)
        
        # 2. Get active schedule version for the project
        stmt = select(ScheduleVersion).where(
            and_(
                ScheduleVersion.status == ScheduleStatus.ACTIVE,
                ScheduleVersion.schedule.has(project_id=event.project_id)
            )
        )
        result = await session.execute(stmt)
        active_version = result.scalars().first()
        
        if not active_version:
            logger.warn("MatchEngine: No active schedule version found", project_id=str(event.project_id))
            event.status = EventStatus.REVIEW_REQUIRED
            await session.commit()
            return

        # 3. Vector Similarity Search using Pinecone
        if not self.index:
             logger.warn("MatchEngine: Pinecone not initialized, falling back to review")
             event.status = EventStatus.REVIEW_REQUIRED
             await session.commit()
             return

        try:
            # Query Pinecone for top 20 matches for reranking
            query_response = self.index.query(
                vector=vector,
                top_k=20,
                include_metadata=True,
                filter={"schedule_version_id": str(active_version.id)}
            )
            
            matches = query_response.get("matches", [])
        except Exception as e:
            logger.error("MatchEngine: Pinecone query failed", error=str(e))
            matches = []
        
        if not matches:
            event.status = EventStatus.REVIEW_REQUIRED
            await session.commit()
            return
            
        best_activity_id = None
        best_score = 0.0
            
        # Optional: Cohere Rerank
        if self.cohere_client and len(matches) > 1:
            try:
                logger.info("MatchEngine: Reranking with Cohere", count=len(matches))
                documents = [f"{m['metadata'].get('activity_code', '')} {m['metadata'].get('name', '')} {m['metadata'].get('location', '')}" for m in matches]
                rerank_response = self.cohere_client.rerank(
                    model="rerank-english-v3.0",
                    query=search_text,
                    documents=documents,
                    top_n=1
                )
                top_idx = rerank_response.results[0].index
                best_match_pc = matches[top_idx]
                best_score = rerank_response.results[0].relevance_score
                best_activity_id = best_match_pc["id"]
            except Exception as e:
                logger.error("MatchEngine: Cohere rerank failed, falling back to pinecone top", error=str(e))
                best_activity_id = matches[0]["id"]
                best_score = matches[0]["score"]
        else:
            best_activity_id = matches[0]["id"]
            best_score = matches[0]["score"]
        
        # Fetch the actual activity from DB
        best_match = await session.get(Activity, uuid.UUID(best_activity_id))
        if not best_match:
            logger.error("MatchEngine: Activity in Pinecone not found in DB", activity_id=best_activity_id)
            event.status = EventStatus.REVIEW_REQUIRED
            await session.commit()
            return
            
        logger.info("MatchEngine result", event_id=str(event.id), best_match=best_match.activity_code, score=best_score)
        
        # 4. Apply Multi-factor Rules
        # We can penalize score if location doesn't match
        final_score = best_score
        extracted_data = event.extracted_data or {}
        extracted_location = extracted_data.get("location")
        if extracted_location and best_match.location:
            # simple string inclusion check
            if extracted_location.lower() not in best_match.location.lower() and best_match.location.lower() not in extracted_location.lower():
                final_score -= 0.15 # Penalty for mismatched location
        
        # If using Cohere, relevance score is usually calibrated, but let's stick to our thresholds
        if final_score >= self.AUTO_MATCH_THRESHOLD:
            event.status = EventStatus.MATCHED
            event.matched_activity_id = best_match.id
        else:
            event.status = EventStatus.REVIEW_REQUIRED
            
        await session.commit()

    async def compute_embeddings_background(self, version_id: uuid.UUID):
        from app.db.session import async_session_factory
        async with async_session_factory() as session:
            try:
                await self.compute_embeddings_for_version(session, version_id)
            except Exception as e:
                logger.error("MatchEngine: Error computing embeddings", error=str(e), version_id=str(version_id))

    async def compute_embeddings_for_version(self, session: AsyncSession, version_id: uuid.UUID):
        stmt = select(Activity).where(Activity.schedule_version_id == version_id, Activity.embedding.is_(None))
        result = await session.execute(stmt)
        activities = result.scalars().all()
        
        if not activities:
            return
            
        # Optional check: If pinecone is not initialized, we can't upload.
        if not self.index:
            logger.warn("MatchEngine: Pinecone not initialized. Skipping upsert.")
            return

        upsert_batch = []
        for activity in activities:
            text = f"{activity.activity_code} {activity.name} {activity.discipline or ''} {activity.location or ''}"
            vec = await self.embedding_provider.embed(text)
            
            # Still save in DB for fallback/compatibility if desired
            activity.embedding = vec
            
            # Prepare for pinecone
            upsert_batch.append({
                "id": str(activity.id),
                "values": vec,
                "metadata": {
                    "schedule_version_id": str(activity.schedule_version_id),
                    "activity_code": activity.activity_code,
                    "name": activity.name,
                    "discipline": activity.discipline or "",
                    "location": activity.location or ""
                }
            })
            
        # Upsert in batches to Pinecone
        batch_size = 100
        for i in range(0, len(upsert_batch), batch_size):
            batch = upsert_batch[i:i + batch_size]
            try:
                self.index.upsert(vectors=batch)
                logger.info("MatchEngine: Upserted batch to Pinecone", batch_size=len(batch))
            except Exception as e:
                logger.error("MatchEngine: Failed to upsert to pinecone", error=str(e))
                
        await session.commit()
        logger.info("MatchEngine: Computed embeddings for schedule activities", version_id=str(version_id), count=len(activities))
