import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Currency } from "@/generated/prisma/enums";
import type { ListExpensesFilters } from "@/lib/validators";
import { monthRange } from "@/lib/utils";

// Igual que category.repository: userId siempre presente en el where.

const withCategory = {
  category: {
    select: { id: true, name: true, icon: true, color: true },
  },
} satisfies Prisma.ExpenseInclude;

export type ExpenseWithCategory = Prisma.ExpenseGetPayload<{
  include: typeof withCategory;
}>;

function buildWhere(userId: string, filters: ListExpensesFilters): Prisma.ExpenseWhereInput {
  const where: Prisma.ExpenseWhereInput = { userId };

  if (filters.year && filters.month) {
    where.date = monthRange(filters.year, filters.month);
  }

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.currency) where.currency = filters.currency;

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.amount = {
      ...(filters.minAmount !== undefined && { gte: filters.minAmount }),
      ...(filters.maxAmount !== undefined && { lte: filters.maxAmount }),
    };
  }

  return where;
}

export function findAllByUser(userId: string, filters: ListExpensesFilters = {}) {
  return prisma.expense.findMany({
    where: buildWhere(userId, filters),
    include: withCategory,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export function findById(id: string, userId: string) {
  return prisma.expense.findFirst({
    where: { id, userId },
    include: withCategory,
  });
}

export function create(userId: string, data: Omit<Prisma.ExpenseUncheckedCreateInput, "userId">) {
  return prisma.expense.create({
    data: { ...data, userId },
    include: withCategory,
  });
}

export async function update(
  id: string,
  userId: string,
  data: Prisma.ExpenseUncheckedUpdateInput,
): Promise<ExpenseWithCategory | null> {
  const { count } = await prisma.expense.updateMany({
    where: { id, userId },
    data,
  });

  return count === 0 ? null : findById(id, userId);
}

export async function remove(id: string, userId: string): Promise<boolean> {
  const { count } = await prisma.expense.deleteMany({
    where: { id, userId },
  });

  return count > 0;
}

/** Totales agrupados por categoría para un mes y una moneda. */
export function sumByCategory(userId: string, year: number, month: number, currency: Currency) {
  return prisma.expense.groupBy({
    by: ["categoryId"],
    where: { userId, currency, date: monthRange(year, month) },
    _sum: { amount: true },
    _count: { _all: true },
  });
}

/** Total histórico de gastos — la mitad negativa del balance acumulado. */
export async function sumAllTime(userId: string, currency: Currency) {
  const { _sum } = await prisma.expense.aggregate({
    where: { userId, currency },
    _sum: { amount: true },
  });

  return _sum.amount;
}

/** Montos y fechas en un rango — para agrupar por mes en JS sin una query por mes. */
export function findAmountsInRange(userId: string, currency: Currency, gte: Date, lt: Date) {
  return prisma.expense.findMany({
    where: { userId, currency, date: { gte, lt } },
    select: { amount: true, date: true },
  });
}
