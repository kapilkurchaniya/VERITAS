import os
import json
from typing import Dict, Any, List
from openai import AsyncOpenAI

from app.ai.interfaces import (
    SpeechProvider, TranscriptionResult,
    LLMProvider, ExtractionResult,
    EmbeddingProvider
)

class OpenAISpeechProvider(SpeechProvider):
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("LLM_API_KEY", "dummy"))
        self.model = "whisper-1"

    async def transcribe(self, audio_file_path: str, language: str = "en") -> TranscriptionResult:
        # In a real app, we would send the file to OpenAI's Whisper API.
        # Since this is a local setup and we might not have a real key,
        # we will simulate it if the key is dummy.
        if self.client.api_key == "dummy":
            return TranscriptionResult(
                transcript="[Simulated Audio] Pipe spool erection completed at Line 24 around 3 PM.",
                language=language,
                confidence=0.98,
                duration=5.0,
                provider_model=self.model
            )
            
        with open(audio_file_path, "rb") as audio_file:
            response = await self.client.audio.transcriptions.create(
                model=self.model,
                file=audio_file,
                response_format="verbose_json"
            )
            
        return TranscriptionResult(
            transcript=response.text,
            language=response.language,
            confidence=0.99, # Whisper verbose gives more details, simplified here
            duration=response.duration,
            provider_model=self.model
        )


class OpenAILLMProvider(LLMProvider):
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("LLM_API_KEY", "dummy"))
        self.model = os.getenv("LLM_MODEL", "gpt-4o-mini")

    async def extract_structured(self, text: str, schema: Dict[str, Any]) -> ExtractionResult:
        if self.client.api_key == "dummy":
            # Return dummy structured data
            return ExtractionResult(
                structured_data={
                    "event_type": "completed",
                    "activity_description": "Pipe spool erection",
                    "location": "Line 24",
                    "end_time": "2026-09-28T15:00:00Z"
                },
                provider_model=self.model,
                tokens_used=150
            )

        prompt = f"Extract information from the following text based on the provided JSON schema.\n\nText: {text}\n\nSchema: {json.dumps(schema)}"
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )
        
        content = response.choices[0].message.content
        parsed = json.loads(content) if content else {}
        
        return ExtractionResult(
            structured_data=parsed,
            provider_model=self.model,
            tokens_used=response.usage.total_tokens if response.usage else 0
        )


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("LLM_API_KEY", "dummy"))
        self.model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

    async def embed(self, text: str) -> List[float]:
        if self.client.api_key == "dummy":
            # 1536 dim dummy vector
            return [0.0] * 1536

        response = await self.client.embeddings.create(
            input=text,
            model=self.model
        )
        return response.data[0].embedding
