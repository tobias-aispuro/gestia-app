interface MonthHeaderProps {
  monthName: string;
  year: number;
  totalFormatted: string;
  expenseCount: number;
}

export default function MonthHeader({
  monthName,
  year,
  totalFormatted,
  expenseCount,
}: MonthHeaderProps) {
  return (
    <header style={{ marginBottom: "var(--space-10)" }}>
      {/* Label */}
      <p className="text-label" style={{ marginBottom: "var(--space-2)" }}>
        Resumen mensual
      </p>

      {/* Month + Year */}
      <h1
        className="heading-display"
        style={{
          fontSize: "2.75rem",
          marginBottom: "var(--space-3)",
        }}
      >
        {monthName}{" "}
        <span style={{ color: "var(--text-faint)" }}>{year}</span>
      </h1>

      {/* Total */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-4)" }}>
        <span
          className="heading-display-xl"
          style={{
            fontSize: "3rem",
          }}
        >
          {totalFormatted}
        </span>
        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          en {expenseCount} {expenseCount === 1 ? "gasto" : "gastos"}
        </span>
      </div>
    </header>
  );
}
