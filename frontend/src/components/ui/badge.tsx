import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "border-border bg-bg-panel-hover text-fg",
        gold: "border-transparent bg-gold/15 text-gold-dark",
        crystal: "border-transparent bg-crystal/10 text-crystal",
        magic: "border-transparent bg-magic/12 text-magic",
        success: "border-transparent bg-success/12 text-success",
        danger: "border-transparent bg-danger/12 text-danger",
        muted: "border-border bg-bg-panel-hover text-fg-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
