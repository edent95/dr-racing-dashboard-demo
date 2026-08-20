/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoleAccountRole, RoleNavAccessSetting } from '../types';

// Roles that a Super Admin can configure. Super Admin always has full access
// and is never part of this list, so it can never lock itself out.
export type ConfigurableRole = 'Operations Manager' | 'Admin' | 'Sales';

export const ROLE_NAV_ACCESS_ROLES: ConfigurableRole[] = ['Operations Manager', 'Admin', 'Sales'];

export type TaskAssignmentKey =
  | 'sales_application_follow_up'
  | 'admin_application_review'
  | 'missing_checkout_follow_up'
  | 'seo_sales_assignment'
  | 'stock_replenishment'
  | 'vehicle_costing'
  | 'bike_delivery'
  | 'bank_disbursement'
  | 'finance_completion'
  | 'negative_margin_review'
  | 'commission_payment'
  | 'business_approval'
  | 'leave_approval'
  | 'mission_target_review';

export type TaskAssignmentRole = RoleAccountRole;

export interface TaskAssignmentDefinition {
  key: TaskAssignmentKey;
  nav_key: string;
  label_zh: string;
  label_en: string;
  label_ms: string;
  group_zh: string;
  group_en: string;
  group_ms: string;
  default_role: TaskAssignmentRole;
  allowed_roles: TaskAssignmentRole[];
}

const taskAssignmentNavKey = (key: TaskAssignmentKey) => `taskAssignment.${key}`;

// These rows share the existing versioned Role Access storage shape, but stay
// out of the Role Access table. Exactly one eligible owner role is enabled;
// Super Admin is encoded as all configurable role rows disabled.
export const TASK_ASSIGNMENT_ITEMS: TaskAssignmentDefinition[] = [
  { key: 'sales_application_follow_up', nav_key: taskAssignmentNavKey('sales_application_follow_up'), label_zh: '补资料、客户回访与确认客户接受', label_en: 'Complete information, customer follow-up, and acceptance', label_ms: 'Lengkapkan maklumat, susulan pelanggan dan penerimaan', group_zh: '客户流程', group_en: 'Customer workflow', group_ms: 'Aliran pelanggan', default_role: 'Sales', allowed_roles: ['Sales', 'Super Admin'] },
  { key: 'admin_application_review', nav_key: taskAssignmentNavKey('admin_application_review'), label_zh: '审核申请、提交银行与银行补件跟进', label_en: 'Review applications, submit to bank, and follow up documents', label_ms: 'Semak permohonan, hantar ke bank dan susuli dokumen', group_zh: '客户流程', group_en: 'Customer workflow', group_ms: 'Aliran pelanggan', default_role: 'Admin', allowed_roles: ['Admin', 'Super Admin'] },
  { key: 'seo_sales_assignment', nav_key: taskAssignmentNavKey('seo_sales_assignment'), label_zh: '分配官网 SEO 申请给 Sales', label_en: 'Assign website SEO applications to Sales', label_ms: 'Tetapkan permohonan SEO laman web kepada Jualan', group_zh: '客户流程', group_en: 'Customer workflow', group_ms: 'Aliran pelanggan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] },
  { key: 'missing_checkout_follow_up', nav_key: taskAssignmentNavKey('missing_checkout_follow_up'), label_zh: '漏打下班卡跟进', label_en: 'Missing check-out follow-up', label_ms: 'Susulan daftar keluar tiada', group_zh: '考勤', group_en: 'Attendance', group_ms: 'Kehadiran', default_role: 'Admin', allowed_roles: ['Admin', 'Super Admin'] },
  { key: 'stock_replenishment', nav_key: taskAssignmentNavKey('stock_replenishment'), label_zh: '补库存', label_en: 'Replenish stock', label_ms: 'Tambah stok', group_zh: '库存与交车', group_en: 'Stock & delivery', group_ms: 'Stok & penghantaran', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] },
  { key: 'vehicle_costing', nav_key: taskAssignmentNavKey('vehicle_costing'), label_zh: '补车辆成本', label_en: 'Record vehicle cost', label_ms: 'Rekod kos kenderaan', group_zh: '库存与交车', group_en: 'Stock & delivery', group_ms: 'Stok & penghantaran', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] },
  { key: 'bike_delivery', nav_key: taskAssignmentNavKey('bike_delivery'), label_zh: '安排并确认交车', label_en: 'Arrange and confirm delivery', label_ms: 'Atur dan sahkan penghantaran', group_zh: '库存与交车', group_en: 'Stock & delivery', group_ms: 'Stok & penghantaran', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] },
  { key: 'bank_disbursement', nav_key: taskAssignmentNavKey('bank_disbursement'), label_zh: '跟进并登记银行放款', label_en: 'Follow up and record bank disbursement', label_ms: 'Susuli dan rekod pengeluaran bank', group_zh: '财务结算', group_en: 'Finance settlement', group_ms: 'Penyelesaian kewangan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] },
  { key: 'finance_completion', nav_key: taskAssignmentNavKey('finance_completion'), label_zh: '核对并完成财务结算', label_en: 'Review and complete finance settlement', label_ms: 'Semak dan lengkapkan penyelesaian kewangan', group_zh: '财务结算', group_en: 'Finance settlement', group_ms: 'Penyelesaian kewangan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] },
  { key: 'negative_margin_review', nav_key: taskAssignmentNavKey('negative_margin_review'), label_zh: '核对负利润成交', label_en: 'Review negative-margin deals', label_ms: 'Semak urus niaga margin negatif', group_zh: '财务结算', group_en: 'Finance settlement', group_ms: 'Penyelesaian kewangan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] },
  { key: 'commission_payment', nav_key: taskAssignmentNavKey('commission_payment'), label_zh: '确认支付佣金', label_en: 'Confirm commission payment', label_ms: 'Sahkan pembayaran komisen', group_zh: '财务结算', group_en: 'Finance settlement', group_ms: 'Penyelesaian kewangan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] },
  { key: 'business_approval', nav_key: taskAssignmentNavKey('business_approval'), label_zh: '审批业务申请', label_en: 'Review business approval requests', label_ms: 'Semak permintaan kelulusan perniagaan', group_zh: '审批', group_en: 'Approvals', group_ms: 'Kelulusan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] },
  { key: 'leave_approval', nav_key: taskAssignmentNavKey('leave_approval'), label_zh: '审批 Leave / MC / OT', label_en: 'Review Leave / MC / OT', label_ms: 'Semak Cuti / MC / OT', group_zh: '审批', group_en: 'Approvals', group_ms: 'Kelulusan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] },
  { key: 'mission_target_review', nav_key: taskAssignmentNavKey('mission_target_review'), label_zh: '审核任务达标通知', label_en: 'Review mission target notifications', label_ms: 'Semak notifikasi sasaran misi', group_zh: '审批', group_en: 'Approvals', group_ms: 'Kelulusan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'] }
];

export interface RoleNavAccessItemDefinition {
  key: string;          // sidebar nav key (matches the nav config in App.tsx)
  label_zh: string;
  label_en: string;
  label_ms: string;
  group_zh: string;
  group_en: string;
  group_ms: string;
  // Baseline roles allowed when there is no saved override. An empty list means
  // "everyone" (Admin + Sales). Mirrors the historical NAV_ROLE_ACCESS defaults
  // so behaviour is unchanged until a Super Admin flips a switch.
  default_roles: RoleAccountRole[];
  // Omit when both Admin and Sales may be granted this page. Sensitive pages
  // can stay configurable for Admin while remaining locked off for Sales.
  configurable_roles?: ConfigurableRole[];
}

export interface RoleNavAccessDetailDefinition extends RoleNavAccessItemDefinition {
  parent_key: string;
}

// Only the pages a Super Admin is allowed to grant/revoke for Admin and Sales.
// Privilege/owner pages (rolesAccounts, permissions, roleAccess, salesBudget)
// are intentionally NOT here — they stay Super-Admin-only via NAV_ROLE_ACCESS and
// cannot be handed to another role from this screen (prevents privilege escalation).
export const ROLE_NAV_ACCESS_ITEMS: RoleNavAccessItemDefinition[] = [
  { key: 'taskInbox', label_zh: '任务箱', label_en: 'Task Inbox', label_ms: 'Peti Masuk Tugasan', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: [] },
  { key: 'customers', label_zh: '贷款申请', label_en: 'Loan Applications', label_ms: 'Permohonan Pinjaman', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: [] },
  { key: 'rawCustomers', label_zh: '潜在客户', label_en: 'Lead Pool', label_ms: 'Kumpulan Prospek', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: ['Admin', 'Sales'], configurable_roles: ['Admin', 'Sales'] },
  { key: 'customerRelationships', label_zh: '潜在客户关系', label_en: 'Customer Relationships', label_ms: 'Hubungan Pelanggan', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: ['Super Admin'], configurable_roles: [] },
  { key: 'calendar', label_zh: '日历', label_en: 'Calendar', label_ms: 'Kalendar', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: [] },
  { key: 'attendance', label_zh: '考勤与请假', label_en: 'Attendance & Leave', label_ms: 'Kehadiran & Cuti', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: [] },
  { key: 'analytics', label_zh: '数据分析', label_en: 'Analytics', label_ms: 'Analitik', group_zh: '营销工具', group_en: 'Marketing', group_ms: 'Pemasaran', default_roles: ['Admin', 'Sales'], configurable_roles: ['Admin', 'Sales'] },
  { key: 'whatsapp', label_zh: 'WhatsApp 工具', label_en: 'WhatsApp Tools', label_ms: 'Alat WhatsApp', group_zh: '营销工具', group_en: 'Marketing', group_ms: 'Pemasaran', default_roles: ['Admin', 'Sales'], configurable_roles: ['Admin', 'Sales'] },
  { key: 'audit', label_zh: '审计日志', label_en: 'Audit Log', label_ms: 'Log Audit', group_zh: '运营管理', group_en: 'Operations', group_ms: 'Operasi', default_roles: ['Super Admin', 'Operations Manager', 'Admin'], configurable_roles: ['Operations Manager', 'Admin'] },
  { key: 'dataExport', label_zh: '数据导出', label_en: 'Data Export', label_ms: 'Eksport Data', group_zh: '运营管理', group_en: 'Operations', group_ms: 'Operasi', default_roles: ['Super Admin', 'Admin'] },
  // Finance Center is the operational ledger for Super Admin and Operations
  // Manager. Admin/Sales stay locked off because their customer writes remain
  // owner/workflow scoped and cannot mutate settlement or stock reservations.
  { key: 'financeCenter', label_zh: '财务中心', label_en: 'Finance Center', label_ms: 'Pusat Kewangan', group_zh: '运营管理', group_en: 'Operations', group_ms: 'Operasi', default_roles: ['Super Admin', 'Operations Manager'], configurable_roles: ['Operations Manager'] },
  { key: 'vehicleInfo', label_zh: '车辆信息', label_en: 'Vehicle Info', label_ms: 'Maklumat Kenderaan', group_zh: '系统设置', group_en: 'System Settings', group_ms: 'Tetapan Sistem', default_roles: ['Super Admin'], configurable_roles: [] },
  { key: 'bankDatabase', label_zh: '银行数据库', label_en: 'Bank Database', label_ms: 'Pangkalan Data Bank', group_zh: '系统设置', group_en: 'System Settings', group_ms: 'Tetapan Sistem', default_roles: ['Super Admin'], configurable_roles: [] },
  { key: 'manual', label_zh: '系统手册', label_en: 'System Manual', label_ms: 'Manual Sistem', group_zh: '系统', group_en: 'System', group_ms: 'Sistem', default_roles: [] }
];

// Page-detail permissions use the same flat persisted setting shape as page
// access, so existing Firebase/local data needs no schema migration. Detail
// rows are resolved only after their parent page is allowed by the UI.
export const ROLE_NAV_ACCESS_DETAIL_ITEMS: RoleNavAccessDetailDefinition[] = [
  { key: 'customers.editApplication', parent_key: 'customers', label_zh: '编辑贷款申请资料', label_en: 'Edit Loan Application', label_ms: 'Edit Permohonan Pinjaman', group_zh: '贷款申请操作', group_en: 'Loan Application actions', group_ms: 'Tindakan Permohonan Pinjaman', default_roles: ['Super Admin', 'Operations Manager'], configurable_roles: ['Operations Manager', 'Admin'] },
  { key: 'customers.addCustomer', parent_key: 'customers', label_zh: '新增客户', label_en: 'Add New Customer', label_ms: 'Tambah Pelanggan Baharu', group_zh: '贷款申请操作', group_en: 'Loan Application actions', group_ms: 'Tindakan Permohonan Pinjaman', default_roles: ['Admin', 'Sales'], configurable_roles: ['Admin', 'Sales'] },
  { key: 'customers.shareLinks', parent_key: 'customers', label_zh: '分享链接', label_en: 'Share Links', label_ms: 'Kongsi Pautan', group_zh: '贷款申请操作', group_en: 'Loan Application actions', group_ms: 'Tindakan Permohonan Pinjaman', default_roles: ['Admin', 'Sales'], configurable_roles: ['Admin', 'Sales'] },
  { key: 'dataExport.customers', parent_key: 'dataExport', label_zh: '客户与贷款申请', label_en: 'Customers & Loan Applications', label_ms: 'Pelanggan & Permohonan Pinjaman', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.attendance', parent_key: 'dataExport', label_zh: '员工考勤', label_en: 'Staff Attendance', label_ms: 'Kehadiran Kakitangan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'], configurable_roles: ['Admin'] },
  { key: 'dataExport.staffLeave', parent_key: 'dataExport', label_zh: '员工 Leave / MC', label_en: 'Staff Leave / MC', label_ms: 'Cuti / MC Kakitangan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'], configurable_roles: ['Admin'] },
  { key: 'dataExport.rawLeads', parent_key: 'dataExport', label_zh: '潜在客户名单（全部）', label_en: 'Leads (all)', label_ms: 'Prospek (semua)', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.followUp', parent_key: 'dataExport', label_zh: '跟进中名单', label_en: 'Follow Up Leads', label_ms: 'Prospek susulan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.vehicleCatalog', parent_key: 'dataExport', label_zh: '车辆目录', label_en: 'Vehicle Catalog', label_ms: 'Katalog Kenderaan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.approvals', parent_key: 'dataExport', label_zh: '审批记录', label_en: 'Approval Requests', label_ms: 'Permintaan Kelulusan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.auditLogs', parent_key: 'dataExport', label_zh: '审计记录', label_en: 'Audit Logs', label_ms: 'Log Audit', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.missions', parent_key: 'dataExport', label_zh: '任务', label_en: 'Missions', label_ms: 'Misi', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.whatsappLinks', parent_key: 'dataExport', label_zh: 'WhatsApp 追踪链接', label_en: 'WhatsApp Tracking Links', label_ms: 'Pautan Penjejakan WhatsApp', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.whatsappClicks', parent_key: 'dataExport', label_zh: 'WhatsApp 点击记录', label_en: 'WhatsApp Clicks', label_ms: 'Klik WhatsApp', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.banks', parent_key: 'dataExport', label_zh: '银行数据库', label_en: 'Bank Database', label_ms: 'Pangkalan Data Bank', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.rejectCodes', parent_key: 'dataExport', label_zh: '拒贷原因代码', label_en: 'Reject Reason Codes', label_ms: 'Kod Sebab Penolakan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.rewardTeams', parent_key: 'dataExport', label_zh: '战队设置', label_en: 'Reward Teams', label_ms: 'Pasukan Ganjaran', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data Eksport Data', default_roles: ['Super Admin', 'Admin'] },
  { key: 'dataExport.analyticsResults', parent_key: 'dataExport', label_zh: '数据分析结果', label_en: 'Analytics Results', label_ms: 'Keputusan Analitik', group_zh: '其他导出入口', group_en: 'Other export entry points', group_ms: 'Titik masuk eksport lain', default_roles: ['Super Admin', 'Admin'] }
];

const ROLE_NAV_ACCESS_ALL_ITEMS: RoleNavAccessItemDefinition[] = [
  ...ROLE_NAV_ACCESS_ITEMS,
  ...ROLE_NAV_ACCESS_DETAIL_ITEMS,
  ...TASK_ASSIGNMENT_ITEMS.map((item) => ({
    ...item,
    key: item.nav_key,
    default_roles: item.default_role === 'Super Admin' ? [] : [item.default_role],
    configurable_roles: item.allowed_roles.filter(isConfigurableRole)
  }))
];

const ROLE_NAV_ACCESS_ITEM_MAP = new Map<string, RoleNavAccessItemDefinition>(
  ROLE_NAV_ACCESS_ALL_ITEMS.map((item) => [item.key, item])
);
const ROLE_NAV_ACCESS_DETAIL_MAP = new Map<string, RoleNavAccessDetailDefinition>(
  ROLE_NAV_ACCESS_DETAIL_ITEMS.map((item) => [item.key, item])
);

export const ROLE_NAV_ACCESS_KEYS = new Set<string>(ROLE_NAV_ACCESS_ALL_ITEMS.map((item) => item.key));

export function getRoleNavAccessDetails(parentKey: string): RoleNavAccessDetailDefinition[] {
  return ROLE_NAV_ACCESS_DETAIL_ITEMS.filter((item) => item.parent_key === parentKey);
}

function isConfigurableRole(role: RoleAccountRole): role is ConfigurableRole {
  return role === 'Operations Manager' || role === 'Admin' || role === 'Sales';
}

function defaultEnabledFor(item: RoleNavAccessItemDefinition, role: RoleAccountRole): boolean {
  return isRoleNavAccessConfigurable(role, item.key) && (
    item.default_roles.length === 0 || item.default_roles.includes(role)
  );
}

export function isRoleNavAccessConfigurable(role: RoleAccountRole, navKey: string): boolean {
  if (!isConfigurableRole(role)) {
    return false;
  }

  const item = ROLE_NAV_ACCESS_ITEM_MAP.get(navKey);
  return Boolean(item && (!item.configurable_roles || item.configurable_roles.includes(role)));
}

/**
 * Resolve whether a role may access a nav key.
 * - Super Admin: always allowed.
 * - Configurable pages (ROLE_NAV_ACCESS_ITEMS): the saved override wins; otherwise the baseline default.
 * - Any other key: fall back to the caller-supplied base NAV_ROLE_ACCESS roles (unchanged behaviour).
 */
export function resolveNavAccess(
  role: RoleAccountRole,
  navKey: string,
  settings: RoleNavAccessSetting[] | undefined,
  baseAllowedRoles?: RoleAccountRole[]
): boolean {
  if (role === 'Super Admin') {
    return true;
  }

  const item = ROLE_NAV_ACCESS_ITEM_MAP.get(navKey);
  if (!item) {
    return !baseAllowedRoles || baseAllowedRoles.includes(role);
  }

  const detail = ROLE_NAV_ACCESS_DETAIL_MAP.get(navKey);
  if (detail && !resolveNavAccess(role, detail.parent_key, settings)) {
    return false;
  }

  if (!isRoleNavAccessConfigurable(role, navKey)) {
    return false;
  }

  const override = (settings || []).find((setting) => setting.role === role && setting.nav_key === navKey);
  if (override) {
    return !!override.enabled;
  }

  return defaultEnabledFor(item, role);
}

export interface RoleAccessCapabilities {
  operations_manager_edit_loan_application: boolean;
  admin_edit_loan_application: boolean;
}

// Firestore Rules cannot safely search the flat roleNavAccess array. Publish a
// compact, derived capability map beside it so the Admin edit boundary is
// enforced by Rules as well as hidden in the UI.
export function buildRoleAccessCapabilities(
  settings: RoleNavAccessSetting[] | undefined
): RoleAccessCapabilities {
  return {
    operations_manager_edit_loan_application: resolveNavAccess(
      'Operations Manager',
      'customers.editApplication',
      settings
    ),
    admin_edit_loan_application: resolveNavAccess('Admin', 'customers.editApplication', settings)
  };
}

export function buildDefaultRoleNavAccessSettings(): RoleNavAccessSetting[] {
  const settings: RoleNavAccessSetting[] = [];

  ROLE_NAV_ACCESS_ROLES.forEach((role) => {
    ROLE_NAV_ACCESS_ALL_ITEMS.forEach((item) => {
      settings.push({ role, nav_key: item.key, enabled: defaultEnabledFor(item, role) });
    });
  });

  return settings;
}

export function resolveTaskAssignmentRole(
  taskKey: TaskAssignmentKey,
  settings: RoleNavAccessSetting[] | undefined
): TaskAssignmentRole {
  const definition = TASK_ASSIGNMENT_ITEMS.find((item) => item.key === taskKey);
  if (!definition) return 'Super Admin';

  const navKey = taskAssignmentNavKey(taskKey);
  const configurableRoles = definition.allowed_roles.filter(isConfigurableRole);
  const taskSettings = (settings || []).filter((setting) => (
    setting.nav_key === navKey && configurableRoles.includes(setting.role as ConfigurableRole)
  ));
  const enabledRole = configurableRoles.find((role) => (
    taskSettings.some((setting) => setting.role === role && setting.enabled)
  ));

  if (enabledRole) return enabledRole;
  return taskSettings.length > 0 ? 'Super Admin' : definition.default_role;
}

export function setTaskAssignmentRole(
  settings: RoleNavAccessSetting[] | undefined,
  taskKey: TaskAssignmentKey,
  role: TaskAssignmentRole,
  updatedBy: string
): RoleNavAccessSetting[] {
  const definition = TASK_ASSIGNMENT_ITEMS.find((item) => item.key === taskKey);
  if (!definition || !definition.allowed_roles.includes(role)) {
    return normalizeRoleNavAccessSettings(settings);
  }

  const navKey = taskAssignmentNavKey(taskKey);
  const updatedAt = new Date().toISOString();
  const normalized = normalizeRoleNavAccessSettings(settings);

  return normalized.map((setting) => (
    setting.nav_key === navKey
      ? {
        ...setting,
        enabled: setting.role === role && role !== 'Super Admin',
        updated_at: updatedAt,
        updated_by: updatedBy
      }
      : setting
  ));
}

// Ensure every (configurable role x known page) pair exists exactly once, drop
// unknown/legacy rows, and coerce enabled to a boolean. Adding a new page later
// self-heals to its default on the next normalize.
export function normalizeRoleNavAccessSettings(list: RoleNavAccessSetting[] | undefined): RoleNavAccessSetting[] {
  const byKey = new Map<string, RoleNavAccessSetting>();

  (Array.isArray(list) ? list : []).forEach((setting) => {
    if (setting && isConfigurableRole(setting.role) && typeof setting.nav_key === 'string' && ROLE_NAV_ACCESS_KEYS.has(setting.nav_key)) {
      byKey.set(`${setting.role}:${setting.nav_key}`, setting);
    }
  });

  const normalized: RoleNavAccessSetting[] = [];

  ROLE_NAV_ACCESS_ROLES.forEach((role) => {
    ROLE_NAV_ACCESS_ALL_ITEMS.forEach((item) => {
      const existing = byKey.get(`${role}:${item.key}`);
      const migratedExisting = (
        role === 'Operations Manager'
        && item.key === 'customers.editApplication'
        && existing
        && !existing.enabled
        && !existing.updated_at
        && !existing.updated_by
      )
        ? undefined
        : existing;

      normalized.push({
        role,
        nav_key: item.key,
        enabled: isRoleNavAccessConfigurable(role, item.key)
          ? migratedExisting ? !!migratedExisting.enabled : defaultEnabledFor(item, role)
          : false,
        updated_at: migratedExisting?.updated_at,
        updated_by: migratedExisting?.updated_by
      });
    });
  });

  return normalized;
}
