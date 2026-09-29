import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import async_session_factory
from app.models.execution import ExecutionEvent, EventStatus, SourceType
from app.ai.fallback_provider import FallbackLLMProvider, FallbackVisionProvider, FreeSTTProvider, FreeEmbeddingProvider
from app.ai.document_parser import PDFDocumentParser, TesseractOCRProvider
import structlog
from app.services.notifications import notification_service
from tavily import TavilyClient
import os

logger = structlog.get_logger(__name__)

# LLM Extraction Schema Definition
EXTRACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "event_type": {"type": "string", "enum": ["completed", "in_progress", "interrupted", "blocked"]},
        "activity_description": {"type": "string"},
        "location": {"type": ["string", "null"]},
        "start_time": {"type": ["string", "null"], "format": "date-time"},
        "end_time": {"type": ["string", "null"], "format": "date-time"},
        "quantity": {"type": ["number", "null"]},
        "unit": {"type": ["string", "null"]},
        "blocker": {"type": ["string", "null"]},
        "notes": {"type": ["string", "null"]}
    },
    "required": ["event_type", "activity_description"]
}

class PipelineOrchestrator:
    def __init__(self):
        self.speech_provider = FreeSTTProvider()
        self.llm_provider = FallbackLLMProvider()
        self.embedding_provider = FreeEmbeddingProvider()
        self.ocr_provider = FallbackVisionProvider()

    async def process_event_background(self, event_id: uuid.UUID):
        """Background task wrapper."""
        async with async_session_factory() as session:
            try:
                await self.process_event(session, event_id)
            except Exception as e:
                logger.error(f"Pipeline error for event {event_id}: {e}")
                event = await session.get(ExecutionEvent, event_id)
                if event:
                    event.status = EventStatus.FAILED
                    await session.commit()

    async def process_event(self, session: AsyncSession, event_id: uuid.UUID):
        event = await session.get(ExecutionEvent, event_id, options=[selectinload(ExecutionEvent.evidence)])
        if not event or event.status != EventStatus.PENDING_PROCESSING:
            return

        text_to_process = ""

        if event.source_type == SourceType.TEXT:
            text_to_process = event.raw_input
        elif event.source_type == SourceType.AUDIO:
            if event.evidence:
                audio_file = event.evidence[0] # Assume first evidence is the audio recording
                result = await self.speech_provider.transcribe(audio_file.file_path)
                text_to_process = result.transcript
                event.raw_input = result.transcript
        elif event.source_type == SourceType.PDF:
            if event.evidence:
                pdf_file = event.evidence[0]
                text_to_process = PDFDocumentParser.extract_text_from_pdf(pdf_file.file_path)
                event.raw_input = text_to_process
        elif event.source_type == SourceType.IMAGE:
            if event.evidence:
                img_file = event.evidence[0]
                result = await self.ocr_provider.extract_text(img_file.file_path)
                text_to_process = result.text
                event.raw_input = text_to_process

        if not text_to_process:
            event.status = EventStatus.FAILED
            await session.commit()
            return

        # Web Enrichment with Tavily
        tavily_key = os.getenv("TAVILY_API_KEY")
        if tavily_key and "weather" in text_to_process.lower() or "delay" in text_to_process.lower():
            try:
                logger.info("Pipeline: Enriching context with Tavily Search")
                tavily_client = TavilyClient(api_key=tavily_key)
                search_result = tavily_client.search(query=f"weather or construction news in location regarding: {text_to_process[:50]}", search_depth="basic")
                context = "\nWeb Context: " + "\n".join([res["content"] for res in search_result.get("results", [])[:2]])
                text_to_process += context
            except Exception as e:
                logger.error("Pipeline: Tavily search failed", error=str(e))

        # LLM Extraction
        extraction_result = await self.llm_provider.extract_structured(text_to_process, EXTRACTION_SCHEMA)

        
        # Normalization (Dummy for now)
        event.extracted_data = extraction_result.structured_data
        event.normalized_text = f"{extraction_result.structured_data.get('activity_description', '')} ({extraction_result.structured_data.get('event_type', '')})"
        
        event.status = EventStatus.EXTRACTED
        await session.commit()
        
        # Log usage (simulate AI logger)
        logger.info(
            "AI Pipeline Extraction", 
            event_id=str(event.id), 
            provider_model=extraction_result.provider_model,
            tokens_used=extraction_result.tokens_used
        )
        
        # Phase 5: Trigger MatchEngine
        from app.services.matching import MatchEngine
        matcher = MatchEngine()
        await matcher.run_matching(session, event.id)
        
        # Reload event to check status after matching
        await session.refresh(event)
        if event.status == EventStatus.REVIEW_REQUIRED:
            notification_service.send_alert(
                subject=f"Review Required: Event {event.id}",
                body=f"Execution Event {event.id} could not be automatically matched.\n\nText: {event.normalized_text}",
                to_email=os.getenv("EMAIL_USER") # Sending to self for testing
            )
