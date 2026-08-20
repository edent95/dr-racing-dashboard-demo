/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  Landmark,
  Phone,
  Search,
  SlidersHorizontal,
  UserCircle,
  Users
} from 'lucide-react';
import {
  getLoanPendingAction,
  getLoanPendingWith,
  BankDefinition,
  LoanApplication,
  LoanPendingAction,
  LoanStatus,
  RawCustomerLead,
  RoleAccount,
  RoleAccountRole
} from '../types';
import type { AttendanceEvent } from '../services/dashboardRepository';
import { getAppLocale, tr, trBankStatus, trFollowUpStatus, trLoanStatus } from '../lib/i18n';
import { formatMalaysiaPhoneForCopy, normalizeMalaysiaPhoneDigits } from '../utils/malaysiaPhone';
import BankIcon from './BankIcon';
import StaffAvatar from './StaffAvatar';

type MobileTab = 'today' | 'applications' | 'leads' | 'calendar' | 'me';
type ApplicationFilter = 'all' | 'action' | 'pending' | 'approved';
type ApplicationTimeFilter = 'today' | '7d' | '30d' | 'all';
type LeadFilter = 'mine' | 'due' | 'available';

interface MobileAppShellProps {
  applications: LoanApplication[];
  bankDefinitions: BankDefinition[];
  roleAccounts: RoleAccount[];
  rawCustomerLeads: RawCustomerLead[];
  attendanceEvents: AttendanceEvent[];
  currentStaffName: string;
  currentStaffRole: RoleAccountRole;
  currentStaffAvatar?: string;
  unreadNotificationCount: number;
  syncStatus: 'loading' | 'cached' | 'firebase' | 'local' | 'error';
  canViewApplications: boolean;
  canViewLeads: boolean;
  canViewCalendar: boolean;
  canViewAttendance: boolean;
  navigationPage: string;
  calendarContent: React.ReactNode;
  attendanceContent: React.ReactNode;
  preferenceControls: React.ReactNode;
  onOpenNotifications: () => void;
  onOpenApplication: (application: LoanApplication) => void;
  onOpenWhatsApp: (lead: RawCustomerLead, target: 'api' | 'web') => void;
  onUpdateLead: (leadId: string, updates: Partial<RawCustomerLead>) => void;
  onRecordAttendance: (action: AttendanceEvent['action'], note: string) => Promise<boolean>;
  onNavigatePage: (page: 'taskInbox' | 'customers' | 'rawCustomers' | 'calendar' | 'user') => void;
  onLogout: () => void;
}

const ACTIVE_LEAD_STATUSES = new Set(['New', 'Contacted', 'No Reply', 'Interested']);
const CLOSED_APPLICATION_STATUSES = new Set<LoanStatus>([LoanStatus.CANCELLED]);

const APPLICATION_STATUS_STYLES: Record<LoanStatus, string> = {
  [LoanStatus.NEW]: 'bg-blue-50 text-blue-700',
  [LoanStatus.PENDING]: 'bg-amber-50 text-amber-700',
  [LoanStatus.IN_PROCESS]: 'bg-indigo-50 text-indigo-700',
  [LoanStatus.APPROVE]: 'bg-emerald-50 text-emerald-700',
  [LoanStatus.REJECT]: 'bg-rose-50 text-rose-700',
  [LoanStatus.FOLLOW_UP]: 'bg-purple-50 text-purple-700',
  [LoanStatus.CANCELLED]: 'bg-slate-100 text-slate-500'
};

function malaysiaDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) => (
    parts.find((part) => part.type === type)?.value || ''
  );
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}

function formatShortDateTime(value?: string) {
  if (!value) return tr('未安排', 'Not scheduled', 'Belum dijadualkan');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return tr('日期无效', 'Invalid date', 'Tarikh tidak sah');

  return date.toLocaleString(getAppLocale(), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTodayHeading() {
  return new Date().toLocaleDateString(getAppLocale(), {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  });
}

function formatTime(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleTimeString(getAppLocale(), {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return tr('早上好', 'Good morning', 'Selamat pagi');
  if (hour < 18) return tr('下午好', 'Good afternoon', 'Selamat petang');
  return tr('晚上好', 'Good evening', 'Selamat malam');
}

function getRoleWorkspaceLabel(role: RoleAccountRole) {
  if (role === 'Sales') return tr('销售工作台', 'Sales workspace', 'Ruang kerja jualan');
  if (role === 'Admin') return tr('审核工作台', 'Review workspace', 'Ruang kerja semakan');
  return tr('管理工作台', 'Management workspace', 'Ruang kerja pengurusan');
}

function getMobileTabForPage(page: string): MobileTab {
  if (page === 'customers') return 'applications';
  if (page === 'rawCustomers') return 'leads';
  if (page === 'calendar') return 'calendar';
  if (page === 'user' || page === 'attendance') return 'me';
  return 'today';
}

function getPageForMobileTab(tab: MobileTab) {
  if (tab === 'applications') return 'customers' as const;
  if (tab === 'leads') return 'rawCustomers' as const;
  if (tab === 'calendar') return 'calendar' as const;
  if (tab === 'me') return 'user' as const;
  return 'taskInbox' as const;
}

function isApplicationActionForStaff(
  application: LoanApplication,
  staffName: string,
  staffRole: RoleAccountRole
) {
  const pendingWith = getLoanPendingWith(application);
  const pendingAction = getLoanPendingAction(application);

  if (pendingAction === 'None' || CLOSED_APPLICATION_STATUSES.has(application.status)) {
    return false;
  }

  if (staffRole === 'Super Admin' || staffRole === 'Operations Manager') {
    return pendingWith !== 'Closed';
  }

  if (staffRole === 'Sales') {
    return pendingWith === 'Handler' && application.handler_name === staffName;
  }

  return pendingWith === 'Admin' && (
    !application.admin_owner_name || application.admin_owner_name === staffName
  );
}

function MobileSectionHeading({
  title,
  count,
  action
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate text-sm font-bold text-slate-900">{title}</h2>
        {typeof count === 'number' && (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

const getJourneyActionLabel = (action: LoanPendingAction) => {
  const labels: Record<LoanPendingAction, [string, string, string]> = {
    'Complete Application': ['检查并补齐申请', 'Check and complete application', 'Semak dan lengkapkan permohonan'],
    'Review Application': ['检查申请', 'Review application', 'Semak permohonan'],
    'Provide Documents': ['补资料', 'Provide documents', 'Sediakan dokumen'],
    'Submit to Bank': ['提交银行', 'Submit to bank', 'Hantar ke bank'],
    'Follow Up Bank': ['跟进银行', 'Follow up bank', 'Susulan bank'],
    'Choose Close or Resubmit': ['选择结案或重提', 'Close or resubmit', 'Tutup atau hantar semula'],
    'Resubmit to Bank': ['重新提交银行', 'Resubmit to bank', 'Hantar semula ke bank'],
    'Contact Approved Customer': ['联系已批准客户', 'Contact approved customer', 'Hubungi pelanggan diluluskan'],
    None: ['无待办', 'No action', 'Tiada tindakan']
  };
  return tr(...labels[action]);
};

function MobileApplicationJourney({ application }: { application: LoanApplication }) {
  const pendingWith = getLoanPendingWith(application);
  const pendingAction = getLoanPendingAction(application);
  const isCash = application.purchase_method === 'Cash';
  const dealFinance = application.deal_finance;
  const latestBank = [...(application.bank_applications || [])].sort((left, right) => (
    new Date(right.submitted_at || right.decision_at || 0).getTime()
    - new Date(left.submitted_at || left.decision_at || 0).getTime()
    || (right.round_no || 0) - (left.round_no || 0)
  ))[0];
  const loanCurrentIndex = pendingWith === 'Closed'
    || pendingAction === 'Choose Close or Resubmit'
    || pendingAction === 'Contact Approved Customer'
    ? 4
    : pendingWith === 'Bank' || application.status === LoanStatus.IN_PROCESS
      ? 3
      : pendingWith === 'Admin' && (pendingAction === 'Submit to Bank' || pendingAction === 'Resubmit to Bank')
        ? 2
        : 1;
  const cashCancelled = dealFinance?.sale_status === 'Cancelled'
    || [LoanStatus.REJECT, LoanStatus.CANCELLED].includes(application.status);
  const cashCompleted = Boolean(dealFinance?.finance_completed_at);
  const cashCustomerAccepted = dealFinance?.sale_status === 'Customer Accepted'
    || (pendingWith === 'Closed' && application.status === LoanStatus.APPROVE);
  const cashCurrentIndex = cashCancelled || cashCompleted || dealFinance?.sale_status === 'Bike Delivered'
    ? 4
    : cashCustomerAccepted
      ? 3
      : application.status === LoanStatus.APPROVE || dealFinance?.sale_status === 'Pending Acceptance'
        ? 2
        : 1;
  const currentIndex = isCash ? cashCurrentIndex : loanCurrentIndex;
  const steps = isCash
    ? [
        tr('提交', 'Submitted', 'Dihantar'),
        tr('检查', 'Review', 'Semak'),
        tr('接受', 'Accepted', 'Diterima'),
        tr('交车', 'Delivery', 'Serahan'),
        tr('完成', 'Complete', 'Selesai')
      ]
    : [
        tr('Sales 提交', 'Sales Submit', 'Jualan Hantar'),
        tr('缺件检查', 'Docs Check', 'Semak Dokumen'),
        tr('Admin 提交', 'Admin Submit', 'Admin Hantar'),
        tr('银行决定', 'Bank Decision', 'Keputusan Bank'),
        tr('结果', 'Result', 'Keputusan')
      ];
  const loanPendingOwner = pendingWith === 'Admin'
    ? application.admin_owner_name || tr('Admin 团队', 'Admin team', 'Pasukan pentadbir')
    : pendingWith === 'Handler'
      ? application.handler_name
      : pendingWith === 'Bank'
        ? latestBank?.bank_name || tr('银行', 'Bank', 'Bank')
        : tr('已结束', 'Closed', 'Ditutup');
  const cashPendingOwner = cashCancelled || cashCompleted
    ? tr('已结束', 'Closed', 'Ditutup')
    : dealFinance?.sale_status === 'Bike Delivered' || cashCustomerAccepted
      ? tr('Admin 团队', 'Admin team', 'Pasukan pentadbir')
      : application.status === LoanStatus.NEW
        ? application.admin_owner_name || tr('Admin 团队', 'Admin team', 'Pasukan pentadbir')
        : application.handler_name;
  const cashAction = cashCancelled
    ? tr('现金成交已取消', 'Cash sale cancelled', 'Jualan tunai dibatalkan')
    : cashCompleted
      ? tr('现金成交已完成', 'Cash sale completed', 'Jualan tunai selesai')
      : dealFinance?.sale_status === 'Bike Delivered'
        ? tr('完成收款与账目', 'Complete payment and account', 'Lengkapkan bayaran dan akaun')
        : cashCustomerAccepted
          ? tr('安排交车', 'Arrange delivery', 'Aturkan serahan')
          : application.status === LoanStatus.APPROVE || dealFinance?.sale_status === 'Pending Acceptance'
            ? tr('确认客户接受', 'Confirm customer acceptance', 'Sahkan penerimaan pelanggan')
            : tr('检查现金申请', 'Review cash application', 'Semak permohonan tunai');
  const pendingOwner = isCash ? cashPendingOwner : loanPendingOwner;
  const journeyAction = isCash ? cashAction : getJourneyActionLabel(pendingAction);
  const isRejectedResult = isCash
    ? cashCancelled
    : application.status === LoanStatus.REJECT
      || application.status === LoanStatus.CANCELLED
      || (pendingAction === 'Choose Close or Resubmit' && latestBank?.status === 'Rejected');
  const isFinalComplete = isCash ? cashCompleted : pendingWith === 'Closed';
  const isJourneyClosed = isCash ? cashCompleted || cashCancelled : pendingWith === 'Closed';
  const journeyStage = isCash
    ? ['cash-submit', 'cash-review', 'cash-accepted', 'cash-delivery', 'cash-complete'][currentIndex]
    : ['sales-submit', 'missing-doc-check', 'admin-loan-submit', 'bank-decision', 'result'][currentIndex];

  return (
    <div
      className="mt-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
      data-testid="mobile-application-journey"
      data-current-stage={journeyStage}
      data-complete={isJourneyClosed ? 'true' : 'false'}
      aria-label={`${tr('进度', 'Journey', 'Perjalanan')}: ${pendingOwner} · ${journeyAction}`}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
          {tr('进度', 'Journey', 'Perjalanan')}
        </span>
        <span className="truncate text-[9px] font-bold text-slate-500">{pendingOwner}</span>
      </div>
      <div className="mt-2 flex items-start">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex || (index === currentIndex && isFinalComplete);
          const isCurrent = index === currentIndex;
          const nodeClass = isCurrent && isRejectedResult
            ? 'bg-rose-600 text-white ring-rose-100'
            : isComplete
              ? 'bg-emerald-500 text-white ring-emerald-100'
              : isCurrent
                ? 'bg-amber-500 text-white ring-amber-100'
                : 'bg-white text-slate-300 ring-slate-200';

          return (
            <React.Fragment key={step}>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold ring-2 ${nodeClass}`}>
                  {isComplete ? '✓' : index + 1}
                </span>
                <span
                  className={`line-clamp-2 min-h-5 w-full text-center text-[8px] font-bold leading-[10px] ${isCurrent ? 'text-slate-700' : 'text-slate-400'}`}
                  title={step}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <span className={`mt-[9px] h-0.5 w-2 shrink-0 sm:w-3 ${index < currentIndex ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-1.5 truncate text-[9px] font-semibold text-slate-500">{journeyAction}</p>
    </div>
  );
}

export function LoanApplicationCard({
  application,
  bankDefinitions,
  roleAccounts,
  onOpen
}: {
  application: LoanApplication;
  bankDefinitions: BankDefinition[];
  roleAccounts: RoleAccount[];
  onOpen: () => void;
}) {
  const pendingAction = getLoanPendingAction(application);
  const pendingWith = getLoanPendingWith(application);
  const due = application.action_due_at && new Date(application.action_due_at).getTime() <= Date.now();
  const adminOwnerName = application.admin_owner_name || tr('未分配', 'Unassigned', 'Belum ditetapkan');
  const handlerAccount = roleAccounts.find((account) => account.name === application.handler_name);
  const adminOwnerAccount = roleAccounts.find((account) => account.name === application.admin_owner_name);
  const isHandlerPending = pendingWith === 'Handler';
  const isAdminPending = pendingWith === 'Admin' || pendingWith === 'Bank';
  const latestBankApplication = [...(application.bank_applications || [])].sort((left, right) => (
    new Date(right.submitted_at || right.decision_at || right.approved_at || 0).getTime()
    - new Date(left.submitted_at || left.decision_at || left.approved_at || 0).getTime()
    || (right.round_no || 0) - (left.round_no || 0)
  ))[0];
  const bankTone = latestBankApplication?.status === 'Approved'
    ? 'bg-emerald-50 text-emerald-700'
    : latestBankApplication?.status === 'Rejected'
      ? 'bg-rose-50 text-rose-700'
      : latestBankApplication?.status === 'Need More Info'
        ? 'bg-amber-50 text-amber-700'
        : latestBankApplication?.status === 'Cancelled'
          ? 'bg-slate-100 text-slate-500'
          : 'bg-blue-50 text-blue-700';
  const pendingCardClass = 'border-amber-300 bg-amber-50 ring-2 ring-amber-100';
  const idleCardClass = 'border-slate-100 bg-slate-50';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-full w-full flex-col rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
      data-testid={`mobile-application-card-${application.id}`}
      aria-label={`${tr('打开申请', 'Open application', 'Buka permohonan')} ${application.applicant_name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{application.applicant_name}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {application.vehicle_model || tr('未选择车辆', 'No vehicle selected', 'Tiada kenderaan dipilih')}
          </p>
        </div>
        <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${APPLICATION_STATUS_STYLES[application.status]}`}>
          {trLoanStatus(application.status)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
        <span className="flex min-w-0 items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate font-mono">{formatMalaysiaPhoneForCopy(application.phone_no) || '—'}</span>
        </span>
        <span className="min-w-0 truncate text-right">
          {application.vehicle_plate || application.vehicle_condition || tr('未填车牌', 'No plate', 'Tiada plat')}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {tr('下一步', 'Next action', 'Tindakan seterusnya')}
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-slate-700">{pendingAction}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-[11px] font-bold ${due ? 'text-rose-600' : 'text-slate-500'}`}>
            {formatShortDateTime(application.action_due_at)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex min-w-0 items-center justify-between gap-2">
        <span className={`inline-flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold ${bankTone}`}>
          {latestBankApplication ? (
            <span data-testid={`mobile-bank-icon-${application.id}`}>
              <BankIcon
                bankName={latestBankApplication.bank_name}
                bankDefinitions={bankDefinitions}
                status={latestBankApplication.status}
                size="xs"
              />
            </span>
          ) : (
            <Landmark className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="truncate">
            {latestBankApplication
              ? `${latestBankApplication.bank_name} · ${trBankStatus(latestBankApplication.status)}`
              : tr('尚未提交银行', 'No bank submitted', 'Belum dihantar ke bank')}
          </span>
          {(application.bank_applications || []).length > 1 && (
            <span className="shrink-0 opacity-60">+{application.bank_applications.length - 1}</span>
          )}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
      </div>

      <div data-testid="customer-journey">
        <MobileApplicationJourney application={application} />
      </div>

      <div data-testid={`loan-staff-assignments-${application.id}`} className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
        <div
          data-testid={`loan-staff-handler-${application.id}`}
          data-pending={isHandlerPending ? 'true' : 'false'}
          className={`relative min-w-0 rounded-lg border px-2.5 py-2 ${isHandlerPending ? pendingCardClass : idleCardClass}`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span data-testid={`mobile-handler-icon-${application.id}`}>
              <StaffAvatar
                name={application.handler_name || tr('未分配', 'Unassigned', 'Belum ditetapkan')}
                avatarDataUrl={handlerAccount?.avatar_data_url}
                className="h-7 w-7"
                textClassName="text-[9px]"
              />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{tr('负责人', 'Handler', 'Pengendali')}</p>
              <p className="mt-0.5 truncate text-xs font-bold text-slate-800">{application.handler_name || tr('未分配', 'Unassigned', 'Belum ditetapkan')}</p>
            </div>
          </div>
          {isHandlerPending && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white" title={tr('待处理', 'Pending', 'Menunggu')} aria-label={tr('待处理', 'Pending', 'Menunggu')}>P</span>
          )}
        </div>
        <div
          data-testid={`loan-staff-admin-${application.id}`}
          data-pending={isAdminPending ? 'true' : 'false'}
          className={`relative min-w-0 rounded-lg border px-2.5 py-2 ${isAdminPending ? pendingCardClass : idleCardClass}`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span data-testid={`mobile-admin-owner-icon-${application.id}`}>
              <StaffAvatar
                name={adminOwnerName}
                avatarDataUrl={adminOwnerAccount?.avatar_data_url}
                className="h-7 w-7"
                textClassName="text-[9px]"
              />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{tr('Admin 负责人', 'Admin owner', 'Pemilik admin')}</p>
              <p className="mt-0.5 truncate text-xs font-bold text-slate-800">{adminOwnerName}</p>
            </div>
          </div>
          {isAdminPending && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white" title={tr('待处理', 'Pending', 'Menunggu')} aria-label={tr('待处理', 'Pending', 'Menunggu')}>P</span>
          )}
        </div>
      </div>
    </button>
  );
}

function MobileLeadCard({
  lead,
  onOpenWhatsApp,
  onUpdateLead
}: {
  lead: RawCustomerLead;
  onOpenWhatsApp: () => void;
  onUpdateLead: (updates: Partial<RawCustomerLead>) => void;
}) {
  const phoneDigits = normalizeMalaysiaPhoneDigits(lead.phone_no || lead.whatsapp || '');
  const isDue = Boolean(
    lead.next_follow_up_at && new Date(lead.next_follow_up_at).getTime() <= Date.now()
  );

  return (
    <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900">
            {lead.name || lead.username || tr('未命名名单', 'Unnamed lead', 'Prospek tanpa nama')}
          </h3>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {lead.channel} · {lead.phone_no || '--'}
          </p>
        </div>
        <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${
          isDue ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {isDue ? tr('已到期', 'Due', 'Tamat tempoh') : trFollowUpStatus(lead.follow_up_status || 'New')}
        </span>
      </div>

      {lead.follow_up_note && (
        <p className="mt-3 line-clamp-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold leading-relaxed text-slate-600">
          {lead.follow_up_note}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-semibold text-slate-500">
          <Clock3 className="mr-1 inline h-3.5 w-3.5" />
          {formatShortDateTime(lead.next_follow_up_at)}
        </p>
        <p className="shrink-0 text-[11px] font-bold text-slate-500">
          {lead.taken_by_staff_name || tr('公开名单', 'Available lead', 'Prospek tersedia')}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <a
          href={phoneDigits ? `tel:+${phoneDigits}` : undefined}
          aria-disabled={!phoneDigits}
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg text-xs font-bold ${
            phoneDigits ? 'bg-slate-100 text-slate-700' : 'pointer-events-none bg-slate-50 text-slate-300'
          }`}
        >
          <Phone className="h-4 w-4" />
          {tr('电话', 'Call', 'Panggil')}
        </a>
        <button
          type="button"
          onClick={onOpenWhatsApp}
          disabled={!phoneDigits}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white disabled:bg-slate-100 disabled:text-slate-300"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => onUpdateLead({
            follow_up_status: 'Contacted',
            last_follow_up_at: new Date().toISOString()
          })}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-red-800 text-xs font-bold text-white"
        >
          <CheckCircle2 className="h-4 w-4" />
          {tr('完成', 'Done', 'Selesai')}
        </button>
      </div>
    </article>
  );
}

export default function MobileAppShell({
  applications,
  bankDefinitions,
  roleAccounts,
  rawCustomerLeads,
  attendanceEvents,
  currentStaffName,
  currentStaffRole,
  currentStaffAvatar,
  unreadNotificationCount,
  syncStatus,
  canViewApplications,
  canViewLeads,
  canViewCalendar,
  canViewAttendance,
  navigationPage,
  calendarContent,
  attendanceContent,
  preferenceControls,
  onOpenNotifications,
  onOpenApplication,
  onOpenWhatsApp,
  onUpdateLead,
  onRecordAttendance,
  onNavigatePage,
  onLogout
}: MobileAppShellProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>(() => getMobileTabForPage(navigationPage));
  const [applicationFilter, setApplicationFilter] = useState<ApplicationFilter>('action');
  const [applicationTimeFilter, setApplicationTimeFilter] = useState<ApplicationTimeFilter>('30d');
  const [applicationStaffFilter, setApplicationStaffFilter] = useState('all');
  const [leadFilter, setLeadFilter] = useState<LeadFilter>('mine');
  const [applicationSearch, setApplicationSearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [showAttendanceWorkspace, setShowAttendanceWorkspace] = useState(false);
  const [isPunching, setIsPunching] = useState(false);

  useEffect(() => {
    setActiveTab(getMobileTabForPage(navigationPage));
  }, [navigationPage]);

  const actionApplications = useMemo(() => (
    applications
      .filter((application) => isApplicationActionForStaff(
        application,
        currentStaffName,
        currentStaffRole
      ))
      .sort((left, right) => (
        new Date(left.action_due_at || left.submitted_at).getTime()
        - new Date(right.action_due_at || right.submitted_at).getTime()
      ))
  ), [applications, currentStaffName, currentStaffRole]);

  const ownedLeads = useMemo(() => (
    rawCustomerLeads
      .filter((lead) => (
        lead.taken_by_staff_name === currentStaffName
        && ACTIVE_LEAD_STATUSES.has(lead.follow_up_status || 'New')
      ))
      .sort((left, right) => (
        new Date(left.next_follow_up_at || left.received_at).getTime()
        - new Date(right.next_follow_up_at || right.received_at).getTime()
      ))
  ), [currentStaffName, rawCustomerLeads]);

  const dueLeads = ownedLeads.filter((lead) => (
    lead.next_follow_up_at && new Date(lead.next_follow_up_at).getTime() <= Date.now()
  ));

  const availableLeads = useMemo(() => (
    rawCustomerLeads
      .filter((lead) => !lead.taken_by_staff_name && ACTIVE_LEAD_STATUSES.has(lead.follow_up_status || 'New'))
      .sort((left, right) => right.received_at.localeCompare(left.received_at))
  ), [rawCustomerLeads]);

  const filteredApplications = useMemo(() => {
    const query = applicationSearch.trim().toLowerCase();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const rangeStart = new Date(todayStart);
    if (applicationTimeFilter === '7d') rangeStart.setDate(rangeStart.getDate() - 6);
    if (applicationTimeFilter === '30d') rangeStart.setDate(rangeStart.getDate() - 29);

    return applications.filter((application) => {
      const matchesSearch = !query || [
        application.applicant_name,
        application.phone_no,
        application.ic_no,
        application.vehicle_model,
        application.vehicle_plate
      ].some((value) => String(value || '').toLowerCase().includes(query));

      if (!matchesSearch) return false;
      if (applicationStaffFilter !== 'all' && ![
        application.handler_name,
        application.admin_owner_name
      ].includes(applicationStaffFilter)) return false;
      if (applicationTimeFilter !== 'all') {
        const submittedTime = new Date(application.submitted_at).getTime();
        if (Number.isNaN(submittedTime) || submittedTime < rangeStart.getTime()) return false;
        if (applicationTimeFilter === 'today' && submittedTime >= todayStart.getTime() + 24 * 60 * 60 * 1000) return false;
      }
      if (applicationFilter === 'action') {
        return isApplicationActionForStaff(application, currentStaffName, currentStaffRole);
      }
      if (applicationFilter === 'pending') {
        return [LoanStatus.NEW, LoanStatus.PENDING, LoanStatus.IN_PROCESS, LoanStatus.FOLLOW_UP]
          .includes(application.status);
      }
      if (applicationFilter === 'approved') {
        return application.status === LoanStatus.APPROVE;
      }
      return true;
    }).sort((left, right) => right.submitted_at.localeCompare(left.submitted_at));
  }, [applicationFilter, applicationSearch, applicationStaffFilter, applicationTimeFilter, applications, currentStaffName, currentStaffRole]);

  const applicationStaffOptions = useMemo(() => Array.from(new Set(
    applications.flatMap((application) => [application.handler_name, application.admin_owner_name || ''])
      .filter(Boolean)
  )).sort((left, right) => left.localeCompare(right)), [applications]);

  const filteredLeads = useMemo(() => {
    const source = leadFilter === 'due'
      ? dueLeads
      : leadFilter === 'available'
        ? availableLeads
        : ownedLeads;
    const query = leadSearch.trim().toLowerCase();

    return source.filter((lead) => (
      !query || [
        lead.name,
        lead.username,
        lead.phone_no,
        lead.channel,
        lead.follow_up_note
      ].some((value) => String(value || '').toLowerCase().includes(query))
    ));
  }, [availableLeads, dueLeads, leadFilter, leadSearch, ownedLeads]);

  const todayKey = malaysiaDateKey(new Date());
  const latestTodayAttendance = attendanceEvents
    .filter((event) => (
      event.staff_name === currentStaffName && malaysiaDateKey(event.occurred_at) === todayKey
    ))
    .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at))[0];
  const nextPunchAction: AttendanceEvent['action'] = latestTodayAttendance?.action === 'check_in'
    ? 'check_out'
    : 'check_in';

  const navigationItems = [
    { key: 'today' as const, label: tr('今天', 'Today', 'Hari Ini'), icon: Home, visible: true },
    { key: 'applications' as const, label: tr('申请', 'Applications', 'Permohonan'), icon: FileText, visible: canViewApplications },
    { key: 'leads' as const, label: tr('名单', 'Leads', 'Prospek'), icon: Users, visible: canViewLeads },
    { key: 'calendar' as const, label: tr('日历', 'Calendar', 'Kalendar'), icon: CalendarDays, visible: canViewCalendar },
    { key: 'me' as const, label: tr('我的', 'Me', 'Saya'), icon: UserCircle, visible: true }
  ].filter((item) => item.visible);

  const handlePunch = async () => {
    if (isPunching) return;
    setIsPunching(true);
    try {
      await onRecordAttendance(nextPunchAction, '');
    } finally {
      setIsPunching(false);
    }
  };

  const openTab = (tab: MobileTab) => {
    setShowAttendanceWorkspace(false);
    setActiveTab(tab);
    onNavigatePage(getPageForMobileTab(tab));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900" data-testid="responsive-dashboard-shell">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-24 flex-col bg-slate-950 px-2 py-3 text-white md:flex">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-800 text-xs font-black">DR</div>
        <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-1.5" aria-label={tr('平板导航', 'Tablet navigation', 'Navigasi tablet')}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => openTab(item.key)}
                className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-bold transition-colors ${isActive ? 'bg-red-800 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur md:ml-24 md:px-6">
        <div className="flex min-w-0 items-center gap-2.5 md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-800 text-sm font-bold text-white">
            DR
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-900">Dr Racing</p>
            <p className={`mt-0.5 flex items-center gap-1 text-[11px] font-bold ${
              syncStatus === 'error' ? 'text-rose-600' : 'text-slate-500'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                syncStatus === 'error'
                  ? 'bg-rose-500'
                  : syncStatus === 'loading'
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
              }`} />
              {syncStatus === 'error'
                ? tr('同步失败', 'Sync failed', 'Penyegerakan gagal')
                : syncStatus === 'loading'
                  ? tr('同步中', 'Syncing', 'Menyegerak')
                  : tr('已同步', 'Synced', 'Disegerakkan')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
            aria-label={tr('打开通知', 'Open notifications', 'Buka pemberitahuan')}
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-4 text-white">
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => openTab('me')}
            aria-label={tr('打开个人资料', 'Open profile', 'Buka profil')}
          >
            <StaffAvatar
              name={currentStaffName}
              avatarDataUrl={currentStaffAvatar}
              className="h-11 w-11"
              textClassName="text-xs"
            />
          </button>
        </div>
      </header>

      <main className="px-4 pb-28 pt-5 md:ml-24 md:px-6 md:pb-10 lg:px-8">
        <div className="mx-auto w-full max-w-[1180px]">
        {activeTab === 'today' && (
          <div className="space-y-6">
            <section>
              <p className="text-xs font-bold text-slate-500">{formatTodayHeading()}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                {getGreeting()}, {currentStaffName.split(/\s+/)[0]}
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {getRoleWorkspaceLabel(currentStaffRole)}
              </p>
            </section>

            {canViewAttendance && (
              <section className="rounded-xl bg-slate-900 p-4 text-white shadow-lg shadow-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                      {tr('今日考勤', 'Today attendance', 'Kehadiran hari ini')}
                    </p>
                    <p className="mt-1 truncate text-sm font-bold">
                      {latestTodayAttendance
                        ? tr(
                            `上次 ${latestTodayAttendance.action === 'check_in' ? '签到' : '签退'} · ${formatTime(latestTodayAttendance.occurred_at)}`,
                            `Last ${latestTodayAttendance.action === 'check_in' ? 'check-in' : 'checkout'} · ${formatTime(latestTodayAttendance.occurred_at)}`,
                            `${latestTodayAttendance.action === 'check_in' ? 'Daftar masuk' : 'Daftar keluar'} terakhir · ${formatTime(latestTodayAttendance.occurred_at)}`
                          )
                        : tr('今天还没有打卡', 'No punch yet today', 'Belum ada rekod hari ini')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePunch}
                    disabled={isPunching}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-4 text-xs font-bold text-white disabled:opacity-60 ${
                      nextPunchAction === 'check_in' ? 'bg-emerald-500' : 'bg-rose-600'
                    }`}
                  >
                    {nextPunchAction === 'check_in'
                      ? <LogIn className="h-4 w-4" />
                      : <LogOut className="h-4 w-4" />}
                    {isPunching
                      ? tr('保存中', 'Saving', 'Menyimpan')
                      : nextPunchAction === 'check_in'
                        ? 'Check in'
                        : 'Check out'}
                  </button>
                </div>
              </section>
            )}

            <section className="space-y-3">
              <MobileSectionHeading
                title={tr('需要处理', 'Need action', 'Perlu tindakan')}
                count={actionApplications.length + dueLeads.length}
                action={actionApplications.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => openTab('applications')}
                    className="text-xs font-bold text-red-700"
                  >
                    {tr('查看全部', 'View all', 'Lihat semua')}
                  </button>
                ) : undefined}
              />

              {actionApplications.slice(0, 3).map((application) => (
                <LoanApplicationCard
                  key={application.id}
                  application={application}
                  bankDefinitions={bankDefinitions}
                  roleAccounts={roleAccounts}
                  onOpen={() => onOpenApplication(application)}
                />
              ))}

              {dueLeads.slice(0, Math.max(3 - actionApplications.length, 0)).map((lead) => (
                <MobileLeadCard
                  key={lead.id}
                  lead={lead}
                  onOpenWhatsApp={() => onOpenWhatsApp(lead, 'api')}
                  onUpdateLead={(updates) => onUpdateLead(lead.id, updates)}
                />
              ))}

              {actionApplications.length === 0 && dueLeads.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    {tr('目前没有到期工作', 'Nothing due right now', 'Tiada tugasan tamat tempoh')}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {tr('新的工作会自动出现在这里。', 'New work will appear here automatically.', 'Tugasan baharu akan muncul di sini.')}
                  </p>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <MobileSectionHeading title={tr('快速前往', 'Quick access', 'Akses pantas')} />
              <div className="grid grid-cols-3 gap-2">
                {canViewApplications && (
                  <button
                    type="button"
                    onClick={() => openTab('applications')}
                    className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                      <FileText className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold text-slate-700">{tr('申请', 'Applications', 'Permohonan')}</span>
                  </button>
                )}
                {canViewLeads && (
                  <button
                    type="button"
                    onClick={() => openTab('leads')}
                    className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Users className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold text-slate-700">{tr('名单', 'Leads', 'Prospek')}</span>
                  </button>
                )}
                {canViewCalendar && (
                  <button
                    type="button"
                    onClick={() => openTab('calendar')}
                    className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold text-slate-700">{tr('日历', 'Calendar', 'Kalendar')}</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'applications' && canViewApplications && (
          <div className="space-y-4">
            <section>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                {tr('贷款申请', 'Applications', 'Permohonan')}
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {tr('点开客户卡片查看和处理下一步。', 'Open a customer card to handle the next action.', 'Buka kad pelanggan untuk tindakan seterusnya.')}
              </p>
            </section>

            <div className="grid gap-2 md:grid-cols-[minmax(260px,1fr)_minmax(390px,1.2fr)]" data-testid="application-filter-toolbar">
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 shadow-sm">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  value={applicationSearch}
                  onChange={(event) => setApplicationSearch(event.target.value)}
                  placeholder={tr('搜索客户、电话、IC、车辆', 'Search customer, phone, IC, vehicle', 'Cari pelanggan, telefon, IC, kenderaan')}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300"
                />
              </label>

              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-white p-1.5 shadow-sm">
                <label className="min-w-0">
                  <span className="sr-only">{tr('员工筛选', 'Staff filter', 'Penapis staf')}</span>
                  <select value={applicationStaffFilter} onChange={(event) => setApplicationStaffFilter(event.target.value)} className="h-9 w-full min-w-0 rounded-lg bg-slate-50 px-2 text-[11px] font-bold text-slate-700 outline-none" aria-label={tr('员工筛选', 'Staff filter', 'Penapis staf')}>
                    <option value="all">{tr('全部员工', 'All staff', 'Semua staf')}</option>
                    {applicationStaffOptions.map((staffName) => <option key={staffName} value={staffName}>{staffName}</option>)}
                  </select>
                </label>
                <label className="min-w-0">
                  <span className="sr-only">{tr('状态筛选', 'Status filter', 'Penapis status')}</span>
                  <select value={applicationFilter} onChange={(event) => setApplicationFilter(event.target.value as ApplicationFilter)} className="h-9 w-full min-w-0 rounded-lg bg-slate-50 px-2 text-[11px] font-bold text-slate-700 outline-none" aria-label={tr('状态筛选', 'Status filter', 'Penapis status')}>
                    <option value="action">{tr(`需处理 ${actionApplications.length}`, `Need action ${actionApplications.length}`, `Perlu tindakan ${actionApplications.length}`)}</option>
                    <option value="all">{tr(`全部 ${applications.length}`, `All ${applications.length}`, `Semua ${applications.length}`)}</option>
                    <option value="pending">{tr('进行中', 'In progress', 'Sedang berjalan')}</option>
                    <option value="approved">{tr('已批核', 'Approved', 'Diluluskan')}</option>
                  </select>
                </label>
                <label className="min-w-0">
                  <span className="sr-only">{tr('时间筛选', 'Time filter', 'Penapis masa')}</span>
                  <select value={applicationTimeFilter} onChange={(event) => setApplicationTimeFilter(event.target.value as ApplicationTimeFilter)} className="h-9 w-full min-w-0 rounded-lg bg-slate-50 px-2 text-[11px] font-bold text-slate-700 outline-none" aria-label={tr('时间筛选', 'Time filter', 'Penapis masa')}>
                    <option value="today">{tr('今天', 'Today', 'Hari ini')}</option>
                    <option value="7d">{tr('最近 7 天', 'Last 7 days', '7 hari lalu')}</option>
                    <option value="30d">{tr('最近 30 天', 'Last 30 days', '30 hari lalu')}</option>
                    <option value="all">{tr('全部时间', 'All time', 'Sepanjang masa')}</option>
                  </select>
                </label>
              </div>
            </div>

            <MobileSectionHeading
              title={tr('客户名单', 'Customer list', 'Senarai pelanggan')}
              count={filteredApplications.length}
              action={<SlidersHorizontal className="h-4 w-4 text-slate-400" />}
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2" data-testid="mobile-application-grid">
              {filteredApplications.map((application) => (
                <LoanApplicationCard
                  key={application.id}
                  application={application}
                  bankDefinitions={bankDefinitions}
                  roleAccounts={roleAccounts}
                  onOpen={() => onOpenApplication(application)}
                />
              ))}
              {filteredApplications.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
                  {tr('没有符合条件的申请。', 'No matching applications.', 'Tiada permohonan sepadan.')}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leads' && canViewLeads && (
          <div className="space-y-4">
            <section>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                {tr('名单跟进', 'Lead follow-up', 'Susulan prospek')}
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {tr('从手机直接联系客户并记录进度。', 'Contact customers and record progress from your phone.', 'Hubungi pelanggan dan rekod kemajuan melalui telefon.')}
              </p>
            </section>

            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={leadSearch}
                onChange={(event) => setLeadSearch(event.target.value)}
                placeholder={tr('搜索姓名、电话或渠道', 'Search name, phone, or channel', 'Cari nama, telefon atau saluran')}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300"
              />
            </label>

            <div className="grid grid-cols-3 gap-2 rounded-xl bg-white p-1 shadow-sm">
              {([
                ['mine', tr('我的', 'Mine', 'Saya'), ownedLeads.length],
                ['due', tr('到期', 'Due', 'Tamat'), dueLeads.length],
                ['available', tr('公开', 'Available', 'Tersedia'), availableLeads.length]
              ] as Array<[LeadFilter, string, number]>).map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLeadFilter(key)}
                  className={`min-h-11 rounded-lg px-2 text-xs font-bold ${
                    leadFilter === key ? 'bg-red-800 text-white' : 'text-slate-500'
                  }`}
                >
                  {label} <span className="opacity-60">{count}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <MobileLeadCard
                  key={lead.id}
                  lead={lead}
                  onOpenWhatsApp={() => onOpenWhatsApp(lead, 'api')}
                  onUpdateLead={(updates) => onUpdateLead(lead.id, updates)}
                />
              ))}
              {filteredLeads.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
                  {tr('这个名单目前是空的。', 'This lead list is empty.', 'Senarai prospek ini kosong.')}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && canViewCalendar && (
          <div className="mobile-embedded-workspace">
            {calendarContent}
          </div>
        )}

        {activeTab === 'me' && (
          showAttendanceWorkspace && canViewAttendance ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setShowAttendanceWorkspace(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-3 text-xs font-bold text-slate-700 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                {tr('返回个人页面', 'Back to profile', 'Kembali ke profil')}
              </button>
              <div className="mobile-embedded-workspace">
                {attendanceContent}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <section className="rounded-xl bg-slate-900 p-5 text-white shadow-lg shadow-slate-200">
                <div className="flex items-center gap-4">
                  <StaffAvatar
                    name={currentStaffName}
                    avatarDataUrl={currentStaffAvatar}
                    className="h-16 w-16 border-white/20"
                    textClassName="text-sm"
                  />
                  <div className="min-w-0">
                    <h1 className="truncate text-xl font-bold">{currentStaffName}</h1>
                    <p className="mt-1 text-xs font-bold text-white/50">{currentStaffRole}</p>
                  </div>
                </div>
              </section>

              {canViewAttendance && (
                <section className="space-y-3">
                  <MobileSectionHeading title={tr('工作与考勤', 'Work & attendance', 'Kerja & kehadiran')} />
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttendanceWorkspace(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex min-h-16 w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Clock3 className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-800">
                        {tr('考勤与 Leave / MC', 'Attendance & Leave / MC', 'Kehadiran & Cuti / MC')}
                      </span>
                      <span className="mt-1 block truncate text-xs font-semibold text-slate-500">
                        {latestTodayAttendance
                          ? `${latestTodayAttendance.action === 'check_in' ? 'Check in' : 'Check out'} · ${formatTime(latestTodayAttendance.occurred_at)}`
                          : tr('今天还没有打卡', 'No punch yet today', 'Belum ada rekod hari ini')}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                </section>
              )}

              <section className="space-y-3">
                <MobileSectionHeading title={tr('显示设置', 'Display settings', 'Tetapan paparan')} />
                <div className="flex flex-col items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                  {preferenceControls}
                </div>
              </section>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-50 text-sm font-bold text-rose-700"
              >
                <LogOut className="h-4 w-4" />
                {tr('退出登录', 'Log out', 'Log keluar')}
              </button>
            </div>
          )
        )}
        </div>
      </main>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid rounded-2xl border border-slate-100 bg-white/95 p-1 shadow-2xl shadow-slate-300/40 backdrop-blur md:hidden"
        style={{
          gridTemplateColumns: navigationItems
            .map((item) => `minmax(0, ${item.key === 'applications' ? 1.2 : 1}fr)`)
            .join(' ')
        }}
        aria-label={tr('手机导航', 'Mobile navigation', 'Navigasi mudah alih')}
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => openTab(item.key)}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold transition-colors ${
                isActive ? 'bg-red-800 text-white' : 'text-slate-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
