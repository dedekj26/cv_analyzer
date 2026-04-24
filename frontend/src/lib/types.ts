export type AnalysisLabel = "Perlu Perbaikan" | "Bagus" | "Luar Biasa";

export interface AnalysisResult {
  score: number;
  label: AnalysisLabel;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  fileName: string;
  analyzedAt: string;
}

export type AppState =
  | { kind: "idle" }
  | { kind: "uploading"; file: File }
  | { kind: "analyzing"; file: File }
  | { kind: "results"; result: AnalysisResult }
  | { kind: "error"; message: string; file?: File };