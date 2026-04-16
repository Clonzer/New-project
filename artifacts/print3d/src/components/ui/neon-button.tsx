import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface NeonButtonProps extends ButtonProps {
  glowColor?: "primary" | "accent" | "white";
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, glowColor = "primary", children, ...props }, ref) => {
    const glowClasses = {
      primary: "shadow-lg shadow-primary/25 hover:shadow-primary/40 border-primary/30 bg-gradient-to-r from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20 hover:text-white transition-all duration-300",
      accent: "shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 text-cyan-400 hover:from-cyan-500/30 hover:to-cyan-500/20 hover:text-white transition-all duration-300",
      white: "shadow-lg shadow-white/10 hover:shadow-white/20 border-white/20 bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 hover:text-black transition-all duration-300",
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden border backdrop-blur-md font-semibold rounded-xl hover:-translate-y-0.5 active:translate-y-0",
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
