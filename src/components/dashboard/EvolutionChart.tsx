"use client";

import { useId, useState } from "react";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import Amount from "../ui/Amount";
import { Currency } from "@/types";
import type { MonthlyComparisonPoint } from "@/types";

interface EvolutionChartProps {
  data: MonthlyComparisonPoint[];
  currency?: Currency;
}

/**
 * Colores validados con el script de la guía de visualización contra la
 * superficie oscura de las Cards (#1a1a19): separación en deuteranopia
 * ΔE 9.2 (el objetivo es ≥ 8). El verde/rojo de los tokens semánticos
 * (--positive/--negative) quedaba en ΔE 7.9 y fuera de la banda de luminosidad
 * para fondo oscuro, así que las líneas usan pasos propios; los tiles de
 * Ingresos/Gastos de arriba siguen con los tokens de siempre.
 */
const SERIES = [
  { key: "ingresos", label: "Ingresos", color: "#12a594" },
  { key: "gastos", label: "Gastos", color: "#e66767" },
] as const;

const W = 760;
const H = 260;
const PAD = { top: 20, right: 78, bottom: 30, left: 52 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/**
 * Spline monótona (Fritsch–Carlson). Una Catmull-Rom común se pasa de largo en
 * los picos e inventa valles por debajo de cero entre dos meses — con plata eso
 * es dibujar un dato que no existe. Estas tangentes no sobrepasan los puntos.
 */
export function smoothPath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x} ${points[0].y}`;
  if (n === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1].x - points[i].x;
    slope[i] = (points[i + 1].y - points[i].y) / dx[i];
  }

  const m: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) {
      // Cambio de dirección (o meseta): tangente plana para no sobrepasar.
      m[i] = 0;
    } else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      m[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
    }
  }
  m[n - 1] = slope[n - 2];

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = points[i].x + dx[i] / 3;
    const c1y = points[i].y + (m[i] * dx[i]) / 3;
    const c2x = points[i + 1].x - dx[i] / 3;
    const c2y = points[i + 1].y - (m[i + 1] * dx[i]) / 3;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  return d;
}

export default function EvolutionChart({
  data,
  currency = Currency.ARS,
}: EvolutionChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");

  if (data.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-sm text-muted">
        Todavía no hay movimientos para graficar.
      </p>
    );
  }

  // El techo de la escala sale de las dos series juntas: con un eje por serie
  // las alturas no serían comparables entre sí, que es justo lo que se quiere leer.
  const max = Math.max(...data.flatMap((d) => [d.ingresos, d.gastos]), 1);
  const lastIndex = data.length - 1;

  const x = (i: number) =>
    data.length === 1 ? PAD.left + PLOT_W / 2 : PAD.left + (i / lastIndex) * PLOT_W;
  const y = (value: number) => PAD.top + PLOT_H - (value / max) * PLOT_H;
  const baseY = PAD.top + PLOT_H;

  const series = SERIES.map((s) => {
    const points = data.map((d, i) => ({ x: x(i), y: y(d[s.key]) }));
    const line = smoothPath(points);

    return {
      ...s,
      points,
      line,
      area: `${line} L ${points[lastIndex].x} ${baseY} L ${points[0].x} ${baseY} Z`,
    };
  });

  // Etiquetas al final de cada línea: la identidad no queda solo en el color.
  // Si los dos meses terminan cerca, se separan para no encimarse.
  const endLabels = series.map((s) => ({
    label: s.label,
    color: s.color,
    y: s.points[lastIndex].y,
  }));
  if (Math.abs(endLabels[0].y - endLabels[1].y) < 14) {
    const [higher, lower] =
      endLabels[0].y <= endLabels[1].y ? [endLabels[0], endLabels[1]] : [endLabels[1], endLabels[0]];
    const mid = (higher.y + lower.y) / 2;
    higher.y = mid - 7;
    lower.y = mid + 7;
  }

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    // El SVG llena el ancho del contenedor y mantiene el aspecto del viewBox,
    // así que la proporción se traduce directo a unidades del viewBox.
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    const ratio = (vx - PAD.left) / PLOT_W;
    const i = Math.round(ratio * lastIndex);
    setHovered(Math.min(Math.max(i, 0), lastIndex));
  }

  const active = hovered === null ? null : data[hovered];
  const activeDiff = active ? active.ingresos - active.gastos : 0;

  return (
    <div>
      {/* Leyenda — obligatoria con dos series. */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-body">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: s.color }}
              aria-hidden="true"
            />
            {s.label}
          </span>
        ))}
      </div>

      <div
        className="relative"
        onMouseMove={handleMove}
        onMouseLeave={() => setHovered(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ aspectRatio: `${W} / ${H}` }}
          role="img"
          aria-label="Evolución mensual de ingresos y gastos. El detalle numérico está en la tabla debajo."
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.key}
                id={`${uid}-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grilla recesiva: base, mitad y techo. */}
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                y1={y(max * t)}
                x2={PAD.left + PLOT_W}
                y2={y(max * t)}
                stroke="var(--border-subtle)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y(max * t) + 4}
                textAnchor="end"
                className="fill-[var(--text-faint)] text-[11px]"
              >
                <Amount value={max * t} currency={currency} compact />
              </text>
            </g>
          ))}

          {series.map((s) => (
            <path key={`${s.key}-area`} d={s.area} fill={`url(#${uid}-${s.key})`} />
          ))}

          {series.map((s) => (
            <path
              key={`${s.key}-line`}
              d={s.line}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Crosshair + puntos del mes bajo el cursor. */}
          {hovered !== null && (
            <>
              <line
                x1={x(hovered)}
                y1={PAD.top}
                x2={x(hovered)}
                y2={baseY}
                stroke="var(--border-default)"
                strokeWidth="1"
              />
              {series.map((s) => (
                <circle
                  key={`${s.key}-dot`}
                  cx={s.points[hovered].x}
                  cy={s.points[hovered].y}
                  r="5"
                  fill={s.color}
                  stroke="var(--bg-surface)"
                  strokeWidth="2"
                />
              ))}
            </>
          )}

          {/* Etiqueta directa al final de cada línea. */}
          {endLabels.map((l) => (
            <text
              key={l.label}
              x={PAD.left + PLOT_W + 10}
              y={l.y + 4}
              className="text-[11px] font-medium"
              fill={l.color}
            >
              {l.label}
            </text>
          ))}

          {/* Meses */}
          {data.map((d, i) => (
            <text
              key={`${d.label}-${i}`}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className={cn(
                "text-[11px]",
                hovered === i ? "fill-[var(--text-body)]" : "fill-[var(--text-faint)]",
              )}
            >
              {d.label}
            </text>
          ))}
        </svg>

        {active && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-0 z-10 min-w-40 -translate-x-1/2 rounded-md border border-border-default bg-raised px-3 py-2 shadow-md"
            style={{
              left: `${((x(hovered!) ) / W) * 100}%`,
            }}
          >
            <p className="mb-1.5 text-xs font-medium text-heading">{active.label}</p>
            {SERIES.map((s) => (
              <p key={s.key} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: s.color }}
                    aria-hidden="true"
                  />
                  {s.label}
                </span>
                <span className="tabular-nums text-body">
                  <Amount value={active[s.key]} currency={currency} />
                </span>
              </p>
            ))}
            <hr className="separator my-1.5" />
            <p className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted">Diferencia</span>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  activeDiff >= 0 ? "text-positive" : "text-negative",
                )}
              >
                {activeDiff >= 0 ? "+" : ""}
                <Amount value={activeDiff} currency={currency} />
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Los valores exactos, para lectores de pantalla y para quien no
          distinga las dos líneas por color. */}
      <details className="mt-4">
        <summary className="cursor-pointer text-xs text-muted hover:text-body">
          Ver los datos en tabla
        </summary>
        <table className="mt-3 w-full text-left text-xs">
          <thead>
            <tr className="text-muted">
              <th scope="col" className="py-1 font-medium">Mes</th>
              <th scope="col" className="py-1 text-right font-medium">Ingresos</th>
              <th scope="col" className="py-1 text-right font-medium">Gastos</th>
              <th scope="col" className="py-1 text-right font-medium">Diferencia</th>
            </tr>
          </thead>
          <tbody className="tabular-nums text-body">
            {data.map((d, i) => (
              <tr key={`${d.label}-${i}`} className="border-t border-border-subtle">
                <th scope="row" className="py-1 font-normal text-muted">{d.label}</th>
                <td className="py-1 text-right"><Amount value={d.ingresos} currency={currency} /></td>
                <td className="py-1 text-right"><Amount value={d.gastos} currency={currency} /></td>
                <td className="py-1 text-right">
                  {d.ingresos - d.gastos >= 0 ? "+" : ""}
                  <Amount value={d.ingresos - d.gastos} currency={currency} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
