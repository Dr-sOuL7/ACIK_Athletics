import { cn } from "../../utils/cn";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("shimmer", className)}
      {...props}
    />
  );
}
