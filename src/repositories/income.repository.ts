import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Currency } from "@/generated/prisma/enums";
import { monthRange } from "@/lib/utils";

// Igual que expense.repository: userId siempre presente en el where, y las
// escrituras por id van con updateMany/deleteMany (los únicos que aceptan
// userId en el where junto al id).

export function findAllByUser(userId: string) {
  return prisma.income.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export function findById(id: string, userId: string) {
  return prisma.income.findFirst({ where: { id, userId } });
}

export function create(userId: string, data: Omit<Prisma.IncomeUncheckedCreateInput, "userId">) {
  return prisma.income.create({ data: { ...data, userId } });
}

export async function update(
  id: string,
  userId: string,
  data: Prisma.IncomeUncheckedUpdateInput,
) {
  const { count } = await prisma.income.updateMany({
    where: { id, userId },
    data,
  });

  return count === 0 ? null : findById(id, userId);
}

export async function remove(id: string, userId: string): Promise<boolean> {
  const { count } = await prisma.income.deleteMany({
    where: { id, userId },
  });

  return count > 0;
}

/** Total de ingresos de un mes, en una moneda. Devuelve el Decimal crudo. */
export async function sumInMonth(
  userId: string,
  year: number,
  month: number,
  currency: Currency,
) {
  const { _sum } = await prisma.income.aggregate({
    where: { userId, currency, date: monthRange(year, month) },
    _sum: { amount: true },
  });

  return _sum.amount;
}

/** Montos y fechas en un rango — para agrupar por mes en JS sin una query por mes. */
export function findAmountsInRange(userId: string, currency: Currency, gte: Date, lt: Date) {
  return prisma.income.findMany({
    where: { userId, currency, date: { gte, lt } },
    select: { amount: true, date: true },
  });
}

/** Total histórico de ingresos — la mitad positiva del balance acumulado. */
export async function sumAllTime(userId: string, currency: Currency) {
  const { _sum } = await prisma.income.aggregate({
    where: { userId, currency },
    _sum: { amount: true },
  });

  return _sum.amount;
}
