import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn("input", className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
