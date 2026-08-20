/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Brand logos are keyed by a normalized (trimmed, lowercased) brand name so a
// model's `brand` field matches regardless of casing/spacing. Values are small
// base64 data URLs (logos are downscaled before saving) kept in dashboard_state.
export type VehicleBrandLogos = Record<string, string>;

export function vehicleBrandLogoKey(brand: string): string {
  return (brand || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function normalizeVehicleBrandLogos(input: unknown): VehicleBrandLogos {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const out: VehicleBrandLogos = {};
  for (const [rawKey, rawValue] of Object.entries(input as Record<string, unknown>)) {
    const key = vehicleBrandLogoKey(String(rawKey));
    if (key && typeof rawValue === 'string' && rawValue.trim()) {
      out[key] = rawValue;
    }
  }
  return out;
}

export function getVehicleBrandLogo(logos: VehicleBrandLogos | undefined, brand: string): string {
  if (!logos) {
    return '';
  }
  return logos[vehicleBrandLogoKey(brand)] || '';
}

export function setVehicleBrandLogo(logos: VehicleBrandLogos, brand: string, dataUrl: string): VehicleBrandLogos {
  const next: VehicleBrandLogos = { ...logos };
  const key = vehicleBrandLogoKey(brand);
  if (!key) {
    return next;
  }
  if (dataUrl) {
    next[key] = dataUrl;
  } else {
    delete next[key];
  }
  return next;
}
