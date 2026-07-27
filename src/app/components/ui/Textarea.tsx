"use client";

import { cn } from "@/lib/utils";
import Field from "./Field";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export default function Textarea({
  label,
  hint,
  error,
  required,
  className,
  ...rest
}: TextareaProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(fieldProps) => (
        <textarea
          {...fieldProps}
          required={required}
          rows={4}
          className={cn(
            "w-full resize-y rounded-md border bg-surface px-3 py-2 text-sm text-heading placeholder:text-faint",
            "transition-colors duration-150 ease-out outline-none",
            "hover:border-border-default disabled:pointer-events-none disabled:opacity-45",
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
