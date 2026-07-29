import * as repo from "@/repositories/category.repository";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validators";

/** Categorías que recibe cada usuario nuevo */
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

/**
 * Paleta para las categorías que crea el usuario. Sin color, el punto que
 * `FilterPills` pinta al lado del nombre queda gris y desentona con las 7
 * predefinidas. Se elige por hash del nombre para que sea estable: la misma
 * categoría siempre sale del mismo color, sin guardar un contador aparte.
 */
const CATEGORY_COLORS = [
  "#0891B2",
  "#65A30D",
  "#EA580C",
  "#9333EA",
  "#0D9488",
  "#E11D48",
  "#4F46E5",
] as const;

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (Math.imul(hash, 31) + name.charCodeAt(i)) | 0;
  }

  // El hash sin mezclar reparte mal contra un módulo chico: sobre 7000 nombres
  // caían 4 de los 7 colores. Este finalizador (xor-shift + multiplicación)
  // lo deja parejo dentro del ±8%.
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x45d9f3b);
  hash ^= hash >>> 16;

  return CATEGORY_COLORS[(hash >>> 0) % CATEGORY_COLORS.length];
}

export async function create(userId: string, input: CreateCategoryInput) {
  // El schema de Zod ya recorta, pero el service no puede depender de que el
  // caller haya validado: sin esto, "  viajes  " no matchea contra "Viajes" y
  // entra como categoría nueva con espacios adentro del nombre.
  const name = input.name.trim();
  const existing = await repo.findByName(userId, name);

  if (existing) {
    throw new ConflictError(`Ya tenés una categoría llamada "${existing.name}"`);
  }

  return repo.create(userId, {
    ...input,
    name,
    color: input.color ?? colorFor(name),
  });
}

export async function update(id: string, userId: string, input: UpdateCategoryInput) {
  const category = await repo.update(id, userId, input);

  if (!category) {
    throw new NotFoundError("La categoría no existe");
  }

  return category;
}

export async function remove(id: string, userId: string) {
  const category = await repo.findById(id, userId);

  if (!category) {
    throw new NotFoundError("La categoría no existe");
  }

  // Las 7 predefinidas son el piso que se siembra al alta y no hay forma de
  // recuperarlas desde la UI si se borran (seedDefaults solo corre en el primer
  // login). La UI solo ofrece borrar las propias; esto es el backstop del server.
  if (category.isDefault) {
    throw new ConflictError(
      `"${category.name}" es una categoría predefinida y no se puede eliminar`,
    );
  }

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
