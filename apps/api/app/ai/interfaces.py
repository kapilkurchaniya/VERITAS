from abc import ABC, abstractmethod
from typing import Dict, Any, List
from dataclasses import dataclass

@dataclass
class TranscriptionResult:
    transcript: str
    language: str
    confidence: float
    duration: float
    provider_model: str

@dataclass
class OCRResult:
    text: str
    confidence: float
    provider_model: str

@dataclass
class ExtractionResult:
    structured_data: Dict[str, Any]
    provider_model: str
    tokens_used: int

class SpeechProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_file_path: str, language: str = "en") -> TranscriptionResult:
        pass

class OCRProvider(ABC):
    @abstractmethod
    async def extract_text(self, image_path: str) -> OCRResult:
        pass

class LLMProvider(ABC):
    @abstractmethod
    async def extract_structured(self, text: str, schema: Dict[str, Any]) -> ExtractionResult:
        pass

class EmbeddingProvider(ABC):
    @abstractmethod
    async def embed(self, text: str) -> List[float]:
        pass
