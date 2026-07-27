"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterPillsProps {
  currencies: string[];
  categories: { id: string; name: string; color: string | null }[];
  onCurrencyChange?: (currency: string) => void;
  onCategoryChange?: (categoryId: string | null) => void;
}

const pillBase =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 " +
  "text-xs font-medium tracking-wide cursor-pointer transition-colors duration-200 ease-out";

const pillInactive =
  "border-border-subtle bg-transparent text-muted hover:border-border-default hover:text-body";

const pillActive = "border-border-default bg-raised text-heading";

export default function FilterPills({
  currencies,
  categories,
  onCurrencyChange,
  onCategoryChange,
}: FilterPillsProps) {
  const [activeCurrency, setActiveCurrency] = useState(currencies[0] ?? "ARS");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 sm:mb-8" role="group" aria-label="Filtros">
      {currencies.map((c) => {
        const isActive = activeCurrency === c;
        return (
          <button
            key={c}
            type="button"
            aria-pressed={isActive}
            className={cn(pillBase, isActive ? pillActive : pillInactive)}
            onClick={() => {
              setActiveCurrency(c);
              onCurrencyChange?.(c);
            }}
          >
            {c}
          </button>
        );
      })}

      <span className="mx-1 h-4 w-px bg-border-subtle" aria-hidden="true" />

      <button
        type="button"
        aria-pressed={activeCategory === null}
        className={cn(pillBase, activeCategory === null ? pillActive : pillInactive)}
        onClick={() => {
          setActiveCategory(null);
          onCategoryChange?.(null);
        }}
      >
        Todas
      </button>

      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            aria-pressed={isActive}
            className={cn(pillBase, isActive ? pillActive : pillInactive)}
            onClick={() => {
              setActiveCategory(cat.id);
              onCategoryChange?.(cat.id);
            }}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: cat.color ?? "var(--text-muted)" }}
              aria-hidden="true"
            />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
