"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "success" | "warning" | "danger" | "info"
  striped?: boolean
  animated?: boolean
  size?: "sm" | "md" | "lg"
}

const variantStyles = {
  default: "bg-gradient-to-r from-primary to-accent",
  success: "bg-gradient-to-r from-emerald-500 to-emerald-400",
  warning: "bg-gradient-to-r from-yellow-500 to-yellow-400",
  danger: "bg-gradient-to-r from-red-500 to-red-400",
  info: "bg-gradient-to-r from-blue-500 to-blue-400",
}

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", striped = false, animated = false, size = "md", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative w-full overflow-hidden rounded-full bg-zinc-800",
      sizeStyles[size],
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-500 ease-out",
        variantStyles[variant],
        striped && "bg-[length:20px_20px] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]",
        animated && striped && "animate-[progress-stripes_1s_linear_infinite]"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
