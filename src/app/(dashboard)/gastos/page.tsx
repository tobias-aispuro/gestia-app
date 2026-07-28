import FilterPills from "@/components/expenses/FilterPills";
import ExpensesSection from "@/components/expenses/ExpensesSection";
import { getCurrentUserId } from "@/lib/auth";
import * as expenseService from "@/services/expense.service";
import * as categoryService from "@/services/category.service";

// Ver la nota en src/app/page.tsx: fuerza render dinámico para no depender
// solo de revalidatePath.
export const dynamic = "force-dynamic";

export default async function GastosPage() {
  const userId = await getCurrentUserId();

  const [expenses, categories] = await Promise.all([
    expenseService.list(userId),
    categoryService.list(userId),
  ]);

  return (
    <>
      <FilterPills currencies={["ARS", "USD"]} categories={categories} />

      <ExpensesSection expenses={expenses} />
    </>
  );
}
