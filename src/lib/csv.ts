/**
 * Serialización de CSV. Nada de esto toca el dominio: recibe strings ya
 * formateados y se ocupa solo de que el archivo sea válido.
 */

// RFC 4180 pide CRLF. Excel en Windows lo prefiere y el resto lo tolera.
const EOL = "\r\n";

/**
 * Una celda que arranca con `=`, `+`, `-`, `@`, tab o CR la interpretan como
 * fórmula Excel, Google Sheets y LibreOffice. Un gasto descrito "=cafe" haría
 * que la planilla muestre un #NAME? en vez del texto — y si el archivo se
 * comparte, es el vector clásico de inyección de fórmulas.
 *
 * Se aplica **solo a texto libre**. No pasarle montos: un día alguien exporta
 * un balance negativo y "-500" quedaría convertido en texto.
 */
export function guardAgainstFormulas(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/** Comillas dobles alrededor si el valor contiene el separador, comillas o saltos. */
export function escapeCsvField(value: string, separator: string): string {
  const needsQuotes =
    value.includes(separator) || value.includes('"') || /[\r\n]/.test(value);

  return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv({
  headers,
  rows,
  separator,
  bom = false,
}: {
  headers: string[];
  rows: string[][];
  separator: string;
  /** U+FEFF al inicio. Sin esto Excel lee el archivo como ANSI y rompe los acentos. */
  bom?: boolean;
}): string {
  const lines = [headers, ...rows].map((row) =>
    row.map((field) => escapeCsvField(field, separator)).join(separator),
  );

  return (bom ? "﻿" : "") + lines.join(EOL) + EOL;
}
