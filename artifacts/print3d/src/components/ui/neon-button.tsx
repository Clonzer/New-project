import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface NeonButtonProps extends ButtonProps {
  glowColor?: "primary" | "accent" | "white" | "orange";
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, glowColor = "primary", children, ...props }, ref) => {
    const glowClasses = {
      primary: "shadow-[0_0_20px_rgba(6,182,212,0.3),0_0_40px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5),0_0_60px_rgba(6,182,212,0.3)] border-cyan-500/40 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400 bg-[length:200%_200%] animate-gradient-shift text-white hover:scale-105 transition-all duration-500",
      accent: "shadow-[0_0_20px_rgba(249,115,22,0.3),0_0_40px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5),0_0_60px_rgba(249,115,22,0.3)] border-orange-500/40 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-[length:200%_200%] animate-gradient-shift text-white hover:scale-105 transition-all duration-500",
      orange: "shadow-[0_0_25px_rgba(249,115,22,0.4),0_0_50px_rgba(249,115,22,0.3),0_0_75px_rgba(251,146,60,0.2)] hover:shadow-[0_0_35px_rgba(249,115,22,0.6),0_0_70px_rgba(249,115,22,0.4),0_0_100px_rgba(251,146,60,0.3)] border-orange-500/50 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-[length:300%_300%] animate-gradient-shift text-white hover:scale-105 transition-all duration-500",
      white: "shadow-[0_0_20px_rgba(255,255,255,0.2),0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3),0_0_60px_rgba(255,255,255,0.2)] border-white/30 bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_200%] animate-gradient-shift text-white hover:scale-105 transition-all duration-500",
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden border backdrop-blur-md font-semibold rounded-xl",
          glowClasses[glowColor],
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Button>
    );
  }
);
NeonButton.displayName = "NeonButton";
