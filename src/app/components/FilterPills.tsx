"use client";

import { useState } from "react";

interface FilterPillsProps {
  currencies: string[];
  categories: { id: string; name: string; color: string | null }[];
  onCurrencyChange?: (currency: string) => void;
  onCategoryChange?: (categoryId: string | null) => void;
}

export default function FilterPills({
  currencies,
  categories,
  onCurrencyChange,
  onCategoryChange,
}: FilterPillsProps) {
  const [activeCurrency, setActiveCurrency] = useState(currencies[0] ?? "ARS");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const pillBase: React.CSSProperties = {
    padding: "6px 14px",
    borderRadius: "100px",
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.03em",
    border: "1px solid var(--border-subtle)",
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  };

  const pillActive: React.CSSProperties = {
    ...pillBase,
    background: "var(--bg-raised)",
    color: "var(--text-heading)",
    borderColor: "var(--border-default)",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        flexWrap: "wrap",
        marginBottom: "var(--space-8)",
      }}
    >
      {/* Currency pills */}
      {currencies.map((c) => (
        <button
          key={c}
          style={activeCurrency === c ? pillActive : pillBase}
          onClick={() => {
            setActiveCurrency(c);
            onCurrencyChange?.(c);
          }}
          onMouseEnter={(e) => {
            if (activeCurrency !== c) {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.color = "var(--text-body)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeCurrency !== c) {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-muted)";
            }
          }}
        >
          {c}
        </button>
      ))}

      {/* Divider */}
      <span
        style={{
          width: 1,
          height: 16,
          background: "var(--border-subtle)",
          margin: "0 var(--space-1)",
        }}
      />

      {/* "All" pill */}
      <button
        style={activeCategory === null ? pillActive : pillBase}
        onClick={() => {
          setActiveCategory(null);
          onCategoryChange?.(null);
        }}
        onMouseEnter={(e) => {
          if (activeCategory !== null) {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.color = "var(--text-body)";
          }
        }}
        onMouseLeave={(e) => {
          if (activeCategory !== null) {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.color = "var(--text-muted)";
          }
        }}
      >
        Todas
      </button>

      {/* Category pills */}
      {categories.map((cat) => (
        <button
          key={cat.id}
          style={{
            ...(activeCategory === cat.id ? pillActive : pillBase),
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onClick={() => {
            setActiveCategory(cat.id);
            onCategoryChange?.(cat.id);
          }}
          onMouseEnter={(e) => {
            if (activeCategory !== cat.id) {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.color = "var(--text-body)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeCategory !== cat.id) {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-muted)";
            }
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: cat.color ?? "var(--text-muted)",
              flexShrink: 0,
            }}
          />
          {cat.name}
        </button>
      ))}
    </div>
  );
}
