/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ClipboardList, Minus, Phone } from 'lucide-react';
import ToggleOptionGroup from './ToggleOptionGroup';
import type { LoanApplication, PurchaseMethod, VehicleCondition } from '../types';
import { AppLanguage, tr } from '../lib/i18n';

export type VehicleInfoMissionDraft = {
  vehicle_condition: VehicleCondition;
  purchase_method: PurchaseMethod;
};

type VehicleInfoMission = Pick<LoanApplication, 'id' | 'applicant_name' | 'phone_no' | 'vehicle_model' | 'vehicle_condition' | 'purchase_method'>;

interface StaffVehicleInfoMissionPanelProps {
  drafts: Record<string, VehicleInfoMissionDraft>;
  language: AppLanguage;
  missions: VehicleInfoMission[];
  onComplete: (applicationId: string) => void;
  onUpdateDraft: (applicationId: string, draft: VehicleInfoMissionDraft) => void;
}

export default function StaffVehicleInfoMissionPanel({
  drafts,
  language,
  missions,
  onComplete,
  onUpdateDraft
}: StaffVehicleInfoMissionPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (missions.length === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-amber-100 bg-white p-4 shadow-2xl shadow-slate-200/70 ${isMinimized ? 'w-auto min-w-[240px]' : ''}`}>
      <div className={`flex items-start gap-3 ${isMinimized ? '' : 'mb-3'}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <ClipboardList className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">
            {tr('员工任务', 'Staff Mission', 'Tugasan Kakitangan')}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            {tr('待补新车/二手与现金/贷款的客户。', 'Customers still missing New/Used or Cash/Loan.', 'Pelanggan yang masih belum dilengkapkan maklumat Baharu/Terpakai atau Tunai/Pinjaman.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized((current) => !current)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-100 transition-colors hover:bg-slate-100 hover:text-slate-800"
          title={isMinimized ? tr('展开员工任务', 'Expand Staff Mission', 'Kembangkan Tugasan Kakitangan') : tr('最小化员工任务', 'Minimize Staff Mission', 'Minimumkan Tugasan Kakitangan')}
          aria-label={isMinimized ? tr('展开员工任务', 'Expand Staff Mission', 'Kembangkan Tugasan Kakitangan') : tr('最小化员工任务', 'Minimize Staff Mission', 'Minimumkan Tugasan Kakitangan')}
        >
          {isMinimized ? <ChevronDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
        </button>
      </div>
      {!isMinimized && <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {missions.map((mission) => {
          const draft = drafts[mission.id] || {
            vehicle_condition: mission.vehicle_condition || '',
            purchase_method: mission.purchase_method || ''
          };

          return (
            <div key={mission.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="mb-3 min-w-0">
                <p className="truncate text-xs font-bold text-slate-800" title={mission.applicant_name}>
                  {mission.applicant_name}
                </p>
                <p className="mt-1 truncate text-[10px] font-semibold text-slate-400" title={mission.vehicle_model}>
                  {mission.id} / {mission.vehicle_model}
                </p>
                <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                  <Phone className="h-3 w-3 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span className="shrink-0 text-slate-400">
                    {tr('客户电话：', 'Customer Phone:', 'Telefon Pelanggan:')}
                  </span>
                  {mission.phone_no ? (
                    <a
                      href={`tel:${mission.phone_no.replace(/[^\d+]/g, '')}`}
                      className="truncate font-mono text-slate-700 transition-colors hover:text-emerald-600"
                      title={mission.phone_no}
                    >
                      {mission.phone_no}
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <ToggleOptionGroup
                  value={draft.vehicle_condition}
                  options={[
                    { value: '', label: tr('新车 / 二手', 'New / Used', 'Baharu / Terpakai') },
                    { value: 'New', label: tr('新车', 'New', 'Baharu') },
                    { value: 'Used', label: tr('二手', 'Used', 'Terpakai') }
                  ]}
                  onChange={(value) => onUpdateDraft(mission.id, {
                    ...draft,
                    vehicle_condition: value as VehicleCondition
                  })}
                  ariaLabel={tr(`${mission.id} 的车辆状况任务`, `Mission vehicle condition for ${mission.id}`, `Tugasan keadaan kenderaan untuk ${mission.id}`)}
                  className="rounded-lg bg-white p-1 ring-1 ring-slate-100"
                />
                <ToggleOptionGroup
                  value={draft.purchase_method}
                  options={[
                    { value: '', label: tr('现金 / 贷款', 'Cash / Loan', 'Tunai / Pinjaman') },
                    { value: 'Cash', label: tr('现金', 'Cash', 'Tunai') },
                    { value: 'Loan', label: tr('贷款', 'Loan', 'Pinjaman') }
                  ]}
                  onChange={(value) => onUpdateDraft(mission.id, {
                    ...draft,
                    purchase_method: value as PurchaseMethod
                  })}
                  ariaLabel={tr(`${mission.id} 的购买方式任务`, `Mission purchase method for ${mission.id}`, `Tugasan kaedah pembelian untuk ${mission.id}`)}
                  className="rounded-lg bg-white p-1 ring-1 ring-slate-100"
                />
              </div>
              <button
                type="button"
                onClick={() => onComplete(mission.id)}
                disabled={!draft.vehicle_condition || !draft.purchase_method}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-800 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-red-900 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {tr('完成任务', 'Complete Mission', 'Selesaikan Tugasan')}
              </button>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
