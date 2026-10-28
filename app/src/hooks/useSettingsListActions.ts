/**
 * Settings list actions: bank definitions, marketing tag relationships and tag
 * normalization rules (Super Admin only). Moved verbatim from App.tsx; every
 * value the handlers used from App's closure is now an explicit dependency.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import { tr } from '../lib/i18n';
import type { DashboardState } from '../services/dashboardRepository';
import { AuditLogEntry, BankDefinition, MarketingTagRelationship, RoleAccountRole, TagNormalizationRule } from '../types';
import { isBankShownInLoanTable } from '../utils/loanTableBankColumns';
import {
  normalizeBankDefinitions,
  normalizeMarketingTagRelationships,
  normalizeTagNormalizationRules
} from '../utils/settingsListNormalizers';

export interface SettingsListAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface SettingsListActionsDeps {
  currentStaffRole: RoleAccountRole;
  bankDefinitions: BankDefinition[];
  marketingTagRelationships: MarketingTagRelationship[];
  tagNormalizationRules: TagNormalizationRule[];
  setBankDefinitions: (list: BankDefinition[]) => void;
  writeLocalDashboardValue: (key: 'bankDefinitions', value: BankDefinition[]) => void;
  updateBankDefinitionsState: (list: BankDefinition[]) => Promise<boolean>;
  updateMarketingTagRelationshipsState: (list: MarketingTagRelationship[]) => unknown;
  updateTagNormalizationRulesState: (list: TagNormalizationRule[]) => unknown;
  uploadBankIcon: (bankId: string, dataUrl: string) => Promise<string>;
  appendAuditLog: (input: SettingsListAuditInput) => void;
  createAuditChanges: <Before extends object, After extends object>(before: Before, after: After) => AuditLogEntry['changes'];
  triggerToast: (message: string, tone?: 'success' | 'warning' | 'error') => void;
}

export function useSettingsListActions({
  currentStaffRole,
  bankDefinitions,
  marketingTagRelationships,
  tagNormalizationRules,
  setBankDefinitions,
  writeLocalDashboardValue,
  updateBankDefinitionsState,
  updateMarketingTagRelationshipsState,
  updateTagNormalizationRulesState,
  uploadBankIcon,
  appendAuditLog,
  createAuditChanges,
  triggerToast
}: SettingsListActionsDeps) {
  const handleAddBankDefinition = async (item: Pick<BankDefinition, 'name' | 'icon_data_url'>): Promise<boolean> => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return false;
    }

    const name = item.name.trim().replace(/\s+/g, ' ');
    if (!name) {
      triggerToast(tr('银行名称不能为空', 'Bank name is required', "Nama bank diperlukan"));
      return false;
    }

    const existing = bankDefinitions.find((bank) => bank.name.toLowerCase() === name.toLowerCase());
    const bankId = existing?.id || `BANK-${Date.now()}`;
    let iconDataUrl = item.icon_data_url || existing?.icon_data_url || '';
    if (iconDataUrl.startsWith('data:')) {
      try {
        iconDataUrl = await uploadBankIcon(bankId, iconDataUrl);
      } catch (error) {
        console.warn('Bank icon upload failed.', error);
        triggerToast(tr(
          '银行图标上传失败，银行尚未保存。请重试。',
          'Bank icon upload failed, so the bank was not saved. Please try again.',
          'Muat naik ikon bank gagal, jadi bank belum disimpan. Sila cuba lagi.'
        ), 'error');
        return false;
      }
    }

    const nextBank: BankDefinition = {
      id: bankId,
      name,
      icon_data_url: iconDataUrl,
      active: existing?.active ?? true,
      created_at: existing?.created_at || new Date().toISOString()
    };
    const nextBanks = existing
      ? bankDefinitions.map((bank) => bank.id === existing.id ? nextBank : bank)
      : [...bankDefinitions, nextBank];
    const normalizedBanks = normalizeBankDefinitions(nextBanks);

    const saved = await updateBankDefinitionsState(nextBanks);
    if (!saved) {
      setBankDefinitions(bankDefinitions);
      writeLocalDashboardValue('bankDefinitions', bankDefinitions);
      triggerToast(tr(
        '银行资料未同步到云端，请重试。',
        'The bank was not synced to the cloud. Please try again.',
        'Bank tidak disegerakkan ke awan. Sila cuba lagi.'
      ), 'error');
      return false;
    }

    appendAuditLog({
      action: existing ? 'UPDATE_BANK_DEFINITION' : 'ADD_BANK_DEFINITION',
      target_type: 'Bank Definition',
      target_id: nextBank.id,
      target_label: nextBank.name,
      changes: createAuditChanges(
        existing ? {
          name: existing.name,
          icon: existing.icon_data_url ? 'Custom icon' : 'Default icon',
          active: existing.active
        } : {},
        {
          name: nextBank.name,
          icon: nextBank.icon_data_url ? 'Custom icon' : 'Default icon',
          active: nextBank.active
        }
      ),
      stateOverrides: { bankDefinitions: normalizedBanks }
    });
    triggerToast(tr(`银行 ${name} 已保存`, `Bank ${name} saved`, `Bank ${name} disimpan`));
    return true;
  };

  const handleUpdateBankDefinition = async (id: string, updates: Partial<BankDefinition>): Promise<boolean> => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return false;
    }

    const previous = bankDefinitions.find((item) => item.id === id);
    if (!previous) {
      return false;
    }

    let nextIconDataUrl = updates.icon_data_url ?? previous.icon_data_url;
    if (nextIconDataUrl.startsWith('data:')) {
      try {
        nextIconDataUrl = await uploadBankIcon(id, nextIconDataUrl);
      } catch (error) {
        console.warn('Bank icon upload failed.', error);
        triggerToast(tr(
          '银行图标上传失败，请重试。',
          'Bank icon upload failed. Please try again.',
          'Muat naik ikon bank gagal. Sila cuba lagi.'
        ), 'error');
        return false;
      }
    }

    const updatedBank: BankDefinition = {
      ...previous,
      ...updates,
      name: (updates.name || previous.name).trim().replace(/\s+/g, ' '),
      icon_data_url: nextIconDataUrl,
      active: updates.active ?? previous.active
    };

    if (!updatedBank.name) {
      triggerToast(tr('银行名称不能为空', 'Bank name is required', "Nama bank diperlukan"));
      return false;
    }

    const duplicated = bankDefinitions.some((bank) => (
      bank.id !== id &&
      bank.name.toLowerCase() === updatedBank.name.toLowerCase()
    ));

    if (duplicated) {
      triggerToast(tr('银行名称已存在', 'Bank name already exists', "Nama bank sudah wujud"));
      return false;
    }

    const nextBanks = bankDefinitions.map((bank) => bank.id === id ? updatedBank : bank);
    const normalizedBanks = normalizeBankDefinitions(nextBanks);

    const saved = await updateBankDefinitionsState(nextBanks);
    if (!saved) {
      setBankDefinitions(bankDefinitions);
      writeLocalDashboardValue('bankDefinitions', bankDefinitions);
      triggerToast(tr(
        '银行资料未同步到云端，请重试。',
        'The bank update was not synced to the cloud. Please try again.',
        'Kemas kini bank tidak disegerakkan ke awan. Sila cuba lagi.'
      ), 'error');
      return false;
    }

    appendAuditLog({
      action: 'UPDATE_BANK_DEFINITION',
      target_type: 'Bank Definition',
      target_id: id,
      target_label: updatedBank.name,
      changes: createAuditChanges(
        {
          name: previous.name,
          icon: previous.icon_data_url ? 'Custom icon' : 'Default icon',
          active: previous.active,
          show_in_loan_table: isBankShownInLoanTable(previous)
        },
        {
          name: updatedBank.name,
          icon: updatedBank.icon_data_url ? 'Custom icon' : 'Default icon',
          active: updatedBank.active,
          show_in_loan_table: isBankShownInLoanTable(updatedBank)
        }
      ),
      stateOverrides: { bankDefinitions: normalizedBanks }
    });
    triggerToast(tr(`银行 ${updatedBank.name} 已更新`, `Bank ${updatedBank.name} updated`, `Bank ${updatedBank.name} dikemas kini`));
    return true;
  };

  const handleDeleteBankDefinition = (id: string) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = bankDefinitions.find((item) => item.id === id);
    if (!previous || bankDefinitions.length <= 1) {
      return;
    }

    const nextBanks = bankDefinitions.filter((item) => item.id !== id);
    const normalizedBanks = normalizeBankDefinitions(nextBanks);

    updateBankDefinitionsState(nextBanks);
    appendAuditLog({
      action: 'DELETE_BANK_DEFINITION',
      target_type: 'Bank Definition',
      target_id: id,
      target_label: previous.name,
      changes: createAuditChanges(
        {
          name: previous.name,
          icon: previous.icon_data_url ? 'Custom icon' : 'Default icon',
          active: previous.active,
          deleted: 'No'
        },
        { deleted: 'Yes' }
      ),
      stateOverrides: { bankDefinitions: normalizedBanks }
    });
    triggerToast(tr(`银行 ${previous.name} 已删除`, `Bank ${previous.name} deleted`, `Bank ${previous.name} dipadamkan`));
  };

  const handleAddMarketingTagRelationship = (item: Pick<MarketingTagRelationship, 'source' | 'medium' | 'category'>) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const source = item.source.trim().replace(/\s+/g, ' ');
    if (!source) {
      triggerToast(tr('来源不能为空', 'Source is required', "Sumber diperlukan"));
      return;
    }

    const existing = marketingTagRelationships.find((relationship) => relationship.source.toLowerCase() === source.toLowerCase());
    const nextItem: MarketingTagRelationship = {
      id: existing?.id || `MKT-${Date.now()}`,
      source,
      medium: item.medium.trim() || 'Other',
      category: item.category.trim() || 'Lead source',
      created_at: existing?.created_at || new Date().toISOString()
    };
    const nextRelationships = existing
      ? marketingTagRelationships.map((relationship) => relationship.id === existing.id ? nextItem : relationship)
      : [...marketingTagRelationships, nextItem];
    const normalizedRelationships = normalizeMarketingTagRelationships(nextRelationships);

    updateMarketingTagRelationshipsState(nextRelationships);
    appendAuditLog({
      action: existing ? 'UPDATE_MARKETING_TAG_RELATIONSHIP' : 'ADD_MARKETING_TAG_RELATIONSHIP',
      target_type: 'Marketing Tag Relationship',
      target_id: nextItem.id,
      target_label: nextItem.source,
      changes: createAuditChanges(
        existing ? {
          source: existing.source,
          medium: existing.medium,
          category: existing.category
        } : {},
        {
          source: nextItem.source,
          medium: nextItem.medium,
          category: nextItem.category
        }
      ),
      stateOverrides: { marketingTagRelationships: normalizedRelationships }
    });
    triggerToast(tr(`营销关系 ${source} 已保存`, `Marketing relationship ${source} saved`, `Hubungan pemasaran ${source} disimpan`));
  };

  const handleUpdateMarketingTagRelationship = (id: string, updates: Partial<MarketingTagRelationship>) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = marketingTagRelationships.find((item) => item.id === id);
    if (!previous) {
      return;
    }

    const updatedItem: MarketingTagRelationship = {
      ...previous,
      ...updates,
      source: (updates.source || previous.source).trim().replace(/\s+/g, ' '),
      medium: (updates.medium || previous.medium).trim() || 'Other',
      category: (updates.category || previous.category).trim() || 'Lead source'
    };

    if (!updatedItem.source) {
      triggerToast(tr('来源不能为空', 'Source is required', "Sumber diperlukan"));
      return;
    }

    const duplicated = marketingTagRelationships.some((item) => (
      item.id !== id &&
      item.source.toLowerCase() === updatedItem.source.toLowerCase()
    ));

    if (duplicated) {
      triggerToast(tr('来源已存在', 'Source already exists', "Sumber sudah wujud"));
      return;
    }

    const nextRelationships = marketingTagRelationships.map((item) => item.id === id ? updatedItem : item);
    const normalizedRelationships = normalizeMarketingTagRelationships(nextRelationships);

    updateMarketingTagRelationshipsState(nextRelationships);
    appendAuditLog({
      action: 'UPDATE_MARKETING_TAG_RELATIONSHIP',
      target_type: 'Marketing Tag Relationship',
      target_id: id,
      target_label: updatedItem.source,
      changes: createAuditChanges(
        {
          source: previous.source,
          medium: previous.medium,
          category: previous.category
        },
        {
          source: updatedItem.source,
          medium: updatedItem.medium,
          category: updatedItem.category
        }
      ),
      stateOverrides: { marketingTagRelationships: normalizedRelationships }
    });
    triggerToast(tr(`营销关系 ${updatedItem.source} 已更新`, `Marketing relationship ${updatedItem.source} updated`, `Hubungan pemasaran ${updatedItem.source} dikemas kini`));
  };

  const handleDeleteMarketingTagRelationship = (id: string) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = marketingTagRelationships.find((item) => item.id === id);
    if (!previous || marketingTagRelationships.length <= 1) {
      return;
    }

    const nextRelationships = marketingTagRelationships.filter((item) => item.id !== id);
    const normalizedRelationships = normalizeMarketingTagRelationships(nextRelationships);

    updateMarketingTagRelationshipsState(nextRelationships);
    appendAuditLog({
      action: 'DELETE_MARKETING_TAG_RELATIONSHIP',
      target_type: 'Marketing Tag Relationship',
      target_id: id,
      target_label: previous.source,
      changes: createAuditChanges(
        {
          source: previous.source,
          medium: previous.medium,
          category: previous.category,
          deleted: 'No'
        },
        { deleted: 'Yes' }
      ),
      stateOverrides: { marketingTagRelationships: normalizedRelationships }
    });
    triggerToast(tr(`营销关系 ${previous.source} 已删除`, `Marketing relationship ${previous.source} deleted`, `Hubungan pemasaran ${previous.source} dipadamkan`));
  };

  const handleAddTagNormalizationRule = (rule: Omit<TagNormalizationRule, 'id' | 'created_at'>) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const rawValue = rule.raw_value.trim().replace(/\s+/g, ' ');
    if (!rawValue) {
      triggerToast(tr('原始值不能为空', 'Raw value is required', "Nilai mentah diperlukan"));
      return;
    }

    const existing = tagNormalizationRules.find((item) => (
      item.domain === rule.domain &&
      item.raw_value.trim().replace(/\s+/g, ' ').toLowerCase() === rawValue.toLowerCase()
    ));
    const nextRule: TagNormalizationRule = {
      id: existing?.id || `NORM-${Date.now()}`,
      domain: rule.domain,
      raw_value: rawValue,
      normalized_tag: rule.normalized_tag.trim().replace(/\s+/g, ' ') || rawValue,
      parent_tag: rule.parent_tag.trim().replace(/\s+/g, ' ') || 'Other',
      category: rule.category.trim().replace(/\s+/g, ' ') || 'Other',
      active: rule.active !== false,
      created_at: existing?.created_at || new Date().toISOString()
    };
    const nextRules = existing
      ? tagNormalizationRules.map((item) => item.id === existing.id ? nextRule : item)
      : [...tagNormalizationRules, nextRule];
    const normalizedRules = normalizeTagNormalizationRules(nextRules);

    updateTagNormalizationRulesState(nextRules);
    appendAuditLog({
      action: existing ? 'UPDATE_TAG_NORMALIZATION_RULE' : 'ADD_TAG_NORMALIZATION_RULE',
      target_type: 'Tag Normalization Rule',
      target_id: nextRule.id,
      target_label: `${nextRule.domain}: ${nextRule.raw_value}`,
      changes: createAuditChanges(
        existing ? {
          domain: existing.domain,
          raw_value: existing.raw_value,
          normalized_tag: existing.normalized_tag,
          parent_tag: existing.parent_tag,
          category: existing.category,
          active: existing.active
        } : {},
        {
          domain: nextRule.domain,
          raw_value: nextRule.raw_value,
          normalized_tag: nextRule.normalized_tag,
          parent_tag: nextRule.parent_tag,
          category: nextRule.category,
          active: nextRule.active
        }
      ),
      stateOverrides: { tagNormalizationRules: normalizedRules }
    });
    triggerToast(tr(`归一化规则 ${rawValue} 已保存`, `Normalization rule ${rawValue} saved`, `Peraturan penormalan ${rawValue} disimpan`));
  };

  const handleUpdateTagNormalizationRule = (id: string, updates: Partial<TagNormalizationRule>) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = tagNormalizationRules.find((item) => item.id === id);
    if (!previous) {
      return;
    }

    const updatedRule: TagNormalizationRule = {
      ...previous,
      ...updates,
      domain: updates.domain || previous.domain,
      raw_value: (updates.raw_value || previous.raw_value).trim().replace(/\s+/g, ' '),
      normalized_tag: (updates.normalized_tag || previous.normalized_tag).trim().replace(/\s+/g, ' '),
      parent_tag: (updates.parent_tag || previous.parent_tag).trim().replace(/\s+/g, ' '),
      category: (updates.category || previous.category).trim().replace(/\s+/g, ' '),
      active: updates.active ?? previous.active
    };

    if (!updatedRule.raw_value) {
      triggerToast(tr('原始值不能为空', 'Raw value is required', "Nilai mentah diperlukan"));
      return;
    }

    const duplicated = tagNormalizationRules.some((item) => (
      item.id !== id &&
      item.domain === updatedRule.domain &&
      item.raw_value.trim().replace(/\s+/g, ' ').toLowerCase() === updatedRule.raw_value.toLowerCase()
    ));

    if (duplicated) {
      triggerToast(tr('同一个类别下已有这个原始值', 'This raw value already exists in this domain', "Nilai mentah ini sudah wujud dalam domain ini"));
      return;
    }

    const nextRules = tagNormalizationRules.map((item) => item.id === id ? updatedRule : item);
    const normalizedRules = normalizeTagNormalizationRules(nextRules);

    updateTagNormalizationRulesState(nextRules);
    appendAuditLog({
      action: 'UPDATE_TAG_NORMALIZATION_RULE',
      target_type: 'Tag Normalization Rule',
      target_id: id,
      target_label: `${updatedRule.domain}: ${updatedRule.raw_value}`,
      changes: createAuditChanges(
        {
          domain: previous.domain,
          raw_value: previous.raw_value,
          normalized_tag: previous.normalized_tag,
          parent_tag: previous.parent_tag,
          category: previous.category,
          active: previous.active
        },
        {
          domain: updatedRule.domain,
          raw_value: updatedRule.raw_value,
          normalized_tag: updatedRule.normalized_tag,
          parent_tag: updatedRule.parent_tag,
          category: updatedRule.category,
          active: updatedRule.active
        }
      ),
      stateOverrides: { tagNormalizationRules: normalizedRules }
    });
    triggerToast(tr(`归一化规则 ${updatedRule.raw_value} 已更新`, `Normalization rule ${updatedRule.raw_value} updated`, `Peraturan penormalan ${updatedRule.raw_value} dikemas kini`));
  };

  const handleDeleteTagNormalizationRule = (id: string) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = tagNormalizationRules.find((item) => item.id === id);
    if (!previous || tagNormalizationRules.length <= 1) {
      return;
    }

    const nextRules = tagNormalizationRules.filter((item) => item.id !== id);
    const normalizedRules = normalizeTagNormalizationRules(nextRules);

    updateTagNormalizationRulesState(nextRules);
    appendAuditLog({
      action: 'DELETE_TAG_NORMALIZATION_RULE',
      target_type: 'Tag Normalization Rule',
      target_id: id,
      target_label: `${previous.domain}: ${previous.raw_value}`,
      changes: createAuditChanges(
        {
          domain: previous.domain,
          raw_value: previous.raw_value,
          normalized_tag: previous.normalized_tag,
          parent_tag: previous.parent_tag,
          category: previous.category,
          deleted: 'No'
        },
        { deleted: 'Yes' }
      ),
      stateOverrides: { tagNormalizationRules: normalizedRules }
    });
    triggerToast(tr(`归一化规则 ${previous.raw_value} 已删除`, `Normalization rule ${previous.raw_value} deleted`, `Peraturan penormalan ${previous.raw_value} dipadamkan`));
  };

  return {
    handleAddBankDefinition,
    handleUpdateBankDefinition,
    handleDeleteBankDefinition,
    handleAddMarketingTagRelationship,
    handleUpdateMarketingTagRelationship,
    handleDeleteMarketingTagRelationship,
    handleAddTagNormalizationRule,
    handleUpdateTagNormalizationRule,
    handleDeleteTagNormalizationRule
  };
}
