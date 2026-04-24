import { useCallback, useRef, useState } from "react";
import { AlertCircle, FileText, Upload } from "lucide-react";

interface UploadZoneProps {
  onFile: (file: File) => void;
  error?: string;
  compact?: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = [".pdf", ".docx"];
const ACCEPTED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function validate(file: File): string | null {
  const lower = file.name.toLowerCase();
  const okExt = ACCEPTED.some((e) => lower.endsWith(e));
  const okMime = ACCEPTED_MIME.includes(file.type) || file.type === "";
  if (!okExt || !okMime) {
    return "Silakan unggah file PDF atau DOCX.";
  }
  if (file.size > MAX_BYTES) {
    return `Ukuran file melebihi 5MB (${(file.size / 1024 / 1024).toFixed(1)}MB).`;
  }
  if (file.size === 0) {
    return "File kosong. Pilih dokumen lain.";
  }
  return null;
}

const UploadZone = ({ onFile, error: externalError, compact }: UploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError || externalError;

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      const err = validate(f);
      if (err) {
        setLocalError(err);
        return;
      }
      setLocalError(null);
      onFile(f);
    },
    [onFile],
  );

  return (
    <div className={compact ? "" : "max-w-xl"}>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`group relative block cursor-pointer rounded-2xl border-2 border-dashed bg-surface backdrop-blur-sm transition-all ${
          drag
            ? "border-cyan bg-cyan/[0.04] shadow-glow-soft"
            : error
              ? "border-destructive/50"
              : "border-white/[0.1] hover:border-cyan/40 hover:bg-surface-hover"
        } ${compact ? "p-6" : "p-10"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div
            className={`flex size-12 items-center justify-center rounded-xl border bg-background transition-all ${
              drag
                ? "border-cyan/50 text-cyan"
                : "border-white/[0.08] text-cyan group-hover:scale-110"
            }`}
          >
            <Upload className="size-5" />
          </div>
          <div>
            <p className="text-base font-medium text-white md:text-lg">
              {drag ? "Lepaskan file di sini" : "Seret & lepas, atau klik untuk memilih"}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              PDF atau DOCX · maks. 5MB · diproses di memori
            </p>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-background transition-transform group-hover:scale-[1.02]">
            <FileText className="size-4" />
            Pilih File Lokal
          </div>
        </div>
      </label>

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadZone;