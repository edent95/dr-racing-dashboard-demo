/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AlertTriangle, BadgeDollarSign, BarChart3, Bell, Bike, Building2, CalendarDays, CheckCircle2, ClipboardList, Clock, Database, Download, Eye, EyeOff, FileClock, Inbox, KeyRound, Languages, Link2, MessageCircle, ReceiptText, RefreshCw, ShieldCheck, Smartphone, Tag, Target, Trophy, UserCircle, Users, WalletCards, Workflow, Wrench } from 'lucide-react';
import { ApprovalRequest, ApprovalRequestStatus, AttendancePolicy, AttendanceWeeklySchedule, AuditLogEntry, BankApplication, BankDefinition, CalendarNote, ChannelMarketingSpend, CustomMission, CustomerActivityEntry, CustomerEmploymentDetails, CustomerIntakeShortLink, CustomerIntakeTracking, CustomerPersonalInfo, CustomerPreferences, CustomerRawMatch, CustomerRiskField, CustomerRiskFlag, CommissionRules, DealFinance, DEFAULT_ATTENDANCE_POLICY, DEFAULT_BANK_DEFINITIONS, DEFAULT_COMMISSION_RULES, DEFAULT_MARKETING_TAG_RELATIONSHIPS, DEFAULT_TAG_NORMALIZATION_RULES, DEFAULT_VEHICLE_BRAND_TAGS, DEFAULT_VEHICLE_CATALOG, DEFAULT_VEHICLE_TAGS, EmergencyContact, ErrorCodeDefinition, FinanceProfile, FinanceProfileTerm, FINANCE_PROFILES, findFinanceProfile, findVehicleCatalogItem, getDealCommissionQuote, getLoanPendingAction, getLoanPendingWith, inferFinanceProfileFromVehicle, inferVehicleBrandFromModel, inferVehicleTagFromModel, LoanApplication, LoanPendingAction, LoanPendingWith, LoanStatus, LoanWorkflowAction, MarketingTagRelationship, normalizeAttendanceNetworkIp, normalizeAttendancePolicy, normalizeFinanceProfileId, normalizeVehicleModel, NotificationItem, PayslipDocument, PurchaseMethod, QuickStockInput, RawCustomerLead, RejectNextStepType, RewardTeam, RoleAccount, RoleAccountRole, RoleNavAccessSetting, RolePermissionSetting, StaffDefaultAvatar, StaffWorkloadCase, TagNormalizationDomain, TagNormalizationRule, VehicleCategory, VehicleCatalogItem, VehicleCondition, VehiclePurchaseOption, VehicleStockUnit, WhatsAppTrackingClick, WhatsAppTrackingLink } from './types';
import {
  getDefaultRejectCodeClassification,
  INITIAL_ERROR_CODE_DEFINITIONS,
  INITIAL_ROLE_ACCOUNTS,
  INITIAL_WHATSAPP_TRACKING_CLICKS,
  INITIAL_WHATSAPP_TRACKING_LINKS
} from './data/mockData';
import { buildDefaultRolePermissionSettings, normalizeRolePermissionSettings } from './data/rolePermissions';
import { buildDefaultRoleNavAccessSettings, normalizeRoleNavAccessSettings } from './data/roleNavAccess';
import { V1_HIDDEN_NAV_KEYS } from './data/v1Scope';
import { buildDefaultVehicleCategories, normalizeVehicleCategories } from './data/vehicleCategories';
import { normalizeVehicleBrandLogos, setVehicleBrandLogo as assignVehicleBrandLogo } from './data/vehicleBrandLogos';
import { uploadBrandLogoToStorage } from './services/brandLogoStorage';
import { uploadBankIconToStorage } from './services/bankIconStorage';
import drRacingLogo from './assets/dr-racing-logo-256.png';
import OptimizedImage from './components/OptimizedImage';
import StaffAvatar from './components/StaffAvatar';
import { getBankRequestedDocumentKey, getMissingDocumentLabels, normalizeDocumentChecklist } from './utils/documentChecklist';
import { getMissingApplicationInformationLabels } from './utils/applicationCompleteness';
import { isFirebaseConfigured } from './lib/firebaseConfig';
import { requestFirestoreCacheClearOnReload } from './lib/firebaseCacheCleanup';
import { AppLanguage, setAppLanguage, tr } from './lib/i18n';
import { buildPublicSiteUrl } from './lib/publicUrls';
import { getLoanWorkflowActionLabel, getLoanWorkflowUndoAvailability } from './utils/loanWorkflowUndo';
import { useDashboardHydration, type DashboardHydrationState } from './hooks/useDashboardHydration';
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
import { SETTING_GROUP_NAV_KEY, useNavigationState, type AppPage, type ToolsView } from './hooks/useNavigationState';
import { usePublicRoutes } from './hooks/usePublicRoutes';
import { clearSensitiveDashboardLocalCache, normalizeAuthEmail, normalizeRoleAccountRole, readStoredStaffSession, useStaffSessionAuth, type StaffSession } from './hooks/useStaffSessionAuth';
import { formatStaffLoginIdentifier } from '../shared/staffLoginIdentifier.mjs';
import type { CustomerIntakeDocumentDraft, CustomerIntakeDraft, CustomerIntakeSubmitError } from './components/PublicCustomerIntakePage';
import type { VehicleInfoMissionDraft } from './components/StaffVehicleInfoMissionPanel';
import type { TaskInboxMirrorItem } from './components/TaskInboxPage';
import {
  AdminApplicationClaimConflictError,
  appendCalendarTaskCommentToFirebase,
  claimUnassignedAdminApplicationFromFirebase,
  CollectionItemVersionConflictError,
  deleteCalendarNoteFromFirebase,
  markRawLeadsDeletedForSync,
  saveAttendanceEventToFirebase,
  saveAttendanceIncidentResolutionToFirebase,
  saveAttendanceWeeklyScheduleToFirebase,
  saveCalendarNoteToFirebase,
  saveDealFinanceWithStockReservationToFirebase,
  saveStaffLeaveRequestToFirebase,
  reloadCustomerFromFirebase,
  StockReservationConflictError,
  subscribeToAttendanceEventsFromFirebase,
  subscribeToAttendanceIncidentResolutionsFromFirebase,
  subscribeToAttendanceSchedulesFromFirebase,
  subscribeToCalendarTasksFromFirebase,
  subscribeToStaffLeaveRequestsFromFirebase,
  type AttendanceEvent,
  type AttendanceIncidentResolution,
  type CustomerRealtimeChange,
  type DashboardState
} from './services/dashboardRepository';
import { getApplicationRejectCodes, normalizeRejectCode, normalizeRejectCodes } from './utils/rejectCodes';
import {
  buildCompletedTaskEvents,
  buildLoanTaskCompletionDescriptors,
  createTaskCompletionAuditChanges
} from './utils/taskCompletionAnalytics';
import {
  calculateStaffExperience,
  getStaffExperienceRulesFromConfig,
  normalizeStaffExperienceRules,
  STAFF_EXPERIENCE_RULES_FIELD,
  type StaffExperienceRuleMap
} from './utils/staffExperience';
import { buildMonthlyAttendanceExportRows, type MissingCheckoutIncident } from './utils/attendanceSummary';
import { getVehicleStockReference, normalizeVehicleNumberPlate } from './utils/vehicleStock';
import { isOperationsLead } from './utils/staffRoles';
import { getAdminBankFollowUpDueIso } from './utils/bankFollowUp';
import { useBrandedDialog } from './components/BrandedDialogProvider';

const CustomerList = lazy(() => import('./components/CustomerList'));
const DetailDrawer = lazy(() => import('./components/DetailDrawer'));
const NotificationCenter = lazy(() => import('./components/NotificationCenter'));
const PublicCustomerIntakePage = lazy(() => import('./components/PublicCustomerIntakePage'));
const PublicSeoLandingPage = lazy(() => import('./components/PublicSeoLandingPage'));
const PublicStockDetailPage = lazy(() => import('./components/PublicStockDetailPage'));
const PublicBlogIndexPage = lazy(() =>
  import('./components/PublicBlogPage').then((module) => ({ default: module.PublicBlogIndexPage }))
);
const PublicBlogPostPage = lazy(() =>
  import('./components/PublicBlogPage').then((module) => ({ default: module.PublicBlogPostPage }))
);
const StaffVehicleInfoMissionPanel = lazy(() => import('./components/StaffVehicleInfoMissionPanel'));
const TaskInboxPage = lazy(() => import('./components/TaskInboxPage'));
const StaffMobileView = lazy(() => import('./components/StaffMobileView'));
const MobileAppShell = lazy(() => import('./components/MobileAppShell'));
const RawCustomerDatabase = lazy(() => import('./components/RawCustomerDatabase'));
const CustomerRelationshipRiskPage = lazy(() => import('./components/CustomerRelationshipRiskPage'));
const CalendarPage = lazy(() => import('./components/CalendarPage'));
const AttendancePage = lazy(() => import('./components/AttendancePage'));
const TagsAdmin = lazy(() => import('./components/TagsAdmin'));
const WhatsAppTrackingAdmin = lazy(() => import('./components/WhatsAppTrackingAdmin'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const StaffExperienceDashboard = lazy(() => import('./components/StaffExperienceDashboard'));
const MissionStatusPage = lazy(() => import('./components/MissionStatusPage'));
const RewardCommissionCenter = lazy(() => import('./components/RewardCommissionCenter'));
const ApprovalWorkflowPage = lazy(() => import('./components/ApprovalWorkflowPage'));
const AuditLogAdmin = lazy(() => import('./components/AuditLogAdmin'));
const DataExportCenter = lazy(() => import('./components/DataExportCenter'));
const FlowOverview = lazy(() => import('./components/FlowOverview'));
const UserProfilePage = lazy(() => import('./components/UserProfilePage'));
const SalesBudgetPage = lazy(() => import('./components/SalesBudgetPage'));
const PermissionMatrixPage = lazy(() => import('./components/PermissionMatrixPage'));
const RoleAccessControlPage = lazy(() => import('./components/RoleAccessControlPage'));
const NotificationSettingsPage = lazy(() => import('./components/NotificationSettingsPage'));
const FinanceCenter = lazy(() => import('./components/FinanceCenter'));

type AppTheme = 'light' | 'dark';

function PageLoading() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-100 bg-white text-xs font-bold text-slate-500 shadow-sm">
      Loading page...
    </div>
  );
}

function DrRacingLogo({ className = 'h-12 w-auto' }: { className?: string }) {
  return (
    <OptimizedImage
      src={drRacingLogo}
      alt="Dr Racing logo"
      width={256}
      height={201}
      loading="eager"
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

function useStableCallback<T extends (...args: never[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(((...args: Parameters<T>) => (
    callbackRef.current(...args)
  )) as unknown as T, []);
}

const loadInitialRawCustomerLeads = async () => {
  const module = await import('./data/rawCustomerLeads');
  return module.INITIAL_RAW_CUSTOMER_LEADS;
};

const loadInitialLoanApplications = async (): Promise<LoanApplication[]> => [];

const saveShortLinkToRemote = async (link: CustomerIntakeShortLink) => {
  const module = await import('./services/publicRepository');
  return module.saveShortLinkToFirebase(link);
};

// 公开路径专用 create-only 写入(匿名 Auth 身份),不整份写 dashboard_state。
const submitPublicIntakeToRemote = async (
  application: LoanApplication,
  auditLog: AuditLogEntry | undefined
) => {
  const module = await import('./services/publicRepository');
  return module.submitPublicIntakeToFirebase(application, auditLog);
};

const classifyCustomerIntakeSubmitError = (error: unknown): CustomerIntakeSubmitError => {
  const code = error && typeof error === 'object' && 'code' in error
    ? String(error.code).toLowerCase()
    : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';

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
  const randomPart = (
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  ).slice(0, 10).toUpperCase();

  return `APP-${year}-${randomPart}`;
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
    [STAFF_EXPERIENCE_RULES_FIELD]: normalizeStaffExperienceRules(raw[STAFF_EXPERIENCE_RULES_FIELD])
  } as CommissionRules;
};

// 自定义游戏风图标：把 PNG 放进 src/assets/icons/nav/{navKey}.png 即自动生效，
// 没有对应文件时回退到 lucide 线条图标。
const NAV_ICON_IMAGE_LOADERS = import.meta.glob('./assets/icons/nav/*.png', { import: 'default' }) as Record<string, () => Promise<string>>;
const navIconImageCache = new Map<string, string>();
const NAV_ICON_ASSET_KEYS: Record<string, string> = {
  approvals: 'approvalOverview',
  customers: 'customers',
  dataExport: 'allChannels',
  financeCenter: 'salesBudget',
  missingInfo: 'missionTarget',
  notificationSettings: 'bell',
  permissions: 'rolesAccounts',
  staffView: 'user'
};

function NavIconImage({
  active,
  className = 'h-5 w-5',
  fallback,
  iconKey,
  plain = false
}: {
  active: boolean;
  className?: string;
  fallback: React.ReactNode;
  iconKey: string;
  // plain: always full color, fills its box (object-cover), no dim/scale — active
  // state is signalled by the surrounding row color instead. Used by the sidebar.
  plain?: boolean;
}) {
  const assetKey = NAV_ICON_ASSET_KEYS[iconKey] || iconKey;
  const [src, setSrc] = useState(() => navIconImageCache.get(assetKey) || '');
  const loaderKey = `./assets/icons/nav/${assetKey}.png`;
  const hasImageAsset = Boolean(NAV_ICON_IMAGE_LOADERS[loaderKey]);

  useEffect(() => {
    let cancelled = false;
    const cached = navIconImageCache.get(assetKey);

    if (cached) {
      setSrc(cached);
      return () => {
        cancelled = true;
      };
    }

    const loader = NAV_ICON_IMAGE_LOADERS[loaderKey];

    if (!loader) {
      setSrc('');
      return () => {
        cancelled = true;
      };
    }

    setSrc('');
    loader()
      .then((imageSrc) => {
        if (cancelled) {
          return;
        }

        navIconImageCache.set(assetKey, imageSrc);
        setSrc(imageSrc);
      })
      .catch(() => {
        if (!cancelled) {
          setSrc('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [assetKey, loaderKey]);

  if (!src) {
    if (hasImageAsset) {
      return <span aria-hidden="true" className={`${className} shrink-0`} />;
    }

    return <>{fallback}</>;
  }

  return (
    <OptimizedImage
      src={src}
      alt=""
      aria-hidden="true"
      width={20}
      height={20}
      className={`${className} shrink-0 ${plain ? 'object-cover' : 'object-contain'} transition-all duration-200 ${
        plain
          ? ''
          : active
            ? 'scale-110 drop-shadow-sm'
            : 'opacity-65 saturate-[0.35] group-hover:opacity-100 group-hover:saturate-100'
      }`}
    />
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
  housing_status: '',
  years_at_residence: '',
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
  company_address: '',
  office_phone_no: '',
  gross_monthly_salary: '',
  net_monthly_salary: '',
  available_to_receive_calls: '',
  salary_payment_method: '',
  preferred_motorcycle: '',
  loan_tenure: ''
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
    taskInbox: '任务箱',
    staffView: '手机模式',
    customers: '贷款申请',
    rawCustomers: '潜在客户',
    customerRelationships: '潜在客户关系',
    followUp: '跟进',
    calendar: '日历',
    attendance: '考勤与请假',
    setting: '设置',
    tools: '管理中心',
    rewards: '佣金与奖励',
    salesBudget: '系统成本',
    financeCenter: '财务中心',
    manual: '系统手册',
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
    payoutCenter: '收入结算',
    missionsNav: '任务',
    teamBattleNav: '战队对决',
    vehicleInfoNav: '车辆信息',
    brandLogoNav: '品牌 Logo',
    bankDatabaseNav: '银行数据库',
    rejectCodesNav: '拒贷原因代码',
    rolesAccountsNav: '角色与账号',
    permissionsNav: '权限设定',
    roleAccessNav: '角色访问权限',
    notificationSettingsNav: '通知设定',
    trackingWaiting: '正在读取追踪链接...',
    trackingRedirecting: '已记录来源，正在跳转到 WhatsApp。',
    trackingInactive: '这个 WhatsApp 追踪链接已停用。',
    trackingMissing: '这个 WhatsApp 追踪链接缺少电话号码。',
    openWhatsApp: '打开 WhatsApp',
    openingIntakeLink: '正在打开客户表格链接',
    openForm: '打开表格',
    toolsTitle: '管理中心',
    toolsSubtitle: '管理工具集合。',
    analytics: '数据分析',
    missingInfoSummary: '缺失资料汇总',
    approvals: '审批',
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
    bankName: '银行名称',
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
    loanTenure: '贷款年期',
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
    taskInbox: 'Task Inbox',
    staffView: 'Mobile Mode',
    customers: 'Loan Applications',
    rawCustomers: 'Lead Pool',
    customerRelationships: 'Customer Relationships',
    followUp: 'Follow Up',
    calendar: 'Calendar',
    attendance: 'Attendance & Leave',
    setting: 'Setting',
    tools: 'Admin Center',
    rewards: 'Commission & Rewards',
    salesBudget: 'System Costs',
    financeCenter: 'Finance Center',
    manual: 'Manual',
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
    payoutCenter: 'Payouts',
    missionsNav: 'Missions',
    teamBattleNav: 'Team Battle',
    vehicleInfoNav: 'Vehicle Info',
    brandLogoNav: 'Brand Logos',
    bankDatabaseNav: 'Bank Database',
    rejectCodesNav: 'Reject Codes',
    rolesAccountsNav: 'Roles & Accounts',
    permissionsNav: 'Permissions',
    roleAccessNav: 'Role Access',
    notificationSettingsNav: 'Notification Settings',
    trackingWaiting: 'Reading tracking link...',
    trackingRedirecting: 'Source recorded. Redirecting to WhatsApp.',
    trackingInactive: 'This WhatsApp tracking link has been disabled.',
    trackingMissing: 'This WhatsApp tracking link is missing a phone number.',
    openWhatsApp: 'Open WhatsApp',
    openingIntakeLink: 'Opening Intake Link',
    openForm: 'Open Form',
    toolsTitle: 'Admin Center',
    toolsSubtitle: 'Admin tools.',
    analytics: 'Analytics',
    missingInfoSummary: 'Missing Info Summary',
    approvals: 'Approvals',
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
    phoneNumber: 'Phone Number',
    icNumber: 'IC Number',
    email: 'Email',
    maritalStatus: 'Marital Status',
    gender: 'Gender',
    race: 'Race',
    bankName: 'Bank Name',
    bankAccountNumber: 'Bank Account Number',
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
    loanTenure: 'Loan Tenure',
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
    taskInbox: "Peti Masuk Tugasan",
    staffView: "Mod Mudah Alih",
    customers: "Permohonan Pinjaman",
    rawCustomers: "Kumpulan Prospek",
    customerRelationships: "Hubungan Pelanggan",
    followUp: "Susulan",
    calendar: "Kalendar",
    attendance: "Kehadiran & Cuti",
    setting: "Tetapan",
    tools: "Pusat Pentadbiran",
    rewards: "Komisen & Ganjaran",
    salesBudget: "Kos Sistem",
    financeCenter: "Pusat Kewangan",
    manual: "Manual",
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
    payoutCenter: "Bayaran",
    missionsNav: "Misi",
    teamBattleNav: "Pertempuran Pasukan",
    vehicleInfoNav: "Maklumat Kenderaan",
    brandLogoNav: "Logo Jenama",
    bankDatabaseNav: "Pangkalan Data Bank",
    rejectCodesNav: "Kod Penolakan",
    rolesAccountsNav: "Peranan & Akaun",
    permissionsNav: "Kebenaran",
    roleAccessNav: "Akses Peranan",
    notificationSettingsNav: "Tetapan Pemberitahuan",
    trackingWaiting: "Membaca pautan penjejakan...",
    trackingRedirecting: "Sumber direkodkan. Mengubah hala ke WhatsApp.",
    trackingInactive: "Pautan penjejakan WhatsApp ini telah dilumpuhkan.",
    trackingMissing: "Pautan penjejakan WhatsApp ini tiada nombor telefon.",
    openWhatsApp: "Buka WhatsApp",
    openingIntakeLink: "Membuka Pautan Pengambilan",
    openForm: "Buka Borang",
    toolsTitle: "Pusat Pentadbiran",
    toolsSubtitle: "Alat pentadbir.",
    analytics: "Analitik",
    missingInfoSummary: "Ringkasan Maklumat Tiada",
    approvals: "Kelulusan",
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
    phoneNumber: "Nombor Telefon",
    icNumber: "Nombor IC",
    email: "E-mel",
    maritalStatus: "Status Perkahwinan",
    gender: "Jantina",
    race: "Bangsa",
    bankName: "Nama Bank",
    bankAccountNumber: "Nombor Akaun Bank",
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
    loanTenure: "Tempoh Pinjaman",
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

const createCustomerActivityId = () => `ACTIVITY-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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
  const [language, setLanguage] = useState<AppLanguage>(() => readStoredLanguage());
  const [theme, setTheme] = useState<AppTheme>(() => readStoredTheme());
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [rawCustomerLeads, setRawCustomerLeads] = useState<RawCustomerLead[]>([]);
  const [errorCodeDefinitions, setErrorCodeDefinitions] = useState<ErrorCodeDefinition[]>([]);
  const [roleAccounts, setRoleAccounts] = useState<RoleAccount[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionSetting[]>(() => buildDefaultRolePermissionSettings());
  const [roleNavAccess, setRoleNavAccess] = useState<RoleNavAccessSetting[]>(() => buildDefaultRoleNavAccessSettings());
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>(() => buildDefaultVehicleCategories());
  const [vehicleBrandLogos, setVehicleBrandLogos] = useState<Record<string, string>>({});
  const [defaultAvatarLibrary, setDefaultAvatarLibrary] = useState<StaffDefaultAvatar[]>([]);
  const [whatsAppTrackingLinks, setWhatsAppTrackingLinks] = useState<WhatsAppTrackingLink[]>([]);
  const [whatsAppTrackingClicks, setWhatsAppTrackingClicks] = useState<WhatsAppTrackingClick[]>([]);
  const [whatsAppDefaultMessage, setWhatsAppDefaultMessage] = useState(DEFAULT_WHATSAPP_DEFAULT_MESSAGE);
  const [customerIntakeShortLinks, setCustomerIntakeShortLinks] = useState<CustomerIntakeShortLink[]>([]);
  const [customMissions, setCustomMissions] = useState<CustomMission[]>([]);
  const [rewardTeams, setRewardTeams] = useState<RewardTeam[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>([]);
  const [attendanceEvents, setAttendanceEvents] = useState<AttendanceEvent[]>([]);
  const [attendanceIncidentResolutions, setAttendanceIncidentResolutions] = useState<AttendanceIncidentResolution[]>([]);
  const [attendanceSchedules, setAttendanceSchedules] = useState<AttendanceWeeklySchedule[]>([]);
  const [staffLeaveRequests, setStaffLeaveRequests] = useState<ApprovalRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [vehicleTags, setVehicleTags] = useState<string[]>(DEFAULT_VEHICLE_TAGS);
  const [vehicleBrandTags, setVehicleBrandTags] = useState<string[]>(DEFAULT_VEHICLE_BRAND_TAGS);
  const [vehicleCatalog, setVehicleCatalog] = useState<VehicleCatalogItem[]>(INITIAL_VEHICLE_CATALOG);
  const [financeProfiles, setFinanceProfiles] = useState<FinanceProfile[]>(FINANCE_PROFILES);
  const [commissionRules, setCommissionRules] = useState<CommissionRules>(DEFAULT_COMMISSION_RULES);
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
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [taskInboxStaffName, setTaskInboxStaffName] = useState(() => readStoredStaffSession().name);
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; tone: 'success' | 'warning' | 'error' }>>([]);
  const [showAllApplications, setShowAllApplications] = useState(() => isOperationsLead(readStoredStaffSession().role));
  const [leadFollowUpDays, setLeadFollowUpDays] = useState(() => readLeadFollowUpDays(readStoredStaffSession().name));
  const [whatsAppOpenInNewTab, setWhatsAppOpenInNewTab] = useState(() => readWhatsAppOpenInNewTab(readStoredStaffSession().name));
  const [activeUserView, setActiveUserView] = useState<'profile' | 'whatsapp'>('profile');
  const [syncStatus, setSyncStatus] = useState<'loading' | 'cached' | 'firebase' | 'local' | 'error'>('loading');
  const [intakeDraft, setIntakeDraft] = useState(() => ({ ...EMPTY_INTAKE_DRAFT }));
  const [intakeSubmittedApplicationId, setIntakeSubmittedApplicationId] = useState('');
  const [intakeSubmitError, setIntakeSubmitError] = useState<CustomerIntakeSubmitError>('');
  const [intakeSubmitting, setIntakeSubmitting] = useState(false);
  const [missionDrafts, setMissionDrafts] = useState<Record<string, VehicleInfoMissionDraft>>({});
  const [clientContext, setClientContext] = useState({
    ip_address: 'Unavailable',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
  });
  const [isCompactViewport, setIsCompactViewport] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1366px)').matches
  ));
  const hasAutoReleasedStaleLeadsRef = useRef(false);
  const toastIdRef = useRef(0);
  const syncStatusRef = useRef(syncStatus);
  const saveConflictToastTimerRef = useRef<number | null>(null);
  const applicationsRef = useRef(applications);
  const realtimeApplicationConflictIdsRef = useRef(new Set<string>());
  const realtimeApplicationRecoveryIdsRef = useRef(new Set<string>());
  const realtimeApplicationFlushScheduledRef = useRef(false);
  const skipNextRealtimeNotificationSaveRef = useRef(false);
  const appText = APP_COPY[language];

  applicationsRef.current = applications;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1366px)');
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
    isLoginSubmitting,
    isPasswordResetSubmitting,
    loginError,
    loginEmail,
    loginPassword,
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
    activeRewardCenterView,
    activeRoleTab,
    activeSettingGroup,
    activeToolsView,
    approvalPreset,
    canAccessNavKey,
    setActivePage,
    setActiveRewardCenterView,
    setActiveRoleTab,
    setActiveSettingGroup,
    setActiveToolsView,
    setApprovalPreset
  } = useNavigationState(currentStaff.role, roleNavAccess);
  const canEditLoanApplicationInformation = (application: LoanApplication | null | undefined) => (
    currentStaff.role === 'Super Admin'
    || (currentStaff.role === 'Operations Manager' && canAccessNavKey('customers.editApplication'))
    || application?.handler_name === currentStaff.name
    || (currentStaff.role === 'Admin' && canAccessNavKey('customers.editApplication'))
  );
  const [financeStockRequestId, setFinanceStockRequestId] = useState(0);
  const [financeStockModel, setFinanceStockModel] = useState('');
  // One shared visible-task source drives Task Inbox, the sidebar badge, and
  // Notification Center. Hidden and completed tasks are excluded upstream.
  const [taskInboxMirrorItems, setTaskInboxMirrorItems] = useState<TaskInboxMirrorItem[]>([]);
  const taskInboxTaskCount = taskInboxMirrorItems.length;
  const navigateToPageIfAllowed = (navKey: string, page: AppPage) => {
    if (V1_HIDDEN_NAV_KEYS.has(navKey) || !canAccessNavKey(navKey)) {
      triggerToast(tr('当前角色没有权限打开此页面。', 'Your role cannot open this page.', 'Peranan anda tidak boleh membuka halaman ini.'), 'error');
      return false;
    }

    setActivePage(page);
    return true;
  };

  useEffect(() => {
    const activeNavKey = activePage === 'tools'
      ? activeToolsView === 'missions' ? 'missingInfo' : activeToolsView
      : activePage === 'tags'
        ? SETTING_GROUP_NAV_KEY[activeSettingGroup]
        : activePage === 'flow'
          ? 'manual'
          : activePage;

    if (!V1_HIDDEN_NAV_KEYS.has(activeNavKey) && canAccessNavKey(activeNavKey)) {
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
      { key: 'manual', page: 'flow' as AppPage },
      { key: 'user', page: 'user' as AppPage }
    ].find((item) => !V1_HIDDEN_NAV_KEYS.has(item.key) && canAccessNavKey(item.key));

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
      className={`inline-flex items-center rounded-xl border border-slate-100 bg-white p-1 shadow-2xs ${compact ? 'gap-0.5' : 'gap-1'}`}
      aria-label={appText.languageLabel}
    >
      <Languages className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} ml-1 text-slate-500`} />
      {(['zh', 'en', 'ms'] as AppLanguage[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
            language === option
              ? 'bg-red-800 text-white'
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
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white font-bold text-slate-500 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 ${
        compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'
      }`}
      aria-label={appText.themeLabel}
      title={theme === 'dark' ? appText.lightTheme : appText.darkTheme}
    >
      <NavIconImage
        active
        className="h-5 w-5"
        fallback={null}
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
  const stockDetailMatch = window.location.pathname.match(/^\/stok\/([a-z0-9-]+)\/?$/);
  const isStockDetailPath = Boolean(stockDetailMatch);
  const stockDetailSlug = stockDetailMatch?.[1] || '';
  const isBlogIndexPath = /^\/blog\/?$/.test(window.location.pathname);
  const blogPostMatch = window.location.pathname.match(/^\/blog\/([a-z0-9-]+)\/?$/);
  const isBlogPostPath = Boolean(blogPostMatch);
  const blogPostSlug = blogPostMatch?.[1] || '';
  const isPublicRoutePath =
    isSeoHomePath ||
    isWhatsAppRedirectPath ||
    isCustomerIntakePath ||
    isShortLinkPath ||
    isStockDetailPath ||
    isBlogIndexPath ||
    isBlogPostPath;
  const activeBankOptions = useMemo(
    () => bankDefinitions.filter((bank) => bank.active).map((bank) => bank.name),
    [bankDefinitions]
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
    rolePermissions,
    roleNavAccess,
    defaultAvatarLibrary,
    whatsAppTrackingLinks,
    whatsAppTrackingClicks,
    whatsAppDefaultMessage,
    customerIntakeShortLinks,
    customMissions,
    rewardTeams,
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
    rolePermissions,
    roleNavAccess,
    defaultAvatarLibrary,
    whatsAppTrackingLinks,
    whatsAppTrackingClicks,
    whatsAppDefaultMessage,
    customerIntakeShortLinks,
    customMissions,
    rewardTeams,
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
    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-3 text-sm font-bold text-slate-800">{tr('当前角色没有权限查看此页面', 'Your role cannot view this page', "Peranan anda tidak boleh melihat halaman ini")}</p>
    </div>
  );

  const handleUpdateCommissionRules = (updates: Partial<CommissionRules>) => {
    const previous = commissionRules;
    const normalized = normalizeCommissionRules({ ...commissionRules, ...updates });

    setCommissionRules(normalized);
    writeLocalDashboardValue('commissionRules', normalized);
    persistDashboardState({ commissionRules: normalized });
    appendAuditLog({
      action: 'UPDATE_COMMISSION_RULES',
      target_type: 'Commission Rules',
      target_id: 'commission_rules',
      target_label: tr('佣金规则', 'Commission Rules', "Peraturan Suruhanjaya"),
      changes: createAuditChanges(
        previous as unknown as Record<string, string | number>,
        normalized as unknown as Record<string, string | number>
      ),
      stateOverrides: { commissionRules: normalized }
    });
  };

  const handleUpdateAttendancePolicy = (nextPolicy: AttendancePolicy) => {
    if (currentStaff.role !== 'Super Admin') {
      return false;
    }

    const normalized = normalizeAttendancePolicy(nextPolicy);
    const changes: AuditLogEntry['changes'] = [
      {
        field: 'work_start_time',
        old_value: attendancePolicy.work_start_time,
        new_value: normalized.work_start_time
      },
      {
        field: 'work_end_time',
        old_value: attendancePolicy.work_end_time,
        new_value: normalized.work_end_time
      },
      {
        field: 'overtime_next_day_start_time',
        old_value: attendancePolicy.overtime_next_day_start_time,
        new_value: normalized.overtime_next_day_start_time
      },
      {
        field: 'late_grace_minutes',
        old_value: String(attendancePolicy.late_grace_minutes),
        new_value: String(normalized.late_grace_minutes)
      },
      {
        field: 'late_penalty_rules',
        old_value: JSON.stringify(attendancePolicy.late_penalty_rules),
        new_value: JSON.stringify(normalized.late_penalty_rules)
      },
      {
        field: 'require_office_wifi_for_check_in',
        old_value: String(attendancePolicy.require_office_wifi_for_check_in),
        new_value: String(normalized.require_office_wifi_for_check_in)
      },
      {
        field: 'office_network_ips',
        old_value: JSON.stringify(attendancePolicy.office_network_ips),
        new_value: JSON.stringify(normalized.office_network_ips)
      }
    ].filter((change) => change.old_value !== change.new_value);

    if (changes.length === 0) {
      triggerToast(tr('考勤规则没有变化。', 'Attendance rules are unchanged.', 'Peraturan kehadiran tidak berubah.'));
      return true;
    }

    setAttendancePolicy(normalized);
    writeLocalDashboardValue('attendancePolicy', normalized);
    persistDashboardState({ attendancePolicy: normalized });
    appendAuditLog({
      action: 'UPDATE_ATTENDANCE_POLICY',
      target_type: 'Attendance Policy',
      target_id: 'attendance_policy',
      target_label: tr('考勤规则', 'Attendance Policy', 'Polisi Kehadiran'),
      changes,
      stateOverrides: { attendancePolicy: normalized }
    });
    triggerToast(tr('考勤规则已保存。', 'Attendance rules saved.', 'Peraturan kehadiran disimpan.'));
    return true;
  };

  const handleUpdateStaffExperienceRules = (rules: StaffExperienceRuleMap) => {
    if (currentStaff.role !== 'Super Admin') {
      return;
    }

    const previousRules = getStaffExperienceRulesFromConfig(commissionRules);
    const nextRules = normalizeStaffExperienceRules(rules);
    const normalized = normalizeCommissionRules({
      ...commissionRules,
      [STAFF_EXPERIENCE_RULES_FIELD]: nextRules
    });
    const changes = Object.keys(nextRules)
      .filter((taskType) => previousRules[taskType] !== nextRules[taskType])
      .map((taskType) => ({
        field: `${STAFF_EXPERIENCE_RULES_FIELD}.${taskType}`,
        old_value: String(previousRules[taskType]),
        new_value: String(nextRules[taskType])
      }));

    if (changes.length === 0) {
      return;
    }

    setCommissionRules(normalized);
    writeLocalDashboardValue('commissionRules', normalized);
    persistDashboardState({ commissionRules: normalized });
    appendAuditLog({
      action: 'UPDATE_STAFF_EXPERIENCE_RULES',
      target_type: 'Staff Experience Rules',
      target_id: STAFF_EXPERIENCE_RULES_FIELD,
      target_label: tr('员工 EXP 规则', 'Staff EXP Rules', 'Peraturan EXP Kakitangan'),
      changes,
      stateOverrides: { commissionRules: normalized }
    });
    triggerToast(tr('EXP 计分规则已保存', 'EXP scoring rules saved', 'Peraturan pemarkahan EXP disimpan'));
  };

  const handleSubmitMissionReward = (mission: CustomMission, staffName: string) => {
    handleAddApprovalRequest({
      type: 'mission_reward',
      approver_roles: ['Operations Manager', 'Super Admin'],
      target_type: 'mission',
      target_id: mission.id,
      target_label: `${mission.title} · ${staffName}`,
      amount: Number(mission.reward_amount) || 0,
      reason: tr(`任务达成：${mission.title}（${staffName}）`, `Mission completed: ${mission.title} (${staffName})`, `Misi selesai: ${mission.title} (${staffName})`),
      notes: ''
    });
  };

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
          id: item.id || `VEH-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

  const normalizeBankDefinitions = (list: BankDefinition[]) => {
    const byName = new Map<string, BankDefinition>();

    list.forEach((item) => {
      const name = String(item.name || '').trim().replace(/\s+/g, ' ');
      const key = name.toLowerCase();
      if (!name || !key) {
        return;
      }

      byName.set(key, {
        id: item.id || `BANK-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        icon_data_url: String(item.icon_data_url || ''),
        active: item.active !== false,
        created_at: item.created_at || new Date().toISOString()
      });
    });

    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const normalizeMarketingTagRelationships = (list: MarketingTagRelationship[]) => {
    const bySource = new Map<string, MarketingTagRelationship>();

    list.forEach((item) => {
      const source = item.source.trim().replace(/\s+/g, ' ');
      const key = source.toLowerCase();
      if (!source || !key) {
        return;
      }

      bySource.set(key, {
        ...item,
        id: item.id || `MKT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        source,
        medium: item.medium.trim() || 'Other',
        category: item.category.trim() || 'Lead source',
        created_at: item.created_at || new Date().toISOString()
      });
    });

    return Array.from(bySource.values()).sort((a, b) => a.source.localeCompare(b.source));
  };

  const normalizeTagNormalizationRules = (list: TagNormalizationRule[]) => {
    const byRule = new Map<string, TagNormalizationRule>();

    list.forEach((rule) => {
      const rawValue = rule.raw_value.trim().replace(/\s+/g, ' ');
      const domain = rule.domain;
      const parentTag = rule.parent_tag.trim().replace(/\s+/g, ' ');
      const key = `${domain}:${rawValue.toLowerCase()}`;
      if (!rawValue || !domain) {
        return;
      }
      if (domain === 'vehicle' && !MOTOR_PRICE_BRAND_TAG_SET.has(parentTag)) {
        return;
      }

      byRule.set(key, {
        ...rule,
        id: rule.id || `NORM-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        domain,
        raw_value: rawValue,
        normalized_tag: rule.normalized_tag.trim().replace(/\s+/g, ' ') || rawValue,
        parent_tag: parentTag || 'Other',
        category: rule.category.trim().replace(/\s+/g, ' ') || 'Other',
        active: rule.active !== false,
        created_at: rule.created_at || new Date().toISOString()
      });
    });

    return Array.from(byRule.values()).sort((a, b) => (
      a.domain.localeCompare(b.domain) ||
      a.raw_value.localeCompare(b.raw_value)
    ));
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
      setRolePermissions,
      setRoleNavAccess,
      setVehicleCategories,
      setVehicleBrandLogos,
      setDefaultAvatarLibrary,
      setWhatsAppTrackingLinks,
      setWhatsAppTrackingClicks,
      setWhatsAppDefaultMessage,
      setCustomerIntakeShortLinks,
      setCustomMissions,
      setRewardTeams,
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

  const scheduleRealtimeApplicationsFlush = useStableCallback(() => {
    if (realtimeApplicationFlushScheduledRef.current) return;

    realtimeApplicationFlushScheduledRef.current = true;
    queueMicrotask(() => {
      realtimeApplicationFlushScheduledRef.current = false;
      const nextApplications = applicationsRef.current;
      skipNextRealtimeNotificationSaveRef.current = true;
      setApplications(nextApplications);
      writeLocalDashboardValue('applications', nextApplications);
    });
  });

  const recoverRealtimeCustomer = useStableCallback(async (
    applicationId: string,
    applicantName: string,
    remoteWasRemoved = false
  ) => {
    if (realtimeApplicationRecoveryIdsRef.current.has(applicationId)) return;

    realtimeApplicationRecoveryIdsRef.current.add(applicationId);
    setSyncStatus('loading');
    triggerToast(tr(
      `发现 ${applicantName} 的较新云端资料，正在自动同步…`,
      `Newer cloud data was found for ${applicantName}. Syncing automatically…`,
      `Data awan lebih baharu ditemui untuk ${applicantName}. Menyegerak secara automatik…`
    ), 'warning');

    try {
      await waitForDashboardPersistenceIdle();
      // A listener "removed" event also means this staff member no longer has
      // access through their role-scoped query. Do not issue a document get
      // that Firestore Rules may correctly reject after reassignment.
      let remoteApplication: LoanApplication | null = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          remoteApplication = await reloadCustomerFromFirebase(applicationId, {
            knownRemoved: remoteWasRemoved
          });
          break;
        } catch (error) {
          if (attempt === 2) throw error;
          await new Promise((resolve) => window.setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
      const currentApplications = applicationsRef.current;
      const currentApplication = currentApplications.find((application) => application.id === applicationId);
      const hydratedApplication = remoteApplication
        ? preserveLoadedApplicationFileData(
          hydrateApplications([remoteApplication], vehicleCatalog, tagNormalizationRules)[0],
          currentApplication
        )
        : null;
      const nextApplications = hydratedApplication
        ? currentApplication
          ? currentApplications.map((application) => (
            application.id === applicationId ? hydratedApplication : application
          ))
          : [hydratedApplication, ...currentApplications]
        : currentApplications.filter((application) => application.id !== applicationId);

      applicationsRef.current = nextApplications;
      setSelectedApplication((current) => (
        current?.id === applicationId
          ? hydratedApplication
            ? preserveLoadedApplicationFileData(hydratedApplication, current)
            : null
          : current
      ));
      scheduleRealtimeApplicationsFlush();
      realtimeApplicationConflictIdsRef.current.delete(applicationId);
      setSyncStatus('firebase');
      triggerToast(tr(
        `已同步 ${applicantName} 的最新资料；已完成任务已自动清除。`,
        `Latest data for ${applicantName} synced; completed tasks were removed automatically.`,
        `Data terkini untuk ${applicantName} telah disegerakkan; tugas selesai dibuang secara automatik.`
      ));
    } catch (error) {
      console.warn('Customer realtime recovery failed.', error);
      realtimeApplicationConflictIdsRef.current.delete(applicationId);
      setSyncStatus('error');
      triggerToast(tr(
        `${applicantName} 自动同步失败，请点击同步状态重试或刷新页面。`,
        `Automatic sync failed for ${applicantName}. Retry from the sync status or refresh the page.`,
        `Penyegerakan automatik gagal untuk ${applicantName}. Cuba lagi melalui status penyegerakan atau muat semula halaman.`
      ), 'error');
    } finally {
      realtimeApplicationRecoveryIdsRef.current.delete(applicationId);
    }
  });

  const handleRealtimeCustomerChange = useStableCallback((change: CustomerRealtimeChange) => {
    const currentApplications = applicationsRef.current;
    const currentApplication = currentApplications.find((application) => application.id === change.id);
    const normalizeRealtimeApplication = (application: LoanApplication) => preserveLoadedApplicationFileData(
      hydrateApplications([application], vehicleCatalog, tagNormalizationRules)[0],
      currentApplication
    );
    const previousApplication = change.previousApplication
      ? normalizeRealtimeApplication(change.previousApplication)
      : undefined;
    const incomingApplication = change.application
      ? normalizeRealtimeApplication(change.application)
      : undefined;
    const currentComparable = currentApplication
      ? stripApplicationFileDataForComparison(currentApplication)
      : undefined;
    const previousComparable = previousApplication
      ? stripApplicationFileDataForComparison(previousApplication)
      : undefined;
    const incomingComparable = incomingApplication
      ? stripApplicationFileDataForComparison(incomingApplication)
      : undefined;
    const currentMatchesPrevious = Boolean(
      currentComparable && previousComparable &&
      areJsonLikeValuesEqual(currentComparable, previousComparable)
    );
    const currentMatchesIncoming = Boolean(
      currentComparable && incomingComparable &&
      areJsonLikeValuesEqual(currentComparable, incomingComparable)
    );

    if (change.type === 'removed') {
      if (!currentApplication) {
        realtimeApplicationConflictIdsRef.current.delete(change.id);
        return true;
      }

      if (!currentMatchesPrevious) {
        if (!realtimeApplicationConflictIdsRef.current.has(change.id)) {
          realtimeApplicationConflictIdsRef.current.add(change.id);
          void recoverRealtimeCustomer(change.id, currentApplication.applicant_name, true);
        }
        return false;
      }

      const nextApplications = currentApplications.filter((application) => application.id !== change.id);
      applicationsRef.current = nextApplications;
      scheduleRealtimeApplicationsFlush();
      realtimeApplicationConflictIdsRef.current.delete(change.id);
      return true;
    }

    if (!incomingApplication) {
      return false;
    }

    if (currentMatchesIncoming) {
      realtimeApplicationConflictIdsRef.current.delete(change.id);
      return true;
    }

    if (currentApplication && !currentMatchesPrevious) {
      if (!realtimeApplicationConflictIdsRef.current.has(change.id)) {
        realtimeApplicationConflictIdsRef.current.add(change.id);
        void recoverRealtimeCustomer(change.id, currentApplication.applicant_name);
      }
      return false;
    }

    const nextApplications = currentApplication
      ? currentApplications.map((application) => application.id === change.id ? incomingApplication : application)
      : [incomingApplication, ...currentApplications];

    applicationsRef.current = nextApplications;
    // Keep an already-open Application Detail drawer on the same realtime
    // customer object. Without this, the table received Sales' new document
    // reference but the Admin drawer stayed on its stale selectedApplication,
    // so the lazy Storage restore never saw or downloaded the uploaded IC.
    setSelectedApplication((current) => (
      current?.id === change.id
        ? preserveLoadedApplicationFileData(incomingApplication, current)
        : current
    ));
    scheduleRealtimeApplicationsFlush();
    realtimeApplicationConflictIdsRef.current.delete(change.id);
    return true;
  });

  useEffect(() => {
    if (
      !isFirebaseConfigured ||
      isPublicRoutePath ||
      !isLoggedIn ||
      syncStatus !== 'firebase'
    ) {
      return;
    }

    let disposed = false;
    let unsubscribe = () => undefined;

    // Every signed-in staff role receives only the customer scope selected by
    // subscribeToCustomerChangesFromFirebase: Sales listens to its Handler
    // rows, Admin listens to owned/unassigned Admin work, and Super Admin
    // listens to all customers. The stream carries metadata only; document
    // bytes remain lazy-loaded from Storage when a preview is opened.
    void import('./services/dashboardRepository')
      .then((module) => module.subscribeToCustomerChangesFromFirebase(
        handleRealtimeCustomerChange,
        () => {
          if (!disposed) {
            triggerToast(
              tr(
                '实时更新连接已停止，请刷新页面重新连接。',
                'Live updates stopped. Refresh the page to reconnect.',
                'Kemas kini langsung terhenti. Muat semula halaman untuk menyambung semula.'
              ),
              'error'
            );
          }
        }
      ))
      .then((stopListening) => {
        if (disposed) {
          stopListening();
          return;
        }

        unsubscribe = stopListening;
      })
      .catch((error) => {
        console.warn('Customer realtime listener could not start.', error);
      });

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [currentStaff.role, handleRealtimeCustomerChange, isLoggedIn, isPublicRoutePath, syncStatus]);

  useEffect(() => {
    if (
      !isFirebaseConfigured ||
      isPublicRoutePath ||
      !isLoggedIn ||
      syncStatus !== 'firebase'
    ) {
      return;
    }

    let disposed = false;
    let unsubscribe = () => undefined;

    void subscribeToCalendarTasksFromFirebase(
      (nextCalendarNotes) => {
        if (disposed) {
          return;
        }

        setCalendarNotes((current) => {
          if (areJsonLikeValuesEqual(current, nextCalendarNotes)) {
            return current;
          }

          writeLocalDashboardValue('calendarNotes', nextCalendarNotes);
          return nextCalendarNotes;
        });
      },
      (error) => {
        if (!disposed) {
          console.warn('Calendar task realtime listener stopped.', error);
          triggerToast(
            tr(
              '日历任务实时更新已停止，请刷新页面重新连接。',
              'Calendar task live updates stopped. Refresh the page to reconnect.',
              'Kemas kini langsung tugasan kalendar terhenti. Muat semula halaman untuk menyambung semula.'
            ),
            'error'
          );
        }
      }
    ).then((stopListening) => {
      if (disposed) {
        stopListening();
        return;
      }

      unsubscribe = stopListening;
    }).catch((error) => {
      console.warn('Calendar task realtime listener could not start.', error);
    });

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [currentStaff.name, currentStaff.role, isLoggedIn, isPublicRoutePath, syncStatus, writeLocalDashboardValue]);

  useEffect(() => {
    if (
      !isFirebaseConfigured
      || isPublicRoutePath
      || !isLoggedIn
      || syncStatus !== 'firebase'
    ) {
      return;
    }

    let disposed = false;
    const unsubscribes: Array<() => void> = [];
    const handleLiveError = (label: string, error: Error) => {
      if (disposed) return;
      console.warn(`${label} realtime listener stopped.`, error);
      triggerToast(
        tr(
          '考勤实时更新已停止，请刷新页面重新连接。',
          'Attendance live updates stopped. Refresh the page to reconnect.',
          'Kemas kini langsung kehadiran terhenti. Muat semula halaman untuk menyambung semula.'
        ),
        'error'
      );
    };

    void Promise.all([
      subscribeToAttendanceEventsFromFirebase(
        (nextEvents) => {
          if (!disposed) setAttendanceEvents(nextEvents);
        },
        (error) => handleLiveError('Attendance', error)
      ),
      subscribeToAttendanceIncidentResolutionsFromFirebase(
        (nextResolutions) => {
          if (!disposed) setAttendanceIncidentResolutions(nextResolutions);
        },
        (error) => handleLiveError('Attendance incident resolutions', error)
      ),
      subscribeToAttendanceSchedulesFromFirebase(
        (nextSchedules) => {
          if (!disposed) setAttendanceSchedules(nextSchedules);
        },
        (error) => handleLiveError('Attendance schedules', error)
      ),
      subscribeToStaffLeaveRequestsFromFirebase(
        (nextRequests) => {
          if (!disposed) setStaffLeaveRequests(nextRequests);
        },
        (error) => handleLiveError('Staff leave', error)
      )
    ]).then((stops) => {
      if (disposed) {
        stops.forEach((stop) => stop());
        return;
      }
      unsubscribes.push(...stops);
    }).catch((error) => handleLiveError('Attendance', error as Error));

    return () => {
      disposed = true;
      unsubscribes.forEach((stop) => stop());
    };
  }, [currentStaff.name, currentStaff.role, isLoggedIn, isPublicRoutePath, syncStatus]);

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
    setApplications(updatedList);
    writeLocalDashboardValue('applications', updatedList);
    return persistDashboardState({ applications: updatedList });
  };

  const updateRawCustomerLeadsState = (updatedList: RawCustomerLead[]) => {
    const normalized = normalizeRawCustomerLeads(updatedList);

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

  const updateRolePermissionsState = (updatedList: RolePermissionSetting[]) => {
    const normalized = normalizeRolePermissionSettings(updatedList);

    setRolePermissions(normalized);
    writeLocalDashboardValue('rolePermissions', normalized);
    return persistDashboardState({ rolePermissions: normalized });
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

  const updateWhatsAppTrackingClicksState = (updatedList: WhatsAppTrackingClick[]) => {
    const limited = updatedList.slice(0, 500);

    setWhatsAppTrackingClicks(limited);
    writeLocalDashboardValue('whatsAppTrackingClicks', limited);
    return persistDashboardState({ whatsAppTrackingClicks: limited });
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

  const updateRewardTeamsState = (updatedList: RewardTeam[]) => {
    setRewardTeams(updatedList);
    writeLocalDashboardValue('rewardTeams', updatedList);
    return persistDashboardState({ rewardTeams: updatedList });
  };

  const updateApprovalRequestsState = (updatedList: ApprovalRequest[]) => {
    setApprovalRequests(updatedList);
    writeLocalDashboardValue('approvalRequests', updatedList);
    return persistDashboardState({ approvalRequests: updatedList });
  };

  const updateCalendarNotesState = (updatedList: CalendarNote[]) => {
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

  const handleAddCalendarNote = async (note: Pick<CalendarNote, 'title' | 'body' | 'date_at' | 'assigned_to' | 'assigned_role'>) => {
    const now = new Date().toISOString();
    const canAssignToOthers = currentStaff.role === 'Super Admin';
    const assignedTo = canAssignToOthers ? note.assigned_to || currentStaff.name : currentStaff.name;
    const assignedRole = canAssignToOthers ? note.assigned_role || currentStaff.role : currentStaff.role;
    const newNote: CalendarNote = {
      id: `NOTE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: note.title.trim(),
      body: note.body.trim(),
      date_at: note.date_at,
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      assigned_to: assignedTo,
      assigned_role: assignedRole,
      created_at: now
    };
    const updatedNotes = [newNote, ...calendarNotes].sort((a, b) => a.date_at.localeCompare(b.date_at));

    await saveCalendarNoteToFirebase(newNote);

    appendAuditLog({
      action: 'ADD_CALENDAR_NOTE',
      target_type: 'calendar_note',
      target_id: newNote.id,
      target_label: newNote.title,
      changes: [
        { field: 'date_at', old_value: '', new_value: newNote.date_at },
        { field: 'title', old_value: '', new_value: newNote.title },
        { field: 'assigned_to', old_value: '', new_value: assignedTo }
      ],
      stateOverrides: { calendarNotes: updatedNotes }
    });

    await updateCalendarNotesState(updatedNotes);
  };

  const handleSetCalendarNoteCompleted = async (noteId: string, completed: boolean) => {
    const note = calendarNotes.find((item) => item.id === noteId);
    if (!note) return;

    const completedAt = completed ? new Date().toISOString() : undefined;
    const updatedNote: CalendarNote = {
      ...note,
      completed_at: completedAt,
      completed_by: completed ? currentStaff.name : undefined
    };
    const updatedNotes = calendarNotes.map((item) => item.id === noteId ? {
      ...item,
      completed_at: completedAt,
      completed_by: completed ? currentStaff.name : undefined
    } : item);

    await saveCalendarNoteToFirebase(updatedNote);

    appendAuditLog({
      action: completed ? 'COMPLETE_CALENDAR_NOTE' : 'REOPEN_CALENDAR_NOTE',
      target_type: 'calendar_note',
      target_id: note.id,
      target_label: note.title,
      changes: [{ field: 'completed_at', old_value: note.completed_at || '', new_value: completedAt || '' }],
      stateOverrides: { calendarNotes: updatedNotes }
    });

    await updateCalendarNotesState(updatedNotes);
  };

  const handleAddCalendarTaskComment = async (noteId: string, rawBody: string) => {
    const note = calendarNotes.find((item) => item.id === noteId);
    const body = rawBody.trim();
    const canReply = Boolean(note) && (
      currentStaff.role === 'Super Admin' ||
      note?.staff_name === currentStaff.name ||
      note?.assigned_to === currentStaff.name
    );

    if (!note || !body || !canReply) {
      triggerToast(
        tr(
          '你只能回复自己参与的日历任务。',
          'You can only reply to calendar tasks you are part of.',
          'Anda hanya boleh membalas tugasan kalendar yang melibatkan anda.'
        ),
        'error'
      );
      return false;
    }

    const comment = {
      id: `CAL-COMMENT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      body: body.slice(0, 2000),
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      created_at: new Date().toISOString()
    };
    try {
      const remoteComments = await appendCalendarTaskCommentToFirebase(note.id, comment);
      const updatedNote: CalendarNote = {
        ...note,
        comments: remoteComments || [...(note.comments || []), comment]
      };
      const updatedNotes = calendarNotes.map((item) => item.id === noteId ? updatedNote : item);

      appendAuditLog({
        action: 'ADD_CALENDAR_TASK_COMMENT',
        target_type: 'calendar_note',
        target_id: note.id,
        target_label: note.title,
        changes: [{ field: 'comments', old_value: `${note.comments?.length || 0}`, new_value: `${updatedNote.comments?.length || 0}` }],
        stateOverrides: { calendarNotes: updatedNotes }
      });

      await updateCalendarNotesState(updatedNotes);
      triggerToast(tr('任务回复已发送。', 'Task reply sent.', 'Balasan tugasan dihantar.'));
      return true;
    } catch (error) {
      console.error('Calendar task reply save failed.', error);
      triggerToast(
        tr(
          '任务回复无法同步，请稍后再试。',
          'Task reply could not sync. Please try again.',
          'Balasan tugasan tidak dapat disegerakkan. Sila cuba lagi.'
        ),
        'error'
      );
      return false;
    }
  };

  const handleDeleteCalendarNote = async (noteId: string) => {
    const note = calendarNotes.find((item) => item.id === noteId);
    if (!note) return;

    const updatedNotes = calendarNotes.filter((item) => item.id !== noteId);

    await deleteCalendarNoteFromFirebase(noteId);

    appendAuditLog({
      action: 'DELETE_CALENDAR_NOTE',
      target_type: 'calendar_note',
      target_id: note.id,
      target_label: note.title,
      changes: [
        { field: 'title', old_value: note.title, new_value: '' }
      ],
      stateOverrides: { calendarNotes: updatedNotes }
    });

    await updateCalendarNotesState(updatedNotes);
  };

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
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

    updateAuditLogsState([entry, ...auditLogs], stateOverrides);
  };

  const handleRecordAttendance = async (action: AttendanceEvent['action'], note: string) => {
    const todayKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kuala_Lumpur',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    const latestTodayEvent = attendanceEvents
      .filter((event) => event.staff_name === currentStaff.name && (
        new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Kuala_Lumpur',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(event.occurred_at)) === todayKey
      ))
      .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at))[0];
    const expectedAction: AttendanceEvent['action'] = latestTodayEvent?.action === 'check_in'
      ? 'check_out'
      : 'check_in';
    const scheduledDay = attendanceSchedules
      .find((schedule) => (
        schedule.staff_name === currentStaff.name
        && schedule.days.some((day) => day.date === todayKey)
      ))
      ?.days.find((day) => day.date === todayKey);

    if (action !== expectedAction) {
      triggerToast(
        tr(
          '打卡状态已经改变，请重新操作。',
          'Punch status changed. Try again.',
          'Status rekod telah berubah. Cuba lagi.'
        ),
        'error'
      );
      return false;
    }

    if (action === 'check_in' && scheduledDay?.status === 'Off Day') {
      triggerToast(
        tr(
          '今天排班是 Off Day，不需要 Check in。',
          'Today is an Off Day. No check-in is required.',
          'Hari ini ialah Hari Cuti. Daftar masuk tidak diperlukan.'
        ),
        'error'
      );
      return false;
    }

    if (action === 'check_in' && attendancePolicy.require_office_wifi_for_check_in) {
      let currentNetworkIp = '';
      try {
        const response = await fetch('/api/client-context', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Client context unavailable');
        }
        const context = await response.json() as { ip_address?: string; user_agent?: string };
        currentNetworkIp = normalizeAttendanceNetworkIp(context.ip_address);
        setClientContext({
          ip_address: context.ip_address || 'Unavailable',
          user_agent: context.user_agent || navigator.userAgent || ''
        });
      } catch {
        currentNetworkIp = '';
      }

      if (!currentNetworkIp || !attendancePolicy.office_network_ips.includes(currentNetworkIp)) {
        triggerToast(
          tr(
            '请连接办公室 Wi-Fi 后再 Check in。',
            'Connect to office Wi-Fi before checking in.',
            'Sambung ke Wi-Fi pejabat sebelum daftar masuk.'
          ),
          'error'
        );
        return false;
      }
    }

    const now = new Date().toISOString();
    const event: AttendanceEvent = {
      id: `ATTENDANCE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      action,
      occurred_at: now,
      note: note.slice(0, 500),
      created_at: now
    };

    try {
      await saveAttendanceEventToFirebase(event);
      setAttendanceEvents((current) => [event, ...current]);
      appendAuditLog({
        action: action === 'check_in' ? 'ATTENDANCE_CHECK_IN' : 'ATTENDANCE_CHECK_OUT',
        target_type: 'Attendance',
        target_id: event.id,
        target_label: currentStaff.name,
        changes: [
          { field: 'action', old_value: '', new_value: action },
          { field: 'occurred_at', old_value: '', new_value: now },
          { field: 'note', old_value: '', new_value: event.note }
        ]
      });
      triggerToast(
        action === 'check_in'
          ? tr('Check in 已记录。', 'Check-in recorded.', 'Daftar masuk direkodkan.')
          : tr('Check out 已记录。', 'Checkout recorded.', 'Daftar keluar direkodkan.')
      );
      return true;
    } catch (error) {
      console.error('Attendance event save failed.', error);
      triggerToast(
        tr(
          '打卡无法保存，请检查网络后再试。',
          'Punch could not be saved. Check the connection and try again.',
          'Rekod tidak dapat disimpan. Semak sambungan dan cuba lagi.'
        ),
        'error'
      );
      return false;
    }
  };

  const handleResolveMissingCheckout = async (incident: MissingCheckoutIncident) => {
    if (!['Super Admin', 'Admin'].includes(currentStaff.role)) {
      return false;
    }

    const now = new Date().toISOString();
    const resolution: AttendanceIncidentResolution = {
      id: incident.id,
      staff_name: incident.staffName,
      attendance_date: incident.attendanceDate,
      last_check_in_at: incident.lastCheckInAt,
      resolved_by: currentStaff.name,
      resolved_role: currentStaff.role,
      resolved_at: now
    };

    try {
      await saveAttendanceIncidentResolutionToFirebase(resolution);
      setAttendanceIncidentResolutions((current) => [
        resolution,
        ...current.filter((item) => item.id !== resolution.id)
      ]);
      appendAuditLog({
        action: 'ATTENDANCE_MISSING_CHECKOUT_RESOLVED',
        target_type: 'Attendance',
        target_id: incident.id,
        target_label: incident.staffName,
        changes: [
          { field: 'resolution', old_value: 'Open', new_value: 'Checked with staff' },
          { field: 'attendance_date', old_value: '', new_value: incident.attendanceDate },
          { field: 'last_check_in_at', old_value: '', new_value: incident.lastCheckInAt },
          { field: 'resolved_by', old_value: '', new_value: currentStaff.name }
        ]
      });
      triggerToast(tr(
        '漏打下班卡提醒已为所有管理员关闭。',
        'Missing check-out reminder closed for all managers.',
        'Peringatan tiada daftar keluar ditutup untuk semua pengurus.'
      ));
      return true;
    } catch (error) {
      console.error('Missing check-out resolution save failed.', error);
      triggerToast(tr(
        '无法关闭漏打下班卡提醒，请检查网络后再试。',
        'Missing check-out reminder could not be closed. Check the connection and try again.',
        'Peringatan tiada daftar keluar tidak dapat ditutup. Semak sambungan dan cuba lagi.'
      ), 'error');
      return false;
    }
  };

  const handleSaveAttendanceSchedules = async (schedules: AttendanceWeeklySchedule[]) => {
    if (!['Super Admin', 'Admin'].includes(currentStaff.role) || schedules.length === 0) {
      triggerToast(tr('你没有权限保存员工排班。', 'You cannot save staff schedules.', 'Anda tidak boleh menyimpan jadual kakitangan.'), 'error');
      return false;
    }

    try {
      await Promise.all(schedules.map(saveAttendanceWeeklyScheduleToFirebase));
      const savedIds = new Set(schedules.map((schedule) => schedule.id));
      setAttendanceSchedules((current) => [
        ...schedules,
        ...current.filter((schedule) => !savedIds.has(schedule.id))
      ].sort((left, right) => (
        right.week_start.localeCompare(left.week_start)
        || left.staff_name.localeCompare(right.staff_name)
      )));
      appendAuditLog({
        action: 'UPDATE_ATTENDANCE_SCHEDULE',
        target_type: 'Attendance Schedule',
        target_id: schedules[0].week_start,
        target_label: `${schedules[0].week_start} · ${schedules.length} staff`,
        changes: [{
          field: 'weekly_schedule',
          old_value: '',
          new_value: schedules.map((schedule) => (
            `${schedule.staff_name}:${schedule.days.map((day) => day.status === 'Working' ? 'W' : 'O').join('')}`
          )).join('|')
        }]
      });
      triggerToast(tr('每周员工排班已保存。', 'Weekly staff schedule saved.', 'Jadual mingguan kakitangan disimpan.'));
      return true;
    } catch (error) {
      console.error('Attendance schedule save failed.', error);
      triggerToast(
        tr(
          '排班无法保存，请检查网络后再试。',
          'Schedule could not be saved. Check the connection and try again.',
          'Jadual tidak dapat disimpan. Semak sambungan dan cuba lagi.'
        ),
        'error'
      );
      return false;
    }
  };

  const handleSubmitStaffLeaveRequest = async (
    draft: Omit<ApprovalRequest, 'id' | 'status' | 'requester_name' | 'requester_role' | 'submitted_at'>
  ) => {
    const request: ApprovalRequest = {
      ...draft,
      id: `STAFF-LEAVE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      status: 'Pending',
      requester_name: currentStaff.name,
      requester_role: currentStaff.role,
      submitted_at: new Date().toISOString()
    };

    try {
      await saveStaffLeaveRequestToFirebase(request);
      setStaffLeaveRequests((current) => [request, ...current]);
      appendAuditLog({
        action: 'SUBMIT_STAFF_LEAVE_REQUEST',
        target_type: 'Staff Leave',
        target_id: request.id,
        target_label: request.requester_name,
        changes: [
          { field: 'status', old_value: '', new_value: 'Pending' },
          { field: 'amount', old_value: '', new_value: String(request.amount) },
          { field: 'reason', old_value: '', new_value: request.reason }
        ]
      });
      triggerToast(tr('Leave / MC / OT 申请已提交。', 'Leave / MC / OT request submitted.', 'Permohonan Cuti / MC / OT dihantar.'));
      return true;
    } catch (error) {
      console.error('Staff leave request save failed.', error);
      triggerToast(
        tr(
          '申请无法保存，请检查网络后再试。',
          'Request could not be saved. Check the connection and try again.',
          'Permohonan tidak dapat disimpan. Semak sambungan dan cuba lagi.'
        ),
        'error'
      );
      return false;
    }
  };

  const handleReviewStaffLeaveRequest = async (
    requestId: string,
    status: ApprovalRequestStatus,
    reviewNote: string
  ) => {
    const request = staffLeaveRequests.find((item) => item.id === requestId);
    if (!request || request.status !== 'Pending') {
      triggerToast(tr('这份申请已经处理。', 'This request has already been processed.', 'Permohonan ini telah diproses.'), 'error');
      return false;
    }

    const isOwnCancellation = request.requester_name === currentStaff.name && status === 'Cancelled';
    const isManagerDecision = (
      isOperationsLead(currentStaff.role)
      && request.requester_name !== currentStaff.name
      && (status === 'Approved' || status === 'Rejected')
    );
    if (!isOwnCancellation && !isManagerDecision) {
      triggerToast(tr('你没有权限处理这份申请。', 'You cannot process this request.', 'Anda tidak boleh memproses permohonan ini.'), 'error');
      return false;
    }

    const updatedRequest: ApprovalRequest = {
      ...request,
      status,
      reviewed_by: currentStaff.name,
      reviewed_role: currentStaff.role,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote.slice(0, 2000)
    };

    try {
      await saveStaffLeaveRequestToFirebase(updatedRequest);
      setStaffLeaveRequests((current) => current.map((item) => item.id === requestId ? updatedRequest : item));
      appendAuditLog({
        action: status === 'Cancelled' ? 'CANCEL_STAFF_LEAVE_REQUEST' : 'REVIEW_STAFF_LEAVE_REQUEST',
        target_type: 'Staff Leave',
        target_id: request.id,
        target_label: request.requester_name,
        changes: [
          { field: 'status', old_value: request.status, new_value: status },
          { field: 'review_note', old_value: '', new_value: updatedRequest.review_note || '' }
        ]
      });
      triggerToast(tr('申请状态已更新。', 'Request status updated.', 'Status permohonan dikemas kini.'));
      return true;
    } catch (error) {
      console.error('Staff leave review save failed.', error);
      triggerToast(
        tr(
          '审批无法保存，请检查网络后再试。',
          'Decision could not be saved. Check the connection and try again.',
          'Keputusan tidak dapat disimpan. Semak sambungan dan cuba lagi.'
        ),
        'error'
      );
      return false;
    }
  };

  // Claim-on-open model (replaces the old deterministic AUTO_ASSIGN_LOAN_ADMIN
  // repair): an unassigned Loan waiting for Admin (admin_owner_name === '') is
  // intentionally left in the shared pool. Firestore/Storage Rules let every
  // Active Admin read the pool, the review notification broadcasts to all
  // Admins, and the first Admin to open/act on it claims ownership via
  // handleClaimUnassignedLoan. Do not auto-pre-assign here — that would hide the
  // task from every Admin except one and re-create the "Admin can't see the
  // Sales-uploaded IC" bug.

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

  const isApplicationOwnedByCurrentStaff = useCallback((application: LoanApplication) => (
    isOperationsLead(currentStaff.role) ||
    application.handler_name === currentStaff.name ||
    (
      currentStaff.role === 'Admin' &&
      application.admin_owner_name === currentStaff.name
    ) ||
    (
      // Unassigned Admin-review pool: a Loan waiting for Admin with no assigned
      // Admin owner is visible and claimable by every Active Admin (matches the
      // Firestore/Storage unassigned-pool Rules), until one Admin claims it.
      currentStaff.role === 'Admin' &&
      (application.admin_owner_name || '') === '' &&
      getLoanPendingWith(application) === 'Admin'
    )
  ), [currentStaff.name, currentStaff.role]);

  const visibleApplications = useMemo(() => {
    if (showAllApplications) {
      return applications;
    }

    return applications.filter(isApplicationOwnedByCurrentStaff);
  }, [applications, isApplicationOwnedByCurrentStaff, showAllApplications]);

  const visibleCalendarRawCustomerLeads = staffVisibleRawCustomerLeads;

  const calendarApplications = useMemo(() => {
    if (isOperationsLead(currentStaff.role)) {
      return applications;
    }

    return applications.filter(isApplicationOwnedByCurrentStaff);
  }, [applications, currentStaff.role, isApplicationOwnedByCurrentStaff]);

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
  const monthlyAttendanceExportRows = useMemo(() => buildMonthlyAttendanceExportRows(
    roleAccounts,
    attendanceEvents,
    attendancePolicy,
    attendanceSchedules,
    staffLeaveRequests
  ), [attendanceEvents, attendancePolicy, attendanceSchedules, roleAccounts, staffLeaveRequests]);
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

  const currentRoleAccount = useMemo(() => {
    const byExactName = roleAccounts.find((account) => account.name === currentStaff.name);

    if (byExactName) {
      return byExactName;
    }

    return availableLoginAccounts.find((account) => account.name === currentStaff.name);
  }, [availableLoginAccounts, currentStaff.name, roleAccounts]);

  const defaultAvatarUsage = useMemo(() => {
    const usage: Record<string, string> = {};

    defaultAvatarLibrary.forEach((avatar) => {
      const assignedAccount = roleAccounts.find((account) => (
        account.default_avatar_id === avatar.id ||
        (!account.default_avatar_id && account.avatar_data_url === avatar.avatar_data_url)
      ));

      if (assignedAccount) {
        usage[avatar.id] = assignedAccount.id;
      }
    });

    return usage;
  }, [defaultAvatarLibrary, roleAccounts]);

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
      const claimedApplication = await claimUnassignedAdminApplicationFromFirebase(app, currentStaff.name);
      const updated = applications.map((application) => (
        application.id === app.id ? claimedApplication : application
      ));

      setApplications(updated);
      writeLocalDashboardValue('applications', updated);
      setSelectedApplication((current) => (
        current && current.id === app.id ? claimedApplication : current
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

  const handleOpenNotificationTarget = (notification: NotificationItem) => {
    handleMarkNotificationRead(notification.id);
    setIsNotificationCenterOpen(false);

    if (notification.target_type === 'mission') {
      setActivePage('tools');
      setActiveToolsView('missions');
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
    const previous = applications.find((app) => app.id === id);

    if (!previous) {
      triggerToast(tr('找不到这份贷款申请', 'Loan application not found', "Permohonan pinjaman tidak ditemui"), 'error');
      return false;
    }

    const now = new Date().toISOString();
    const canManageBankWorkflow = currentStaff.role === 'Admin' || currentStaff.role === 'Super Admin';
    const canHandleSalesAction = currentStaff.role === 'Super Admin' || previous.handler_name === currentStaff.name;
    const isCashPurchase = previous.purchase_method === 'Cash';
    const canEditApplicationInformation = canEditLoanApplicationInformation(previous);
    const canManageApplicationDocuments = canManageBankWorkflow || previous.handler_name === currentStaff.name;
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

    const stageWorkflowUndo = (action: Exclude<LoanWorkflowAction, 'SUBMIT_TO_BANK' | 'UNDO_LAST_ACTION'>) => {
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
      adminOwnerName = currentStaff.name;
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
      adminOwnerName = currentStaff.name;
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
      adminOwnerName = currentStaff.name;
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
    }

    let changedBank = workflowAction
      ? undefined
      : [...nextBankApplications].reverse().find((bank) => {
        const oldBank = previous.bank_applications?.find((item) => item.id === bank.id);
        return oldBank ? oldBank.status !== bank.status : bank.status !== 'Draft';
      });

    if (changedBank && canManageBankWorkflow) {
      nextWorkflowUndo = undefined;
      adminOwnerName = currentStaff.name;
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
      const commissionQuote = getDealCommissionQuote(listedPrice, commissionRules);
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
        commission_percent: existing ? existing.commission_percent : commissionQuote.percent,
        commission_amount: existing
          ? normalizeMoneyAmount(existing.commission_amount)
          : normalizeMoneyAmount(commissionQuote.amount),
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
    const shouldCancelFinance = financeNeedsCancel && currentStaff.role === 'Super Admin';
    if (financeNeedsCancel && !shouldCancelFinance) {
      triggerToast(tr(
        '这单已有财务记录，状态已更新，但佣金与库存要 Super Admin 在 Finance Center 冲销。',
        'This deal has a finance record. The status was updated, but Super Admin must reverse the commission and release the stock unit in Finance Center.',
        "Urus niaga ini mempunyai rekod kewangan. Status dikemas kini, tetapi Pentadbir Super perlu membalikkan komisen dan melepaskan unit stok di Pusat Kewangan."
      ));
    }
    const updated: LoanApplication[] = applications.map((app): LoanApplication => {
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
            submitted_at: canManageBankWorkflow ? updatedApplicationInfo.submitted_at || app.submitted_at : app.submitted_at,
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
          ...editableApplicationInfo,
          admin_owner_name: adminOwnerName,
          pending_with: pendingWith,
          pending_action: pendingAction,
          pending_since: pendingSince,
          action_due_at: actionDueAt,
          active_bank_application_id: activeBankApplicationId,
          status: nextStatus,
          remarks: nextRemarks,
          error_code: nextErrorCodes[0] || '',
          error_codes: nextErrorCodes,
          document_checklist: nextDocumentChecklist,
          payslip_documents: nextPayslipDocuments,
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
          await saveDealFinanceWithStockReservationToFirebase(updatedApplication, releasedStockUnitId, currentStaff.name);
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

    const applicationSaved = await updateApplicationsState(updated);
    if (!applicationSaved) {
      // Do not leave an optimistic bank decision or write a ghost audit entry
      // when Firebase rejected the customer document. Restore the last known
      // application state; the persistence hook has already shown the error.
      setApplications(applications);
      applicationsRef.current = applications;
      writeLocalDashboardValue('applications', applications);
      if (selectedApplication?.id === id) {
        setSelectedApplication(previous);
      }
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
        stateOverrides: { applications: updated, vehicleCatalog: terminalVehicleCatalog }
      });
    }

    if (selectedApplication?.id === id) {
      setSelectedApplication(updated.find((app) => app.id === id) || null);
    }
    
    // Find name to include in toast
    const affected = updatedApplication;
    const clientName = affected ? affected.applicant_name.split(' ')[0] : tr('客户', 'Customer', "Pelanggan");
    triggerToast(tr(`申请单 ${id} (${clientName}) 已更新为 [${nextStatus}]`, `Application ${id} (${clientName}) updated to [${nextStatus}]`, `Permohonan ${id} (${clientName}) dikemas kini kepada [${nextStatus}]`));
    return true;
  };

  const handleCompleteCashAcceptanceFromTaskInbox = async (application: LoanApplication) => (
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
      'COMPLETE_APPROVED_CONTACT'
    )
  );

  // Inline edits from the table are saved immediately without opening the drawer
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
    const previous = applications.find((app) => app.id === id);
    if (!previous) {
      return;
    }

    const requestedHandler = String(updates.handler_name || '').trim();
    const selectedHandlerAccount = requestedHandler
      ? roleAccounts.find((account) => account.status === 'Active' && account.name === requestedHandler)
      : undefined;
    const canChangeAnyHandler = currentStaff.role === 'Super Admin';
    const canAssignSeoHandler = (
      isOperationsLead(currentStaff.role)
      && previous.handler_name === 'SEO'
      && previous.customer_intake_tracking?.submitted_from === 'seo_website'
    );
    const isAssignedHandler = previous.handler_name === currentStaff.name;
    const { handler_name: _requestedHandlerName, handler_role: _requestedHandlerRole, ...nonHandlerUpdates } = updates;
    const allowedUpdates: typeof nonHandlerUpdates = canChangeAnyHandler
      ? nonHandlerUpdates
      : isAssignedHandler && typeof nonHandlerUpdates.remarks === 'string'
        ? { remarks: nonHandlerUpdates.remarks }
        : {};
    const safeUpdates = requestedHandler && selectedHandlerAccount && (
      canChangeAnyHandler || (canAssignSeoHandler && selectedHandlerAccount.role === 'Sales')
    )
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

    const updated: LoanApplication[] = applications.map((app): LoanApplication => {
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
        await saveDealFinanceWithStockReservationToFirebase(updatedApplication, releasedStockUnitId, currentStaff.name);
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

    updateApplicationsState(updated);
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
      stateOverrides: { applications: updated, vehicleCatalog: inlineVehicleCatalog }
    });

    if (selectedApplication?.id === id) {
      const updatedSelected = updated.find((app) => app.id === id) || null;
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
      remarks: 'New customer application created from customer list.',
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

  const updateIntakeDraft = (field: keyof CustomerIntakeDraft, value: string) => {
    setIntakeSubmitError('');
    setIntakeDraft((current) => {
      if (field !== 'purchase_method') {
        return { ...current, [field]: value };
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
          housing_status: '',
          years_at_residence: '',
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
    if (intakeSubmitting) {
      return;
    }

    const applicantName = intakeDraft.applicant_name.trim();
    const phoneNo = formatMalaysiaPhoneNumber(intakeDraft.phone_no);
    const icNo = formatMalaysiaIcNumber(intakeDraft.ic_no);
    const vehicleModel = intakeDraft.vehicle_model.trim();
    const purchaseMethod = intakeDraft.purchase_method;
    const isCashPurchase = purchaseMethod === 'Cash';

    if (getCustomerIntakeValidationIssues(intakeDraft).length > 0) {
      return;
    }

    const submittedAt = new Date().toISOString();
    const id = createPublicApplicationId();
    const tracking = createCustomerIntakeTracking();
    const isSeoIntake = tracking.submitted_from === 'seo_website';
    const isSalaryPaidByBank = !isCashPurchase && intakeDraft.salary_payment_method === 'Bank';
    const handlerName = isSeoIntake ? 'SEO' : tracking.sales_name || customerIntakeParams.get('handler') || 'Unassigned';
    const matchedHandler = roleAccounts.find((account) => account.name === handlerName);
    const handlerRole = normalizePublicIntakeRole(matchedHandler?.role || tracking.sales_role || customerIntakeParams.get('role'));
    const detectedVehicle = detectVehicleFromModel(vehicleModel);
    const documentOrdinalByKey = new Map<CustomerIntakeDocumentDraft['document_key'], number>();
    const publicDocuments: PayslipDocument[] = documents.map((document) => {
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
      vehicle_condition: intakeDraft.vehicle_condition,
      purchase_method: purchaseMethod,
      vehicle_options: [
        {
          id: `VEH-OPTION-${id}-01`,
          vehicle_model: vehicleModel,
          vehicle_tag: detectedVehicle.vehicle_tag,
          vehicle_brand: detectedVehicle.vehicle_brand,
          vehicle_condition: intakeDraft.vehicle_condition,
          purchase_method: purchaseMethod,
          total_cash_price: isCashPurchase ? intakeDraft.total_cash_price.trim() : '',
          motor_mileage: intakeDraft.vehicle_condition === 'Used'
            ? intakeDraft.motor_mileage.trim()
            : '',
          priority: 1
        }
      ],
      handler_name: handlerName,
      handler_role: handlerRole,
      admin_owner_name: customerIntakeParams.get('admin_owner_name') || '',
      pending_with: 'Handler',
      pending_action: 'Complete Application',
      pending_since: submittedAt,
      action_due_at: '',
      active_bank_application_id: '',
      status: LoanStatus.NEW,
      error_code: '',
      error_codes: [],
      remarks: isSeoIntake
        ? 'SEO website application awaiting Super Admin handler assignment.'
        : 'New customer application submitted for Sales review.',
      submitted_at: submittedAt,
      personal_info: {
        ...createEmptyPersonalInfo(),
        email: intakeDraft.email.trim(),
        full_address: intakeDraft.full_address.trim(),
        resident_address: intakeDraft.resident_address.trim(),
        bank_name: isSalaryPaidByBank ? intakeDraft.bank_name.trim() : '',
        account_number: isSalaryPaidByBank ? intakeDraft.account_number.trim() : '',
        gender: isCashPurchase ? '' : intakeDraft.gender.trim(),
        race: isCashPurchase ? '' : intakeDraft.race.trim(),
        marital_status: isCashPurchase ? '' : intakeDraft.marital_status.trim(),
        housing_status: isCashPurchase ? '' : intakeDraft.housing_status.trim(),
        years_at_residence: isCashPurchase ? '' : intakeDraft.years_at_residence.trim()
      },
      emergency_contacts: normalizeEmergencyContacts(isCashPurchase ? [] : [
        {
          full_name: intakeDraft.emergency_contact_1_full_name.trim(),
          relationship: intakeDraft.emergency_contact_1_relationship.trim(),
          full_address: intakeDraft.emergency_contact_1_full_address.trim(),
          phone_no: formatMalaysiaPhoneNumber(intakeDraft.emergency_contact_1_phone_no)
        },
        {
          full_name: intakeDraft.emergency_contact_2_full_name.trim(),
          relationship: intakeDraft.emergency_contact_2_relationship.trim(),
          full_address: intakeDraft.emergency_contact_2_full_address.trim(),
          phone_no: formatMalaysiaPhoneNumber(intakeDraft.emergency_contact_2_phone_no)
        }
      ]),
      employment_details: isCashPurchase ? createEmptyEmploymentDetails() : {
        ...createEmptyEmploymentDetails(),
        company_name: intakeDraft.company_name.trim(),
        position: intakeDraft.position.trim(),
        years_employed: intakeDraft.years_employed.trim(),
        company_address: intakeDraft.company_address.trim(),
        office_phone_no: intakeDraft.office_phone_no.trim(),
        gross_monthly_salary: intakeDraft.gross_monthly_salary.trim(),
        net_monthly_salary: intakeDraft.net_monthly_salary.trim()
      },
      preferences: {
        ...createEmptyPreferences(),
        available_to_receive_calls: isCashPurchase ? '' : intakeDraft.available_to_receive_calls.trim(),
        salary_payment_method: isCashPurchase ? '' : intakeDraft.salary_payment_method.trim(),
        preferred_motorcycle: vehicleModel,
        loan_tenure: isCashPurchase ? '' : intakeDraft.loan_tenure.trim()
      },
      customer_intake_tracking: tracking,
      customer_call_back_at: '',
      payslip_documents: publicDocuments,
      document_checklist: normalizeDocumentChecklist({
        document_checklist: [],
        payslip_documents: publicDocuments,
        purchase_method: purchaseMethod,
        vehicle_condition: intakeDraft.vehicle_condition
      }),
      bank_applications: []
    };
    const updatedApplications = [newApplication, ...applications];
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
    setApplications(updatedApplications);
    setAuditLogs(nextAuditLogs.slice(0, 1000));

    // Wait for the Firebase create to actually land before telling the customer
    // it succeeded. Previously we showed the success screen + reference id even
    // when the write failed (e.g. anonymous auth/network down), so the lead was
    // silently lost. On failure, keep the form filled and surface an error.
    setIntakeSubmitError('');
    setIntakeSubmitting(true);
    try {
      await submitPublicIntakeToRemote(newApplication, nextAuditLogs[0]);
      setIntakeSubmittedApplicationId(id);
      setIntakeDraft({ ...EMPTY_INTAKE_DRAFT });
    } catch (error) {
      console.warn('Public intake Firebase save failed; keeping the form so the customer can retry.', error);
      setIntakeSubmitError(classifyCustomerIntakeSubmitError(error));
    } finally {
      setIntakeSubmitting(false);
    }
  };

  const handleUpdateVehicleInfoMissionDraft = useCallback((applicationId: string, draft: VehicleInfoMissionDraft) => {
    setMissionDrafts((current) => ({
      ...current,
      [applicationId]: draft
    }));
  }, []);

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

  const handleCreateShortLink = (
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
        const existingUrl = new URL(link.full_url);
        existingUrl.searchParams.delete('ci_link_code');
        existingUrl.searchParams.delete('admin_owner_name');
        return (
          existingUrl.toString() === new URL(fullUrl).toString() &&
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
    const updatedShortLinks = [shortLink, ...customerIntakeShortLinks].slice(0, 500);

    updateCustomerIntakeShortLinksState(updatedShortLinks);
    saveShortLinkToRemote(shortLink).catch((error) => {
      console.warn('Short link Firebase save failed, kept in dashboard state.', error);
    });
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

  const handleAddCustomMission = (mission: Omit<CustomMission, 'id' | 'created_at' | 'created_by'>) => {
    if (currentStaff.role !== 'Super Admin') {
      return;
    }

    const customMission: CustomMission = {
      ...mission,
      id: `MISSION-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      created_by: currentStaff.name
    };
    const next = [customMission, ...customMissions];

    updateCustomMissionsState(next);
    appendAuditLog({
      action: 'Create Custom Mission',
      target_type: 'Custom Mission',
      target_id: customMission.id,
      target_label: customMission.title,
      changes: createAuditChanges({}, customMission as unknown as Record<string, unknown>),
      stateOverrides: { customMissions: next }
    });
    triggerToast(`Mission created: ${customMission.title}`);
  };

  const handleUpdateCustomMission = (id: string, updates: Partial<CustomMission>) => {
    if (currentStaff.role !== 'Super Admin') {
      return;
    }

    const previous = customMissions.find((mission) => mission.id === id);
    if (!previous) {
      return;
    }

    const next = customMissions.map((mission) => (
      mission.id === id ? { ...mission, ...updates } : mission
    ));
    const updated = next.find((mission) => mission.id === id) || previous;

    updateCustomMissionsState(next);
    appendAuditLog({
      action: 'Update Custom Mission',
      target_type: 'Custom Mission',
      target_id: id,
      target_label: updated.title,
      changes: createAuditChanges(previous as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>),
      stateOverrides: { customMissions: next }
    });
    triggerToast(`Mission updated: ${updated.title}`);
  };

  const hasDuplicateActiveRewardTeamMembers = (teams: RewardTeam[]) => {
    const seenMembers = new Set<string>();

    return teams
      .filter((team) => team.status === 'Active')
      .some((team) => team.member_names.some((memberName) => {
        const normalizedName = memberName.trim().toLowerCase();
        if (!normalizedName) {
          return false;
        }

        if (seenMembers.has(normalizedName)) {
          return true;
        }

        seenMembers.add(normalizedName);
        return false;
      }));
  };

  const handleAddRewardTeam = (team: Omit<RewardTeam, 'id' | 'created_at' | 'created_by' | 'updated_at'>) => {
    if (currentStaff.role !== 'Super Admin') {
      return;
    }

    const activeTeamCount = rewardTeams.filter((item) => item.status === 'Active').length;
    if (activeTeamCount >= 2 && team.status === 'Active') {
      triggerToast(tr('最多只能有 2 个活跃战队', 'Maximum of 2 active teams', "Maksimum 2 pasukan aktif"));
      return;
    }

    const rewardTeam: RewardTeam = {
      ...team,
      id: `REWARD-TEAM-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      created_by: currentStaff.name
    };
    const next = [rewardTeam, ...rewardTeams];

    if (hasDuplicateActiveRewardTeamMembers(next)) {
      triggerToast(tr('同一个员工只能加入一个活跃战队', 'A staff member can only join one active team', "Seorang kakitangan hanya boleh menyertai satu pasukan yang aktif"));
      return;
    }

    updateRewardTeamsState(next);
    appendAuditLog({
      action: 'Create Reward Team',
      target_type: 'Reward Team',
      target_id: rewardTeam.id,
      target_label: rewardTeam.name,
      changes: createAuditChanges({}, rewardTeam as unknown as Record<string, unknown>),
      stateOverrides: { rewardTeams: next }
    });
    triggerToast(`Reward team created: ${rewardTeam.name}`);
  };

  const handleUpdateRewardTeam = (id: string, updates: Partial<RewardTeam>) => {
    if (currentStaff.role !== 'Super Admin') {
      return;
    }

    const previous = rewardTeams.find((team) => team.id === id);
    if (!previous) {
      return;
    }

    const next = rewardTeams.map((team) => (
      team.id === id ? { ...team, ...updates, updated_at: new Date().toISOString() } : team
    ));
    const activeTeamCount = next.filter((team) => team.status === 'Active').length;
    if (activeTeamCount > 2) {
      triggerToast(tr('最多只能有 2 个活跃战队', 'Maximum of 2 active teams', "Maksimum 2 pasukan aktif"));
      return;
    }

    if (hasDuplicateActiveRewardTeamMembers(next)) {
      triggerToast(tr('同一个员工只能加入一个活跃战队', 'A staff member can only join one active team', "Seorang kakitangan hanya boleh menyertai satu pasukan yang aktif"));
      return;
    }

    const updated = next.find((team) => team.id === id) || previous;

    updateRewardTeamsState(next);
    appendAuditLog({
      action: 'Update Reward Team',
      target_type: 'Reward Team',
      target_id: id,
      target_label: updated.name,
      changes: createAuditChanges(previous as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>),
      stateOverrides: { rewardTeams: next }
    });
    triggerToast(`Reward team updated: ${updated.name}`);
  };

  const handleDeleteRewardTeam = async (id: string) => {
    if (currentStaff.role !== 'Super Admin') {
      return;
    }

    const previous = rewardTeams.find((team) => team.id === id);
    if (!previous || !await showConfirm({
      eyebrow: tr('奖励团队', 'Reward Team', 'Pasukan Ganjaran'),
      title: tr('删除奖励团队？', 'Delete reward team?', 'Padam pasukan ganjaran?'),
      message: tr(`确认删除「${previous.name}」？`, `Delete reward team "${previous.name}"?`, `Padam pasukan ganjaran "${previous.name}"?`),
      tone: 'danger',
      confirmLabel: tr('删除团队', 'Delete Team', 'Padam Pasukan')
    })) {
      return;
    }

    const next = rewardTeams.filter((team) => team.id !== id);

    updateRewardTeamsState(next);
    appendAuditLog({
      action: 'Delete Reward Team',
      target_type: 'Reward Team',
      target_id: id,
      target_label: previous.name,
      changes: [
        {
          field: 'reward_team',
          old_value: previous.name,
          new_value: 'Deleted'
        }
      ],
      stateOverrides: { rewardTeams: next }
    });
    triggerToast(`Reward team deleted: ${previous.name}`);
  };

  const handleAddApprovalRequest = (
    request: Omit<ApprovalRequest, 'id' | 'status' | 'requester_name' | 'requester_role' | 'submitted_at' | 'reviewed_by' | 'reviewed_role' | 'reviewed_at' | 'review_note'>
  ) => {
    const now = new Date().toISOString();
    const approvalRequest: ApprovalRequest = {
      ...request,
      id: `APPROVAL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

  const handleOpenRawLeadWhatsApp = (lead: RawCustomerLead, target: 'api' | 'web') => {
    const existingOwner = lead.taken_by_staff_name || '';
    const isTakenByOther = Boolean(existingOwner && existingOwner !== currentStaff.name);

    if (isTakenByOther && currentStaff.role === 'Sales') {
      triggerToast(tr(`这个客户已经是 ${existingOwner} 在跟`, `This lead is already assigned to ${existingOwner}`, `Prospek ini telah diberikan kepada ${existingOwner}`));
      return;
    }

    const now = new Date().toISOString();
    const defaultNextFollowUpAt = getDefaultLeadFollowUpIso(leadFollowUpDays);
    const shouldClaimLead = !existingOwner || existingOwner === currentStaff.name;
    const nextLeads = rawCustomerLeads.map((item) => {
      if (item.id !== lead.id) {
        return item;
      }

      return {
        ...item,
        lead_scope: 'Taken Lead' as const,
        taken_by_staff_id: shouldClaimLead ? normalizeVehicleModel(currentStaff.name).replace(/\s+/g, '-') : item.taken_by_staff_id,
        taken_by_staff_name: shouldClaimLead ? currentStaff.name : item.taken_by_staff_name,
        taken_by_staff_role: shouldClaimLead ? currentStaff.role : item.taken_by_staff_role,
        taken_at: item.taken_at || now,
        follow_up_status: item.follow_up_status && item.follow_up_status !== 'New' ? item.follow_up_status : 'Contacted',
        last_follow_up_at: now,
        next_follow_up_at: item.next_follow_up_at || defaultNextFollowUpAt
      };
    });
    const updatedLead = nextLeads.find((item) => item.id === lead.id) || lead;

    updateRawCustomerLeadsState(nextLeads);

    if (!existingOwner) {
      appendAuditLog({
        action: 'TAKE_RAW_CUSTOMER_LEAD',
        target_type: 'Raw Customer',
        target_id: lead.id,
        target_label: lead.name || lead.phone_no || lead.id,
        changes: createAuditChanges({
          lead_scope: 'Public Lead',
          taken_by_staff_name: '--',
          follow_up_status: lead.follow_up_status || 'New'
        }, {
          lead_scope: 'Taken Lead',
          taken_by_staff_name: currentStaff.name,
          follow_up_status: 'Contacted'
        }),
        stateOverrides: { rawCustomerLeads: nextLeads }
      });
    }

    openRawLeadWhatsAppUrl(updatedLead, target);
    triggerToast(tr(`已交给 ${updatedLead.taken_by_staff_name || existingOwner || currentStaff.name} 跟进，正在打开 WhatsApp`, `Assigned to ${updatedLead.taken_by_staff_name || existingOwner || currentStaff.name} — opening WhatsApp`, `Ditugaskan kepada ${updatedLead.taken_by_staff_name || existingOwner || currentStaff.name} — membuka WhatsApp`));
  };

  const releaseRawLeads = (leadIds: string[], reason: 'manual' | 'auto') => {
    if (leadIds.length === 0) {
      return;
    }

    const idSet = new Set(leadIds);
    const now = new Date().toISOString();
    const releasedLeads = rawCustomerLeads.filter((lead) => idSet.has(lead.id));
    const nextLeads = rawCustomerLeads.map((lead) => (
      idSet.has(lead.id)
        ? {
          ...lead,
          lead_scope: 'Public Lead' as const,
          taken_by_staff_id: '',
          taken_by_staff_name: '',
          taken_by_staff_role: '',
          taken_at: '',
          follow_up_status: 'New' as const,
          next_follow_up_at: '',
          released_at: now
        }
        : lead
    ));

    updateRawCustomerLeadsState(nextLeads);
    releasedLeads.forEach((lead) => {
      appendAuditLog({
        action: reason === 'auto' ? 'AUTO_RELEASE_RAW_CUSTOMER_LEAD' : 'RELEASE_RAW_CUSTOMER_LEAD',
        target_type: 'Raw Customer',
        target_id: lead.id,
        target_label: lead.name || lead.phone_no || lead.id,
        changes: createAuditChanges({
          lead_scope: 'Taken Lead',
          taken_by_staff_name: lead.taken_by_staff_name || '--'
        }, {
          lead_scope: 'Public Lead',
          taken_by_staff_name: '--'
        }),
        stateOverrides: { rawCustomerLeads: nextLeads }
      });
    });
  };

  const handleReleaseRawLead = (lead: RawCustomerLead) => {
    const owner = lead.taken_by_staff_name || '';
    const isAdmin = currentStaff.role === 'Super Admin' || currentStaff.role === 'Admin';

    if (!owner) {
      return;
    }

    if (lead.lead_visibility === 'Private') {
      triggerToast(tr('私人名单不会放回未分配名单', 'Private leads cannot be returned to the unassigned pool', "Prospek peribadi tidak boleh dikembalikan ke senarai belum ditugaskan"), 'error');
      return;
    }

    if (!isAdmin && owner !== currentStaff.name) {
      triggerToast(tr(`只有 ${owner} 或 Admin 可以把这个名单放回去`, `Only ${owner} or an Admin can return this lead`, `Hanya ${owner} atau Pentadbir boleh memulangkan prospek ini`));
      return;
    }

    releaseRawLeads([lead.id], 'manual');
    triggerToast(tr(`已放回未分配：${lead.name || lead.phone_no || lead.id}`, `Returned to unassigned leads: ${lead.name || lead.phone_no || lead.id}`, `Dikembalikan kepada prospek yang belum ditetapkan: ${lead.name || lead.phone_no || lead.id}`));
  };

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

  const handleUpdateRawLeadFollowUp = (leadId: string, updates: Partial<RawCustomerLead>) => {
    const previousLead = rawCustomerLeads.find((lead) => lead.id === leadId);
    const hasExplicitNextFollowUp = Object.prototype.hasOwnProperty.call(updates, 'next_follow_up_at');
    const nextLeads = rawCustomerLeads.map((lead) => (
      lead.id === leadId
        ? (() => {
          const updatedLead = {
          ...lead,
          ...updates,
          lead_scope: 'Taken Lead' as const
          };

          return isActiveLead(updatedLead) && !updatedLead.next_follow_up_at && !hasExplicitNextFollowUp
            ? { ...updatedLead, next_follow_up_at: getDefaultLeadFollowUpIso(leadFollowUpDays) }
            : updatedLead;
        })()
        : lead
    ));

    updateRawCustomerLeadsState(nextLeads);
    const updatedLead = nextLeads.find((lead) => lead.id === leadId);
    if (previousLead && updatedLead && previousLead.next_follow_up_at) {
      const now = new Date();
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      const previousDueAt = new Date(previousLead.next_follow_up_at);
      const nextDueAt = updatedLead.next_follow_up_at ? new Date(updatedLead.next_follow_up_at) : null;
      const terminalStatus = ['Submitted Loan', 'Rejected', 'Closed'].includes(updatedLead.follow_up_status || '');
      const wasDue = !Number.isNaN(previousDueAt.getTime()) && previousDueAt.getTime() <= todayEnd.getTime();
      const leavesDueQueue = terminalStatus || !nextDueAt || (
        !Number.isNaN(nextDueAt.getTime()) && nextDueAt.getTime() > todayEnd.getTime()
      );

      if (wasDue && leavesDueQueue) {
        appendAuditLog({
          action: 'COMPLETE_RAW_LEAD_FOLLOW_UP',
          target_type: 'Raw Customer',
          target_id: previousLead.id,
          target_label: previousLead.name || previousLead.phone_no || previousLead.id,
          changes: [
            ...createAuditChanges(
              {
                follow_up_status: previousLead.follow_up_status || 'New',
                next_follow_up_at: previousLead.next_follow_up_at
              },
              {
                follow_up_status: updatedLead.follow_up_status || 'New',
                next_follow_up_at: updatedLead.next_follow_up_at || ''
              }
            ),
            ...createTaskCompletionAuditChanges([{
              category: 'lead',
              task_type: 'Lead Follow-up',
              due_at: previousLead.next_follow_up_at,
              assigned_at: previousLead.taken_at || previousLead.received_at
            }])
          ],
          stateOverrides: { rawCustomerLeads: nextLeads }
        });
      }
    }
  };

  const prepareRawCustomerLeadsForCurrentStaff = (
    leads: RawCustomerLead[],
    targetPool?: 'public' | 'private'
  ) => {
    const now = new Date().toISOString();
    const staffId = currentRoleAccount?.id || normalizeVehicleModel(currentStaff.name).replace(/\s+/g, '-');
    const staffIdSuffix = staffId.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toUpperCase() || 'STAFF';
    const isPrivateLead = targetPool ? targetPool === 'private' : currentStaff.role === 'Sales';

    return leads.map((lead) => ({
      ...lead,
      id: isPrivateLead && lead.entry_method === 'CSV Import'
        ? `${lead.id}-PRIVATE-${staffIdSuffix}`
        : lead.id,
      lead_visibility: isPrivateLead ? 'Private' as const : 'Public' as const,
      created_by_staff_id: staffId,
      created_by_staff_name: currentStaff.name,
      created_by_staff_role: currentStaff.role,
      lead_scope: isPrivateLead ? 'Taken Lead' as const : 'Public Lead' as const,
      taken_by_staff_id: isPrivateLead ? staffId : '',
      taken_by_staff_name: isPrivateLead ? currentStaff.name : '',
      taken_by_staff_role: isPrivateLead ? currentStaff.role : '',
      taken_at: isPrivateLead ? lead.taken_at || now : '',
      follow_up_status: lead.follow_up_status || 'New'
    }));
  };

  const saveIncomingRawCustomerLeads = (
    leads: RawCustomerLead[],
    entryMethod: 'CSV Import' | 'Manual Entry',
    duplicateFields: Array<'ic_no' | 'phone_no'> = [],
    excludedCount = 0,
    targetPool?: 'public' | 'private'
  ) => {
    const effectivePool = targetPool || (currentStaff.role === 'Sales' ? 'private' : 'public');
    const preparedLeads = prepareRawCustomerLeadsForCurrentStaff(
      leads.map((lead) => ({ ...lead, entry_method: entryMethod })),
      effectivePool
    );
    const beforeCount = rawCustomerLeads.length;
    const nextLeads = normalizeRawCustomerLeads([...rawCustomerLeads, ...preparedLeads]);
    const importedCount = Math.max(nextLeads.length - beforeCount, 0);
    const updatedCount = Math.max(preparedLeads.length - importedCount, 0);

    updateRawCustomerLeadsState(nextLeads);
    appendAuditLog({
      action: entryMethod === 'Manual Entry' ? 'ADD_RAW_CUSTOMER_LEAD' : 'IMPORT_RAW_CUSTOMER_LEADS',
      target_type: 'Raw Customer',
      target_id: entryMethod === 'Manual Entry' ? preparedLeads[0]?.id || 'raw_customer_lead' : 'raw_customer_leads',
      target_label: entryMethod === 'Manual Entry' ? preparedLeads[0]?.name || preparedLeads[0]?.phone_no || 'Raw customer lead' : 'Raw customer leads',
      changes: [
        {
          field: 'raw_customer_leads',
          old_value: `${beforeCount} leads`,
          new_value: `${nextLeads.length} leads (${importedCount} new, ${updatedCount} updated, ${excludedCount} excluded; ${effectivePool === 'private' ? 'Private' : 'Public'})`
        }
      ],
      stateOverrides: { rawCustomerLeads: nextLeads }
    });
    if (entryMethod === 'Manual Entry' && duplicateFields.length > 0) {
      const duplicateLabels = duplicateFields.map((field) => tr(
        field === 'ic_no' ? 'IC' : '电话号码',
        field === 'ic_no' ? 'IC' : 'phone number',
        field === 'ic_no' ? 'IC' : 'nombor telefon'
      ));

      triggerToast(tr(
        `名单已新增，但${duplicateLabels.join('和')}与现有 Lead 或客户重复。请先确认资料再跟进。`,
        `Lead added, but duplicate information was found for the ${duplicateLabels.join(' and ')} in an existing lead or customer. Please verify the details before follow-up.`,
        `Prospek ditambah, tetapi ${duplicateLabels.join(' dan ')} sepadan dengan prospek atau pelanggan sedia ada. Sila sahkan butiran sebelum susulan.`
      ), 'warning');
      return;
    }

    triggerToast(entryMethod === 'Manual Entry'
      ? tr('名单已新增', 'Lead added', "prospek ditambah")
      : excludedCount > 0
        ? tr(
          `名单已导入：${importedCount} 新增 / ${updatedCount} 更新 / ${excludedCount} 已排除`,
          `Leads imported: ${importedCount} new / ${updatedCount} updated / ${excludedCount} excluded`,
          `Prospek diimport: ${importedCount} baharu / ${updatedCount} dikemas kini / ${excludedCount} dikecualikan`
        )
        : tr(`名单已导入：${importedCount} 新增 / ${updatedCount} 更新`, `Leads imported: ${importedCount} new / ${updatedCount} updated`, `prospek yang diimport: ${importedCount} baharu / ${updatedCount} dikemas kini`));
  };

  const handleImportRawCustomerLeads = async (
    leads: RawCustomerLead[],
    targetPool?: 'public' | 'private'
  ) => {
    const [{ loadRawLeadImportExclusions }, { isRawLeadImportExcluded }] = await Promise.all([
      import('./services/relationshipMetaStorage'),
      import('./utils/rawLeadImportExclusions')
    ]);
    const exclusions = await loadRawLeadImportExclusions();
    const acceptedLeads = leads.filter((lead) => !isRawLeadImportExcluded(lead, exclusions));
    saveIncomingRawCustomerLeads(
      acceptedLeads,
      'CSV Import',
      [],
      leads.length - acceptedLeads.length,
      targetPool
    );
  };

  const handleAssignPrivateRawLeads = (leads: RawCustomerLead[], assignedStaffId: string) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以分配私人名单。', 'Only Super Admin can assign private leads.', 'Hanya Super Admin boleh memberikan prospek peribadi.'), 'error');
      return 0;
    }

    const assignedAccount = roleAccounts.find((account) => (
      account.id === assignedStaffId &&
      account.status === 'Active' &&
      account.role !== 'Super Admin'
    ));
    if (!assignedAccount) {
      triggerToast(tr('请选择一个 Active Admin 或 Sales。', 'Choose an active Admin or Sales account.', 'Pilih akaun Admin atau Sales yang aktif.'), 'error');
      return 0;
    }

    const currentLeadIds = new Set(rawCustomerLeads.map((lead) => lead.id));
    const assignableLeads = leads.filter((lead) => (
      currentLeadIds.has(lead.id) &&
      lead.lead_visibility === 'Private' &&
      lead.taken_by_staff_name !== assignedAccount.name
    ));
    if (assignableLeads.length === 0) {
      triggerToast(tr('没有可分配的私人名单。', 'No private leads are available to assign.', 'Tiada prospek peribadi untuk diberikan.'), 'error');
      return 0;
    }

    const assignedLeadIds = new Set(assignableLeads.map((lead) => lead.id));
    const assignedAt = new Date().toISOString();
    const nextLeads = normalizeRawCustomerLeads(rawCustomerLeads.map((lead) => (
      assignedLeadIds.has(lead.id)
        ? {
          ...lead,
          lead_scope: 'Taken Lead' as const,
          taken_by_staff_id: assignedAccount.id,
          taken_by_staff_name: assignedAccount.name,
          taken_by_staff_role: assignedAccount.role,
          taken_at: assignedAt
        }
        : lead
    )));
    const assignmentAuditEntries: AuditLogEntry[] = assignableLeads.map((lead, index) => ({
      id: `AUDIT-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      action: 'ASSIGN_PRIVATE_RAW_CUSTOMER_LEAD',
      target_type: 'Raw Customer',
      target_id: lead.id,
      target_label: lead.name || lead.phone_no || lead.lead_id || 'Raw customer lead',
      changes: createAuditChanges({
        taken_by_staff_id: lead.taken_by_staff_id || '',
        taken_by_staff_name: lead.taken_by_staff_name || '',
        taken_by_staff_role: lead.taken_by_staff_role || ''
      }, {
        taken_by_staff_id: assignedAccount.id,
        taken_by_staff_name: assignedAccount.name,
        taken_by_staff_role: assignedAccount.role
      }),
      ip_address: clientContext.ip_address,
      user_agent: clientContext.user_agent,
      created_at: assignedAt
    }));

    setRawCustomerLeads(nextLeads);
    writeLocalDashboardValue('rawCustomerLeads', nextLeads);
    updateAuditLogsState([...assignmentAuditEntries, ...auditLogs], { rawCustomerLeads: nextLeads });
    triggerToast(tr(
      `${assignableLeads.length} 个私人名单已分配给 ${assignedAccount.name}。`,
      `${assignableLeads.length} private leads assigned to ${assignedAccount.name}.`,
      `${assignableLeads.length} prospek peribadi diberikan kepada ${assignedAccount.name}.`
    ));
    return assignableLeads.length;
  };

  const handleDeleteRawLeads = (leads: RawCustomerLead[]) => {
    const currentLeadIds = new Set(rawCustomerLeads.map((lead) => lead.id));
    const deletableLeads = leads.filter((lead) => (
      currentLeadIds.has(lead.id)
      && (
        currentStaff.role === 'Super Admin'
        || lead.created_by_staff_name === currentStaff.name
        || lead.taken_by_staff_name === currentStaff.name
      )
    ));
    const deletableIds = new Set(deletableLeads.map((lead) => lead.id));

    if (deletableLeads.length === 0) {
      triggerToast(tr('你只能删除自己创建或负责的名单。', 'You can only delete leads you created or own.', "Anda hanya boleh memadam prospek yang anda cipta atau miliki."), 'error');
      return 0;
    }

    markRawLeadsDeletedForSync(Array.from(deletableIds));
    const nextLeads = normalizeRawCustomerLeads(rawCustomerLeads.filter((item) => !deletableIds.has(item.id)));
    setRawCustomerLeads(nextLeads);
    writeLocalDashboardValue('rawCustomerLeads', nextLeads);
    const deletedAt = new Date().toISOString();
    const deletionAuditEntries: AuditLogEntry[] = deletableLeads.map((lead, index) => ({
        id: `AUDIT-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        staff_name: currentStaff.name,
        staff_role: currentStaff.role,
        action: 'DELETE_RAW_CUSTOMER_LEAD',
        target_type: 'Raw Customer',
        target_id: lead.id,
        target_label: lead.name || lead.phone_no || lead.lead_id || 'Raw customer lead',
        changes: [
          {
            field: 'raw_customer_leads',
            old_value: 'Lead present',
            new_value: 'Deleted'
          }
        ],
        ip_address: clientContext.ip_address,
        user_agent: clientContext.user_agent,
        created_at: deletedAt
      }));
    updateAuditLogsState([...deletionAuditEntries, ...auditLogs], { rawCustomerLeads: nextLeads });
    triggerToast(deletableLeads.length === 1
      ? tr('名单已删除。', 'Lead deleted.', "Prospek dipadam.")
      : tr(
        `${deletableLeads.length} 个名单已删除。`,
        `${deletableLeads.length} leads deleted.`,
        `${deletableLeads.length} prospek dipadam.`
      ));
    return deletableLeads.length;
  };

  const handleDeleteRawLead = (lead: RawCustomerLead) => handleDeleteRawLeads([lead]) > 0;

  const handleAddRawCustomerLead = (lead: RawCustomerLead, targetPool?: 'public' | 'private') => {
    const shouldCheckDuplicates = ['Sales', 'Admin', 'Super Admin'].includes(currentStaff.role);
    const candidateIc = normalizeRiskValue('ic_no', lead.ic_no || '');
    const candidatePhone = normalizeRiskValue('phone_no', lead.phone_no || '');
    const duplicateFields: Array<'ic_no' | 'phone_no'> = [];

    if (shouldCheckDuplicates) {
      const duplicateIc = candidateIc.length === 12 && (
        rawCustomerLeads.some((existingLead) => normalizeRiskValue('ic_no', existingLead.ic_no || '') === candidateIc)
        || applications.some((application) => normalizeRiskValue('ic_no', application.ic_no || '') === candidateIc)
      );
      const duplicatePhone = candidatePhone.length >= 7 && (
        rawCustomerLeads.some((existingLead) => normalizeRiskValue('phone_no', existingLead.phone_no || '') === candidatePhone)
        || applications.some((application) => normalizeRiskValue('phone_no', application.phone_no || '') === candidatePhone)
      );

      if (duplicateIc) {
        duplicateFields.push('ic_no');
      }
      if (duplicatePhone) {
        duplicateFields.push('phone_no');
      }
    }

    saveIncomingRawCustomerLeads([lead], 'Manual Entry', duplicateFields, 0, targetPool);
  };

  // Restore initial mock data helper
  const getPasswordActionErrorMessage = (error: unknown) => {
    const code = error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : '';

    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return tr('当前密码不正确。', 'Current password is incorrect.', 'Kata laluan semasa tidak betul.');
    }
    if (code === 'auth/too-many-requests') {
      return tr('尝试次数过多，请稍后再试。', 'Too many attempts. Try again later.', 'Terlalu banyak percubaan. Cuba lagi kemudian.');
    }
    if (code === 'auth/requires-recent-login') {
      return tr('请重新登录后再试。', 'Sign in again and retry.', 'Log masuk semula dan cuba lagi.');
    }
    if (code === 'auth/weak-password') {
      return tr('新密码强度不足。', 'The new password is too weak.', 'Kata laluan baharu terlalu lemah.');
    }

    return tr('密码验证失败，请重试。', 'Password verification failed. Try again.', 'Pengesahan kata laluan gagal. Cuba lagi.');
  };

  const handleChangeCurrentStaffPassword = async (currentPassword: string, newPassword: string) => {
    if (!isFirebaseConfigured) {
      throw new Error(tr(
        '本机模式不能更新 Firebase 密码。',
        'Firebase password cannot be updated in local mode.',
        'Kata laluan Firebase tidak boleh dikemas kini dalam mod tempatan.'
      ));
    }

    try {
      const { changeCurrentFirebaseStaffPassword } = await import('./lib/auth');
      await changeCurrentFirebaseStaffPassword(currentPassword, newPassword);
    } catch (error) {
      throw new Error(getPasswordActionErrorMessage(error));
    }
  };

  const handleResetData = async () => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以重置数据。', 'Only Super Admin can reset data.', "Hanya Pentadbir Super boleh menetapkan semula data."), 'error');
      return;
    }

    const confirmed = await showConfirm({
      eyebrow: tr('危险操作', 'Dangerous Action', 'Tindakan Berbahaya'),
      title: tr('重置全部营运资料？', 'Reset all operational data?', 'Tetapkan semula semua data operasi?'),
      message: tr(
        '这会重置贷款申请、潜在客户及相关资料，并永久删除所有对应的云端记录。所有设备和员工都会受到影响，而且无法撤销。',
        'This resets applications, leads and related data and permanently deletes all matching cloud records. Every device and staff member is affected, and this cannot be undone.',
        'Ini menetapkan semula permohonan, prospek dan data berkaitan serta memadam semua rekod awan yang sepadan secara kekal. Semua peranti dan kakitangan terjejas dan tindakan ini tidak boleh dibuat asal.'
      ),
      tone: 'danger',
      confirmLabel: tr('重置全部资料', 'Reset Everything', 'Tetapkan Semula Semuanya'),
      testId: 'reset-data-confirm-dialog'
    });
    if (!confirmed) return;

    const password = await showPasswordPrompt({
      eyebrow: tr('Super Admin 验证', 'Super Admin Verification', 'Pengesahan Pentadbir Super'),
      title: tr('输入密码再次确认', 'Enter password to confirm again', 'Masukkan kata laluan untuk mengesahkan sekali lagi'),
      message: tr(
        '最后一步：请输入当前已登录 Super Admin 的 Firebase 登录密码。验证成功后会立即执行重置。',
        'Final step: enter the Firebase login password for the currently signed-in Super Admin. The reset runs immediately after verification.',
        'Langkah terakhir: masukkan kata laluan log masuk Firebase untuk Pentadbir Super yang sedang log masuk. Tetapan semula berjalan serta-merta selepas pengesahan.'
      ),
      tone: 'danger',
      confirmLabel: tr('验证并重置资料', 'Verify & Reset Data', 'Sahkan & Tetapkan Semula Data'),
      inputLabel: tr('Super Admin 当前密码', 'Current Super Admin Password', 'Kata Laluan Semasa Pentadbir Super'),
      inputPlaceholder: tr('输入密码以继续', 'Enter password to continue', 'Masukkan kata laluan untuk meneruskan'),
      testId: 'reset-data-password-dialog'
    });
    if (password === null) return;

    if (isFirebaseConfigured) {
        let token = '';
        try {
          const { getCurrentFirebaseIdToken, reauthenticateCurrentFirebaseStaff } = await import('./lib/auth');
          await reauthenticateCurrentFirebaseStaff(password);
          token = await getCurrentFirebaseIdToken(true);
        } catch (error) {
          triggerToast(getPasswordActionErrorMessage(error), 'error');
          return;
        }

        try {
          const response = await fetch('/api/admin/reset-operational-data', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => ({})) as { error?: string };
            throw new Error(payload.error || 'Operational data reset failed.');
          }

          clearSensitiveDashboardLocalCache();
          requestFirestoreCacheClearOnReload();
          window.location.replace(`/?reset=${Date.now()}`);
          return;
        } catch (error) {
          console.error('Operational data reset failed after recent authentication.', error instanceof Error ? error.name : 'UnknownError');
          triggerToast(tr(
            '云端数据重置失败，未执行本机回填。',
            'Cloud data reset failed; local data was not reapplied.',
            'Tetapan semula data awan gagal; data tempatan tidak digunakan semula.'
          ), 'error');
          return;
        }
    }

    const { verifyPassword } = await import('./lib/password');
      const passwordMatches = Boolean(currentRoleAccount?.password_hash) && await verifyPassword(
        password,
        currentRoleAccount?.password_hash || ''
      );
      if (!passwordMatches) {
        triggerToast(tr('当前密码不正确。', 'Current password is incorrect.', 'Kata laluan semasa tidak betul.'), 'error');
        return;
      }

      const initialLoanApplications = await loadInitialLoanApplications();
      const initialRawCustomerLeads = await loadInitialRawCustomerLeads();
      markRawLeadsDeletedForSync(rawCustomerLeads.map((lead) => lead.id));
      updateApplicationsState(initialLoanApplications);
      updateRawCustomerLeadsState(initialRawCustomerLeads);
      updateErrorCodeDefinitionsState(INITIAL_ERROR_CODE_DEFINITIONS);
      // Firebase Auth mappings are production identity data, not demo data.
      // Reset operational content without replacing the active staff directory.
      updateDefaultAvatarLibraryState([]);
      updateWhatsAppTrackingLinksState(INITIAL_WHATSAPP_TRACKING_LINKS);
      updateWhatsAppTrackingClicksState(INITIAL_WHATSAPP_TRACKING_CLICKS);
      updateWhatsAppDefaultMessageState(DEFAULT_WHATSAPP_DEFAULT_MESSAGE);
      updateCustomerIntakeShortLinksState([]);
      updateCustomMissionsState([]);
      updateRewardTeamsState([]);
      updateApprovalRequestsState([]);
      updateCalendarNotesState([]);
      setAttendanceEvents([]);
      setAttendanceIncidentResolutions([]);
      setAttendanceSchedules([]);
      setStaffLeaveRequests([]);
      updateNotificationsState([]);
      updateVehicleTagsState(DEFAULT_VEHICLE_TAGS);
      updateVehicleBrandTagsState(DEFAULT_VEHICLE_BRAND_TAGS);
      updateFinanceProfilesState(FINANCE_PROFILES);
      updateVehicleCatalogState(INITIAL_VEHICLE_CATALOG);
      updateChannelMarketingSpendState([]);
      updateBankDefinitionsState(DEFAULT_BANK_DEFINITIONS);
      updateMarketingTagRelationshipsState(DEFAULT_MARKETING_TAG_RELATIONSHIPS);
      updateTagNormalizationRulesState(DEFAULT_TAG_NORMALIZATION_RULES);
      updateRolePermissionsState(buildDefaultRolePermissionSettings());
      updateRoleNavAccessState(buildDefaultRoleNavAccessSettings());
      updateVehicleCategoriesState(buildDefaultVehicleCategories());
      setVehicleBrandLogos({});
      writeLocalDashboardValue('vehicleBrandLogos', {});
      appendAuditLog({
        action: 'RESET_DEMO_DATA',
        target_type: 'Dashboard',
        target_id: 'dr_racing_dashboard',
        target_label: 'Dashboard data',
        changes: [
          {
            field: 'data',
            old_value: 'Current local/Firebase data',
            new_value: 'Initial demo data'
          }
        ],
        stateOverrides: {
          applications: initialLoanApplications,
          rawCustomerLeads: initialRawCustomerLeads,
          errorCodeDefinitions: INITIAL_ERROR_CODE_DEFINITIONS,
          roleAccounts,
          rolePermissions: buildDefaultRolePermissionSettings(),
          roleNavAccess: buildDefaultRoleNavAccessSettings(),
          vehicleCategories: buildDefaultVehicleCategories(),
          vehicleBrandLogos: {},
          defaultAvatarLibrary: [],
          whatsAppTrackingLinks: INITIAL_WHATSAPP_TRACKING_LINKS,
          whatsAppTrackingClicks: INITIAL_WHATSAPP_TRACKING_CLICKS,
          whatsAppDefaultMessage: DEFAULT_WHATSAPP_DEFAULT_MESSAGE,
          customerIntakeShortLinks: [],
          customMissions: [],
          rewardTeams: [],
          approvalRequests: [],
          calendarNotes: [],
          notifications: [],
          vehicleTags: DEFAULT_VEHICLE_TAGS,
          vehicleBrandTags: DEFAULT_VEHICLE_BRAND_TAGS,
          financeProfiles: FINANCE_PROFILES,
          commissionRules: DEFAULT_COMMISSION_RULES,
          channelMarketingSpend: [],
          vehicleCatalog: INITIAL_VEHICLE_CATALOG,
          bankDefinitions: DEFAULT_BANK_DEFINITIONS,
          marketingTagRelationships: DEFAULT_MARKETING_TAG_RELATIONSHIPS,
          tagNormalizationRules: DEFAULT_TAG_NORMALIZATION_RULES
        }
      });
      setSelectedApplication(null);
      setIsDrawerOpen(false);
    triggerToast(tr('数据已成功重置回初始模版状态', 'Data reset to the initial template', "Tetapkan semula data kepada templat awal"));
  };

  const handleAddErrorCodeDefinition = (definition: ErrorCodeDefinition) => {
    const code = normalizeRejectCode(definition.code);
    if (!code) {
      triggerToast(tr('拒贷 CODE 必须是 8 位数字', 'Reject CODE must be an 8-digit number', "Tolak CODE mestilah nombor 8 digit"));
      return;
    }
    const existing = errorCodeDefinitions.some((item) => item.code === code);
    const next = existing
      ? errorCodeDefinitions.map((item) => item.code === code ? { ...definition, code } : item)
      : [...errorCodeDefinitions, { ...definition, code }];

    updateErrorCodeDefinitionsState(next);
    appendAuditLog({
      action: existing ? 'UPDATE_CODE_ISSUE' : 'ADD_CODE_ISSUE',
      target_type: 'CODE Issue',
      target_id: code,
      target_label: code,
      changes: createAuditChanges(
        existing ? errorCodeDefinitions.find((item) => item.code === code) || {} : {},
        { ...definition, code }
      ),
      stateOverrides: { errorCodeDefinitions: next }
    });
    triggerToast(tr(`CODE ${code} 已保存`, `CODE ${code} saved`, `KOD ${code} disimpan`));
  };

  const handleUpdateErrorCodeDefinition = (code: string, updates: Partial<ErrorCodeDefinition>) => {
    const previous = errorCodeDefinitions.find((item) => item.code === code);
    const next = errorCodeDefinitions.map((item) => (
      item.code === code
        ? { ...item, ...updates, code }
        : item
    ));

    updateErrorCodeDefinitionsState(next);

    if (previous) {
      appendAuditLog({
        action: 'UPDATE_CODE_ISSUE',
        target_type: 'CODE Issue',
        target_id: code,
        target_label: code,
        changes: createAuditChanges(previous, { ...previous, ...updates, code }),
        stateOverrides: { errorCodeDefinitions: next }
      });
    }
  };

  const handleDeleteErrorCodeDefinition = async (code: string) => {
    const target = errorCodeDefinitions.find((item) => item.code === code);

    if (await showConfirm({
      eyebrow: tr('拒绝原因代码', 'Reject Reason Code', 'Kod Sebab Penolakan'),
      title: tr(`删除 CODE ${code}？`, `Delete CODE ${code}?`, `Padam KOD ${code}?`),
      message: tr('删除后不能自动恢复。', 'This record cannot be restored automatically.', 'Rekod ini tidak boleh dipulihkan secara automatik.'),
      tone: 'danger',
      confirmLabel: tr('删除 CODE', 'Delete CODE', 'Padam KOD')
    })) {
      updateErrorCodeDefinitionsState(errorCodeDefinitions.filter((item) => item.code !== code));
      appendAuditLog({
        action: 'DELETE_CODE_ISSUE',
        target_type: 'CODE Issue',
        target_id: code,
        target_label: code,
        changes: [
          {
            field: 'record',
            old_value: target ? `${target.issue} / ${target.customer_request}` : code,
            new_value: 'Deleted'
          }
        ],
        stateOverrides: { errorCodeDefinitions: errorCodeDefinitions.filter((item) => item.code !== code) }
      });
      triggerToast(tr(`CODE ${code} 已删除`, `CODE ${code} deleted`, `KOD ${code} dipadamkan`));
    }
  };

  const handleUpdateRolePermissions = (nextPermissions: RolePermissionSetting[]) => {
    const normalizedNext = normalizeRolePermissionSettings(nextPermissions);
    const currentByKey = new Map(
      normalizeRolePermissionSettings(rolePermissions).map((permission) => [
        `${permission.role}:${permission.page_id}:${permission.section_id}`,
        permission
      ])
    );
    const changes = normalizedNext
      .filter((permission) => {
        const previous = currentByKey.get(`${permission.role}:${permission.page_id}:${permission.section_id}`);
        return !previous || previous.enabled !== permission.enabled;
      })
      .map((permission) => ({
        field: `${permission.role} / ${permission.page_id} / ${permission.section_id}`,
        old_value: currentByKey.get(`${permission.role}:${permission.page_id}:${permission.section_id}`)?.enabled ? 'Allow' : 'Off',
        new_value: permission.enabled ? 'Allow' : 'Off'
      }));

    updateRolePermissionsState(normalizedNext);

    if (changes.length > 0) {
      appendAuditLog({
        action: 'UPDATE_ROLE_PERMISSIONS',
        target_type: 'Role Permissions',
        target_id: 'role_permissions',
        target_label: tr('权限设定', 'Permission Matrix', "Matriks Kebenaran"),
        changes,
        stateOverrides: { rolePermissions: normalizedNext }
      });
    }
  };

  const updateVehicleCategoriesState = (updatedList: VehicleCategory[]) => {
    const normalized = normalizeVehicleCategories(updatedList);

    setVehicleCategories(normalized);
    writeLocalDashboardValue('vehicleCategories', normalized);
    return persistDashboardState({ vehicleCategories: normalized });
  };

  const handleUpdateVehicleCategories = (nextCategories: VehicleCategory[]) => {
    const normalizedNext = normalizeVehicleCategories(nextCategories);

    updateVehicleCategoriesState(normalizedNext);

    appendAuditLog({
      action: 'UPDATE_VEHICLE_CATEGORIES',
      target_type: 'Vehicle Category',
      target_id: 'vehicle_categories',
      target_label: tr('车辆类别与利率', 'Vehicle Categories', "Kategori Kenderaan"),
      changes: [{
        field: 'vehicle_categories',
        old_value: `${vehicleCategories.length} categories`,
        new_value: `${normalizedNext.length} categories`
      }],
      stateOverrides: { vehicleCategories: normalizedNext }
    });
  };

  const handleUpdateVehicleBrandLogo = (brand: string, dataUrl: string) => {
    const nextLogos = normalizeVehicleBrandLogos(assignVehicleBrandLogo(vehicleBrandLogos, brand, dataUrl));

    setVehicleBrandLogos(nextLogos);
    writeLocalDashboardValue('vehicleBrandLogos', nextLogos);
    void persistDashboardState({ vehicleBrandLogos: nextLogos });

    appendAuditLog({
      action: 'UPDATE_VEHICLE_BRAND_LOGO',
      target_type: 'Vehicle Brand',
      target_id: brand,
      target_label: tr('品牌 Logo', 'Brand Logo', "Logo Jenama"),
      changes: [{ field: 'brand_logo', old_value: brand, new_value: dataUrl ? tr('已更新', 'updated', "dikemas kini") : tr('已移除', 'removed', "dikeluarkan") }],
      stateOverrides: { vehicleBrandLogos: nextLogos }
    });
  };

  // Self-heal: older brand logos were stored as base64 data URLs directly in the
  // dashboard_state doc, which can push it past Firestore's 1MB limit and make
  // every save fail. Migrate any remaining data: URLs into Firebase Storage and
  // replace them with the short download URL so the document shrinks.
  const brandLogoMigrationRef = useRef(false);
  useEffect(() => {
    if (brandLogoMigrationRef.current) {
      return;
    }
    const pending = Object.entries(vehicleBrandLogos).filter(
      ([, value]) => typeof value === 'string' && value.startsWith('data:')
    );
    if (pending.length === 0) {
      return;
    }
    brandLogoMigrationRef.current = true;
    void (async () => {
      const next: Record<string, string> = { ...vehicleBrandLogos };
      let changed = false;
      for (const [brand, dataUrl] of pending) {
        try {
          const url = await uploadBrandLogoToStorage(brand, String(dataUrl));
          if (url) {
            next[brand] = url;
            changed = true;
          }
        } catch (error) {
          console.warn('Brand logo migration failed for', brand, error);
        }
      }
      if (changed) {
        const normalized = normalizeVehicleBrandLogos(next);
        setVehicleBrandLogos(normalized);
        writeLocalDashboardValue('vehicleBrandLogos', normalized);
        void persistDashboardState({ vehicleBrandLogos: normalized });
      }
      brandLogoMigrationRef.current = false;
    })();
  }, [vehicleBrandLogos]);

  // Bank icons originally lived as base64 inside the already-large shared
  // dashboard document. Move legacy icon bytes to the existing protected
  // configuration-image Storage path and keep only short download URLs.
  const bankIconMigrationRef = useRef(false);
  useEffect(() => {
    if (currentStaff.role !== 'Super Admin' || bankIconMigrationRef.current) {
      return;
    }

    const pending = bankDefinitions.filter((bank) => bank.icon_data_url.startsWith('data:'));
    if (pending.length === 0) {
      return;
    }
    const pendingDataUrls = new Map(pending.map((bank) => [bank.id, bank.icon_data_url]));

    bankIconMigrationRef.current = true;
    void (async () => {
      const migratedUrls = new Map<string, string>();
      for (const bank of pending) {
        try {
          const url = await uploadBankIconToStorage(bank.id, bank.icon_data_url);
          if (url && !url.startsWith('data:')) {
            migratedUrls.set(bank.id, url);
          }
        } catch (error) {
          console.warn('Bank icon migration failed for', bank.id, error);
        }
      }

      if (migratedUrls.size > 0) {
        const currentBanks = bankDefinitionsRef.current;
        const migratedBanks = normalizeBankDefinitions(currentBanks.map((bank) => ({
          ...bank,
          icon_data_url: pendingDataUrls.get(bank.id) === bank.icon_data_url
            ? migratedUrls.get(bank.id) || bank.icon_data_url
            : bank.icon_data_url
        })));
        const saved = await updateBankDefinitionsState(migratedBanks);
        if (!saved) {
          setBankDefinitions(currentBanks);
          writeLocalDashboardValue('bankDefinitions', currentBanks);
        }
      }
      bankIconMigrationRef.current = false;
    })();
  }, [bankDefinitions, currentStaff.role]);

  const handleUpdateRoleNavAccess = (nextSettings: RoleNavAccessSetting[]) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以修改页面访问权限。', 'Only Super Admin can change page access.', 'Hanya Super Admin boleh mengubah akses halaman.'), 'error');
      return;
    }

    const normalizedNext = normalizeRoleNavAccessSettings(nextSettings);
    const currentByKey = new Map(
      normalizeRoleNavAccessSettings(roleNavAccess).map((setting) => [
        `${setting.role}:${setting.nav_key}`,
        setting
      ])
    );
    const changes = normalizedNext
      .filter((setting) => {
        const previous = currentByKey.get(`${setting.role}:${setting.nav_key}`);
        return !previous || previous.enabled !== setting.enabled;
      })
      .map((setting) => ({
        field: `${setting.role} / ${setting.nav_key}`,
        old_value: currentByKey.get(`${setting.role}:${setting.nav_key}`)?.enabled ? 'Allow' : 'Off',
        new_value: setting.enabled ? 'Allow' : 'Off'
      }));

    updateRoleNavAccessState(normalizedNext);

    if (changes.length > 0) {
      appendAuditLog({
        action: 'UPDATE_ROLE_NAV_ACCESS',
        target_type: 'Role Access',
        target_id: 'role_nav_access',
        target_label: tr('角色访问权限', 'Role Access', "Akses Peranan"),
        changes,
        stateOverrides: { roleNavAccess: normalizedNext }
      });
    }
  };

  const handleCreateFirebaseAuthUser = async (
    account: Pick<RoleAccount, 'id' | 'name' | 'email' | 'role' | 'default_avatar_id'> & { password?: string }
  ) => {
    if (currentStaff.role !== 'Super Admin') {
      throw new Error(tr('只有 Super Admin 可以创建 Firebase Auth 用户。', 'Only Super Admin can create Firebase Auth users.', "Hanya Pentadbir Super boleh membuat pengguna Firebase Auth."));
    }

    const pendingChangesSaved = await waitForDashboardPersistenceIdle();
    if (!pendingChangesSaved) {
      throw new Error(tr(
        '尚有资料未成功同步，请重新载入后再建立账号。',
        'Some changes are not synced. Reload before creating the account.',
        'Sesetengah perubahan belum disegerakkan. Muat semula sebelum membuat akaun.'
      ));
    }

    const { getCurrentFirebaseIdToken } = await import('./lib/auth');
    const token = await getCurrentFirebaseIdToken(true);

    if (!token) {
      throw new Error(tr('请先用 Firebase Auth 的 Super Admin 账号登录。', 'Sign in with a Firebase Auth Super Admin account first.', "Log masuk dengan akaun Pentadbir Super Firebase Auth dahulu."));
    }

    const response = await fetch('/api/admin/staff-auth-users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dashboardAccountId: account.id,
        email: account.email,
        loginIdentifier: formatStaffLoginIdentifier(account.email),
        name: account.name,
        password: account.password || '',
        defaultAvatarId: account.default_avatar_id || '',
        role: account.role
      })
    });

    const payload = await response.json().catch(() => ({})) as {
      created?: boolean;
      dashboardAccountId?: string;
      email?: string;
      error?: string;
      name?: string;
      role?: RoleAccountRole;
      temporaryPassword?: string;
      uid?: string;
    };

    if (!response.ok || !payload.uid) {
      throw new Error(payload.error || tr('Firebase Auth 用户创建失败。', 'Firebase Auth user creation failed.', "Pembuatan pengguna Firebase Auth gagal."));
    }

    reloadDashboard();

    return {
      created: Boolean(payload.created),
      dashboardAccountId: payload.dashboardAccountId || account.id,
      email: payload.email || account.email,
      name: payload.name || account.name,
      role: payload.role || account.role,
      temporaryPassword: payload.temporaryPassword || '',
      uid: payload.uid
    };
  };

  const handleResetFirebaseAuthPassword = async (account: RoleAccount, password: string) => {
    if (currentStaff.role !== 'Super Admin') {
      throw new Error(tr('只有 Super Admin 可以重置 Firebase Auth 密码。', 'Only Super Admin can reset Firebase Auth passwords.', "Hanya Pentadbir Super boleh menetapkan semula kata laluan Firebase Auth."));
    }

    const { getCurrentFirebaseIdToken } = await import('./lib/auth');
    const token = await getCurrentFirebaseIdToken(true);

    if (!token) {
      throw new Error(tr('请先用 Firebase Auth 的 Super Admin 账号登录。', 'Sign in with a Firebase Auth Super Admin account first.', "Log masuk dengan akaun Pentadbir Super Firebase Auth dahulu."));
    }

    const response = await fetch('/api/admin/staff-auth-users/password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: account.firebase_auth_email || account.email,
        password,
        uid: account.firebase_uid || ''
      })
    });

    const payload = await response.json().catch(() => ({})) as {
      email?: string;
      error?: string;
      uid?: string;
    };

    if (!response.ok || !payload.uid) {
      throw new Error(payload.error || tr('Firebase Auth 密码重置失败。', 'Firebase Auth password reset failed.', "Penetapan semula kata laluan Firebase Auth gagal."));
    }

    const accountUpdates: Partial<RoleAccount> = {};

    if (!account.firebase_uid || account.firebase_uid !== payload.uid) {
      accountUpdates.firebase_uid = payload.uid;
    }

    if (payload.email && account.firebase_auth_email !== payload.email) {
      accountUpdates.firebase_auth_email = payload.email;
    }

    if (Object.keys(accountUpdates).length > 0) {
      await handleUpdateRoleAccount(account.id, accountUpdates);
    }

    appendAuditLog({
      action: 'RESET_ROLE_ACCOUNT_PASSWORD',
      target_type: 'Role Account',
      target_id: account.id,
      target_label: account.name,
      changes: [
        {
          field: 'firebase_auth_password',
          old_value: '[hidden]',
          new_value: '[reset]'
        }
      ]
    });

    triggerToast(tr(`已重置 ${account.name} 的 Firebase 密码`, `${account.name}'s Firebase password was reset`, `Kata laluan Firebase ${account.name} telah ditetapkan semula`));
  };

  const syncRoleAccountAuthProfile = async (previous: RoleAccount, next: RoleAccount) => {
    const { getCurrentFirebaseIdToken } = await import('./lib/auth');
    const token = await getCurrentFirebaseIdToken(true);

    if (!token) {
      throw new Error(tr('请先重新登录 Super Admin。', 'Sign in as Super Admin again.', 'Log masuk semula sebagai Super Admin.'));
    }

    const response = await fetch('/api/admin/staff-auth-users', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid: previous.firebase_uid || '',
        currentEmail: previous.firebase_auth_email || previous.email,
        email: next.email,
        name: next.name,
        role: next.role,
        status: next.status,
        dashboardAccountId: next.id
      })
    });
    const payload = await response.json().catch(() => ({})) as { uid?: string; email?: string; error?: string };

    if (!response.ok || !payload.uid) {
      throw new Error(payload.error || tr('Firebase 账号同步失败。', 'Firebase account synchronization failed.', 'Penyegerakan akaun Firebase gagal.'));
    }

    return payload;
  };

  const handleUpdateRoleAccount = async (id: string, updates: Partial<RoleAccount>) => {
    const previous = roleAccounts.find((account) => account.id === id);
    const normalizedUpdates: Partial<RoleAccount> = { ...updates };

    if (
      previous &&
      typeof normalizedUpdates.name === 'string' &&
      roleAccounts.some((account) => account.id !== id && account.name.toLowerCase() === normalizedUpdates.name?.trim().toLowerCase())
    ) {
      triggerToast(tr('员工姓名必须唯一。', 'Staff names must be unique.', 'Nama kakitangan mestilah unik.'), 'error');
      return false;
    }

    if ('avatar_data_url' in updates && !('default_avatar_id' in updates)) {
      normalizedUpdates.default_avatar_id = '';
    }

    if (normalizedUpdates.default_avatar_id) {
      const targetDefaultAvatar = defaultAvatarLibrary.find((avatar) => avatar.id === normalizedUpdates.default_avatar_id);
      const assignedAccount = roleAccounts.find((account) => (
        account.id !== id &&
        (
          account.default_avatar_id === normalizedUpdates.default_avatar_id ||
          Boolean(targetDefaultAvatar && !account.default_avatar_id && account.avatar_data_url === targetDefaultAvatar.avatar_data_url)
        )
      ));

      if (assignedAccount) {
        triggerToast(tr(`默认头像已被 ${assignedAccount.name} 使用`, `Default avatar already used by ${assignedAccount.name}`, `Avatar lalai sudah digunakan oleh ${assignedAccount.name}`));
        return false;
      }
    }

    if (previous && currentStaff.role === 'Super Admin') {
      const nextAccount = { ...previous, ...normalizedUpdates };
      const authBoundaryChanged = (
        nextAccount.name !== previous.name ||
        nextAccount.email !== previous.email ||
        nextAccount.role !== previous.role ||
        nextAccount.status !== previous.status
      );

      if (authBoundaryChanged) {
        try {
          const synced = await syncRoleAccountAuthProfile(previous, nextAccount);
          normalizedUpdates.firebase_uid = synced.uid || previous.firebase_uid;
          normalizedUpdates.firebase_auth_email = synced.email || nextAccount.email;
        } catch (error) {
          const message = error instanceof Error ? error.message : tr('Firebase 账号同步失败。', 'Firebase account synchronization failed.', 'Penyegerakan akaun Firebase gagal.');
          triggerToast(message, 'error');
          return false;
        }
      }
    }

    const next = roleAccounts.map((account) => (
      account.id === id
        ? { ...account, ...normalizedUpdates }
        : account
    ));
    const nextName = typeof normalizedUpdates.name === 'string' ? normalizedUpdates.name.trim() : previous?.name;
    const renamed = Boolean(previous && nextName && nextName !== previous.name);
    const migratedApplications = renamed && previous
      ? applications.map((application) => ({
        ...application,
        handler_name: application.handler_name === previous.name ? nextName : application.handler_name,
        admin_owner_name: application.admin_owner_name === previous.name ? nextName : application.admin_owner_name
      }))
      : applications;
    const migratedRawLeads = renamed && previous
      ? rawCustomerLeads.map((lead) => ({
        ...lead,
        created_by_staff_name: lead.created_by_staff_name === previous.name ? nextName : lead.created_by_staff_name,
        taken_by_staff_name: lead.taken_by_staff_name === previous.name ? nextName : lead.taken_by_staff_name
      }))
      : rawCustomerLeads;

    updateRoleAccountsState(next);
    if (renamed) {
      updateApplicationsState(migratedApplications);
      updateRawCustomerLeadsState(migratedRawLeads);
    }

    if (previous) {
      appendAuditLog({
        action: 'UPDATE_ROLE_ACCOUNT',
        target_type: 'Role Account',
        target_id: id,
        target_label: previous.name,
        changes: createAuditChanges(previous, { ...previous, ...normalizedUpdates }),
        stateOverrides: {
          roleAccounts: next,
          applications: migratedApplications,
          rawCustomerLeads: migratedRawLeads
        }
      });

    }

    return true;
  };

  const handleUpdateCurrentStaffProfile = async (name: string, email: string, currentPassword: string) => {
    if (!isFirebaseConfigured) {
      throw new Error(tr(
        '本机模式不能修改 Firebase 登录资料。',
        'Firebase login details cannot be updated in local mode.',
        'Butiran log masuk Firebase tidak boleh dikemas kini dalam mod tempatan.'
      ));
    }

    try {
      const { reauthenticateCurrentFirebaseStaff } = await import('./lib/auth');
      const user = await reauthenticateCurrentFirebaseStaff(currentPassword);
      const token = await user.getIdToken(true);
      const response = await fetch('/api/staff/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name })
      });
      const payload = await response.json().catch(() => ({})) as { email?: string; error?: string; name?: string };

      if (!response.ok || !payload.name || !payload.email) {
        const serverMessage = String(payload.error || '');
        if (serverMessage.includes('Staff name is already in use')) {
          throw new Error(tr('员工姓名已被使用。', 'Staff name is already in use.', 'Nama kakitangan sudah digunakan.'));
        }
        if (serverMessage.includes('Email is already in use')) {
          throw new Error(tr('Email 已被其他账号使用。', 'Email is already in use by another account.', 'E-mel sudah digunakan oleh akaun lain.'));
        }
        if (serverMessage.includes('Role Account no longer matches')) {
          throw new Error(tr('账号资料已在其他设备更改，请重新登录。', 'Account information changed elsewhere. Sign in again.', 'Maklumat akaun berubah di tempat lain. Log masuk semula.'));
        }
        throw new Error(serverMessage || tr('账号资料更新失败。', 'Account information update failed.', 'Kemas kini maklumat akaun gagal.'));
      }

      await user.reload();
      await user.getIdToken(true);
      window.localStorage.setItem('dr_racing_current_staff', JSON.stringify({
        name: payload.name,
        role: currentStaff.role
      }));
      if (window.localStorage.getItem('dr_racing_remembered_staff_email') !== null) {
        window.localStorage.setItem('dr_racing_remembered_staff_email', formatStaffLoginIdentifier(payload.email));
      }
      clearSensitiveDashboardLocalCache();
      requestFirestoreCacheClearOnReload();
      window.location.replace(`/?profileUpdated=${Date.now()}`);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw new Error(getPasswordActionErrorMessage(error));
      }
      throw error instanceof Error
        ? error
        : new Error(tr('账号资料更新失败。', 'Account information update failed.', 'Kemas kini maklumat akaun gagal.'));
    }
  };

  const handleUpdateCurrentUserAvatar = (avatarDataUrl: string, defaultAvatarId = '') => {
    if (!currentRoleAccount) {
      triggerToast(tr('当前账号找不到，无法保存头像', 'Current account not found; avatar not saved', "Akaun semasa tidak ditemui; avatar tidak disimpan"));
      return;
    }

    void handleUpdateRoleAccount(currentRoleAccount.id, {
      avatar_data_url: avatarDataUrl,
      default_avatar_id: defaultAvatarId
    }).then((updated) => {
      if (updated) {
        triggerToast(tr('头像已更新', 'Avatar updated', "Avatar dikemas kini"));
      }
    });
  };

  const handleRemoveCurrentUserAvatar = () => {
    if (!currentRoleAccount) {
      triggerToast(tr('当前账号找不到，无法移除头像', 'Current account not found; avatar not removed', "Akaun semasa tidak ditemui; avatar tidak dialih keluar"));
      return;
    }

    void handleUpdateRoleAccount(currentRoleAccount.id, { avatar_data_url: '', default_avatar_id: '' }).then((updated) => {
      if (updated) {
        triggerToast(tr('头像已移除', 'Avatar removed', "Avatar dialih keluar"));
      }
    });
  };

  const handleUpdateCurrentUserLeadFollowUpDays = (days: number) => {
    const normalizedDays = normalizeLeadFollowUpDays(days);
    setLeadFollowUpDays(normalizedDays);
    window.localStorage.setItem(getLeadFollowUpStorageKey(currentStaff.name), String(normalizedDays));
    triggerToast(tr(
      `潜在客户跟进默认设为 ${normalizedDays} 天后`,
      `Lead follow-up now defaults to ${normalizedDays} day${normalizedDays === 1 ? '' : 's'} later`,
      `Susulan prospek kini ditetapkan ${normalizedDays} hari kemudian`
    ));
  };

  const handleUpdateCurrentUserWhatsAppOpenMode = (openInNewTab: boolean) => {
    setWhatsAppOpenInNewTab(openInNewTab);
    window.localStorage.setItem(getWhatsAppNewTabStorageKey(currentStaff.name), String(openInNewTab));
    triggerToast(openInNewTab
      ? tr('WhatsApp 将在新标签页打开', 'WhatsApp will open in a new tab', 'WhatsApp akan dibuka dalam tab baharu')
      : tr('WhatsApp 将在当前页面打开', 'WhatsApp will open in the current tab', 'WhatsApp akan dibuka dalam tab semasa'));
  };

  const handleAddDefaultAvatar = (avatar: StaffDefaultAvatar) => {
    let currentLibrary = defaultAvatarLibrary;

    try {
      const savedLibrary = JSON.parse(localStorage.getItem('staff_default_avatars') || '[]');
      if (Array.isArray(savedLibrary)) {
        currentLibrary = savedLibrary;
      }
    } catch {
      currentLibrary = defaultAvatarLibrary;
    }

    const next = [avatar, ...currentLibrary.filter((item) => item.id !== avatar.id)];

    updateDefaultAvatarLibraryState(next);
    appendAuditLog({
      action: 'ADD_DEFAULT_AVATAR',
      target_type: 'Default Avatar',
      target_id: avatar.id,
      target_label: avatar.label,
      changes: createAuditChanges({}, {
        id: avatar.id,
        label: avatar.label,
        file_name: avatar.file_name,
        file_type: avatar.file_type,
        file_size: avatar.file_size,
        uploaded_by: avatar.uploaded_by,
        uploaded_at: avatar.uploaded_at,
        avatar_data_url: avatar.avatar_data_url
      }),
      stateOverrides: { defaultAvatarLibrary: next }
    });
    triggerToast(tr(`默认头像 ${avatar.label} 已上传`, `Default avatar ${avatar.label} uploaded`, `Avatar lalai ${avatar.label} dimuat naik`));
  };

  const handleDeleteDefaultAvatar = (id: string) => {
    const target = defaultAvatarLibrary.find((avatar) => avatar.id === id);
    const next = defaultAvatarLibrary.filter((avatar) => avatar.id !== id);
    const nextRoleAccounts = target
      ? roleAccounts.map((account) => (
        account.default_avatar_id === id || (!account.default_avatar_id && account.avatar_data_url === target.avatar_data_url)
          ? { ...account, avatar_data_url: '', default_avatar_id: '' }
          : account
      ))
      : roleAccounts;

    updateRoleAccountsState(nextRoleAccounts);
    updateDefaultAvatarLibraryState(next);
    appendAuditLog({
      action: 'DELETE_DEFAULT_AVATAR',
      target_type: 'Default Avatar',
      target_id: id,
      target_label: target?.label || id,
      changes: [
        {
          field: 'default_avatar',
          old_value: target?.label || id,
          new_value: 'Deleted'
        }
      ],
      stateOverrides: { defaultAvatarLibrary: next, roleAccounts: nextRoleAccounts }
    });
    triggerToast(tr(`默认头像 ${target?.label || id} 已删除`, `Default avatar ${target?.label || id} deleted`, `Avatar lalai ${target?.label || id} dipadamkan`));
  };

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

  const handleTransferWorkload = (sourceName: string, targetName: string) => {
    const source = (sourceName || '').trim();
    const target = roleAccounts.find((account) => account.name === targetName && account.status === 'Active');

    if (!source || !target || source === target.name) {
      return;
    }

    const nextApplications = applications.map((application) => (
      application.handler_name === source && IN_PROGRESS_LOAN_STATUSES.has(application.status)
        ? { ...application, handler_name: target.name, handler_role: target.role }
        : application
    ));
    const movedCustomers = nextApplications.filter((application, index) => application !== applications[index]).length;

    const nextLeads = rawCustomerLeads.map((lead) => (
      lead.taken_by_staff_name === source && isActiveLead(lead)
        ? { ...lead, taken_by_staff_name: target.name, taken_by_staff_role: target.role }
        : lead
    ));
    const movedLeads = nextLeads.filter((lead, index) => lead !== rawCustomerLeads[index]).length;

    if (movedCustomers + movedLeads === 0) {
      triggerToast(tr(`${source} 没有进行中的客户或名单可转移`, `${source} has no in-progress customers or leads to transfer`, `${source} tidak mempunyai pelanggan atau prospek yang sedang dalam proses untuk dipindahkan`));
      return;
    }

    updateApplicationsState(nextApplications);
    updateRawCustomerLeadsState(nextLeads);
    appendAuditLog({
      action: 'TRANSFER_WORKLOAD',
      target_type: 'Role Account',
      target_id: source,
      target_label: `${source} → ${target.name}`,
      changes: [
        {
          field: 'workload',
          old_value: source,
          new_value: `${target.name} (${movedCustomers} customers, ${movedLeads} leads)`
        }
      ]
    });
    triggerToast(tr(
      `已把 ${source} 的 ${movedCustomers} 个进行中客户、${movedLeads} 个名单转给 ${target.name}`,
      `Transferred ${movedCustomers} customers & ${movedLeads} leads from ${source} to ${target.name}`, `Memindahkan ${movedCustomers} pelanggan & ${movedLeads} prospek daripada ${source} kepada ${target.name}`
    ));
  };

  const handleTransferWorkloadCase = (
    sourceName: string,
    targetName: string,
    caseType: StaffWorkloadCase['type'],
    caseId: string
  ) => {
    const source = sourceName.trim();
    const target = roleAccounts.find((account) => account.name === targetName && account.status === 'Active');

    if (!source || !target || source === target.name || !caseId) {
      return;
    }

    const workloadCase = staffWorkloadCases.find((item) => (
      item.id === caseId && item.type === caseType && item.owner_name === source
    ));

    if (!workloadCase) {
      triggerToast(tr('这个案件已经不在原负责人名下', 'This case is no longer assigned to the source staff', "Kes ini tidak lagi diberikan kepada kakitangan sumber"));
      return;
    }

    const nextApplications = caseType === 'customer'
      ? applications.map((application) => (
        application.id === caseId && application.handler_name === source && IN_PROGRESS_LOAN_STATUSES.has(application.status)
          ? { ...application, handler_name: target.name, handler_role: target.role }
          : application
      ))
      : applications;
    const nextLeads = caseType === 'lead'
      ? rawCustomerLeads.map((lead) => (
        lead.id === caseId && lead.taken_by_staff_name === source && isActiveLead(lead)
          ? { ...lead, taken_by_staff_name: target.name, taken_by_staff_role: target.role }
          : lead
      ))
      : rawCustomerLeads;

    updateApplicationsState(nextApplications);
    updateRawCustomerLeadsState(nextLeads);
    appendAuditLog({
      action: 'TRANSFER_WORKLOAD_CASE',
      target_type: caseType === 'customer' ? 'Loan Application' : 'Raw Customer',
      target_id: caseId,
      target_label: workloadCase.label,
      changes: [{ field: 'owner', old_value: source, new_value: target.name }],
      stateOverrides: { applications: nextApplications, rawCustomerLeads: nextLeads }
    });
    triggerToast(tr(
      `已把 ${workloadCase.label} 从 ${source} 转给 ${target.name}`,
      `Transferred ${workloadCase.label} from ${source} to ${target.name}`, `Dipindahkan ${workloadCase.label} daripada ${source} kepada ${target.name}`
    ));
  };

  const handleDeleteRoleAccount = async (id: string) => {
    const target = roleAccounts.find((account) => account.id === id);
    const workload = staffWorkload.find((entry) => entry.name === target?.name);
    const workloadNote = workload
      ? tr(
          `\n\n注意：${target?.name} 还有 ${workload.customers} 个进行中客户、${workload.leads} 个名单。建议先在「工作转移」里转给别人，否则这些记录会挂着一个已删除的员工。`,
          `\n\nNote: ${target?.name} still has ${workload.customers} in-progress customers and ${workload.leads} leads. Transfer them first in "Workload Transfer", or they will point to a deleted staff.`, `Nota: ${target?.name} masih mempunyai ${workload.customers} pelanggan dalam proses dan ${workload.leads} prospek. Pindahkan mereka dahulu dalam "Pemindahan Beban Kerja", atau mereka akan menunjuk kepada kakitangan yang dipadamkan.`
        )
      : '';

    if (await showConfirm({
      eyebrow: tr('员工账号', 'Staff Account', 'Akaun Kakitangan'),
      title: tr('删除员工账号？', 'Delete staff account?', 'Padam akaun kakitangan?'),
      message: `${tr('确认删除', 'Delete', 'Padam')} ${target?.name || id}?${workloadNote}`,
      tone: 'danger',
      confirmLabel: tr('删除账号', 'Delete Account', 'Padam Akaun')
    })) {
      if (!target) return;

      if (target.firebase_uid || target.firebase_auth_email) {
        try {
          const { getCurrentFirebaseIdToken } = await import('./lib/auth');
          const token = await getCurrentFirebaseIdToken(true);
          if (!token) throw new Error(tr('请先重新登录 Super Admin。', 'Sign in as Super Admin again.', 'Log masuk semula sebagai Super Admin.'));
          const response = await fetch('/api/admin/staff-auth-users', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: target.firebase_uid || '',
              email: target.firebase_auth_email || target.email
            })
          });
          const payload = await response.json().catch(() => ({})) as { error?: string };
          if (!response.ok) throw new Error(payload.error || tr('Firebase 账号删除失败。', 'Firebase account deletion failed.', 'Pemadaman akaun Firebase gagal.'));
        } catch (error) {
          triggerToast(error instanceof Error ? error.message : tr('Firebase 账号删除失败。', 'Firebase account deletion failed.', 'Pemadaman akaun Firebase gagal.'), 'error');
          return;
        }
      }

      updateRoleAccountsState(roleAccounts.filter((account) => account.id !== id));
      appendAuditLog({
        action: 'DELETE_ROLE_ACCOUNT',
        target_type: 'Role Account',
        target_id: id,
        target_label: target?.name || id,
        changes: [
          {
            field: 'record',
            old_value: target ? `${target.name} / ${target.email} / ${target.role}` : id,
            new_value: 'Deleted'
          }
        ],
        stateOverrides: { roleAccounts: roleAccounts.filter((account) => account.id !== id) }
      });
      triggerToast(tr(`账号 ${target?.name || id} 已删除`, `Account ${target?.name || id} deleted`, `Akaun ${target?.name || id} dipadamkan`));
    }
  };

  const handleUpdateVehicleTags = (nextTags: string[]) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const normalized = normalizeTags(nextTags);
    updateVehicleTagsState(normalized);
    appendAuditLog({
      action: 'UPDATE_VEHICLE_TAGS',
      target_type: 'Tags',
      target_id: 'vehicle_tags',
      target_label: 'Vehicle Tags',
      changes: createAuditChanges(
        { vehicle_tags: vehicleTags.join(', ') },
        { vehicle_tags: normalized.join(', ') }
      ),
      stateOverrides: { vehicleTags: normalized }
    });
    triggerToast(tr('车辆标签已更新', 'Vehicle tags updated', "Teg kenderaan dikemas kini"));
  };

  const handleUpdateVehicleBrandTags = (nextTags: string[]) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const normalized = normalizeTags(nextTags);
    updateVehicleBrandTagsState(normalized);
    appendAuditLog({
      action: 'UPDATE_BRAND_TAGS',
      target_type: 'Tags',
      target_id: 'vehicle_brand_tags',
      target_label: 'Brand Tags',
      changes: createAuditChanges(
        { vehicle_brand_tags: vehicleBrandTags.join(', ') },
        { vehicle_brand_tags: normalized.join(', ') }
      ),
      stateOverrides: { vehicleBrandTags: normalized }
    });
    triggerToast(tr('品牌标签已更新', 'Brand tags updated', "Teg jenama dikemas kini"));
  };

  const handleRenameVehicleModel = (oldModel: string, newModel: string) => {
    const from = (oldModel || '').trim();
    const to = (newModel || '').trim().replace(/\s+/g, ' ');
    if (!to || from.toLowerCase() === to.toLowerCase()) {
      return;
    }
    const fromKey = from.toLowerCase();
    let changed = 0;
    const next = applications.map((application) => {
      const primaryMatch = (application.vehicle_model || '').trim().toLowerCase() === fromKey;
      const options = application.vehicle_options;
      const optionMatch = Array.isArray(options) && options.some((option) => (option.vehicle_model || '').trim().toLowerCase() === fromKey);
      if (!primaryMatch && !optionMatch) {
        return application;
      }
      changed += 1;
      return {
        ...application,
        vehicle_model: primaryMatch ? to : application.vehicle_model,
        vehicle_options: Array.isArray(options)
          ? options.map((option) => ((option.vehicle_model || '').trim().toLowerCase() === fromKey ? { ...option, vehicle_model: to } : option))
          : options
      };
    });
    if (changed === 0) {
      return;
    }
    updateApplicationsState(next);
    appendAuditLog({
      action: 'RENAME_VEHICLE_MODEL',
      target_type: 'Vehicle Model',
      target_id: from,
      target_label: to,
      changes: [{ field: 'vehicle_model', old_value: from, new_value: to }],
      stateOverrides: { applications: next }
    });
    triggerToast(tr(`已把 ${changed} 条申请的车型改为 ${to}`, `Renamed ${changed} application(s) to ${to}`, `Menamakan semula ${changed} permohonan kepada ${to}`));
  };

  const handleAddVehicleCatalogItem = (item: Pick<VehicleCatalogItem, 'model' | 'body_type'> & Partial<VehicleCatalogItem>) => {
    const model = item.model.trim().replace(/\s+/g, ' ');
    if (!model) {
      triggerToast(tr('车辆名称不能为空', 'Vehicle name is required', "Nama kenderaan diperlukan"));
      return;
    }

    const sellingPrice = normalizeMoneyAmount(item.selling_price);
    const loanAmount = normalizeMoneyAmount(item.loan_amount);
    const depositAmount = normalizeMoneyAmount(item.deposit_amount);
    const costPrice = normalizeMoneyAmount(item.cost_price);
    const requestedBrand = item.brand?.trim().replace(/\s+/g, ' ');
    const inferredBrand = requestedBrand && MOTOR_PRICE_BRAND_TAG_SET.has(requestedBrand)
      ? requestedBrand
      : inferVehicleBrandFromModel(model, vehicleCatalog);
    const nextBrand = MOTOR_PRICE_BRAND_TAG_SET.has(inferredBrand) ? inferredBrand : DEFAULT_VEHICLE_BRAND_TAGS[0];
    const financeProfile = normalizeFinanceProfileId(item.finance_profile) || inferFinanceProfileFromVehicle(model, nextBrand);
    const nextItem: VehicleCatalogItem = {
      id: `VEH-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      model,
      brand: nextBrand,
      body_type: 'Motorcycle',
      finance_profile: financeProfile,
      selling_price: sellingPrice,
      loan_amount: loanAmount,
      deposit_amount: depositAmount,
      installment_2y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 2) || normalizeMoneyAmount(item.installment_2y),
      installment_3y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 3) || normalizeMoneyAmount(item.installment_3y),
      installment_4y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 4) || normalizeMoneyAmount(item.installment_4y),
      installment_5y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 5) || normalizeMoneyAmount(item.installment_5y),
      installment_6y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 6) || normalizeMoneyAmount(item.installment_6y),
      installment_7y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 7) || normalizeMoneyAmount(item.installment_7y),
      cost_price: costPrice,
      profit_amount: Math.max(sellingPrice - costPrice, 0),
      profit_review_month: item.profit_review_month || '',
      profit_reviewed_at: item.profit_reviewed_at || '',
      profit_reviewed_by: item.profit_reviewed_by || '',
      price_source: item.price_source || '',
      stock_units: item.stock_units || [],
      created_at: new Date().toISOString()
    };
    const nextCatalog = [...vehicleCatalog, nextItem];

    updateVehicleCatalogState(nextCatalog);
    appendAuditLog({
      action: 'ADD_VEHICLE_CATALOG',
      target_type: 'Vehicle Catalog',
      target_id: nextItem.id,
      target_label: nextItem.model,
      changes: [
        ...createAuditChanges(
          {},
          {
            model: nextItem.model,
            brand: nextItem.brand,
            body_type: nextItem.body_type,
            finance_profile: nextItem.finance_profile,
            selling_price: nextItem.selling_price,
            loan_amount: nextItem.loan_amount,
            deposit_amount: nextItem.deposit_amount,
            cost_price: nextItem.cost_price,
            profit_amount: nextItem.profit_amount,
            profit_review_month: nextItem.profit_review_month
          }
        ),
        ...createTaskCompletionAuditChanges([{
          category: 'vehicle',
          task_type: 'Vehicle Info Added',
          assigned_at: nextItem.created_at
        }])
      ],
      stateOverrides: { vehicleCatalog: normalizeVehicleCatalogList(nextCatalog) }
    });
    triggerToast(tr(`车辆 ${model} 已加入数据库`, `Vehicle ${model} added`, `Kenderaan ${model} ditambahkan`));
  };

  const handleUpdateFinanceProfileTerm = (
    profileId: FinanceProfile['id'],
    years: FinanceProfileTerm['years'],
    updates: Partial<FinanceProfileTerm>
  ) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previousProfile = financeProfiles.find((profile) => profile.id === profileId);
    if (!previousProfile) {
      return;
    }

    const existingTerm = previousProfile.terms.find((term) => term.years === years);
    const nextTerm: FinanceProfileTerm = {
      years,
      base: updates.base || existingTerm?.base || (profileId === 'net_loan' || profileId === 'voge_sr3_6_7y' ? 'net_loan' : 'loan'),
      multiplier: updates.multiplier !== undefined ? normalizeMoneyAmount(updates.multiplier) : normalizeMoneyAmount(existingTerm?.multiplier)
    };

    const nextTerms = previousProfile.terms
      .filter((term) => term.years !== years)
      .concat(nextTerm.multiplier > 0 ? [nextTerm] : [])
      .sort((a, b) => a.years - b.years);
    const nextProfiles = financeProfiles.map((profile) => (
      profile.id === profileId ? { ...profile, terms: nextTerms } : profile
    ));
    const normalizedProfiles = normalizeFinanceProfiles(nextProfiles);
    const normalizedVehicleCatalog = normalizeVehicleCatalogList(vehicleCatalog, normalizedProfiles);

    updateFinanceProfilesState(nextProfiles);
    appendAuditLog({
      action: 'UPDATE_FINANCE_PROFILE',
      target_type: 'Finance Profile',
      target_id: profileId,
      target_label: previousProfile.label,
      changes: createAuditChanges(
        { terms: JSON.stringify(previousProfile.terms) },
        { terms: JSON.stringify(normalizedProfiles.find((profile) => profile.id === profileId)?.terms || []) }
      ),
      stateOverrides: {
        financeProfiles: normalizedProfiles,
        vehicleCatalog: normalizedVehicleCatalog
      }
    });
    triggerToast(tr(`${previousProfile.label} 公式已更新`, `${previousProfile.label} formula updated`, `${previousProfile.label} formula dikemas kini`));
  };

  const handleUpdateVehicleCatalogItem = (id: string, updates: Partial<VehicleCatalogItem>) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = vehicleCatalog.find((item) => item.id === id);
    if (!previous) {
      return;
    }
    const nextModel = (updates.model || previous.model).trim().replace(/\s+/g, ' ');
    const requestedBrand = updates.brand !== undefined
      ? updates.brand.trim().replace(/\s+/g, ' ')
      : inferVehicleBrandFromModel(nextModel, vehicleCatalog.filter((item) => item.id !== id));
    const nextBrand = MOTOR_PRICE_BRAND_TAG_SET.has(requestedBrand)
      ? requestedBrand
      : MOTOR_PRICE_BRAND_TAG_SET.has(previous.brand)
        ? previous.brand
        : DEFAULT_VEHICLE_BRAND_TAGS[0];
    const financeProfile = normalizeFinanceProfileId(updates.finance_profile) || normalizeFinanceProfileId(previous.finance_profile) || inferFinanceProfileFromVehicle(nextModel, nextBrand);

    const updatedItem: VehicleCatalogItem = {
      ...previous,
      ...updates,
      model: nextModel,
      brand: nextBrand,
      body_type: 'Motorcycle',
      finance_profile: financeProfile,
      selling_price: updates.selling_price !== undefined ? normalizeMoneyAmount(updates.selling_price) : normalizeMoneyAmount(previous.selling_price),
      loan_amount: updates.loan_amount !== undefined ? normalizeMoneyAmount(updates.loan_amount) : normalizeMoneyAmount(previous.loan_amount),
      deposit_amount: updates.deposit_amount !== undefined ? normalizeMoneyAmount(updates.deposit_amount) : normalizeMoneyAmount(previous.deposit_amount),
      cost_price: updates.cost_price !== undefined ? normalizeMoneyAmount(updates.cost_price) : normalizeMoneyAmount(previous.cost_price),
      profit_review_month: updates.profit_review_month ?? previous.profit_review_month ?? '',
      profit_reviewed_at: updates.profit_review_month !== undefined ? new Date().toISOString() : updates.profit_reviewed_at ?? previous.profit_reviewed_at ?? '',
      profit_reviewed_by: updates.profit_review_month !== undefined ? currentStaff.name : updates.profit_reviewed_by ?? previous.profit_reviewed_by ?? '',
      price_source: updates.price_source ?? previous.price_source ?? ''
    };
    updatedItem.profit_amount = updates.profit_amount !== undefined
      ? normalizeMoneyAmount(updates.profit_amount)
      : Math.max((updatedItem.selling_price || 0) - (updatedItem.cost_price || 0), 0);
    updatedItem.installment_2y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 2) || normalizeMoneyAmount(updates.installment_2y ?? previous.installment_2y);
    updatedItem.installment_3y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 3) || normalizeMoneyAmount(updates.installment_3y ?? previous.installment_3y);
    updatedItem.installment_4y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 4) || normalizeMoneyAmount(updates.installment_4y ?? previous.installment_4y);
    updatedItem.installment_5y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 5) || normalizeMoneyAmount(updates.installment_5y ?? previous.installment_5y);
    updatedItem.installment_6y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 6) || normalizeMoneyAmount(updates.installment_6y ?? previous.installment_6y);
    updatedItem.installment_7y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 7) || normalizeMoneyAmount(updates.installment_7y ?? previous.installment_7y);

    if (!updatedItem.model) {
      triggerToast(tr('车辆名称不能为空', 'Vehicle name is required', "Nama kenderaan diperlukan"));
      return;
    }

    const nextCatalog = vehicleCatalog.map((item) => item.id === id ? updatedItem : item);
    const normalizedCatalog = normalizeVehicleCatalogList(nextCatalog);
    const previousModelKey = normalizeVehicleModel(previous.model);
    const modelChanged = previousModelKey !== normalizeVehicleModel(updatedItem.model);
    let linkedApplicationCount = 0;
    const nextApplications = modelChanged
      ? applications.map((application) => {
        const primaryMatch = normalizeVehicleModel(application.vehicle_model || '') === previousModelKey;
        const optionMatch = (application.vehicle_options || []).some((option) => normalizeVehicleModel(option.vehicle_model || '') === previousModelKey);
        const preferenceMatch = normalizeVehicleModel(application.preferences?.preferred_motorcycle || '') === previousModelKey;
        if (!primaryMatch && !optionMatch && !preferenceMatch) return application;
        linkedApplicationCount += 1;
        return {
          ...application,
          vehicle_model: primaryMatch ? updatedItem.model : application.vehicle_model,
          vehicle_options: (application.vehicle_options || []).map((option) => (
            normalizeVehicleModel(option.vehicle_model || '') === previousModelKey
              ? { ...option, vehicle_model: updatedItem.model, vehicle_brand: updatedItem.brand }
              : option
          )),
          preferences: application.preferences
            ? {
              ...application.preferences,
              preferred_motorcycle: preferenceMatch ? updatedItem.model : application.preferences.preferred_motorcycle
            }
            : application.preferences
        };
      })
      : applications;

    updateVehicleCatalogState(normalizedCatalog);
    if (modelChanged) {
      setApplications(nextApplications);
      writeLocalDashboardValue('applications', nextApplications);
      setSelectedApplication((current) => current
        ? nextApplications.find((application) => application.id === current.id) || current
        : current);
    }
    appendAuditLog({
      action: 'UPDATE_VEHICLE_CATALOG',
      target_type: 'Vehicle Catalog',
      target_id: id,
      target_label: updatedItem.model,
      changes: createAuditChanges(
        {
          model: previous.model,
          brand: previous.brand,
          body_type: previous.body_type,
          finance_profile: previous.finance_profile,
          selling_price: previous.selling_price,
          loan_amount: previous.loan_amount,
          deposit_amount: previous.deposit_amount,
          cost_price: previous.cost_price,
          profit_amount: previous.profit_amount,
          profit_review_month: previous.profit_review_month,
          profit_reviewed_at: previous.profit_reviewed_at
        },
        {
          model: updatedItem.model,
          brand: updatedItem.brand,
          body_type: updatedItem.body_type,
          finance_profile: updatedItem.finance_profile,
          selling_price: updatedItem.selling_price,
          loan_amount: updatedItem.loan_amount,
          deposit_amount: updatedItem.deposit_amount,
          cost_price: updatedItem.cost_price,
          profit_amount: updatedItem.profit_amount,
          profit_review_month: updatedItem.profit_review_month,
          profit_reviewed_at: updatedItem.profit_reviewed_at
        }
      ),
      stateOverrides: { vehicleCatalog: normalizedCatalog, applications: nextApplications }
    });
    triggerToast(modelChanged
      ? tr(
        `车辆 ${updatedItem.model} 已更新，并同步 ${linkedApplicationCount} 个申请`,
        `Vehicle ${updatedItem.model} updated and ${linkedApplicationCount} application(s) migrated`,
        `Kenderaan ${updatedItem.model} dikemas kini dan ${linkedApplicationCount} permohonan dipindahkan`
      )
      : tr(`车辆 ${updatedItem.model} 已更新`, `Vehicle ${updatedItem.model} updated`, `Kenderaan ${updatedItem.model} dikemas kini`));
  };

  const handleMergeVehicleCatalogItems = (masterId: string, duplicateIds: string[]) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以合并车辆记录', 'Only Super Admin can merge vehicle records', "Hanya Pentadbir Super boleh menggabungkan rekod kenderaan"));
      return;
    }

    const master = vehicleCatalog.find((item) => item.id === masterId);
    const duplicateIdSet = new Set(duplicateIds.filter((id) => id && id !== masterId));
    const duplicates = vehicleCatalog.filter((item) => duplicateIdSet.has(item.id));

    if (!master || duplicates.length === 0) {
      triggerToast(tr('找不到可合并的重复记录', 'No duplicate records were found to merge', "Tiada rekod pendua ditemui untuk digabungkan"), 'error');
      return;
    }

    const sourceItems = [master, ...duplicates];
    const hasUsefulValue = (value: unknown) => {
      if (typeof value === 'number') return Number.isFinite(value) && value > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null;
    };
    const protectedFields = new Set<keyof VehicleCatalogItem>(['id', 'model', 'brand', 'body_type', 'created_at', 'price_history']);
    const mergedMaster = duplicates.reduce<VehicleCatalogItem>((current, duplicate) => {
      const next = { ...current };
      (Object.keys(duplicate) as Array<keyof VehicleCatalogItem>).forEach((field) => {
        if (protectedFields.has(field) || hasUsefulValue(next[field]) || !hasUsefulValue(duplicate[field])) {
          return;
        }
        (next as unknown as Record<string, unknown>)[field] = duplicate[field];
      });
      return next;
    }, { ...master });

    const priceHistoryByVersion = new Map<string, NonNullable<VehicleCatalogItem['price_history']>[number]>();
    sourceItems.forEach((item) => {
      (item.price_history || []).forEach((version) => {
        const key = `${version.effective_from}|${version.loan_amount}|${version.deposit}`;
        if (!priceHistoryByVersion.has(key)) {
          priceHistoryByVersion.set(key, version);
        }
      });
    });
    const mergedPriceHistory = Array.from(priceHistoryByVersion.values())
      .sort((a, b) => b.effective_from.localeCompare(a.effective_from) || b.updated_at.localeCompare(a.updated_at));
    mergedMaster.price_history = mergedPriceHistory.length > 0 ? mergedPriceHistory : undefined;
    const stockUnitsById = new Map<string, VehicleStockUnit>();
    sourceItems.forEach((item) => (item.stock_units || []).forEach((unit) => stockUnitsById.set(unit.id, unit)));
    mergedMaster.stock_units = stockUnitsById.size > 0 ? Array.from(stockUnitsById.values()) : undefined;
    mergedMaster.profit_amount = Math.max(normalizeMoneyAmount(mergedMaster.selling_price) - normalizeMoneyAmount(mergedMaster.cost_price), 0);

    const nextCatalog = normalizeVehicleCatalogList(vehicleCatalog
      .filter((item) => !duplicateIdSet.has(item.id))
      .map((item) => item.id === masterId ? mergedMaster : item));
    const sourceModelKeys = new Set(sourceItems.map((item) => item.model.trim().toLowerCase()).filter(Boolean));
    const masterModel = master.model.trim().replace(/\s+/g, ' ');
    let linkedApplicationCount = 0;
    const nextApplications = applications.map((application) => {
      const primaryMatch = sourceModelKeys.has((application.vehicle_model || '').trim().toLowerCase());
      const optionMatch = (application.vehicle_options || []).some((option) => sourceModelKeys.has((option.vehicle_model || '').trim().toLowerCase()));
      const preferenceMatch = sourceModelKeys.has((application.preferences?.preferred_motorcycle || '').trim().toLowerCase());

      if (!primaryMatch && !optionMatch && !preferenceMatch) {
        return application;
      }

      linkedApplicationCount += 1;
      return {
        ...application,
        vehicle_model: primaryMatch ? masterModel : application.vehicle_model,
        vehicle_options: application.vehicle_options?.map((option) => (
          sourceModelKeys.has((option.vehicle_model || '').trim().toLowerCase())
            ? { ...option, vehicle_model: masterModel }
            : option
        )),
        preferences: preferenceMatch && application.preferences
          ? { ...application.preferences, preferred_motorcycle: masterModel }
          : application.preferences
      };
    });

    setVehicleCatalog(nextCatalog);
    setApplications(nextApplications);
    setSelectedApplication((current) => current ? nextApplications.find((application) => application.id === current.id) || current : current);
    writeLocalDashboardState({ vehicleCatalog: nextCatalog, applications: nextApplications });
    appendAuditLog({
      action: 'MERGE_VEHICLE_CATALOG',
      target_type: 'Vehicle Catalog',
      target_id: master.id,
      target_label: masterModel,
      changes: [
        {
          field: 'master_record',
          old_value: `${master.model} (${master.id})`,
          new_value: `${masterModel} (${master.id})`
        },
        {
          field: 'merged_records',
          old_value: duplicates.map((item) => `${item.model} (${item.id})`).join(', '),
          new_value: `Merged into ${master.id}`
        },
        {
          field: 'linked_applications',
          old_value: String(linkedApplicationCount),
          new_value: `${linkedApplicationCount} using ${masterModel}`
        }
      ],
      stateOverrides: { vehicleCatalog: nextCatalog, applications: nextApplications }
    });
    triggerToast(tr(
      `已保留 ${masterModel}，合并 ${duplicates.length} 条重复记录，并统一 ${linkedApplicationCount} 个相关申请`,
      `Kept ${masterModel}, merged ${duplicates.length} duplicate record(s), and unified ${linkedApplicationCount} related application(s)`,
      `Mengekalkan ${masterModel}, menggabungkan ${duplicates.length} rekod pendua dan menyatukan ${linkedApplicationCount} permohonan berkaitan`
    ));
  };

  const handleSaveVehicleStockUnits = (updates: Array<{ catalogId: string; unit: VehicleStockUnit }>) => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以管理库存成本', 'Only the Operations Manager can manage stock costing', "Hanya Pengurus Operasi boleh mengurus kos stok"), 'error');
      return false;
    }

    if (updates.length === 0) {
      return false;
    }

    const normalizeUnitNumber = (value: string) => value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const now = new Date().toISOString();
    const catalogById = new Map<string, VehicleCatalogItem>(vehicleCatalog.map((item) => [item.id, item]));
    const existingRows: Array<{ catalogId: string; catalog: VehicleCatalogItem; unit: VehicleStockUnit }> = vehicleCatalog.flatMap((catalog) => (
      (catalog.stock_units || []).map((unit) => ({ catalogId: catalog.id, catalog, unit }))
    ));
    const existingById = new Map<string, { catalogId: string; catalog: VehicleCatalogItem; unit: VehicleStockUnit }>(existingRows.map((row) => [row.unit.id, row]));
    const updatedIds = new Set(updates.map(({ unit }) => unit.id).filter(Boolean));
    const usedNumberPlates = new Set(existingRows
      .filter(({ unit }) => !updatedIds.has(unit.id))
      .map(({ unit }) => normalizeVehicleNumberPlate(unit.number_plate))
      .filter(Boolean));
    const usedChassis = new Set(existingRows
      .filter(({ unit }) => !updatedIds.has(unit.id))
      .map(({ unit }) => normalizeUnitNumber(unit.chassis_number))
      .filter(Boolean));
    const usedEngines = new Set(existingRows
      .filter(({ unit }) => !updatedIds.has(unit.id))
      .map(({ unit }) => normalizeUnitNumber(unit.engine_number))
      .filter(Boolean));
    const seenUpdateIds = new Set<string>();
    const normalizedUpdates: Array<{ catalogId: string; catalog: VehicleCatalogItem; existing?: VehicleStockUnit; unit: VehicleStockUnit }> = [];

    for (const [index, { catalogId, unit: draft }] of updates.entries()) {
      const catalogItem = catalogById.get(catalogId);
      const existingRow = draft.id ? existingById.get(draft.id) : undefined;
      const existing = existingRow?.unit;
      const numberPlate = normalizeVehicleNumberPlate(draft.number_plate);
      const chassisNumber = draft.chassis_number.trim().toUpperCase().replace(/\s+/g, ' ');
      const engineNumber = draft.engine_number.trim().toUpperCase().replace(/\s+/g, ' ');
      const chassisKey = normalizeUnitNumber(chassisNumber);
      const engineKey = normalizeUnitNumber(engineNumber);
      const purchaseCost = normalizeMoneyAmount(draft.purchase_cost);

      if (!catalogItem || (existingRow && existingRow.catalogId !== catalogId)) {
        triggerToast(tr('请选择正确的 Vehicle Info 车型', 'Select the correct Vehicle Info model', 'Pilih model Vehicle Info yang betul'), 'error');
        return false;
      }
      if (draft.id && seenUpdateIds.has(draft.id)) {
        triggerToast(tr('同一台库存不能重复保存', 'The same stock unit cannot be saved twice', 'Unit stok yang sama tidak boleh disimpan dua kali'), 'error');
        return false;
      }
      if (!numberPlate) {
        triggerToast(tr('每台库存都必须填写 Number Plate', 'Every stock unit needs a Number Plate', 'Setiap unit stok memerlukan Nombor Plat'), 'error');
        return false;
      }
      if (usedNumberPlates.has(numberPlate)) {
        triggerToast(tr(`车牌 ${numberPlate} 已经存在`, `Number Plate ${numberPlate} already exists`, `Nombor Plat ${numberPlate} sudah wujud`), 'error');
        return false;
      }
      if (purchaseCost <= 0) {
        triggerToast(tr('每台库存都必须填写采购成本', 'Every stock unit needs a purchase cost', 'Setiap unit stok memerlukan kos belian'), 'error');
        return false;
      }
      if (chassisKey && usedChassis.has(chassisKey)) {
        triggerToast(tr('这个车架号已经存在', 'This chassis number already exists', 'Nombor casis ini sudah wujud'), 'error');
        return false;
      }
      if (engineKey && usedEngines.has(engineKey)) {
        triggerToast(tr('这个引擎号已经存在', 'This engine number already exists', 'Nombor enjin ini sudah wujud'), 'error');
        return false;
      }
      if (existing?.sold_application_id && draft.status !== 'Sold') {
        triggerToast(tr('已交车库存必须从成交账本更正', 'Correct delivered stock from the Deal Ledger', "Betulkan stok yang telah diserah daripada Lejar Urus Niaga"), 'error');
        return false;
      }
      if (!existing && draft.status !== 'In Stock') {
        triggerToast(tr('新库存必须先设为 In Stock', 'New stock must start as In Stock', "Stok baharu mesti bermula sebagai In Stock"), 'error');
        return false;
      }

      if (draft.id) seenUpdateIds.add(draft.id);
      usedNumberPlates.add(numberPlate);
      if (chassisKey) usedChassis.add(chassisKey);
      if (engineKey) usedEngines.add(engineKey);

      normalizedUpdates.push({
        catalogId,
        catalog: catalogItem,
        existing,
        unit: {
          ...draft,
          id: existing?.id || `STOCK-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          number_plate: numberPlate,
          chassis_number: chassisNumber,
          engine_number: engineNumber,
          supplier: draft.supplier.trim().replace(/\s+/g, ' '),
          purchase_cost: purchaseCost,
          transport_cost: normalizeMoneyAmount(draft.transport_cost),
          registration_cost: normalizeMoneyAmount(draft.registration_cost),
          accessories_cost: normalizeMoneyAmount(draft.accessories_cost),
          repair_cost: normalizeMoneyAmount(draft.repair_cost),
          other_direct_cost: normalizeMoneyAmount(draft.other_direct_cost),
          received_at: draft.received_at || now.slice(0, 10),
          status: existing?.status || 'In Stock',
          reserved_application_id: existing?.reserved_application_id || '',
          sold_application_id: existing?.sold_application_id || '',
          delivered_at: existing?.delivered_at || '',
          created_at: existing?.created_at || now,
          updated_at: now,
          updated_by: currentStaff.name
        }
      });
    }

    const updatesByCatalog = new Map<string, typeof normalizedUpdates>();
    normalizedUpdates.forEach((update) => {
      updatesByCatalog.set(update.catalogId, [...(updatesByCatalog.get(update.catalogId) || []), update]);
    });
    const nextCatalog = normalizeVehicleCatalogList(vehicleCatalog.map((catalog) => {
      const catalogUpdates = updatesByCatalog.get(catalog.id);
      if (!catalogUpdates) return catalog;
      const nextUnits = [...(catalog.stock_units || [])];
      catalogUpdates.forEach(({ unit }) => {
        const existingIndex = nextUnits.findIndex((current) => current.id === unit.id);
        if (existingIndex >= 0) nextUnits[existingIndex] = unit;
        else nextUnits.push(unit);
      });
      return { ...catalog, stock_units: nextUnits };
    }));

    updateVehicleCatalogState(nextCatalog);
    const singleUpdate = normalizedUpdates.length === 1 ? normalizedUpdates[0] : undefined;
    const addedCount = normalizedUpdates.filter(({ existing }) => !existing).length;
    const editedCount = normalizedUpdates.length - addedCount;
    appendAuditLog({
      action: singleUpdate
        ? singleUpdate.existing ? 'UPDATE_VEHICLE_STOCK' : 'ADD_VEHICLE_STOCK'
        : addedCount > 0 && editedCount > 0 ? 'BULK_UPSERT_VEHICLE_STOCK' : addedCount > 0 ? 'BULK_ADD_VEHICLE_STOCK' : 'BULK_UPDATE_VEHICLE_STOCK',
      target_type: 'Vehicle Stock',
      target_id: singleUpdate?.unit.id || `STOCK-BATCH-${Date.now()}`,
      target_label: singleUpdate
        ? `${singleUpdate.catalog.model} · ${getVehicleStockReference(singleUpdate.unit)}`
        : `${normalizedUpdates.length} physical stock units`,
      changes: singleUpdate
        ? createAuditChanges(
            singleUpdate.existing ? { ...singleUpdate.existing } : {},
            {
              model: singleUpdate.catalog.model,
              number_plate: singleUpdate.unit.number_plate,
              chassis_number: singleUpdate.unit.chassis_number,
              engine_number: singleUpdate.unit.engine_number,
              supplier: singleUpdate.unit.supplier,
              purchase_cost: singleUpdate.unit.purchase_cost,
              transport_cost: singleUpdate.unit.transport_cost,
              registration_cost: singleUpdate.unit.registration_cost,
              accessories_cost: singleUpdate.unit.accessories_cost,
              repair_cost: singleUpdate.unit.repair_cost,
              other_direct_cost: singleUpdate.unit.other_direct_cost,
              status: singleUpdate.unit.status
            }
          )
        : [
            { field: 'units', old_value: `${editedCount} existing`, new_value: `${addedCount} added · ${editedCount} updated` },
            { field: 'models', old_value: '', new_value: Array.from(new Set(normalizedUpdates.map(({ catalog }) => catalog.model))).join(', ') }
          ],
      stateOverrides: { vehicleCatalog: nextCatalog }
    });
    triggerToast(singleUpdate
      ? tr(`库存 ${getVehicleStockReference(singleUpdate.unit)} 已保存`, `Stock ${getVehicleStockReference(singleUpdate.unit)} saved`, `Stok ${getVehicleStockReference(singleUpdate.unit)} disimpan`)
      : tr(`已保存 ${normalizedUpdates.length} 台库存`, `${normalizedUpdates.length} stock units saved`, `${normalizedUpdates.length} unit stok disimpan`));
    return true;
  };

  // Finance Center's stock-only path. It records one physical unit and its
  // landed costs without reading or changing Vehicle Info pricing.
  const handleQuickAddStock = (
    catalogId: string,
    input: QuickStockInput
  ): boolean => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以补库存', 'Only the Operations Manager can add stock', "Hanya Pengurus Operasi boleh menambah stok"), 'error');
      return false;
    }
    const catalog = vehicleCatalog.find((item) => item.id === catalogId);
    if (!catalog) {
      triggerToast(tr('找不到这个 Vehicle Info 车型', 'Vehicle Info model not found', "Model Vehicle Info tidak ditemui"), 'error');
      return false;
    }
    const purchaseCost = normalizeMoneyAmount(input.purchase_cost);
    if (purchaseCost <= 0) {
      triggerToast(tr('请填写购买成本（必须大于 0）', 'Enter the purchase cost (must be > 0)', "Isi kos belian (mesti > 0)"), 'error');
      return false;
    }
    const numberPlate = normalizeVehicleNumberPlate(input.number_plate);
    if (!numberPlate) {
      triggerToast(tr('请填写 Number Plate', 'Enter the Number Plate', 'Isi Nombor Plat'), 'error');
      return false;
    }
    if (vehicleCatalog.some((item) => (item.stock_units || []).some((unit) => normalizeVehicleNumberPlate(unit.number_plate) === numberPlate))) {
      triggerToast(tr(`车牌 ${numberPlate} 已经存在`, `Number Plate ${numberPlate} already exists`, `Nombor Plat ${numberPlate} sudah wujud`), 'error');
      return false;
    }
    const now = new Date().toISOString();
    const newUnit: VehicleStockUnit = {
      id: `STOCK-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      number_plate: numberPlate,
      chassis_number: '',
      engine_number: '',
      supplier: '',
      purchase_cost: purchaseCost,
      transport_cost: normalizeMoneyAmount(input.transport_cost),
      registration_cost: 0,
      accessories_cost: normalizeMoneyAmount(input.free_gift_cost),
      repair_cost: normalizeMoneyAmount(input.repair_cost),
      other_direct_cost: 0,
      received_at: now.slice(0, 10),
      status: 'In Stock',
      reserved_application_id: '',
      sold_application_id: '',
      delivered_at: '',
      created_at: now,
      updated_at: now,
      updated_by: currentStaff.name
    };
    return handleSaveVehicleStockUnits([{ catalogId, unit: newUnit }]);
  };

  // Task Inbox inline add-stock is the one place Operations enters the deal
  // amounts. Selling/loan/deposit stay on this application; only the physical
  // unit and its landed cost stay under the model. Vehicle Info prices are not
  // read or written. A missing model gets a zero-price model shell solely so
  // the unit can be grouped and found later.
  const handleQuickAddStockForModel = (
    applicationId: string,
    model: string,
    input: QuickStockInput
  ): Promise<boolean> => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以补库存与成交金额', 'Only the Operations Manager can add stock and deal amounts', "Hanya Pengurus Operasi boleh menambah stok dan jumlah urus niaga"), 'error');
      return Promise.resolve(false);
    }
    const application = applications.find((item) => item.id === applicationId);
    if (!application) {
      triggerToast(tr('找不到这位客户的申请', 'Customer application not found', "Permohonan pelanggan tidak ditemui"), 'error');
      return Promise.resolve(false);
    }
    const cleanModel = (model || '').trim().replace(/\s+/g, ' ');
    if (!cleanModel) {
      triggerToast(tr('这单没有填车型，请先在客户资料里填 Vehicle Model', 'This deal has no vehicle model. Fill it in the customer record first.', "Tiada model kenderaan. Isi dahulu dalam rekod pelanggan."), 'error');
      return Promise.resolve(false);
    }
    const sellingPrice = normalizeMoneyAmount(input.selling_price);
    const purchaseCost = normalizeMoneyAmount(input.purchase_cost);
    if (sellingPrice <= 0) {
      triggerToast(tr('请填写卖价（必须大于 0）', 'Enter the selling price (must be > 0)', "Isi harga jualan (mesti > 0)"), 'error');
      return Promise.resolve(false);
    }
    if (purchaseCost <= 0) {
      triggerToast(tr('请填写购买成本（必须大于 0）', 'Enter the purchase cost (must be > 0)', "Isi kos belian (mesti > 0)"), 'error');
      return Promise.resolve(false);
    }
    const numberPlate = normalizeVehicleNumberPlate(input.number_plate);
    if (!numberPlate) {
      triggerToast(tr('请填写 Number Plate', 'Enter the Number Plate', 'Isi Nombor Plat'), 'error');
      return Promise.resolve(false);
    }
    if (vehicleCatalog.some((item) => (item.stock_units || []).some((unit) => normalizeVehicleNumberPlate(unit.number_plate) === numberPlate))) {
      triggerToast(tr(`车牌 ${numberPlate} 已经存在`, `Number Plate ${numberPlate} already exists`, `Nombor Plat ${numberPlate} sudah wujud`), 'error');
      return Promise.resolve(false);
    }
    const now = new Date().toISOString();
    const newUnit: VehicleStockUnit = {
      id: `STOCK-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      number_plate: numberPlate,
      chassis_number: '',
      engine_number: '',
      supplier: '',
      purchase_cost: purchaseCost,
      transport_cost: normalizeMoneyAmount(input.transport_cost),
      registration_cost: 0,
      accessories_cost: normalizeMoneyAmount(input.free_gift_cost),
      repair_cost: normalizeMoneyAmount(input.repair_cost),
      other_direct_cost: 0,
      received_at: now.slice(0, 10),
      status: 'In Stock',
      reserved_application_id: '',
      sold_application_id: '',
      delivered_at: '',
      created_at: now,
      updated_at: now,
      updated_by: currentStaff.name
    };
    const existingCatalog = vehicleCatalog.find((item) => (item.model || '').trim().toLowerCase() === cleanModel.toLowerCase());
    const nextCatalog = normalizeVehicleCatalogList(existingCatalog
      ? vehicleCatalog.map((item) => item.id === existingCatalog.id
        ? { ...item, stock_units: [...(item.stock_units || []), newUnit] }
        : item)
      : [
          ...vehicleCatalog,
          {
            id: `VEH-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            model: cleanModel,
            brand: inferVehicleBrandFromModel(cleanModel, vehicleCatalog),
            body_type: 'Motorcycle',
            finance_profile: inferFinanceProfileFromVehicle(cleanModel, inferVehicleBrandFromModel(cleanModel, vehicleCatalog)),
            selling_price: 0,
            loan_amount: 0,
            deposit_amount: 0,
            cost_price: 0,
            profit_amount: 0,
            stock_units: [newUnit],
            created_at: now
          }
        ]);

    const previousFinance = application.deal_finance;
    const nextFinance: DealFinance = {
      stock_unit_id: previousFinance?.stock_unit_id || '',
      sale_status: previousFinance?.sale_status || 'Pending Acceptance',
      automation_source: previousFinance?.automation_source || 'Application Workflow',
      approved_bank_name: previousFinance?.approved_bank_name || '',
      approved_bank_offer_amount: normalizeMoneyAmount(previousFinance?.approved_bank_offer_amount),
      approved_bank_offer_at: previousFinance?.approved_bank_offer_at || '',
      listed_selling_price: sellingPrice,
      loan_amount: application.purchase_method === 'Cash' ? 0 : normalizeMoneyAmount(input.loan_amount),
      deposit_amount: application.purchase_method === 'Cash' ? 0 : normalizeMoneyAmount(input.deposit_amount),
      approved_discount: 0,
      final_selling_price: sellingPrice,
      customer_deposit_received: normalizeMoneyAmount(previousFinance?.customer_deposit_received),
      customer_cash_payment: normalizeMoneyAmount(previousFinance?.customer_cash_payment),
      bank_disbursement: normalizeMoneyAmount(previousFinance?.bank_disbursement),
      other_income: normalizeMoneyAmount(previousFinance?.other_income),
      refund_amount: normalizeMoneyAmount(previousFinance?.refund_amount),
      direct_bank_charges: normalizeMoneyAmount(previousFinance?.direct_bank_charges),
      recognized_stock_cost: previousFinance?.recognized_stock_cost,
      delivery_at: previousFinance?.delivery_at || '',
      bank_disbursed_at: previousFinance?.bank_disbursed_at || '',
      finance_completed_at: previousFinance?.finance_completed_at || '',
      account_verified_at: previousFinance?.account_verified_at || '',
      account_verified_by: previousFinance?.account_verified_by || '',
      commission_status: previousFinance?.commission_status || 'Estimated',
      commission_percent: undefined,
      commission_amount: normalizeMoneyAmount(input.commission_amount),
      commission_paid_at: previousFinance?.commission_paid_at || '',
      updated_at: now,
      updated_by: currentStaff.name
    };
    const nextApplications = applications.map((item) => item.id === applicationId
      ? { ...item, deal_finance: nextFinance }
      : item);

    setVehicleCatalog(nextCatalog);
    setApplications(nextApplications);
    setSelectedApplication((current) => current?.id === applicationId
      ? nextApplications.find((item) => item.id === applicationId) || current
      : current);
    writeLocalDashboardState({ vehicleCatalog: nextCatalog, applications: nextApplications });
    appendAuditLog({
      action: 'QUICK_ADD_STOCK_AND_DEAL',
      target_type: 'Deal Finance',
      target_id: applicationId,
      target_label: `${application.applicant_name} · ${cleanModel}`,
      changes: createAuditChanges(
        {
          selling_price: previousFinance?.final_selling_price || 0,
          loan_amount: previousFinance?.loan_amount || 0,
          deposit_amount: previousFinance?.deposit_amount || 0,
          commission_amount: previousFinance?.commission_amount || 0,
          stock_unit: ''
        },
        {
          selling_price: sellingPrice,
          loan_amount: nextFinance.loan_amount || 0,
          deposit_amount: nextFinance.deposit_amount || 0,
          commission_amount: nextFinance.commission_amount,
          stock_unit: numberPlate,
          purchase_cost: purchaseCost,
          transport_cost: newUnit.transport_cost,
          repair_cost: newUnit.repair_cost,
          free_gift_cost: newUnit.accessories_cost
        }
      ),
      stateOverrides: { vehicleCatalog: nextCatalog, applications: nextApplications }
    });
    triggerToast(tr(
      `已为 ${application.applicant_name} 保存成交金额，并新增库存 ${numberPlate}`,
      `Deal amounts saved for ${application.applicant_name}; stock ${numberPlate} added`,
      `Jumlah urus niaga ${application.applicant_name} disimpan; stok ${numberPlate} ditambah`
    ));
    return persistDashboardState(
      { vehicleCatalog: nextCatalog, applications: nextApplications },
      { immediate: true }
    ).then(() => true);
  };

  const saveDealFinanceInternal = async (applicationId: string, draft: DealFinance) => {
    const application = applications.find((item) => item.id === applicationId);
    if (!application) {
      triggerToast(tr('找不到 Loan Application', 'Loan Application not found', "Loan Application tidak ditemui"), 'error');
      return false;
    }

    const stockRows = vehicleCatalog.flatMap((catalog) => (catalog.stock_units || []).map((unit) => ({ catalog, unit })));
    const selectedStock = draft.stock_unit_id ? stockRows.find((row) => row.unit.id === draft.stock_unit_id) : undefined;
    if (draft.stock_unit_id && !selectedStock) {
      triggerToast(tr('选择的库存车辆不存在', 'Selected stock unit does not exist', "Unit stok yang dipilih tidak wujud"), 'error');
      return false;
    }
    if (selectedStock && (
      (selectedStock.unit.reserved_application_id && selectedStock.unit.reserved_application_id !== applicationId) ||
      (selectedStock.unit.sold_application_id && selectedStock.unit.sold_application_id !== applicationId)
    )) {
      triggerToast(tr('这辆库存已经绑定其他客户', 'This stock unit is already linked to another customer', "Unit stok ini sudah dipautkan kepada pelanggan lain"), 'error');
      return false;
    }
    if (draft.sale_status === 'Bike Delivered' && !selectedStock) {
      triggerToast(tr('交车前必须选择库存车辆', 'Select a stock unit before marking Bike Delivered', "Pilih unit stok sebelum menandakan Bike Delivered"), 'error');
      return false;
    }
    if (draft.finance_completed_at && draft.sale_status !== 'Bike Delivered') {
      triggerToast(tr('必须先完成 Bike Delivered 才能完成财务', 'Bike Delivered is required before Finance Completed', "Bike Delivered diperlukan sebelum Kewangan Selesai"), 'error');
      return false;
    }

    const now = new Date().toISOString();
    const listedPrice = normalizeMoneyAmount(draft.listed_selling_price);
    const approvedDiscount = normalizeMoneyAmount(draft.approved_discount);
    const finalSellingPrice = normalizeMoneyAmount(draft.final_selling_price);
    // Cash deals never have a bank disbursement. Force stale/hidden values to
    // zero at the save boundary so they cannot inflate Received or complete a
    // Cash journey without the actual customer payment.
    const bankDisbursement = application.purchase_method === 'Cash'
      ? 0
      : normalizeMoneyAmount(draft.bank_disbursement);
    const receipts = normalizeMoneyAmount(draft.customer_deposit_received) + normalizeMoneyAmount(draft.customer_cash_payment) + bankDisbursement;
    const salesValue = finalSellingPrice + normalizeMoneyAmount(draft.other_income) - normalizeMoneyAmount(draft.refund_amount);
    if (draft.finance_completed_at && receipts + 0.01 < Math.max(salesValue, 0)) {
      triggerToast(tr('还有未收款，不能标记 Finance Completed', 'Outstanding payment remains; Finance cannot be completed', "Masih ada bayaran belum diterima; Kewangan tidak boleh diselesaikan"), 'error');
      return false;
    }
    if (draft.commission_paid_at && !draft.finance_completed_at) {
      triggerToast(tr('财务完成后才能标记佣金已支付', 'Complete Finance before marking commission Paid', "Selesaikan Kewangan sebelum menandakan komisen Dibayar"), 'error');
      return false;
    }

    const deliveryAt = draft.sale_status === 'Bike Delivered' ? draft.delivery_at || now.slice(0, 10) : '';
    const selectedStockCost = selectedStock
      ? normalizeMoneyAmount(selectedStock.unit.purchase_cost)
        + normalizeMoneyAmount(selectedStock.unit.transport_cost)
        + normalizeMoneyAmount(selectedStock.unit.registration_cost)
        + normalizeMoneyAmount(selectedStock.unit.accessories_cost)
        + normalizeMoneyAmount(selectedStock.unit.repair_cost)
        + normalizeMoneyAmount(selectedStock.unit.other_direct_cost)
      : 0;
    const previousRecognizedCost = application.deal_finance?.stock_unit_id === draft.stock_unit_id
      ? normalizeMoneyAmount(application.deal_finance?.recognized_stock_cost)
      : 0;
    const recognizedStockCost = draft.sale_status === 'Bike Delivered'
      ? previousRecognizedCost > 0
        ? previousRecognizedCost
        : selectedStockCost
      : draft.recognized_stock_cost;
    const commissionStatus = draft.sale_status === 'Cancelled'
      ? 'Reversed'
      : draft.commission_paid_at
        ? 'Paid'
        : draft.finance_completed_at
          ? 'Payable'
          : draft.sale_status === 'Bike Delivered'
            ? 'Earned'
            : 'Estimated';
    const draftCommissionPercent = typeof draft.commission_percent === 'number' && Number.isFinite(draft.commission_percent)
      ? Math.min(Math.max(draft.commission_percent, 0), 100)
      : undefined;
    const fallbackCommissionQuote = getDealCommissionQuote(finalSellingPrice, commissionRules);
    const shouldApplyCurrentCommissionRule = application.deal_finance?.automation_source === 'Application Workflow'
      && draft.sale_status === 'Bike Delivered'
      && normalizeMoneyAmount(draft.commission_amount) <= 0;
    const appliedCommissionPercent = draftCommissionPercent ?? (
      shouldApplyCurrentCommissionRule ? fallbackCommissionQuote.percent : undefined
    );
    const commissionAmount = appliedCommissionPercent === undefined
      ? shouldApplyCurrentCommissionRule
        ? fallbackCommissionQuote.amount
        : normalizeMoneyAmount(draft.commission_amount)
      : Math.round(finalSellingPrice * appliedCommissionPercent) / 100;
    const nextFinance: DealFinance = {
      ...draft,
      automation_source: undefined,
      listed_selling_price: listedPrice,
      approved_discount: approvedDiscount,
      final_selling_price: finalSellingPrice,
      customer_deposit_received: normalizeMoneyAmount(draft.customer_deposit_received),
      customer_cash_payment: normalizeMoneyAmount(draft.customer_cash_payment),
      bank_disbursement: bankDisbursement,
      other_income: normalizeMoneyAmount(draft.other_income),
      refund_amount: normalizeMoneyAmount(draft.refund_amount),
      direct_bank_charges: normalizeMoneyAmount(draft.direct_bank_charges),
      recognized_stock_cost: recognizedStockCost,
      delivery_at: deliveryAt,
      bank_disbursed_at: bankDisbursement > 0 ? draft.bank_disbursed_at || now.slice(0, 10) : '',
      finance_completed_at: draft.finance_completed_at || '',
      account_verified_at: draft.finance_completed_at ? now : '',
      account_verified_by: draft.finance_completed_at ? currentStaff.name : '',
      commission_status: commissionStatus,
      commission_percent: appliedCommissionPercent,
      commission_amount: normalizeMoneyAmount(commissionAmount),
      commission_paid_at: draft.commission_paid_at || '',
      updated_at: now,
      updated_by: currentStaff.name
    };
    const previousStockId = application.deal_finance?.stock_unit_id || '';
    const nextCatalog = normalizeVehicleCatalogList(vehicleCatalog.map((catalog) => ({
      ...catalog,
      stock_units: (catalog.stock_units || []).map((unit) => {
        if (unit.id === previousStockId && unit.id !== nextFinance.stock_unit_id && (unit.reserved_application_id === applicationId || unit.sold_application_id === applicationId)) {
          return { ...unit, status: 'In Stock', reserved_application_id: '', sold_application_id: '', delivered_at: '', updated_at: now, updated_by: currentStaff.name };
        }
        if (unit.id !== nextFinance.stock_unit_id) {
          return unit;
        }
        if (nextFinance.sale_status === 'Cancelled') {
          return { ...unit, status: 'In Stock', reserved_application_id: '', sold_application_id: '', delivered_at: '', updated_at: now, updated_by: currentStaff.name };
        }
        if (nextFinance.sale_status === 'Bike Delivered') {
          return { ...unit, status: 'Sold', reserved_application_id: '', sold_application_id: applicationId, delivered_at: deliveryAt, updated_at: now, updated_by: currentStaff.name };
        }
        return { ...unit, status: 'Reserved', reserved_application_id: applicationId, sold_application_id: '', delivered_at: '', updated_at: now, updated_by: currentStaff.name };
      })
    })));
    const deliveredNumberPlate = nextFinance.sale_status === 'Bike Delivered'
      ? normalizeVehicleNumberPlate(selectedStock?.unit.number_plate)
      : '';
    const nextApplications = applications.map((item) => item.id === applicationId
      ? {
          ...item,
          vehicle_plate: deliveredNumberPlate || item.vehicle_plate,
          deal_finance: nextFinance
        }
      : item);

    try {
      await saveDealFinanceWithStockReservationToFirebase(
        nextApplications.find((item) => item.id === applicationId)!,
        previousStockId,
        currentStaff.name
      );
    } catch (error) {
      if (error instanceof StockReservationConflictError) {
        triggerToast(tr(
          `库存 ${error.stockUnitId} 已被另一笔交易占用，未保存。`,
          `Stock ${error.stockUnitId} is already assigned to another deal. Nothing was saved.`,
          `Stok ${error.stockUnitId} telah digunakan oleh urus niaga lain. Tiada perubahan disimpan.`
        ), 'error');
        return false;
      }
      if (error instanceof CollectionItemVersionConflictError) {
        triggerToast(tr('客户资料已在其他设备更新，正在重新载入。', 'The customer changed on another device. Reloading the latest data.', "Pelanggan telah berubah pada peranti lain. Memuatkan semula data terkini."), 'error');
        reloadDashboard();
        return false;
      }
      triggerToast(tr('库存事务保存失败，没有应用任何修改。', 'The stock transaction failed; no changes were applied.', "Transaksi stok gagal; tiada perubahan digunakan."), 'error');
      return false;
    }

    setApplications(nextApplications);
    setVehicleCatalog(nextCatalog);
    setSelectedApplication((current) => current?.id === applicationId
      ? nextApplications.find((item) => item.id === applicationId) || current
      : current);
    writeLocalDashboardState({ applications: nextApplications, vehicleCatalog: nextCatalog });
    appendAuditLog({
      action: 'UPDATE_DEAL_FINANCE',
      target_type: 'Deal Finance',
      target_id: applicationId,
      target_label: `${application.applicant_name} · ${application.vehicle_model}`,
      changes: createAuditChanges(
        {
          ...(application.deal_finance || {}),
          vehicle_plate: application.vehicle_plate
        },
        {
          vehicle_plate: deliveredNumberPlate || application.vehicle_plate,
          stock_unit_id: nextFinance.stock_unit_id,
          sale_status: nextFinance.sale_status,
          final_selling_price: nextFinance.final_selling_price,
          receipts,
          bank_disbursement: nextFinance.bank_disbursement,
          approved_bank_name: nextFinance.approved_bank_name || '',
          approved_bank_offer_amount: nextFinance.approved_bank_offer_amount || 0,
          recognized_stock_cost: nextFinance.recognized_stock_cost || 0,
          delivery_at: nextFinance.delivery_at,
          finance_completed_at: nextFinance.finance_completed_at,
          commission_status: nextFinance.commission_status,
          commission_percent: nextFinance.commission_percent ?? '',
          commission_amount: nextFinance.commission_amount,
          commission_paid_at: nextFinance.commission_paid_at
        }
      ),
      stateOverrides: { applications: nextApplications, vehicleCatalog: nextCatalog }
    });
    triggerToast(tr(`已更新 ${application.applicant_name} 的财务资料`, `Finance updated for ${application.applicant_name}`, `Kewangan ${application.applicant_name} dikemas kini`));
    return true;
  };

  // Finance editing belongs to the operational lead (Operations Manager, with
  // Super Admin retained as the emergency fallback).
  const handleSaveDealFinance = async (applicationId: string, draft: DealFinance) => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以更新财务资料', 'Only the Operations Manager can update finance records', "Hanya Pengurus Operasi boleh mengemas kini rekod kewangan"), 'error');
      return false;
    }
    return saveDealFinanceInternal(applicationId, draft);
  };

  // Narrow delivery (交车) action for the Task Inbox: links a stock unit and marks
  // the bike delivered, reusing the same stock-reservation + commission recompute
  // as the finance editor but only writing delivery fields. Operations only —
  // the write touches deal_finance + vehicle_stock_reservations, both of which
  // firestore.rules restricts to the operational lead. Sales sees a read-only
  // "awaiting delivery" card instead of a button that would always fail.
  const handleMarkBikeDeliveredFromTaskInbox = async (applicationId: string, stockUnitId: string) => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以标记交车', 'Only the Operations Manager can mark a bike delivered', "Hanya Pengurus Operasi boleh menandakan penghantaran"), 'error');
      return false;
    }
    const application = applications.find((item) => item.id === applicationId);
    if (!application) {
      triggerToast(tr('找不到 Loan Application', 'Loan Application not found', "Loan Application tidak ditemui"), 'error');
      return false;
    }
    if (!stockUnitId) {
      triggerToast(tr('交车前必须选择库存车辆', 'Select a stock unit before delivering', "Pilih unit stok sebelum menghantar"), 'error');
      return false;
    }
    const previous = application.deal_finance;
    const listedPrice = previous
      ? normalizeMoneyAmount(previous.listed_selling_price)
      : normalizeMoneyAmount(application.vehicle_options?.[0]?.motor_selling_price);
    const commissionQuote = getDealCommissionQuote(listedPrice, commissionRules);
    const draft: DealFinance = {
      stock_unit_id: stockUnitId,
      sale_status: 'Bike Delivered',
      automation_source: previous?.automation_source,
      approved_bank_name: previous?.approved_bank_name || '',
      approved_bank_offer_amount: normalizeMoneyAmount(previous?.approved_bank_offer_amount),
      approved_bank_offer_at: previous?.approved_bank_offer_at || '',
      listed_selling_price: listedPrice,
      loan_amount: normalizeMoneyAmount(previous?.loan_amount),
      deposit_amount: normalizeMoneyAmount(previous?.deposit_amount),
      approved_discount: normalizeMoneyAmount(previous?.approved_discount),
      final_selling_price: previous ? normalizeMoneyAmount(previous.final_selling_price) : listedPrice,
      customer_deposit_received: normalizeMoneyAmount(previous?.customer_deposit_received),
      customer_cash_payment: normalizeMoneyAmount(previous?.customer_cash_payment),
      bank_disbursement: normalizeMoneyAmount(previous?.bank_disbursement),
      other_income: normalizeMoneyAmount(previous?.other_income),
      refund_amount: normalizeMoneyAmount(previous?.refund_amount),
      direct_bank_charges: normalizeMoneyAmount(previous?.direct_bank_charges),
      recognized_stock_cost: previous?.recognized_stock_cost,
      delivery_at: previous?.delivery_at || new Date().toISOString().slice(0, 10),
      bank_disbursed_at: previous?.bank_disbursed_at || '',
      finance_completed_at: previous?.finance_completed_at || '',
      account_verified_at: previous?.account_verified_at || '',
      account_verified_by: previous?.account_verified_by || '',
      commission_status: 'Earned',
      commission_percent: previous ? previous.commission_percent : commissionQuote.percent,
      commission_amount: previous
        ? normalizeMoneyAmount(previous.commission_amount)
        : normalizeMoneyAmount(commissionQuote.amount),
      commission_paid_at: previous?.commission_paid_at || '',
      updated_at: previous?.updated_at || '',
      updated_by: currentStaff.name
    };
    return saveDealFinanceInternal(applicationId, draft);
  };

  // One-click "pay commission" from the Task Inbox settlement task. Operations
  // only; requires finance already completed (commission Payable). Marks the
  // commission paid today; saveDealFinanceInternal recomputes status to Paid.
  const handleMarkCommissionPaidFromTaskInbox = async (applicationId: string) => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以支付佣金', 'Only the Operations Manager can pay commission', "Hanya Pengurus Operasi boleh membayar komisen"), 'error');
      return false;
    }
    const application = applications.find((item) => item.id === applicationId);
    if (!application?.deal_finance) {
      triggerToast(tr('找不到成交结算', 'Deal settlement not found', "Penyelesaian tidak ditemui"), 'error');
      return false;
    }
    const previous = application.deal_finance;
    if (!previous.finance_completed_at) {
      triggerToast(tr('请先完成财务结算', 'Complete finance settlement first', "Selesaikan kewangan dahulu"), 'error');
      return false;
    }
    if (previous.commission_paid_at) return true;
    return saveDealFinanceInternal(applicationId, { ...previous, commission_paid_at: new Date().toISOString().slice(0, 10) });
  };

  const handleDeleteVehicleCatalogItem = (id: string) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = vehicleCatalog.find((item) => item.id === id);
    if (!previous) {
      return;
    }
    if ((previous.stock_units || []).length > 0) {
      triggerToast(tr('这个车型还有库存记录，不能删除', 'This model still has stock records and cannot be deleted', "Model ini masih mempunyai rekod stok dan tidak boleh dipadamkan"), 'error');
      return;
    }

    const nextCatalog = vehicleCatalog.filter((item) => item.id !== id);
    const normalizedCatalog = normalizeVehicleCatalogList(nextCatalog);

    updateVehicleCatalogState(nextCatalog);
    appendAuditLog({
      action: 'DELETE_VEHICLE_CATALOG',
      target_type: 'Vehicle Catalog',
      target_id: id,
      target_label: previous.model,
      changes: createAuditChanges(
        {
          model: previous.model,
          brand: previous.brand,
          body_type: previous.body_type,
          deleted: 'No'
        },
        { deleted: 'Yes' }
      ),
      stateOverrides: { vehicleCatalog: normalizedCatalog }
    });
    triggerToast(tr(`车辆 ${previous.model} 已删除`, `Vehicle ${previous.model} deleted`, `Kenderaan ${previous.model} dipadamkan`));
  };

  const handleAddBankDefinition = async (item: Pick<BankDefinition, 'name' | 'icon_data_url'>): Promise<boolean> => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return false;
    }

    const name = item.name.trim().replace(/\s+/g, ' ');
    if (!name) {
      triggerToast(tr('银行名称不能为空', 'Bank name is required', "Nama bank diperlukan"));
      return false;
    }

    const existing = bankDefinitions.find((bank) => bank.name.toLowerCase() === name.toLowerCase());
    const bankId = existing?.id || `BANK-${Date.now()}`;
    let iconDataUrl = item.icon_data_url || existing?.icon_data_url || '';
    if (iconDataUrl.startsWith('data:')) {
      try {
        iconDataUrl = await uploadBankIconToStorage(bankId, iconDataUrl);
      } catch (error) {
        console.warn('Bank icon upload failed.', error);
        triggerToast(tr(
          '银行图标上传失败，银行尚未保存。请重试。',
          'Bank icon upload failed, so the bank was not saved. Please try again.',
          'Muat naik ikon bank gagal, jadi bank belum disimpan. Sila cuba lagi.'
        ), 'error');
        return false;
      }
    }

    const nextBank: BankDefinition = {
      id: bankId,
      name,
      icon_data_url: iconDataUrl,
      active: existing?.active ?? true,
      created_at: existing?.created_at || new Date().toISOString()
    };
    const nextBanks = existing
      ? bankDefinitions.map((bank) => bank.id === existing.id ? nextBank : bank)
      : [...bankDefinitions, nextBank];
    const normalizedBanks = normalizeBankDefinitions(nextBanks);

    const saved = await updateBankDefinitionsState(nextBanks);
    if (!saved) {
      setBankDefinitions(bankDefinitions);
      writeLocalDashboardValue('bankDefinitions', bankDefinitions);
      triggerToast(tr(
        '银行资料未同步到云端，请重试。',
        'The bank was not synced to the cloud. Please try again.',
        'Bank tidak disegerakkan ke awan. Sila cuba lagi.'
      ), 'error');
      return false;
    }

    appendAuditLog({
      action: existing ? 'UPDATE_BANK_DEFINITION' : 'ADD_BANK_DEFINITION',
      target_type: 'Bank Definition',
      target_id: nextBank.id,
      target_label: nextBank.name,
      changes: createAuditChanges(
        existing ? {
          name: existing.name,
          icon: existing.icon_data_url ? 'Custom icon' : 'Default icon',
          active: existing.active
        } : {},
        {
          name: nextBank.name,
          icon: nextBank.icon_data_url ? 'Custom icon' : 'Default icon',
          active: nextBank.active
        }
      ),
      stateOverrides: { bankDefinitions: normalizedBanks }
    });
    triggerToast(tr(`银行 ${name} 已保存`, `Bank ${name} saved`, `Bank ${name} disimpan`));
    return true;
  };

  const handleUpdateBankDefinition = async (id: string, updates: Partial<BankDefinition>): Promise<boolean> => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return false;
    }

    const previous = bankDefinitions.find((item) => item.id === id);
    if (!previous) {
      return false;
    }

    let nextIconDataUrl = updates.icon_data_url ?? previous.icon_data_url;
    if (nextIconDataUrl.startsWith('data:')) {
      try {
        nextIconDataUrl = await uploadBankIconToStorage(id, nextIconDataUrl);
      } catch (error) {
        console.warn('Bank icon upload failed.', error);
        triggerToast(tr(
          '银行图标上传失败，请重试。',
          'Bank icon upload failed. Please try again.',
          'Muat naik ikon bank gagal. Sila cuba lagi.'
        ), 'error');
        return false;
      }
    }

    const updatedBank: BankDefinition = {
      ...previous,
      ...updates,
      name: (updates.name || previous.name).trim().replace(/\s+/g, ' '),
      icon_data_url: nextIconDataUrl,
      active: updates.active ?? previous.active
    };

    if (!updatedBank.name) {
      triggerToast(tr('银行名称不能为空', 'Bank name is required', "Nama bank diperlukan"));
      return false;
    }

    const duplicated = bankDefinitions.some((bank) => (
      bank.id !== id &&
      bank.name.toLowerCase() === updatedBank.name.toLowerCase()
    ));

    if (duplicated) {
      triggerToast(tr('银行名称已存在', 'Bank name already exists', "Nama bank sudah wujud"));
      return false;
    }

    const nextBanks = bankDefinitions.map((bank) => bank.id === id ? updatedBank : bank);
    const normalizedBanks = normalizeBankDefinitions(nextBanks);

    const saved = await updateBankDefinitionsState(nextBanks);
    if (!saved) {
      setBankDefinitions(bankDefinitions);
      writeLocalDashboardValue('bankDefinitions', bankDefinitions);
      triggerToast(tr(
        '银行资料未同步到云端，请重试。',
        'The bank update was not synced to the cloud. Please try again.',
        'Kemas kini bank tidak disegerakkan ke awan. Sila cuba lagi.'
      ), 'error');
      return false;
    }

    appendAuditLog({
      action: 'UPDATE_BANK_DEFINITION',
      target_type: 'Bank Definition',
      target_id: id,
      target_label: updatedBank.name,
      changes: createAuditChanges(
        {
          name: previous.name,
          icon: previous.icon_data_url ? 'Custom icon' : 'Default icon',
          active: previous.active
        },
        {
          name: updatedBank.name,
          icon: updatedBank.icon_data_url ? 'Custom icon' : 'Default icon',
          active: updatedBank.active
        }
      ),
      stateOverrides: { bankDefinitions: normalizedBanks }
    });
    triggerToast(tr(`银行 ${updatedBank.name} 已更新`, `Bank ${updatedBank.name} updated`, `Bank ${updatedBank.name} dikemas kini`));
    return true;
  };

  const handleDeleteBankDefinition = (id: string) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = bankDefinitions.find((item) => item.id === id);
    if (!previous || bankDefinitions.length <= 1) {
      return;
    }

    const nextBanks = bankDefinitions.filter((item) => item.id !== id);
    const normalizedBanks = normalizeBankDefinitions(nextBanks);

    updateBankDefinitionsState(nextBanks);
    appendAuditLog({
      action: 'DELETE_BANK_DEFINITION',
      target_type: 'Bank Definition',
      target_id: id,
      target_label: previous.name,
      changes: createAuditChanges(
        {
          name: previous.name,
          icon: previous.icon_data_url ? 'Custom icon' : 'Default icon',
          active: previous.active,
          deleted: 'No'
        },
        { deleted: 'Yes' }
      ),
      stateOverrides: { bankDefinitions: normalizedBanks }
    });
    triggerToast(tr(`银行 ${previous.name} 已删除`, `Bank ${previous.name} deleted`, `Bank ${previous.name} dipadamkan`));
  };

  const handleAddMarketingTagRelationship = (item: Pick<MarketingTagRelationship, 'source' | 'medium' | 'category'>) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const source = item.source.trim().replace(/\s+/g, ' ');
    if (!source) {
      triggerToast(tr('来源不能为空', 'Source is required', "Sumber diperlukan"));
      return;
    }

    const existing = marketingTagRelationships.find((relationship) => relationship.source.toLowerCase() === source.toLowerCase());
    const nextItem: MarketingTagRelationship = {
      id: existing?.id || `MKT-${Date.now()}`,
      source,
      medium: item.medium.trim() || 'Other',
      category: item.category.trim() || 'Lead source',
      created_at: existing?.created_at || new Date().toISOString()
    };
    const nextRelationships = existing
      ? marketingTagRelationships.map((relationship) => relationship.id === existing.id ? nextItem : relationship)
      : [...marketingTagRelationships, nextItem];
    const normalizedRelationships = normalizeMarketingTagRelationships(nextRelationships);

    updateMarketingTagRelationshipsState(nextRelationships);
    appendAuditLog({
      action: existing ? 'UPDATE_MARKETING_TAG_RELATIONSHIP' : 'ADD_MARKETING_TAG_RELATIONSHIP',
      target_type: 'Marketing Tag Relationship',
      target_id: nextItem.id,
      target_label: nextItem.source,
      changes: createAuditChanges(
        existing ? {
          source: existing.source,
          medium: existing.medium,
          category: existing.category
        } : {},
        {
          source: nextItem.source,
          medium: nextItem.medium,
          category: nextItem.category
        }
      ),
      stateOverrides: { marketingTagRelationships: normalizedRelationships }
    });
    triggerToast(tr(`营销关系 ${source} 已保存`, `Marketing relationship ${source} saved`, `Hubungan pemasaran ${source} disimpan`));
  };

  const handleUpdateMarketingTagRelationship = (id: string, updates: Partial<MarketingTagRelationship>) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = marketingTagRelationships.find((item) => item.id === id);
    if (!previous) {
      return;
    }

    const updatedItem: MarketingTagRelationship = {
      ...previous,
      ...updates,
      source: (updates.source || previous.source).trim().replace(/\s+/g, ' '),
      medium: (updates.medium || previous.medium).trim() || 'Other',
      category: (updates.category || previous.category).trim() || 'Lead source'
    };

    if (!updatedItem.source) {
      triggerToast(tr('来源不能为空', 'Source is required', "Sumber diperlukan"));
      return;
    }

    const duplicated = marketingTagRelationships.some((item) => (
      item.id !== id &&
      item.source.toLowerCase() === updatedItem.source.toLowerCase()
    ));

    if (duplicated) {
      triggerToast(tr('来源已存在', 'Source already exists', "Sumber sudah wujud"));
      return;
    }

    const nextRelationships = marketingTagRelationships.map((item) => item.id === id ? updatedItem : item);
    const normalizedRelationships = normalizeMarketingTagRelationships(nextRelationships);

    updateMarketingTagRelationshipsState(nextRelationships);
    appendAuditLog({
      action: 'UPDATE_MARKETING_TAG_RELATIONSHIP',
      target_type: 'Marketing Tag Relationship',
      target_id: id,
      target_label: updatedItem.source,
      changes: createAuditChanges(
        {
          source: previous.source,
          medium: previous.medium,
          category: previous.category
        },
        {
          source: updatedItem.source,
          medium: updatedItem.medium,
          category: updatedItem.category
        }
      ),
      stateOverrides: { marketingTagRelationships: normalizedRelationships }
    });
    triggerToast(tr(`营销关系 ${updatedItem.source} 已更新`, `Marketing relationship ${updatedItem.source} updated`, `Hubungan pemasaran ${updatedItem.source} dikemas kini`));
  };

  const handleDeleteMarketingTagRelationship = (id: string) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = marketingTagRelationships.find((item) => item.id === id);
    if (!previous || marketingTagRelationships.length <= 1) {
      return;
    }

    const nextRelationships = marketingTagRelationships.filter((item) => item.id !== id);
    const normalizedRelationships = normalizeMarketingTagRelationships(nextRelationships);

    updateMarketingTagRelationshipsState(nextRelationships);
    appendAuditLog({
      action: 'DELETE_MARKETING_TAG_RELATIONSHIP',
      target_type: 'Marketing Tag Relationship',
      target_id: id,
      target_label: previous.source,
      changes: createAuditChanges(
        {
          source: previous.source,
          medium: previous.medium,
          category: previous.category,
          deleted: 'No'
        },
        { deleted: 'Yes' }
      ),
      stateOverrides: { marketingTagRelationships: normalizedRelationships }
    });
    triggerToast(tr(`营销关系 ${previous.source} 已删除`, `Marketing relationship ${previous.source} deleted`, `Hubungan pemasaran ${previous.source} dipadamkan`));
  };

  const handleAddTagNormalizationRule = (rule: Omit<TagNormalizationRule, 'id' | 'created_at'>) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const rawValue = rule.raw_value.trim().replace(/\s+/g, ' ');
    if (!rawValue) {
      triggerToast(tr('原始值不能为空', 'Raw value is required', "Nilai mentah diperlukan"));
      return;
    }

    const existing = tagNormalizationRules.find((item) => (
      item.domain === rule.domain &&
      item.raw_value.trim().replace(/\s+/g, ' ').toLowerCase() === rawValue.toLowerCase()
    ));
    const nextRule: TagNormalizationRule = {
      id: existing?.id || `NORM-${Date.now()}`,
      domain: rule.domain,
      raw_value: rawValue,
      normalized_tag: rule.normalized_tag.trim().replace(/\s+/g, ' ') || rawValue,
      parent_tag: rule.parent_tag.trim().replace(/\s+/g, ' ') || 'Other',
      category: rule.category.trim().replace(/\s+/g, ' ') || 'Other',
      active: rule.active !== false,
      created_at: existing?.created_at || new Date().toISOString()
    };
    const nextRules = existing
      ? tagNormalizationRules.map((item) => item.id === existing.id ? nextRule : item)
      : [...tagNormalizationRules, nextRule];
    const normalizedRules = normalizeTagNormalizationRules(nextRules);

    updateTagNormalizationRulesState(nextRules);
    appendAuditLog({
      action: existing ? 'UPDATE_TAG_NORMALIZATION_RULE' : 'ADD_TAG_NORMALIZATION_RULE',
      target_type: 'Tag Normalization Rule',
      target_id: nextRule.id,
      target_label: `${nextRule.domain}: ${nextRule.raw_value}`,
      changes: createAuditChanges(
        existing ? {
          domain: existing.domain,
          raw_value: existing.raw_value,
          normalized_tag: existing.normalized_tag,
          parent_tag: existing.parent_tag,
          category: existing.category,
          active: existing.active
        } : {},
        {
          domain: nextRule.domain,
          raw_value: nextRule.raw_value,
          normalized_tag: nextRule.normalized_tag,
          parent_tag: nextRule.parent_tag,
          category: nextRule.category,
          active: nextRule.active
        }
      ),
      stateOverrides: { tagNormalizationRules: normalizedRules }
    });
    triggerToast(tr(`归一化规则 ${rawValue} 已保存`, `Normalization rule ${rawValue} saved`, `Peraturan penormalan ${rawValue} disimpan`));
  };

  const handleUpdateTagNormalizationRule = (id: string, updates: Partial<TagNormalizationRule>) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = tagNormalizationRules.find((item) => item.id === id);
    if (!previous) {
      return;
    }

    const updatedRule: TagNormalizationRule = {
      ...previous,
      ...updates,
      domain: updates.domain || previous.domain,
      raw_value: (updates.raw_value || previous.raw_value).trim().replace(/\s+/g, ' '),
      normalized_tag: (updates.normalized_tag || previous.normalized_tag).trim().replace(/\s+/g, ' '),
      parent_tag: (updates.parent_tag || previous.parent_tag).trim().replace(/\s+/g, ' '),
      category: (updates.category || previous.category).trim().replace(/\s+/g, ' '),
      active: updates.active ?? previous.active
    };

    if (!updatedRule.raw_value) {
      triggerToast(tr('原始值不能为空', 'Raw value is required', "Nilai mentah diperlukan"));
      return;
    }

    const duplicated = tagNormalizationRules.some((item) => (
      item.id !== id &&
      item.domain === updatedRule.domain &&
      item.raw_value.trim().replace(/\s+/g, ' ').toLowerCase() === updatedRule.raw_value.toLowerCase()
    ));

    if (duplicated) {
      triggerToast(tr('同一个类别下已有这个原始值', 'This raw value already exists in this domain', "Nilai mentah ini sudah wujud dalam domain ini"));
      return;
    }

    const nextRules = tagNormalizationRules.map((item) => item.id === id ? updatedRule : item);
    const normalizedRules = normalizeTagNormalizationRules(nextRules);

    updateTagNormalizationRulesState(nextRules);
    appendAuditLog({
      action: 'UPDATE_TAG_NORMALIZATION_RULE',
      target_type: 'Tag Normalization Rule',
      target_id: id,
      target_label: `${updatedRule.domain}: ${updatedRule.raw_value}`,
      changes: createAuditChanges(
        {
          domain: previous.domain,
          raw_value: previous.raw_value,
          normalized_tag: previous.normalized_tag,
          parent_tag: previous.parent_tag,
          category: previous.category,
          active: previous.active
        },
        {
          domain: updatedRule.domain,
          raw_value: updatedRule.raw_value,
          normalized_tag: updatedRule.normalized_tag,
          parent_tag: updatedRule.parent_tag,
          category: updatedRule.category,
          active: updatedRule.active
        }
      ),
      stateOverrides: { tagNormalizationRules: normalizedRules }
    });
    triggerToast(tr(`归一化规则 ${updatedRule.raw_value} 已更新`, `Normalization rule ${updatedRule.raw_value} updated`, `Peraturan penormalan ${updatedRule.raw_value} dikemas kini`));
  };

  const handleDeleteTagNormalizationRule = (id: string) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = tagNormalizationRules.find((item) => item.id === id);
    if (!previous || tagNormalizationRules.length <= 1) {
      return;
    }

    const nextRules = tagNormalizationRules.filter((item) => item.id !== id);
    const normalizedRules = normalizeTagNormalizationRules(nextRules);

    updateTagNormalizationRulesState(nextRules);
    appendAuditLog({
      action: 'DELETE_TAG_NORMALIZATION_RULE',
      target_type: 'Tag Normalization Rule',
      target_id: id,
      target_label: `${previous.domain}: ${previous.raw_value}`,
      changes: createAuditChanges(
        {
          domain: previous.domain,
          raw_value: previous.raw_value,
          normalized_tag: previous.normalized_tag,
          parent_tag: previous.parent_tag,
          category: previous.category,
          deleted: 'No'
        },
        { deleted: 'Yes' }
      ),
      stateOverrides: { tagNormalizationRules: normalizedRules }
    });
    triggerToast(tr(`归一化规则 ${previous.raw_value} 已删除`, `Normalization rule ${previous.raw_value} deleted`, `Peraturan penormalan ${previous.raw_value} dipadamkan`));
  };

  const handleAddWhatsAppTrackingLink = (link: WhatsAppTrackingLink) => {
    updateWhatsAppTrackingLinksState([link, ...whatsAppTrackingLinks]);
    appendAuditLog({
      action: 'ADD_WHATSAPP_LINK',
      target_type: 'WhatsApp Link',
      target_id: link.id,
      target_label: link.label,
      changes: createAuditChanges({}, link as unknown as Record<string, unknown>),
      stateOverrides: { whatsAppTrackingLinks: [link, ...whatsAppTrackingLinks] }
    });
    triggerToast(tr(`WhatsApp 链接 ${link.label} 已创建`, `WhatsApp link ${link.label} created`, `Pautan WhatsApp ${link.label} dibuat`));
  };

  const handleUpdateWhatsAppTrackingLink = (id: string, updates: Partial<WhatsAppTrackingLink>) => {
    const previous = whatsAppTrackingLinks.find((link) => link.id === id);
    updateWhatsAppTrackingLinksState(whatsAppTrackingLinks.map((link) => (
      link.id === id
        ? { ...link, ...updates }
        : link
    )));

    if (previous) {
      appendAuditLog({
        action: 'UPDATE_WHATSAPP_LINK',
        target_type: 'WhatsApp Link',
        target_id: id,
        target_label: previous.label,
        changes: createAuditChanges(previous as unknown as Record<string, unknown>, {
          ...previous,
          ...updates
        } as unknown as Record<string, unknown>),
        stateOverrides: {
          whatsAppTrackingLinks: whatsAppTrackingLinks.map((link) => (
            link.id === id
              ? { ...link, ...updates }
              : link
          ))
        }
      });
    }
  };

  const handleDeleteWhatsAppTrackingLink = async (id: string) => {
    const target = whatsAppTrackingLinks.find((link) => link.id === id);

    if (await showConfirm({
      eyebrow: tr('WhatsApp 链接', 'WhatsApp Link', 'Pautan WhatsApp'),
      title: tr('删除 WhatsApp 链接？', 'Delete WhatsApp link?', 'Padam pautan WhatsApp?'),
      message: tr(`确认删除「${target?.label || id}」？`, `Delete "${target?.label || id}"?`, `Padam "${target?.label || id}"?`),
      tone: 'danger',
      confirmLabel: tr('删除链接', 'Delete Link', 'Padam Pautan')
    })) {
      updateWhatsAppTrackingLinksState(whatsAppTrackingLinks.filter((link) => link.id !== id));
      appendAuditLog({
        action: 'DELETE_WHATSAPP_LINK',
        target_type: 'WhatsApp Link',
        target_id: id,
        target_label: target?.label || id,
        changes: [
          {
            field: 'record',
            old_value: target ? `${target.label} / ${target.channel} / ${target.medium} / ${target.campaign}` : id,
            new_value: 'Deleted'
          }
        ],
        stateOverrides: { whatsAppTrackingLinks: whatsAppTrackingLinks.filter((link) => link.id !== id) }
      });
      triggerToast(tr(`WhatsApp 链接 ${target?.label || id} 已删除`, `WhatsApp link ${target?.label || id} deleted`, `Pautan WhatsApp ${target?.label || id} dipadamkan`));
    }
  };

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
  const stableHandleAddCustomer = useStableCallback(handleAddCustomer);
  const stableHandleCreateCustomerIntakeShortLink = useStableCallback(handleCreateCustomerIntakeShortLink);
  const stableHandleAddVehicleCatalogItem = useStableCallback(handleAddVehicleCatalogItem);
  const stableHandleAddCustomerActivityComment = useStableCallback(handleAddCustomerActivityComment);
  const stableHandleSaveApplication = useStableCallback(handleSaveApplication);

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
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 max-w-md w-full text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">{appText.openingWhatsApp}</h1>
          <p className="text-sm text-slate-500">
            {redirectStatus === 'waiting' && appText.trackingWaiting}
            {redirectStatus === 'redirecting' && appText.trackingRedirecting}
            {redirectStatus === 'inactive' && appText.trackingInactive}
            {redirectStatus === 'missing' && appText.trackingMissing}
          </p>
          {redirectTargetUrl && (
            <a
              href={redirectTargetUrl}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
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
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 max-w-md w-full text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Link2 className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">{appText.openingIntakeLink}</h1>
          <p className="text-sm text-slate-500">
            {shortLinkRedirectStatus === 'waiting' && appText.shortLinkWaiting}
            {shortLinkRedirectStatus === 'redirecting' && appText.shortLinkRedirecting}
            {shortLinkRedirectStatus === 'missing' && appText.shortLinkMissing}
          </p>
          {shortLinkRedirectTargetUrl && (
            <a
              href={shortLinkRedirectTargetUrl}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
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
        />
      </Suspense>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <DrRacingLogo className="mb-3 h-28 w-auto max-w-[220px]" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">{appText.loginTitle}</h1>
              <p className="text-xs text-slate-500">{appText.loginSubtitle}</p>
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
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
                className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-red-100 focus:bg-white focus:ring-2 focus:ring-red-50"
                placeholder={tr('username 或 name@example.com', 'username or name@example.com', 'nama pengguna atau name@example.com')}
                aria-label={tr('用户名或 Email', 'Username or email', 'Nama pengguna atau e-mel')}
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 pl-4 pr-28 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-red-100 focus:bg-white focus:ring-2 focus:ring-red-50"
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
                  className="absolute inset-y-1 right-1 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[11px] font-bold text-slate-500 transition-colors hover:bg-white hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-100"
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
                disabled={isPasswordResetSubmitting}
                className="text-[11px] font-bold text-red-800 transition-colors hover:text-red-900 disabled:text-slate-400"
              >
                {isPasswordResetSubmitting
                  ? tr('发送中...', 'Sending...', 'Menghantar...')
                  : tr('忘记密码？', 'Forgot password?', 'Lupa kata laluan?')}
              </button>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <span>
                <span className="block text-xs font-bold text-slate-700">{tr('记住我', 'Remember me', "Ingat saya")}</span>
                <span className="mt-0.5 block text-[11px] font-semibold text-slate-500">
                  {tr('下次保留 email 和登录状态。', 'Keep email and login session for next time.', "Simpan e-mel dan sesi log masuk untuk kali seterusnya.")}
                </span>
              </span>
              <input
                type="checkbox"
                checked={rememberLogin}
                onChange={(event) => setRememberLogin(event.target.checked)}
                className="peer sr-only"
              />
              <span className="relative h-5 w-9 shrink-0 rounded-full bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-100" />
            </label>

            {loginError && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold leading-relaxed text-rose-700">
                {loginError}
              </div>
            )}
            {passwordResetMessage && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold leading-relaxed text-emerald-700">
                {passwordResetMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoginSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-800 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-900 disabled:cursor-wait disabled:bg-slate-300"
            >
              <KeyRound className="h-4 w-4" />
              {isLoginSubmitting ? tr('登录中...', 'Logging in...', "Log masuk...") : tr('登录', 'Log in', "Log masuk")}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-slate-500">
            {isFirebaseConfigured
              ? tr('密码由 Firebase Auth 管理，系统只保存角色映射。', 'Passwords are managed by Firebase Auth. This system stores role mapping only.', "Kata laluan diurus oleh Firebase Auth. Sistem ini menyimpan pemetaan peranan sahaja.")
              : appText.defaultAccount}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-ui flex min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans selection:bg-red-800 selection:text-white">
      {isCompactViewport ? (
        <Suspense fallback={<PageLoading />}>
          <MobileAppShell
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
                canViewAllCalendar={isOperationsLead(currentStaff.role)}
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
                events={attendanceEvents}
                schedules={attendanceSchedules}
                leaveRequests={staffLeaveRequests}
                roleAccounts={roleAccounts}
                currentStaffName={currentStaff.name}
                currentStaffRole={currentStaff.role}
                canViewAll={isOperationsLead(currentStaff.role)}
                canManageSchedules={currentStaff.role === 'Super Admin' || currentStaff.role === 'Admin'}
                attendancePolicy={attendancePolicy}
                currentNetworkIp={clientContext.ip_address}
                onRecordAttendance={handleRecordAttendance}
                onSaveWeeklySchedules={handleSaveAttendanceSchedules}
                onSubmitLeaveRequest={handleSubmitStaffLeaveRequest}
                onReviewLeaveRequest={handleReviewStaffLeaveRequest}
                onUpdateAttendancePolicy={handleUpdateAttendancePolicy}
              />
            )}
          />
        </Suspense>
      ) : (
        <>
      
      {/* Left-Side Navigation Rail - Clean Minimalism Theme */}
      <nav className="hidden md:flex w-48 bg-white border-r border-slate-100 flex-col py-5 justify-between shrink-0 z-20">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-3 pb-2">
          <div className="mb-5 px-2">
            <DrRacingLogo className="h-16 w-full object-left" />
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{appText.dashboard}</p>
          </div>

          <div className="mb-4 h-px w-full bg-slate-100" />

          {/* Nav Items (grouped, flattened sub-pages) */}
          {([
            {
              caption: appText.navGroupWork,
              items: [
                { key: 'taskInbox', page: 'taskInbox', icon: Inbox, label: appText.taskInbox },
                { key: 'staffView', page: 'staffView', icon: Smartphone, label: appText.staffView },
                { key: 'customers', page: 'customers', icon: Users, label: appText.customers },
                { key: 'calendar', page: 'calendar', icon: CalendarDays, label: appText.calendar },
                { key: 'attendance', page: 'attendance', icon: Clock, label: appText.attendance }
              ]
            },
            {
              caption: appText.navGroupMarketing,
              items: [
                { key: 'analytics', page: 'tools', icon: BarChart3, label: appText.analytics, onSelect: () => setActiveToolsView('analytics'), activeOverride: activePage === 'tools' && activeToolsView === 'analytics' },
                { key: 'payouts', page: 'rewards', icon: BadgeDollarSign, label: appText.payoutCenter, onSelect: () => setActiveRewardCenterView('payouts'), activeOverride: activePage === 'rewards' && activeRewardCenterView === 'payouts' },
                { key: 'rewardMissions', page: 'rewards', icon: Target, label: appText.missionsNav, onSelect: () => setActiveRewardCenterView('missions'), activeOverride: activePage === 'rewards' && activeRewardCenterView === 'missions' },
                { key: 'teamBattle', page: 'rewards', icon: Trophy, label: appText.teamBattleNav, onSelect: () => setActiveRewardCenterView('team_battle'), activeOverride: activePage === 'rewards' && activeRewardCenterView === 'team_battle' }
              ]
            },
            {
              caption: appText.navGroupOps,
              items: [
                { key: 'financeCenter', page: 'financeCenter', icon: WalletCards, label: appText.financeCenter },
                { key: 'approvals', page: 'tools', icon: CheckCircle2, label: appText.approvals, onSelect: () => setActiveToolsView('approvals'), activeOverride: activePage === 'tools' && activeToolsView === 'approvals' },
                { key: 'missingInfo', page: 'tools', icon: AlertTriangle, label: appText.missingInfoSummary, onSelect: () => setActiveToolsView('missions'), activeOverride: activePage === 'tools' && activeToolsView === 'missions' },
                { key: 'audit', page: 'tools', icon: FileClock, label: appText.auditLog, onSelect: () => setActiveToolsView('audit'), activeOverride: activePage === 'tools' && activeToolsView === 'audit' },
                { key: 'dataExport', page: 'tools', icon: Download, label: appText.dataExportNav, onSelect: () => setActiveToolsView('dataExport'), activeOverride: activePage === 'tools' && activeToolsView === 'dataExport' },
                { key: 'staffExperience', page: 'staffExperience', icon: Trophy, iconKey: 'staffExperience', label: tr('员工 EXP', 'Staff EXP', 'EXP Kakitangan') },
                { key: 'salesBudget', page: 'salesBudget', icon: ReceiptText, label: appText.salesBudget }
              ]
            },
            {
              caption: appText.navGroupConfig,
              items: [
                { key: 'vehicleInfo', page: 'tags', icon: Bike, label: appText.vehicleInfoNav, onSelect: () => setActiveSettingGroup('info'), activeOverride: activePage === 'tags' && activeSettingGroup === 'info' },
                { key: 'bankDatabase', page: 'tags', icon: Building2, label: appText.bankDatabaseNav, onSelect: () => setActiveSettingGroup('bank'), activeOverride: activePage === 'tags' && (activeSettingGroup === 'bank' || activeSettingGroup === 'code' || activeSettingGroup === 'brandLogo') },
                { key: 'rolesAccounts', page: 'tags', icon: ShieldCheck, label: appText.rolesAccountsNav, onSelect: () => setActiveSettingGroup('roles'), activeOverride: activePage === 'tags' && activeSettingGroup === 'roles' },
                { key: 'commissionRules', page: 'tags', icon: BadgeDollarSign, label: tr('佣金规则', 'Commission Rules', 'Peraturan Komisen'), onSelect: () => setActiveSettingGroup('commissionRules'), activeOverride: activePage === 'tags' && activeSettingGroup === 'commissionRules' },
                { key: 'permissions', page: 'permissions', icon: KeyRound, label: appText.permissionsNav },
                { key: 'notificationSettings', page: 'notificationSettings', icon: Bell, label: appText.notificationSettingsNav }
              ]
            },
            {
              caption: appText.navGroupSystem,
              items: [
                { key: 'manual', page: 'flow', icon: Workflow, label: appText.manual },
                { key: 'user', page: 'user', icon: UserCircle, label: appText.user, onSelect: () => setActiveUserView('profile'), activeOverride: activePage === 'user' }
              ]
            }
          ] as const)
            .map((group) => ({ caption: group.caption, items: group.items.filter((item) => !V1_HIDDEN_NAV_KEYS.has(item.key) && canAccessNavKey(item.key)) }))
            .filter((group) => group.items.length > 0)
            .map((group) => (
            <div key={group.caption} className="mb-3">
              <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">{group.caption}</p>
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
                    className={`desktop-sidebar-nav-item group mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs font-bold cursor-pointer transition-all duration-200 ${
                      isItemActive
                        ? 'is-active text-white'
                        : 'text-slate-500 hover:text-red-800 hover:bg-red-50'
                    }`}
                    title={item.label}
                  >
                    <NavIconImage
                      plain
                      active={isItemActive}
                      className="relative z-10 h-7 w-7"
                      fallback={<item.icon className="relative z-10 h-[18px] w-[18px]" />}
                      iconKey={'iconKey' in item ? item.iconKey : item.key}
                    />
                    <span className="relative z-10">{item.label}</span>
                    {item.key === 'taskInbox' && taskInboxTaskCount > 0 && (
                      <span
                        data-testid="task-inbox-nav-badge"
                        aria-hidden="true"
                        className={`relative z-10 ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums ${
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
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer transition-all duration-200"
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
            className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-2.5 py-2.5 text-left text-slate-700 transition-colors hover:bg-red-50 hover:text-red-800"
            title={appText.userProfile}
          >
            <StaffAvatar
              name={currentStaff.name}
              avatarDataUrl={currentRoleAccount?.avatar_data_url}
              className="h-8 w-8 border-slate-100"
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-bold text-slate-900">{currentStaff.name}</p>
              <p className="truncate text-[11px] font-semibold text-slate-500">
                {getRoleDisplayLabel(currentStaff.role, language)}
              </p>
            </div>
          </button>
        </div>
      </nav>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Header Banner */}
        <header className="h-16 px-8 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-10">
          <div aria-hidden="true" />

          <div className="flex items-center space-x-6 text-xs text-slate-500">
            {/* System Info */}
            <div className="hidden lg:flex items-center gap-2">
              <NavIconImage
                active
                className="h-5 w-5"
                fallback={<Clock className={`w-3.5 h-3.5 ${syncStatus === 'error' ? 'text-rose-500' : 'text-slate-500'}`} />}
                iconKey="syncStatus"
              />
              <span className={`font-semibold ${syncStatus === 'error' ? 'font-bold text-rose-600' : ''}`}>
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
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 ring-1 ring-rose-100 transition-colors hover:bg-rose-100"
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
              className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border text-slate-500 transition-colors ${
                isNotificationCenterOpen
                  ? 'border-red-800 bg-red-800 text-white'
                  : 'border-slate-100 bg-white hover:border-red-100 hover:bg-red-50 hover:text-red-800'
              }`}
              title={tr('通知中心', 'Notification Center', "Pusat Pemberitahuan")}
            >
              <NavIconImage
                active
                className="h-7 w-7"
                fallback={null}
                iconKey="bell"
              />
              {taskInboxTaskCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white shadow-sm">
                  {taskInboxTaskCount > 99 ? '99+' : taskInboxTaskCount}
                </span>
              )}
            </button>

            {isNotificationCenterOpen && (
              <Suspense fallback={null}>
                <NotificationCenter
                  tasks={taskInboxMirrorItems}
                  onClose={() => setIsNotificationCenterOpen(false)}
                  onOpenTaskInbox={() => {
                    setIsNotificationCenterOpen(false);
                    navigateToPageIfAllowed('taskInbox', 'taskInbox');
                  }}
                />
              </Suspense>
            )}

            <button
              type="button"
              onClick={() => setActivePage('user')}
              className="flex items-center space-x-3 rounded-xl border border-slate-100/50 bg-slate-50 px-3 py-1.5 text-left transition-colors hover:border-red-100 hover:bg-red-50"
              title={appText.userProfile}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <StaffAvatar
                name={currentStaff.name}
                avatarDataUrl={currentRoleAccount?.avatar_data_url}
                className="h-8 w-8"
                textClassName="text-[11px]"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-slate-700">{currentStaff.name}</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {getRoleDisplayLabel(currentStaff.role, language)}
                </span>
              </div>
            </button>
            <button
              id="logout-btn"
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
            >
              <NavIconImage
                active
                className="h-5 w-5"
                fallback={null}
                iconKey="logout"
              />
              {appText.logout}
            </button>
          </div>
        </header>

        {/* Content body container */}
        <main className="w-full max-w-[1600px] flex-1 space-y-8 p-4 pb-28 md:mx-auto md:p-8">
          <Suspense fallback={<PageLoading />}>
            {activePage === 'taskInbox' && !canAccessNavKey('taskInbox') ? (
              renderNoAccess()
            ) : activePage === 'taskInbox' ? (
              <TaskInboxPage
                applications={applications}
                calendarNotes={calendarNotes}
                rawCustomerLeads={staffVisibleRawCustomerLeads}
                rawCustomerMatches={staffVisibleRawCustomerMatches}
                roleAccounts={roleAccounts}
                roleNavAccess={roleNavAccess}
                customMissions={customMissions}
                notifications={taskInboxNotifications}
                attendanceEvents={attendanceEvents}
                attendanceIncidentResolutions={attendanceIncidentResolutions}
                currentStaffName={taskInboxScopeName}
                currentStaffRole={taskInboxScopeRole}
                managementStaffName={currentStaff.name}
                viewerStaffName={currentStaff.name}
                viewerStaffRole={currentStaff.role}
                canFilterStaffScope={currentStaff.role === 'Super Admin'}
                onStaffScopeChange={setTaskInboxStaffName}
                onOpenApplication={(application, target) => handleOpenApplicationTarget(
                  application,
                  false,
                  target === 'documentChecklist',
                  target === 'addBank',
                  target === 'bankApplications'
                )}
                onOpenMissions={V1_HIDDEN_NAV_KEYS.has('rewardMissions') ? undefined : () => {
                  if (navigateToPageIfAllowed('rewardMissions', 'rewards')) {
                    setActiveRewardCenterView('missions');
                  }
                }}
                onOpenNotification={handleOpenNotificationTarget}
                onOpenWhatsApp={handleOpenRawLeadWhatsApp}
                onUpdateLead={handleUpdateRawLeadFollowUp}
                onReleaseLead={handleReleaseRawLead}
                onImportLeads={handleImportRawCustomerLeads}
                onAddLead={handleAddRawCustomerLead}
                onAssignPrivateLeads={handleAssignPrivateRawLeads}
                onDeleteLead={handleDeleteRawLead}
                onDeleteLeads={handleDeleteRawLeads}
                onCompleteCashAcceptance={handleCompleteCashAcceptanceFromTaskInbox}
                onAssignApplicationHandler={(applicationId, handlerName) => handleInlineUpdateApplication(applicationId, {
                  handler_name: handlerName
                })}
                onAssignApplicationAdmin={handleAssignApplicationAdmin}
                vehicleCatalog={vehicleCatalog}
                onMarkBikeDelivered={handleMarkBikeDeliveredFromTaskInbox}
                onOpenFinanceStock={(model) => {
                  if (navigateToPageIfAllowed('financeCenter', 'financeCenter')) {
                    setFinanceStockModel(model || '');
                    setFinanceStockRequestId((current) => current + 1);
                  }
                }}
                onQuickAddStock={handleQuickAddStockForModel}
                onOpenFinanceDeal={() => {
                  navigateToPageIfAllowed('financeCenter', 'financeCenter');
                }}
                onMarkCommissionPaid={handleMarkCommissionPaidFromTaskInbox}
                onSaveDealFinance={handleSaveDealFinance}
                onUpdateMissingInfo={stableHandleUpdateMissingInfoFromTaskInbox}
                onAddCalendarTaskComment={handleAddCalendarTaskComment}
                onSetCalendarNoteCompleted={handleSetCalendarNoteCompleted}
                onResolveMissingCheckout={handleResolveMissingCheckout}
                approvalRequests={approvalRequests}
                onReviewApproval={(id, decision) => handleReviewApprovalRequest(id, decision, '')}
                staffLeaveRequests={staffLeaveRequests}
                onReviewLeaveRequest={(id, decision) => handleReviewStaffLeaveRequest(id, decision, '')}
                onVisibleTasksChange={setTaskInboxMirrorItems}
              />
            ) : activePage === 'staffView' ? (
              <StaffMobileView
                applications={applications}
                rawCustomerLeads={staffVisibleRawCustomerLeads}
                customMissions={customMissions}
                currentStaffName={currentStaff.name}
                currentStaffRole={currentStaff.role}
                onOpenApplication={(application) => {
                  if (navigateToPageIfAllowed('customers', 'customers')) {
                    handleSelectRow(application);
                  }
                }}
                onOpenMissions={V1_HIDDEN_NAV_KEYS.has('rewardMissions') ? undefined : () => {
                  if (navigateToPageIfAllowed('rewardMissions', 'rewards')) {
                    setActiveRewardCenterView('missions');
                  }
                }}
                onOpenWhatsApp={handleOpenRawLeadWhatsApp}
                onUpdateLead={handleUpdateRawLeadFollowUp}
              />
            ) : activePage === 'customers' && !canAccessNavKey('customers') ? (
              renderNoAccess()
            ) : activePage === 'customers' ? (
              <CustomerList
                language={language}
                applications={visibleApplications}
                canEditCustomers={currentStaff.role === 'Super Admin'}
                canAddCustomer={canAccessNavKey('customers.addCustomer')}
                canShareCustomerLinks={canAccessNavKey('customers.shareLinks')}
                currentStaffName={currentStaff.name}
                currentStaffRole={currentStaff.role}
                defaultHandlerName={currentStaff.name}
                defaultHandlerRole={currentStaff.role}
                showAllApplications={showAllApplications}
                vehicleCatalog={vehicleCatalog}
                bankDefinitions={bankDefinitions}
                roleAccounts={roleAccounts}
                errorCodeIssueMap={errorCodeIssueMap}
                riskFlagsByApplicationId={customerRiskFlagsByApplicationId}
                rawMatchesByApplicationId={rawCustomerMatchesByApplicationId}
                onToggleShowAllApplications={handleToggleShowAllApplications}
                onSelectCustomer={stableHandleSelectRow}
                onUpdateCustomer={stableHandleUpdateCustomerProfile}
                onUpdateLoanApplication={stableHandleInlineUpdateApplication}
                onAddCustomer={stableHandleAddCustomer}
                onCreateCustomerIntakeShortLink={stableHandleCreateCustomerIntakeShortLink}
              />
            ) : activePage === 'rawCustomers' && !canAccessNavKey('rawCustomers') ? (
              renderNoAccess()
            ) : activePage === 'rawCustomers' ? (
              <RawCustomerDatabase
                rawCustomers={staffVisibleRawCustomerLeads}
                rawMatchesByLeadId={rawCustomerMatchesByLeadId}
                roleAccounts={roleAccounts}
                currentStaffName={currentStaff.name}
                currentStaffRole={currentStaff.role}
                canImportLeads
                onImportLeads={handleImportRawCustomerLeads}
                onAddLead={handleAddRawCustomerLead}
                onOpenWhatsApp={handleOpenRawLeadWhatsApp}
              />
            ) : activePage === 'customerRelationships' && !canAccessNavKey('customerRelationships') ? (
              renderNoAccess()
            ) : activePage === 'customerRelationships' ? (
              <CustomerRelationshipRiskPage
                applications={applications}
                rawCustomerLeads={rawCustomerLeads}
                rawCustomerMatches={rawCustomerMatches}
                roleAccounts={roleAccounts}
                currentStaffName={currentStaff.name}
                currentStaffRole={currentStaff.role}
                onOpenApplication={(application) => handleOpenApplicationTarget(application)}
                onOpenLeadPool={() => navigateToPageIfAllowed('rawCustomers', 'rawCustomers')}
                onDeleteLead={handleDeleteRawLead}
              />
            ) : activePage === 'calendar' && !canAccessNavKey('calendar') ? (
              renderNoAccess()
            ) : activePage === 'calendar' ? (
              <CalendarPage
                applications={calendarApplications}
                rawCustomerLeads={visibleCalendarRawCustomerLeads}
                calendarNotes={calendarNotes}
                roleAccounts={roleAccounts}
                currentStaffName={currentStaff.name}
                currentStaffRole={currentStaff.role}
                canViewAllCalendar={isOperationsLead(currentStaff.role)}
                onAddCalendarNote={handleAddCalendarNote}
                onDeleteCalendarNote={handleDeleteCalendarNote}
                onSetCalendarNoteCompleted={handleSetCalendarNoteCompleted}
                onAddCalendarTaskComment={handleAddCalendarTaskComment}
                onSelectApplication={(application) => {
                  if (canAccessNavKey('customers')) {
                    stableHandleSelectRow(application);
                  } else {
                    triggerToast(tr('当前角色没有权限打开贷款申请详情。', 'Your role cannot open loan application details.', 'Peranan anda tidak boleh membuka butiran permohonan pinjaman.'), 'error');
                  }
                }}
              />
            ) : activePage === 'attendance' && !canAccessNavKey('attendance') ? (
              renderNoAccess()
            ) : activePage === 'attendance' ? (
              <AttendancePage
                events={attendanceEvents}
                schedules={attendanceSchedules}
                leaveRequests={staffLeaveRequests}
                roleAccounts={roleAccounts}
                currentStaffName={currentStaff.name}
                currentStaffRole={currentStaff.role}
                canViewAll={isOperationsLead(currentStaff.role)}
                canManageSchedules={currentStaff.role === 'Super Admin' || currentStaff.role === 'Admin'}
                attendancePolicy={attendancePolicy}
                currentNetworkIp={clientContext.ip_address}
                onRecordAttendance={handleRecordAttendance}
                onSaveWeeklySchedules={handleSaveAttendanceSchedules}
                onSubmitLeaveRequest={handleSubmitStaffLeaveRequest}
                onReviewLeaveRequest={handleReviewStaffLeaveRequest}
                onUpdateAttendancePolicy={handleUpdateAttendancePolicy}
              />
            ) : activePage === 'financeCenter' ? (
              canAccessNavKey('financeCenter') ? (
                <FinanceCenter
                  applications={applications}
                  vehicleCatalog={vehicleCatalog}
                  commissionRules={commissionRules}
                  currentStaffName={currentStaff.name}
                  canManage={isOperationsLead(currentStaff.role)}
                  onSaveStockUnits={handleSaveVehicleStockUnits}
                  onSaveDealFinance={handleSaveDealFinance}
                  onOpenApplication={(application) => handleOpenApplicationTarget(application)}
                  canOpenVehicleInfo={canAccessNavKey('vehicleInfo')}
                  onOpenVehicleInfo={() => {
                    if (navigateToPageIfAllowed('vehicleInfo', 'tags')) {
                      setActiveSettingGroup('info');
                    }
                  }}
                  stockTabRequestId={financeStockRequestId}
                  stockFocusModel={financeStockModel}
                  onQuickAddStock={handleQuickAddStock}
                  commissionPanel={(
                    <RewardCommissionCenter
                      embedded
                      applications={applications}
                      rawCustomerLeads={staffVisibleRawCustomerLeads}
                      customMissions={customMissions}
                      rewardTeams={rewardTeams}
                      approvalRequests={approvalRequests}
                      roleAccounts={roleAccounts}
                      currentStaffName={currentStaff.name}
                      currentStaffRole={currentStaff.role}
                      canViewAllRewards={isOperationsLead(currentStaff.role)}
                      canManageRewardTeams={currentStaff.role === 'Super Admin'}
                      canManageCustomMissions={currentStaff.role === 'Super Admin'}
                      commissionRules={commissionRules}
                      initialTab="payouts"
                      onAddRewardTeam={handleAddRewardTeam}
                      onUpdateRewardTeam={handleUpdateRewardTeam}
                      onDeleteRewardTeam={handleDeleteRewardTeam}
                      onAddCustomMission={handleAddCustomMission}
                      onUpdateCustomMission={handleUpdateCustomMission}
                      onSubmitMissionReward={handleSubmitMissionReward}
                      onOpenApplication={(application) => {
                        if (canAccessNavKey('customers')) {
                          stableHandleSelectRow(application);
                        } else {
                          triggerToast(tr('当前角色没有权限打开贷款申请详情。', 'Your role cannot open loan application details.', 'Peranan anda tidak boleh membuka butiran permohonan pinjaman.'), 'error');
                        }
                      }}
                      onOpenApprovals={() => {
                        // Approvals page is hidden in V1; pending approvals live in the Task Inbox.
                        setActivePage('taskInbox');
                      }}
                    />
                  )}
                />
              ) : renderNoAccess()
            ) : activePage === 'tags' ? (
              !canAccessNavKey(SETTING_GROUP_NAV_KEY[activeSettingGroup]) ? renderNoAccess() :
              <TagsAdmin
                applications={applications}
                vehicleCatalog={vehicleCatalog}
                financeProfiles={financeProfiles}
                vehicleCategories={vehicleCategories}
                onUpdateVehicleCategories={handleUpdateVehicleCategories}
                vehicleBrandLogos={vehicleBrandLogos}
                onUpdateVehicleBrandLogo={handleUpdateVehicleBrandLogo}
                currentStaffName={currentStaff.name}
                bankDefinitions={bankDefinitions}
                vehicleTags={vehicleTags}
                vehicleBrandTags={vehicleBrandTags}
                errorCodeDefinitions={errorCodeDefinitions}
                roleAccounts={roleAccounts}
                roleNavAccess={roleNavAccess}
                defaultAvatars={defaultAvatarLibrary}
                marketingTagRelationships={marketingTagRelationships}
                tagNormalizationRules={tagNormalizationRules}
                whatsAppTrackingLinks={whatsAppTrackingLinks}
                whatsAppTrackingClicks={whatsAppTrackingClicks}
                canManageTags={currentStaff.role === 'Super Admin'}
                commissionRules={commissionRules}
                onUpdateCommissionRules={handleUpdateCommissionRules}
                canAccessGroup={(group) => canAccessNavKey(SETTING_GROUP_NAV_KEY[group])}
                initialGroup={activeSettingGroup}
                onGroupChange={setActiveSettingGroup}
                initialRoleTab={activeRoleTab}
                onRoleTabChange={setActiveRoleTab}
                onUpdateVehicleTags={handleUpdateVehicleTags}
                onUpdateVehicleBrandTags={handleUpdateVehicleBrandTags}
                onAddErrorCodeDefinition={handleAddErrorCodeDefinition}
                onUpdateErrorCodeDefinition={handleUpdateErrorCodeDefinition}
                onDeleteErrorCodeDefinition={handleDeleteErrorCodeDefinition}
                onCreateFirebaseAuthUser={handleCreateFirebaseAuthUser}
                onResetFirebaseAuthPassword={handleResetFirebaseAuthPassword}
                onUpdateRoleAccount={handleUpdateRoleAccount}
                onDeleteRoleAccount={handleDeleteRoleAccount}
                onUpdateRoleNavAccess={handleUpdateRoleNavAccess}
                staffWorkload={staffWorkload}
                staffWorkloadCases={staffWorkloadCases}
                onTransferWorkload={handleTransferWorkload}
                onTransferWorkloadCase={handleTransferWorkloadCase}
                onAddDefaultAvatar={handleAddDefaultAvatar}
                onDeleteDefaultAvatar={handleDeleteDefaultAvatar}
                onAddVehicleCatalogItem={handleAddVehicleCatalogItem}
                onRenameVehicleModel={handleRenameVehicleModel}
                onOpenApplication={(application) => {
                  if (!isApplicationOwnedByCurrentStaff(application)) {
                    return;
                  }
                  if (currentStaff.role === 'Super Admin') {
                    setShowAllApplications(true);
                  }
                  if (navigateToPageIfAllowed('customers', 'customers')) {
                    handleSelectRow(application);
                  }
                }}
                onUpdateVehicleCatalogItem={handleUpdateVehicleCatalogItem}
                onMergeVehicleCatalogItems={handleMergeVehicleCatalogItems}
                onDeleteVehicleCatalogItem={handleDeleteVehicleCatalogItem}
                onUpdateFinanceProfileTerm={handleUpdateFinanceProfileTerm}
                onAddBankDefinition={handleAddBankDefinition}
                onUpdateBankDefinition={handleUpdateBankDefinition}
                onDeleteBankDefinition={handleDeleteBankDefinition}
                onAddMarketingTagRelationship={handleAddMarketingTagRelationship}
                onUpdateMarketingTagRelationship={handleUpdateMarketingTagRelationship}
                onDeleteMarketingTagRelationship={handleDeleteMarketingTagRelationship}
                onAddTagNormalizationRule={handleAddTagNormalizationRule}
                onUpdateTagNormalizationRule={handleUpdateTagNormalizationRule}
                onDeleteTagNormalizationRule={handleDeleteTagNormalizationRule}
              />
            ) : activePage === 'permissions' ? (
              canAccessNavKey('permissions') ? (
                <PermissionMatrixPage
                  permissions={rolePermissions}
                  currentStaffName={currentStaff.name}
                  canManagePermissions={currentStaff.role === 'Super Admin'}
                  onUpdatePermissions={handleUpdateRolePermissions}
                />
              ) : renderNoAccess()
            ) : activePage === 'roleAccess' ? (
              canAccessNavKey('roleAccess') ? (
                <RoleAccessControlPage
                  settings={roleNavAccess}
                  currentStaffName={currentStaff.name}
                  canManage={currentStaff.role === 'Super Admin'}
                  onUpdate={handleUpdateRoleNavAccess}
                />
              ) : renderNoAccess()
            ) : activePage === 'notificationSettings' ? (
              canAccessNavKey('notificationSettings') ? (
                <NotificationSettingsPage
                  notifications={notifications}
                  roleAccounts={roleAccounts}
                />
              ) : renderNoAccess()
            ) : activePage === 'rewards' && V1_HIDDEN_NAV_KEYS.has('rewards') ? (
              renderNoAccess()
            ) : activePage === 'rewards' ? (
              <RewardCommissionCenter
                applications={applications}
                rawCustomerLeads={staffVisibleRawCustomerLeads}
                customMissions={customMissions}
                rewardTeams={rewardTeams}
                approvalRequests={approvalRequests}
                roleAccounts={roleAccounts}
                currentStaffName={currentStaff.name}
                currentStaffRole={currentStaff.role}
                canViewAllRewards={currentStaff.role === 'Super Admin'}
                canManageRewardTeams={currentStaff.role === 'Super Admin'}
                canManageCustomMissions={currentStaff.role === 'Super Admin'}
                commissionRules={commissionRules}
                initialTab={activeRewardCenterView}
                onTabChange={setActiveRewardCenterView}
                onAddRewardTeam={handleAddRewardTeam}
                onUpdateRewardTeam={handleUpdateRewardTeam}
                onDeleteRewardTeam={handleDeleteRewardTeam}
                onAddCustomMission={handleAddCustomMission}
                onUpdateCustomMission={handleUpdateCustomMission}
                onSubmitMissionReward={handleSubmitMissionReward}
                onOpenApplication={(application) => {
                  if (canAccessNavKey('customers')) {
                    stableHandleSelectRow(application);
                  } else {
                    triggerToast(tr('当前角色没有权限打开贷款申请详情。', 'Your role cannot open loan application details.', 'Peranan anda tidak boleh membuka butiran permohonan pinjaman.'), 'error');
                  }
                }}
                onOpenApprovals={() => {
                  // Sales land on their own approvals; admins see the active queue.
                  setApprovalPreset({ filter: currentStaff.role === 'Sales' ? 'mine' : 'active', token: Date.now() });
                  setActivePage('tools');
                  setActiveToolsView('approvals');
                }}
              />
            ) : activePage === 'salesBudget' ? (
              canAccessNavKey('salesBudget') ? <SalesBudgetPage /> : renderNoAccess()
            ) : activePage === 'staffExperience' ? (
              currentStaff.role === 'Super Admin' && canAccessNavKey('staffExperience') ? (
                <StaffExperienceDashboard
                  events={completedTaskEventsForExperience}
                  roleAccounts={roleAccounts}
                  rules={staffExperienceRules}
                  onSaveRules={handleUpdateStaffExperienceRules}
                />
              ) : renderNoAccess()
            ) : activePage === 'tools' ? (
              <div id="tools-page" className="space-y-6">
                {/* Desktop navigates via the flat sidebar; header + tab bar only show on mobile. */}
                <section className="flex flex-col gap-4 md:hidden">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{appText.toolsTitle}</h2>
                    <p className="max-w-2xl text-xs font-light leading-relaxed text-slate-500">
                      {appText.toolsSubtitle}
                    </p>
                  </div>
                </section>

                <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-100 bg-white p-1 shadow-2xs md:hidden">
                  {[
                    { key: 'analytics' as ToolsView, navKey: 'analytics', label: appText.analytics, iconKey: 'analytics', fallback: <BarChart3 key="analytics" className="h-4 w-4" /> },
                    { key: 'missions' as ToolsView, navKey: 'missingInfo', label: appText.missingInfoSummary, iconKey: 'missionTarget', fallback: <ClipboardList key="missions" className="h-4 w-4" /> },
                    { key: 'approvals' as ToolsView, navKey: 'approvals', label: appText.approvals, iconKey: 'approvalOverview', fallback: <ShieldCheck key="approvals" className="h-4 w-4" /> },
                    { key: 'whatsapp' as ToolsView, navKey: 'whatsapp', label: appText.whatsAppTools, iconKey: 'whatsapp', fallback: <MessageCircle key="whatsapp" className="h-4 w-4" /> },
                    { key: 'audit' as ToolsView, navKey: 'audit', label: appText.auditLog, iconKey: 'audit', fallback: <FileClock key="audit" className="h-4 w-4" /> },
                    { key: 'dataExport' as ToolsView, navKey: 'dataExport', label: appText.dataExportNav, iconKey: 'allChannels', fallback: <Download key="dataExport" className="h-4 w-4" /> }
                  ]
                    .filter((item) => !V1_HIDDEN_NAV_KEYS.has(item.navKey) && canAccessNavKey(item.navKey))
                    .map(({ key, label, iconKey, fallback }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveToolsView(key)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                        activeToolsView === key
                          ? 'bg-red-800 text-white'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <NavIconImage
                        active={activeToolsView === key}
                        className="h-5 w-5"
                        fallback={fallback}
                        iconKey={iconKey}
                      />
                      {label}
                    </button>
                  ))}
                </section>

                {activeToolsView === 'whatsapp' && !canAccessNavKey('whatsapp') ? (
                  renderNoAccess()
                ) : activeToolsView === 'whatsapp' ? (
                  <WhatsAppTrackingAdmin
                    links={whatsAppTrackingLinks}
                    clicks={whatsAppTrackingClicks}
                    currentStaffName={currentStaff.name}
                    defaultMessage={currentWhatsAppDefaultMessage}
                    onUpdateDefaultMessage={updateWhatsAppDefaultMessageState}
                    onAddLink={handleAddWhatsAppTrackingLink}
                    onUpdateLink={handleUpdateWhatsAppTrackingLink}
                    onDeleteLink={handleDeleteWhatsAppTrackingLink}
                    onCreateShortLink={handleCreateWhatsAppShortLink}
                  />
                ) : activeToolsView === 'audit' ? (
                  canAccessNavKey('audit') ? <AuditLogAdmin logs={auditLogs} /> : renderNoAccess()
                ) : activeToolsView === 'dataExport' && !canAccessNavKey('dataExport') ? (
                  null
                ) : activeToolsView === 'dataExport' ? (
                  <DataExportCenter
                    datasets={[
                      {
                        key: 'customers',
                        label: tr('客户与贷款申请', 'Customers & Loan Applications', "Pelanggan & Permohonan Pinjaman"),
                        description: tr('全部客户资料、贷款与银行申请进度。', 'All customer records with loan and bank application progress.', "Semua rekod pelanggan dengan kemajuan permohonan pinjaman dan bank."),
                        filename: 'customers',
                        rows: analyticsApplications
                      },
                      {
                        key: 'attendance',
                        label: tr('员工考勤', 'Staff Attendance', "Kehadiran Kakitangan"),
                        description: tr('全员 Check in / Check out 记录，日期与时间分栏。', 'Team Check in / Check out records with separate date and time columns.', "Rekod Check in / Check out pasukan dengan lajur tarikh dan masa berasingan."),
                        filename: 'staff_attendance',
                        rows: attendanceEvents.map((event) => {
                          const occurred = splitMalaysiaDateTime(event.occurred_at);
                          const created = splitMalaysiaDateTime(event.created_at);
                          return {
                            record_id: event.id,
                            staff_name: event.staff_name,
                            staff_role: event.staff_role,
                            action: event.action,
                            occurred_date: occurred.date,
                            occurred_time: occurred.time,
                            note: event.note,
                            created_date: created.date,
                            created_time: created.time
                          };
                        })
                      },
                      {
                        key: 'attendanceMonthly',
                        permissionKey: 'attendance',
                        label: tr('员工每月考勤汇总', 'Monthly Staff Attendance', "Ringkasan Kehadiran Bulanan Kakitangan"),
                        description: tr('按月份与员工汇总排班、Off Day、总工时、30–59 分钟 / 60 分钟以上迟到次数和扣款。', 'Schedules, Off Days, total time, 30–59 minute / 60+ minute late counts, and deductions for every staff member and month.', "Jadual, Hari Cuti, jumlah masa, kiraan lewat 30–59 minit / 60+ minit dan potongan bagi setiap kakitangan dan bulan."),
                        filename: 'staff_attendance_monthly_summary',
                        rows: monthlyAttendanceExportRows
                      },
                      {
                        key: 'staffLeave',
                        label: tr('员工 Leave / MC / OT', 'Staff Leave / MC / OT', "Cuti / MC / OT Kakitangan"),
                        description: tr('全员 Leave / MC / OT 申请与审批结果，日期与时间分栏。', 'Team Leave / MC / OT requests and decisions with separate date and time columns.', "Permohonan dan keputusan Cuti / MC / OT pasukan dengan lajur tarikh dan masa berasingan."),
                        filename: 'staff_leave_mc_ot',
                        rows: staffLeaveRequests.map((request) => {
                          const meta = getStaffLeaveExportMeta(request);
                          const submitted = splitMalaysiaDateTime(request.submitted_at);
                          const reviewed = splitMalaysiaDateTime(request.reviewed_at);
                          const attachmentUploaded = splitMalaysiaDateTime(request.mc_attachment?.uploaded_at);
                          return {
                            record_id: request.id,
                            kind: meta.kind,
                            requester_name: request.requester_name,
                            requester_role: request.requester_role,
                            start_date: meta.start_date,
                            end_date: meta.end_date,
                            overtime_date: meta.overtime_date,
                            overtime_end_time: meta.overtime_end_time,
                            amount: request.amount,
                            amount_unit: meta.kind === 'OT' ? 'hours' : 'days',
                            status: request.status,
                            reason: request.reason,
                            submitted_date: submitted.date,
                            submitted_time: submitted.time,
                            reviewed_by: request.reviewed_by || '',
                            reviewed_role: request.reviewed_role || '',
                            reviewed_date: reviewed.date,
                            reviewed_time: reviewed.time,
                            review_note: request.review_note || '',
                            attachment_name: request.mc_attachment?.name || '',
                            attachment_type: request.mc_attachment?.type || '',
                            attachment_size_bytes: request.mc_attachment?.size || '',
                            attachment_uploaded_date: attachmentUploaded.date,
                            attachment_uploaded_time: attachmentUploaded.time
                          };
                        })
                      },
                      {
                        key: 'rawLeads',
                        label: tr('潜在客户名单（全部）', 'Leads (all)', "prospek (semua)"),
                        description: tr('所有渠道进来的潜在客户，含来源和负责人资料。', 'All leads from every channel, with source and assignment fields.', "Semua prospek dari setiap saluran, dengan medan sumber dan tugasan."),
                        filename: 'raw_leads',
                        rows: staffVisibleRawCustomerLeads
                      },
                      {
                        key: 'followUp',
                        label: tr('跟进中名单', 'Follow Up Leads', "prospek susulan"),
                        description: tr('已经有人在跟的名单，含跟进状态和备注。', 'Assigned leads with follow-up status and notes.', "Prospek yang ditugaskan, termasuk status susulan dan nota."),
                        filename: 'follow_up_leads',
                        rows: staffVisibleRawCustomerLeads.filter((lead) => lead.taken_by_staff_id)
                      },
                      {
                        key: 'vehicleCatalog',
                        label: tr('车辆目录', 'Vehicle Catalog', "Katalog Kenderaan"),
                        description: tr('车型、价格与分期资料。', 'Vehicle models with pricing and installment data.', "Model kenderaan dengan data harga dan ansuran."),
                        filename: 'vehicle_catalog',
                        rows: vehicleCatalog
                      },
                      {
                        key: 'approvals',
                        label: tr('审批记录', 'Approval Requests', "Permintaan Kelulusan"),
                        description: tr('全部审批申请与结果。', 'All approval requests and outcomes.', "Semua permintaan dan hasil kelulusan."),
                        filename: 'approvals',
                        rows: approvalRequests
                      },
                      {
                        key: 'auditLogs',
                        label: tr('审计记录', 'Audit Logs', "Log Audit"),
                        description: tr('谁在什么时候改了什么。', 'Who changed what, and when.', "Siapa yang mengubah apa, dan bila."),
                        filename: 'audit_logs',
                        rows: auditLogs
                      },
                      {
                        key: 'missions',
                        label: tr('任务', 'Missions', "Misi"),
                        description: tr('自定义任务与目标设置。', 'Custom missions and target settings.', "Misi tersuai dan tetapan sasaran."),
                        filename: 'missions',
                        rows: customMissions
                      },
                      {
                        key: 'whatsappLinks',
                        label: tr('WhatsApp 追踪链接', 'WhatsApp Tracking Links', "Pautan Penjejakan WhatsApp"),
                        description: tr('追踪链接设置。', 'Tracking link definitions.', "Definisi pautan penjejakan."),
                        filename: 'whatsapp_links',
                        rows: whatsAppTrackingLinks
                      },
                      {
                        key: 'whatsappClicks',
                        label: tr('WhatsApp 点击记录', 'WhatsApp Clicks', "Klik WhatsApp"),
                        description: tr('每次点击的时间与来源。', 'Every click with time and source.', "Setiap klik dengan masa dan sumber."),
                        filename: 'whatsapp_clicks',
                        rows: whatsAppTrackingClicks
                      },
                      {
                        key: 'banks',
                        label: tr('银行数据库', 'Bank Database', "Pangkalan Data Bank"),
                        description: tr('银行与产品设置。', 'Bank and product definitions.', "Definisi bank dan produk."),
                        filename: 'banks',
                        rows: bankDefinitions
                      },
                      {
                        key: 'rejectCodes',
                        label: tr('拒贷原因代码', 'Reject Reason Codes', "Tolak Kod Sebab"),
                        description: tr('拒贷原因代码定义。', 'Reject reason code definitions.', "Tolak definisi kod sebab."),
                        filename: 'reject_codes',
                        rows: errorCodeDefinitions
                      },
                      {
                        key: 'rewardTeams',
                        label: tr('战队设置', 'Reward Teams', "Pasukan Ganjaran"),
                        description: tr('战队与成员奖金设置。', 'Team battle and member bonus settings.', "Pertempuran pasukan dan tetapan bonus ahli."),
                        filename: 'reward_teams',
                        rows: rewardTeams
                      }
                    ].filter((dataset) => canAccessNavKey(`dataExport.${dataset.permissionKey || dataset.key}`))}
                  />
                ) : activeToolsView === 'missions' ? (
                  <MissionStatusPage
                    applications={applications}
                    rawCustomerLeads={staffVisibleRawCustomerLeads}
                    roleAccounts={roleAccounts}
                    customMissions={customMissions}
                    currentStaffName={currentStaff.name}
                    canViewAllMissions={currentStaff.role === 'Super Admin'}
                    canManageCustomMissions={currentStaff.role === 'Super Admin'}
                    mode="system_summary"
                    approvalRequests={approvalRequests}
                    onAddCustomMission={handleAddCustomMission}
                    onUpdateCustomMission={handleUpdateCustomMission}
                    onSubmitMissionReward={handleSubmitMissionReward}
                  />
                ) : activeToolsView === 'approvals' ? (
                  <ApprovalWorkflowPage
                    requests={approvalRequests}
                    applications={applications}
                    customMissions={customMissions}
                    roleAccounts={roleAccounts}
                    currentStaffName={currentStaff.name}
                    currentStaffRole={currentStaff.role}
                    canViewAllApprovals={currentStaff.role === 'Super Admin'}
                    onAddRequest={handleAddApprovalRequest}
                    onReviewRequest={handleReviewApprovalRequest}
                    presetFilter={approvalPreset.filter}
                    presetToken={approvalPreset.token}
                  />
                ) : !canAccessNavKey('analytics') ? (
                  renderNoAccess()
                ) : (
                  <AnalyticsDashboard
                    applications={analyticsApplications}
                    rawCustomerLeads={analyticsRawCustomerLeads}
                    errorCodeDefinitions={errorCodeDefinitions}
                    roleAccounts={analyticsRoleAccounts}
                    auditLogs={analyticsAuditLogs}
                    calendarNotes={analyticsCalendarNotes}
                    notifications={analyticsNotifications}
                    whatsAppTrackingLinks={analyticsWhatsAppTrackingLinks}
                    whatsAppTrackingClicks={analyticsWhatsAppTrackingClicks}
                    tagNormalizationRules={tagNormalizationRules}
                    canExportData={canAccessNavKey('dataExport.analyticsResults')}
                    scopeLabel={
                      canViewGlobalAnalytics
                        ? appText.allStaffAnalytics
                        : language === 'zh'
                          ? `${currentStaff.name} 的数据分析`
                          : language === 'ms'
                            ? `Analitik ${currentStaff.name}`
                            : `${currentStaff.name} Analytics`
                    }
                  />
                )}
              </div>
            ) : activePage === 'flow' && (V1_HIDDEN_NAV_KEYS.has('manual') || !canAccessNavKey('manual')) ? (
              renderNoAccess()
            ) : activePage === 'flow' ? (
              <FlowOverview
                applications={applications}
                rawCustomerCount={staffVisibleRawCustomerLeads.length}
                rawCustomerMatchCount={staffVisibleRawCustomerMatches.length}
                duplicatedRawPhoneCount={duplicatedRawPhoneCount}
                missingVehicleInfoMissionCount={missingVehicleInfoMissionCount}
                bankDefinitionCount={bankDefinitions.length}
                tagNormalizationRules={tagNormalizationRules}
                whatsAppTrackingLinks={whatsAppTrackingLinks}
                whatsAppTrackingClicks={whatsAppTrackingClicks}
                approvalRequestCount={approvalRequests.length}
                rewardTeamCount={rewardTeams.length}
                auditLogCount={auditLogs.length}
                roleAccountCount={roleAccounts.length}
              />
            ) : activePage === 'user' ? (
              <div id="user-workspace" className="space-y-6">
                <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-100 bg-white p-1 shadow-2xs">
                  {([
                    ['profile', tr('用户资料', 'User Profile', "Profil Pengguna"), 'user', <UserCircle key="user" />],
                    ...(canAccessNavKey('whatsapp') ? [['whatsapp', appText.whatsAppTools, 'whatsapp', <MessageCircle key="whatsapp" />]] : [])
                  ] as Array<['profile' | 'whatsapp', string, string, React.ReactNode]>).map(([key, label, iconKey, fallback]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveUserView(key)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${activeUserView === key ? 'bg-red-800 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                    >
                      <NavIconImage iconKey={iconKey} active={activeUserView === key} className="h-5 w-5" fallback={fallback} />
                      {label}
                    </button>
                  ))}
                </section>

                {activeUserView === 'whatsapp' && canAccessNavKey('whatsapp') ? (
                  <WhatsAppTrackingAdmin
                    links={whatsAppTrackingLinks}
                    clicks={whatsAppTrackingClicks}
                    currentStaffName={currentStaff.name}
                    defaultMessage={currentWhatsAppDefaultMessage}
                    onUpdateDefaultMessage={updateWhatsAppDefaultMessageState}
                    onAddLink={handleAddWhatsAppTrackingLink}
                    onUpdateLink={handleUpdateWhatsAppTrackingLink}
                    onDeleteLink={handleDeleteWhatsAppTrackingLink}
                    onCreateShortLink={handleCreateWhatsAppShortLink}
                  />
                ) : (
                  <UserProfilePage
                    currentStaffName={currentStaff.name}
                    currentStaffRole={currentStaff.role}
                    account={currentRoleAccount}
                    experience={currentStaffExperience}
                    defaultAvatars={defaultAvatarLibrary}
                    defaultAvatarUsage={defaultAvatarUsage}
                    onUpdateAvatar={handleUpdateCurrentUserAvatar}
                    onRemoveAvatar={handleRemoveCurrentUserAvatar}
                    leadFollowUpDays={leadFollowUpDays}
                    onUpdateLeadFollowUpDays={handleUpdateCurrentUserLeadFollowUpDays}
                    whatsAppOpenInNewTab={whatsAppOpenInNewTab}
                    onUpdateWhatsAppOpenMode={handleUpdateCurrentUserWhatsAppOpenMode}
                    canEditProfile={isFirebaseConfigured}
                    onUpdateProfile={handleUpdateCurrentStaffProfile}
                    canChangePassword={isFirebaseConfigured}
                    onChangePassword={handleChangeCurrentStaffPassword}
                  />
                )}
              </div>
            ) : null}
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
            onOpenTaskInbox={() => {
              setIsNotificationCenterOpen(false);
              navigateToPageIfAllowed('taskInbox', 'taskInbox');
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
            errorCodeDefinitions={errorCodeDefinitions}
            roleAccounts={roleAccounts}
            currentStaffName={currentStaff.name}
            currentStaffRole={currentStaff.role}
            scrollToActivityThreadRequest={activityThreadScrollRequest}
            scrollToDocumentChecklistRequest={documentChecklistScrollRequest}
            openBankApplicationsRequest={openBankApplicationsRequest}
            addBankRequest={addBankRequest}
            riskFlags={selectedApplication ? customerRiskFlagsByApplicationId[selectedApplication.id] || EMPTY_CUSTOMER_RISK_FLAGS : EMPTY_CUSTOMER_RISK_FLAGS}
            rawMatches={selectedApplication ? rawCustomerMatchesByApplicationId[selectedApplication.id] || EMPTY_CUSTOMER_RAW_MATCHES : EMPTY_CUSTOMER_RAW_MATCHES}
            onClose={handleCloseDrawer}
            onAddVehicleCatalogItem={stableHandleAddVehicleCatalogItem}
            onAddActivityComment={stableHandleAddCustomerActivityComment}
            commissionRules={commissionRules}
            onSaveDealFinance={handleSaveDealFinance}
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
            className={`flex max-w-sm translate-y-0 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-xs text-white opacity-100 shadow-lg transition duration-200 ease-out pointer-events-auto ${
              toast.tone === 'error'
                ? 'border-rose-900 bg-rose-950'
                : toast.tone === 'warning'
                  ? 'border-amber-600 bg-amber-700'
                  : 'border-slate-800 bg-red-800'
            }`}
          >
            <div className={`shrink-0 rounded-md p-1 ${
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
