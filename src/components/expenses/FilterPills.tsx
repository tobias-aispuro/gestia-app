"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface FilterPillsProps {
  currencies: string[];
  categories: { id: string; name: string; color: string | null }[];
}

const pillBase =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 " +
  "text-xs font-medium tracking-wide cursor-pointer transition-colors duration-200 ease-out";

const pillInactive =
  "border-border-subtle bg-transparent text-muted hover:border-border-default hover:text-body";

const pillActive = "border-border-default bg-raised text-heading";

export default function FilterPills({ currencies, categories }: FilterPillsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCurrency = searchParams.get("currency") ?? currencies[0] ?? "ARS";
  const activeCategory = searchParams.get("categoryId");

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

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
            onClick={() => setParam("currency", c)}
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
        onClick={() => setParam("categoryId", null)}
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
            onClick={() => setParam("categoryId", cat.id)}
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
