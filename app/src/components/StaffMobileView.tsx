/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, MessageCircle, Phone, Target, UserCheck } from 'lucide-react';
import { CustomMission, CustomMissionMetricType, CustomMissionTimeframe, LoanApplication, LoanStatus, RawCustomerLead, RoleAccountRole } from '../types';
import { getAppLocale, tr } from '../lib/i18n';
import { getApplicationRejectCodes } from '../utils/rejectCodes';
import { normalizeMalaysiaPhoneDigits } from '../utils/malaysiaPhone';

interface StaffMobileViewProps {
  applications: LoanApplication[];
  rawCustomerLeads: RawCustomerLead[];
  customMissions: CustomMission[];
  currentStaffName: string;
  currentStaffRole: RoleAccountRole;
  onOpenApplication: (application: LoanApplication) => void;
  onOpenMissions?: () => void;
  onOpenWhatsApp: (lead: RawCustomerLead, target: 'api' | 'web') => void;
  onUpdateLead: (leadId: string, updates: Partial<RawCustomerLead>) => void;
}

type StaffMissionCard = {
  id: string;
  title: string;
  metric: string;
  displayValue: string;
  meta: string;
  progress: number;
  reward: number;
};

function getMetricDisplayLabel(type: CustomMissionMetricType) {
  if (type === 'top_sales_approved') return tr('已批核销售', 'Approved sales', "Jualan yang diluluskan");
  if (type === 'fast_response') return tr('快速回复', 'Fast response', "Respon cepat");
  return tr('名单转化', 'Lead conversion', "penukaran prospek");
}

function normalizeMatchValue(value: string) {
  return value.trim().toLowerCase();
}

function formatShortDate(value?: string) {
  if (!value) {
    return tr('没有日期', 'No date', "Tiada tarikh");
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return tr('无效日期', 'Invalid date', "Tarikh tidak sah");
  }

  return date.toLocaleString(getAppLocale(), {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getTomorrowMorningIso() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

function getMissionRange(timeframe: CustomMissionTimeframe, customStartDate = '', customEndDate = '') {
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

function isWithinMissionRange(value: string, mission: CustomMission) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const { start, end } = getMissionRange(mission.timeframe, mission.custom_start_date, mission.custom_end_date);
  return date >= start && date <= end;
}

function isStaffInMissionScope(mission: CustomMission, staffName: string, staffRole: RoleAccountRole) {
  if (mission.scope_type === 'staff') {
    return mission.scope_value === staffName;
  }

  if (mission.scope_type === 'role') {
    return mission.scope_value === staffRole;
  }

  return true;
}

function hasMatchingApplication(lead: RawCustomerLead, applications: LoanApplication[]) {
  const leadPhone = normalizeMalaysiaPhoneDigits(lead.phone_no || '');
  const leadIc = normalizeMatchValue(lead.ic_no || '');
  const leadAccount = normalizeMatchValue(lead.account_number || '');
  const leadEmail = normalizeMatchValue(lead.email || '');

  return applications.some((application) => {
    const applicationPhone = normalizeMalaysiaPhoneDigits(application.phone_no || '');
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

function buildMissionCard(
  mission: CustomMission,
  staffName: string,
  applications: LoanApplication[],
  rawCustomerLeads: RawCustomerLead[]
): StaffMissionCard {
  const target = Math.max(Number(mission.target_value) || 1, 1);

  if (mission.metric_type === 'top_sales_approved') {
    const value = applications.filter((application) => (
      application.handler_name === staffName &&
      application.status === LoanStatus.APPROVE &&
      isWithinMissionRange(application.submitted_at, mission)
    )).length;

    return {
      id: mission.id,
      title: mission.title,
      metric: getMetricDisplayLabel(mission.metric_type),
      displayValue: `${value}/${target}`,
      meta: tr(`${value} 单已批核贷款`, `${value} approved loans`, `${value} pinjaman yang diluluskan`),
      progress: Math.min((value / target) * 100, 100),
      reward: mission.reward_amount
    };
  }

  if (mission.metric_type === 'raw_lead_conversion') {
    const value = rawCustomerLeads.filter((lead) => (
      lead.taken_by_staff_name === staffName &&
      Boolean(lead.taken_at && isWithinMissionRange(lead.taken_at, mission)) &&
      hasMatchingApplication(lead, applications)
    )).length;

    return {
      id: mission.id,
      title: mission.title,
      metric: getMetricDisplayLabel(mission.metric_type),
      displayValue: `${value}/${target}`,
      meta: tr(`${value} 个已转化名单`, `${value} converted leads`, `${value} prospek yang ditukar`),
      progress: Math.min((value / target) * 100, 100),
      reward: mission.reward_amount
    };
  }

  const responseMinutes = rawCustomerLeads
    .filter((lead) => (
      lead.taken_by_staff_name === staffName &&
      Boolean(lead.taken_at && lead.last_follow_up_at && isWithinMissionRange(lead.taken_at, mission))
    ))
    .map((lead) => {
      const takenTime = new Date(lead.taken_at || '').getTime();
      const responseTime = new Date(lead.last_follow_up_at || '').getTime();
      return Math.max(Math.round((responseTime - takenTime) / 60000), 0);
    })
    .filter((minutes) => Number.isFinite(minutes));
  const averageMinutes = responseMinutes.length > 0
    ? Math.round(responseMinutes.reduce((sum, minutes) => sum + minutes, 0) / responseMinutes.length)
    : Number.POSITIVE_INFINITY;

  return {
    id: mission.id,
    title: mission.title,
    metric: getMetricDisplayLabel(mission.metric_type),
    displayValue: Number.isFinite(averageMinutes) ? `${averageMinutes}m` : '--',
    meta: Number.isFinite(averageMinutes) ? tr(`目标平均 ${target} 分钟`, `Target ${target} min avg`, `Sasaran ${target} min purata`) : tr('还没有回复记录', 'No response yet', "Tiada maklum balas lagi"),
    progress: Number.isFinite(averageMinutes) ? Math.min((target / Math.max(averageMinutes, 1)) * 100, 100) : 0,
    reward: mission.reward_amount
  };
}

export default function StaffMobileView({
  applications,
  rawCustomerLeads,
  customMissions,
  currentStaffName,
  currentStaffRole,
  onOpenApplication,
  onOpenMissions,
  onOpenWhatsApp,
  onUpdateLead
}: StaffMobileViewProps) {
  const staffApplications = useMemo(() => (
    applications.filter((application) => application.handler_name === currentStaffName)
  ), [applications, currentStaffName]);

  const staffLeads = useMemo(() => (
    rawCustomerLeads
      .filter((lead) => lead.taken_by_staff_name === currentStaffName)
      .sort((a, b) => (
        new Date(a.next_follow_up_at || a.last_follow_up_at || a.taken_at || a.received_at).getTime() -
        new Date(b.next_follow_up_at || b.last_follow_up_at || b.taken_at || b.received_at).getTime()
      ))
  ), [currentStaffName, rawCustomerLeads]);

  const followUpLeads = staffLeads.filter((lead) => !['Submitted Loan', 'Rejected', 'Closed'].includes(lead.follow_up_status || 'New'));
  const dueNowCount = followUpLeads.filter((lead) => lead.next_follow_up_at && new Date(lead.next_follow_up_at).getTime() <= Date.now()).length;
  const interestedCount = followUpLeads.filter((lead) => lead.follow_up_status === 'Interested').length;
  const pendingCustomerTasks = staffApplications.filter((application) => (
    !application.vehicle_condition ||
    !application.purchase_method ||
    (application.status === LoanStatus.REJECT && getApplicationRejectCodes(application).length === 0)
  ));

  const missionCards = customMissions
    .filter((mission) => (
      mission.status === 'Active' &&
      isStaffInMissionScope(mission, currentStaffName, currentStaffRole)
    ))
    .map((mission) => buildMissionCard(mission, currentStaffName, applications, rawCustomerLeads))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <div id="staff-mobile-view" className="mx-auto max-w-3xl space-y-5 pb-24 md:pb-0">
      <section className="rounded-2xl bg-red-800 p-5 text-white shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">{tr('员工视图', 'Staff View', "Pandangan Kakitangan")}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">{currentStaffName}</h2>
        <p className="mt-1 text-xs font-semibold text-white/60">{tr(`${currentStaffRole} 个人工作台`, `${currentStaffRole} personal workspace`, `${currentStaffRole} ruang kerja peribadi`)}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{tr('名单', 'Leads', "Prospek")}</p>
            <p className="mt-1 text-xl font-bold">{followUpLeads.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{tr('到期', 'Due', "kena bayar")}</p>
            <p className="mt-1 text-xl font-bold">{dueNowCount}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{tr('任务', 'Tasks', "Tugasan")}</p>
            <p className="mt-1 text-xl font-bold">{pendingCustomerTasks.length}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('有兴趣', 'Interested', "Berminat")}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{interestedCount}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('任务', 'Missions', "Misi")}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{missionCards.length}</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('我的跟进名单', 'My Follow-up Leads', "Prospek susulan saya")}</h3>
            <p className="text-xs text-slate-400">{tr('手机上快速处理你负责跟进的客户。', 'Mobile actions for your assigned leads.', "Tindakan mudah alih untuk prospek anda yang ditugaskan.")}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{followUpLeads.length}</span>
        </div>

        {followUpLeads.slice(0, 8).map((lead) => {
          const phone = lead.phone_no || lead.whatsapp || lead.work_phone;
          const phoneDigits = normalizeMalaysiaPhoneDigits(phone);

          return (
            <article key={lead.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-base font-bold text-slate-900">{lead.name || lead.username || tr('未命名名单', 'Unnamed lead', "Prospek yang tidak dinamakan")}</h4>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-400">{lead.channel} · {lead.lead_id || lead.id}</p>
                </div>
                <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                  {lead.follow_up_status || tr('新名单', 'New', "baru")}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-bold uppercase tracking-wider text-slate-400">{tr('电话', 'Phone', "Telefon")}</p>
                  <p className="mt-1 truncate font-mono font-bold text-slate-700">{phone || '--'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-bold uppercase tracking-wider text-slate-400">{tr('下次跟进', 'Next', "Seterusnya")}</p>
                  <p className="mt-1 truncate font-bold text-slate-700">{formatShortDate(lead.next_follow_up_at)}</p>
                </div>
              </div>

              {lead.follow_up_note && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-800">
                  {lead.follow_up_note}
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href={phoneDigits ? `tel:+${phoneDigits}` : undefined}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${
                    phoneDigits ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  {tr('拨打', 'Call', "Panggil")}
                </a>
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp(lead, 'api')}
                  disabled={!phoneDigits}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateLead(lead.id, {
                    follow_up_status: 'Contacted',
                    last_follow_up_at: new Date().toISOString()
                  })}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {tr('已联系', 'Mark Contacted', "Tandai Dihubungi")}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateLead(lead.id, {
                    next_follow_up_at: getTomorrowMorningIso(),
                    follow_up_status: lead.follow_up_status || 'Contacted'
                  })}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-600"
                >
                  <CalendarClock className="h-4 w-4" />
                  {tr('下次跟进', 'Next Follow-up', "Susulan Seterusnya")}
                </button>
              </div>
            </article>
          );
        })}

        {followUpLeads.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <UserCheck className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-800">{tr('没有个人跟进名单', 'No personal follow-up leads', "Tiada prospek susulan peribadi")}</p>
            <p className="mt-1 text-xs text-slate-400">{tr('分配给你跟进的客户会显示在这里。', 'Assigned leads will show here.', "Prospek yang ditugaskan akan dipaparkan di sini.")}</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('我的任务', 'My Missions', "Misi Saya")}</h3>
            <p className="text-xs text-slate-400">{tr('只显示分配给你或你角色的任务。', 'Only missions scoped to you or your role.', "Hanya misi yang diberikan kepada anda atau peranan anda.")}</p>
          </div>
          {onOpenMissions && (
            <button
              type="button"
              onClick={onOpenMissions}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"
            >
              {tr('查看全部', 'View all', "Lihat semua")}
            </button>
          )}
        </div>

        {missionCards.map((mission) => (
          <article key={mission.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-bold text-slate-900">{mission.title}</h4>
                <p className="mt-1 text-xs font-semibold text-slate-400">{mission.metric} · RM {mission.reward}</p>
              </div>
              <span className="rounded-full bg-red-800 px-2.5 py-1 text-xs font-bold text-white">{mission.displayValue}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${mission.progress}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-400">{mission.meta}</p>
          </article>
        ))}

        {missionCards.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Target className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-800">{tr('没有进行中的个人任务', 'No active personal mission', "Tiada misi peribadi yang aktif")}</p>
            <p className="mt-1 text-xs text-slate-400">{tr('Admin 创建给你的任务会显示在这里。', 'Admin-created missions for you will appear here.', "Misi yang dibuat oleh pentadbir untuk anda akan dipaparkan di sini.")}</p>
          </div>
        )}
      </section>

      {pendingCustomerTasks.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">{tr('客户任务', 'Customer Tasks', "Tugasan Pelanggan")}</h3>
          {pendingCustomerTasks.slice(0, 4).map((application) => (
            <button
              key={application.id}
              type="button"
              onClick={() => onOpenApplication(application)}
              className="flex w-full items-center gap-3 rounded-2xl border border-amber-100 bg-white p-4 text-left shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-900">{application.applicant_name}</span>
                <span className="mt-1 block truncate text-xs font-semibold text-slate-400">{application.vehicle_model || tr('没有车辆', 'No vehicle', "Tiada kenderaan")} · {application.status}</span>
              </span>
              <ClipboardList className="h-4 w-4 shrink-0 text-slate-300" />
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
