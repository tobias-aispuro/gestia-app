import { Suspense } from "react";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import EditExpensesModal from "@/components/expenses/EditExpensesModal";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import SpendingBreakdownCard from "@/components/dashboard/SpendingBreakdownCard";
import EvolutionChart from "@/components/dashboard/EvolutionChart";
import Card from "@/components/ui/Card";
import { Currency } from "@/types";
import { getCurrentUserId, getCurrentUserName } from "@/lib/auth";
import * as expenseService from "@/services/expense.service";
import * as categoryService from "@/services/category.service";
import * as financeService from "@/services/finance.service";

// Prisma no es `fetch`, así que Next no detecta que la data es dinámica por sí
// solo — sin esto, la build la deja prerenderizada como estática (revalidatePath
// la actualiza igual, pero forzar dinámico evita depender solo de eso).
export const dynamic = "force-dynamic";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Buenas noches";
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export default async function HomePage() {
  const userId = await getCurrentUserId();

  // Solo lo que hace falta para pintar el header rápido: el resto (resumen del
  // mes, evolución) va en Suspense aparte para no bloquear toda la página por
  // las queries más pesadas. El nombre sale de nuestra tabla, no de la API de
  // Clerk (currentUser() es notablemente más lento que una query a Neon).
  const [categories, expenses, displayName] = await Promise.all([
    categoryService.list(userId),
    expenseService.list(userId),
    getCurrentUserName(),
  ]);

  return (
    <>
      {/* Saludo + acciones rápidas */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 sm:mb-10">
        <div>
          <p className="text-sm text-muted">{getGreeting()},</p>
          <h1 className="heading-display text-3xl sm:text-4xl">
            {displayName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <EditExpensesModal expenses={expenses} categories={categories} />
          <AddExpenseModal categories={categories} />
        </div>
      </div>

      <Suspense fallback={<FinanceSummarySkeleton />}>
        <FinanceSummarySection userId={userId} />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<CardSkeleton title="Distribución de gastos" />}>
          <SpendingBreakdownSection userId={userId} />
        </Suspense>

        <Suspense fallback={<CardSkeleton title="Tu evolución" />}>
          <EvolutionSection userId={userId} />
        </Suspense>
      </div>
    </>
  );
}

async function FinanceSummarySection({ userId }: { userId: string }) {
  const now = new Date();
  const overview = await financeService.overview(
    userId,
    now.getFullYear(),
    now.getMonth() + 1,
    Currency.ARS,
  );

  return (
    <FinanceSummary
      currency={overview.currency}
      balanceAcumulado={overview.balanceAcumulado}
      ingresos={overview.ingresos}
      gastos={overview.gastos}
    />
  );
}

async function SpendingBreakdownSection({ userId }: { userId: string }) {
  const now = new Date();
  const summary = await expenseService.monthlySummary(
    userId,
    now.getFullYear(),
    now.getMonth() + 1,
    Currency.ARS,
  );

  return (
    <SpendingBreakdownCard
      categories={summary.byCategory}
      currency={Currency.ARS}
      grandTotal={summary.total}
    />
  );
}

async function EvolutionSection({ userId }: { userId: string }) {
  const evolution = await financeService.recentMonthlyComparison(userId, Currency.ARS, 6);

  return (
    <Card>
      <h2 className="heading-display mb-6 text-lg">Tu evolución</h2>
      <EvolutionChart data={evolution} currency={Currency.ARS} />
    </Card>
  );
}

function FinanceSummarySkeleton() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 animate-pulse">
      <div className="h-[212px] rounded-lg border border-border-subtle bg-surface" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-[84px] rounded-lg border border-border-subtle bg-surface" />
        <div className="h-[84px] rounded-lg border border-border-subtle bg-surface" />
      </div>
    </div>
  );
}

function CardSkeleton({ title }: { title: string }) {
  return (
    <Card className="animate-pulse">
      <h2 className="heading-display mb-6 text-lg text-muted">{title}</h2>
      <div className="h-48 rounded-md bg-raised" />
    </Card>
  );
}
