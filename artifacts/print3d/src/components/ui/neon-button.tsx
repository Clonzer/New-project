import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface NeonButtonProps extends ButtonProps {
  glowColor?: "primary" | "accent" | "white";
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, glowColor = "primary", children, ...props }, ref) => {
    const glowClasses = {
      primary: "shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] border-primary/50 bg-primary/10 text-primary hover:bg-primary hover:text-white",
      accent: "shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] border-accent/50 bg-accent/10 text-accent hover:bg-accent hover:text-white",
      white: "shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] border-white/20 bg-white/5 text-white hover:bg-white hover:text-black",
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300 border backdrop-blur-sm font-semibold rounded-xl",
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
