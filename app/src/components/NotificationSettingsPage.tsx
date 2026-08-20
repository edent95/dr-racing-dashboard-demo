/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Bell, CalendarClock, ClipboardList, FileWarning, MessageSquareWarning, Search, UserPlus } from 'lucide-react';
import { tr } from '../lib/i18n';
import type { NotificationItem, NotificationType, RoleAccount } from '../types';

type NotificationRuleGroup = 'lead' | 'calendar' | 'loan' | 'mission' | 'comment';

interface NotificationRuleDefinition {
  type: NotificationType;
  group: NotificationRuleGroup;
  title: { zh: string; en: string; ms: string };
  trigger: { zh: string; en: string; ms: string };
  recipient: { zh: string; en: string; ms: string };
  destination: { zh: string; en: string; ms: string };
  resolution: { zh: string; en: string; ms: string };
  recipientMode: 'staff' | 'role' | 'dynamic';
}

const NOTIFICATION_RULES: NotificationRuleDefinition[] = [
  {
    type: 'raw_lead_assigned', group: 'lead', recipientMode: 'staff',
    title: { zh: '新名单已分配', en: 'New lead assigned', ms: 'Prospek baharu diberikan' },
    trigger: { zh: '潜在客户被接手或转交', en: 'A lead is taken or transferred', ms: 'Prospek diambil atau dipindahkan' },
    recipient: { zh: '被分配的负责人', en: 'Assigned handler', ms: 'Pengendali yang ditugaskan' },
    destination: { zh: '潜在客户', en: 'Lead Pool', ms: 'Kumpulan Prospek' },
    resolution: { zh: '负责人打开后解除；放回未分配后移除', en: 'Resolves when the handler opens it; removed when released', ms: 'Selesai apabila pengendali membuka; dibuang apabila dilepaskan' }
  },
  {
    type: 'calendar_task_assigned', group: 'calendar', recipientMode: 'staff',
    title: { zh: '日历任务已分配', en: 'Calendar task assigned', ms: 'Tugasan kalendar diberikan' },
    trigger: { zh: 'Super Admin 指派日历任务', en: 'Super Admin assigns a calendar task', ms: 'Pentadbir Super memberikan tugasan kalendar' },
    recipient: { zh: '被指派的员工', en: 'Assigned staff', ms: 'Kakitangan yang ditugaskan' },
    destination: { zh: '日历', en: 'Calendar', ms: 'Kalendar' },
    resolution: { zh: '任务完成后自动解除', en: 'Resolves when the task is completed', ms: 'Selesai apabila tugasan selesai' }
  },
  {
    type: 'customer_call_back_due', group: 'loan', recipientMode: 'staff',
    title: { zh: '客户回电到期', en: 'Customer call-back due', ms: 'Panggilan semula pelanggan tiba masa' },
    trigger: { zh: '客户回电日期已到', en: 'Customer call-back date is due', ms: 'Tarikh panggilan semula pelanggan sudah tiba' },
    recipient: { zh: '贷款负责人', en: 'Loan handler', ms: 'Pengendali pinjaman' },
    destination: { zh: '客户资料', en: 'Customer record', ms: 'Rekod pelanggan' },
    resolution: { zh: '更新日期或贷款完成后自动解除', en: 'Resolves after the date changes or the loan completes', ms: 'Selesai selepas tarikh berubah atau pinjaman selesai' }
  },
  {
    type: 'loan_sales_review_required', group: 'loan', recipientMode: 'staff',
    title: { zh: 'Sales 检查新申请', en: 'Sales checks new application', ms: 'Jualan menyemak permohonan baharu' },
    trigger: { zh: '客户通过 Sales application form 提交', en: 'Customer submits through a Sales application form', ms: 'Pelanggan menghantar melalui borang permohonan Jualan' },
    recipient: { zh: '表单所属 Sales', en: 'Assigned Sales handler', ms: 'Pengendali Jualan yang ditugaskan' },
    destination: { zh: '贷款申请', en: 'Loan application', ms: 'Permohonan pinjaman' },
    resolution: { zh: 'Sales 补齐资料并按 Notify Admin 后自动解除', en: 'Resolves after Sales completes the application and uses Notify Admin', ms: 'Selesai selepas Jualan melengkapkan permohonan dan menggunakan Notify Admin' }
  },
  {
    type: 'loan_admin_action_required', group: 'loan', recipientMode: 'dynamic',
    title: { zh: 'Admin 需要处理贷款', en: 'Loan needs Admin action', ms: 'Pinjaman perlukan tindakan Pentadbir' },
    trigger: { zh: '新申请等待检查，或 Sales 已完成补件', en: 'A new application needs review or Sales completed documents', ms: 'Permohonan baharu perlu disemak atau Jualan melengkapkan dokumen' },
    recipient: { zh: '指定 Admin；未指定时给 Admin、Super Admin', en: 'Assigned Admin; otherwise Admin and Super Admin', ms: 'Pentadbir ditugaskan; jika tiada, Pentadbir dan Pentadbir Super' },
    destination: { zh: '贷款申请', en: 'Loan application', ms: 'Permohonan pinjaman' },
    resolution: { zh: 'Admin 退回补件或提交银行后自动解除', en: 'Resolves when Admin requests documents or submits to the bank', ms: 'Selesai apabila Pentadbir meminta dokumen atau menghantar kepada bank' }
  },
  {
    type: 'loan_documents_required', group: 'loan', recipientMode: 'staff',
    title: { zh: '贷款需要补资料', en: 'Loan documents required', ms: 'Dokumen pinjaman diperlukan' },
    trigger: { zh: 'Admin 把缺少的文件退回负责人', en: 'Admin returns missing documents to the handler', ms: 'Pentadbir memulangkan dokumen yang hilang kepada pengendali' },
    recipient: { zh: '贷款负责人', en: 'Loan handler', ms: 'Pengendali pinjaman' },
    destination: { zh: '贷款申请', en: 'Loan application', ms: 'Permohonan pinjaman' },
    resolution: { zh: '负责人完成补件并交回 Admin 后自动解除', en: 'Resolves when the handler completes documents and returns them to Admin', ms: 'Selesai apabila pengendali melengkapkan dokumen dan mengembalikannya kepada Pentadbir' }
  },
  {
    type: 'bank_need_more_info', group: 'loan', recipientMode: 'staff',
    title: { zh: '银行需要更多资料', en: 'Bank needs more info', ms: 'Bank perlukan maklumat lanjut' },
    trigger: { zh: '银行状态变成 Need More Info', en: 'Bank status becomes Need More Info', ms: 'Status bank menjadi Perlu Maklumat Lanjut' },
    recipient: { zh: '贷款负责人', en: 'Loan handler', ms: 'Pengendali pinjaman' },
    destination: { zh: '贷款申请', en: 'Loan application', ms: 'Permohonan pinjaman' },
    resolution: { zh: '负责人完成补件并交回 Admin 后自动解除', en: 'Resolves when the handler completes documents and returns them to Admin', ms: 'Selesai apabila pengendali melengkapkan dokumen dan mengembalikannya kepada Pentadbir' }
  },
  {
    type: 'bank_follow_up_due', group: 'loan', recipientMode: 'staff',
    title: { zh: '银行跟进到期', en: 'Bank follow-up due', ms: 'Susulan bank tiba masa' },
    trigger: { zh: '银行下次跟进日期已到', en: 'Bank next follow-up date is due', ms: 'Tarikh susulan bank seterusnya sudah tiba' },
    recipient: { zh: '负责该银行申请的 Admin', en: 'Admin handling the bank application', ms: 'Pentadbir yang mengendalikan permohonan bank' },
    destination: { zh: '贷款申请', en: 'Loan application', ms: 'Permohonan pinjaman' },
    resolution: { zh: '更新日期或银行有决定后自动解除', en: 'Resolves after the date changes or the bank records a decision', ms: 'Selesai selepas tarikh berubah atau bank merekodkan keputusan' }
  },
  {
    type: 'loan_rejected_action_required', group: 'loan', recipientMode: 'staff',
    title: { zh: '拒贷等待 Sales 处理', en: 'Rejected loan needs Sales action', ms: 'Pinjaman ditolak perlukan tindakan Jualan' },
    trigger: { zh: 'Admin 保存银行拒绝结果和 8 位 CODE', en: 'Admin records a bank rejection with an 8-digit CODE', ms: 'Pentadbir merekodkan penolakan bank dengan KOD 8 digit' },
    recipient: { zh: '贷款负责人', en: 'Loan handler', ms: 'Pengendali pinjaman' },
    destination: { zh: '贷款申请', en: 'Loan application', ms: 'Permohonan pinjaman' },
    resolution: { zh: 'Sales 拒贷结案或完成补件后自动解除', en: 'Resolves when Sales closes the rejection or completes new documents', ms: 'Selesai apabila Jualan menutup penolakan atau melengkapkan dokumen baharu' }
  },
  {
    type: 'loan_approved', group: 'loan', recipientMode: 'staff',
    title: { zh: '贷款已批准', en: 'Loan approved', ms: 'Pinjaman diluluskan' },
    trigger: { zh: 'Admin 把银行结果更新为 Approved', en: 'Admin updates a bank result to Approved', ms: 'Pentadbir mengemas kini keputusan bank kepada Diluluskan' },
    recipient: { zh: '贷款负责人', en: 'Loan handler', ms: 'Pengendali pinjaman' },
    destination: { zh: '贷款申请', en: 'Loan application', ms: 'Permohonan pinjaman' },
    resolution: { zh: 'Sales 点击客户已联系后自动解除', en: 'Resolves when Sales marks the customer as contacted', ms: 'Selesai apabila Jualan menandakan pelanggan telah dihubungi' }
  },
  {
    type: 'rejected_loan_missing_code', group: 'loan', recipientMode: 'staff',
    title: { zh: '拒贷缺少原因代码', en: 'Rejected loan missing code', ms: 'Pinjaman ditolak tanpa kod' },
    trigger: { zh: '贷款已拒绝但没有最终原因代码', en: 'Loan is rejected without a final reason code', ms: 'Pinjaman ditolak tanpa kod sebab akhir' },
    recipient: { zh: '贷款负责人', en: 'Loan handler', ms: 'Pengendali pinjaman' },
    destination: { zh: '贷款申请', en: 'Loan application', ms: 'Permohonan pinjaman' },
    resolution: { zh: '填写最终原因代码后移除', en: 'Removed after the final reason code is filled', ms: 'Dibuang selepas kod sebab akhir diisi' }
  },
  {
    type: 'mission_due_soon', group: 'mission', recipientMode: 'dynamic',
    title: { zh: '任务即将到期', en: 'Mission due soon', ms: 'Misi hampir tamat' },
    trigger: { zh: 'Active 任务在 3 天内结束', en: 'An active mission ends within 3 days', ms: 'Misi aktif tamat dalam masa 3 hari' },
    recipient: { zh: '任务范围内的员工', en: 'Staff in the mission scope', ms: 'Kakitangan dalam skop misi' },
    destination: { zh: '任务', en: 'Missions', ms: 'Misi' },
    resolution: { zh: '任务到期或停用后自动解除', en: 'Resolves when the mission ends or is disabled', ms: 'Selesai apabila misi tamat atau dilumpuhkan' }
  },
  {
    type: 'custom_mission_target_reached', group: 'mission', recipientMode: 'staff',
    title: { zh: '任务目标已达成', en: 'Mission target reached', ms: 'Sasaran misi dicapai' },
    trigger: { zh: '员工达到自定义任务目标', en: 'A staff member reaches a custom mission target', ms: 'Kakitangan mencapai sasaran misi tersuai' },
    recipient: { zh: '达成员工', en: 'Staff who reached the target', ms: 'Kakitangan yang mencapai sasaran' },
    destination: { zh: '任务', en: 'Missions', ms: 'Misi' },
    resolution: { zh: '任务停用后自动解除', en: 'Resolves when the mission is disabled', ms: 'Selesai apabila misi dilumpuhkan' }
  },
  {
    type: 'internal_comment_tagged', group: 'comment', recipientMode: 'dynamic',
    title: { zh: '内部评论被标记', en: 'Tagged in internal comment', ms: 'Ditanda dalam komen dalaman' },
    trigger: { zh: '客户评论 @员工或@角色', en: 'A customer comment tags staff or a role', ms: 'Komen pelanggan menanda kakitangan atau peranan' },
    recipient: { zh: '指定员工优先；没有指定员工才按角色', en: 'Named staff first; role only when no staff is named', ms: 'Kakitangan dinamakan dahulu; peranan hanya jika tiada nama' },
    destination: { zh: '客户 Activity Thread', en: 'Customer Activity Thread', ms: 'Benang Aktiviti Pelanggan' },
    resolution: { zh: '接收人打开后标记已读', en: 'Marked read when the recipient opens it', ms: 'Ditanda dibaca apabila penerima membukanya' }
  }
];

const GROUP_LABELS: Record<NotificationRuleGroup | 'all', { zh: string; en: string; ms: string }> = {
  all: { zh: '全部', en: 'All', ms: 'Semua' }, lead: { zh: '名单', en: 'Lead', ms: 'Prospek' },
  calendar: { zh: '日历', en: 'Calendar', ms: 'Kalendar' }, loan: { zh: '贷款', en: 'Loan', ms: 'Pinjaman' },
  mission: { zh: '任务', en: 'Mission', ms: 'Misi' }, comment: { zh: '评论', en: 'Comment', ms: 'Komen' }
};

const MODE_CLASS = {
  staff: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  role: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  dynamic: 'bg-amber-50 text-amber-700 ring-amber-100'
};

function localize(copy: { zh: string; en: string; ms: string }) {
  return tr(copy.zh, copy.en, copy.ms);
}

function RuleIcon({ rule }: { rule: NotificationRuleDefinition }) {
  if (rule.type === 'raw_lead_assigned') return <UserPlus className="h-4 w-4" />;
  if (rule.group === 'calendar') return <CalendarClock className="h-4 w-4" />;
  if (rule.group === 'mission') return <ClipboardList className="h-4 w-4" />;
  if (rule.group === 'comment') return <MessageSquareWarning className="h-4 w-4" />;
  if (rule.type === 'rejected_loan_missing_code') return <FileWarning className="h-4 w-4" />;
  return <Bell className="h-4 w-4" />;
}

interface NotificationSettingsPageProps {
  notifications: NotificationItem[];
  roleAccounts: RoleAccount[];
}

export default function NotificationSettingsPage({ notifications, roleAccounts }: NotificationSettingsPageProps) {
  const [activeGroup, setActiveGroup] = useState<NotificationRuleGroup | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const activeStaffCount = roleAccounts.filter((account) => account.status === 'Active').length;

  const notificationsByType = useMemo(() => {
    const rows = new Map<NotificationType, NotificationItem[]>();
    notifications.forEach((notification) => rows.set(notification.type, [...(rows.get(notification.type) || []), notification]));
    return rows;
  }, [notifications]);

  const query = searchTerm.trim().toLocaleLowerCase();
  const visibleRules = NOTIFICATION_RULES.filter((rule) => {
    if (activeGroup !== 'all' && rule.group !== activeGroup) return false;
    if (!query) return true;
    return [rule.type, localize(rule.title), localize(rule.trigger), localize(rule.recipient), localize(rule.destination)]
      .some((value) => value.toLocaleLowerCase().includes(query));
  });
  const activeCount = notifications.filter((notification) => !notification.resolved_at).length;
  const namedStaffRules = NOTIFICATION_RULES.filter((rule) => rule.recipientMode === 'staff').length;
  const roleRules = NOTIFICATION_RULES.filter((rule) => rule.recipientMode === 'role' || rule.recipientMode === 'dynamic').length;

  return (
    <div id="notification-settings-page" className="space-y-6">
      <section className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-800 ring-1 ring-red-100"><Bell className="h-5 w-5" /></span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('通知设定', 'Notification Settings', 'Tetapan Pemberitahuan')}</h2>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Super Admin</span>
          </div>
          <p className="mt-1 max-w-3xl text-xs font-light leading-relaxed text-slate-500">{tr('查看每种系统通知从触发条件到实际接收人、跳转位置和解除方式的关系。', 'Review how every system notification connects its trigger, effective recipient, destination, and resolution.', 'Semak hubungan pencetus, penerima sebenar, destinasi dan cara selesai bagi setiap pemberitahuan sistem.')}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [tr('系统规则', 'System rules', 'Peraturan sistem'), NOTIFICATION_RULES.length, tr('只读关系总览', 'Read-only relationship map', 'Peta hubungan baca sahaja')],
          [tr('当前通知', 'Active notifications', 'Pemberitahuan aktif'), activeCount, tr('尚未自动解除', 'Not yet resolved', 'Belum diselesaikan')],
          [tr('指定员工规则', 'Named-staff rules', 'Peraturan kakitangan'), namedStaffRules, tr(`${activeStaffCount} 个 Active 账号`, `${activeStaffCount} active accounts`, `${activeStaffCount} akaun aktif`)],
          [tr('角色／动态规则', 'Role / dynamic rules', 'Peraturan peranan / dinamik'), roleRules, tr('没有指定员工时才按角色', 'Roles apply only when no staff is named', 'Peranan digunakan hanya jika tiada nama')]
        ].map(([label, value, detail]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-3 font-mono text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-2 text-[10px] font-semibold text-slate-400">{detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
        <div className="grid gap-3 text-center sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <div><p className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">{tr('触发', 'Trigger', 'Pencetus')}</p><p className="mt-1 text-xs font-bold text-indigo-900">{tr('业务事件发生', 'Business event happens', 'Peristiwa perniagaan berlaku')}</p></div>
          <span className="hidden text-indigo-300 sm:block">→</span>
          <div><p className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">{tr('接收优先级', 'Recipient priority', 'Keutamaan penerima')}</p><p className="mt-1 text-xs font-bold text-indigo-900">{tr('指定员工 → 角色／动态范围', 'Named staff → role / dynamic scope', 'Kakitangan → peranan / skop dinamik')}</p></div>
          <span className="hidden text-indigo-300 sm:block">→</span>
          <div><p className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">{tr('结果', 'Outcome', 'Hasil')}</p><p className="mt-1 text-xs font-bold text-indigo-900">{tr('跳转处理并自动解除', 'Open destination and auto-resolve', 'Buka destinasi dan selesai automatik')}</p></div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('通知关系', 'Notification Relationships', 'Hubungan Pemberitahuan')}</h3>
            <p className="mt-1 text-[10px] font-semibold text-slate-400">{tr('指定员工优先；没有指定员工时，系统才使用角色或动态范围。', 'Named staff takes priority; roles or dynamic scope apply only when no staff is named.', 'Kakitangan dinamakan diutamakan; peranan atau skop dinamik hanya digunakan jika tiada nama.')}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(GROUP_LABELS) as Array<NotificationRuleGroup | 'all'>).map((group) => <button key={group} type="button" onClick={() => setActiveGroup(group)} className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition-colors ${activeGroup === group ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{localize(GROUP_LABELS[group])}</button>)}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={tr('搜索通知关系...', 'Search relationships...', 'Cari hubungan...')} className="w-full rounded-xl border border-slate-100 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-50" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1160px] text-left">
              <thead className="border-b border-slate-200 bg-slate-100/90 text-[10px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">{tr('通知', 'Notification', 'Pemberitahuan')}</th><th className="px-4 py-3">{tr('触发条件', 'Trigger', 'Pencetus')}</th><th className="px-4 py-3">{tr('实际接收人', 'Effective recipient', 'Penerima sebenar')}</th><th className="px-4 py-3">{tr('跳转位置', 'Destination', 'Destinasi')}</th><th className="px-4 py-3">{tr('解除方式', 'Resolution', 'Cara selesai')}</th><th className="px-5 py-3 text-right">{tr('当前', 'Active', 'Aktif')}</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {visibleRules.map((rule) => {
                  const current = (notificationsByType.get(rule.type) || []).filter((notification) => !notification.resolved_at).length;
                  return <tr key={rule.type} className="align-top hover:bg-slate-50/80">
                    <td className="px-5 py-4"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-800"><RuleIcon rule={rule} /></span><div><p className="text-xs font-bold text-slate-900">{localize(rule.title)}</p><p className="mt-1 font-mono text-[9px] text-slate-400">{rule.type}</p></div></div></td>
                    <td className="max-w-64 px-4 py-4 text-[11px] font-semibold leading-relaxed text-slate-600">{localize(rule.trigger)}</td>
                    <td className="max-w-64 px-4 py-4"><span className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold ring-1 ${MODE_CLASS[rule.recipientMode]}`}>{rule.recipientMode === 'staff' ? tr('指定员工', 'Named staff', 'Kakitangan') : rule.recipientMode === 'role' ? tr('角色', 'Role', 'Peranan') : tr('动态范围', 'Dynamic scope', 'Skop dinamik')}</span><p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">{localize(rule.recipient)}</p></td>
                    <td className="px-4 py-4 text-[11px] font-bold text-slate-700">{localize(rule.destination)}</td>
                    <td className="max-w-72 px-4 py-4 text-[10px] font-semibold leading-relaxed text-slate-500">{localize(rule.resolution)}</td>
                    <td className="px-5 py-4 text-right"><span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${current ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>{current}</span></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          {visibleRules.length === 0 && <div className="p-10 text-center text-xs font-bold text-slate-400">{tr('没有符合条件的通知规则。', 'No matching notification rule.', 'Tiada peraturan pemberitahuan yang sepadan.')}</div>}
        </div>
      </section>
    </div>
  );
}
