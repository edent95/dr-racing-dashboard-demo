/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Archive, BadgeDollarSign, CheckCircle2, ClipboardList, Plus, RotateCcw, Target, Trophy, UserCheck, Users, Zap } from 'lucide-react';
import { ApprovalRequest, CustomMission, CustomMissionMetricType, CustomMissionScopeType, CustomMissionStatus, CustomMissionTimeframe, LoanApplication, LoanStatus, RawCustomerLead, RoleAccount } from '../types';
import { tr } from '../lib/i18n';
import { getMissingDocumentLabels } from '../utils/documentChecklist';
import { normalizeMalaysiaPhoneDigits as normalizePhoneDigits } from '../utils/malaysiaPhone';

interface MissionStatusPageProps {
  applications: LoanApplication[];
  rawCustomerLeads: RawCustomerLead[];
  roleAccounts: RoleAccount[];
  customMissions: CustomMission[];
  currentStaffName: string;
  canViewAllMissions: boolean;
  canManageCustomMissions: boolean;
  mode?: 'full' | 'system_summary' | 'custom_missions';
  approvalRequests?: ApprovalRequest[];
  onAddCustomMission: (mission: Omit<CustomMission, 'id' | 'created_at' | 'created_by'>) => void;
  onUpdateCustomMission: (id: string, updates: Partial<CustomMission>) => void;
  onSubmitMissionReward?: (mission: CustomMission, staffName: string) => void;
}

type CustomMissionDraft = Omit<CustomMission, 'id' | 'created_at' | 'created_by'>;

type MissionProgressRow = {
  staffName: string;
  role: string;
  value: number;
  displayValue: string;
  progress: number;
  completed: boolean;
  meta: string;
};

const METRIC_OPTIONS: { value: CustomMissionMetricType; label: string; helper: string; targetLabel: string; icon: React.ReactNode }[] = [
  {
    value: 'top_sales_approved',
    label: 'Top Sales',
    helper: 'Approved loan count by staff.',
    targetLabel: 'Approved target',
    icon: <Trophy className="h-3.5 w-3.5" />
  },
  {
    value: 'fast_response',
    label: 'Fast Response',
    helper: 'Average minutes from taken lead to first follow-up.',
    targetLabel: 'Target minutes',
    icon: <Zap className="h-3.5 w-3.5" />
  },
  {
    value: 'raw_lead_conversion',
    label: 'Lead Conversion',
    helper: 'Assigned leads that match a customer application.',
    targetLabel: 'Conversion target',
    icon: <Target className="h-3.5 w-3.5" />
  }
];

const TIMEFRAME_OPTIONS: { value: CustomMissionTimeframe; label: string }[] = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom' }
];

const SCOPE_OPTIONS: { value: CustomMissionScopeType; label: string }[] = [
  { value: 'all_staff', label: 'All Staff' },
  { value: 'role', label: 'Role' },
  { value: 'staff', label: 'Staff' }
];

function getMetricLabel(metricType: CustomMissionMetricType) {
  if (metricType === 'top_sales_approved') return tr('销售冠军', 'Top Sales', "Jualan Teratas");
  if (metricType === 'fast_response') return tr('快速回复', 'Fast Response', "Respon Cepat");
  return tr('名单转化', 'Lead Conversion', "Penukaran prospek");
}

function getMetricHelper(metricType: CustomMissionMetricType) {
  if (metricType === 'top_sales_approved') return tr('按员工已批核贷款数量计算。', 'Approved loan count by staff.', "Kiraan pinjaman yang diluluskan oleh kakitangan.");
  if (metricType === 'fast_response') return tr('从接手名单到首次跟进的平均分钟数。', 'Average minutes from assigned lead to first follow-up.', "Purata minit daripada prospek yang ditugaskan kepada susulan pertama.");
  return tr('跟进的名单成功变成客户申请。', 'Assigned leads that match a customer application.', "Ditugaskan prospek yang sepadan dengan permohonan pelanggan.");
}

function getMetricTargetLabel(metricType: CustomMissionMetricType) {
  if (metricType === 'top_sales_approved') return tr('批核目标', 'Approved target', "Sasaran yang diluluskan");
  if (metricType === 'fast_response') return tr('目标分钟', 'Target minutes', "Minit sasaran");
  return tr('转化目标', 'Conversion target', "Sasaran penukaran");
}

function getTimeframeLabel(timeframe: CustomMissionTimeframe) {
  if (timeframe === 'this_month') return tr('本月', 'This month', "bulan ini");
  if (timeframe === 'last_month') return tr('上个月', 'Last month', "bulan lepas");
  if (timeframe === 'last_30_days') return tr('最近 30 天', 'Last 30 days', "30 hari lepas");
  return tr('自定义', 'Custom', "Adat");
}

function getScopeLabel(scopeType: CustomMissionScopeType) {
  if (scopeType === 'all_staff') return tr('全部员工', 'All Staff', "Semua Kakitangan");
  if (scopeType === 'role') return tr('角色', 'Role', "Peranan");
  return tr('员工', 'Staff', "Kakitangan");
}

const getMissingFields = (application: LoanApplication) => [
  !application.vehicle_condition ? 'New / Used' : '',
  !application.purchase_method ? 'Cash / Loan' : '',
  ...getMissingDocumentLabels(application).map((documentLabel) => `Document: ${documentLabel}`)
].filter(Boolean);

const normalizeMatchValue = (value: string) => value.trim().toLowerCase();

function hasMatchingApplication(lead: RawCustomerLead, applications: LoanApplication[]) {
  const leadPhone = normalizePhoneDigits(lead.phone_no);
  const leadIc = normalizeMatchValue(lead.ic_no || '');
  const leadAccount = normalizeMatchValue(lead.account_number || '');
  const leadEmail = normalizeMatchValue(lead.email || '');

  return applications.some((application) => {
    const applicationPhone = normalizePhoneDigits(application.phone_no);
    const applicationIc = normalizeMatchValue(application.ic_no || '');
    const applicationAccount = normalizeMatchValue(application.personal_info?.account_number || '');
    const applicationEmail = normalizeMatchValue(application.personal_info?.email || '');

    return (
      Boolean(leadPhone && applicationPhone && leadPhone === applicationPhone) ||
      Boolean(leadIc && applicationIc && leadIc === applicationIc) ||
      Boolean(leadAccount && applicationAccount && leadAccount === applicationAccount) ||
      Boolean(leadEmail && applicationEmail && leadEmail === applicationEmail)
    );
  });
}

function getDateRange(timeframe: CustomMissionTimeframe, customStartDate = '', customEndDate = '') {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (timeframe === 'this_month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (timeframe === 'last_month') {
    start.setMonth(now.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(1);
    end.setHours(0, 0, 0, 0);
    end.setMilliseconds(-1);
    return { start, end };
  }

  if (timeframe === 'last_30_days') {
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const customStart = customStartDate ? new Date(`${customStartDate}T00:00:00`) : new Date(0);
  const customEnd = customEndDate ? new Date(`${customEndDate}T23:59:59`) : new Date(8640000000000000);
  return { start: customStart, end: customEnd };
}

function isWithinMissionTimeframe(dateValue: string, mission: CustomMission) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const { start, end } = getDateRange(mission.timeframe, mission.custom_start_date, mission.custom_end_date);
  return date >= start && date <= end;
}

function getMissionDateLabel(mission: CustomMission) {
  if (mission.timeframe === 'custom') {
    return `${mission.custom_start_date || tr('开始', 'Start', "Mulakan")} - ${mission.custom_end_date || tr('结束', 'End', "tamat")}`;
  }

  return getTimeframeLabel(mission.timeframe) || tr('已选时间段', 'Selected timeframe', "Jangka masa yang dipilih");
}

function createDefaultMissionDraft(): CustomMissionDraft {
  return {
    title: 'This month top sales bonus',
    metric_type: 'top_sales_approved',
    target_value: 5,
    reward_amount: 300,
    timeframe: 'this_month',
    custom_start_date: '',
    custom_end_date: '',
    scope_type: 'all_staff',
    scope_value: '',
    status: 'Active'
  };
}

function getMetricOption(metricType: CustomMissionMetricType) {
  return METRIC_OPTIONS.find((option) => option.value === metricType) || METRIC_OPTIONS[0];
}

function getScopedStaffNames(mission: CustomMission, roleAccounts: RoleAccount[], currentStaffName: string, canViewAllMissions: boolean) {
  const activeStaff = roleAccounts.filter((account) => account.status === 'Active');
  const scopedStaff = activeStaff.filter((account) => {
    if (!canViewAllMissions && account.name !== currentStaffName) {
      return false;
    }

    if (mission.scope_type === 'role') {
      return account.role === mission.scope_value;
    }

    if (mission.scope_type === 'staff') {
      return account.name === mission.scope_value;
    }

    return true;
  });

  return scopedStaff.length > 0 ? scopedStaff.map((account) => account.name) : [currentStaffName];
}

function calculateMissionRows(
  mission: CustomMission,
  applications: LoanApplication[],
  rawCustomerLeads: RawCustomerLead[],
  roleAccounts: RoleAccount[],
  currentStaffName: string,
  canViewAllMissions: boolean
): MissionProgressRow[] {
  const staffNames = getScopedStaffNames(mission, roleAccounts, currentStaffName, canViewAllMissions);
  const roleByStaff = new Map(roleAccounts.map((account) => [account.name, account.role]));
  const target = Math.max(Number(mission.target_value) || 1, 1);

  return staffNames
    .map((staffName) => {
      if (mission.metric_type === 'top_sales_approved') {
        const approvedCount = applications.filter((application) => (
          application.handler_name === staffName &&
          application.status === LoanStatus.APPROVE &&
          isWithinMissionTimeframe(application.submitted_at, mission)
        )).length;

        return {
          staffName,
          role: roleByStaff.get(staffName) || 'Sales',
          value: approvedCount,
          displayValue: tr(`${approvedCount} 已批核`, `${approvedCount} approved`, `${approvedCount} diluluskan`),
          progress: Math.min((approvedCount / target) * 100, 100),
          completed: approvedCount >= target,
          meta: tr(`目标 ${target} 单已批核贷款`, `Target ${target} approved loans`, `Sasarkan ${target} pinjaman yang diluluskan`)
        };
      }

      if (mission.metric_type === 'raw_lead_conversion') {
        const convertedCount = rawCustomerLeads.filter((lead) => (
          lead.taken_by_staff_name === staffName &&
          Boolean(lead.taken_at && isWithinMissionTimeframe(lead.taken_at, mission)) &&
          hasMatchingApplication(lead, applications)
        )).length;

        return {
          staffName,
          role: roleByStaff.get(staffName) || 'Sales',
          value: convertedCount,
          displayValue: tr(`${convertedCount} 已转化`, `${convertedCount} converted`, `${convertedCount} ditukar`),
          progress: Math.min((convertedCount / target) * 100, 100),
          completed: convertedCount >= target,
          meta: tr(`目标 ${target} 个已转化名单`, `Target ${target} converted leads`, `Sasarkan ${target} prospek yang ditukar`)
        };
      }

      const respondedLeads = rawCustomerLeads
        .filter((lead) => (
          lead.taken_by_staff_name === staffName &&
          Boolean(lead.taken_at && lead.last_follow_up_at && isWithinMissionTimeframe(lead.taken_at, mission))
        ))
        .map((lead) => {
          const takenTime = new Date(lead.taken_at || '').getTime();
          const responseTime = new Date(lead.last_follow_up_at || '').getTime();
          return Math.max(Math.round((responseTime - takenTime) / 60000), 0);
        })
        .filter((minutes) => Number.isFinite(minutes));
      const averageMinutes = respondedLeads.length > 0
        ? Math.round(respondedLeads.reduce((sum, minutes) => sum + minutes, 0) / respondedLeads.length)
        : 0;
      const completed = respondedLeads.length > 0 && averageMinutes <= target;
      const progress = respondedLeads.length > 0 ? Math.min((target / Math.max(averageMinutes, 1)) * 100, 100) : 0;

      return {
        staffName,
        role: roleByStaff.get(staffName) || 'Sales',
        value: respondedLeads.length > 0 ? averageMinutes : Number.POSITIVE_INFINITY,
        displayValue: respondedLeads.length > 0 ? tr(`平均 ${averageMinutes} 分钟`, `${averageMinutes} min avg`, `${averageMinutes} min purata`) : tr('没有回复', 'No response', "Tiada respon"),
        progress,
        completed,
        meta: tr(`${respondedLeads.length} 个已回复名单 · 目标 ${target} 分钟`, `${respondedLeads.length} responded leads · target ${target} min`, `${respondedLeads.length} menjawab prospek · sasaran ${target} min`)
      };
    })
    .sort((a, b) => (
      mission.metric_type === 'fast_response'
        ? a.value - b.value || a.staffName.localeCompare(b.staffName)
        : b.value - a.value || a.staffName.localeCompare(b.staffName)
    ));
}

function ToggleButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  key?: React.Key;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
        active ? 'bg-red-800 text-white shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}


// 到期提示：临近结束或已过期的任务需要显眼标记。
function getMissionDeadlineBadge(mission: CustomMission): { label: string; className: string } | null {
  if (mission.timeframe === 'last_30_days' || mission.timeframe === 'last_month') {
    return null;
  }

  const { end } = getDateRange(mission.timeframe, mission.custom_start_date, mission.custom_end_date);

  if (!end || Number.isNaN(end.getTime())) {
    return null;
  }

  const remainingDays = Math.ceil((end.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

  if (remainingDays < 0) {
    return { label: '已过期', className: 'bg-rose-50 text-rose-600' };
  }

  if (remainingDays <= 7) {
    return { label: `剩余 ${remainingDays} 天`, className: 'bg-amber-50 text-amber-600' };
  }

  return null;
}

export default function MissionStatusPage({
  applications,
  rawCustomerLeads,
  roleAccounts,
  customMissions,
  currentStaffName,
  canViewAllMissions,
  canManageCustomMissions,
  mode = 'full',
  approvalRequests = [],
  onAddCustomMission,
  onUpdateCustomMission,
  onSubmitMissionReward
}: MissionStatusPageProps) {
  const [isCreateMissionOpen, setIsCreateMissionOpen] = useState(false);
  const [missionDraft, setMissionDraft] = useState<CustomMissionDraft>(() => createDefaultMissionDraft());
  const [pendingArchiveMission, setPendingArchiveMission] = useState<CustomMission | null>(null);

  const scopedApplications = useMemo(() => (
    canViewAllMissions
      ? applications
      : applications.filter((application) => application.handler_name === currentStaffName)
  ), [applications, canViewAllMissions, currentStaffName]);

  const pendingMissions = useMemo(() => (
    scopedApplications
      .filter((application) => getMissingFields(application).length > 0)
  ), [scopedApplications]);

  const activeRoleAccounts = useMemo(() => roleAccounts.filter((account) => account.status === 'Active'), [roleAccounts]);
  const activeCustomMissions = customMissions.filter((mission) => mission.status === 'Active');
  const archivedCustomMissionCount = customMissions.filter((mission) => mission.status === 'Archived').length;

  const staffSummaries = useMemo(() => {
    const staffNames = new Set<string>();

    roleAccounts.forEach((account) => {
      if (account.status === 'Active' && (canViewAllMissions || account.name === currentStaffName)) {
        staffNames.add(account.name);
      }
    });

    scopedApplications.forEach((application) => staffNames.add(application.handler_name || 'Unassigned'));

    return Array.from(staffNames)
      .map((staffName) => {
        const assignedApplications = scopedApplications.filter((application) => (application.handler_name || 'Unassigned') === staffName);
        const pending = assignedApplications
          .map((application) => ({
            application,
            missingFields: getMissingFields(application)
          }))
          .filter((mission) => mission.missingFields.length > 0);
        const completed = assignedApplications.length - pending.length;

        return {
          staffName,
          role: roleAccounts.find((account) => account.name === staffName)?.role || 'Sales',
          totalAssigned: assignedApplications.length,
          pendingCount: pending.length,
          completedCount: completed
        };
      })
      .sort((a, b) => (
        b.pendingCount - a.pendingCount ||
        a.staffName.localeCompare(b.staffName)
      ));
  }, [canViewAllMissions, currentStaffName, roleAccounts, scopedApplications]);

  const customMissionCards = useMemo(() => (
    activeCustomMissions.map((mission) => {
      const rows = calculateMissionRows(mission, applications, rawCustomerLeads, roleAccounts, currentStaffName, canViewAllMissions);
      const leader = rows[0];

      return {
        mission,
        rows,
        leader,
        metric: getMetricOption(mission.metric_type)
      };
    })
  ), [activeCustomMissions, applications, canViewAllMissions, currentStaffName, rawCustomerLeads, roleAccounts]);
  const missionReferenceRows = useMemo(() => {
    const previewMission: CustomMission = {
      ...missionDraft,
      id: 'MISSION-PREVIEW',
      created_at: '',
      created_by: currentStaffName
    };

    return calculateMissionRows(previewMission, applications, rawCustomerLeads, roleAccounts, currentStaffName, canViewAllMissions);
  }, [applications, canViewAllMissions, currentStaffName, missionDraft, rawCustomerLeads, roleAccounts]);
  const missionReferenceLeader = missionReferenceRows[0];

  const totalPending = pendingMissions.length;
  const staffWithPending = staffSummaries.filter((summary) => summary.pendingCount > 0).length;
  const completedMissionCount = scopedApplications.filter((application) => getMissingFields(application).length === 0).length;
  const showSystemMissions = mode === 'full' || mode === 'system_summary';
  const showCustomMissions = mode === 'full' || mode === 'custom_missions';

  const handleAddMission = () => {
    const metric = getMetricOption(missionDraft.metric_type);
    const normalizedDraft = {
      ...missionDraft,
      title: missionDraft.title.trim() || getMetricLabel(missionDraft.metric_type),
      target_value: Math.max(Number(missionDraft.target_value) || 1, 1),
      reward_amount: Math.max(Number(missionDraft.reward_amount) || 0, 0),
      scope_value: missionDraft.scope_type === 'all_staff' ? '' : missionDraft.scope_value
    };

    onAddCustomMission(normalizedDraft);
    setMissionDraft(createDefaultMissionDraft());
    setIsCreateMissionOpen(false);
  };

  return (
    <div id="mission-status-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {mode === 'system_summary' ? tr('资料不齐汇总', 'Missing Info Summary', "Ringkasan Maklumat Tiada") : mode === 'custom_missions' ? tr('自定义任务', 'Custom Missions', "Misi Tersuai") : tr('任务状态', 'Mission Status', "Status Misi")}
          </h2>
          <p className="max-w-3xl text-xs font-light leading-relaxed text-slate-500">
            {mode === 'system_summary'
              ? tr('查看系统自动列出的资料不齐任务。', 'Review system-generated missing info missions.', "Semak misi maklumat hilang yang dijana sistem.")
              : mode === 'custom_missions'
                ? tr('管理销售奖金、快速回复和名单转化任务。', 'Manage sales bonus, fast response, and lead conversion missions.', "Urus bonus jualan, respons pantas dan misi penukaran prospek.")
                : tr('查看资料不齐、员工资料质量和自定义任务。', 'Review system missions, staff data quality, and custom missions.', "Semak misi sistem, kualiti data kakitangan dan misi tersuai.")}
          </p>
        </div>
        <span className="inline-flex self-start rounded-full bg-red-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
          {canViewAllMissions ? tr('全部员工', 'All Staff View', "Pemandangan Semua Kakitangan") : tr(`只看 ${currentStaffName}`, `${currentStaffName} only`, `${currentStaffName} sahaja`)}
        </span>
      </section>

      {showSystemMissions && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('系统待处理', 'System Pending', "Sistem Belum Selesai")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totalPending}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('员工待处理', 'Staff Pending', "Kakitangan Menunggu")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{staffWithPending}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('已完成', 'Completed', "Selesai")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{completedMissionCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
        </section>
      )}

      {showCustomMissions && (
        <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('自定义任务设置', 'Custom Mission Builder', "Pembina Misi Tersuai")}</h3>
            <p className="mt-1 text-xs text-slate-400">{tr('可以设置销售奖金、快速回复和名单转化任务。', 'Create bonus missions for sales, fast response, and lead conversion.', "Buat misi bonus untuk jualan, respons pantas dan penukaran prospek.")}</p>
          </div>
          {canManageCustomMissions && (
            <button
              type="button"
              onClick={() => setIsCreateMissionOpen((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                isCreateMissionOpen ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              {isCreateMissionOpen ? tr('收起', 'Hide', "Sembunyi") : tr('新增任务', 'New Mission', "Misi Baharu")}
            </button>
          )}
        </div>

        {isCreateMissionOpen && canManageCustomMissions && (
          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('任务名称', 'Mission Name', "Nama Misi")}</span>
                <input
                  value={missionDraft.title}
                  onChange={(event) => setMissionDraft((current) => ({ ...current, title: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-200 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{getMetricTargetLabel(missionDraft.metric_type)}</span>
                <input
                  type="number"
                  min="1"
                  value={missionDraft.target_value}
                  onChange={(event) => setMissionDraft((current) => ({ ...current, target_value: Number(event.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-200 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('奖励 RM', 'Reward RM', "Ganjaran RM")}</span>
                <input
                  type="number"
                  min="0"
                  value={missionDraft.reward_amount}
                  onChange={(event) => setMissionDraft((current) => ({ ...current, reward_amount: Number(event.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-200 focus:bg-white"
                />
              </label>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('计算方式', 'Metric', "Metrik")}</p>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
                {METRIC_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMissionDraft((current) => ({ ...current, metric_type: option.value, title: current.title || getMetricLabel(option.value) }))}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                      missionDraft.metric_type === option.value
                        ? 'border-red-800 bg-red-800 text-white'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-bold">{option.icon}{getMetricLabel(option.value)}</span>
                    <span className={`mt-1 block text-[10px] leading-relaxed ${missionDraft.metric_type === option.value ? 'text-slate-300' : 'text-slate-400'}`}>{getMetricHelper(option.value)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('时间范围', 'Timeframe', "Jangka masa")}</p>
                <div className="flex flex-wrap gap-2">
                  {TIMEFRAME_OPTIONS.map((option) => (
                    <ToggleButton
                      key={option.value}
                      active={missionDraft.timeframe === option.value}
                      onClick={() => setMissionDraft((current) => ({ ...current, timeframe: option.value }))}
                    >
                      {getTimeframeLabel(option.value)}
                    </ToggleButton>
                  ))}
                </div>
                {missionDraft.timeframe === 'custom' && (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('开始', 'Start', "Mulakan")}</span>
                      <input
                        type="date"
                        value={missionDraft.custom_start_date}
                        onChange={(event) => setMissionDraft((current) => ({ ...current, custom_start_date: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-200 focus:bg-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('结束', 'End', "tamat")}</span>
                      <input
                        type="date"
                        value={missionDraft.custom_end_date}
                        onChange={(event) => setMissionDraft((current) => ({ ...current, custom_end_date: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-200 focus:bg-white"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('范围', 'Scope', "Skop")}</p>
                <div className="flex flex-wrap gap-2">
                  {SCOPE_OPTIONS.map((option) => (
                    <ToggleButton
                      key={option.value}
                      active={missionDraft.scope_type === option.value}
                      onClick={() => setMissionDraft((current) => ({
                        ...current,
                        scope_type: option.value,
                        scope_value: option.value === 'all_staff'
                          ? ''
                          : option.value === 'role'
                            ? current.scope_value || 'Sales'
                            : current.scope_value || activeRoleAccounts[0]?.name || currentStaffName
                      }))}
                    >
                      {getScopeLabel(option.value)}
                    </ToggleButton>
                  ))}
                </div>

                {missionDraft.scope_type === 'role' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Sales', 'Admin', 'Super Admin'].map((role) => (
                      <ToggleButton
                        key={role}
                        active={missionDraft.scope_value === role}
                        onClick={() => setMissionDraft((current) => ({ ...current, scope_value: role }))}
                      >
                        {role}
                      </ToggleButton>
                    ))}
                  </div>
                )}

                {missionDraft.scope_type === 'staff' && (
                  <div className="mt-3 max-h-32 overflow-y-auto rounded-xl bg-slate-50 p-2">
                    <div className="flex flex-wrap gap-2">
                      {activeRoleAccounts.map((account) => (
                        <ToggleButton
                          key={account.id}
                          active={missionDraft.scope_value === account.name}
                          onClick={() => setMissionDraft((current) => ({ ...current, scope_value: account.name }))}
                        >
                          {account.name}
                        </ToggleButton>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('参考资料', 'Reference Data', "Data Rujukan")}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    {tr('目前员工在这个任务范围内的表现。', 'Current staff performance for this metric, timeframe, and scope.', "Prestasi kakitangan semasa untuk metrik, jangka masa dan skop ini.")}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 text-xs">
                  <span className="text-slate-400">{tr('当前领先 ', 'Current leader ', "Pemimpin semasa")}</span>
                  <span className="font-bold text-slate-900">{missionReferenceLeader?.staffName || '-'}</span>
                  <span className="font-mono text-slate-500"> · {missionReferenceLeader?.displayValue || tr('没有资料', 'No data', "Tiada data")}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {missionReferenceRows.slice(0, 6).map((row) => (
                  <div key={`preview-${row.staffName}`} className="rounded-lg bg-white px-3 py-2">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">{row.staffName}</p>
                        <p className="truncate text-[10px] font-semibold text-slate-400">{row.role} · {row.meta}</p>
                      </div>
                      <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold ${
                        row.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {row.displayValue}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${row.progress}%` }} />
                    </div>
                  </div>
                ))}
                {missionReferenceRows.length === 0 && (
                  <div className="rounded-lg bg-white px-3 py-6 text-center text-xs font-semibold text-slate-400 lg:col-span-2">
                    {tr('这个范围暂时没有参考资料。', 'No reference data for the selected scope.', "Tiada data rujukan untuk skop yang dipilih.")}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">
                {tr('奖励', 'Reward', "Ganjaran")} <span className="font-mono font-bold text-slate-900">RM{missionDraft.reward_amount || 0}</span> · {getMetricTargetLabel(missionDraft.metric_type)} <span className="font-mono font-bold text-slate-900">{missionDraft.target_value || 0}</span>
              </p>
              <button
                type="button"
                onClick={handleAddMission}
                className="rounded-xl bg-red-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-900"
              >
                {tr('创建任务', 'Create Mission', "Cipta Misi")}
              </button>
            </div>
          </div>
        )}
        </section>
      )}

      {showCustomMissions && (
        <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('自定义任务排行', 'Custom Mission Leaderboard', "Papan Pendahulu Misi Tersuai")}</h3>
            <p className="mt-1 text-xs text-slate-400">{tr('进行中的任务会从已批核贷款、潜在客户和跟进资料自动计算。', 'Active missions auto-calculate from approved loans, leads, and follow-up data.', "Misi aktif secara automatik mengira daripada pinjaman, prospek dan data susulan yang diluluskan.")}</p>
          </div>
        </div>

        {customMissionCards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center text-sm font-semibold text-slate-400">
            {tr('还没有进行中的自定义任务。可以创建销售、快速回复或名单转化任务。', 'No active custom missions yet. Create a sales, fast response, or lead conversion mission.', "Tiada misi tersuai yang aktif lagi. Buat jualan, respons pantas atau misi penukaran prospek.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {customMissionCards.map(({ mission, rows, leader, metric }) => (
              <article key={mission.id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                        {metric.icon}
                        {getMetricLabel(mission.metric_type)}
                      </span>
                      <span className="rounded-lg bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold text-emerald-600">RM{mission.reward_amount}</span>
                      {(() => {
                        const deadlineBadge = getMissionDeadlineBadge(mission);
                        return deadlineBadge ? (
                          <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${deadlineBadge.className}`}>{deadlineBadge.label}</span>
                        ) : null;
                      })()}
                    </div>
                    <h4 className="mt-2 truncate text-sm font-bold text-slate-900">{mission.title}</h4>
                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                      {getMissionDateLabel(mission)} · {mission.scope_type === 'all_staff' ? tr('全部员工', 'All Staff', "Semua Kakitangan") : mission.scope_value || getScopeLabel(mission.scope_type)}
                    </p>
                  </div>
                  {canManageCustomMissions && (
                    <button
                      type="button"
                      onClick={() => setPendingArchiveMission(mission)}
                      className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                      title={tr('归档任务', 'Archive mission', "Misi arkib")}
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('当前领先', 'Current Leader', "Pemimpin Semasa")}</p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">{leader?.staffName || '-'}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{leader?.displayValue || tr('还没有数据', 'No data yet', "Tiada data lagi")}</p>
                </div>

                <div className="space-y-2">
                  {rows.map((row) => (
                    <div key={`${mission.id}-${row.staffName}`} className="rounded-lg bg-slate-50 px-3 py-2">
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800">{row.staffName}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{row.role} · {row.meta}</p>
                        </div>
                        <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold ${
                          row.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-slate-600'
                        }`}>
                          {row.displayValue}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${row.progress}%` }} />
                      </div>
                      {row.completed && (() => {
                        const existingApproval = approvalRequests.find((request) => (
                          request.type === 'mission_reward' &&
                          request.target_id === mission.id &&
                          request.target_label.includes(row.staffName)
                        ));

                        if (existingApproval) {
                          return (
                            <p className="mt-2 text-[10px] font-bold text-slate-400">
                              奖励审批：{existingApproval.status}
                            </p>
                          );
                        }

                        if (onSubmitMissionReward && (canManageCustomMissions || row.staffName === currentStaffName)) {
                          return (
                            <button
                              type="button"
                              onClick={() => onSubmitMissionReward(mission, row.staffName)}
                              className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-emerald-700"
                            >
                              一键提交奖励审批（RM{mission.reward_amount}）
                            </button>
                          );
                        }

                        return null;
                      })()}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {canManageCustomMissions && archivedCustomMissionCount > 0 && (
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="mb-3 text-xs font-bold text-slate-900">{tr('已归档任务', 'Archived Missions', "Misi Arkib")}</p>
            <div className="flex flex-wrap gap-2">
              {customMissions.filter((mission) => mission.status === 'Archived').map((mission) => (
                <button
                  key={mission.id}
                  type="button"
                  onClick={() => onUpdateCustomMission(mission.id, { status: 'Active' })}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {mission.title}
                </button>
              ))}
            </div>
          </div>
        )}
        </section>
      )}

      {showSystemMissions && (
        <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-bold text-slate-900">{tr('缺失资料汇总', 'Missing Info Summary', "Ringkasan Maklumat Tiada")}</h3>
          <p className="mt-1 text-xs text-slate-400">{tr('按员工追踪缺失的 New / Used、Cash / Loan 和文件清单项目。', 'This summary tracks missing New / Used, Cash / Loan, and File / Document Checklist items by staff.', "Ringkasan ini menjejaki item Baharu / Terpakai, Tunai / Pinjaman dan Senarai Semak Fail / Dokumen yang tiada oleh kakitangan.")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[620px] w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[220px]" />
              <col className="w-[120px]" />
              <col className="w-[120px]" />
              <col className="w-[120px]" />
            </colgroup>
            <thead className="border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
              <tr>
                <th className="px-5 py-3.5">{tr('员工', 'Staff', "Kakitangan")}</th>
                <th className="px-5 py-3.5">{tr('已分配', 'Assigned', "Ditugaskan")}</th>
                <th className="px-5 py-3.5">{tr('待处理', 'Pending', "Menunggu")}</th>
                <th className="px-5 py-3.5">{tr('已完成', 'Completed', "Selesai")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staffSummaries.map((summary) => (
                <tr key={summary.staffName} className="hover:bg-indigo-50/20">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-slate-300" />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-800">{summary.staffName}</p>
                        <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{summary.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600">{summary.totalAssigned}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      summary.pendingCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {summary.pendingCount}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600">{summary.completedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </section>
      )}

      {pendingArchiveMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-900/20">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{tr('确认归档', 'Confirm archive', "Sahkan arkib")}</p>
                <h3 className="mt-1 text-base font-bold text-slate-900">{tr('归档这个 custom mission？', 'Archive this custom mission?', "Arkibkan misi tersuai ini?")}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  <span className="font-semibold text-slate-700">{pendingArchiveMission.title}</span>{tr(' 将不再显示为进行中任务。之后可以从已归档任务恢复。', ' will stop showing as an active mission. You can restore it later from Archived Missions.', "akan berhenti ditunjukkan sebagai misi aktif. Anda boleh memulihkannya kemudian daripada Misi Arkib.")}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingArchiveMission(null)}
                className="rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                {tr('保持进行中', 'Keep Active', "Terus Aktif")}
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateCustomMission(pendingArchiveMission.id, { status: 'Archived' as CustomMissionStatus });
                  setPendingArchiveMission(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-800 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-900"
              >
                <Archive className="h-3.5 w-3.5" />
                {tr('归档任务', 'Archive Mission', "Misi Arkib")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
