import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validators";

// Esta capa solo habla con Prisma. Toda query lleva userId en el where para que
// sea imposible leer o tocar datos de otra persona (RNF-04).

// cache(): varios call sites piden las categorías del mismo usuario dentro de
// un mismo request (ej. page.tsx y monthlySummary()) — sin esto, cada uno
// dispara su propia query a Neon en vez de compartir una sola.
export const findAllByUser = cache((userId: string) => {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
});

export function findById(id: string, userId: string) {
  return prisma.category.findFirst({
    where: { id, userId },
  });
}

// El @@unique([userId, name]) del schema es el guard real; esto existe para
// poder avisar con un mensaje propio antes de que la base tire un P2002 crudo.
// `mode: "insensitive"` para que "Viajes" no conviva con "viajes".
export function findByName(userId: string, name: string) {
  return prisma.category.findFirst({
    where: { userId, name: { equals: name, mode: "insensitive" } },
  });
}

export function create(userId: string, data: CreateCategoryInput) {
  return prisma.category.create({
    data: { ...data, userId },
  });
}

export async function update(id: string, userId: string, data: UpdateCategoryInput) {
  // updateMany en vez de update: permite filtrar por userId en el where.
  const { count } = await prisma.category.updateMany({
    where: { id, userId },
    data,
  });

  return count === 0 ? null : findById(id, userId);
}

export async function remove(id: string, userId: string): Promise<boolean> {
  const { count } = await prisma.category.deleteMany({
    where: { id, userId },
  });

  return count > 0;
}

export function countExpenses(categoryId: string, userId: string) {
  return prisma.expense.count({
    where: { categoryId, userId },
  });
}

export function createDefaults(
  userId: string,
  categories: ReadonlyArray<{ name: string; icon: string; color: string }>,
) {
  return prisma.category.createMany({
    data: categories.map((c) => ({ ...c, userId, isDefault: true })),
    skipDuplicates: true,
  });
}
