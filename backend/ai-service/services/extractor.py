import io
import PyPDF2
from docx import Document

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    text = ""
    if filename.endswith('.pdf'):
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    elif filename.endswith('.docx'):
        doc = Document(io.BytesIO(file_content))
        for para in doc.paragraphs:
            text += para.text + "\n"
    return text
