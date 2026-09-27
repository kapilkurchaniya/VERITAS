import os
import pdfplumber
from app.ai.interfaces import OCRProvider, OCRResult

class PDFDocumentParser:
    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> str:
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"Failed to parse PDF {pdf_path}: {e}")
        return text

class TesseractOCRProvider(OCRProvider):
    async def extract_text(self, image_path: str) -> OCRResult:
        # Since Tesseract requires system dependencies, we provide a mock for this prototype
        # unless configured otherwise.
        return OCRResult(
            text="[Mock OCR] Extracted text from image: Activity XYZ was completed.",
            confidence=0.85,
            provider_model="tesseract-mock"
        )
