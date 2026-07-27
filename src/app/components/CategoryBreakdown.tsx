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
  const SIZE = 180;
  const STROKE = 20;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Build slices with offsets
  let cumulativeOffset = 0;
  const slices = categories.map((cat) => {
    const fraction = grandTotal > 0 ? cat.total / grandTotal : 0;
    const dashLength = fraction * CIRCUMFERENCE;
    const gapBetween = 3; // small gap between slices
    const slice = {
      ...cat,
      fraction,
      dashArray: `${Math.max(0, dashLength - gapBetween)} ${CIRCUMFERENCE}`,
      dashOffset: -cumulativeOffset,
    };
    cumulativeOffset += dashLength;
    return slice;
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-8)",
      }}
    >
      {/* Donut chart */}
      <div style={{ position: "relative", width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: "rotate(-90deg)" }}
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
              style={{
                transition: "stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease",
              }}
            />
          ))}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.625rem",
              color: "var(--text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 500,
            }}
          >
            Total
          </span>
          <span
            style={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--text-heading)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatAmount(grandTotal, currency)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          width: "100%",
        }}
      >
        {slices.map((slice) => {
          const pct = grandTotal > 0 ? ((slice.total / grandTotal) * 100).toFixed(1) : "0.0";

          return (
            <div
              key={slice.categoryId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-2) 0",
              }}
            >
              {/* Color dot */}
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: slice.color ?? "var(--text-muted)",
                  flexShrink: 0,
                }}
              />

              {/* Name */}
              <span
                style={{
                  flex: 1,
                  fontSize: "0.8125rem",
                  color: "var(--text-body)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {slice.icon && (
                  <span style={{ marginRight: "6px" }}>{slice.icon}</span>
                )}
                {slice.categoryName}
              </span>

              {/* Percentage */}
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 40,
                  textAlign: "right",
                }}
              >
                {pct}%
              </span>

              {/* Amount */}
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--text-heading)",
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 90,
                  textAlign: "right",
                }}
              >
                {formatAmount(slice.total, currency)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
