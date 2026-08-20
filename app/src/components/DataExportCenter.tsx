/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Data Export Center (Tools view): one place to download every dataset as
 * CSV. Read-only — writes nothing to app state, localStorage, or Firebase.
 * Role accounts are deliberately excluded (credential safety).
 */

import React, { useState } from 'react';
import {
  BookOpenText,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Database,
  Download,
  FileClock,
  FileText,
  FileSpreadsheet,
  HardDriveDownload,
  Link2,
  MousePointerClick,
  Target,
  Trophy,
  Truck,
  Users,
  type LucideIcon
} from 'lucide-react';
import { tr } from '../lib/i18n';
import { downloadCsv } from '../utils/csvExport';
import { downloadOriginalLoanFormat } from '../utils/originalLoanExport';
import type { LoanApplication } from '../types';

// 内容型图标遵循规范:扁平 line glyph、按语义着色、无底色方块。按 dataset key 映射,未命中回退到通用表格图标。
const DATASET_ICONS: Record<string, { Icon: LucideIcon; tint: string }> = {
  customers: { Icon: Users, tint: 'text-indigo-500' },
  attendance: { Icon: CalendarCheck2, tint: 'text-emerald-500' },
  attendanceMonthly: { Icon: FileSpreadsheet, tint: 'text-emerald-600' },
  staffLeave: { Icon: FileText, tint: 'text-amber-500' },
  rawLeads: { Icon: Database, tint: 'text-sky-500' },
  followUp: { Icon: ClipboardList, tint: 'text-amber-500' },
  vehicleCatalog: { Icon: Truck, tint: 'text-slate-500' },
  approvals: { Icon: CheckCircle2, tint: 'text-emerald-500' },
  auditLogs: { Icon: FileClock, tint: 'text-slate-500' },
  missions: { Icon: Target, tint: 'text-rose-500' },
  whatsappLinks: { Icon: Link2, tint: 'text-emerald-500' },
  whatsappClicks: { Icon: MousePointerClick, tint: 'text-emerald-500' },
  banks: { Icon: Building2, tint: 'text-blue-500' },
  rejectCodes: { Icon: BookOpenText, tint: 'text-rose-500' },
  rewardTeams: { Icon: Trophy, tint: 'text-amber-500' }
};

export interface ExportDataset {
  key: string;
  permissionKey?: string;
  label: string;
  description: string;
  filename: string;
  rows: object[];
}

export default function DataExportCenter({
  datasets
}: {
  datasets: ExportDataset[];
}) {
  const [exportedKey, setExportedKey] = useState<string | null>(null);
  const [originalExportState, setOriginalExportState] = useState<'idle' | 'exporting' | 'done' | 'error'>('idle');
  const exportableDatasets = datasets.filter((dataset) => dataset.rows.length > 0);

  const exportRows = (dataset: ExportDataset) => {
    downloadCsv(dataset.rows as Array<Record<string, unknown>>, dataset.filename);
  };

  const handleExport = (dataset: ExportDataset) => {
    exportRows(dataset);
    setExportedKey(dataset.key);
  };

  const handleExportAll = () => {
    exportableDatasets
      .forEach((dataset, index) => {
        window.setTimeout(() => exportRows(dataset), index * 350);
      });
    setExportedKey('__all__');
  };

  const handleOriginalLoanExport = async (dataset: ExportDataset) => {
    setOriginalExportState('exporting');

    try {
      await downloadOriginalLoanFormat(dataset.rows as LoanApplication[]);
      setOriginalExportState('done');
    } catch (error) {
      console.error('Original loan application export failed:', error);
      setOriginalExportState('error');
    }
  };

  return (
    <div id="data-export-center" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('数据导出', 'Data Export', "Eksport Data")}</h2>
          <p className="max-w-3xl text-xs font-light leading-relaxed text-slate-500">
            {tr('系统里的数据 100% 属于你。每个数据表都可以随时导出 CSV（Excel 可直接打开）。', 'All data in the system is 100% yours. Every table can be exported as CSV anytime (opens directly in Excel).', "Semua data dalam sistem adalah 100% milik anda. Setiap jadual boleh dieksport sebagai CSV pada bila-bila masa (dibuka terus dalam Excel).")}
          </p>
        </div>
        {exportableDatasets.length > 0 && (
          <button
            type="button"
            onClick={handleExportAll}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-red-800 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
          >
            <HardDriveDownload className="h-4 w-4" />
            {tr('全部导出', 'Export all', "Eksport semua")}
          </button>
        )}
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {exportableDatasets.map((dataset) => {
          const { Icon, tint } = DATASET_ICONS[dataset.key] ?? { Icon: FileSpreadsheet, tint: 'text-slate-400' };
          return (
          <div key={dataset.key} data-export-dataset={dataset.key} className="flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tint}`} aria-hidden="true" />
                  <p className="text-sm font-bold text-slate-900">{dataset.label}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-bold text-slate-500">
                  {dataset.rows.length} {tr('行', 'rows', "barisan")}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{dataset.description}</p>
            </div>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => handleExport(dataset)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  exportedKey === dataset.key || exportedKey === '__all__'
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-red-800 text-white hover:bg-red-700'
                }`}
              >
                <Download className="h-3.5 w-3.5" />
                {exportedKey === dataset.key || exportedKey === '__all__'
                    ? tr('已导出，再导一次', 'Exported — export again', "Dieksport — eksport semula")
                    : tr('导出 CSV', 'Export CSV', "Eksport CSV")}
              </button>
              {dataset.key === 'customers' && (
                <button
                  type="button"
                  disabled={originalExportState === 'exporting'}
                  onClick={() => void handleOriginalLoanExport(dataset)}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:cursor-wait disabled:opacity-70 ${
                    originalExportState === 'done'
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : originalExportState === 'error'
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  {originalExportState === 'exporting'
                    ? tr('正在准备原始格式…', 'Preparing original format…', "Menyediakan format asal…")
                    : originalExportState === 'done'
                      ? tr('已导出原始格式', 'Original format exported', "Format asal dieksport")
                      : originalExportState === 'error'
                        ? tr('导出失败，重试', 'Export failed — retry', "Eksport gagal — cuba lagi")
                        : tr('导出原始格式', 'Export Original Format', "Eksport Format Asal")}
                </button>
              )}
            </div>
          </div>
          );
        })}
      </section>

      {exportableDatasets.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-xs font-semibold text-slate-400">
          {tr('目前没有可导出的资料。', 'No exportable data is available.', "Tiada data yang boleh dieksport pada masa ini.")}
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-slate-400">
        {tr('注：角色与账号资料不提供导出，避免登录凭证外泄。导出文件带日期，例如 customers_2026-07-05.csv。', 'Note: role/account records are excluded from export to protect login credentials. Files are date-stamped, e.g. customers_2026-07-05.csv.', "Nota: rekod peranan/akaun dikecualikan daripada eksport untuk melindungi kelayakan log masuk. Fail dicop tarikh, mis. pelanggan_2026-07-05.csv.")}
      </p>
    </div>
  );
}
