/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SortableHeader, { type SortDirection, type SortState } from '../../SortableHeader';
import { tr } from '../../../lib/i18n';
import { AnalyticsSection, AssetIcon, MetaBar, StatTile, tra, type StatComparison } from './SectionShell';
import analyticsIcon from '../../../assets/icons/nav/analytics.png';
import calendarIcon from '../../../assets/icons/nav/calendar.png';
import infoIcon from '../../../assets/icons/nav/info.png';
import userIcon from '../../../assets/icons/nav/user.png';

type CustomerProfileBreakdown = 'ageGroup' | 'birthplace' | 'gender';
type CustomerProfileSortKey = 'label' | 'value' | 'percentage';
type CustomerVehicleFilterSort = 'name' | 'quantity';

type CustomerProfileRow = {
  key: string;
  label: string;
  value: number;
  percentage: number;
  meta: string;
  approved?: number;
  topModel?: string;
  averageAge?: number;
};

type CustomerVehicleModelOption = {
  value: string;
  label: string;
  count: number;
};

type DemographicRow = {
  label: string;
  topModel: string;
};

const CUSTOMER_PROFILE_BREAKDOWN_OPTIONS: { value: CustomerProfileBreakdown; label: string }[] = [
  { value: 'ageGroup', label: 'Age Group' },
  { value: 'birthplace', label: 'Birthplace' },
  { value: 'gender', label: 'Gender' }
];

export interface CustomerProfileSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTimeframeLabel: string;
  nricProfileCount: number;
  averageAge: number;
  topAgeGroup?: DemographicRow;
  topBirthPlace?: DemographicRow;
  filteredApplicationsCount: number;
  customerProfileBreakdown: CustomerProfileBreakdown;
  onCustomerProfileBreakdownChange: (value: CustomerProfileBreakdown) => void;
  isVehicleFilterOpen: boolean;
  onToggleVehicleFilter: () => void;
  onCloseVehicleFilter: () => void;
  selectedCustomerVehicleFilterLabel: string;
  customerVehicleFilter: string;
  onCustomerVehicleFilterChange: (value: string) => void;
  customerVehicleFilterSort: CustomerVehicleFilterSort;
  onCustomerVehicleFilterSortChange: (value: CustomerVehicleFilterSort) => void;
  customerVehicleFilterOptions: CustomerVehicleModelOption[];
  selectedCustomerProfileBreakdownLabel: string;
  customerProfileApplicationsCount: number;
  topRow?: CustomerProfileRow;
  rows: CustomerProfileRow[];
  visual: React.ReactNode;
  showDetails: boolean;
  onToggleDetails: () => void;
  sortState: SortState<CustomerProfileSortKey>;
  onSort: (key: CustomerProfileSortKey, defaultDirection?: SortDirection) => void;
  comparisons: {
    nricProfileCount?: StatComparison;
    filteredApplicationsCount?: StatComparison;
    customerProfileApplicationsCount?: StatComparison;
    topRowLabel?: StatComparison;
    topAgeGroupLabel?: StatComparison;
    topBirthPlaceLabel?: StatComparison;
  };
}

function CustomerProfileSection({
  isOpen,
  onToggle,
  activeTimeframeLabel,
  nricProfileCount,
  averageAge,
  topAgeGroup,
  topBirthPlace,
  filteredApplicationsCount,
  customerProfileBreakdown,
  onCustomerProfileBreakdownChange,
  isVehicleFilterOpen,
  onToggleVehicleFilter,
  onCloseVehicleFilter,
  selectedCustomerVehicleFilterLabel,
  customerVehicleFilter,
  onCustomerVehicleFilterChange,
  customerVehicleFilterSort,
  onCustomerVehicleFilterSortChange,
  customerVehicleFilterOptions,
  selectedCustomerProfileBreakdownLabel,
  customerProfileApplicationsCount,
  topRow,
  rows,
  visual,
  showDetails,
  onToggleDetails,
  sortState,
  onSort,
  comparisons
}: CustomerProfileSectionProps) {
  return (
    <AnalyticsSection
      id="customer"
      title={tr('客户画像', 'Customer Profile', "Profil Pelanggan")}
      subtitle={tr('年龄 / 性别 / 出生地', 'Age / gender / birthplace', "Umur / jantina / tempat lahir")}
      icon={<AssetIcon src={userIcon} />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile title="NRIC Parsed" value={nricProfileCount} subtitle={nricProfileCount > 0 ? tr(`平均年龄 ${averageAge}`, `Average age ${averageAge}`, `Purata umur ${averageAge}`) : tr('本时段无有效 IC', 'No valid NRIC in timeframe', "Tiada NRIC yang sah dalam jangka masa")} icon={<AssetIcon src={userIcon} />} tone="bg-transparent" comparison={comparisons.nricProfileCount} />
        <StatTile primary title="Top Age Group" value={topAgeGroup?.label || '-'} subtitle={topAgeGroup ? tr(`${topAgeGroup.topModel} 在该年龄段最热`, `${topAgeGroup.topModel} leads this segment`, `${topAgeGroup.topModel} prospek segmen ini`) : tr('无有效年龄数据', 'No valid age data', "Tiada data umur yang sah")} icon={<AssetIcon src={analyticsIcon} />} tone="bg-transparent" valueClassName="text-base leading-snug" comparison={comparisons.topAgeGroupLabel} />
        <StatTile title="Top Birthplace" value={topBirthPlace?.label || '-'} subtitle={topBirthPlace ? tr(`${topBirthPlace.topModel} 为主力车型`, `${topBirthPlace.topModel} is top model`, `${topBirthPlace.topModel} ialah model teratas`) : tr('无有效出生地数据', 'No valid birthplace data', "Tiada data tempat lahir yang sah")} icon={<AssetIcon src={infoIcon} />} tone="bg-transparent" valueClassName="text-base leading-snug" comparison={comparisons.topBirthPlaceLabel} />
        <StatTile title="Filtered Applications" value={filteredApplicationsCount} subtitle={tr(`${activeTimeframeLabel}记录`, `${activeTimeframeLabel} records`, `${activeTimeframeLabel} rekod`)} icon={<AssetIcon src={calendarIcon} />} tone="bg-transparent" comparison={comparisons.filteredApplicationsCount} />
      </div>

      <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('客户画像表现', 'Customer Profile Performance', "Prestasi Profil Pelanggan")}</h3>
            <p className="text-xs text-slate-400">{tr('客户人口资料，可按车型进一步筛选。', 'Customer demographics with an optional vehicle model filter', "Demografi pelanggan dengan penapis model kenderaan pilihan")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
              {CUSTOMER_PROFILE_BREAKDOWN_OPTIONS.map((option) => (
                <button key={option.value} type="button" onClick={() => onCustomerProfileBreakdownChange(option.value)} className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${customerProfileBreakdown === option.value ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tra(option.label)}
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={onToggleVehicleFilter}
                className={`flex min-h-10 max-w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors ${isVehicleFilterOpen ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                aria-expanded={isVehicleFilterOpen}
              >
                <span className="text-slate-400">{tra('Vehicle')}</span>
                <span className="max-w-[190px] truncate">{selectedCustomerVehicleFilterLabel}</span>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">{isVehicleFilterOpen ? tr('收起', 'Hide', "Sembunyi") : tr('显示全部', 'Show all', "Tunjukkan semua")}</span>
              </button>

              {isVehicleFilterOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-[320px] max-w-[calc(100vw-3rem)] rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl shadow-slate-200/80">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tra('Vehicle Filter')}</p>
                      <p className="max-w-[210px] truncate text-xs font-bold text-slate-800">{selectedCustomerVehicleFilterLabel}</p>
                    </div>
                    <button type="button" onClick={onCloseVehicleFilter} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900">{tr('收起', 'Hide', "Sembunyi")}</button>
                  </div>

                  <div className="mb-3 flex rounded-xl bg-slate-100 p-1">
                    {([
                      { value: 'quantity', label: 'Quantity' },
                      { value: 'name', label: 'A-Z' }
                    ] as const).map((option) => (
                      <button key={option.value} type="button" onClick={() => onCustomerVehicleFilterSortChange(option.value)} className={`flex-1 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-colors ${customerVehicleFilterSort === option.value ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}>
                        {tra(option.label)}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                    {customerVehicleFilterOptions.map((option) => (
                      <button key={option.value} type="button" onClick={() => onCustomerVehicleFilterChange(option.value)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors ${customerVehicleFilter === option.value ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <span className="min-w-0 truncate">{tra(option.label)}</span>
                        <span className="ml-3 flex shrink-0 items-center gap-2">
                          <span className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${customerVehicleFilter === option.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{option.count}</span>
                          <span className={`h-4 w-7 rounded-full p-0.5 transition-colors ${customerVehicleFilter === option.value ? 'bg-white/30' : 'bg-slate-200'}`}>
                            <span className={`block h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${customerVehicleFilter === option.value ? 'translate-x-3' : ''}`} />
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">
          <MetaBar
            sample={customerProfileApplicationsCount}
            items={[
              { label: 'Breakdown', value: tra(selectedCustomerProfileBreakdownLabel) },
              { label: 'Vehicle Filter', value: tra(selectedCustomerVehicleFilterLabel) },
              { label: 'Customers', value: customerProfileApplicationsCount },
              { label: 'Top Result', value: topRow?.label || '-', hideOnSmallSample: true }
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
                      <th className="px-5 py-3"><SortableHeader sortKey="label" label={tra(selectedCustomerProfileBreakdownLabel)} sortState={sortState} onSort={onSort} /></th>
                      <th className="px-5 py-3"><SortableHeader sortKey="value" label={tra('Customers')} sortState={sortState} onSort={onSort} defaultDirection="desc" /></th>
                      <th className="px-5 py-3"><SortableHeader sortKey="percentage" label={tra('Share')} sortState={sortState} onSort={onSort} defaultDirection="desc" /></th>
                      <th className="px-5 py-3">{tra('Profile Signal')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.length > 0 && (
                      <tr className="bg-slate-100/70 font-bold">
                        <td className="px-5 py-3 text-slate-700">{tr('全部', 'All', "Semua")} · {rows.length}</td>
                        <td className="px-5 py-3 font-mono text-slate-700">{rows.reduce((sum, row) => sum + row.value, 0)}</td>
                        <td className="px-5 py-3 font-mono text-slate-500">100%</td>
                        <td className="px-5 py-3" />
                      </tr>
                    )}
                    {rows.map((row) => (
                      <tr key={row.key}>
                        <td className="px-5 py-4 font-semibold text-slate-700">{row.label}</td>
                        <td className="px-5 py-4 font-mono text-slate-600">{row.value}</td>
                        <td className="px-5 py-4 font-mono text-slate-500">{row.percentage}%</td>
                        <td className="px-5 py-4 text-slate-500">
                          {customerProfileBreakdown === 'gender' ? (
                            <span>{row.meta}</span>
                          ) : (
                            <div>
                              <p className="font-semibold text-slate-700">{customerVehicleFilter === 'all' ? row.topModel || '-' : selectedCustomerVehicleFilterLabel}</p>
                              <p className="font-mono text-[10px] text-slate-400">
                                {tr(`${row.approved || 0} 已批核`, `${row.approved || 0} approved`, `${row.approved || 0} diluluskan`)}
                                {typeof row.averageAge === 'number' ? tr(` · 平均 ${row.averageAge} 岁`, ` · ${row.averageAge} yrs avg`, `· Purata ${row.averageAge} thn`) : ''}
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">{tr('当前时间段没有可解析的客户画像数据', 'No parsable customer profile data in this timeframe', "Tiada data profil pelanggan yang boleh dihuraikan dalam jangka masa ini")}</td>
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

export default React.memo(CustomerProfileSection);
