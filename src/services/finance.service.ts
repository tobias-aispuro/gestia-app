import { cache } from "react";
import * as expenseService from "./expense.service";
import * as incomeService from "./income.service";
import * as expenseRepo from "@/repositories/expense.repository";
import * as incomeRepo from "@/repositories/income.repository";
import type {
  Currency,
  FinanceOverview,
  MonthlyComparisonPoint,
  MonthOverMonth,
  MonthOverMonthMetric,
} from "@/types";

/**
 * Ventana del gráfico de evolución. Es una constante y no un número suelto en
 * cada call site porque `recentMonthlyComparison` está cacheada por argumentos:
 * si el gráfico pidiera 6 y `monthOverMonth` otro número, serían dos entradas
 * de caché distintas y se duplicarían las queries.
 */
export const EVOLUTION_MONTHS = 6;

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
export const recentMonthlyComparison = cache(async (
  userId: string,
  currency: Currency,
  months: number,
): Promise<MonthlyComparisonPoint[]> => {
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
});

function metric(current: number, previous: number): MonthOverMonthMetric {
  return {
    delta: current - previous,
    pct: previous === 0 ? null : ((current - previous) / previous) * 100,
  };
}

/**
 * Mes en curso contra el anterior. No pega una sola query propia: reusa la
 * misma llamada cacheada que dibuja el gráfico de evolución, que ya trae los
 * últimos `EVOLUTION_MONTHS` meses de las dos series.
 *
 * Devuelve `null` cuando el mes anterior cerró sin movimientos: con solo los
 * totales no se distingue "no gastó nada" de "todavía no usaba la app", y
 * mostrar "+100%" contra un mes vacío sería inventar una tendencia.
 */
export const monthOverMonth = cache(async (
  userId: string,
  currency: Currency,
): Promise<MonthOverMonth | null> => {
  const points = await recentMonthlyComparison(userId, currency, EVOLUTION_MONTHS);

  const current = points[points.length - 1];
  const previous = points[points.length - 2];

  if (!current || !previous || (previous.ingresos === 0 && previous.gastos === 0)) {
    return null;
  }

  // El mismo criterio UTC que usa recentMonthlyComparison para armar los meses.
  const now = new Date();
  const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

  return {
    previousLabel: new Intl.DateTimeFormat("es-AR", {
      month: "long",
      timeZone: "UTC",
    }).format(previousMonth),
    ingresos: metric(current.ingresos, previous.ingresos),
    gastos: metric(current.gastos, previous.gastos),
  };
});
