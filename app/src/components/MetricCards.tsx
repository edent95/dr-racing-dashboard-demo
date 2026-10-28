/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Bike, CheckCircle2, CircleSlash2, MessageCircle, Plus, RefreshCw, Send, XCircle, type LucideIcon } from 'lucide-react';
import { LoanApplication, LoanStatus } from '../types';
import type { AppLanguage } from '../lib/i18n';
import {
  FOLLOW_UP_ANY_FILTER,
  IN_PROCESS_PENDING_FILTER,
  isAnyFollowUp,
  isInProcessOrPending
} from '../utils/loanFollowUpFilters';

interface MetricCardsProps {
  applications: LoanApplication[];
  language?: AppLanguage;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  /** Counted by event date in the selected period, not by application date. */
  periodTotals: { submitted: number; sold: number };
  /** The selected period: a heading above the cards ("Oct 2026") and a line on each card ("01 Oct - 08 Oct"). */
  periodLabel: string;
  periodRange: string;
}

// Filter keys for the two period cards; CustomerList resolves their rows.
export const TOTAL_SUBMITTED_FILTER = 'TOTAL_SUBMITTED';
export const TOTAL_SALE_FILTER = 'TOTAL_SALE';

const METRIC_COPY = {
  zh: {
    newTitle: '新申请',
    newSubtitle: '新提交，等待开始处理',
    totalSubmittedTitle: '本期总提交',
    totalSubmittedSubtitle: '所选期间第一次提交到银行的申请',
    inProcessPendingTitle: '审批中及待处理',
    inProcessPendingSubtitle: '银行审批中，或等待管理员审批评估',
    rejectedTitle: '已拒绝',
    rejectedSubtitle: '风控征信评估未通过',
    followUpTitle: '跟进中',
    followUpSubtitle: '银行拒绝要换银行，或要补文件再提交',
    approvedTitle: '已通过',
    approvedSubtitle: '财务通过并成功放款',
    cancelledTitle: '已取消',
    cancelledSubtitle: '客户取消或撤回申请',
    totalSaleTitle: '总销售',
    totalSaleSubtitle: '所选期间已交车的单',
    unit: '份',
    showAll: '再点一次显示全部'
  },
  en: {
    newTitle: 'New Applications',
    newSubtitle: 'Newly submitted, awaiting action',
    totalSubmittedTitle: 'Total Submit',
    totalSubmittedSubtitle: 'Applications first submitted to a bank in the selected period',
    inProcessPendingTitle: 'In Process & Pending',
    inProcessPendingSubtitle: 'Bank approval in progress, or waiting for admin review',
    rejectedTitle: 'Rejected',
    rejectedSubtitle: 'Rejected by risk or credit review',
    followUpTitle: 'Follow Up',
    followUpSubtitle: 'Bank rejected and needs another bank, or documents are needed to reapply',
    approvedTitle: 'Approved',
    approvedSubtitle: 'Approved and disbursed',
    cancelledTitle: 'Cancelled',
    cancelledSubtitle: 'Cancelled or withdrawn by customer',
    totalSaleTitle: 'Total Sale',
    totalSaleSubtitle: 'Bikes delivered in the selected period',
    unit: 'items',
    showAll: 'Click again to show all'
  },
  ms: {
    newTitle: 'Permohonan Baharu',
    newSubtitle: 'Baru dihantar, menunggu tindakan',
    totalSubmittedTitle: 'Jumlah Hantar',
    totalSubmittedSubtitle: 'Permohonan yang pertama kali dihantar ke bank dalam tempoh dipilih',
    inProcessPendingTitle: 'Diproses & Menunggu',
    inProcessPendingSubtitle: 'Kelulusan bank sedang diproses, atau menunggu semakan pentadbir',
    rejectedTitle: 'Ditolak',
    rejectedSubtitle: 'Ditolak selepas semakan risiko atau kredit',
    followUpTitle: 'Susulan',
    followUpSubtitle: 'Bank menolak dan perlu bank lain, atau dokumen diperlukan untuk mohon semula',
    approvedTitle: 'Diluluskan',
    approvedSubtitle: 'Diluluskan dan dana dikeluarkan',
    cancelledTitle: 'Dibatalkan',
    cancelledSubtitle: 'Dibatalkan atau ditarik balik oleh pelanggan',
    totalSaleTitle: 'Jumlah Jualan',
    totalSaleSubtitle: 'Motosikal yang diserahkan dalam tempoh dipilih',
    unit: 'item',
    showAll: 'Klik sekali lagi untuk tunjuk semua'
  }
} satisfies Record<AppLanguage, Record<string, string>>;

interface MetricCard {
  id: string;
  filterValue: string;
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  titleBadgeClass: string;
  valueClass: string;
  progressColor: string;
  /** Status cards show their share of the applications in the period; the two period cards count events, so no percentage. */
  showPercent: boolean;
}

// The owner's sketch: two rows of four, in this order (1-8).
export default function MetricCards({ applications, language = 'en', selectedStatus, onSelectStatus, periodTotals, periodLabel, periodRange }: MetricCardsProps) {
  const copy = METRIC_COPY[language];
  const counts = useMemo(() => {
    const byStatus = (status: LoanStatus) => applications.filter((application) => application.status === status).length;
    return {
      new: byStatus(LoanStatus.NEW),
      inProcessPending: applications.filter(isInProcessOrPending).length,
      rejected: byStatus(LoanStatus.REJECT),
      followUp: applications.filter(isAnyFollowUp).length,
      approved: byStatus(LoanStatus.APPROVE),
      cancelled: byStatus(LoanStatus.CANCELLED)
    };
  }, [applications]);
  const total = applications.length;
  const percent = (count: number) => (total > 0 ? Math.round((Math.min(count, total) / total) * 100) : 0);

  const cards: MetricCard[] = [
    {
      id: 'metric-new',
      filterValue: LoanStatus.NEW,
      title: copy.newTitle,
      value: counts.new,
      subtitle: copy.newSubtitle,
      icon: Plus,
      titleBadgeClass: 'bg-blue-50 text-blue-700',
      valueClass: 'text-blue-600',
      progressColor: 'bg-blue-500',
      showPercent: true
    },
    {
      id: 'metric-total-submitted',
      filterValue: TOTAL_SUBMITTED_FILTER,
      title: copy.totalSubmittedTitle,
      value: periodTotals.submitted,
      subtitle: copy.totalSubmittedSubtitle,
      icon: Send,
      titleBadgeClass: 'bg-sky-50 text-sky-700',
      valueClass: 'text-sky-600',
      progressColor: 'bg-sky-500',
      showPercent: false
    },
    {
      id: 'metric-in-process-pending',
      filterValue: IN_PROCESS_PENDING_FILTER,
      title: copy.inProcessPendingTitle,
      value: counts.inProcessPending,
      subtitle: copy.inProcessPendingSubtitle,
      icon: RefreshCw,
      titleBadgeClass: 'bg-indigo-50 text-indigo-700',
      valueClass: 'text-indigo-600',
      progressColor: 'bg-indigo-500',
      showPercent: true
    },
    {
      id: 'metric-reject',
      filterValue: LoanStatus.REJECT,
      title: copy.rejectedTitle,
      value: counts.rejected,
      subtitle: copy.rejectedSubtitle,
      icon: XCircle,
      titleBadgeClass: 'bg-rose-50 text-rose-600',
      valueClass: 'text-rose-500',
      progressColor: 'bg-rose-500',
      showPercent: true
    },
    {
      id: 'metric-follow-up',
      filterValue: FOLLOW_UP_ANY_FILTER,
      title: copy.followUpTitle,
      value: counts.followUp,
      subtitle: copy.followUpSubtitle,
      icon: MessageCircle,
      titleBadgeClass: 'bg-purple-50 text-purple-700',
      valueClass: 'text-purple-600',
      progressColor: 'bg-purple-500',
      showPercent: true
    },
    {
      id: 'metric-approve',
      filterValue: LoanStatus.APPROVE,
      title: copy.approvedTitle,
      value: counts.approved,
      subtitle: copy.approvedSubtitle,
      icon: CheckCircle2,
      titleBadgeClass: 'bg-emerald-50 text-emerald-700',
      valueClass: 'text-emerald-600',
      progressColor: 'bg-emerald-500',
      showPercent: true
    },
    {
      id: 'metric-cancelled',
      filterValue: LoanStatus.CANCELLED,
      title: copy.cancelledTitle,
      value: counts.cancelled,
      subtitle: copy.cancelledSubtitle,
      icon: CircleSlash2,
      titleBadgeClass: 'bg-slate-100 text-slate-500',
      valueClass: 'text-slate-500',
      progressColor: 'bg-slate-400',
      showPercent: true
    },
    {
      id: 'metric-total-sale',
      filterValue: TOTAL_SALE_FILTER,
      title: copy.totalSaleTitle,
      value: periodTotals.sold,
      subtitle: copy.totalSaleSubtitle,
      icon: Bike,
      titleBadgeClass: 'bg-teal-50 text-teal-700',
      valueClass: 'text-teal-600',
      progressColor: 'bg-teal-500',
      showPercent: false
    }
  ];

  return (
    <section aria-label={periodLabel} className="space-y-2">
      <h3 data-testid="loan-application-metric-period" className="text-headline text-slate-900">{periodLabel}</h3>
      <div id="metrics-grid" className="grid grid-cols-2 gap-2 md:grid-cols-4" data-testid="loan-application-metric-strip">
        {cards.map((card) => {
          const isActive = selectedStatus === card.filterValue;
          const cardPercent = percent(card.value);
          const percentageText = card.showPercent ? `${cardPercent}%` : '';

          return (
            <button
              key={card.id}
              id={card.id}
              type="button"
              aria-pressed={isActive}
              aria-label={`${card.title}: ${card.value.toLocaleString()} ${copy.unit}. ${percentageText ? `${percentageText}. ` : ''}${periodRange ? `${periodRange}. ` : ''}${card.subtitle}`}
              title={isActive ? copy.showAll : card.subtitle}
              // Clicking the selected card again clears the filter and shows every row.
              onClick={() => onSelectStatus(isActive ? 'ALL' : card.filterValue)}
              className={`flex min-h-[82px] flex-col rounded-card border bg-white p-2.5 text-left shadow-e1 transition-all hover:-translate-y-0.5 hover:bg-slate-50/40 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100 ${
                isActive ? 'border-brand ring-2 ring-brand-100' : 'border-slate-100'
              }`}
            >
              <div className="flex min-w-0 items-start justify-between gap-1.5">
                <p className={`line-clamp-2 min-w-0 rounded-chip px-1.5 py-0.5 text-micro uppercase leading-3 ${card.titleBadgeClass}`}>
                  {card.title}
                </p>
                <card.icon aria-hidden="true" className="h-5 w-5 shrink-0 text-current" strokeWidth={1.75} />
              </div>

              <span className="sr-only">{card.subtitle}</span>

              <div className="mt-1 flex items-baseline justify-between gap-1.5">
                <div className="flex min-w-0 items-baseline gap-1">
                  <span className={`text-title-2 ${card.valueClass}`}>
                    {card.value.toLocaleString()}
                  </span>
                  <span className="truncate text-caption text-slate-400">{copy.unit}</span>
                </div>
                <span className="shrink-0 text-micro tracking-normal text-slate-500">{percentageText}</span>
              </div>

              {/* The period sits beside the bar on one line, so the card stays as short as before. */}
              <div className="mt-auto flex items-center gap-2 pt-1.5">
                {periodRange && <span className="shrink-0 text-micro tracking-normal text-slate-400">{periodRange}</span>}
                <div className="h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${card.progressColor}`}
                    style={{ width: `${cardPercent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
