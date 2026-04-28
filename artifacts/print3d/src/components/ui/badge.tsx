import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-primary/90 text-white shadow-sm shadow-primary/20",
        secondary:
          "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm shadow-red-500/20",
        outline:
          "text-foreground border-white/20 bg-transparent hover:bg-white/5",
        success:
          "border-transparent bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/20",
        warning:
          "border-transparent bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/20",
        glass:
          "glass border-white/10 text-white backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
