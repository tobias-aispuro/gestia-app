import * as repo from "@/repositories/category.repository";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validators";

/** Categorías que recibe cada usuario nuevo (RF-06). */
export const DEFAULT_CATEGORIES = [
  { name: "Supermercado", icon: "🛒", color: "#16A34A" },
  { name: "Transporte", icon: "🚌", color: "#2563EB" },
  { name: "Servicios", icon: "💡", color: "#F59E0B" },
  { name: "Salud", icon: "💊", color: "#DC2626" },
  { name: "Comida y salidas", icon: "🍽️", color: "#DB2777" },
  { name: "Hogar", icon: "🏠", color: "#7C3AED" },
  { name: "Otros", icon: "📦", color: "#64748B" },
] as const;

export function list(userId: string) {
  return repo.findAllByUser(userId);
}

export async function getById(id: string, userId: string) {
  const category = await repo.findById(id, userId);

  if (!category) {
    throw new NotFoundError("La categoría no existe");
  }

  return category;
}

export function create(userId: string, input: CreateCategoryInput) {
  return repo.create(userId, input);
}

export async function update(id: string, userId: string, input: UpdateCategoryInput) {
  const category = await repo.update(id, userId, input);

  if (!category) {
    throw new NotFoundError("La categoría no existe");
  }

  return category;
}

export async function remove(id: string, userId: string) {
  // Borrar una categoría con gastos dejaría huérfanos esos registros: el FK es
  // onDelete: Restrict, así que avisamos antes de que la base tire el error.
  const expenseCount = await repo.countExpenses(id, userId);

  if (expenseCount > 0) {
    throw new ConflictError(
      `No se puede eliminar: la categoría tiene ${expenseCount} gasto(s) asociado(s)`,
    );
  }

  const deleted = await repo.remove(id, userId);

  if (!deleted) {
    throw new NotFoundError("La categoría no existe");
  }
}

/** Se llama una sola vez, al dar de alta un usuario. */
export function seedDefaults(userId: string) {
  return repo.createDefaults(userId, DEFAULT_CATEGORIES);
}
