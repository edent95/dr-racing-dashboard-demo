/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { BadgeDollarSign, CheckCircle2, Clock3, FileCheck2, HeartPulse, ShieldCheck, Sparkles, UploadCloud, XCircle } from 'lucide-react';
import { ApprovalRequest, ApprovalRequestStatus, ApprovalRequestType, CustomMission, LoanApplication, RoleAccount, RoleAccountRole } from '../types';
import { getAppLocale, tr } from '../lib/i18n';
import SafeAttachmentLink from './SafeAttachmentLink';
import { ATTACHMENT_ACCEPT_ATTRIBUTE, isSafeAttachmentDataUrl } from '../utils/attachmentSafety';
import approvalOverviewIcon from '../assets/icons/nav/approvalOverview.png';
import approvedIcon from '../assets/icons/nav/approved.png';
import pendingIcon from '../assets/icons/nav/pending.png';
import rejectedIcon from '../assets/icons/nav/rejected.png';
import { useBrandedDialog } from './BrandedDialogProvider';

type ApprovalDraft = {
  type: ApprovalRequestType;
  target_id: string;
  target_label: string;
  amount: string;
  reason: string;
  notes: string;
  mc_attachment?: ApprovalRequest['mc_attachment'];
};

const APPROVAL_TYPE_CONFIG: Record<ApprovalRequestType, {
  label: string;
  helper: string;
  targetType: ApprovalRequest['target_type'];
  approverRoles: RoleAccountRole[];
  icon: React.ReactNode;
}> = {
  sales_discount_request: {
    label: 'Sales discount',
    helper: 'Sales asks management to approve a customer discount.',
    targetType: 'customer',
    approverRoles: ['Admin', 'Super Admin'],
    icon: <BadgeDollarSign className="h-4 w-4" />
  },
  special_loan_case: {
    label: 'Special loan case',
    helper: 'Admin approval for an exception loan case.',
    targetType: 'customer',
    approverRoles: ['Admin', 'Super Admin'],
    icon: <FileCheck2 className="h-4 w-4" />
  },
  cash_discount: {
    label: 'Cash discount',
    helper: 'Super Admin approval for cash purchase discount.',
    targetType: 'customer',
    approverRoles: ['Super Admin'],
    icon: <ShieldCheck className="h-4 w-4" />
  },
  extra_commission: {
    label: 'Extra commission',
    helper: 'Super Admin approval for extra staff commission.',
    targetType: 'general',
    approverRoles: ['Super Admin'],
    icon: <Sparkles className="h-4 w-4" />
  },
  mission_reward: {
    label: 'Mission reward',
    helper: 'Approve payout for completed custom mission reward.',
    targetType: 'mission',
    approverRoles: ['Super Admin'],
    icon: <CheckCircle2 className="h-4 w-4" />
  },
  staff_sick_leave: {
    label: 'Sick leave',
    helper: 'Staff submits MC or urgent sick leave for Admin approval.',
    targetType: 'general',
    approverRoles: ['Admin', 'Super Admin'],
    icon: <HeartPulse className="h-4 w-4" />
  }
};

const APPROVAL_TYPE_COPY: Record<ApprovalRequestType, {
  zhLabel: string;
  enLabel: string;
  msLabel: string;
  zhHelper: string;
  enHelper: string;
  msHelper: string;
}> = {
  sales_discount_request: {
    zhLabel: '销售折扣',
    enLabel: 'Sales discount',
    msLabel: 'Diskaun jualan',
    zhHelper: 'Sales 向管理层申请客户折扣审批。',
    enHelper: 'Sales asks management to approve a customer discount.',
    msHelper: 'Jualan memohon kelulusan pengurusan untuk diskaun pelanggan.'
  },
  special_loan_case: {
    zhLabel: '特殊贷款个案',
    enLabel: 'Special loan case',
    msLabel: 'Kes pinjaman khas',
    zhHelper: '特殊贷款个案需要 Admin 审批。',
    enHelper: 'Admin approval for an exception loan case.',
    msHelper: 'Kelulusan Admin diperlukan untuk kes pinjaman khas.'
  },
  cash_discount: {
    zhLabel: '现金折扣',
    enLabel: 'Cash discount',
    msLabel: 'Diskaun tunai',
    zhHelper: '现金购车折扣需要 Super Admin 审批。',
    enHelper: 'Super Admin approval for cash purchase discount.',
    msHelper: 'Kelulusan Super Admin diperlukan untuk diskaun pembelian tunai.'
  },
  extra_commission: {
    zhLabel: '额外佣金',
    enLabel: 'Extra commission',
    msLabel: 'Komisen tambahan',
    zhHelper: '额外员工佣金需要 Super Admin 审批。',
    enHelper: 'Super Admin approval for extra staff commission.',
    msHelper: 'Kelulusan Super Admin diperlukan untuk komisen tambahan kakitangan.'
  },
  mission_reward: {
    zhLabel: '任务奖励',
    enLabel: 'Mission reward',
    msLabel: 'Ganjaran misi',
    zhHelper: '提交已完成 custom mission 的奖励发放审批。',
    enHelper: 'Approve payout for completed custom mission reward.',
    msHelper: 'Luluskan bayaran ganjaran bagi misi tersuai yang telah selesai.'
  },
  staff_sick_leave: {
    zhLabel: '病假申请',
    enLabel: 'Sick leave',
    msLabel: 'Cuti sakit',
    zhHelper: '员工提交 MC 或紧急病假给 Admin 审批。',
    enHelper: 'Staff submits MC or urgent sick leave for Admin approval.',
    msHelper: 'Kakitangan menghantar MC atau cuti sakit kecemasan untuk kelulusan Admin.'
  }
};

const APPROVAL_STATUS_COPY: Record<ApprovalRequestStatus, { zh: string; en: string; ms: string }> = {
  Pending: { zh: '待审批', en: 'Pending', ms: 'Menunggu' },
  Approved: { zh: '已批准', en: 'Approved', ms: 'Diluluskan' },
  Rejected: { zh: '已拒绝', en: 'Rejected', ms: 'Ditolak' },
  Cancelled: { zh: '已取消', en: 'Cancelled', ms: 'Dibatalkan' }
};

const STATUS_CONFIG: Record<ApprovalRequestStatus, { label: string; className: string }> = {
  Pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
  },
  Approved: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
  },
  Rejected: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
  }
};

const FILTERS: Array<'active' | 'mine' | 'all' | ApprovalRequestStatus> = ['active', 'mine', 'all', 'Pending', 'Approved', 'Rejected'];

const TARGET_MODEL_COLORS = [
  'bg-indigo-50 text-indigo-700 ring-indigo-100',
  'bg-cyan-50 text-cyan-700 ring-cyan-100',
  'bg-violet-50 text-violet-700 ring-violet-100',
  'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'bg-rose-50 text-rose-700 ring-rose-100',
  'bg-slate-100 text-slate-700 ring-slate-200'
];

const LOAN_STATUS_CHIP_CLASSES: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700 ring-blue-100',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-100',
  'IN PROCESS': 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  APPROVE: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  REJECT: 'bg-rose-50 text-rose-700 ring-rose-100',
  'FOLLOW UP': 'bg-purple-50 text-purple-700 ring-purple-100',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-200',
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Archived: 'bg-slate-100 text-slate-600 ring-slate-200'
};

const STAT_CARD_CONFIG: Record<'Pending' | 'Approved' | 'Rejected' | 'Mine', {
  tone: string;
  iconSrc: string;
  bar: string;
}> = {
  Pending: {
    tone: 'border-amber-100 bg-amber-50/35',
    iconSrc: pendingIcon,
    bar: 'bg-amber-400'
  },
  Approved: {
    tone: 'border-emerald-100 bg-emerald-50/35',
    iconSrc: approvedIcon,
    bar: 'bg-emerald-500'
  },
  Rejected: {
    tone: 'border-rose-100 bg-rose-50/35',
    iconSrc: rejectedIcon,
    bar: 'bg-rose-500'
  },
  Mine: {
    tone: 'border-indigo-100 bg-indigo-50/35',
    iconSrc: approvalOverviewIcon,
    bar: 'bg-indigo-500'
  }
};

function createDefaultDraft(): ApprovalDraft {
  return {
    type: 'sales_discount_request',
    target_id: '',
    target_label: '',
    amount: '',
    reason: '',
    notes: '',
    mc_attachment: undefined
  };
}

function getStableColorClass(value: string) {
  const charTotal = value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TARGET_MODEL_COLORS[charTotal % TARGET_MODEL_COLORS.length];
}

function getTargetStatusClass(status: string) {
  return LOAN_STATUS_CHIP_CLASSES[status] || 'bg-slate-100 text-slate-600 ring-slate-200';
}

function getApprovalTypeLabel(type: ApprovalRequestType) {
  const copy = APPROVAL_TYPE_COPY[type];
  return tr(copy.zhLabel, copy.enLabel, copy.msLabel);
}

function getApprovalTypeHelper(type: ApprovalRequestType) {
  const copy = APPROVAL_TYPE_COPY[type];
  return tr(copy.zhHelper, copy.enHelper, copy.msHelper);
}

function getApprovalStatusLabel(status: ApprovalRequestStatus) {
  const copy = APPROVAL_STATUS_COPY[status];
  return tr(copy.zh, copy.en, copy.ms);
}

function getApprovalFilterLabel(filter: typeof FILTERS[number]) {
  if (filter === 'active') return tr('处理中', 'Active', "Aktif");
  if (filter === 'mine') return tr('我的', 'Mine', "Milik Saya");
  if (filter === 'all') return tr('全部', 'All', "Semua");
  return getApprovalStatusLabel(filter);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(getAppLocale(), {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} B`;
}

function normalizeDayInput(value: string) {
  const sanitized = value.replace(/[^\d.]/g, '');
  const [whole, decimal = ''] = sanitized.split('.');
  const normalizedDecimal = decimal.slice(0, 1);
  return normalizedDecimal ? `${whole || '0'}.${normalizedDecimal}` : whole;
}

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

function isReviewer(request: ApprovalRequest, currentRole: RoleAccountRole) {
  return request.approver_roles.includes(currentRole);
}

interface ApprovalWorkflowPageProps {
  requests: ApprovalRequest[];
  applications: LoanApplication[];
  customMissions: CustomMission[];
  roleAccounts: RoleAccount[];
  currentStaffName: string;
  currentStaffRole: RoleAccountRole;
  canViewAllApprovals: boolean;
  onAddRequest: (request: Omit<ApprovalRequest, 'id' | 'status' | 'requester_name' | 'requester_role' | 'submitted_at' | 'reviewed_by' | 'reviewed_role' | 'reviewed_at' | 'review_note'>) => void;
  onReviewRequest: (id: string, status: Extract<ApprovalRequestStatus, 'Approved' | 'Rejected' | 'Cancelled'>, reviewNote: string) => void;
  presetFilter?: 'active' | 'mine';
  presetToken?: number;
}

export default function ApprovalWorkflowPage({
  requests,
  applications,
  customMissions,
  roleAccounts,
  currentStaffName,
  currentStaffRole,
  canViewAllApprovals,
  onAddRequest,
  onReviewRequest,
  presetFilter = 'active',
  presetToken = 0
}: ApprovalWorkflowPageProps) {
  const { showAlert } = useBrandedDialog();
  const [draft, setDraft] = useState<ApprovalDraft>(() => createDefaultDraft());
  const [filter, setFilter] = useState<typeof FILTERS[number]>('active');

  // Deep-link support: pages like 佣金与奖励 can jump here with a preset
  // filter (e.g. "mine" for Sales) so users land on their own approvals.
  useEffect(() => {
    if (presetToken) {
      setFilter(presetFilter);
    }
  }, [presetFilter, presetToken]);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [isUploadingMc, setIsUploadingMc] = useState(false);

  const selectedConfig = APPROVAL_TYPE_CONFIG[draft.type];
  const isSickLeave = draft.type === 'staff_sick_leave';
  const amountLabel = isSickLeave ? tr('天数', 'Days', "hari-hari") : tr('金额', 'Amount', "Jumlah");
  const amountPlaceholder = isSickLeave ? '0.5' : '0';
  const currentStaffAccount = useMemo(() => (
    roleAccounts.find((account) => account.name === currentStaffName)
  ), [currentStaffName, roleAccounts]);
  const selfStaffTargetId = currentStaffAccount?.id || currentStaffName;
  const selfStaffTargetLabel = currentStaffAccount?.name || currentStaffName;
  const targetSuggestions = useMemo(() => {
    if (selectedConfig.targetType === 'mission') {
      return customMissions.slice(0, 6).map((mission) => ({
        id: mission.id,
        label: mission.title,
        status: mission.status,
        statusClass: getTargetStatusClass(mission.status),
        modelLabel: tr(`${formatMoney(mission.reward_amount)} 奖励`, `${formatMoney(mission.reward_amount)} reward`, `${formatMoney(mission.reward_amount)} ganjaran`),
        modelClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        detail: tr('任务', 'Mission', "Misi")
      }));
    }

    if (selectedConfig.targetType === 'customer') {
      return applications.slice(0, 6).map((application) => ({
        id: application.id,
        label: application.applicant_name,
        status: application.status,
        statusClass: getTargetStatusClass(application.status),
        modelLabel: application.vehicle_model || tr('没有车型', 'No model', "Tiada model"),
        modelClass: getStableColorClass(application.vehicle_model || application.id),
        detail: application.vehicle_brand || tr('车辆', 'Vehicle', "kenderaan")
      }));
    }

    return [];
  }, [applications, customMissions, selectedConfig.targetType]);

  const visibleRequests = useMemo(() => {
    const scopedRequests = canViewAllApprovals
      ? requests
      : requests.filter((request) => request.requester_name === currentStaffName || isReviewer(request, currentStaffRole));

    return scopedRequests
      .filter((request) => {
        if (filter === 'active') {
          return request.status === 'Pending';
        }

        if (filter === 'mine') {
          return request.requester_name === currentStaffName;
        }

        if (filter === 'all') {
          return true;
        }

        return request.status === filter;
      })
      .sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      });
  }, [canViewAllApprovals, currentStaffName, currentStaffRole, filter, requests]);

  const stats = useMemo(() => ({
    pending: requests.filter((request) => request.status === 'Pending').length,
    approved: requests.filter((request) => request.status === 'Approved').length,
    rejected: requests.filter((request) => request.status === 'Rejected').length,
    myRequests: requests.filter((request) => request.requester_name === currentStaffName).length
  }), [currentStaffName, requests]);

  const numericAmount = Number(draft.amount);
  const canSubmit = draft.reason.trim().length > 0
    && !isUploadingMc
    && (isSickLeave ? numericAmount >= 0.5 && Boolean(selfStaffTargetId) : numericAmount >= 0);

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    const targetId = isSickLeave ? selfStaffTargetId : draft.target_id.trim();
    const targetLabel = isSickLeave
      ? selfStaffTargetLabel
      : draft.target_label.trim() || draft.target_id.trim() || getApprovalTypeLabel(draft.type);

    onAddRequest({
      type: draft.type,
      approver_roles: selectedConfig.approverRoles,
      target_type: selectedConfig.targetType,
      target_id: targetId,
      target_label: targetLabel,
      amount: Math.max(numericAmount || 0, 0),
      reason: draft.reason.trim(),
      notes: draft.notes.trim(),
      ...(draft.mc_attachment ? { mc_attachment: draft.mc_attachment } : {})
    });
    setDraft(createDefaultDraft());
  };

  return (
    <div id="approval-workflow-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('审批流程', 'Approval Workflow', "Aliran Kerja Kelulusan")}</h2>
          <p className="max-w-2xl text-xs font-light leading-relaxed text-slate-500">
            {tr('销售折扣、特殊贷款个案、现金折扣、额外佣金和任务奖励审批都集中在这里。', 'Sales discount, special loan case, cash discount, extra commission, and mission reward approval are centralized here.', "Diskaun jualan, kes pinjaman khas, diskaun tunai, komisen tambahan, dan kelulusan ganjaran misi dipusatkan di sini.")}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Pending', getApprovalStatusLabel('Pending'), stats.pending, tr('需要处理', 'Need action', "Perlu tindakan")],
          ['Approved', getApprovalStatusLabel('Approved'), stats.approved, tr('已完成', 'Completed', "Selesai")],
          ['Rejected', getApprovalStatusLabel('Rejected'), stats.rejected, tr('已拒绝', 'Declined', "ditolak")],
          ['Mine', tr('我的', 'Mine', "Milik Saya"), stats.myRequests, tr('由我提交', 'Submitted by me', "Dihantar oleh saya")]
        ].map(([key, label, value, helper]) => {
          const config = STAT_CARD_CONFIG[key as keyof typeof STAT_CARD_CONFIG];

          return (
            <div key={key as string} className={`relative overflow-hidden rounded-xl border p-4 shadow-sm ${config.tone}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-400">{helper}</p>
                </div>
                <img src={config.iconSrc} alt="" aria-hidden="true" className="h-12 w-12 shrink-0 object-contain" />
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/80">
                <div className={`h-full w-1/2 rounded-full ${config.bar}`} />
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-900">{tr('新审批申请', 'New Approval Request', "Permintaan Kelulusan Baharu")}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{tr('用系统申请取代只在聊天里确认的审批。', 'Use one controlled request instead of chat-only approval.', "Gunakan satu permintaan terkawal dan bukannya kelulusan sembang sahaja.")}</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('申请类型', 'Request Type', "Jenis Permintaan")}</p>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(APPROVAL_TYPE_CONFIG) as ApprovalRequestType[]).map((type) => {
                  const config = APPROVAL_TYPE_CONFIG[type];
                  const active = draft.type === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, type, target_id: '', target_label: '', mc_attachment: type === 'staff_sick_leave' ? current.mc_attachment : undefined }))}
                      className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                        active
                          ? 'border-red-800 bg-red-800 text-white'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-100 hover:bg-indigo-50'
                      }`}
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-white/10 text-white' : 'bg-white text-slate-500'}`}>
                        {config.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold">{getApprovalTypeLabel(type)}</span>
                        <span className={`mt-1 block text-[10px] leading-relaxed ${active ? 'text-white/70' : 'text-slate-400'}`}>
                          {getApprovalTypeHelper(type)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!isSickLeave && targetSuggestions.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {tr('关联对象', 'Link target', "Sasaran pautan")}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {targetSuggestions.map((item) => {
                    const active = draft.target_id === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDraft((current) => ({ ...current, target_id: item.id, target_label: item.label }))}
                        className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                          active
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                            : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block truncate text-[11px] font-bold">{item.label}</span>
                        <span className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${item.statusClass}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {item.status}
                          </span>
                          <span className={`inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ring-1 ${item.modelClass}`}>
                            <span className="h-2 w-2 shrink-0 rotate-45 rounded-[2px] bg-current" />
                            <span className="truncate">{item.modelLabel}</span>
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-[10px] font-semibold text-slate-400">{item.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!isSickLeave && (
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('对象名称', 'Target label', "Label sasaran")}</span>
                <input
                  value={draft.target_label}
                  onChange={(event) => setDraft((current) => ({ ...current, target_label: event.target.value }))}
                  placeholder={tr('客户 / 任务 / 员工名称', 'Customer / mission / staff name', "Nama pelanggan / misi / kakitangan")}
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{amountLabel}</span>
              <input
                value={draft.amount}
                onChange={(event) => setDraft((current) => ({ ...current, amount: isSickLeave ? normalizeDayInput(event.target.value) : event.target.value.replace(/[^\d.]/g, '') }))}
                placeholder={amountPlaceholder}
                type={isSickLeave ? 'number' : 'text'}
                min={isSickLeave ? 0.5 : undefined}
                step={isSickLeave ? 0.5 : undefined}
                inputMode="decimal"
                className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
              />
            </label>

            {isSickLeave && (
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 1.5, 2].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, amount: String(days) }))}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                      Number(draft.amount) === days
                        ? 'bg-red-800 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            )}

            {isSickLeave && (
              <div>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('上传 MC', 'Upload MC', "Muat naik MC")}</span>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500">
                    <UploadCloud className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-slate-700">
                      {draft.mc_attachment?.name || tr('选择 MC 文件', 'Choose MC file', "Pilih fail MC")}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-400">
                      {draft.mc_attachment ? `${draft.mc_attachment.type || 'file'} · ${formatFileSize(draft.mc_attachment.size)}` : tr('诊所 PDF 或图片', 'PDF or image from clinic', "PDF atau imej dari klinik")}
                    </span>
                  </span>
                  <input
                    type="file"
                    accept={ATTACHMENT_ACCEPT_ATTRIBUTE}
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.currentTarget.files?.[0];
                      event.currentTarget.value = '';

                      if (!file) {
                        return;
                      }

                      setIsUploadingMc(true);

                      try {
                        const fileDataUrl = await readFileAsDataUrl(file);

                        // SECURITY: only allow-listed, non-scriptable data URLs
                        // may be stored; the stored value is later rendered as a
                        // download link in a privileged browser context.
                        if (!isSafeAttachmentDataUrl(fileDataUrl, file.type)) {
                          await showAlert({
                            eyebrow: tr('MC 文件', 'MC Document', 'Dokumen MC'),
                            title: tr('不支持这个文件格式', 'Unsupported file type', 'Jenis fail tidak disokong'),
                            message: tr('MC 只接受 PDF 或图片（不支持 SVG）。', 'MC accepts PDF or image files only (SVG is not supported).', "MC hanya menerima fail PDF atau imej (SVG tidak disokong)."),
                            tone: 'warning'
                          });
                          return;
                        }

                        setDraft((current) => ({
                          ...current,
                          mc_attachment: {
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            uploaded_at: new Date().toISOString(),
                            file_data_url: fileDataUrl
                          }
                        }));
                      } catch {
                        await showAlert({
                          eyebrow: tr('MC 文件', 'MC Document', 'Dokumen MC'),
                          title: tr('MC 上传失败', 'MC upload failed', 'Muat naik MC gagal'),
                          message: tr('请换一个文件再试。', 'Please try another file.', 'Sila cuba fail lain.'),
                          tone: 'danger'
                        });
                      } finally {
                        setIsUploadingMc(false);
                      }
                    }}
                  />
                </label>
                {isUploadingMc && (
                  <p className="mt-1.5 text-[10px] font-semibold text-slate-400">{tr('正在上传 MC...', 'Uploading MC...', "Memuat naik MC...")}</p>
                )}
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('原因', 'Reason', "Sebab")}</span>
              <textarea
                value={draft.reason}
                onChange={(event) => setDraft((current) => ({ ...current, reason: event.target.value }))}
                placeholder={tr('为什么这个需要批准？', 'Why should this be approved?', "Mengapa ini perlu diluluskan?")}
                className="min-h-24 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('备注', 'Notes', "Nota")}</span>
              <textarea
                value={draft.notes}
                onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                placeholder={tr('可选内部备注', 'Optional internal note', "Nota dalaman pilihan")}
                className="min-h-20 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
              />
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-800 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-red-900 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Clock3 className="h-4 w-4" />
              {tr('提交审批', 'Submit for approval', "Hantar untuk kelulusan")}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                  filter === item
                    ? 'bg-red-800 text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {getApprovalFilterLabel(item)}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {visibleRequests.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <ShieldCheck className="h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-800">{tr('没有审批申请', 'No approval request', "Tiada permintaan kelulusan")}</p>
                <p className="mt-1 text-xs text-slate-400">{tr('当前筛选没有申请。', 'Current filter has no request.', "Penapis semasa tiada permintaan.")}</p>
              </div>
            ) : (
              visibleRequests.map((request) => {
                const status = STATUS_CONFIG[request.status];
                const canReview = request.status === 'Pending' && isReviewer(request, currentStaffRole);
                const canCancel = request.status === 'Pending' && request.requester_name === currentStaffName;
                const reviewNote = reviewNotes[request.id] || '';

                return (
                  <article key={request.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${status.className}`}>{getApprovalStatusLabel(request.status)}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{getApprovalTypeLabel(request.type)}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{formatDateTime(request.submitted_at)}</span>
                        </div>
                        <h3 className="mt-3 text-sm font-bold text-slate-900">{request.target_label || getApprovalTypeLabel(request.type)}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{request.reason}</p>
                      </div>
                      <div className="shrink-0 text-left lg:text-right">
                        <p className="text-2xl font-bold text-slate-900">
                          {request.type === 'staff_sick_leave' ? tr(`${request.amount || 0} 天`, `${request.amount || 0} days`, `${request.amount || 0} hari`) : formatMoney(request.amount)}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                          {request.type === 'staff_sick_leave' ? tr('请假时长', 'Leave duration', "Tempoh cuti") : tr('申请金额', 'Requested amount', "Jumlah yang diminta")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-[11px] md:grid-cols-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="font-bold uppercase tracking-wider text-slate-400">{tr('申请人', 'Requester', "Peminta")}</p>
                        <p className="mt-1 font-bold text-slate-800">{request.requester_name}</p>
                        <p className="text-slate-400">{request.requester_role}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="font-bold uppercase tracking-wider text-slate-400">{tr('审批人', 'Approver', "Pelulus")}</p>
                        <p className="mt-1 font-bold text-slate-800">{request.approver_roles.join(' / ')}</p>
                        <p className="text-slate-400">{request.reviewed_by ? `${request.reviewed_by} · ${formatDateTime(request.reviewed_at || '')}` : tr('等待审核', 'Waiting review', "Menunggu semakan")}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="font-bold uppercase tracking-wider text-slate-400">{request.type === 'staff_sick_leave' ? tr('员工', 'Staff', "Kakitangan") : tr('对象', 'Target', "Sasaran")}</p>
                        <p className="mt-1 truncate font-bold text-slate-800">{request.type === 'staff_sick_leave' ? request.target_label || '--' : request.target_id || '--'}</p>
                        <p className="truncate text-slate-400">{request.target_type}</p>
                      </div>
                    </div>

                    {(request.notes || request.review_note || request.mc_attachment) && (
                      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                        {request.notes && <p><span className="font-bold text-slate-700">{tr('备注：', 'Note:', "Nota:")}</span> {request.notes}</p>}
                        {request.mc_attachment && (
                          <p className="mt-1">
                            <span className="font-bold text-slate-700">{tr('MC：', 'MC:', "MC:")}</span>{' '}
                            <SafeAttachmentLink
                              attachment={request.mc_attachment}
                              className="font-bold text-indigo-600 hover:text-indigo-700"
                              unsafeClassName="font-bold text-slate-400 line-through"
                            >
                              {request.mc_attachment.name}
                            </SafeAttachmentLink>
                            {' · '}
                            {formatFileSize(request.mc_attachment.size)}
                          </p>
                        )}
                        {request.review_note && <p className="mt-1"><span className="font-bold text-slate-700">{tr('审核：', 'Review:', "Semakan:")}</span> {request.review_note}</p>}
                      </div>
                    )}

                    {(canReview || canCancel) && (
                      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                        {canReview && (
                          <textarea
                            value={reviewNote}
                            onChange={(event) => setReviewNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                            placeholder={tr('审核备注', 'Review note', "Nota semakan")}
                            className="min-h-16 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                          />
                        )}
                        <div className="flex flex-wrap gap-2">
                          {canReview && (
                            <>
                              <button
                                type="button"
                                onClick={() => onReviewRequest(request.id, 'Approved', reviewNote)}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {tr('批准', 'Approve', "Luluskan")}
                              </button>
                              <button
                                type="button"
                                onClick={() => onReviewRequest(request.id, 'Rejected', reviewNote)}
                                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700"
                              >
                                <XCircle className="h-4 w-4" />
                                {tr('拒绝', 'Reject', "Tolak")}
                              </button>
                            </>
                          )}
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => onReviewRequest(request.id, 'Cancelled', reviewNote)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                            >
                              {tr('取消申请', 'Cancel request', "Batalkan permintaan")}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
