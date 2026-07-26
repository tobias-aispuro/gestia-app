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

/** Resumen mensual del dashboard (RF-05). */
export async function monthlySummary(
  userId: string,
  year: number,
  month: number,
  currency: Currency,
): Promise<MonthlySummary> {
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
}
