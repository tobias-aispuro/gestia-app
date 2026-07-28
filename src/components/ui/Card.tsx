import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export default function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-subtle bg-surface p-6",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
