import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import EditExpensesModal from "@/components/expenses/EditExpensesModal";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import SpendingBreakdownCard from "@/components/dashboard/SpendingBreakdownCard";
import EvolutionChart from "@/components/dashboard/EvolutionChart";
import Card from "@/components/ui/Card";
import { Currency } from "@/types";
import {
  MOCK_CATEGORIES,
  MOCK_EXPENSES,
  MOCK_CATEGORY_TOTALS,
  GRAND_TOTAL,
  MOCK_MONTHLY_EXPENSES,
  MOCK_INGRESOS_MES,
  MOCK_BALANCE_ACUMULADO,
} from "@/lib/mock-data";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Buenas noches";
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export default function HomePage() {
  return (
    <>
      {/* Saludo + acciones rápidas */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 sm:mb-10">
        <div>
          <p className="text-sm text-muted">{getGreeting()},</p>
          <h1 className="heading-display text-3xl sm:text-4xl">
            tobias
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <EditExpensesModal expenses={MOCK_EXPENSES} categories={MOCK_CATEGORIES} />
          <AddExpenseModal categories={MOCK_CATEGORIES} />
        </div>
      </div>

      <FinanceSummary
        currency={Currency.ARS}
        balanceAcumulado={MOCK_BALANCE_ACUMULADO}
        ingresos={MOCK_INGRESOS_MES}
        gastos={GRAND_TOTAL}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpendingBreakdownCard
          categories={MOCK_CATEGORY_TOTALS}
          currency={Currency.ARS}
          grandTotal={GRAND_TOTAL}
        />

        <Card>
          <h2 className="heading-display mb-6 text-lg">Tu evolución</h2>
          <EvolutionChart data={MOCK_MONTHLY_EXPENSES} />
        </Card>
      </div>
    </>
  );
}
