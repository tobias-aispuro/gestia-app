import { formatAmount, cn } from "@/lib/utils";
import Card from "../ui/Card";
import type { Currency } from "@/types";

interface FinanceSummaryProps {
  currency: Currency;
  balanceAcumulado: number;
  ingresos: number;
  gastos: number;
}

export default function FinanceSummary({
  currency,
  balanceAcumulado,
  ingresos,
  gastos,
}: FinanceSummaryProps) {
  const balanceMes = ingresos - gastos;
  const ahorroPct = ingresos > 0 ? (balanceMes / ingresos) * 100 : 0;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8">
      {/* Balance acumulado + ingresos/gastos */}
      <Card>
        <p className="text-label mb-2">Balance acumulado</p>
        <p className="heading-display mb-6 text-4xl sm:text-5xl">
          {formatAmount(balanceAcumulado, currency)}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-raised px-4 py-3.5">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-positive" aria-hidden="true">
                <path d="M5 11l5 5 5-5M10 16V4" />
              </svg>
              Ingresos
            </p>
            <p className="text-xl font-semibold tabular-nums text-positive">
              {formatAmount(ingresos, currency)}
            </p>
          </div>

          <div className="rounded-md bg-raised px-4 py-3.5">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-negative" aria-hidden="true">
                <path d="M15 9l-5-5-5 5M10 4v12" />
              </svg>
              Gastos
            </p>
            <p className="text-xl font-semibold tabular-nums text-negative">
              {formatAmount(gastos, currency)}
            </p>
          </div>
        </div>
      </Card>

      {/* Balance del mes + ahorro */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="mb-1 text-sm text-muted">Balance del mes</p>
          <p
            className={cn(
              "text-2xl font-semibold tabular-nums",
              balanceMes >= 0 ? "text-positive" : "text-negative",
            )}
          >
            {balanceMes >= 0 ? "+" : ""}
            {formatAmount(balanceMes, currency)}
          </p>
        </Card>

        <Card>
          <p className="mb-1 flex items-center gap-1.5 text-sm text-muted">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
              <circle cx="10" cy="10" r="7" />
              <path d="M10 6v4l3 2" />
            </svg>
            Ahorro
          </p>
          <p className="text-2xl font-semibold tabular-nums text-accent">
            {ahorroPct.toFixed(0)}%
          </p>
        </Card>
      </div>
    </div>
  );
}
