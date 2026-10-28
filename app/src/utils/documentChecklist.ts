/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CustomerDocumentChecklistItem, CustomerDocumentKey, CustomerDocumentStatus, LoanApplication } from '../types';

export const CUSTOMER_DOCUMENT_UPLOAD_LIMITS: Record<CustomerDocumentKey, number> = {
  ic: 2,
  payslip: 3,
  bank_statement: 3,
  vehicle_geran: 1,
  guarantor_doc: 1
};

export function getCustomerDocumentUploadLimit(documentKey: CustomerDocumentKey): number {
  return CUSTOMER_DOCUMENT_UPLOAD_LIMITS[documentKey];
}

export const CUSTOMER_DOCUMENT_REQUIREMENTS: Array<{
  key: CustomerDocumentKey;
  label: string;
  helper: string;
  defaultStatus: CustomerDocumentStatus;
}> = [
  {
    key: 'ic',
    label: 'IC',
    helper: 'Customer identity document.',
    defaultStatus: 'Missing'
  },
  {
    key: 'payslip',
    label: 'Payslip',
    helper: 'Latest salary document.',
    defaultStatus: 'Missing'
  },
  {
    key: 'bank_statement',
    label: 'Supporting Doc',
    helper: 'Additional supporting document requested by staff.',
    defaultStatus: 'Not Required'
  },
  {
    key: 'vehicle_geran',
    label: 'Vehicle Geran',
    helper: 'Used-motor registration document.',
    defaultStatus: 'Not Required'
  }
];

/** Only the answers that name a checklist document (IC, Payslip, Bank Statement / Supporting, Vehicle Geran). */
export function matchBankRequestedDocumentKey(nextAction?: string): CustomerDocumentKey | undefined {
  const normalizedAction = (nextAction || '').trim().toLowerCase();

  if (normalizedAction.includes('payslip')) {
    return 'payslip';
  }
  if (normalizedAction.includes('bank statement') || normalizedAction.includes('supporting')) {
    return 'bank_statement';
  }
  if (normalizedAction.includes('geran') || normalizedAction.includes('registration card')) {
    return 'vehicle_geran';
  }
  if (/\bic\b/.test(normalizedAction)) {
    return 'ic';
  }

  return undefined;
}

/**
 * The checklist item a bank document request opens. A staff-typed answer that names no
 * checklist document ("EPF statement", "guarantor letter") is tracked as the Supporting Doc,
 * so "+ Add new answer" in Pending Document / Follow Up Reject Bank can always be saved.
 */
export function getBankRequestedDocumentKey(nextAction?: string): CustomerDocumentKey | undefined {
  const matchedKey = matchBankRequestedDocumentKey(nextAction);
  if (matchedKey) {
    return matchedKey;
  }

  return (nextAction || '').trim() ? 'bank_statement' : undefined;
}

export function getUploadedDocumentChecklistKey(
  application: Pick<LoanApplication, 'document_checklist' | 'payslip_documents'> & Partial<Pick<LoanApplication, 'purchase_method' | 'vehicle_condition'>>,
  document: LoanApplication['payslip_documents'][number]
): CustomerDocumentKey {
  const hasExplicitVehicleGeran = (application.payslip_documents || []).some((item) => (
    item.document_key === 'vehicle_geran'
  ));
  const legacyBankStatementIsGeran = application.vehicle_condition === 'Used'
    && !hasExplicitVehicleGeran
    && (
      (application.document_checklist || []).some((item) => (
        item.key === 'bank_statement' && item.label === 'Vehicle Geran'
      ))
      || (application.document_checklist || []).some((item) => (
        item.key === 'vehicle_geran' && item.status === 'Received'
      ))
      || (
        application.purchase_method === 'Cash'
        && (application.document_checklist || []).length === 0
      )
    );

  if (legacyBankStatementIsGeran && document.document_key === 'bank_statement') {
    return 'vehicle_geran';
  }

  return document.document_key || 'payslip';
}

export function normalizeDocumentChecklist(
  application: Pick<LoanApplication, 'document_checklist' | 'payslip_documents'> & Partial<Pick<LoanApplication, 'purchase_method' | 'vehicle_condition'>>
): CustomerDocumentChecklistItem[] {
  const storedByKey = new Map((application.document_checklist || []).map((item) => [item.key, item]));
  const documents = application.payslip_documents || [];
  const legacyGeranChecklistItem = application.vehicle_condition === 'Used'
    && storedByKey.get('bank_statement')?.label === 'Vehicle Geran'
    ? storedByKey.get('bank_statement')
    : undefined;
  const hasUploadForKey = (key: CustomerDocumentKey) => documents.some((document) => (
    getUploadedDocumentChecklistKey(application, document) === key
  ));
  const latestUploadAtForKey = (key: CustomerDocumentKey) => Math.max(
    0,
    ...documents
      .filter((document) => getUploadedDocumentChecklistKey(application, document) === key)
      .map((document) => new Date(document.uploaded_at || 0).getTime())
      .filter(Number.isFinite)
  );

  return CUSTOMER_DOCUMENT_REQUIREMENTS
    .filter((requirement) => (
      requirement.key !== 'vehicle_geran' || application.vehicle_condition === 'Used'
    ))
    .map((requirement) => {
    const stored = requirement.key === 'vehicle_geran'
      ? storedByKey.get(requirement.key) || legacyGeranChecklistItem
      : storedByKey.get(requirement.key);
    const hasUpload = hasUploadForKey(requirement.key);
    const isCashPayslip = requirement.key === 'payslip' && application.purchase_method === 'Cash';
    const isUsedMotorGeran = requirement.key === 'vehicle_geran'
      && application.vehicle_condition === 'Used';
    const isSupportingDocument = requirement.key === 'bank_statement';
    const isNonUsedGeran = requirement.key === 'vehicle_geran' && !isUsedMotorGeran;
    const defaultStatus = isCashPayslip || isSupportingDocument || isNonUsedGeran
      ? 'Not Required'
      : isUsedMotorGeran
        ? 'Missing'
      : requirement.defaultStatus;
    const storedStatus = isUsedMotorGeran
      && stored?.status === 'Not Required'
      && !stored.updated_by
      ? 'Missing'
      : stored?.status;
    const storedUpdatedAt = new Date(stored?.updated_at || 0).getTime();
    const wasMarkedMissingAfterLatestUpload = storedStatus === 'Missing'
      && Number.isFinite(storedUpdatedAt)
      && storedUpdatedAt > latestUploadAtForKey(requirement.key);
    const status = wasMarkedMissingAfterLatestUpload
      ? 'Missing'
      : hasUpload
      ? 'Received'
      : storedStatus === 'Missing'
        ? 'Missing'
      : isCashPayslip || isSupportingDocument || isNonUsedGeran
        ? storedStatus === 'Not Required' ? 'Not Required' : defaultStatus
      : storedStatus === 'Received'
        ? defaultStatus
        : storedStatus || defaultStatus;

    return {
      key: requirement.key,
      label: requirement.label,
      status,
      note: stored?.note || '',
      updated_at: stored?.updated_at || '',
      updated_by: stored?.updated_by || ''
    };
    });
}

export function getMissingDocumentLabels(
  application: Pick<LoanApplication, 'document_checklist' | 'payslip_documents'> & Partial<Pick<LoanApplication, 'purchase_method' | 'vehicle_condition'>>
) {
  // A cash file needs no payslip or supporting document, even when the
  // checklist still holds a "Missing" mark from when it was a loan. The
  // drawer hides both rows for cash, so they must not block Documents Ready.
  const isCash = application.purchase_method === 'Cash';

  return normalizeDocumentChecklist(application)
    .filter((item) => item.status === 'Missing')
    .filter((item) => !isCash || (item.key !== 'payslip' && item.key !== 'bank_statement'))
    .map((item) => item.label);
}
