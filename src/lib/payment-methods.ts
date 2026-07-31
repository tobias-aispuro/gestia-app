import { PaymentMethod } from "@/generated/prisma/enums";

/**
 * Nombres en castellano del enum `PaymentMethod`. Único lugar donde se traducen:
 * los usan el listado de /gastos, los dos modales y el dialecto Excel del CSV
 * (el dialecto estándar exporta el valor crudo del enum a propósito, para que
 * el archivo se pueda volver a leer sin depender del idioma).
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Efectivo",
  [PaymentMethod.DEBIT_CARD]: "Tarjeta de débito",
  [PaymentMethod.CREDIT_CARD]: "Tarjeta de crédito",
  [PaymentMethod.TRANSFER]: "Transferencia",
};

/**
 * Versión corta para las pills del modal de alta y para la columna del listado:
 * "Tarjeta de débito" no entra en una pill sin romper el ancho del modal.
 */
export const PAYMENT_METHOD_SHORT_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Efectivo",
  [PaymentMethod.DEBIT_CARD]: "Débito",
  [PaymentMethod.CREDIT_CARD]: "Crédito",
  [PaymentMethod.TRANSFER]: "Transferencia",
};

/** Orden de aparición en los selectores. Efectivo primero: es el caso más común. */
export const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.CASH,
  PaymentMethod.DEBIT_CARD,
  PaymentMethod.CREDIT_CARD,
  PaymentMethod.TRANSFER,
];
