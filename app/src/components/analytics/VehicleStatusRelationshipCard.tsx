/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { tr } from '../../lib/i18n';

export type VehicleStatusRelationshipView = 'matrix' | 'approved' | 'rejected' | 'cancelled';

export interface VehicleStatusModelRow {
  key: string;
  label: string;
  total: number;
  approved: number;
  rejected: number;
  cancelled: number;
  open: number;
  approvalRate: number;
}

export interface ApprovedVehicleModelRow {
  key: string;
  label: string;
  brand: string;
  approved: number;
  approvedLoans: number;
  percentage: number;
}

export interface VehicleRejectCodeRow {
  key: string;
  label: string;
  issue: string;
  value: number;
  percentage: number;
  topModel: string;
  topModelCount: number;
}

export interface VehicleCancellationReasonRow {
  key: string;
  label: string;
  value: number;
  percentage: number;
  topModel: string;
  topModelCount: number;
}

export interface VehicleStatusRelationshipData {
  modelRows: VehicleStatusModelRow[];
  approvedModelRows: ApprovedVehicleModelRow[];
  rejectedCodeRows: VehicleRejectCodeRow[];
  cancellationReasonRows: VehicleCancellationReasonRow[];
  approvedApplications: number;
  approvedLoans: number;
  rejectedApplications: number;
  cancelledApplications: number;
  missingRejectCodeCount: number;
  missingCancellationReasonCount: number;
}

interface VehicleStatusRelationshipCardProps {
  timeframeLabel: string;
  data: VehicleStatusRelationshipData;
}

const VIEW_OPTIONS: { value: VehicleStatusRelationshipView; zh: string; en: string; ms: string }[] = [
  { value: 'matrix', zh: '状态 × 车型', en: 'Status × Model', ms: 'Status × Model' },
  { value: 'approved', zh: '已批核车型', en: 'Approved Models', ms: 'Model Diluluskan' },
  { value: 'rejected', zh: '已拒绝申请 · 拒贷代码', en: 'Rejected Applications · Reject CODE', ms: 'Permohonan Ditolak · KOD Tolak' },
  { value: 'cancelled', zh: '已取消原因', en: 'Cancellation Reasons', ms: 'Sebab Pembatalan' }
];

const RELATIONSHIP_PAGE_SIZE = 5;

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-8 text-center text-sm font-semibold text-slate-400">{text}</td>
    </tr>
  );
}

function SummaryMetric({ label, value, helper, tone }: { label: string; value: React.ReactNode; helper: string; tone: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone}`} />
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      </div>
      <p className="mt-1.5 break-words font-mono text-lg font-bold text-slate-900">{value}</p>
      <p className="mt-1 break-words text-[11px] font-semibold text-slate-400">{helper}</p>
    </div>
  );
}

function CompactPager({ page, total, onPageChange }: { page: number; total: number; onPageChange: (page: number) => void }) {
  if (total === 0) return null;

  const pageCount = Math.max(1, Math.ceil(total / RELATIONSHIP_PAGE_SIZE));
  const start = (page - 1) * RELATIONSHIP_PAGE_SIZE + 1;
  const end = Math.min(page * RELATIONSHIP_PAGE_SIZE, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-2.5">
      <span className="font-mono text-[10px] font-bold text-slate-400">
        {start}–{end} / {total}
      </span>
      <div className="flex items-center gap-2" aria-label={tr('表格分页', 'Table pagination', 'Penomboran halaman jadual')}>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-xs ring-1 ring-slate-200 transition-colors hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {tr('上一页', 'Previous', 'Sebelumnya')}
        </button>
        <span className="min-w-12 text-center font-mono text-[10px] font-bold text-slate-500">{page} / {pageCount}</span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-xs ring-1 ring-slate-200 transition-colors hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {tr('下一页', 'Next', 'Seterusnya')}
        </button>
      </div>
    </div>
  );
}

function VehicleStatusRelationshipCard({ timeframeLabel, data }: VehicleStatusRelationshipCardProps) {
  const [activeView, setActiveView] = React.useState<VehicleStatusRelationshipView>('matrix');
  const [page, setPage] = React.useState(1);
  const topApprovedModel = data.approvedModelRows[0];
  const topRejectedCode = data.rejectedCodeRows[0];
  const topCancellationReason = data.cancellationReasonRows[0];
  const activeTotal = activeView === 'matrix'
    ? data.modelRows.length
    : activeView === 'approved'
      ? data.approvedModelRows.length
      : activeView === 'rejected'
        ? data.rejectedCodeRows.length
        : data.cancellationReasonRows.length;
  const pageCount = Math.max(1, Math.ceil(activeTotal / RELATIONSHIP_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * RELATIONSHIP_PAGE_SIZE;
  const pagedModelRows = data.modelRows.slice(pageStart, pageStart + RELATIONSHIP_PAGE_SIZE);
  const pagedApprovedModelRows = data.approvedModelRows.slice(pageStart, pageStart + RELATIONSHIP_PAGE_SIZE);
  const pagedRejectedCodeRows = data.rejectedCodeRows.slice(pageStart, pageStart + RELATIONSHIP_PAGE_SIZE);
  const pagedCancellationReasonRows = data.cancellationReasonRows.slice(pageStart, pageStart + RELATIONSHIP_PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [activeView, data]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label={tr('申请状态与车辆需求关系', 'Application status and vehicle demand relationship', 'Hubungan status permohonan dan permintaan kenderaan')}>
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{tr('申请状态 × 车辆需求', 'Application Status × Vehicle Demand', 'Status Permohonan × Permintaan Kenderaan')}</h3>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">{timeframeLabel}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{tr('查看哪些车型获批、最常见拒贷代码，以及申请取消原因。', 'See which models were approved, the most common reject CODEs, and why applications were cancelled.', 'Lihat model yang diluluskan, KOD penolakan paling biasa dan sebab permohonan dibatalkan.')}</p>
        </div>
        <div className="flex max-w-full flex-wrap gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label={tr('状态与车辆分析视图', 'Status and vehicle analysis view', 'Paparan analisis status dan kenderaan')}>
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={activeView === option.value}
              onClick={() => setActiveView(option.value)}
              className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors ${activeView === option.value ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tr(option.zh, option.en, option.ms)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryMetric
            label={tr('已批核贷款', 'Approved loans', 'Pinjaman diluluskan')}
            value={data.approvedLoans}
            helper={tr(`共 ${data.approvedApplications} 个已批核申请`, `${data.approvedApplications} approved applications in total`, `${data.approvedApplications} jumlah permohonan diluluskan`)}
            tone="bg-emerald-500"
          />
          <SummaryMetric
            label={tr('最多批核车型', 'Top approved model', 'Model diluluskan teratas')}
            value={topApprovedModel?.label || '-'}
            helper={topApprovedModel ? tr(`${topApprovedModel.approved} 个批核 · ${topApprovedModel.approvedLoans} 个贷款`, `${topApprovedModel.approved} approved · ${topApprovedModel.approvedLoans} loans`, `${topApprovedModel.approved} diluluskan · ${topApprovedModel.approvedLoans} pinjaman`) : tr('本期没有批核车型', 'No approved models this period', 'Tiada model diluluskan tempoh ini')}
            tone="bg-cyan-500"
          />
          <SummaryMetric
            label={tr('最多拒贷代码', 'Top reject CODE', 'KOD penolakan teratas')}
            value={topRejectedCode?.label || '-'}
            helper={topRejectedCode ? tr(`${topRejectedCode.value} 次 · 主要车型 ${topRejectedCode.topModel}`, `${topRejectedCode.value} occurrences · mainly ${topRejectedCode.topModel}`, `${topRejectedCode.value} kejadian · terutamanya ${topRejectedCode.topModel}`) : tr('本期没有已拒绝申请', 'No rejected applications this period', 'Tiada permohonan ditolak tempoh ini')}
            tone="bg-rose-500"
          />
          <SummaryMetric
            label={tr('最多取消原因', 'Top cancellation reason', 'Sebab pembatalan teratas')}
            value={topCancellationReason ? (topCancellationReason.key === 'NO_REASON' ? tr('未记录原因', 'Reason not recorded', 'Sebab tidak direkodkan') : topCancellationReason.label) : '-'}
            helper={topCancellationReason ? tr(`${topCancellationReason.value} 个取消 · 主要车型 ${topCancellationReason.topModel}`, `${topCancellationReason.value} cancellations · mainly ${topCancellationReason.topModel}`, `${topCancellationReason.value} pembatalan · terutamanya ${topCancellationReason.topModel}`) : tr('本期没有已取消申请', 'No cancelled applications this period', 'Tiada permohonan dibatalkan tempoh ini')}
            tone="bg-amber-500"
          />
        </div>

        {(data.missingRejectCodeCount > 0 || data.missingCancellationReasonCount > 0) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
            <span>{tr('数据质量提示', 'Data quality', 'Kualiti data')}</span>
            {data.missingRejectCodeCount > 0 && <span>{data.missingRejectCodeCount === 1
              ? tr('1 个拒绝申请缺少 CODE', '1 rejected application is missing a CODE', '1 permohonan ditolak tiada KOD')
              : tr(`${data.missingRejectCodeCount} 个拒绝申请缺少 CODE`, `${data.missingRejectCodeCount} rejected applications are missing a CODE`, `${data.missingRejectCodeCount} permohonan ditolak tiada KOD`)}</span>}
            {data.missingCancellationReasonCount > 0 && <span>{data.missingCancellationReasonCount === 1
              ? tr('1 个取消申请缺少原因', '1 cancelled application is missing a reason', '1 permohonan dibatalkan tiada sebab')
              : tr(`${data.missingCancellationReasonCount} 个取消申请缺少原因`, `${data.missingCancellationReasonCount} cancelled applications are missing a reason`, `${data.missingCancellationReasonCount} permohonan dibatalkan tiada sebab`)}</span>}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-100">
        {activeView === 'matrix' && (
          <div role="tabpanel">
            <div className="border-b border-slate-100 px-4 py-3">
              <h4 className="text-xs font-bold text-slate-800">{tr('车型状态表现', 'Model Status Performance', 'Prestasi Status Model')}</h4>
              <p className="text-[11px] text-slate-400">{tr('Open 包含 NEW、PENDING、IN PROCESS 与 FOLLOW UP。', 'Open includes NEW, PENDING, IN PROCESS, and FOLLOW UP.', 'Terbuka termasuk NEW, PENDING, IN PROCESS dan FOLLOW UP.')}</p>
            </div>
            <table className="w-full table-fixed text-left text-xs">
              <thead className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="w-[30%] px-4 py-3">{tr('车型', 'Model', 'Model')}</th>
                  <th className="w-[10%] px-2 py-3 text-right">{tr('总数', 'Total', 'Jumlah')}</th>
                  <th className="w-[12%] px-2 py-3 text-right text-emerald-600">{tr('已批核', 'Approved', 'Diluluskan')}</th>
                  <th className="w-[12%] px-2 py-3 text-right text-rose-600">{tr('已拒绝', 'Rejected', 'Ditolak')}</th>
                  <th className="hidden w-[12%] px-2 py-3 text-right text-amber-600 sm:table-cell">{tr('已取消', 'Cancelled', 'Dibatalkan')}</th>
                  <th className="hidden w-[10%] px-2 py-3 text-right text-indigo-600 md:table-cell">Open</th>
                  <th className="w-[14%] px-4 py-3 text-right">{tr('批核率', 'Approval', 'Kelulusan')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedModelRows.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/60">
                    <td className="break-words px-4 py-3 font-semibold text-slate-700">{row.label}</td>
                    <td className="px-2 py-3 text-right font-mono text-slate-600">{row.total}</td>
                    <td className="px-2 py-3 text-right font-mono font-bold text-emerald-600">{row.approved}</td>
                    <td className="px-2 py-3 text-right font-mono font-bold text-rose-600">{row.rejected}</td>
                    <td className="hidden px-2 py-3 text-right font-mono font-bold text-amber-600 sm:table-cell">{row.cancelled}</td>
                    <td className="hidden px-2 py-3 text-right font-mono text-indigo-600 md:table-cell">{row.open}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">{row.approvalRate}%</td>
                  </tr>
                ))}
                {data.modelRows.length === 0 && <EmptyRow colSpan={7} text={tr('当前筛选没有车型状态数据', 'No model status data for the current filters', 'Tiada data status model untuk penapis semasa')} />}
              </tbody>
            </table>
          </div>
        )}

        {activeView === 'approved' && (
          <div role="tabpanel">
            <div className="border-b border-slate-100 px-4 py-3">
              <h4 className="text-xs font-bold text-slate-800">{tr('已批核车型明细', 'Approved Model Detail', 'Butiran Model Diluluskan')}</h4>
              <p className="text-[11px] text-slate-400">{tr('同时显示全部已批核申请与其中选择 Loan 的数量。', 'Shows all approved applications and how many selected Loan.', 'Menunjukkan semua permohonan diluluskan dan jumlah yang memilih Pinjaman.')}</p>
            </div>
            <table className="w-full table-fixed text-left text-xs">
              <thead className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="w-[35%] px-4 py-3">{tr('车型', 'Model', 'Model')}</th>
                  <th className="hidden w-[20%] px-4 py-3 sm:table-cell">{tr('品牌', 'Brand', 'Jenama')}</th>
                  <th className="w-[15%] px-3 py-3 text-right">{tr('已批核', 'Approved', 'Diluluskan')}</th>
                  <th className="w-[15%] px-3 py-3 text-right">Loan</th>
                  <th className="w-[15%] px-4 py-3 text-right">{tr('占比', 'Share', 'Bahagian')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedApprovedModelRows.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/60">
                    <td className="break-words px-4 py-3 font-semibold text-slate-700">{row.label}</td>
                    <td className="hidden break-words px-4 py-3 text-slate-500 sm:table-cell">{row.brand}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-emerald-600">{row.approved}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-600">{row.approvedLoans}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{row.percentage}%</td>
                  </tr>
                ))}
                {data.approvedModelRows.length === 0 && <EmptyRow colSpan={5} text={tr('当前筛选没有已批核车型', 'No approved models for the current filters', 'Tiada model diluluskan untuk penapis semasa')} />}
              </tbody>
            </table>
          </div>
        )}

        {activeView === 'rejected' && (
          <div role="tabpanel">
            <div className="border-b border-slate-100 px-4 py-3">
              <h4 className="text-xs font-bold text-slate-800">{tr('已拒绝申请 · 拒贷代码明细', 'Rejected Applications · Reject CODE Detail', 'Permohonan Ditolak · Butiran KOD Tolak')}</h4>
              <p className="text-[11px] text-slate-400">{tr('一个申请可包含多个 CODE，因此 CODE 次数可能高于拒绝申请数。', 'One application may contain multiple CODEs, so CODE occurrences can exceed rejected applications.', 'Satu permohonan mungkin mempunyai beberapa KOD, jadi kejadian KOD boleh melebihi permohonan ditolak.')}</p>
            </div>
            <table className="w-full table-fixed text-left text-xs">
              <thead className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="w-[16%] px-4 py-3">CODE</th>
                  <th className="w-[34%] px-4 py-3">{tr('问题', 'Issue', 'Isu')}</th>
                  <th className="w-[25%] px-4 py-3">{tr('主要车型', 'Top model', 'Model teratas')}</th>
                  <th className="w-[11%] px-3 py-3 text-right">{tr('次数', 'Count', 'Kiraan')}</th>
                  <th className="w-[14%] px-4 py-3 text-right">{tr('占比', 'Share', 'Bahagian')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedRejectedCodeRows.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 font-mono text-[10px] font-bold ${row.key === 'NO_CODE' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{row.key === 'NO_CODE' ? tr('无 CODE', 'No CODE', 'Tiada KOD') : row.label}</span></td>
                    <td className="break-words px-4 py-3 font-semibold text-slate-700">{row.issue}</td>
                    <td className="break-words px-4 py-3 text-slate-500">{row.topModel} <span className="font-mono text-slate-400">({row.topModelCount})</span></td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-rose-600">{row.value}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{row.percentage}%</td>
                  </tr>
                ))}
                {data.rejectedCodeRows.length === 0 && <EmptyRow colSpan={5} text={tr('当前筛选没有已拒绝申请', 'No rejected applications for the current filters', 'Tiada permohonan ditolak untuk penapis semasa')} />}
              </tbody>
            </table>
          </div>
        )}

        {activeView === 'cancelled' && (
          <div role="tabpanel">
            <div className="border-b border-slate-100 px-4 py-3">
              <h4 className="text-xs font-bold text-slate-800">{tr('已取消申请原因', 'Cancelled Application Reasons', 'Sebab Permohonan Dibatalkan')}</h4>
              <p className="text-[11px] text-slate-400">{tr('优先使用已取消 bank application 的 Cancellation Reason，其次使用类别或申请备注。', 'Uses the cancelled bank application reason first, then its category or the application remarks.', 'Menggunakan sebab permohonan bank dibatalkan dahulu, kemudian kategori atau catatan permohonan.')}</p>
            </div>
            <table className="w-full table-fixed text-left text-xs">
              <thead className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="w-[48%] px-4 py-3">{tr('取消原因', 'Cancellation reason', 'Sebab pembatalan')}</th>
                  <th className="w-[26%] px-4 py-3">{tr('主要车型', 'Top model', 'Model teratas')}</th>
                  <th className="w-[12%] px-3 py-3 text-right">{tr('数量', 'Count', 'Kiraan')}</th>
                  <th className="w-[14%] px-4 py-3 text-right">{tr('占比', 'Share', 'Bahagian')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedCancellationReasonRows.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/60">
                    <td className={`break-words px-4 py-3 font-semibold ${row.key === 'NO_REASON' ? 'text-amber-700' : 'text-slate-700'}`}>{row.key === 'NO_REASON' ? tr('未记录原因', 'Reason not recorded', 'Sebab tidak direkodkan') : row.label}</td>
                    <td className="break-words px-4 py-3 text-slate-500">{row.topModel} <span className="font-mono text-slate-400">({row.topModelCount})</span></td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-amber-600">{row.value}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{row.percentage}%</td>
                  </tr>
                ))}
                {data.cancellationReasonRows.length === 0 && <EmptyRow colSpan={4} text={tr('当前筛选没有已取消申请', 'No cancelled applications for the current filters', 'Tiada permohonan dibatalkan untuk penapis semasa')} />}
              </tbody>
            </table>
          </div>
        )}
          <CompactPager page={safePage} total={activeTotal} onPageChange={setPage} />
        </div>
      </div>
    </section>
  );
}

export default React.memo(VehicleStatusRelationshipCard);
