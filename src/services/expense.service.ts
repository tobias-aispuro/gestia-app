import { cache } from "react";
import * as repo from "@/repositories/expense.repository";
import * as categoryRepo from "@/repositories/category.repository";
import type { ExpenseWithCategory } from "@/repositories/expense.repository";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { parseDateOnly } from "@/lib/utils";
import type {
  CreateExpenseInput,
  ListExpensesFilters,
  UpdateExpenseInput,
} from "@/lib/validators";
import type { Currency, ExpenseView, MonthlySummary } from "@/types";

/**
 * Prisma devuelve los Decimal como objeto para no perder precisión. La UI
 * necesita number, así que la conversión ocurre una sola vez, acá.
 */
function toView(expense: ExpenseWithCategory): ExpenseView {
  return {
    id: expense.id,
    amount: Number(expense.amount),
    currency: expense.currency,
    description: expense.description,
    date: expense.date,
    merchant: expense.merchant,
    paymentMethod: expense.paymentMethod,
    ticketUrl: expense.ticketUrl,
    category: expense.category,
  };
}

async function assertCategoryBelongsToUser(categoryId: string, userId: string) {
  const category = await categoryRepo.findById(categoryId, userId);

  if (!category) {
    throw new ValidationError("La categoría no existe o no te pertenece");
  }
}

export async function list(
  userId: string,
  filters: ListExpensesFilters = {},
): Promise<ExpenseView[]> {
  const expenses = await repo.findAllByUser(userId, filters);
  return expenses.map(toView);
}

export async function getById(id: string, userId: string): Promise<ExpenseView> {
  const expense = await repo.findById(id, userId);

  if (!expense) {
    throw new NotFoundError("El gasto no existe");
  }

  return toView(expense);
}

export async function create(userId: string, input: CreateExpenseInput): Promise<ExpenseView> {
  await assertCategoryBelongsToUser(input.categoryId, userId);

  const expense = await repo.create(userId, {
    ...input,
    date: parseDateOnly(input.date),
  });

  return toView(expense);
}

export async function update(
  id: string,
  userId: string,
  input: UpdateExpenseInput,
): Promise<ExpenseView> {
  if (input.categoryId) {
    await assertCategoryBelongsToUser(input.categoryId, userId);
  }

  const expense = await repo.update(id, userId, {
    ...input,
    ...(input.date && { date: parseDateOnly(input.date) }),
  });

  if (!expense) {
    throw new NotFoundError("El gasto no existe");
  }

  return toView(expense);
}

export async function remove(id: string, userId: string): Promise<void> {
  const deleted = await repo.remove(id, userId);

  if (!deleted) {
    throw new NotFoundError("El gasto no existe");
  }
}

/**
 * Resumen mensual del dashboard (RF-05).
 * cache(): lo piden dos secciones independientes de la home (Balance y
 * Distribución) — comparten esta misma promesa en vez de duplicar la query.
 */
export const monthlySummary = cache(async (
  userId: string,
  year: number,
  month: number,
  currency: Currency,
): Promise<MonthlySummary> => {
  const [grouped, categories] = await Promise.all([
    repo.sumByCategory(userId, year, month, currency),
    categoryRepo.findAllByUser(userId),
  ]);

  const categoriesById = new Map(categories.map((c) => [c.id, c]));

  const byCategory = grouped
    .map((row) => {
      const category = categoriesById.get(row.categoryId);

      return {
        categoryId: row.categoryId,
        categoryName: category?.name ?? "Sin categoría",
        icon: category?.icon ?? null,
        color: category?.color ?? null,
        total: Number(row._sum.amount ?? 0),
        expenseCount: row._count._all,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    year,
    month,
    currency,
    total: byCategory.reduce((sum, c) => sum + c.total, 0),
    expenseCount: byCategory.reduce((sum, c) => sum + c.expenseCount, 0),
    byCategory,
  };
});

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/**
 * Últimos `months` meses (incluyendo el actual), para el gráfico de evolución.
 * Una sola query de rango + agrupado en JS — llamar a monthlySummary() una vez
 * por mes eran 2 queries × N meses solo para esto.
 */
export async function recentMonthlyTotals(
  userId: string,
  currency: Currency,
  months: number,
): Promise<{ label: string; total: number }[]> {
  const now = new Date();

  const periods = Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - i), 1));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  });

  const rangeStart = new Date(Date.UTC(periods[0].year, periods[0].month - 1, 1));
  const rangeEnd = new Date(Date.UTC(periods[months - 1].year, periods[months - 1].month, 1));

  const rows = await repo.findAmountsInRange(userId, currency, rangeStart, rangeEnd);

  const totalsByKey = new Map<string, number>();
  for (const row of rows) {
    const key = `${row.date.getUTCFullYear()}-${row.date.getUTCMonth() + 1}`;
    totalsByKey.set(key, (totalsByKey.get(key) ?? 0) + Number(row.amount));
  }

  return periods.map(({ year, month }) => ({
    label: MONTH_LABELS[month - 1],
    total: totalsByKey.get(`${year}-${month}`) ?? 0,
  }));
}
