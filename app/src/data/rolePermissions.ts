/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoleAccountRole, RolePermissionSetting } from '../types';

export interface PermissionSectionDefinition {
  id: string;
  label: string;
  description: string;
}

export interface PermissionPageDefinition {
  id: string;
  label: string;
  group: string;
  description: string;
  sections: PermissionSectionDefinition[];
}

export const ROLE_PERMISSION_ROLES: RoleAccountRole[] = ['Super Admin', 'Operations Manager', 'Admin', 'Sales'];

export const ROLE_PERMISSION_PAGE_SECTIONS: PermissionPageDefinition[] = [
  {
    id: 'taskInbox',
    label: '任务箱',
    group: '日常工作',
    description: '当前员工每天需要处理的任务入口。',
    sections: [
      { id: 'work_queue', label: '任务列表', description: '查看个人任务、银行动作和提醒。' },
      { id: 'missing_customer_info', label: '缺失资料', description: '处理客户或文件缺失项目。' },
      { id: 'lead_follow_up', label: '名单跟进', description: '打开潜在客户跟进任务。' },
      { id: 'mission_progress', label: '任务进度', description: '查看奖励任务进度。' }
    ]
  },
  {
    id: 'staffView',
    label: '手机模式',
    group: '日常工作',
    description: '给员工手机使用的轻量工作页。',
    sections: [
      { id: 'application_cards', label: '贷款卡片', description: '查看自己的贷款申请卡片。' },
      { id: 'lead_follow_up', label: '跟进卡片', description: '查看和更新潜在名单跟进。' },
      { id: 'mission_cards', label: '奖励任务', description: '查看当前员工任务和奖励。' }
    ]
  },
  {
    id: 'customers',
    label: '贷款申请',
    group: '日常工作',
    description: '客户贷款申请和银行记录主工作区。',
    sections: [
      { id: 'customer_list', label: '客户列表', description: '查看贷款申请列表。' },
      { id: 'add_customer', label: '新增客户', description: '建立新的贷款申请。' },
      { id: 'detail_drawer', label: '客户详情', description: '打开客户详情和银行记录。' },
      { id: 'edit_customer', label: '编辑资料', description: '修改客户、贷款、银行和文件资料。' },
      { id: 'share_link', label: '分享链接', description: '建立客户申请表链接或短链接。' }
    ]
  },
  {
    id: 'rawCustomers',
    label: '潜在名单',
    group: '日常工作',
    description: '社媒和渠道导入名单的公海池。',
    sections: [
      { id: 'lead_list', label: '名单列表', description: '查看潜在客户名单。' },
      { id: 'import_leads', label: '导入名单', description: '导入新的渠道名单。' },
      { id: 'take_lead', label: '认领 WhatsApp', description: '打开 WhatsApp 并认领公海名单。' },
      { id: 'cross_check', label: '交叉检查', description: '查看名单和贷款申请匹配关系。' }
    ]
  },
  {
    id: 'followUp',
    label: '跟进',
    group: '日常工作',
    description: '已认领名单的持续跟进工作区。',
    sections: [
      { id: 'mine', label: '我的跟进', description: '查看自己的已认领名单。' },
      { id: 'all_staff', label: '全员跟进', description: '查看所有员工的已认领名单。' },
      { id: 'update_status', label: '更新状态', description: '更新跟进状态、备注和提醒。' },
      { id: 'release_lead', label: '释放名单', description: '把名单释放回公海。' }
    ]
  },
  {
    id: 'calendar',
    label: '日历',
    group: '日常工作',
    description: '申请、银行和名单提醒的只读日历。',
    sections: [
      { id: 'application_events', label: '申请事件', description: '查看客户申请和回电时间。' },
      { id: 'bank_follow_up', label: '银行跟进', description: '查看银行下一步提醒。' },
      { id: 'lead_follow_up', label: '名单提醒', description: '查看潜在名单跟进提醒。' },
      { id: 'all_staff_scope', label: '全员视图', description: '查看所有员工的日历事件。' }
    ]
  },
  {
    id: 'analytics',
    label: '数据分析',
    group: '营销工具',
    description: '销售、客户画像、名单和营销表现。',
    sections: [
      { id: 'loan_analytics', label: '贷款分析', description: '查看申请量、批核率和车型需求。' },
      { id: 'raw_lead_analytics', label: '名单分析', description: '查看潜在名单来源和转化。' },
      { id: 'marketing_analytics', label: '营销分析', description: '查看 WhatsApp 和 UTM 表现。' },
      { id: 'ops_analytics', label: '运营分析', description: '查看员工工作量和运营表现。' },
      { id: 'global_scope', label: '全员范围', description: '查看全员数据而不是个人数据。' }
    ]
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp 工具',
    group: '营销工具',
    description: '追踪链接、短链接和默认讯息。',
    sections: [
      { id: 'default_message', label: '默认讯息', description: '维护全局 WhatsApp 默认话术。' },
      { id: 'tracking_links', label: '追踪链接', description: '建立和管理追踪链接。' },
      { id: 'short_links', label: '短链接', description: '建立内部短链接。' },
      { id: 'click_report', label: '点击记录', description: '查看 WhatsApp 点击数据。' }
    ]
  },
  {
    id: 'rewards',
    label: '佣金与奖励',
    group: '营销工具',
    description: '收入结算、任务和战队奖励。',
    sections: [
      { id: 'my_payout', label: '个人收入', description: '查看自己的估算收入和奖励。' },
      { id: 'all_staff_summary', label: '全员汇总', description: '查看所有员工收入汇总。' },
      { id: 'mission_rewards', label: '任务奖励', description: '查看和提交任务奖励审批。' },
      { id: 'team_battle', label: '战队对决', description: '查看战队成绩和奖励。' },
      { id: 'manage_rules', label: '规则设定', description: '维护佣金规则和战队设定。' }
    ]
  },
  {
    id: 'approvals',
    label: '审批',
    group: '运营管理',
    description: '折扣、佣金、任务奖励和请假审批。',
    sections: [
      { id: 'submit_request', label: '提交审批', description: '提交自己的审批申请。' },
      { id: 'my_requests', label: '我的申请', description: '查看自己提交的审批。' },
      { id: 'review_queue', label: '审批队列', description: '审核待处理申请。' },
      { id: 'all_requests', label: '全部记录', description: '查看所有审批历史。' }
    ]
  },
  {
    id: 'missingInfo',
    label: '缺失资料汇总',
    group: '运营管理',
    description: '缺失客户资料、文件和任务汇总。',
    sections: [
      { id: 'missing_documents', label: '文件缺失', description: '查看缺失文件统计。' },
      { id: 'staff_summary', label: '员工汇总', description: '查看员工缺失资料分布。' },
      { id: 'custom_missions', label: '自定义任务', description: '查看和管理自定义任务。' }
    ]
  },
  {
    id: 'audit',
    label: '审计记录',
    group: '运营管理',
    description: '系统变更记录和操作追踪。',
    sections: [
      { id: 'view_log', label: '查看记录', description: '查看最近系统审计记录。' },
      { id: 'search_log', label: '筛选记录', description: '搜索和筛选审计内容。' }
    ]
  },
  {
    id: 'salesBudget',
    label: '系统成本',
    group: '运营管理',
    description: '系统建设和月度成本透明页。',
    sections: [
      { id: 'cost_view', label: '成本查看', description: '查看一次性和持续成本。' }
    ]
  },
  {
    id: 'vehicleInfo',
    label: '车辆信息',
    group: '系统设置',
    description: '车型目录、月供方案和数据清理。',
    sections: [
      { id: 'vehicle_catalog', label: '车型目录', description: '管理车型、价格和贷款基础。' },
      { id: 'finance_profiles', label: '贷款方案', description: '维护月供公式和年限。' },
      { id: 'data_cleanup', label: '数据清理', description: '维护归一化关系。' }
    ]
  },
  {
    id: 'bankDatabase',
    label: '银行数据库',
    group: '系统设置',
    description: '银行名单、图标资料和拒贷原因代码。',
    sections: [
      { id: 'bank_list', label: '银行名单', description: '新增、启用或停用银行。' },
      { id: 'bank_icons', label: '银行图标', description: '上传和裁切银行图标。' },
      { id: 'code_list', label: 'CODE 查看', description: '查看拒贷原因代码。' },
      { id: 'code_edit', label: 'CODE 编辑', description: '新增、修改或删除 CODE。' }
    ]
  },
  {
    id: 'rolesAccounts',
    label: '角色与账号',
    group: '系统设置',
    description: '员工账号、角色和头像资料。',
    sections: [
      { id: 'account_list', label: '账号列表', description: '查看员工账号。' },
      { id: 'role_edit', label: '角色编辑', description: '新增、修改或停用账号。' },
      { id: 'avatar_library', label: '头像库', description: '维护默认头像图库。' }
    ]
  },
  {
    id: 'permissions',
    label: '权限设定',
    group: '系统设置',
    description: '每个角色在每个页面 section 的使用权限。',
    sections: [
      { id: 'permission_switches', label: '权限开关', description: '切换角色权限矩阵。' },
      { id: 'permission_audit', label: '变更记录', description: '把权限变更写入审计记录。' }
    ]
  },
  {
    id: 'flow',
    label: '系统手册',
    group: '系统',
    description: '管理员操作手册和系统关系说明。',
    sections: [
      { id: 'operating_guide', label: '操作指南', description: '阅读页面用途和流程说明。' },
      { id: 'system_flow', label: '系统关系', description: '查看数据来源、写入和关联。' }
    ]
  },
  {
    id: 'user',
    label: '用户资料',
    group: '系统',
    description: '当前员工自己的资料页。',
    sections: [
      { id: 'profile_view', label: '资料查看', description: '查看当前账号资料。' },
      { id: 'avatar_settings', label: '头像设置', description: '上传、选择或移除头像。' }
    ]
  }
];

const DEFAULT_ADMIN_ENABLED = new Set([
  'taskInbox',
  'staffView',
  'customers',
  'rawCustomers',
  'followUp',
  'calendar',
  'analytics',
  'whatsapp',
  'rewards',
  'approvals',
  'missingInfo',
  'audit',
  'salesBudget',
  'vehicleInfo',
  'bankDatabase',
  'flow',
  'user'
]);

const DEFAULT_SALES_ENABLED = new Set([
  'taskInbox',
  'staffView',
  'customers',
  'rawCustomers',
  'followUp',
  'calendar',
  'rewards',
  'approvals',
  'user'
]);

const DEFAULT_SALES_DISABLED_SECTIONS = new Set([
  'customers:edit_customer',
  'rawCustomers:import_leads',
  'followUp:all_staff',
  'calendar:all_staff_scope',
  'rewards:all_staff_summary',
  'rewards:manage_rules',
  'approvals:review_queue',
  'approvals:all_requests'
]);

const DEFAULT_ADMIN_DISABLED_SECTIONS = new Set([
  'rewards:manage_rules',
  'vehicleInfo:data_cleanup',
  'bankDatabase:code_edit',
  'rolesAccounts:role_edit',
  'rolesAccounts:avatar_library',
  'permissions:permission_switches'
]);

export function getDefaultRolePermissionEnabled(role: RoleAccountRole, pageId: string, sectionId: string) {
  if (role === 'Super Admin') {
    return true;
  }

  const key = `${pageId}:${sectionId}`;

  if (role === 'Admin') {
    return DEFAULT_ADMIN_ENABLED.has(pageId) && !DEFAULT_ADMIN_DISABLED_SECTIONS.has(key);
  }

  return DEFAULT_SALES_ENABLED.has(pageId) && !DEFAULT_SALES_DISABLED_SECTIONS.has(key);
}

export function buildDefaultRolePermissionSettings(): RolePermissionSetting[] {
  return ROLE_PERMISSION_ROLES.flatMap((role) => (
    ROLE_PERMISSION_PAGE_SECTIONS.flatMap((page) => (
      page.sections.map((section) => ({
        role,
        page_id: page.id,
        section_id: section.id,
        enabled: getDefaultRolePermissionEnabled(role, page.id, section.id)
      }))
    ))
  ));
}

export function normalizeRolePermissionSettings(settings: RolePermissionSetting[] = []) {
  const settingsByKey = new Map<string, RolePermissionSetting>();

  settings.forEach((setting) => {
    if (!ROLE_PERMISSION_ROLES.includes(setting.role)) {
      return;
    }

    const page = ROLE_PERMISSION_PAGE_SECTIONS.find((item) => item.id === setting.page_id);
    const section = page?.sections.find((item) => item.id === setting.section_id);

    if (!page || !section) {
      return;
    }

    settingsByKey.set(`${setting.role}:${setting.page_id}:${setting.section_id}`, {
      role: setting.role,
      page_id: setting.page_id,
      section_id: setting.section_id,
      enabled: Boolean(setting.enabled),
      updated_at: setting.updated_at || '',
      updated_by: setting.updated_by || ''
    });
  });

  return buildDefaultRolePermissionSettings().map((defaultSetting) => (
    settingsByKey.get(`${defaultSetting.role}:${defaultSetting.page_id}:${defaultSetting.section_id}`) || defaultSetting
  ));
}
