"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Badge from "../ui/Badge";
import { formatDate } from "@/lib/utils";
import Amount from "../ui/Amount";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/payment-methods";
import type { PaymentMethod } from "@/generated/prisma/enums";
import type { ExpenseRow } from "./ExpenseList";
import { updateExpenseAction, deleteExpenseAction } from "@/actions/expense.actions";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editing = expenses.find((exp) => exp.id === editingId) ?? null;

  function close() {
    setOpen(false);
    setEditingId(null);
    setError(null);
  }

  function startEditing(id: string) {
    setEditingId(id);
    setError(null);
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;

    const form = new FormData(e.currentTarget);
    const categoryId = String(form.get("categoryId"));
    const category = categories.find((c) => c.id === categoryId);

    setSubmitting(true);
    setError(null);
    try {
      const paymentMethod = form.get("paymentMethod") as PaymentMethod;

      await updateExpenseAction(editing.id, {
        description: String(form.get("description")),
        amount: Number(form.get("amount")),
        categoryId,
        merchant: String(form.get("merchant") || ""),
        paymentMethod,
      });

      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === editing.id
            ? {
                ...exp,
                description: String(form.get("description")),
                amount: Number(form.get("amount")),
                merchant: String(form.get("merchant") || "") || null,
                paymentMethod,
                category: category ? { name: category.name, color: category.color } : exp.category,
              }
            : exp,
        ),
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el cambio.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!window.confirm(`¿Eliminar "${editing.description}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await deleteExpenseAction(editing.id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== editing.id));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el gasto.");
    } finally {
      setSubmitting(false);
    }
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

            <div className="grid grid-cols-2 gap-3">
              <Input name="merchant" label="Comercio" defaultValue={editing.merchant ?? ""} />
              <Select
                name="paymentMethod"
                label="Medio de pago"
                defaultValue={editing.paymentMethod}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </Select>
            </div>

            {error && <p className="text-sm text-negative">{error}</p>}

            <div className="mt-2 flex items-center justify-between gap-2">
              <Button type="button" variant="danger" onClick={handleDelete} disabled={submitting}>
                Eliminar
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditingId(null)} disabled={submitting}>
                  Volver
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  Guardar cambios
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col divide-y divide-border-subtle">
            {expenses.length === 0 && (
              <p className="py-8 text-center text-sm text-faint">No hay gastos todavía.</p>
            )}
            {expenses.map((exp) => (
              <button
                key={exp.id}
                type="button"
                onClick={() => startEditing(exp.id)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-left transition-colors duration-150 hover:bg-surface"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-heading">{exp.description}</p>
                  <p className="mt-0.5 text-xs text-muted">{formatDate(exp.date)}</p>
                </div>
                <Badge dotColor={exp.category.color}>{exp.category.name}</Badge>
                <span className="shrink-0 text-sm font-medium tabular-nums text-heading">
                  <Amount value={exp.amount} currency={exp.currency} />
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
