/**
 * Loan application actions: open / claim / assign, the full application save
 * and inline edits, activity comments, customer profile and missing-info
 * updates, cash acceptance and Add Customer. Moved verbatim from App.tsx;
 * every value the handlers used from App's closure, including the Firestore
 * calls and their conflict error classes, is now an explicit dependency under
 * its original name.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type * as Repository from '../services/dashboardRepository';
import type { DashboardState } from '../services/dashboardRepository';
import { tr } from '../lib/i18n';
import { isAwaitingHandlerAssignment } from '../../shared/staffLinkQueue.mjs';
import { BankApplication, CustomerActivityEntry, DealFinance, ErrorCodeDefinition, getLoanPendingAction, getLoanPendingWith, LoanApplication, LoanPendingAction, LoanPendingWith, LoanStatus, LoanWorkflowAction, NotificationItem, PayslipDocument, PurchaseMethod, RejectNextStepType, RoleAccountRole, VehicleCondition } from '../types';
import { getMissingApplicationInformationLabels } from '../utils/applicationCompleteness';
import { getAdminBankFollowUpDueIso } from '../utils/bankFollowUp';
import { canCancelApplication, canStaffCancelApplication, withdrawBankApplications } from '../utils/cashApplicationCancel';
import { createEmptyCustomerEmploymentDetails as createEmptyEmploymentDetails, createEmptyCustomerPersonalInfo as createEmptyPersonalInfo, createEmptyCustomerPreferences as createEmptyPreferences, normalizeEmergencyContacts, normalizeCustomerEmploymentDetails as normalizeEmploymentDetails, normalizeCustomerPersonalInfo as normalizePersonalInfo, normalizeCustomerPreferences as normalizePreferences } from '../utils/customerApplicationForm';
import { isSettledDealFinance } from '../utils/dealFinance';
import { getBankRequestedDocumentKey, getMissingDocumentLabels, normalizeDocumentChecklist } from '../utils/documentChecklist';
import { replaceItemById, rollbackItemById } from '../utils/latestListPatch';
import { getLoanWorkflowActionLabel, getLoanWorkflowUndoAvailability } from '../utils/loanWorkflowUndo';
import { getApplicationRejectCodes, normalizeRejectCodes } from '../utils/rejectCodes';
import { hasAdminWorkAccess, isOperationsLead } from '../utils/staffRoles';
import { buildLoanTaskCompletionDescriptors, createTaskCompletionAuditChanges } from '../utils/taskCompletionAnalytics';
import { createNotificationId, normalizeNotificationList, uniqueRoles, uniqueStrings } from './useDashboardNotifications';
import type { AuditLogEntry, FinanceProfile, RoleAccount, TagNormalizationRule, VehicleCatalogItem, VehiclePurchaseOption } from '../types';
import type { useDashboardNotifications } from './useDashboardNotifications';
import type { useDashboardPersistence } from './useDashboardPersistence';
import type { AppPage } from './useNavigationState';
import type { StaffSession, useStaffSessionAuth } from './useStaffSessionAuth';
import { isApplicationOpenForNewBank, type BankPageRequest } from '../utils/loanTableBankColumns';
import { canRecordDeliveryStep, createEmptyDeliveryChecklist, createEmptyDeliveryStepRecord, getDeliveryStep } from '../utils/deliveryChecklist';
import type { DeliveryStepKey, DeliveryStepRecord, UnitExchange } from '../types';

type DetectVehicleFromModel = (model: string) => { vehicle_tag: string; vehicle_brand: string };

export interface LoanApplicationAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface LoanApplicationActionsDeps {
  currentStaff: StaffSession;
  AdminApplicationClaimConflictError: typeof Repository.AdminApplicationClaimConflictError;
  appendAuditLog: (input: LoanApplicationAuditInput) => void;
  applications: LoanApplication[];
  applicationsRef: MutableRefObject<LoanApplication[]>;
  assignCustomerHandlerThroughServer: typeof Repository.assignCustomerHandlerThroughServer;
  canEditLoanApplicationInformation: (application: LoanApplication | null | undefined) => boolean;
  claimUnassignedAdminApplicationFromFirebase: typeof Repository.claimUnassignedAdminApplicationFromFirebase;
  CollectionItemVersionConflictError: typeof Repository.CollectionItemVersionConflictError;
  createAuditChanges: <Before extends object, After extends object>(before: Before, after: After) => AuditLogEntry['changes'];
  createCustomerActivityId: () => string;
  createStatusActivityEntry: (staff: StaffSession, fromStatus: LoanStatus, toStatus: LoanStatus) => CustomerActivityEntry;
  createWorkflowActivityEntry: (staff: StaffSession, body: string, taggedStaffNames?: string[], taggedRoles?: RoleAccountRole[]) => CustomerActivityEntry;
  detectVehicleFromModel: (model: string, catalog?: VehicleCatalogItem[], rules?: TagNormalizationRule[]) => ReturnType<DetectVehicleFromModel>;
  errorCodeIssueMap: Record<string, ErrorCodeDefinition>;
  getInitialAdminReviewDueIso: (submittedAt: string) => string;
  handleMarkNotificationRead: ReturnType<typeof useDashboardNotifications>['handleMarkNotificationRead'];
  hydrateApplications: (list: LoanApplication[], catalog?: VehicleCatalogItem[], rules?: TagNormalizationRule[], initialApplications?: LoanApplication[]) => LoanApplication[];
  isApplicationOwnedByCurrentStaff: (application: LoanApplication) => boolean;
  navigateToPageIfAllowed: (navKey: string, page: AppPage) => unknown;
  normalizeActivityThread: (thread?: CustomerActivityEntry[]) => CustomerActivityEntry[];
  normalizeMoneyAmount: (value: unknown) => number;
  normalizeVehicleCatalogList: (list: VehicleCatalogItem[], profiles?: FinanceProfile[]) => VehicleCatalogItem[];
  normalizeVehicleOptions: (app: LoanApplication, catalog?: VehicleCatalogItem[], rules?: TagNormalizationRule[]) => VehiclePurchaseOption[];
  notifications: NotificationItem[];
  preserveLoadedApplicationFileData: (application: LoanApplication, currentApplication?: LoanApplication) => LoanApplication;
  reloadDashboard: ReturnType<typeof useStaffSessionAuth>['reloadDashboard'];
  roleAccounts: RoleAccount[];
  saveDealFinanceWithStockReservationToFirebase: typeof Repository.saveDealFinanceWithStockReservationToFirebase;
  selectedApplication: LoanApplication | null;
  setActivityThreadScrollRequest: Dispatch<SetStateAction<number>>;
  setAddBankRequest: Dispatch<SetStateAction<number>>;
  setBankPageRequest: Dispatch<SetStateAction<BankPageRequest | null>>;
  setApplications: Dispatch<SetStateAction<LoanApplication[]>>;
  setDocumentChecklistScrollRequest: Dispatch<SetStateAction<number>>;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setIsNotificationCenterOpen: Dispatch<SetStateAction<boolean>>;
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>;
  setOpenBankApplicationsRequest: Dispatch<SetStateAction<number>>;
  setSelectedApplication: Dispatch<SetStateAction<LoanApplication | null>>;
  setShowAllApplications: Dispatch<SetStateAction<boolean>>;
  tagNormalizationRules: TagNormalizationRule[];
  triggerToast: (message: string, tone?: 'success' | 'warning' | 'error') => void;
  updateApplicationsState: (list: LoanApplication[]) => Promise<boolean>;
  updateVehicleCatalogState: (list: VehicleCatalogItem[]) => Promise<boolean>;
  vehicleCatalog: VehicleCatalogItem[];
  writeLocalDashboardValue: ReturnType<typeof useDashboardPersistence>['writeLocalDashboardValue'];
}

export function useLoanApplicationActions({
  currentStaff,
  AdminApplicationClaimConflictError,
  appendAuditLog,
  applications,
  applicationsRef,
  assignCustomerHandlerThroughServer,
  canEditLoanApplicationInformation,
  claimUnassignedAdminApplicationFromFirebase,
  CollectionItemVersionConflictError,
  createAuditChanges,
  createCustomerActivityId,
  createStatusActivityEntry,
  createWorkflowActivityEntry,
  detectVehicleFromModel,
  errorCodeIssueMap,
  getInitialAdminReviewDueIso,
  handleMarkNotificationRead,
  hydrateApplications,
  isApplicationOwnedByCurrentStaff,
  navigateToPageIfAllowed,
  normalizeActivityThread,
  normalizeMoneyAmount,
  normalizeVehicleCatalogList,
  normalizeVehicleOptions,
  notifications,
  preserveLoadedApplicationFileData,
  reloadDashboard,
  roleAccounts,
  saveDealFinanceWithStockReservationToFirebase,
  selectedApplication,
  setActivityThreadScrollRequest,
  setAddBankRequest,
  setBankPageRequest,
  setApplications,
  setDocumentChecklistScrollRequest,
  setIsDrawerOpen,
  setIsNotificationCenterOpen,
  setNotifications,
  setOpenBankApplicationsRequest,
  setSelectedApplication,
  setShowAllApplications,
  tagNormalizationRules,
  triggerToast,
  updateApplicationsState,
  updateVehicleCatalogState,
  vehicleCatalog,
  writeLocalDashboardValue
}: LoanApplicationActionsDeps) {
  // Claim-on-open: the first Active Admin whose Firestore transaction commits
  // becomes the owner. The local state changes only after that commit, so two
  // browsers can never both display themselves as the winner.
  const maybeClaimUnassignedLoan = async (app: LoanApplication) => {
    if (
      currentStaff.role !== 'Admin' ||
      (app.admin_owner_name || '') !== '' ||
      getLoanPendingWith(app) !== 'Admin'
    ) {
      return;
    }

    try {
      // The repository returns the SERVER document with the claim applied (not
      // this browser's possibly stale copy) and caches exactly that as synced.
      // Normalize it like a realtime snapshot and patch only this row into the
      // latest list, so edits other staff made during the await survive.
      const serverClaimedApplication = await claimUnassignedAdminApplicationFromFirebase(app, currentStaff.name);
      const latestApplications = applicationsRef.current;
      const currentApplication = latestApplications.find((application) => application.id === app.id);
      const claimedApplication = preserveLoadedApplicationFileData(
        hydrateApplications([serverClaimedApplication], vehicleCatalog, tagNormalizationRules)[0],
        currentApplication || app
      );
      const updated = replaceItemById(latestApplications, claimedApplication, { insertIfMissing: true });

      applicationsRef.current = updated;
      setApplications(updated);
      writeLocalDashboardValue('applications', updated);
      setSelectedApplication((current) => (
        current && current.id === app.id ? preserveLoadedApplicationFileData(claimedApplication, current) : current
      ));
      appendAuditLog({
        action: 'CLAIM_LOAN_ADMIN',
        target_type: 'Loan Application',
        target_id: app.id,
        target_label: app.applicant_name,
        changes: [{ field: 'admin_owner_name', old_value: '', new_value: currentStaff.name }],
        stateOverrides: { applications: updated }
      });
    } catch (error) {
      console.warn('Admin application claim failed.', error);
      setIsDrawerOpen(false);
      setSelectedApplication(null);
      triggerToast(
        error instanceof AdminApplicationClaimConflictError
          ? tr('这份申请已被另一位 Admin 认领。', 'Another Admin already claimed this application.', 'Permohonan ini telah dituntut oleh Pentadbir lain.')
          : tr('无法认领这份申请；它可能刚被另一位 Admin 认领。正在重新载入。', 'Could not claim this application; another Admin may have just claimed it. Reloading.', 'Tidak dapat menuntut permohonan ini; Pentadbir lain mungkin baru sahaja menuntutnya. Memuat semula.'),
        'error'
      );
      reloadDashboard();
    }
  };

  // Row selection handler
  const handleSelectRow = (app: LoanApplication) => {
    setSelectedApplication(app);
    setIsDrawerOpen(true);
    void maybeClaimUnassignedLoan(app);
  };

  const handleAssignApplicationAdmin = async (applicationId: string, adminName: string) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以重新指派 Admin 任务。', 'Only Super Admin can reassign Admin tasks.', 'Hanya Pentadbir Super boleh menetapkan semula tugasan Pentadbir.'), 'error');
      return;
    }

    const application = applications.find((item) => item.id === applicationId);
    const targetAdmin = roleAccounts.find((account) => (
      account.status === 'Active' &&
      account.role === 'Admin' &&
      account.name === adminName
    ));
    if (!application || !targetAdmin) {
      triggerToast(tr('找不到申请或目标 Active Admin。', 'Application or target Active Admin was not found.', 'Permohonan atau Pentadbir aktif sasaran tidak ditemui.'), 'error');
      return;
    }
    if (application.admin_owner_name === targetAdmin.name) {
      return;
    }

    const previousOwner = application.admin_owner_name || '';
    const reassignedApplication: LoanApplication = {
      ...application,
      admin_owner_name: targetAdmin.name
    };
    const updated = applications.map((item) => (
      item.id === applicationId ? reassignedApplication : item
    ));

    updateApplicationsState(updated);
    setSelectedApplication((current) => (
      current?.id === applicationId ? reassignedApplication : current
    ));
    appendAuditLog({
      action: 'REASSIGN_LOAN_ADMIN',
      target_type: 'Loan Application',
      target_id: application.id,
      target_label: application.applicant_name,
      changes: [{ field: 'admin_owner_name', old_value: previousOwner, new_value: targetAdmin.name }],
      stateOverrides: { applications: updated }
    });
    triggerToast(tr(
      `已把 ${application.applicant_name} 指派给 ${targetAdmin.name}。`,
      `${application.applicant_name} was assigned to ${targetAdmin.name}.`,
      `${application.applicant_name} telah ditugaskan kepada ${targetAdmin.name}.`
    ));
  };

  const handleOpenApplicationTarget = (
    application: LoanApplication,
    scrollToActivityThread = false,
    scrollToDocumentChecklist = false,
    openAddBank = false,
    openBankApplications = false
  ) => {
    if (!isApplicationOwnedByCurrentStaff(application)) {
      return;
    }

    if (isOperationsLead(currentStaff.role)) {
      setShowAllApplications(true);
    }

    if (!navigateToPageIfAllowed('customers', 'customers')) {
      return;
    }

    if (scrollToActivityThread) {
      setActivityThreadScrollRequest((current) => current + 1);
    }

    if (scrollToDocumentChecklist) {
      setDocumentChecklistScrollRequest((current) => current + 1);
    }

    if (openAddBank) {
      setAddBankRequest((current) => current + 1);
    }

    if (openBankApplications) {
      setOpenBankApplicationsRequest((current) => current + 1);
    }

    handleSelectRow(application);
  };

  // The bank page: a Loan Applications bank cell or a Home bank task opens it, optionally on one bank and decision.
  const handleOpenBankPage = (
    application: LoanApplication,
    target: Omit<BankPageRequest, 'id'> = {}
  ) => {
    if (!isApplicationOwnedByCurrentStaff(application)) {
      return;
    }

    if (isOperationsLead(currentStaff.role)) {
      setShowAllApplications(true);
    }

    if (!navigateToPageIfAllowed('customers', 'customers')) {
      return;
    }

    setBankPageRequest((current) => ({ ...target, id: (current?.id || 0) + 1 }));
    handleSelectRow(application);
  };

  const handleOpenNotificationTarget = (notification: NotificationItem) => {
    handleMarkNotificationRead(notification.id);
    setIsNotificationCenterOpen(false);

    if (notification.target_type === 'mission') {
      navigateToPageIfAllowed('taskInbox', 'taskInbox');
      return;
    }

    if (notification.target_type === 'raw_lead') {
      navigateToPageIfAllowed('taskInbox', 'taskInbox');
      return;
    }

    if (notification.target_type === 'calendar_note') {
      navigateToPageIfAllowed('calendar', 'calendar');
      return;
    }

    const targetApplication = applications.find((application) => application.id === notification.target_id);

    if (targetApplication) {
      handleOpenApplicationTarget(targetApplication, true);
      return;
    }

    navigateToPageIfAllowed('customers', 'customers');
    triggerToast(`Target not found: ${notification.target_label}`);
  };

  // Save changes handler from the drawer
  const summarizeBankApplications = (bankApplications: BankApplication[]) => {
    if (bankApplications.length === 0) {
      return 'No bank applications';
    }

    return bankApplications
      .map((bank) => [
        bank.bank_name || 'Unnamed Bank',
        `Round ${bank.round_no}`,
        bank.status,
        bank.reject_reason || bank.status_reason
          ? `Reason ${bank.reject_reason || bank.status_reason}`
          : '',
        bank.next_action ? `Next ${bank.next_action}` : '',
        bank.reject_code ? `Reject ${bank.reject_code}` : '',
        bank.offer_amount ? `Offer ${bank.offer_amount}` : ''
      ].filter(Boolean).join(' / '))
      .join(' | ');
  };

  const summarizePayslipDocuments = (documents: PayslipDocument[]) => {
    if (documents.length === 0) {
      return 'No payslip documents';
    }

    return documents.map((document) => document.file_name).join(', ');
  };

  const handleSaveApplication = async (
    id: string,
    updatedStatus: LoanStatus,
    updatedRemarks: string,
    updatedErrorCode: string,
    updatedErrorCodes: string[],
    updatedPayslipDocuments: PayslipDocument[],
    updatedBankApplications: BankApplication[],
    updatedApplicationInfo: Pick<LoanApplication, 'applicant_name' | 'phone_no' | 'ic_no' | 'vehicle_plate' | 'vehicle_model' | 'vehicle_tag' | 'vehicle_brand' | 'vehicle_condition' | 'purchase_method' | 'vehicle_options' | 'handler_name' | 'handler_role' | 'submitted_at' | 'customer_call_back_at' | 'document_checklist' | 'personal_info' | 'emergency_contacts' | 'employment_details' | 'preferences'>,
    workflowAction?: LoanWorkflowAction,
    workflowUndoReason = ''
  ) => {
    // Latest list, not the render-time closure: a caller may invoke this after
    // its own await, and the realtime listener may have advanced other rows.
    const previous = applicationsRef.current.find((app) => app.id === id);

    if (!previous) {
      triggerToast(tr('找不到这份贷款申请', 'Loan application not found', "Permohonan pinjaman tidak ditemui"), 'error');
      return false;
    }

    const now = new Date().toISOString();
    const canManageBankWorkflow = hasAdminWorkAccess(currentStaff.role);
    const canHandleSalesAction = isOperationsLead(currentStaff.role) || previous.handler_name === currentStaff.name;
    const isCashPurchase = previous.purchase_method === 'Cash';
    // A cancellation writes only workflow fields (Rules pin the changed keys),
    // so unsaved drawer edits are ignored rather than silently saved with it.
    const isCancelAction = workflowAction === 'CANCEL_APPLICATION';
    const canEditApplicationInformation = !isCancelAction && canEditLoanApplicationInformation(previous);
    const canManageApplicationDocuments = !isCancelAction && (canManageBankWorkflow || previous.handler_name === currentStaff.name);
    const nextRemarks = canEditApplicationInformation ? updatedRemarks : previous.remarks;
    const nextPayslipDocuments = canManageApplicationDocuments
      ? updatedPayslipDocuments
      : previous.payslip_documents || [];
    let nextDocumentChecklist = normalizeDocumentChecklist({
      document_checklist: canManageApplicationDocuments
        ? updatedApplicationInfo.document_checklist || previous.document_checklist || []
        : previous.document_checklist || [],
      payslip_documents: nextPayslipDocuments,
      purchase_method: canEditApplicationInformation
        ? updatedApplicationInfo.purchase_method || previous.purchase_method
        : previous.purchase_method,
      vehicle_condition: canEditApplicationInformation
        ? updatedApplicationInfo.vehicle_condition || previous.vehicle_condition
        : previous.vehicle_condition
    });
    const missingDocumentLabels = getMissingDocumentLabels({
      ...previous,
      document_checklist: nextDocumentChecklist,
      payslip_documents: nextPayslipDocuments,
      purchase_method: canEditApplicationInformation
        ? updatedApplicationInfo.purchase_method || previous.purchase_method
        : previous.purchase_method,
      vehicle_condition: canEditApplicationInformation
        ? updatedApplicationInfo.vehicle_condition || previous.vehicle_condition
        : previous.vehicle_condition
    });
    const missingApplicationInformationLabels = getMissingApplicationInformationLabels({
      ...previous,
      ...(canEditApplicationInformation ? updatedApplicationInfo : {})
    });
    let nextStatus = currentStaff.role === 'Super Admin' ? updatedStatus : previous.status;
    let nextBankApplications = canManageBankWorkflow ? updatedBankApplications : previous.bank_applications || [];
    let pendingWith: LoanPendingWith = getLoanPendingWith(previous);
    let pendingAction: LoanPendingAction = getLoanPendingAction(previous);
    let pendingSince = previous.pending_since || previous.submitted_at || now;
    let actionDueAt = previous.action_due_at || '';
    let adminOwnerName = previous.admin_owner_name || '';
    let activeBankApplicationId = previous.active_bank_application_id || '';
    let workflowActivityBody = '';
    let workflowTaggedStaffNames: string[] = [];
    let workflowTaggedRoles: RoleAccountRole[] = [];
    let nextWorkflowUndo = previous.workflow_undo;
    let shouldRestoreWorkflowFinance = false;
    let restoredWorkflowFinance: DealFinance | undefined;

    const setWorkflow = (
      status: LoanStatus,
      owner: LoanPendingWith,
      action: LoanPendingAction,
      dueAt = '',
      body = ''
    ) => {
      nextStatus = status;
      pendingWith = owner;
      pendingAction = action;
      pendingSince = now;
      actionDueAt = dueAt;
      workflowActivityBody = body;
    };

    const stageWorkflowUndo = (action: Exclude<LoanWorkflowAction, 'SUBMIT_TO_BANK' | 'CANCEL_APPLICATION' | 'UNDO_LAST_ACTION'>) => {
      nextWorkflowUndo = {
        action,
        actor_name: currentStaff.name,
        actor_role: currentStaff.role,
        performed_at: now,
        snapshot: {
          status: previous.status,
          admin_owner_name: previous.admin_owner_name || '',
          pending_with: getLoanPendingWith(previous),
          pending_action: getLoanPendingAction(previous),
          pending_since: previous.pending_since || previous.submitted_at,
          action_due_at: previous.action_due_at || '',
          active_bank_application_id: previous.active_bank_application_id || '',
          error_code: previous.error_code || '',
          error_codes: getApplicationRejectCodes(previous),
          bank_applications: (previous.bank_applications || []).map((bank) => ({ ...bank })),
          ...(previous.deal_finance ? { deal_finance: { ...previous.deal_finance } } : {})
        }
      };
    };

    if (workflowAction === 'UNDO_LAST_ACTION') {
      const undoAvailability = getLoanWorkflowUndoAvailability(previous, currentStaff.name, currentStaff.role);
      const checkpoint = undoAvailability.checkpoint;
      const reason = workflowUndoReason.trim();
      if (!checkpoint || !undoAvailability.allowed) {
        const financialMessage = undoAvailability.blockedReason === 'financial_activity';
        triggerToast(tr(
          financialMessage ? '这一步已产生财务、库存或佣金影响，不能直接撤回。请先在 Finance Center 完成冲销。' : '这已经不是可撤回的最后一步，或你没有撤回权限。',
          financialMessage ? 'This step already has finance, stock, or commission impact. Reverse it in Finance Center first.' : 'This is no longer the last reversible action, or you do not have permission to undo it.',
          financialMessage ? 'Langkah ini sudah memberi kesan kepada kewangan, stok atau komisen. Balikkan di Pusat Kewangan dahulu.' : 'Ini bukan lagi tindakan terakhir yang boleh dibatalkan, atau anda tiada kebenaran.'
        ), 'error');
        return false;
      }
      if (reason.length < 3) {
        triggerToast(tr('请填写撤回原因（至少 3 个字）', 'Enter an undo reason of at least 3 characters', "Masukkan sebab pembatalan sekurang-kurangnya 3 aksara"), 'error');
        return false;
      }

      const snapshot = checkpoint.snapshot;
      nextStatus = snapshot.status;
      adminOwnerName = snapshot.admin_owner_name;
      pendingWith = snapshot.pending_with;
      pendingAction = snapshot.pending_action;
      pendingSince = snapshot.pending_since;
      actionDueAt = snapshot.action_due_at;
      activeBankApplicationId = snapshot.active_bank_application_id;
      nextBankApplications = snapshot.bank_applications.map((bank) => ({ ...bank }));
      shouldRestoreWorkflowFinance = true;
      restoredWorkflowFinance = snapshot.deal_finance ? { ...snapshot.deal_finance } : undefined;
      nextWorkflowUndo = undefined;
      workflowTaggedStaffNames = pendingWith === 'Handler' ? [previous.handler_name] : [];
      workflowTaggedRoles = pendingWith === 'Admin' ? ['Admin', 'Super Admin'] : [];
      workflowActivityBody = `${currentStaff.name} undid ${getLoanWorkflowActionLabel(checkpoint.action)}. Reason: ${reason}`;
    } else if (workflowAction === 'NOTIFY_ADMIN') {
      if (!canHandleSalesAction || getLoanPendingAction(previous) !== 'Complete Application') {
        triggerToast(tr('只有负责这个客户的 Sales 可以通知 Admin', 'Only the assigned Sales handler can notify Admin', "Hanya pengendali Jualan yang ditugaskan boleh memaklumkan Pentadbir"), 'error');
        return false;
      }
      const incompleteLabels = [
        ...missingApplicationInformationLabels,
        ...missingDocumentLabels.map((label) => `Document: ${label}`)
      ];
      if (incompleteLabels.length > 0) {
        triggerToast(tr(`请先补齐：${incompleteLabels.join('、')}`, `Complete first: ${incompleteLabels.join(', ')}`, `Lengkapkan dahulu: ${incompleteLabels.join(', ')}`), 'error');
        return false;
      }

      stageWorkflowUndo('NOTIFY_ADMIN');
      // A new Admin review always enters the shared pool. Any Admin owner
      // carried by an older short link is attribution metadata only and must
      // not route the task to one person before claim-on-open.
      adminOwnerName = '';
      workflowTaggedRoles = ['Admin', 'Super Admin'];
      setWorkflow(
        LoanStatus.NEW,
        'Admin',
        'Review Application',
        getInitialAdminReviewDueIso(now),
        `Application details were completed by ${currentStaff.name} and sent for Admin review.`
      );
    } else if (workflowAction === 'REQUEST_MISSING_DOCUMENTS') {
      if (!canManageBankWorkflow) {
        triggerToast(tr('只有 Admin 可以要求补资料', 'Only Admin can request missing documents', "Hanya Pentadbir boleh meminta dokumen yang hilang"), 'error');
        return false;
      }
      if (missingDocumentLabels.length === 0) {
        triggerToast(tr('请先把缺少的文件标记为 Missing', 'Mark at least one required document as Missing first', "Tandakan sekurang-kurangnya satu dokumen sebagai Hilang dahulu"), 'error');
        return false;
      }

      stageWorkflowUndo('REQUEST_MISSING_DOCUMENTS');
      adminOwnerName = previous.admin_owner_name || currentStaff.name;
      workflowTaggedStaffNames = [previous.handler_name];
      setWorkflow(
        LoanStatus.PENDING,
        'Handler',
        'Provide Documents',
        '',
        `${isCashPurchase ? 'Cash purchase' : 'Loan'} missing documents requested: ${missingDocumentLabels.join(', ')}.`
      );
    } else if (workflowAction === 'APPROVE_CASH_PURCHASE') {
      if (!canManageBankWorkflow) {
        triggerToast(tr('只有 Admin 可以批准现金申请', 'Only Admin can approve a cash purchase', "Hanya Pentadbir boleh meluluskan pembelian tunai"), 'error');
        return false;
      }
      if (!isCashPurchase) {
        triggerToast(tr('这不是现金购买申请', 'This is not a cash purchase application', "Ini bukan permohonan pembelian tunai"), 'error');
        return false;
      }
      const incompleteCashLabels = [
        ...missingApplicationInformationLabels,
        ...missingDocumentLabels.map((label) => `Document: ${label}`)
      ];
      if (incompleteCashLabels.length > 0) {
        triggerToast(tr(`请先补齐：${incompleteCashLabels.join('、')}`, `Complete first: ${incompleteCashLabels.join(', ')}`, `Lengkapkan dahulu: ${incompleteCashLabels.join(', ')}`), 'error');
        return false;
      }

      stageWorkflowUndo('APPROVE_CASH_PURCHASE');
      adminOwnerName = previous.admin_owner_name || currentStaff.name;
      workflowTaggedStaffNames = [previous.handler_name];
      setWorkflow(
        LoanStatus.APPROVE,
        'Handler',
        'Contact Approved Customer',
        '',
        `Cash purchase reviewed and approved by ${currentStaff.name}. Handler must confirm customer acceptance.`
      );
    } else if (workflowAction === 'SUBMIT_TO_BANK') {
      if (!canManageBankWorkflow) {
        triggerToast(tr('只有 Admin 可以提交银行', 'Only Admin can submit to the bank', "Hanya Pentadbir boleh menghantar kepada bank"), 'error');
        return false;
      }
      if (!isApplicationOpenForNewBank(previous)) {
        triggerToast(tr('已交车或银行已放款，不能再提交新银行', 'The bike is delivered or the bank has paid out; no new bank can be submitted', 'Motor telah diserahkan atau bank telah membuat bayaran; tiada bank baharu boleh dihantar'), 'error');
        return false;
      }
      if (missingDocumentLabels.length > 0) {
        triggerToast(tr(`还有文件未完成：${missingDocumentLabels.join('、')}`, `Documents are still missing: ${missingDocumentLabels.join(', ')}`, `Dokumen masih belum lengkap: ${missingDocumentLabels.join(', ')}`), 'error');
        return false;
      }

      const draftBank = [...nextBankApplications].reverse().find((bank) => bank.status === 'Draft');
      if (!draftBank) {
        triggerToast(tr('请先新增一间待处理银行', 'Add a Pending bank application first', "Tambah permohonan bank Menunggu dahulu"), 'error');
        return false;
      }
      if (!draftBank.bank_name.trim()) {
        triggerToast(tr('请先选择要提交的银行', 'Select a bank before submitting', "Pilih bank sebelum menghantar"), 'error');
        return false;
      }

      const followUpAt = getAdminBankFollowUpDueIso(now);
      nextBankApplications = nextBankApplications.map((bank) => (
        bank.id === draftBank.id
          ? {
            ...bank,
            status: 'Submitted',
            submitted_by: currentStaff.name,
            submitted_at: now,
            next_follow_up_at: followUpAt,
            next_action: 'Follow up bank decision'
          }
          : bank
      ));
      adminOwnerName = previous.admin_owner_name || currentStaff.name;
      activeBankApplicationId = draftBank.id;
      nextWorkflowUndo = undefined;
      setWorkflow(
        LoanStatus.IN_PROCESS,
        'Bank',
        'Follow Up Bank',
        followUpAt,
        `${draftBank.bank_name || 'Bank'} application submitted by ${currentStaff.name}; follow-up scheduled for next-day 11:00, capped at 24 hours after submission.`
      );
    } else if (workflowAction === 'DOCUMENTS_READY') {
      if (!canHandleSalesAction) {
        triggerToast(tr('只有负责这个客户的 Sales 可以提交补件', 'Only the assigned Sales handler can submit documents', "Hanya pengendali Jualan yang ditugaskan boleh menghantar dokumen"), 'error');
        return false;
      }
      if (missingDocumentLabels.length > 0) {
        triggerToast(tr(`还有文件未完成：${missingDocumentLabels.join('、')}`, `Documents are still missing: ${missingDocumentLabels.join(', ')}`, `Dokumen masih belum lengkap: ${missingDocumentLabels.join(', ')}`), 'error');
        return false;
      }
      // A cash file goes to Admin's Approve Cash Purchase, which refuses
      // without these; stop here so it does not bounce back to Sales.
      if (isCashPurchase && missingApplicationInformationLabels.length > 0) {
        triggerToast(tr(`请先补齐：${missingApplicationInformationLabels.join('、')}`, `Complete first: ${missingApplicationInformationLabels.join(', ')}`, `Lengkapkan dahulu: ${missingApplicationInformationLabels.join(', ')}`), 'error');
        return false;
      }
      const requestedBankDocumentKey = getBankRequestedDocumentKey(
        [...nextBankApplications].reverse().find((bank) => bank.status === 'Need More Info')?.next_action
      );
      const requestedBankDocument = requestedBankDocumentKey
        ? nextDocumentChecklist.find((document) => document.key === requestedBankDocumentKey)
        : undefined;
      if (requestedBankDocument && requestedBankDocument.status !== 'Received') {
        triggerToast(tr(
          `银行要求的 ${requestedBankDocument.label} 尚未上传，不能完成补件`,
          `The bank-requested ${requestedBankDocument.label} has not been uploaded. Documents Ready is blocked.`,
          `${requestedBankDocument.label} yang diminta oleh bank belum dimuat naik. Dokumen Sedia disekat.`
        ), 'error');
        return false;
      }
      const needMoreInfoBank = [...nextBankApplications].reverse().find((bank) => bank.status === 'Need More Info');
      const documentRequestStartedAt = new Date(previous.pending_since || 0).getTime();
      const hasDocumentUploadedSinceBankRequest = Number.isFinite(documentRequestStartedAt)
        && nextPayslipDocuments.some((document) => (
          new Date(document.uploaded_at || 0).getTime() >= documentRequestStartedAt
        ));
      if (needMoreInfoBank && !hasDocumentUploadedSinceBankRequest) {
        triggerToast(tr(
          '银行补件后还没有上传新文件，不能完成 Documents Ready',
          'No new file has been uploaded since the bank request. Documents Ready is blocked.',
          'Tiada fail baharu dimuat naik sejak permintaan bank. Dokumen Sedia disekat.'
        ), 'error');
        return false;
      }

      stageWorkflowUndo('DOCUMENTS_READY');
      if (isCashPurchase) {
        workflowTaggedRoles = ['Admin', 'Super Admin'];
        setWorkflow(
          LoanStatus.NEW,
          'Admin',
          'Review Application',
          getInitialAdminReviewDueIso(now),
          'Cash purchase documents are ready for Admin review.'
        );
      } else {
      const retrySource = [...nextBankApplications].reverse().find((bank) => bank.status === 'Rejected' || bank.status === 'Need More Info');
      const existingDraft = [...nextBankApplications].reverse().find((bank) => bank.status === 'Draft');
      if (retrySource?.status === 'Need More Info') {
        nextBankApplications = nextBankApplications.map((bank) => (
          bank.id === retrySource.id
            ? {
              ...bank,
              status: 'Cancelled',
              status_reason: 'Superseded after requested documents were provided.',
              next_action: '',
              next_follow_up_at: ''
            }
            : bank
        ));
      }
      if (retrySource && !existingDraft) {
        const nextRoundNo = Math.max(0, ...nextBankApplications.map((bank) => Number(bank.round_no) || 0)) + 1;
        const retryDraft: BankApplication = {
          ...retrySource,
          id: `BANK-${id}-${Date.now()}`,
          round_no: nextRoundNo,
          submitted_by: '',
          submitted_at: now,
          status: 'Draft',
          reject_code: '',
          reject_reason: '',
          reject_next_step: undefined,
          offer_amount: '',
          interest_rate: '',
          tenure: '',
          monthly_installment: '',
          approved_at: '',
          decision_at: '',
          offer_status: 'No Offer',
          reason_category: 'Adjusted Documents',
          status_reason: '',
          next_action: 'Admin to review and resubmit',
          next_follow_up_at: '',
          notes: `Resubmission round ${nextRoundNo}`
        };
        nextBankApplications = [...nextBankApplications, retryDraft];
        activeBankApplicationId = retryDraft.id;
      } else if (existingDraft) {
        activeBankApplicationId = existingDraft.id;
      }

      workflowTaggedRoles = ['Admin', 'Super Admin'];
      setWorkflow(
        LoanStatus.FOLLOW_UP,
        'Admin',
        retrySource ? 'Resubmit to Bank' : 'Submit to Bank',
        now,
        retrySource ? 'Updated documents are ready for Admin resubmission.' : 'Documents are ready for Admin review and bank submission.'
      );
      }
    } else if (workflowAction === 'CLOSE_REJECTED') {
      const canCloseRejectedFile = canManageBankWorkflow || (
        canHandleSalesAction && getLoanPendingWith(previous) === 'Handler'
      );
      const hasRejectedBank = nextBankApplications.some((bank) => bank.status === 'Rejected');
      const hasOpenOrApprovedBank = nextBankApplications.some((bank) => !['Rejected', 'Cancelled'].includes(bank.status));

      if (!canCloseRejectedFile) {
        triggerToast(tr('只有 Admin 或负责这个客户的 Sales 可以结案', 'Only Admin or the assigned Sales handler can close this file', "Hanya Pentadbir atau pengendali Jualan yang ditugaskan boleh menutup fail ini"), 'error');
        return false;
      }
      if (
        isCashPurchase ||
        previous.status !== LoanStatus.FOLLOW_UP ||
        !hasRejectedBank ||
        hasOpenOrApprovedBank
      ) {
        triggerToast(tr(
          '只有在至少一间银行已拒绝，且没有其他处理中、已批准或草稿银行时才能结案。',
          'Close is available only after at least one bank rejects the application and no other bank is pending, approved, or still a draft.',
          'Fail hanya boleh ditutup selepas sekurang-kurangnya satu bank menolak permohonan dan tiada bank lain yang masih diproses, diluluskan atau dalam draf.'
        ), 'error');
        return false;
      }

      stageWorkflowUndo('CLOSE_REJECTED');
      setWorkflow(LoanStatus.REJECT, 'Closed', 'None', '', `${currentStaff.name} (${currentStaff.role}) closed the file after reviewing the bank rejection.`);
    } else if (workflowAction === 'COMPLETE_APPROVED_CONTACT') {
      if (!canHandleSalesAction) {
        triggerToast(tr('只有负责这个客户的 Sales 可以完成联系', 'Only the assigned Sales handler can complete this contact', "Hanya pengendali Jualan yang ditugaskan boleh melengkapkan hubungan ini"), 'error');
        return false;
      }
      if (previous.status !== LoanStatus.APPROVE || getLoanPendingAction(previous) !== 'Contact Approved Customer') {
        triggerToast(tr('这份申请目前不需要完成批准联系', 'This application is not waiting for approved-customer contact', "Permohonan ini tidak menunggu hubungan pelanggan yang diluluskan"), 'error');
        return false;
      }

      stageWorkflowUndo('COMPLETE_APPROVED_CONTACT');
      setWorkflow(
        LoanStatus.APPROVE,
        'Closed',
        'None',
        '',
        isCashPurchase
          ? `Cash purchase acceptance confirmed by ${currentStaff.name}.`
          : `Approved customer contact completed by ${currentStaff.name}.`
      );
    } else if (workflowAction === 'CANCEL_APPLICATION') {
      const cancellationReason = workflowUndoReason.trim();
      if (!canStaffCancelApplication(previous, currentStaff)) {
        triggerToast(tr('只有负责的 Sales、负责的 Admin、Operations Manager 或 Super Admin 可以取消申请', 'Only the assigned Sales, the owning Admin, Operations Manager or Super Admin can cancel this application', "Hanya Jualan yang ditugaskan, Pentadbir pemilik, Pengurus Operasi atau Pentadbir Super boleh membatalkan permohonan ini"), 'error');
        return false;
      }
      if (!canCancelApplication(previous)) {
        triggerToast(tr('只有尚未交车、银行尚未放款、财务未结案的申请可以取消', 'Only an application that is not delivered, not disbursed by the bank and not settled can be cancelled', "Hanya permohonan yang belum dihantar, belum dikeluarkan oleh bank dan belum diselesaikan boleh dibatalkan"), 'error');
        return false;
      }
      if (cancellationReason.length < 3) {
        triggerToast(tr('请填写取消原因（至少 3 个字）', 'Enter a cancellation reason of at least 3 characters', "Masukkan sebab pembatalan sekurang-kurangnya 3 aksara"), 'error');
        return false;
      }

      // Not undoable: a stale checkpoint must not reopen a cancelled file.
      nextWorkflowUndo = undefined;
      workflowTaggedRoles = adminOwnerName ? [] : ['Admin', 'Super Admin'];
      workflowTaggedStaffNames = [adminOwnerName, previous.handler_name]
        .filter((name) => name && name !== currentStaff.name);
      // Withdrawal is recorded on the saved bank rows, never on unsaved drawer
      // edits: Rules accept only open -> Cancelled / Approved offer -> Withdrawn.
      nextBankApplications = withdrawBankApplications(previous.bank_applications || [], cancellationReason, now);
      setWorkflow(
        LoanStatus.CANCELLED,
        'Closed',
        'None',
        '',
        isCashPurchase
          ? `Cash purchase application cancelled by ${currentStaff.name}. Reason: ${cancellationReason}`
          : `Loan application withdrawn by the customer; recorded by ${currentStaff.name}. Reason: ${cancellationReason}. Inform the bank of any open or approved submission.`
      );
    }

    let changedBank = workflowAction
      ? undefined
      : [...nextBankApplications].reverse().find((bank) => {
        const oldBank = previous.bank_applications?.find((item) => item.id === bank.id);
        return oldBank ? oldBank.status !== bank.status : bank.status !== 'Draft';
      });

    if (changedBank && canManageBankWorkflow) {
      nextWorkflowUndo = undefined;
      adminOwnerName = previous.admin_owner_name || currentStaff.name;
      activeBankApplicationId = changedBank.id;

      if (changedBank.status === 'Rejected') {
        const rejectedCodes = normalizeRejectCodes(changedBank.reject_code);
        const matchingDefinitions = rejectedCodes
          .map((code) => errorCodeIssueMap[code])
          .filter((definition): definition is ErrorCodeDefinition => Boolean(definition));
        const matchingDefinition = matchingDefinitions[0];
        const linkedRejectReason = Array.from(new Set(
          matchingDefinitions
            .map((definition) => definition.issue.trim())
            .filter(Boolean)
        )).join(' · ');
        const manualRejectReason = (changedBank.reject_reason || changedBank.status_reason || '').trim();
        const resolvedRejectReason = rejectedCodes.length > 0 ? linkedRejectReason : manualRejectReason;
        if (!resolvedRejectReason) {
          triggerToast(
            rejectedCodes.length > 0
              ? tr('CODE 尚未关联拒绝原因，请先更新 Error Code Database', 'The CODE has no linked reject reason. Update Error Code Database first.', 'KOD belum mempunyai sebab penolakan yang dipautkan. Kemas kini Pangkalan Data Kod Ralat dahulu.')
              : tr('没有 CODE 时，请填写拒绝原因', 'Enter a reject reason when there is no CODE', 'Masukkan sebab penolakan apabila tiada KOD'),
            'error'
          );
          return false;
        }
        const rejectNextStep = changedBank.reject_next_step || matchingDefinition?.default_next_step;
        if (!rejectNextStep) {
          triggerToast(tr('请选择银行拒绝后的下一步', 'Select the next step after the bank rejection', 'Pilih langkah seterusnya selepas penolakan bank'), 'error');
          return false;
        }

        const nextStepLabels: Record<RejectNextStepType, string> = {
          REQUEST_DOCUMENTS: 'Request customer documents',
          CORRECT_INFORMATION: 'Correct customer information',
          ADJUST_DEAL: 'Adjust deal structure',
          TRY_ANOTHER_BANK: 'Try another bank',
          FOLLOW_UP_LATER: 'Follow up later',
          CONVERT_TO_CASH: 'Convert to cash',
          CLOSE_REJECTED: 'Close rejected file',
          MERGE_DUPLICATE: 'Merge duplicate application'
        };
        const nextAction = changedBank.next_action || nextStepLabels[rejectNextStep];
        changedBank = {
          ...changedBank,
          reject_code: rejectedCodes.join(', '),
          reject_reason: resolvedRejectReason,
          reject_next_step: rejectNextStep,
          reason_category: rejectedCodes.length > 0 ? matchingDefinition?.category || '' : '',
          status_reason: resolvedRejectReason,
          next_action: nextAction
        };
        nextBankApplications = nextBankApplications.map((bank) => bank.id === changedBank?.id ? changedBank : bank);

        const hasApprovedBank = nextBankApplications.some((bank) => bank.status === 'Approved');
        const activeBank = [...nextBankApplications].reverse().find((bank) => bank.status === 'Submitted' || bank.status === 'Pending Review');
        if (hasApprovedBank) {
          workflowTaggedStaffNames = [previous.handler_name];
          setWorkflow(LoanStatus.APPROVE, 'Handler', 'Contact Approved Customer', now, `${changedBank.bank_name || 'Bank'} rejected, but another bank has approved the application.`);
        } else if (activeBank) {
          activeBankApplicationId = activeBank.id;
          setWorkflow(LoanStatus.IN_PROCESS, 'Bank', 'Follow Up Bank', activeBank.next_follow_up_at || previous.action_due_at || getAdminBankFollowUpDueIso(activeBank.submitted_at || now), `${changedBank.bank_name || 'Bank'} rejected; another bank application is still active.`);
        } else if (rejectNextStep === 'REQUEST_DOCUMENTS' || rejectNextStep === 'CORRECT_INFORMATION') {
          // Follow Up Reject Bank names the document; Sales cannot use Documents Ready until it is back.
          const requestedDocumentKey = rejectNextStep === 'REQUEST_DOCUMENTS' ? getBankRequestedDocumentKey(nextAction) : undefined;
          if (requestedDocumentKey) {
            nextDocumentChecklist = nextDocumentChecklist.map((document) => (
              document.key === requestedDocumentKey
                ? { ...document, status: 'Missing', updated_at: now, updated_by: currentStaff.name }
                : document
            ));
          }
          const customerRequests = Array.from(new Set(
            matchingDefinitions
              .map((definition) => definition.customer_request.trim())
              .filter(Boolean)
          )).join(' · ');
          workflowTaggedStaffNames = [previous.handler_name];
          setWorkflow(
            LoanStatus.PENDING,
            'Handler',
            'Provide Documents',
            '',
            `${changedBank.bank_name || 'Bank'} rejected. Next step: ${nextAction}.${customerRequests ? ` Customer request: ${customerRequests}.` : ''}`
          );
        } else if (rejectNextStep === 'TRY_ANOTHER_BANK') {
          workflowTaggedRoles = ['Admin', 'Super Admin'];
          setWorkflow(
            LoanStatus.FOLLOW_UP,
            'Admin',
            'Submit to Bank',
            now,
            `${changedBank.bank_name || 'Bank'} rejected. Next step: ${nextAction}. Admin must add another bank and submit.`
          );
        } else {
          workflowTaggedStaffNames = [previous.handler_name];
          setWorkflow(
            LoanStatus.FOLLOW_UP,
            'Handler',
            'Choose Close or Resubmit',
            '',
            rejectedCodes.length > 0
              ? `${changedBank.bank_name || 'Bank'} rejected with CODE ${rejectedCodes.join(', ')}. Next step: ${nextAction}.`
              : `${changedBank.bank_name || 'Bank'} rejected without a CODE. Next step: ${nextAction}.`
          );
        }
      } else if (changedBank.status === 'Approved') {
        workflowTaggedStaffNames = [previous.handler_name];
        setWorkflow(LoanStatus.APPROVE, 'Handler', 'Contact Approved Customer', now, `${changedBank.bank_name || 'Bank'} approved the application. Sales must contact the customer.`);
      } else if (changedBank.status === 'Need More Info') {
        const requestedDocumentKey = getBankRequestedDocumentKey(changedBank.next_action);
        if (requestedDocumentKey) {
          nextDocumentChecklist = nextDocumentChecklist.map((document) => (
            document.key === requestedDocumentKey
              ? {
                  ...document,
                  status: 'Missing',
                  updated_at: now,
                  updated_by: currentStaff.name
                }
              : document
          ));
        }
        workflowTaggedStaffNames = [previous.handler_name];
        setWorkflow(LoanStatus.PENDING, 'Handler', 'Provide Documents', '', `${changedBank.bank_name || 'Bank'} requested more information: ${changedBank.next_action || changedBank.status_reason || 'Check the bank record'}.`);
      } else if (changedBank.status === 'Submitted' || changedBank.status === 'Pending Review') {
        const submittedAt = changedBank.submitted_at || now;
        const followUpAt = getAdminBankFollowUpDueIso(submittedAt);
        nextBankApplications = nextBankApplications.map((bank) => bank.id === changedBank.id ? {
          ...bank,
          submitted_by: bank.submitted_by || currentStaff.name,
          submitted_at: submittedAt,
          next_follow_up_at: followUpAt
        } : bank);
        setWorkflow(LoanStatus.IN_PROCESS, 'Bank', 'Follow Up Bank', followUpAt, `${changedBank.bank_name || 'Bank'} is in process; Admin follow-up is scheduled.`);
      } else if (changedBank.status === 'Cancelled') {
        const approvedBank = [...nextBankApplications].reverse().find((bank) => bank.id !== changedBank.id && bank.status === 'Approved');
        const activeBank = [...nextBankApplications].reverse().find((bank) => (
          bank.id !== changedBank.id && (bank.status === 'Submitted' || bank.status === 'Pending Review')
        ));

        if (approvedBank) {
          activeBankApplicationId = approvedBank.id;
          workflowTaggedStaffNames = [previous.handler_name];
          setWorkflow(LoanStatus.APPROVE, 'Handler', 'Contact Approved Customer', now, `${changedBank.bank_name || 'Bank'} was cancelled; ${approvedBank.bank_name || 'another bank'} remains approved.`);
        } else if (activeBank) {
          const followUpAt = activeBank.next_follow_up_at || previous.action_due_at || getAdminBankFollowUpDueIso(activeBank.submitted_at || now);
          activeBankApplicationId = activeBank.id;
          setWorkflow(LoanStatus.IN_PROCESS, 'Bank', 'Follow Up Bank', followUpAt, `${changedBank.bank_name || 'Bank'} was cancelled; ${activeBank.bank_name || 'another bank'} remains in process.`);
        } else {
          activeBankApplicationId = '';
          workflowTaggedRoles = ['Admin', 'Super Admin'];
          setWorkflow(LoanStatus.FOLLOW_UP, 'Admin', 'Submit to Bank', now, `${changedBank.bank_name || 'Bank'} was cancelled. Admin must choose another bank or resubmit.`);
        }
      }
    }

    if (!workflowAction && !changedBank && currentStaff.role === 'Super Admin' && updatedStatus !== previous.status) {
      nextWorkflowUndo = undefined;
      pendingWith = getLoanPendingWith({ status: updatedStatus });
      pendingAction = getLoanPendingAction({ status: updatedStatus });
      pendingSince = now;
      actionDueAt = '';
      workflowActivityBody = `Super Admin overrode the application status to ${updatedStatus}.`;
    }

    if (!workflowAction && !changedBank && nextWorkflowUndo && currentStaff.name !== nextWorkflowUndo.actor_name) {
      const currentPendingOwnerActed = (
        (pendingWith === 'Handler' && previous.handler_name === currentStaff.name) ||
        (pendingWith === 'Admin' && canManageBankWorkflow)
      );
      if (currentPendingOwnerActed) {
        nextWorkflowUndo = undefined;
      }
    }

    const rejectedBankCodes = normalizeRejectCodes(
      [...nextBankApplications].reverse().find((bank) => bank.status === 'Rejected')?.reject_code || ''
    );
    const nextErrorCodes = nextStatus === LoanStatus.REJECT
      ? normalizeRejectCodes([updatedErrorCode, ...updatedErrorCodes, ...rejectedBankCodes])
      : [];
    if (nextStatus === LoanStatus.REJECT && nextErrorCodes.length === 0 && workflowAction !== 'CLOSE_REJECTED') {
      triggerToast(tr('REJECT 结案必须有 CODE', 'A CODE is required before closing as REJECT', "KOD diperlukan sebelum menutup sebagai TOLAK"), 'error');
      return false;
    }

    const normalizedVehicleOptions = normalizeVehicleOptions({
      ...previous,
      ...updatedApplicationInfo
    } as LoanApplication);
    const primaryVehicleOption = normalizedVehicleOptions[0];
    const primaryVehicleModel = primaryVehicleOption?.vehicle_model || updatedApplicationInfo.vehicle_model;
    const detectedVehicle = detectVehicleFromModel(primaryVehicleModel);
    const inferredVehicleTag = primaryVehicleOption?.vehicle_tag || detectedVehicle.vehicle_tag;
    const inferredVehicleBrand = primaryVehicleOption?.vehicle_brand || detectedVehicle.vehicle_brand;
    const approvedBank = isCashPurchase
      ? undefined
      : [...nextBankApplications].reverse().find((bank) => bank.status === 'Approved' && bank.offer_status === 'Accepted')
        || [...nextBankApplications].reverse().find((bank) => bank.status === 'Approved');
    const approvedBankOfferAmount = normalizeMoneyAmount(approvedBank?.offer_amount);
    const approvedBankOfferAt = approvedBank?.approved_at || approvedBank?.decision_at || '';
    const buildAutomatedDealFinance = (app: LoanApplication): DealFinance | undefined => {
      if (nextStatus !== LoanStatus.APPROVE) return app.deal_finance;

      const existing = app.deal_finance;
      // A bank decision belongs to bank_applications. Admin must not rewrite an
      // already-established finance/stock record as a side effect of recording
      // that decision: Firestore intentionally protects those finance fields,
      // and rejecting the combined write would make Approved vanish on refresh.
      // Super Admin can still refresh the finance snapshot when required.
      if (existing && changedBank && currentStaff.role !== 'Super Admin') {
        return existing;
      }
      const listedPrice = existing
        ? normalizeMoneyAmount(existing.listed_selling_price)
        : normalizeMoneyAmount(primaryVehicleOption?.motor_selling_price);
      const shouldMarkAccepted = workflowAction === 'COMPLETE_APPROVED_CONTACT';
      const nextSaleStatus = existing?.sale_status === 'Bike Delivered' || existing?.sale_status === 'Cancelled'
        ? existing.sale_status
        : shouldMarkAccepted
          ? 'Customer Accepted'
          : existing?.sale_status || 'Pending Acceptance';
      const nextBankName = approvedBank?.bank_name || '';
      const bankReferenceChanged = (
        (existing?.approved_bank_name || '') !== nextBankName
        || normalizeMoneyAmount(existing?.approved_bank_offer_amount) !== approvedBankOfferAmount
        || (existing?.approved_bank_offer_at || '') !== approvedBankOfferAt
      );
      if (existing && existing.sale_status === nextSaleStatus && !bankReferenceChanged) {
        return existing;
      }
      // Operations may already have assigned a unit or recorded money. Then
      // the acceptance step changes only sale_status, which is all Rules let
      // Sales / Admin write on an established finance record.
      if (existing && !bankReferenceChanged && nextSaleStatus === 'Customer Accepted') {
        return {
          ...existing,
          sale_status: nextSaleStatus,
          updated_at: now,
          updated_by: currentStaff.name
        };
      }

      return {
        stock_unit_id: existing?.stock_unit_id || '',
        sale_status: nextSaleStatus,
        automation_source: existing ? existing.automation_source : 'Application Workflow',
        approved_bank_name: nextBankName,
        approved_bank_offer_amount: approvedBankOfferAmount,
        approved_bank_offer_at: approvedBankOfferAt,
        listed_selling_price: listedPrice,
        loan_amount: normalizeMoneyAmount(existing?.loan_amount),
        deposit_amount: normalizeMoneyAmount(existing?.deposit_amount),
        approved_discount: normalizeMoneyAmount(existing?.approved_discount),
        final_selling_price: existing ? normalizeMoneyAmount(existing.final_selling_price) : listedPrice,
        customer_deposit_received: normalizeMoneyAmount(existing?.customer_deposit_received),
        ...(existing?.customer_deposit_date ? { customer_deposit_date: existing.customer_deposit_date } : {}),
        customer_cash_payment: normalizeMoneyAmount(existing?.customer_cash_payment),
        bank_disbursement: normalizeMoneyAmount(existing?.bank_disbursement),
        other_income: normalizeMoneyAmount(existing?.other_income),
        refund_amount: normalizeMoneyAmount(existing?.refund_amount),
        direct_bank_charges: normalizeMoneyAmount(existing?.direct_bank_charges),
        recognized_stock_cost: existing?.recognized_stock_cost,
        delivery_at: existing?.delivery_at || '',
        bank_disbursed_at: existing?.bank_disbursed_at || '',
        finance_completed_at: existing?.finance_completed_at || '',
        account_verified_at: existing?.account_verified_at || '',
        account_verified_by: existing?.account_verified_by || '',
        commission_status: existing?.commission_status || 'Estimated',
        // Commission is never set here: a new deal starts at zero; the tiers
        // (or a typed amount) fill it in on the Operations side after delivery.
        ...(existing?.commission_source ? { commission_source: existing.commission_source } : {}),
        commission_percent: existing ? existing.commission_percent : undefined,
        commission_amount: existing ? normalizeMoneyAmount(existing.commission_amount) : 0,
        commission_paid_at: existing?.commission_paid_at || '',
        updated_at: now,
        updated_by: currentStaff.name
      };
    };
    // Reversing a settlement writes deal_finance and releases the stock
    // reservation — both Super Admin only under firestore.rules. For Sales/Admin
    // we still let the loan move to REJECT/CANCELLED, but leave deal_finance
    // untouched so the customer save is not denied wholesale; Super Admin
    // reverses the settlement afterwards in Finance Center.
    const financeNeedsCancel = (
      (nextStatus === LoanStatus.REJECT || nextStatus === LoanStatus.CANCELLED) &&
      previous.deal_finance &&
      previous.deal_finance.sale_status !== 'Cancelled'
    );
    // A settled deal would lose its paid-commission and completion record
    // (and drop out of monthly P&L) if cancelled here; Finance Center owns that.
    if (financeNeedsCancel && nextStatus !== previous.status && isSettledDealFinance(previous.deal_finance)) {
      triggerToast(tr(
        '这单佣金已付或财务已结案，不能直接改成 REJECT / CANCELLED。请先在 Finance Center 处理冲销。',
        'This deal is settled (commission paid or finance completed), so it cannot be moved to REJECT / CANCELLED here. Reverse it in Finance Center first.',
        'Urus niaga ini sudah diselesaikan (komisen dibayar atau kewangan selesai), jadi ia tidak boleh ditukar kepada TOLAK / DIBATALKAN di sini. Balikkan di Pusat Kewangan dahulu.'
      ), 'error');
      return false;
    }
    const shouldCancelFinance = financeNeedsCancel && currentStaff.role === 'Super Admin';
    if (financeNeedsCancel && !shouldCancelFinance) {
      triggerToast(tr(
        '这单已有财务记录，状态已更新，但佣金与库存要 Super Admin 在 Finance Center 冲销。',
        'This deal has a finance record. The status was updated, but Super Admin must reverse the commission and release the stock unit in Finance Center.',
        "Urus niaga ini mempunyai rekod kewangan. Status dikemas kini, tetapi Pentadbir Super perlu membalikkan komisen dan melepaskan unit stok di Pusat Kewangan."
      ));
    }
    const updated: LoanApplication[] = applicationsRef.current.map((app): LoanApplication => {
      if (app.id === id) {
        const editableApplicationInfo = canEditApplicationInformation
          ? {
            ...updatedApplicationInfo,
            vehicle_model: primaryVehicleModel,
            vehicle_tag: inferredVehicleTag,
            vehicle_brand: inferredVehicleBrand,
            vehicle_condition: primaryVehicleOption?.vehicle_condition || updatedApplicationInfo.vehicle_condition || '',
            purchase_method: primaryVehicleOption?.purchase_method || updatedApplicationInfo.purchase_method || '',
            vehicle_options: normalizedVehicleOptions,
            handler_name: currentStaff.role === 'Super Admin' ? updatedApplicationInfo.handler_name : app.handler_name,
            handler_role: currentStaff.role === 'Super Admin' ? updatedApplicationInfo.handler_role : app.handler_role
          }
          : {
            applicant_name: app.applicant_name,
            phone_no: app.phone_no,
            ic_no: app.ic_no,
            vehicle_plate: app.vehicle_plate,
            vehicle_model: app.vehicle_model,
            vehicle_tag: app.vehicle_tag,
            vehicle_brand: app.vehicle_brand,
            vehicle_condition: app.vehicle_condition || '',
            purchase_method: app.purchase_method || '',
            vehicle_options: app.vehicle_options || normalizeVehicleOptions(app),
            handler_name: app.handler_name,
            handler_role: app.handler_role,
            // Without the edit switch Rules refuse submitted_at (and the whole save).
            submitted_at: app.submitted_at,
            customer_call_back_at: app.customer_call_back_at || '',
            document_checklist: updatedApplicationInfo.document_checklist || app.document_checklist || normalizeDocumentChecklist(app),
            personal_info: app.personal_info,
            emergency_contacts: app.emergency_contacts,
            employment_details: app.employment_details,
            preferences: app.preferences
          };
        const activityEntries: CustomerActivityEntry[] = [
          ...(app.status !== nextStatus ? [createStatusActivityEntry(currentStaff, app.status, nextStatus)] : []),
          ...(workflowActivityBody ? [createWorkflowActivityEntry(currentStaff, workflowActivityBody, workflowTaggedStaffNames, workflowTaggedRoles)] : [])
        ];

        return {
          ...app,
          ...(isCancelAction ? {} : {
            ...editableApplicationInfo,
            admin_owner_name: adminOwnerName,
            active_bank_application_id: activeBankApplicationId
          }),
          pending_with: pendingWith,
          pending_action: pendingAction,
          pending_since: pendingSince,
          action_due_at: actionDueAt,
          status: nextStatus,
          remarks: nextRemarks,
          ...(isCancelAction ? {} : {
            error_code: nextErrorCodes[0] || '',
            error_codes: nextErrorCodes,
            document_checklist: nextDocumentChecklist,
            payslip_documents: nextPayslipDocuments
          }),
          bank_applications: nextBankApplications,
          deal_finance: shouldRestoreWorkflowFinance
            ? restoredWorkflowFinance
            : shouldCancelFinance && app.deal_finance
            ? {
              ...app.deal_finance,
              sale_status: 'Cancelled',
              delivery_at: '',
              finance_completed_at: '',
              account_verified_at: '',
              account_verified_by: '',
              commission_status: 'Reversed',
              commission_paid_at: '',
              updated_at: now,
              updated_by: currentStaff.name
            }
            : buildAutomatedDealFinance(app),
          workflow_undo: nextWorkflowUndo,
          activity_thread: [...activityEntries, ...normalizeActivityThread(app.activity_thread)]
        } as LoanApplication;
      }
      return app;
    });

    const updatedApplication = updated.find((app) => app.id === id);
    let terminalVehicleCatalog = vehicleCatalog;
    if (shouldCancelFinance && updatedApplication) {
      const releasedStockUnitId = previous.deal_finance?.stock_unit_id || '';
      if (releasedStockUnitId) {
        try {
          await saveDealFinanceWithStockReservationToFirebase(updatedApplication, releasedStockUnitId, currentStaff.name, { expectedFinanceUpdatedAt: previous.deal_finance?.updated_at || '' });
        } catch (error) {
          if (error instanceof CollectionItemVersionConflictError) {
            triggerToast(tr('客户资料已在其他设备更新，正在重新载入。', 'The customer changed on another device. Reloading the latest data.', "Pelanggan telah berubah pada peranti lain. Memuatkan semula data terkini."), 'error');
            reloadDashboard();
          } else {
            triggerToast(tr('无法原子释放库存，贷款状态没有修改。', 'The stock unit could not be released atomically; the loan was not changed.', "Unit stok tidak dapat dilepaskan secara atom; pinjaman tidak diubah."), 'error');
          }
          return false;
        }
      }

      terminalVehicleCatalog = normalizeVehicleCatalogList(vehicleCatalog.map((catalog) => ({
        ...catalog,
        stock_units: (catalog.stock_units || []).map((unit) => (
          unit.id === releasedStockUnitId && (unit.reserved_application_id === id || unit.sold_application_id === id)
            ? { ...unit, status: 'In Stock', reserved_application_id: '', sold_application_id: '', delivered_at: '', updated_at: now, updated_by: currentStaff.name }
            : unit
        ))
      })));
    }

    // After the stock-release await, patch only this application into the
    // latest list: rows other staff changed meanwhile must not be written back
    // from `updated` (its other rows are the pre-await copies).
    const savedApplications = updatedApplication
      ? replaceItemById(applicationsRef.current, updatedApplication)
      : applicationsRef.current;
    const applicationSaved = await updateApplicationsState(savedApplications);
    if (!applicationSaved) {
      // Do not leave an optimistic bank decision or write a ghost audit entry
      // when Firebase rejected the customer document. Restore only this row,
      // and only while it still holds our optimistic copy (a conflict recovery
      // may already have put the newer server version there); every other row
      // keeps its latest value. The persistence hook has already shown the error.
      const rolledBackApplications = updatedApplication
        ? rollbackItemById(applicationsRef.current, updatedApplication, previous)
        : applicationsRef.current;
      const rolledBackApplication = rolledBackApplications.find((app) => app.id === id) || previous;
      applicationsRef.current = rolledBackApplications;
      setApplications(rolledBackApplications);
      writeLocalDashboardValue('applications', rolledBackApplications);
      setSelectedApplication((current) => (
        current?.id === id ? rolledBackApplication : current
      ));
      return false;
    }
    if (terminalVehicleCatalog !== vehicleCatalog) {
      updateVehicleCatalogState(terminalVehicleCatalog);
    }

    if (previous) {
      const taskCompletionChanges = updatedApplication
        ? createTaskCompletionAuditChanges(
          buildLoanTaskCompletionDescriptors(previous, updatedApplication, now)
        )
        : [];
      appendAuditLog({
        action: workflowAction === 'UNDO_LAST_ACTION' ? 'UNDO_LOAN_WORKFLOW_ACTION' : 'UPDATE_LOAN_APPLICATION',
        target_type: 'Loan Application',
        target_id: id,
        target_label: previous.applicant_name,
        changes: [
          ...createAuditChanges(
            {
              applicant_name: previous.applicant_name,
              phone_no: previous.phone_no,
              ic_no: previous.ic_no,
              vehicle_plate: previous.vehicle_plate,
              vehicle_model: previous.vehicle_model,
              vehicle_tag: previous.vehicle_tag,
              vehicle_brand: previous.vehicle_brand,
              vehicle_condition: previous.vehicle_condition || '',
              purchase_method: previous.purchase_method || '',
              vehicle_options: JSON.stringify(previous.vehicle_options || normalizeVehicleOptions(previous)),
              handler_name: previous.handler_name,
              handler_role: previous.handler_role,
              admin_owner_name: previous.admin_owner_name || '',
              pending_with: getLoanPendingWith(previous),
              pending_action: getLoanPendingAction(previous),
              action_due_at: previous.action_due_at || '',
              submitted_at: previous.submitted_at,
              customer_call_back_at: previous.customer_call_back_at || '',
              document_checklist: JSON.stringify(normalizeDocumentChecklist(previous)),
              personal_info: JSON.stringify(previous.personal_info || createEmptyPersonalInfo()),
              emergency_contacts: JSON.stringify(previous.emergency_contacts || normalizeEmergencyContacts()),
              employment_details: JSON.stringify(previous.employment_details || createEmptyEmploymentDetails()),
              preferences: JSON.stringify(previous.preferences || createEmptyPreferences()),
              status: previous.status,
              remarks: previous.remarks,
              error_code: previous.error_code,
              error_codes: JSON.stringify(getApplicationRejectCodes(previous)),
              payslip_documents: summarizePayslipDocuments(previous.payslip_documents || []),
              bank_applications: summarizeBankApplications(previous.bank_applications || [])
            },
            {
              applicant_name: canEditApplicationInformation ? updatedApplicationInfo.applicant_name : previous.applicant_name,
              phone_no: canEditApplicationInformation ? updatedApplicationInfo.phone_no : previous.phone_no,
              ic_no: canEditApplicationInformation ? updatedApplicationInfo.ic_no : previous.ic_no,
              vehicle_plate: canEditApplicationInformation ? updatedApplicationInfo.vehicle_plate : previous.vehicle_plate,
              vehicle_model: canEditApplicationInformation ? primaryVehicleModel : previous.vehicle_model,
              vehicle_tag: canEditApplicationInformation ? inferredVehicleTag : previous.vehicle_tag,
              vehicle_brand: canEditApplicationInformation ? inferredVehicleBrand : previous.vehicle_brand,
              vehicle_condition: canEditApplicationInformation ? primaryVehicleOption?.vehicle_condition || '' : previous.vehicle_condition || '',
              purchase_method: canEditApplicationInformation ? primaryVehicleOption?.purchase_method || '' : previous.purchase_method || '',
              vehicle_options: canEditApplicationInformation ? JSON.stringify(normalizedVehicleOptions) : JSON.stringify(previous.vehicle_options || normalizeVehicleOptions(previous)),
              handler_name: currentStaff.role === 'Super Admin' ? updatedApplicationInfo.handler_name : previous.handler_name,
              handler_role: currentStaff.role === 'Super Admin' ? updatedApplicationInfo.handler_role : previous.handler_role,
              admin_owner_name: adminOwnerName,
              pending_with: pendingWith,
              pending_action: pendingAction,
              action_due_at: actionDueAt,
              submitted_at: canEditApplicationInformation ? updatedApplicationInfo.submitted_at : previous.submitted_at,
              customer_call_back_at: canEditApplicationInformation ? updatedApplicationInfo.customer_call_back_at || '' : previous.customer_call_back_at || '',
              document_checklist: JSON.stringify(nextDocumentChecklist),
              personal_info: canEditApplicationInformation ? JSON.stringify(updatedApplicationInfo.personal_info || createEmptyPersonalInfo()) : JSON.stringify(previous.personal_info || createEmptyPersonalInfo()),
              emergency_contacts: canEditApplicationInformation ? JSON.stringify(updatedApplicationInfo.emergency_contacts || normalizeEmergencyContacts()) : JSON.stringify(previous.emergency_contacts || normalizeEmergencyContacts()),
              employment_details: canEditApplicationInformation ? JSON.stringify(updatedApplicationInfo.employment_details || createEmptyEmploymentDetails()) : JSON.stringify(previous.employment_details || createEmptyEmploymentDetails()),
              preferences: canEditApplicationInformation ? JSON.stringify(updatedApplicationInfo.preferences || createEmptyPreferences()) : JSON.stringify(previous.preferences || createEmptyPreferences()),
              status: nextStatus,
              remarks: nextRemarks,
              error_code: nextErrorCodes[0] || '',
              error_codes: JSON.stringify(nextErrorCodes),
              payslip_documents: summarizePayslipDocuments(nextPayslipDocuments),
              bank_applications: summarizeBankApplications(nextBankApplications)
            }
          ),
          ...(workflowAction === 'UNDO_LAST_ACTION' && previous.workflow_undo ? [{
            field: 'workflow_action',
            old_value: previous.workflow_undo.action,
            new_value: `UNDONE: ${workflowUndoReason.trim()}`
          }] : []),
          ...taskCompletionChanges
        ],
        stateOverrides: { applications: applicationsRef.current, vehicleCatalog: terminalVehicleCatalog }
      });
    }

    if (selectedApplication?.id === id) {
      setSelectedApplication(updatedApplication || null);
    }
    
    // Find name to include in toast
    const affected = updatedApplication;
    const clientName = affected ? affected.applicant_name.split(' ')[0] : tr('客户', 'Customer', "Pelanggan");
    triggerToast(tr(`申请单 ${id} (${clientName}) 已更新为 [${nextStatus}]`, `Application ${id} (${clientName}) updated to [${nextStatus}]`, `Permohonan ${id} (${clientName}) dikemas kini kepada [${nextStatus}]`));
    return true;
  };

  // One-click workflow actions from a Home card (owner 2026-10-18: as few clicks
  // as possible). Same handleSaveApplication path as the drawer, so its role and
  // completeness checks still apply.
  const handleCompleteCashAcceptanceFromTaskInbox = async (
    application: LoanApplication,
    workflowAction: Extract<LoanWorkflowAction, 'COMPLETE_APPROVED_CONTACT' | 'NOTIFY_ADMIN' | 'APPROVE_CASH_PURCHASE'> = 'COMPLETE_APPROVED_CONTACT'
  ) => (
    handleSaveApplication(
      application.id,
      application.status,
      application.remarks,
      application.error_code,
      application.error_codes || [],
      application.payslip_documents || [],
      application.bank_applications || [],
      {
        applicant_name: application.applicant_name,
        phone_no: application.phone_no,
        ic_no: application.ic_no,
        vehicle_plate: application.vehicle_plate,
        vehicle_model: application.vehicle_model,
        vehicle_tag: application.vehicle_tag,
        vehicle_brand: application.vehicle_brand,
        vehicle_condition: application.vehicle_condition || '',
        purchase_method: application.purchase_method || '',
        vehicle_options: application.vehicle_options || normalizeVehicleOptions(application),
        handler_name: application.handler_name,
        handler_role: application.handler_role,
        submitted_at: application.submitted_at,
        customer_call_back_at: application.customer_call_back_at || '',
        document_checklist: application.document_checklist || normalizeDocumentChecklist(application),
        personal_info: application.personal_info,
        emergency_contacts: application.emergency_contacts,
        employment_details: application.employment_details,
        preferences: application.preferences
      },
      workflowAction
    )
  );

  // Loan Applications table: submit a file to one bank straight from that
  // bank's empty cell. It adds the Draft round the bank page would add and runs
  // the same SUBMIT_TO_BANK workflow, so every check (role, missing documents) holds.
  const handleSubmitToBankFromTable = async (id: string, bankName: string) => {
    const application = applicationsRef.current.find((app) => app.id === id);
    const trimmedBankName = bankName.trim();
    if (!application || !trimmedBankName) {
      return false;
    }

    const existingBanks = application.bank_applications || [];
    const draftBank: BankApplication = {
      id: `BANK-${application.id}-${Date.now()}`,
      bank_name: trimmedBankName,
      round_no: Math.max(0, ...existingBanks.map((bank) => Number(bank.round_no) || 0)) + 1,
      submitted_by: '',
      submitted_at: '',
      status: 'Draft',
      reject_code: '',
      reject_reason: '',
      offer_amount: '',
      interest_rate: '',
      tenure: '',
      monthly_installment: '',
      approved_at: '',
      decision_at: '',
      offer_status: 'No Offer',
      reason_category: '',
      status_reason: '',
      next_action: '',
      next_follow_up_at: getAdminBankFollowUpDueIso(),
      notes: ''
    };

    return handleSaveApplication(
      application.id,
      application.status,
      application.remarks,
      application.error_code,
      application.error_codes || [],
      application.payslip_documents || [],
      // Leave other unsent Draft rounds alone; the workflow submits the last Draft.
      [...existingBanks, draftBank],
      {
        applicant_name: application.applicant_name,
        phone_no: application.phone_no,
        ic_no: application.ic_no,
        vehicle_plate: application.vehicle_plate,
        vehicle_model: application.vehicle_model,
        vehicle_tag: application.vehicle_tag,
        vehicle_brand: application.vehicle_brand,
        vehicle_condition: application.vehicle_condition || '',
        purchase_method: application.purchase_method || '',
        vehicle_options: application.vehicle_options || normalizeVehicleOptions(application),
        handler_name: application.handler_name,
        handler_role: application.handler_role,
        submitted_at: application.submitted_at,
        customer_call_back_at: application.customer_call_back_at || '',
        document_checklist: application.document_checklist || normalizeDocumentChecklist(application),
        personal_info: application.personal_info,
        emergency_contacts: application.emergency_contacts,
        employment_details: application.employment_details,
        preferences: application.preferences
      },
      'SUBMIT_TO_BANK'
    );
  };

  // Inline edits from the table are saved immediately without opening the drawer
  // Delivery checklist (meeting 2026-10-13): records or reopens one step and
  // writes only delivery_checklist, so the Operations Manager lane in
  // firestore.rules accepts it. A done step is always signed by the writer.
  const handleSaveDeliveryStep = async (
    id: string,
    stepKey: DeliveryStepKey,
    update: { done: boolean; note?: string; data?: Record<string, string>; document_ids?: string[] }
  ) => {
    const previous = applicationsRef.current.find((app) => app.id === id);
    const step = getDeliveryStep(stepKey);
    if (!previous || !step) {
      return false;
    }
    if (!canRecordDeliveryStep(stepKey, currentStaff, previous)) {
      triggerToast(tr('你不能记录这一步', 'You cannot record this step', 'Anda tidak boleh merekod langkah ini'), 'error');
      return false;
    }

    const now = new Date().toISOString();
    const checklist = previous.delivery_checklist || createEmptyDeliveryChecklist();
    const previousStep = checklist.steps[stepKey] || createEmptyDeliveryStepRecord();
    const nextStep: DeliveryStepRecord = {
      done_at: update.done ? (previousStep.done_at || now) : '',
      done_by: update.done ? currentStaff.name : '',
      done_by_role: update.done ? currentStaff.role : '',
      note: (update.note ?? previousStep.note).slice(0, 1000),
      document_ids: (update.document_ids ?? previousStep.document_ids).slice(0, 10),
      data: update.data ?? previousStep.data
    };
    const updatedApplication: LoanApplication = {
      ...previous,
      delivery_checklist: {
        steps: { ...checklist.steps, [stepKey]: nextStep },
        updated_at: now,
        updated_by: currentStaff.name
      }
    };

    const saved = await updateApplicationsState(replaceItemById(applicationsRef.current, updatedApplication));
    if (!saved) {
      const rolledBack = rollbackItemById(applicationsRef.current, updatedApplication, previous);
      applicationsRef.current = rolledBack;
      setApplications(rolledBack);
      writeLocalDashboardValue('applications', rolledBack);
      return false;
    }
    setSelectedApplication((current) => (current?.id === id ? updatedApplication : current));

    const stepLabel = step.label[1];
    appendAuditLog({
      action: update.done ? 'COMPLETE_DELIVERY_STEP' : 'UPDATE_DELIVERY_STEP',
      target_type: 'Loan Application',
      target_id: id,
      target_label: previous.applicant_name,
      changes: [
        ...(Boolean(previousStep.done_at) !== update.done
          ? [{ field: `delivery.${stepKey}`, old_value: previousStep.done_at ? 'Done' : 'Open', new_value: update.done ? 'Done' : 'Open' }]
          : []),
        ...(nextStep.note !== previousStep.note
          ? [{ field: `delivery.${stepKey}.note`, old_value: previousStep.note, new_value: nextStep.note }]
          : []),
        ...Object.keys({ ...previousStep.data, ...nextStep.data })
          .filter((key) => (previousStep.data[key] || '') !== (nextStep.data[key] || ''))
          .map((key) => ({ field: `delivery.${stepKey}.${key}`, old_value: previousStep.data[key] || '', new_value: nextStep.data[key] || '' }))
      ]
    });
    triggerToast(
      update.done
        ? tr(`已完成:${step.label[0]}`, `Done: ${stepLabel}`, `Selesai: ${step.label[2]}`)
        : tr(`已更新:${step.label[0]}`, `Updated: ${stepLabel}`, `Dikemas kini: ${step.label[2]}`),
      'success'
    );
    return true;
  };

  // Sales record a change of unit after approval (owner meeting 2026-10-13,
  // "add exchange"). Writes only unit_exchanges; Admin then updates the bank's
  // finance details. The primary vehicle is left for staff to change.
  const handleRecordUnitExchange = async (
    id: string,
    input: Omit<UnitExchange, 'id' | 'recorded_by' | 'recorded_by_role' | 'recorded_at' | 'from_model'>
  ) => {
    const previous = applicationsRef.current.find((app) => app.id === id);
    if (!previous) {
      return false;
    }
    const canRecord = isOperationsLead(currentStaff.role)
      || previous.handler_name === currentStaff.name
      || (currentStaff.role === 'Admin' && previous.admin_owner_name === currentStaff.name);
    if (!canRecord) {
      triggerToast(tr('只有负责这单的员工可以记录换车', 'Only the staff on this file can record a unit change', 'Hanya kakitangan fail ini boleh merekod pertukaran unit'), 'error');
      return false;
    }
    const vehicleModel = input.vehicle_model.trim();
    if (!vehicleModel || !input.loan_amount.trim()) {
      triggerToast(tr('请填写车型和批核贷款', 'Enter the vehicle model and the approved loan', 'Masukkan model kenderaan dan pinjaman diluluskan'), 'error');
      return false;
    }

    const now = new Date().toISOString();
    const exchange: UnitExchange = {
      id: `EXCH-${id}-${Date.now()}`,
      bank_application_id: input.bank_application_id,
      from_model: previous.unit_exchanges?.at(-1)?.vehicle_model || previous.vehicle_model || '',
      vehicle_model: vehicleModel,
      loan_amount: input.loan_amount.trim(),
      installment_years: input.installment_years.trim(),
      number_plate: input.number_plate.trim().toUpperCase(),
      mileage: input.mileage.trim(),
      recorded_by: currentStaff.name,
      recorded_by_role: currentStaff.role,
      recorded_at: now
    };
    const updatedApplication: LoanApplication = {
      ...previous,
      unit_exchanges: [...(previous.unit_exchanges || []), exchange].slice(-20)
    };

    const saved = await updateApplicationsState(replaceItemById(applicationsRef.current, updatedApplication));
    if (!saved) {
      const rolledBack = rollbackItemById(applicationsRef.current, updatedApplication, previous);
      applicationsRef.current = rolledBack;
      setApplications(rolledBack);
      writeLocalDashboardValue('applications', rolledBack);
      return false;
    }
    setSelectedApplication((current) => (current?.id === id ? updatedApplication : current));
    appendAuditLog({
      action: 'RECORD_UNIT_EXCHANGE',
      target_type: 'Loan Application',
      target_id: id,
      target_label: previous.applicant_name,
      changes: [
        { field: 'unit.vehicle_model', old_value: exchange.from_model, new_value: exchange.vehicle_model },
        { field: 'unit.loan_amount', old_value: '', new_value: exchange.loan_amount },
        { field: 'unit.installment_years', old_value: '', new_value: exchange.installment_years },
        ...(exchange.number_plate ? [{ field: 'unit.number_plate', old_value: '', new_value: exchange.number_plate }] : []),
        ...(exchange.mileage ? [{ field: 'unit.mileage', old_value: '', new_value: exchange.mileage }] : [])
      ]
    });
    triggerToast(tr(`已记录换车:${vehicleModel}`, `Unit change recorded: ${vehicleModel}`, `Pertukaran unit direkod: ${vehicleModel}`), 'success');
    return true;
  };

  const handleInlineUpdateApplication = async (
    id: string,
    updates: {
      status?: LoanStatus;
      remarks?: string;
      error_code?: string;
      error_codes?: string[];
      handler_name?: string;
      handler_role?: string;
    }
  ) => {
    const previous = applicationsRef.current.find((app) => app.id === id);
    if (!previous) {
      return;
    }

    const requestedHandler = String(updates.handler_name || '').trim();
    const selectedHandlerAccount = requestedHandler
      ? roleAccounts.find((account) => account.status === 'Active' && account.name === requestedHandler)
      : undefined;
    const canChangeAnyHandler = currentStaff.role === 'Super Admin';
    const isAssignedHandler = previous.handler_name === currentStaff.name;
    const { handler_name: _requestedHandlerName, handler_role: _requestedHandlerRole, ...nonHandlerUpdates } = updates;

    // SEO and staff-link-queue applications are assigned by the server, which
    // verifies the target is an Active Sales login; Rules refuse the direct
    // write. Super Admin edits that also change other fields keep the old path.
    if (
      requestedHandler
      && requestedHandler !== previous.handler_name
      && isOperationsLead(currentStaff.role)
      && isAwaitingHandlerAssignment(previous)
      && (currentStaff.role !== 'Super Admin' || Object.keys(nonHandlerUpdates).length === 0)
    ) {
      if (!selectedHandlerAccount || selectedHandlerAccount.role !== 'Sales') {
        triggerToast(tr('只能分配给在职的 Sales', 'Choose an active Sales account', 'Pilih akaun Jualan yang aktif'), 'error');
        return;
      }
      let assignedApplication: LoanApplication;
      try {
        assignedApplication = await assignCustomerHandlerThroughServer(previous, {
          id: selectedHandlerAccount.id,
          name: selectedHandlerAccount.name
        });
      } catch (error) {
        if (error instanceof CollectionItemVersionConflictError) {
          triggerToast(tr('客户资料已在其他设备更新，正在重新载入。', 'The customer changed on another device. Reloading the latest data.', "Pelanggan telah berubah pada peranti lain. Memuatkan semula data terkini."), 'error');
          reloadDashboard();
        } else {
          console.warn('Customer handler assignment failed.', error);
          triggerToast(tr(
            `分配失败：${error instanceof Error ? error.message : ''}`,
            `Assignment failed: ${error instanceof Error ? error.message : ''}`,
            `Penugasan gagal: ${error instanceof Error ? error.message : ''}`
          ), 'error');
        }
        return;
      }
      // After the await: patch the latest list, not the pre-request copy.
      const assignedApplications = replaceItemById(applicationsRef.current, assignedApplication);
      updateApplicationsState(assignedApplications);
      if (selectedApplication?.id === id) {
        setSelectedApplication(assignedApplication);
      }
      triggerToast(tr(`已把 ${previous.applicant_name} 交给 ${assignedApplication.handler_name} 负责`, `${previous.applicant_name} assigned to ${assignedApplication.handler_name}`, `${previous.applicant_name} diberikan kepada ${assignedApplication.handler_name}`));
      return;
    }

    const allowedUpdates: typeof nonHandlerUpdates = canChangeAnyHandler
      ? nonHandlerUpdates
      : isAssignedHandler && typeof nonHandlerUpdates.remarks === 'string'
        ? { remarks: nonHandlerUpdates.remarks }
        : {};
    const safeUpdates = requestedHandler && selectedHandlerAccount && canChangeAnyHandler
      ? { ...allowedUpdates, handler_name: selectedHandlerAccount.name, handler_role: selectedHandlerAccount.role }
      : allowedUpdates;

    if (Object.keys(safeUpdates).length === 0) {
      triggerToast(tr('你只能编辑自己负责客户的备注', 'You can only edit remarks for customers assigned to you', "Anda hanya boleh mengedit catatan pelanggan yang ditugaskan kepada anda"));
      return;
    }

    const requestedStatus = safeUpdates.status || previous.status;
    const inlineUpdatedAt = new Date().toISOString();
    const requestedErrorCodes = requestedStatus === LoanStatus.REJECT
      ? normalizeRejectCodes(safeUpdates.error_codes || safeUpdates.error_code || previous.error_codes || previous.error_code)
      : [];

    if (requestedStatus === LoanStatus.REJECT && requestedErrorCodes.length === 0) {
      triggerToast(tr('REJECT 结案必须有 CODE', 'A CODE is required before closing as REJECT', "KOD diperlukan sebelum menutup sebagai TOLAK"), 'error');
      return;
    }

    const statusChanged = requestedStatus !== previous.status;
    if (
      statusChanged
      && (requestedStatus === LoanStatus.REJECT || requestedStatus === LoanStatus.CANCELLED)
      && previous.deal_finance
      && previous.deal_finance.sale_status !== 'Cancelled'
      && isSettledDealFinance(previous.deal_finance)
    ) {
      triggerToast(tr(
        '这单佣金已付或财务已结案，不能直接改成 REJECT / CANCELLED。请先在 Finance Center 处理冲销。',
        'This deal is settled (commission paid or finance completed), so it cannot be moved to REJECT / CANCELLED here. Reverse it in Finance Center first.',
        'Urus niaga ini sudah diselesaikan (komisen dibayar atau kewangan selesai), jadi ia tidak boleh ditukar kepada TOLAK / DIBATALKAN di sini. Balikkan di Pusat Kewangan dahulu.'
      ), 'error');
      return;
    }
    const inlineWorkflowUpdates = statusChanged
      ? {
        pending_with: getLoanPendingWith({ status: requestedStatus }),
        pending_action: getLoanPendingAction({ status: requestedStatus }),
        pending_since: inlineUpdatedAt,
        action_due_at: '',
        active_bank_application_id: requestedStatus === LoanStatus.IN_PROCESS || requestedStatus === LoanStatus.APPROVE
          ? previous.active_bank_application_id || ''
          : ''
      }
      : {};

    const updated: LoanApplication[] = applicationsRef.current.map((app): LoanApplication => {
      if (app.id === id) {
        const nextStatus = requestedStatus;
        const nextErrorCodes = requestedErrorCodes;
        // Super Admin only — see handleSaveApplication for the rationale.
        const shouldCancelFinance = (
          currentStaff.role === 'Super Admin' &&
          (nextStatus === LoanStatus.REJECT || nextStatus === LoanStatus.CANCELLED) &&
          app.deal_finance &&
          app.deal_finance.sale_status !== 'Cancelled'
        );
        const normalizedUpdates = {
          ...safeUpdates,
          ...inlineWorkflowUpdates,
          error_code: nextErrorCodes[0] || '',
          error_codes: nextErrorCodes
        };

        return {
          ...app,
          ...normalizedUpdates,
          deal_finance: shouldCancelFinance && app.deal_finance
            ? {
              ...app.deal_finance,
              sale_status: 'Cancelled',
              delivery_at: '',
              finance_completed_at: '',
              account_verified_at: '',
              account_verified_by: '',
              commission_status: 'Reversed',
              commission_paid_at: '',
              updated_at: inlineUpdatedAt,
              updated_by: currentStaff.name
            }
            : app.deal_finance,
          activity_thread: app.status !== nextStatus
            ? [
              createStatusActivityEntry(currentStaff, app.status, nextStatus),
              ...normalizeActivityThread(app.activity_thread)
            ]
            : normalizeActivityThread(app.activity_thread)
        };
      }

      return app;
    });

    const updatedApplication = updated.find((application) => application.id === id);
    const inlineFinanceNeedsCancel = (
      (requestedStatus === LoanStatus.REJECT || requestedStatus === LoanStatus.CANCELLED) &&
      !!previous.deal_finance &&
      previous.deal_finance.sale_status !== 'Cancelled'
    );
    // Only Super Admin may release the reservation (vehicle_stock_reservations
    // is isSuperAdmin() in firestore.rules). Others keep the status change and
    // hand the settlement reversal to Super Admin.
    const releasedStockUnitId = (inlineFinanceNeedsCancel && currentStaff.role === 'Super Admin')
      ? previous.deal_finance?.stock_unit_id || ''
      : '';
    if (inlineFinanceNeedsCancel && currentStaff.role !== 'Super Admin') {
      triggerToast(tr(
        '这单已有财务记录，状态已更新，但佣金与库存要 Super Admin 在 Finance Center 冲销。',
        'This deal has a finance record. The status was updated, but Super Admin must reverse the commission and release the stock unit in Finance Center.',
        "Urus niaga ini mempunyai rekod kewangan. Status dikemas kini, tetapi Pentadbir Super perlu membalikkan komisen dan melepaskan unit stok di Pusat Kewangan."
      ));
    }
    let inlineVehicleCatalog = vehicleCatalog;

    if (releasedStockUnitId && updatedApplication) {
      try {
        await saveDealFinanceWithStockReservationToFirebase(updatedApplication, releasedStockUnitId, currentStaff.name, { expectedFinanceUpdatedAt: previous.deal_finance?.updated_at || '' });
      } catch (error) {
        if (error instanceof CollectionItemVersionConflictError) {
          triggerToast(tr('客户资料已在其他设备更新，正在重新载入。', 'The customer changed on another device. Reloading the latest data.', "Pelanggan telah berubah pada peranti lain. Memuatkan semula data terkini."), 'error');
          reloadDashboard();
        } else {
          triggerToast(tr('无法原子释放库存，贷款状态没有修改。', 'The stock unit could not be released atomically; the loan was not changed.', "Unit stok tidak dapat dilepaskan secara atom; pinjaman tidak diubah."), 'error');
        }
        return;
      }
      inlineVehicleCatalog = normalizeVehicleCatalogList(vehicleCatalog.map((catalog) => ({
        ...catalog,
        stock_units: (catalog.stock_units || []).map((unit) => (
          unit.id === releasedStockUnitId && (unit.reserved_application_id === id || unit.sold_application_id === id)
            ? { ...unit, status: 'In Stock', reserved_application_id: '', sold_application_id: '', delivered_at: '', updated_at: inlineUpdatedAt, updated_by: currentStaff.name }
            : unit
        ))
      })));
    }

    // Rebase on the latest list after the stock-release await and patch only
    // this row, so other staff's realtime edits are not written back stale.
    const savedApplications = updatedApplication
      ? replaceItemById(applicationsRef.current, updatedApplication)
      : applicationsRef.current;
    updateApplicationsState(savedApplications);
    if (inlineVehicleCatalog !== vehicleCatalog) updateVehicleCatalogState(inlineVehicleCatalog);

    const inlineTaskCompletionChanges = updatedApplication
      ? createTaskCompletionAuditChanges(
        buildLoanTaskCompletionDescriptors(previous, updatedApplication, inlineUpdatedAt)
      )
      : [];
    appendAuditLog({
      action: 'INLINE_UPDATE_LOAN_APPLICATION',
      target_type: 'Loan Application',
      target_id: id,
      target_label: previous.applicant_name,
      changes: [
        ...createAuditChanges(previous, {
          ...previous,
          ...safeUpdates,
          ...inlineWorkflowUpdates,
          error_code: (safeUpdates.status || previous.status) === LoanStatus.REJECT
            ? normalizeRejectCodes(safeUpdates.error_codes || safeUpdates.error_code || previous.error_codes || previous.error_code)[0] || ''
            : '',
          error_codes: (safeUpdates.status || previous.status) === LoanStatus.REJECT
            ? normalizeRejectCodes(safeUpdates.error_codes || safeUpdates.error_code || previous.error_codes || previous.error_code)
            : []
        }),
        ...inlineTaskCompletionChanges
      ],
      stateOverrides: { applications: savedApplications, vehicleCatalog: inlineVehicleCatalog }
    });

    if (selectedApplication?.id === id) {
      const updatedSelected = updatedApplication || null;
      setSelectedApplication(updatedSelected);
    }

    const reassignedHandler = 'handler_name' in safeUpdates ? safeUpdates.handler_name : undefined;
    if (reassignedHandler && previous.handler_name !== reassignedHandler) {
      triggerToast(tr(`已把 ${previous.applicant_name} 交给 ${reassignedHandler} 负责`, `${previous.applicant_name} assigned to ${reassignedHandler}`, `${previous.applicant_name} diberikan kepada ${reassignedHandler}`));
    }
  };

  const handleAddCustomerActivityComment = (
    id: string,
    body: string,
    taggedRoles: RoleAccountRole[],
    taggedStaffNames: string[] = []
  ) => {
    const trimmedBody = body.trim();
    const previous = applications.find((app) => app.id === id);

    if (!previous || !trimmedBody) {
      return;
    }

    const entry: CustomerActivityEntry = {
      id: createCustomerActivityId(),
      type: 'comment',
      body: trimmedBody,
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      created_at: new Date().toISOString(),
      tagged_staff_names: uniqueStrings(taggedStaffNames),
      tagged_roles: uniqueRoles(taggedRoles)
    };
    const updated = applications.map((app) => (
      app.id === id
        ? {
          ...app,
          activity_thread: [entry, ...normalizeActivityThread(app.activity_thread)]
        }
        : app
    ));
    const visibleTaggedRoles = uniqueRoles(taggedRoles);
    const nextNotifications = visibleTaggedRoles.length > 0 || taggedStaffNames.length > 0
      ? [
        {
          id: createNotificationId(),
          type: 'internal_comment_tagged' as const,
          severity: 'info' as const,
          title: 'Internal comment tagged',
          message: `${currentStaff.name} @${[...visibleTaggedRoles, ...uniqueStrings(taggedStaffNames)].join(' @')}: ${trimmedBody}`,
          recipient_staff_names: uniqueStrings(taggedStaffNames),
          recipient_roles: visibleTaggedRoles,
          target_type: 'customer' as const,
          target_id: previous.id,
          target_label: previous.applicant_name,
          dedupe_key: `internal_comment_tagged:${entry.id}`,
          created_at: entry.created_at,
          read_by: []
        },
        ...notifications
      ]
      : notifications;

    setApplications(updated);
    writeLocalDashboardValue('applications', updated);
    if (nextNotifications !== notifications) {
      const normalizedNotifications = normalizeNotificationList(nextNotifications);
      setNotifications(normalizedNotifications);
      writeLocalDashboardValue('notifications', normalizedNotifications);
    }

    appendAuditLog({
      action: 'ADD_INTERNAL_COMMENT',
      target_type: 'Customer Activity',
      target_id: id,
      target_label: previous.applicant_name,
      changes: createAuditChanges({}, {
        comment: trimmedBody,
        tagged_roles: visibleTaggedRoles.join(', '),
        tagged_staff_names: taggedStaffNames.join(', ')
      }),
      stateOverrides: {
        applications: updated,
        notifications: normalizeNotificationList(nextNotifications)
      }
    });

    if (selectedApplication?.id === id) {
      setSelectedApplication(updated.find((app) => app.id === id) || null);
    }

    triggerToast('Internal comment added');
  };

  const handleUpdateCustomerProfile = (
    id: string,
    updates: Pick<LoanApplication, 'applicant_name' | 'phone_no' | 'ic_no' | 'vehicle_plate' | 'vehicle_model' | 'vehicle_condition' | 'purchase_method' | 'handler_name' | 'handler_role'>
  ) => {
    const previous = applications.find((app) => app.id === id);
    if (!previous) {
      return false;
    }

    const canEditCustomerProfile = currentStaff.role === 'Super Admin' || previous.handler_name === currentStaff.name;
    if (!canEditCustomerProfile) {
      triggerToast(tr('只有 Super Admin 或当前负责人可以编辑这位客户', 'Only Super Admin or the assigned handler can edit this customer', "Hanya Pentadbir Super atau pengendali yang ditugaskan boleh mengedit pelanggan ini"));
      return false;
    }

    const safeUpdates = currentStaff.role === 'Super Admin'
      ? updates
      : {
        ...updates,
        handler_name: previous.handler_name,
        handler_role: previous.handler_role
      };

    const inferredUpdates = {
      ...safeUpdates,
      ...detectVehicleFromModel(safeUpdates.vehicle_model),
      document_checklist: normalizeDocumentChecklist({
        document_checklist: previous.document_checklist || [],
        payslip_documents: previous.payslip_documents || [],
        purchase_method: safeUpdates.purchase_method,
        vehicle_condition: safeUpdates.vehicle_condition
      }),
      vehicle_options: normalizeVehicleOptions({
        ...previous,
        vehicle_model: safeUpdates.vehicle_model,
        vehicle_condition: safeUpdates.vehicle_condition,
        purchase_method: safeUpdates.purchase_method,
        vehicle_options: [
          {
            ...(previous.vehicle_options?.[0] || {}),
            id: previous.vehicle_options?.[0]?.id || `VEH-OPTION-${previous.id}-01`,
            vehicle_model: safeUpdates.vehicle_model,
            ...detectVehicleFromModel(safeUpdates.vehicle_model),
            vehicle_condition: safeUpdates.vehicle_condition || '',
            purchase_method: safeUpdates.purchase_method || '',
            priority: 1
          }
        ]
      })
    };

    const completedAt = new Date().toISOString();
    const nextApplication = { ...previous, ...inferredUpdates };
    const taskCompletionChanges = createTaskCompletionAuditChanges(
      buildLoanTaskCompletionDescriptors(previous, nextApplication, completedAt)
    );
    const updated = applications.map((app) => (
      app.id === id
        ? nextApplication
        : app
    ));

    updateApplicationsState(updated);
    appendAuditLog({
      action: 'UPDATE_CUSTOMER_PROFILE',
      target_type: 'Customer',
      target_id: id,
      target_label: previous.applicant_name,
      changes: [
        ...createAuditChanges(
          {
            applicant_name: previous.applicant_name,
            phone_no: previous.phone_no,
            ic_no: previous.ic_no,
            vehicle_plate: previous.vehicle_plate,
            vehicle_model: previous.vehicle_model,
            vehicle_tag: previous.vehicle_tag,
            vehicle_brand: previous.vehicle_brand,
            vehicle_condition: previous.vehicle_condition || '',
            purchase_method: previous.purchase_method || '',
            handler_name: previous.handler_name,
            handler_role: previous.handler_role
          },
          inferredUpdates
        ),
        ...taskCompletionChanges
      ],
      stateOverrides: { applications: updated }
    });

    if (selectedApplication?.id === id) {
      setSelectedApplication(updated.find((app) => app.id === id) || null);
    }

    triggerToast(tr(`客户 ${id} 资料已更新`, `Customer ${id} updated`, `Pelanggan ${id} dikemas kini`));
    return true;
  };

  const handleUpdateMissingInfoFromTaskInbox = async (
    application: LoanApplication,
    updates: { vehicle_condition: VehicleCondition; purchase_method: PurchaseMethod }
  ) => handleUpdateCustomerProfile(application.id, {
    applicant_name: application.applicant_name,
    phone_no: application.phone_no,
    ic_no: application.ic_no,
    vehicle_plate: application.vehicle_plate,
    vehicle_model: application.vehicle_model,
    vehicle_condition: updates.vehicle_condition,
    purchase_method: updates.purchase_method,
    handler_name: application.handler_name,
    handler_role: application.handler_role
  });

  const handleAddCustomer = (
    customer: Pick<LoanApplication, 'applicant_name' | 'phone_no' | 'ic_no' | 'vehicle_plate' | 'vehicle_model' | 'vehicle_condition' | 'purchase_method' | 'handler_name' | 'handler_role' | 'personal_info' | 'emergency_contacts' | 'employment_details' | 'preferences' | 'payslip_documents'> & {
      total_cash_price: string;
      motor_mileage: string;
      /** Typed on Add New Customer, e.g. the payslip PDF password (owner 2026-10-20). */
      remarks?: string;
    }
  ) => {
    const submittedAt = new Date().toISOString();
    const year = new Date().getFullYear();
    const nextSequence = applications.length + 1;
    const id = `APP-${year}-${String(nextSequence).padStart(3, '0')}-${Date.now().toString().slice(-4)}`;
    const detectedVehicle = detectVehicleFromModel(customer.vehicle_model);
    const isCashPurchase = customer.purchase_method === 'Cash';
    // Sales-created Cash and Loan applications stay with that Handler until
    // Sales explicitly completes the application and uses Notify Admin. Admin
    // and Super Admin creations start in their own Admin review queue.
    const isSalesCreatedApplication = currentStaff.role === 'Sales';
    const assignedAdminOwner = !isSalesCreatedApplication
      ? currentStaff.name
      : '';
    const newApplication: LoanApplication = {
      id,
      applicant_name: customer.applicant_name.trim(),
      phone_no: customer.phone_no.trim(),
      ic_no: customer.ic_no.trim(),
      vehicle_plate: customer.vehicle_plate.trim().toUpperCase(),
      vehicle_model: customer.vehicle_model.trim(),
      vehicle_tag: detectedVehicle.vehicle_tag,
      vehicle_brand: detectedVehicle.vehicle_brand,
      vehicle_condition: customer.vehicle_condition || '',
      purchase_method: customer.purchase_method || '',
      vehicle_options: [
        {
          id: `VEH-OPTION-${id}-01`,
          vehicle_model: customer.vehicle_model.trim(),
          vehicle_tag: detectedVehicle.vehicle_tag,
          vehicle_brand: detectedVehicle.vehicle_brand,
          vehicle_condition: customer.vehicle_condition || '',
          purchase_method: customer.purchase_method || '',
          total_cash_price: isCashPurchase ? customer.total_cash_price.trim() : '',
          motor_mileage: customer.vehicle_condition === 'Used'
            ? customer.motor_mileage.trim()
            : '',
          priority: 1
        }
      ],
      handler_name: currentStaff.name,
      handler_role: currentStaff.role,
      admin_owner_name: assignedAdminOwner,
      pending_with: isSalesCreatedApplication ? 'Handler' : 'Admin',
      pending_action: isSalesCreatedApplication ? 'Complete Application' : 'Review Application',
      pending_since: submittedAt,
      action_due_at: isSalesCreatedApplication ? '' : getInitialAdminReviewDueIso(submittedAt),
      active_bank_application_id: '',
      status: LoanStatus.NEW,
      error_code: '',
      error_codes: [],
      remarks: customer.remarks?.trim() || 'New customer application created from customer list.',
      submitted_at: submittedAt,
      customer_call_back_at: '',
      personal_info: normalizePersonalInfo(customer.personal_info),
      emergency_contacts: normalizeEmergencyContacts(customer.emergency_contacts),
      employment_details: normalizeEmploymentDetails(customer.employment_details),
      preferences: normalizePreferences(customer.preferences),
      payslip_documents: customer.payslip_documents || [],
      document_checklist: normalizeDocumentChecklist({
        document_checklist: [],
        payslip_documents: customer.payslip_documents || [],
        purchase_method: customer.purchase_method || '',
        vehicle_condition: customer.vehicle_condition || ''
      }),
      bank_applications: []
    };
    const updated = [newApplication, ...applications];

    updateApplicationsState(updated);
    appendAuditLog({
      action: 'ADD_CUSTOMER',
      target_type: 'Customer',
      target_id: id,
      target_label: newApplication.applicant_name,
      changes: createAuditChanges({}, {
        applicant_name: newApplication.applicant_name,
        phone_no: newApplication.phone_no,
        ic_no: newApplication.ic_no,
        vehicle_plate: newApplication.vehicle_plate,
        vehicle_model: newApplication.vehicle_model,
        vehicle_tag: newApplication.vehicle_tag,
        vehicle_brand: newApplication.vehicle_brand,
        vehicle_condition: newApplication.vehicle_condition || '',
        purchase_method: newApplication.purchase_method || '',
        vehicle_options: JSON.stringify(newApplication.vehicle_options || []),
        personal_info: JSON.stringify(newApplication.personal_info),
        emergency_contacts: JSON.stringify(newApplication.emergency_contacts),
        employment_details: JSON.stringify(newApplication.employment_details),
        preferences: JSON.stringify(newApplication.preferences),
        payslip_documents: summarizePayslipDocuments(newApplication.payslip_documents || []),
        handler_name: newApplication.handler_name,
        handler_role: newApplication.handler_role,
        admin_owner_name: newApplication.admin_owner_name || '',
        status: newApplication.status
      }),
      stateOverrides: { applications: updated }
    });
    setSelectedApplication(newApplication);
    setIsDrawerOpen(true);
    triggerToast(tr(`客户 ${newApplication.applicant_name} 已新增`, `Customer ${newApplication.applicant_name} added`, `Pelanggan ${newApplication.applicant_name} ditambahkan`));
  };

  return {
    handleSelectRow,
    handleAssignApplicationAdmin,
    handleOpenApplicationTarget,
    handleOpenBankPage,
    handleOpenNotificationTarget,
    handleSaveApplication,
    handleCompleteCashAcceptanceFromTaskInbox,
    handleSubmitToBankFromTable,
    handleInlineUpdateApplication,
    handleSaveDeliveryStep,
    handleRecordUnitExchange,
    handleAddCustomerActivityComment,
    handleUpdateCustomerProfile,
    handleUpdateMissingInfoFromTaskInbox,
    handleAddCustomer
  };
}
