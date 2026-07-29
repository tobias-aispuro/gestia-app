import * as repo from "@/repositories/income.repository";
import { NotFoundError } from "@/lib/errors";
import { parseDateOnly } from "@/lib/utils";
import type { CreateIncomeInput, UpdateIncomeInput } from "@/lib/validators";
import type { Currency, Income, IncomeView } from "@/types";

/**
 * Igual que en expense.service: el Decimal de Prisma se convierte a number una
 * sola vez, acá, para que la UI no dependa del cliente de Prisma.
 */
function toView(income: Income): IncomeView {
  return {
    id: income.id,
    amount: Number(income.amount),
    currency: income.currency,
    description: income.description,
    date: income.date,
    source: income.source,
  };
}

export async function list(userId: string): Promise<IncomeView[]> {
  const incomes = await repo.findAllByUser(userId);
  return incomes.map(toView);
}

export async function getById(id: string, userId: string): Promise<IncomeView> {
  const income = await repo.findById(id, userId);

  if (!income) {
    throw new NotFoundError("El ingreso no existe");
  }

  return toView(income);
}

export async function create(userId: string, input: CreateIncomeInput): Promise<IncomeView> {
  const income = await repo.create(userId, {
    ...input,
    date: parseDateOnly(input.date),
  });

  return toView(income);
}

export async function update(
  id: string,
  userId: string,
  input: UpdateIncomeInput,
): Promise<IncomeView> {
  const income = await repo.update(id, userId, {
    ...input,
    ...(input.date && { date: parseDateOnly(input.date) }),
  });

  if (!income) {
    throw new NotFoundError("El ingreso no existe");
  }

  return toView(income);
}

export async function remove(id: string, userId: string): Promise<void> {
  const deleted = await repo.remove(id, userId);

  if (!deleted) {
    throw new NotFoundError("El ingreso no existe");
  }
}

/** Total de ingresos del mes, para el bloque de balance del dashboard. */
export async function monthlyTotal(
  userId: string,
  year: number,
  month: number,
  currency: Currency,
): Promise<number> {
  return Number((await repo.sumInMonth(userId, year, month, currency)) ?? 0);
}

export async function allTimeTotal(userId: string, currency: Currency): Promise<number> {
  return Number((await repo.sumAllTime(userId, currency)) ?? 0);
}
