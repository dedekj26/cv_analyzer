"""
OpenAI API Client — Mengirim prompt ke OpenAI ChatGPT dan memproses respons.
Dilengkapi dengan retry logic (exponential backoff) dan validasi respons.
"""

import json
import time
from loguru import logger
from openai import AsyncOpenAI

from app.models.schemas import CVAnalysisResult, Settings


settings = Settings()

client = AsyncOpenAI(api_key=settings.openai_api_key)


def _clean_json_response(raw_text: str) -> str:
    text = raw_text.strip()

    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


def _validate_and_fix_label(score: int, label: str) -> str:
    expected_labels = {
        (0, 39): "Kurang",
        (40, 59): "Cukup",
        (60, 79): "Bagus",
        (80, 100): "Sangat Bagus",
    }

    for (low, high), expected_label in expected_labels.items():
        if low <= score <= high:
            if label != expected_label:
                logger.warning(
                    f"Label '{label}' tidak sesuai dengan skor {score}. "
                    f"Diperbaiki menjadi '{expected_label}'."
                )
                return expected_label
            return label

    return label


async def analyze_cv_with_gemini(cv_text: str) -> dict:
    """
    Mengirim teks CV ke OpenAI API untuk dianalisis.

    Fitur:
    - Exponential backoff retry (1s, 2s, 4s)
    - Validasi skema JSON respons
    - Auto-fix label jika tidak sesuai skor

    Args:
        cv_text: Teks mentah CV yang sudah diekstrak.

    Returns:
        Dictionary berisi hasil analisis + metadata penggunaan API.

    Raises:
        RuntimeError: Jika semua retry gagal.
        ValueError: Jika respons tidak valid.
    """
    from app.analyzer.prompt import build_cv_analysis_prompt

    prompt = build_cv_analysis_prompt(cv_text)

    last_error = None

    for attempt in range(settings.max_retries):
        try:
            logger.info(
                f"Mengirim prompt ke OpenAI (attempt {attempt + 1}/{settings.max_retries})..."
            )

            start_time = time.time()
            response = await client.chat.completions.create(
                model=settings.openai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2048,
            )
            elapsed_ms = int((time.time() - start_time) * 1000)

            raw_text = response.choices[0].message.content
            logger.debug(f"Raw response dari OpenAI ({elapsed_ms}ms): {raw_text[:200]}...")

            clean_json = _clean_json_response(raw_text)
            parsed = json.loads(clean_json)

            result = CVAnalysisResult(**parsed)

            corrected_label = _validate_and_fix_label(result.score, result.label)

            usage = response.usage
            prompt_tokens = usage.prompt_tokens if usage else None
            completion_tokens = usage.completion_tokens if usage else None
            total_tokens = usage.total_tokens if usage else None

            logger.info(
                f"Analisis berhasil! Skor: {result.score}, "
                f"Label: {corrected_label}, "
                f"Tokens: {total_tokens}, "
                f"Waktu: {elapsed_ms}ms"
            )

            return {
                "score": result.score,
                "label": corrected_label,
                "strengths": result.strengths,
                "weaknesses": result.weaknesses,
                "recommendations": result.recommendations,
                "metadata": {
                    "model": settings.openai_model,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": total_tokens,
                    "processing_time_ms": elapsed_ms,
                },
            }

        except json.JSONDecodeError as e:
            last_error = e
            logger.warning(
                f"Respons OpenAI bukan JSON valid (attempt {attempt + 1}): {str(e)}"
            )
        except Exception as e:
            last_error = e
            logger.warning(
                f"Error saat memanggil OpenAI (attempt {attempt + 1}): {str(e)}"
            )

        if attempt < settings.max_retries - 1:
            delay = 2 ** attempt
            logger.info(f"Menunggu {delay} detik sebelum retry...")
            time.sleep(delay)

    error_msg = f"Gagal menganalisis CV setelah {settings.max_retries} percobaan. Error terakhir: {str(last_error)}"
    logger.error(error_msg)
    raise RuntimeError(error_msg)
