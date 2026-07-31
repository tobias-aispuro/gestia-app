import { z } from "zod";
import { Currency, PaymentMethod } from "@/generated/prisma/enums";

// Fuente de verdad de validación: todo input de API o Server Action pasa por acá
// antes de llegar a services.

export const createExpenseSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0").max(9_999_999_999),
  currency: z.enum(Currency).default(Currency.ARS),
  description: z.string().trim().min(1, "La descripción es obligatoria").max(200),
  date: z.iso.date("Fecha inválida (se espera YYYY-MM-DD)"),
  categoryId: z.cuid("Categoría inválida"),
  merchant: z.string().trim().max(120).optional(),
  paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.CASH),
  ticketUrl: z.url().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const listExpensesSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  categoryId: z.cuid().optional(),
  currency: z.enum(Currency).optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
});

// Mismas reglas de monto/fecha que un gasto: es la contraparte positiva del
// balance y tiene que validar igual de estricto.
export const createIncomeSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0").max(9_999_999_999),
  currency: z.enum(Currency).default(Currency.ARS),
  description: z.string().trim().min(1, "La descripción es obligatoria").max(200),
  date: z.iso.date("Fecha inválida (se espera YYYY-MM-DD)"),
  source: z.string().trim().max(120).optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

// `scope: "all"` ignora currency/categoryId a propósito — son el estado de la
// vista, no del export.
export const exportExpensesSchema = z.object({
  format: z.enum(["excel", "standard"]),
  scope: z.enum(["filtered", "all"]),
  currency: z.enum(Currency).optional(),
  categoryId: z.cuid().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(50),
  icon: z.string().trim().max(16).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "El color debe ser hexadecimal, ej. #4F46E5")
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesFilters = z.infer<typeof listExpensesSchema>;
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type ExportExpensesInput = z.infer<typeof exportExpensesSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
