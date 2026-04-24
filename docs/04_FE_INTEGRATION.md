# Dokumen Integrasi Frontend (FE Integration Document)
# CV Analyzer v1.0

---

## 1. Arsitektur Frontend

```
React App (Vite)
├── Pages (3 halaman via React Router)
│   ├── LandingPage     → CTA "Analisis CV Saya"
│   ├── UploadPage      → Drag-and-drop + validasi
│   └── ResultsPage     → Skor + Kekuatan + Kelemahan + Rekomendasi
├── Services
│   └── api.js          → Komunikasi dengan Backend API
├── Hooks
│   └── useAnalysis.js  → State management untuk alur analisis
└── Components (reusable)
    ├── FileDropzone, LoadingSpinner, ErrorMessage
    ├── ScoreDisplay, StrengthsList, WeaknessesList
    └── RecommendationsList
```

---

## 2. Setup Proyek

### 2.1. Inisialisasi

```bash
npx -y create-vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install axios react-router-dom jspdf
```

### 2.2. Konfigurasi Vite (vite.config.js)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

---

## 3. API Service Layer

### 3.1. Konfigurasi Axios

```js
// src/services/api.js

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 detik (termasuk buffer untuk analisis AI)
});

/**
 * Mengunggah dan menganalisis file CV
 * @param {File} file - File PDF/DOCX dari input
 * @returns {Promise<Object>} Hasil analisis
 */
export async function analyzeCV(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

/**
 * Mengunduh laporan PDF dari hasil analisis
 * @param {Object} analysisData - Objek data analisis (score, strengths, dll)
 */
export async function downloadReport(analysisData) {
  const response = await apiClient.post('/report/generate', analysisData, {
    responseType: 'blob',
  });

  // Buat link download otomatis
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  link.href = url;
  link.setAttribute('download', `Laporan_Analisis_CV_${today}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Memeriksa kesehatan server
 */
export async function checkHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}
```

### 3.2. Error Handling

```js
// src/services/api.js (lanjutan)

// Interceptor untuk menangani error secara konsisten
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        code: 'ANALYSIS_TIMEOUT',
        message: 'Analisis memerlukan waktu terlalu lama. Silakan coba lagi.',
      });
    }

    if (!error.response) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      });
    }

    const serverError = error.response.data?.error;
    return Promise.reject({
      code: serverError?.code || 'UNKNOWN_ERROR',
      message: serverError?.message || 'Terjadi kesalahan. Silakan coba lagi.',
    });
  }
);
```

---

## 4. Custom Hook

```jsx
// src/hooks/useAnalysis.js

import { useState, useCallback } from 'react';
import { analyzeCV, downloadReport } from '../services/api';

// Status: idle | validating | uploading | analyzing | success | error
export function useAnalysis() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const validate = useCallback((file) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Silakan unggah file dalam format PDF atau DOCX.' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'Ukuran file melebihi batas maksimal 5 MB.' };
    }
    if (file.size === 0) {
      return { valid: false, error: 'File yang diunggah kosong.' };
    }
    return { valid: true };
  }, []);

  const analyze = useCallback(async (selectedFile) => {
    // 1. Validasi client-side
    const validation = validate(selectedFile);
    if (!validation.valid) {
      setError({ code: 'VALIDATION_ERROR', message: validation.error });
      setStatus('error');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setStatus('uploading');

    try {
      setStatus('analyzing');
      const response = await analyzeCV(selectedFile);
      setResult(response.data);
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, [validate]);

  const handleDownload = useCallback(async () => {
    if (!result) return;
    try {
      await downloadReport(result);
    } catch (err) {
      setError({ code: 'DOWNLOAD_ERROR', message: 'Gagal mengunduh laporan.' });
    }
  }, [result]);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setFile(null);
  }, []);

  return { status, result, error, file, analyze, handleDownload, reset };
}
```

---

## 5. Komponen Utama

### 5.1. App.jsx (Router)

```jsx
// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import UploadPage from './components/UploadPage';
import ResultsPage from './components/ResultsPage';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={
          <UploadPage onResult={(data) => setAnalysisResult(data)} />
        } />
        <Route path="/results" element={
          <ResultsPage data={analysisResult} />
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

### 5.2. FileDropzone

```jsx
// src/components/FileDropzone.jsx

import { useState, useRef, useCallback } from 'react';

export default function FileDropzone({ onFileSelect, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect, disabled]);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  return (
    <div
      id="dropzone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      role="button"
      aria-label="Area unggah file"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
        className="hidden"
        aria-hidden="true"
      />
      <p className="text-lg font-medium text-gray-600">
        Seret dan lepas CV Anda di sini
      </p>
      <p className="text-sm text-gray-400 mt-2">
        atau klik untuk menelusuri — PDF atau DOCX, maks 5MB
      </p>
    </div>
  );
}
```

### 5.3. ScoreDisplay

```jsx
// src/components/ScoreDisplay.jsx

export default function ScoreDisplay({ score, label }) {
  const getColor = (score) => {
    if (score >= 80) return { ring: 'text-green-500', bg: 'bg-green-50' };
    if (score >= 60) return { ring: 'text-blue-500', bg: 'bg-blue-50' };
    if (score >= 40) return { ring: 'text-yellow-500', bg: 'bg-yellow-50' };
    return { ring: 'text-red-500', bg: 'bg-red-50' };
  };

  const colors = getColor(score);

  return (
    <div id="score-display" className={`text-center p-8 rounded-2xl ${colors.bg}`}>
      <div className={`text-7xl font-bold ${colors.ring}`}>
        {score}
      </div>
      <div className="text-xl text-gray-600 mt-2">{label}</div>
    </div>
  );
}
```

### 5.4. ErrorMessage

```jsx
// src/components/ErrorMessage.jsx

export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  return (
    <div id="error-message" className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
      <p className="text-red-700">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
```

---

## 6. Pemetaan Status UI

| Status Hook | Tampilan UI |
|---|---|
| `idle` | FileDropzone aktif, siap menerima file |
| `validating` | Validasi client-side (seketika) |
| `uploading` | Progress bar / spinner "Mengunggah..." |
| `analyzing` | Spinner animasi "Menganalisis CV Anda..." |
| `success` | Redirect ke ResultsPage dengan data |
| `error` | ErrorMessage inline + tombol "Coba Lagi" |

---

## 7. Integrasi dengan Backend

### Request Flow

```
[User drops file]
  → FileDropzone.onFileSelect(file)
    → useAnalysis.analyze(file)
      → validate(file)                    // client-side
      → analyzeCV(file)                   // POST /api/v1/analyze
        → Backend validates               // server-side
        → Backend → Python AI Service
        → Backend ← JSON result
      → setResult(data)
      → Navigate to /results

[User clicks Download]
  → useAnalysis.handleDownload()
    → downloadReport(result)             // POST /api/v1/report/generate
    → Browser downloads PDF

[User clicks "Unggah CV Lain"]
  → useAnalysis.reset()
  → Navigate to /upload
```

### Environment Variables

```env
# frontend/.env
VITE_API_URL=/api/v1

# frontend/.env.production
VITE_API_URL=https://api.cvanalyzer.id/api/v1
```

---

## 8. Responsivitas

| Breakpoint | Perilaku |
|---|---|
| `< 640px` (mobile) | Layout satu kolom, tombol full-width, font lebih kecil |
| `640px - 1024px` (tablet) | Layout satu kolom, padding lebih besar |
| `> 1024px` (desktop) | Layout terpusat max-width 720px, spacing optimal |

---

## 9. Aksesibilitas (A11y)

| Aspek | Implementasi |
|---|---|
| Keyboard Navigation | Semua elemen interaktif dapat diakses via Tab |
| ARIA Labels | `role="button"`, `role="alert"`, `aria-label` pada dropzone |
| Color Contrast | Minimum rasio 4.5:1 sesuai WCAG 2.1 AA |
| Screen Reader | Pesan error dibaca otomatis via `role="alert"` |
| Focus Indicators | Outline yang jelas pada elemen yang difokuskan |

---

*Akhir Dokumen*
