const AmbientGlow = () => (
  <>
    <div
      aria-hidden
      className="pointer-events-none fixed -top-[20%] -right-[10%] size-[800px] rounded-full bg-gradient-radial blur-3xl"
    />
    <div
      aria-hidden
      className="pointer-events-none fixed -bottom-[10%] -left-[20%] size-[600px] rounded-full bg-gradient-radial opacity-50 blur-3xl"
    />
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 opacity-[0.015] mix-blend-overlay"
      style={{
        backgroundImage:
          "radial-gradient(circle, hsl(var(--cyan)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />
  </>
);

export default AmbientGlow;