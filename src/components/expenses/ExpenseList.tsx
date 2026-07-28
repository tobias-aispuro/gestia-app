import { formatAmount, formatDate } from "@/lib/utils";
import Badge from "../ui/Badge";
import type { Currency } from "@/types";

export interface ExpenseRow {
  id: string;
  date: Date;
  description: string;
  amount: number;
  currency: Currency;
  merchant: string | null;
  category: {
    name: string;
    color: string | null;
  };
}

interface ExpenseListProps {
  expenses: ExpenseRow[];
  emptyMessage?: string;
}

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
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th scope="col" className="text-label px-0 py-3 text-left font-medium">
                Fecha
              </th>
              <th scope="col" className="text-label px-4 py-3 text-left font-medium">
                Descripción
              </th>
              <th scope="col" className="text-label px-4 py-3 text-left font-medium">
                Categoría
              </th>
              <th scope="col" className="text-label px-0 py-3 text-right font-medium">
                Monto
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-border-subtle last:border-0 transition-colors duration-150 hover:bg-surface"
              >
                <td className="whitespace-nowrap py-4 pr-4 text-[0.8125rem] tabular-nums text-faint">
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
                <td className="py-4 pl-4 text-right text-[0.875rem] font-medium tabular-nums text-heading">
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
              <div className="mt-2 flex items-center gap-2">
                <Badge dotColor={expense.category.color}>{expense.category.name}</Badge>
                <span className="text-xs tabular-nums text-faint">
                  {formatDate(expense.date)}
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
