import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crystal/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-royal-bright to-royal text-fg border border-border-strong shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_12px_-2px_rgba(0,0,0,0.4)] hover:from-purple-bright hover:to-purple",
        gold: "bg-gradient-to-b from-gold-bright to-gold text-bg border border-gold-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_16px_-4px_rgba(245,201,72,0.5)] hover:from-gold hover:to-gold-dark",
        outline:
          "border border-border-strong bg-bg-panel/40 text-fg hover:bg-bg-panel-hover",
        ghost: "text-fg-muted hover:bg-bg-panel-hover hover:text-fg",
        danger:
          "bg-gradient-to-b from-danger to-rose-700 text-fg border border-rose-800 hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
