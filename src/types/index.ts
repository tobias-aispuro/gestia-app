import type { Currency, PaymentMethod } from "@/generated/prisma/enums";

// En Prisma 7 los tipos de modelo se generan con sufijo `Model`.
export type {
  CategoryModel as Category,
  ExpenseModel as Expense,
  IncomeModel as Income,
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

/** Ingreso listo para la UI: el Decimal de Prisma ya viene convertido a number. */
export interface IncomeView {
  id: string;
  amount: number;
  currency: Currency;
  description: string;
  date: Date;
  source: string | null;
}

/** Los cuatro números del bloque de balance del dashboard. */
export interface FinanceOverview {
  currency: Currency;
  /** Histórico completo: todos los ingresos menos todos los gastos. */
  balanceAcumulado: number;
  /** Del mes en curso. */
  ingresos: number;
  gastos: number;
}

/** Un mes del gráfico de evolución: los dos lados enfrentados. */
export interface MonthlyComparisonPoint {
  label: string;
  ingresos: number;
  gastos: number;
}

/** Variación de una métrica contra el mismo dato del mes anterior. */
export interface MonthOverMonthMetric {
  /** Diferencia absoluta; positiva significa más que el mes pasado. */
  delta: number;
  /**
   * Variación porcentual, o `null` si el mes anterior cerró en 0: dividir por
   * cero daría Infinity y "+∞%" no le dice nada a nadie.
   */
  pct: number | null;
}

/** Mes en curso contra el anterior, para el bloque de balance. */
export interface MonthOverMonth {
  /** Nombre del mes anterior en castellano, ej. "junio". */
  previousLabel: string;
  ingresos: MonthOverMonthMetric;
  gastos: MonthOverMonthMetric;
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
