/**
 * Normalizers for the Settings lists stored in dashboard_state: bank
 * definitions, marketing tag relationships and tag normalization rules.
 * Moved verbatim from App.tsx; App, useDashboardHydration and
 * useSettingsListActions share them.
 */
import { BankDefinition, DEFAULT_VEHICLE_BRAND_TAGS, MarketingTagRelationship, TagNormalizationRule } from '../types';
import { newId } from './id';

const MOTOR_PRICE_BRAND_TAG_SET = new Set(DEFAULT_VEHICLE_BRAND_TAGS);

/** Trimmed, one per bank (case-insensitive), in the order typed. */
export const normalizeAutoDebitBanks = (list: unknown[]) => {
  const seen = new Set<string>();
  return list
    .map((name) => String(name ?? '').trim().replace(/\s+/g, ' '))
    .filter((name) => {
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

export const normalizeBankDefinitions = (list: BankDefinition[]) => {
  const byName = new Map<string, BankDefinition>();

  list.forEach((item) => {
    const name = String(item.name || '').trim().replace(/\s+/g, ' ');
    const key = name.toLowerCase();
    if (!name || !key) {
      return;
    }

    byName.set(key, {
      id: item.id || newId('BANK'),
      name,
      icon_data_url: String(item.icon_data_url || ''),
      active: item.active !== false,
      ...(typeof item.show_in_loan_table === 'boolean' ? { show_in_loan_table: item.show_in_loan_table } : {}),
      ...(Array.isArray(item.auto_debit_banks) ? { auto_debit_banks: normalizeAutoDebitBanks(item.auto_debit_banks) } : {}),
      created_at: item.created_at || new Date().toISOString()
    });
  });

  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const normalizeMarketingTagRelationships = (list: MarketingTagRelationship[]) => {
  const bySource = new Map<string, MarketingTagRelationship>();

  list.forEach((item) => {
    const source = item.source.trim().replace(/\s+/g, ' ');
    const key = source.toLowerCase();
    if (!source || !key) {
      return;
    }

    bySource.set(key, {
      ...item,
      id: item.id || newId('MKT'),
      source,
      medium: item.medium.trim() || 'Other',
      category: item.category.trim() || 'Lead source',
      created_at: item.created_at || new Date().toISOString()
    });
  });

  return Array.from(bySource.values()).sort((a, b) => a.source.localeCompare(b.source));
};

export const normalizeTagNormalizationRules = (list: TagNormalizationRule[]) => {
  const byRule = new Map<string, TagNormalizationRule>();

  list.forEach((rule) => {
    const rawValue = rule.raw_value.trim().replace(/\s+/g, ' ');
    const domain = rule.domain;
    const parentTag = rule.parent_tag.trim().replace(/\s+/g, ' ');
    const key = `${domain}:${rawValue.toLowerCase()}`;
    if (!rawValue || !domain) {
      return;
    }
    if (domain === 'vehicle' && !MOTOR_PRICE_BRAND_TAG_SET.has(parentTag)) {
      return;
    }

    byRule.set(key, {
      ...rule,
      id: rule.id || newId('NORM'),
      domain,
      raw_value: rawValue,
      normalized_tag: rule.normalized_tag.trim().replace(/\s+/g, ' ') || rawValue,
      parent_tag: parentTag || 'Other',
      category: rule.category.trim().replace(/\s+/g, ' ') || 'Other',
      active: rule.active !== false,
      created_at: rule.created_at || new Date().toISOString()
    });
  });

  return Array.from(byRule.values()).sort((a, b) => (
    a.domain.localeCompare(b.domain) ||
    a.raw_value.localeCompare(b.raw_value)
  ));
};
