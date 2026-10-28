/**
 * Customer intake and related actions: the public intake form draft and
 * submit, vehicle-info missions, short links (customer intake / WhatsApp),
 * and business approval requests (add / review). Moved verbatim from
 * App.tsx; every value the handlers used from App's closure is now an
 * explicit dependency under its original name.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import type * as React from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type * as Repository from '../services/dashboardRepository';
import type { DashboardState } from '../services/dashboardRepository';
import { buildShortLinkIntakeAssignments } from '../../shared/staffLinkQueue.mjs';
import { type CustomerIntakeDocumentDraft, type CustomerIntakeDraft, type CustomerIntakeSubmitError } from '../components/PublicCustomerIntakePage';
import { type VehicleInfoMissionDraft } from '../components/StaffVehicleInfoMissionPanel';
import { tr } from '../lib/i18n';
import { trackPublicEvent } from '../lib/publicAnalytics';
import { buildPublicSiteUrl } from '../lib/publicUrls';
import { ApprovalRequest, ApprovalRequestStatus, AuditLogEntry, CustomerIntakeShortLink, CustomerIntakeTracking, LoanApplication, LoanStatus, normalizeVehicleModel, PayslipDocument, PurchaseMethod, type RoleAccount, type RoleAccountRole, type TagNormalizationRule, type VehicleCatalogItem, type VehicleCondition, type VehiclePurchaseOption, WhatsAppTrackingLink } from '../types';
import { createEmptyCustomerEmploymentDetails as createEmptyEmploymentDetails, createEmptyCustomerPersonalInfo as createEmptyPersonalInfo, createEmptyCustomerPreferences as createEmptyPreferences, getEmploymentDuration, hasChildrenQuestion, normalizeEmergencyContacts } from '../utils/customerApplicationForm';
import { getCustomerIntakeValidationIssues } from '../utils/customerIntakeValidation';
import { normalizeDocumentChecklist } from '../utils/documentChecklist';
import { newId } from '../utils/id';
import { removeItemById } from '../utils/latestListPatch';
import { formatMalaysiaPhoneNumber } from '../utils/malaysiaPhone';
import { type StaffSession } from './useStaffSessionAuth';

/**
 * The remarks a public intake starts with: the intake note, then the customer's own
 * remark (e.g. the payslip PDF password, owner 2026-10-20) on the same line, because
 * the Rules match remarks with ^.{0,1000}$ and "." stops at a line break.
 */
export const buildPublicIntakeRemarks = (isSeoIntake: boolean, customerRemark: string) => {
  const note = isSeoIntake
    ? 'SEO website application awaiting Super Admin handler assignment.'
    : 'New customer application submitted for Sales review.';
  const remark = customerRemark.replace(/\s+/g, ' ').trim().slice(0, 600);
  return remark ? `${note} Customer remark: ${remark}` : note;
};

export interface CustomerIntakeAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface CustomerIntakeActionsDeps {
  currentStaff: StaffSession;
  appendAuditLog: ({ action, target_type, target_id, target_label, changes, stateOverrides }: { action: string; target_type: string; target_id: string; target_label: string; changes: AuditLogEntry["changes"]; stateOverrides?: Partial<DashboardState>; }) => void;
  applications: LoanApplication[];
  applicationsRef: React.RefObject<LoanApplication[]>;
  approvalRequests: ApprovalRequest[];
  auditLogs: AuditLogEntry[];
  auditLogsRef: React.RefObject<AuditLogEntry[]>;
  classifyCustomerIntakeSubmitError: (error: unknown) => CustomerIntakeSubmitError;
  clientContext: { ip_address: string; user_agent: string; };
  createAuditChanges: <Before extends object, After extends object>(before: Before, after: After) => { field: string; old_value: string; new_value: string; }[];
  createPublicApplicationId: () => string;
  customerIntakeParams: URLSearchParams;
  customerIntakeShortLinks: CustomerIntakeShortLink[];
  detectVehicleFromModel: (model: string, catalog?: VehicleCatalogItem[], rules?: TagNormalizationRule[]) => { vehicle_tag: string; vehicle_brand: string; };
  EMPTY_INTAKE_DRAFT: CustomerIntakeDraft;
  formatMalaysiaIcNumber: (value: string) => string;
  getCustomerIntakeFingerprint: (draft: CustomerIntakeDraft, documents: CustomerIntakeDocumentDraft[]) => string;
  intakeDraft: { applicant_name: string; phone_no: string; ic_no: string; vehicle_model: string; vehicle_condition: VehicleCondition; purchase_method: PurchaseMethod; total_cash_price: string; motor_mileage: string; email: string; full_address: string; resident_address: string; bank_name: string; account_number: string; gender: string; race: string; marital_status: string; number_of_children: string; housing_status: string; years_at_residence: string; residence_start_year: string; residence_start_month: string; emergency_contact_1_full_name: string; emergency_contact_1_relationship: string; emergency_contact_1_full_address: string; emergency_contact_1_phone_no: string; emergency_contact_2_full_name: string; emergency_contact_2_relationship: string; emergency_contact_2_full_address: string; emergency_contact_2_phone_no: string; company_name: string; position: string; years_employed: string; employment_start_year: string; employment_start_month: string; company_address: string; office_phone_no: string; gross_monthly_salary: string; net_monthly_salary: string; available_to_receive_calls: string; salary_payment_method: string; preferred_motorcycle: string; loan_tenure: string; customer_remark: string; };
  intakePendingAttemptRef: React.RefObject<{ draft: CustomerIntakeDraft; documents: CustomerIntakeDocumentDraft[]; }>;
  intakeSubmitInFlightRef: React.RefObject<boolean>;
  intakeSubmitting: boolean;
  isSeoCustomerIntake: (params: URLSearchParams) => boolean;
  loadPublicIntakeShortLinkFromRemote: (code: string) => Promise<CustomerIntakeShortLink>;
  missionDrafts: Record<string, VehicleInfoMissionDraft>;
  normalizePublicIntakeRole: (role?: string | null) => RoleAccountRole;
  normalizeVehicleOptions: (app: LoanApplication, catalog?: VehicleCatalogItem[], rules?: TagNormalizationRule[]) => VehiclePurchaseOption[];
  readPendingPublicIntakeId: () => string;
  roleAccounts: RoleAccount[];
  saveShortLinkToRemote: (link: CustomerIntakeShortLink) => Promise<CustomerIntakeShortLink>;
  selectLoanAdminOwner: (applicationId: string, accounts: RoleAccount[]) => string;
  setApplications: React.Dispatch<React.SetStateAction<LoanApplication[]>>;
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>;
  setIntakeDraft: React.Dispatch<React.SetStateAction<{ applicant_name: string; phone_no: string; ic_no: string; vehicle_model: string; vehicle_condition: VehicleCondition; purchase_method: PurchaseMethod; total_cash_price: string; motor_mileage: string; email: string; full_address: string; resident_address: string; bank_name: string; account_number: string; gender: string; race: string; marital_status: string; number_of_children: string; housing_status: string; years_at_residence: string; residence_start_year: string; residence_start_month: string; emergency_contact_1_full_name: string; emergency_contact_1_relationship: string; emergency_contact_1_full_address: string; emergency_contact_1_phone_no: string; emergency_contact_2_full_name: string; emergency_contact_2_relationship: string; emergency_contact_2_full_address: string; emergency_contact_2_phone_no: string; company_name: string; position: string; years_employed: string; employment_start_year: string; employment_start_month: string; company_address: string; office_phone_no: string; gross_monthly_salary: string; net_monthly_salary: string; available_to_receive_calls: string; salary_payment_method: string; preferred_motorcycle: string; loan_tenure: string; customer_remark: string; }>>;
  setIntakeSubmitError: React.Dispatch<React.SetStateAction<CustomerIntakeSubmitError>>;
  setIntakeSubmittedApplicationId: React.Dispatch<React.SetStateAction<string>>;
  setIntakeSubmittedWithoutLaterChanges: React.Dispatch<React.SetStateAction<boolean>>;
  setIntakeSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setMissionDrafts: React.Dispatch<React.SetStateAction<Record<string, VehicleInfoMissionDraft>>>;
  submitPublicIntakeToRemote: (application: LoanApplication, auditLog: AuditLogEntry | undefined, fallbackAssignment?: Pick<LoanApplication, "handler_name" | "handler_role" | "admin_owner_name"> | null) => Promise<LoanApplication>;
  triggerToast: (message: string, tone?: "success" | "warning" | "error") => void;
  updateApplicationsState: (updatedList: LoanApplication[]) => Promise<boolean>;
  updateApprovalRequestsState: (updatedList: ApprovalRequest[]) => Promise<boolean>;
  updateCustomerIntakeShortLinksState: (updatedList: CustomerIntakeShortLink[]) => Promise<boolean>;
  writePendingPublicIntakeId: (id: string) => void;
}

export function useCustomerIntakeActions({
  currentStaff,
  appendAuditLog,
  applications,
  applicationsRef,
  approvalRequests,
  auditLogs,
  auditLogsRef,
  classifyCustomerIntakeSubmitError,
  clientContext,
  createAuditChanges,
  createPublicApplicationId,
  customerIntakeParams,
  customerIntakeShortLinks,
  detectVehicleFromModel,
  EMPTY_INTAKE_DRAFT,
  formatMalaysiaIcNumber,
  getCustomerIntakeFingerprint,
  intakeDraft,
  intakePendingAttemptRef,
  intakeSubmitInFlightRef,
  intakeSubmitting,
  isSeoCustomerIntake,
  loadPublicIntakeShortLinkFromRemote,
  missionDrafts,
  normalizePublicIntakeRole,
  normalizeVehicleOptions,
  readPendingPublicIntakeId,
  roleAccounts,
  saveShortLinkToRemote,
  selectLoanAdminOwner,
  setApplications,
  setAuditLogs,
  setIntakeDraft,
  setIntakeSubmitError,
  setIntakeSubmittedApplicationId,
  setIntakeSubmittedWithoutLaterChanges,
  setIntakeSubmitting,
  setMissionDrafts,
  submitPublicIntakeToRemote,
  triggerToast,
  updateApplicationsState,
  updateApprovalRequestsState,
  updateCustomerIntakeShortLinksState,
  writePendingPublicIntakeId
}: CustomerIntakeActionsDeps) {
  const updateIntakeDraft = (field: keyof CustomerIntakeDraft, value: string) => {
    setIntakeSubmitError('');
    setIntakeDraft((current) => {
      if (field !== 'purchase_method') {
        const next = { ...current, [field]: value };
        // Year + month picked on the public form (meeting 2026-10-13): the whole
        // years stay in years_at_residence / years_employed for the bank text and Rules.
        if (field === 'residence_start_year' || field === 'residence_start_month') {
          const duration = getEmploymentDuration(next.residence_start_year, next.residence_start_month);
          next.years_at_residence = duration ? String(duration.years) : '';
        }
        if (field === 'employment_start_year' || field === 'employment_start_month') {
          const duration = getEmploymentDuration(next.employment_start_year, next.employment_start_month);
          next.years_employed = duration ? String(duration.years) : '';
        }
        return next;
      }
      if (value === 'Cash') {
        return {
          ...current,
          purchase_method: 'Cash',
          bank_name: '',
          account_number: '',
          gender: '',
          race: '',
          marital_status: '',
          number_of_children: '',
          housing_status: '',
          years_at_residence: '',
          residence_start_year: '',
          residence_start_month: '',
          emergency_contact_1_full_name: '',
          emergency_contact_1_relationship: '',
          emergency_contact_1_full_address: '',
          emergency_contact_1_phone_no: '',
          emergency_contact_2_full_name: '',
          emergency_contact_2_relationship: '',
          emergency_contact_2_full_address: '',
          emergency_contact_2_phone_no: '',
          company_name: '',
          position: '',
          years_employed: '',
          employment_start_year: '',
          employment_start_month: '',
          company_address: '',
          office_phone_no: '',
          gross_monthly_salary: '',
          net_monthly_salary: '',
          available_to_receive_calls: '',
          salary_payment_method: '',
          loan_tenure: ''
        };
      }
      return {
        ...current,
        purchase_method: value as PurchaseMethod,
        total_cash_price: '',
        motor_mileage: ''
      };
    });
  };

  const createCustomerIntakeTracking = (): CustomerIntakeTracking => {
    const seoIntake = isSeoCustomerIntake(customerIntakeParams);

    return {
      sales_name: seoIntake ? 'SEO' : customerIntakeParams.get('sales') || '',
      sales_role: seoIntake ? 'Sales' : customerIntakeParams.get('role') || '',
      staff_utm: seoIntake ? 'SEO' : customerIntakeParams.get('ci_utm_staff') || '',
      utm_source: customerIntakeParams.get('ci_utm_source') || (seoIntake ? customerIntakeParams.get('utm_source') || '' : ''),
      utm_medium: customerIntakeParams.get('ci_utm_medium') || (seoIntake ? customerIntakeParams.get('utm_medium') || '' : ''),
      utm_campaign: customerIntakeParams.get('ci_utm_campaign') || (seoIntake ? customerIntakeParams.get('utm_campaign') || '' : ''),
      utm_content: customerIntakeParams.get('ci_utm_content') || (seoIntake ? customerIntakeParams.get('utm_content') || '' : ''),
      utm_term: customerIntakeParams.get('ci_utm_term') || (seoIntake ? customerIntakeParams.get('utm_term') || '' : ''),
      shared_at: customerIntakeParams.get('shared_at') || '',
      short_link_code: customerIntakeParams.get('ci_link_code') || '',
      submitted_from: seoIntake ? 'seo_website' : 'customer_intake_link'
    };
  };

  const handleSubmitCustomerIntake = async (documents: CustomerIntakeDocumentDraft[]) => {
    if (intakeSubmitting || intakeSubmitInFlightRef.current) {
      return;
    }
    // The website SEO form is retired; old links show a WhatsApp page instead.
    if (isSeoCustomerIntake(customerIntakeParams)) {
      return;
    }

    // After a timeout the earlier attempt may still land on the server, and a
    // guard match cannot tell which content it carried. So a retry re-sends the
    // exact content of that attempt; edits made meanwhile are reported, not
    // silently dropped or silently claimed as saved.
    const pendingAttempt = intakePendingAttemptRef.current;
    const submitDraft = pendingAttempt?.draft ?? intakeDraft;
    const submitDocuments = pendingAttempt?.documents ?? documents;
    const changedSinceAttempt = Boolean(pendingAttempt) && (
      getCustomerIntakeFingerprint(intakeDraft, documents)
      !== getCustomerIntakeFingerprint(pendingAttempt!.draft, pendingAttempt!.documents)
    );

    const applicantName = submitDraft.applicant_name.trim();
    const phoneNo = formatMalaysiaPhoneNumber(submitDraft.phone_no);
    const icNo = formatMalaysiaIcNumber(submitDraft.ic_no);
    const vehicleModel = submitDraft.vehicle_model.trim();
    const purchaseMethod = submitDraft.purchase_method;
    const isCashPurchase = purchaseMethod === 'Cash';

    if (getCustomerIntakeValidationIssues(submitDraft).length > 0) {
      return;
    }

    // A staff short link is routed by its live record, not by the names baked
    // into the URL: a renamed owner keeps receiving leads, and a deactivated or
    // deleted link stops before anything is uploaded or saved.
    const shortLinkCode = customerIntakeParams.get('ci_link_code') || '';
    let intakeShortLink: CustomerIntakeShortLink | null | undefined;
    if (shortLinkCode) {
      setIntakeSubmitError('');
      setIntakeSubmitting(true);
      intakeSubmitInFlightRef.current = true;
      let linkError: CustomerIntakeSubmitError = '';
      try {
        intakeShortLink = await loadPublicIntakeShortLinkFromRemote(shortLinkCode);
        if (intakeShortLink === null || (intakeShortLink && intakeShortLink.active !== true)) {
          linkError = 'link-inactive';
        }
      } catch (error) {
        console.warn('Public intake short link could not be loaded.', error);
        linkError = classifyCustomerIntakeSubmitError(error);
      }
      if (linkError) {
        setIntakeSubmitError(linkError);
        intakeSubmitInFlightRef.current = false;
        setIntakeSubmitting(false);
        return;
      }
    }
    const shortLinkAssignments = intakeShortLink ? buildShortLinkIntakeAssignments(intakeShortLink) : null;

    const submittedAt = new Date().toISOString();
    // Retries reuse the id of the unconfirmed attempt, so an earlier attempt
    // that reached the server is recognised by its guard instead of creating a
    // second customer. Only the id is kept, never the customer's details.
    const id = readPendingPublicIntakeId() || createPublicApplicationId();
    writePendingPublicIntakeId(id);
    const tracking: CustomerIntakeTracking = shortLinkAssignments
      ? { ...createCustomerIntakeTracking(), ...shortLinkAssignments.tracking }
      : createCustomerIntakeTracking();
    const isSeoIntake = tracking.submitted_from === 'seo_website';
    // Every loan keeps a bank account, cash salary too (owner 2026-10-20).
    const keepsBankAccount = !isCashPurchase;
    const handlerName = shortLinkAssignments
      ? shortLinkAssignments.owner.handler_name
      : isSeoIntake ? 'SEO' : tracking.sales_name || customerIntakeParams.get('handler') || 'Unassigned';
    const matchedHandler = roleAccounts.find((account) => account.name === handlerName);
    const handlerRole = shortLinkAssignments
      ? normalizePublicIntakeRole(shortLinkAssignments.owner.handler_role)
      : normalizePublicIntakeRole(matchedHandler?.role || tracking.sales_role || customerIntakeParams.get('role'));
    const detectedVehicle = detectVehicleFromModel(vehicleModel);
    const documentOrdinalByKey = new Map<CustomerIntakeDocumentDraft['document_key'], number>();
    const publicDocuments: PayslipDocument[] = submitDocuments.map((document) => {
      const ordinal = (documentOrdinalByKey.get(document.document_key) || 0) + 1;
      documentOrdinalByKey.set(document.document_key, ordinal);

      return {
        id: `${id}-public-${document.document_key}-${ordinal}`,
        document_key: document.document_key,
        file_name: document.file_name,
        file_type: document.file_type,
        file_size: document.file_size,
        uploaded_by: 'Customer',
        uploaded_at: submittedAt,
        file_data_url: document.file_data_url
      };
    });
    const newApplication: LoanApplication = {
      id,
      applicant_name: applicantName,
      phone_no: phoneNo,
      ic_no: icNo,
      vehicle_plate: '',
      vehicle_model: vehicleModel,
      vehicle_tag: detectedVehicle.vehicle_tag,
      vehicle_brand: detectedVehicle.vehicle_brand,
      vehicle_condition: submitDraft.vehicle_condition,
      purchase_method: purchaseMethod,
      vehicle_options: [
        {
          id: `VEH-OPTION-${id}-01`,
          vehicle_model: vehicleModel,
          vehicle_tag: detectedVehicle.vehicle_tag,
          vehicle_brand: detectedVehicle.vehicle_brand,
          vehicle_condition: submitDraft.vehicle_condition,
          purchase_method: purchaseMethod,
          total_cash_price: isCashPurchase ? submitDraft.total_cash_price.trim() : '',
          motor_mileage: submitDraft.vehicle_condition === 'Used'
            ? submitDraft.motor_mileage.trim()
            : '',
          priority: 1
        }
      ],
      handler_name: handlerName,
      handler_role: handlerRole,
      admin_owner_name: shortLinkAssignments
        ? shortLinkAssignments.owner.admin_owner_name
        : customerIntakeParams.get('admin_owner_name') || '',
      pending_with: 'Handler',
      pending_action: 'Complete Application',
      pending_since: submittedAt,
      action_due_at: '',
      active_bank_application_id: '',
      status: LoanStatus.NEW,
      error_code: '',
      error_codes: [],
      remarks: buildPublicIntakeRemarks(isSeoIntake, submitDraft.customer_remark),
      submitted_at: submittedAt,
      personal_info: {
        ...createEmptyPersonalInfo(),
        email: submitDraft.email.trim(),
        full_address: submitDraft.full_address.trim(),
        resident_address: submitDraft.resident_address.trim(),
        bank_name: keepsBankAccount ? submitDraft.bank_name.trim() : '',
        account_number: keepsBankAccount ? submitDraft.account_number.trim() : '',
        gender: isCashPurchase ? '' : submitDraft.gender.trim(),
        race: isCashPurchase ? '' : submitDraft.race.trim(),
        marital_status: isCashPurchase ? '' : submitDraft.marital_status.trim(),
        number_of_children: !isCashPurchase && hasChildrenQuestion(submitDraft.marital_status) ? submitDraft.number_of_children.trim() : '',
        housing_status: isCashPurchase ? '' : submitDraft.housing_status.trim(),
        years_at_residence: isCashPurchase ? '' : submitDraft.years_at_residence.trim(),
        residence_start_year: isCashPurchase ? '' : submitDraft.residence_start_year,
        residence_start_month: isCashPurchase ? '' : submitDraft.residence_start_month
      },
      emergency_contacts: normalizeEmergencyContacts(isCashPurchase ? [] : [
        {
          full_name: submitDraft.emergency_contact_1_full_name.trim(),
          relationship: submitDraft.emergency_contact_1_relationship.trim(),
          full_address: submitDraft.emergency_contact_1_full_address.trim(),
          phone_no: formatMalaysiaPhoneNumber(submitDraft.emergency_contact_1_phone_no)
        },
        {
          full_name: submitDraft.emergency_contact_2_full_name.trim(),
          relationship: submitDraft.emergency_contact_2_relationship.trim(),
          full_address: submitDraft.emergency_contact_2_full_address.trim(),
          phone_no: formatMalaysiaPhoneNumber(submitDraft.emergency_contact_2_phone_no)
        }
      ]),
      employment_details: isCashPurchase ? createEmptyEmploymentDetails() : {
        ...createEmptyEmploymentDetails(),
        company_name: submitDraft.company_name.trim(),
        position: submitDraft.position.trim(),
        years_employed: submitDraft.years_employed.trim(),
        employment_start_year: submitDraft.employment_start_year,
        employment_start_month: submitDraft.employment_start_month,
        company_address: submitDraft.company_address.trim(),
        office_phone_no: submitDraft.office_phone_no.trim(),
        gross_monthly_salary: submitDraft.gross_monthly_salary.trim(),
        net_monthly_salary: submitDraft.net_monthly_salary.trim()
      },
      preferences: {
        ...createEmptyPreferences(),
        available_to_receive_calls: isCashPurchase ? '' : submitDraft.available_to_receive_calls.trim(),
        salary_payment_method: isCashPurchase ? '' : submitDraft.salary_payment_method.trim(),
        preferred_motorcycle: vehicleModel,
        loan_tenure: isCashPurchase ? '' : submitDraft.loan_tenure.trim()
      },
      customer_intake_tracking: tracking,
      customer_call_back_at: '',
      payslip_documents: publicDocuments,
      document_checklist: normalizeDocumentChecklist({
        document_checklist: [],
        payslip_documents: publicDocuments,
        purchase_method: purchaseMethod,
        vehicle_condition: submitDraft.vehicle_condition
      }),
      bank_applications: []
    };
    const nextAuditLogs: AuditLogEntry[] = [
      {
        id: `INTAKE-${id}`,
        staff_name: 'Public Intake',
        staff_role: 'Public',
        action: 'CUSTOMER_INTAKE_SUBMITTED',
        target_type: 'Customer',
        target_id: id,
        target_label: newApplication.applicant_name,
        changes: createAuditChanges({}, {
          applicant_name: newApplication.applicant_name,
          phone_no: newApplication.phone_no,
          ic_no: newApplication.ic_no,
          vehicle_model: newApplication.vehicle_model,
          handler_name: newApplication.handler_name,
          handler_role: newApplication.handler_role,
          ci_utm_source: tracking.utm_source,
          ci_utm_staff: tracking.staff_utm || ''
        }),
        ip_address: clientContext.ip_address,
        user_agent: clientContext.user_agent,
        created_at: submittedAt
      },
      ...auditLogs
    ];

    // 公开 intake 页面(匿名身份):只 create 单个 customers 文档 + 审计条目,
    // 不走整份 dashboard_state 保存,也不把客户 PII 写进客户设备 localStorage。
    // Wait for the Firebase create to actually land before telling the customer
    // it succeeded. Previously we showed the success screen + reference id even
    // when the write failed (e.g. anonymous auth/network down), so the lead was
    // silently lost. On failure, keep the form filled and surface an error.
    setIntakeSubmitError('');
    setIntakeSubmitting(true);
    intakeSubmitInFlightRef.current = true;
    try {
      const savedApplication = await submitPublicIntakeToRemote(
        newApplication,
        nextAuditLogs[0],
        shortLinkAssignments?.queue
      );
      writePendingPublicIntakeId('');
      // Prepend onto the latest list rather than the pre-await copy.
      const submittedApplications = [savedApplication, ...removeItemById(applicationsRef.current, id)];
      applicationsRef.current = submittedApplications;
      setApplications(submittedApplications);
      const submittedAuditLogs = [nextAuditLogs[0], ...auditLogsRef.current].slice(0, 1000);
      auditLogsRef.current = submittedAuditLogs;
      setAuditLogs(submittedAuditLogs);
      intakePendingAttemptRef.current = null;
      setIntakeSubmittedWithoutLaterChanges(changedSinceAttempt);
      setIntakeSubmittedApplicationId(id);
      // Key event for the /s/ application links: no customer details, only the
      // form, the purchase method and the short link code that brought them.
      trackPublicEvent('loan_application_submit', {
        page_path: window.location.pathname,
        purchase_method: purchaseMethod,
        link_code: shortLinkCode.toUpperCase(),
        transport_type: 'beacon'
      });
      setIntakeDraft({ ...EMPTY_INTAKE_DRAFT });
    } catch (error) {
      console.warn('Public intake Firebase save failed; keeping the form so the customer can retry.', error);
      const submitError = classifyCustomerIntakeSubmitError(error);
      // Only an unconfirmed attempt is frozen; a definite refusal wrote
      // nothing, so the customer may edit and send new content.
      // documents-incomplete: the customer record is saved; a retry must
      // re-send the same files to the same id, not new content.
      intakePendingAttemptRef.current = submitError === 'timeout' || submitError === 'documents-incomplete'
        ? { draft: submitDraft, documents: submitDocuments }
        : null;
      setIntakeSubmitError(submitError);
    } finally {
      intakeSubmitInFlightRef.current = false;
      setIntakeSubmitting(false);
    }
  };

  const handleSaveVehicleInfoMission = (applicationId: string) => {
    const previous = applications.find((app) => app.id === applicationId);
    const draft = missionDrafts[applicationId];

    if (!previous || !draft?.vehicle_condition || !draft?.purchase_method) {
      return;
    }

    if (previous.handler_name !== currentStaff.name) {
      triggerToast(tr('只有负责这个客户的员工可以完成这个任务', 'Only the handling staff can complete this task', "Hanya pegawai bertanggungjawab boleh menyelesaikan tugasan ini"));
      return;
    }

    const updatedApplications = applications.map((app) => {
      if (app.id !== applicationId) {
        return app;
      }

      const vehicleOptions = normalizeVehicleOptions({
        ...app,
        vehicle_condition: draft.vehicle_condition,
        purchase_method: draft.purchase_method,
        vehicle_options: (app.vehicle_options || []).map((option, index) => (
          index === 0
            ? {
              ...option,
              vehicle_condition: draft.vehicle_condition,
              purchase_method: draft.purchase_method
            }
            : option
        ))
      });

      return {
        ...app,
        vehicle_condition: draft.vehicle_condition,
        purchase_method: draft.purchase_method,
        vehicle_options: vehicleOptions
      };
    });

    updateApplicationsState(updatedApplications);
    appendAuditLog({
      action: 'COMPLETE_VEHICLE_PURCHASE_MISSION',
      target_type: 'Customer',
      target_id: applicationId,
      target_label: previous.applicant_name,
      changes: createAuditChanges(
        {
          vehicle_condition: previous.vehicle_condition || '',
          purchase_method: previous.purchase_method || ''
        },
        {
          vehicle_condition: draft.vehicle_condition,
          purchase_method: draft.purchase_method
        }
      ),
      stateOverrides: { applications: updatedApplications }
    });
    setMissionDrafts((current) => {
      const next = { ...current };
      delete next[applicationId];
      return next;
    });
    triggerToast(tr(`${previous.applicant_name} 的 New/Used 和 Cash/Loan 已补齐`, `New/Used and Cash/Loan completed for ${previous.applicant_name}`, `Baru/Terpakai dan Tunai/Pinjaman selesai untuk ${previous.applicant_name}`));
  };

  const createShortLinkCode = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';

    for (let index = 0; index < 6; index += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    if (customerIntakeShortLinks.some((link) => link.code === code)) {
      return createShortLinkCode();
    }

    return code;
  };

  // Resolves only after the link is saved remotely (Firebase mode), so a link
  // that customers could not open is never shown, copied, or reused.
  const handleCreateShortLink = async (
    fullUrl: string,
    source: string,
    medium: string,
    targetType: string,
    targetLabel: string,
    adminOwnerName = ''
  ) => {
    const existing = customerIntakeShortLinks.find((link) => {
      if (!link.active) return false;
      try {
        // shared_at changes on every render of the share panel; ignoring it
        // lets repeat copies reuse one code instead of minting a new link.
        const existingUrl = new URL(link.full_url);
        existingUrl.searchParams.delete('ci_link_code');
        existingUrl.searchParams.delete('admin_owner_name');
        existingUrl.searchParams.delete('shared_at');
        const requestedUrl = new URL(fullUrl);
        requestedUrl.searchParams.delete('shared_at');
        return (
          existingUrl.toString() === requestedUrl.toString() &&
          (link.admin_owner_name || '') === adminOwnerName
        );
      } catch {
        return link.full_url === fullUrl && (link.admin_owner_name || '') === adminOwnerName;
      }
    });

    if (existing) {
      return buildPublicSiteUrl(`/s/${existing.code}`);
    }

    const code = createShortLinkCode();
    const resolvedUrl = new URL(fullUrl);
    resolvedUrl.searchParams.set('ci_link_code', code.toLowerCase());
    if (adminOwnerName) {
      resolvedUrl.searchParams.set('admin_owner_name', adminOwnerName);
    }
    const shortLink: CustomerIntakeShortLink = {
      id: `CISL-${Date.now()}-${code}`,
      code,
      full_url: resolvedUrl.toString(),
      source,
      medium,
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      admin_owner_name: adminOwnerName,
      staff_utm: normalizeVehicleModel(currentStaff.name).replace(/\s+/g, '-'),
      active: true,
      created_at: new Date().toISOString()
    };
    const savedShortLink = await saveShortLinkToRemote(shortLink);
    const updatedShortLinks = [savedShortLink, ...customerIntakeShortLinks].slice(0, 500);

    updateCustomerIntakeShortLinksState(updatedShortLinks);
    appendAuditLog({
      action: 'CREATE_SHORT_LINK',
      target_type: targetType,
      target_id: shortLink.code,
      target_label: targetLabel,
      changes: createAuditChanges({}, {
        code: shortLink.code,
        source: shortLink.source,
        medium: shortLink.medium,
        staff_name: shortLink.staff_name,
        admin_owner_name: shortLink.admin_owner_name || '',
        full_url: shortLink.full_url
      }),
      stateOverrides: { customerIntakeShortLinks: updatedShortLinks }
    });

    return buildPublicSiteUrl(`/s/${code}`);
  };

  const handleCreateCustomerIntakeShortLink = (fullUrl: string, source: string, medium: string) => {
    return handleCreateShortLink(
      fullUrl,
      source,
      medium,
      'Customer Intake Short Link',
      source,
      selectLoanAdminOwner(fullUrl, roleAccounts)
    );
  };

  const handleCreateWhatsAppShortLink = (fullUrl: string, link: WhatsAppTrackingLink) => {
    return handleCreateShortLink(fullUrl, link.channel, link.medium, 'WhatsApp Short Link', link.label);
  };

  const handleAddApprovalRequest = (
    request: Omit<ApprovalRequest, 'id' | 'status' | 'requester_name' | 'requester_role' | 'submitted_at' | 'reviewed_by' | 'reviewed_role' | 'reviewed_at' | 'review_note'>
  ) => {
    const now = new Date().toISOString();
    const approvalRequest: ApprovalRequest = {
      ...request,
      id: newId('APPROVAL'),
      status: 'Pending',
      requester_name: currentStaff.name,
      requester_role: currentStaff.role,
      submitted_at: now
    };
    const next = [approvalRequest, ...approvalRequests];

    updateApprovalRequestsState(next);
    appendAuditLog({
      action: 'SUBMIT_APPROVAL_REQUEST',
      target_type: 'Approval Request',
      target_id: approvalRequest.id,
      target_label: approvalRequest.target_label,
      changes: createAuditChanges({}, approvalRequest as unknown as Record<string, unknown>),
      stateOverrides: { approvalRequests: next }
    });
    triggerToast(`Approval request submitted: ${approvalRequest.target_label}`);
  };

  const handleReviewApprovalRequest = (
    id: string,
    status: Extract<ApprovalRequestStatus, 'Approved' | 'Rejected' | 'Cancelled'>,
    reviewNote: string
  ) => {
    const previous = approvalRequests.find((request) => request.id === id);

    if (!previous || previous.status !== 'Pending') {
      return;
    }

    const isRequesterCancel = status === 'Cancelled' && previous.requester_name === currentStaff.name;
    const canReview = (
      previous.approver_roles.includes(currentStaff.role)
      || (
        currentStaff.role === 'Operations Manager'
        && previous.approver_roles.includes('Super Admin')
      )
    );

    if (!isRequesterCancel && !canReview) {
      triggerToast(tr('当前账号没有权限审核这个请求', 'This account cannot review this request', "Akaun ini tidak boleh menyemak permintaan ini"));
      return;
    }

    const next = approvalRequests.map((request) => (
      request.id === id
        ? {
          ...request,
          status,
          reviewed_by: currentStaff.name,
          reviewed_role: currentStaff.role,
          reviewed_at: new Date().toISOString(),
          review_note: reviewNote.trim()
        }
        : request
    ));
    const updated = next.find((request) => request.id === id) || previous;

    updateApprovalRequestsState(next);
    appendAuditLog({
      action: status === 'Cancelled' ? 'CANCEL_APPROVAL_REQUEST' : 'REVIEW_APPROVAL_REQUEST',
      target_type: 'Approval Request',
      target_id: id,
      target_label: updated.target_label,
      changes: createAuditChanges(previous as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>),
      stateOverrides: { approvalRequests: next }
    });
    triggerToast(`Approval request ${status.toLowerCase()}: ${updated.target_label}`);
  };

  return {
    updateIntakeDraft,
    handleSubmitCustomerIntake,
    handleSaveVehicleInfoMission,
    handleCreateCustomerIntakeShortLink,
    handleCreateWhatsAppShortLink,
    handleAddApprovalRequest,
    handleReviewApprovalRequest
  };
}
