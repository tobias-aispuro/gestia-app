import { formatAmount, formatDate } from "@/lib/utils";
import { PAYMENT_METHOD_SHORT_LABELS } from "@/lib/payment-methods";
import Badge from "../ui/Badge";
import type { Currency } from "@/types";
import type { PaymentMethod } from "@/generated/prisma/enums";

export interface ExpenseRow {
  id: string;
  date: Date;
  description: string;
  amount: number;
  currency: Currency;
  merchant: string | null;
  paymentMethod: PaymentMethod;
  category: {
    name: string;
    color: string | null;
  };
}

interface ExpenseListProps {
  expenses: ExpenseRow[];
  emptyMessage?: string;
}

/**
 * El resaltado va en las celdas, no en el `<tr>`: una fila no acepta
 * `border-radius`, así que redondear el `<tr>` no hace absolutamente nada. Se
 * redondean las esquinas exteriores de la primera y la última celda, y eso
 * dibuja la píldora completa.
 *
 * Requiere `border-separate` en la tabla — con `border-collapse` (lo que había)
 * el radio tampoco se aplica, que es por lo que el hover salía cuadrado.
 *
 * El radio (12px) se queda por debajo del padding vertical de las celdas
 * (py-4 = 16px), así que la curva nunca llega a la línea de texto.
 *
 * Las filas ya no llevan línea divisoria: el borde inferior de una celda con
 * las esquinas redondeadas se curva en las puntas y queda torcido. La regla
 * queda solo debajo del encabezado y el resaltado hace de separación.
 */
const rowHighlight =
  "[&>td]:transition-colors [&>td]:duration-150 hover:[&>td]:bg-surface " +
  "[&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl";

export default function ExpenseList({
  expenses,
  emptyMessage = "No hay gastos en este período.",
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-subtle py-12 text-center text-sm text-faint">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet: real table for correct a11y semantics */}
      <div className="hidden overflow-x-auto sm:block">
        {/* border-separate en vez de border-collapse: es la condición para que
            las celdas acepten border-radius. La regla del encabezado pasa a los
            <th>, que con border-collapse la heredaban del <tr>. */}
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th scope="col" className="text-label border-b border-border-subtle py-3 pl-3 pr-4 text-left font-medium">
                Fecha
              </th>
              <th scope="col" className="text-label border-b border-border-subtle px-4 py-3 text-left font-medium">
                Descripción
              </th>
              <th scope="col" className="text-label border-b border-border-subtle px-4 py-3 text-left font-medium">
                Categoría
              </th>
              <th scope="col" className="text-label border-b border-border-subtle px-4 py-3 text-left font-medium">
                Medio de pago
              </th>
              <th scope="col" className="text-label border-b border-border-subtle py-3 pl-4 pr-3 text-right font-medium">
                Monto
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className={rowHighlight}>
                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-[0.8125rem] tabular-nums text-faint">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-4">
                  <p className="truncate text-[0.875rem] text-heading">{expense.description}</p>
                  {expense.merchant && (
                    <p className="mt-0.5 text-xs text-muted">{expense.merchant}</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <Badge dotColor={expense.category.color}>{expense.category.name}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-[0.8125rem] text-muted">
                  {PAYMENT_METHOD_SHORT_LABELS[expense.paymentMethod]}
                </td>
                <td className="py-4 pl-4 pr-3 text-right text-[0.875rem] font-medium tabular-nums text-heading">
                  {formatAmount(expense.amount, expense.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="flex flex-col divide-y divide-border-subtle sm:hidden">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-start justify-between gap-3 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-heading">{expense.description}</p>
              {expense.merchant && (
                <p className="mt-0.5 text-xs text-muted">{expense.merchant}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Badge dotColor={expense.category.color}>{expense.category.name}</Badge>
                <span className="text-xs tabular-nums text-faint">
                  {formatDate(expense.date)}
                </span>
                <span className="text-xs text-faint" aria-hidden="true">
                  ·
                </span>
                <span className="text-xs text-faint">
                  {PAYMENT_METHOD_SHORT_LABELS[expense.paymentMethod]}
                </span>
              </div>
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums text-heading">
              {formatAmount(expense.amount, expense.currency)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
