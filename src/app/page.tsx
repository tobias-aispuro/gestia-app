import Sidebar from "./components/Sidebar";
import MonthHeader from "./components/MonthHeader";
import FilterPills from "./components/FilterPills";
import ExpenseList from "./components/ExpenseList";
import type { ExpenseRow } from "./components/ExpenseList";
import CategoryBreakdown from "./components/CategoryBreakdown";
import { Currency } from "@/types";

// ─── Mock data ──────────────────────────────────────────────────────
// Estos datos se reemplazarán por llamadas reales a los services
// cuando se conecte la autenticación.

const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Supermercado", icon: "🛒", color: "#16A34A" },
  { id: "cat-2", name: "Transporte", icon: "🚌", color: "#2563EB" },
  { id: "cat-3", name: "Servicios", icon: "💡", color: "#F59E0B" },
  { id: "cat-4", name: "Salud", icon: "💊", color: "#DC2626" },
  { id: "cat-5", name: "Comida y salidas", icon: "🍽️", color: "#DB2777" },
  { id: "cat-6", name: "Hogar", icon: "🏠", color: "#7C3AED" },
  { id: "cat-7", name: "Otros", icon: "📦", color: "#64748B" },
];

const MOCK_EXPENSES: ExpenseRow[] = [
  {
    id: "exp-1",
    date: new Date("2026-07-26T00:00:00Z"),
    description: "Compra semanal",
    amount: 47250.0,
    currency: Currency.ARS,
    merchant: "Carrefour",
    category: { name: "Supermercado", color: "#16A34A" },
  },
  {
    id: "exp-2",
    date: new Date("2026-07-25T00:00:00Z"),
    description: "Carga SUBE",
    amount: 8000.0,
    currency: Currency.ARS,
    merchant: null,
    category: { name: "Transporte", color: "#2563EB" },
  },
  {
    id: "exp-3",
    date: new Date("2026-07-24T00:00:00Z"),
    description: "Factura de luz",
    amount: 32150.0,
    currency: Currency.ARS,
    merchant: "Edesur",
    category: { name: "Servicios", color: "#F59E0B" },
  },
  {
    id: "exp-4",
    date: new Date("2026-07-23T00:00:00Z"),
    description: "Farmacia — ibuprofeno",
    amount: 5400.0,
    currency: Currency.ARS,
    merchant: "Farmacity",
    category: { name: "Salud", color: "#DC2626" },
  },
  {
    id: "exp-5",
    date: new Date("2026-07-22T00:00:00Z"),
    description: "Cena con amigos",
    amount: 28900.0,
    currency: Currency.ARS,
    merchant: "La Cabrera",
    category: { name: "Comida y salidas", color: "#DB2777" },
  },
  {
    id: "exp-6",
    date: new Date("2026-07-21T00:00:00Z"),
    description: "Compra en almacén",
    amount: 15680.5,
    currency: Currency.ARS,
    merchant: "Almacén de barrio",
    category: { name: "Supermercado", color: "#16A34A" },
  },
  {
    id: "exp-7",
    date: new Date("2026-07-20T00:00:00Z"),
    description: "Netflix",
    amount: 6499.0,
    currency: Currency.ARS,
    merchant: null,
    category: { name: "Servicios", color: "#F59E0B" },
  },
  {
    id: "exp-8",
    date: new Date("2026-07-19T00:00:00Z"),
    description: "Filtro de agua + focos",
    amount: 22300.0,
    currency: Currency.ARS,
    merchant: "Easy",
    category: { name: "Hogar", color: "#7C3AED" },
  },
  {
    id: "exp-9",
    date: new Date("2026-07-18T00:00:00Z"),
    description: "Uber al centro",
    amount: 4500.0,
    currency: Currency.ARS,
    merchant: null,
    category: { name: "Transporte", color: "#2563EB" },
  },
  {
    id: "exp-10",
    date: new Date("2026-07-17T00:00:00Z"),
    description: "Almuerzo en la facu",
    amount: 7150.0,
    currency: Currency.ARS,
    merchant: "Buffet UNS",
    category: { name: "Comida y salidas", color: "#DB2777" },
  },
];

const MOCK_CATEGORY_TOTALS = [
  {
    categoryId: "cat-1",
    categoryName: "Supermercado",
    icon: "🛒",
    color: "#16A34A",
    total: 62930.5,
    expenseCount: 2,
  },
  {
    categoryId: "cat-3",
    categoryName: "Servicios",
    icon: "💡",
    color: "#F59E0B",
    total: 38649.0,
    expenseCount: 2,
  },
  {
    categoryId: "cat-5",
    categoryName: "Comida y salidas",
    icon: "🍽️",
    color: "#DB2777",
    total: 36050.0,
    expenseCount: 2,
  },
  {
    categoryId: "cat-6",
    categoryName: "Hogar",
    icon: "🏠",
    color: "#7C3AED",
    total: 22300.0,
    expenseCount: 1,
  },
  {
    categoryId: "cat-2",
    categoryName: "Transporte",
    icon: "🚌",
    color: "#2563EB",
    total: 12500.0,
    expenseCount: 2,
  },
  {
    categoryId: "cat-4",
    categoryName: "Salud",
    icon: "💊",
    color: "#DC2626",
    total: 5400.0,
    expenseCount: 1,
  },
];

const GRAND_TOTAL = MOCK_CATEGORY_TOTALS.reduce((s, c) => s + c.total, 0);

// ─── Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <main
        style={{
          marginLeft: "var(--sidebar-width)",
          flex: 1,
          padding: "var(--space-12) var(--space-16)",
          maxWidth: 1200,
        }}
      >
        <MonthHeader
          monthName="Julio"
          year={2026}
          totalFormatted="$ 177.829,50"
          expenseCount={10}
        />

        <FilterPills
          currencies={["ARS", "USD"]}
          categories={MOCK_CATEGORIES}
        />

        {/* Two-column layout: expenses + breakdown */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "var(--space-16)",
            alignItems: "start",
          }}
        >
          {/* Left: expense list */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: "var(--space-5)",
              }}
            >
              <h2
                className="heading-display"
                style={{ fontSize: "1.25rem" }}
              >
                Últimos gastos
              </h2>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent)",
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  padding: 0,
                  fontWeight: 500,
                }}
              >
                Ver todos →
              </button>
            </div>
            <ExpenseList expenses={MOCK_EXPENSES} />
          </section>

          {/* Right: category breakdown */}
          <aside
            style={{
              position: "sticky",
              top: "var(--space-12)",
              padding: "var(--space-6)",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)",
            }}
          >
            <h2
              className="heading-display"
              style={{
                fontSize: "1rem",
                marginBottom: "var(--space-6)",
              }}
            >
              Por categoría
            </h2>
            <CategoryBreakdown
              categories={MOCK_CATEGORY_TOTALS}
              currency={Currency.ARS}
              grandTotal={GRAND_TOTAL}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
