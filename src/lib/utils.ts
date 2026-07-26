import type { Currency } from "@/generated/prisma/enums";

/** Formatea un monto para mostrar, ej. "$ 12.345,67". */
export function formatAmount(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Formatea una fecha para mostrar, ej. "26 jul 2026". */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Convierte "YYYY-MM-DD" a un Date en medianoche UTC.
 * Sin esto, `new Date("2026-07-26")` leído en zona local puede correrse un día
 * al guardarse en una columna `@db.Date`.
 */
export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Rango [gte, lt) que cubre un mes completo, en UTC. */
export function monthRange(year: number, month: number): { gte: Date; lt: Date } {
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  };
}
