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
  // A page the owner role must also be allowed to open, because acting on the
  // task writes that page's data (Finance Center: deal_finance, stock).
  required_nav_key?: string;
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
  { key: 'stock_replenishment', nav_key: taskAssignmentNavKey('stock_replenishment'), label_zh: '补库存', label_en: 'Replenish stock', label_ms: 'Tambah stok', group_zh: '库存与交车', group_en: 'Stock & delivery', group_ms: 'Stok & penghantaran', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'], required_nav_key: 'financeCenter' },
  { key: 'vehicle_costing', nav_key: taskAssignmentNavKey('vehicle_costing'), label_zh: '补车辆成本', label_en: 'Record vehicle cost', label_ms: 'Rekod kos kenderaan', group_zh: '库存与交车', group_en: 'Stock & delivery', group_ms: 'Stok & penghantaran', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'], required_nav_key: 'financeCenter' },
  { key: 'bike_delivery', nav_key: taskAssignmentNavKey('bike_delivery'), label_zh: '安排并确认交车', label_en: 'Arrange and confirm delivery', label_ms: 'Atur dan sahkan penghantaran', group_zh: '库存与交车', group_en: 'Stock & delivery', group_ms: 'Stok & penghantaran', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'], required_nav_key: 'financeCenter' },
  { key: 'bank_disbursement', nav_key: taskAssignmentNavKey('bank_disbursement'), label_zh: '跟进并登记银行放款', label_en: 'Follow up and record bank disbursement', label_ms: 'Susuli dan rekod pengeluaran bank', group_zh: '财务结算', group_en: 'Finance settlement', group_ms: 'Penyelesaian kewangan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'], required_nav_key: 'financeCenter' },
  { key: 'finance_completion', nav_key: taskAssignmentNavKey('finance_completion'), label_zh: '核对并完成财务结算', label_en: 'Review and complete finance settlement', label_ms: 'Semak dan lengkapkan penyelesaian kewangan', group_zh: '财务结算', group_en: 'Finance settlement', group_ms: 'Penyelesaian kewangan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'], required_nav_key: 'financeCenter' },
  { key: 'negative_margin_review', nav_key: taskAssignmentNavKey('negative_margin_review'), label_zh: '核对负利润成交', label_en: 'Review negative-margin deals', label_ms: 'Semak urus niaga margin negatif', group_zh: '财务结算', group_en: 'Finance settlement', group_ms: 'Penyelesaian kewangan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'], required_nav_key: 'financeCenter' },
  { key: 'commission_payment', nav_key: taskAssignmentNavKey('commission_payment'), label_zh: '确认支付佣金', label_en: 'Confirm commission payment', label_ms: 'Sahkan pembayaran komisen', group_zh: '财务结算', group_en: 'Finance settlement', group_ms: 'Penyelesaian kewangan', default_role: 'Operations Manager', allowed_roles: ['Operations Manager', 'Super Admin'], required_nav_key: 'financeCenter' },
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
  // 'database': Firestore Rules or server.mjs refuse the action too (through
  // roleAccessCapabilities). 'screen': the switch only hides the control.
  // Shown on the Role Access page so the owner knows which switches really block.
  enforcement?: 'database' | 'screen';
  // The same action also appears outside the parent page (Home, the user
  // workspace). Such a detail resolves on its own, so switching the page off
  // does not silently take the action away from those other places.
  standalone?: boolean;
  also_on_zh?: string;
  also_on_en?: string;
  also_on_ms?: string;
}

// Only the pages a Super Admin is allowed to grant/revoke for managed roles.
// Privilege/owner pages (rolesAccounts and roleAccess) are intentionally NOT
// here — they stay Super-Admin-only via NAV_ROLE_ACCESS and
// cannot be handed to another role from this screen (prevents privilege escalation).
export const ROLE_NAV_ACCESS_ITEMS: RoleNavAccessItemDefinition[] = [
  { key: 'taskInbox', label_zh: '首页', label_en: 'Home', label_ms: 'Laman Utama', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: [] },
  { key: 'customers', label_zh: '贷款申请', label_en: 'Loan Applications', label_ms: 'Permohonan Pinjaman', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: [] },
  { key: 'rawCustomers', label_zh: '潜在客户', label_en: 'Lead Pool', label_ms: 'Kumpulan Prospek', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: ['Operations Manager', 'Admin', 'Sales'], configurable_roles: ['Operations Manager', 'Admin', 'Sales'] },
  { key: 'customerRelationships', label_zh: '潜在客户关系', label_en: 'Customer Relationships', label_ms: 'Hubungan Pelanggan', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: ['Super Admin'], configurable_roles: [] },
  { key: 'calendar', label_zh: '日历', label_en: 'Calendar', label_ms: 'Kalendar', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: [] },
  { key: 'attendance', label_zh: '考勤与请假', label_en: 'Attendance & Leave', label_ms: 'Kehadiran & Cuti', group_zh: '日常工作', group_en: 'Daily Work', group_ms: 'Kerja Harian', default_roles: [] },
  { key: 'analytics', label_zh: '数据分析', label_en: 'Analytics', label_ms: 'Analitik', group_zh: '营销工具', group_en: 'Marketing', group_ms: 'Pemasaran', default_roles: ['Operations Manager', 'Admin', 'Sales'], configurable_roles: ['Operations Manager', 'Admin', 'Sales'] },
  { key: 'whatsapp', label_zh: 'WhatsApp 工具', label_en: 'WhatsApp Tools', label_ms: 'Alat WhatsApp', group_zh: '营销工具', group_en: 'Marketing', group_ms: 'Pemasaran', default_roles: ['Operations Manager', 'Admin', 'Sales'], configurable_roles: ['Operations Manager', 'Admin', 'Sales'] },
  { key: 'audit', label_zh: '审计日志', label_en: 'Audit Log', label_ms: 'Log Audit', group_zh: '运营管理', group_en: 'Operations', group_ms: 'Operasi', default_roles: ['Super Admin', 'Operations Manager', 'Admin'], configurable_roles: ['Operations Manager', 'Admin'] },
  { key: 'dataExport', label_zh: '数据导出', label_en: 'Data Export', label_ms: 'Eksport Data', group_zh: '运营管理', group_en: 'Operations', group_ms: 'Operasi', default_roles: ['Operations Manager', 'Super Admin', 'Admin'] },
  // Finance Center is the operational ledger for Super Admin and Operations
  // Manager. Admin/Sales stay locked off because their customer writes remain
  // owner/workflow scoped and cannot mutate settlement or stock reservations.
  // Delivery checklist (meeting 2026-10-13): every role works its own steps there; Rules decide which.
  { key: 'delivery', label_zh: '交车清单', label_en: 'Delivery', label_ms: 'Penghantaran', group_zh: '运营管理', group_en: 'Operations', group_ms: 'Operasi', default_roles: [] },
  { key: 'financeCenter', label_zh: '财务报表与库存', label_en: 'Financial Reports & Stock', label_ms: 'Laporan Kewangan & Stok', group_zh: '运营管理', group_en: 'Operations', group_ms: 'Operasi', default_roles: ['Super Admin', 'Operations Manager'], configurable_roles: ['Operations Manager'] },
  { key: 'vehicleInfo', label_zh: '车辆信息', label_en: 'Vehicle Info', label_ms: 'Maklumat Kenderaan', group_zh: '系统设置', group_en: 'System Settings', group_ms: 'Tetapan Sistem', default_roles: ['Super Admin'], configurable_roles: [] },
  { key: 'bankDatabase', label_zh: '银行数据库', label_en: 'Bank Database', label_ms: 'Pangkalan Data Bank', group_zh: '系统设置', group_en: 'System Settings', group_ms: 'Tetapan Sistem', default_roles: ['Super Admin'], configurable_roles: [] }
];

// Dataset rows are configurable only for roles that actually load the data:
// Admin and Sales receive no approval requests or missions. Since 2026-10-20
// Operations Manager loads every raw lead and its own WhatsApp clicks, and gets
// the Admin / Sales pages (lead pool, WhatsApp tools, analytics, add customer).
// Page-detail permissions use the same flat persisted setting shape as page
// access, so existing Firebase/local data needs no schema migration. Detail
// rows are resolved only after their parent page is allowed by the UI.
export const ROLE_NAV_ACCESS_DETAIL_ITEMS: RoleNavAccessDetailDefinition[] = [
  { key: 'customers.editApplication', parent_key: 'customers', label_zh: '编辑贷款申请资料', label_en: 'Edit Loan Application', label_ms: 'Edit Permohonan Pinjaman', group_zh: '贷款申请操作', group_en: 'Loan Application actions', group_ms: 'Tindakan Permohonan Pinjaman', default_roles: ['Super Admin', 'Operations Manager'], configurable_roles: ['Operations Manager', 'Admin'], enforcement: 'database' },
  { key: 'customers.addCustomer', parent_key: 'customers', label_zh: '新增客户', label_en: 'Add New Customer', label_ms: 'Tambah Pelanggan Baharu', group_zh: '贷款申请操作', group_en: 'Loan Application actions', group_ms: 'Tindakan Permohonan Pinjaman', default_roles: ['Operations Manager', 'Admin', 'Sales'], configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'screen' },
  // Super Admin lets Admins opt in to other shops' unclaimed applications;
  // enforced by Firestore Rules through admin_cross_shop_unclaimed_pool.
  { key: 'customers.crossShopUnclaimedPool', parent_key: 'customers', label_zh: '可选择查看其他店未认领的新申请', label_en: "May view other shops' unclaimed applications", label_ms: 'Boleh lihat permohonan kedai lain yang belum dituntut', group_zh: '贷款申请操作', group_en: 'Loan Application actions', group_ms: 'Tindakan Permohonan Pinjaman', default_roles: ['Super Admin'], configurable_roles: ['Admin'], enforcement: 'database' },
  { key: 'customers.shareLinks', parent_key: 'customers', label_zh: '分享链接', label_en: 'Share Links', label_ms: 'Kongsi Pautan', group_zh: '贷款申请操作', group_en: 'Loan Application actions', group_ms: 'Tindakan Permohonan Pinjaman', default_roles: ['Operations Manager', 'Admin', 'Sales'], configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'screen' },
  // Page details added 2026-10-24. Defaults equal what each role could do
  // before, so nothing changes until Super Admin flips a switch.
  { key: 'rawCustomers.importLeads', parent_key: 'rawCustomers', label_zh: '导入名单（CSV）', label_en: 'Import leads (CSV)', label_ms: 'Import prospek (CSV)', group_zh: '潜在客户操作', group_en: 'Lead Pool actions', group_ms: 'Tindakan Kumpulan Prospek', default_roles: ['Operations Manager', 'Admin', 'Sales'], configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'screen', standalone: true, also_on_zh: '也包括首页', also_on_en: 'Also on Home', also_on_ms: 'Juga di Laman Utama' },
  { key: 'rawCustomers.addLead', parent_key: 'rawCustomers', label_zh: '手动新增潜在客户', label_en: 'Add a lead by hand', label_ms: 'Tambah prospek secara manual', group_zh: '潜在客户操作', group_en: 'Lead Pool actions', group_ms: 'Tindakan Kumpulan Prospek', default_roles: ['Operations Manager', 'Admin', 'Sales'], configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'screen', standalone: true, also_on_zh: '也包括首页', also_on_en: 'Also on Home', also_on_ms: 'Juga di Laman Utama' },
  { key: 'calendar.viewAllStaff', parent_key: 'calendar', label_zh: '查看全员日历', label_en: 'See every staff calendar', label_ms: 'Lihat kalendar semua kakitangan', group_zh: '日历操作', group_en: 'Calendar actions', group_ms: 'Tindakan Kalendar', default_roles: ['Operations Manager'], configurable_roles: ['Operations Manager'], enforcement: 'screen' },
  { key: 'attendance.manageSchedules', parent_key: 'attendance', label_zh: '编辑员工排班', label_en: 'Edit staff schedules', label_ms: 'Edit jadual kakitangan', group_zh: '考勤操作', group_en: 'Attendance actions', group_ms: 'Tindakan Kehadiran', default_roles: ['Admin'], configurable_roles: ['Admin'], enforcement: 'database' },
  { key: 'delivery.voidPayment', parent_key: 'delivery', label_zh: '作废收款记录', label_en: 'Void a payment record', label_ms: 'Batalkan rekod bayaran', group_zh: '交车操作', group_en: 'Delivery actions', group_ms: 'Tindakan Penghantaran', default_roles: ['Operations Manager', 'Admin', 'Sales'], configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'database' },
  { key: 'whatsapp.manageLinks', parent_key: 'whatsapp', label_zh: '新增 / 修改 / 删除追踪链接', label_en: 'Add, edit and delete tracking links', label_ms: 'Tambah, edit dan padam pautan penjejakan', group_zh: 'WhatsApp 操作', group_en: 'WhatsApp actions', group_ms: 'Tindakan WhatsApp', default_roles: ['Operations Manager', 'Admin', 'Sales'], configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'database' },
  { key: 'whatsapp.shortLinks', parent_key: 'whatsapp', label_zh: '生成短链接', label_en: 'Create short links', label_ms: 'Cipta pautan pendek', group_zh: 'WhatsApp 操作', group_en: 'WhatsApp actions', group_ms: 'Tindakan WhatsApp', default_roles: ['Operations Manager', 'Admin', 'Sales'], configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'screen' },
  { key: 'financeCenter.manageStock', parent_key: 'financeCenter', label_zh: '新增 / 修改库存与成本', label_en: 'Add and edit stock and cost', label_ms: 'Tambah dan edit stok serta kos', group_zh: '财务与库存操作', group_en: 'Finance & stock actions', group_ms: 'Tindakan Kewangan & Stok', default_roles: ['Operations Manager'], configurable_roles: ['Operations Manager'], enforcement: 'screen' },
  { key: 'financeCenter.recalculateCommission', parent_key: 'financeCenter', label_zh: '按佣金档重算佣金', label_en: 'Recalculate tier commission', label_ms: 'Kira semula komisen mengikut tahap', group_zh: '财务与库存操作', group_en: 'Finance & stock actions', group_ms: 'Tindakan Kewangan & Stok', default_roles: ['Operations Manager'], configurable_roles: ['Operations Manager'], enforcement: 'screen' },
  { key: 'dataExport.customers', parent_key: 'dataExport', label_zh: '客户与贷款申请', label_en: 'Customers & Loan Applications', label_ms: 'Pelanggan & Permohonan Pinjaman', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Operations Manager', 'Super Admin', 'Admin'], enforcement: 'screen' },
  { key: 'dataExport.attendance', parent_key: 'dataExport', label_zh: '员工考勤', label_en: 'Staff Attendance', label_ms: 'Kehadiran Kakitangan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Super Admin', 'Admin'], configurable_roles: ['Admin'], enforcement: 'screen' },
  { key: 'dataExport.staffLeave', parent_key: 'dataExport', label_zh: '员工 Leave / MC', label_en: 'Staff Leave / MC', label_ms: 'Cuti / MC Kakitangan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Super Admin', 'Admin'], configurable_roles: ['Admin'], enforcement: 'screen' },
  { key: 'dataExport.rawLeads', parent_key: 'dataExport', label_zh: '潜在客户名单（全部）', label_en: 'Leads (all)', label_ms: 'Prospek (semua)', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Operations Manager', 'Super Admin', 'Admin'] , configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'screen' },
  { key: 'dataExport.followUp', parent_key: 'dataExport', label_zh: '跟进中名单', label_en: 'Follow Up Leads', label_ms: 'Prospek susulan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Operations Manager', 'Super Admin', 'Admin'] , configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'screen' },
  { key: 'dataExport.vehicleCatalog', parent_key: 'dataExport', label_zh: '车辆目录', label_en: 'Vehicle Catalog', label_ms: 'Katalog Kenderaan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Super Admin', 'Admin'], enforcement: 'screen' },
  { key: 'dataExport.approvals', parent_key: 'dataExport', label_zh: '审批记录', label_en: 'Approval Requests', label_ms: 'Permintaan Kelulusan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Super Admin', 'Admin'] , configurable_roles: ['Operations Manager'], enforcement: 'screen' },
  { key: 'dataExport.auditLogs', parent_key: 'dataExport', label_zh: '审计记录', label_en: 'Audit Logs', label_ms: 'Log Audit', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Super Admin', 'Admin'], enforcement: 'screen' },
  { key: 'dataExport.missions', parent_key: 'dataExport', label_zh: '任务', label_en: 'Missions', label_ms: 'Misi', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Super Admin', 'Admin'] , configurable_roles: ['Operations Manager'], enforcement: 'screen' },
  { key: 'dataExport.whatsappLinks', parent_key: 'dataExport', label_zh: 'WhatsApp 追踪链接', label_en: 'WhatsApp Tracking Links', label_ms: 'Pautan Penjejakan WhatsApp', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Super Admin', 'Admin'], enforcement: 'screen' },
  { key: 'dataExport.whatsappClicks', parent_key: 'dataExport', label_zh: 'WhatsApp 独立访客', label_en: 'WhatsApp Unique Visitors', label_ms: 'Pelawat Unik WhatsApp', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Operations Manager', 'Super Admin', 'Admin'] , configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'screen' },
  { key: 'dataExport.banks', parent_key: 'dataExport', label_zh: '银行数据库', label_en: 'Bank Database', label_ms: 'Pangkalan Data Bank', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Super Admin', 'Admin'], enforcement: 'screen' },
  { key: 'dataExport.rejectCodes', parent_key: 'dataExport', label_zh: '拒贷原因代码', label_en: 'Reject Reason Codes', label_ms: 'Kod Sebab Penolakan', group_zh: '数据导出内容', group_en: 'Data Export datasets', group_ms: 'Set data eksport', default_roles: ['Super Admin', 'Admin'], enforcement: 'screen' },
  { key: 'dataExport.analyticsResults', parent_key: 'dataExport', label_zh: '数据分析结果', label_en: 'Analytics Results', label_ms: 'Keputusan Analitik', group_zh: '其他导出入口', group_en: 'Other export entry points', group_ms: 'Tempat eksport lain', default_roles: ['Operations Manager', 'Super Admin', 'Admin'] , configurable_roles: ['Operations Manager', 'Admin', 'Sales'], enforcement: 'screen' }
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
  if (detail && !detail.standalone && !resolveNavAccess(role, detail.parent_key, settings)) {
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
  operations_manager_finance_center: boolean;
  operations_manager_audit_log: boolean;
  admin_cross_shop_unclaimed_pool: boolean;
  admin_manage_schedules: boolean;
  operations_manager_void_payment: boolean;
  admin_void_payment: boolean;
  sales_void_payment: boolean;
  operations_manager_whatsapp_links: boolean;
  admin_whatsapp_links: boolean;
  sales_whatsapp_links: boolean;
}

// Firestore Rules cannot safely search the flat roleNavAccess array. Publish a
// compact, derived capability map beside it so these switches are enforced by
// Rules as well as hidden in the UI: loan-application edit, and Operations
// Manager's Finance Center (deal_finance, stock) and Audit Log.
export function buildRoleAccessCapabilities(
  settings: RoleNavAccessSetting[] | undefined
): RoleAccessCapabilities {
  return {
    operations_manager_edit_loan_application: resolveNavAccess(
      'Operations Manager',
      'customers.editApplication',
      settings
    ),
    admin_edit_loan_application: resolveNavAccess('Admin', 'customers.editApplication', settings),
    operations_manager_finance_center: resolveNavAccess('Operations Manager', 'financeCenter', settings),
    operations_manager_audit_log: resolveNavAccess('Operations Manager', 'audit', settings),
    admin_cross_shop_unclaimed_pool: resolveNavAccess('Admin', 'customers.crossShopUnclaimedPool', settings),
    // Page details enforced by firestore.rules (schedules, payment void) and
    // server.mjs (WhatsApp links). A missing field reads as allowed there, so
    // older projections keep today's behaviour until Super Admin saves.
    admin_manage_schedules: resolveNavAccess('Admin', 'attendance.manageSchedules', settings),
    operations_manager_void_payment: resolveNavAccess('Operations Manager', 'delivery.voidPayment', settings),
    admin_void_payment: resolveNavAccess('Admin', 'delivery.voidPayment', settings),
    sales_void_payment: resolveNavAccess('Sales', 'delivery.voidPayment', settings),
    operations_manager_whatsapp_links: resolveNavAccess('Operations Manager', 'whatsapp.manageLinks', settings),
    admin_whatsapp_links: resolveNavAccess('Admin', 'whatsapp.manageLinks', settings),
    sales_whatsapp_links: resolveNavAccess('Sales', 'whatsapp.manageLinks', settings)
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

// The role that actually receives a task: the configured owner role, unless
// no Active account holds it or that role cannot work it (canRoleWorkTask),
// in which case Super Admin takes over so the task is never silently dropped.
export function resolveEffectiveTaskAssignmentRole(
  taskKey: TaskAssignmentKey,
  settings: RoleNavAccessSetting[] | undefined,
  roleAccounts: { role: RoleAccountRole; status?: string }[]
): TaskAssignmentRole {
  const assignedRole = resolveTaskAssignmentRole(taskKey, settings);
  if (assignedRole === 'Super Admin') return assignedRole;
  const hasActiveAssignedRole = roleAccounts.some((account) => (
    account.status === 'Active' && account.role === assignedRole
  ));
  return hasActiveAssignedRole && canRoleWorkTask(assignedRole, taskKey, settings)
    ? assignedRole
    : 'Super Admin';
}

// Whether a role can see and act on a task: its Home is on and, for tasks that
// write a page's data, that page is on too (Rules enforce Finance Center).
export function canRoleWorkTask(
  role: RoleAccountRole,
  taskKey: TaskAssignmentKey,
  settings: RoleNavAccessSetting[] | undefined
): boolean {
  const requiredNavKey = TASK_ASSIGNMENT_ITEMS.find((item) => item.key === taskKey)?.required_nav_key;
  return resolveNavAccess(role, 'taskInbox', settings)
    && (!requiredNavKey || resolveNavAccess(role, requiredNavKey, settings));
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
