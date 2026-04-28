export function AnimatedGradientBg({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {/* Dark base */}
      <div className="absolute inset-0 bg-[#050510]" />

      {/* Animated aurora blobs */}
      <div className="absolute top-[-20%] left-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full opacity-40 blur-[100px] bg-gradient-to-br from-[#7c3aed] via-[#4f46e5] to-transparent animate-aurora-1" />
      <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full opacity-30 blur-[90px] bg-gradient-to-bl from-[#06b6d4] via-[#0891b2] to-transparent animate-aurora-2" />
      <div className="absolute bottom-[0%] left-[20%] w-[60vw] h-[40vw] max-w-[700px] max-h-[500px] rounded-full opacity-25 blur-[110px] bg-gradient-to-tr from-[#a855f7] via-[#7c3aed] to-transparent animate-aurora-3" />
      <div className="absolute top-[40%] left-[-5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full opacity-20 blur-[80px] bg-gradient-to-r from-[#06b6d4] to-transparent animate-aurora-4" />

      {/* Fine grain noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-noise" />

      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
