/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VehicleCatalogItem, VehicleCategory } from '../types';

// Seed date for the initial rate/price versions. Kept as a fixed ISO string
// (not Date.now) so module evaluation is deterministic.
export const VEHICLE_CATEGORY_SEED_DATE = '2026-01-01';
const SEED_TS = `${VEHICLE_CATEGORY_SEED_DATE}T00:00:00.000Z`;

// Five default categories (Super Admin can edit rates, add more). cc range is a
// hint only — maxi scooter/big bike overlap 250-500, and the two super bikes are
// split by brand origin not cc, so the category is chosen manually per model.
export const DEFAULT_VEHICLE_CATEGORIES: VehicleCategory[] = [
  { id: 'moped', name: 'Moped', cc_label: '≤250cc', default_max_tenure: 5, active: true, rate_history: [{ rate: 10, effective_from: VEHICLE_CATEGORY_SEED_DATE, updated_at: SEED_TS, updated_by: 'system' }] },
  { id: 'maxi_scooter', name: 'Maxi Scooter', cc_label: '250–500cc', default_max_tenure: 7, active: true, rate_history: [{ rate: 4.8, effective_from: VEHICLE_CATEGORY_SEED_DATE, updated_at: SEED_TS, updated_by: 'system' }] },
  { id: 'big_bike', name: 'Big Bike', cc_label: '250–500cc', default_max_tenure: 7, active: true, rate_history: [{ rate: 6, effective_from: VEHICLE_CATEGORY_SEED_DATE, updated_at: SEED_TS, updated_by: 'system' }] },
  { id: 'super_bike_china', name: 'Super Bike (China)', cc_label: '≥500cc', default_max_tenure: 7, active: true, rate_history: [{ rate: 5.28, effective_from: VEHICLE_CATEGORY_SEED_DATE, updated_at: SEED_TS, updated_by: 'system' }] },
  { id: 'super_bike_brand', name: 'Super Bike (Big Brand)', cc_label: '≥500cc', default_max_tenure: 7, active: true, rate_history: [{ rate: 4.5, effective_from: VEHICLE_CATEGORY_SEED_DATE, updated_at: SEED_TS, updated_by: 'system' }] }
];

export const MIN_VEHICLE_TENURE = 2;
export const MAX_VEHICLE_TENURE = 7;

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Pick the version in effect on `asOf` (latest effective_from <= asOf). Falls
// back to the earliest version if none is effective yet.
function pickEffective<T extends { effective_from: string }>(history: T[], asOf: string): T | undefined {
  const list = (history || []).filter((h) => h && typeof h.effective_from === 'string');
  if (list.length === 0) {
    return undefined;
  }
  const sorted = [...list].sort((a, b) => (a.effective_from < b.effective_from ? 1 : a.effective_from > b.effective_from ? -1 : 0));
  return sorted.find((h) => h.effective_from <= asOf) || sorted[sorted.length - 1];
}

export function getEffectiveCategoryRate(category: VehicleCategory | undefined, asOf: string = getTodayDateKey()): number {
  if (!category) {
    return 0;
  }
  const version = pickEffective(category.rate_history, asOf);
  return version ? Number(version.rate) || 0 : 0;
}

export function getEffectivePrice(
  item: VehicleCatalogItem,
  asOf: string = getTodayDateKey()
): { loan_amount: number; deposit: number } {
  const version = pickEffective(item.price_history || [], asOf);
  if (version) {
    return { loan_amount: Number(version.loan_amount) || 0, deposit: Number(version.deposit) || 0 };
  }
  // Fall back to the legacy flat fields for models not yet migrated to history.
  return { loan_amount: Number(item.loan_amount) || 0, deposit: Number(item.deposit_amount) || 0 };
}

// Flat-rate hire-purchase monthly installment:
//   monthly = base × (1 + rate% × years) ÷ (years × 12)
export function computeMonthlyInstallment(base: number, ratePercent: number, years: number): number {
  if (years <= 0 || base <= 0) {
    return 0;
  }
  const total = base * (1 + (ratePercent / 100) * years);
  return Math.round((total / (years * 12)) * 100) / 100;
}

export function getVehicleEffectiveRate(
  item: VehicleCatalogItem,
  category: VehicleCategory | undefined,
  asOf: string = getTodayDateKey()
): number {
  if (typeof item.interest_rate_override === 'number' && Number.isFinite(item.interest_rate_override)) {
    return item.interest_rate_override;
  }
  return getEffectiveCategoryRate(category, asOf);
}

export function getVehicleMaxTenure(item: VehicleCatalogItem, category: VehicleCategory | undefined): number {
  const raw = (typeof item.max_tenure === 'number' && item.max_tenure > 0)
    ? item.max_tenure
    : (category ? category.default_max_tenure : 5);
  return Math.min(MAX_VEHICLE_TENURE, Math.max(MIN_VEHICLE_TENURE, Math.floor(raw)));
}

// { 2: monthly, 3: monthly, ... up to the model's max tenure }
export function computeVehicleInstallments(
  item: VehicleCatalogItem,
  category: VehicleCategory | undefined,
  asOf: string = getTodayDateKey()
): Record<number, number> {
  const price = getEffectivePrice(item, asOf);
  const base = Math.max(0, price.loan_amount - price.deposit);
  const rate = getVehicleEffectiveRate(item, category, asOf);
  const maxTenure = getVehicleMaxTenure(item, category);
  const out: Record<number, number> = {};
  for (let year = MIN_VEHICLE_TENURE; year <= maxTenure; year += 1) {
    out[year] = computeMonthlyInstallment(base, rate, year);
  }
  return out;
}

export function buildDefaultVehicleCategories(): VehicleCategory[] {
  return DEFAULT_VEHICLE_CATEGORIES.map((category) => ({
    ...category,
    rate_history: category.rate_history.map((version) => ({ ...version }))
  }));
}

export function normalizeVehicleCategories(list: VehicleCategory[] | undefined): VehicleCategory[] {
  if (!Array.isArray(list) || list.length === 0) {
    return buildDefaultVehicleCategories();
  }
  return list
    .filter((category) => category && typeof category.id === 'string' && category.id.trim())
    .map((category) => ({
      id: category.id,
      name: String(category.name || category.id),
      cc_label: String(category.cc_label || ''),
      default_max_tenure: Math.min(MAX_VEHICLE_TENURE, Math.max(MIN_VEHICLE_TENURE, Math.floor(Number(category.default_max_tenure) || 5))),
      active: category.active !== false,
      rate_history: Array.isArray(category.rate_history)
        ? category.rate_history
          .filter((version) => version && typeof version.effective_from === 'string')
          .map((version) => ({
            rate: Number(version.rate) || 0,
            effective_from: version.effective_from,
            updated_at: String(version.updated_at || ''),
            updated_by: String(version.updated_by || '')
          }))
        : []
    }));
}

// Variant suffix tokens that indicate a trim of the same series.
const VARIANT_CODE_TOKENS = new Set([
  'se', 'abs', 'sp', 'std', 'fi', 'pro', 'le', 'ltd', 'deluxe',
  'v1', 'v2', 'v3', 'v4', 'v5', 's', 'r', 'gt', 'x'
]);

// Split a model name into a series (family) and a variant. The last token is a
// variant when it is a pure number (e.g. Aveta Nova "200") or a known trim code
// (SE/ABS/...). Single-token or non-variant names are their own series.
export function deriveVehicleSeries(model: string): { series: string; variant: string } {
  const clean = (model || '').trim().replace(/\s+/g, ' ');
  if (!clean) {
    return { series: '', variant: '' };
  }
  const tokens = clean.split(' ');
  if (tokens.length >= 2) {
    const last = tokens[tokens.length - 1];
    const lastKey = last.toLowerCase().replace(/[()]/g, '');
    if (/^\d+$/.test(lastKey) || VARIANT_CODE_TOKENS.has(lastKey)) {
      return { series: tokens.slice(0, -1).join(' '), variant: last };
    }
  }
  return { series: clean, variant: '' };
}

// Series with an optional manual override (item.series wins over the derived one).
export function getVehicleSeries(model: string, override?: string): { series: string; variant: string } {
  const derived = deriveVehicleSeries(model);
  const trimmedOverride = (override || '').trim();
  if (trimmedOverride) {
    const rest = (model || '').trim();
    const variant = rest.toLowerCase().startsWith(trimmedOverride.toLowerCase())
      ? (rest.slice(trimmedOverride.length).trim() || derived.variant || rest)
      : (derived.variant || rest);
    return { series: trimmedOverride, variant };
  }
  return derived;
}
