"use client";

import { cn } from "@/lib/utils";
import Field from "./Field";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const inputClasses =
  "h-10 w-full rounded-md border bg-surface px-3 text-sm text-heading placeholder:text-faint " +
  "transition-colors duration-150 ease-out outline-none " +
  "hover:border-border-default disabled:pointer-events-none disabled:opacity-45";

export default function Input({
  label,
  hint,
  error,
  required,
  className,
  ...rest
}: InputProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(fieldProps) => (
        <input
          {...fieldProps}
          required={required}
          className={cn(
            inputClasses,
            error
              ? "border-negative focus-visible:border-negative"
              : "border-border-subtle focus-visible:border-accent",
            className,
          )}
          {...rest}
        />
      )}
    </Field>
  );
}
