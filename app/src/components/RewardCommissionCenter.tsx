/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BadgeDollarSign, CheckCircle2, ClipboardCheck, Edit3, Plus, ShieldCheck, Sparkles, Target, Trash2, Trophy, Users, Zap } from 'lucide-react';
import { ApprovalRequest, CommissionRules, CustomMission, CustomMissionMetricType, CustomMissionTimeframe, DEFAULT_COMMISSION_RULES, LoanApplication, LoanStatus, MonthlySettlementSnapshot, RawCustomerLead, RewardTeam, RoleAccount, RoleAccountRole } from '../types';
import MissionStatusPage from './MissionStatusPage';
import { getAppLanguage, getAppLocale, tr } from '../lib/i18n';
import { loadMonthlySnapshotFromFirebase, saveMonthlySnapshotToFirebase } from '../services/dashboardRepository';
import { normalizeMalaysiaPhoneDigits as normalizePhoneDigits } from '../utils/malaysiaPhone';
import { buildDealCommissionSettlements } from '../utils/commissionSettlement';
import { V1_HIDDEN_NAV_KEYS } from '../data/v1Scope';
import payoutsIcon from '../assets/icons/nav/salesBudget.png';
import missionsIcon from '../assets/icons/nav/missionTarget.png';
import teamBattleIcon from '../assets/icons/nav/target.png';

type RewardFilter = 'all' | 'active' | 'payable' | 'paid' | 'reversed' | 'rules';
type RewardCenterTab = 'payouts' | 'missions' | 'team_battle';
type RewardStatus = 'Estimated' | 'Earned' | 'Payable' | 'Paid' | 'Reversed' | 'Pending Review' | 'Approved' | 'Declined';
type RewardType = 'loan_commission' | 'top_sales_bonus' | 'fast_response_bonus' | 'mission_reward' | 'leaderboard_payout' | 'team_bonus';

const normalizeRewardCenterTab = (tab: RewardCenterTab): RewardCenterTab => {
  if (tab === 'missions' && V1_HIDDEN_NAV_KEYS.has('rewardMissions')) {
    return 'payouts';
  }
  if (tab === 'team_battle' && V1_HIDDEN_NAV_KEYS.has('teamBattle')) {
    return 'payouts';
  }
  return tab;
};

interface RewardCommissionCenterProps {
  applications: LoanApplication[];
  rawCustomerLeads: RawCustomerLead[];
  customMissions: CustomMission[];
  rewardTeams: RewardTeam[];
  approvalRequests: ApprovalRequest[];
  roleAccounts: RoleAccount[];
  currentStaffName: string;
  currentStaffRole: RoleAccountRole;
  canViewAllRewards: boolean;
  canManageRewardTeams: boolean;
  canManageCustomMissions: boolean;
  initialTab?: RewardCenterTab;
  onAddRewardTeam: (team: Omit<RewardTeam, 'id' | 'created_at' | 'created_by' | 'updated_at'>) => void;
  onUpdateRewardTeam: (id: string, updates: Partial<RewardTeam>) => void;
  onDeleteRewardTeam: (id: string) => void;
  onAddCustomMission: (mission: Omit<CustomMission, 'id' | 'created_at' | 'created_by'>) => void;
  onUpdateCustomMission: (id: string, updates: Partial<CustomMission>) => void;
  onOpenApplication: (application: LoanApplication) => void;
  onOpenApprovals: () => void;
  commissionRules?: CommissionRules;
  onSubmitMissionReward?: (mission: CustomMission, staffName: string) => void;
  onTabChange?: (tab: RewardCenterTab) => void;
  /** Render inside another page (Finance Center 佣金 tab): hides the page header and mobile tab bar. */
  embedded?: boolean;
}

type RewardTeamDraft = Omit<RewardTeam, 'id' | 'created_at' | 'created_by' | 'updated_at'>;

interface RewardRow {
  id: string;
  type: RewardType;
  status: RewardStatus;
  title: string;
  staffName: string;
  amount: number;
  metric: string;
  rule: string;
  context: string;
  targetApplication?: LoanApplication;
  actionLabel: string;
  onOpen: () => void;
}

const FILTERS: RewardFilter[] = ['all', 'active', 'payable', 'paid', 'reversed', 'rules'];

const STATUS_STYLE: Record<RewardStatus, string> = {
  Estimated: 'bg-slate-100 text-slate-600 ring-slate-200',
  Earned: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  Payable: 'bg-amber-50 text-amber-700 ring-amber-100',
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Reversed: 'bg-rose-50 text-rose-700 ring-rose-100',
  'Pending Review': 'bg-amber-50 text-amber-700 ring-amber-100',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Declined: 'bg-rose-50 text-rose-700 ring-rose-100'
};

const getRewardStatusLabel = (status: RewardStatus) => ({
  Estimated: tr('预计', 'Estimated', 'Anggaran'),
  Earned: tr('已赚取', 'Earned', 'Diperoleh'),
  Payable: tr('待支付', 'Payable', 'Boleh Dibayar'),
  Paid: tr('已支付', 'Paid', 'Dibayar'),
  Reversed: tr('已反转', 'Reversed', 'Diterbalikkan'),
  'Pending Review': tr('审批中', 'Pending Review', 'Menunggu Semakan'),
  Approved: tr('已批准', 'Approved', 'Diluluskan'),
  Declined: tr('已拒绝', 'Declined', 'Ditolak')
})[status];

const getRewardFilterLabel = (filter: RewardFilter, dealOnly = false) => {
  if (dealOnly) {
    return ({
      all: tr('全部', 'All', 'Semua'),
      active: tr('预计 / 已赚取', 'Estimated / Earned', 'Anggaran / Diperoleh'),
      payable: tr('待支付', 'Payable', 'Boleh Dibayar'),
      paid: tr('已支付', 'Paid', 'Dibayar'),
      reversed: tr('已反转', 'Reversed', 'Diterbalikkan'),
      rules: tr('状态说明', 'Status Guide', 'Panduan Status')
    })[filter];
  }

  return ({
    all: tr('全部', 'All', 'Semua'),
    active: tr('预计 / 已赚取', 'Estimated / Earned', 'Anggaran / Diperoleh'),
    payable: tr('待支付 / 审批中', 'Payable / Pending', 'Boleh Dibayar / Menunggu'),
    paid: tr('已支付 / 已批准', 'Paid / Approved', 'Dibayar / Diluluskan'),
    reversed: tr('已反转 / 已拒绝', 'Reversed / Declined', 'Diterbalikkan / Ditolak'),
    rules: tr('规则说明', 'Rules', 'Peraturan')
  })[filter];
};

const getDealSaleStatusLabel = (status: string) => ({
  'Pending Acceptance': tr('等待客户接受', 'Pending Acceptance', 'Menunggu Penerimaan'),
  'Customer Accepted': tr('客户已接受', 'Customer Accepted', 'Pelanggan Diterima'),
  'Bike Delivered': tr('已交车', 'Bike Delivered', 'Motosikal Diserah'),
  Cancelled: tr('已取消', 'Cancelled', 'Dibatalkan')
})[status] || status;
const REWARD_DETAIL_ROW_HEIGHT = 196;
const REWARD_DETAIL_TABLE_HEIGHT = 680;
const REWARD_DETAIL_OVERSCAN_ROWS = 4;

const TYPE_META: Record<RewardType, { color: string; icon: React.ReactNode }> = {
  loan_commission: {
    color: 'text-blue-600 bg-blue-50',
    icon: <BadgeDollarSign className="h-4 w-4" />
  },
  top_sales_bonus: {
    color: 'text-amber-700 bg-amber-50',
    icon: <Trophy className="h-4 w-4" />
  },
  fast_response_bonus: {
    color: 'text-purple-700 bg-purple-50',
    icon: <Zap className="h-4 w-4" />
  },
  mission_reward: {
    color: 'text-emerald-700 bg-emerald-50',
    icon: <Target className="h-4 w-4" />
  },
  leaderboard_payout: {
    color: 'text-slate-700 bg-slate-100',
    icon: <ClipboardCheck className="h-4 w-4" />
  },
  team_bonus: {
    color: 'text-cyan-700 bg-cyan-50',
    icon: <Users className="h-4 w-4" />
  }
};

const getRewardTypeLabel = (type: RewardType) => ({
  loan_commission: tr('成交佣金', 'Deal Commission', 'Komisen Jualan'),
  top_sales_bonus: tr('销售冠军奖金', 'Top Sales Bonus', 'Bonus Jualan Teratas'),
  fast_response_bonus: tr('快速响应奖金', 'Fast Response Bonus', 'Bonus Respons Pantas'),
  mission_reward: tr('任务奖励', 'Mission Reward', 'Ganjaran Misi'),
  leaderboard_payout: tr('月度排行榜奖金', 'Monthly Leaderboard Bonus', 'Bonus Kedudukan Bulanan'),
  team_bonus: tr('战队获胜奖金', 'Team Winner Bonus', 'Bonus Pasukan Pemenang')
})[type];

const getMetricLabel = (metric: CustomMissionMetricType) => ({
  top_sales_approved: tr('批核单数', 'Approved Deals', 'Jualan Diluluskan'),
  fast_response: tr('平均响应时间', 'Average Response Time', 'Masa Respons Purata'),
  raw_lead_conversion: tr('名单转化', 'Lead Conversion', 'Penukaran Prospek')
})[metric];

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0
  }).format(value || 0);
}

// key: 'current' | 'last' | 'YYYY-MM'
function getPayoutMonthRange(key: string) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  if (key === 'last') {
    month -= 1;
  } else if (/^\d{4}-\d{2}$/.test(key)) {
    const [customYear, customMonth] = key.split('-').map(Number);
    year = customYear;
    month = customMonth - 1;
  }

  const start = new Date(year, month, 1);
  const isCurrentMonth = start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth();
  const end = isCurrentMonth ? new Date(now) : new Date(start.getFullYear(), start.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  const label = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;

  return { start, end, label, isCurrentMonth };
}

function isWithinRange(value: string, start: Date, end: Date) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= start && date <= end;
}

function getMissionRange(mission: CustomMission) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (mission.timeframe === 'this_month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (mission.timeframe === 'last_month') {
    start.setMonth(now.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(1);
    end.setHours(0, 0, 0, 0);
    end.setMilliseconds(-1);
    return { start, end };
  }

  if (mission.timeframe === 'last_30_days') {
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  return {
    start: mission.custom_start_date ? new Date(`${mission.custom_start_date}T00:00:00`) : new Date(0),
    end: mission.custom_end_date ? new Date(`${mission.custom_end_date}T23:59:59`) : new Date(8640000000000000)
  };
}

function getTimeframeLabel(timeframe: CustomMissionTimeframe) {
  if (timeframe === 'this_month') return tr('本月', 'This month', 'Bulan ini');
  if (timeframe === 'last_month') return tr('上月', 'Last month', 'Bulan lepas');
  if (timeframe === 'last_30_days') return tr('过去 30 天', 'Last 30 days', '30 hari lepas');
  return tr('自定义', 'Custom', 'Tersuai');
}

function isStaffInScope(mission: CustomMission, staffName: string, staffRole: RoleAccountRole) {
  if (mission.scope_type === 'staff') return mission.scope_value === staffName;
  if (mission.scope_type === 'role') return mission.scope_value === staffRole;
  return true;
}

function hasMatchingApplication(lead: RawCustomerLead, applications: LoanApplication[]) {
  const leadPhone = normalizePhoneDigits(lead.phone_no || '');
  const leadIc = (lead.ic_no || '').trim().toLowerCase();
  const leadAccount = (lead.account_number || '').trim().toLowerCase();
  const leadEmail = (lead.email || '').trim().toLowerCase();

  return applications.some((application) => (
    Boolean(leadPhone && normalizePhoneDigits(application.phone_no || '') === leadPhone) ||
    Boolean(leadIc && (application.ic_no || '').trim().toLowerCase() === leadIc) ||
    Boolean(leadAccount && (application.personal_info?.account_number || '').trim().toLowerCase() === leadAccount) ||
    Boolean(leadEmail && (application.personal_info?.email || '').trim().toLowerCase() === leadEmail)
  ));
}

function getMissionProgress(
  mission: CustomMission,
  staffName: string,
  applications: LoanApplication[],
  rawCustomerLeads: RawCustomerLead[]
) {
  const { start, end } = getMissionRange(mission);
  const target = Math.max(Number(mission.target_value) || 1, 1);

  if (mission.metric_type === 'top_sales_approved') {
    const value = applications.filter((application) => (
      application.handler_name === staffName &&
      application.status === LoanStatus.APPROVE &&
      isWithinRange(application.submitted_at, start, end)
    )).length;

    return {
      completed: value >= target,
      metric: tr(`${value}/${target} 单已批核`, `${value}/${target} approved`, `${value}/${target} diluluskan`)
    };
  }

  if (mission.metric_type === 'raw_lead_conversion') {
    const value = rawCustomerLeads.filter((lead) => (
      lead.taken_by_staff_name === staffName &&
      Boolean(lead.taken_at && isWithinRange(lead.taken_at, start, end)) &&
      hasMatchingApplication(lead, applications)
    )).length;

    return {
      completed: value >= target,
      metric: tr(`${value}/${target} 个已转化`, `${value}/${target} converted`, `${value}/${target} ditukar`)
    };
  }

  const responseMinutes = rawCustomerLeads
    .filter((lead) => (
      lead.taken_by_staff_name === staffName &&
      Boolean(lead.taken_at && lead.last_follow_up_at && isWithinRange(lead.taken_at, start, end))
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
    completed: responseMinutes.length > 0 && averageMinutes <= target,
    metric: Number.isFinite(averageMinutes)
      ? tr(`平均 ${averageMinutes} 分钟 / 目标 ${target}`, `${averageMinutes} min avg / target ${target}`, `Purata ${averageMinutes} min / sasaran ${target}`)
      : tr(`没有响应 / 目标 ${target} 分钟`, `No response / target ${target} min`, `Tiada respons / sasaran ${target} min`)
  };
}

function getApprovalStatus(request?: ApprovalRequest): RewardStatus {
  if (!request) return 'Earned';
  if (request.status === 'Pending') return 'Pending Review';
  if (request.status === 'Approved') return 'Approved';
  if (request.status === 'Rejected' || request.status === 'Cancelled') return 'Declined';
  return 'Earned';
}

function createDefaultTeamDraft(teamNumber: number): RewardTeamDraft {
  return {
    name: teamNumber === 1 ? 'Team A' : 'Team B',
    member_names: [],
    bonus_amount: 100,
    status: 'Active'
  };
}

function createDraftFromTeam(team: RewardTeam): RewardTeamDraft {
  return {
    name: team.name,
    member_names: team.member_names,
    bonus_amount: team.bonus_amount,
    status: team.status
  };
}

function toggleMember(names: string[], staffName: string) {
  return names.includes(staffName)
    ? names.filter((name) => name !== staffName)
    : [...names, staffName];
}

export default function RewardCommissionCenter({
  applications,
  rawCustomerLeads,
  customMissions,
  rewardTeams,
  approvalRequests,
  roleAccounts,
  currentStaffName,
  currentStaffRole,
  canViewAllRewards,
  canManageRewardTeams,
  canManageCustomMissions,
  initialTab = 'payouts',
  onAddRewardTeam,
  onUpdateRewardTeam,
  onDeleteRewardTeam,
  onAddCustomMission,
  onUpdateCustomMission,
  onOpenApplication,
  onOpenApprovals,
  commissionRules = DEFAULT_COMMISSION_RULES,
  onSubmitMissionReward,
  onTabChange,
  embedded = false
}: RewardCommissionCenterProps) {
  const appLanguage = getAppLanguage();
  const [activeCenterTab, setActiveCenterTab] = useState<RewardCenterTab>(() => normalizeRewardCenterTab(initialTab));

  const changeCenterTab = (tab: RewardCenterTab) => {
    const nextTab = normalizeRewardCenterTab(tab);
    setActiveCenterTab(nextTab);
    onTabChange?.(nextTab);
  };
  const [activeFilter, setActiveFilter] = useState<RewardFilter>('all');
  const [teamDraft, setTeamDraft] = useState<RewardTeamDraft>(() => createDefaultTeamDraft(1));
  const [editingTeamId, setEditingTeamId] = useState('');
  const [teamEditDrafts, setTeamEditDrafts] = useState<Record<string, RewardTeamDraft>>({});
  const [payoutMonthKey, setPayoutMonthKey] = useState<string>('current');
  const [copySummaryMessage, setCopySummaryMessage] = useState('');
  const [payoutViewMode, setPayoutViewMode] = useState<'detail' | 'byStaff'>('detail');
  const rewardDetailScrollRef = useRef<HTMLDivElement | null>(null);
  const [rewardDetailScrollTop, setRewardDetailScrollTop] = useState(0);
  const [rewardDetailColumnCount, setRewardDetailColumnCount] = useState(1);
  const { start: monthStart, end: monthEnd, label: payoutMonthLabel, isCurrentMonth: isPayoutCurrentMonth } = useMemo(
    () => getPayoutMonthRange(payoutMonthKey),
    [payoutMonthKey]
  );
  const [monthSnapshot, setMonthSnapshot] = useState<MonthlySettlementSnapshot | null>(null);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setMonthSnapshot(null);
    loadMonthlySnapshotFromFirebase(payoutMonthLabel)
      .then((snapshot) => {
        if (!cancelled) {
          setMonthSnapshot(snapshot);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [payoutMonthLabel]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)');
    const syncColumnCount = () => setRewardDetailColumnCount(mediaQuery.matches ? 2 : 1);

    syncColumnCount();
    mediaQuery.addEventListener('change', syncColumnCount);

    return () => mediaQuery.removeEventListener('change', syncColumnCount);
  }, []);

  useEffect(() => {
    const nextTab = normalizeRewardCenterTab(initialTab);
    setActiveCenterTab(nextTab);
    if (nextTab !== initialTab) {
      onTabChange?.(nextTab);
    }
  }, [initialTab, onTabChange]);
  const activeStaffAccounts = useMemo(
    () => roleAccounts.filter((account) => account.status === 'Active'),
    [roleAccounts]
  );
  const activeRewardTeams = useMemo(
    () => rewardTeams.filter((team) => team.status === 'Active').slice(0, 2),
    [rewardTeams]
  );
  const visibleRewardTeams = useMemo(
    () => rewardTeams.filter((team) => canViewAllRewards || team.member_names.includes(currentStaffName)),
    [canViewAllRewards, currentStaffName, rewardTeams]
  );
  const activeTeamIdByMember = useMemo(() => {
    const memberMap = new Map<string, string>();
    activeRewardTeams.forEach((team) => {
      team.member_names.forEach((staffName) => {
        memberMap.set(staffName, team.id);
      });
    });

    return memberMap;
  }, [activeRewardTeams]);
  const teamBattle = useMemo(() => {
    const teamStats = activeRewardTeams.map((team) => {
      const members = team.member_names.map((staffName) => {
        const approvedCount = applications.filter((application) => (
          application.handler_name === staffName &&
          application.status === LoanStatus.APPROVE &&
          isWithinRange(application.submitted_at, monthStart, monthEnd)
        )).length;

        return { staffName, approvedCount };
      });
      const approvedCount = members.reduce((sum, member) => sum + member.approvedCount, 0);

      return {
        team,
        members,
        approvedCount,
        isWinner: false,
        isTie: false
      };
    });
    const highest = Math.max(0, ...teamStats.map((team) => team.approvedCount));
    const winnerCount = teamStats.filter((team) => team.approvedCount === highest && highest > 0).length;
    const teams = teamStats.map((team) => ({
      ...team,
      isWinner: winnerCount === 1 && team.approvedCount === highest && highest > 0,
      isTie: winnerCount > 1 && team.approvedCount === highest && highest > 0
    }));

    return {
      teams,
      winnerTeam: teams.find((team) => team.isWinner),
      isTie: winnerCount > 1 && highest > 0,
      hasAnySales: highest > 0,
      highestCount: highest
    };
  }, [activeRewardTeams, applications, monthEnd, monthStart]);

  const rewardRows = useMemo<RewardRow[]>(() => {
    const staffScope = canViewAllRewards
      ? roleAccounts.filter((account) => account.status === 'Active').map((account) => account.name)
      : [currentStaffName];
    const staffRoleMap = new Map(roleAccounts.map((account) => [account.name, account.role]));
    const nextRows: RewardRow[] = [];

    buildDealCommissionSettlements(applications, staffScope, monthStart, monthEnd)
      .forEach((settlement) => {
        const finance = settlement.application.deal_finance!;
        const staffExtraApproval = embedded
          ? undefined
          : approvalRequests.find((request) => (
            request.type === 'extra_commission' &&
            request.status !== 'Rejected' &&
            request.status !== 'Cancelled' &&
            (request.requester_name === settlement.staffName || request.target_label.includes(settlement.staffName)) &&
            isWithinRange(request.submitted_at, monthStart, monthEnd)
          ));

        nextRows.push({
          id: settlement.id,
          type: 'loan_commission',
          status: settlement.status,
          title: tr(
            `成交佣金 · ${settlement.application.applicant_name}`,
            `Deal Commission · ${settlement.application.applicant_name}`,
            `Komisen Jualan · ${settlement.application.applicant_name}`
          ),
          staffName: settlement.staffName,
          amount: settlement.amount,
          metric: `${settlement.application.vehicle_model || tr('未填写车型', 'Model not provided', 'Model tidak dinyatakan')} · ${getDealSaleStatusLabel(finance.sale_status)}`,
          rule: tr(
            `Finance Deal：${getRewardStatusLabel(settlement.status)} · 归属月份 ${settlement.periodDate.slice(0, 7)}`,
            `Finance Deal: ${getRewardStatusLabel(settlement.status)} · Earning month ${settlement.periodDate.slice(0, 7)}`,
            `Finance Deal: ${getRewardStatusLabel(settlement.status)} · Bulan pendapatan ${settlement.periodDate.slice(0, 7)}`
          ),
          context: `${settlement.application.applicant_name} · ${settlement.application.id}${
            staffExtraApproval
              ? tr(
                `；注意：本月另有额外佣金审批（${formatMoney(staffExtraApproval.amount)}）。请确认没有重复申报。`,
                `; note: there is another extra-commission request this month (${formatMoney(staffExtraApproval.amount)}). Check that it is not a duplicate.`,
                `; perhatian: terdapat satu lagi permohonan komisen tambahan bulan ini (${formatMoney(staffExtraApproval.amount)}). Pastikan ia bukan pendua.`
              )
              : ''
          }`,
          targetApplication: settlement.application,
          actionLabel: tr('查看客户', 'View Customer', 'Lihat Pelanggan'),
          onOpen: () => onOpenApplication(settlement.application)
        });
      });

    if (embedded) {
      return nextRows.sort((a, b) => {
        const statusWeight: Record<RewardStatus, number> = {
          'Pending Review': 0,
          Payable: 1,
          Approved: 2,
          Earned: 3,
          Estimated: 4,
          Paid: 5,
          Reversed: 6,
          Declined: 7
        };
        return statusWeight[a.status] - statusWeight[b.status] || b.amount - a.amount;
      });
    }

    const approvedByStaff = new Map<string, number>();
    applications
      .filter((application) => application.status === LoanStatus.APPROVE && isWithinRange(application.submitted_at, monthStart, monthEnd))
      .forEach((application) => {
        approvedByStaff.set(application.handler_name, (approvedByStaff.get(application.handler_name) || 0) + 1);
      });

    const leaderboard = [...approvedByStaff.entries()]
      .filter(([staffName]) => staffScope.includes(staffName))
      .sort((a, b) => b[1] - a[1]);
    const leaderboardPayouts = [commissionRules.leaderboard_first, commissionRules.leaderboard_second, commissionRules.leaderboard_third];

    leaderboard.slice(0, 3).forEach(([staffName, approvedCount], index) => {
      nextRows.push({
        id: `leaderboard-${index + 1}-${staffName}`,
        type: index === 0 ? 'top_sales_bonus' : 'leaderboard_payout',
        status: 'Estimated',
        title: index === 0
          ? tr('销售冠军奖金', 'Top Sales Bonus', 'Bonus Jualan Teratas')
          : tr(`排行榜第 ${index + 1} 名`, `Leaderboard #${index + 1}`, `Kedudukan #${index + 1}`),
        staffName,
        amount: leaderboardPayouts[index] || 0,
        metric: tr(`本月 ${approvedCount} 单批核`, `${approvedCount} approved this month`, `${approvedCount} diluluskan bulan ini`),
        rule: tr(
          `排行榜奖金：第 1 名 ${formatMoney(commissionRules.leaderboard_first)}、第 2 名 ${formatMoney(commissionRules.leaderboard_second)}、第 3 名 ${formatMoney(commissionRules.leaderboard_third)}`,
          `Leaderboard bonus: #1 ${formatMoney(commissionRules.leaderboard_first)}, #2 ${formatMoney(commissionRules.leaderboard_second)}, #3 ${formatMoney(commissionRules.leaderboard_third)}`,
          `Bonus kedudukan: #1 ${formatMoney(commissionRules.leaderboard_first)}, #2 ${formatMoney(commissionRules.leaderboard_second)}, #3 ${formatMoney(commissionRules.leaderboard_third)}`
        ),
        context: tr(`本月排名第 ${index + 1}`, `Ranked #${index + 1} this month`, `Kedudukan #${index + 1} bulan ini`),
        actionLabel: tr('查看审批', 'View Approval', 'Lihat Kelulusan'),
        onOpen: onOpenApprovals
      });
    });

    if (teamBattle.winnerTeam) {
      const winningTeam = teamBattle.winnerTeam;
      winningTeam.team.member_names
        .filter((staffName) => staffScope.includes(staffName))
        .forEach((staffName) => {
          const memberApprovedCount = winningTeam.members.find((member) => member.staffName === staffName)?.approvedCount || 0;

          nextRows.push({
            id: `team-bonus-${winningTeam.team.id}-${staffName}`,
            type: 'team_bonus',
            status: 'Estimated',
            title: tr(
              `「${winningTeam.team.name}」战队获胜奖金`,
              `${winningTeam.team.name} Team Winner Bonus`,
              `Bonus Pasukan Pemenang ${winningTeam.team.name}`
            ),
            staffName,
            amount: Number(winningTeam.team.bonus_amount) || 0,
            metric: tr(
              `个人 ${memberApprovedCount} 单 / 全队 ${winningTeam.approvedCount} 单批核`,
              `${memberApprovedCount} personal / ${winningTeam.approvedCount} team approvals`,
              `${memberApprovedCount} individu / ${winningTeam.approvedCount} kelulusan pasukan`
            ),
            rule: tr(
              `本月战队对决：获胜队每位成员各得 ${formatMoney(winningTeam.team.bonus_amount)}`,
              `Monthly team battle: each winning member earns ${formatMoney(winningTeam.team.bonus_amount)}`,
              `Pertempuran pasukan bulanan: setiap ahli pemenang memperoleh ${formatMoney(winningTeam.team.bonus_amount)}`
            ),
            context: tr(
              `「${winningTeam.team.name}」赢得本月战队对决。`,
              `${winningTeam.team.name} won this month's team battle.`,
              `${winningTeam.team.name} memenangi pertempuran pasukan bulan ini.`
            ),
            actionLabel: tr('查看审批', 'View Approval', 'Lihat Kelulusan'),
            onOpen: onOpenApprovals
          });
        });
    }

    customMissions
      .filter((mission) => mission.status === 'Active')
      .forEach((mission) => {
        staffScope
          .filter((staffName) => isStaffInScope(mission, staffName, staffRoleMap.get(staffName) || currentStaffRole))
          .forEach((staffName) => {
            const progress = getMissionProgress(mission, staffName, applications, rawCustomerLeads);
            if (!progress.completed) {
              return;
            }

            const relatedApproval = approvalRequests.find((request) => (
              request.type === 'mission_reward' &&
              request.target_id === mission.id &&
              (request.target_label.includes(staffName) || request.requester_name === staffName)
            ));

            nextRows.push({
              id: `mission-reward-${mission.id}-${staffName}`,
              type: mission.metric_type === 'fast_response' ? 'fast_response_bonus' : 'mission_reward',
              status: getApprovalStatus(relatedApproval),
              title: mission.metric_type === 'fast_response'
                ? tr('快速响应奖金', 'Fast Response Bonus', 'Bonus Respons Pantas')
                : mission.title,
              staffName,
              amount: Number(mission.reward_amount) || 0,
              metric: `${getMetricLabel(mission.metric_type)} · ${progress.metric}`,
              rule: tr(
                `${getTimeframeLabel(mission.timeframe)}任务奖励`,
                `${getTimeframeLabel(mission.timeframe)} mission reward`,
                `Ganjaran misi ${getTimeframeLabel(mission.timeframe)}`
              ),
              context: relatedApproval
                ? tr(
                  `审批状态：${getRewardStatusLabel(getApprovalStatus(relatedApproval))}`,
                  `Approval status: ${getRewardStatusLabel(getApprovalStatus(relatedApproval))}`,
                  `Status kelulusan: ${getRewardStatusLabel(getApprovalStatus(relatedApproval))}`
                )
                : tr('目标已达成，可提交任务奖励审批', 'Target achieved; submit the mission reward for approval.', 'Sasaran dicapai; hantar ganjaran misi untuk kelulusan.'),
              actionLabel: relatedApproval
                ? tr('查看审批', 'View Approval', 'Lihat Kelulusan')
                : tr('查看任务', 'View Mission', 'Lihat Misi'),
              onOpen: relatedApproval ? onOpenApprovals : () => changeCenterTab('missions')
            });
          });
      });

    approvalRequests
      .filter((request) => (
        request.type === 'extra_commission' &&
        (canViewAllRewards || request.requester_name === currentStaffName || request.target_label.includes(currentStaffName))
      ))
      .forEach((request) => {
        nextRows.push({
          id: `extra-commission-${request.id}`,
          type: 'loan_commission',
          status: getApprovalStatus(request),
          title: tr('额外佣金', 'Extra Commission', 'Komisen Tambahan'),
          staffName: request.requester_name,
          amount: request.amount,
          metric: request.target_label || tr('手动佣金', 'Manual Commission', 'Komisen Manual'),
          rule: tr('通过审批流程发放', 'Paid through the approval workflow', 'Dibayar melalui aliran kelulusan'),
          context: request.reason || request.notes || tr('额外佣金审批', 'Extra commission approval', 'Kelulusan komisen tambahan'),
          actionLabel: tr('查看审批', 'View Approval', 'Lihat Kelulusan'),
          onOpen: onOpenApprovals
        });
      });

    return nextRows.sort((a, b) => {
      const statusWeight: Record<RewardStatus, number> = {
        'Pending Review': 0,
        Payable: 1,
        Approved: 2,
        Earned: 3,
        Estimated: 4,
        Paid: 5,
        Reversed: 6,
        Declined: 7
      };
      return statusWeight[a.status] - statusWeight[b.status] || b.amount - a.amount;
    });
  }, [
    applications,
    appLanguage,
    approvalRequests,
    canViewAllRewards,
    commissionRules,
    currentStaffName,
    currentStaffRole,
    customMissions,
    embedded,
    monthEnd,
    monthStart,
    onOpenApplication,
    onOpenApprovals,
    rawCustomerLeads,
    roleAccounts,
    teamBattle
  ]);

  const filteredRows = useMemo(() => {
    if (activeFilter === 'all') {
      return rewardRows;
    }

    if (activeFilter === 'active') {
      return rewardRows.filter((row) => row.status === 'Earned' || row.status === 'Estimated');
    }

    if (activeFilter === 'payable') {
      return rewardRows.filter((row) => row.status === 'Payable' || row.status === 'Pending Review');
    }

    if (activeFilter === 'paid') {
      return rewardRows.filter((row) => row.status === 'Paid' || row.status === 'Approved');
    }

    if (activeFilter === 'reversed') {
      return rewardRows.filter((row) => row.status === 'Reversed' || row.status === 'Declined');
    }

    return [];
  }, [activeFilter, rewardRows]);

  const estimateRows = rewardRows.filter((row) => row.status === 'Estimated');
  const sumRowsByTypes = (rows: RewardRow[], types: RewardType[]) => rows
    .filter((row) => types.includes(row.type))
    .reduce((sum, row) => sum + row.amount, 0);
  const estimateBreakdown = [
    [tr('佣金', 'Commission', 'Komisen'), sumRowsByTypes(estimateRows, ['loan_commission'])],
    [tr('排行榜', 'Leaderboard', 'Kedudukan'), sumRowsByTypes(estimateRows, ['top_sales_bonus', 'leaderboard_payout'])],
    [tr('战队', 'Team', 'Pasukan'), sumRowsByTypes(estimateRows, ['team_bonus'])],
    [tr('任务', 'Mission', 'Misi'), sumRowsByTypes(estimateRows, ['mission_reward', 'fast_response_bonus'])]
  ]
    .filter(([, amount]) => Number(amount) > 0)
    .map(([label, amount]) => `${label} ${formatMoney(Number(amount))}`)
    .join(' · ');
  const summary = {
    estimate: estimateRows.reduce((sum, row) => sum + row.amount, 0),
    estimateBreakdown: estimateBreakdown || tr('本月暂无估算项', 'No estimated items this month', 'Tiada item anggaran bulan ini'),
    earned: rewardRows.filter((row) => row.status === 'Earned').reduce((sum, row) => sum + row.amount, 0),
    earnedCount: rewardRows.filter((row) => row.status === 'Earned').length,
    pending: rewardRows.filter((row) => row.status === 'Pending Review').reduce((sum, row) => sum + row.amount, 0),
    pendingCount: rewardRows.filter((row) => row.status === 'Pending Review').length,
    payable: rewardRows.filter((row) => row.status === 'Payable' || row.status === 'Approved').reduce((sum, row) => sum + row.amount, 0),
    payableCount: rewardRows.filter((row) => row.status === 'Payable' || row.status === 'Approved').length,
    paid: rewardRows.filter((row) => row.status === 'Paid').reduce((sum, row) => sum + row.amount, 0),
    paidCount: rewardRows.filter((row) => row.status === 'Paid').length,
    reversed: rewardRows.filter((row) => row.status === 'Reversed' || row.status === 'Declined').reduce((sum, row) => sum + row.amount, 0),
    reversedCount: rewardRows.filter((row) => row.status === 'Reversed' || row.status === 'Declined').length
  };

  useEffect(() => {
    setRewardDetailScrollTop(0);
    if (rewardDetailScrollRef.current) {
      rewardDetailScrollRef.current.scrollTop = 0;
    }
  }, [activeFilter, filteredRows.length, payoutMonthKey, payoutViewMode]);

  const rewardRowsWindow = useMemo(() => {
    const totalGridRows = Math.ceil(filteredRows.length / rewardDetailColumnCount);
    const viewportRowCount = Math.ceil(REWARD_DETAIL_TABLE_HEIGHT / REWARD_DETAIL_ROW_HEIGHT);
    const startGridRow = Math.max(Math.floor(rewardDetailScrollTop / REWARD_DETAIL_ROW_HEIGHT) - REWARD_DETAIL_OVERSCAN_ROWS, 0);
    const endGridRow = Math.min(startGridRow + viewportRowCount + (REWARD_DETAIL_OVERSCAN_ROWS * 2), totalGridRows);
    const startIndex = startGridRow * rewardDetailColumnCount;
    const endIndex = Math.min(endGridRow * rewardDetailColumnCount, filteredRows.length);

    return {
      visibleRows: filteredRows.slice(startIndex, endIndex),
      topSpacerHeight: startGridRow * REWARD_DETAIL_ROW_HEIGHT,
      bottomSpacerHeight: Math.max((totalGridRows - endGridRow) * REWARD_DETAIL_ROW_HEIGHT, 0)
    };
  }, [filteredRows, rewardDetailColumnCount, rewardDetailScrollTop]);
  const visibleRows = rewardRowsWindow.visibleRows;

  const staffSummaries = useMemo(() => {
    const byStaff = new Map<string, {
      estimated: number;
      earned: number;
      pending: number;
      payable: number;
      paid: number;
      reversed: number;
      count: number;
    }>();

    rewardRows.forEach((row) => {
      const entry = byStaff.get(row.staffName) || {
        estimated: 0,
        earned: 0,
        pending: 0,
        payable: 0,
        paid: 0,
        reversed: 0,
        count: 0
      };

      if (row.status === 'Estimated') {
        entry.estimated += row.amount;
      } else if (row.status === 'Earned') {
        entry.earned += row.amount;
      } else if (row.status === 'Pending Review') {
        entry.pending += row.amount;
      } else if (row.status === 'Payable' || row.status === 'Approved') {
        entry.payable += row.amount;
      } else if (row.status === 'Paid') {
        entry.paid += row.amount;
      } else if (row.status === 'Reversed' || row.status === 'Declined') {
        entry.reversed += row.amount;
      }

      entry.count += 1;
      byStaff.set(row.staffName, entry);
    });

    return Array.from(byStaff.entries())
      .map(([staffName, entry]) => ({
        staffName,
        ...entry,
        total: entry.estimated + entry.earned + entry.payable + entry.paid
      }))
      .sort((a, b) => b.total - a.total || a.staffName.localeCompare(b.staffName));
  }, [rewardRows]);

  const handleCopyStaffSummary = async () => {
    const lines = [
      tr(
        `${payoutMonthLabel} 佣金结算汇总`,
        `${payoutMonthLabel} Commission Settlement Summary`,
        `${payoutMonthLabel} Ringkasan Penyelesaian Komisen`
      ),
      ...staffSummaries.map((row) => (
        embedded
          ? tr(
            `${row.staffName}：合计 ${formatMoney(row.total)}（预计 ${formatMoney(row.estimated)} · 已赚取 ${formatMoney(row.earned)} · 待支付 ${formatMoney(row.payable)} · 已支付 ${formatMoney(row.paid)} · 已反转 ${formatMoney(row.reversed)}）`,
            `${row.staffName}: Total ${formatMoney(row.total)} (Estimated ${formatMoney(row.estimated)} · Earned ${formatMoney(row.earned)} · Payable ${formatMoney(row.payable)} · Paid ${formatMoney(row.paid)} · Reversed ${formatMoney(row.reversed)})`,
            `${row.staffName}: Jumlah ${formatMoney(row.total)} (Anggaran ${formatMoney(row.estimated)} · Diperoleh ${formatMoney(row.earned)} · Boleh Dibayar ${formatMoney(row.payable)} · Dibayar ${formatMoney(row.paid)} · Diterbalikkan ${formatMoney(row.reversed)})`
          )
          : tr(
            `${row.staffName}：合计 ${formatMoney(row.total)}（预计 ${formatMoney(row.estimated)} · 已赚取 ${formatMoney(row.earned)} · 审批中 ${formatMoney(row.pending)} · 待支付 ${formatMoney(row.payable)} · 已支付 ${formatMoney(row.paid)} · 已反转/拒绝 ${formatMoney(row.reversed)}）`,
            `${row.staffName}: Total ${formatMoney(row.total)} (Estimated ${formatMoney(row.estimated)} · Earned ${formatMoney(row.earned)} · Pending ${formatMoney(row.pending)} · Payable ${formatMoney(row.payable)} · Paid ${formatMoney(row.paid)} · Reversed/Declined ${formatMoney(row.reversed)})`,
            `${row.staffName}: Jumlah ${formatMoney(row.total)} (Anggaran ${formatMoney(row.estimated)} · Diperoleh ${formatMoney(row.earned)} · Menunggu ${formatMoney(row.pending)} · Boleh Dibayar ${formatMoney(row.payable)} · Dibayar ${formatMoney(row.paid)} · Diterbalikkan/Ditolak ${formatMoney(row.reversed)})`
          )
      ))
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopySummaryMessage(tr('已复制汇总', 'Summary copied', 'Ringkasan disalin'));
    } catch {
      setCopySummaryMessage(tr('复制失败，请手动选择', 'Copy failed; select the text manually.', 'Salinan gagal; pilih teks secara manual.'));
    }

    window.setTimeout(() => setCopySummaryMessage(''), 2500);
  };

  // 把当前所选月份的结算结果凝固成快照，日后对账不受数据改动影响。
  const handleSaveMonthlySnapshot = async () => {
    const snapshot: MonthlySettlementSnapshot = {
      id: payoutMonthLabel,
      month: payoutMonthLabel,
      generated_at: new Date().toISOString(),
      generated_by: currentStaffName,
      staff: staffSummaries.map((row) => ({
        staff_name: row.staffName,
        estimate: row.estimated + row.earned,
        pending: row.pending,
        approved: row.payable + row.paid,
        total: row.total,
        count: row.count,
        estimated: row.estimated,
        earned: row.earned,
        payable: row.payable,
        paid: row.paid,
        reversed: row.reversed
      })),
      team_battle: {
        teams: teamBattle.teams.map((team) => ({ name: team.team.name, approved_count: team.approvedCount })),
        winner_name: teamBattle.winnerTeam?.team.name || '',
        is_tie: teamBattle.isTie
      },
      commission_rules: commissionRules
    };

    setIsSavingSnapshot(true);

    try {
      await saveMonthlySnapshotToFirebase(snapshot);
      setMonthSnapshot(snapshot);
    } catch {
      // Snapshot save is best-effort; user can retry.
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  const rules = [
    [
      tr('任务奖励', 'Mission Rewards', 'Ganjaran Misi'),
      tr('按 Custom Mission 的目标和奖励金额计算，正式发放需通过审批流程。', 'Calculated from each Custom Mission target and reward amount; payment requires approval.', 'Dikira daripada sasaran dan jumlah ganjaran Custom Mission; bayaran memerlukan kelulusan.')
    ],
    [
      tr('销售冠军奖金', 'Top Sales Bonus', 'Bonus Jualan Teratas'),
      tr(
        `按本月批核单数排名估算：第 1 名 ${formatMoney(commissionRules.leaderboard_first)}、第 2 名 ${formatMoney(commissionRules.leaderboard_second)}、第 3 名 ${formatMoney(commissionRules.leaderboard_third)}。`,
        `Estimated from this month's approved-deal ranking: #1 ${formatMoney(commissionRules.leaderboard_first)}, #2 ${formatMoney(commissionRules.leaderboard_second)}, #3 ${formatMoney(commissionRules.leaderboard_third)}.`,
        `Dianggarkan daripada kedudukan jualan diluluskan bulan ini: #1 ${formatMoney(commissionRules.leaderboard_first)}, #2 ${formatMoney(commissionRules.leaderboard_second)}, #3 ${formatMoney(commissionRules.leaderboard_third)}.`
      )
    ],
    [
      tr('成交佣金', 'Deal Commission', 'Komisen Jualan'),
      tr(
        commissionRules.deal_commission_percent === undefined
          ? `Finance Deal 是唯一事实来源。佣金百分比尚未设置，目前沿用旧固定金额 ${formatMoney(commissionRules.per_approved_loan)}。`
          : `Finance Deal 是唯一事实来源。新 Deal 按最终卖价的 ${commissionRules.deal_commission_percent}% 计算佣金，并保存当时的比例与金额。`,
        commissionRules.deal_commission_percent === undefined
          ? `Finance Deal is the source of truth. No commission percentage is set yet, so the legacy fixed ${formatMoney(commissionRules.per_approved_loan)} remains in effect.`
          : `Finance Deal is the source of truth. New deals calculate commission at ${commissionRules.deal_commission_percent}% of final selling price and snapshot that rate and amount.`,
        commissionRules.deal_commission_percent === undefined
          ? `Finance Deal ialah sumber utama. Peratus komisen belum ditetapkan, jadi jumlah tetap lama ${formatMoney(commissionRules.per_approved_loan)} masih digunakan.`
          : `Finance Deal ialah sumber utama. Jualan baharu mengira komisen pada ${commissionRules.deal_commission_percent}% daripada harga jualan akhir dan menyimpan kadar serta jumlah tersebut.`
      )
    ],
    [
      tr('佣金状态', 'Commission Status', 'Status Komisen'),
      tr(
        '未交车为预计；交车后为已赚取；财务完成后为待支付；填入付款日期后为已支付；取消成交则为已反转。',
        'Estimated before delivery; Earned after delivery; Payable after Finance Completed; Paid after a payment date is recorded; Reversed when the deal is cancelled.',
        'Anggaran sebelum serahan; Diperoleh selepas serahan; Boleh Dibayar selepas Finance Completed; Dibayar selepas tarikh bayaran direkodkan; Diterbalikkan apabila jualan dibatalkan.'
      )
    ],
    [
      tr('佣金归属月份', 'Earning Month', 'Bulan Pendapatan'),
      tr(
        '已交车成交固定归入交车日期所在月份；交车前的预计值使用 Deal 更新时间。',
        'Delivered deals belong to the delivery month; pre-delivery estimates use the deal update month.',
        'Jualan yang telah diserah dimasukkan ke bulan tarikh serahan; anggaran sebelum serahan menggunakan bulan kemas kini jualan.'
      )
    ],
    [
      tr('额外佣金', 'Extra Commission', 'Komisen Tambahan'),
      tr('通过审批流程加发，不改写 Finance Deal 保存的佣金金额。', 'Added through the approval workflow without changing the commission saved on the Finance Deal.', 'Ditambah melalui aliran kelulusan tanpa mengubah komisen yang disimpan pada Finance Deal.')
    ]
  ];
  const visibleRules = embedded ? rules.slice(2, 5) : rules;
  const canAddActiveTeam = activeRewardTeams.length < 2;
  const canSubmitTeamDraft = canManageRewardTeams && Boolean(teamDraft.name.trim()) && teamDraft.member_names.length > 0 && canAddActiveTeam;
  const startEditingTeam = (team: RewardTeam) => {
    setEditingTeamId(team.id);
    setTeamEditDrafts((drafts) => ({
      ...drafts,
      [team.id]: createDraftFromTeam(team)
    }));
  };
  const updateEditDraft = (teamId: string, updates: Partial<RewardTeamDraft>) => {
    setTeamEditDrafts((drafts) => ({
      ...drafts,
      [teamId]: {
        ...(drafts[teamId] || createDefaultTeamDraft(1)),
        ...updates
      }
    }));
  };
  const handleAddTeam = () => {
    if (!canSubmitTeamDraft) {
      return;
    }

    onAddRewardTeam({
      ...teamDraft,
      name: teamDraft.name.trim(),
      bonus_amount: Math.max(Number(teamDraft.bonus_amount) || 0, 0)
    });
    setTeamDraft(createDefaultTeamDraft(Math.min(activeRewardTeams.length + 2, 2)));
  };
  const handleSaveTeam = (team: RewardTeam) => {
    const draft = teamEditDrafts[team.id] || createDraftFromTeam(team);
    if (!draft.name.trim() || draft.member_names.length === 0) {
      return;
    }

    onUpdateRewardTeam(team.id, {
      ...draft,
      name: draft.name.trim(),
      bonus_amount: Math.max(Number(draft.bonus_amount) || 0, 0)
    });
    setEditingTeamId('');
  };
  const summaryCards: Array<[string, string, string, React.ReactNode, string]> = [
    [
      tr('预计', 'Estimated', 'Anggaran'),
      formatMoney(summary.estimate),
      embedded
        ? tr(`${estimateRows.length} 项等待交车`, `${estimateRows.length} deal(s) awaiting delivery`, `${estimateRows.length} jualan menunggu serahan`)
        : summary.estimateBreakdown,
      <Sparkles key="estimate" className="h-4 w-4" />,
      'text-slate-700 bg-slate-100'
    ],
    [
      tr('已赚取', 'Earned', 'Diperoleh'),
      formatMoney(summary.earned),
      tr(`${summary.earnedCount} 项已交车`, `${summary.earnedCount} delivered item(s)`, `${summary.earnedCount} item telah diserah`),
      <BadgeDollarSign key="earned" className="h-4 w-4" />,
      'text-indigo-700 bg-indigo-50'
    ],
    ...(!embedded ? [[
      tr('审批中', 'Pending Review', 'Menunggu Semakan'),
      formatMoney(summary.pending),
      tr(`${summary.pendingCount} 项等待审批`, `${summary.pendingCount} awaiting approval`, `${summary.pendingCount} menunggu kelulusan`),
      <ShieldCheck key="pending" className="h-4 w-4" />,
      'text-amber-700 bg-amber-50'
    ] as [string, string, string, React.ReactNode, string]] : []),
    [
      tr('待支付', 'Payable', 'Boleh Dibayar'),
      formatMoney(summary.payable),
      embedded
        ? tr(`${summary.payableCount} 项财务已完成`, `${summary.payableCount} Finance Completed deal(s)`, `${summary.payableCount} jualan Finance Completed`)
        : tr(`${summary.payableCount} 项可支付 / 已批准`, `${summary.payableCount} payable / approved`, `${summary.payableCount} boleh dibayar / diluluskan`),
      <ClipboardCheck key="payable" className="h-4 w-4" />,
      'text-amber-700 bg-amber-50'
    ],
    [
      tr('已支付', 'Paid', 'Dibayar'),
      formatMoney(summary.paid),
      tr(`${summary.paidCount} 项已记录付款`, `${summary.paidCount} payment(s) recorded`, `${summary.paidCount} bayaran direkodkan`),
      <CheckCircle2 key="paid" className="h-4 w-4" />,
      'text-emerald-700 bg-emerald-50'
    ],
    [
      tr('已反转', 'Reversed', 'Diterbalikkan'),
      formatMoney(summary.reversed),
      embedded
        ? tr(`${summary.reversedCount} 项成交已取消`, `${summary.reversedCount} cancelled deal(s)`, `${summary.reversedCount} jualan dibatalkan`)
        : tr(`${summary.reversedCount} 项已反转 / 拒绝`, `${summary.reversedCount} reversed / declined`, `${summary.reversedCount} diterbalikkan / ditolak`),
      <Trash2 key="reversed" className="h-4 w-4" />,
      'text-rose-700 bg-rose-50'
    ]
  ];

  return (
    <div id="reward-commission-center" className={embedded ? 'space-y-4' : 'space-y-6'}>
      {!embedded && (
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('佣金与奖励', 'Commission & Rewards', 'Komisen & Ganjaran')}</h2>
          <p className="max-w-3xl text-xs font-light leading-relaxed text-slate-500">
            {tr(
              '成交佣金直接读取 Finance Deal 状态；其他奖励按各自规则计算。',
              'Deal commission reads directly from Finance Deal status; other rewards follow their own rules.',
              'Komisen jualan dibaca terus daripada status Finance Deal; ganjaran lain mengikut peraturan masing-masing.'
            )}
          </p>
        </div>
        <span className="inline-flex self-start rounded-full bg-red-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
          {canViewAllRewards
            ? tr('全员收入视图', 'All Staff View', 'Paparan Semua Kakitangan')
            : tr(`${currentStaffName} 的收入`, `${currentStaffName}'s Earnings`, `Pendapatan ${currentStaffName}`)}
        </span>
      </section>
      )}

      {/* Desktop navigates via the flat sidebar; the tab bar only shows on mobile. */}
      {!embedded && (
      <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-100 bg-white p-1 shadow-2xs md:hidden">
        {[
          ['payouts', tr('佣金结算', 'Commission Settlement', 'Penyelesaian Komisen'), <img key="payouts" src={payoutsIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />],
          ['missions', tr('任务', 'Missions', 'Misi'), <img key="missions" src={missionsIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />],
          ['team_battle', tr('战队对决', 'Team Battle', 'Pertempuran Pasukan'), <img key="team_battle" src={teamBattleIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />]
        ]
          .filter(([key]) => (
            (key !== 'missions' || !V1_HIDDEN_NAV_KEYS.has('rewardMissions')) &&
            (key !== 'team_battle' || !V1_HIDDEN_NAV_KEYS.has('teamBattle'))
          ))
          .map(([key, label, icon]) => (
          <button
            key={key as string}
            type="button"
            onClick={() => changeCenterTab(key as RewardCenterTab)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeCenterTab === key
                ? 'bg-red-800 text-white'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {icon}
            {label}
            {key === 'team_battle' && (
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                activeCenterTab === key ? 'bg-white/15 text-white' : 'bg-cyan-50 text-cyan-700'
              }`}
              >
                {activeRewardTeams.length}/2
              </span>
            )}
          </button>
        ))}
      </section>
      )}

      {activeCenterTab === 'payouts' && (
        <section className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xs">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('结算月份', 'Settlement Month', 'Bulan Penyelesaian')}</span>
          {[
            ['current', tr('本月', 'This Month', 'Bulan Ini')],
            ['last', tr('上月', 'Last Month', 'Bulan Lepas')]
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPayoutMonthKey(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                payoutMonthKey === key
                  ? 'bg-red-800 text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
          <input
            type="month"
            value={payoutMonthLabel}
            onChange={(event) => setPayoutMonthKey(event.target.value || 'current')}
            className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:bg-white"
            aria-label={tr('选择结算月份', 'Select settlement month', 'Pilih bulan penyelesaian')}
          />
          {canManageRewardTeams && (
            <div className="ml-auto flex items-center gap-2">
              {monthSnapshot ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-100" title={tr(`生成于 ${new Date(monthSnapshot.generated_at).toLocaleString(getAppLocale())} · ${monthSnapshot.generated_by}`, `Generated ${new Date(monthSnapshot.generated_at).toLocaleString(getAppLocale())} · ${monthSnapshot.generated_by}`, `Dijana ${new Date(monthSnapshot.generated_at).toLocaleString(getAppLocale())} · ${monthSnapshot.generated_by}`)}>
                  {tr('已存快照', 'Snapshot Saved', 'Snapshot Disimpan')}
                </span>
              ) : !isPayoutCurrentMonth ? (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600 ring-1 ring-amber-100">
                  {tr('该月未存档', 'Month Not Archived', 'Bulan Belum Diarkib')}
                </span>
              ) : null}
              <button
                type="button"
                onClick={handleSaveMonthlySnapshot}
                disabled={isSavingSnapshot}
                className="rounded-lg bg-red-800 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-red-900 disabled:bg-slate-200 disabled:text-slate-400"
                title={tr('把当前月份的结算结果存档；日后数据改动不影响快照', 'Archive this month so later data changes do not affect the snapshot.', 'Arkibkan bulan ini supaya perubahan data kemudian tidak menjejaskan snapshot.')}
              >
                {isSavingSnapshot
                  ? tr('保存中…', 'Saving…', 'Menyimpan…')
                  : monthSnapshot
                    ? tr('更新快照', 'Update Snapshot', 'Kemas Kini Snapshot')
                    : tr('存为快照', 'Save Snapshot', 'Simpan Snapshot')}
              </button>
            </div>
          )}
        </section>
      )}

      {!embedded && activeCenterTab === 'payouts' && (
        <section data-testid="commission-summary-cards" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {summaryCards.map(([label, value, hint, icon, className]) => (
          <div key={label as string} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${className as string}`}>
              {icon}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
            <p className="mt-1 truncate text-[10px] font-semibold text-slate-400" title={hint as string}>{hint}</p>
          </div>
        ))}
        </section>
      )}

      {!embedded && activeCenterTab === 'payouts' && activeRewardTeams.length > 0 && !teamBattle.winnerTeam && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-2.5 text-xs font-bold text-amber-700">
          {teamBattle.isTie
            ? tr(
              `战队对决：本月打平（各 ${teamBattle.highestCount} 单批核），按规则无战队奖金。`,
              `Team battle: tied at ${teamBattle.highestCount} approvals each, so no team bonus this month.`,
              `Pertempuran pasukan: seri dengan ${teamBattle.highestCount} kelulusan setiap pasukan, jadi tiada bonus pasukan bulan ini.`
            )
            : tr(
              '战队对决：本月两队都还没有批核成交，暂无战队奖金。',
              'Team battle: neither team has an approved deal this month, so there is no team bonus yet.',
              'Pertempuran pasukan: kedua-dua pasukan belum mempunyai jualan diluluskan bulan ini, jadi belum ada bonus pasukan.'
            )}
        </div>
      )}

      {activeCenterTab === 'team_battle' && (
        <section className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">战队对决</h3>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
              两个战队比拼本月批核单数，获胜队每位成员各得设定奖金，让老员工带着新员工一起赢。
            </p>
          </div>
          <span className="inline-flex self-start rounded-full bg-cyan-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700 ring-1 ring-cyan-100">
            本月 · {activeRewardTeams.length}/2 支战队
          </span>
        </div>

        {activeRewardTeams.length > 0 && !teamBattle.winnerTeam && (
          <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-2.5 text-xs font-bold text-amber-700">
            {teamBattle.isTie
              ? `本月战队打平（各 ${teamBattle.highestCount} 单批核），按规则本月没有战队奖金。`
              : '本月两队都还没有批核成交，暂时没有战队奖金。'}
          </div>
        )}

        {teamBattle.teams.length === 2 && (
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 text-sm font-bold">
              <span className={`truncate ${teamBattle.teams[0].isWinner ? 'text-cyan-700' : 'text-slate-700'}`}>
                {teamBattle.teams[0].team.name}
              </span>
              <span className="shrink-0 font-mono text-lg font-black text-slate-900 tabular-nums">
                {teamBattle.teams[0].approvedCount} : {teamBattle.teams[1].approvedCount}
              </span>
              <span className={`truncate text-right ${teamBattle.teams[1].isWinner ? 'text-rose-600' : 'text-slate-700'}`}>
                {teamBattle.teams[1].team.name}
              </span>
            </div>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100">
              {(() => {
                const first = teamBattle.teams[0].approvedCount;
                const second = teamBattle.teams[1].approvedCount;
                const total = first + second;
                const firstPct = total > 0 ? Math.round((first / total) * 100) : 50;

                return (
                  <>
                    <div className="h-full bg-cyan-500 transition-all" style={{ width: `${firstPct}%` }} />
                    <div className="h-full bg-rose-400 transition-all" style={{ width: `${100 - firstPct}%` }} />
                  </>
                );
              })()}
            </div>
            <p className="mt-2 text-center text-[10px] font-semibold text-slate-400">本月批核单数对决 · 获胜队每位成员各得设定奖金</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {visibleRewardTeams.map((team) => {
            const stats = teamBattle.teams.find((item) => item.team.id === team.id);
            const draft = teamEditDrafts[team.id] || createDraftFromTeam(team);
            const isEditing = editingTeamId === team.id;

            return (
              <article key={team.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px]">
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('队伍名称', 'Team name', "Nama pasukan")}</span>
                        <input
                          value={draft.name}
                          onChange={(event) => updateEditDraft(team.id, { name: event.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-red-800"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('每位成员奖金', 'Bonus / member', "Bonus / ahli")}</span>
                        <input
                          type="number"
                          min="0"
                          value={draft.bonus_amount}
                          onChange={(event) => updateEditDraft(team.id, { bonus_amount: Number(event.target.value) })}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-red-800"
                        />
                      </label>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('成员', 'Members', "ahli")}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {activeStaffAccounts.map((account) => {
                          const lockedByOtherTeam = Boolean(activeTeamIdByMember.get(account.name) && activeTeamIdByMember.get(account.name) !== team.id);

                          return (
                            <button
                              key={account.id}
                              type="button"
                              disabled={lockedByOtherTeam}
                              title={lockedByOtherTeam ? tr('已分配到另一个进行中队伍', 'Already assigned to another active team', "Sudah ditugaskan kepada pasukan aktif lain") : account.name}
                              onClick={() => updateEditDraft(team.id, { member_names: toggleMember(draft.member_names, account.name) })}
                              className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors ${
                                draft.member_names.includes(account.name)
                                  ? 'bg-red-800 text-white'
                                  : lockedByOtherTeam
                                    ? 'cursor-not-allowed bg-slate-100 text-slate-300'
                                    : 'border border-slate-100 bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-900'
                              }`}
                            >
                              {account.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2">
                        {(['Active', 'Archived'] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => updateEditDraft(team.id, { status })}
                            className={`rounded-lg px-3 py-2 text-[11px] font-bold ${
                              draft.status === status ? 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100' : 'bg-slate-50 text-slate-500'
                            }`}
                          >
                            {status === 'Active' ? tr('进行中', 'Active', "Aktif") : tr('已归档', 'Archived', "Diarkibkan")}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingTeamId('')}
                          className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-[11px] font-bold text-slate-500 hover:bg-slate-50"
                        >
                          {tr('取消', 'Cancel', "Batal")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveTeam(team)}
                          disabled={!draft.name.trim() || draft.member_names.length === 0}
                          className="rounded-lg bg-red-800 px-3 py-2 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200"
                        >
                          {tr('保存队伍', 'Save Team', "Pasukan Simpan")}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{team.name}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ${
                            stats?.isWinner
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                              : stats?.isTie
                                ? 'bg-amber-50 text-amber-700 ring-amber-100'
                                : team.status === 'Active'
                                  ? 'bg-cyan-50 text-cyan-700 ring-cyan-100'
                                  : 'bg-slate-100 text-slate-500 ring-slate-200'
                          }`}
                          >
                            {stats?.isWinner ? tr('领先', 'Winning', "Menang") : stats?.isTie ? tr('平手', 'Tie', "Tali leher") : team.status === 'Active' ? tr('进行中', 'Active', "Aktif") : tr('已归档', 'Archived', "Diarkibkan")}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{team.member_names.join(' · ') || tr('未选择成员', 'No member selected', "Tiada ahli yang dipilih")}</p>
                      </div>
                      <p className="shrink-0 text-right text-lg font-black text-slate-900">
                        {stats?.approvedCount || 0}
                        <span className="ml-1 text-[10px] font-bold uppercase text-slate-400">{tr('已批核', 'approved', "diluluskan")}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('每位成员奖金', 'Bonus / member', "Bonus / ahli")}</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{formatMoney(team.bonus_amount)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('成员', 'Members', "ahli")}</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{team.member_names.length}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('预计发放', 'Potential payout', "Potensi pembayaran")}</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{stats?.isWinner ? formatMoney(team.bonus_amount * team.member_names.length) : formatMoney(0)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(stats?.members || team.member_names.map((staffName) => ({ staffName, approvedCount: 0 }))).map((member) => (
                        <div key={member.staffName} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                          <span className="font-semibold text-slate-600">{member.staffName}</span>
                          <span className="font-bold text-slate-900">{tr(`${member.approvedCount} 单已批核`, `${member.approvedCount} approved`, `${member.approvedCount} diluluskan`)}</span>
                        </div>
                      ))}
                    </div>

                    {canManageRewardTeams && (
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingTeam(team)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          {tr('编辑', 'Edit', "Edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRewardTeam(team.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {tr('删除', 'Delete', "Padam")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {visibleRewardTeams.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-800">{tr('还没有 Team Battle', 'No team battle yet', "Tiada pertempuran pasukan lagi")}</p>
              <p className="mt-1 text-xs text-slate-400">{tr('Super Admin 可以在这里设置 Team A 和 Team B。', 'Super Admin set Team A and Team B here.', "Super Admin tetapkan Pasukan A dan Pasukan B di sini.")}</p>
            </div>
          )}

          {canManageRewardTeams && canAddActiveTeam && (
            <article className="rounded-xl border border-dashed border-cyan-200 bg-cyan-50/40 p-4">
              <div className="mb-4 flex items-center gap-2 text-cyan-700">
                <Plus className="h-4 w-4" />
                <h4 className="text-sm font-bold">{tr('添加队伍', 'Add Team', "Tambah Pasukan")}</h4>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px]">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">{tr('队伍名称', 'Team name', "Nama pasukan")}</span>
                  <input
                    value={teamDraft.name}
                    onChange={(event) => setTeamDraft((draft) => ({ ...draft, name: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-cyan-100 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-600"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">{tr('每位成员奖金', 'Bonus / member', "Bonus / ahli")}</span>
                  <input
                    type="number"
                    min="0"
                    value={teamDraft.bonus_amount}
                    onChange={(event) => setTeamDraft((draft) => ({ ...draft, bonus_amount: Number(event.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-cyan-100 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-600"
                  />
                </label>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">{tr('成员', 'Members', "ahli")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeStaffAccounts.map((account) => {
                    const lockedByOtherTeam = activeTeamIdByMember.has(account.name);

                    return (
                      <button
                        key={account.id}
                        type="button"
                        disabled={lockedByOtherTeam}
                        title={lockedByOtherTeam ? tr('已分配到另一个进行中队伍', 'Already assigned to another active team', "Sudah ditugaskan kepada pasukan aktif lain") : account.name}
                        onClick={() => setTeamDraft((draft) => ({ ...draft, member_names: toggleMember(draft.member_names, account.name) }))}
                        className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors ${
                          teamDraft.member_names.includes(account.name)
                            ? 'bg-red-800 text-white'
                            : lockedByOtherTeam
                              ? 'cursor-not-allowed bg-white/70 text-cyan-200'
                              : 'border border-cyan-100 bg-white text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {account.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddTeam}
                disabled={!canSubmitTeamDraft}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-800 px-3 py-2 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                {tr('创建队伍', 'Create Team', "Buat Pasukan")}
              </button>
            </article>
          )}
        </div>
        </section>
      )}

      {activeCenterTab === 'missions' && (
        <MissionStatusPage
          applications={applications}
          rawCustomerLeads={rawCustomerLeads}
          roleAccounts={roleAccounts}
          customMissions={customMissions}
          currentStaffName={currentStaffName}
          canViewAllMissions={canViewAllRewards}
          canManageCustomMissions={canManageCustomMissions}
          mode="custom_missions"
          approvalRequests={approvalRequests}
          onAddCustomMission={onAddCustomMission}
          onUpdateCustomMission={onUpdateCustomMission}
          onSubmitMissionReward={onSubmitMissionReward}
        />
      )}

      {activeCenterTab === 'payouts' && (
        <section className="flex flex-wrap items-center gap-2">
        {canViewAllRewards && (
          <div className="mr-2 flex gap-1 rounded-xl bg-slate-100 p-1">
            {[
              ['detail', tr('明细', 'Details', 'Butiran')],
              ['byStaff', tr('按员工汇总', 'By Staff', 'Mengikut Kakitangan')]
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPayoutViewMode(key as 'detail' | 'byStaff')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  payoutViewMode === key ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {payoutViewMode === 'detail' && FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              activeFilter === filter
                ? 'bg-red-800 text-white'
                : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {getRewardFilterLabel(filter, embedded)}
          </button>
        ))}
        </section>
      )}

      {activeCenterTab === 'payouts' && payoutViewMode === 'byStaff' && (
        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
            <p className="text-xs font-bold text-slate-900">
              {embedded
                ? tr(
                  `${payoutMonthLabel} 按员工汇总（合计不含已反转）`,
                  `${payoutMonthLabel} by staff (totals exclude Reversed)`,
                  `${payoutMonthLabel} mengikut kakitangan (jumlah tidak termasuk Diterbalikkan)`
                )
                : tr(
                  `${payoutMonthLabel} 按员工汇总（合计不含审批中与已反转）`,
                  `${payoutMonthLabel} by staff (totals exclude Pending Review and Reversed)`,
                  `${payoutMonthLabel} mengikut kakitangan (jumlah tidak termasuk Menunggu Semakan dan Diterbalikkan)`
                )}
            </p>
            <div className="flex items-center gap-2">
              {copySummaryMessage && <span className="text-[10px] font-bold text-emerald-600">{copySummaryMessage}</span>}
              <button
                type="button"
                onClick={handleCopyStaffSummary}
                className="rounded-lg bg-red-800 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-red-900"
              >
                {tr('复制汇总', 'Copy Summary', 'Salin Ringkasan')}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-5 py-3">{tr('员工', 'Staff', 'Kakitangan')}</th>
                  <th className="px-5 py-3 text-right">{tr('预计', 'Estimated', 'Anggaran')}</th>
                  <th className="px-5 py-3 text-right">{tr('已赚取', 'Earned', 'Diperoleh')}</th>
                  {!embedded && <th className="px-5 py-3 text-right">{tr('审批中', 'Pending', 'Menunggu')}</th>}
                  <th className="px-5 py-3 text-right">{tr('待支付', 'Payable', 'Boleh Dibayar')}</th>
                  <th className="px-5 py-3 text-right">{tr('已支付', 'Paid', 'Dibayar')}</th>
                  <th className="px-5 py-3 text-right">{tr('已反转', 'Reversed', 'Diterbalikkan')}</th>
                  <th className="px-5 py-3 text-right">{tr('合计', 'Total', 'Jumlah')}</th>
                  <th className="px-5 py-3 text-right">{tr('明细数', 'Items', 'Item')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffSummaries.map((row) => (
                  <tr key={row.staffName} className="hover:bg-indigo-50/20">
                    <td className="px-5 py-3 text-xs font-bold text-slate-800">{row.staffName}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-slate-600 tabular-nums">{formatMoney(row.estimated)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-indigo-600 tabular-nums">{formatMoney(row.earned)}</td>
                    {!embedded && <td className="px-5 py-3 text-right font-mono text-xs text-amber-600 tabular-nums">{formatMoney(row.pending)}</td>}
                    <td className="px-5 py-3 text-right font-mono text-xs text-amber-700 tabular-nums">{formatMoney(row.payable)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-emerald-600 tabular-nums">{formatMoney(row.paid)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-rose-600 tabular-nums">{formatMoney(row.reversed)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-bold text-slate-900 tabular-nums">{formatMoney(row.total)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-slate-400">{row.count}</td>
                  </tr>
                ))}
                {staffSummaries.length === 0 && (
                  <tr>
                    <td colSpan={embedded ? 8 : 9} className="px-5 py-10 text-center text-xs font-semibold text-slate-400">
                      {tr(
                        `${payoutMonthLabel} 没有任何佣金明细`,
                        `No commission entries for ${payoutMonthLabel}`,
                        `Tiada entri komisen untuk ${payoutMonthLabel}`
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeCenterTab === 'payouts' && payoutViewMode === 'detail' && (activeFilter === 'rules' ? (
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visibleRules.map(([title, body]) => (
            <article key={title} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-900">{title}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{body}</p>
            </article>
          ))}
        </section>
      ) : (
        <section
          ref={rewardDetailScrollRef}
          className="overflow-y-auto"
          style={{
            height: filteredRows.length === 0
              ? 'auto'
              : Math.min(
                REWARD_DETAIL_TABLE_HEIGHT,
                Math.max(
                  Math.ceil(filteredRows.length / rewardDetailColumnCount) * REWARD_DETAIL_ROW_HEIGHT,
                  REWARD_DETAIL_ROW_HEIGHT
                )
              )
          }}
          onScroll={(event) => setRewardDetailScrollTop(event.currentTarget.scrollTop)}
        >
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {rewardRowsWindow.topSpacerHeight > 0 && (
            <div aria-hidden="true" className="col-span-full" style={{ height: rewardRowsWindow.topSpacerHeight }} />
          )}

          {visibleRows.map((row) => {
            const meta = TYPE_META[row.type];
            return (
              <article key={row.id} className="min-h-[184px] rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500">{getRewardTypeLabel(row.type)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ${STATUS_STYLE[row.status]}`}>{getRewardStatusLabel(row.status)}</span>
                    </div>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">{row.title}</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{row.staffName} · {row.metric}</p>
                      </div>
                      <p className="shrink-0 text-lg font-black text-slate-900">{formatMoney(row.amount)}</p>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{row.context}</p>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{row.rule}</p>
                    <button
                      type="button"
                      onClick={row.onOpen}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-800 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-red-900"
                    >
                      {row.actionLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {rewardRowsWindow.bottomSpacerHeight > 0 && (
            <div aria-hidden="true" className="col-span-full" style={{ height: rewardRowsWindow.bottomSpacerHeight }} />
          )}

          {filteredRows.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <BadgeDollarSign className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-800">{tr('这个视图暂时没有佣金明细', 'No commission entries in this view', 'Tiada entri komisen dalam paparan ini')}</p>
              <p className="mt-1 text-xs text-slate-400">{tr('交车、完成财务或记录付款后，明细会出现在这里。', 'Entries appear here after delivery, Finance Completed, or payment is recorded.', 'Entri akan muncul selepas serahan, Finance Completed atau bayaran direkodkan.')}</p>
            </div>
          )}
          </div>
        </section>
      ))}
    </div>
  );
}
