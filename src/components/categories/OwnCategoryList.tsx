"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Spinner from "../ui/Spinner";
import { deleteCategoryAction } from "@/actions/category.actions";

interface OwnCategory {
  id: string;
  name: string;
  icon: string | null;
}

interface OwnCategoryListProps {
  categories: OwnCategory[];
}

// Mismas medidas que el <Badge> del grupo "Predefinidas" de al lado, para que
// los dos bloques se lean como la misma cosa. No se reusa Badge porque este
// necesita hijos interactivos adentro.
const pill =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 " +
  "text-sm font-medium leading-none whitespace-nowrap transition-colors duration-200 ease-out";

export default function OwnCategoryList({ categories }: OwnCategoryListProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(category: OwnCategory) {
    setDeletingId(category.id);
    setError(null);

    try {
      const result = await deleteCategoryAction(category.id);

      if (!result.ok) {
        // Los rechazos esperados (categoría con gastos asociados) vienen acá.
        setError(result.error);
        return;
      }

      // No hace falta tocar estado local: la acción revalida /perfil y el
      // server component vuelve a renderizar sin la categoría.
    } catch {
      setError("No se pudo eliminar la categoría.");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const confirming = confirmingId === category.id;
          const deleting = deletingId === category.id;

          return (
            <span
              key={category.id}
              className={cn(
                pill,
                confirming
                  ? "border-transparent bg-negative-bg text-negative"
                  : "border-border-default bg-raised text-body",
              )}
            >
              {category.icon && <span aria-hidden="true">{category.icon}</span>}
              {category.name}

              {deleting ? (
                <Spinner size="sm" className="text-muted" />
              ) : confirming ? (
                <>
                  <span className="text-xs text-muted">¿Eliminar?</span>
                  <button
                    type="button"
                    onClick={() => void handleDelete(category)}
                    className="rounded-full px-1.5 text-xs font-semibold text-negative underline underline-offset-2 hover:opacity-80 cursor-pointer"
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    className="rounded-full px-1.5 text-xs font-medium text-muted underline underline-offset-2 hover:text-body cursor-pointer"
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  aria-label={`Eliminar la categoría ${category.name}`}
                  onClick={() => {
                    setError(null);
                    setConfirmingId(category.id);
                  }}
                  className={cn(
                    "-mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-base leading-none",
                    "text-faint transition-colors duration-150 hover:bg-negative-bg hover:text-negative cursor-pointer",
                  )}
                >
                  ×
                </button>
              )}
            </span>
          );
        })}
      </div>

      {error && (
        <p role="status" className="mt-3 text-sm text-negative">
          {error}
        </p>
      )}
    </div>
  );
}
