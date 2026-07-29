import type { Currency } from "@/generated/prisma/enums";

/** Une clases condicionales, ignorando valores falsy. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Formatea un monto para mostrar, ej. "$ 12.345,67". */
export function formatAmount(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Versión corta para ejes de gráficos, ej. "$ 12,3 mil". */
export function formatCompactAmount(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
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

/**
 * "YYYY-MM-DD" a partir de la fecha *local* del usuario.
 *
 * Ojo con la diferencia contra `parseDateOnly`: eso convierte a UTC para
 * guardar en una columna `@db.Date`. Esto es lo contrario — el calendario que
 * ve la persona. `toISOString().slice(0, 10)` no sirve acá: en Argentina
 * (UTC-3) después de las 21:00 devuelve el día siguiente, así que un
 * movimiento cargado a la noche salía fechado mañana.
 */
export function toDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

/** Inversa de `toDateInputValue`: "YYYY-MM-DD" a Date local (no UTC). */
export function fromDateInputValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

/** Corre un "YYYY-MM-DD" N días. Anda sobre el calendario local, así que un
 *  salto de horario de verano no le come ni le agrega un día. */
export function addDays(value: string, days: number): string {
  const date = fromDateInputValue(value);
  date.setDate(date.getDate() + days);

  return toDateInputValue(date);
}

/**
 * Corre un "YYYY-MM-DD" N meses, recortando el día al último del mes destino.
 * Sin el recorte, `setMonth()` desborda solo: 31 de marzo − 1 mes daría "3 de
 * marzo" (31 de febrero), no el 28.
 */
export function addMonths(value: string, months: number): string {
  const date = fromDateInputValue(value);
  const day = date.getDate();

  date.setDate(1);
  date.setMonth(date.getMonth() + months);

  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));

  return toDateInputValue(date);
}

/** Rango [gte, lt) que cubre un mes completo, en UTC. */
export function monthRange(year: number, month: number): { gte: Date; lt: Date } {
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  };
}
