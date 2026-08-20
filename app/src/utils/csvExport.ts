/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generic CSV export helpers. Works with any array of plain objects:
 * columns are the union of keys (first-seen order), nested objects/arrays
 * are serialised as JSON strings so no data is silently dropped.
 * Files include a UTF-8 BOM so Chinese text opens correctly in Excel.
 *
 * SECURITY: this module is the single hardened CSV encoder for the app.
 * Every export must go through `buildCsv` / `buildCsvFromRows` (or the
 * matching download helpers) so spreadsheet formula payloads are neutralised
 * consistently. Do not hand-roll `"${value}"` encoders in feature code.
 */

type PlainRow = Record<string, unknown>;

export type CsvCell = string | number | boolean | null | undefined;

const SPREADSHEET_FORMULA_PREFIX = /^[=+\-@]/;

// Excel / LibreOffice / Google Sheets strip leading C0 control characters and
// Unicode whitespace on import, so "\t=cmd|..." still lands in the cell as a
// formula. Normalise those away *before* testing for a formula prefix,
// otherwise the guard is trivially bypassable.
const LEADING_NEUTRALISED_CHARS = /^[\u0000-\u0020\u007F-\u00A0\u1680\u2000-\u200D\u2028\u2029\u202F\u205F\u3000\uFEFF]+/;

export const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  let text: string;
  if (typeof value === 'string') {
    text = value;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    text = String(value);
  } else {
    text = JSON.stringify(value);
  }

  // Cells beginning with these characters can execute as formulas. Prefixing
  // with an apostrophe preserves the visible value while forcing spreadsheet
  // applications to treat it as text.
  const withoutLeadingControlChars = text.replace(LEADING_NEUTRALISED_CHARS, '');
  if (SPREADSHEET_FORMULA_PREFIX.test(withoutLeadingControlChars)) {
    text = `'${withoutLeadingControlChars}`;
  }

  if (/[",\t\r\n]/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

/** Build a CSV from an explicit header + row matrix (fixed column order). */
export const buildCsvFromRows = (header: string[], rows: CsvCell[][]): string =>
  [header, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');

export const buildCsv = (rows: PlainRow[]): string => {
  const columns: string[] = [];
  const seen = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    });
  });
  const header = columns.map(escapeCsvCell).join(',');
  const lines = rows.map((row) => columns.map((col) => escapeCsvCell(row[col])).join(','));
  return [header, ...lines].join('\r\n');
};

const triggerCsvDownload = (csv: string, filename: string) => {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadCsv = (rows: PlainRow[], baseFilename: string) => {
  const stamp = new Date().toISOString().slice(0, 10);
  triggerCsvDownload(buildCsv(rows), `${baseFilename}_${stamp}.csv`);
};

export const downloadCsvFromRows = (header: string[], rows: CsvCell[][], filename: string) => {
  triggerCsvDownload(buildCsvFromRows(header, rows), filename);
};
