import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export const Button = forwardRef(({ className, variant = "primary", size = "default", children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "btn",
        {
          "btn-primary": variant === "primary",
          "btn-secondary": variant === "secondary",
          "btn-surface": variant === "surface",
          "btn-danger": variant === "danger",
          "px-4 py-2 text-sm": size === "default",
          "px-3 py-1 text-xs": size === "sm",
          "px-6 py-3 text-base": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";
