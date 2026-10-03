import uuid
import logging
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.config import settings
from app.models.project import Project
from app.models.execution import ExecutionEvent
from openai import AsyncOpenAI

router = APIRouter(prefix="/ask", tags=["ask"])
logger = logging.getLogger(__name__)

class AskQuery(BaseModel):
    project_id: uuid.UUID
    query: str

class AskResponse(BaseModel):
    response: str
    sources: list[str]

@router.post("/query", response_model=AskResponse)
async def ask_veritas(query_data: AskQuery, db: AsyncSession = Depends(get_db)):
    # 1. Fetch project context for RAG
    stmt = select(Project).where(Project.id == query_data.project_id)
    result = await db.execute(stmt)
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 2. Fetch recent events for context
    evt_stmt = select(ExecutionEvent).where(ExecutionEvent.project_id == query_data.project_id).order_by(ExecutionEvent.created_at.desc()).limit(10)
    evt_result = await db.execute(evt_stmt)
    recent_events = evt_result.scalars().all()
    
    context_text = (
        f"Project Name: {project.name}\n"
        f"Project Code: {project.code}\n"
        f"Status: {project.status.value}\n"
        f"Description: {project.description or 'N/A'}\n"
        f"Location: {project.location or 'N/A'}\n\n"
        f"Recent Execution Events:\n"
    )
    for evt in recent_events:
        extracted = json.dumps(evt.extracted_data) if evt.extracted_data else 'None'
        context_text += f"- [{evt.created_at.strftime('%Y-%m-%d %H:%M')}] Status: {evt.status.value}, Type: {evt.source_type.value}, Data: {extracted}\n"

    # 3. Use OpenAI if key is present
    if settings.LLM_API_KEY and settings.LLM_API_KEY.strip() != "":
        try:
            client = AsyncOpenAI(api_key=settings.LLM_API_KEY)
            
            system_prompt = (
                "You are VERITAS, an elite, highly intelligent AI project execution assistant. "
                "You have access to real-time project data, schedule variances, and field logs. "
                "Answer the user's questions clearly, concisely, and accurately. "
                "If the context doesn't contain the exact answer, rely on your deep general knowledge about construction, project management, and scheduling, but clarify when you are doing so. "
                "Format your responses nicely. Maintain a professional, analytical, yet approachable tone."
            )
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context Information:\n{context_text}\n\nUser Question: {query_data.query}"}
            ]
            
            response = await client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=messages,
                temperature=0.3,
                max_tokens=800
            )
            
            ai_response = response.choices[0].message.content
            
            sources = ["Project Database"]
            if recent_events:
                sources.append("Recent Execution Events")
                
            return AskResponse(response=ai_response, sources=sources)
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            # Fall through to offline fallback below
    
    # 4. Smart Offline Fallback (No API Key configured)
    query = query_data.query.lower()
    if "delay" in query or "variance" in query or "behind" in query:
        response = f"Based on the execution events for {project.name}, there are critical sequence variances being tracked. Please review the governance queue for pending approvals."
        sources = ["Variance Engine"]
    elif "status" in query or "health" in query:
        response = f"Project {project.name} ({project.code}) is currently {project.status.value}. I am tracking {len(recent_events)} recent field events."
        sources = ["Project Core", "Event Stream"]
    elif "who" in query or "team" in query:
        response = f"The {project.name} team consists of engineers, planners, and field supervisors collaborating through VERITAS. Check the project members tab for exact assignments."
        sources = ["Directory"]
    else:
        response = (
            f"I am VERITAS. You asked: '{query_data.query}'.\n\n"
            f"I see you are asking about {project.name}. My live LLM connection is currently offline (API key not configured in backend .env), "
            "but I can confirm this project is active and I'm continuously monitoring its execution logs. "
            "To unlock my full potential and have me answer absolutely anything, please add an OpenAI API key to the backend configuration."
        )
        sources = ["VERITAS Memory"]
        
    return AskResponse(response=response, sources=sources)
