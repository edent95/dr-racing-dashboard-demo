/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { LoanApplication, LoanStatus } from '../types';
import approvalOverviewIcon from '../assets/icons/nav/approvalOverview.png';
import approvedIcon from '../assets/icons/nav/approved.png';
import pendingIcon from '../assets/icons/nav/pending.png';
import rejectedIcon from '../assets/icons/nav/rejected.png';
import newIcon from '../assets/icons/nav/plus.png';
import inProcessIcon from '../assets/icons/nav/syncStatus.png';
import followUpIcon from '../assets/icons/nav/followUpMessage.png';
import cancelledIcon from '../assets/icons/nav/hidden.png';
import type { AppLanguage } from '../lib/i18n';
import {
  FOLLOW_UP_DOCUMENT_FILTER,
  FOLLOW_UP_REJECT_BANK_FILTER,
  isDocumentFollowUp,
  isRejectBankFollowUp
} from '../utils/loanFollowUpFilters';

interface MetricCardsProps {
  applications: LoanApplication[];
  language?: AppLanguage;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

const METRIC_COPY = {
  zh: {
    totalTitle: '总申请数',
    totalSubtitle: '当前视图中的申请记录',
    newTitle: '新申请',
    newSubtitle: '新提交，等待开始处理',
    pendingTitle: '待处理',
    pendingSubtitle: '等待管理员审批评估',
    inProcessTitle: '审批中',
    inProcessSubtitle: '银行审批流程进行中',
    approvedTitle: '已通过',
    approvedSubtitle: '财务通过并成功放款',
    rejectedTitle: '已拒绝',
    rejectedSubtitle: '风控征信评估未通过',
    followUpRejectBankTitle: '跟进拒绝银行',
    followUpRejectBankSubtitle: '银行已拒绝，需要新增并提交其他银行',
    followUpDocumentTitle: '跟进补文件',
    followUpDocumentSubtitle: '补齐银行要求的资料，再提交同一家银行',
    cancelledTitle: '已取消',
    cancelledSubtitle: '客户取消或撤回申请',
    unit: '份',
    ratio: '状态比例',
    mix: '状态构成'
  },
  en: {
    totalTitle: 'Total Applications',
    totalSubtitle: 'Application records in the current view',
    newTitle: 'New',
    newSubtitle: 'Newly submitted, awaiting action',
    pendingTitle: 'Pending',
    pendingSubtitle: 'Waiting for admin review',
    inProcessTitle: 'In Process',
    inProcessSubtitle: 'Bank approval in progress',
    approvedTitle: 'Approved',
    approvedSubtitle: 'Approved and disbursed',
    rejectedTitle: 'Rejected',
    rejectedSubtitle: 'Rejected by risk or credit review',
    followUpRejectBankTitle: 'Follow Up Reject Bank',
    followUpRejectBankSubtitle: 'Bank rejected; add and submit a new bank',
    followUpDocumentTitle: 'Follow Up Document',
    followUpDocumentSubtitle: 'Complete the requested documents and reapply to the same bank',
    cancelledTitle: 'Cancelled',
    cancelledSubtitle: 'Cancelled or withdrawn by customer',
    unit: 'items',
    ratio: 'Status Ratio',
    mix: 'Status Mix'
  },
  ms: {
    totalTitle: 'Jumlah Permohonan',
    totalSubtitle: 'Rekod permohonan dalam paparan semasa',
    newTitle: 'Baharu',
    newSubtitle: 'Baru dihantar, menunggu tindakan',
    pendingTitle: 'Menunggu',
    pendingSubtitle: 'Menunggu semakan pentadbir',
    inProcessTitle: 'Sedang Diproses',
    inProcessSubtitle: 'Kelulusan bank sedang diproses',
    approvedTitle: 'Diluluskan',
    approvedSubtitle: 'Diluluskan dan dana dikeluarkan',
    rejectedTitle: 'Ditolak',
    rejectedSubtitle: 'Ditolak selepas semakan risiko atau kredit',
    followUpRejectBankTitle: 'Susulan Bank Ditolak',
    followUpRejectBankSubtitle: 'Bank menolak; tambah dan hantar ke bank baharu',
    followUpDocumentTitle: 'Susulan Dokumen',
    followUpDocumentSubtitle: 'Lengkapkan dokumen diminta dan mohon semula kepada bank yang sama',
    cancelledTitle: 'Dibatalkan',
    cancelledSubtitle: 'Dibatalkan atau ditarik balik oleh pelanggan',
    unit: 'item',
    ratio: 'Nisbah Status',
    mix: 'Campuran Status'
  }
} satisfies Record<AppLanguage, Record<string, string>>;

interface MetricCardSegment {
  key: string;
  color: string;
  width: number;
}

interface MetricCard {
  id: string;
  filterValue: string;
  title: string;
  value: number;
  subtitle: string;
  iconSrc: string;
  titleBadgeClass: string;
  valueClass: string;
  progress: number;
  progressColor: string;
  percentageText: string;
  ratioLabel?: string;
  segments?: MetricCardSegment[];
}

export default function MetricCards({ applications, language = 'en', selectedStatus, onSelectStatus }: MetricCardsProps) {
  const copy = METRIC_COPY[language];
  const stats = useMemo(() => {
    const total = applications.length;
    const counts: Record<LoanStatus, number> = {
      [LoanStatus.NEW]: 0,
      [LoanStatus.PENDING]: 0,
      [LoanStatus.IN_PROCESS]: 0,
      [LoanStatus.APPROVE]: 0,
      [LoanStatus.REJECT]: 0,
      [LoanStatus.FOLLOW_UP]: 0,
      [LoanStatus.CANCELLED]: 0
    };

    applications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status] += 1;
      }
    });

    const percent = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

    return {
      total,
      counts,
      percent,
      rejectBankFollowUp: applications.filter(isRejectBankFollowUp).length,
      documentFollowUp: applications.filter(isDocumentFollowUp).length
    };
  }, [applications]);

  // One entry per status; colors follow STATUS_CONFIG in types.ts so the
  // cards, tabs and row chips stay visually consistent.
  const statusCards: Array<{
    status: LoanStatus;
    title: string;
    subtitle: string;
    iconSrc: string;
    titleBadgeClass: string;
    valueClass: string;
    progressColor: string;
    segmentColor: string;
  }> = [
    {
      status: LoanStatus.NEW,
      title: copy.newTitle,
      subtitle: copy.newSubtitle,
      iconSrc: newIcon,
      titleBadgeClass: 'bg-blue-50 text-blue-700',
      valueClass: 'text-blue-600',
      progressColor: 'bg-blue-500',
      segmentColor: 'bg-blue-500'
    },
    {
      status: LoanStatus.PENDING,
      title: copy.pendingTitle,
      subtitle: copy.pendingSubtitle,
      iconSrc: pendingIcon,
      titleBadgeClass: 'bg-amber-50 text-amber-700',
      valueClass: 'text-amber-500',
      progressColor: 'bg-amber-500',
      segmentColor: 'bg-amber-500'
    },
    {
      status: LoanStatus.IN_PROCESS,
      title: copy.inProcessTitle,
      subtitle: copy.inProcessSubtitle,
      iconSrc: inProcessIcon,
      titleBadgeClass: 'bg-indigo-50 text-indigo-700',
      valueClass: 'text-indigo-600',
      progressColor: 'bg-indigo-500',
      segmentColor: 'bg-indigo-500'
    },
    {
      status: LoanStatus.APPROVE,
      title: copy.approvedTitle,
      subtitle: copy.approvedSubtitle,
      iconSrc: approvedIcon,
      titleBadgeClass: 'bg-emerald-50 text-emerald-700',
      valueClass: 'text-emerald-600',
      progressColor: 'bg-emerald-500',
      segmentColor: 'bg-emerald-500'
    },
    {
      status: LoanStatus.REJECT,
      title: copy.rejectedTitle,
      subtitle: copy.rejectedSubtitle,
      iconSrc: rejectedIcon,
      titleBadgeClass: 'bg-rose-50 text-rose-600',
      valueClass: 'text-rose-500',
      progressColor: 'bg-rose-500',
      segmentColor: 'bg-rose-500'
    },
    {
      status: LoanStatus.FOLLOW_UP,
      title: copy.followUpRejectBankTitle,
      subtitle: copy.followUpRejectBankSubtitle,
      iconSrc: followUpIcon,
      titleBadgeClass: 'bg-purple-50 text-purple-700',
      valueClass: 'text-purple-600',
      progressColor: 'bg-purple-500',
      segmentColor: 'bg-purple-500'
    },
    {
      status: LoanStatus.CANCELLED,
      title: copy.cancelledTitle,
      subtitle: copy.cancelledSubtitle,
      iconSrc: cancelledIcon,
      titleBadgeClass: 'bg-slate-100 text-slate-500',
      valueClass: 'text-slate-500',
      progressColor: 'bg-slate-400',
      segmentColor: 'bg-slate-400'
    }
  ];

  const cards: MetricCard[] = [
    {
      id: 'metric-total',
      filterValue: 'ALL',
      title: copy.totalTitle,
      value: stats.total,
      subtitle: copy.totalSubtitle,
      iconSrc: approvalOverviewIcon,
      titleBadgeClass: 'bg-slate-100 text-slate-600',
      valueClass: 'text-slate-900',
      progress: 100,
      progressColor: 'bg-indigo-600',
      percentageText: '100%',
      ratioLabel: copy.mix,
      segments: statusCards.map((card) => ({
        key: card.status,
        color: card.segmentColor,
        width: stats.percent(stats.counts[card.status])
      }))
    },
    ...statusCards.flatMap((card): MetricCard[] => {
      if (card.status === LoanStatus.FOLLOW_UP) {
        const rejectBankPercent = stats.percent(stats.rejectBankFollowUp);
        const documentPercent = stats.percent(stats.documentFollowUp);
        return [
          {
            id: 'metric-follow-up-reject-bank',
            filterValue: FOLLOW_UP_REJECT_BANK_FILTER,
            title: copy.followUpRejectBankTitle,
            value: stats.rejectBankFollowUp,
            subtitle: copy.followUpRejectBankSubtitle,
            iconSrc: rejectedIcon,
            titleBadgeClass: 'bg-purple-50 text-purple-700',
            valueClass: 'text-purple-600',
            progress: rejectBankPercent,
            progressColor: 'bg-purple-500',
            percentageText: `${rejectBankPercent}%`
          },
          {
            id: 'metric-follow-up-document',
            filterValue: FOLLOW_UP_DOCUMENT_FILTER,
            title: copy.followUpDocumentTitle,
            value: stats.documentFollowUp,
            subtitle: copy.followUpDocumentSubtitle,
            iconSrc: pendingIcon,
            titleBadgeClass: 'bg-amber-50 text-amber-700',
            valueClass: 'text-amber-500',
            progress: documentPercent,
            progressColor: 'bg-amber-500',
            percentageText: `${documentPercent}%`
          }
        ];
      }

      const count = stats.counts[card.status];
      const percentValue = stats.percent(count);

      return [{
        id: `metric-${card.status.toLowerCase().replace(/\s+/g, '-')}`,
        filterValue: card.status,
        title: card.title,
        value: count,
        subtitle: card.subtitle,
        iconSrc: card.iconSrc,
        titleBadgeClass: card.titleBadgeClass,
        valueClass: card.valueClass,
        progress: percentValue,
        progressColor: card.progressColor,
        percentageText: `${percentValue}%`
      }];
    })
  ];

  return (
    <div id="metrics-grid" className="grid grid-cols-3 gap-2 md:grid-cols-5 xl:grid-cols-9" data-testid="loan-application-metric-strip">
      {cards.map((card) => {
        const isActive = selectedStatus === card.filterValue;

        return (
        <button
          key={card.id}
          id={card.id}
          type="button"
          aria-pressed={isActive}
          aria-label={`${card.title}: ${card.value.toLocaleString()} ${copy.unit}. ${card.percentageText}. ${card.subtitle}`}
          title={card.subtitle}
          onClick={() => onSelectStatus(card.filterValue)}
          className={`flex min-h-[82px] flex-col rounded-xl border bg-white p-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 ${
            isActive ? 'border-red-700 ring-2 ring-red-100' : 'border-slate-100'
          }`}
        >
          <div className="flex min-w-0 items-start justify-between gap-1.5">
            <p className={`line-clamp-2 min-h-7 min-w-0 flex-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase leading-3 tracking-wide ${card.titleBadgeClass}`}>
              {card.title}
            </p>
            <img src={card.iconSrc} alt="" aria-hidden="true" className="h-6 w-6 shrink-0 object-contain" />
          </div>

          <span className="sr-only">{card.subtitle}</span>

          <div className="mt-1 flex items-baseline justify-between gap-1.5">
            <div className="flex min-w-0 items-baseline gap-1">
              <span className={`text-xl font-bold tracking-tight ${card.valueClass}`}>
                {card.value.toLocaleString()}
              </span>
              <span className="truncate text-[9px] font-medium text-slate-400">{copy.unit}</span>
            </div>
            <span className="shrink-0 text-[9px] font-bold text-slate-500">{card.percentageText}</span>
          </div>

          <div className="mt-auto pt-1.5">
            <span className="sr-only">{card.ratioLabel || copy.ratio}</span>
            {card.segments ? (
              <div className="flex h-1 w-full overflow-hidden rounded-full bg-slate-100">
                {card.segments.filter((segment) => segment.width > 0).map((segment) => (
                  <div
                    key={segment.key}
                    className={`h-full transition-all duration-500 ease-out ${segment.color}`}
                    style={{ width: `${segment.width}%` }}
                  />
                ))}
              </div>
            ) : (
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${card.progressColor}`}
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            )}
          </div>
        </button>
      )})}
    </div>
  );
}
