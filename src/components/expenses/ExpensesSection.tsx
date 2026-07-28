"use client";

import { useState } from "react";
import ExpenseList from "./ExpenseList";
import type { ExpenseRow } from "./ExpenseList";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

interface ExpensesSectionProps {
  expenses: ExpenseRow[];
  previewCount?: number;
}

function matches(expense: ExpenseRow, query: string): boolean {
  const q = query.toLowerCase();
  return (
    expense.description.toLowerCase().includes(q) ||
    Boolean(expense.merchant?.toLowerCase().includes(q))
  );
}

export default function ExpensesSection({ expenses, previewCount = 6 }: ExpensesSectionProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;
  const filtered = isSearching ? expenses.filter((e) => matches(e, trimmedQuery)) : expenses;

  const visible = isSearching ? filtered : filtered.slice(0, previewCount);
  const hasMore = !isSearching && expenses.length > previewCount;

  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="heading-display text-xl">Últimos gastos</h2>
        {hasMore && (
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            Ver todos →
          </Button>
        )}
      </div>

      <div className="relative mb-4">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m17 17-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar un gasto por descripción o comercio..."
          aria-label="Buscar un gasto"
          className="w-full rounded-full border border-border-subtle bg-surface py-2.5 pl-10 pr-4 text-sm text-heading placeholder:text-faint outline-none transition-colors duration-150 ease-out hover:border-border-default focus-visible:border-accent"
        />
      </div>

      <ExpenseList
        expenses={visible}
        emptyMessage={isSearching ? `Sin resultados para "${trimmedQuery}".` : undefined}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Todos los gastos" size="lg">
        <ExpenseList expenses={expenses} />
      </Modal>
    </section>
  );
}
