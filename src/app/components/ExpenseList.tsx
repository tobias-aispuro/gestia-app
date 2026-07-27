"use client";

import { formatAmount, formatDate } from "@/lib/utils";
import type { Currency } from "@/types";

export interface ExpenseRow {
  id: string;
  date: Date;
  description: string;
  amount: number;
  currency: Currency;
  merchant: string | null;
  category: {
    name: string;
    color: string | null;
  };
}

interface ExpenseListProps {
  expenses: ExpenseRow[];
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div
        style={{
          padding: "var(--space-12) 0",
          textAlign: "center",
          color: "var(--text-faint)",
          fontSize: "0.875rem",
        }}
      >
        No hay gastos en este período.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Column header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr auto auto",
          gap: "var(--space-4)",
          alignItems: "center",
          padding: "0 0 var(--space-3) 0",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <span className="text-label">Fecha</span>
        <span className="text-label">Descripción</span>
        <span className="text-label" style={{ textAlign: "right" }}>
          Categoría
        </span>
        <span className="text-label" style={{ textAlign: "right", minWidth: 100 }}>
          Monto
        </span>
      </div>

      {/* Rows */}
      {expenses.map((expense, i) => (
        <div
          key={expense.id}
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr auto auto",
            gap: "var(--space-4)",
            alignItems: "center",
            padding: "var(--space-4) 0",
            borderBottom:
              i < expenses.length - 1
                ? "1px solid var(--border-subtle)"
                : "none",
            cursor: "default",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-surface)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          {/* Date */}
          <span
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-faint)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatDate(expense.date)}
          </span>

          {/* Description + merchant */}
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: "var(--text-heading)",
                fontSize: "0.875rem",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {expense.description}
            </p>
            {expense.merchant && (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                  margin: "2px 0 0 0",
                }}
              >
                {expense.merchant}
              </p>
            )}
          </div>

          {/* Category dot + name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: expense.category.color ?? "var(--text-muted)",
                flexShrink: 0,
              }}
            />
            {expense.category.name}
          </div>

          {/* Amount */}
          <span
            style={{
              textAlign: "right",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-heading)",
              fontVariantNumeric: "tabular-nums",
              minWidth: 100,
            }}
          >
            {formatAmount(expense.amount, expense.currency)}
          </span>
        </div>
      ))}
    </div>
  );
}
