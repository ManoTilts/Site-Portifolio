import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/0 before:via-primary/40 before:to-primary/0 hover:before:translate-x-[100%] before:transition-transform before:duration-500 before:translate-x-[-100%]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-destructive/25",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border hover:border-primary/20 hover:shadow-lg",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-md",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 animate-gradient bg-[length:300%_300%] relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent hover:before:translate-x-[150%] before:transition-transform before:duration-800 before:translate-x-[-150%] before:skew-x-12",
        glow: "bg-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 animate-pulse-glow",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
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
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
        {variant === 'default' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 