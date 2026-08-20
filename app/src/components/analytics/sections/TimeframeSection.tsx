/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { tr } from '../../../lib/i18n';
import { AnalyticsSection, AssetIcon, SampleBadge, StatTile, type StatComparison } from './SectionShell';
import approvedIcon from '../../../assets/icons/nav/approved.png';
import calendarIcon from '../../../assets/icons/nav/calendar.png';
import missionTargetIcon from '../../../assets/icons/nav/missionTarget.png';
import rejectedIcon from '../../../assets/icons/nav/rejected.png';
import urgentIcon from '../../../assets/icons/nav/urgent.png';
import vehicleInfoIcon from '../../../assets/icons/nav/vehicleInfo.png';

type TopModel = {
  label: string;
  value: number;
  approvedUnits?: number;
};

type TopRejectedCode = {
  label: string;
  value: number;
  issue: string;
};

export interface TimeframeSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTimeframeLabel: string;
  selectedTopSaleModel?: TopModel;
  selectedTopModel?: TopModel;
  approvalRate: number;
  approvedLoans: number;
  rejectedLoans: number;
  approvedVehicleUnits: number;
  topRejectedCode?: TopRejectedCode;
  missingRejectCodeCount: number;
  comparisons: {
    selectedTopSaleModel?: StatComparison;
    selectedTopModel?: StatComparison;
    approvalRate?: StatComparison;
    approvedVehicleUnits?: StatComparison;
    topRejectedCode?: StatComparison;
    missingRejectCodeCount?: StatComparison;
  };
}

function TimeframeSection({
  isOpen,
  onToggle,
  activeTimeframeLabel,
  selectedTopSaleModel,
  selectedTopModel,
  approvalRate,
  approvedLoans,
  rejectedLoans,
  approvedVehicleUnits,
  topRejectedCode,
  missingRejectCodeCount,
  comparisons
}: TimeframeSectionProps) {
  return (
    <AnalyticsSection
      id="timeframe"
      title={tr('销售时间段', 'Sales Timeframe', "Jangka Masa Jualan")}
      subtitle={tr('热销与审批结果', 'Top models & approvals', "Model & kelulusan teratas")}
      icon={<AssetIcon src={calendarIcon} />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatTile
          title="Top Sale"
          value={selectedTopSaleModel?.label || '-'}
          subtitle={selectedTopSaleModel ? tr(`${selectedTopSaleModel.approvedUnits || selectedTopSaleModel.value} 台批核/成交 · ${activeTimeframeLabel}`, `${selectedTopSaleModel.approvedUnits || selectedTopSaleModel.value} approved/sales units in ${activeTimeframeLabel}`, `${selectedTopSaleModel.approvedUnits || selectedTopSaleModel.value} diluluskan/unit jualan dalam ${activeTimeframeLabel}`) : tr(`${activeTimeframeLabel}暂无批核成交`, `No approved sale in ${activeTimeframeLabel}`, `Tiada jualan diluluskan dalam ${activeTimeframeLabel}`)}
          icon={<AssetIcon src={missionTargetIcon} />}
          tone="bg-transparent"
          valueClassName="text-base leading-snug"
          comparison={comparisons.selectedTopSaleModel}
        />
        <StatTile
          title="Top Model"
          value={selectedTopModel?.label || '-'}
          subtitle={selectedTopModel ? tr(`${selectedTopModel.value} 单申请 · ${activeTimeframeLabel}`, `${selectedTopModel.value} applications in ${activeTimeframeLabel}`, `${selectedTopModel.value} permohonan dalam ${activeTimeframeLabel}`) : tr(`${activeTimeframeLabel}暂无车型数据`, `No model data in ${activeTimeframeLabel}`, `Tiada data model dalam ${activeTimeframeLabel}`)}
          icon={<AssetIcon src={vehicleInfoIcon} />}
          tone="bg-transparent"
          valueClassName="text-base leading-snug"
          comparison={comparisons.selectedTopModel}
        />
        <StatTile
          primary
          title="Approval Rate"
          value={`${approvalRate}%`}
          subtitle={tr(`${approvedLoans} 批核 · ${rejectedLoans} 拒贷`, `${approvedLoans} approved · ${rejectedLoans} rejected loans`, `${approvedLoans} diluluskan · ${rejectedLoans} menolak pinjaman`)}
          icon={<AssetIcon src={approvedIcon} />}
          tone="bg-transparent"
          comparison={comparisons.approvalRate}
          badge={<SampleBadge total={approvedLoans + rejectedLoans} />}
        />
        <StatTile
          title="Approved Units"
          value={approvedVehicleUnits}
          subtitle="Approved loan records counted by unique plate"
          icon={<AssetIcon src={approvedIcon} />}
          tone="bg-transparent"
          comparison={comparisons.approvedVehicleUnits}
        />
        <StatTile
          title="Top Reject CODE"
          value={topRejectedCode?.label || '-'}
          subtitle={topRejectedCode ? tr(`${topRejectedCode.value} 拒 · ${topRejectedCode.issue}`, `${topRejectedCode.value} rejected · ${topRejectedCode.issue}`, `${topRejectedCode.value} ditolak · ${topRejectedCode.issue}`) : tr('本时段暂无拒贷代码', 'No rejected CODE in timeframe', "Tiada KOD ditolak dalam jangka masa")}
          icon={<AssetIcon src={rejectedIcon} />}
          tone="bg-transparent"
          valueClassName="text-base leading-snug"
          comparison={comparisons.topRejectedCode}
        />
        <StatTile
          title="Missing Reject CODE"
          value={missingRejectCodeCount}
          subtitle="Rejected loans without final CODE"
          icon={<AssetIcon src={urgentIcon} />}
          tone="bg-transparent"
          comparison={comparisons.missingRejectCodeCount}
        />
      </div>
    </AnalyticsSection>
  );
}

export default React.memo(TimeframeSection);
