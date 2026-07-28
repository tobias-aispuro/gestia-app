import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Color puntual (ej. el color de una categoría) — sustituye el tono si se pasa. */
  dotColor?: string | null;
}

const tones: Record<Tone, string> = {
  neutral: "bg-raised text-body border-border-default",
  info: "bg-info-bg text-info border-transparent",
  success: "bg-positive-bg text-positive border-transparent",
  warning: "bg-warning-bg text-warning border-transparent",
  danger: "bg-negative-bg text-negative border-transparent",
};

export default function Badge({
  tone = "neutral",
  dotColor,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-xs font-medium leading-none whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {dotColor && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: dotColor }}
        />
      )}
      {children}
    </span>
  );
}
