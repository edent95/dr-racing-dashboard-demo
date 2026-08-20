/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SortableHeader, { type SortDirection, type SortState } from '../../SortableHeader';
import { tr } from '../../../lib/i18n';
import { AnalyticsSection, AssetIcon, MetaBar, SampleBadge, StatTile, tra, type StatComparison } from './SectionShell';
import analyticsIcon from '../../../assets/icons/nav/analytics.png';
import missionTargetIcon from '../../../assets/icons/nav/missionTarget.png';
import vehicleInfoIcon from '../../../assets/icons/nav/vehicleInfo.png';

type VehicleDemandBreakdown = 'model' | 'brand';
type VehicleConditionFilter = 'all' | 'New' | 'Used' | 'not_set';
type PurchaseMethodFilter = 'all' | 'Loan' | 'Cash' | 'not_set';
type VehicleDemandSortKey = 'label' | 'value' | 'approvedUnits' | 'approvalRate' | 'percentage';

type VehicleModelRow = {
  label: string;
  value: number;
  percentage: number;
};

type VehicleDemandRow = {
  key: string;
  label: string;
  value: number;
  approvedUnits: number;
  approvalRate: number;
  percentage: number;
  meta: string;
};

const VEHICLE_DEMAND_BREAKDOWN_OPTIONS: { value: VehicleDemandBreakdown; label: string }[] = [
  { value: 'model', label: 'Model' },
  { value: 'brand', label: 'Brand' }
];

const VEHICLE_CONDITION_FILTER_OPTIONS: { value: VehicleConditionFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'New', label: 'New' },
  { value: 'Used', label: 'Used' },
  { value: 'not_set', label: 'Not set' }
];

const PURCHASE_METHOD_FILTER_OPTIONS: { value: PurchaseMethodFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Loan', label: 'Loan' },
  { value: 'Cash', label: 'Cash' },
  { value: 'not_set', label: 'Not set' }
];

export interface VehicleDemandSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  totalVehicleUnits: number;
  vehicleStockRowsCount: number;
  topVehicleModel?: VehicleModelRow;
  loansByVehicleBrandCount: number;
  vehicleDemandBreakdown: VehicleDemandBreakdown;
  onVehicleDemandBreakdownChange: (value: VehicleDemandBreakdown) => void;
  vehicleConditionFilter: VehicleConditionFilter;
  onVehicleConditionFilterChange: (value: VehicleConditionFilter) => void;
  purchaseMethodFilter: PurchaseMethodFilter;
  onPurchaseMethodFilterChange: (value: PurchaseMethodFilter) => void;
  selectedVehicleConditionFilterLabel: string;
  selectedPurchaseMethodFilterLabel: string;
  selectedVehicleDemandBreakdownLabel: string;
  filteredVehicleDemandApplicationsCount: number;
  vehicleDemandTotalUnits: number;
  vehicleDemandApprovedUnits: number;
  vehicleDemandApprovedLoanUnits: number;
  vehicleDemandApprovalRate: number;
  vehicleDemandTopSegment?: { label: string };
  visual: React.ReactNode;
  showDetails: boolean;
  onToggleDetails: () => void;
  rows: VehicleDemandRow[];
  sortState: SortState<VehicleDemandSortKey>;
  onSort: (key: VehicleDemandSortKey, defaultDirection?: SortDirection) => void;
  comparisons: {
    totalVehicleUnits?: StatComparison;
    topVehicleModelLabel?: StatComparison;
    topVehicleModelShare?: StatComparison;
    loansByVehicleBrandCount?: StatComparison;
    vehicleDemandTotalUnits?: StatComparison;
    vehicleDemandApprovedUnits?: StatComparison;
    vehicleDemandApprovalRate?: StatComparison;
    vehicleDemandTopSegment?: StatComparison;
  };
}

function VehicleDemandSection({
  isOpen,
  onToggle,
  totalVehicleUnits,
  vehicleStockRowsCount,
  topVehicleModel,
  loansByVehicleBrandCount,
  vehicleDemandBreakdown,
  onVehicleDemandBreakdownChange,
  vehicleConditionFilter,
  onVehicleConditionFilterChange,
  purchaseMethodFilter,
  onPurchaseMethodFilterChange,
  selectedVehicleConditionFilterLabel,
  selectedPurchaseMethodFilterLabel,
  selectedVehicleDemandBreakdownLabel,
  filteredVehicleDemandApplicationsCount,
  vehicleDemandTotalUnits,
  vehicleDemandApprovedUnits,
  vehicleDemandApprovedLoanUnits,
  vehicleDemandApprovalRate,
  vehicleDemandTopSegment,
  visual,
  showDetails,
  onToggleDetails,
  rows,
  sortState,
  onSort,
  comparisons
}: VehicleDemandSectionProps) {
  return (
    <AnalyticsSection
      id="vehicle"
      title={tr('车辆需求', 'Vehicle Demand', "Permintaan Kenderaan")}
      subtitle={tr('型号与品牌分布', 'By model & brand', "Mengikut model & jenama")}
      icon={<AssetIcon src={vehicleInfoIcon} />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          primary
          title="Vehicle Units"
          value={totalVehicleUnits}
          subtitle={tr(`${vehicleStockRowsCount} 种车型 · 按车牌统计`, `${vehicleStockRowsCount} model types counted by plate number`, `${vehicleStockRowsCount} jenis model dikira mengikut nombor plat`)}
          icon={<AssetIcon src={vehicleInfoIcon} />}
          tone="bg-transparent"
          comparison={comparisons.totalVehicleUnits}
        />
        <StatTile
          title="Top Model"
          value={topVehicleModel?.label || '-'}
          subtitle={topVehicleModel ? tr(`${topVehicleModel.value} 台 · 占库存 ${topVehicleModel.percentage}%`, `${topVehicleModel.value} units · ${topVehicleModel.percentage}% of stock`, `${topVehicleModel.value} unit · ${topVehicleModel.percentage}% daripada stok`) : tr('暂无车型数据', 'No vehicle model data', "Tiada data model kenderaan")}
          icon={<AssetIcon src={analyticsIcon} />}
          tone="bg-transparent"
          valueClassName="text-base leading-snug"
          comparison={comparisons.topVehicleModelLabel}
        />
        <StatTile
          title="Best Mix Share"
          value={topVehicleModel ? `${topVehicleModel.percentage}%` : '0%'}
          subtitle={topVehicleModel ? tr(`${topVehicleModel.label} 当前库存占比最高`, `${topVehicleModel.label} currently has highest stock share`, `${topVehicleModel.label} pada masa ini mempunyai bahagian saham tertinggi`) : tr('还没有库存占比', 'No stock share yet', "Tiada saham saham lagi")}
          icon={<AssetIcon src={missionTargetIcon} />}
          tone="bg-transparent"
          comparison={comparisons.topVehicleModelShare}
          badge={<SampleBadge total={totalVehicleUnits} />}
        />
        <StatTile
          title="Vehicle Brands"
          value={loansByVehicleBrandCount}
          subtitle="Brand demand in selected timeframe"
          icon={<AssetIcon src={vehicleInfoIcon} />}
          tone="bg-transparent"
          comparison={comparisons.loansByVehicleBrandCount}
        />
      </div>

      <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('车辆需求分析', 'Vehicle Demand Analysis', "Analisis Permintaan Kenderaan")}</h3>
            <p className="text-xs text-slate-400">{tr('按车型或品牌查看，并可筛选新车/二手与贷款/现金。', 'Model or brand view with New / Used and Loan / Cash filters', "Paparan model atau jenama dengan penapis Baharu / Terpakai dan Pinjaman / Tunai")}</p>
          </div>
          <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tra('View')}</span>
              <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
                {VEHICLE_DEMAND_BREAKDOWN_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onVehicleDemandBreakdownChange(option.value)}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                      vehicleDemandBreakdown === option.value
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tra(option.label)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tra('New / Used')}</span>
              <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
                {VEHICLE_CONDITION_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onVehicleConditionFilterChange(option.value)}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                      vehicleConditionFilter === option.value
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tra(option.label)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tra('Loan / Cash')}</span>
              <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
                {PURCHASE_METHOD_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onPurchaseMethodFilterChange(option.value)}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                      purchaseMethodFilter === option.value
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tra(option.label)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <MetaBar
            sample={vehicleDemandTotalUnits}
            items={[
              { label: 'Total Units', value: vehicleDemandTotalUnits },
              { label: 'Approved Sales', value: vehicleDemandApprovedUnits },
              { label: 'Approved Loans', value: vehicleDemandApprovedLoanUnits },
              { label: 'Approval Rate', value: `${vehicleDemandApprovalRate}%`, hideOnSmallSample: true },
              { label: 'Top Segment', value: vehicleDemandTopSegment?.label || '-', hideOnSmallSample: true }
            ]}
          />
          <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
            {tr('当前筛选', 'Active filters', "Penapis aktif")}: {tra('New / Used')} <span className="text-slate-800">{tra(selectedVehicleConditionFilterLabel)}</span> · {tra('Loan / Cash')} <span className="text-slate-800">{tra(selectedPurchaseMethodFilterLabel)}</span> · <span className="font-mono text-slate-800">{filteredVehicleDemandApplicationsCount}</span> {tr('单申请', 'applications', "permohonan")}
          </div>

          <div className="mb-5">{visual}</div>

          <div className="border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onToggleDetails}
              className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
            >
              {showDetails ? tr('收起明细', 'Hide Details', "Sembunyikan Butiran") : tr(`显示明细（${rows.length}）`, `Show Details (${rows.length})`, `Tunjukkan Butiran (${rows.length})`)}
            </button>

            {showDetails && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">
                        <SortableHeader sortKey="label" label={tra(selectedVehicleDemandBreakdownLabel)} sortState={sortState} onSort={onSort} />
                      </th>
                      <th className="px-5 py-3">
                        <SortableHeader sortKey="value" label={tra('Units')} sortState={sortState} onSort={onSort} defaultDirection="desc" />
                      </th>
                      <th className="px-5 py-3">
                        <SortableHeader sortKey="approvedUnits" label={tra('Approved')} sortState={sortState} onSort={onSort} defaultDirection="desc" />
                      </th>
                      <th className="px-5 py-3">
                        <SortableHeader sortKey="approvalRate" label={tra('Approval Rate')} sortState={sortState} onSort={onSort} defaultDirection="desc" />
                      </th>
                      <th className="px-5 py-3">
                        <SortableHeader sortKey="percentage" label={tra('Share')} sortState={sortState} onSort={onSort} defaultDirection="desc" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.length > 0 && (
                      <tr className="bg-slate-100/70 font-bold">
                        <td className="px-5 py-3 text-slate-700">{tr('全部', 'All', "Semua")} · {rows.length}</td>
                        <td className="px-5 py-3 font-mono text-slate-700">{rows.reduce((sum, row) => sum + row.value, 0)}</td>
                        <td className="px-5 py-3 font-mono text-slate-700">{rows.reduce((sum, row) => sum + row.approvedUnits, 0)}</td>
                        <td className="px-5 py-3 text-slate-400">—</td>
                        <td className="px-5 py-3 font-mono text-slate-500">100%</td>
                      </tr>
                    )}
                    {rows.map((row) => (
                      <tr key={row.key}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-700">{row.label}</p>
                          <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{row.meta}</p>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600">{row.value}</td>
                        <td className="px-5 py-4 font-mono text-slate-600">{row.approvedUnits}</td>
                        <td className="px-5 py-4 font-mono text-slate-500">{row.approvalRate}%</td>
                        <td className="px-5 py-4 font-mono text-slate-500">{row.percentage}%</td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                          {tr('还没有车辆需求数据', 'No vehicle demand data yet', "Belum ada data permintaan kenderaan")}
                        </td>
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

export default React.memo(VehicleDemandSection);
