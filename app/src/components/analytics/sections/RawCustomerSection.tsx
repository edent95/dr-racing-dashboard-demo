/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SortableHeader, { type SortDirection, type SortState } from '../../SortableHeader';
import { tr } from '../../../lib/i18n';
import { AnalyticsSection, AssetIcon, MetaBar, StatTile, tra, type StatComparison } from './SectionShell';
import duplicatePhonesIcon from '../../../assets/icons/nav/duplicatePhones.png';
import inCustomersIcon from '../../../assets/icons/nav/inCustomers.png';
import missionTargetIcon from '../../../assets/icons/nav/missionTarget.png';
import totalLeadsIcon from '../../../assets/icons/nav/totalLeads.png';
import uniquePhonesIcon from '../../../assets/icons/nav/uniquePhones.png';

type RawCustomerBreakdown = 'channel' | 'status' | 'sourceTraffic';
type RawCustomerSortKey = 'label' | 'value' | 'percentage';

type AggregateRow = {
  key: string;
  label: string;
  value: number;
  percentage: number;
};

const RAW_CUSTOMER_BREAKDOWN_OPTIONS: { value: RawCustomerBreakdown; label: string }[] = [
  { value: 'channel', label: 'Channel' },
  { value: 'status', label: 'Status' },
  { value: 'sourceTraffic', label: 'Source Traffic' }
];

export interface RawCustomerSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTimeframeLabel: string;
  filteredRawLeadsCount: number;
  rawLeadsApplied: number;
  rawLeadsPotential: number;
  uniqueRawPhones: number;
  duplicatedRawPhoneCount: number;
  rawCustomerBreakdown: RawCustomerBreakdown;
  onRawCustomerBreakdownChange: (value: RawCustomerBreakdown) => void;
  selectedRawCustomerBreakdownLabel: string;
  rows: AggregateRow[];
  topRow?: AggregateRow;
  visual: React.ReactNode;
  showDetails: boolean;
  onToggleDetails: () => void;
  sortState: SortState<RawCustomerSortKey>;
  onSort: (key: RawCustomerSortKey, defaultDirection?: SortDirection) => void;
  comparisons: {
    filteredRawLeadsCount?: StatComparison;
    rawLeadsApplied?: StatComparison;
    rawLeadsPotential?: StatComparison;
    uniqueRawPhones?: StatComparison;
    duplicatedRawPhoneCount?: StatComparison;
    rowsCount?: StatComparison;
    topRowLabel?: StatComparison;
    topRowShare?: StatComparison;
  };
}

function RawCustomerSection({
  isOpen,
  onToggle,
  activeTimeframeLabel,
  filteredRawLeadsCount,
  rawLeadsApplied,
  rawLeadsPotential,
  uniqueRawPhones,
  duplicatedRawPhoneCount,
  rawCustomerBreakdown,
  onRawCustomerBreakdownChange,
  selectedRawCustomerBreakdownLabel,
  rows,
  topRow,
  visual,
  showDetails,
  onToggleDetails,
  sortState,
  onSort,
  comparisons
}: RawCustomerSectionProps) {
  return (
    <AnalyticsSection
      id="rawCustomer"
      title={tr('潜在客户名单', 'Lead Pool', "Kumpulan Prospek")}
      subtitle={tr('名单转化情况', 'Lead conversion', "penukaran prospek")}
      icon={<AssetIcon src={totalLeadsIcon} />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile primary title={tr('名单总数', 'Total Leads', "Jumlah prospek")} value={filteredRawLeadsCount} subtitle={tr(`${activeTimeframeLabel}潜在客户记录`, `${activeTimeframeLabel} lead records`, `${activeTimeframeLabel} rekod prospek`)} icon={<AssetIcon src={totalLeadsIcon} />} tone="bg-transparent" comparison={comparisons.filteredRawLeadsCount} />
        <StatTile title={tr('已申请', 'Already Applied', "Sudah Dimohon")} value={rawLeadsApplied} subtitle={tr('电话、IC、户口或电邮已匹配到贷款申请', 'Matched to applications by phone, IC, account, or email', "Dipadankan dengan permohonan melalui telefon, IC, akaun atau e-mel")} icon={<AssetIcon src={inCustomersIcon} />} tone="bg-transparent" comparison={comparisons.rawLeadsApplied} />
        <StatTile title={tr('潜在客户', 'Potential Leads', "Prospek yang berpotensi")} value={rawLeadsPotential} subtitle={tr('还没匹配到贷款申请', 'No matching application yet', "Belum ada permohonan yang sepadan")} icon={<AssetIcon src={missionTargetIcon} />} tone="bg-transparent" comparison={comparisons.rawLeadsPotential} />
        <StatTile title={tr('不重复号码', 'Unique Phones', "Telefon Unik")} value={uniqueRawPhones} subtitle={tr('整理后的电话号码数量', 'Phone numbers after normalisation', "Nombor telefon selepas normalisasi")} icon={<AssetIcon src={uniquePhonesIcon} />} tone="bg-transparent" comparison={comparisons.uniqueRawPhones} />
        <StatTile title={tr('重复号码', 'Dup Phones', "Telefon Dup")} value={duplicatedRawPhoneCount} subtitle={tr('出现超过一次的电话号码', 'Phone numbers appearing more than once', "Nombor telefon muncul lebih daripada sekali")} icon={<AssetIcon src={duplicatePhonesIcon} />} tone="bg-transparent" comparison={comparisons.duplicatedRawPhoneCount} />
      </div>

      <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('潜在客户表现', 'Lead Performance', "Prestasi prospek")}</h3>
            <p className="text-xs text-slate-400">{tr('一张图查看名单渠道、状态或来源流量。', 'One chart for lead channel, status, or source traffic', "Satu carta untuk saluran prospek, status atau trafik sumber")}</p>
          </div>
          <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
            {RAW_CUSTOMER_BREAKDOWN_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onRawCustomerBreakdownChange(option.value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${rawCustomerBreakdown === option.value ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tra(option.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          <MetaBar
            sample={rows.reduce((sum, row) => sum + row.value, 0)}
            items={[
              { label: 'Breakdown', value: tra(selectedRawCustomerBreakdownLabel) },
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
                      <th className="px-5 py-3"><SortableHeader sortKey="label" label={tra(selectedRawCustomerBreakdownLabel)} sortState={sortState} onSort={onSort} /></th>
                      <th className="px-5 py-3"><SortableHeader sortKey="value" label={tra('Leads')} sortState={sortState} onSort={onSort} defaultDirection="desc" /></th>
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
                        <td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-400">{tr('当前时间段没有名单数据', 'No lead data in this timeframe', "Tiada data prospek dalam jangka masa ini")}</td>
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

export default React.memo(RawCustomerSection);
