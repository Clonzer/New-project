import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.96]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:shadow-[0_0_30px_rgba(139,92,246,0.5)] active:brightness-125 active:ring-2 active:ring-primary/50 border-0",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:brightness-110 active:shadow-[0_0_30px_rgba(239,68,68,0.5)] active:brightness-125 active:ring-2 active:ring-red-500/50 border-0",
        outline:
          "border-2 border-white/10 bg-white/5 text-foreground hover:bg-white/10 hover:border-white/20 active:bg-white/20 active:border-primary/50 active:shadow-[0_0_20px_rgba(139,92,246,0.3)] active:text-white backdrop-blur-sm",
        secondary:
          "bg-secondary text-secondary-foreground border border-white/10 hover:bg-white/10 hover:border-white/20 active:bg-white/20 active:border-white/40 active:shadow-[0_0_15px_rgba(255,255,255,0.1)] shadow-sm backdrop-blur-sm",
        ghost: "hover:bg-white/5 text-foreground hover:text-white active:bg-white/10 active:text-white active:ring-2 active:ring-white/20",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:text-primary/60",
        gradient: "bg-gradient-to-r from-primary via-purple-500 to-accent text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:brightness-110 active:shadow-[0_0_35px_rgba(139,92,246,0.6)] active:brightness-125 active:ring-2 active:ring-white/30 border-0",
        glass: "glass text-white hover:bg-white/10 border-white/20 shadow-lg active:bg-white/15 active:border-white/40 active:shadow-[0_0_25px_rgba(255,255,255,0.15)]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
