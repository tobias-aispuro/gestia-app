"use server";

import { revalidatePath } from "next/cache";
import * as expenseService from "@/services/expense.service";
import { createExpenseSchema, updateExpenseSchema } from "@/lib/validators";
import type { CreateExpenseInput, UpdateExpenseInput } from "@/lib/validators";
import { getCurrentUserId } from "@/lib/auth";

// Los gastos se muestran en el home (resumen) y en /gastos (listado):
// toda mutación tiene que revalidar las dos.
function revalidateExpenseViews() {
  revalidatePath("/");
  revalidatePath("/gastos");
}

export async function createExpenseAction(input: CreateExpenseInput) {
  const userId = await getCurrentUserId();
  const parsed = createExpenseSchema.parse(input);

  const expense = await expenseService.create(userId, parsed);
  revalidateExpenseViews();

  return expense;
}

export async function updateExpenseAction(id: string, input: UpdateExpenseInput) {
  const userId = await getCurrentUserId();
  const parsed = updateExpenseSchema.parse(input);

  const expense = await expenseService.update(id, userId, parsed);
  revalidateExpenseViews();

  return expense;
}

export async function deleteExpenseAction(id: string) {
  const userId = await getCurrentUserId();

  await expenseService.remove(id, userId);
  revalidateExpenseViews();
}
