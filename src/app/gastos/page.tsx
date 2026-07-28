import FilterPills from "@/components/expenses/FilterPills";
import ExpensesSection from "@/components/expenses/ExpensesSection";
import { MOCK_CATEGORIES, MOCK_EXPENSES } from "@/lib/mock-data";

export default function GastosPage() {
  return (
    <>
      <FilterPills currencies={["ARS", "USD"]} categories={MOCK_CATEGORIES} />

      <ExpensesSection expenses={MOCK_EXPENSES} />
    </>
  );
}
