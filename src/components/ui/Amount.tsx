"use client";

import { formatAmount, formatCompactAmount, maskedAmount } from "@/lib/utils";
import { usePrivacy } from "../layout/PrivacyProvider";
import type { Currency } from "@/types";

interface AmountProps {
  value: number;
  currency: Currency;
  /** Versión corta, para ejes de gráficos. */
  compact?: boolean;
}

/**
 * Todo monto que se muestra en pantalla pasa por acá, para que el modo
 * privacidad no dependa de acordarse de taparlo en cada lugar nuevo.
 *
 * Devuelve texto pelado, sin envolver en un `<span>`: así también sirve adentro
 * de un `<text>` de SVG (el eje del gráfico de evolución), donde un elemento de
 * HTML no renderizaría.
 */
export default function Amount({ value, currency, compact = false }: AmountProps) {
  const { hidden } = usePrivacy();

  if (hidden) {
    return <>{maskedAmount(currency)}</>;
  }

  return <>{compact ? formatCompactAmount(value, currency) : formatAmount(value, currency)}</>;
}
