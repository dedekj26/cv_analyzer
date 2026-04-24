"""
PDF Parser — Mengekstrak teks dari file PDF.
Semua pemrosesan dilakukan di memori (tidak ada penulisan ke disk).
"""

import io
from loguru import logger
from PyPDF2 import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Mengekstrak teks dari file PDF yang diberikan sebagai bytes.

    Args:
        file_bytes: Konten file PDF dalam bentuk bytes.

    Returns:
        Teks yang diekstrak dari semua halaman PDF.

    Raises:
        ValueError: Jika file tidak dapat dibaca atau teks kosong.
    """
    try:
        pdf_buffer = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_buffer)

        if len(reader.pages) == 0:
            raise ValueError("File PDF tidak memiliki halaman.")

        all_text = []
        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                all_text.append(page_text.strip())

        full_text = "\n\n".join(all_text).strip()

        if not full_text or len(full_text) < 50:
            raise ValueError(
                "Teks yang diekstrak dari PDF terlalu sedikit. "
                "Pastikan file PDF berisi teks yang dapat dibaca (bukan gambar/scan)."
            )

        logger.info(
            f"PDF berhasil diparsing: {len(reader.pages)} halaman, "
            f"{len(full_text)} karakter"
        )
        return full_text

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Gagal mengekstrak teks dari PDF: {str(e)}")
        raise ValueError(
            f"Tidak dapat mengekstrak teks dari file PDF. "
            f"Pastikan file tidak rusak atau terkunci. Detail: {str(e)}"
        )
