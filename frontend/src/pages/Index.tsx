import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AmbientGlow from "@/components/AmbientGlow";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import AnalyzingView from "@/components/AnalyzingView";
import ResultsView from "@/components/ResultsView";
import { analyzeCV } from "@/lib/api-client";
import type { AppState } from "@/lib/types";

const Index = () => {
  const [state, setState] = useState<AppState>({ kind: "idle" });

  useEffect(() => {
    if (state.kind === "results" || state.kind === "analyzing") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.kind]);

  const handleFile = useCallback((file: File) => {
    setState({ kind: "analyzing", file });
    analyzeCV(file)
      .then((result) => setState({ kind: "results", result }))
      .catch((err: Error) =>
        setState({ kind: "error", message: err.message, file }),
      );
  }, []);

  const handleReset = useCallback(() => setState({ kind: "idle" }), []);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background">
      <AmbientGlow />
      <AppHeader onReset={handleReset} />

      <AnimatePresence mode="wait">
        {state.kind === "idle" || state.kind === "error" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Hero
              onFile={handleFile}
              error={state.kind === "error" ? state.message : undefined}
            />
            <HowItWorks />
          </motion.div>
        ) : state.kind === "analyzing" || state.kind === "uploading" ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnalyzingView file={state.file} />
          </motion.div>
        ) : state.kind === "results" ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ResultsView result={state.result} onUploadAnother={handleReset} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AppFooter />
    </div>
  );
};

export default Index;
