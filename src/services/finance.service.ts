import * as expenseService from "./expense.service";
import * as incomeService from "./income.service";
import * as expenseRepo from "@/repositories/expense.repository";
import * as incomeRepo from "@/repositories/income.repository";
import type { Currency, FinanceOverview, MonthlyComparisonPoint } from "@/types";

/**
 * Los números del bloque de balance del dashboard. Vive acá y no en
 * expense/income.service porque es el único cálculo que cruza los dos lados.
 *
 * "Acumulado" es histórico (todo lo que entró menos todo lo que salió), no del
 * mes: es un saldo, y reiniciarlo cada mes lo haría idéntico a "Balance del
 * mes", que ya se muestra al lado.
 */
export async function overview(
  userId: string,
  year: number,
  month: number,
  currency: Currency,
): Promise<FinanceOverview> {
  const [ingresosHistoricos, gastosHistoricos, ingresos, gastos] = await Promise.all([
    incomeService.allTimeTotal(userId, currency),
    expenseService.allTimeTotal(userId, currency),
    incomeService.monthlyTotal(userId, year, month, currency),
    // monthlySummary ya está cacheada y la pide también "Distribución de
    // gastos": reusarla acá no agrega una query.
    expenseService
      .monthlySummary(userId, year, month, currency)
      .then((summary) => summary.total),
  ]);

  return {
    currency,
    balanceAcumulado: ingresosHistoricos - gastosHistoricos,
    ingresos,
    gastos,
  };
}

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function bucketByMonth(rows: { amount: unknown; date: Date }[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const key = `${row.date.getUTCFullYear()}-${row.date.getUTCMonth() + 1}`;
    totals.set(key, (totals.get(key) ?? 0) + Number(row.amount));
  }

  return totals;
}

/**
 * Últimos `months` meses (incluyendo el actual) con los dos lados enfrentados,
 * para el gráfico de evolución.
 *
 * Dos queries de rango (una por modelo) y el agrupado por mes en JS: pedir un
 * total por mes serían 2 × N queries para dibujar un solo gráfico.
 */
export async function recentMonthlyComparison(
  userId: string,
  currency: Currency,
  months: number,
): Promise<MonthlyComparisonPoint[]> {
  const now = new Date();

  const periods = Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - i), 1));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  });

  const rangeStart = new Date(Date.UTC(periods[0].year, periods[0].month - 1, 1));
  const rangeEnd = new Date(Date.UTC(periods[months - 1].year, periods[months - 1].month, 1));

  const [expenseRows, incomeRows] = await Promise.all([
    expenseRepo.findAmountsInRange(userId, currency, rangeStart, rangeEnd),
    incomeRepo.findAmountsInRange(userId, currency, rangeStart, rangeEnd),
  ]);

  const gastosPorMes = bucketByMonth(expenseRows);
  const ingresosPorMes = bucketByMonth(incomeRows);

  return periods.map(({ year, month }) => {
    const key = `${year}-${month}`;

    return {
      label: MONTH_LABELS[month - 1],
      ingresos: ingresosPorMes.get(key) ?? 0,
      gastos: gastosPorMes.get(key) ?? 0,
    };
  });
}
