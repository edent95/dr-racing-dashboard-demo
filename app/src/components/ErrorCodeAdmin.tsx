/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { AlertTriangle, BookOpenText, CheckCircle2, Eye, EyeOff, Plus, Search, Trash2 } from 'lucide-react';
import {
  ErrorCodeDefinition,
  LoanApplication,
  REJECT_NEXT_STEPS,
  REJECT_REASON_CATEGORIES,
  RejectNextStepType,
  RejectReasonCategory
} from '../types';
import DoubleClickEditField from './DoubleClickEditField';
import SortableHeader, { compareSortValues, getNextSortState, SortDirection, SortState } from './SortableHeader';
import { tr } from '../lib/i18n';
import { getApplicationRejectCodes, normalizeRejectCode, normalizeRejectCodes } from '../utils/rejectCodes';
import { useDebouncedValue } from '../utils/tableUx';

interface ErrorCodeAdminProps {
  definitions: ErrorCodeDefinition[];
  applications?: LoanApplication[];
  canManageDefinitions?: boolean;
  onAddDefinition: (definition: ErrorCodeDefinition) => void;
  onUpdateDefinition: (code: string, updates: Partial<ErrorCodeDefinition>) => void;
  onDeleteDefinition: (code: string) => void;
}

type ErrorCodeSortKey = 'code' | 'category' | 'issue' | 'customer_request' | 'default_next_step';
type DefinitionFilter = 'all' | 'complete' | 'incomplete';

const rejectNextStepLabel = (value: RejectNextStepType) => {
  const labels: Record<RejectNextStepType, [string, string, string]> = {
    REQUEST_DOCUMENTS: ['要求补文件', 'Request documents', 'Minta dokumen'],
    CORRECT_INFORMATION: ['更正资料', 'Correct information', 'Betulkan maklumat'],
    ADJUST_DEAL: ['调整贷款方案', 'Adjust deal', 'Laraskan urus niaga'],
    TRY_ANOTHER_BANK: ['尝试其他银行', 'Try another bank', 'Cuba bank lain'],
    FOLLOW_UP_LATER: ['稍后跟进', 'Follow up later', 'Susulan kemudian'],
    CONVERT_TO_CASH: ['转现金购买', 'Convert to cash', 'Tukar kepada tunai'],
    CLOSE_REJECTED: ['拒贷结案', 'Close rejected file', 'Tutup fail ditolak'],
    MERGE_DUPLICATE: ['合并重复申请', 'Merge duplicate', 'Gabung pendua']
  };
  return tr(...labels[value]);
};

const compareCodeValues = (left: string, right: string, direction: SortDirection) => {
  const result = left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
  return direction === 'asc' ? result : -result;
};

interface MissingErrorCodeRow {
  code: string;
  applications: number;
  finalRejects: number;
  bankRejects: number;
  latest: string;
  sample: string;
  missingIssue: boolean;
  missingCustomerRequest: boolean;
  hasDefinition: boolean;
}

function buildMissingErrorCodeRows(applications: LoanApplication[], definitions: ErrorCodeDefinition[]): MissingErrorCodeRow[] {
  const definitionMap = new Map(definitions.map((definition) => [normalizeRejectCode(definition.code), definition]));
  const rows = new Map<string, {
    applicationIds: Set<string>;
    finalRejects: number;
    bankRejects: number;
    latest: string;
    sample: string;
  }>();

  const trackCode = (code: string, application: LoanApplication, source: 'final' | 'bank') => {
    const normalizedCode = normalizeRejectCode(code);
    if (!normalizedCode) {
      return;
    }

    const row = rows.get(normalizedCode) || {
      applicationIds: new Set<string>(),
      finalRejects: 0,
      bankRejects: 0,
      latest: '',
      sample: ''
    };
    const submittedAt = application.submitted_at || '';

    row.applicationIds.add(application.id);
    row.finalRejects += source === 'final' ? 1 : 0;
    row.bankRejects += source === 'bank' ? 1 : 0;
    row.sample ||= application.applicant_name;
    row.latest = !row.latest || new Date(submittedAt).getTime() > new Date(row.latest).getTime()
      ? submittedAt
      : row.latest;
    rows.set(normalizedCode, row);
  };

  applications.forEach((application) => {
    getApplicationRejectCodes(application).forEach((code) => trackCode(code, application, 'final'));
    (application.bank_applications || []).forEach((bankApplication) => {
      normalizeRejectCodes(bankApplication.reject_code).forEach((code) => trackCode(code, application, 'bank'));
    });
  });

  return Array.from(rows.entries())
    .map(([code, row]) => {
      const definition = definitionMap.get(code);
      const missingIssue = !definition?.issue?.trim();
      const missingCustomerRequest = !definition?.customer_request?.trim();

      return {
        code,
        applications: row.applicationIds.size,
        finalRejects: row.finalRejects,
        bankRejects: row.bankRejects,
        latest: row.latest,
        sample: row.sample,
        missingIssue,
        missingCustomerRequest,
        hasDefinition: Boolean(definition)
      };
    })
    .filter((row) => row.missingIssue || row.missingCustomerRequest)
    .sort((a, b) => b.applications - a.applications || a.code.localeCompare(b.code));
}

export default function ErrorCodeAdmin({
  definitions,
  applications = [],
  canManageDefinitions = true,
  onAddDefinition,
  onUpdateDefinition,
  onDeleteDefinition
}: ErrorCodeAdminProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const [newCode, setNewCode] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const [newRequest, setNewRequest] = useState('');
  const [newCategory, setNewCategory] = useState<RejectReasonCategory>('Documents');
  const [newNextStep, setNewNextStep] = useState<RejectNextStepType>('REQUEST_DOCUMENTS');
  const [definitionFilter, setDefinitionFilter] = useState<DefinitionFilter>('all');
  const [showMissingExplanations, setShowMissingExplanations] = useState(false);
  const [sortState, setSortState] = useState<SortState<ErrorCodeSortKey>>({
    key: 'code',
    direction: 'asc'
  });

  const sortedDefinitions = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const filteredDefinitions = definitions.filter((item) => {
      const isComplete = Boolean(
        item.issue.trim() &&
        item.customer_request.trim() &&
        item.category &&
        item.default_next_step
      );
      const matchesFilter = definitionFilter === 'all'
        || (definitionFilter === 'complete' && isComplete)
        || (definitionFilter === 'incomplete' && !isComplete);
      const matchesQuery = !query
        || item.code.toLowerCase().includes(query)
        || item.issue.toLowerCase().includes(query)
        || item.customer_request.toLowerCase().includes(query);

      return matchesFilter && matchesQuery;
    });

    return [...filteredDefinitions].sort((a, b) => (
      sortState.key === 'code'
        ? compareCodeValues(a.code, b.code, sortState.direction)
        : compareSortValues(
        String(a[sortState.key] || '').toLowerCase(),
        String(b[sortState.key] || '').toLowerCase(),
        sortState.direction
      )
    ));
  }, [debouncedSearchTerm, definitionFilter, definitions, sortState]);

  const definitionStats = useMemo(() => {
    const complete = definitions.filter((item) => (
      item.issue.trim() &&
      item.customer_request.trim() &&
      item.category &&
      item.default_next_step
    )).length;
    return { total: definitions.length, complete, incomplete: definitions.length - complete };
  }, [definitions]);

  const missingErrorCodeRows = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const rows = buildMissingErrorCodeRows(applications, definitions);

    return rows.filter((row) => (
      !query ||
      row.code.toLowerCase().includes(query) ||
      row.sample.toLowerCase().includes(query)
    ));
  }, [applications, debouncedSearchTerm, definitions]);

  const handleSort = (key: ErrorCodeSortKey, defaultDirection: SortDirection = 'asc') => {
    setSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleAdd = () => {
    if (!canManageDefinitions) {
      return;
    }

    const code = normalizeRejectCode(newCode);
    const issue = newIssue.trim();
    const customerRequest = newRequest.trim();

    if (!code || !issue) {
      return;
    }

    onAddDefinition({
      code,
      issue,
      customer_request: customerRequest,
      category: newCategory,
      default_next_step: newNextStep
    });

    setNewCode('');
    setNewIssue('');
    setNewRequest('');
    setNewCategory('Documents');
    setNewNextStep('REQUEST_DOCUMENTS');
  };

  const handleCreateMissingDefinition = (code: string) => {
    if (!canManageDefinitions) {
      return;
    }

    onAddDefinition({
      code,
      issue: '',
      customer_request: '',
      category: 'Information',
      default_next_step: 'CORRECT_INFORMATION'
    });
    setSearchTerm(code);
  };

  return (
    <div id="error-code-admin-page" className="space-y-6">
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {tr('拒贷原因代码', 'Reject Reason Codes', "Tolak Kod Sebab")}
          </h2>
          <p className="text-xs text-slate-500 font-light max-w-2xl leading-relaxed">
            {tr('定义每个代码的含义和客户需补做的事。', 'What each code means and what the customer should do.', "Maksud setiap kod dan perkara yang perlu dilakukan oleh pelanggan.")}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center md:self-auto">
          {missingErrorCodeRows.length > 0 && (
            <button
              type="button"
              onClick={() => setShowMissingExplanations((current) => !current)}
              aria-expanded={showMissingExplanations}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                showMissingExplanations
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'border border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {showMissingExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showMissingExplanations
                ? tr('隐藏待补说明', 'Hide missing explanations', "Sembunyikan penjelasan yang tiada")
                : tr(`显示待补说明 (${missingErrorCodeRows.length})`, `Show missing explanations (${missingErrorCodeRows.length})`, `Tunjukkan penjelasan yang tiada (${missingErrorCodeRows.length})`)}
            </button>
          )}

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="code-search-input"
              type="text"
              placeholder={tr('搜索代码或原因...', 'Search code or issue...', "Cari kod atau isu...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-lg text-xs w-72 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { key: 'all' as const, label: tr('全部代码', 'All codes', "Semua kod"), value: definitionStats.total, Icon: BookOpenText, tone: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { key: 'complete' as const, label: tr('说明完整', 'Complete', "lengkap"), value: definitionStats.complete, Icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { key: 'incomplete' as const, label: tr('待补说明', 'Incomplete', "tak lengkap"), value: definitionStats.incomplete, Icon: AlertTriangle, tone: 'text-amber-600 bg-amber-50 border-amber-100' }
        ].map(({ key, label, value, Icon, tone }) => (
          <button
            key={key}
            type="button"
            onClick={() => setDefinitionFilter(key)}
            className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${tone} ${definitionFilter === key ? 'ring-2 ring-current ring-offset-2' : 'opacity-75 hover:opacity-100'}`}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
            </div>
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {showMissingExplanations && missingErrorCodeRows.length > 0 && (
          <div className="border-b border-amber-100 bg-amber-50/40 px-6 py-5">
            <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  {tr('待补拒贷代码说明', 'Missing Reject Code Explanation', "Penjelasan Kod Tolak Tiada")}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {tr('这些 CODE 已经被员工/银行记录使用，但还没有完整说明。', 'These CODEs are already used by staff or bank records, but do not have complete explanations yet.', "KOD ini sudah digunakan oleh kakitangan atau rekod bank, tetapi belum mempunyai penjelasan lengkap lagi.")}
                </p>
              </div>
              <p className="text-[11px] font-bold text-amber-700">
                {tr(`${missingErrorCodeRows.length} 个待补`, `${missingErrorCodeRows.length} incomplete`, `${missingErrorCodeRows.length} tidak lengkap`)}
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {missingErrorCodeRows.map((row) => (
                <div key={row.code} className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm shadow-amber-100/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1 font-mono text-[11px] font-bold text-rose-600">
                        {row.code}
                      </span>
                      <p className="mt-2 text-[11px] font-semibold text-slate-400">
                        {tr(`${row.applications} 个客户 · Final ${row.finalRejects} · Bank ${row.bankRejects}`, `${row.applications} customers · Final ${row.finalRejects} · Bank ${row.bankRejects}`, `${row.applications} pelanggan · Akhir ${row.finalRejects} · Bank ${row.bankRejects}`)}
                      </p>
                    </div>

                    {canManageDefinitions ? (
                      <button
                        type="button"
                        onClick={() => row.hasDefinition ? setSearchTerm(row.code) : handleCreateMissingDefinition(row.code)}
                        className="shrink-0 rounded-lg bg-amber-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-amber-700"
                      >
                        {row.hasDefinition ? tr('填写说明', 'Fill', "isi") : tr('建立代码', 'Create', "Buat")}
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-400">
                        {tr('待超级管理员补', 'Super Admin needed', "Super Admin diperlukan")}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {row.missingIssue && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 ring-1 ring-rose-100">
                        {tr('缺问题说明', 'Missing issue', "Isu hilang")}
                      </span>
                    )}
                    {row.missingCustomerRequest && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 ring-1 ring-blue-100">
                        {tr('缺客户补做事项', 'Missing request', "Permintaan tiada")}
                      </span>
                    )}
                  </div>

                  {row.sample && (
                    <p className="mt-2 truncate text-[10px] font-semibold text-slate-400" title={row.sample}>
                      {tr('例子', 'Sample', "Sampel")}: {row.sample}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-5 border-b border-slate-100/70">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[140px_180px_1fr_1fr_200px_auto]">
            <input
              id="new-code-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{8}"
              maxLength={8}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder={tr('8 位数字 CODE', '8-digit CODE', "KOD 8 digit")}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-transparent text-xs font-mono font-semibold text-slate-700 outline-none focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50"
            />
            <select
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value as RejectReasonCategory)}
              aria-label="New reject reason type"
              className="rounded-xl border border-transparent bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
            >
              {REJECT_REASON_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <input
              id="new-issue-input"
              type="text"
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
              placeholder={tr('问题 / 拒贷原因', 'Issue / failed reason', "Isu / alasan gagal")}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-transparent text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50"
            />
            <input
              id="new-request-input"
              type="text"
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              placeholder={tr('客户需补事项', 'Customer request', "Permintaan pelanggan")}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-transparent text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50"
            />
            <select
              value={newNextStep}
              onChange={(event) => setNewNextStep(event.target.value as RejectNextStepType)}
              aria-label="New reject default next step"
              className="rounded-xl border border-transparent bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
            >
              {REJECT_NEXT_STEPS.map((nextStep) => <option key={nextStep} value={nextStep}>{rejectNextStepLabel(nextStep)}</option>)}
            </select>
            <button
              id="add-code-btn"
              type="button"
              onClick={handleAdd}
              disabled={!canManageDefinitions || !/^\d{8}$/.test(newCode) || !newIssue.trim()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {tr('添加', 'Add', "Tambah")}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3 text-[11px] font-semibold text-slate-500">
            <span>{tr(`显示 ${sortedDefinitions.length} / ${definitions.length} 个代码`, `Showing ${sortedDefinitions.length} / ${definitions.length} codes`, `Menunjukkan kod ${sortedDefinitions.length} / ${definitions.length}`)}</span>
            {(searchTerm || definitionFilter !== 'all') && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setDefinitionFilter('all'); }}
                className="font-bold text-indigo-600 hover:text-indigo-700"
              >
                {tr('清除筛选', 'Clear filters', "Kosongkan penapis")}
              </button>
            )}
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-200/95 text-[10px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">
              <tr>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="code" label="CODE" sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="category" label={tr('类型', 'Type', "Jenis")} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="issue" label={tr('问题', 'Issue', "Isu")} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="customer_request" label={tr('客户需补事项', 'Customer Request', "Permintaan Pelanggan")} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="default_next_step" label={tr('默认下一步', 'Default Next Step', "Langkah Seterusnya")} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="pr-6 py-3.5 text-right">{tr('操作', 'Action', "Tindakan")}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {sortedDefinitions.map((item) => (
                <tr key={item.code} id={`code-row-${item.code}`} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <span className="inline-flex rounded-lg bg-rose-50/70 border border-rose-100 px-2.5 py-1 text-[11px] font-mono font-bold text-rose-600">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <select
                      value={item.category || 'Information'}
                      onChange={(event) => onUpdateDefinition(item.code, { category: event.target.value as RejectReasonCategory })}
                      disabled={!canManageDefinitions}
                      aria-label={`Update type for ${item.code}`}
                      className="min-w-44 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50 disabled:cursor-not-allowed"
                    >
                      {REJECT_REASON_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <DoubleClickEditField
                      type="text"
                      value={item.issue}
                      onCommit={(value) => onUpdateDefinition(item.code, { issue: value })}
                      disabled={!canManageDefinitions}
                      emptyText={tr('双击填写问题 / 拒贷原因', 'Double-click to enter issue / failed reason', "Klik dua kali untuk memasukkan isu / sebab gagal")}
                      displayClassName="block w-full min-w-80 truncate rounded-lg bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      inputClassName="w-full min-w-80 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                      ariaLabel={`Update issue for ${item.code}`}
                    />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <DoubleClickEditField
                      type="text"
                      value={item.customer_request}
                      onCommit={(value) => onUpdateDefinition(item.code, { customer_request: value })}
                      disabled={!canManageDefinitions}
                      emptyText={tr('双击填写客户需补做事项', 'Double-click to enter the customer request', "Klik dua kali untuk memasukkan permintaan pelanggan")}
                      displayClassName="block w-full min-w-80 truncate rounded-lg bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      inputClassName="w-full min-w-80 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                      ariaLabel={`Update customer request for ${item.code}`}
                    />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <select
                      value={item.default_next_step || 'CORRECT_INFORMATION'}
                      onChange={(event) => onUpdateDefinition(item.code, { default_next_step: event.target.value as RejectNextStepType })}
                      disabled={!canManageDefinitions}
                      aria-label={`Update default next step for ${item.code}`}
                      className="min-w-48 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50 disabled:cursor-not-allowed"
                    >
                      {REJECT_NEXT_STEPS.map((nextStep) => <option key={nextStep} value={nextStep}>{rejectNextStepLabel(nextStep)}</option>)}
                    </select>
                  </td>
                  <td className="pr-6 py-4 align-top text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteDefinition(item.code)}
                      disabled={!canManageDefinitions}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Delete ${item.code}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {sortedDefinitions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-sm text-slate-400">
                    {tr('没有找到代码', 'No codes found', "Tiada kod ditemui")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
