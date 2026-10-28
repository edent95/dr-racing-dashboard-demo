/**
 * The staff dashboard's page content: the element App renders for the
 * active page (Home, Loan Applications, Calendar, Settings, ...). Moved
 * unchanged from App.tsx. It is a plain function, not a component: App
 * calls it during its own render exactly where the expression used to be,
 * so the element tree and its identity are unchanged.
 */
import { ADMIN_CROSS_SHOP_POOL_NAV_KEY, readAdminCrossShopPoolPreference, writeAdminCrossShopPoolPreference } from '../utils/adminUnclaimedPool';
import type * as React from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type * as Repository from '../services/dashboardRepository';
import type { DashboardState } from '../services/dashboardRepository';
import { type AppPage, SETTING_GROUP_NAV_KEY, type ToolsView } from '../hooks/useNavigationState';
import { type StaffSession } from '../hooks/useStaffSessionAuth';
import { type AppLanguage, tr } from '../lib/i18n';
import { type AttendanceEvent, type AttendanceIncidentResolution, type AttendanceNetworkCheck } from '../services/dashboardRepository';
import { ATTENDANCE_MAIN_TEAM_ID, type ApprovalRequest, type CommissionTierPlan, type ApprovalRequestStatus, type AttendancePolicy, type AttendanceWeeklySchedule, type AuditLogEntry, type BankDefinition, type CalendarNote, type CustomerRawMatch, type CustomerRiskFlag, type CustomMission, type DealFinance, type DeliveryStepKey, type ErrorCodeDefinition, type FinanceProfile, type FinanceProfileTerm, type LoanApplication, type LoanStatus, type MarketingTagRelationship, type NotificationItem, type PurchaseMethod, type QuickStockInput, type RawCustomerLead, type StockOrder, type RoleAccount, type RoleAccountRole, type RoleNavAccessSetting, type StaffWorkloadCase, type TagNormalizationRule, type VehicleCatalogItem, type VehicleCategory, type VehicleCondition, type VehicleStockUnit, type WhatsAppTrackingClick, type WhatsAppTrackingLink } from '../types';
import { type MissingCheckoutIncident, type MonthlyAttendanceExportRow } from '../utils/attendanceSummary';
import { type StaffExperienceProgress } from '../utils/staffExperience';
import { isOperationsLead } from '../utils/staffRoles';
import type { BankPageRequest } from '../utils/loanTableBankColumns';
import type { useDeliveryPaymentActions } from '../hooks/useDeliveryPaymentActions';
import { fetchLedgerStatus, fetchOpeningDepositExport, ledgerStockMessage, requestLedgerFullSync, requestLedgerStockSync } from '../lib/ledgerSync';
import { ledgerDeliveryMessage, requestLedgerDeliveryInvoice } from '../lib/ledgerDelivery';
import LedgerSyncPanel from './LedgerSyncPanel';
import { type RoleSettingsTab, type TagGroup } from './TagsAdmin';
import { AnalyticsDashboard, AttendancePage, AuditLogAdmin, CalendarPage, CustomerList, CustomerRelationshipRiskPage, DataExportCenter, FinanceCenter, RawCustomerDatabase, SettlementPage, StockPage, DeliveryPage, RewardCommissionCenter, RoleAccessControlPage, TagsAdmin, TaskInboxPage, UserProfilePage, WhatsAppTrackingAdmin } from './lazyPages';
import { BarChart3, Download, FileClock, MessageCircle, UserCircle } from 'lucide-react';
import CommissionTiersPanel from './CommissionTiersPanel';
import { buildCommissionTierSource, getTierCommissionUpdates, groupStaffByCommissionTierPlan, type CommissionTierSource } from '../utils/commissionTiers';


export interface DashboardPageContentDeps {
  currentStaff: StaffSession;
  activePage: AppPage;
  activeRoleTab: RoleSettingsTab;
  activeSettingGroup: TagGroup;
  activeToolsView: ToolsView;
  activeUserView: "profile" | "whatsapp";
  analyticsApplications: LoanApplication[];
  analyticsAuditLogs: AuditLogEntry[];
  analyticsCalendarNotes: CalendarNote[];
  analyticsNotifications: NotificationItem[];
  analyticsRawCustomerLeads: RawCustomerLead[];
  analyticsRoleAccounts: RoleAccount[];
  analyticsWhatsAppTrackingClicks: WhatsAppTrackingClick[];
  analyticsWhatsAppTrackingLinks: WhatsAppTrackingLink[];
  applications: LoanApplication[];
  approvalRequests: ApprovalRequest[];
  appText: { languageLabel: string; languageChinese: string; languageEnglish: string; languageMalay: string; themeLabel: string; lightTheme: string; darkTheme: string; dashboard: string; loginTitle: string; loginSubtitle: string; defaultAccount: string; taskInbox: string; customers: string; rawCustomers: string; customerRelationships: string; followUp: string; calendar: string; attendance: string; setting: string; tools: string; financeCenter: string; user: string; resetData: string; userProfile: string; logout: string; syncFirebase: string; syncCached: string; syncLocal: string; syncLoading: string; syncError: string; retrySync: string; saveFailedToast: string; saveConflictToast: string; retrySyncSuccess: string; navGroupWork: string; navGroupPerformance: string; navGroupMarketing: string; navGroupOps: string; navGroupConfig: string; navGroupSystem: string; vehicleInfoNav: string; bankDatabaseNav: string; rejectCodesNav: string; rolesAccountsNav: string; roleAccessNav: string; trackingWaiting: string; trackingRedirecting: string; trackingInactive: string; trackingMissing: string; openWhatsApp: string; openingIntakeLink: string; openForm: string; toolsTitle: string; toolsSubtitle: string; analytics: string; whatsAppTools: string; auditLog: string; dataExportNav: string; allStaffAnalytics: string; openingWhatsApp: string; shortLinkWaiting: string; shortLinkRedirecting: string; shortLinkMissing: string; customerIntakeTitle: string; customerIntakeSubmittedTo: string; customerIntakeStaffNote: string; seoIntakeStaffNote: string; customerLoanInfo: string; customerLoanInfoNote: string; personalInfo: string; fullName: string; phoneNumber: string; icNumber: string; email: string; maritalStatus: string; gender: string; race: string; bankName: string; bankAccountNumber: string; yearsAtResidence: string; housingStatus: string; fullAddress: string; emergencyContacts: string; emergencyContact1: string; emergencyContact2: string; relationship: string; employmentDetails: string; companyName: string; position: string; yearsEmployed: string; officePhone: string; workHours: string; grossMonthlySalary: string; netMonthlySalary: string; companyAddress: string; statusPreferences: string; availableToReceiveCalls: string; salaryPaymentMethod: string; preferredMotorcycle: string; loanTenure: string; notSet: string; submitApplication: string; submitted: string; reference: string; } | { languageLabel: string; languageChinese: string; languageEnglish: string; languageMalay: string; themeLabel: string; lightTheme: string; darkTheme: string; dashboard: string; loginTitle: string; loginSubtitle: string; defaultAccount: string; taskInbox: string; customers: string; rawCustomers: string; customerRelationships: string; followUp: string; calendar: string; attendance: string; setting: string; tools: string; financeCenter: string; user: string; resetData: string; userProfile: string; logout: string; syncFirebase: string; syncCached: string; syncLocal: string; syncLoading: string; syncError: string; retrySync: string; saveFailedToast: string; saveConflictToast: string; retrySyncSuccess: string; navGroupWork: string; navGroupPerformance: string; navGroupMarketing: string; navGroupOps: string; navGroupConfig: string; navGroupSystem: string; vehicleInfoNav: string; bankDatabaseNav: string; rejectCodesNav: string; rolesAccountsNav: string; roleAccessNav: string; trackingWaiting: string; trackingRedirecting: string; trackingInactive: string; trackingMissing: string; openWhatsApp: string; openingIntakeLink: string; openForm: string; toolsTitle: string; toolsSubtitle: string; analytics: string; whatsAppTools: string; auditLog: string; dataExportNav: string; allStaffAnalytics: string; openingWhatsApp: string; shortLinkWaiting: string; shortLinkRedirecting: string; shortLinkMissing: string; customerIntakeTitle: string; customerIntakeSubmittedTo: string; customerIntakeStaffNote: string; seoIntakeStaffNote: string; customerLoanInfo: string; customerLoanInfoNote: string; personalInfo: string; fullName: string; phoneNumber: string; icNumber: string; email: string; maritalStatus: string; gender: string; race: string; bankName: string; bankAccountNumber: string; yearsAtResidence: string; housingStatus: string; fullAddress: string; emergencyContacts: string; emergencyContact1: string; emergencyContact2: string; relationship: string; employmentDetails: string; companyName: string; position: string; yearsEmployed: string; officePhone: string; workHours: string; grossMonthlySalary: string; netMonthlySalary: string; companyAddress: string; statusPreferences: string; availableToReceiveCalls: string; salaryPaymentMethod: string; preferredMotorcycle: string; loanTenure: string; notSet: string; submitApplication: string; submitted: string; reference: string; } | { languageLabel: string; languageChinese: string; languageEnglish: string; languageMalay: string; themeLabel: string; lightTheme: string; darkTheme: string; dashboard: string; loginTitle: string; loginSubtitle: string; defaultAccount: string; taskInbox: string; customers: string; rawCustomers: string; customerRelationships: string; followUp: string; calendar: string; attendance: string; setting: string; tools: string; financeCenter: string; user: string; resetData: string; userProfile: string; logout: string; syncFirebase: string; syncCached: string; syncLocal: string; syncLoading: string; syncError: string; retrySync: string; saveFailedToast: string; saveConflictToast: string; retrySyncSuccess: string; navGroupWork: string; navGroupPerformance: string; navGroupMarketing: string; navGroupOps: string; navGroupConfig: string; navGroupSystem: string; vehicleInfoNav: string; bankDatabaseNav: string; rejectCodesNav: string; rolesAccountsNav: string; roleAccessNav: string; trackingWaiting: string; trackingRedirecting: string; trackingInactive: string; trackingMissing: string; openWhatsApp: string; openingIntakeLink: string; openForm: string; toolsTitle: string; toolsSubtitle: string; analytics: string; whatsAppTools: string; auditLog: string; dataExportNav: string; allStaffAnalytics: string; openingWhatsApp: string; shortLinkWaiting: string; shortLinkRedirecting: string; shortLinkMissing: string; customerIntakeTitle: string; customerIntakeSubmittedTo: string; customerIntakeStaffNote: string; seoIntakeStaffNote: string; customerLoanInfo: string; customerLoanInfoNote: string; personalInfo: string; fullName: string; phoneNumber: string; icNumber: string; email: string; maritalStatus: string; gender: string; race: string; bankName: string; bankAccountNumber: string; yearsAtResidence: string; housingStatus: string; fullAddress: string; emergencyContacts: string; emergencyContact1: string; emergencyContact2: string; relationship: string; employmentDetails: string; companyName: string; position: string; yearsEmployed: string; officePhone: string; workHours: string; grossMonthlySalary: string; netMonthlySalary: string; companyAddress: string; statusPreferences: string; availableToReceiveCalls: string; salaryPaymentMethod: string; preferredMotorcycle: string; loanTenure: string; notSet: string; submitApplication: string; submitted: string; reference: string; };
  attendanceNetworkCheck: AttendanceNetworkCheck;
  attendancePolicy: AttendancePolicy;
  auditLogs: AuditLogEntry[];
  availableDefaultAvatars: any[];
  bankDefinitions: BankDefinition[];
  calendarApplications: LoanApplication[];
  canViewAllStaffCalendar: boolean;
  calendarNotes: CalendarNote[];
  canAccessNavKey: (key: string) => boolean;
  canViewGlobalAnalytics: boolean;
  clientContext: { ip_address: string; user_agent: string; };
  currentRoleAccount: RoleAccount;
  currentStaffExperience: StaffExperienceProgress;
  currentWhatsAppDefaultMessage: string;
  customerRiskFlagsByApplicationId: Record<string, CustomerRiskFlag[]>;
  customMissions: CustomMission[];
  defaultAvatarUsage: Record<string, string>;
  errorCodeDefinitions: ErrorCodeDefinition[];
  errorCodeIssueMap: Record<string, ErrorCodeDefinition>;
  financeProfiles: FinanceProfile[];
  financeStockModel: string;
  financeStockRequestId: number;
  getStaffLeaveExportMeta: (request: ApprovalRequest) => { kind: string; start_date: string; end_date: string; overtime_date: string; overtime_end_time: string; };
  handleAddBankDefinition: (item: Pick<BankDefinition, "name" | "icon_data_url">) => Promise<boolean>;
  handleAddCalendarNote: (note: Pick<CalendarNote, "title" | "body" | "date_at" | "assigned_to" | "assigned_role">) => Promise<void>;
  handleAddCalendarTaskComment: (noteId: string, rawBody: string) => Promise<boolean>;
  handleAddErrorCodeDefinition: (definition: ErrorCodeDefinition) => void;
  handleAddMarketingTagRelationship: (item: Pick<MarketingTagRelationship, "source" | "medium" | "category">) => void;
  handleAddRawCustomerLead: (lead: RawCustomerLead, targetPool?: "public" | "private") => void;
  handleAddTagNormalizationRule: (rule: Omit<TagNormalizationRule, "id" | "created_at">) => void;
  handleAddVehicleCatalogItem: (item: Pick<VehicleCatalogItem, "model" | "body_type"> & Partial<VehicleCatalogItem>) => void;
  handleAddWhatsAppTrackingLink: (link: WhatsAppTrackingLink) => void;
  handleAssignApplicationAdmin: (applicationId: string, adminName: string) => Promise<void>;
  handleAssignPrivateRawLeads: (leads: RawCustomerLead[], assignedStaffId: string) => number;
  handleChangeCurrentStaffPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  handleCompleteCashAcceptanceFromTaskInbox: (application: LoanApplication, workflowAction?: 'COMPLETE_APPROVED_CONTACT' | 'NOTIFY_ADMIN' | 'APPROVE_CASH_PURCHASE') => Promise<boolean>;
  handleCreateFirebaseAuthUser: (account: Pick<RoleAccount, "id" | "name" | "email" | "role" | "default_avatar_id"> & { password?: string; }) => Promise<{ created: boolean; dashboardAccountId: string; email: string; name: string; role: RoleAccountRole; temporaryPassword: string; uid: string; }>;
  handleCreateWhatsAppShortLink: (fullUrl: string, link: WhatsAppTrackingLink) => Promise<string>;
  handleDeleteBankDefinition: (id: string) => void;
  handleDeleteCalendarNote: (noteId: string) => Promise<void>;
  handleDeleteErrorCodeDefinition: (code: string) => Promise<void>;
  handleDeleteMarketingTagRelationship: (id: string) => void;
  handleDeleteRawLead: (lead: RawCustomerLead) => boolean;
  handleDeleteRawLeads: (leads: RawCustomerLead[]) => number;
  handleDeleteRoleAccount: (id: string) => Promise<void>;
  handleDeleteTagNormalizationRule: (id: string) => void;
  handleDeleteVehicleCatalogItem: (id: string) => void;
  handleDeleteWhatsAppTrackingLink: (id: string) => Promise<void>;
  handleImportRawCustomerLeads: (leads: RawCustomerLead[], targetPool?: "public" | "private") => Promise<void>;
  handleInlineUpdateApplication: (id: string, updates: { status?: LoanStatus; remarks?: string; error_code?: string; error_codes?: string[]; handler_name?: string; handler_role?: string; }) => Promise<void>;
  handleMarkBikeDeliveredFromTaskInbox: (applicationId: string, stockUnitId: string) => Promise<boolean>;
  handleMarkCommissionPaidFromTaskInbox: (applicationId: string) => Promise<boolean>;
  commissionTiers: CommissionTierSource;
  commissionTierPlans: CommissionTierPlan[];
  handleSaveCommissionTiers: (plans: CommissionTierPlan[]) => Promise<boolean>;
  handleRecalculateTierCommissions: (tiers?: CommissionTierSource) => Promise<boolean>;
  handleMergeVehicleCatalogItems: (masterId: string, duplicateIds: string[]) => void;
  handleOpenApplicationTarget: (application: LoanApplication, scrollToActivityThread?: boolean, scrollToDocumentChecklist?: boolean, openAddBank?: boolean, openBankApplications?: boolean) => void;
  handleOpenNotificationTarget: (notification: NotificationItem) => void;
  handleOpenRawLeadWhatsApp: (lead: RawCustomerLead, target: "api" | "web") => void;
  handleQuickAddStock: (catalogId: string, input: QuickStockInput) => boolean;
  handleQuickAddStockForModel: (applicationId: string, model: string, input: QuickStockInput, options?: { stockOrder?: StockOrder }) => Promise<boolean>;
  handleRecordAttendance: (action: AttendanceEvent["action"], note: string) => Promise<boolean>;
  handleReleaseRawLead: (lead: RawCustomerLead) => void;
  handleRemoveCurrentUserAvatar: () => void;
  handleRenameVehicleModel: (oldModel: string, newModel: string) => void;
  handleResetFirebaseAuthPassword: (account: RoleAccount, password: string) => Promise<void>;
  handleResolveMissingCheckout: (incident: MissingCheckoutIncident) => Promise<boolean>;
  handleReviewApprovalRequest: (id: string, status: Extract<ApprovalRequestStatus, "Approved" | "Rejected" | "Cancelled">, reviewNote: string) => void;
  handleReviewStaffLeaveRequest: (requestId: string, status: ApprovalRequestStatus, reviewNote: string) => Promise<boolean>;
  handleSaveAttendanceSchedules: (draftSchedules: AttendanceWeeklySchedule[]) => Promise<boolean>;
  handleSaveDealFinance: (applicationId: string, draft: DealFinance) => Promise<boolean>;
  deliveryPaymentActions: ReturnType<typeof useDeliveryPaymentActions>;
  handleDeliverFromChecklist: (applicationId: string, stockUnitId: string, options?: { forceReason?: string }) => Promise<boolean>;
  handleSaveDeliveryStep: (applicationId: string, stepKey: DeliveryStepKey, update: { done: boolean; note?: string; data?: Record<string, string>; document_ids?: string[] }) => Promise<boolean>;
  handleSaveVehicleStockUnits: (updates: Array<{ catalogId: string; unit: VehicleStockUnit; }>) => boolean;
  handleSelectRow: (app: LoanApplication) => void;
  handleSetCalendarNoteCompleted: (noteId: string, completed: boolean) => Promise<void>;
  handleSubmitMissionReward: (mission: CustomMission, staffName: string) => void;
  handleSubmitStaffLeaveRequest: (draft: Omit<ApprovalRequest, "id" | "status" | "requester_name" | "requester_role" | "submitted_at">) => Promise<boolean>;
  handleTaskInboxVisibleTasksChange: () => void;
  handleToggleShowAllApplications: () => void;
  handleTransferWorkload: (sourceName: string, targetName: string) => void;
  handleTransferWorkloadCase: (sourceName: string, targetName: string, caseType: StaffWorkloadCase["type"], caseId: string) => void;
  handleUpdateAttendancePolicy: (nextPolicy: AttendancePolicy) => boolean;
  handleUpdateBankDefinition: (id: string, updates: Partial<BankDefinition>) => Promise<boolean>;
  handleUpdateCurrentStaffProfile: (name: string, email: string, currentPassword: string) => Promise<void>;
  handleUpdateCurrentUserAvatar: (avatarDataUrl: string, defaultAvatarId?: string) => void;
  handleAssignMissingAvatars: () => Promise<void>;
  handleUpdateCurrentUserLeadFollowUpDays: (days: number) => void;
  handleUpdateCurrentUserWhatsAppOpenMode: (openInNewTab: boolean) => void;
  handleUpdateErrorCodeDefinition: (code: string, updates: Partial<ErrorCodeDefinition>) => void;
  handleUpdateFinanceProfileTerm: (profileId: FinanceProfile["id"], years: FinanceProfileTerm["years"], updates: Partial<FinanceProfileTerm>) => void;
  handleUpdateMarketingTagRelationship: (id: string, updates: Partial<MarketingTagRelationship>) => void;
  handleUpdateRawLeadFollowUp: (leadId: string, updates: Partial<RawCustomerLead>) => void;
  handleUpdateRoleAccount: (id: string, updates: Partial<RoleAccount>) => Promise<boolean>;
  handleUpdateRoleNavAccess: (nextSettings: RoleNavAccessSetting[]) => void;
  handleUpdateTagNormalizationRule: (id: string, updates: Partial<TagNormalizationRule>) => void;
  handleUpdateVehicleBrandTags: (nextTags: string[]) => void;
  handleUpdateVehicleCatalogItem: (id: string, updates: Partial<VehicleCatalogItem>) => void;
  handleUpdateVehicleCategories: (nextCategories: VehicleCategory[]) => void;
  handleUpdateVehicleTags: (nextTags: string[]) => void;
  handleUpdateWhatsAppTrackingLink: (id: string, updates: Partial<WhatsAppTrackingLink>) => void;
  isApplicationOwnedByCurrentStaff: (application: LoanApplication) => boolean;
  isFirebaseConfigured: boolean;
  language: AppLanguage;
  leadFollowUpDays: number;
  marketingTagRelationships: MarketingTagRelationship[];
  monthlyAttendanceExportRows: MonthlyAttendanceExportRow[];
  NavIconImage: ({ className, fallback }: { active: boolean; className?: string; fallback: React.ReactNode; iconKey: string; plain?: boolean; }) => React.ReactElement<{ 'aria-hidden'?: boolean; className?: string; strokeWidth?: number; }, string | React.JSXElementConstructor<any>>;
  navigateToPageIfAllowed: (navKey: string, page: AppPage) => boolean;
  pendingRoleAccountUpdates: Record<string, Partial<RoleAccount>>;
  rawCustomerLeads: RawCustomerLead[];
  rawCustomerMatches: CustomerRawMatch[];
  rawCustomerMatchesByApplicationId: Record<string, CustomerRawMatch[]>;
  rawCustomerMatchesByLeadId: Record<string, CustomerRawMatch[]>;
  renderNoAccess: () => React.JSX.Element;
  roleAccounts: RoleAccount[];
  roleNavAccess: RoleNavAccessSetting[];
  setActivePage: React.Dispatch<React.SetStateAction<AppPage>>;
  setActiveRoleTab: React.Dispatch<React.SetStateAction<RoleSettingsTab>>;
  setActiveSettingGroup: React.Dispatch<React.SetStateAction<TagGroup>>;
  setActiveToolsView: React.Dispatch<React.SetStateAction<ToolsView>>;
  setActiveUserView: React.Dispatch<React.SetStateAction<"profile" | "whatsapp">>;
  setFinanceStockModel: React.Dispatch<React.SetStateAction<string>>;
  setFinanceStockRequestId: React.Dispatch<React.SetStateAction<number>>;
  deliveryFocusRequest: { id: number; applicationId: string } | null;
  setDeliveryFocusRequest: React.Dispatch<React.SetStateAction<{ id: number; applicationId: string } | null>>;
  setShowAllApplications: React.Dispatch<React.SetStateAction<boolean>>;
  setTaskInboxFocusRequest: React.Dispatch<React.SetStateAction<{ taskId: string; key: number; }>>;
  setTaskInboxStaffName: React.Dispatch<React.SetStateAction<string>>;
  showAllApplications: boolean;
  signedInLoginEmail: string;
  splitMalaysiaDateTime: (value?: string) => { date: string; time: string; };
  stableHandleAddCustomer: (customer: Pick<LoanApplication, "applicant_name" | "phone_no" | "ic_no" | "vehicle_plate" | "vehicle_model" | "vehicle_condition" | "purchase_method" | "handler_name" | "handler_role" | "personal_info" | "emergency_contacts" | "employment_details" | "preferences" | "payslip_documents"> & { total_cash_price: string; motor_mileage: string; }) => void;
  stableHandleCreateCustomerIntakeShortLink: (fullUrl: string, source: string, medium: string) => Promise<string>;
  stableHandleInlineUpdateApplication: (id: string, updates: { status?: LoanStatus; remarks?: string; error_code?: string; error_codes?: string[]; handler_name?: string; handler_role?: string; }) => Promise<void>;
  stableHandleSubmitToBankFromTable: (id: string, bankName: string) => Promise<boolean>;
  stableHandleOpenBankPage: (application: LoanApplication, target?: Omit<BankPageRequest, 'id'>) => void;
  stableHandleSelectRow: (app: LoanApplication) => void;
  stableHandleUpdateCustomerProfile: (id: string, updates: Pick<LoanApplication, "applicant_name" | "phone_no" | "ic_no" | "vehicle_plate" | "vehicle_model" | "vehicle_condition" | "purchase_method" | "handler_name" | "handler_role">) => boolean;
  stableHandleUpdateMissingInfoFromTaskInbox: (application: LoanApplication, updates: { vehicle_condition: VehicleCondition; purchase_method: PurchaseMethod; }) => Promise<boolean>;
  staffVisibleRawCustomerLeads: RawCustomerLead[];
  staffVisibleRawCustomerMatches: CustomerRawMatch[];
  staffWorkload: { inSystem: boolean; active: boolean; name: string; customers: number; leads: number; }[];
  staffWorkloadCases: StaffWorkloadCase[];
  tagNormalizationRules: TagNormalizationRule[];
  taskClockNow: number;
  taskInboxFocusRequest: { taskId: string; key: number; };
  taskInboxNotifications: NotificationItem[];
  taskInboxScopeName: string;
  taskInboxScopeRole: RoleAccountRole;
  teamAttendanceEvents: AttendanceEvent[];
  teamAttendanceIncidentResolutions: AttendanceIncidentResolution[];
  teamAttendanceRoleAccounts: RoleAccount[];
  teamAttendanceSchedules: AttendanceWeeklySchedule[];
  teamStaffLeaveRequests: ApprovalRequest[];
  triggerToast: (message: string, tone?: "success" | "warning" | "error") => void;
  updateWhatsAppDefaultMessageState: (message: string) => void;
  vehicleBrandTags: string[];
  vehicleCatalog: VehicleCatalogItem[];
  vehicleCategories: VehicleCategory[];
  vehicleTags: string[];
  visibleApplications: LoanApplication[];
  visibleCalendarRawCustomerLeads: RawCustomerLead[];
  visibleWhatsAppTrackingClicks: WhatsAppTrackingClick[];
  visibleWhatsAppTrackingLinks: WhatsAppTrackingLink[];
  whatsAppOpenInNewTab: boolean;
  whatsAppTrackingClicks: WhatsAppTrackingClick[];
  whatsAppTrackingLinks: WhatsAppTrackingLink[];
}

export function buildDashboardPageContent({
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
  deliveryPaymentActions,
  handleDeliverFromChecklist,
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
}: DashboardPageContentDeps) {
  // The active page body. Desktop renders it inside <main>; compact viewports
  // render it inside MobileSubpageFrame for pages the mobile tabs do not show.
  // Role Access → Financial Reports & Stock → Add and edit stock and cost.
  const canManageStock = isOperationsLead(currentStaff.role)
    && (currentStaff.role === 'Super Admin' || canAccessNavKey('financeCenter.manageStock'));

  const activePageContent = (
    activePage === 'taskInbox' && !canAccessNavKey('taskInbox') ? (
      renderNoAccess()
    ) : activePage === 'taskInbox' ? (
      <TaskInboxPage
        bankDefinitions={bankDefinitions}
        allowLeadImport={canAccessNavKey('rawCustomers.importLeads')}
        allowLeadAdd={canAccessNavKey('rawCustomers.addLead')}
        applications={applications}
        calendarNotes={calendarNotes}
        rawCustomerLeads={staffVisibleRawCustomerLeads}
        rawCustomerMatches={staffVisibleRawCustomerMatches}
        roleAccounts={roleAccounts}
        roleNavAccess={roleNavAccess}
        customMissions={customMissions}
        notifications={taskInboxNotifications}
        attendanceEvents={teamAttendanceEvents}
        attendanceIncidentResolutions={teamAttendanceIncidentResolutions}
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
        onBankQuickAction={(application, bankApplicationId, action) => stableHandleOpenBankPage(application, { bankApplicationId, action })}
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
          // Stock and its cost now live on the Stock page (owner 2026-10-18).
          if (navigateToPageIfAllowed('pendingStock', 'pendingStock')) {
            setFinanceStockModel(model || '');
            setFinanceStockRequestId((current) => current + 1);
          }
        }}
        onQuickAddStock={handleQuickAddStockForModel}
        onOpenFinanceDeal={() => {
          navigateToPageIfAllowed('financeCenter', 'financeCenter');
        }}
        onOpenDelivery={(applicationId) => {
          if (navigateToPageIfAllowed('delivery', 'delivery')) {
            setDeliveryFocusRequest((current) => ({ id: (current?.id || 0) + 1, applicationId }));
          }
        }}
        onMarkCommissionPaid={handleMarkCommissionPaidFromTaskInbox}
        onSaveDealFinance={handleSaveDealFinance}
        loadDeliveryPayments={deliveryPaymentActions.handleListDeliveryPayments}
        onUpdateMissingInfo={stableHandleUpdateMissingInfoFromTaskInbox}
        onAddCalendarTaskComment={handleAddCalendarTaskComment}
        onSetCalendarNoteCompleted={handleSetCalendarNoteCompleted}
        onResolveMissingCheckout={handleResolveMissingCheckout}
        approvalRequests={approvalRequests}
        onReviewApproval={(id, decision) => handleReviewApprovalRequest(id, decision, '')}
        staffLeaveRequests={teamStaffLeaveRequests}
        onReviewLeaveRequest={(id, decision) => handleReviewStaffLeaveRequest(id, decision, '')}
        onVisibleTasksChange={handleTaskInboxVisibleTasksChange}
        now={taskClockNow}
        focusTaskRequest={taskInboxFocusRequest}
        onFocusTaskHandled={() => setTaskInboxFocusRequest(null)}
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
        crossShopPool={currentStaff.role === 'Admin' && canAccessNavKey(ADMIN_CROSS_SHOP_POOL_NAV_KEY)
          ? {
            showAllShops: readAdminCrossShopPoolPreference(),
            // The pool is a Firestore query scope: reload to start it again.
            onChange: (showAllShops) => {
              writeAdminCrossShopPoolPreference(showAllShops);
              window.location.reload();
            }
          }
          : undefined}
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
        onSubmitToBank={stableHandleSubmitToBankFromTable}
        onOpenBankPage={stableHandleOpenBankPage}
        onAddCustomer={stableHandleAddCustomer}
        onCreateCustomerIntakeShortLink={stableHandleCreateCustomerIntakeShortLink}
        onOpenBankDatabase={canAccessNavKey('bankDatabase')
          ? () => {
            setActiveSettingGroup('bank');
            navigateToPageIfAllowed('bankDatabase', 'tags');
          }
          : undefined}
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
        canImportLeads={canAccessNavKey('rawCustomers.importLeads')}
        canAddLead={canAccessNavKey('rawCustomers.addLead')}
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
        canViewAllCalendar={canViewAllStaffCalendar}
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
    ) : activePage === 'delivery' ? (
      canAccessNavKey('delivery') ? (
        <DeliveryPage
          // The same scope Loan Applications opens: a card outside it has a dead "Application" button.
          applications={applications.filter(isApplicationOwnedByCurrentStaff)}
          currentStaffRole={currentStaff.role}
          currentStaffName={currentStaff.name}
          onSaveDeliveryStep={handleSaveDeliveryStep}
          focusRequest={deliveryFocusRequest}
          onOpenApplication={(application) => handleOpenApplicationTarget(application)}
          payments={{
            list: deliveryPaymentActions.handleListDeliveryPayments,
            record: deliveryPaymentActions.handleRecordDeliveryPayment,
            void: canAccessNavKey('delivery.voidPayment') ? deliveryPaymentActions.handleVoidDeliveryPayment : undefined,
            loadReceipt: deliveryPaymentActions.handleLoadDeliveryReceipt,
            uploadAttachment: deliveryPaymentActions.handleUploadDeliveryAttachment,
            listAttachments: deliveryPaymentActions.handleListDeliveryAttachments,
            loadAttachment: deliveryPaymentActions.handleLoadDeliveryAttachment
          }}
          vehicleCatalog={vehicleCatalog}
          onDeliver={handleDeliverFromChecklist}
        />
      ) : renderNoAccess()
    ) : activePage === 'settlement' ? (
      canAccessNavKey('settlement') ? (
        <SettlementPage
          applications={applications}
          currentStaffRole={currentStaff.role}
          onSaveDealFinance={handleSaveDealFinance}
          onMarkCommissionPaid={handleMarkCommissionPaidFromTaskInbox}
          onOpenApplication={(application) => handleOpenApplicationTarget(application)}
          loadDeliveryPayments={deliveryPaymentActions.handleListDeliveryPayments}
        />
      ) : renderNoAccess()
    ) : activePage === 'pendingStock' ? (
      canAccessNavKey('pendingStock') ? (
        <StockPage
          inventoryRequestId={financeStockRequestId}
          pendingProps={{
            applications,
            vehicleCatalog,
            canManage: canManageStock,
            currentStaffName: currentStaff.name,
            loadOrders: async () => {
              try {
                return await (await import('../services/dashboardRepository')).listStockOrders();
              } catch (error) {
                console.error('Failed to load stock orders', error);
                triggerToast(tr('下单记录读取失败', 'Could not load the stock orders', 'Gagal memuatkan tempahan stok'), 'error');
                return null;
              }
            },
            onSaveOrder: async (order) => {
              try {
                await (await import('../services/dashboardRepository')).saveStockOrder(order);
                triggerToast(tr('已保存', 'Saved', 'Disimpan'), 'success');
                return true;
              } catch (error) {
                console.error('Failed to save stock order', error);
                triggerToast(tr('保存失败', 'Could not save', 'Gagal disimpan'), 'error');
                return false;
              }
            },
            onQuickAddStock: handleQuickAddStockForModel,
            onOpenApplication: (application) => handleOpenApplicationTarget(application)
          }}
          inventoryProps={{
            applications,
            vehicleCatalog,
            currentStaffName: currentStaff.name,
            canManage: canManageStock,
            onSaveStockUnits: handleSaveVehicleStockUnits,
            onSaveDealFinance: handleSaveDealFinance,
            onOpenApplication: (application) => handleOpenApplicationTarget(application),
            canOpenVehicleInfo: canAccessNavKey('vehicleInfo'),
            onOpenVehicleInfo: () => {
              if (navigateToPageIfAllowed('vehicleInfo', 'tags')) {
                setActiveSettingGroup('info');
              }
            },
            stockTabRequestId: financeStockRequestId,
            stockFocusModel: financeStockModel,
            onQuickAddStock: handleQuickAddStock
          }}
        />
      ) : renderNoAccess()
    ) : activePage === 'financeCenter' ? (
      canAccessNavKey('financeCenter') ? (
        <FinanceCenter
          ledgerPanel={isOperationsLead(currentStaff.role) && isFirebaseConfigured ? (
            <LedgerSyncPanel
              applications={applications}
              vehicleCatalog={vehicleCatalog}
              loadStatus={async () => fetchLedgerStatus(async () => (await import('../lib/auth')).getCurrentFirebaseIdToken(true))}
              onResendInvoice={async (applicationId) => {
                const result = await requestLedgerDeliveryInvoice(applicationId, async () => (await import('../lib/auth')).getCurrentFirebaseIdToken(true));
                if (result) {
                  const message = ledgerDeliveryMessage(result);
                  triggerToast(tr(...message.text), message.tone);
                }
              }}
              onResendStock={async (stockUnitId) => {
                const result = await requestLedgerStockSync([stockUnitId], async () => (await import('../lib/auth')).getCurrentFirebaseIdToken(true));
                if (result) {
                  const message = ledgerStockMessage(result);
                  triggerToast(tr(...message.text), message.tone);
                }
              }}
              loadOpeningDeposits={currentStaff.role === 'Super Admin'
                ? async () => fetchOpeningDepositExport(async () => (await import('../lib/auth')).getCurrentFirebaseIdToken(true))
                : undefined}
            />
          ) : undefined}
          applications={applications}
          vehicleCatalog={vehicleCatalog}
          currentStaffName={currentStaff.name}
          canManage={canManageStock}
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
          onSyncLedger={currentStaff.role === 'Super Admin' && isFirebaseConfigured ? async () => {
            try {
              const result = await requestLedgerFullSync(async () => (await import('../lib/auth')).getCurrentFirebaseIdToken(true));
              if (!result.connected) {
                triggerToast(tr('Ledger 还没接通（缺 LEDGER_API_URL / LEDGER_TENANT_ID / LEDGER_API_KEY）', 'The ledger is not connected yet (LEDGER_API_URL / LEDGER_TENANT_ID / LEDGER_API_KEY)', 'Ledger belum disambungkan'), 'warning');
                return;
              }
              const failed = result.contacts.failed + result.stock.failed + result.deliveries.failed;
              triggerToast(tr(
                `Ledger 已同步：客户 ${result.contacts.synced}、进货 ${result.stock.posted}、新发票 ${result.deliveries.invoiced}${failed ? `；${failed} 项失败` : ''}`,
                `Ledger synced: ${result.contacts.synced} customers, ${result.stock.posted} stock, ${result.deliveries.invoiced} new invoices${failed ? `; ${failed} failed` : ''}`,
                `Ledger disegerakkan: ${result.contacts.synced} pelanggan, ${result.stock.posted} stok, ${result.deliveries.invoiced} invois baharu${failed ? `; ${failed} gagal` : ''}`
              ), failed ? 'warning' : 'success');
            } catch {
              triggerToast(tr('Ledger 同步失败，请稍后再试', 'Ledger sync failed; try again later', 'Segerak ledger gagal; cuba lagi kemudian'), 'error');
            }
          } : undefined}
          commissionPanel={(
            <RewardCommissionCenter
              embedded
              applications={applications}
              rawCustomerLeads={staffVisibleRawCustomerLeads}
              customMissions={customMissions}
              approvalRequests={approvalRequests}
              roleAccounts={roleAccounts}
              currentStaffName={currentStaff.name}
              currentStaffRole={currentStaff.role}
              canViewAllRewards={isOperationsLead(currentStaff.role)}
              canManageSnapshots={currentStaff.role === 'Super Admin'}
              tiersPanel={(
                <CommissionTiersPanel
                  plans={commissionTierPlans}
                  staffNamesByPlan={isOperationsLead(currentStaff.role) ? groupStaffByCommissionTierPlan(commissionTierPlans, roleAccounts) : undefined}
                  canEdit={currentStaff.role === 'Super Admin'}
                  onSave={currentStaff.role === 'Super Admin' ? handleSaveCommissionTiers : undefined}
                  pendingUpdateCount={getTierCommissionUpdates(applications, commissionTiers).length}
                  onRecalculate={isOperationsLead(currentStaff.role) && (currentStaff.role === 'Super Admin' || canAccessNavKey('financeCenter.recalculateCommission')) ? () => handleRecalculateTierCommissions() : undefined}
                />
              )}
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
        currentStaffName={currentStaff.name}
        bankDefinitions={bankDefinitions}
        vehicleTags={vehicleTags}
        vehicleBrandTags={vehicleBrandTags}
        errorCodeDefinitions={errorCodeDefinitions}
        roleAccounts={roleAccounts}
        roleNavAccess={roleNavAccess}
        defaultAvatars={availableDefaultAvatars}
        marketingTagRelationships={marketingTagRelationships}
        tagNormalizationRules={tagNormalizationRules}
        whatsAppTrackingLinks={whatsAppTrackingLinks}
        whatsAppTrackingClicks={whatsAppTrackingClicks}
        canManageTags={currentStaff.role === 'Super Admin'}
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
        onAssignMissingAvatars={handleAssignMissingAvatars}
        pendingRoleAccountUpdates={pendingRoleAccountUpdates}
        onDeleteRoleAccount={handleDeleteRoleAccount}
        onUpdateRoleNavAccess={handleUpdateRoleNavAccess}
        staffWorkload={staffWorkload}
        staffWorkloadCases={staffWorkloadCases}
        onTransferWorkload={handleTransferWorkload}
        onTransferWorkloadCase={handleTransferWorkloadCase}
        attendancePolicy={attendancePolicy}
        commissionTierPlans={commissionTierPlans}
        onAssignCommissionTierPlan={currentStaff.role === 'Super Admin' ? async (accountId, planId) => {
          const saved = await handleUpdateRoleAccount(accountId, { commission_tier_plan_id: planId });
          if (!saved) return false;
          // Unpaid tier commission of that staff member moves to the new plan straight away.
          const source = buildCommissionTierSource(commissionTierPlans, roleAccounts.map((account) => (
            account.id === accountId ? { ...account, commission_tier_plan_id: planId } : account
          )));
          if (getTierCommissionUpdates(applications, source).length > 0) await handleRecalculateTierCommissions(source);
          return true;
        } : undefined}
        onAssignExtraShops={currentStaff.role === 'Super Admin'
          ? (accountId, shopIds) => handleUpdateRoleAccount(accountId, { extra_shop_ids: shopIds })
          : undefined}
        onAssignStaffShop={(accountId, teamId) => {
          // The shop is the attendance team; Main team is the default, so it is stored as no assignment.
          const assignments = { ...(attendancePolicy.staff_team_assignments || {}) };
          if (teamId === ATTENDANCE_MAIN_TEAM_ID) delete assignments[accountId];
          else assignments[accountId] = teamId;
          return handleUpdateAttendancePolicy({ ...attendancePolicy, staff_team_assignments: assignments });
        }}
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
    ) : activePage === 'roleAccess' ? (
      canAccessNavKey('roleAccess') ? (
        <RoleAccessControlPage
          settings={roleNavAccess}
          currentStaffName={currentStaff.name}
          canManage={currentStaff.role === 'Super Admin'}
          onUpdate={handleUpdateRoleNavAccess}
        />
      ) : renderNoAccess()
    ) : activePage === 'tools' ? (
      <div id="tools-page" className="space-y-6">
        {/* Desktop navigates via the flat sidebar; header + tab bar only show on mobile. */}
        <section className="flex flex-col gap-4 md:hidden">
          <div className="space-y-1">
            <h2 className="text-title-2 text-slate-900">{appText.toolsTitle}</h2>
            <p className="max-w-2xl text-footnote font-normal leading-relaxed text-slate-500">
              {appText.toolsSubtitle}
            </p>
          </div>
        </section>

        <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-card border border-slate-100 bg-white p-1 shadow-e1 md:hidden">
          {[
            { key: 'analytics' as ToolsView, navKey: 'analytics', label: appText.analytics, iconKey: 'analytics', fallback: <BarChart3 key="analytics" className="h-4 w-4" /> },
            { key: 'whatsapp' as ToolsView, navKey: 'whatsapp', label: appText.whatsAppTools, iconKey: 'whatsapp', fallback: <MessageCircle key="whatsapp" className="h-4 w-4" /> },
            { key: 'audit' as ToolsView, navKey: 'audit', label: appText.auditLog, iconKey: 'audit', fallback: <FileClock key="audit" className="h-4 w-4" /> },
            { key: 'dataExport' as ToolsView, navKey: 'dataExport', label: appText.dataExportNav, iconKey: 'allChannels', fallback: <Download key="dataExport" className="h-4 w-4" /> }
          ]
            .filter((item) => canAccessNavKey(item.navKey))
            .map(({ key, label, iconKey, fallback }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveToolsView(key)}
              className={`inline-flex items-center gap-2 rounded-control px-4 py-2 text-footnote font-bold transition-all ${
                activeToolsView === key
                  ? 'bg-brand text-white'
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
            links={visibleWhatsAppTrackingLinks}
            clicks={visibleWhatsAppTrackingClicks}
            currentStaffName={currentStaff.name}
            defaultMessage={currentWhatsAppDefaultMessage}
            onUpdateDefaultMessage={updateWhatsAppDefaultMessageState}
            onAddLink={handleAddWhatsAppTrackingLink}
            onUpdateLink={handleUpdateWhatsAppTrackingLink}
            onDeleteLink={handleDeleteWhatsAppTrackingLink}
            onCreateShortLink={handleCreateWhatsAppShortLink}
            canManageLinks={canAccessNavKey('whatsapp.manageLinks')}
            canCreateShortLinks={canAccessNavKey('whatsapp.shortLinks')}
          />
        ) : activeToolsView === 'audit' ? (
          canAccessNavKey('audit') ? <AuditLogAdmin logs={auditLogs} /> : renderNoAccess()
        ) : activeToolsView === 'dataExport' && !canAccessNavKey('dataExport') ? (
          renderNoAccess()
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
                rows: teamAttendanceEvents.map((event) => {
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
                rows: teamStaffLeaveRequests.map((request) => {
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
                label: tr('WhatsApp 独立访客', 'WhatsApp Unique Visitors', "Pelawat Unik WhatsApp"),
                description: tr('每个浏览器每条链接一条，含首次访问时间与来源。', 'One row per browser per link, with first-visit time and source.', "Satu baris bagi setiap pelayar setiap pautan, dengan masa lawatan pertama dan sumber."),
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
              }
            ].filter((dataset) => canAccessNavKey(`dataExport.${dataset.permissionKey || dataset.key}`))}
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
    ) : activePage === 'user' ? (
      <div id="user-workspace" className="space-y-6">
        <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-card border border-slate-100 bg-white p-1 shadow-e1">
          {([
            ['profile', tr('用户资料', 'User Profile', "Profil Pengguna"), 'user', <UserCircle key="user" />],
            ...(canAccessNavKey('whatsapp') ? [['whatsapp', appText.whatsAppTools, 'whatsapp', <MessageCircle key="whatsapp" />]] : [])
          ] as Array<['profile' | 'whatsapp', string, string, React.ReactNode]>).map(([key, label, iconKey, fallback]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveUserView(key)}
              className={`inline-flex items-center gap-2 rounded-control px-4 py-2 text-footnote font-bold transition-colors ${activeUserView === key ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <NavIconImage iconKey={iconKey} active={activeUserView === key} className="h-5 w-5" fallback={fallback} />
              {label}
            </button>
          ))}
        </section>

        {activeUserView === 'whatsapp' && canAccessNavKey('whatsapp') ? (
          <WhatsAppTrackingAdmin
            links={visibleWhatsAppTrackingLinks}
            clicks={visibleWhatsAppTrackingClicks}
            currentStaffName={currentStaff.name}
            defaultMessage={currentWhatsAppDefaultMessage}
            onUpdateDefaultMessage={updateWhatsAppDefaultMessageState}
            onAddLink={handleAddWhatsAppTrackingLink}
            onUpdateLink={handleUpdateWhatsAppTrackingLink}
            onDeleteLink={handleDeleteWhatsAppTrackingLink}
            onCreateShortLink={handleCreateWhatsAppShortLink}
            canManageLinks={canAccessNavKey('whatsapp.manageLinks')}
            canCreateShortLinks={canAccessNavKey('whatsapp.shortLinks')}
          />
        ) : (
          <UserProfilePage
            currentStaffName={currentStaff.name}
            currentStaffRole={currentStaff.role}
            account={currentRoleAccount}
            signedInLoginEmail={signedInLoginEmail}
            experience={currentStaffExperience}
            defaultAvatars={availableDefaultAvatars}
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
    ) : null
  );

  return {
    activePageContent
  };
}
