import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export const Card = forwardRef(({ className, children, hover = false, ...props }, ref) => (
  <div ref={ref} className={cn("card p-6", hover && "card-hover", className)} {...props}>
    {children}
  </div>
));
Card.displayName = "Card";

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight text-white", className)} {...props} />
);

export const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";
