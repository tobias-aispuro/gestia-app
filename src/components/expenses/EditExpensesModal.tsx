"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Badge from "../ui/Badge";
import { formatAmount, formatDate } from "@/lib/utils";
import type { ExpenseRow } from "./ExpenseList";

interface CategoryOption {
  id: string;
  name: string;
  color: string | null;
}

interface EditExpensesModalProps {
  expenses: ExpenseRow[];
  categories: CategoryOption[];
}

export default function EditExpensesModal({
  expenses: initialExpenses,
  categories,
}: EditExpensesModalProps) {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = expenses.find((exp) => exp.id === editingId) ?? null;

  function close() {
    setOpen(false);
    setEditingId(null);
  }

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;

    const form = new FormData(e.currentTarget);
    const category = categories.find((c) => c.id === String(form.get("categoryId")));

    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === editing.id
          ? {
              ...exp,
              description: String(form.get("description")),
              amount: Number(form.get("amount")),
              merchant: String(form.get("merchant") || "") || null,
              category: category ? { name: category.name, color: category.color } : exp.category,
            }
          : exp,
      ),
    );
    setEditingId(null);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Editar gastos
      </Button>

      <Modal open={open} onClose={close} title={editing ? "Editar gasto" : "Editar gastos"} size="lg">
        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input name="description" label="Descripción" defaultValue={editing.description} required />

            <div className="grid grid-cols-2 gap-3">
              <Input
                name="amount"
                label="Monto"
                type="number"
                step="0.01"
                min="0"
                defaultValue={editing.amount}
                required
              />
              <Select
                name="categoryId"
                label="Categoría"
                defaultValue={categories.find((c) => c.name === editing.category.name)?.id}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <Input name="merchant" label="Comercio" defaultValue={editing.merchant ?? ""} />

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                Volver
              </Button>
              <Button type="submit" variant="primary">
                Guardar cambios
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col divide-y divide-border-subtle">
            {expenses.map((exp) => (
              <button
                key={exp.id}
                type="button"
                onClick={() => setEditingId(exp.id)}
                className="flex w-full items-center gap-3 py-3 text-left transition-colors duration-150 hover:bg-surface"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-heading">{exp.description}</p>
                  <p className="mt-0.5 text-xs text-muted">{formatDate(exp.date)}</p>
                </div>
                <Badge dotColor={exp.category.color}>{exp.category.name}</Badge>
                <span className="shrink-0 text-sm font-medium tabular-nums text-heading">
                  {formatAmount(exp.amount, exp.currency)}
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
