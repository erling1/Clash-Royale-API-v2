import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm text-fg placeholder:text-fg-dim focus-visible:border-crystal/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crystal/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
