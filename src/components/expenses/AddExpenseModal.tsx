"use client";

import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Switch from "../ui/Switch";

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

export default function AddExpenseModal({ categories }: AddExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof MOVEMENT_TYPES)[number]["value"]>("gasto");
  const [recurring, setRecurring] = useState(false);
  const [amount, setAmount] = useState("");
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [localCategories, setLocalCategories] = useState(categories);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  function reset() {
    setType("gasto");
    setRecurring(false);
    setAmount("");
    setCategoryId(null);
    setAddingCategory(false);
    setNewCategoryName("");
  }

  function close() {
    setOpen(false);
    reset();
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    close();
  }

  function commitNewCategory() {
    const name = newCategoryName.trim();
    if (name) {
      const id = `local-${Date.now()}`;
      setLocalCategories((prev) => [...prev, { id, name, icon: "🏷️" }]);
      setCategoryId(id);
    }
    setAddingCategory(false);
    setNewCategoryName("");
  }

  function handleNewCategoryKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitNewCategory();
    } else if (e.key === "Escape") {
      setAddingCategory(false);
      setNewCategoryName("");
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
          <input
            type="text"
            name="note"
            placeholder="Nota (opcional)"
            className={pillInput}
          />

          {/* Categorías */}
          <div className="flex flex-wrap gap-2">
            {localCategories.map((cat) => {
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
              <input
                type="text"
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={handleNewCategoryKeyDown}
                onBlur={commitNewCategory}
                placeholder="Nombre de la categoría"
                className="rounded-full border border-border-default bg-transparent px-3.5 py-2 text-sm text-heading placeholder:text-faint outline-none"
              />
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
          <div>
            <label htmlFor="movement-date" className="mb-1.5 block text-sm text-muted">
              Fecha
            </label>
            <input
              id="movement-date"
              type="date"
              name="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-full border-none bg-surface px-4 py-3 text-sm text-heading outline-none transition-colors duration-150 ease-out hover:bg-raised focus-visible:bg-raised"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 text-base font-semibold tracking-wide uppercase">
            Guardar
          </Button>
        </form>
      </Modal>
    </>
  );
}
