"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { exportExpensesCsvAction } from "@/actions/export.actions";
import type { CsvFormat } from "@/services/export.service";
import type { Currency } from "@/types";

type Scope = "filtered" | "all";

interface ExportExpensesModalProps {
  /** Gastos que entran en los filtros activos de la vista. */
  filteredCount: number;
  /** Todos los gastos del usuario, sin filtrar. */
  totalCount: number;
  currency?: Currency;
  categoryId?: string;
}

const FORMAT_HINTS: Record<CsvFormat, string> = {
  excel:
    "Separador ; y coma decimal. Se abre en columnas con doble click en Excel configurado en español.",
  standard:
    "Separador , y punto decimal, fechas aaaa-mm-dd. El formato universal, más fácil de volver a leer.",
};

/**
 * El archivo llega como string desde la Server Action y se baja acá con un
 * Blob — sin Route Handler, o sea sin estrenar `src/app/api`.
 */
function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  // Firefox ignora el click si el <a> no está en el documento.
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revocar en el mismo tick puede cancelar la descarga en algunos navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ExportExpensesModal({
  filteredCount,
  totalCount,
  currency,
  categoryId,
}: ExportExpensesModalProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<CsvFormat>("excel");
  const [scope, setScope] = useState<Scope>("filtered");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sin filtros activos las dos opciones darían el mismo archivo, así que no
  // se ofrece la elección: se exporta todo y listo.
  const isFiltered = filteredCount !== totalCount;
  const effectiveScope: Scope = isFiltered ? scope : "all";
  const rowCount = effectiveScope === "filtered" ? filteredCount : totalCount;

  async function handleDownload() {
    setDownloading(true);
    setError(null);

    try {
      const result = await exportExpensesCsvAction({
        format,
        scope: effectiveScope,
        currency: effectiveScope === "filtered" ? currency : undefined,
        categoryId: effectiveScope === "filtered" ? categoryId : undefined,
      });

      downloadCsv(result.filename, result.content);
      setOpen(false);
    } catch {
      setError("No se pudo generar el archivo.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={totalCount === 0}
        leftIcon={<DownloadIcon />}
      >
        Exportar
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Exportar gastos">
        <div className="flex flex-col gap-6">
          <Segmented
            label="Formato"
            value={format}
            onChange={setFormat}
            options={[
              { value: "excel", label: "Para Excel" },
              { value: "standard", label: "CSV estándar" },
            ]}
          />
          <p className="-mt-4 text-xs text-muted">{FORMAT_HINTS[format]}</p>

          {isFiltered && (
            <>
              <Segmented
                label="Qué incluir"
                value={scope}
                onChange={setScope}
                options={[
                  { value: "filtered", label: `Estos ${filteredCount}` },
                  { value: "all", label: `Todo (${totalCount})` },
                ]}
              />
              {scope === "filtered" && (
                <p className="-mt-4 text-xs text-muted">
                  Respeta los filtros activos, así que el archivo va a tener una sola moneda.
                </p>
              )}
            </>
          )}

          {error && <p className="text-sm text-negative">{error}</p>}

          <Button
            variant="primary"
            loading={downloading}
            onClick={handleDownload}
            disabled={rowCount === 0}
            className="w-full py-3 text-base font-semibold"
          >
            Descargar {rowCount} {rowCount === 1 ? "gasto" : "gastos"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <p className="text-label mb-2">{label}</p>
      <div
        className="grid grid-cols-2 gap-1 rounded-full bg-surface p-1"
        role="group"
        aria-label={label}
      >
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium",
                "transition-colors duration-200 ease-out cursor-pointer",
                isActive ? "bg-accent text-background" : "text-muted hover:text-body",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M3.5 14v1.5a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V14" />
    </svg>
  );
}
