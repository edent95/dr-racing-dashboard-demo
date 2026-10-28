import { useStaffMfaPrompt } from './hooks/useStaffMfaPrompt';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AlertTriangle, BarChart3, Bell, Bike, Building2, CalendarDays, CheckCircle2, ClipboardCheck, Clock, Database, Download, Eye, HandCoins, PackageSearch, EyeOff, FileClock, Inbox, KeyRound, Languages, Link2, LogOut, MessageCircle, Moon, RefreshCw, ShieldCheck, Sun, Tag, Target, UserCircle, Users, WalletCards, Workflow } from 'lucide-react';
import { ApprovalRequest, ApprovalRequestStatus, AttendancePolicy, AttendanceWeeklySchedule, AuditLogEntry, BankApplication, BankDefinition, CalendarNote, ChannelMarketingSpend, CustomMission, CustomerActivityEntry, CustomerEmploymentDetails, CustomerIntakeShortLink, CustomerIntakeTracking, CustomerPersonalInfo, CustomerPreferences, CustomerRawMatch, CustomerRiskField, CustomerRiskFlag, CommissionRules, DealFinance, DEFAULT_ATTENDANCE_POLICY, DEFAULT_BANK_DEFINITIONS, DEFAULT_COMMISSION_RULES, DEFAULT_MARKETING_TAG_RELATIONSHIPS, DEFAULT_TAG_NORMALIZATION_RULES, DEFAULT_VEHICLE_BRAND_TAGS, DEFAULT_VEHICLE_CATALOG, DEFAULT_VEHICLE_TAGS, EmergencyContact, ErrorCodeDefinition, FinanceProfile, FinanceProfileTerm, FINANCE_PROFILES, findFinanceProfile, findVehicleCatalogItem, getLoanPendingAction, getLoanPendingWith, inferFinanceProfileFromVehicle, inferVehicleBrandFromModel, inferVehicleTagFromModel, LoanApplication, LoanPendingAction, LoanPendingWith, LoanStatus, LoanWorkflowAction, MarketingTagRelationship, getAttendanceTeamIdForAccount, normalizeAttendancePolicy, normalizeFinanceProfileId, normalizeVehicleModel, NotificationItem, PayslipDocument, PurchaseMethod, QuickStockInput, RawCustomerLead, RejectNextStepType, RoleAccount, RoleAccountRole, RoleNavAccessSetting, StaffDefaultAvatar, StaffWorkloadCase, TagNormalizationDomain, TagNormalizationRule, VehicleCategory, VehicleCatalogItem, VehicleCondition, VehiclePurchaseOption, VehicleStockUnit, WhatsAppTrackingClick, WhatsAppTrackingLink } from './types';
import { buildAdminExtraShopsByName, buildStaffShopsByName, isSameShopHandler } from './utils/adminUnclaimedPool';
import { buildCommissionTierSource, normalizeCommissionTierPlans, normalizeCommissionTiers } from './utils/commissionTiers';
import {
  getDefaultRejectCodeClassification,
  INITIAL_ERROR_CODE_DEFINITIONS,
  INITIAL_ROLE_ACCOUNTS,
  INITIAL_WHATSAPP_TRACKING_CLICKS,
  INITIAL_WHATSAPP_TRACKING_LINKS
} from './data/mockData';
import { buildDefaultRoleNavAccessSettings, normalizeRoleNavAccessSettings } from './data/roleNavAccess';
import { buildDefaultVehicleCategories, normalizeVehicleCategories } from './data/vehicleCategories';
import { normalizeVehicleBrandLogos } from './data/vehicleBrandLogos';
import drRacingLogo from './assets/dr-racing-logo-256.png';
import StaffAvatar from './components/StaffAvatar';
import { getBankRequestedDocumentKey, getMissingDocumentLabels, normalizeDocumentChecklist } from './utils/documentChecklist';
import type { BankPageRequest } from './utils/loanTableBankColumns';
import { getMissingApplicationInformationLabels } from './utils/applicationCompleteness';
import { isFirebaseConfigured } from './lib/firebaseConfig';
import { useStaffPushRequests } from './hooks/useStaffPushRequests';
import { useLedgerDueDeposits } from './hooks/useLedgerDueDeposits';
import { ledgerDeliveryMessage, requestLedgerDeliveryInvoice } from './lib/ledgerDelivery';
import { getLedgerContactChanges, ledgerStockMessage, requestLedgerContactSync, requestLedgerStockSync } from './lib/ledgerSync';
import { requestFirestoreCacheClearOnReload } from './lib/firebaseCacheCleanup';
import { AppLanguage, setAppLanguage, tr } from './lib/i18n';
import { buildPublicSiteUrl } from './lib/publicUrls';
import { getLoanWorkflowActionLabel, getLoanWorkflowUndoAvailability } from './utils/loanWorkflowUndo';
import { canCancelApplication, canStaffCancelApplication, withdrawBankApplications } from './utils/cashApplicationCancel';
import { useDashboardHydration, type DashboardHydrationState } from './hooks/useDashboardHydration';
import { useAttendanceState } from './hooks/useAttendanceState';
import { useCustomerIntakeActions } from './hooks/useCustomerIntakeActions';
import { areJsonLikeValuesEqual, createNotificationId, normalizeNotificationList, uniqueRoles, uniqueStrings, useDashboardNotifications } from './hooks/useDashboardNotifications';
import { formatMalaysiaPhoneNumber, isBasicMalaysiaPhoneNumber, normalizeMalaysiaPhoneDigits as normalizePhoneNumber } from './utils/malaysiaPhone';
import {
  createEmptyCustomerEmploymentDetails as createEmptyEmploymentDetails,
  createEmptyCustomerPersonalInfo as createEmptyPersonalInfo,
  createEmptyCustomerPreferences as createEmptyPreferences,
  LOAN_TENURE_OPTIONS,
  normalizeCustomerEmploymentDetails as normalizeEmploymentDetails,
  normalizeCustomerPersonalInfo as normalizePersonalInfo,
  normalizeCustomerPreferences as normalizePreferences,
  normalizeEmergencyContacts
} from './utils/customerApplicationForm';
import { getCustomerIntakeValidationIssues } from './utils/customerIntakeValidation';
import { useDashboardPersistence } from './hooks/useDashboardPersistence';
import { useAccountActions } from './hooks/useAccountActions';
import { SETTING_GROUP_NAV_KEY, useNavigationState, type AppPage, type ToolsView } from './hooks/useNavigationState';
import {
  COMPACT_VIEWPORT_QUERY,
  followMobileSubpage,
  getPageForMobileTab,
  isMobileSubpage,
  isMobileTabPage,
  readStoredMobileSubpage,
  writeStoredMobileSubpage,
  type MobileSubpageState,
  type MobileTab
} from './utils/mobileNavigation';
import { usePublicRoutes } from './hooks/usePublicRoutes';
import { buildDashboardPageContent } from './components/DashboardPageContent';
import { useSystemSettingsActions } from './hooks/useSystemSettingsActions';
import { useLoanApplicationActions } from './hooks/useLoanApplicationActions';
import { useDeliveryPaymentActions } from './hooks/useDeliveryPaymentActions';
import { clearSensitiveDashboardLocalCache, normalizeAuthEmail, normalizeRoleAccountRole, readStoredStaffSession, useStaffSessionAuth, type StaffSession } from './hooks/useStaffSessionAuth';
import { formatStaffLoginIdentifier } from '../shared/staffLoginIdentifier.mjs';
import { mergeDefaultAvatarLibrary } from '../shared/defaultAvatars.mjs';
import { isSettledDealFinance } from './utils/dealFinance';
import { WHATSAPP_URL } from '../shared/seoContent.mjs';
import { buildShortLinkIntakeAssignments, isAwaitingHandlerAssignment } from '../shared/staffLinkQueue.mjs';
import type { CustomerIntakeDocumentDraft, CustomerIntakeDraft, CustomerIntakeSubmitError } from './components/PublicCustomerIntakePage';
import type { VehicleInfoMissionDraft } from './components/StaffVehicleInfoMissionPanel';
import {
  buildOpenMissingCheckoutIncidents,
  buildTaskInboxTasks,
  filterVisibleTaskInboxTasks,
  readHiddenTaskIds,
  toTaskInboxMirrorItem,
  type TaskInboxMirrorItem,
  type TaskInboxTaskActions
} from './components/taskInbox/buildTaskInboxTasks';
import { useStableCallback } from './hooks/useStableCallback';
import { useTaskClock } from './hooks/useTaskClock';
import { useDashboardRealtimeSync } from './hooks/useDashboardRealtimeSync';
import { useDealFinanceActions } from './hooks/useDealFinanceActions';
import { useVehicleInfoActions } from './hooks/useVehicleInfoActions';
import { useWhatsAppLinkActions } from './hooks/useWhatsAppLinkActions';
import {
  acknowledgeServerDashboardStateVersion,
  getKnownDashboardStateVersion,
  AdminApplicationClaimConflictError,
  appendCalendarTaskCommentToFirebase,
  assignCustomerHandlerThroughServer,
  claimUnassignedAdminApplicationFromFirebase,
  CollectionItemVersionConflictError,
  deleteCalendarNoteFromFirebase,
  markRawLeadsDeletedForSync,
  fetchAttendanceNetworkCheck,
  saveAttendanceEventToFirebase,
  saveAttendanceIncidentResolutionToFirebase,
  saveAttendanceWeeklyScheduleToFirebase,
  saveCalendarNoteToFirebase,
  setCalendarTaskCompletionInFirebase,
  saveDealFinanceWithStockReservationToFirebase,
  saveStaffLeaveRequestToFirebase,
  reloadCustomerFromFirebase,
  StockReservationConflictError,
  subscribeToCalendarTasksFromFirebase,
  listDeliveryPayments,
  createDeliveryPayment,
  findDeliveryPaymentOnServer,
  voidDeliveryPayment,
  loadDeliveryReceipt,
  markBikeDeliveredThroughServer,
  createDeliveryAttachment,
  listDeliveryAttachments,
  loadDeliveryAttachment,
  type AttendanceNetworkCheck,
  type CustomerRealtimeChange,
  type DashboardState
} from './services/dashboardRepository';
import { getApplicationRejectCodes, normalizeRejectCode, normalizeRejectCodes } from './utils/rejectCodes';
import { carryStaffLocalSettingsAcrossRename } from './utils/staffLocalSettings';
import {
  buildCompletedTaskEvents,
  buildLoanTaskCompletionDescriptors,
  createTaskCompletionAuditChanges
} from './utils/taskCompletionAnalytics';
import {
  calculateStaffExperience,
  getStaffExperienceRulesFromConfig,
  normalizeStaffExperienceRules,
  STAFF_EXPERIENCE_RULES_FIELD
} from './utils/staffExperience';
import { buildMonthlyAttendanceExportRows, type MissingCheckoutIncident } from './utils/attendanceSummary';
import { getVehicleStockReference, normalizeVehicleNumberPlate } from './utils/vehicleStock';
import { isOperationsLead } from './utils/staffRoles';
import { useAttendanceActions } from './hooks/useAttendanceActions';
import { useCalendarTaskActions } from './hooks/useCalendarTaskActions';
import { useRawLeadActions } from './hooks/useRawLeadActions';
import { getAdminBankFollowUpDueIso } from './utils/bankFollowUp';
import { useBrandedDialog } from './components/BrandedDialogProvider';
import { newId } from './utils/id';
import { normalizeBankDefinitions, normalizeMarketingTagRelationships, normalizeTagNormalizationRules } from './utils/settingsListNormalizers';
import { useSettingsListActions } from './hooks/useSettingsListActions';
import { replaceItemById, rollbackItemById, removeItemById } from './utils/latestListPatch';
import { appendCommentOnce, getCommentIdForAttempt, type PendingCommentAttempt } from './utils/calendarTaskComments';
import {
  CustomerList,
  DetailDrawer,
  NotificationCenter,
  PublicCustomerIntakePage,
  PublicSeoLandingPage,
  PublicStockDetailPage,
  PublicStockIndexPage,
  PublicBlogIndexPage,
  PublicBlogPostPage,
  PublicCalculatorPage,
  StaffVehicleInfoMissionPanel,
  TaskInboxPage,
  MobileAppShell,
  MobileSubpageFrame,
  RawCustomerDatabase,
  CustomerRelationshipRiskPage,
  CalendarPage,
  AttendancePage,
  TagsAdmin,
  WhatsAppTrackingAdmin,
  AnalyticsDashboard,
  RewardCommissionCenter,
  AuditLogAdmin,
  DataExportCenter,
  UserProfilePage,
  RoleAccessControlPage,
  FinanceCenter,
  StaffHandbookPage
} from './components/lazyPages';

type SidebarNavItem = {
  key: string;
  page: AppPage;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onSelect?: () => void;
  activeOverride?: boolean;
};

type AppTheme = 'light' | 'dark';

function PageLoading() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-panel border border-slate-100 bg-white text-footnote font-bold text-slate-500 shadow-e1">
      Loading page...
    </div>
  );
}

function DrRacingLogo({ className = 'h-12 w-auto' }: { className?: string }) {
  return (
    <img
      src={drRacingLogo}
      alt="Dr Racing logo"
      width={256}
      height={201}
      loading="eager"
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

const loadInitialRawCustomerLeads = async () => {
  const module = await import('./data/rawCustomerLeads');
  return module.INITIAL_RAW_CUSTOMER_LEADS;
};

const loadInitialLoanApplications = async (): Promise<LoanApplication[]> => [];

// Storage SDK 只在真正上传银行图标时才加载,不进首屏(docs/performance-dependency-flow.md)。
const uploadBankIconToStorage = async (bankId: string, dataUrl: string) => {
  const module = await import('./lib/firebaseStorage');
  return module.uploadBankIconToStorage(bankId, dataUrl);
};

const saveShortLinkToRemote = async (link: CustomerIntakeShortLink) => {
  const module = await import('./services/publicRepository');
  return module.saveShortLinkToFirebase(link);
};

const loadPublicIntakeShortLinkFromRemote = async (code: string) => {
  const module = await import('./services/publicRepository');
  return module.loadShortLinkForPublicIntake(code);
};

// 公开路径专用 create-only 写入(匿名 Auth 身份),不整份写 dashboard_state。
const submitPublicIntakeToRemote = async (
  application: LoanApplication,
  auditLog: AuditLogEntry | undefined,
  fallbackAssignment?: Pick<LoanApplication, 'handler_name' | 'handler_role' | 'admin_owner_name'> | null
) => {
  const module = await import('./services/publicRepository');
  return module.submitPublicIntakeToFirebase(application, auditLog, fallbackAssignment);
};

// A client-side timeout (or deadline-exceeded) does NOT mean the write failed:
// the Firestore write/transaction may still commit after we stop waiting.
const isFirebaseWriteOutcomeUnknown = (error: unknown) => {
  const code = error && typeof error === 'object' && 'code' in error
    ? String(error.code).toLowerCase()
    : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('timed out') || code.includes('deadline-exceeded');
};

const classifyCustomerIntakeSubmitError = (error: unknown): CustomerIntakeSubmitError => {
  const code = error && typeof error === 'object' && 'code' in error
    ? String(error.code).toLowerCase()
    : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  // PUBLIC_INTAKE_DOCUMENTS_INCOMPLETE_CODE in services/publicRepository (not
  // imported: that module is lazy-loaded). The customer record is already saved.
  if (code === 'public-intake/documents-incomplete') {
    return 'documents-incomplete';
  }

  // PUBLIC_INTAKE_RATE_LIMITED_CODE / PUBLIC_INTAKE_LINK_INACTIVE_CODE: the
  // server refused the submission permit, so nothing was saved.
  if (code === 'public-intake/rate-limited') {
    return 'rate-limited';
  }

  if (code === 'public-intake/link-inactive') {
    return 'link-inactive';
  }

  if (code.includes('permission-denied') || code.includes('failed-precondition')) {
    return 'permission-denied';
  }

  if (message.includes('timed out') || code.includes('deadline-exceeded')) {
    return 'timeout';
  }

  if (
    code.includes('network-request-failed')
    || code.includes('unavailable')
    || message.includes('network')
    || message.includes('offline')
  ) {
    return 'network';
  }

  if (code.includes('unauthenticated') || code.includes('auth/')) {
    return 'authentication';
  }

  return 'unknown';
};

const normalizePublicIntakeRole = (role?: string | null): RoleAccountRole => (
  role === 'Super Admin' || role === 'Operations Manager' || role === 'Admin' || role === 'Sales' ? role : 'Sales'
);

const SEO_INTAKE_CAMPAIGNS = new Set(['seo_home', 'seo_blog', 'seo_stock']);

const isSeoCustomerIntake = (params: URLSearchParams) => (
  !params.get('sales') &&
  !params.get('handler') &&
  !params.get('ci_link_code') &&
  params.get('utm_source') === 'website' &&
  params.get('utm_medium') === 'organic' &&
  SEO_INTAKE_CAMPAIGNS.has(params.get('utm_campaign') || '')
);

const createPublicApplicationId = () => {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();

  return `APP-${year}-${randomPart}`;
};

// Content identity of one submission (files by key, name and size; their
// bytes are already fixed once read).
const getCustomerIntakeFingerprint = (draft: CustomerIntakeDraft, documents: CustomerIntakeDocumentDraft[]) => JSON.stringify([
  draft,
  documents.map((document) => [document.document_key, document.file_name, document.file_size])
]);

const PENDING_PUBLIC_INTAKE_ID_KEY = 'dr_racing_pending_intake_id';

// In-memory copy for browsers that refuse sessionStorage (private mode).
let pendingPublicIntakeIdFallback = '';

const readPendingPublicIntakeId = () => {
  try {
    const value = window.sessionStorage.getItem(PENDING_PUBLIC_INTAKE_ID_KEY) || '';
    return /^APP-\d{4}-[A-Z0-9]{10}$/.test(value) ? value : '';
  } catch {
    return pendingPublicIntakeIdFallback;
  }
};

const writePendingPublicIntakeId = (id: string) => {
  pendingPublicIntakeIdFallback = id;
  try {
    if (id) {
      window.sessionStorage.setItem(PENDING_PUBLIC_INTAKE_ID_KEY, id);
    } else {
      window.sessionStorage.removeItem(PENDING_PUBLIC_INTAKE_ID_KEY);
    }
  } catch {
    // Private mode: the in-memory copy still covers retries in this tab.
  }
};

// Taken leads with no follow-up activity for this many days automatically
// return to the public pool so they cannot be hoarded.
const RAW_LEAD_AUTO_RELEASE_DAYS = 7;
const SAVE_CONFLICT_TOAST_DELAY_MS = 4000;
const MALAYSIA_EXPORT_TIME_ZONE = 'Asia/Kuala_Lumpur';

const splitMalaysiaDateTime = (value?: string) => {
  if (!value) return { date: '', time: '' };

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: '', time: '' };

  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: MALAYSIA_EXPORT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(parsed);
  const part = (type: Intl.DateTimeFormatPartTypes) => (
    dateParts.find((item) => item.type === type)?.value || ''
  );

  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    time: new Intl.DateTimeFormat('en-GB', {
      timeZone: MALAYSIA_EXPORT_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).format(parsed)
  };
};

const getStaffLeaveExportMeta = (request: ApprovalRequest) => {
  try {
    const parsed = JSON.parse(request.notes) as {
      source?: string;
      kind?: string;
      start_date?: string;
      end_date?: string;
      overtime_date?: string;
      overtime_end_time?: string;
    };
    if (
      parsed.source === 'attendance'
      && (parsed.kind === 'Leave' || parsed.kind === 'MC' || parsed.kind === 'OT')
      && typeof parsed.start_date === 'string'
      && typeof parsed.end_date === 'string'
    ) {
      return {
        kind: parsed.kind,
        start_date: parsed.start_date,
        end_date: parsed.end_date,
        overtime_date: parsed.overtime_date || '',
        overtime_end_time: parsed.overtime_end_time || ''
      };
    }
  } catch {
    // Legacy staff leave requests stored plain notes instead of JSON metadata.
  }

  const submittedDate = splitMalaysiaDateTime(request.submitted_at).date;
  return {
    kind: request.mc_attachment ? 'MC' : 'Leave',
    start_date: submittedDate,
    end_date: submittedDate,
    overtime_date: '',
    overtime_end_time: ''
  };
};

const stripApplicationFileDataForComparison = (application: LoanApplication) => ({
  ...application,
  payslip_documents: (application.payslip_documents || []).map((document) => ({
    ...document,
    file_data_url: ''
  }))
});

const preserveLoadedApplicationFileData = (
  application: LoanApplication,
  currentApplication?: LoanApplication
): LoanApplication => {
  if (!currentApplication) {
    return application;
  }

  const currentFileDataByDocumentId = new Map(
    (currentApplication.payslip_documents || [])
      .filter((document) => Boolean(document.file_data_url))
      .map((document) => [document.id, document.file_data_url])
  );

  return {
    ...application,
    payslip_documents: (application.payslip_documents || []).map((document) => ({
      ...document,
      file_data_url: document.file_data_url || currentFileDataByDocumentId.get(document.id) || ''
    }))
  };
};

const normalizeCommissionRules = (value: unknown): CommissionRules => {
  const raw = (value || {}) as Partial<CommissionRules> & Record<string, unknown>;
  const rawDealCommissionPercent = (raw as Record<string, unknown>).deal_commission_percent;
  const toAmount = (input: unknown, fallback: number) => {
    const numeric = Number(input);
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
  };

  return {
    deal_commission_percent: rawDealCommissionPercent === undefined || rawDealCommissionPercent === null || rawDealCommissionPercent === ''
      ? undefined
      : Math.min(toAmount(rawDealCommissionPercent, 0), 100),
    per_approved_loan: toAmount(raw.per_approved_loan, DEFAULT_COMMISSION_RULES.per_approved_loan),
    leaderboard_first: toAmount(raw.leaderboard_first, DEFAULT_COMMISSION_RULES.leaderboard_first),
    leaderboard_second: toAmount(raw.leaderboard_second, DEFAULT_COMMISSION_RULES.leaderboard_second),
    leaderboard_third: toAmount(raw.leaderboard_third, DEFAULT_COMMISSION_RULES.leaderboard_third),
    ...(raw.commission_tiers === undefined ? {} : { commission_tiers: normalizeCommissionTiers(raw.commission_tiers) }),
    ...(Array.isArray(raw.commission_tier_plans) ? { commission_tier_plans: normalizeCommissionTierPlans({ commission_tier_plans: raw.commission_tier_plans as CommissionRules['commission_tier_plans'] }) } : {}),
    [STAFF_EXPERIENCE_RULES_FIELD]: normalizeStaffExperienceRules(raw[STAFF_EXPERIENCE_RULES_FIELD])
  } as CommissionRules;
};

function NavIconImage({
  className = 'h-5 w-5',
  fallback
}: {
  active: boolean;
  className?: string;
  fallback: React.ReactNode;
  iconKey: string;
  plain?: boolean;
}) {
  if (!React.isValidElement(fallback)) {
    return null;
  }

  return React.cloneElement(
    fallback as React.ReactElement<{
      'aria-hidden'?: boolean;
      className?: string;
      strokeWidth?: number;
    }>,
    {
      'aria-hidden': true,
      className: `${className} shrink-0`,
      strokeWidth: 1.75
    }
  );
}

const EMPTY_CUSTOMER_RISK_FLAGS: CustomerRiskFlag[] = [];
const EMPTY_CUSTOMER_RAW_MATCHES: CustomerRawMatch[] = [];

const APP_LANGUAGE_STORAGE_KEY = 'dr_racing_app_language';
const APP_THEME_STORAGE_KEY = 'dr_racing_app_theme';
const SEEDED_CUSTOMER_STORAGE_KEY = 'dr_racing_seeded_customer_ids';
const SEEDED_CUSTOMER_IDS: string[] = [];
const DEFAULT_WHATSAPP_DEFAULT_MESSAGE = 'Hi {name}, saya dari Dr Racing. Kami terima inquiry anda dari {channel}. Boleh saya bantu semak permohonan motor loan?';
const INITIAL_VEHICLE_CATALOG = DEFAULT_VEHICLE_CATALOG;
const MOTOR_PRICE_BRAND_TAG_SET = new Set(DEFAULT_VEHICLE_BRAND_TAGS);
const EMPTY_INTAKE_DRAFT: CustomerIntakeDraft = {
  applicant_name: '',
  phone_no: '',
  ic_no: '',
  vehicle_model: '',
  vehicle_condition: '',
  purchase_method: '',
  total_cash_price: '',
  motor_mileage: '',
  email: '',
  full_address: '',
  resident_address: '',
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
  preferred_motorcycle: '',
  loan_tenure: '',
  customer_remark: ''
};
const INITIAL_DECLINE_CODE_SET = new Set(
  INITIAL_ERROR_CODE_DEFINITIONS
    .map((item) => item.code)
    .filter((code) => /^\d+$/.test(code))
);

const warnLocalCacheReadFailed = (storageKey: string, error: unknown) => {
  console.warn(`Local cache "${storageKey}" could not be parsed; using fallback data.`, error);
};

const APP_COPY = {
  zh: {
    languageLabel: '语言',
    languageChinese: '中文',
    languageEnglish: '英文',
    languageMalay: '马来文',
    themeLabel: '主题',
    lightTheme: '白天',
    darkTheme: '夜间',
    dashboard: '管理台',
    loginTitle: 'Dr Racing 登录',
    loginSubtitle: '输入员工用户名或 Email 和密码进入管理台',
    defaultAccount: '本地模式：使用已设置密码的员工用户名或 Email 登录',
    taskInbox: '首页',
    customers: '贷款申请',
    rawCustomers: '潜在客户',
    customerRelationships: '潜在客户关系',
    followUp: '跟进',
    calendar: '日历',
    attendance: '考勤与请假',
    setting: '设置',
    tools: '管理中心',
    financeCenter: '财务报表',
    settlement: '结算',
    pendingStock: '库存',
    delivery: '交车清单',
    user: '用户',
    resetData: '重置数据',
    userProfile: '用户资料',
    logout: '登出',
    syncFirebase: '已同步',
    syncCached: '缓存中',
    syncLocal: '本地模式',
    syncLoading: '同步中',
    syncError: '同步失败，使用本地数据',
    retrySync: '重试同步',
    saveFailedToast: '保存到云端失败，数据已保留在本地。可点右上角「重试同步」。',
    saveConflictToast: '云端数据已被其他设备更新，本次保存已停止。请刷新页面后再编辑。',
    retrySyncSuccess: '云端同步成功',
    navGroupWork: '日常工作',
    navGroupPerformance: '业绩与奖励',
    navGroupMarketing: '营销工具',
    navGroupOps: '运营管理',
    navGroupConfig: '系统设置',
    navGroupSystem: '系统',
    vehicleInfoNav: '车辆信息',
    bankDatabaseNav: '银行数据库',
    rejectCodesNav: '拒贷原因代码',
    rolesAccountsNav: '角色与账号',
    roleAccessNav: '角色访问权限',
    trackingWaiting: '正在读取追踪链接...',
    trackingRedirecting: '已记录来源，正在跳转到 WhatsApp。',
    trackingInactive: '这个 WhatsApp 追踪链接已停用。',
    trackingMissing: '这个 WhatsApp 链接无效或已被删除，请向销售员索取新链接。',
    openWhatsApp: '打开 WhatsApp',
    openingIntakeLink: '正在打开客户表格链接',
    openForm: '打开表格',
    toolsTitle: '管理中心',
    toolsSubtitle: '管理工具集合。',
    analytics: '数据分析',
    whatsAppTools: 'WhatsApp 工具',
    auditLog: '审计记录',
    dataExportNav: '数据导出',
    allStaffAnalytics: '全员数据分析',
    openingWhatsApp: '正在打开 WhatsApp',
    shortLinkWaiting: '正在读取短链接...',
    shortLinkRedirecting: '已找到短链接，正在打开客户表格。',
    shortLinkMissing: '这个短链接不存在或已经停用。',
    customerIntakeTitle: '客户申请表',
    customerIntakeSubmittedTo: '提交给',
    customerIntakeStaffNote: '请先选择现金或贷款；除上传文件外，显示的资料都必须填写。',
    seoIntakeStaffNote: '这是官网 SEO 申请。提交后由 Super Admin 分配 Sales 负责人。',
    customerLoanInfo: '客户申请资料',
    customerLoanInfoNote: '所有显示的资料都必须填写；上传文件可选择跳过。按 Enter 或 Tab 前往下一项。',
    personalInfo: '个人资料',
    fullName: '姓名',
    phoneNumber: '电话号码',
    icNumber: '身份证号码',
    email: '电邮',
    maritalStatus: '婚姻状况',
    gender: '性别',
    race: '种族',
    bankName: '薪水银行',
    bankAccountNumber: '银行户口号码',
    yearsAtResidence: '居住年数',
    housingStatus: '住房状况',
    fullAddress: '完整地址',
    emergencyContacts: '紧急联系人',
    emergencyContact1: '紧急联系人 1',
    emergencyContact2: '紧急联系人 2',
    relationship: '关系',
    employmentDetails: '工作资料',
    companyName: '公司名称',
    position: '职位',
    yearsEmployed: '工作年数',
    officePhone: '公司电话',
    workHours: '工作时间',
    grossMonthlySalary: '每月总薪资',
    netMonthlySalary: '每月净薪资',
    companyAddress: '公司地址',
    statusPreferences: '状态与偏好',
    availableToReceiveCalls: '方便接电话时间',
    salaryPaymentMethod: '薪水发放方式',
    preferredMotorcycle: '想要的摩托',
    loanTenure: '贷款年期(年)',
    notSet: '未设置',
    submitApplication: '提交申请',
    submitted: '资料已经提交',
    reference: '编号'
  },
  en: {
    languageLabel: 'Language',
    languageChinese: 'Chinese',
    languageEnglish: 'English',
    languageMalay: 'Malay',
    themeLabel: 'Theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    dashboard: 'Dashboard',
    loginTitle: 'Dr Racing Login',
    loginSubtitle: 'Enter a staff username or email and password to access the dashboard',
    defaultAccount: 'Local mode: sign in with a staff username or email that has a password set',
    taskInbox: 'Home',
    customers: 'Loan Applications',
    rawCustomers: 'Lead Pool',
    customerRelationships: 'Customer Relationships',
    followUp: 'Follow Up',
    calendar: 'Calendar',
    attendance: 'Attendance & Leave',
    setting: 'Setting',
    tools: 'Admin Center',
    financeCenter: 'Financial Reports',
    settlement: 'Settlement',
    pendingStock: 'Stock',
    delivery: 'Delivery',
    user: 'User',
    resetData: 'Reset Data',
    userProfile: 'User Profile',
    logout: 'Logout',
    syncFirebase: 'Synced',
    syncCached: 'Cached',
    syncLocal: 'Local',
    syncLoading: 'Syncing',
    syncError: 'Sync failed, using local',
    retrySync: 'Retry sync',
    saveFailedToast: 'Cloud save failed. Data kept locally. Use "Retry sync" in the header.',
    saveConflictToast: 'Cloud data changed on another device. This save was stopped; refresh before editing again.',
    retrySyncSuccess: 'Cloud sync succeeded',
    navGroupWork: 'Daily Work',
    navGroupPerformance: 'Performance',
    navGroupMarketing: 'Marketing Tools',
    navGroupOps: 'Operations',
    navGroupConfig: 'Configuration',
    navGroupSystem: 'System',
    vehicleInfoNav: 'Vehicle Info',
    bankDatabaseNav: 'Bank Database',
    rejectCodesNav: 'Reject Codes',
    rolesAccountsNav: 'Roles & Accounts',
    roleAccessNav: 'Role Access',
    trackingWaiting: 'Reading tracking link...',
    trackingRedirecting: 'Source recorded. Redirecting to WhatsApp.',
    trackingInactive: 'This WhatsApp tracking link has been disabled.',
    trackingMissing: 'This WhatsApp link is invalid or was deleted. Ask the salesperson for a new link.',
    openWhatsApp: 'Open WhatsApp',
    openingIntakeLink: 'Opening Intake Link',
    openForm: 'Open Form',
    toolsTitle: 'Admin Center',
    toolsSubtitle: 'Admin tools.',
    analytics: 'Analytics',
    whatsAppTools: 'WhatsApp Tools',
    auditLog: 'Audit Log',
    dataExportNav: 'Data Export',
    allStaffAnalytics: 'All Staff Analytics',
    openingWhatsApp: 'Opening WhatsApp',
    shortLinkWaiting: 'Reading short link...',
    shortLinkRedirecting: 'Short link found. Opening the customer form.',
    shortLinkMissing: 'This short link does not exist or has been disabled.',
    customerIntakeTitle: 'Customer Application Form',
    customerIntakeSubmittedTo: 'Submitted to',
    customerIntakeStaffNote: 'Choose Cash or Loan first; every displayed field is required except document uploads.',
    seoIntakeStaffNote: 'This is a website SEO application. Super Admin will assign a Sales handler after submission.',
    customerLoanInfo: 'Customer Application Information',
    customerLoanInfoNote: 'All displayed information is required; document uploads are optional. Press Enter or Tab to move to the next field.',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    phoneNumber: 'Phone number',
    icNumber: 'IC number',
    email: 'Email',
    maritalStatus: 'Marital Status',
    gender: 'Gender',
    race: 'Race',
    bankName: 'Salary bank',
    bankAccountNumber: 'Bank account number',
    yearsAtResidence: 'Years at Residence',
    housingStatus: 'Housing Status',
    fullAddress: 'Full Address',
    emergencyContacts: 'Emergency Contacts',
    emergencyContact1: 'Emergency Contact 1',
    emergencyContact2: 'Emergency Contact 2',
    relationship: 'Relationship',
    employmentDetails: 'Employment Details',
    companyName: 'Company Name',
    position: 'Position',
    yearsEmployed: 'Years Employed',
    officePhone: 'Office Phone',
    workHours: 'Work Hours',
    grossMonthlySalary: 'Gross Monthly Salary',
    netMonthlySalary: 'Net Monthly Salary',
    companyAddress: 'Company Address',
    statusPreferences: 'Status & Preferences',
    availableToReceiveCalls: 'Available to Receive Calls',
    salaryPaymentMethod: 'Salary Payment Method',
    preferredMotorcycle: 'Preferred Motorcycle',
    loanTenure: 'Loan tenure (years)',
    notSet: 'Not set',
    submitApplication: 'Submit Application',
    submitted: 'Application submitted',
    reference: 'Reference'
  },
  ms: {
    languageLabel: "Bahasa",
    languageChinese: "Bahasa Cina",
    languageEnglish: "Bahasa Inggeris",
    languageMalay: "Bahasa Melayu",
    themeLabel: "Tema",
    lightTheme: "Cerah",
    darkTheme: "Gelap",
    dashboard: "Papan Pemuka",
    loginTitle: "Log Masuk Dr Racing",
    loginSubtitle: "Masukkan nama pengguna atau e-mel dan kata laluan kakitangan untuk mengakses papan pemuka",
    defaultAccount: "Mod setempat: log masuk dengan nama pengguna atau e-mel kakitangan yang mempunyai kata laluan yang ditetapkan",
    taskInbox: "Laman Utama",
    customers: "Permohonan Pinjaman",
    rawCustomers: "Kumpulan Prospek",
    customerRelationships: "Hubungan Pelanggan",
    followUp: "Susulan",
    calendar: "Kalendar",
    attendance: "Kehadiran & Cuti",
    setting: "Tetapan",
    tools: "Pusat Pentadbiran",
    financeCenter: 'Laporan Kewangan',
    settlement: "Penyelesaian",
    pendingStock: 'Stok',
    delivery: "Penghantaran",
    user: "Pengguna",
    resetData: "Tetapkan Semula Data",
    userProfile: "Profil Pengguna",
    logout: "Log Keluar",
    syncFirebase: "disegerakkan",
    syncCached: "Dicache",
    syncLocal: "Tempatan",
    syncLoading: "Menyegerakkan",
    syncError: "Penyegerakan gagal, menggunakan tempatan",
    retrySync: "Cuba penyegerakan semula",
    saveFailedToast: "Simpanan awan gagal. Data disimpan secara tempatan. Gunakan \"Cuba semula penyegerakan\" dalam pengepala.",
    saveConflictToast: "Data awan ditukar pada peranti lain. Simpanan ini telah dihentikan; muat semula sebelum mengedit semula.",
    retrySyncSuccess: "Penyegerakan awan berjaya",
    navGroupWork: "Kerja Harian",
    navGroupPerformance: "Prestasi",
    navGroupMarketing: "Alat Pemasaran",
    navGroupOps: "Operasi",
    navGroupConfig: "Konfigurasi",
    navGroupSystem: "Sistem",
    vehicleInfoNav: "Maklumat Kenderaan",
    bankDatabaseNav: "Pangkalan Data Bank",
    rejectCodesNav: "Kod Penolakan",
    rolesAccountsNav: "Peranan & Akaun",
    roleAccessNav: "Akses Peranan",
    trackingWaiting: "Membaca pautan penjejakan...",
    trackingRedirecting: "Sumber direkodkan. Mengubah hala ke WhatsApp.",
    trackingInactive: "Pautan penjejakan WhatsApp ini telah dilumpuhkan.",
    trackingMissing: "Pautan WhatsApp ini tidak sah atau telah dipadam. Minta pautan baharu daripada jurujual.",
    openWhatsApp: "Buka WhatsApp",
    openingIntakeLink: "Membuka Pautan Pengambilan",
    openForm: "Buka Borang",
    toolsTitle: "Pusat Pentadbiran",
    toolsSubtitle: "Alat pentadbir.",
    analytics: "Analitik",
    whatsAppTools: "Alat WhatsApp",
    auditLog: "Log Audit",
    dataExportNav: "Eksport Data",
    allStaffAnalytics: "Semua Analitis Kakitangan",
    openingWhatsApp: "Membuka WhatsApp",
    shortLinkWaiting: "Membaca pautan pendek...",
    shortLinkRedirecting: "Pautan pendek ditemui. Membuka borang pelanggan.",
    shortLinkMissing: "Pautan pendek ini tidak wujud atau telah dilumpuhkan.",
    customerIntakeTitle: "Borang Permohonan Pelanggan",
    customerIntakeSubmittedTo: "Diserahkan kepada",
    customerIntakeStaffNote: "Pilih Tunai atau Pinjaman dahulu; semua ruangan yang dipaparkan wajib kecuali muat naik dokumen.",
    seoIntakeStaffNote: "Ini ialah permohonan SEO laman web. Super Admin akan menetapkan pengendali Jualan selepas penghantaran.",
    customerLoanInfo: "Maklumat Permohonan Pelanggan",
    customerLoanInfoNote: "Semua maklumat yang dipaparkan wajib; muat naik dokumen adalah pilihan. Tekan Enter atau Tab untuk ke ruangan seterusnya.",
    personalInfo: "Maklumat Peribadi",
    fullName: "Nama Penuh",
    phoneNumber: 'Nombor telefon',
    icNumber: 'Nombor IC',
    email: "E-mel",
    maritalStatus: "Status Perkahwinan",
    gender: "Jantina",
    race: "Bangsa",
    bankName: 'Bank gaji',
    bankAccountNumber: 'Nombor akaun bank',
    yearsAtResidence: "Tempoh Menetap",
    housingStatus: "Status Perumahan",
    fullAddress: "Alamat Penuh",
    emergencyContacts: "Kenalan Kecemasan",
    emergencyContact1: "Kenalan Kecemasan 1",
    emergencyContact2: "Kenalan Kecemasan 2",
    relationship: "Perhubungan",
    employmentDetails: "Butiran Pekerjaan",
    companyName: "Nama Syarikat",
    position: "Jawatan",
    yearsEmployed: "Tahun Bekerja",
    officePhone: "Telefon Pejabat",
    workHours: "Waktu Kerja",
    grossMonthlySalary: "Gaji Bulanan Kasar",
    netMonthlySalary: "Gaji Bulanan Bersih",
    companyAddress: "Alamat Syarikat",
    statusPreferences: "Status & Keutamaan",
    availableToReceiveCalls: "Tersedia untuk Menerima Panggilan",
    salaryPaymentMethod: "Kaedah Pembayaran Gaji",
    preferredMotorcycle: "Motosikal Pilihan",
    loanTenure: 'Tempoh pinjaman (tahun)',
    notSet: "Belum ditetapkan",
    submitApplication: "Hantar Permohonan",
    submitted: "Permohonan diserahkan",
    reference: "Rujukan"
  }
} satisfies Record<AppLanguage, Record<string, string>>;

const ROLE_LABEL_COPY: Record<AppLanguage, Record<string, string>> = {
  zh: {
    'Super Admin': '超级管理员',
    'Operations Manager': '运营经理',
    Admin: '管理员',
    'Loan Officer': '贷款专员',
    'Sales Advisor': '销售顾问',
    Sales: '销售',
    Staff: '员工'
  },
  en: {},
  ms: {
    'Super Admin': 'Super Admin',
    'Operations Manager': 'Pengurus Operasi',
    Admin: 'Pentadbir',
    'Loan Officer': 'Pegawai Pinjaman',
    'Sales Advisor': 'Penasihat Jualan',
    Sales: 'Jualan',
    Staff: 'Kakitangan'
  }
};

const getRoleDisplayLabel = (role: string, language: AppLanguage) => ROLE_LABEL_COPY[language][role] || role;

const normalizeMotorPriceBrandTags = (tags: unknown) => {
  const rawTags = Array.isArray(tags) ? tags : [];
  const seen = new Set<string>();
  const normalized = rawTags
    .map((tag) => String(tag).trim().replace(/\s+/g, ' '))
    .filter((tag) => {
      if (!MOTOR_PRICE_BRAND_TAG_SET.has(tag) || seen.has(tag)) {
        return false;
      }

      seen.add(tag);
      return true;
    });

  return normalized.length > 0 ? normalized : DEFAULT_VEHICLE_BRAND_TAGS;
};

const readStoredLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const saved = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
  return saved === 'zh' || saved === 'en' || saved === 'ms' ? saved : 'en';
};

const readStoredTheme = (): AppTheme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const saved = window.localStorage.getItem(APP_THEME_STORAGE_KEY);
  return saved === 'dark' || saved === 'light' ? saved : 'light';
};

const formatMalaysiaIcNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const birth = digits.slice(0, 6);
  const place = digits.slice(6, 8);
  const serial = digits.slice(8, 12);

  return [
    birth,
    place ? `-${place}` : '',
    serial ? `-${serial}` : ''
  ].join('');
};

const isBasicMalaysiaIcNumber = (value: string) => value.replace(/\D/g, '').length === 12;

const RISK_FIELD_LABELS: Record<CustomerRiskField, string> = {
  ic_no: 'IC Number',
  phone_no: 'Phone Number',
  account_number: 'Account Number',
  email: 'Email'
};

const normalizeRiskValue = (field: CustomerRiskField, value: string) => {
  if (field === 'email') {
    return value.trim().toLowerCase();
  }

  if (field === 'phone_no') {
    // Canonicalize Malaysia numbers so "+60 12-345 6789", "6012...", and
    // "012-345 6789" all compare as the same core number.
    let digits = value.replace(/\D/g, '');

    if (digits.startsWith('60') && digits.length >= 11) {
      digits = digits.slice(2);
    }

    if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    return digits;
  }

  return value.replace(/\D/g, '');
};

const normalizeVehicleCondition = (value?: string): VehicleCondition => (
  value === 'New' || value === 'Used' ? value : ''
);

const normalizePurchaseMethod = (value?: string): PurchaseMethod => (
  value === 'Cash' || value === 'Loan' ? value : ''
);

const readSeededCustomerIds = () => {
  if (typeof window === 'undefined') {
    return new Set<string>();
  }

  try {
    const saved = window.localStorage.getItem(SEEDED_CUSTOMER_STORAGE_KEY);
    return new Set<string>(saved ? JSON.parse(saved) : []);
  } catch {
    return new Set<string>();
  }
};

const writeSeededCustomerIds = (ids: Set<string>) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SEEDED_CUSTOMER_STORAGE_KEY, JSON.stringify(Array.from(ids)));
};

const mergeMissingSeedCustomers = (list: LoanApplication[], initialApplications: LoanApplication[]) => {
  const seededIds = readSeededCustomerIds();
  const existingIds = new Set(list.map((application) => application.id));
  let shouldWriteSeededIds = false;

  SEEDED_CUSTOMER_IDS.forEach((id) => {
    if (existingIds.has(id) && !seededIds.has(id)) {
      seededIds.add(id);
      shouldWriteSeededIds = true;
    }
  });

  const additions = initialApplications.filter((application) => (
    SEEDED_CUSTOMER_IDS.includes(application.id) &&
    !existingIds.has(application.id) &&
    !seededIds.has(application.id)
  ));

  if (additions.length > 0) {
    additions.forEach((application) => seededIds.add(application.id));
    writeSeededCustomerIds(seededIds);
    return {
      applications: [...additions, ...list],
      added: true
    };
  }

  if (shouldWriteSeededIds) {
    writeSeededCustomerIds(seededIds);
  }

  return {
    applications: list,
    added: false
  };
};

const createCustomerActivityId = () => newId('ACTIVITY');

const normalizeActivityThread = (thread?: CustomerActivityEntry[]) => (
  Array.isArray(thread)
    ? thread
      .filter((entry) => entry && entry.id && entry.created_at)
      .map((entry) => ({
        ...entry,
        tagged_staff_names: uniqueStrings(entry.tagged_staff_names || []),
        tagged_roles: uniqueRoles(entry.tagged_roles || [])
      }))
      .slice(0, 500)
    : []
);

// A loan is still "being handled" (transferable) until it reaches a final status.
// APPROVE / REJECT / CANCELLED are finished — those stay with the original handler.
const IN_PROGRESS_LOAN_STATUSES = new Set<LoanStatus>([
  LoanStatus.NEW,
  LoanStatus.PENDING,
  LoanStatus.IN_PROCESS,
  LoanStatus.FOLLOW_UP
]);

// A taken lead is done once it has been submitted, rejected, or closed.
const DONE_LEAD_STATUSES = new Set(['Submitted Loan', 'Rejected', 'Closed']);

const normalizeLoanStatus = (value?: string): LoanStatus => {
  const normalized = String(value || '').trim().replace(/_/g, ' ').replace(/\s+/g, ' ').toUpperCase();

  if (normalized === LoanStatus.NEW) return LoanStatus.NEW;
  if (normalized === LoanStatus.PENDING || normalized === 'SUBMITTED') return LoanStatus.PENDING;
  if (normalized === LoanStatus.IN_PROCESS) return LoanStatus.IN_PROCESS;
  if (normalized === LoanStatus.APPROVE || normalized === 'APPROVED' || normalized === 'DONE') return LoanStatus.APPROVE;
  if (normalized === LoanStatus.REJECT || normalized === 'REJECTED') return LoanStatus.REJECT;
  if (normalized === LoanStatus.FOLLOW_UP) return LoanStatus.FOLLOW_UP;
  if (normalized === LoanStatus.CANCELLED || normalized === 'CANCEL') return LoanStatus.CANCELLED;

  return LoanStatus.NEW;
};

const isActiveLead = (lead: RawCustomerLead) => (
  Boolean(lead.taken_by_staff_name) && !DONE_LEAD_STATUSES.has(lead.follow_up_status || '')
);

const normalizeLeadFollowUpDays = (value: unknown) => Math.min(Math.max(Math.round(Number(value) || 1), 1), 30);

const getLeadFollowUpStorageKey = (staffName: string) => `dr_racing_lead_follow_up_days:${staffName.trim().toLowerCase()}`;

const readLeadFollowUpDays = (staffName: string) => {
  if (typeof window === 'undefined' || !staffName.trim()) return 1;
  return normalizeLeadFollowUpDays(window.localStorage.getItem(getLeadFollowUpStorageKey(staffName)) || 1);
};

const getWhatsAppNewTabStorageKey = (staffName: string) => `dr_racing_whatsapp_new_tab:${staffName.trim().toLowerCase()}`;

const readWhatsAppOpenInNewTab = (staffName: string) => {
  if (typeof window === 'undefined' || !staffName.trim()) return true;
  return window.localStorage.getItem(getWhatsAppNewTabStorageKey(staffName)) !== 'false';
};

const getWhatsAppLeadDefaultMessageStorageKey = (staffName: string) => (
  `dr_racing_whatsapp_lead_default_message:${staffName.trim().toLowerCase()}`
);

const readWhatsAppLeadDefaultMessage = (staffName: string) => {
  if (typeof window === 'undefined' || !staffName.trim()) return null;
  return window.localStorage.getItem(getWhatsAppLeadDefaultMessageStorageKey(staffName));
};

const getDefaultLeadFollowUpIso = (days = 1) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + normalizeLeadFollowUpDays(days));
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow.toISOString();
};

const getInitialAdminReviewDueIso = (submittedAt: string) => {
  const submitted = new Date(submittedAt);
  const dueDate = Number.isNaN(submitted.getTime()) ? new Date() : submitted;
  dueDate.setDate(dueDate.getDate() + 1);
  dueDate.setHours(9, 0, 0, 0);
  return dueDate.toISOString();
};

const selectLoanAdminOwner = (applicationId: string, accounts: RoleAccount[]) => {
  const activeAdmins = accounts
    .filter((account) => account.status === 'Active' && account.role === 'Admin')
    .sort((left, right) => left.name.localeCompare(right.name));
  const fallbackSuperAdmins = accounts
    .filter((account) => account.status === 'Active' && account.role === 'Super Admin')
    .sort((left, right) => left.name.localeCompare(right.name));
  const candidates = activeAdmins.length > 0 ? activeAdmins : fallbackSuperAdmins;

  if (candidates.length === 0) {
    return '';
  }

  const assignmentHash = Array.from(applicationId).reduce(
    (hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0,
    0
  );

  return candidates[assignmentHash % candidates.length]?.name || '';
};

const createStatusActivityEntry = (
  staff: StaffSession,
  fromStatus: LoanStatus,
  toStatus: LoanStatus
): CustomerActivityEntry => ({
  id: createCustomerActivityId(),
  type: 'status_change',
  body: `Status changed from ${fromStatus} to ${toStatus}.`,
  staff_name: staff.name,
  staff_role: staff.role,
  created_at: new Date().toISOString(),
  tagged_staff_names: [],
  tagged_roles: [],
  from_status: fromStatus,
  to_status: toStatus
});

const createWorkflowActivityEntry = (
  staff: StaffSession,
  body: string,
  taggedStaffNames: string[] = [],
  taggedRoles: RoleAccountRole[] = []
): CustomerActivityEntry => ({
  id: createCustomerActivityId(),
  type: 'system',
  body,
  staff_name: staff.name,
  staff_role: staff.role,
  created_at: new Date().toISOString(),
  tagged_staff_names: uniqueStrings(taggedStaffNames),
  tagged_roles: uniqueRoles(taggedRoles)
});

export default function App() {
  const { showConfirm, showPasswordPrompt } = useBrandedDialog();
  const requestStaffTotp = useStaffMfaPrompt();
  const [language, setLanguage] = useState<AppLanguage>(() => readStoredLanguage());
  const [theme, setTheme] = useState<AppTheme>(() => readStoredTheme());
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [rawCustomerLeads, setRawCustomerLeads] = useState<RawCustomerLead[]>([]);
  const [errorCodeDefinitions, setErrorCodeDefinitions] = useState<ErrorCodeDefinition[]>([]);
  const [roleAccounts, setRoleAccounts] = useState<RoleAccount[]>([]);
  const [roleNavAccess, setRoleNavAccess] = useState<RoleNavAccessSetting[]>(() => buildDefaultRoleNavAccessSettings());
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>(() => buildDefaultVehicleCategories());
  const [vehicleBrandLogos, setVehicleBrandLogos] = useState<Record<string, string>>({});
  const [defaultAvatarLibrary, setDefaultAvatarLibrary] = useState<StaffDefaultAvatar[]>([]);
  const [whatsAppTrackingLinks, setWhatsAppTrackingLinks] = useState<WhatsAppTrackingLink[]>([]);
  const [whatsAppTrackingClicks, setWhatsAppTrackingClicks] = useState<WhatsAppTrackingClick[]>([]);
  const [whatsAppDefaultMessage, setWhatsAppDefaultMessage] = useState(DEFAULT_WHATSAPP_DEFAULT_MESSAGE);
  const [customerIntakeShortLinks, setCustomerIntakeShortLinks] = useState<CustomerIntakeShortLink[]>([]);
  const [customMissions, setCustomMissions] = useState<CustomMission[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [vehicleTags, setVehicleTags] = useState<string[]>(DEFAULT_VEHICLE_TAGS);
  const [vehicleBrandTags, setVehicleBrandTags] = useState<string[]>(DEFAULT_VEHICLE_BRAND_TAGS);
  const [vehicleCatalog, setVehicleCatalog] = useState<VehicleCatalogItem[]>(INITIAL_VEHICLE_CATALOG);
  const [financeProfiles, setFinanceProfiles] = useState<FinanceProfile[]>(FINANCE_PROFILES);
  const [commissionRules, setCommissionRules] = useState<CommissionRules>(DEFAULT_COMMISSION_RULES);
  const commissionTierPlans = useMemo(() => normalizeCommissionTierPlans(commissionRules), [commissionRules]);
  // Each handler follows the plan picked in Roles & Accounts (owner 2026-10-24).
  const commissionTiers = useMemo(() => buildCommissionTierSource(commissionTierPlans, roleAccounts), [commissionTierPlans, roleAccounts]);
  const [attendancePolicy, setAttendancePolicy] = useState<AttendancePolicy>(DEFAULT_ATTENDANCE_POLICY);
  const [channelMarketingSpend, setChannelMarketingSpend] = useState<ChannelMarketingSpend[]>([]);
  const [bankDefinitions, setBankDefinitions] = useState<BankDefinition[]>(DEFAULT_BANK_DEFINITIONS);
  const bankDefinitionsRef = useRef(bankDefinitions);
  bankDefinitionsRef.current = bankDefinitions;
  const [marketingTagRelationships, setMarketingTagRelationships] = useState<MarketingTagRelationship[]>(DEFAULT_MARKETING_TAG_RELATIONSHIPS);
  const [tagNormalizationRules, setTagNormalizationRules] = useState<TagNormalizationRule[]>(DEFAULT_TAG_NORMALIZATION_RULES);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activityThreadScrollRequest, setActivityThreadScrollRequest] = useState(0);
  const [documentChecklistScrollRequest, setDocumentChecklistScrollRequest] = useState(0);
  const [openBankApplicationsRequest, setOpenBankApplicationsRequest] = useState(0);
  const [addBankRequest, setAddBankRequest] = useState(0);
  const [bankPageRequest, setBankPageRequest] = useState<BankPageRequest | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  // Set when a Notification Center item is clicked; Task Inbox reveals that task.
  const [taskInboxFocusRequest, setTaskInboxFocusRequest] = useState<{ taskId: string; key: number } | null>(null);
  const [taskInboxStaffName, setTaskInboxStaffName] = useState(() => readStoredStaffSession().name);
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; tone: 'success' | 'warning' | 'error' }>>([]);
  const [showAllApplications, setShowAllApplications] = useState(() => isOperationsLead(readStoredStaffSession().role));
  const [leadFollowUpDays, setLeadFollowUpDays] = useState(() => readLeadFollowUpDays(readStoredStaffSession().name));
  const [whatsAppOpenInNewTab, setWhatsAppOpenInNewTab] = useState(() => readWhatsAppOpenInNewTab(readStoredStaffSession().name));
  const [activeUserView, setActiveUserView] = useState<'profile' | 'whatsapp'>('profile');
  const [signedInLoginEmail, setSignedInLoginEmail] = useState('');
  const [syncStatus, setSyncStatus] = useState<'loading' | 'cached' | 'firebase' | 'local' | 'error'>('loading');
  const [intakeDraft, setIntakeDraft] = useState(() => ({ ...EMPTY_INTAKE_DRAFT }));
  const [intakeSubmittedApplicationId, setIntakeSubmittedApplicationId] = useState('');
  // True when a retry after a timeout re-sent the earlier content while the
  // customer had edited the form in between (see handleSubmitCustomerIntake).
  const [intakeSubmittedWithoutLaterChanges, setIntakeSubmittedWithoutLaterChanges] = useState(false);
  const intakePendingAttemptRef = useRef<{ draft: CustomerIntakeDraft; documents: CustomerIntakeDocumentDraft[] } | null>(null);
  const [intakeSubmitError, setIntakeSubmitError] = useState<CustomerIntakeSubmitError>('');
  const [intakeSubmitting, setIntakeSubmitting] = useState(false);
  // Blocks a second click before the submitting state re-renders.
  const intakeSubmitInFlightRef = useRef(false);
  const [missionDrafts, setMissionDrafts] = useState<Record<string, VehicleInfoMissionDraft>>({});
  const [clientContext, setClientContext] = useState({
    ip_address: 'Unavailable',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
  });
  // Firebase mode only: the server's answer to the office Wi-Fi check (office
  // IPs never reach staff browsers). null while loading or unreachable.
  const [attendanceNetworkCheck, setAttendanceNetworkCheck] = useState<AttendanceNetworkCheck | null>(null);
  const [isCompactViewport, setIsCompactViewport] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia(COMPACT_VIEWPORT_QUERY).matches
  ));
  const hasAutoReleasedStaleLeadsRef = useRef(false);
  const toastIdRef = useRef(0);
  const syncStatusRef = useRef(syncStatus);
  const saveConflictToastTimerRef = useRef<number | null>(null);
  const applicationsRef = useRef(applications);
  // Latest-list refs for handlers that await before writing: after the await
  // they rebase on these instead of their render-time closure (see
  // src/utils/latestListPatch.ts).
  const rawCustomerLeadsRef = useRef(rawCustomerLeads);
  const calendarNotesRef = useRef(calendarNotes);
  const auditLogsRef = useRef(auditLogs);
  const realtimeApplicationConflictIdsRef = useRef(new Set<string>());
  const realtimeApplicationRecoveryIdsRef = useRef(new Set<string>());
  const realtimeApplicationFlushScheduledRef = useRef(false);
  const skipNextRealtimeNotificationSaveRef = useRef(false);
  const appText = APP_COPY[language];

  applicationsRef.current = applications;
  rawCustomerLeadsRef.current = rawCustomerLeads;
  calendarNotesRef.current = calendarNotes;
  auditLogsRef.current = auditLogs;

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_VIEWPORT_QUERY);
    const updateViewportMode = () => setIsCompactViewport(mediaQuery.matches);
    updateViewportMode();
    mediaQuery.addEventListener('change', updateViewportMode);
    return () => mediaQuery.removeEventListener('change', updateViewportMode);
  }, []);

  const triggerToast = (message: string, tone: 'success' | 'warning' | 'error' = 'success') => {
    const id = ++toastIdRef.current;

    setToasts((current) => [...current.slice(-3), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, tone === 'success' ? 4000 : 8000);
  };

  const clearPendingSaveConflictToast = () => {
    if (saveConflictToastTimerRef.current !== null) {
      window.clearTimeout(saveConflictToastTimerRef.current);
      saveConflictToastTimerRef.current = null;
    }
  };

  const isSaveConflictError = (error: unknown) => (
    error && typeof error === 'object' && 'name' in error &&
    (error.name === 'DashboardStateVersionConflictError' || error.name === 'CollectionItemVersionConflictError')
  );

  useEffect(() => {
    syncStatusRef.current = syncStatus;

    if (syncStatus === 'firebase') {
      clearPendingSaveConflictToast();
    }
  }, [syncStatus]);

  useEffect(() => () => {
    clearPendingSaveConflictToast();
  }, []);

  const {
    availableLoginAccounts,
    currentStaff,
    dashboardReloadToken,
    handleLogout,
    handlePasswordLoginSubmit,
    handleSendPasswordReset,
    isLoggedIn,
    isRestoringSession,
    isLoginSubmitting,
    isPasswordResetSubmitting,
    loginError,
    loginProgress,
    loginRequiresReload,
    loginEmail,
    loginPassword,
    mfaFactors, mfaEnrollmentId, setMfaEnrollmentId, mfaCode, setMfaCode, cancelMfa,
    passwordResetMessage,
    reloadDashboard,
    rememberLogin,
    setLoginEmail,
    setLoginError,
    setLoginPassword,
    setRememberLogin
  } = useStaffSessionAuth({
    roleAccounts,
    firebaseConfigured: isFirebaseConfigured,
    onStaffChanged: (staff) => {
      setShowAllApplications(isOperationsLead(staff.role));
    },
    onLogoutCleanup: () => {
      setSelectedApplication(null);
      setIsDrawerOpen(false);
    },
    triggerToast,
    translate: tr
  });
  const [staffWhatsAppDefaultMessage, setStaffWhatsAppDefaultMessage] = useState<string | null>(() => (
    readWhatsAppLeadDefaultMessage(readStoredStaffSession().name)
  ));
  const currentWhatsAppDefaultMessage = staffWhatsAppDefaultMessage ?? whatsAppDefaultMessage;

  useEffect(() => {
    setStaffWhatsAppDefaultMessage(readWhatsAppLeadDefaultMessage(currentStaff.name));
  }, [currentStaff.name]);

  useEffect(() => {
    if (isLoggedIn) {
      setShowLoginPassword(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setLeadFollowUpDays(readLeadFollowUpDays(currentStaff.name));
    setWhatsAppOpenInNewTab(readWhatsAppOpenInNewTab(currentStaff.name));
  }, [currentStaff.name]);

  const {
    activePage,
    activeRoleTab,
    activeSettingGroup,
    activeToolsView,
    canAccessNavKey,
    setActivePage,
    setActiveRoleTab,
    setActiveSettingGroup,
    setActiveToolsView
  } = useNavigationState(currentStaff.role, roleNavAccess);
  // Compact viewports: which page is open as a full-screen subpage, and the tab
  // Back returns to. Persisted so reload keeps the subpage.
  const [mobileSubpage, setMobileSubpage] = useState<MobileSubpageState | null>(readStoredMobileSubpage);
  useEffect(() => {
    setMobileSubpage((current) => followMobileSubpage(current, activePage));
  }, [activePage]);
  useEffect(() => {
    writeStoredMobileSubpage(mobileSubpage);
  }, [mobileSubpage]);
  const openMobileSubpage = (page: AppPage, returnTab: MobileTab) => {
    setMobileSubpage({ page, returnTab });
    setActivePage(page);
    window.scrollTo({ top: 0 });
  };
  const closeMobileSubpage = () => {
    const returnTab = mobileSubpage?.returnTab ?? 'today';
    setMobileSubpage(null);
    setActivePage(getPageForMobileTab(returnTab));
    window.scrollTo({ top: 0 });
  };
  const canEditLoanApplicationInformation = (application: LoanApplication | null | undefined) => (
    currentStaff.role === 'Super Admin'
    || (currentStaff.role === 'Operations Manager' && canAccessNavKey('customers.editApplication'))
    || application?.handler_name === currentStaff.name
    || (currentStaff.role === 'Admin' && canAccessNavKey('customers.editApplication'))
  );
  const [financeStockRequestId, setFinanceStockRequestId] = useState(0);
  // Opens one deal's checklist on the Delivery page (Home delivery-step cards).
  const [deliveryFocusRequest, setDeliveryFocusRequest] = useState<{ id: number; applicationId: string } | null>(null);
  const [financeStockModel, setFinanceStockModel] = useState('');
  // Bumped whenever the mounted Task Inbox reports its visible tasks, so the
  // App-level mirror below re-reads the per-staff hidden-task ids it may have
  // just changed in localStorage.
  const [taskInboxHiddenIdsVersion, setTaskInboxHiddenIdsVersion] = useState(0);
  const handleTaskInboxVisibleTasksChange = useCallback(() => {
    setTaskInboxHiddenIdsVersion((current) => current + 1);
  }, []);
  const navigateToPageIfAllowed = (navKey: string, page: AppPage) => {
    if (!canAccessNavKey(navKey)) {
      triggerToast(tr('当前角色没有权限打开此页面。', 'Your role cannot open this page.', 'Peranan anda tidak boleh membuka halaman ini.'), 'error');
      return false;
    }

    setActivePage(page);
    return true;
  };

  useEffect(() => {
    const activeNavKey = activePage === 'tools'
      ? activeToolsView
      : activePage === 'tags'
        ? SETTING_GROUP_NAV_KEY[activeSettingGroup]
        : activePage;

    if (canAccessNavKey(activeNavKey)) {
      return;
    }

    const fallback = [
      { key: 'taskInbox', page: 'taskInbox' as AppPage },
      { key: 'customers', page: 'customers' as AppPage },
      { key: 'rawCustomers', page: 'rawCustomers' as AppPage },
      { key: 'customerRelationships', page: 'customerRelationships' as AppPage },
      { key: 'calendar', page: 'calendar' as AppPage },
      { key: 'attendance', page: 'attendance' as AppPage },
      { key: 'analytics', page: 'tools' as AppPage, toolsView: 'analytics' as ToolsView },
      { key: 'whatsapp', page: 'tools' as AppPage, toolsView: 'whatsapp' as ToolsView },
      { key: 'user', page: 'user' as AppPage }
    ].find((item) => canAccessNavKey(item.key));

    if (!fallback) {
      return;
    }

    setSelectedApplication(null);
    setIsDrawerOpen(false);
    if (fallback.toolsView) {
      setActiveToolsView(fallback.toolsView);
    }
    setActivePage(fallback.page);
  }, [activePage, activeSettingGroup, activeToolsView, canAccessNavKey, setActivePage, setActiveToolsView]);

  setAppLanguage(language);

  const LanguageSwitcher = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={`inline-flex items-center rounded-card border border-slate-100 bg-white p-1 shadow-e1 ${compact ? 'gap-0.5' : 'gap-1'}`}
      aria-label={appText.languageLabel}
    >
      <Languages className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} ml-1 text-slate-500`} />
      {(['zh', 'en', 'ms'] as AppLanguage[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          className={`rounded-control px-2.5 py-1.5 text-footnote font-bold transition-colors ${
            language === option
              ? 'bg-brand text-white'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          {option === 'zh'
            ? appText.languageChinese
            : option === 'ms'
              ? appText.languageMalay
              : appText.languageEnglish}
        </button>
      ))}
    </div>
  );

  const ThemeSwitcher = ({ compact = false }: { compact?: boolean }) => (
    <button
      type="button"
      onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
      className={`inline-flex items-center gap-2 rounded-card border border-slate-100 bg-white font-bold text-slate-500 shadow-e1 transition-colors hover:bg-slate-50 hover:text-slate-900 ${
        compact ? 'px-2.5 py-1.5 text-footnote' : 'px-3 py-2 text-footnote'
      }`}
      aria-label={appText.themeLabel}
      title={theme === 'dark' ? appText.lightTheme : appText.darkTheme}
    >
      <NavIconImage
        active
        className="h-5 w-5"
        fallback={theme === 'dark' ? <Sun /> : <Moon />}
        iconKey={theme === 'dark' ? 'themeSun' : 'themeMoon'}
      />
      <span>{theme === 'dark' ? appText.lightTheme : appText.darkTheme}</span>
    </button>
  );

  const isWhatsAppRedirectPath = window.location.pathname === '/wa';
  const isCustomerIntakePath = window.location.pathname === '/customer-intake';
  const isSeoHostname = window.location.hostname === 'dr-racing.com' || window.location.hostname === 'www.dr-racing.com';
  const isSeoPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('seo-preview') === '1';
  const isSeoHomePath = window.location.pathname === '/' && (isSeoHostname || isSeoPreview);
  const shortLinkMatch = window.location.pathname.match(/^\/s\/([^/]+)$/);
  const isShortLinkPath = Boolean(shortLinkMatch);
  // 公开路径(客户设备,匿名身份):不读也不整份写 dashboard_state;
  // 只允许 create-only 写入(intake -> customers / audit_logs,wa -> wa_clicks)。
  // Public SEO surfaces. Unlike the landing page these paths never collide with a
  // dashboard route, so they resolve on any host; server.mjs injects a canonical
  // URL pointing at dr-racing.com so alternate hosts do not create duplicates.
  // '/stok' is the stock category page; '/stok/<slug>' is one unit. The detail
  // pattern requires at least one slug character, so the two never collide.
  // Slug matching is case-insensitive and the capture is lowercased, because
  // server.mjs routes with String(req.params.slug).toLowerCase(). A mixed-case
  // URL that the server serves correctly must hydrate to the same view here,
  // otherwise the SSR shell is replaced by a 404 the moment React takes over.
  const isStockIndexPath = /^\/stok\/?$/i.test(window.location.pathname);
  const stockDetailMatch = window.location.pathname.match(/^\/stok\/([a-z0-9-]+)\/?$/i);
  const isStockDetailPath = Boolean(stockDetailMatch);
  const stockDetailSlug = (stockDetailMatch?.[1] || '').toLowerCase();
  const isBlogIndexPath = /^\/blog\/?$/i.test(window.location.pathname);
  const blogPostMatch = window.location.pathname.match(/^\/blog\/([a-z0-9-]+)\/?$/i);
  const isBlogPostPath = Boolean(blogPostMatch);
  const blogPostSlug = (blogPostMatch?.[1] || '').toLowerCase();
  const isCalculatorPath = /^\/kalkulator-ansuran-motor\/?$/i.test(window.location.pathname);
  // Staff-only: rendered after the login gate below, never on the public hosts.
  const isStaffHandbookPath = !isSeoHostname && /^\/handbook\/?$/.test(window.location.pathname);
  const isPublicRoutePath =
    isSeoHomePath ||
    isWhatsAppRedirectPath ||
    isCustomerIntakePath ||
    isShortLinkPath ||
    isStockIndexPath ||
    isStockDetailPath ||
    isBlogIndexPath ||
    isBlogPostPath ||
    isCalculatorPath;
  const activeBankOptions = useMemo(
    () => bankDefinitions.filter((bank) => bank.active).map((bank) => bank.name),
    [bankDefinitions]
  );
  // Banks typed on earlier files, offered as suggestions in Application Detail like Add New Customer does.
  const salaryBankInputHistory = useMemo(
    () => applications.map((application) => application.personal_info?.bank_name || ''),
    [applications]
  );

  useEffect(() => {
    localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language === 'ms' ? 'ms-MY' : 'en';
  }, [language]);

  useEffect(() => {
    localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const dashboardPersistenceValues = useMemo(() => ({
    applications,
    rawCustomerLeads,
    errorCodeDefinitions,
    roleAccounts,
    roleNavAccess,
    defaultAvatarLibrary,
    whatsAppTrackingLinks,
    whatsAppTrackingClicks,
    whatsAppDefaultMessage,
    customerIntakeShortLinks,
    customMissions,
    approvalRequests,
    calendarNotes,
    notifications,
    auditLogs,
    vehicleTags,
    vehicleBrandTags,
    vehicleCatalog,
    vehicleCategories,
    vehicleBrandLogos,
    financeProfiles,
    commissionRules,
    attendancePolicy,
    channelMarketingSpend,
    bankDefinitions,
    marketingTagRelationships,
    tagNormalizationRules
  }), [
    applications,
    rawCustomerLeads,
    errorCodeDefinitions,
    roleAccounts,
    roleNavAccess,
    defaultAvatarLibrary,
    whatsAppTrackingLinks,
    whatsAppTrackingClicks,
    whatsAppDefaultMessage,
    customerIntakeShortLinks,
    customMissions,
    approvalRequests,
    calendarNotes,
    notifications,
    auditLogs,
    vehicleTags,
    vehicleBrandTags,
    vehicleCatalog,
    vehicleCategories,
    vehicleBrandLogos,
    financeProfiles,
    commissionRules,
    attendancePolicy,
    channelMarketingSpend,
    bankDefinitions,
    marketingTagRelationships,
    tagNormalizationRules
  ]);

  const {
    persistDashboardState,
    waitForDashboardPersistenceIdle,
    writeLocalDashboardState,
    writeLocalDashboardValue
  } = useDashboardPersistence({
    values: dashboardPersistenceValues,
    firebaseConfigured: isFirebaseConfigured,
    publicRoute: isPublicRoutePath,
    setSyncStatus,
    onSaveRecovered: () => {
      clearPendingSaveConflictToast();
      triggerToast(appText.retrySyncSuccess);
    },
    onVersionConflict: () => {
      clearPendingSaveConflictToast();
      triggerToast(tr(
        '云端资料已先更新；正在重新载入最新版本，请重新执行刚才的修改。',
        'Cloud data changed first. Reloading the latest version; please repeat your last edit.',
        'Data awan telah berubah dahulu. Memuat semula versi terkini; sila ulang suntingan terakhir.'
      ), 'error');
      reloadDashboard();
    },
    onCollectionConflict: (error) => {
      triggerToast(tr(
        `${error.collectionName}/${error.itemId} 已被其他设备更新；这条记录未覆盖，其他同步继续。`,
        `${error.collectionName}/${error.itemId} changed on another device. This record was not overwritten; other sync continues.`,
        `${error.collectionName}/${error.itemId} telah berubah pada peranti lain. Rekod ini tidak ditulis ganti; penyegerakan lain diteruskan.`
      ), 'error');
    },
    onSaveFailed: (error) => {
      if (isSaveConflictError(error)) {
        clearPendingSaveConflictToast();
        saveConflictToastTimerRef.current = window.setTimeout(() => {
          saveConflictToastTimerRef.current = null;

          if (syncStatusRef.current !== 'firebase') {
            triggerToast(appText.saveConflictToast, 'error');
          }
        }, SAVE_CONFLICT_TOAST_DELAY_MS);
        return;
      }

      if (error instanceof Error && error.name === 'DashboardStateTooLargeError') {
        triggerToast(tr(
          '设置没有保存：共享资料快满了（Firestore 单份文件上限 1 MB）。请删掉不用的头像、银行图标或旧的审批记录后再试。',
          'Settings were not saved: the shared data document is nearly full (Firestore 1 MB limit). Remove unused avatars, bank icons or old approval requests and try again.',
          'Tetapan tidak disimpan: dokumen data kongsi hampir penuh (had Firestore 1 MB). Buang avatar, ikon bank atau permintaan kelulusan lama yang tidak digunakan dan cuba lagi.'
        ), 'error');
        return;
      }

      if (error instanceof Error && error.name === 'CollectionItemPermissionDeniedError') {
        triggerToast(tr(
          '这次修改没有保存：你的账号没有权限改这条记录，请联系 Super Admin。',
          'This change was not saved: your account is not allowed to change this record. Ask a Super Admin.',
          'Perubahan ini tidak disimpan: akaun anda tidak dibenarkan mengubah rekod ini. Hubungi Super Admin.'
        ), 'error');
        return;
      }

      triggerToast(appText.saveFailedToast, 'error');
    }
  });

  const {
    customerIntakeParams,
    redirectStatus,
    redirectTargetUrl,
    shortLinkRedirectStatus,
    shortLinkRedirectTargetUrl
  } = usePublicRoutes({
    customerIntakeShortLinks,
    syncStatus,
    whatsAppTrackingLinks
  });

  const handleRetrySync = () => {
    setSyncStatus('loading');
    persistDashboardState({}, { immediate: true });
  };

  const renderNoAccess = () => (
    <div className="rounded-card border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-3 text-headline text-slate-800">{tr('当前角色没有权限查看此页面', 'Your role cannot view this page', "Peranan anda tidak boleh melihat halaman ini")}</p>
    </div>
  );

  const normalizeMoneyAmount = (value: unknown) => {
    const numericValue = typeof value === 'number'
      ? value
      : Number(String(value ?? '').replace(/[^\d.-]/g, ''));

    return Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0;
  };

  const normalizeInstallmentFormulaBase = (value: unknown): 'loan' | 'net_loan' | undefined => {
    return value === 'loan' || value === 'net_loan' ? value : undefined;
  };

  const calculateFormulaInstallment = (loanAmount: number, depositAmount: number, formulaBase: 'loan' | 'net_loan' | undefined, multiplier: number, years: number) => {
    const baseAmount = formulaBase === 'net_loan' ? Math.max(loanAmount - depositAmount, 0) : loanAmount;
    if (!formulaBase || baseAmount <= 0 || multiplier <= 0 || years <= 0) {
      return 0;
    }

    return Math.round((baseAmount * multiplier / (years * 12)) * 100) / 100;
  };

  const normalizeFinanceProfiles = (list: FinanceProfile[]) => {
    const byId = new Map(list.map((profile) => [profile.id, profile]));

    return FINANCE_PROFILES.map((defaultProfile) => {
      const savedProfile = byId.get(defaultProfile.id);
      const terms = (savedProfile?.terms || defaultProfile.terms)
        .map<FinanceProfileTerm | null>((term) => {
          if (![2, 3, 4, 5, 6, 7].includes(term.years) || (term.base !== 'loan' && term.base !== 'net_loan')) {
            return null;
          }

          const multiplier = normalizeMoneyAmount(term.multiplier);
          if (multiplier <= 0) {
            return null;
          }

          return {
            years: term.years,
            base: term.base,
            multiplier
          };
        })
        .filter((term): term is FinanceProfileTerm => Boolean(term))
        .sort((a, b) => a.years - b.years);

      return {
        ...defaultProfile,
        terms
      };
    });
  };

  const calculateFinanceProfileInstallment = (
    loanAmount: number,
    depositAmount: number,
    profileId: string | undefined,
    years: 2 | 3 | 4 | 5 | 6 | 7,
    profiles = financeProfiles
  ) => {
    const profile = findFinanceProfile(profileId, profiles);
    const term = profile?.terms.find((item) => item.years === years);

    return term ? calculateFormulaInstallment(loanAmount, depositAmount, term.base, term.multiplier, years) : 0;
  };

  const normalizeVehicleCatalogList = (list: VehicleCatalogItem[], profiles = financeProfiles) => {
    return list
      .map<VehicleCatalogItem | null>((item) => {
        const model = item.model.trim().replace(/\s+/g, ' ');
        const key = normalizeVehicleModel(model);
        if (!model || !key) {
          return null;
        }
        const requestedBrand = item.brand.trim().replace(/\s+/g, ' ') || DEFAULT_VEHICLE_BRAND_TAGS[0];
        // Never drop a catalog row (and its physical stock) merely because a
        // legacy/imported brand is outside the current controlled vocabulary.
        const brand = MOTOR_PRICE_BRAND_TAG_SET.has(requestedBrand)
          ? requestedBrand
          : DEFAULT_VEHICLE_BRAND_TAGS[0];

        const sellingPrice = normalizeMoneyAmount(item.selling_price);
        const loanAmount = normalizeMoneyAmount(item.loan_amount);
        const depositAmount = normalizeMoneyAmount(item.deposit_amount);
        const costPrice = normalizeMoneyAmount(item.cost_price);
        const financeProfile = normalizeFinanceProfileId(item.finance_profile, profiles) || inferFinanceProfileFromVehicle(model, brand);
        const installment2Y = normalizeMoneyAmount(item.installment_2y);
        const installment3Y = normalizeMoneyAmount(item.installment_3y);
        const installment4Y = normalizeMoneyAmount(item.installment_4y);
        const installment5Y = normalizeMoneyAmount(item.installment_5y);
        const installment6Y = normalizeMoneyAmount(item.installment_6y);
        const installment7Y = normalizeMoneyAmount(item.installment_7y);
        const formulaBase2Y = normalizeInstallmentFormulaBase(item.installment_formula_base_2y);
        const formulaBase3Y = normalizeInstallmentFormulaBase(item.installment_formula_base_3y);
        const formulaBase4Y = normalizeInstallmentFormulaBase(item.installment_formula_base_4y);
        const formulaBase5Y = normalizeInstallmentFormulaBase(item.installment_formula_base_5y);
        const formulaBase6Y = normalizeInstallmentFormulaBase(item.installment_formula_base_6y);
        const formulaBase7Y = normalizeInstallmentFormulaBase(item.installment_formula_base_7y);
        const multiplier2Y = normalizeMoneyAmount(item.installment_multiplier_2y);
        const multiplier3Y = normalizeMoneyAmount(item.installment_multiplier_3y);
        const multiplier4Y = normalizeMoneyAmount(item.installment_multiplier_4y);
        const multiplier5Y = normalizeMoneyAmount(item.installment_multiplier_5y);
        const multiplier6Y = normalizeMoneyAmount(item.installment_multiplier_6y);
        const multiplier7Y = normalizeMoneyAmount(item.installment_multiplier_7y);
        const profitAmount = item.profit_amount === undefined
          ? Math.max(sellingPrice - costPrice, 0)
          : normalizeMoneyAmount(item.profit_amount);

        return {
          ...item,
          id: item.id || newId('VEH'),
          model,
          brand,
          body_type: 'Motorcycle',
          finance_profile: financeProfile,
          selling_price: sellingPrice,
          loan_amount: loanAmount,
          deposit_amount: depositAmount,
          installment_2y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 2, profiles) || (formulaBase2Y && multiplier2Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase2Y, multiplier2Y, 2) : installment2Y),
          installment_3y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 3, profiles) || (formulaBase3Y && multiplier3Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase3Y, multiplier3Y, 3) : installment3Y),
          installment_4y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 4, profiles) || (formulaBase4Y && multiplier4Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase4Y, multiplier4Y, 4) : installment4Y),
          installment_5y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 5, profiles) || (formulaBase5Y && multiplier5Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase5Y, multiplier5Y, 5) : installment5Y),
          installment_6y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 6, profiles) || (formulaBase6Y && multiplier6Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase6Y, multiplier6Y, 6) : installment6Y),
          installment_7y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 7, profiles) || (formulaBase7Y && multiplier7Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase7Y, multiplier7Y, 7) : installment7Y),
          installment_formula_base_2y: financeProfile ? undefined : formulaBase2Y,
          installment_formula_base_3y: financeProfile ? undefined : formulaBase3Y,
          installment_formula_base_4y: financeProfile ? undefined : formulaBase4Y,
          installment_formula_base_5y: financeProfile ? undefined : formulaBase5Y,
          installment_formula_base_6y: financeProfile ? undefined : formulaBase6Y,
          installment_formula_base_7y: financeProfile ? undefined : formulaBase7Y,
          installment_multiplier_2y: financeProfile ? undefined : multiplier2Y,
          installment_multiplier_3y: financeProfile ? undefined : multiplier3Y,
          installment_multiplier_4y: financeProfile ? undefined : multiplier4Y,
          installment_multiplier_5y: financeProfile ? undefined : multiplier5Y,
          installment_multiplier_6y: financeProfile ? undefined : multiplier6Y,
          installment_multiplier_7y: financeProfile ? undefined : multiplier7Y,
          cost_price: costPrice,
          profit_amount: profitAmount,
          stock_units: (item.stock_units || []).map((unit) => ({
            ...unit,
            number_plate: normalizeVehicleNumberPlate(unit.number_plate),
            chassis_number: String(unit.chassis_number || '').trim().toUpperCase().replace(/\s+/g, ' '),
            engine_number: String(unit.engine_number || '').trim().toUpperCase().replace(/\s+/g, ' ')
          })),
          profit_review_month: item.profit_review_month || '',
          profit_reviewed_at: item.profit_reviewed_at || '',
          profit_reviewed_by: item.profit_reviewed_by || '',
          price_source: item.price_source || '',
          created_at: item.created_at || new Date().toISOString()
        };
      })
      .filter((item): item is VehicleCatalogItem => Boolean(item))
      .sort((a, b) => a.model.localeCompare(b.model) || a.id.localeCompare(b.id));
  };

  const mergeVehicleCatalogWithInitial = (list: VehicleCatalogItem[], profiles = financeProfiles) => {
    return normalizeVehicleCatalogList(list, profiles);
  };

  const normalizeRawCustomerLeads = (list: RawCustomerLead[]) => {
    const byLead = new Map<string, RawCustomerLead>();
    const isTakenRawLead = (lead?: RawCustomerLead) => (
      Boolean(lead && (lead.lead_scope === 'Taken Lead' || lead.taken_by_staff_name))
    );
    const getFollowUpActivityTime = (lead?: RawCustomerLead) => (
      new Date(lead?.last_follow_up_at || lead?.taken_at || lead?.received_at || '').getTime() || 0
    );
    const mergeDuplicateRawLead = (existing: RawCustomerLead, incoming: RawCustomerLead): RawCustomerLead => {
      const existingIsTaken = isTakenRawLead(existing);
      const incomingIsTaken = isTakenRawLead(incoming);
      const followUpSource = incomingIsTaken && (!existingIsTaken || getFollowUpActivityTime(incoming) >= getFollowUpActivityTime(existing))
        ? incoming
        : existingIsTaken
          ? existing
          : incoming;
      const merged = {
        ...existing,
        ...incoming
      };

      if (!isTakenRawLead(followUpSource)) {
        return {
          ...merged,
          lead_scope: incoming.lead_scope || existing.lead_scope || 'Public Lead',
          taken_by_staff_id: incoming.taken_by_staff_id || existing.taken_by_staff_id || '',
          taken_by_staff_name: incoming.taken_by_staff_name || existing.taken_by_staff_name || '',
          taken_by_staff_role: incoming.taken_by_staff_role || existing.taken_by_staff_role || '',
          taken_at: incoming.taken_at || existing.taken_at || '',
          follow_up_status: incoming.follow_up_status || existing.follow_up_status || 'New',
          last_follow_up_at: incoming.last_follow_up_at || existing.last_follow_up_at || '',
          next_follow_up_at: incoming.next_follow_up_at || existing.next_follow_up_at || '',
          follow_up_note: incoming.follow_up_note || existing.follow_up_note || ''
        };
      }

      return {
        ...merged,
        lead_scope: 'Taken Lead',
        taken_by_staff_id: followUpSource.taken_by_staff_id || '',
        taken_by_staff_name: followUpSource.taken_by_staff_name || '',
        taken_by_staff_role: followUpSource.taken_by_staff_role || '',
        taken_at: followUpSource.taken_at || '',
        follow_up_status: followUpSource.follow_up_status || 'Contacted',
        last_follow_up_at: followUpSource.last_follow_up_at || '',
        next_follow_up_at: followUpSource.next_follow_up_at || '',
        follow_up_note: followUpSource.follow_up_note || ''
      };
    };

    list.forEach((lead) => {
      const channel = lead.channel || 'Other';
      const leadId = String(lead.lead_id || '').trim();
      const phoneNo = String(lead.phone_no || '').trim();
      const fallbackKey = normalizePhoneNumber(phoneNo) || `${String(lead.name || '').trim().toLowerCase()}:${lead.received_at || ''}`;
      const visibility = lead.lead_visibility === 'Private' ? 'Private' as const : 'Public' as const;
      const ownershipKey = visibility === 'Private'
        ? `private:${String(lead.created_by_staff_id || lead.created_by_staff_name || lead.taken_by_staff_name || '').trim().toLowerCase()}`
        : 'public';
      const key = `${ownershipKey}:${channel}:${leadId || fallbackKey}`;

      if (!fallbackKey && !leadId) {
        return;
      }

      const normalizedLead: RawCustomerLead = {
        ...lead,
        id: lead.id || `RAW-${channel.toUpperCase()}-${leadId || Date.now()}`,
        channel,
        lead_id: leadId,
        username: String(lead.username || '').trim(),
        received_at: lead.received_at || new Date().toISOString(),
        raw_status: String(lead.raw_status || 'Raw').trim() || 'Raw',
        source_traffic: String(lead.source_traffic || '').trim(),
        source_action: String(lead.source_action || '').trim(),
        source_scenario: String(lead.source_scenario || '').trim(),
        name: String(lead.name || '').trim(),
        ic_no: String(lead.ic_no || '').trim(),
        phone_no: phoneNo,
        account_number: String(lead.account_number || '').trim(),
        email: String(lead.email || '').trim(),
        work_phone: String(lead.work_phone || '').trim(),
        work_email: String(lead.work_email || '').trim(),
        whatsapp: String(lead.whatsapp || '').trim(),
        messenger: String(lead.messenger || '').trim(),
        instagram: String(lead.instagram || '').trim(),
        facebook: String(lead.facebook || '').trim(),
        tiktok: String(lead.tiktok || '').trim(),
        city: String(lead.city || '').trim(),
        state: String(lead.state || '').trim(),
        country: String(lead.country || '').trim(),
        company_name: String(lead.company_name || '').trim(),
        job_title: String(lead.job_title || '').trim(),
        imported_at: lead.imported_at || new Date().toISOString(),
        ...(lead.lead_visibility ? { lead_visibility: visibility } : {}),
        ...(lead.entry_method ? { entry_method: lead.entry_method } : {}),
        ...(lead.created_by_staff_id ? { created_by_staff_id: String(lead.created_by_staff_id).trim() } : {}),
        ...(lead.created_by_staff_name ? { created_by_staff_name: String(lead.created_by_staff_name).trim() } : {}),
        ...(lead.created_by_staff_role ? { created_by_staff_role: String(lead.created_by_staff_role).trim() } : {}),
        lead_scope: lead.lead_scope === 'Taken Lead' || lead.taken_by_staff_name ? 'Taken Lead' as const : 'Public Lead' as const,
        taken_by_staff_id: String(lead.taken_by_staff_id || '').trim(),
        taken_by_staff_name: String(lead.taken_by_staff_name || '').trim(),
        taken_by_staff_role: String(lead.taken_by_staff_role || '').trim(),
        taken_at: lead.taken_at || '',
        follow_up_status: lead.follow_up_status || 'New',
        last_follow_up_at: lead.last_follow_up_at || '',
        next_follow_up_at: lead.next_follow_up_at || '',
        follow_up_note: String(lead.follow_up_note || '').trim(),
        released_at: lead.released_at || ''
      };
      const existingLead = byLead.get(key);

      byLead.set(key, existingLead ? mergeDuplicateRawLead(existingLead, normalizedLead) : normalizedLead);
    });

    return Array.from(byLead.values()).sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
  };

  const mergeLocalTakenRawCustomerLeads = (baseLeads: RawCustomerLead[], localLeads: RawCustomerLead[]) => {
    const normalizedBase = normalizeRawCustomerLeads(baseLeads);
    const byId = new Map(normalizedBase.map((lead) => [lead.id, lead]));

    localLeads
      .filter((lead) => lead.lead_scope === 'Taken Lead' || Boolean(lead.taken_by_staff_name))
      .forEach((localLead) => {
        const existing = byId.get(localLead.id);
        const existingTime = new Date(existing?.last_follow_up_at || existing?.taken_at || '').getTime() || 0;
        const localTime = new Date(localLead.last_follow_up_at || localLead.taken_at || '').getTime() || 0;
        const releasedTime = new Date(existing?.released_at || '').getTime() || 0;

        // A newer remote release beats stale local taken state, so released
        // leads do not resurrect from another device's localStorage.
        if (releasedTime > localTime) {
          return;
        }

        if (!existing || !(existing.lead_scope === 'Taken Lead' || existing.taken_by_staff_name) || localTime >= existingTime) {
          byId.set(localLead.id, {
            ...(existing || localLead),
            lead_scope: 'Taken Lead',
            taken_by_staff_id: localLead.taken_by_staff_id || existing?.taken_by_staff_id || '',
            taken_by_staff_name: localLead.taken_by_staff_name || existing?.taken_by_staff_name || '',
            taken_by_staff_role: localLead.taken_by_staff_role || existing?.taken_by_staff_role || '',
            taken_at: localLead.taken_at || existing?.taken_at || '',
            follow_up_status: localLead.follow_up_status || existing?.follow_up_status || 'Contacted',
            last_follow_up_at: localLead.last_follow_up_at || existing?.last_follow_up_at || '',
            next_follow_up_at: localLead.next_follow_up_at || existing?.next_follow_up_at || '',
            follow_up_note: localLead.follow_up_note || existing?.follow_up_note || ''
          });
        }
      });

    return normalizeRawCustomerLeads(Array.from(byId.values()));
  };

  const findNormalizationRule = (domain: TagNormalizationDomain, rawValue: string, rules = tagNormalizationRules) => {
    const normalizedRaw = rawValue.trim().replace(/\s+/g, ' ').toLowerCase();
    if (!normalizedRaw) {
      return undefined;
    }

    return rules.find((rule) => (
      rule.active &&
      rule.domain === domain &&
      (
        rule.raw_value.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedRaw ||
        rule.normalized_tag.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedRaw
      )
    ));
  };

  const detectVehicleFromModel = (model: string, catalog = vehicleCatalog, rules = tagNormalizationRules) => {
    const normalizationRule = findNormalizationRule('vehicle', model, rules);
    if (normalizationRule && MOTOR_PRICE_BRAND_TAG_SET.has(normalizationRule.parent_tag)) {
      return {
        vehicle_tag: 'Motorcycle',
        vehicle_brand: normalizationRule.parent_tag
      };
    }

    return {
      vehicle_tag: inferVehicleTagFromModel(model, catalog),
      vehicle_brand: inferVehicleBrandFromModel(model, catalog)
    };
  };

  const normalizeVehicleOptions = (app: LoanApplication, catalog = vehicleCatalog, rules = tagNormalizationRules): VehiclePurchaseOption[] => {
    const rawOptions = Array.isArray(app.vehicle_options) && app.vehicle_options.length > 0
      ? app.vehicle_options
      : [
        {
          id: `VEH-OPTION-${app.id}-01`,
          vehicle_model: app.vehicle_model || '',
          vehicle_tag: app.vehicle_tag || 'Motorcycle',
          vehicle_brand: app.vehicle_brand || 'Yamaha',
          vehicle_condition: app.vehicle_condition || '',
          purchase_method: app.purchase_method || '',
          priority: 1
        }
      ];

    return rawOptions
      .map((option, index) => {
        const vehicleModel = option.vehicle_model.trim();
        const detectedVehicle = detectVehicleFromModel(vehicleModel, catalog, rules);

        return {
          id: option.id || `VEH-OPTION-${app.id}-${String(index + 1).padStart(2, '0')}`,
          vehicle_model: vehicleModel,
          vehicle_tag: detectedVehicle.vehicle_tag || 'Motorcycle',
          vehicle_brand: detectedVehicle.vehicle_brand || 'Yamaha',
          vehicle_condition: normalizeVehicleCondition(option.vehicle_condition),
          purchase_method: normalizePurchaseMethod(option.purchase_method),
          motor_selling_price: String(option.motor_selling_price ?? '').trim(),
          deposit: String(option.deposit ?? '').trim(),
          total_cash_price: String(option.total_cash_price ?? '').trim(),
          motor_mileage: String(option.motor_mileage ?? '').trim(),
          priority: Number(option.priority) > 0 ? Number(option.priority) : index + 1
        };
      })
      .filter((option, index) => option.vehicle_model || index === 0)
      .sort((a, b) => a.priority - b.priority)
      .map((option, index) => ({
        ...option,
        priority: index + 1
      }));
  };

  const hydrateApplications = (list: LoanApplication[], catalog = vehicleCatalog, rules = tagNormalizationRules, initialApplications: LoanApplication[] = []) => {
    return list.map((app) => {
      const defaultApp = initialApplications.find((item) => item.id === app.id);
      const legacyIdOrPlate = (app as LoanApplication & { id_or_plat?: string }).id_or_plat || '';
      const vehicleModel = app.vehicle_model || defaultApp?.vehicle_model || '';
      const detectedVehicle = detectVehicleFromModel(vehicleModel, catalog, rules);
      const vehicleOptions = normalizeVehicleOptions({ ...app, vehicle_model: vehicleModel }, catalog, rules);
      const primaryVehicleOption = vehicleOptions[0];
      const purchaseMethod = primaryVehicleOption?.purchase_method || normalizePurchaseMethod(app.purchase_method || defaultApp?.purchase_method);
      const status = normalizeLoanStatus(app.status || defaultApp?.status);
      const pendingWith = getLoanPendingWith({ status, pending_with: app.pending_with || defaultApp?.pending_with });
      const pendingAction = getLoanPendingAction({ status, pending_action: app.pending_action || defaultApp?.pending_action });
      const pendingSince = app.pending_since || defaultApp?.pending_since || app.submitted_at || '';
      const storedActionDueAt = app.action_due_at || defaultApp?.action_due_at || '';
      const pendingSinceTime = new Date(pendingSince).getTime();
      const storedActionDueTime = new Date(storedActionDueAt).getTime();
      const actionDueAt = pendingAction === 'Review Application'
        && Number.isFinite(pendingSinceTime)
        && Number.isFinite(storedActionDueTime)
        && storedActionDueTime <= pendingSinceTime + 60_000
        ? getInitialAdminReviewDueIso(pendingSince)
        : storedActionDueAt;
      const rawPayslipDocuments = (
        Array.isArray(app.payslip_documents)
          ? app.payslip_documents
          : defaultApp?.payslip_documents || []
      ) as unknown[];
      const payslipDocuments = rawPayslipDocuments.filter((document): document is PayslipDocument => (
        Boolean(document)
        && typeof document === 'object'
        && typeof (document as PayslipDocument).id === 'string'
        && typeof (document as PayslipDocument).file_name === 'string'
        && typeof (document as PayslipDocument).file_type === 'string'
        && typeof (document as PayslipDocument).file_size === 'number'
        && typeof (document as PayslipDocument).uploaded_by === 'string'
        && typeof (document as PayslipDocument).uploaded_at === 'string'
        && typeof (document as PayslipDocument).file_data_url === 'string'
      ));

      return {
        ...app,
        ic_no: app.ic_no || defaultApp?.ic_no || legacyIdOrPlate,
        vehicle_plate: app.vehicle_plate || defaultApp?.vehicle_plate || legacyIdOrPlate,
        vehicle_model: primaryVehicleOption?.vehicle_model || vehicleModel,
        vehicle_tag: primaryVehicleOption?.vehicle_tag || detectedVehicle.vehicle_tag,
        vehicle_brand: primaryVehicleOption?.vehicle_brand || detectedVehicle.vehicle_brand,
        vehicle_condition: primaryVehicleOption?.vehicle_condition || normalizeVehicleCondition(app.vehicle_condition || defaultApp?.vehicle_condition),
        purchase_method: purchaseMethod,
        vehicle_options: vehicleOptions,
        handler_name: app.handler_name || defaultApp?.handler_name || 'Unassigned',
        handler_role: app.handler_role || defaultApp?.handler_role || 'Staff',
        admin_owner_name: app.admin_owner_name || defaultApp?.admin_owner_name || '',
        pending_with: pendingWith,
        pending_action: pendingAction,
        pending_since: pendingSince,
        action_due_at: actionDueAt,
        active_bank_application_id: app.active_bank_application_id || defaultApp?.active_bank_application_id || '',
        status,
        error_code: getApplicationRejectCodes({
          error_code: app.error_code || defaultApp?.error_code || '',
          error_codes: app.error_codes || defaultApp?.error_codes
        })[0] || '',
        error_codes: getApplicationRejectCodes({
          error_code: app.error_code || defaultApp?.error_code || '',
          error_codes: app.error_codes || defaultApp?.error_codes
        }),
        customer_call_back_at: app.customer_call_back_at || defaultApp?.customer_call_back_at || '',
        personal_info: normalizePersonalInfo(app.personal_info || defaultApp?.personal_info),
        emergency_contacts: normalizeEmergencyContacts(app.emergency_contacts || defaultApp?.emergency_contacts),
        employment_details: normalizeEmploymentDetails(app.employment_details || defaultApp?.employment_details),
        preferences: normalizePreferences(app.preferences || defaultApp?.preferences),
        payslip_documents: payslipDocuments,
        document_checklist: normalizeDocumentChecklist({
          document_checklist: app.document_checklist || defaultApp?.document_checklist || [],
          payslip_documents: payslipDocuments,
          purchase_method: purchaseMethod,
          vehicle_condition: primaryVehicleOption?.vehicle_condition || normalizeVehicleCondition(app.vehicle_condition || defaultApp?.vehicle_condition)
        }),
        bank_applications: (Array.isArray(app.bank_applications)
          ? app.bank_applications
          : defaultApp?.bank_applications || []
        ).map((bankApplication) => ({
          ...bankApplication,
          decision_at: bankApplication.decision_at || bankApplication.approved_at || '',
          reason_category: bankApplication.reason_category || '',
          status_reason: bankApplication.status_reason || '',
          next_action: bankApplication.next_action || '',
          next_follow_up_at: bankApplication.next_follow_up_at || ''
        }))
      };
    });
  };

  const hydrateRoleAccounts = (list: RoleAccount[]) => {
    return list.map((account) => ({
      ...account,
      email: normalizeAuthEmail(account.email),
      firebase_auth_email: normalizeAuthEmail(account.firebase_auth_email || account.email),
      firebase_uid: typeof account.firebase_uid === 'string' ? account.firebase_uid.trim() : '',
      role: normalizeRoleAccountRole(account.role),
      avatar_data_url: typeof account.avatar_data_url === 'string' ? account.avatar_data_url : '',
      default_avatar_id: typeof account.default_avatar_id === 'string' ? account.default_avatar_id : ''
    }));
  };

  const normalizeErrorCodeDefinitions = (list: ErrorCodeDefinition[]) => {
    const byCode = new Map<string, ErrorCodeDefinition>();

    list.forEach((definition) => {
      const code = normalizeRejectCode(definition.code);
      if (!code) {
        return;
      }

      const issue = String(definition.issue || '').trim();
      const inferred = getDefaultRejectCodeClassification(code, issue);
      byCode.set(code, {
        code,
        issue,
        customer_request: String(definition.customer_request || '').trim(),
        category: definition.category || inferred.category,
        default_next_step: definition.default_next_step || inferred.default_next_step
      });
    });

    return Array.from(byCode.values());
  };

  const hydrateErrorCodeDefinitions = (list: ErrorCodeDefinition[]) => {
    const source = Array.isArray(list) ? list : [];
    const normalized = normalizeErrorCodeDefinitions(source);
    const hasInitialDeclineCode = normalized.some((definition) => INITIAL_DECLINE_CODE_SET.has(definition.code));
    const classificationChanged = source.some((definition) => !definition.category || !definition.default_next_step);

    if (normalized.length > 0 && hasInitialDeclineCode) {
      return {
        definitions: normalized,
        changed: classificationChanged || normalized.length !== source.length
      };
    }

    const existingCodes = new Set(normalized.map((definition) => definition.code));
    const missingInitialCodes = INITIAL_ERROR_CODE_DEFINITIONS.filter((definition) => !existingCodes.has(definition.code));

    return {
      definitions: [...normalized, ...missingInitialCodes],
      changed: classificationChanged || missingInitialCodes.length > 0 || normalized.length !== source.length
    };
  };

  useDashboardHydration({
    reloadToken: dashboardReloadToken,
    firebaseConfigured: isFirebaseConfigured,
    publicRoute: isPublicRoutePath,
    defaultWhatsAppDefaultMessage: DEFAULT_WHATSAPP_DEFAULT_MESSAGE,
    initialVehicleCatalog: INITIAL_VEHICLE_CATALOG,
    setters: {
      setApplications,
      setRawCustomerLeads,
      setErrorCodeDefinitions,
      setRoleAccounts,
      setRoleNavAccess,
      setVehicleCategories,
      setVehicleBrandLogos,
      setDefaultAvatarLibrary,
      setWhatsAppTrackingLinks,
      setWhatsAppTrackingClicks,
      setWhatsAppDefaultMessage,
      setCustomerIntakeShortLinks,
      setCustomMissions,
      setApprovalRequests,
      setCalendarNotes,
      setNotifications,
      setAuditLogs,
      setVehicleTags,
      setVehicleBrandTags,
      setVehicleCatalog,
      setFinanceProfiles,
      setCommissionRules,
      setAttendancePolicy,
      setChannelMarketingSpend,
      setBankDefinitions,
      setMarketingTagRelationships,
      setTagNormalizationRules
    },
    normalizers: {
      normalizeCommissionRules,
      normalizeFinanceProfiles,
      mergeVehicleCatalogWithInitial,
      normalizeBankDefinitions,
      normalizeMarketingTagRelationships,
      normalizeTagNormalizationRules,
      hydrateApplications,
      mergeMissingSeedCustomers,
      normalizeRawCustomerLeads,
      mergeLocalTakenRawCustomerLeads,
      hydrateErrorCodeDefinitions,
      hydrateRoleAccounts,
      normalizeNotificationList,
      normalizeMotorPriceBrandTags,
      areJsonLikeValuesEqual,
      warnLocalCacheReadFailed
    },
    setSyncStatus,
    writeLocalDashboardState: writeLocalDashboardState as (state: Partial<DashboardHydrationState>) => void,
    writeLocalDashboardValue: writeLocalDashboardValue as <Key extends keyof DashboardHydrationState>(
      key: Key,
      value: DashboardHydrationState[Key]
    ) => void
  });

  const {
  } = useDashboardRealtimeSync({
    currentStaff,
    applicationsRef,
    hydrateApplications,
    isFirebaseConfigured,
    isLoggedIn,
    isPublicRoutePath,
    preserveLoadedApplicationFileData,
    realtimeApplicationConflictIdsRef,
    realtimeApplicationFlushScheduledRef,
    realtimeApplicationRecoveryIdsRef,
    reloadCustomerFromFirebase,
    setApplications,
    setCalendarNotes,
    setSelectedApplication,
    setSyncStatus,
    skipNextRealtimeNotificationSaveRef,
    stripApplicationFileDataForComparison,
    subscribeToCalendarTasksFromFirebase,
    syncStatus,
    tagNormalizationRules,
    triggerToast,
    vehicleCatalog,
    waitForDashboardPersistenceIdle,
    writeLocalDashboardValue
  });

  const {
    attendanceEvents,
    setAttendanceEvents,
    attendanceIncidentResolutions,
    setAttendanceIncidentResolutions,
    attendanceSchedules,
    setAttendanceSchedules,
    staffLeaveRequests,
    setStaffLeaveRequests
  } = useAttendanceState({
    currentStaff,
    attendancePolicy,
    roleAccounts,
    isLoggedIn,
    isPublicRoutePath,
    syncStatus,
    triggerToast
  });

  // Refresh the server Wi-Fi answer whenever the policy changes (a team or IP
  // edit by Super Admin) so the Check in status does not go stale.
  useEffect(() => {
    if (!isFirebaseConfigured || isPublicRoutePath || !isLoggedIn || syncStatus !== 'firebase') return;
    let isMounted = true;
    void fetchAttendanceNetworkCheck().then((result) => {
      if (isMounted) setAttendanceNetworkCheck(result);
    });
    return () => {
      isMounted = false;
    };
  }, [attendancePolicy, isLoggedIn, isPublicRoutePath, syncStatus]);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/client-context')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Client context unavailable');
        }
        return response.json();
      })
      .then((context: { ip_address?: string; user_agent?: string }) => {
        if (!isMounted) {
          return;
        }

        setClientContext({
          ip_address: context.ip_address || 'Local browser',
          user_agent: context.user_agent || navigator.userAgent || ''
        });
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setClientContext({
          ip_address: window.location.hostname === 'localhost' ? 'localhost' : 'Unavailable',
          user_agent: navigator.userAgent || ''
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update localStorage helper
  const updateApplicationsState = (updatedList: LoanApplication[]) => {
    const previousList = applicationsRef.current;
    applicationsRef.current = updatedList;
    setApplications(updatedList);
    writeLocalDashboardValue('applications', updatedList);
    const saved = persistDashboardState({ applications: updatedList });
    // The dashboard is the ledger's master for customers: changed contact details follow once saved.
    if (isFirebaseConfigured) {
      const changedIds = getLedgerContactChanges(previousList, updatedList);
      if (changedIds.length > 0) {
        void saved.then((ok) => {
          if (!ok) return;
          const getIdToken = async () => (await import('./lib/auth')).getCurrentFirebaseIdToken(true);
          changedIds.forEach((applicationId) => { void requestLedgerContactSync(applicationId, getIdToken); });
        });
      }
    }
    return saved;
  };

  const updateRawCustomerLeadsState = (updatedList: RawCustomerLead[]) => {
    const normalized = normalizeRawCustomerLeads(updatedList);

    rawCustomerLeadsRef.current = normalized;
    setRawCustomerLeads(normalized);
    writeLocalDashboardValue('rawCustomerLeads', normalized);
    return persistDashboardState({ rawCustomerLeads: normalized });
  };

  const updateErrorCodeDefinitionsState = (updatedList: ErrorCodeDefinition[]) => {
    const normalized = normalizeErrorCodeDefinitions(updatedList);

    setErrorCodeDefinitions(normalized);
    writeLocalDashboardValue('errorCodeDefinitions', normalized);
    return persistDashboardState({ errorCodeDefinitions: normalized });
  };

  const updateRoleAccountsState = (updatedList: RoleAccount[]) => {
    const normalized = updatedList.map((account) => ({
      ...account,
      email: normalizeAuthEmail(account.email),
      firebase_auth_email: normalizeAuthEmail(account.firebase_auth_email || account.email),
      firebase_uid: typeof account.firebase_uid === 'string' ? account.firebase_uid.trim() : '',
      role: normalizeRoleAccountRole(account.role),
      default_avatar_id: account.default_avatar_id || ''
    }));

    setRoleAccounts(normalized);
    writeLocalDashboardValue('roleAccounts', normalized);
    return persistDashboardState({ roleAccounts: normalized });
  };

  const updateRoleNavAccessState = (updatedList: RoleNavAccessSetting[]) => {
    const normalized = normalizeRoleNavAccessSettings(updatedList);

    setRoleNavAccess(normalized);
    writeLocalDashboardValue('roleNavAccess', normalized);
    return persistDashboardState({ roleNavAccess: normalized });
  };

  const updateDefaultAvatarLibraryState = (updatedList: StaffDefaultAvatar[]) => {
    const normalized = updatedList
      .filter((avatar) => avatar.avatar_data_url && avatar.label.trim())
      .map((avatar) => ({
        ...avatar,
        label: avatar.label.trim()
      }));

    setDefaultAvatarLibrary(normalized);
    writeLocalDashboardValue('defaultAvatarLibrary', normalized);
    return persistDashboardState({ defaultAvatarLibrary: normalized });
  };

  const normalizeTags = (tags: string[]) => {
    const uniqueTags = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
    return uniqueTags.length > 0 ? uniqueTags : ['Other'];
  };

  const updateVehicleTagsState = (updatedList: string[]) => {
    const normalized = normalizeTags(updatedList);

    setVehicleTags(normalized);
    writeLocalDashboardValue('vehicleTags', normalized);
    return persistDashboardState({ vehicleTags: normalized });
  };

  const updateVehicleBrandTagsState = (updatedList: string[]) => {
    const normalized = normalizeMotorPriceBrandTags(updatedList);

    setVehicleBrandTags(normalized);
    writeLocalDashboardValue('vehicleBrandTags', normalized);
    return persistDashboardState({ vehicleBrandTags: normalized });
  };

  const updateFinanceProfilesState = (updatedList: FinanceProfile[]) => {
    const normalizedProfiles = normalizeFinanceProfiles(updatedList);
    const normalizedVehicleCatalog = normalizeVehicleCatalogList(vehicleCatalog, normalizedProfiles);

    setFinanceProfiles(normalizedProfiles);
    setVehicleCatalog(normalizedVehicleCatalog);
    writeLocalDashboardState({
      financeProfiles: normalizedProfiles,
      vehicleCatalog: normalizedVehicleCatalog
    });
    return persistDashboardState({
      financeProfiles: normalizedProfiles,
      vehicleCatalog: normalizedVehicleCatalog
    });
  };

  const updateVehicleCatalogState = (updatedList: VehicleCatalogItem[]) => {
    const normalized = normalizeVehicleCatalogList(updatedList);

    setVehicleCatalog(normalized);
    writeLocalDashboardValue('vehicleCatalog', normalized);
    return persistDashboardState({ vehicleCatalog: normalized });
  };

  const updateChannelMarketingSpendState = (updatedList: ChannelMarketingSpend[]) => {
    const normalized = updatedList
      .filter((entry) => /^\d{4}-\d{2}$/.test(entry.month) && entry.channel.trim() && normalizeMoneyAmount(entry.amount) > 0)
      .map((entry) => ({
        ...entry,
        channel: entry.channel.trim().replace(/\s+/g, ' '),
        amount: normalizeMoneyAmount(entry.amount),
        notes: String(entry.notes || '').trim()
      }))
      .sort((a, b) => b.month.localeCompare(a.month) || a.channel.localeCompare(b.channel));

    setChannelMarketingSpend(normalized);
    writeLocalDashboardValue('channelMarketingSpend', normalized);
    return persistDashboardState({ channelMarketingSpend: normalized });
  };

  const updateBankDefinitionsState = (updatedList: BankDefinition[]) => {
    const normalized = normalizeBankDefinitions(updatedList);

    setBankDefinitions(normalized);
    writeLocalDashboardValue('bankDefinitions', normalized);
    return persistDashboardState({ bankDefinitions: normalized });
  };

  const updateMarketingTagRelationshipsState = (updatedList: MarketingTagRelationship[]) => {
    const normalized = normalizeMarketingTagRelationships(updatedList);

    setMarketingTagRelationships(normalized);
    writeLocalDashboardValue('marketingTagRelationships', normalized);
    return persistDashboardState({ marketingTagRelationships: normalized });
  };

  const updateTagNormalizationRulesState = (updatedList: TagNormalizationRule[]) => {
    const normalized = normalizeTagNormalizationRules(updatedList);

    setTagNormalizationRules(normalized);
    writeLocalDashboardValue('tagNormalizationRules', normalized);
    return persistDashboardState({ tagNormalizationRules: normalized });
  };

  const updateWhatsAppTrackingLinksState = (updatedList: WhatsAppTrackingLink[]) => {
    const normalized = updatedList.map((link) => ({
      ...link,
      phone_number: normalizePhoneNumber(link.phone_number),
      channel: link.channel.trim().toLowerCase(),
      medium: link.medium.trim().toLowerCase(),
      campaign: link.campaign.trim().toLowerCase()
    }));

    setWhatsAppTrackingLinks(normalized);
    writeLocalDashboardValue('whatsAppTrackingLinks', normalized);
    return persistDashboardState({ whatsAppTrackingLinks: normalized });
  };

  // Not capped: visitor totals must count every record. The browser cache
  // skips itself when the list grows too large (useDashboardPersistence).
  const updateWhatsAppTrackingClicksState = (updatedList: WhatsAppTrackingClick[]) => {
    setWhatsAppTrackingClicks(updatedList);
    writeLocalDashboardValue('whatsAppTrackingClicks', updatedList);
    return persistDashboardState({ whatsAppTrackingClicks: updatedList });
  };

  const updateWhatsAppDefaultMessageState = (message: string) => {
    const normalizedMessage = message.trim();
    setStaffWhatsAppDefaultMessage(normalizedMessage);
    window.localStorage.setItem(
      getWhatsAppLeadDefaultMessageStorageKey(currentStaff.name),
      normalizedMessage
    );
  };

  const updateCustomerIntakeShortLinksState = (updatedList: CustomerIntakeShortLink[]) => {
    setCustomerIntakeShortLinks(updatedList);
    writeLocalDashboardValue('customerIntakeShortLinks', updatedList);
    return persistDashboardState({ customerIntakeShortLinks: updatedList });
  };

  const updateCustomMissionsState = (updatedList: CustomMission[]) => {
    setCustomMissions(updatedList);
    writeLocalDashboardValue('customMissions', updatedList);
    return persistDashboardState({ customMissions: updatedList });
  };

  const updateApprovalRequestsState = (updatedList: ApprovalRequest[]) => {
    setApprovalRequests(updatedList);
    writeLocalDashboardValue('approvalRequests', updatedList);
    return persistDashboardState({ approvalRequests: updatedList });
  };

  const updateCalendarNotesState = (updatedList: CalendarNote[]) => {
    calendarNotesRef.current = updatedList;
    setCalendarNotes(updatedList);
    writeLocalDashboardValue('calendarNotes', updatedList);
    return persistDashboardState({ calendarNotes: updatedList });
  };

  const updateNotificationsState = (updatedList: NotificationItem[], stateOverrides: Partial<DashboardState> = {}, skipRemoteSave = false) => {
    const normalized = normalizeNotificationList(updatedList);

    setNotifications(normalized);
    writeLocalDashboardValue('notifications', normalized);

    // Realtime customer snapshots are already cloud-originated. Every online
    // Admin derives the same Task Inbox/notification locally; writing that
    // derived result back from every browser would create dashboard version
    // conflicts. Explicit notification actions still persist normally.
    if (skipRemoteSave) {
      return Promise.resolve();
    }

    return persistDashboardState({
      ...stateOverrides,
      notifications: normalized
    });
  };

  const updateAuditLogsState = (
    updatedList: AuditLogEntry[],
    stateOverrides: Partial<DashboardState> = {}
  ) => {
    const limited = updatedList.slice(0, 2000);

    auditLogsRef.current = limited;
    setAuditLogs(limited);
    writeLocalDashboardValue('auditLogs', limited);
    // Only persist the audit log plus whatever the caller explicitly overrides.
    // Pinning every other key from this render's (possibly stale) closures used
    // to clobber a pending save queued moments earlier in the same handler —
    // e.g. Workload Transfer set applications, then appendAuditLog overwrote it
    // with the pre-transfer list, silently reverting the transfer. The pending
    // save queue keeps earlier overrides, and createDashboardState fills the
    // rest from current state, so we no longer need to snapshot everything here.
    return persistDashboardState({
      ...stateOverrides,
      auditLogs: limited
    });
  };

  // One comment id per reply while the same text is retried on the same task
  // (e.g. Send pressed again after a 15 s timeout whose transaction did commit).
  const pendingCalendarReplyAttemptsRef = useRef(new Map<string, PendingCommentAttempt>());

  const formatAuditValue = (value: unknown) => {
    if (value === undefined || value === null || value === '') {
      return '--';
    }

    const stringValue = String(value);

    if (stringValue.startsWith('data:image/')) {
      return '[image data]';
    }

    return stringValue.length > 300 ? `${stringValue.slice(0, 300)}...` : stringValue;
  };

  const createAuditChanges = <Before extends object, After extends object>(before: Before, after: After) => {
    const beforeRecord = before as Record<string, unknown>;
    const afterRecord = after as Record<string, unknown>;

    return Object.keys(afterRecord)
      .filter((field) => formatAuditValue(beforeRecord[field]) !== formatAuditValue(afterRecord[field]))
      .map((field) => ({
        field,
        old_value: formatAuditValue(beforeRecord[field]),
        new_value: formatAuditValue(afterRecord[field])
      }));
  };

  const appendAuditLog = ({
    action,
    target_type,
    target_id,
    target_label,
    changes,
    stateOverrides
  }: {
    action: string;
    target_type: string;
    target_id: string;
    target_label: string;
    changes: AuditLogEntry['changes'];
    stateOverrides?: Partial<DashboardState>;
  }) => {
    if (changes.length === 0) {
      return;
    }

    const entry: AuditLogEntry = {
      id: newId('AUDIT'),
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      action,
      target_type,
      target_id,
      target_label,
      changes,
      ip_address: clientContext.ip_address,
      user_agent: clientContext.user_agent,
      created_at: new Date().toISOString()
    };

    // Read the latest list: appendAuditLog usually runs after an await, and the
    // render-time `auditLogs` would drop entries appended meanwhile.
    updateAuditLogsState([entry, ...auditLogsRef.current], stateOverrides);
  };

  const {
    handleAddCalendarNote,
    handleSetCalendarNoteCompleted,
    handleAddCalendarTaskComment,
    handleDeleteCalendarNote
  } = useCalendarTaskActions({
    currentStaff,
    calendarNotes,
    calendarNotesRef,
    pendingCalendarReplyAttemptsRef,
    saveCalendarNoteToFirebase,
    setCalendarTaskCompletionInFirebase,
    appendCalendarTaskCommentToFirebase,
    deleteCalendarNoteFromFirebase,
    updateCalendarNotesState,
    isFirebaseWriteOutcomeUnknown,
    appendAuditLog,
    triggerToast
  });

  const {
    handleRecordAttendance,
    handleResolveMissingCheckout,
    handleSaveAttendanceSchedules,
    handleSubmitStaffLeaveRequest,
    handleReviewStaffLeaveRequest
  } = useAttendanceActions({
    currentStaff,
    roleAccounts,
    attendancePolicy,
    attendanceEvents,
    attendanceSchedules,
    staffLeaveRequests,
    isFirebaseConfigured,
    setAttendanceEvents,
    setAttendanceIncidentResolutions,
    setAttendanceSchedules,
    setStaffLeaveRequests,
    setAttendanceNetworkCheck,
    setClientContext,
    fetchAttendanceNetworkCheck,
    saveAttendanceEventToFirebase,
    saveAttendanceIncidentResolutionToFirebase,
    saveAttendanceWeeklyScheduleToFirebase,
    saveStaffLeaveRequestToFirebase,
    appendAuditLog,
    triggerToast
  });

  // Claim-on-open model (replaces the old deterministic AUTO_ASSIGN_LOAN_ADMIN
  // repair): an unassigned Loan waiting for Admin (admin_owner_name === '') is
  // intentionally left in the shared pool. Firestore/Storage Rules let every
  // Active Admin read the pool, the review notification broadcasts to all
  // Admins, and the first Admin to open/act on it claims ownership via
  // handleClaimUnassignedLoan. Do not auto-pre-assign here — that would hide the
  // task from every Admin except one and re-create the "Admin can't see the
  // Sales-uploaded IC" bug.

  // Application Detail's Action Log: this file's audit entries, only for roles
  // that may open the Audit Log page.
  const canReadAuditLog = canAccessNavKey('audit');
  const selectedApplicationAuditLogs = useMemo(() => (
    canReadAuditLog && selectedApplication
      ? auditLogs.filter((log) => log.target_id === selectedApplication.id)
      : undefined
  ), [auditLogs, canReadAuditLog, selectedApplication?.id]);

  const errorCodeIssueMap = useMemo(() => {
    return errorCodeDefinitions.reduce<Record<string, ErrorCodeDefinition>>((acc, item) => {
      acc[item.code] = item;
      return acc;
    }, {});
  }, [errorCodeDefinitions]);

  const customerRiskFlagsByApplicationId = useMemo<Record<string, CustomerRiskFlag[]>>(() => {
    const fieldMaps: Record<CustomerRiskField, Map<string, LoanApplication[]>> = {
      ic_no: new Map(),
      phone_no: new Map(),
      account_number: new Map(),
      email: new Map()
    };

    const addRiskValue = (field: CustomerRiskField, rawValue: string, application: LoanApplication) => {
      const normalizedValue = normalizeRiskValue(field, rawValue);
      if (!normalizedValue || normalizedValue.length < 3) {
        return;
      }

      const existing = fieldMaps[field].get(normalizedValue) || [];
      fieldMaps[field].set(normalizedValue, [...existing, application]);
    };

    applications.forEach((application) => {
      addRiskValue('ic_no', application.ic_no || '', application);
      addRiskValue('phone_no', application.phone_no || '', application);
      addRiskValue('account_number', application.personal_info?.account_number || '', application);
      addRiskValue('email', application.personal_info?.email || '', application);
    });

    const result: Record<string, CustomerRiskFlag[]> = {};

    (Object.keys(fieldMaps) as CustomerRiskField[]).forEach((field) => {
      fieldMaps[field].forEach((matchedApplications, value) => {
        if (matchedApplications.length < 2) {
          return;
        }

        matchedApplications.forEach((application) => {
          const otherApplications = matchedApplications.filter((item) => item.id !== application.id);
          const flag: CustomerRiskFlag = {
            field,
            label: RISK_FIELD_LABELS[field],
            value,
            severity: field === 'ic_no' || field === 'account_number' ? 'high' : 'warning',
            matching_application_ids: otherApplications.map((item) => item.id),
            matching_applicant_names: otherApplications.map((item) => item.applicant_name),
            message: `${RISK_FIELD_LABELS[field]} duplicated with ${otherApplications.map((item) => `${item.applicant_name} (${item.id})`).join(', ')}`
          };

          result[application.id] = [...(result[application.id] || []), flag];
        });
      });
    });

    return result;
  }, [applications]);

  const rawCustomerMatches = useMemo<CustomerRawMatch[]>(() => {
    const fieldMaps: Record<CustomerRiskField, Map<string, LoanApplication[]>> = {
      ic_no: new Map(),
      phone_no: new Map(),
      account_number: new Map(),
      email: new Map()
    };

    const addCustomerValue = (field: CustomerRiskField, rawValue: string, application: LoanApplication) => {
      const normalizedValue = normalizeRiskValue(field, rawValue);
      if (!normalizedValue || normalizedValue.length < 3) {
        return;
      }

      fieldMaps[field].set(normalizedValue, [...(fieldMaps[field].get(normalizedValue) || []), application]);
    };

    applications.forEach((application) => {
      addCustomerValue('ic_no', application.ic_no || '', application);
      addCustomerValue('phone_no', application.phone_no || '', application);
      addCustomerValue('account_number', application.personal_info?.account_number || '', application);
      addCustomerValue('email', application.personal_info?.email || '', application);
    });

    const result: CustomerRawMatch[] = [];

    rawCustomerLeads.forEach((lead) => {
      const rawFieldValues: Record<CustomerRiskField, string[]> = {
        ic_no: [lead.ic_no || ''],
        phone_no: [lead.phone_no || '', lead.whatsapp || '', lead.work_phone || ''],
        account_number: [lead.account_number || ''],
        email: [lead.email || '', lead.work_email || '']
      };
      const matchesByCustomerId = new Map<string, { application: LoanApplication; fields: Set<CustomerRiskField> }>();

      (Object.keys(rawFieldValues) as CustomerRiskField[]).forEach((field) => {
        Array.from(new Set(rawFieldValues[field].map((value) => normalizeRiskValue(field, value)).filter((value) => value.length >= 3))).forEach((value) => {
          const matchedApplications = fieldMaps[field].get(value) || [];

          matchedApplications.forEach((application) => {
            const current = matchesByCustomerId.get(application.id);

            if (current) {
              current.fields.add(field);
              return;
            }

            matchesByCustomerId.set(application.id, {
              application,
              fields: new Set<CustomerRiskField>([field])
            });
          });
        });
      });

      matchesByCustomerId.forEach(({ application, fields }) => {
        result.push({
          raw_customer_id: lead.id,
          raw_customer_name: lead.name || lead.username || 'Unnamed lead',
          raw_customer_phone: lead.phone_no,
          raw_customer_channel: lead.channel,
          raw_customer_lead_id: lead.lead_id,
          matched_fields: Array.from(fields),
          customer_id: application.id,
          customer_name: application.applicant_name,
          customer_phone: application.phone_no,
          customer_status: application.status,
          handler_name: application.handler_name,
          submitted_at: application.submitted_at
        });
      });
    });

    return result.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }, [applications, rawCustomerLeads]);

  const rawCustomerMatchesByLeadId = useMemo<Record<string, CustomerRawMatch[]>>(() => (
    rawCustomerMatches.reduce<Record<string, CustomerRawMatch[]>>((acc, match) => {
      acc[match.raw_customer_id] = [...(acc[match.raw_customer_id] || []), match];
      return acc;
    }, {})
  ), [rawCustomerMatches]);

  const rawCustomerMatchesByApplicationId = useMemo<Record<string, CustomerRawMatch[]>>(() => (
    rawCustomerMatches.reduce<Record<string, CustomerRawMatch[]>>((acc, match) => {
      acc[match.customer_id] = [...(acc[match.customer_id] || []), match];
      return acc;
    }, {})
  ), [rawCustomerMatches]);

  const staffVisibleRawCustomerLeads = useMemo(() => rawCustomerLeads.filter((lead) => (
    isOperationsLead(currentStaff.role) ||
    (lead.lead_visibility !== 'Private' && lead.lead_scope !== 'Taken Lead' && !lead.taken_by_staff_name) ||
    lead.created_by_staff_name === currentStaff.name ||
    lead.taken_by_staff_name === currentStaff.name
  )), [currentStaff.name, currentStaff.role, rawCustomerLeads]);

  const staffVisibleRawLeadIds = useMemo(() => new Set(staffVisibleRawCustomerLeads.map((lead) => lead.id)), [staffVisibleRawCustomerLeads]);
  const staffVisibleRawCustomerMatches = useMemo(() => rawCustomerMatches.filter((match) => (
    staffVisibleRawLeadIds.has(match.raw_customer_id)
  )), [rawCustomerMatches, staffVisibleRawLeadIds]);
  const duplicatedRawPhoneCount = useMemo(() => {
    const phoneCounts = staffVisibleRawCustomerLeads.reduce<Map<string, number>>((acc, lead) => {
      const phoneKey = normalizeRiskValue('phone_no', lead.phone_no || '');
      if (phoneKey) acc.set(phoneKey, (acc.get(phoneKey) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    return Array.from(phoneCounts.values() as Iterable<number>).filter((count) => count > 1).length;
  }, [staffVisibleRawCustomerLeads]);

  const missingVehicleInfoMissionCount = useMemo(() => (
    applications.filter((app) => (
      !app.vehicle_condition ||
      !app.purchase_method ||
      getMissingDocumentLabels(app).length > 0
    )).length
  ), [applications]);

  // Same map Super Admin publishes as staffShopsByName for the Rules.
  const staffShopsByName = useMemo(
    () => buildStaffShopsByName(roleAccounts, normalizeAttendancePolicy(attendancePolicy)),
    [attendancePolicy, roleAccounts]
  );
  const adminExtraShopsByName = useMemo(
    () => buildAdminExtraShopsByName(roleAccounts, normalizeAttendancePolicy(attendancePolicy)),
    [attendancePolicy, roleAccounts]
  );

  const isApplicationOwnedByCurrentStaff = useCallback((application: LoanApplication) => (
    isOperationsLead(currentStaff.role) ||
    application.handler_name === currentStaff.name ||
    (
      currentStaff.role === 'Admin' &&
      application.admin_owner_name === currentStaff.name
    ) ||
    (
      // Every application whose handler is in one of the Admin's shops (Rules:
      // isAdminSameShopCustomerData); each save is audited under the Admin.
      currentStaff.role === 'Admin' &&
      isSameShopHandler(staffShopsByName, currentStaff.name, application.handler_name, adminExtraShopsByName)
    ) ||
    (
      // Unassigned Admin-review pool: a Loan waiting for Admin with no assigned
      // Admin owner is visible and claimable by every Active Admin (matches the
      // Firestore/Storage unassigned-pool Rules), until one Admin claims it.
      currentStaff.role === 'Admin' &&
      (application.admin_owner_name || '') === '' &&
      getLoanPendingWith(application) === 'Admin'
    )
  ), [adminExtraShopsByName, currentStaff.name, currentStaff.role, staffShopsByName]);

  const visibleApplications = useMemo(() => {
    if (showAllApplications) {
      return applications;
    }

    return applications.filter(isApplicationOwnedByCurrentStaff);
  }, [applications, isApplicationOwnedByCurrentStaff, showAllApplications]);

  const visibleCalendarRawCustomerLeads = staffVisibleRawCustomerLeads;

  // Role Access → Calendar → See every staff calendar (Operations Manager).
  const canViewAllStaffCalendar = currentStaff.role === 'Super Admin'
    || (isOperationsLead(currentStaff.role) && canAccessNavKey('calendar.viewAllStaff'));
  const calendarApplications = useMemo(() => {
    if (canViewAllStaffCalendar) {
      return applications;
    }

    return applications.filter(isApplicationOwnedByCurrentStaff);
  }, [applications, canViewAllStaffCalendar, isApplicationOwnedByCurrentStaff]);

  const canViewGlobalAnalytics = currentStaff.role === 'Super Admin';
  const analyticsApplications = useMemo(() => (
    canViewGlobalAnalytics
      ? applications
      : applications.filter(isApplicationOwnedByCurrentStaff)
  ), [applications, canViewGlobalAnalytics, isApplicationOwnedByCurrentStaff]);
  const analyticsRawCustomerLeads = useMemo(() => (
    canViewGlobalAnalytics
      ? staffVisibleRawCustomerLeads
      : staffVisibleRawCustomerLeads.filter((lead) => (
        lead.created_by_staff_name === currentStaff.name ||
        lead.taken_by_staff_name === currentStaff.name
      ))
  ), [canViewGlobalAnalytics, currentStaff.name, staffVisibleRawCustomerLeads]);
  const analyticsWhatsAppTrackingLinks = useMemo(() => (
    canViewGlobalAnalytics
      ? whatsAppTrackingLinks
      : whatsAppTrackingLinks.filter((link) => link.sales_name === currentStaff.name)
  ), [canViewGlobalAnalytics, currentStaff.name, whatsAppTrackingLinks]);
  const analyticsWhatsAppTrackingClicks = useMemo(() => (
    canViewGlobalAnalytics
      ? whatsAppTrackingClicks
      : whatsAppTrackingClicks.filter((click) => click.sales_name === currentStaff.name)
  ), [canViewGlobalAnalytics, currentStaff.name, whatsAppTrackingClicks]);
  const analyticsRoleAccounts = useMemo(() => (
    canViewGlobalAnalytics
      ? roleAccounts
      : roleAccounts.filter((account) => account.name === currentStaff.name)
  ), [canViewGlobalAnalytics, currentStaff.name, roleAccounts]);
  // Attendance teams (separate shops): an Admin only sees their own team's staff.
  // Super Admin and Operations Manager keep the all-shop view.
  const attendanceScopeNames = useMemo(() => {
    if (isOperationsLead(currentStaff.role) || attendancePolicy.teams.length === 0) return null;
    const ownTeamId = getAttendanceTeamIdForAccount(
      attendancePolicy,
      roleAccounts.find((account) => account.name === currentStaff.name)?.id
    );
    return new Set([
      currentStaff.name,
      ...roleAccounts
        .filter((account) => getAttendanceTeamIdForAccount(attendancePolicy, account.id) === ownTeamId)
        .map((account) => account.name)
    ]);
  }, [attendancePolicy, currentStaff.name, currentStaff.role, roleAccounts]);
  const teamAttendanceRoleAccounts = useMemo(() => (
    attendanceScopeNames ? roleAccounts.filter((account) => attendanceScopeNames.has(account.name)) : roleAccounts
  ), [attendanceScopeNames, roleAccounts]);
  const teamAttendanceEvents = useMemo(() => (
    attendanceScopeNames ? attendanceEvents.filter((event) => attendanceScopeNames.has(event.staff_name)) : attendanceEvents
  ), [attendanceEvents, attendanceScopeNames]);
  const teamAttendanceSchedules = useMemo(() => (
    attendanceScopeNames ? attendanceSchedules.filter((schedule) => attendanceScopeNames.has(schedule.staff_name)) : attendanceSchedules
  ), [attendanceSchedules, attendanceScopeNames]);
  const teamStaffLeaveRequests = useMemo(() => (
    attendanceScopeNames ? staffLeaveRequests.filter((request) => attendanceScopeNames.has(request.requester_name)) : staffLeaveRequests
  ), [attendanceScopeNames, staffLeaveRequests]);
  const teamAttendanceIncidentResolutions = useMemo(() => (
    attendanceScopeNames
      ? attendanceIncidentResolutions.filter((resolution) => attendanceScopeNames.has(resolution.staff_name))
      : attendanceIncidentResolutions
  ), [attendanceIncidentResolutions, attendanceScopeNames]);
  const monthlyAttendanceExportRows = useMemo(() => buildMonthlyAttendanceExportRows(
    teamAttendanceRoleAccounts,
    teamAttendanceEvents,
    attendancePolicy,
    teamAttendanceSchedules,
    teamStaffLeaveRequests
  ), [attendancePolicy, teamAttendanceEvents, teamAttendanceRoleAccounts, teamAttendanceSchedules, teamStaffLeaveRequests]);
  const analyticsAuditLogs = useMemo(() => (
    canViewGlobalAnalytics
      ? auditLogs
      : auditLogs.filter((log) => log.staff_name === currentStaff.name)
  ), [auditLogs, canViewGlobalAnalytics, currentStaff.name]);
  const analyticsCalendarNotes = useMemo(() => (
    canViewGlobalAnalytics
      ? calendarNotes
      : calendarNotes.filter((note) => (
        note.completed_by === currentStaff.name ||
        note.assigned_to === currentStaff.name ||
        note.staff_name === currentStaff.name
      ))
  ), [calendarNotes, canViewGlobalAnalytics, currentStaff.name]);
  const analyticsNotifications = useMemo(() => (
    canViewGlobalAnalytics
      ? notifications
      : notifications.filter((notification) => (
        notification.recipient_staff_names.includes(currentStaff.name)
      ))
  ), [canViewGlobalAnalytics, currentStaff.name, notifications]);
  const completedTaskEventsForExperience = useMemo(() => buildCompletedTaskEvents({
    auditLogs,
    applications,
    calendarNotes,
    notifications,
    roleAccounts
  }), [applications, auditLogs, calendarNotes, notifications, roleAccounts]);
  const staffExperienceRules = useMemo(
    () => getStaffExperienceRulesFromConfig(commissionRules),
    [commissionRules]
  );
  const currentStaffExperience = useMemo(() => calculateStaffExperience(
    completedTaskEventsForExperience,
    currentStaff.name,
    currentStaff.role,
    undefined,
    staffExperienceRules
  ), [completedTaskEventsForExperience, currentStaff.name, currentStaff.role, staffExperienceRules]);

  const vehicleInfoMissions = useMemo(() => (
    applications
      .filter((app) => app.handler_name === currentStaff.name && (!app.vehicle_condition || !app.purchase_method))
      .slice(0, 5)
  ), [applications, currentStaff.name]);

  const consumeCloudOriginatedNotificationReconciliation = useStableCallback(() => {
    const shouldSkip = skipNextRealtimeNotificationSaveRef.current;
    skipNextRealtimeNotificationSaveRef.current = false;
    return shouldSkip;
  });
  const stableUpdateNotificationsState = useStableCallback(updateNotificationsState);

  const {
    handleMarkNotificationRead,
    visibleNotifications
  } = useDashboardNotifications({
    applications,
    auditLogs,
    calendarNotes,
    currentStaff,
    customMissions,
    notifications,
    rawCustomerLeads,
    rawCustomerMatches,
    roleAccounts,
    roleNavAccess,
    vehicleCatalog,
    syncStatus,
    consumeCloudOriginatedReconciliation: consumeCloudOriginatedNotificationReconciliation,
    updateNotificationsState: stableUpdateNotificationsState
  });
  // Phone push: new notifications on this dashboard go to the recipients' devices.
  useStaffPushRequests({ notifications, enabled: syncStatus === 'firebase' && Boolean(currentStaff.name) });
  useLedgerDueDeposits({ enabled: syncStatus === 'firebase' && (currentStaff.role === 'Super Admin' || currentStaff.role === 'Operations Manager') });

  const taskInboxScopeAccount = useMemo(() => (
    currentStaff.role === 'Super Admin'
      ? roleAccounts.find((account) => account.status === 'Active' && account.name === taskInboxStaffName)
      : roleAccounts.find((account) => account.name === currentStaff.name)
  ), [currentStaff.name, currentStaff.role, roleAccounts, taskInboxStaffName]);
  const taskInboxScopeName = currentStaff.role === 'Super Admin' && taskInboxScopeAccount
    ? taskInboxScopeAccount.name
    : currentStaff.name;
  const taskInboxScopeRole = taskInboxScopeAccount?.role || currentStaff.role;
  const taskInboxNotifications = useMemo(() => {
    if (currentStaff.role !== 'Super Admin') {
      return visibleNotifications;
    }

    return notifications.filter((notification) => (
      notification.recipient_staff_names.length > 0
        ? notification.recipient_staff_names.includes(taskInboxScopeName)
        : taskInboxScopeRole === 'Super Admin' && (
            notification.type === 'loan_admin_action_required' ||
            notification.type === 'bank_follow_up_due' ||
            notification.type === 'rejected_loan_missing_code'
          )
          ? false
          : notification.recipient_roles.includes(taskInboxScopeRole)
    ));
  }, [currentStaff.role, notifications, taskInboxScopeName, taskInboxScopeRole, visibleNotifications]);
  useEffect(() => {
    setTaskInboxStaffName(currentStaff.name);
  }, [currentStaff.name]);

  // One shared visible-task source drives Task Inbox, the sidebar badge, the
  // bell and the mobile shell. It is built here from the same inputs App passes
  // to <TaskInboxPage>, so the counts are right on every page and on compact
  // viewports where the Task Inbox never mounts. Hidden and completed tasks are
  // excluded exactly as the page does.
  const shouldBuildTaskInboxMirror = isLoggedIn && !isPublicRoutePath && canAccessNavKey('taskInbox');
  const taskClockNow = useTaskClock(shouldBuildTaskInboxMirror, activePage);
  const taskInboxMirrorTasks = useMemo(() => {
    if (!shouldBuildTaskInboxMirror) return [];
    const noop = () => undefined;
    const resolvedFalse = async () => false;
    // Only the data fields are mirrored, but the presence of the optional
    // actions changes some task copy, so pass the same set the page receives.
    const mirrorActions: TaskInboxTaskActions = {
      onOpenApplication: noop,
      onOpenNotification: noop,
      onOpenWhatsApp: noop,
      onUpdateMissingInfo: resolvedFalse,
      onAssignApplicationHandler: noop,
      onAssignApplicationAdmin: noop,
      onCompleteCashAcceptance: resolvedFalse,
      onMarkBikeDelivered: resolvedFalse,
      onSetCalendarNoteCompleted: noop,
      onResolveMissingCheckout: resolvedFalse,
      onOpenQuickAddStock: noop,
      onOpenDealSettlement: noop,
      onOpenFinanceStock: noop,
      onQuickAddStock: resolvedFalse,
      onOpenFinanceDeal: noop,
      onOpenDelivery: noop,
      onMarkCommissionPaid: resolvedFalse,
      onSaveDealFinance: resolvedFalse,
      onReviewApproval: noop,
      onReviewLeaveRequest: noop
    };
    return buildTaskInboxTasks({
      applications,
      calendarNotes,
      rawCustomerLeads: staffVisibleRawCustomerLeads,
      roleAccounts,
      roleNavAccess,
      customMissions,
      notifications: taskInboxNotifications,
      approvalRequests,
      staffLeaveRequests: teamStaffLeaveRequests,
      vehicleCatalog,
      bankDefinitions,
      missingCheckoutIncidents: buildOpenMissingCheckoutIncidents(
        teamAttendanceEvents,
        teamAttendanceIncidentResolutions,
        new Date(taskClockNow)
      ),
      currentStaffName: taskInboxScopeName,
      currentStaffRole: taskInboxScopeRole,
      viewerStaffRole: currentStaff.role,
      managementStaffName: currentStaff.name,
      now: taskClockNow
    }, mirrorActions);
  }, [
    applications,
    approvalRequests,
    bankDefinitions,
    calendarNotes,
    currentStaff.name,
    currentStaff.role,
    customMissions,
    roleAccounts,
    roleNavAccess,
    shouldBuildTaskInboxMirror,
    staffVisibleRawCustomerLeads,
    taskClockNow,
    taskInboxNotifications,
    taskInboxScopeName,
    taskInboxScopeRole,
    teamAttendanceEvents,
    teamAttendanceIncidentResolutions,
    teamStaffLeaveRequests,
    vehicleCatalog
  ]);
  const taskInboxHiddenIdSet = useMemo(
    () => new Set<string>(shouldBuildTaskInboxMirror ? readHiddenTaskIds(taskInboxScopeName) : []),
    // taskInboxHiddenIdsVersion is a re-read trigger for localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shouldBuildTaskInboxMirror, taskInboxHiddenIdsVersion, taskInboxScopeName]
  );
  const taskInboxMirrorItems = useMemo<TaskInboxMirrorItem[]>(
    () => filterVisibleTaskInboxTasks(taskInboxMirrorTasks, taskInboxHiddenIdSet).map(toTaskInboxMirrorItem),
    [taskInboxHiddenIdSet, taskInboxMirrorTasks]
  );
  const taskInboxTaskCount = taskInboxMirrorItems.length;

  useEffect(() => {
    if (
      selectedApplication &&
      !showAllApplications &&
      !isApplicationOwnedByCurrentStaff(selectedApplication)
    ) {
      setSelectedApplication(null);
      setIsDrawerOpen(false);
    }
  }, [isApplicationOwnedByCurrentStaff, selectedApplication, showAllApplications]);

  const dismissToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !isLoggedIn || activePage !== 'user') return;
    let cancelled = false;
    void import('./lib/auth')
      .then(({ getCurrentFirebaseStaffEmail }) => getCurrentFirebaseStaffEmail())
      .then((email) => {
        if (!cancelled) setSignedInLoginEmail(email);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [activePage, isLoggedIn]);

  const currentRoleAccount = useMemo(() => {
    const byExactName = roleAccounts.find((account) => account.name === currentStaff.name);

    if (byExactName) {
      return byExactName;
    }

    return availableLoginAccounts.find((account) => account.name === currentStaff.name);
  }, [availableLoginAccounts, currentStaff.name, roleAccounts]);

  const availableDefaultAvatars = useMemo(
    () => mergeDefaultAvatarLibrary(defaultAvatarLibrary),
    [defaultAvatarLibrary]
  );

  // Keep this device's per-staff settings when the name changes (the keys are
  // name-based), whether the staff member or Super Admin did the rename.
  useEffect(() => {
    if (!currentRoleAccount?.id || typeof window === 'undefined') return;
    try {
      const copied = carryStaffLocalSettingsAcrossRename(window.localStorage, currentRoleAccount.id, currentStaff.name, [
        getLeadFollowUpStorageKey,
        getWhatsAppNewTabStorageKey,
        getWhatsAppLeadDefaultMessageStorageKey
      ]);
      if (copied) {
        setLeadFollowUpDays(readLeadFollowUpDays(currentStaff.name));
        setWhatsAppOpenInNewTab(readWhatsAppOpenInNewTab(currentStaff.name));
        setStaffWhatsAppDefaultMessage(readWhatsAppLeadDefaultMessage(currentStaff.name));
      }
    } catch {
      // Storage can be unavailable (private mode); settings then just use defaults.
    }
  }, [currentRoleAccount?.id, currentStaff.name]);

  const defaultAvatarUsage = useMemo(() => {
    const usage: Record<string, string> = {};

    availableDefaultAvatars.forEach((avatar) => {
      const assignedAccount = roleAccounts.find((account) => (
        account.default_avatar_id === avatar.id ||
        (!account.default_avatar_id && account.avatar_data_url === avatar.avatar_data_url)
      ));

      if (assignedAccount) {
        usage[avatar.id] = assignedAccount.id;
      }
    });

    return usage;
  }, [availableDefaultAvatars, roleAccounts]);

  const deliveryPaymentActions = useDeliveryPaymentActions({
    currentStaff,
    applicationsRef,
    appendAuditLog,
    triggerToast,
    repository: { listDeliveryPayments, createDeliveryPayment, findDeliveryPaymentOnServer, voidDeliveryPayment, loadDeliveryReceipt, createDeliveryAttachment, listDeliveryAttachments, loadDeliveryAttachment }
  });

  const {
    handleSelectRow,
    handleAssignApplicationAdmin,
    handleOpenApplicationTarget,
    handleOpenNotificationTarget,
    handleSaveApplication,
    handleCompleteCashAcceptanceFromTaskInbox,
    handleInlineUpdateApplication,
    handleRecordUnitExchange,
    handleSaveDeliveryStep,
    handleSubmitToBankFromTable,
    handleOpenBankPage,
    handleAddCustomerActivityComment,
    handleUpdateCustomerProfile,
    handleUpdateMissingInfoFromTaskInbox,
    handleAddCustomer
  } = useLoanApplicationActions({
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
  });

  const handleUpdateVehicleInfoMissionDraft = useCallback((applicationId: string, draft: VehicleInfoMissionDraft) => {
    setMissionDrafts((current) => ({
      ...current,
      [applicationId]: draft
    }));
  }, []);


  const {
    updateIntakeDraft,
    handleSubmitCustomerIntake,
    handleSaveVehicleInfoMission,
    handleCreateCustomerIntakeShortLink,
    handleCreateWhatsAppShortLink,
    handleAddApprovalRequest,
    handleReviewApprovalRequest
  } = useCustomerIntakeActions({
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
  });

  const buildRawLeadWhatsAppMessage = (lead: RawCustomerLead) => (
    currentWhatsAppDefaultMessage
      .replaceAll('{name}', lead.name || lead.username || 'customer')
      .replaceAll('{phone}', normalizePhoneNumber(lead.phone_no || lead.whatsapp || lead.work_phone))
      .replaceAll('{channel}', lead.channel || 'raw lead')
      .replaceAll('{lead_id}', lead.lead_id || lead.id)
  );

  const openRawLeadWhatsAppUrl = (lead: RawCustomerLead, target: 'api' | 'web') => {
    const phoneNumber = normalizePhoneNumber(lead.phone_no || lead.whatsapp || lead.work_phone);

    if (!phoneNumber) {
      triggerToast(tr('这个名单没有电话号码', 'This lead has no phone number', "Prospek ini tidak mempunyai nombor telefon"));
      return;
    }

    const params = new URLSearchParams({
      phone: phoneNumber,
      text: buildRawLeadWhatsAppMessage(lead)
    });
    const baseUrl = target === 'web' ? 'https://web.whatsapp.com/send' : 'https://api.whatsapp.com/send';

    const whatsAppUrl = `${baseUrl}?${params.toString()}`;
    if (whatsAppOpenInNewTab) {
      window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.assign(whatsAppUrl);
    }
  };

  const {
    handleOpenRawLeadWhatsApp,
    releaseRawLeads,
    handleReleaseRawLead,
    handleUpdateRawLeadFollowUp,
    handleImportRawCustomerLeads,
    handleAssignPrivateRawLeads,
    handleDeleteRawLeads,
    handleDeleteRawLead,
    handleAddRawCustomerLead
  } = useRawLeadActions({
    currentStaff,
    currentRoleAccount,
    rawCustomerLeads,
    applications,
    roleAccounts,
    auditLogs,
    clientContext,
    leadFollowUpDays,
    setRawCustomerLeads,
    writeLocalDashboardValue,
    updateRawCustomerLeadsState,
    updateAuditLogsState,
    markRawLeadsDeletedForSync,
    normalizeRawCustomerLeads,
    openRawLeadWhatsAppUrl,
    getDefaultLeadFollowUpIso,
    isActiveLead,
    normalizeRiskValue,
    appendAuditLog,
    createAuditChanges,
    triggerToast
  });

  // Auto-release: once per session after data is ready, return stale taken
  // leads (no taken/follow-up/next-follow-up activity within the SLA window)
  // to the public pool.
  useEffect(() => {
    if (syncStatus === 'loading' || syncStatus === 'cached' || hasAutoReleasedStaleLeadsRef.current) {
      return;
    }

    hasAutoReleasedStaleLeadsRef.current = true;

    const cutoff = Date.now() - RAW_LEAD_AUTO_RELEASE_DAYS * 24 * 60 * 60 * 1000;
    const staleLeadIds = rawCustomerLeads
      .filter((lead) => {
        const isTaken = lead.lead_scope === 'Taken Lead' || Boolean(lead.taken_by_staff_name);

        if (!isTaken || lead.lead_visibility === 'Private') {
          return false;
        }

        const lastActivity = Math.max(
          new Date(lead.taken_at || '').getTime() || 0,
          new Date(lead.last_follow_up_at || '').getTime() || 0,
          new Date(lead.next_follow_up_at || '').getTime() || 0
        );

        return lastActivity > 0 && lastActivity < cutoff;
      })
      .map((lead) => lead.id);

    if (staleLeadIds.length > 0) {
      releaseRawLeads(staleLeadIds, 'auto');
      triggerToast(tr(`${staleLeadIds.length} 个超过 ${RAW_LEAD_AUTO_RELEASE_DAYS} 天没有跟进的名单已自动放回未分配`, `${staleLeadIds.length} leads idle for over ${RAW_LEAD_AUTO_RELEASE_DAYS} days returned to unassigned`, `${staleLeadIds.length} prospek melahu selama lebih ${RAW_LEAD_AUTO_RELEASE_DAYS} hari dikembalikan kepada tidak ditetapkan`));
    }
  }, [syncStatus, rawCustomerLeads]);

  const {
    handleUpdateAttendancePolicy,
    handleSubmitMissionReward,
    getPasswordActionErrorMessage,
    handleChangeCurrentStaffPassword,
    handleResetData,
    handleAddErrorCodeDefinition,
    handleUpdateErrorCodeDefinition,
    handleDeleteErrorCodeDefinition,
    handleUpdateVehicleCategories
  } = useSystemSettingsActions({
    requestStaffTotp,
    currentStaff,
    appendAuditLog,
    attendancePolicy,
    clearSensitiveDashboardLocalCache,
    createAuditChanges,
    currentRoleAccount,
    DEFAULT_WHATSAPP_DEFAULT_MESSAGE,
    errorCodeDefinitions,
    handleAddApprovalRequest,
    INITIAL_VEHICLE_CATALOG,
    isFirebaseConfigured,
    loadInitialLoanApplications,
    loadInitialRawCustomerLeads,
    markRawLeadsDeletedForSync,
    persistDashboardState,
    rawCustomerLeads,
    requestFirestoreCacheClearOnReload,
    roleAccounts,
    setAttendanceEvents,
    setAttendanceIncidentResolutions,
    setAttendancePolicy,
    setAttendanceSchedules,
    setIsDrawerOpen,
    setSelectedApplication,
    setStaffLeaveRequests,
    setVehicleBrandLogos,
    setVehicleCategories,
    showConfirm,
    showPasswordPrompt,
    triggerToast,
    updateApplicationsState,
    updateApprovalRequestsState,
    updateBankDefinitionsState,
    updateCalendarNotesState,
    updateChannelMarketingSpendState,
    updateCustomerIntakeShortLinksState,
    updateCustomMissionsState,
    updateDefaultAvatarLibraryState,
    updateErrorCodeDefinitionsState,
    updateFinanceProfilesState,
    updateMarketingTagRelationshipsState,
    updateNotificationsState,
    updateRawCustomerLeadsState,
    updateRoleNavAccessState,
    updateTagNormalizationRulesState,
    updateVehicleBrandTagsState,
    updateVehicleCatalogState,
    updateVehicleTagsState,
    updateWhatsAppDefaultMessageState,
    updateWhatsAppTrackingClicksState,
    updateWhatsAppTrackingLinksState,
    vehicleCategories,
    writeLocalDashboardValue
  });

  // Account edits that go through the server (role, status, name, login) take a
  // few seconds in production; the Roles table shows them immediately.
  const [pendingRoleAccountUpdates, setPendingRoleAccountUpdates] = useState<Record<string, Partial<RoleAccount>>>({});

  // Owners (by name) with in-progress customers / active leads, including staff
  // whose account is already removed (orphaned attribution). Finished work is ignored.
  const staffWorkload = useMemo(() => {
    const map = new Map<string, { name: string; customers: number; leads: number }>();
    const bump = (name: string | undefined, key: 'customers' | 'leads') => {
      const clean = (name || '').trim();
      if (!clean) {
        return;
      }
      const entry = map.get(clean) || { name: clean, customers: 0, leads: 0 };
      entry[key] += 1;
      map.set(clean, entry);
    };

    applications.forEach((application) => {
      if (IN_PROGRESS_LOAN_STATUSES.has(application.status)) {
        bump(application.handler_name, 'customers');
      }
    });
    rawCustomerLeads.forEach((lead) => {
      if (isActiveLead(lead)) {
        bump(lead.taken_by_staff_name, 'leads');
      }
    });

    const accountNames = new Set(roleAccounts.map((account) => account.name));
    const activeNames = new Set(roleAccounts.filter((account) => account.status === 'Active').map((account) => account.name));

    return Array.from(map.values())
      .filter((entry) => entry.customers + entry.leads > 0)
      .map((entry) => ({ ...entry, inSystem: accountNames.has(entry.name), active: activeNames.has(entry.name) }))
      // Orphaned (no account) first, then by workload size.
      .sort((a, b) => Number(a.inSystem) - Number(b.inSystem) || (b.customers + b.leads) - (a.customers + a.leads));
  }, [applications, rawCustomerLeads, roleAccounts]);

  const staffWorkloadCases = useMemo<StaffWorkloadCase[]>(() => [
    ...applications
      .filter((application) => IN_PROGRESS_LOAN_STATUSES.has(application.status))
      .map((application) => ({
        id: application.id,
        owner_name: application.handler_name,
        type: 'customer' as const,
        label: application.applicant_name || application.id,
        meta: `${application.id} · ${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")}`
      })),
    ...rawCustomerLeads
      .filter(isActiveLead)
      .map((lead) => ({
        id: lead.id,
        owner_name: lead.taken_by_staff_name || '',
        type: 'lead' as const,
        label: lead.name || lead.phone_no || lead.lead_id || lead.id,
        meta: `${lead.channel} · ${lead.phone_no || lead.lead_id || lead.id}`
      }))
  ], [applications, rawCustomerLeads]);


  const {
    handleUpdateRoleNavAccess,
    handleCreateFirebaseAuthUser,
    handleResetFirebaseAuthPassword,
    handleUpdateRoleAccount,
    handleUpdateCurrentStaffProfile,
    handleUpdateCurrentUserAvatar,
    handleAssignMissingAvatars,
    handleRemoveCurrentUserAvatar,
    handleUpdateCurrentUserLeadFollowUpDays,
    handleUpdateCurrentUserWhatsAppOpenMode,
    handleTransferWorkload,
    handleTransferWorkloadCase,
    handleDeleteRoleAccount
  } = useAccountActions({
    requestStaffTotp,
    currentStaff,
    acknowledgeServerDashboardStateVersion,
    appendAuditLog,
    applications,
    applicationsRef,
    availableDefaultAvatars,
    clearSensitiveDashboardLocalCache,
    createAuditChanges,
    currentRoleAccount,
    getKnownDashboardStateVersion,
    getLeadFollowUpStorageKey,
    getPasswordActionErrorMessage,
    getWhatsAppNewTabStorageKey,
    IN_PROGRESS_LOAN_STATUSES,
    isActiveLead,
    isFirebaseConfigured,
    normalizeLeadFollowUpDays,
    rawCustomerLeads,
    rawCustomerLeadsRef,
    reloadDashboard,
    requestFirestoreCacheClearOnReload,
    roleAccounts,
    roleNavAccess,
    setLeadFollowUpDays,
    setPendingRoleAccountUpdates,
    setRoleAccounts,
    setWhatsAppOpenInNewTab,
    showConfirm,
    staffWorkload,
    staffWorkloadCases,
    triggerToast,
    updateApplicationsState,
    updateRawCustomerLeadsState,
    updateRoleAccountsState,
    updateRoleNavAccessState,
    waitForDashboardPersistenceIdle,
    writeLocalDashboardValue
  });

  const {
    handleUpdateVehicleTags,
    handleUpdateVehicleBrandTags,
    handleRenameVehicleModel,
    handleAddVehicleCatalogItem,
    handleUpdateFinanceProfileTerm,
    handleUpdateVehicleCatalogItem,
    handleMergeVehicleCatalogItems,
    handleDeleteVehicleCatalogItem
  } = useVehicleInfoActions({
    currentStaffRole: currentStaff.role,
    currentStaffName: currentStaff.name,
    applications,
    vehicleCatalog,
    vehicleTags,
    vehicleBrandTags,
    financeProfiles,
    setApplications,
    setSelectedApplication,
    setVehicleCatalog,
    updateApplicationsState,
    updateVehicleCatalogState,
    updateVehicleTagsState,
    updateVehicleBrandTagsState,
    updateFinanceProfilesState,
    writeLocalDashboardValue,
    writeLocalDashboardState,
    normalizeTags,
    normalizeMoneyAmount,
    normalizeFinanceProfiles,
    normalizeVehicleCatalogList,
    calculateFinanceProfileInstallment,
    appendAuditLog,
    createAuditChanges,
    triggerToast
  });

  const {
    handleSaveVehicleStockUnits,
    handleQuickAddStock,
    handleQuickAddStockForModel,
    handleSaveDealFinance,
    handleMarkBikeDeliveredFromTaskInbox,
    handleDeliverFromChecklist,
    handleMarkCommissionPaidFromTaskInbox,
    handleRecalculateTierCommissions,
    handleSaveCommissionTiers
  } = useDealFinanceActions({
    currentStaff,
    applications,
    applicationsRef,
    vehicleCatalog,
    commissionTiers,
    roleAccounts,
    commissionRules,
    setCommissionRules,
    setApplications,
    setVehicleCatalog,
    setSelectedApplication,
    writeLocalDashboardState,
    persistDashboardState,
    updateVehicleCatalogState,
    reloadDashboard,
    saveDealFinanceWithStockReservationToFirebase,
    listDeliveryPayments,
    StockReservationConflictError,
    CollectionItemVersionConflictError,
    normalizeMoneyAmount,
    normalizeVehicleCatalogList,
    preserveLoadedApplicationFileData,
    isFirebaseWriteOutcomeUnknown,
    appendAuditLog,
    createAuditChanges,
    triggerToast,
    markBikeDeliveredThroughServer: isFirebaseConfigured ? markBikeDeliveredThroughServer : undefined,
    onBikeDelivered: isFirebaseConfigured
      ? (applicationId) => {
          void requestLedgerDeliveryInvoice(applicationId, async () => (await import('./lib/auth')).getCurrentFirebaseIdToken(true)).then((result) => {
            if (!result) return;
            const message = ledgerDeliveryMessage(result);
            triggerToast(tr(...message.text), message.tone);
          });
        }
      : undefined,
    onStockSaved: isFirebaseConfigured
      ? (stockUnitIds) => {
          void requestLedgerStockSync(stockUnitIds, async () => (await import('./lib/auth')).getCurrentFirebaseIdToken(true)).then((result) => {
            if (!result) return;
            const message = ledgerStockMessage(result);
            triggerToast(tr(...message.text), message.tone);
          });
        }
      : undefined
  });

  const {
    handleAddBankDefinition,
    handleUpdateBankDefinition,
    handleDeleteBankDefinition,
    handleAddMarketingTagRelationship,
    handleUpdateMarketingTagRelationship,
    handleDeleteMarketingTagRelationship,
    handleAddTagNormalizationRule,
    handleUpdateTagNormalizationRule,
    handleDeleteTagNormalizationRule
  } = useSettingsListActions({
    currentStaffRole: currentStaff.role,
    bankDefinitions,
    marketingTagRelationships,
    tagNormalizationRules,
    setBankDefinitions,
    writeLocalDashboardValue,
    updateBankDefinitionsState,
    updateMarketingTagRelationshipsState,
    updateTagNormalizationRulesState,
    uploadBankIcon: uploadBankIconToStorage,
    appendAuditLog,
    createAuditChanges,
    triggerToast
  });

  const visibleWhatsAppTrackingLinks = useMemo(() => (
    currentStaff.role === 'Super Admin'
      ? whatsAppTrackingLinks
      : whatsAppTrackingLinks.filter((link) => link.sales_name === currentStaff.name)
  ), [currentStaff.name, currentStaff.role, whatsAppTrackingLinks]);

  const visibleWhatsAppTrackingClicks = useMemo(() => {
    if (currentStaff.role === 'Super Admin') return whatsAppTrackingClicks;
    const ownLinkIds = new Set(visibleWhatsAppTrackingLinks.map((link) => link.id));
    return whatsAppTrackingClicks.filter((click) => ownLinkIds.has(click.link_id) || click.sales_name === currentStaff.name);
  }, [currentStaff.name, currentStaff.role, visibleWhatsAppTrackingLinks, whatsAppTrackingClicks]);

  const {
    handleAddWhatsAppTrackingLink,
    handleUpdateWhatsAppTrackingLink,
    handleDeleteWhatsAppTrackingLink
  } = useWhatsAppLinkActions({
    isFirebaseConfigured,
    currentStaffRole: currentStaff.role,
    whatsAppTrackingLinks,
    setWhatsAppTrackingLinks,
    writeLocalDashboardValue,
    updateWhatsAppTrackingLinksState,
    acknowledgeServerDashboardStateVersion,
    getFirebaseIdToken: async () => (await import('./lib/auth')).getCurrentFirebaseIdToken(true),
    showConfirm,
    appendAuditLog,
    createAuditChanges,
    triggerToast
  });

  const handleToggleShowAllApplications = useStableCallback(() => {
    if (currentStaff.role !== 'Super Admin') return;
    setShowAllApplications((current) => !current);
  });
  const handleCloseDrawer = useStableCallback(() => {
    setIsDrawerOpen(false);
  });
  const stableHandleSelectRow = useStableCallback(handleSelectRow);
  const stableHandleUpdateCustomerProfile = useStableCallback(handleUpdateCustomerProfile);
  const stableHandleUpdateMissingInfoFromTaskInbox = useStableCallback(handleUpdateMissingInfoFromTaskInbox);
  const stableHandleInlineUpdateApplication = useStableCallback(handleInlineUpdateApplication);
  const stableHandleSubmitToBankFromTable = useStableCallback(handleSubmitToBankFromTable);
  const stableHandleOpenBankPage = useStableCallback(handleOpenBankPage);
  const stableHandleAddCustomer = useStableCallback(handleAddCustomer);
  const stableHandleCreateCustomerIntakeShortLink = useStableCallback(handleCreateCustomerIntakeShortLink);
  const stableHandleAddVehicleCatalogItem = useStableCallback(handleAddVehicleCatalogItem);
  const stableHandleAddCustomerActivityComment = useStableCallback(handleAddCustomerActivityComment);
  const stableHandleRecordUnitExchange = useStableCallback(handleRecordUnitExchange);
  const stableHandleSaveApplication = useStableCallback(handleSaveApplication);

  if (isStockIndexPath) {
    return (
      <Suspense fallback={<PageLoading />}>
        <PublicStockIndexPage />
      </Suspense>
    );
  }

  if (isStockDetailPath) {
    return (
      <Suspense fallback={<PageLoading />}>
        <PublicStockDetailPage slug={stockDetailSlug} />
      </Suspense>
    );
  }

  if (isBlogPostPath) {
    return (
      <Suspense fallback={<PageLoading />}>
        <PublicBlogPostPage slug={blogPostSlug} />
      </Suspense>
    );
  }

  if (isBlogIndexPath) {
    return (
      <Suspense fallback={<PageLoading />}>
        <PublicBlogIndexPage />
      </Suspense>
    );
  }

  if (isCalculatorPath) {
    return (
      <Suspense fallback={<PageLoading />}>
        <PublicCalculatorPage />
      </Suspense>
    );
  }

  if (isSeoHomePath) {
    return (
      <Suspense fallback={<PageLoading />}>
        <PublicSeoLandingPage />
      </Suspense>
    );
  }

  if (isWhatsAppRedirectPath) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans flex items-center justify-center p-6">
        <div className="bg-white border border-slate-100 rounded-panel shadow-e1 p-8 max-w-md w-full text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h1 className="text-title-3 text-slate-900">{appText.openingWhatsApp}</h1>
          <p className="text-body text-slate-500">
            {redirectStatus === 'waiting' && appText.trackingWaiting}
            {redirectStatus === 'redirecting' && appText.trackingRedirecting}
            {redirectStatus === 'inactive' && appText.trackingInactive}
            {redirectStatus === 'missing' && appText.trackingMissing}
            {redirectStatus === 'unavailable' && tr(
              '暂时无法确认这个 WhatsApp 链接，请检查网络后重新打开。',
              'This WhatsApp link could not be checked right now. Check your connection and open it again.',
              'Pautan WhatsApp ini tidak dapat disemak sekarang. Semak sambungan anda dan buka semula.'
            )}
          </p>
          {redirectTargetUrl && (
            <a
              href={redirectTargetUrl}
              className="inline-flex items-center justify-center rounded-card bg-emerald-600 px-4 py-2 text-headline text-white hover:bg-emerald-700 transition-colors"
            >
              {appText.openWhatsApp}
            </a>
          )}
        </div>
      </div>
    );
  }

  if (isShortLinkPath) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans flex items-center justify-center p-6">
        <div className="bg-white border border-slate-100 rounded-panel shadow-e1 p-8 max-w-md w-full text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Link2 className="w-6 h-6" />
          </div>
          <h1 className="text-title-3 text-slate-900">{appText.openingIntakeLink}</h1>
          <p className="text-body text-slate-500">
            {shortLinkRedirectStatus === 'waiting' && appText.shortLinkWaiting}
            {shortLinkRedirectStatus === 'redirecting' && appText.shortLinkRedirecting}
            {shortLinkRedirectStatus === 'missing' && appText.shortLinkMissing}
          </p>
          {shortLinkRedirectTargetUrl && (
            <a
              href={shortLinkRedirectTargetUrl}
              className="inline-flex items-center justify-center rounded-card bg-blue-600 px-4 py-2 text-headline text-white hover:bg-blue-700 transition-colors"
            >
              {appText.openForm}
            </a>
          )}
        </div>
      </div>
    );
  }

  if (isCustomerIntakePath) {
    const phoneValid = isBasicMalaysiaPhoneNumber(intakeDraft.phone_no);
    const icValid = isBasicMalaysiaIcNumber(intakeDraft.ic_no);
    const seoIntake = isSeoCustomerIntake(customerIntakeParams);
    if (seoIntake) {
      // The website form is retired (the site's apply buttons go to WhatsApp);
      // old bookmarked or indexed form links land here instead.
      return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans flex items-center justify-center p-6" data-testid="seo-intake-retired">
          <div className="max-w-md rounded-panel border border-slate-100 bg-white p-8 text-center shadow-e1">
            <DrRacingLogo className="mx-auto h-16 w-auto" />
            <h1 className="mt-5 text-title-3 text-slate-900">
              {tr('请通过 WhatsApp 申请', 'Apply through WhatsApp', 'Mohon melalui WhatsApp')}
            </h1>
            <p className="mt-2 text-body text-slate-500">
              {tr(
                '网上申请表已停用。请在 WhatsApp 联系我们，团队会协助你完成申请。',
                'The online form is no longer used. Message us on WhatsApp and our team will help you apply.',
                'Borang dalam talian tidak lagi digunakan. Hubungi kami di WhatsApp dan pasukan kami akan membantu permohonan anda.'
              )}
            </p>
            <a
              href={WHATSAPP_URL}
              className="mt-6 inline-flex items-center justify-center rounded-control bg-emerald-600 px-5 py-2.5 text-headline text-white hover:bg-emerald-700"
            >
              WhatsApp DR Racing
            </a>
            <div className="mt-6 flex justify-center gap-2"><LanguageSwitcher compact /></div>
          </div>
        </div>
      );
    }
    const salesName = seoIntake
      ? 'DR Racing Team'
      : customerIntakeParams.get('sales') || customerIntakeParams.get('handler') || 'DR Racing Sales';
    const canSubmitIntake = getCustomerIntakeValidationIssues(intakeDraft).length === 0
      && syncStatus !== 'loading';

    return (
      <Suspense fallback={<PageLoading />}>
        <PublicCustomerIntakePage
          activeBankOptions={activeBankOptions}
          canSubmit={canSubmitIntake}
          copy={appText}
          draft={intakeDraft}
          formatIcNumber={formatMalaysiaIcNumber}
          formatPhoneNumber={formatMalaysiaPhoneNumber}
          headerControls={(
            <>
              <ThemeSwitcher compact />
              <LanguageSwitcher compact />
            </>
          )}
          icValid={icValid}
          loanTenureOptions={[...LOAN_TENURE_OPTIONS]}
          onSubmit={handleSubmitCustomerIntake}
          onUpdateDraft={updateIntakeDraft}
          phoneValid={phoneValid}
          salesName={salesName}
          assignmentPending={seoIntake}
          isSubmitting={intakeSubmitting}
          submitError={intakeSubmitError}
          submittedApplicationId={intakeSubmittedApplicationId}
          submittedWithoutLaterChanges={intakeSubmittedWithoutLaterChanges}
        />
      </Suspense>
    );
  }

  if (!isLoggedIn && isRestoringSession) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans flex items-center justify-center p-6" data-testid="session-restoring">
        <div className="flex flex-col items-center gap-4 text-center">
          <DrRacingLogo className="h-20 w-auto max-w-[180px]" />
          <p className="text-footnote text-slate-500">{tr('正在确认登录…', 'Checking your sign-in…', 'Menyemak log masuk anda…')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-panel border border-slate-100 bg-white p-8 shadow-e1">
          <div className="mb-6 flex flex-col items-center text-center">
            <DrRacingLogo className="mb-3 h-28 w-auto max-w-[220px]" />
            <div>
              <h1 className="text-title-3 text-slate-900">{appText.loginTitle}</h1>
              <p className="text-footnote text-slate-500">{appText.loginSubtitle}</p>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap justify-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handlePasswordLoginSubmit();
            }}
          >
            {mfaFactors.length > 0 ? <div className="space-y-4">
              <p className="text-footnote text-slate-600">{tr('密码已验证。请输入验证器 App 的验证码。', 'Password verified. Enter the code from your authenticator app.', 'Kata laluan disahkan. Masukkan kod daripada aplikasi pengesah anda.')}</p>
              {mfaFactors.length > 1 && <label className="block text-footnote">
                {tr('验证器', 'Authenticator', 'Pengesah')}
                <select disabled={isLoginSubmitting} value={mfaEnrollmentId} onChange={(event) => setMfaEnrollmentId(event.target.value)} className="mt-2 w-full rounded-control bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
                  {mfaFactors.map((factor, index) => <option key={factor.uid} value={factor.uid}>{factor.displayName || `Authenticator ${index + 1}`}</option>)}
                </select>
              </label>}
              <label className="block text-footnote">
                {tr('6 位验证码', 'Six-digit code', 'Kod enam digit')}
                <input autoFocus value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} disabled={isLoginSubmitting} className="mt-2 w-full rounded-control bg-slate-50 px-3 py-3 ring-1 ring-slate-200 focus:ring-brand-100" />
              </label>
              <button type="button" disabled={isLoginSubmitting || loginRequiresReload} onClick={cancelMfa} className="text-footnote text-slate-500">{tr('返回密码登录', 'Back to password sign-in', 'Kembali ke log masuk kata laluan')}</button>
            </div> : <>
            <label className="block">
              <span className="text-micro uppercase text-slate-500">
                {tr('用户名 / Email', 'Username / Email', "Nama pengguna / E-mel")}
              </span>
              <input
                type="text"
                autoComplete="username"
                value={loginEmail}
                onChange={(event) => {
                  setLoginEmail(event.target.value);
                  setLoginError('');
                }}
                className="mt-2 w-full rounded-card border border-slate-100 bg-slate-50 px-4 py-3 text-callout text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-brand-100 focus:bg-white focus:ring-2 focus:ring-brand-50"
                placeholder={tr('username 或 name@example.com', 'username or name@example.com', 'nama pengguna atau name@example.com')}
                aria-label={tr('用户名或 Email', 'Username or email', 'Nama pengguna atau e-mel')}
              />
            </label>

            <label className="block">
              <span className="text-micro uppercase text-slate-500">
                {tr('密码', 'Password', "Kata laluan")}
              </span>
              <div className="relative mt-2">
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(event) => {
                    setLoginPassword(event.target.value);
                    setLoginError('');
                  }}
                  className="w-full rounded-card border border-slate-100 bg-slate-50 py-3 pl-4 pr-28 text-callout text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-brand-100 focus:bg-white focus:ring-2 focus:ring-brand-50"
                  aria-label={tr('密码', 'Password', "Kata laluan")}
                />
                <button
                  type="button"
                  aria-controls="login-password"
                  aria-label={showLoginPassword
                    ? tr('隐藏密码', 'Hide password', 'Sembunyikan kata laluan')
                    : tr('显示密码', 'Show password', 'Tunjukkan kata laluan')}
                  aria-pressed={showLoginPassword}
                  title={showLoginPassword
                    ? tr('隐藏密码', 'Hide password', 'Sembunyikan kata laluan')
                    : tr('显示密码', 'Show password', 'Tunjukkan kata laluan')}
                  onClick={() => setShowLoginPassword((current) => !current)}
                  className="absolute inset-y-1 right-1 inline-flex min-h-10 items-center gap-1.5 rounded-control px-3 text-caption font-semibold text-slate-500 transition-colors hover:bg-white hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showLoginPassword
                    ? tr('隐藏', 'Hide', 'Sembunyi')
                    : tr('显示', 'Show', 'Tunjuk')}</span>
                </button>
              </div>
            </label>

            <div className="-mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={isPasswordResetSubmitting || isLoginSubmitting}
                className="text-caption font-semibold text-brand-ink transition-colors hover:text-brand-ink disabled:text-slate-400"
              >
                {isPasswordResetSubmitting
                  ? tr('发送中...', 'Sending...', 'Menghantar...')
                  : tr('忘记密码？', 'Forgot password?', 'Lupa kata laluan?')}
              </button>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-card border border-slate-100 bg-slate-50 px-4 py-3">
              <span>
                <span className="block text-footnote font-bold text-slate-700">{tr('记住我', 'Remember me', "Ingat saya")}</span>
                <span className="mt-0.5 block text-caption text-slate-500">
                  {tr('下次保留 email 和登录状态。', 'Keep email and login session for next time.', "Simpan e-mel dan sesi log masuk untuk kali seterusnya.")}
                </span>
              </span>
              <input
                type="checkbox"
                checked={rememberLogin}
                onChange={(event) => setRememberLogin(event.target.checked)}
                className="peer sr-only"
              />
              <span className="relative h-5 w-9 shrink-0 rounded-full bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-e1 after:transition-transform peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-100" />
            </label>

            </>}

            {loginError && (
              <div role="alert" className="rounded-card border border-rose-100 bg-rose-50 px-4 py-3 text-footnote leading-relaxed text-rose-700">
                {loginError}
              </div>
            )}
            {passwordResetMessage && (
              <div className="rounded-card border border-emerald-100 bg-emerald-50 px-4 py-3 text-footnote leading-relaxed text-emerald-700">
                {passwordResetMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoginSubmitting || isPasswordResetSubmitting}
              aria-live="polite"
              aria-busy={isLoginSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-card bg-brand px-4 py-3 text-headline text-white transition-colors hover:bg-brand-deep disabled:cursor-wait disabled:bg-slate-300"
            >
              <KeyRound className="h-4 w-4" />
              {isLoginSubmitting ? loginProgress : loginRequiresReload
                ? tr('重新载入再试', 'Reload and try again', 'Muat semula dan cuba lagi')
                : mfaFactors.length > 0 ? tr('验证并登录', 'Verify and sign in', 'Sahkan dan log masuk') : tr('登录', 'Log in', "Log masuk")}
            </button>
          </form>

          <p className="mt-5 text-center text-caption text-slate-500">
            {isFirebaseConfigured
              ? tr('密码由 Firebase Auth 管理，系统只保存角色映射。', 'Passwords are managed by Firebase Auth. This system stores role mapping only.', "Kata laluan diurus oleh Firebase Auth. Sistem ini menyimpan pemetaan peranan sahaja.")
              : appText.defaultAccount}
          </p>
        </div>
      </div>
    );
  }

  if (isStaffHandbookPath) {
    return (
      <Suspense fallback={<PageLoading />}>
        <StaffHandbookPage currentStaffRole={currentStaff.role} languageSwitcher={<LanguageSwitcher compact />} />
      </Suspense>
    );
  }

  // Shared by the desktop sidebar and the compact-viewport Me > More list.
  const sidebarNavGroups = ([
    {
      caption: appText.navGroupWork,
      items: [
        { key: 'taskInbox', page: 'taskInbox', icon: Inbox, label: appText.taskInbox },
        { key: 'customers', page: 'customers', icon: Users, label: appText.customers },
        { key: 'delivery', page: 'delivery', icon: ClipboardCheck, label: appText.delivery },
        { key: 'calendar', page: 'calendar', icon: CalendarDays, label: appText.calendar },
        { key: 'attendance', page: 'attendance', icon: Clock, label: appText.attendance }
      ]
    },
    {
      caption: appText.navGroupMarketing,
      items: [
        { key: 'analytics', page: 'tools', icon: BarChart3, label: appText.analytics, onSelect: () => setActiveToolsView('analytics'), activeOverride: activePage === 'tools' && activeToolsView === 'analytics' },
      ]
    },
    {
      caption: appText.navGroupOps,
      items: [
        { key: 'settlement', page: 'settlement', icon: HandCoins, label: appText.settlement },
        { key: 'pendingStock', page: 'pendingStock', icon: PackageSearch, label: appText.pendingStock },
        { key: 'financeCenter', page: 'financeCenter', icon: WalletCards, label: appText.financeCenter },
        { key: 'audit', page: 'tools', icon: FileClock, label: appText.auditLog, onSelect: () => setActiveToolsView('audit'), activeOverride: activePage === 'tools' && activeToolsView === 'audit' },
        { key: 'dataExport', page: 'tools', icon: Download, label: appText.dataExportNav, onSelect: () => setActiveToolsView('dataExport'), activeOverride: activePage === 'tools' && activeToolsView === 'dataExport' }
      ]
    },
    {
      caption: appText.navGroupConfig,
      items: [
        { key: 'vehicleInfo', page: 'tags', icon: Bike, label: appText.vehicleInfoNav, onSelect: () => setActiveSettingGroup('info'), activeOverride: activePage === 'tags' && activeSettingGroup === 'info' },
        { key: 'bankDatabase', page: 'tags', icon: Building2, label: appText.bankDatabaseNav, onSelect: () => setActiveSettingGroup('bank'), activeOverride: activePage === 'tags' && (activeSettingGroup === 'bank' || activeSettingGroup === 'code') },
        { key: 'rolesAccounts', page: 'tags', icon: ShieldCheck, label: appText.rolesAccountsNav, onSelect: () => setActiveSettingGroup('roles'), activeOverride: activePage === 'tags' && activeSettingGroup === 'roles' }
      ]
    },
    {
      caption: appText.navGroupSystem,
      items: [
        { key: 'user', page: 'user', icon: UserCircle, label: appText.user, onSelect: () => setActiveUserView('profile'), activeOverride: activePage === 'user' }
      ]
    }
  ] as const);

  const {
    activePageContent
  } = buildDashboardPageContent({
    currentStaff,
    activePage,
    activeRoleTab,
    activeSettingGroup,
    activeToolsView,
    activeUserView,
    analyticsApplications,
    analyticsAuditLogs,
    analyticsCalendarNotes,
    analyticsNotifications,
    analyticsRawCustomerLeads,
    analyticsRoleAccounts,
    analyticsWhatsAppTrackingClicks,
    analyticsWhatsAppTrackingLinks,
    applications,
    approvalRequests,
    appText,
    attendanceNetworkCheck,
    attendancePolicy,
    auditLogs,
    availableDefaultAvatars,
    bankDefinitions,
    calendarApplications,
    canViewAllStaffCalendar,
    calendarNotes,
    canAccessNavKey,
    canViewGlobalAnalytics,
    clientContext,
    currentRoleAccount,
    currentStaffExperience,
    currentWhatsAppDefaultMessage,
    customerRiskFlagsByApplicationId,
    customMissions,
    defaultAvatarUsage,
    errorCodeDefinitions,
    errorCodeIssueMap,
    financeProfiles,
    financeStockModel,
    financeStockRequestId,
    getStaffLeaveExportMeta,
    handleAddBankDefinition,
    handleAddCalendarNote,
    handleAddCalendarTaskComment,
    handleAddErrorCodeDefinition,
    handleAddMarketingTagRelationship,
    handleAddRawCustomerLead,
    handleAddTagNormalizationRule,
    handleAddVehicleCatalogItem,
    handleAddWhatsAppTrackingLink,
    handleAssignApplicationAdmin,
    handleAssignPrivateRawLeads,
    handleChangeCurrentStaffPassword,
    handleCompleteCashAcceptanceFromTaskInbox,
    handleCreateFirebaseAuthUser,
    handleCreateWhatsAppShortLink,
    handleDeleteBankDefinition,
    handleDeleteCalendarNote,
    handleDeleteErrorCodeDefinition,
    handleDeleteMarketingTagRelationship,
    handleDeleteRawLead,
    handleDeleteRawLeads,
    handleDeleteRoleAccount,
    handleDeleteTagNormalizationRule,
    handleDeleteVehicleCatalogItem,
    handleDeleteWhatsAppTrackingLink,
    handleImportRawCustomerLeads,
    handleInlineUpdateApplication,
    handleMarkBikeDeliveredFromTaskInbox,
    handleMarkCommissionPaidFromTaskInbox,
    commissionTiers,
    commissionTierPlans,
    handleSaveCommissionTiers,
    handleRecalculateTierCommissions,
    handleMergeVehicleCatalogItems,
    handleOpenApplicationTarget,
    handleOpenNotificationTarget,
    handleOpenRawLeadWhatsApp,
    handleQuickAddStock,
    handleQuickAddStockForModel,
    handleRecordAttendance,
    handleReleaseRawLead,
    handleRemoveCurrentUserAvatar,
    handleRenameVehicleModel,
    handleResetFirebaseAuthPassword,
    handleResolveMissingCheckout,
    handleReviewApprovalRequest,
    handleReviewStaffLeaveRequest,
    handleSaveAttendanceSchedules,
    handleSaveDealFinance,
    handleSaveDeliveryStep,
    handleDeliverFromChecklist,
    deliveryPaymentActions,
    handleSaveVehicleStockUnits,
    handleSelectRow,
    handleSetCalendarNoteCompleted,
    handleSubmitMissionReward,
    handleSubmitStaffLeaveRequest,
    handleTaskInboxVisibleTasksChange,
    handleToggleShowAllApplications,
    handleTransferWorkload,
    handleTransferWorkloadCase,
    handleUpdateAttendancePolicy,
    handleUpdateBankDefinition,
    handleUpdateCurrentStaffProfile,
    handleUpdateCurrentUserAvatar,
    handleAssignMissingAvatars,
    handleUpdateCurrentUserLeadFollowUpDays,
    handleUpdateCurrentUserWhatsAppOpenMode,
    handleUpdateErrorCodeDefinition,
    handleUpdateFinanceProfileTerm,
    handleUpdateMarketingTagRelationship,
    handleUpdateRawLeadFollowUp,
    handleUpdateRoleAccount,
    handleUpdateRoleNavAccess,
    handleUpdateTagNormalizationRule,
    handleUpdateVehicleBrandTags,
    handleUpdateVehicleCatalogItem,
    handleUpdateVehicleCategories,
    handleUpdateVehicleTags,
    handleUpdateWhatsAppTrackingLink,
    isApplicationOwnedByCurrentStaff,
    isFirebaseConfigured,
    language,
    leadFollowUpDays,
    marketingTagRelationships,
    monthlyAttendanceExportRows,
    NavIconImage,
    navigateToPageIfAllowed,
    pendingRoleAccountUpdates,
    rawCustomerLeads,
    rawCustomerMatches,
    rawCustomerMatchesByApplicationId,
    rawCustomerMatchesByLeadId,
    renderNoAccess,
    roleAccounts,
    roleNavAccess,
    setActivePage,
    setActiveRoleTab,
    setActiveSettingGroup,
    setActiveToolsView,
    setActiveUserView,
    setFinanceStockModel,
    setFinanceStockRequestId,
    deliveryFocusRequest,
    setDeliveryFocusRequest,
    setShowAllApplications,
    setTaskInboxFocusRequest,
    setTaskInboxStaffName,
    showAllApplications,
    signedInLoginEmail,
    splitMalaysiaDateTime,
    stableHandleAddCustomer,
    stableHandleCreateCustomerIntakeShortLink,
    stableHandleInlineUpdateApplication,
    stableHandleSubmitToBankFromTable,
    stableHandleOpenBankPage,
    stableHandleSelectRow,
    stableHandleUpdateCustomerProfile,
    stableHandleUpdateMissingInfoFromTaskInbox,
    staffVisibleRawCustomerLeads,
    staffVisibleRawCustomerMatches,
    staffWorkload,
    staffWorkloadCases,
    tagNormalizationRules,
    taskClockNow,
    taskInboxFocusRequest,
    taskInboxNotifications,
    taskInboxScopeName,
    taskInboxScopeRole,
    teamAttendanceEvents,
    teamAttendanceIncidentResolutions,
    teamAttendanceRoleAccounts,
    teamAttendanceSchedules,
    teamStaffLeaveRequests,
    triggerToast,
    updateWhatsAppDefaultMessageState,
    vehicleBrandTags,
    vehicleCatalog,
    vehicleCategories,
    vehicleTags,
    visibleApplications,
    visibleCalendarRawCustomerLeads,
    visibleWhatsAppTrackingClicks,
    visibleWhatsAppTrackingLinks,
    whatsAppOpenInNewTab,
    whatsAppTrackingClicks,
    whatsAppTrackingLinks
  });

  // Compact viewports: pages the five mobile tabs do not render natively are
  // shown full-screen in MobileSubpageFrame, reusing activePageContent.
  const sidebarNavItems = sidebarNavGroups.flatMap((group): readonly SidebarNavItem[] => group.items);
  const activeSidebarNavItem = sidebarNavItems.find((item) => (
    item.activeOverride !== undefined ? item.activeOverride : activePage === item.page
  ));
  const activeNavKey = activePage === 'tools'
    ? activeToolsView
    : activePage === 'tags'
      ? SETTING_GROUP_NAV_KEY[activeSettingGroup]
      : activePage;
  const showMobileSubpage = isCompactViewport
    && canAccessNavKey(activeNavKey)
    && isMobileSubpage(activePage, mobileSubpage);
  const mobileSubpageTitle = activePage === 'tools' && activeToolsView === 'whatsapp'
    ? appText.whatsAppTools
    : activeSidebarNavItem?.label
      || (activePage === 'rawCustomers'
        ? appText.rawCustomers
        : activePage === 'customerRelationships'
          ? appText.customerRelationships
          : activePage === 'roleAccess'
            ? appText.roleAccessNav
            : appText.toolsTitle);
  const mobileMoreNavItems = sidebarNavItems.filter((item) => (
    canAccessNavKey(item.key) && !isMobileTabPage(item.page)
  ));
  const canOpenMobileCustomerActions = canAccessNavKey('customers')
    && (canAccessNavKey('customers.addCustomer') || canAccessNavKey('customers.shareLinks'));

  return (
    <div className="dashboard-ui flex min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans selection:bg-brand selection:text-white">
      {isCompactViewport ? (
        <Suspense fallback={<PageLoading />}>
          {showMobileSubpage && (
            <MobileSubpageFrame title={mobileSubpageTitle} onBack={closeMobileSubpage}>
              <Suspense fallback={<PageLoading />}>
                {activePageContent}
              </Suspense>
            </MobileSubpageFrame>
          )}
          {/* Kept mounted while a subpage is open so Back restores tab filters and search. */}
          <div className={showMobileSubpage ? 'hidden' : 'contents'}>
          <MobileAppShell
            canOpenTaskInbox={canAccessNavKey('taskInbox')}
            onOpenTaskInbox={() => openMobileSubpage('taskInbox', 'today')}
            onOpenProfile={() => {
              setActiveUserView('profile');
              openMobileSubpage('user', 'me');
            }}
            moreNavItems={mobileMoreNavItems.map((item) => ({ key: item.key, label: item.label, icon: item.icon }))}
            onOpenMoreNavItem={(key) => {
              const item = mobileMoreNavItems.find((candidate) => candidate.key === key);
              if (!item) return;
              item.onSelect?.();
              openMobileSubpage(item.page, 'me');
            }}
            canOpenCustomerActions={canOpenMobileCustomerActions}
            onOpenCustomerActions={() => openMobileSubpage('customers', 'applications')}
            applications={canAccessNavKey('customers') ? visibleApplications : []}
            bankDefinitions={bankDefinitions}
            roleAccounts={roleAccounts}
            rawCustomerLeads={canAccessNavKey('rawCustomers') ? staffVisibleRawCustomerLeads : []}
            attendanceEvents={attendanceEvents}
            currentStaffName={currentStaff.name}
            currentStaffRole={currentStaff.role}
            currentStaffAvatar={currentRoleAccount?.avatar_data_url}
            unreadNotificationCount={taskInboxTaskCount}
            syncStatus={syncStatus}
            canViewApplications={canAccessNavKey('customers')}
            canViewLeads={canAccessNavKey('rawCustomers')}
            canViewCalendar={canAccessNavKey('calendar')}
            canViewAttendance={canAccessNavKey('attendance')}
            navigationPage={activePage}
            onOpenNotifications={() => {
              if (isNotificationCenterOpen) {
                setIsNotificationCenterOpen(false);
                return;
              }
              if (navigateToPageIfAllowed('taskInbox', 'taskInbox')) {
                setIsNotificationCenterOpen(true);
              }
            }}
            onOpenApplication={(application) => handleOpenApplicationTarget(application)}
            onOpenWhatsApp={handleOpenRawLeadWhatsApp}
            onUpdateLead={handleUpdateRawLeadFollowUp}
            onRecordAttendance={handleRecordAttendance}
            onNavigatePage={(page) => setActivePage(page)}
            onLogout={handleLogout}
            preferenceControls={(
              <>
                <ThemeSwitcher />
                <LanguageSwitcher />
              </>
            )}
            calendarContent={(
              <CalendarPage
                applications={calendarApplications}
                rawCustomerLeads={visibleCalendarRawCustomerLeads}
                calendarNotes={calendarNotes}
                roleAccounts={roleAccounts}
                currentStaffName={currentStaff.name}
                currentStaffRole={currentStaff.role}
                canViewAllCalendar={canViewAllStaffCalendar}
                onAddCalendarNote={handleAddCalendarNote}
                onDeleteCalendarNote={handleDeleteCalendarNote}
                onSetCalendarNoteCompleted={handleSetCalendarNoteCompleted}
                onAddCalendarTaskComment={handleAddCalendarTaskComment}
                onSelectApplication={(application) => {
                  if (canAccessNavKey('customers')) {
                    stableHandleSelectRow(application);
                  } else {
                    triggerToast(
                      tr(
                        '当前角色没有权限打开贷款申请详情。',
                        'Your role cannot open loan application details.',
                        'Peranan anda tidak boleh membuka butiran permohonan pinjaman.'
                      ),
                      'error'
                    );
                  }
                }}
              />
            )}
            attendanceContent={(
              <AttendancePage
                events={teamAttendanceEvents}
                schedules={teamAttendanceSchedules}
                leaveRequests={teamStaffLeaveRequests}
                roleAccounts={teamAttendanceRoleAccounts}
                currentStaffName={currentStaff.name}
                currentStaffRole={currentStaff.role}
                canViewAll={isOperationsLead(currentStaff.role)}
                canManageSchedules={currentStaff.role === 'Super Admin' || (currentStaff.role === 'Admin' && canAccessNavKey('attendance.manageSchedules'))}
                canViewSalary={currentStaff.role === 'Super Admin'}
                attendancePolicy={attendancePolicy}
                currentNetworkIp={clientContext.ip_address}
                networkCheck={isFirebaseConfigured ? attendanceNetworkCheck : undefined}
                onRecordAttendance={handleRecordAttendance}
                onSaveWeeklySchedules={handleSaveAttendanceSchedules}
                onSubmitLeaveRequest={handleSubmitStaffLeaveRequest}
                onReviewLeaveRequest={handleReviewStaffLeaveRequest}
                onUpdateAttendancePolicy={handleUpdateAttendancePolicy}
              />
            )}
          />
          </div>
        </Suspense>
      ) : (
        <>
      
      {/* Left-Side Navigation Rail - Clean Minimalism Theme */}
      <nav className="flex w-48 bg-white border-r border-slate-100 flex-col py-5 justify-between shrink-0 z-20">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-3 pb-2">
          <div className="mb-5 px-2">
            <DrRacingLogo className="h-16 w-full object-left" />
            <p className="mt-1 text-micro uppercase text-slate-500">{appText.dashboard}</p>
          </div>

          <div className="mb-4 h-px w-full bg-slate-100" />

          {/* Nav Items (grouped, flattened sub-pages) */}
          {sidebarNavGroups
            .map((group) => ({ caption: group.caption, items: group.items.filter((item) => canAccessNavKey(item.key)) }))
            .filter((group) => group.items.length > 0)
            .map((group) => (
            <div key={group.caption} className="mb-3">
              <p className="px-2.5 pb-1 text-micro uppercase text-slate-400">{group.caption}</p>
              {group.items.map((item) => {
                const isItemActive = 'activeOverride' in item ? item.activeOverride : activePage === item.page;

                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      if ('onSelect' in item) {
                        item.onSelect();
                      }
                      setActivePage(item.page);
                    }}
                    className={`desktop-sidebar-nav-item group mt-0.5 flex w-full items-center gap-2.5 rounded-control px-2 py-1.5 text-left text-callout cursor-pointer transition-all duration-200 ${
                      isItemActive
                        ? 'is-active text-white'
                        : 'text-slate-500 hover:text-brand-ink hover:bg-brand-50'
                    }`}
                    title={item.label}
                  >
                    <NavIconImage
                      plain
                      active={isItemActive}
                      className="relative z-10 h-[18px] w-[18px]"
                      fallback={<item.icon className="relative z-10 h-[18px] w-[18px]" />}
                      iconKey={item.key}
                    />
                    <span className="relative z-10">{item.label}</span>
                    {item.key === 'taskInbox' && taskInboxTaskCount > 0 && (
                      <span
                        data-testid="task-inbox-nav-badge"
                        aria-hidden="true"
                        className={`relative z-10 ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-micro tracking-normal tabular-nums ${
                          isItemActive ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {taskInboxTaskCount > 99 ? '99+' : taskInboxTaskCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

        </div>

        <div className="flex flex-col px-3 space-y-3 w-full">
          {/* Quick Demo Reset Trigger — Super Admin only (deletes cloud data). */}
          {currentStaff.role === 'Super Admin' && (
            <button
              id="reset-data-btn"
              onClick={handleResetData}
              title={appText.resetData}
              className="flex w-full items-center gap-2.5 rounded-card px-2.5 py-2.5 text-left text-callout text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer transition-all duration-200"
            >
              <NavIconImage
                active
                className="h-5 w-5"
                fallback={<RefreshCw className="h-[18px] w-[18px]" />}
                iconKey="resetData"
              />
              <span>{appText.resetData}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActivePage('user')}
            className="flex items-center gap-2.5 rounded-card bg-slate-50 px-2.5 py-2.5 text-left text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-ink"
            title={appText.userProfile}
          >
            <StaffAvatar
              name={currentStaff.name}
              avatarDataUrl={currentRoleAccount?.avatar_data_url}
              className="h-8 w-8 border-slate-100"
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-callout text-slate-900">{currentStaff.name}</p>
              <p className="truncate text-caption text-slate-500">
                {getRoleDisplayLabel(currentStaff.role, language)}
              </p>
            </div>
          </button>
        </div>
      </nav>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Header Banner */}
        <header className="h-16 px-4 lg:px-8 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-10">
          <div aria-hidden="true" />

          <div className="flex items-center space-x-3 lg:space-x-6 text-footnote text-slate-500">
            {/* System Info */}
            <div className="hidden lg:flex items-center gap-2">
              <NavIconImage
                active
                className="h-5 w-5"
                fallback={<Clock className={`w-3.5 h-3.5 ${syncStatus === 'error' ? 'text-rose-500' : 'text-slate-500'}`} />}
                iconKey="syncStatus"
              />
              {/* Hierarchy by colour, not weight: the normal state is quiet body text
                  and only the error state is allowed to shout. */}
              <span className={syncStatus === 'error' ? 'font-bold text-rose-600' : ''}>
                {syncStatus === 'firebase' && appText.syncFirebase}
                {syncStatus === 'cached' && appText.syncCached}
                {syncStatus === 'local' && appText.syncLocal}
                {syncStatus === 'loading' && appText.syncLoading}
                {syncStatus === 'error' && appText.syncError}
              </span>
              {syncStatus === 'error' && (
                <button
                  type="button"
                  onClick={handleRetrySync}
                  className="inline-flex items-center gap-1 rounded-control bg-rose-50 px-2 py-1 text-caption text-rose-600 ring-1 ring-rose-100 transition-colors hover:bg-rose-100"
                >
                  <RefreshCw className="w-3 h-3" />
                  {appText.retrySync}
                </button>
              )}
            </div>

            <ThemeSwitcher compact />
            <LanguageSwitcher compact />

            <button
              type="button"
              onClick={() => {
                if (isNotificationCenterOpen) {
                  setIsNotificationCenterOpen(false);
                  return;
                }
                if (navigateToPageIfAllowed('taskInbox', 'taskInbox')) {
                  setIsNotificationCenterOpen(true);
                }
              }}
              className={`relative inline-flex h-10 w-10 items-center justify-center rounded-card border text-slate-500 transition-colors ${
                isNotificationCenterOpen
                  ? 'border-brand bg-brand text-white'
                  : 'border-slate-100 bg-white hover:border-brand-100 hover:bg-brand-50 hover:text-brand-ink'
              }`}
              title={tr('通知中心', 'Notification Center', "Pusat Pemberitahuan")}
            >
              <NavIconImage
                active
                className="h-5 w-5"
                fallback={<Bell />}
                iconKey="bell"
              />
              {taskInboxTaskCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-micro tracking-normal leading-none text-white shadow-e1">
                  {taskInboxTaskCount > 99 ? '99+' : taskInboxTaskCount}
                </span>
              )}
            </button>

            {isNotificationCenterOpen && (
              <Suspense fallback={null}>
                <NotificationCenter
                  tasks={taskInboxMirrorItems}
                  onClose={() => setIsNotificationCenterOpen(false)}
                  onOpenTaskInbox={(taskId) => {
                    setIsNotificationCenterOpen(false);
                    if (navigateToPageIfAllowed('taskInbox', 'taskInbox') && taskId) {
                      setTaskInboxFocusRequest({ taskId, key: Date.now() });
                    }
                  }}
                />
              </Suspense>
            )}

            <button
              type="button"
              onClick={() => setActivePage('user')}
              className="flex items-center space-x-3 rounded-card border border-slate-100/50 bg-slate-50 px-3 py-1.5 text-left transition-colors hover:border-brand-100 hover:bg-brand-50"
              title={appText.userProfile}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <StaffAvatar
                name={currentStaff.name}
                avatarDataUrl={currentRoleAccount?.avatar_data_url}
                className="h-8 w-8"
                textClassName="text-[11px]"
              />
              {/* Avatar only below lg (iPad portrait); the name and role return on wider screens. */}
              <div className="hidden lg:flex flex-col leading-tight">
                <span className="whitespace-nowrap text-callout text-slate-700">{currentStaff.name}</span>
                <span className="whitespace-nowrap text-caption text-slate-500">
                  {getRoleDisplayLabel(currentStaff.role, language)}
                </span>
              </div>
            </button>
            <button
              id="logout-btn"
              type="button"
              onClick={handleLogout}
              aria-label={appText.logout}
              title={appText.logout}
              className="inline-flex items-center gap-1.5 rounded-control border border-slate-100 bg-white px-3 py-2 text-callout text-slate-500 transition-colors hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
            >
              <NavIconImage
                active
                className="h-5 w-5"
                fallback={<LogOut />}
                iconKey="logout"
              />
              {/* Icon only on iPad widths, so the header fits beside the sidebar. */}
              <span className="hidden xl:inline">{appText.logout}</span>
            </button>
          </div>
        </header>

        {/* Content body container */}
        <main className="w-full max-w-[1600px] flex-1 space-y-8 p-4 pb-28 md:mx-auto md:p-8">
          <Suspense fallback={<PageLoading />}>
            {activePageContent}
          </Suspense>
        </main>
      </div>
        </>
      )}

      {isCompactViewport && isNotificationCenterOpen && (
        <Suspense fallback={null}>
          <NotificationCenter
            tasks={taskInboxMirrorItems}
            onClose={() => setIsNotificationCenterOpen(false)}
            onOpenTaskInbox={(taskId) => {
              setIsNotificationCenterOpen(false);
              if (navigateToPageIfAllowed('taskInbox', 'taskInbox')) {
                openMobileSubpage('taskInbox', 'today');
                if (taskId) setTaskInboxFocusRequest({ taskId, key: Date.now() });
              }
            }}
          />
        </Suspense>
      )}

      {vehicleInfoMissions.length > 0 && (
        <Suspense fallback={null}>
          <StaffVehicleInfoMissionPanel
            drafts={missionDrafts}
            language={language}
            missions={vehicleInfoMissions}
            onComplete={handleSaveVehicleInfoMission}
            onUpdateDraft={handleUpdateVehicleInfoMissionDraft}
          />
        </Suspense>
      )}

      {/* 3. Sliding Detail Sidebar (Drawer) */}
      {(isDrawerOpen || selectedApplication) && (
        <Suspense fallback={null}>
          <DetailDrawer
            isOpen={isDrawerOpen}
            application={selectedApplication}
            canEditAllInformation={canEditLoanApplicationInformation(selectedApplication)}
            vehicleTags={vehicleTags}
            vehicleBrandTags={vehicleBrandTags}
            vehicleCatalog={vehicleCatalog}
            bankDefinitions={bankDefinitions}
            salaryBankInputHistory={salaryBankInputHistory}
            errorCodeDefinitions={errorCodeDefinitions}
            roleAccounts={roleAccounts}
            currentStaffName={currentStaff.name}
            currentStaffRole={currentStaff.role}
            scrollToActivityThreadRequest={activityThreadScrollRequest}
            auditLogs={selectedApplicationAuditLogs}
            scrollToDocumentChecklistRequest={documentChecklistScrollRequest}
            openBankApplicationsRequest={openBankApplicationsRequest}
            addBankRequest={addBankRequest}
            bankPageRequest={bankPageRequest}
            riskFlags={selectedApplication ? customerRiskFlagsByApplicationId[selectedApplication.id] || EMPTY_CUSTOMER_RISK_FLAGS : EMPTY_CUSTOMER_RISK_FLAGS}
            rawMatches={selectedApplication ? rawCustomerMatchesByApplicationId[selectedApplication.id] || EMPTY_CUSTOMER_RAW_MATCHES : EMPTY_CUSTOMER_RAW_MATCHES}
            onClose={handleCloseDrawer}
            onAddVehicleCatalogItem={stableHandleAddVehicleCatalogItem}
            onAddActivityComment={stableHandleAddCustomerActivityComment}
            onRecordUnitExchange={stableHandleRecordUnitExchange}
            onSave={stableHandleSaveApplication}
          />
        </Suspense>
      )}

      {/* Toast Feedback Notifications (stacked queue) */}
      <div id="toast-wrapper" className="fixed bottom-6 left-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            className={`flex max-w-sm translate-y-0 cursor-pointer items-center gap-3 rounded-card border px-4 py-3.5 text-footnote text-white opacity-100 shadow-e2 transition duration-200 ease-out pointer-events-auto ${
              toast.tone === 'error'
                ? 'border-rose-900 bg-rose-950'
                : toast.tone === 'warning'
                  ? 'border-amber-600 bg-amber-700'
                  : 'border-slate-800 bg-brand'
            }`}
          >
            <div className={`shrink-0 rounded-chip p-1 ${
              toast.tone === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : toast.tone === 'warning'
                  ? 'bg-amber-200/20 text-amber-100'
                  : 'bg-white/15 text-white'
            }`}>
              {toast.tone === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </div>
            <div className="flex-1 pr-2 font-medium leading-normal">
              {toast.message}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
