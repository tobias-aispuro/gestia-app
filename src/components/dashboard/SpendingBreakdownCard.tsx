import Card from "../ui/Card";
import CategoryBreakdown from "./CategoryBreakdown";
import type { Currency } from "@/types";

interface CategorySlice {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  color: string | null;
  total: number;
  expenseCount: number;
}

interface SpendingBreakdownCardProps {
  categories: CategorySlice[];
  currency: Currency;
  grandTotal: number;
}

export default function SpendingBreakdownCard({
  categories,
  currency,
  grandTotal,
}: SpendingBreakdownCardProps) {
  return (
    <Card>
      <h2 className="heading-display mb-6 text-lg">
        Distribución de gastos
      </h2>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm text-muted">
            Sin gastos este mes <span aria-hidden="true">🎉</span>
          </p>
        </div>
      ) : (
        <CategoryBreakdown categories={categories} currency={currency} grandTotal={grandTotal} />
      )}
    </Card>
  );
}
