"use client";

import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { cn, toDateInputValue } from "@/lib/utils";
import Button from "../ui/Button";
import DatePicker from "../ui/DatePicker";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import Switch from "../ui/Switch";
import { createExpenseAction } from "@/actions/expense.actions";
import { createIncomeAction } from "@/actions/income.actions";
import { createCategoryAction } from "@/actions/category.actions";

interface CategoryOption {
  id: string;
  name: string;
  icon: string | null;
}

interface AddExpenseModalProps {
  categories: CategoryOption[];
}

const MOVEMENT_TYPES = [
  { value: "gasto", label: "Gasto", emoji: "💸" },
  { value: "ingreso", label: "Ingreso", emoji: "🤑" },
  { value: "inversion", label: "Inversión", emoji: "📈" },
] as const;

const CURRENCIES = ["ARS", "USD"] as const;

const pillInput =
  "w-full rounded-full border-none bg-surface px-4 py-3 text-sm text-heading placeholder:text-faint " +
  "outline-none transition-colors duration-150 ease-out hover:bg-raised focus-visible:bg-raised";

/**
 * Acepta "1.500,50" (AR), "1,500.50" (US), "1500,50", "1,500" o "1500" sin
 * asumir de entrada cuál separador es el decimal.
 */
function parseAmountInput(raw: string): number {
  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");

  if (lastComma === -1 && lastDot === -1) {
    return Number(raw);
  }

  if (lastComma !== -1 && lastDot !== -1) {
    // Aparecen los dos: el que está más a la derecha es el decimal, el otro
    // es separador de miles (ej. "1.500,50" o "1,500.50").
    const decimalChar = lastComma > lastDot ? "," : ".";
    const thousandsChar = decimalChar === "," ? "." : ",";
    const withoutThousands = raw.split(thousandsChar).join("");
    return Number(decimalChar === "," ? withoutThousands.replace(",", ".") : withoutThousands);
  }

  // Un solo tipo de separador. Si tiene exactamente 3 dígitos después es de
  // miles ("1,500" → 1500) — nadie escribe 3 decimales de moneda. Si no,
  // es el separador decimal ("1,50" → 1.5).
  const sep = lastComma !== -1 ? "," : ".";
  const sepIndex = lastComma !== -1 ? lastComma : lastDot;
  const digitsAfter = raw.length - sepIndex - 1;

  if (digitsAfter === 3) {
    return Number(raw.split(sep).join(""));
  }

  return Number(raw.replace(sep, "."));
}

export default function AddExpenseModal({ categories }: AddExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof MOVEMENT_TYPES)[number]["value"]>("gasto");
  const [recurring, setRecurring] = useState(false);
  const [amount, setAmount] = useState("");
  const [currencyIndex, setCurrencyIndex] = useState(0);
  // Controlado, no FormData: DatePicker no es un <input> nativo. Se recalcula
  // en cada apertura del modal (ver reset) para que no quede clavado en el día
  // en que se montó la página.
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [extraCategories, setExtraCategories] = useState<CategoryOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const creatingCategoryRef = useRef(false);

  // `categories` llega del server component y es la fuente de verdad. Una
  // categoría recién creada se pinta desde `extraCategories` apenas responde la
  // acción, y se cae sola de esa lista cuando la revalidación la trae en las
  // props — así no se duplica ni se queda vieja.
  const knownIds = new Set(categories.map((c) => c.id));
  const allCategories = [
    ...categories,
    ...extraCategories.filter((c) => !knownIds.has(c.id)),
  ];

  function reset() {
    setType("gasto");
    setRecurring(false);
    setAmount("");
    setDate(toDateInputValue(new Date()));
    setCategoryId(null);
    setAddingCategory(false);
    setNewCategoryName("");
    setError(null);
    // `extraCategories` no se limpia a propósito: la categoría ya existe en la
    // base y el filtro de arriba la deduplica contra las props.
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (type === "inversion") {
      // Sin modelo en la base todavía. Antes esto cerraba el modal en silencio
      // y el movimiento se perdía sin aviso.
      setError("Las inversiones todavía no se pueden guardar.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const parsedAmount = parseAmountInput(amount);
    const note = form.get("note");
    const description = String(form.get("description"));
    const currency = CURRENCIES[currencyIndex];

    if (type === "ingreso") {
      setSubmitting(true);
      try {
        await createIncomeAction({
          amount: parsedAmount,
          currency,
          description,
          date,
          source: typeof note === "string" && note.trim() ? note.trim() : undefined,
        });
        close();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar el ingreso.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!categoryId || !allCategories.some((c) => c.id === categoryId)) {
      setError("Elegí una categoría.");
      return;
    }

    setSubmitting(true);
    try {
      await createExpenseAction({
        amount: parsedAmount,
        currency,
        description,
        date,
        categoryId,
        paymentMethod: "CASH",
      });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el gasto.");
    } finally {
      setSubmitting(false);
    }
  }

  function cancelNewCategory() {
    setAddingCategory(false);
    setNewCategoryName("");
  }

  async function commitNewCategory() {
    const name = newCategoryName.trim();

    if (!name) {
      cancelNewCategory();
      return;
    }

    // Enter y blur pueden llegar casi juntos (confirmar desenfoca el input):
    // sin este guard la categoría se crearía dos veces y la segunda rebotaría
    // contra el unique de la base.
    if (creatingCategoryRef.current) return;
    creatingCategoryRef.current = true;

    setCreatingCategory(true);
    setError(null);

    try {
      const result = await createCategoryAction({ name, icon: "🏷️" });

      if (!result.ok) {
        // El input queda abierto con el texto puesto para poder corregirlo.
        setError(result.error);
        return;
      }

      setExtraCategories((prev) => [...prev, result.category]);
      setCategoryId(result.category.id);
      cancelNewCategory();
    } catch {
      setError("No se pudo crear la categoría.");
    } finally {
      creatingCategoryRef.current = false;
      setCreatingCategory(false);
    }
  }

  function handleNewCategoryKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void commitNewCategory();
    } else if (e.key === "Escape") {
      // Modal engancha su propio listener de Escape en `document` para cerrarse.
      // stopImmediatePropagation y no stopPropagation: según dónde React monte
      // su root, los dos listeners pueden terminar en el mismo nodo, y ahí
      // stopPropagation no alcanza. Acá Escape solo cancela el input.
      e.nativeEvent.stopImmediatePropagation();
      e.preventDefault();
      cancelNewCategory();
    }
  }

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        + Nuevo movimiento
      </Button>

      <Modal open={open} onClose={close} title="Nuevo movimiento">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Tipo de movimiento */}
          <div className="grid grid-cols-3 gap-1 rounded-full bg-surface p-1" role="group" aria-label="Tipo de movimiento">
            {MOVEMENT_TYPES.map((t) => {
              const isActive = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setType(t.value)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-full px-2 py-2 text-sm font-medium",
                    "transition-colors duration-200 ease-out cursor-pointer",
                    isActive ? "bg-accent text-background" : "text-muted hover:text-body",
                  )}
                >
                  <span aria-hidden="true">{t.emoji}</span>
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Repetición */}
          <div className="flex items-center justify-between rounded-md bg-surface px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-body">
              <span aria-hidden="true">🔁</span> ¿Se repite? (fijo)
            </span>
            <Switch checked={recurring} onChange={setRecurring} label="¿Se repite? (fijo)" />
          </div>

          {/* Monto */}
          <div className="flex items-center justify-center gap-3 py-2">
            <input
              type="text"
              inputMode="decimal"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
              placeholder="0"
              aria-label="Monto"
              className="max-w-[65%] border-none bg-transparent text-center text-6xl font-semibold text-heading outline-none placeholder:text-faint"
              style={{ width: `${Math.max(amount.length, 1) + 1}ch` }}
            />
            <button
              type="button"
              onClick={() => setCurrencyIndex((i) => (i + 1) % CURRENCIES.length)}
              className="rounded-full border border-border-default px-3 py-1.5 text-base font-medium text-muted transition-colors duration-150 hover:text-body cursor-pointer"
            >
              {CURRENCIES[currencyIndex]}
            </button>
          </div>

          {/* Descripción + nota */}
          <input
            type="text"
            name="description"
            placeholder="¿En qué?"
            required
            className={pillInput}
          />
          {/* En un ingreso este campo se guarda como `source` ("de dónde vino"):
              Income no tiene categorías, así que es lo único que lo clasifica. */}
          <input
            type="text"
            name="note"
            placeholder={
              type === "ingreso" ? "¿De dónde vino? (opcional)" : "Nota (opcional)"
            }
            className={pillInput}
          />

          {/* Categorías — solo para gastos: Income no tiene categoryId. */}
          <div className={cn("flex-wrap gap-2", type === "ingreso" ? "hidden" : "flex")}>
            {allCategories.map((cat) => {
              const isActive = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium",
                    "transition-colors duration-200 ease-out cursor-pointer",
                    isActive
                      ? "border-accent text-accent"
                      : "border-border-subtle text-muted hover:border-border-default hover:text-body",
                  )}
                >
                  {cat.icon && <span aria-hidden="true">{cat.icon}</span>}
                  {cat.name}
                </button>
              );
            })}

            {addingCategory ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border-default px-3.5 py-2">
                <input
                  type="text"
                  autoFocus
                  maxLength={50}
                  disabled={creatingCategory}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={handleNewCategoryKeyDown}
                  onBlur={() => void commitNewCategory()}
                  aria-label="Nombre de la categoría nueva"
                  placeholder="Nombre de la categoría"
                  className="w-44 border-none bg-transparent text-sm text-heading placeholder:text-faint outline-none disabled:opacity-60"
                />
                {creatingCategory && <Spinner size="sm" className="text-muted" />}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setAddingCategory(true)}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-border-default px-3.5 py-2 text-sm font-medium text-muted transition-colors duration-200 ease-out hover:text-body cursor-pointer"
              >
                + Nueva
              </button>
            )}
          </div>

          {/* Fecha */}
          <DatePicker label="Fecha" value={date} onChange={setDate} />

          {error && <p className="text-sm text-negative">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            className="w-full py-3 text-base font-semibold tracking-wide uppercase"
          >
            Guardar
          </Button>
        </form>
      </Modal>
    </>
  );
}
