from fastapi import APIRouter, Depends
from pydantic import BaseModel
import asyncio
from typing import Optional

router = APIRouter(prefix="/ask", tags=["ask"])

class AskQuery(BaseModel):
    project_id: str
    query: str

class AskResponse(BaseModel):
    response: str
    sources: list[str]

@router.post("/query", response_model=AskResponse)
async def ask_veritas(query_data: AskQuery):
    # Simulate processing delay
    await asyncio.sleep(1.5)
    
    query = query_data.query.lower()
    
    # Mock intelligent responses based on keywords
    if "delay" in query or "variance" in query:
        return AskResponse(
            response="Based on recent execution events, there are currently critical sequence variances causing a projected 3.5 day delay on the primary structural path. I recommend reviewing the 'Foundation Pour' dependencies.",
            sources=["Variance Report #1048", "Schedule Version 3"]
        )
    elif "status" in query or "health" in query:
        return AskResponse(
            response="The project is generally stable, but there are 4 pending events in the governance queue requiring planner review. Clearing these will update the schedule baseline.",
            sources=["Governance Queue", "Project Overview"]
        )
    else:
        return AskResponse(
            response=f"I found some context related to '{query_data.query}'. According to the project memory, this area has been active over the past week with 12 field updates recorded.",
            sources=["Project Memory", "Field Event Logs"]
        )
