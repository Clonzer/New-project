export function AnimatedGradientBg({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#06111a_0%,#081521_44%,#0b1020_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(8,145,178,0.22),transparent_36%,rgba(99,102,241,0.14)_74%,transparent)] animate-gradient-shift bg-[length:180%_180%]" />

      {/* Fine grain noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-noise" />

      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.22) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
