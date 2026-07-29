"use server";

import { revalidatePath } from "next/cache";
import * as categoryService from "@/services/category.service";
import { createCategorySchema } from "@/lib/validators";
import type { CreateCategoryInput } from "@/lib/validators";
import { getCurrentUserId } from "@/lib/auth";
import { AppError } from "@/lib/errors";

// Las categorías se muestran en tres lados: el modal de alta (home), los
// filtros de /gastos y el recuento de /perfil. Una categoría nueva tiene que
// aparecer en los tres.
function revalidateCategoryViews() {
  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/perfil");
}

export interface CreatedCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export type CreateCategoryResult =
  | { ok: true; category: CreatedCategory }
  | { ok: false; error: string };

/**
 * Devuelve un resultado en vez de lanzar: Next enmascara el mensaje de los
 * errores que escapan de una Server Action en producción ("An error occurred in
 * the Server Components render"), y acá el texto ("ya tenés una categoría
 * llamada X") *es* lo que tiene que leer el usuario.
 *
 * El userId sale de la sesión, nunca del input: la categoría queda colgada del
 * usuario que disparó la acción y ninguna otra cuenta la ve.
 */
export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<CreateCategoryResult> {
  const userId = await getCurrentUserId();

  const parsed = createCategorySchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const category = await categoryService.create(userId, parsed.data);
    revalidateCategoryViews();

    return {
      ok: true,
      category: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
      },
    };
  } catch (err) {
    // Los errores de dominio (nombre repetido) son parte de la UX; el resto
    // sube y lo maneja Next como error de verdad.
    if (err instanceof AppError) {
      return { ok: false, error: err.message };
    }

    throw err;
  }
}

export type DeleteCategoryResult = { ok: true } | { ok: false; error: string };

/**
 * Mismo contrato de resultado que el alta, y por el mismo motivo: los dos
 * rechazos posibles ("es predefinida", "tiene N gasto(s) asociado(s)") son
 * información que el usuario necesita leer, y un throw se enmascara en prod.
 *
 * El service se encarga de que no se pueda borrar una predefinida ni una con
 * gastos; el `userId` de la sesión hace el resto: el id de otra cuenta no
 * matchea y sale como "no existe".
 */
export async function deleteCategoryAction(id: string): Promise<DeleteCategoryResult> {
  const userId = await getCurrentUserId();

  try {
    await categoryService.remove(id, userId);
    revalidateCategoryViews();

    return { ok: true };
  } catch (err) {
    if (err instanceof AppError) {
      return { ok: false, error: err.message };
    }

    throw err;
  }
}
