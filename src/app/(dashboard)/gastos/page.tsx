import FilterPills from "@/components/expenses/FilterPills";
import ExpensesSection from "@/components/expenses/ExpensesSection";
import ExportExpensesModal from "@/components/expenses/ExportExpensesModal";
import { getCurrentUserId } from "@/lib/auth";
import * as expenseService from "@/services/expense.service";
import * as categoryService from "@/services/category.service";
import { Currency } from "@/types";

// Ver la nota en src/app/page.tsx: fuerza render dinámico para no depender
// solo de revalidatePath.
export const dynamic = "force-dynamic";

const CURRENCIES = ["ARS", "USD"];

interface GastosPageProps {
  searchParams: Promise<{ currency?: string; categoryId?: string }>;
}

export default async function GastosPage({ searchParams }: GastosPageProps) {
  const userId = await getCurrentUserId();
  const params = await searchParams;

  // FilterPills siempre muestra una moneda activa (nunca "todas") — el
  // default acá tiene que ser el mismo que el default visual del componente.
  const currency = (
    CURRENCIES.includes(params.currency ?? "") ? params.currency : CURRENCIES[0]
  ) as Currency;
  const categoryId = params.categoryId || undefined;

  // El total sin filtrar es solo para el botón de exportar ("Todo (147)"); va
  // en el mismo Promise.all para no sumarle un viaje a Neon a la página.
  const [expenses, categories, totalCount] = await Promise.all([
    expenseService.list(userId, { currency, categoryId }),
    categoryService.list(userId),
    expenseService.count(userId),
  ]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
        <FilterPills currencies={CURRENCIES} categories={categories} />

        <ExportExpensesModal
          filteredCount={expenses.length}
          totalCount={totalCount}
          currency={currency}
          categoryId={categoryId}
        />
      </div>

      <ExpensesSection expenses={expenses} />
    </>
  );
}
