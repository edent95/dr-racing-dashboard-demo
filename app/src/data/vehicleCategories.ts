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

const MIN_VEHICLE_TENURE = 2;
const MAX_VEHICLE_TENURE = 7;

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
