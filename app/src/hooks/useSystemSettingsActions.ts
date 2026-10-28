import type { RequestStaffTotp } from '../lib/staffMfa';
/**
 * System settings actions: attendance policy, mission reward requests, the
 * current staff password change, Reset Data, reject (error) code
 * definitions and vehicle categories. Moved verbatim from App.tsx; every
 * value the handlers used from App's closure is now an explicit dependency
 * under its original name.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import type * as React from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type * as Repository from '../services/dashboardRepository';
import type { DashboardState } from '../services/dashboardRepository';
import { type BrandedDialogOptions, type BrandedPasswordPromptOptions } from '../components/BrandedDialogProvider';
import { INITIAL_ERROR_CODE_DEFINITIONS, INITIAL_WHATSAPP_TRACKING_CLICKS, INITIAL_WHATSAPP_TRACKING_LINKS } from '../data/mockData';
import { buildDefaultRoleNavAccessSettings } from '../data/roleNavAccess';
import { buildDefaultVehicleCategories, normalizeVehicleCategories } from '../data/vehicleCategories';
import { tr } from '../lib/i18n';
import { type AttendanceEvent, type AttendanceIncidentResolution } from '../services/dashboardRepository';
import { type ApprovalRequest, AttendancePolicy, type AttendanceWeeklySchedule, AuditLogEntry, type BankDefinition, type CalendarNote, type ChannelMarketingSpend, type CustomerIntakeShortLink, CustomMission, DEFAULT_BANK_DEFINITIONS, DEFAULT_COMMISSION_RULES, DEFAULT_MARKETING_TAG_RELATIONSHIPS, DEFAULT_TAG_NORMALIZATION_RULES, DEFAULT_VEHICLE_BRAND_TAGS, DEFAULT_VEHICLE_TAGS, ErrorCodeDefinition, FINANCE_PROFILES, type FinanceProfile, type LoanApplication, type MarketingTagRelationship, normalizeAttendancePolicy, type NotificationItem, type RawCustomerLead, type RoleAccount, type RoleNavAccessSetting, type StaffDefaultAvatar, type TagNormalizationRule, type VehicleCatalogItem, VehicleCategory, type WhatsAppTrackingClick, type WhatsAppTrackingLink } from '../types';
import { normalizeRejectCode } from '../utils/rejectCodes';
import { type useDashboardPersistence } from './useDashboardPersistence';
import { type StaffSession } from './useStaffSessionAuth';

export interface SystemSettingsAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface SystemSettingsActionsDeps {
  currentStaff: StaffSession;
  appendAuditLog: ({ action, target_type, target_id, target_label, changes, stateOverrides }: { action: string; target_type: string; target_id: string; target_label: string; changes: AuditLogEntry["changes"]; stateOverrides?: Partial<DashboardState>; }) => void;
  attendancePolicy: AttendancePolicy;
  clearSensitiveDashboardLocalCache: () => void;
  createAuditChanges: <Before extends object, After extends object>(before: Before, after: After) => { field: string; old_value: string; new_value: string; }[];
  currentRoleAccount: RoleAccount;
  DEFAULT_WHATSAPP_DEFAULT_MESSAGE: "Hi {name}, saya dari Dr Racing. Kami terima inquiry anda dari {channel}. Boleh saya bantu semak permohonan motor loan?";
  errorCodeDefinitions: ErrorCodeDefinition[];
  handleAddApprovalRequest: (request: Omit<ApprovalRequest, "id" | "status" | "requester_name" | "requester_role" | "submitted_at" | "reviewed_by" | "reviewed_role" | "reviewed_at" | "review_note">) => void;
  INITIAL_VEHICLE_CATALOG: VehicleCatalogItem[];
  isFirebaseConfigured: boolean;
  loadInitialLoanApplications: () => Promise<LoanApplication[]>;
  loadInitialRawCustomerLeads: () => Promise<RawCustomerLead[]>;
  markRawLeadsDeletedForSync: typeof Repository.markRawLeadsDeletedForSync;
  persistDashboardState: (overrides?: Partial<DashboardState>, options?: { immediate?: boolean; }) => Promise<boolean>;
  rawCustomerLeads: RawCustomerLead[];
  requestFirestoreCacheClearOnReload: () => void;
  roleAccounts: RoleAccount[];
  setAttendanceEvents: React.Dispatch<React.SetStateAction<AttendanceEvent[]>>;
  setAttendanceIncidentResolutions: React.Dispatch<React.SetStateAction<AttendanceIncidentResolution[]>>;
  setAttendancePolicy: React.Dispatch<React.SetStateAction<AttendancePolicy>>;
  setAttendanceSchedules: React.Dispatch<React.SetStateAction<AttendanceWeeklySchedule[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedApplication: React.Dispatch<React.SetStateAction<LoanApplication>>;
  setStaffLeaveRequests: React.Dispatch<React.SetStateAction<ApprovalRequest[]>>;
  setVehicleBrandLogos: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setVehicleCategories: React.Dispatch<React.SetStateAction<VehicleCategory[]>>;
  requestStaffTotp?: RequestStaffTotp;
  showConfirm: (options: BrandedDialogOptions) => Promise<boolean>;
  showPasswordPrompt: (options: BrandedPasswordPromptOptions) => Promise<string | null>;
  triggerToast: (message: string, tone?: "success" | "warning" | "error") => void;
  updateApplicationsState: (updatedList: LoanApplication[]) => Promise<boolean>;
  updateApprovalRequestsState: (updatedList: ApprovalRequest[]) => Promise<boolean>;
  updateBankDefinitionsState: (updatedList: BankDefinition[]) => Promise<boolean>;
  updateCalendarNotesState: (updatedList: CalendarNote[]) => Promise<boolean>;
  updateChannelMarketingSpendState: (updatedList: ChannelMarketingSpend[]) => Promise<boolean>;
  updateCustomerIntakeShortLinksState: (updatedList: CustomerIntakeShortLink[]) => Promise<boolean>;
  updateCustomMissionsState: (updatedList: CustomMission[]) => Promise<boolean>;
  updateDefaultAvatarLibraryState: (updatedList: StaffDefaultAvatar[]) => Promise<boolean>;
  updateErrorCodeDefinitionsState: (updatedList: ErrorCodeDefinition[]) => Promise<boolean>;
  updateFinanceProfilesState: (updatedList: FinanceProfile[]) => Promise<boolean>;
  updateMarketingTagRelationshipsState: (updatedList: MarketingTagRelationship[]) => Promise<boolean>;
  updateNotificationsState: (updatedList: NotificationItem[], stateOverrides?: Partial<DashboardState>, skipRemoteSave?: boolean) => Promise<boolean> | Promise<void>;
  updateRawCustomerLeadsState: (updatedList: RawCustomerLead[]) => Promise<boolean>;
  updateRoleNavAccessState: (updatedList: RoleNavAccessSetting[]) => Promise<boolean>;
  updateTagNormalizationRulesState: (updatedList: TagNormalizationRule[]) => Promise<boolean>;
  updateVehicleBrandTagsState: (updatedList: string[]) => Promise<boolean>;
  updateVehicleCatalogState: (updatedList: VehicleCatalogItem[]) => Promise<boolean>;
  updateVehicleTagsState: (updatedList: string[]) => Promise<boolean>;
  updateWhatsAppDefaultMessageState: (message: string) => void;
  updateWhatsAppTrackingClicksState: (updatedList: WhatsAppTrackingClick[]) => Promise<boolean>;
  updateWhatsAppTrackingLinksState: (updatedList: WhatsAppTrackingLink[]) => Promise<boolean>;
  vehicleCategories: VehicleCategory[];
  writeLocalDashboardValue: ReturnType<typeof useDashboardPersistence>['writeLocalDashboardValue'];
}

export function useSystemSettingsActions({
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
  requestStaffTotp,
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
}: SystemSettingsActionsDeps) {
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
      },
      {
        field: 'main_team_name',
        old_value: attendancePolicy.main_team_name || '',
        new_value: normalized.main_team_name
      },
      {
        field: 'teams',
        old_value: JSON.stringify(attendancePolicy.teams || []),
        new_value: JSON.stringify(normalized.teams)
      },
      {
        field: 'staff_team_assignments',
        old_value: JSON.stringify(attendancePolicy.staff_team_assignments || {}),
        new_value: JSON.stringify(normalized.staff_team_assignments)
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
  // Restore initial mock data helper
  const getPasswordActionErrorMessage = (error: unknown) => {
    const code = error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : '';

    if (code === 'auth/mfa-cancelled') {
      return tr('两步验证已取消，操作未完成。', 'Two-step verification cancelled. Action not completed.', 'Pengesahan dua langkah dibatalkan. Tindakan tidak selesai.');
    }
    if (code === 'auth/code-expired' || code === 'auth/invalid-multi-factor-session' || code === 'auth/user-token-expired' || code === 'auth/user-mismatch') {
      return tr('安全验证已过期，请重新登录后再试。', 'Security verification expired. Sign in again and retry.', 'Pengesahan keselamatan tamat tempoh. Log masuk semula dan cuba lagi.');
    }
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
      const { changeCurrentFirebaseStaffPassword } = await import('../lib/auth');
      await changeCurrentFirebaseStaffPassword(currentPassword, newPassword, requestStaffTotp);
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
          const { getCurrentFirebaseIdToken, reauthenticateCurrentFirebaseStaff } = await import('../lib/auth');
          await reauthenticateCurrentFirebaseStaff(password, requestStaffTotp);
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

    const { verifyPassword } = await import('../lib/password');
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
          roleNavAccess: buildDefaultRoleNavAccessSettings(),
          vehicleCategories: buildDefaultVehicleCategories(),
          vehicleBrandLogos: {},
          defaultAvatarLibrary: [],
          whatsAppTrackingLinks: INITIAL_WHATSAPP_TRACKING_LINKS,
          whatsAppTrackingClicks: INITIAL_WHATSAPP_TRACKING_CLICKS,
          whatsAppDefaultMessage: DEFAULT_WHATSAPP_DEFAULT_MESSAGE,
          customerIntakeShortLinks: [],
          customMissions: [],
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

  const requireSuperAdminSettings = () => {
    if (currentStaff.role === 'Super Admin') return true;
    triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
    return false;
  };

  const handleAddErrorCodeDefinition = (definition: ErrorCodeDefinition) => {
    // Only Super Admin writes these lists to dashboard_state; any other role's
    // edit would show as saved but never reach the database.
    if (!requireSuperAdminSettings()) return;
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
    // Only Super Admin writes these lists to dashboard_state; any other role's
    // edit would show as saved but never reach the database.
    if (!requireSuperAdminSettings()) return;
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
    // Only Super Admin writes these lists to dashboard_state; any other role's
    // edit would show as saved but never reach the database.
    if (!requireSuperAdminSettings()) return;
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

  const updateVehicleCategoriesState = (updatedList: VehicleCategory[]) => {
    const normalized = normalizeVehicleCategories(updatedList);

    setVehicleCategories(normalized);
    writeLocalDashboardValue('vehicleCategories', normalized);
    return persistDashboardState({ vehicleCategories: normalized });
  };

  const handleUpdateVehicleCategories = (nextCategories: VehicleCategory[]) => {
    // Only Super Admin writes these lists to dashboard_state; any other role's
    // edit would show as saved but never reach the database.
    if (!requireSuperAdminSettings()) return;
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

  return {
    handleUpdateAttendancePolicy,
    handleSubmitMissionReward,
    getPasswordActionErrorMessage,
    handleChangeCurrentStaffPassword,
    handleResetData,
    handleAddErrorCodeDefinition,
    handleUpdateErrorCodeDefinition,
    handleDeleteErrorCodeDefinition,
    handleUpdateVehicleCategories
  };
}
