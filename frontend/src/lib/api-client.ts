import type { AnalysisResult } from "./types";

const BASE = "/api/v1";

/* ------------------------------------------------------------------ */
/*  POST /api/v1/analyze                                               */
/*  multipart/form-data, field: "file"                                 */
/*  Returns: { status, data: { score, label, strengths,               */
/*             weaknesses, recommendations }, processing_time_ms }     */
/* ------------------------------------------------------------------ */
export async function analyzeCV(file: File): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/analyze`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // Surface friendly messages from TRD-defined error codes
    if (res.status === 413) throw new Error("File terlalu besar. Maks. 5MB.");
    if (res.status === 400) throw new Error((err as { error?: string }).error ?? "Format file tidak didukung.");
    if (res.status === 504) throw new Error("Waktu analisis habis. Coba lagi.");
    throw new Error((err as { error?: string }).error ?? `Server error ${res.status}`);
  }

  const json = await res.json();

  // Backend returns { status, data, processing_time_ms }
  // We enrich with client-side metadata (fileName, analyzedAt) not stored by server (privacy NFR-6)
  const data = json.data as Omit<AnalysisResult, "fileName" | "analyzedAt">;

  return {
    ...data,
    fileName: file.name,
    analyzedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/*  POST /api/v1/report/generate                                       */
/*  JSON body: { score, label, strengths, weaknesses, recommendations }*/
/*  Returns: Blob (application/pdf)                                    */
/* ------------------------------------------------------------------ */
export async function downloadReport(result: AnalysisResult): Promise<void> {
  const payload = {
    score: result.score,
    label: result.label,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    recommendations: result.recommendations,
  };

  const res = await fetch(`${BASE}/report/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Gagal membuat laporan: ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date(result.analyzedAt).toISOString().slice(0, 10);
  a.href = url;
  a.download = `Laporan_Analisis_CV_${stamp}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  GET /api/v1/health                                                  */
/* ------------------------------------------------------------------ */
export async function checkHealth(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error("API Gateway tidak merespons.");
  return res.json();
}
