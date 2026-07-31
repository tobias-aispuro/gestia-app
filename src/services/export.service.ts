import { guardAgainstFormulas, toCsv } from "@/lib/csv";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-methods";
import type { ExpenseView } from "@/types";

/**
 * Dos dialectos de CSV, porque sirven para cosas distintas:
 *
 * - `excel`: separador `;`, coma decimal, fecha dd/mm/aaaa y BOM. Es lo que
 *   espera un Excel con configuración regional en español — se abre en
 *   columnas con doble click.
 * - `standard`: RFC 4180 de manual, separador `,`, punto decimal y fecha ISO.
 *   Es el que se puede volver a leer sin adivinar nada.
 */
export type CsvFormat = "excel" | "standard";

const HEADERS: Record<CsvFormat, string[]> = {
  excel: ["Fecha", "Descripción", "Monto", "Moneda", "Categoría", "Comercio", "Medio de pago"],
  standard: ["fecha", "descripcion", "monto", "moneda", "categoria", "comercio", "medio_de_pago"],
};

/**
 * Las fechas viven en columnas `@db.Date`, o sea medianoche UTC. Hay que leer
 * las partes en UTC: con getDate() y compañía, al oeste de Greenwich el archivo
 * saldría fechado un día antes.
 */
function formatDate(date: Date, format: CsvFormat): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return format === "excel" ? `${day}/${month}/${year}` : `${year}-${month}-${day}`;
}

function formatAmount(amount: number, format: CsvFormat): string {
  const fixed = amount.toFixed(2);

  // Sin separador de miles a propósito: "15.340,50" obliga a comillas y es
  // justo lo que confunde a un parser cuando el archivo vuelve a entrar.
  return format === "excel" ? fixed.replace(".", ",") : fixed;
}

export function expensesToCsv(expenses: ExpenseView[], format: CsvFormat): string {
  const rows = expenses.map((expense) => [
    formatDate(expense.date, format),
    guardAgainstFormulas(expense.description),
    formatAmount(expense.amount, format),
    expense.currency,
    guardAgainstFormulas(expense.category.name),
    guardAgainstFormulas(expense.merchant ?? ""),
    format === "excel"
      ? PAYMENT_METHOD_LABELS[expense.paymentMethod]
      : expense.paymentMethod,
  ]);

  return toCsv({
    headers: HEADERS[format],
    rows,
    separator: format === "excel" ? ";" : ",",
    bom: format === "excel",
  });
}

/** ej. "gastos-2026-07-31.csv" / "gastos-filtrados-2026-07-31.csv" */
export function csvFilename(scope: "filtered" | "all", now = new Date()): string {
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  return `gastos${scope === "filtered" ? "-filtrados" : ""}-${stamp}.csv`;
}
