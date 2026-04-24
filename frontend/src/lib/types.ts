// Labels must match values returned by the Python AI service / Gemini prompt
export type AnalysisLabel = "Kurang" | "Cukup" | "Bagus" | "Sangat Bagus";

export interface AnalysisResult {
  score: number;
  label: AnalysisLabel;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  /** Enriched client-side — not stored by server (privacy NFR-6) */
  fileName: string;
  /** ISO-8601 timestamp enriched client-side */
  analyzedAt: string;
}

export type AppState =
  | { kind: "idle" }
  | { kind: "uploading"; file: File }
  | { kind: "analyzing"; file: File }
  | { kind: "results"; result: AnalysisResult }
  | { kind: "error"; message: string; file?: File };