import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-glow shadow-elevated hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-error text-error-foreground hover:bg-error/90 shadow-elevated hover:shadow-floating",
        outline:
          "border border-border bg-background-elevated hover:bg-background-floating hover:shadow-elevated",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent shadow-elevated hover:shadow-glow-secondary transform hover:scale-[1.02]",
        ghost: "hover:bg-background-elevated hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        drama: "bg-gradient-drama text-primary-foreground shadow-drama hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98]",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-elevated",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-elevated",
        info: "bg-info text-info-foreground hover:bg-info/90 shadow-elevated",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
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
