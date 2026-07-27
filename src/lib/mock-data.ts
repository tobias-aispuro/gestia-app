import { Currency } from "@/types";
import type { ExpenseRow } from "@/app/components/ExpenseList";

// Datos de muestra compartidos entre la pantalla principal y /gastos.
// Se reemplazarán por llamadas reales a los services cuando se conecte la autenticación.

export const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Supermercado", icon: "🛒", color: "#16A34A" },
  { id: "cat-2", name: "Transporte", icon: "🚌", color: "#2563EB" },
  { id: "cat-3", name: "Servicios", icon: "💡", color: "#F59E0B" },
  { id: "cat-4", name: "Salud", icon: "💊", color: "#DC2626" },
  { id: "cat-5", name: "Comida y salidas", icon: "🍽️", color: "#DB2777" },
  { id: "cat-6", name: "Hogar", icon: "🏠", color: "#7C3AED" },
  { id: "cat-7", name: "Otros", icon: "📦", color: "#64748B" },
];

export const MOCK_EXPENSES: ExpenseRow[] = [
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

export const MOCK_CATEGORY_TOTALS = [
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

export const GRAND_TOTAL = MOCK_CATEGORY_TOTALS.reduce((s, c) => s + c.total, 0);

/** Últimos 6 meses de gasto total, para el gráfico de evolución. Julio coincide con GRAND_TOTAL. */
export const MOCK_MONTHLY_EXPENSES = [
  { label: "Feb", total: 142300 },
  { label: "Mar", total: 158900 },
  { label: "Abr", total: 133750 },
  { label: "May", total: 169400 },
  { label: "Jun", total: 151200 },
  { label: "Jul", total: GRAND_TOTAL },
];

export const MOCK_INGRESOS_MES = 250000.0;
export const MOCK_BALANCE_ACUMULADO = 842150.3;
