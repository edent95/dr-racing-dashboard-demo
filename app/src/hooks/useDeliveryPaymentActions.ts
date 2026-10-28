/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Payments Sales collect after approval (owner meeting 2026-10-13: every
 * payment on its own line, with its receipt). Rows live in delivery_payments;
 * firestore.rules lets the file's handler or an Operations lead record one
 * and only ever void it.
 */

import { tr } from '../lib/i18n';
import type * as Repository from '../services/dashboardRepository';
import type { DeliveryPayment, DeliveryPaymentMethod, DeliveryStepKey, LoanApplication } from '../types';
import { canAttachDeliveryFiles } from '../utils/deliveryChecklist';
import type { StaffSession } from './useStaffSessionAuth';
import type { LoanApplicationAuditInput } from './useLoanApplicationActions';
import { malaysiaDate } from '../../shared/malaysiaDate.mjs';
import { newId } from '../utils/id';

export interface DeliveryPaymentDraft {
  id?: string;
  amount: number;
  method: DeliveryPaymentMethod;
  received_at: string;
  note: string;
  receiptDataUrl: string;
}

export interface DeliveryPaymentActionsDeps {
  currentStaff: StaffSession;
  applicationsRef: { current: LoanApplication[] };
  appendAuditLog: (input: LoanApplicationAuditInput) => void;
  triggerToast: (message: string, tone?: 'success' | 'warning' | 'error') => void;
  repository: Pick<typeof Repository, 'listDeliveryPayments' | 'createDeliveryPayment' | 'findDeliveryPaymentOnServer' | 'voidDeliveryPayment' | 'loadDeliveryReceipt' | 'createDeliveryAttachment' | 'listDeliveryAttachments' | 'loadDeliveryAttachment'>;
}

export type DeliveryPaymentRecordResult = DeliveryPayment | 'pending' | null;

export const canRecordDeliveryPayment = (staff: { role: string; name: string }, application: Pick<LoanApplication, 'handler_name'>) => (
  staff.role === 'Super Admin' || staff.role === 'Operations Manager' || application.handler_name === staff.name
);

export function useDeliveryPaymentActions({ currentStaff, applicationsRef, appendAuditLog, triggerToast, repository }: DeliveryPaymentActionsDeps) {
  const handleListDeliveryPayments = async (applicationId: string) => {
    try {
      return await repository.listDeliveryPayments(applicationId);
    } catch (error) {
      console.error('Failed to load delivery payments', error);
      triggerToast(tr('收款记录读取失败', 'Could not load the payments', 'Gagal memuatkan bayaran'), 'error');
      return null;
    }
  };

  const handleRecordDeliveryPayment = async (applicationId: string, draft: DeliveryPaymentDraft): Promise<DeliveryPaymentRecordResult> => {
    const application = applicationsRef.current.find((item) => item.id === applicationId);
    if (!application || !canRecordDeliveryPayment(currentStaff, application)) {
      triggerToast(tr('只有负责这单的 Sales 可以记收款', 'Only the Sales on this file can record a payment', 'Hanya Jualan fail ini boleh merekod bayaran'), 'error');
      return null;
    }
    const amount = Math.round((Number(draft.amount) || 0) * 100) / 100;
    if (!Number.isFinite(amount) || !(amount > 0) || amount > 1000000) {
      triggerToast(tr('请填写 0.01 至 1,000,000 的收款金额', 'Enter an amount from 0.01 to 1,000,000', 'Masukkan amaun antara 0.01 hingga 1,000,000'), 'error');
      return null;
    }
    // Keep an unresolved attempt across renders, modal closes and page reloads.
    const retryKey = `dr_racing_payment_attempt:${currentStaff.role}:${currentStaff.name}:${applicationId}`;
    let paymentId: string;
    try {
      paymentId = sessionStorage.getItem(retryKey) || newId(`PAY-${applicationId}`);
      sessionStorage.setItem(retryKey, paymentId);
    } catch {
      triggerToast(tr('浏览器无法保留收款重试记录，请允许网站储存后再试', 'Allow browser storage before recording a payment so retries remain safe', 'Benarkan storan pelayar sebelum merekod bayaran supaya cubaan semula selamat'), 'error');
      return null;
    }
    const now = new Date().toISOString();
    const payment: DeliveryPayment = {
      id: paymentId,
      application_id: applicationId,
      amount,
      method: draft.method,
      received_at: draft.received_at || malaysiaDate(now),
      recorded_by: currentStaff.name,
      recorded_by_role: currentStaff.role,
      recorded_at: now,
      note: draft.note.trim().slice(0, 500),
      receipt_document_id: '',
      voided_at: '',
      voided_by: '',
      void_reason: ''
    };
    const confirmSaved = (saved: DeliveryPayment) => {
      if (sessionStorage.getItem(retryKey) === paymentId) sessionStorage.removeItem(retryKey);
      try {
        appendAuditLog({
        action: 'RECORD_DELIVERY_PAYMENT',
        target_type: 'Loan Application',
        target_id: applicationId,
        target_label: application.applicant_name,
        changes: [
          { field: 'payment.amount', old_value: '', new_value: String(saved.amount) },
          { field: 'payment.method', old_value: '', new_value: saved.method },
          { field: 'payment.received_at', old_value: '', new_value: saved.received_at },
          ...(saved.receipt_document_id ? [{ field: 'payment.receipt', old_value: '', new_value: saved.receipt_document_id }] : [])
        ]
        });
      } catch (error) {
        console.error('Payment saved but audit log failed', error);
      }
      const replayed = saved.recorded_at !== payment.recorded_at;
      triggerToast(replayed
        ? tr(`已确认上次收款 RM ${saved.amount}${saved.voided_at ? '（已作废）' : ''}；本次没有新增，请核对记录`, `Previous payment of RM ${saved.amount}${saved.voided_at ? ' (voided)' : ''} confirmed; no new payment added. Review the record.`, `Bayaran terdahulu RM ${saved.amount} disahkan; tiada bayaran baharu. Semak rekod.`)
        : tr(`已记收款 RM ${amount}`, `Payment of RM ${amount} recorded`, `Bayaran RM ${amount} direkod`), replayed ? 'warning' : 'success');
      return saved;
    };
    try {
      return confirmSaved(await repository.createDeliveryPayment(payment, draft.receiptDataUrl));
    } catch (error) {
      console.error('Failed to record delivery payment', error);
    }
    try {
      const found = await repository.findDeliveryPaymentOnServer(applicationId, payment.id);
      if (found) return confirmSaved(found);
    } catch (error) {
      console.error('Could not confirm the delivery payment', error);
      triggerToast(tr('暂时无法确认收款是否已保存；重试会核对同一笔，不会重复记账', 'Could not confirm the payment yet; retry to check the same payment without adding it twice', 'Bayaran belum dapat disahkan; cuba semula untuk menyemak bayaran yang sama tanpa pendua'), 'warning');
      return 'pending';
    }
    triggerToast(tr('暂未找到已确认的收款；请重试核对同一笔', 'No confirmed payment found yet; retry to check the same payment', 'Bayaran yang disahkan belum ditemui; cuba semula untuk menyemak bayaran yang sama'), 'warning');
    return null;
  };

  const handleVoidDeliveryPayment = async (payment: DeliveryPayment, reason: string) => {
    const application = applicationsRef.current.find((item) => item.id === payment.application_id);
    if (!application || !canRecordDeliveryPayment(currentStaff, application) || payment.voided_at) {
      return null;
    }
    if (!reason.trim() || reason.trim().length > 500) {
      triggerToast(tr('请填写作废原因（最多 500 字）', 'Give a reason for voiding (up to 500 characters)', 'Beri sebab pembatalan (sehingga 500 aksara)'), 'error');
      return null;
    }
    try {
      const voided = await repository.voidDeliveryPayment(payment, currentStaff.name, reason);
      appendAuditLog({
        action: 'VOID_DELIVERY_PAYMENT',
        target_type: 'Loan Application',
        target_id: payment.application_id,
        target_label: application.applicant_name,
        changes: [
          { field: 'payment.amount', old_value: String(payment.amount), new_value: 'Voided' },
          { field: 'payment.void_reason', old_value: '', new_value: voided.void_reason }
        ]
      });
      triggerToast(tr('已作废这笔收款', 'Payment voided', 'Bayaran dibatalkan'), 'success');
      return voided;
    } catch (error) {
      console.error('Failed to void delivery payment', error);
      triggerToast(tr('暂时无法确认作废结果，请重试核对', 'Could not confirm the void yet; retry to check', 'Pembatalan belum dapat disahkan; cuba semula untuk menyemak'), 'error');
      return null;
    }
  };

  const handleLoadDeliveryReceipt = async (payment: DeliveryPayment) => {
    try {
      return await repository.loadDeliveryReceipt(payment);
    } catch (error) {
      console.error('Failed to load receipt', error);
      triggerToast(tr('收据读取失败，请重试', 'Could not open the receipt; try again', 'Resit gagal dibuka; cuba lagi'), 'error');
      return '';
    }
  };

  // Attachments: upload first (Storage + application_documents), then the caller
  // adds the id to the step through handleSaveDeliveryStep.
  const handleUploadDeliveryAttachment = async (
    applicationId: string,
    stepKey: DeliveryStepKey,
    file: { name: string; type: string; size: number; dataUrl: string }
  ) => {
    const application = applicationsRef.current.find((item) => item.id === applicationId);
    if (!application || !canAttachDeliveryFiles(currentStaff, application)) {
      triggerToast(tr('只有这单的 Sales、Admin 或 Super Admin 能上传文件', 'Only this file\'s Sales, Admin or Super Admin can upload files', 'Hanya Jualan, Pentadbir fail ini atau Super Admin boleh memuat naik fail'), 'error');
      return null;
    }
    try {
      const attachment = await repository.createDeliveryAttachment(application, `delivery_${stepKey}`, file, currentStaff.name);
      appendAuditLog({
        action: 'ATTACH_DELIVERY_FILE',
        target_type: 'Loan Application',
        target_id: applicationId,
        target_label: application.applicant_name,
        changes: [{ field: `delivery.${stepKey}.file`, old_value: '', new_value: attachment.file_name }]
      });
      return attachment;
    } catch (error) {
      console.error('Failed to upload delivery attachment', error);
      triggerToast(tr('文件没有上传成功,请再试一次', 'The file was not uploaded; try again', 'Fail tidak dimuat naik; cuba lagi'), 'error');
      return null;
    }
  };

  const handleListDeliveryAttachments = async (applicationId: string, ids: string[]) => {
    try {
      return await repository.listDeliveryAttachments(applicationId, ids);
    } catch (error) {
      console.error('Failed to load delivery attachments', error);
      return [];
    }
  };

  const handleLoadDeliveryAttachment = async (attachment: Repository.DeliveryAttachment) => {
    try {
      return await repository.loadDeliveryAttachment(attachment);
    } catch (error) {
      console.error('Failed to open delivery attachment', error);
      triggerToast(tr('文件打不开', 'Could not open the file', 'Tidak dapat membuka fail'), 'error');
      return '';
    }
  };

  return {
    handleListDeliveryPayments,
    handleRecordDeliveryPayment,
    handleVoidDeliveryPayment,
    handleLoadDeliveryReceipt,
    handleUploadDeliveryAttachment,
    handleListDeliveryAttachments,
    handleLoadDeliveryAttachment
  };
}
