import Amount from "../ui/Amount";
import type { Currency, MonthOverMonth } from "@/types";

interface MonthComparisonProps {
  currency: Currency;
  /** `null` cuando no hay mes anterior con el cual comparar. */
  comparison: MonthOverMonth | null;
}

/**
 * La comparación contra el mes anterior, en una frase debajo del nombre.
 *
 * Va en castellano y sin porcentaje a propósito: la app apunta a alguien que
 * venía anotando en una planilla, y "$12.400 más" dice algo mucho más concreto
 * que "+18%". El porcentaje obliga a resolver una cuenta para saber de cuánta
 * plata se está hablando.
 *
 * Solo compara gastos: son el lado sobre el que la persona puede hacer algo.
 */
export default function MonthComparison({ currency, comparison }: MonthComparisonProps) {
  if (!comparison) {
    return null;
  }

  const { delta, pct } = comparison.gastos;
  const { previousLabel } = comparison;

  // Una diferencia por debajo del 1% no vale la pena nombrarla en plata: se lee
  // como si algo hubiera cambiado cuando en la práctica es el mismo mes.
  // pct es null si el mes anterior cerró en cero, y ahí la diferencia sí importa.
  if (delta === 0 || (pct !== null && Math.abs(pct) < 1)) {
    return (
      <p className="mt-2 text-sm text-body">
        Gastaste casi lo mismo que en {previousLabel}.
      </p>
    );
  }

  const spentMore = delta > 0;

  return (
    <p className="mt-2 text-sm text-body">
      Gastaste{" "}
      <span className={spentMore ? "font-medium text-negative" : "font-medium text-positive"}>
        <Amount value={Math.abs(delta)} currency={currency} />
      </span>{" "}
      {spentMore ? "más" : "menos"} que en {previousLabel}.
    </p>
  );
}
