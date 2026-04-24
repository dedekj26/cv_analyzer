import type { AnalysisResult } from "./types";

const BASE = "/api/v1";

/**
 * Send CV file to Go API Gateway → Python AI service.
 * POST /api/v1/analyze  (multipart/form-data, field: "file")
 */
export async function analyzeCV(file: File): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/analyze`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `Server error ${res.status}`
    );
  }

  const json = await res.json();
  // Backend shape: { status, data, processing_time_ms }
  const data = json.data as AnalysisResult;
  return data;
}

/**
 * Generate PDF report from an existing analysis result.
 * POST /api/v1/report/generate  (JSON body)
 * Returns a Blob (application/pdf).
 */
export async function generateReport(result: AnalysisResult): Promise<Blob> {
  const res = await fetch(`${BASE}/report/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `Server error ${res.status}`
    );
  }

  return res.blob();
}
