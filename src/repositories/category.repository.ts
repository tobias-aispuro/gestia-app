import { prisma } from "@/lib/prisma";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validators";

// Esta capa solo habla con Prisma. Toda query lleva userId en el where para que
// sea imposible leer o tocar datos de otra persona (RNF-04).

export function findAllByUser(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export function findById(id: string, userId: string) {
  return prisma.category.findFirst({
    where: { id, userId },
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
