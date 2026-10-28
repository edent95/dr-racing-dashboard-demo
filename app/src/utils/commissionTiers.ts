import type { CommissionRules, CommissionTier, CommissionTierPlan, DealFinance, LoanApplication, RoleAccount } from '../types';
import { malaysiaDate } from '../../shared/malaysiaDate.mjs';

/**
 * Progressive Sales commission (owner 2026-10-21, "COMMISSION STRUCTURE
 * (PROGRESSIVE TIER)"). A Sales' total monthly Gross Sales Value is cut into
 * bands; each band earns its own rate, like income tax. RM 70,000 in a month
 * = RM 50,000 x 1.00% + RM 20,000 x 1.25% = RM 750. Super Admin edits the
 * bands in Financial Reports -> Commission Ledger -> Commission Tiers.
 *
 * Owner 2026-10-24: there are two structures (plans); Super Admin picks each
 * staff member's plan in Roles & Accounts. Staff without one follow the first.
 */
export const DEFAULT_COMMISSION_TIERS: CommissionTier[] = [
  { from: 0, percent: 1 },
  { from: 50000, percent: 1.25 },
  { from: 80000, percent: 1.5 },
  { from: 110000, percent: 1.75 },
  { from: 130000, percent: 2 },
  { from: 150000, percent: 2.5 }
];

const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

const roundCents = (value: number) => Math.round(value * 100) / 100;

/**
 * Sorted, de-duplicated bands that always start at RM 0. Anything unusable
 * (no array, no valid band) falls back to the default table.
 */
export function normalizeCommissionTiers(value: unknown, fallback: CommissionTier[] = DEFAULT_COMMISSION_TIERS): CommissionTier[] {
  if (!Array.isArray(value)) return fallback.map((tier) => ({ ...tier }));
  const byFrom = new Map<number, CommissionTier>();
  value.forEach((raw) => {
    const from = toNumber((raw as CommissionTier | null)?.from);
    const percent = toNumber((raw as CommissionTier | null)?.percent);
    if (Number.isNaN(from) || Number.isNaN(percent) || from < 0 || percent < 0 || percent > 100) return;
    byFrom.set(roundCents(from), { from: roundCents(from), percent: roundCents(percent * 1000) / 1000 });
  });
  if (byFrom.size === 0) return fallback.map((tier) => ({ ...tier }));
  const tiers = [...byFrom.values()].sort((left, right) => left.from - right.from);
  tiers[0] = { ...tiers[0], from: 0 };
  return tiers;
}

/** The second structure (owner 2026-10-24): RM 50,000 bands from 1% to 2.25%. */
export const DEFAULT_COMMISSION_TIERS_B: CommissionTier[] = [
  { from: 0, percent: 1 },
  { from: 50000, percent: 1.25 },
  { from: 100000, percent: 1.5 },
  { from: 150000, percent: 1.75 },
  { from: 200000, percent: 2 },
  { from: 250000, percent: 2.25 }
];

export const DEFAULT_COMMISSION_TIER_PLANS: CommissionTierPlan[] = [
  { id: 'tier_a', name: 'Tier A', tiers: DEFAULT_COMMISSION_TIERS },
  { id: 'tier_b', name: 'Tier B', tiers: DEFAULT_COMMISSION_TIERS_B }
];

const clonePlans = (plans: CommissionTierPlan[]) => plans.map((plan) => ({ ...plan, tiers: plan.tiers.map((tier) => ({ ...tier })) }));

/**
 * The stored plans, or the two defaults. Rules saved before plans existed keep
 * their edited `commission_tiers` as the first plan.
 */
export function normalizeCommissionTierPlans(rules: Pick<CommissionRules, 'commission_tiers' | 'commission_tier_plans'> | null | undefined): CommissionTierPlan[] {
  const stored = Array.isArray(rules?.commission_tier_plans) ? rules.commission_tier_plans : [];
  const seen = new Set<string>();
  const plans = stored.flatMap((raw, index) => {
    const id = String(raw?.id || '').trim();
    if (!id || seen.has(id)) return [];
    seen.add(id);
    const fallback = DEFAULT_COMMISSION_TIER_PLANS[index]?.tiers || DEFAULT_COMMISSION_TIERS;
    return [{ id, name: String(raw?.name || '').trim().slice(0, 40) || id, tiers: normalizeCommissionTiers(raw?.tiers, fallback) }];
  });
  if (plans.length > 0) return plans;
  const defaults = clonePlans(DEFAULT_COMMISSION_TIER_PLANS);
  if (rules?.commission_tiers !== undefined) defaults[0].tiers = normalizeCommissionTiers(rules.commission_tiers);
  return defaults;
}

/** The plan a staff member follows: their chosen one, else the first. */
export function getStaffCommissionTierPlan(plans: CommissionTierPlan[], account: Pick<RoleAccount, 'commission_tier_plan_id'> | null | undefined): CommissionTierPlan {
  return plans.find((plan) => plan.id === account?.commission_tier_plan_id) || plans[0] || DEFAULT_COMMISSION_TIER_PLANS[0];
}

/** Active Sales names under each plan id, for the Commission Tiers panel. */
export function groupStaffByCommissionTierPlan(plans: CommissionTierPlan[], roleAccounts: Pick<RoleAccount, 'name' | 'role' | 'status' | 'commission_tier_plan_id'>[]): Record<string, string[]> {
  const groups: Record<string, string[]> = Object.fromEntries(plans.map((plan) => [plan.id, [] as string[]]));
  roleAccounts
    .filter((account) => account.role === 'Sales' && account.status === 'Active')
    .forEach((account) => { groups[getStaffCommissionTierPlan(plans, account).id]?.push(account.name); });
  return groups;
}

/** One table for everyone, or each handler's own table. */
export type CommissionTierSource = CommissionTier[] | ((handlerName: string) => CommissionTier[]);

const tiersForHandler = (source: CommissionTierSource, handlerName: string) => (
  typeof source === 'function' ? source(handlerName) : source
);

/** Each handler's bands, looked up by the staff name the deals carry. */
export function buildCommissionTierSource(plans: CommissionTierPlan[], roleAccounts: Pick<RoleAccount, 'name' | 'commission_tier_plan_id'>[]): CommissionTierSource {
  return (handlerName: string) => getStaffCommissionTierPlan(plans, roleAccounts.find((account) => account.name === handlerName)).tiers;
}

/** Commission on a month's total sales, band by band, rounded to the sen. */
export function calculateProgressiveCommission(totalSales: number, tiers: CommissionTier[]): number {
  const total = Math.max(0, Number(totalSales) || 0);
  const bands = normalizeCommissionTiers(tiers);
  let commission = 0;
  bands.forEach((tier, index) => {
    const upper = index + 1 < bands.length ? bands[index + 1].from : Infinity;
    const inBand = Math.min(total, upper) - tier.from;
    if (inBand > 0) commission += inBand * tier.percent / 100;
  });
  return roundCents(commission);
}

/**
 * Whether the deal's commission follows the tiers. A hand-typed amount or a
 * stored percent is manual; a deal saved before tiers existed counts as manual
 * only when it already carries an amount, so nobody's typed figure changes.
 */
export function isTierCommission(finance: Pick<DealFinance, 'commission_source' | 'commission_percent' | 'commission_amount'> | null | undefined): boolean {
  if (!finance) return false;
  if (finance.commission_source === 'manual') return false;
  if (finance.commission_source === 'tier') return true;
  return finance.commission_percent === undefined && !(Number(finance.commission_amount) > 0);
}

/** Malaysia YYYY-MM of the delivery, the month the commission is earned in. */
export function getCommissionMonthKey(finance: Pick<DealFinance, 'delivery_at'> | null | undefined): string {
  return malaysiaDate(finance?.delivery_at || '').slice(0, 7);
}

const isDeliveredDeal = (application: LoanApplication) => (
  application.deal_finance?.sale_status === 'Bike Delivered'
  && Boolean(getCommissionMonthKey(application.deal_finance))
);

export interface TierCommissionEntry {
  /** This deal's share: commission of the month up to and including it, minus the month before it. */
  amount: number;
  monthKey: string;
  /** The handler's gross sales for the whole month. */
  monthSales: number;
  /** The handler's commission for the whole month. */
  monthCommission: number;
}

/**
 * Every delivered deal's tier commission. Deals are grouped by handler and
 * Malaysia delivery month and taken in delivery order, so the deal that pushes
 * the month into a higher band earns the higher rate on the part above it and
 * the shares always add up to the month's commission. Every delivered deal
 * counts toward the month's sales, manual or paid ones included.
 */
export function buildTierCommissions(applications: LoanApplication[], source: CommissionTierSource): Map<string, TierCommissionEntry> {
  const groups = new Map<string, LoanApplication[]>();
  applications.filter(isDeliveredDeal).forEach((application) => {
    const key = `${application.handler_name}\u0000${getCommissionMonthKey(application.deal_finance)}`;
    groups.set(key, [...(groups.get(key) || []), application]);
  });

  const result = new Map<string, TierCommissionEntry>();
  groups.forEach((deals) => {
    const tiers = tiersForHandler(source, deals[0].handler_name);
    const ordered = [...deals].sort((left, right) => (
      malaysiaDate(left.deal_finance?.delivery_at || '').localeCompare(malaysiaDate(right.deal_finance?.delivery_at || ''))
      || String(left.deal_finance?.delivery_at || '').localeCompare(String(right.deal_finance?.delivery_at || ''))
      || left.id.localeCompare(right.id)
    ));
    const monthSales = roundCents(ordered.reduce((sum, deal) => sum + Math.max(0, Number(deal.deal_finance?.final_selling_price) || 0), 0));
    const monthCommission = calculateProgressiveCommission(monthSales, tiers);
    let cumulative = 0;
    ordered.forEach((deal) => {
      const before = calculateProgressiveCommission(cumulative, tiers);
      cumulative = roundCents(cumulative + Math.max(0, Number(deal.deal_finance?.final_selling_price) || 0));
      result.set(deal.id, {
        amount: roundCents(calculateProgressiveCommission(cumulative, tiers) - before),
        monthKey: getCommissionMonthKey(deal.deal_finance),
        monthSales,
        monthCommission
      });
    });
  });
  return result;
}

/** Whether the stored commission may still move: tier-based, not paid, not reversed. */
export function isTierCommissionOpen(finance: DealFinance | null | undefined): boolean {
  return Boolean(
    finance
    && isTierCommission(finance)
    && !finance.commission_paid_at
    && finance.commission_status !== 'Paid'
    && finance.sale_status !== 'Cancelled'
  );
}

/** Delivered, open tier deals whose stored amount differs from the tiers. */
export function getTierCommissionUpdates(
  applications: LoanApplication[],
  source: CommissionTierSource,
  handlerName?: string
): Array<{ applicationId: string; amount: number }> {
  const entries = buildTierCommissions(applications, source);
  return applications.flatMap((application) => {
    if (handlerName !== undefined && application.handler_name !== handlerName) return [];
    const entry = entries.get(application.id);
    const finance = application.deal_finance;
    if (!entry || !isTierCommissionOpen(finance)) return [];
    const stored = Number(finance?.commission_amount) || 0;
    if (Math.abs(stored - entry.amount) < 0.005 && finance?.commission_source === 'tier') return [];
    return [{ applicationId: application.id, amount: entry.amount }];
  });
}
