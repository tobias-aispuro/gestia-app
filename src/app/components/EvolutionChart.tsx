"use client";

import { useState } from "react";
import { cn, formatAmount } from "@/lib/utils";
import { Currency } from "@/types";

interface MonthlyPoint {
  label: string;
  total: number;
}

interface EvolutionChartProps {
  data: MonthlyPoint[];
}

/** Barras finas, ancladas a la base, con tooltip al pasar el mouse. Una sola
 * serie: no hace falta leyenda, el título ya la identifica. */
export default function EvolutionChart({ data }: EvolutionChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex h-48 items-stretch gap-3 sm:gap-4">
      {data.map((point, i) => {
        const heightPct = Math.max((point.total / max) * 100, 4);
        const isCurrent = i === data.length - 1;

        return (
          <div
            key={point.label}
            className="relative flex h-full flex-1 flex-col justify-end gap-2"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            tabIndex={0}
            role="img"
            aria-label={`${point.label}: ${formatAmount(point.total, Currency.ARS)}`}
          >
            {hovered === i && (
              <div
                className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border-default bg-raised px-2.5 py-1.5 shadow-md"
                role="tooltip"
              >
                <span className="text-xs font-medium tabular-nums text-heading">
                  {formatAmount(point.total, Currency.ARS)}
                </span>
              </div>
            )}
            <div
              className={cn(
                "w-full rounded-t transition-[height,background-color] duration-300 ease-out",
                isCurrent ? "bg-accent" : "bg-border-default",
                hovered === i && !isCurrent && "bg-muted",
              )}
              style={{ height: `${heightPct}%` }}
              aria-hidden="true"
            />
            <span className="text-center text-[0.6875rem] text-faint">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}
