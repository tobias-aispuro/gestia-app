"use client";

import { cn } from "@/lib/utils";
import Field from "./Field";
import { inputClasses } from "./Input";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export default function Select({
  label,
  hint,
  error,
  required,
  className,
  children,
  ...rest
}: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(fieldProps) => (
        <div className="relative">
          <select
            {...fieldProps}
            required={required}
            className={cn(
              inputClasses,
              "appearance-none pr-8",
              error
                ? "border-negative focus-visible:border-negative"
                : "border-border-subtle focus-visible:border-accent",
              className,
            )}
            {...rest}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 7.5 10 12.5 15 7.5" />
          </svg>
        </div>
      )}
    </Field>
  );
}
