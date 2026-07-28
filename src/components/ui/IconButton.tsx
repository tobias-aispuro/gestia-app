import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  active?: boolean;
  size?: "sm" | "md";
}

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
};

export default function IconButton({
  active = false,
  size = "md",
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full cursor-pointer",
        "transition-colors duration-200 ease-out",
        "disabled:pointer-events-none disabled:opacity-45",
        active
          ? "bg-surface text-heading"
          : "text-muted hover:text-body hover:bg-surface active:bg-raised",
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
