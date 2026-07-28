import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import * as categoryService from "@/services/category.service";
import type { User } from "@/types";

/**
 * Usuario autenticado actual (fila completa). Primer login de un clerkId
 * nuevo: crea el User y le siembra las categorías default (RF-06) — no hay
 * flujo de "alta" aparte. cache(): getCurrentUserId/getCurrentUserName
 * comparten esta misma consulta en vez de pegarle a la base cada uno.
 */
const getCurrentDbUser = cache(async (): Promise<User> => {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("No hay sesión activa");
  }

  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) {
    return existing;
  }

  // Solo acá hace falta pedirle el perfil a Clerk — un usuario ya existente
  // saca su nombre/email de nuestra propia tabla, no de la API de Clerk (que
  // es notablemente más lenta que una query a Neon).
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? `${clerkId}@gastia.local`;

  const user = await prisma.user.create({
    data: {
      clerkId,
      email,
      name: clerkUser?.firstName ?? undefined,
    },
  });

  await categoryService.seedDefaults(user.id);

  return user;
});

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentDbUser();
  return user.id;
}

export async function getCurrentUserName(): Promise<string> {
  const user = await getCurrentDbUser();
  return user.name ?? "";
}
