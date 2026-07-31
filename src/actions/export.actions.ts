"use server";

import * as expenseService from "@/services/expense.service";
import { csvFilename, expensesToCsv } from "@/services/export.service";
import { exportExpensesSchema } from "@/lib/validators";
import type { ExportExpensesInput } from "@/lib/validators";
import { getCurrentUserId } from "@/lib/auth";

export interface ExportedCsv {
  filename: string;
  content: string;
  count: number;
}

/**
 * Server Action de solo lectura (no revalida nada): el archivo se arma en el
 * server y el navegador lo baja con un Blob. Así no hace falta un Route
 * Handler y `src/app/api` sigue sin existir.
 *
 * El userId sale de la sesión, así que un scope "all" es "todo lo mío", nunca
 * todo lo de la base.
 */
export async function exportExpensesCsvAction(
  input: ExportExpensesInput,
): Promise<ExportedCsv> {
  const userId = await getCurrentUserId();
  const parsed = exportExpensesSchema.parse(input);

  const filters =
    parsed.scope === "filtered"
      ? { currency: parsed.currency, categoryId: parsed.categoryId }
      : {};

  const expenses = await expenseService.list(userId, filters);

  return {
    filename: csvFilename(parsed.scope),
    content: expensesToCsv(expenses, parsed.format),
    count: expenses.length,
  };
}
