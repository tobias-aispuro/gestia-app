"use server";

import { revalidatePath } from "next/cache";
import * as incomeService from "@/services/income.service";
import { createIncomeSchema, updateIncomeSchema } from "@/lib/validators";
import type { CreateIncomeInput, UpdateIncomeInput } from "@/lib/validators";
import { getCurrentUserId } from "@/lib/auth";

// Los ingresos solo se muestran en el balance del home. Si más adelante
// aparecen en un listado propio, sumar esa ruta acá.
function revalidateIncomeViews() {
  revalidatePath("/");
}

export async function createIncomeAction(input: CreateIncomeInput) {
  const userId = await getCurrentUserId();
  const parsed = createIncomeSchema.parse(input);

  const income = await incomeService.create(userId, parsed);
  revalidateIncomeViews();

  return income;
}

export async function updateIncomeAction(id: string, input: UpdateIncomeInput) {
  const userId = await getCurrentUserId();
  const parsed = updateIncomeSchema.parse(input);

  const income = await incomeService.update(id, userId, parsed);
  revalidateIncomeViews();

  return income;
}

export async function deleteIncomeAction(id: string) {
  const userId = await getCurrentUserId();

  await incomeService.remove(id, userId);
  revalidateIncomeViews();
}
