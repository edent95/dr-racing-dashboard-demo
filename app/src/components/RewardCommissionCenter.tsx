/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BadgeDollarSign, CheckCircle2, ClipboardCheck, Edit3, Plus, ShieldCheck, Sparkles, Target, Trash2, Zap } from 'lucide-react';
import { ApprovalRequest, CustomMission, CustomMissionMetricType, CustomMissionTimeframe, LoanApplication, LoanStatus, MonthlySettlementSnapshot, RawCustomerLead, RoleAccount, RoleAccountRole } from '../types';
import { getAppLanguage, getAppLocale, tr } from '../lib/i18n';
import { loadMonthlySnapshotFromFirebase, saveMonthlySnapshotToFirebase } from '../services/dashboardRepository';
import { normalizeMalaysiaPhoneDigits as normalizePhoneDigits } from '../utils/malaysiaPhone';
import { buildDealCommissionSettlements } from '../utils/commissionSettlement';

type RewardFilter = 'all' | 'active' | 'payable' | 'paid' | 'reversed' | 'rules' | 'tiers';
type RewardStatus = 'Estimated' | 'Earned' | 'Payable' | 'Paid' | 'Reversed' | 'Pending Review' | 'Approved' | 'Declined';
type RewardType = 'loan_commission' | 'fast_response_bonus' | 'mission_reward';

interface RewardCommissionCenterProps {
  applications: LoanApplication[];
  rawCustomerLeads: RawCustomerLead[];
  customMissions: CustomMission[];
  approvalRequests: ApprovalRequest[];
  roleAccounts: RoleAccount[];
  currentStaffName: string;
  currentStaffRole: RoleAccountRole;
  canViewAllRewards: boolean;
  canManageSnapshots: boolean;
  onOpenApplication: (application: LoanApplication) => void;
  onOpenApprovals: () => void;
  onSubmitMissionReward?: (mission: CustomMission, staffName: string) => void;
  /** Render inside another page (Finance Center 佣金 tab): hides the page header and mobile tab bar. */
  embedded?: boolean;
  /** Progressive commission tiers (owner 2026-10-21), shown first on the Rules tab. */
  tiersPanel?: React.ReactNode;
}


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

const FILTERS: RewardFilter[] = ['all', 'active', 'payable', 'paid', 'reversed', 'tiers', 'rules'];

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
      rules: tr('状态说明', 'Status Guide', 'Panduan Status'),
      tiers: tr('佣金分级', 'Commission Tiers', 'Tahap Komisen')
    })[filter];
  }

  return ({
    all: tr('全部', 'All', 'Semua'),
    active: tr('预计 / 已赚取', 'Estimated / Earned', 'Anggaran / Diperoleh'),
    payable: tr('待支付 / 审批中', 'Payable / Pending', 'Boleh Dibayar / Menunggu'),
    paid: tr('已支付 / 已批准', 'Paid / Approved', 'Dibayar / Diluluskan'),
    reversed: tr('已反转 / 已拒绝', 'Reversed / Declined', 'Diterbalikkan / Ditolak'),
    rules: tr('规则说明', 'Rules', 'Peraturan'),
    tiers: tr('佣金分级', 'Commission Tiers', 'Tahap Komisen')
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
  fast_response_bonus: {
    color: 'text-purple-700 bg-purple-50',
    icon: <Zap className="h-4 w-4" />
  },
  mission_reward: {
    color: 'text-emerald-700 bg-emerald-50',
    icon: <Target className="h-4 w-4" />
  }
};

const getRewardTypeLabel = (type: RewardType) => ({
  loan_commission: tr('成交佣金', 'Deal Commission', 'Komisen Jualan'),
  fast_response_bonus: tr('快速响应奖金', 'Fast Response Bonus', 'Bonus Respons Pantas'),
  mission_reward: tr('任务奖励', 'Mission Reward', 'Ganjaran Misi')
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

export default function RewardCommissionCenter({
  applications,
  rawCustomerLeads,
  customMissions,
  approvalRequests,
  roleAccounts,
  currentStaffName,
  currentStaffRole,
  canViewAllRewards,
  canManageSnapshots,
  onOpenApplication,
  onOpenApprovals,
  onSubmitMissionReward,
  embedded = false,
  tiersPanel
}: RewardCommissionCenterProps) {
  const appLanguage = getAppLanguage();

  const [activeFilter, setActiveFilter] = useState<RewardFilter>('all');
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

  const activeStaffAccounts = useMemo(
    () => roleAccounts.filter((account) => account.status === 'Active'),
    [roleAccounts]
  );
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
      }))
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
      tr('成交佣金', 'Deal Commission', 'Komisen Jualan'),
      tr(
        'Finance Deal 是唯一事实来源。补库存时佣金留空，就按「佣金分级」用 Sales 当月成交额自动算;填了金额就用填的，系统不会改写。',
        'Finance Deal is the source of truth. Leave Commission blank at Add stock and it follows the Commission Tiers on the Sales\' monthly total; a typed amount is kept as typed.',
        'Finance Deal ialah sumber utama. Biarkan Komisen kosong semasa Tambah stok dan ia mengikut Tahap Komisen berdasarkan jumlah bulanan Sales; amaun yang ditaip kekal seperti ditaip.'
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
  // Embedded mode shows only the Deal commission lifecycle: Deal Commission,
  // Commission Status, Earning Month.
  const visibleRules = embedded ? rules.slice(1, 4) : rules;
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
          <h2 className="text-title-2 text-slate-900">{tr('佣金与奖励', 'Commission & Rewards', 'Komisen & Ganjaran')}</h2>
          <p className="max-w-3xl text-footnote font-normal leading-relaxed text-slate-500">
            {tr(
              '成交佣金直接读取 Finance Deal 状态；其他奖励按各自规则计算。',
              'Deal commission reads directly from Finance Deal status; other rewards follow their own rules.',
              'Komisen jualan dibaca terus daripada status Finance Deal; ganjaran lain mengikut peraturan masing-masing.'
            )}
          </p>
        </div>
        <span className="inline-flex self-start rounded-full bg-brand px-3 py-1.5 text-micro uppercase text-white">
          {canViewAllRewards
            ? tr('全员收入视图', 'All Staff View', 'Paparan Semua Kakitangan')
            : tr(`${currentStaffName} 的收入`, `${currentStaffName}'s Earnings`, `Pendapatan ${currentStaffName}`)}
        </span>
      </section>
      )}

      {(
        <section className="flex flex-wrap items-center gap-2 rounded-card border border-slate-100 bg-white p-1.5 shadow-e1">
          <span className="px-2 text-micro uppercase text-slate-400">{tr('结算月份', 'Settlement Month', 'Bulan Penyelesaian')}</span>
          {[
            ['current', tr('本月', 'This Month', 'Bulan Ini')],
            ['last', tr('上月', 'Last Month', 'Bulan Lepas')]
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPayoutMonthKey(key)}
              className={`rounded-control px-3 py-1.5 text-footnote font-bold transition-colors ${
                payoutMonthKey === key
                  ? 'bg-brand text-white'
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
            className="rounded-control border border-slate-100 bg-slate-50 px-2 py-1.5 text-footnote text-slate-600 outline-none focus:bg-white"
            aria-label={tr('选择结算月份', 'Select settlement month', 'Pilih bulan penyelesaian')}
          />
          {canManageSnapshots && (
            <div className="ml-auto flex items-center gap-2">
              {monthSnapshot ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-micro tracking-normal text-emerald-600 ring-1 ring-emerald-100" title={tr(`生成于 ${new Date(monthSnapshot.generated_at).toLocaleString(getAppLocale())} · ${monthSnapshot.generated_by}`, `Generated ${new Date(monthSnapshot.generated_at).toLocaleString(getAppLocale())} · ${monthSnapshot.generated_by}`, `Dijana ${new Date(monthSnapshot.generated_at).toLocaleString(getAppLocale())} · ${monthSnapshot.generated_by}`)}>
                  {tr('已存快照', 'Snapshot Saved', 'Snapshot Disimpan')}
                </span>
              ) : !isPayoutCurrentMonth ? (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-micro tracking-normal text-amber-600 ring-1 ring-amber-100">
                  {tr('该月未存档', 'Month Not Archived', 'Bulan Belum Diarkib')}
                </span>
              ) : null}
              <button
                type="button"
                onClick={handleSaveMonthlySnapshot}
                disabled={isSavingSnapshot}
                className="rounded-control bg-brand px-3 py-1.5 text-caption font-semibold text-white transition-colors hover:bg-brand-deep disabled:bg-slate-200 disabled:text-slate-400"
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

      {!embedded && (
        <section data-testid="commission-summary-cards" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {summaryCards.map(([label, value, hint, icon, className]) => (
          <div key={label as string} className="rounded-card border border-slate-100 bg-white p-4 shadow-e1">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-card ${className as string}`}>
              {icon}
            </div>
            <p className="text-micro uppercase text-slate-400">{label}</p>
            <p className="mt-1 text-title-2 text-slate-900 tabular-nums">{value}</p>
            <p className="mt-1 truncate text-caption text-slate-400" title={hint as string}>{hint}</p>
          </div>
        ))}
        </section>
      )}

      {(
        <section className="flex flex-wrap items-center gap-2">
        {canViewAllRewards && (
          <div className="mr-2 flex gap-1 rounded-card bg-slate-100 p-1">
            {[
              ['detail', tr('明细', 'Details', 'Butiran')],
              ['byStaff', tr('按员工汇总', 'By Staff', 'Mengikut Kakitangan')]
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPayoutViewMode(key as 'detail' | 'byStaff')}
                className={`rounded-control px-3 py-1.5 text-footnote font-bold transition-colors ${
                  payoutViewMode === key ? 'bg-white text-slate-900 shadow-e1' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {payoutViewMode === 'detail' && FILTERS.filter((filter) => filter !== 'tiers' || Boolean(tiersPanel)).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`inline-flex items-center gap-2 rounded-control px-3 py-2 text-footnote font-bold transition-colors ${
              activeFilter === filter
                ? 'bg-brand text-white'
                : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {getRewardFilterLabel(filter, embedded)}
          </button>
        ))}
        </section>
      )}

      {payoutViewMode === 'byStaff' && (
        <section className="overflow-hidden rounded-card border border-slate-100 bg-white shadow-e1">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
            <p className="text-footnote font-bold text-slate-900">
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
              {copySummaryMessage && <span className="text-micro tracking-normal text-emerald-600">{copySummaryMessage}</span>}
              <button
                type="button"
                onClick={handleCopyStaffSummary}
                className="rounded-control bg-brand px-3 py-1.5 text-caption font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                {tr('复制汇总', 'Copy Summary', 'Salin Ringkasan')}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-body">
              <thead className="border-b border-slate-300 bg-slate-200/95 text-micro uppercase text-slate-700">
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
                    <td className="px-5 py-3 text-footnote font-bold text-slate-800">{row.staffName}</td>
                    <td className="px-5 py-3 text-right font-mono text-footnote text-slate-600 tabular-nums">{formatMoney(row.estimated)}</td>
                    <td className="px-5 py-3 text-right font-mono text-footnote text-indigo-600 tabular-nums">{formatMoney(row.earned)}</td>
                    {!embedded && <td className="px-5 py-3 text-right font-mono text-footnote text-amber-600 tabular-nums">{formatMoney(row.pending)}</td>}
                    <td className="px-5 py-3 text-right font-mono text-footnote text-amber-700 tabular-nums">{formatMoney(row.payable)}</td>
                    <td className="px-5 py-3 text-right font-mono text-footnote text-emerald-600 tabular-nums">{formatMoney(row.paid)}</td>
                    <td className="px-5 py-3 text-right font-mono text-footnote text-rose-600 tabular-nums">{formatMoney(row.reversed)}</td>
                    <td className="px-5 py-3 text-right font-mono text-footnote font-bold text-slate-900 tabular-nums">{formatMoney(row.total)}</td>
                    <td className="px-5 py-3 text-right font-mono text-footnote text-slate-400">{row.count}</td>
                  </tr>
                ))}
                {staffSummaries.length === 0 && (
                  <tr>
                    <td colSpan={embedded ? 8 : 9} className="px-5 py-10 text-center text-footnote text-slate-400">
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

      {payoutViewMode === 'detail' && (activeFilter === 'tiers' ? (
        // Owner 2026-10-24: the tiers get their own button instead of hiding under Status Guide.
        <section className="max-w-3xl">{tiersPanel}</section>
      ) : activeFilter === 'rules' ? (
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visibleRules.map(([title, body]) => (
            <article key={title} className="rounded-card border border-slate-100 bg-white p-5 shadow-e1">
              <p className="text-headline text-slate-900">{title}</p>
              <p className="mt-2 text-footnote leading-relaxed text-slate-500">{body}</p>
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
              <article key={row.id} className="min-h-[184px] rounded-card border border-slate-100 bg-white p-4 shadow-e1">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-card ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-micro uppercase text-slate-500">{getRewardTypeLabel(row.type)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-micro uppercase ring-1 ${STATUS_STYLE[row.status]}`}>{getRewardStatusLabel(row.status)}</span>
                    </div>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-headline text-slate-900">{row.title}</h3>
                        <p className="mt-1 text-footnote text-slate-500">{row.staffName} · {row.metric}</p>
                      </div>
                      <p className="shrink-0 text-title-3 text-slate-900">{formatMoney(row.amount)}</p>
                    </div>
                    <p className="mt-2 line-clamp-2 text-footnote leading-relaxed text-slate-500">{row.context}</p>
                    <p className="mt-2 text-micro uppercase text-slate-400">{row.rule}</p>
                    <button
                      type="button"
                      onClick={row.onOpen}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-control bg-brand px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-brand-deep"
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
            <div className="col-span-full rounded-card border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <BadgeDollarSign className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-headline text-slate-800">{tr('这个视图暂时没有佣金明细', 'No commission entries in this view', 'Tiada entri komisen dalam paparan ini')}</p>
              <p className="mt-1 text-footnote text-slate-400">{tr('交车、完成财务或记录付款后，明细会出现在这里。', 'Entries appear here after delivery, Finance Completed, or payment is recorded.', 'Entri akan muncul selepas serahan, Finance Completed atau bayaran direkodkan.')}</p>
            </div>
          )}
          </div>
        </section>
      ))}
    </div>
  );
}
