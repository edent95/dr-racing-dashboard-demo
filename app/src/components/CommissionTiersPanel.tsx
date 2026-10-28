import { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import type { CommissionTier, CommissionTierPlan } from '../types';
import { tr } from '../lib/i18n';
import { calculateProgressiveCommission, normalizeCommissionTierPlans, normalizeCommissionTiers } from '../utils/commissionTiers';

const formatRm = (value: number) => `RM${value.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/**
 * Progressive Sales commission (owner 2026-10-21). Everyone who opens the
 * Commission Ledger sees the bands and a worked example; Super Admin edits
 * them; Operations Manager / Super Admin move unpaid deals onto the bands.
 * Owner 2026-10-24: two structures (plans), each staff member on one, picked
 * in Roles & Accounts; Super Admin edits every plan's name and bands.
 */
export default function CommissionTiersPanel({
  plans,
  staffNamesByPlan,
  canEdit,
  onSave,
  pendingUpdateCount,
  onRecalculate
}: {
  plans: CommissionTierPlan[];
  /** Who follows each plan, for those who can see every account; absent otherwise. */
  staffNamesByPlan?: Record<string, string[]>;
  canEdit: boolean;
  onSave?: (plans: CommissionTierPlan[]) => Promise<boolean>;
  /** Unpaid tier deals whose stored commission differs from the bands. */
  pendingUpdateCount: number;
  onRecalculate?: () => Promise<boolean>;
}) {
  const [draftPlans, setDraftPlans] = useState<CommissionTierPlan[]>(plans);
  const [activePlanId, setActivePlanId] = useState(plans[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exampleSales, setExampleSales] = useState(70000);
  useEffect(() => {
    if (!isEditing) setDraftPlans(plans);
  }, [isEditing, plans]);

  const shownPlans = isEditing ? draftPlans : plans;
  const activePlan = shownPlans.find((plan) => plan.id === activePlanId) || shownPlans[0];
  const shown = activePlan?.tiers || [];
  const normalizedDraft = useMemo(() => normalizeCommissionTiers(shown), [shown]);
  const example = useMemo(() => {
    const bands = normalizeCommissionTiers(shown);
    return bands.flatMap((tier, index) => {
      const upper = index + 1 < bands.length ? bands[index + 1].from : Infinity;
      const inBand = Math.min(exampleSales, upper) - tier.from;
      return inBand > 0 ? [{ amount: inBand, percent: tier.percent, commission: Math.round(inBand * tier.percent) / 100 }] : [];
    });
  }, [exampleSales, shown]);
  const exampleTotal = calculateProgressiveCommission(exampleSales, shown);

  const setDraft = (update: (current: CommissionTier[]) => CommissionTier[]) => setDraftPlans((current) => current.map((plan) => (
    plan.id === activePlan?.id ? { ...plan, tiers: update(plan.tiers) } : plan
  )));
  const updateRow = (index: number, field: keyof CommissionTier, value: string) => setDraft((current) => current.map((tier, rowIndex) => (
    rowIndex === index ? { ...tier, [field]: Number(value) } : tier
  )));
  const renamePlan = (name: string) => setDraftPlans((current) => current.map((plan) => (
    plan.id === activePlan?.id ? { ...plan, name } : plan
  )));
  const save = async () => {
    if (!onSave || isSaving) return;
    setIsSaving(true);
    const ok = await onSave(normalizeCommissionTierPlans({ commission_tier_plans: draftPlans }));
    setIsSaving(false);
    if (ok) setIsEditing(false);
  };
  const recalculate = async () => {
    if (!onRecalculate || isSaving) return;
    setIsSaving(true);
    await onRecalculate();
    setIsSaving(false);
  };
  const inputClass = 'w-full rounded-control px-2 py-1.5 text-right font-mono text-footnote text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400';

  return (
    <section data-testid="commission-tiers-panel" className="rounded-card border border-slate-100 bg-white p-5 shadow-e1 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-headline text-slate-900">{tr('佣金分级(按月累进)', 'Commission tiers (monthly, progressive)', 'Tahap komisen (bulanan, progresif)')}</p>
          <p className="mt-1 max-w-2xl text-footnote leading-relaxed text-slate-500">
            {tr(
              '每位 Sales 当月(马来西亚日期)已交车的成交价加总,分段计算:每一段只按自己的比例算。每单的佣金 = 加上这单后的月佣金 − 加上之前的月佣金(按交车先后)。手动填写或已支付的佣金不会改。',
              "Each Sales' delivered selling prices for the month (Malaysia dates) are added up and cut into bands; each band earns only its own rate. A deal's commission is the month's commission with it minus without it, in delivery order. Typed or paid commissions are never changed.",
              'Harga jualan yang dihantar oleh setiap Jualan bagi bulan itu (tarikh Malaysia) dijumlahkan dan dibahagi kepada tahap; setiap tahap hanya mendapat kadarnya sendiri. Komisen satu urus niaga = komisen bulan dengannya tolak tanpanya, mengikut urutan penghantaran. Komisen yang ditaip atau sudah dibayar tidak diubah.'
            )}
          </p>
        </div>
        {canEdit && onSave && !isEditing && (
          <button type="button" onClick={() => setIsEditing(true)} className="rounded-control bg-white px-3 py-2 text-footnote font-bold text-slate-600 ring-1 ring-slate-200 hover:text-brand-ink">
            {tr('修改分级', 'Edit tiers', 'Ubah tahap')}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="tablist" aria-label={tr('佣金分级方案', 'Commission tier plans', 'Pelan tahap komisen')}>
        {shownPlans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            role="tab"
            aria-selected={plan.id === activePlan?.id}
            data-testid={`commission-tier-plan-${plan.id}`}
            onClick={() => setActivePlanId(plan.id)}
            className={`rounded-control px-3 py-1.5 text-footnote font-bold transition-colors ${plan.id === activePlan?.id ? 'bg-brand text-white' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-100 hover:text-slate-900'}`}
          >
            {plan.name}
          </button>
        ))}
      </div>
      {isEditing && activePlan && (
        <label className="mt-3 flex max-w-xs flex-col gap-1 text-micro uppercase text-slate-500">
          <span>{tr('方案名称', 'Plan name', 'Nama pelan')}</span>
          <input value={activePlan.name} maxLength={40} aria-label="Plan name" onChange={(event) => renamePlan(event.target.value)} className="rounded-control px-2 py-1.5 text-footnote normal-case text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-100" />
        </label>
      )}
      {staffNamesByPlan && activePlan && (
        <p data-testid="commission-tier-plan-staff" className="mt-2 text-footnote text-slate-500">
          {tr('用这个方案的员工', 'Staff on this plan', 'Kakitangan pada pelan ini')}: {(staffNamesByPlan[activePlan.id] || []).join(', ') || tr('还没有(在 Roles & Accounts 选)', 'none yet (pick in Roles & Accounts)', 'tiada lagi (pilih di Roles & Accounts)')}
        </p>
      )}

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-footnote">
          <thead>
            <tr className="text-left text-micro uppercase text-slate-500">
              <th className="py-2 pr-3">{tr('级别', 'Tier', 'Tahap')}</th>
              <th className="py-2 pr-3 text-right">{tr('月销售额从 (RM)', 'Monthly sales from (RM)', 'Jualan bulanan dari (RM)')}</th>
              <th className="py-2 pr-3 text-right">{tr('到 (RM)', 'Up to (RM)', 'Hingga (RM)')}</th>
              <th className="py-2 pr-3 text-right">{tr('比例 (%)', 'Rate (%)', 'Kadar (%)')}</th>
              {isEditing && <th className="py-2" aria-label={tr('删除', 'Remove', 'Buang')} />}
            </tr>
          </thead>
          <tbody>
            {shown.map((tier, index) => {
              const next = isEditing ? normalizedDraft[index + 1] : shown[index + 1];
              return (
                <tr key={index} className="border-t border-slate-100">
                  <td className="py-2 pr-3 font-semibold text-slate-700">{tr(`第 ${index + 1} 级`, `Tier ${index + 1}`, `Tahap ${index + 1}`)}</td>
                  <td className="py-2 pr-3 text-right font-mono">
                    {isEditing ? (
                      <input type="number" min="0" step="1" aria-label={`Tier ${index + 1} from`} disabled={index === 0} value={index === 0 ? 0 : tier.from} onChange={(event) => updateRow(index, 'from', event.target.value)} className={inputClass} />
                    ) : formatRm(tier.from)}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono text-slate-500">
                    {next ? formatRm(next.from - 1) : tr('以上', 'and above', 'dan ke atas')}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono font-bold text-slate-800">
                    {isEditing ? (
                      <input type="number" min="0" max="100" step="0.01" aria-label={`Tier ${index + 1} rate`} value={tier.percent} onChange={(event) => updateRow(index, 'percent', event.target.value)} className={inputClass} />
                    ) : `${tier.percent.toFixed(2)}%`}
                  </td>
                  {isEditing && (
                    <td className="py-2 text-right">
                      {index > 0 && (
                        <button type="button" aria-label={tr(`删除第 ${index + 1} 级`, `Remove tier ${index + 1}`, `Buang tahap ${index + 1}`)} onClick={() => setDraft((current) => current.filter((_, rowIndex) => rowIndex !== index))} className="rounded-control p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setDraft((current) => [...current, { from: (current[current.length - 1]?.from || 0) + 10000, percent: current[current.length - 1]?.percent || 0 }])}
            className="inline-flex items-center gap-1 rounded-control bg-white px-3 py-2 text-footnote font-bold text-slate-600 ring-1 ring-slate-200 hover:text-brand-ink"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {tr('加一级', 'Add a tier', 'Tambah tahap')}
          </button>
          <span className="flex gap-2">
            <button type="button" disabled={isSaving} onClick={() => setIsEditing(false)} className="rounded-control bg-white px-3 py-2 text-footnote font-bold text-slate-500 ring-1 ring-slate-100 hover:text-brand-ink">{tr('取消', 'Cancel', 'Batal')}</button>
            <button type="button" disabled={isSaving} onClick={() => { void save(); }} className="rounded-control bg-emerald-700 px-3 py-2 text-footnote font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:bg-slate-300">
              {isSaving ? tr('保存中...', 'Saving...', 'Menyimpan...') : tr('保存并重算未付佣金', 'Save and recalculate unpaid commission', 'Simpan dan kira semula komisen belum dibayar')}
            </button>
          </span>
        </div>
      )}

      <div className="mt-4 rounded-card bg-slate-50 p-3">
        <label className="flex flex-wrap items-center gap-2 text-footnote text-slate-600">
          <span>{tr('例:当月销售额', 'Example: monthly sales', 'Contoh: jualan bulanan')}</span>
          <span className="flex items-stretch overflow-hidden rounded-control bg-white ring-1 ring-slate-200">
            <span className="inline-flex items-center bg-slate-50 px-2 font-mono text-caption text-slate-500">RM</span>
            <input type="number" min="0" step="1000" aria-label="Example monthly sales" value={exampleSales || ''} onChange={(event) => setExampleSales(Math.max(0, Number(event.target.value) || 0))} className="w-28 px-2 py-1 text-right font-mono text-footnote font-bold text-slate-700 outline-none" />
          </span>
        </label>
        <ul className="mt-2 space-y-0.5 font-mono text-caption text-slate-600">
          {example.map((row) => (
            <li key={`${row.percent}-${row.amount}`}>{formatRm(row.amount)} × {row.percent}% = {formatRm(row.commission)}</li>
          ))}
        </ul>
        <p data-testid="commission-tiers-example-total" className="mt-1 text-footnote font-bold text-slate-900">
          {tr('当月佣金', 'Commission for the month', 'Komisen bulan itu')}: {formatRm(exampleTotal)}
        </p>
      </div>

      {onRecalculate && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-footnote text-slate-500">
            {pendingUpdateCount > 0
              ? tr(`${pendingUpdateCount} 单未付佣金和分级算出来的不一样(例如 Admin 交车后还没重算)。`, `${pendingUpdateCount} unpaid deal(s) differ from the tiers (for example delivered by an Admin and not recalculated yet).`, `${pendingUpdateCount} urus niaga belum dibayar berbeza daripada tahap (contohnya dihantar oleh Pentadbir dan belum dikira semula).`)
              : tr('所有未付的分级佣金都已经是最新的。', 'Every unpaid tier commission is up to date.', 'Semua komisen tahap yang belum dibayar sudah terkini.')}
          </p>
          <button type="button" disabled={isSaving || pendingUpdateCount === 0} onClick={() => { void recalculate(); }} className="inline-flex items-center gap-1 rounded-control bg-white px-3 py-2 text-footnote font-bold text-slate-600 ring-1 ring-slate-200 hover:text-brand-ink disabled:cursor-not-allowed disabled:text-slate-300">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {tr('按分级重算', 'Recalculate by tier', 'Kira semula ikut tahap')}
          </button>
        </div>
      )}
    </section>
  );
}
