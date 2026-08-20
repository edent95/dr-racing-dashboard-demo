/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SortableHeader, { type SortDirection, type SortState } from '../../SortableHeader';
import { tr } from '../../../lib/i18n';
import { AnalyticsSection, AssetIcon, CompareSummaryTile, MetaBar, tra, type StatComparison } from './SectionShell';
import rejectedIcon from '../../../assets/icons/nav/rejected.png';
import totalLeadsIcon from '../../../assets/icons/nav/totalLeads.png';

type OperationsBreakdown = 'status' | 'staff' | 'role';
type OperationsSortKey = 'label' | 'value' | 'percentage';

type AggregateRow = {
  key: string;
  label: string;
  value: number;
  percentage: number;
};

type RejectedCodeRow = AggregateRow & {
  issue: string;
  customerRequest: string;
};

const OPERATIONS_BREAKDOWN_OPTIONS: { value: OperationsBreakdown; label: string }[] = [
  { value: 'status', label: 'Loan Status' },
  { value: 'staff', label: 'Staff Workload' },
  { value: 'role', label: 'Role Accounts' }
];

const REJECTED_CODE_DETAIL_LIMIT = 6;

export interface OperationsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  comparisonActive: boolean;
  comparisonLabels?: {
    primary: string;
    secondary: string;
  };
  rejectedCodeRows: RejectedCodeRow[];
  secondaryRejectedCodeRowsCount?: number;
  topRejectedCodeLabel: string;
  secondaryTopRejectedCodeLabel?: string;
  rejectedLoans: number;
  secondaryRejectedLoans?: number;
  rejectedCodeVisual: React.ReactNode;
  operationsBreakdown: OperationsBreakdown;
  onOperationsBreakdownChange: (value: OperationsBreakdown) => void;
  selectedOperationsBreakdownLabel: string;
  selectedOperationsValueLabel: string;
  rows: AggregateRow[];
  topRow?: AggregateRow;
  visual: React.ReactNode;
  showDetails: boolean;
  onToggleDetails: () => void;
  sortState: SortState<OperationsSortKey>;
  onSort: (key: OperationsSortKey, defaultDirection?: SortDirection) => void;
  comparisons: {
    rowsCount?: StatComparison;
    topRowLabel?: StatComparison;
    topRowShare?: StatComparison;
  };
}

function OperationsSection({
  isOpen,
  onToggle,
  comparisonActive,
  comparisonLabels,
  rejectedCodeRows,
  secondaryRejectedCodeRowsCount = 0,
  topRejectedCodeLabel,
  secondaryTopRejectedCodeLabel = '-',
  rejectedLoans,
  secondaryRejectedLoans = 0,
  rejectedCodeVisual,
  operationsBreakdown,
  onOperationsBreakdownChange,
  selectedOperationsBreakdownLabel,
  selectedOperationsValueLabel,
  rows,
  topRow,
  visual,
  showDetails,
  onToggleDetails,
  sortState,
  onSort,
  comparisons
}: OperationsSectionProps) {
  return (
    <AnalyticsSection
      id="operations"
      title={tr('运营表现', 'Operations', "operasi")}
      subtitle={tr('状态 / 工作量 / 拒贷原因', 'Status / workload / rejects', "Status / beban kerja / penolakan")}
      icon={<AssetIcon src={totalLeadsIcon} />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {comparisonActive && comparisonLabels && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CompareSummaryTile title="REJECT CODE Rows" primaryValue={rejectedCodeRows.length} secondaryValue={secondaryRejectedCodeRowsCount} primaryLabel={comparisonLabels.primary} secondaryLabel={comparisonLabels.secondary} />
          <CompareSummaryTile title="Top REJECT CODE" primaryValue={topRejectedCodeLabel} secondaryValue={secondaryTopRejectedCodeLabel} primaryLabel={comparisonLabels.primary} secondaryLabel={comparisonLabels.secondary} />
          <CompareSummaryTile title="Rejected Loans" primaryValue={rejectedLoans} secondaryValue={secondaryRejectedLoans} primaryLabel={comparisonLabels.primary} secondaryLabel={comparisonLabels.secondary} inverse />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="min-w-0">{rejectedCodeVisual}</div>
        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{tr('拒贷代码明细', 'Rejected Loan CODE Detail', "Butiran KOD Pinjaman Ditolak")}</h3>
              <p className="text-xs text-slate-400">{tr('只统计最终状态为 REJECT 的失败原因代码。', 'Only counts reject codes where the final loan status is REJECT.', "Hanya mengira kod penolakan di mana status pinjaman terakhir adalah TOLAK.")}</p>
            </div>
            <AssetIcon src={rejectedIcon} className="h-10 w-10" />
          </div>
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-left text-xs">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[34%]" />
                <col className="w-[24%]" />
                <col className="w-[9%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">CODE</th>
                  <th className="px-4 py-3">{tr('问题', 'Issue', "Isu")}</th>
                  <th className="px-4 py-3">{tr('客户要求', 'Customer Request', "Permintaan Pelanggan")}</th>
                  <th className="px-4 py-3">{tr('拒贷数', 'Rejects', "Menolak")}</th>
                  <th className="px-4 py-3">{tra('Share')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rejectedCodeRows.slice(0, REJECTED_CODE_DETAIL_LIMIT).map((row) => (
                  <tr key={row.key}>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${row.key === 'NO_CODE' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{row.label}</span>
                    </td>
                    <td className="px-4 py-4 align-top"><p className="break-words font-semibold text-slate-700">{row.issue}</p></td>
                    <td className="px-4 py-4 align-top"><p className="break-words text-slate-500">{row.customerRequest}</p></td>
                    <td className="px-4 py-4 align-top font-mono text-slate-600">{row.value}</td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="w-10 shrink-0 font-mono text-slate-500">{row.percentage}%</span>
                        <div className="h-2 flex-1 rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.max(row.percentage, 3)}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {rejectedCodeRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">{tr('当前时间段没有已拒绝的贷款代码', 'No rejected loan codes in this timeframe', "Tiada kod pinjaman yang ditolak dalam tempoh masa ini")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('运营表现', 'Operations Performance', "Prestasi Operasi")}</h3>
            <p className="text-xs text-slate-400">{tr('一张图查看贷款状态、员工工作量或角色账号分布。', 'One chart for loan status, staff workload, or role account distribution', "Satu carta untuk status pinjaman, beban kerja kakitangan atau pengagihan akaun peranan")}</p>
          </div>
          <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
            {OPERATIONS_BREAKDOWN_OPTIONS.map((option) => (
              <button key={option.value} type="button" onClick={() => onOperationsBreakdownChange(option.value)} className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${operationsBreakdown === option.value ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}>
                {tra(option.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          <MetaBar
            sample={rows.reduce((sum, row) => sum + row.value, 0)}
            items={[
              { label: 'Breakdown', value: tra(selectedOperationsBreakdownLabel) },
              { label: 'Rows', value: rows.length },
              { label: 'Top Result', value: topRow?.label || '-' },
              { label: 'Share', value: `${topRow?.percentage || 0}%`, hideOnSmallSample: true }
            ]}
          />

          {visual}

          <div className="mt-5 border-t border-slate-100 pt-4">
            <button type="button" onClick={onToggleDetails} className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900">
              {showDetails ? tr('收起明细', 'Hide Details', "Sembunyikan Butiran") : tr(`显示明细（${rows.length}）`, `Show Details (${rows.length})`, `Tunjukkan Butiran (${rows.length})`)}
            </button>

            {showDetails && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3"><SortableHeader sortKey="label" label={tra(selectedOperationsBreakdownLabel)} sortState={sortState} onSort={onSort} /></th>
                      <th className="px-5 py-3"><SortableHeader sortKey="value" label={tra(selectedOperationsValueLabel)} sortState={sortState} onSort={onSort} defaultDirection="desc" /></th>
                      <th className="px-5 py-3"><SortableHeader sortKey="percentage" label={tra('Share')} sortState={sortState} onSort={onSort} defaultDirection="desc" /></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.length > 0 && (
                      <tr className="bg-slate-100/70 font-bold">
                        <td className="px-5 py-3 text-slate-700">{tr('全部', 'All', "Semua")} · {rows.length}</td>
                        <td className="px-5 py-3 font-mono text-slate-700">{rows.reduce((sum, row) => sum + row.value, 0)}</td>
                        <td className="px-5 py-3 font-mono text-slate-500">100%</td>
                      </tr>
                    )}
                    {rows.map((row) => (
                      <tr key={row.key}>
                        <td className="px-5 py-4 font-semibold text-slate-700">{row.label}</td>
                        <td className="px-5 py-4 font-mono text-slate-600">{row.value}</td>
                        <td className="px-5 py-4 font-mono text-slate-500">{row.percentage}%</td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-400">{tr('还没有运营数据', 'No operations data yet', "Tiada data operasi lagi")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </AnalyticsSection>
  );
}

export default React.memo(OperationsSection);
