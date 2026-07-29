"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { addDays, addMonths, cn, fromDateInputValue, toDateInputValue } from "@/lib/utils";

interface DatePickerProps {
  /** "YYYY-MM-DD" */
  value: string;
  onChange: (value: string) => void;
  label: string;
}

// Lunes primero, que es como se lee un calendario acá.
const WEEKDAYS = [
  { short: "L", long: "lunes" },
  { short: "M", long: "martes" },
  { short: "M", long: "miércoles" },
  { short: "J", long: "jueves" },
  { short: "V", long: "viernes" },
  { short: "S", long: "sábado" },
  { short: "D", long: "domingo" },
];

// 6 semanas fijas: julio arranca lunes y entra en 5 filas, agosto necesita 6.
// Con un alto variable el panel salta de tamaño al cambiar de mes.
const GRID_DAYS = 42;

const monthTitle = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" });
const triggerLabel = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const fullDate = new Intl.DateTimeFormat("es-AR", { dateStyle: "full" });

/**
 * ¿El pointerdown cayó sobre una barra de scroll y no sobre el contenido?
 *
 * Un click en la barra tiene como target al elemento que scrollea, así que no
 * se puede distinguir por el target: hay que mirar las coordenadas.
 * `clientWidth`/`clientHeight` excluyen la barra, el bounding rect la incluye;
 * si el punto quedó pasando ese borde, fue sobre la barra.
 */
function isScrollbarPointerDown(e: PointerEvent): boolean {
  const target = e.target;

  if (!(target instanceof HTMLElement)) return false;
  // Sin overflow no hay barra que clickear (y evita falsos positivos sobre el
  // borde derecho/inferior de cualquier elemento con border).
  if (target.scrollHeight <= target.clientHeight && target.scrollWidth <= target.clientWidth) {
    return false;
  }

  const rect = target.getBoundingClientRect();

  return (
    e.clientX > rect.left + target.clientWidth || e.clientY > rect.top + target.clientHeight
  );
}

export default function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  // Día que tiene el foco dentro de la grilla; no es lo mismo que el elegido
  // (con las flechas te movés sin seleccionar hasta apretar Enter).
  const [focused, setFocused] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const today = toDateInputValue(new Date());
  const viewDate = fromDateInputValue(focused);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // `focused` no se sincroniza con `value` en un efecto a propósito: solo
  // importa mientras el panel está abierto, y openPanel() ya lo iguala al
  // abrir. Un efecto acá sería un setState en cascada por cada render del
  // modal (que re-renderiza en cada tecla del input de monto).

  // Click afuera cierra. pointerdown y no click: si no, al soltar el botón
  // sobre otro control el panel sigue abierto tapándolo.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      // La barra de scroll del Modal es del contenedor que envuelve al
      // calendario, así que agarrarla llegaba acá como "click afuera" y
      // cerraba el panel justo cuando querías bajar para verlo entero.
      if (isScrollbarPointerDown(e)) return;

      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // El panel se abre abajo del campo, que suele quedar cerca del final del
  // modal: sin esto arranca medio tapado y hay que scrollear a mano.
  useEffect(() => {
    if (!open) return;

    panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);

  // El foco sigue a la flecha. Sin esto el lector de pantalla no anuncia el día
  // al que te moviste y las flechas no hacen nada visible.
  // preventScroll: el scrollIntoView de arriba ya se encarga, y si no compiten.
  useEffect(() => {
    if (!open) return;

    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)
      ?.focus({ preventScroll: true });
  }, [open, focused]);

  function openPanel() {
    setFocused(value);
    setOpen(true);
  }

  function closePanel(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function select(iso: string) {
    onChange(iso);
    closePanel();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (e.key in steps) {
      e.preventDefault();
      setFocused(addDays(focused, steps[e.key]));
      return;
    }

    switch (e.key) {
      case "PageUp":
        e.preventDefault();
        setFocused(addMonths(focused, -1));
        break;
      case "PageDown":
        e.preventDefault();
        setFocused(addMonths(focused, 1));
        break;
      case "Home":
        e.preventDefault();
        setFocused(toDateInputValue(new Date(viewYear, viewMonth, 1)));
        break;
      case "End":
        e.preventDefault();
        setFocused(toDateInputValue(new Date(viewYear, viewMonth + 1, 0)));
        break;
      case "Escape":
        // Modal escucha Escape en `document` para cerrarse entero.
        // stopImmediatePropagation y no stopPropagation: según dónde monte
        // React su root los dos listeners pueden caer en el mismo nodo.
        e.nativeEvent.stopImmediatePropagation();
        e.preventDefault();
        closePanel();
        break;
    }
  }

  // La grilla arranca en el lunes de la semana del día 1.
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const leading = (firstOfMonth.getDay() + 6) % 7;
  const days = Array.from({ length: GRID_DAYS }, (_, i) => {
    const date = new Date(viewYear, viewMonth, 1 - leading + i);

    return { iso: toDateInputValue(date), date };
  });
  // En filas de 7: un role="grid" con los gridcell sueltos, sin role="row"
  // en el medio, es una estructura ARIA inválida.
  const weeks = Array.from({ length: GRID_DAYS / 7 }, (_, i) =>
    days.slice(i * 7, i * 7 + 7),
  );

  return (
    <div ref={rootRef} className="relative">
      <span id={`${panelId}-label`} className="mb-1.5 block text-sm text-muted">
        {label}
      </span>

      {/* Todo el campo es el disparador — antes había que acertarle al ícono
          chiquito del selector nativo. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closePanel(false) : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${panelId}-label ${panelId}-value`}
        className={cn(
          "flex w-full items-center gap-3 rounded-full border-none px-4 py-3 text-left text-sm",
          "cursor-pointer transition-colors duration-150 ease-out",
          open ? "bg-raised text-heading" : "bg-surface text-heading hover:bg-raised",
        )}
      >
        <CalendarIcon />
        <span id={`${panelId}-value`} className="flex-1 first-letter:uppercase">
          {triggerLabel.format(fromDateInputValue(value))}
        </span>
        {value === today && <span className="text-xs text-muted">Hoy</span>}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={`Elegir ${label.toLowerCase()}`}
          className="mt-2 rounded-lg border border-border-default bg-surface p-3 animate-[scale-in_150ms_ease-out]"
        >
          {/* Navegación de mes */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <NavButton
              label="Mes anterior"
              onClick={() => setFocused(addMonths(focused, -1))}
            >
              ‹
            </NavButton>

            <span
              aria-live="polite"
              className="text-sm font-medium text-heading first-letter:uppercase"
            >
              {monthTitle.format(firstOfMonth)}
            </span>

            <NavButton
              label="Mes siguiente"
              onClick={() => setFocused(addMonths(focused, 1))}
            >
              ›
            </NavButton>
          </div>

          <div
            ref={gridRef}
            role="grid"
            aria-label={monthTitle.format(firstOfMonth)}
            onKeyDown={handleKeyDown}
            className="flex flex-col gap-0.5"
          >
            <div role="row" className="grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((d, i) => (
                <span
                  key={i}
                  role="columnheader"
                  aria-label={d.long}
                  className="flex h-8 items-center justify-center text-xs font-medium text-faint"
                >
                  {d.short}
                </span>
              ))}
            </div>

            {weeks.map((week, i) => (
              <div key={i} role="row" className="grid grid-cols-7 gap-0.5">
                {week.map(({ iso, date }) => {
                  const isSelected = iso === value;
                  const isToday = iso === today;
                  const isOutside = date.getMonth() !== viewMonth;

                  return (
                    <button
                      key={iso}
                      type="button"
                      role="gridcell"
                      data-date={iso}
                      // Un solo tab stop en toda la grilla: con 42 botones
                      // tabulables, salir del calendario sería insufrible.
                      tabIndex={iso === focused ? 0 : -1}
                      aria-selected={isSelected}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={fullDate.format(date)}
                      onClick={() => select(iso)}
                      className={cn(
                        "flex h-9 items-center justify-center rounded-full text-sm tabular-nums",
                        "cursor-pointer transition-colors duration-150 ease-out",
                        isSelected
                          ? "bg-accent font-semibold text-background"
                          : isOutside
                            ? "text-faint hover:bg-raised hover:text-body"
                            : "text-body hover:bg-raised hover:text-heading",
                        isToday && !isSelected && "font-semibold text-accent",
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* La enorme mayoría de los gastos se cargan el mismo día o el
              siguiente: dos clicks menos que navegar la grilla. */}
          <div className="mt-3 flex gap-2 border-t border-border-subtle pt-3">
            <ShortcutButton onClick={() => select(today)} active={value === today}>
              Hoy
            </ShortcutButton>
            <ShortcutButton
              onClick={() => select(addDays(today, -1))}
              active={value === addDays(today, -1)}
            >
              Ayer
            </ShortcutButton>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg leading-none",
        "text-muted transition-colors duration-150 ease-out hover:bg-raised hover:text-heading cursor-pointer",
      )}
    >
      {children}
    </button>
  );
}

function ShortcutButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium",
        "transition-colors duration-150 ease-out cursor-pointer",
        active
          ? "border-accent text-accent"
          : "border-border-subtle text-muted hover:border-border-default hover:text-body",
      )}
    >
      {children}
    </button>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted"
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="14" height="13" rx="2.5" />
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3" />
    </svg>
  );
}
