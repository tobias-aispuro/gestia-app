import { formatAmount } from "@/lib/utils";
import type { Currency } from "@/types";

interface CategorySlice {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  color: string | null;
  total: number;
  expenseCount: number;
}

interface CategoryBreakdownProps {
  categories: CategorySlice[];
  currency: Currency;
  grandTotal: number;
}

/**
 * SVG donut chart + legend.
 * Pure SVG, no chart library — stroke-dasharray/dashoffset technique.
 */
export default function CategoryBreakdown({
  categories,
  currency,
  grandTotal,
}: CategoryBreakdownProps) {
  const SIZE = 200;
  const STROKE = 22;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Build slices with offsets — each slice carries the running end position,
  // so the next one can read it back without a render-scoped mutable counter.
  const gapBetween = 3;
  const slices = categories.reduce<
    Array<CategorySlice & { fraction: number; dashArray: string; dashOffset: number; cumulativeEnd: number }>
  >((acc, cat) => {
    const previousEnd = acc.length > 0 ? acc[acc.length - 1].cumulativeEnd : 0;
    const fraction = grandTotal > 0 ? cat.total / grandTotal : 0;
    const dashLength = fraction * CIRCUMFERENCE;

    acc.push({
      ...cat,
      fraction,
      dashArray: `${Math.max(0, dashLength - gapBetween)} ${CIRCUMFERENCE}`,
      dashOffset: -previousEnd,
      cumulativeEnd: previousEnd + dashLength,
    });
    return acc;
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Donut chart */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={STROKE}
          />

          {/* Category slices */}
          {slices.map((slice) => (
            <circle
              key={slice.categoryId}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={slice.color ?? "var(--text-muted)"}
              strokeWidth={STROKE}
              strokeDasharray={slice.dashArray}
              strokeDashoffset={slice.dashOffset}
              strokeLinecap="butt"
              className="transition-[stroke-dasharray,stroke-dashoffset] duration-500 ease-out"
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[0.625rem] font-medium uppercase tracking-widest text-faint">
            Total
          </span>
          <span className="text-[0.9375rem] font-semibold tabular-nums text-heading">
            {formatAmount(grandTotal, currency)}
          </span>
        </div>
      </div>

      {/* Legend — name gets the full row width; share % rides below as a
          secondary line so category names never get clipped. */}
      <div className="flex w-full flex-col divide-y divide-border-subtle">
        {slices.map((slice) => {
          const pct = grandTotal > 0 ? ((slice.total / grandTotal) * 100).toFixed(1) : "0.0";

          return (
            <div key={slice.categoryId} className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: slice.color ?? "var(--text-muted)" }}
                />
                <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-body">
                  {slice.icon && <span className="mr-1.5">{slice.icon}</span>}
                  {slice.categoryName}
                </span>
                <span className="shrink-0 text-[0.8125rem] font-medium tabular-nums text-heading">
                  {formatAmount(slice.total, currency)}
                </span>
              </div>
              <span className="pl-[18px] text-xs tabular-nums text-muted">{pct}% del total</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
