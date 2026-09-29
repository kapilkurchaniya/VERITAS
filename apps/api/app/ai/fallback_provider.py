import os
import json
from typing import Dict, Any
from openai import AsyncOpenAI
import structlog

from app.ai.interfaces import LLMProvider, ExtractionResult

logger = structlog.get_logger(__name__)

class FallbackLLMProvider(LLMProvider):
    def __init__(self):
        self.providers = []
        
        # 1. Groq (Fastest, good for structured extraction)
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            self.providers.append({
                "name": "groq",
                "client": AsyncOpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1"),
                "model": "llama-3.3-70b-versatile" # Good model for JSON extraction
            })
            
        # 2. Gemini (Great fallback)
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            self.providers.append({
                "name": "gemini",
                "client": AsyncOpenAI(api_key=gemini_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/"),
                "model": "gemini-2.5-flash"
            })
            
        if not self.providers:
            logger.warn("No free API keys found for FallbackLLMProvider. Will use dummy responses.")

    async def extract_structured(self, text: str, schema: Dict[str, Any]) -> ExtractionResult:
        if not self.providers:
            return ExtractionResult(
                structured_data={
                    "event_type": "completed",
                    "activity_description": "Dummy fallback extraction",
                    "location": "Dummy",
                },
                provider_model="dummy",
                tokens_used=0
            )

        prompt = f"Extract information from the following text based on the provided JSON schema. Ensure the response is valid JSON.\n\nText: {text}\n\nSchema: {json.dumps(schema)}"
        
        last_error = None
        for provider in self.providers:
            try:
                logger.info("Attempting extraction with provider", provider=provider["name"], model=provider["model"])
                
                # Gemini requires 'response_format' handling slightly differently sometimes, but standard OpenAI JSON object works in v1beta/openai
                response = await provider["client"].chat.completions.create(
                    model=provider["model"],
                    messages=[{"role": "user", "content": prompt}],
                    response_format={ "type": "json_object" }
                )
                
                content = response.choices[0].message.content
                parsed = json.loads(content) if content else {}
                
                logger.info("Extraction successful", provider=provider["name"])
                
                return ExtractionResult(
                    structured_data=parsed,
                    provider_model=provider["model"],
                    tokens_used=response.usage.total_tokens if response.usage else 0
                )
            except Exception as e:
                logger.error("Provider failed", provider=provider["name"], error=str(e))
                last_error = e
                continue # Try next provider
                
        raise RuntimeError(f"All fallback providers failed. Last error: {last_error}")

import base64
from app.ai.interfaces import OCRProvider, OCRResult

class FallbackVisionProvider(OCRProvider):
    def __init__(self):
        self.providers = []
        
        # 1. Groq (Llama 3.2 Vision)
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            self.providers.append({
                "name": "groq",
                "client": AsyncOpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1"),
                "model": "llama-3.2-11b-vision-preview" # Vision model on Groq
            })
            
        # 2. Gemini (Gemini 2.5 Flash / 1.5 Flash supports vision natively)
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            self.providers.append({
                "name": "gemini",
                "client": AsyncOpenAI(api_key=gemini_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/"),
                "model": "gemini-2.5-flash"
            })
            
    async def extract_text(self, image_path: str) -> OCRResult:
        if not self.providers:
             return OCRResult(text="[Mock OCR] No free API keys found.", confidence=0.0, provider_model="dummy")

        try:
            with open(image_path, "rb") as f:
                img_data = f.read()
            b64_img = base64.b64encode(img_data).decode('utf-8')
        except Exception as e:
            logger.error("Failed to read image", path=image_path, error=str(e))
            return OCRResult(text="", confidence=0.0, provider_model="error")

        prompt = "Extract all readable text from this image exactly as written. Do not add any extra commentary."
        
        last_error = None
        for provider in self.providers:
            try:
                logger.info("Attempting OCR with provider", provider=provider["name"], model=provider["model"])
                
                response = await provider["client"].chat.completions.create(
                    model=provider["model"],
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{b64_img}"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=1024
                )
                
                content = response.choices[0].message.content
                logger.info("OCR successful", provider=provider["name"])
                
                return OCRResult(
                    text=content or "",
                    confidence=0.95, # Assumed high for LLMs
                    provider_model=provider["model"]
                )
            except Exception as e:
                logger.error("Vision Provider failed", provider=provider["name"], error=str(e))
                last_error = e
                continue
                
        raise RuntimeError(f"All vision fallback providers failed. Last error: {last_error}")

from app.ai.interfaces import SpeechProvider, TranscriptionResult, EmbeddingProvider
from typing import List

class FreeSTTProvider(SpeechProvider):
    def __init__(self):
        # Uses Groq's whisper API
        groq_key = os.getenv("GROQ_API_KEY", "dummy")
        self.client = AsyncOpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1")
        self.model = "whisper-large-v3-turbo"

    async def transcribe(self, audio_file_path: str, language: str = "en") -> TranscriptionResult:
        if self.client.api_key == "dummy" or not self.client.api_key:
            return TranscriptionResult(
                transcript="[Simulated Audio] Pipe spool erection completed at Line 24 around 3 PM.",
                language=language,
                confidence=0.98,
                duration=5.0,
                provider_model="mock"
            )
            
        with open(audio_file_path, "rb") as audio_file:
            response = await self.client.audio.transcriptions.create(
                model=self.model,
                file=audio_file,
                response_format="verbose_json"
            )
            
        return TranscriptionResult(
            transcript=response.text,
            language=getattr(response, "language", language),
            confidence=0.99,
            duration=getattr(response, "duration", 0.0),
            provider_model=self.model
        )

class FreeEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        # Uses Google Gemini for embeddings
        gemini_key = os.getenv("GEMINI_API_KEY", "dummy")
        self.client = AsyncOpenAI(api_key=gemini_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
        self.model = "text-embedding-004"

    async def embed(self, text: str) -> List[float]:
        if self.client.api_key == "dummy" or not self.client.api_key:
            # Note: Gemini embedding gives 768 dims, openai gave 1536. Pgvector expects what's in the schema.
            # Schema has `embedding = mapped_column(Vector(1536))` in `schedule.py`. 
            # We must output 1536 dims!
            return [0.0] * 1536
            
        response = await self.client.embeddings.create(
            input=text,
            model=self.model
        )
        embedding = response.data[0].embedding
        
        # VERY IMPORTANT: PostgreSQL pgvector was configured to 1536 dimensions (OpenAI's size) in alembic migrations.
        # Gemini embeddings are 768 dimensions. We must pad them with zeros to 1536 to prevent DB errors!
        if len(embedding) < 1536:
            embedding.extend([0.0] * (1536 - len(embedding)))
        elif len(embedding) > 1536:
            embedding = embedding[:1536]
            
        return embedding
