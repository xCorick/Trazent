type Cell = string | number | boolean | null | undefined;

const escapeCell = (value: Cell): string => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Convierte filas en texto CSV (la primera fila son los encabezados). */
export const toCsv = (rows: Cell[][]): string => rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');

/**
 * Descarga un CSV en el navegador. Se antepone el BOM para que Excel lea bien los acentos.
 * Con la API real, el archivo lo generará el servidor.
 */
export function downloadCsv(fileName: string, csv: string) {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
