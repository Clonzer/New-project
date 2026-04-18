import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface NeonButtonProps extends ButtonProps {
  glowColor?: "primary" | "accent" | "white";
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, glowColor = "primary", children, ...props }, ref) => {
    const glowClasses = {
      primary: "shadow-[0_0_20px_rgba(139,92,246,0.3),0_0_40px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5),0_0_60px_rgba(139,92,246,0.3)] border-primary/40 bg-gradient-to-r from-primary via-purple-600 to-primary bg-[length:200%_200%] animate-gradient-shift text-white hover:scale-105 transition-all duration-500",
      accent: "shadow-[0_0_20px_rgba(6,182,212,0.3),0_0_40px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5),0_0_60px_rgba(6,182,212,0.3)] border-cyan-500/40 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-[length:200%_200%] animate-gradient-shift text-white hover:scale-105 transition-all duration-500",
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
