/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Builds the legacy DR Loan Application workbook used by operations before
 * the dashboard. Keep the headers and bank-column order aligned with the
 * supplied reference workbook.
 */

import type { BankApplication, BankApplicationStatus, LoanApplication } from '../types';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

const ORIGINAL_LOAN_TEMPLATE_URL = '/templates/dr-loan-application-original-format.xlsx';

export const ORIGINAL_LOAN_EXPORT_HEADERS = [
  'TARIKH ',
  'Name',
  'PHONE',
  'IC',
  'NO PLAT',
  'Bank AEON',
  'Reject CODE',
  'Bank CHAILEASE',
  'Reject CODE',
  'Bank PARKSON ',
  'CODE',
  'handler'
] as const;

type OriginalLoanExportValue = string | Date;
type OriginalLoanExportRow = [
  OriginalLoanExportValue,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

const BANK_EXPORT_COLUMNS = [
  { match: 'aeon', statusIndex: 5, detailIndex: 6 },
  { match: 'chailease', statusIndex: 7, detailIndex: 8 },
  { match: 'parkson', statusIndex: 9, detailIndex: 10 }
] as const;

const BANK_STATUS_LABELS: Record<BankApplicationStatus, string> = {
  Draft: '',
  Submitted: 'PENDING',
  'Pending Review': 'IN PROCESS',
  'Need More Info': 'FOLLOW UP',
  Rejected: 'REJECT',
  Approved: 'APPROVE',
  Cancelled: 'CANCELLED'
};

const getBankSortTime = (bankApplication: BankApplication) => {
  const timestamp = new Date(
    bankApplication.decision_at ||
    bankApplication.approved_at ||
    bankApplication.submitted_at ||
    0
  ).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const findLatestBankApplication = (application: LoanApplication, bankMatch: string) => (
  [...(application.bank_applications || [])]
    .filter((bankApplication) => bankApplication.bank_name.trim().toLowerCase().includes(bankMatch))
    .sort((left, right) => (
      (right.round_no || 0) - (left.round_no || 0) ||
      getBankSortTime(right) - getBankSortTime(left)
    ))[0]
);

const getBankDetail = (bankApplication?: BankApplication) => {
  if (!bankApplication) {
    return '';
  }

  return (
    bankApplication.reject_code ||
    bankApplication.reject_reason ||
    bankApplication.status_reason ||
    bankApplication.next_action ||
    bankApplication.notes ||
    ''
  ).trim();
};

const getSubmittedDate = (submittedAt: string): Date | string => {
  const parsed = new Date(submittedAt);
  if (Number.isNaN(parsed.getTime())) {
    return submittedAt;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

export const buildOriginalLoanExportRows = (applications: LoanApplication[]): OriginalLoanExportRow[] => (
  applications.map((application) => {
    const row: OriginalLoanExportRow = [
      getSubmittedDate(application.submitted_at),
      application.applicant_name || '',
      application.phone_no || '',
      application.ic_no || '',
      application.vehicle_plate || application.vehicle_model || '',
      '',
      '',
      '',
      '',
      '',
      '',
      application.handler_name || ''
    ];

    BANK_EXPORT_COLUMNS.forEach(({ match, statusIndex, detailIndex }) => {
      const bankApplication = findLatestBankApplication(application, match);
      if (!bankApplication) {
        return;
      }

      row[statusIndex] = BANK_STATUS_LABELS[bankApplication.status];
      row[detailIndex] = getBankDetail(bankApplication);
    });

    return row;
  })
);

const escapeXmlText = (value: OriginalLoanExportValue) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const getExcelDateSerial = (date: Date) => (
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000 + 25_569
);

const COLUMN_LETTERS = ORIGINAL_LOAN_EXPORT_HEADERS.map((_, index) => String.fromCharCode(65 + index));
const BODY_STYLE_IDS = [6, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 9];

const buildSheetRowsXml = (rows: OriginalLoanExportRow[]) => rows.map((row, rowIndex) => {
  const excelRow = rowIndex + 2;
  const cells = row.map((value, columnIndex) => {
    const cellReference = `${COLUMN_LETTERS[columnIndex]}${excelRow}`;
    const styleId = BODY_STYLE_IDS[columnIndex];

    if (columnIndex === 0 && value instanceof Date) {
      return `<x:c r="${cellReference}" s="${styleId}"><x:v>${getExcelDateSerial(value)}</x:v></x:c>`;
    }

    if (value === '') {
      return `<x:c r="${cellReference}" s="${styleId}" />`;
    }

    return `<x:c r="${cellReference}" s="${styleId}" t="inlineStr"><x:is><x:t xml:space="preserve">${escapeXmlText(value)}</x:t></x:is></x:c>`;
  }).join('');

  return `<x:row r="${excelRow}">${cells}</x:row>`;
}).join('');

export const buildOriginalLoanExportWorkbook = (
  applications: LoanApplication[],
  templateBytes: ArrayBuffer
) => {
  const rows = buildOriginalLoanExportRows(applications);
  const archive = unzipSync(new Uint8Array(templateBytes));
  const worksheetPath = 'xl/worksheets/sheet1.xml';
  const worksheetBytes = archive[worksheetPath];

  if (!worksheetBytes) {
    throw new Error('Original loan export template is missing Sheet1.');
  }

  const worksheetXml = strFromU8(worksheetBytes);
  const headerRowMatch = worksheetXml.match(/<x:row r="1">[\s\S]*?<\/x:row>/);
  if (!headerRowMatch) {
    throw new Error('Original loan export template is missing its header row.');
  }

  const lastRow = Math.max(2, rows.length + 1);
  const sheetRows = `${headerRowMatch[0]}${buildSheetRowsXml(rows)}`;
  const validationRange = `F2:F${lastRow} H2:H${lastRow} J2:J${lastRow}`;
  const updatedWorksheetXml = worksheetXml
    .replace(/<x:sheetData>[\s\S]*?<\/x:sheetData>/, `<x:sheetData>${sheetRows}</x:sheetData>`)
    .replace(/sqref="F2:F50 H2:H50 J2:J50"/, `sqref="${validationRange}"`);

  archive[worksheetPath] = strToU8(updatedWorksheetXml);
  const output = zipSync(archive, { level: 6 });
  return output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength) as ArrayBuffer;
};

export const downloadOriginalLoanFormat = async (applications: LoanApplication[]) => {
  const templateResponse = await fetch(ORIGINAL_LOAN_TEMPLATE_URL);
  if (!templateResponse.ok) {
    throw new Error(`Original loan export template could not be loaded (${templateResponse.status}).`);
  }

  const templateBytes = await templateResponse.arrayBuffer();
  const workbookBytes = buildOriginalLoanExportWorkbook(applications, templateBytes);
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob(
    [workbookBytes],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DR_Loan_Application_${stamp}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
