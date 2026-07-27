import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "danger";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  title?: string;
  onDismiss?: () => void;
}

const tones: Record<Tone, { border: string; bg: string; text: string; icon: ReactNode }> = {
  info: {
    border: "border-info/25",
    bg: "bg-info-bg",
    text: "text-info",
    icon: <circle cx="10" cy="10" r="7" />,
  },
  success: {
    border: "border-positive/25",
    bg: "bg-positive-bg",
    text: "text-positive",
    icon: <path d="M6 10.5l2.5 2.5L14 7" />,
  },
  warning: {
    border: "border-warning/25",
    bg: "bg-warning-bg",
    text: "text-warning",
    icon: <path d="M10 7v4M10 14h.01M8.6 3.4 2 15a1 1 0 0 0 .9 1.5h14.2a1 1 0 0 0 .9-1.5L11.4 3.4a1 1 0 0 0-1.8 0Z" />,
  },
  danger: {
    border: "border-negative/25",
    bg: "bg-negative-bg",
    text: "text-negative",
    icon: <path d="M6 6l8 8M14 6l-8 8" />,
  },
};

export default function Alert({
  tone = "info",
  title,
  onDismiss,
  className,
  children,
  ...rest
}: AlertProps) {
  const t = tones[tone];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-md border px-4 py-3",
        t.border,
        t.bg,
        className,
      )}
      {...rest}
    >
      <svg
        className={cn("mt-0.5 h-4 w-4 shrink-0", t.text)}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {t.icon}
      </svg>
      <div className="flex-1 text-sm text-body">
        {title && <p className={cn("mb-0.5 font-medium", t.text)}>{title}</p>}
        {children}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar aviso"
          className="h-5 w-5 shrink-0 rounded text-muted hover:text-body transition-colors duration-150 cursor-pointer"
        >
          ×
        </button>
      )}
    </div>
  );
}
