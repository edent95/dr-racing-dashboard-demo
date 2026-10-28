/**
 * Vehicle Info actions: vehicle and brand tags, catalog add / update / merge /
 * delete, model rename and finance-profile terms. Moved verbatim from App.tsx;
 * every value the handlers used from App's closure is now an explicit
 * dependency.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import type { Dispatch, SetStateAction } from 'react';
import { tr } from '../lib/i18n';
import type { DashboardState } from '../services/dashboardRepository';
import {
  AuditLogEntry,
  DEFAULT_VEHICLE_BRAND_TAGS,
  FinanceProfile,
  FinanceProfileTerm,
  inferFinanceProfileFromVehicle,
  inferVehicleBrandFromModel,
  LoanApplication,
  normalizeFinanceProfileId,
  normalizeVehicleModel,
  RoleAccountRole,
  VehicleCatalogItem,
  VehicleStockUnit
} from '../types';
import { newId } from '../utils/id';
import { createTaskCompletionAuditChanges } from '../utils/taskCompletionAnalytics';

const MOTOR_PRICE_BRAND_TAG_SET = new Set(DEFAULT_VEHICLE_BRAND_TAGS);

export interface VehicleInfoAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface VehicleInfoActionsDeps {
  currentStaffRole: RoleAccountRole;
  currentStaffName: string;
  applications: LoanApplication[];
  vehicleCatalog: VehicleCatalogItem[];
  vehicleTags: string[];
  vehicleBrandTags: string[];
  financeProfiles: FinanceProfile[];
  setApplications: (list: LoanApplication[]) => void;
  setSelectedApplication: Dispatch<SetStateAction<LoanApplication | null>>;
  setVehicleCatalog: (list: VehicleCatalogItem[]) => void;
  updateApplicationsState: (list: LoanApplication[]) => unknown;
  updateVehicleCatalogState: (list: VehicleCatalogItem[]) => unknown;
  updateVehicleTagsState: (list: string[]) => unknown;
  updateVehicleBrandTagsState: (list: string[]) => unknown;
  updateFinanceProfilesState: (list: FinanceProfile[]) => unknown;
  writeLocalDashboardValue: (key: 'applications', value: LoanApplication[]) => void;
  writeLocalDashboardState: (values: { vehicleCatalog: VehicleCatalogItem[]; applications: LoanApplication[] }) => void;
  normalizeTags: (tags: string[]) => string[];
  normalizeMoneyAmount: (value: unknown) => number;
  normalizeFinanceProfiles: (list: FinanceProfile[]) => FinanceProfile[];
  normalizeVehicleCatalogList: (list: VehicleCatalogItem[], profiles?: FinanceProfile[]) => VehicleCatalogItem[];
  calculateFinanceProfileInstallment: (loanAmount: number, depositAmount: number, profileId: string | undefined, years: 2 | 3 | 4 | 5 | 6 | 7) => number;
  appendAuditLog: (input: VehicleInfoAuditInput) => void;
  createAuditChanges: <Before extends object, After extends object>(before: Before, after: After) => AuditLogEntry['changes'];
  triggerToast: (message: string, tone?: 'success' | 'warning' | 'error') => void;
}

export function useVehicleInfoActions({
  currentStaffRole,
  currentStaffName,
  applications,
  vehicleCatalog,
  vehicleTags,
  vehicleBrandTags,
  financeProfiles,
  setApplications,
  setSelectedApplication,
  setVehicleCatalog,
  updateApplicationsState,
  updateVehicleCatalogState,
  updateVehicleTagsState,
  updateVehicleBrandTagsState,
  updateFinanceProfilesState,
  writeLocalDashboardValue,
  writeLocalDashboardState,
  normalizeTags,
  normalizeMoneyAmount,
  normalizeFinanceProfiles,
  normalizeVehicleCatalogList,
  calculateFinanceProfileInstallment,
  appendAuditLog,
  createAuditChanges,
  triggerToast
}: VehicleInfoActionsDeps) {
  const handleUpdateVehicleTags = (nextTags: string[]) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const normalized = normalizeTags(nextTags);
    updateVehicleTagsState(normalized);
    appendAuditLog({
      action: 'UPDATE_VEHICLE_TAGS',
      target_type: 'Tags',
      target_id: 'vehicle_tags',
      target_label: 'Vehicle Tags',
      changes: createAuditChanges(
        { vehicle_tags: vehicleTags.join(', ') },
        { vehicle_tags: normalized.join(', ') }
      ),
      stateOverrides: { vehicleTags: normalized }
    });
    triggerToast(tr('车辆标签已更新', 'Vehicle tags updated', "Teg kenderaan dikemas kini"));
  };

  const handleUpdateVehicleBrandTags = (nextTags: string[]) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const normalized = normalizeTags(nextTags);
    updateVehicleBrandTagsState(normalized);
    appendAuditLog({
      action: 'UPDATE_BRAND_TAGS',
      target_type: 'Tags',
      target_id: 'vehicle_brand_tags',
      target_label: 'Brand Tags',
      changes: createAuditChanges(
        { vehicle_brand_tags: vehicleBrandTags.join(', ') },
        { vehicle_brand_tags: normalized.join(', ') }
      ),
      stateOverrides: { vehicleBrandTags: normalized }
    });
    triggerToast(tr('品牌标签已更新', 'Brand tags updated', "Teg jenama dikemas kini"));
  };

  const handleRenameVehicleModel = (oldModel: string, newModel: string) => {
    const from = (oldModel || '').trim();
    const to = (newModel || '').trim().replace(/\s+/g, ' ');
    if (!to || from.toLowerCase() === to.toLowerCase()) {
      return;
    }
    const fromKey = from.toLowerCase();
    let changed = 0;
    const next = applications.map((application) => {
      const primaryMatch = (application.vehicle_model || '').trim().toLowerCase() === fromKey;
      const options = application.vehicle_options;
      const optionMatch = Array.isArray(options) && options.some((option) => (option.vehicle_model || '').trim().toLowerCase() === fromKey);
      if (!primaryMatch && !optionMatch) {
        return application;
      }
      changed += 1;
      return {
        ...application,
        vehicle_model: primaryMatch ? to : application.vehicle_model,
        vehicle_options: Array.isArray(options)
          ? options.map((option) => ((option.vehicle_model || '').trim().toLowerCase() === fromKey ? { ...option, vehicle_model: to } : option))
          : options
      };
    });
    if (changed === 0) {
      return;
    }
    updateApplicationsState(next);
    appendAuditLog({
      action: 'RENAME_VEHICLE_MODEL',
      target_type: 'Vehicle Model',
      target_id: from,
      target_label: to,
      changes: [{ field: 'vehicle_model', old_value: from, new_value: to }],
      stateOverrides: { applications: next }
    });
    triggerToast(tr(`已把 ${changed} 条申请的车型改为 ${to}`, `Renamed ${changed} application(s) to ${to}`, `Menamakan semula ${changed} permohonan kepada ${to}`));
  };

  const handleAddVehicleCatalogItem = (item: Pick<VehicleCatalogItem, 'model' | 'body_type'> & Partial<VehicleCatalogItem>) => {
    const model = item.model.trim().replace(/\s+/g, ' ');
    if (!model) {
      triggerToast(tr('车辆名称不能为空', 'Vehicle name is required', "Nama kenderaan diperlukan"));
      return;
    }

    const sellingPrice = normalizeMoneyAmount(item.selling_price);
    const loanAmount = normalizeMoneyAmount(item.loan_amount);
    const depositAmount = normalizeMoneyAmount(item.deposit_amount);
    const costPrice = normalizeMoneyAmount(item.cost_price);
    const requestedBrand = item.brand?.trim().replace(/\s+/g, ' ');
    const inferredBrand = requestedBrand && MOTOR_PRICE_BRAND_TAG_SET.has(requestedBrand)
      ? requestedBrand
      : inferVehicleBrandFromModel(model, vehicleCatalog);
    const nextBrand = MOTOR_PRICE_BRAND_TAG_SET.has(inferredBrand) ? inferredBrand : DEFAULT_VEHICLE_BRAND_TAGS[0];
    const financeProfile = normalizeFinanceProfileId(item.finance_profile) || inferFinanceProfileFromVehicle(model, nextBrand);
    const nextItem: VehicleCatalogItem = {
      id: newId('VEH'),
      model,
      brand: nextBrand,
      body_type: 'Motorcycle',
      finance_profile: financeProfile,
      selling_price: sellingPrice,
      loan_amount: loanAmount,
      deposit_amount: depositAmount,
      installment_2y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 2) || normalizeMoneyAmount(item.installment_2y),
      installment_3y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 3) || normalizeMoneyAmount(item.installment_3y),
      installment_4y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 4) || normalizeMoneyAmount(item.installment_4y),
      installment_5y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 5) || normalizeMoneyAmount(item.installment_5y),
      installment_6y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 6) || normalizeMoneyAmount(item.installment_6y),
      installment_7y: calculateFinanceProfileInstallment(loanAmount, depositAmount, financeProfile, 7) || normalizeMoneyAmount(item.installment_7y),
      cost_price: costPrice,
      profit_amount: Math.max(sellingPrice - costPrice, 0),
      profit_review_month: item.profit_review_month || '',
      profit_reviewed_at: item.profit_reviewed_at || '',
      profit_reviewed_by: item.profit_reviewed_by || '',
      price_source: item.price_source || '',
      stock_units: item.stock_units || [],
      created_at: new Date().toISOString()
    };
    const nextCatalog = [...vehicleCatalog, nextItem];

    updateVehicleCatalogState(nextCatalog);
    appendAuditLog({
      action: 'ADD_VEHICLE_CATALOG',
      target_type: 'Vehicle Catalog',
      target_id: nextItem.id,
      target_label: nextItem.model,
      changes: [
        ...createAuditChanges(
          {},
          {
            model: nextItem.model,
            brand: nextItem.brand,
            body_type: nextItem.body_type,
            finance_profile: nextItem.finance_profile,
            selling_price: nextItem.selling_price,
            loan_amount: nextItem.loan_amount,
            deposit_amount: nextItem.deposit_amount,
            cost_price: nextItem.cost_price,
            profit_amount: nextItem.profit_amount,
            profit_review_month: nextItem.profit_review_month
          }
        ),
        ...createTaskCompletionAuditChanges([{
          category: 'vehicle',
          task_type: 'Vehicle Info Added',
          assigned_at: nextItem.created_at
        }])
      ],
      stateOverrides: { vehicleCatalog: normalizeVehicleCatalogList(nextCatalog) }
    });
    triggerToast(tr(`车辆 ${model} 已加入数据库`, `Vehicle ${model} added`, `Kenderaan ${model} ditambahkan`));
  };

  const handleUpdateFinanceProfileTerm = (
    profileId: FinanceProfile['id'],
    years: FinanceProfileTerm['years'],
    updates: Partial<FinanceProfileTerm>
  ) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previousProfile = financeProfiles.find((profile) => profile.id === profileId);
    if (!previousProfile) {
      return;
    }

    const existingTerm = previousProfile.terms.find((term) => term.years === years);
    const nextTerm: FinanceProfileTerm = {
      years,
      base: updates.base || existingTerm?.base || (profileId === 'net_loan' || profileId === 'voge_sr3_6_7y' ? 'net_loan' : 'loan'),
      multiplier: updates.multiplier !== undefined ? normalizeMoneyAmount(updates.multiplier) : normalizeMoneyAmount(existingTerm?.multiplier)
    };

    const nextTerms = previousProfile.terms
      .filter((term) => term.years !== years)
      .concat(nextTerm.multiplier > 0 ? [nextTerm] : [])
      .sort((a, b) => a.years - b.years);
    const nextProfiles = financeProfiles.map((profile) => (
      profile.id === profileId ? { ...profile, terms: nextTerms } : profile
    ));
    const normalizedProfiles = normalizeFinanceProfiles(nextProfiles);
    const normalizedVehicleCatalog = normalizeVehicleCatalogList(vehicleCatalog, normalizedProfiles);

    updateFinanceProfilesState(nextProfiles);
    appendAuditLog({
      action: 'UPDATE_FINANCE_PROFILE',
      target_type: 'Finance Profile',
      target_id: profileId,
      target_label: previousProfile.label,
      changes: createAuditChanges(
        { terms: JSON.stringify(previousProfile.terms) },
        { terms: JSON.stringify(normalizedProfiles.find((profile) => profile.id === profileId)?.terms || []) }
      ),
      stateOverrides: {
        financeProfiles: normalizedProfiles,
        vehicleCatalog: normalizedVehicleCatalog
      }
    });
    triggerToast(tr(`${previousProfile.label} 公式已更新`, `${previousProfile.label} formula updated`, `${previousProfile.label} formula dikemas kini`));
  };

  const handleUpdateVehicleCatalogItem = (id: string, updates: Partial<VehicleCatalogItem>) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = vehicleCatalog.find((item) => item.id === id);
    if (!previous) {
      return;
    }
    const nextModel = (updates.model || previous.model).trim().replace(/\s+/g, ' ');
    const requestedBrand = updates.brand !== undefined
      ? updates.brand.trim().replace(/\s+/g, ' ')
      : inferVehicleBrandFromModel(nextModel, vehicleCatalog.filter((item) => item.id !== id));
    const nextBrand = MOTOR_PRICE_BRAND_TAG_SET.has(requestedBrand)
      ? requestedBrand
      : MOTOR_PRICE_BRAND_TAG_SET.has(previous.brand)
        ? previous.brand
        : DEFAULT_VEHICLE_BRAND_TAGS[0];
    const financeProfile = normalizeFinanceProfileId(updates.finance_profile) || normalizeFinanceProfileId(previous.finance_profile) || inferFinanceProfileFromVehicle(nextModel, nextBrand);

    const updatedItem: VehicleCatalogItem = {
      ...previous,
      ...updates,
      model: nextModel,
      brand: nextBrand,
      body_type: 'Motorcycle',
      finance_profile: financeProfile,
      selling_price: updates.selling_price !== undefined ? normalizeMoneyAmount(updates.selling_price) : normalizeMoneyAmount(previous.selling_price),
      loan_amount: updates.loan_amount !== undefined ? normalizeMoneyAmount(updates.loan_amount) : normalizeMoneyAmount(previous.loan_amount),
      deposit_amount: updates.deposit_amount !== undefined ? normalizeMoneyAmount(updates.deposit_amount) : normalizeMoneyAmount(previous.deposit_amount),
      cost_price: updates.cost_price !== undefined ? normalizeMoneyAmount(updates.cost_price) : normalizeMoneyAmount(previous.cost_price),
      profit_review_month: updates.profit_review_month ?? previous.profit_review_month ?? '',
      profit_reviewed_at: updates.profit_review_month !== undefined ? new Date().toISOString() : updates.profit_reviewed_at ?? previous.profit_reviewed_at ?? '',
      profit_reviewed_by: updates.profit_review_month !== undefined ? currentStaffName : updates.profit_reviewed_by ?? previous.profit_reviewed_by ?? '',
      price_source: updates.price_source ?? previous.price_source ?? ''
    };
    updatedItem.profit_amount = updates.profit_amount !== undefined
      ? normalizeMoneyAmount(updates.profit_amount)
      : Math.max((updatedItem.selling_price || 0) - (updatedItem.cost_price || 0), 0);
    updatedItem.installment_2y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 2) || normalizeMoneyAmount(updates.installment_2y ?? previous.installment_2y);
    updatedItem.installment_3y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 3) || normalizeMoneyAmount(updates.installment_3y ?? previous.installment_3y);
    updatedItem.installment_4y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 4) || normalizeMoneyAmount(updates.installment_4y ?? previous.installment_4y);
    updatedItem.installment_5y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 5) || normalizeMoneyAmount(updates.installment_5y ?? previous.installment_5y);
    updatedItem.installment_6y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 6) || normalizeMoneyAmount(updates.installment_6y ?? previous.installment_6y);
    updatedItem.installment_7y = calculateFinanceProfileInstallment(updatedItem.loan_amount || 0, updatedItem.deposit_amount || 0, updatedItem.finance_profile, 7) || normalizeMoneyAmount(updates.installment_7y ?? previous.installment_7y);

    if (!updatedItem.model) {
      triggerToast(tr('车辆名称不能为空', 'Vehicle name is required', "Nama kenderaan diperlukan"));
      return;
    }

    const nextCatalog = vehicleCatalog.map((item) => item.id === id ? updatedItem : item);
    const normalizedCatalog = normalizeVehicleCatalogList(nextCatalog);
    const previousModelKey = normalizeVehicleModel(previous.model);
    const modelChanged = previousModelKey !== normalizeVehicleModel(updatedItem.model);
    let linkedApplicationCount = 0;
    const nextApplications = modelChanged
      ? applications.map((application) => {
        const primaryMatch = normalizeVehicleModel(application.vehicle_model || '') === previousModelKey;
        const optionMatch = (application.vehicle_options || []).some((option) => normalizeVehicleModel(option.vehicle_model || '') === previousModelKey);
        const preferenceMatch = normalizeVehicleModel(application.preferences?.preferred_motorcycle || '') === previousModelKey;
        if (!primaryMatch && !optionMatch && !preferenceMatch) return application;
        linkedApplicationCount += 1;
        return {
          ...application,
          vehicle_model: primaryMatch ? updatedItem.model : application.vehicle_model,
          vehicle_options: (application.vehicle_options || []).map((option) => (
            normalizeVehicleModel(option.vehicle_model || '') === previousModelKey
              ? { ...option, vehicle_model: updatedItem.model, vehicle_brand: updatedItem.brand }
              : option
          )),
          preferences: application.preferences
            ? {
              ...application.preferences,
              preferred_motorcycle: preferenceMatch ? updatedItem.model : application.preferences.preferred_motorcycle
            }
            : application.preferences
        };
      })
      : applications;

    updateVehicleCatalogState(normalizedCatalog);
    if (modelChanged) {
      setApplications(nextApplications);
      writeLocalDashboardValue('applications', nextApplications);
      setSelectedApplication((current) => current
        ? nextApplications.find((application) => application.id === current.id) || current
        : current);
    }
    appendAuditLog({
      action: 'UPDATE_VEHICLE_CATALOG',
      target_type: 'Vehicle Catalog',
      target_id: id,
      target_label: updatedItem.model,
      changes: createAuditChanges(
        {
          model: previous.model,
          brand: previous.brand,
          body_type: previous.body_type,
          finance_profile: previous.finance_profile,
          selling_price: previous.selling_price,
          loan_amount: previous.loan_amount,
          deposit_amount: previous.deposit_amount,
          cost_price: previous.cost_price,
          profit_amount: previous.profit_amount,
          profit_review_month: previous.profit_review_month,
          profit_reviewed_at: previous.profit_reviewed_at
        },
        {
          model: updatedItem.model,
          brand: updatedItem.brand,
          body_type: updatedItem.body_type,
          finance_profile: updatedItem.finance_profile,
          selling_price: updatedItem.selling_price,
          loan_amount: updatedItem.loan_amount,
          deposit_amount: updatedItem.deposit_amount,
          cost_price: updatedItem.cost_price,
          profit_amount: updatedItem.profit_amount,
          profit_review_month: updatedItem.profit_review_month,
          profit_reviewed_at: updatedItem.profit_reviewed_at
        }
      ),
      stateOverrides: { vehicleCatalog: normalizedCatalog, applications: nextApplications }
    });
    triggerToast(modelChanged
      ? tr(
        `车辆 ${updatedItem.model} 已更新，并同步 ${linkedApplicationCount} 个申请`,
        `Vehicle ${updatedItem.model} updated and ${linkedApplicationCount} application(s) migrated`,
        `Kenderaan ${updatedItem.model} dikemas kini dan ${linkedApplicationCount} permohonan dipindahkan`
      )
      : tr(`车辆 ${updatedItem.model} 已更新`, `Vehicle ${updatedItem.model} updated`, `Kenderaan ${updatedItem.model} dikemas kini`));
  };

  const handleMergeVehicleCatalogItems = (masterId: string, duplicateIds: string[]) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以合并车辆记录', 'Only Super Admin can merge vehicle records', "Hanya Pentadbir Super boleh menggabungkan rekod kenderaan"));
      return;
    }

    const master = vehicleCatalog.find((item) => item.id === masterId);
    const duplicateIdSet = new Set(duplicateIds.filter((id) => id && id !== masterId));
    const duplicates = vehicleCatalog.filter((item) => duplicateIdSet.has(item.id));

    if (!master || duplicates.length === 0) {
      triggerToast(tr('找不到可合并的重复记录', 'No duplicate records were found to merge', "Tiada rekod pendua ditemui untuk digabungkan"), 'error');
      return;
    }

    const sourceItems = [master, ...duplicates];
    const hasUsefulValue = (value: unknown) => {
      if (typeof value === 'number') return Number.isFinite(value) && value > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null;
    };
    const protectedFields = new Set<keyof VehicleCatalogItem>(['id', 'model', 'brand', 'body_type', 'created_at', 'price_history']);
    const mergedMaster = duplicates.reduce<VehicleCatalogItem>((current, duplicate) => {
      const next = { ...current };
      (Object.keys(duplicate) as Array<keyof VehicleCatalogItem>).forEach((field) => {
        if (protectedFields.has(field) || hasUsefulValue(next[field]) || !hasUsefulValue(duplicate[field])) {
          return;
        }
        (next as unknown as Record<string, unknown>)[field] = duplicate[field];
      });
      return next;
    }, { ...master });

    const priceHistoryByVersion = new Map<string, NonNullable<VehicleCatalogItem['price_history']>[number]>();
    sourceItems.forEach((item) => {
      (item.price_history || []).forEach((version) => {
        const key = `${version.effective_from}|${version.loan_amount}|${version.deposit}`;
        if (!priceHistoryByVersion.has(key)) {
          priceHistoryByVersion.set(key, version);
        }
      });
    });
    const mergedPriceHistory = Array.from(priceHistoryByVersion.values())
      .sort((a, b) => b.effective_from.localeCompare(a.effective_from) || b.updated_at.localeCompare(a.updated_at));
    mergedMaster.price_history = mergedPriceHistory.length > 0 ? mergedPriceHistory : undefined;
    const stockUnitsById = new Map<string, VehicleStockUnit>();
    sourceItems.forEach((item) => (item.stock_units || []).forEach((unit) => stockUnitsById.set(unit.id, unit)));
    mergedMaster.stock_units = stockUnitsById.size > 0 ? Array.from(stockUnitsById.values()) : undefined;
    mergedMaster.profit_amount = Math.max(normalizeMoneyAmount(mergedMaster.selling_price) - normalizeMoneyAmount(mergedMaster.cost_price), 0);

    const nextCatalog = normalizeVehicleCatalogList(vehicleCatalog
      .filter((item) => !duplicateIdSet.has(item.id))
      .map((item) => item.id === masterId ? mergedMaster : item));
    const sourceModelKeys = new Set(sourceItems.map((item) => item.model.trim().toLowerCase()).filter(Boolean));
    const masterModel = master.model.trim().replace(/\s+/g, ' ');
    let linkedApplicationCount = 0;
    const nextApplications = applications.map((application) => {
      const primaryMatch = sourceModelKeys.has((application.vehicle_model || '').trim().toLowerCase());
      const optionMatch = (application.vehicle_options || []).some((option) => sourceModelKeys.has((option.vehicle_model || '').trim().toLowerCase()));
      const preferenceMatch = sourceModelKeys.has((application.preferences?.preferred_motorcycle || '').trim().toLowerCase());

      if (!primaryMatch && !optionMatch && !preferenceMatch) {
        return application;
      }

      linkedApplicationCount += 1;
      return {
        ...application,
        vehicle_model: primaryMatch ? masterModel : application.vehicle_model,
        vehicle_options: application.vehicle_options?.map((option) => (
          sourceModelKeys.has((option.vehicle_model || '').trim().toLowerCase())
            ? { ...option, vehicle_model: masterModel }
            : option
        )),
        preferences: preferenceMatch && application.preferences
          ? { ...application.preferences, preferred_motorcycle: masterModel }
          : application.preferences
      };
    });

    setVehicleCatalog(nextCatalog);
    setApplications(nextApplications);
    setSelectedApplication((current) => current ? nextApplications.find((application) => application.id === current.id) || current : current);
    writeLocalDashboardState({ vehicleCatalog: nextCatalog, applications: nextApplications });
    appendAuditLog({
      action: 'MERGE_VEHICLE_CATALOG',
      target_type: 'Vehicle Catalog',
      target_id: master.id,
      target_label: masterModel,
      changes: [
        {
          field: 'master_record',
          old_value: `${master.model} (${master.id})`,
          new_value: `${masterModel} (${master.id})`
        },
        {
          field: 'merged_records',
          old_value: duplicates.map((item) => `${item.model} (${item.id})`).join(', '),
          new_value: `Merged into ${master.id}`
        },
        {
          field: 'linked_applications',
          old_value: String(linkedApplicationCount),
          new_value: `${linkedApplicationCount} using ${masterModel}`
        }
      ],
      stateOverrides: { vehicleCatalog: nextCatalog, applications: nextApplications }
    });
    triggerToast(tr(
      `已保留 ${masterModel}，合并 ${duplicates.length} 条重复记录，并统一 ${linkedApplicationCount} 个相关申请`,
      `Kept ${masterModel}, merged ${duplicates.length} duplicate record(s), and unified ${linkedApplicationCount} related application(s)`,
      `Mengekalkan ${masterModel}, menggabungkan ${duplicates.length} rekod pendua dan menyatukan ${linkedApplicationCount} permohonan berkaitan`
    ));
  };

  const handleDeleteVehicleCatalogItem = (id: string) => {
    if (currentStaffRole !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以管理设置', 'Only Super Admin can manage Settings', "Hanya Pentadbir Super boleh mengurus Tetapan"));
      return;
    }

    const previous = vehicleCatalog.find((item) => item.id === id);
    if (!previous) {
      return;
    }
    if ((previous.stock_units || []).length > 0) {
      triggerToast(tr('这个车型还有库存记录，不能删除', 'This model still has stock records and cannot be deleted', "Model ini masih mempunyai rekod stok dan tidak boleh dipadamkan"), 'error');
      return;
    }

    const nextCatalog = vehicleCatalog.filter((item) => item.id !== id);
    const normalizedCatalog = normalizeVehicleCatalogList(nextCatalog);

    updateVehicleCatalogState(nextCatalog);
    appendAuditLog({
      action: 'DELETE_VEHICLE_CATALOG',
      target_type: 'Vehicle Catalog',
      target_id: id,
      target_label: previous.model,
      changes: createAuditChanges(
        {
          model: previous.model,
          brand: previous.brand,
          body_type: previous.body_type,
          deleted: 'No'
        },
        { deleted: 'Yes' }
      ),
      stateOverrides: { vehicleCatalog: normalizedCatalog }
    });
    triggerToast(tr(`车辆 ${previous.model} 已删除`, `Vehicle ${previous.model} deleted`, `Kenderaan ${previous.model} dipadamkan`));
  };

  return {
    handleUpdateVehicleTags,
    handleUpdateVehicleBrandTags,
    handleRenameVehicleModel,
    handleAddVehicleCatalogItem,
    handleUpdateFinanceProfileTerm,
    handleUpdateVehicleCatalogItem,
    handleMergeVehicleCatalogItems,
    handleDeleteVehicleCatalogItem
  };
}
