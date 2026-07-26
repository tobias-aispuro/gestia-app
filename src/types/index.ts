import type { Currency, PaymentMethod } from "@/generated/prisma/enums";

// En Prisma 7 los tipos de modelo se generan con sufijo `Model`.
export type {
  CategoryModel as Category,
  ExpenseModel as Expense,
  UserModel as User,
} from "@/generated/prisma/models";
export { Currency, PaymentMethod } from "@/generated/prisma/enums";

/**
 * Gasto listo para la UI: el Decimal de Prisma ya viene convertido a number y la
 * categoría embebida, así los componentes no dependen del cliente de Prisma.
 */
export interface ExpenseView {
  id: string;
  amount: number;
  currency: Currency;
  description: string;
  date: Date;
  merchant: string | null;
  paymentMethod: PaymentMethod;
  ticketUrl: string | null;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
}

export interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  color: string | null;
  total: number;
  expenseCount: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  currency: Currency;
  total: number;
  expenseCount: number;
  byCategory: CategoryTotal[];
}
