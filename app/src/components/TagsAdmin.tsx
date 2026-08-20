/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BadgeDollarSign, Bike, Building2, Check, ChevronDown, GitBranch, ImageUp, Plus, Save, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { getVehicleBrandLogo } from '../data/vehicleBrandLogos';
import { uploadBrandLogoToStorage } from '../services/brandLogoStorage';
import { BankDefinition, CommissionRules, ErrorCodeDefinition, FinanceProfile, FinanceProfileId, FinanceProfileTerm, findFinanceProfile, inferFinanceProfileFromVehicle, LoanApplication, LoanStatus, MarketingTagRelationship, normalizeFinanceProfileId, RoleAccount, RoleAccountRole, RoleNavAccessSetting, StaffDefaultAvatar, StaffWorkloadCase, StaffWorkloadSummary, TagNormalizationDomain, TagNormalizationRule, VehicleCategory, VehicleCatalogItem, VehiclePriceVersion, WhatsAppTrackingClick, WhatsAppTrackingLink } from '../types';
import { resolveTaskAssignmentRole, setTaskAssignmentRole, TASK_ASSIGNMENT_ITEMS, type TaskAssignmentRole } from '../data/roleNavAccess';
import BankIcon from './BankIcon';
import DoubleClickEditField from './DoubleClickEditField';
import ErrorCodeAdmin from './ErrorCodeAdmin';
import OptimizedImage from './OptimizedImage';
import RolesAdmin from './RolesAdmin';
import SortableHeader, { compareSortValues, getNextSortState, SortDirection, SortState } from './SortableHeader';
import ToggleOptionGroup from './ToggleOptionGroup';
import { useDebouncedValue } from '../utils/tableUx';
import ToggleSwitch from './ToggleSwitch';
import VehicleCategoryManager from './VehicleCategoryManager';
import { computeVehicleInstallments, getVehicleEffectiveRate, getVehicleSeries } from '../data/vehicleCategories';
import VehicleModelPriceControls from './VehicleModelPriceControls';
import VehicleBulkTenure from './VehicleBulkTenure';
import MissingVehicleModelChip from './MissingVehicleModelChip';
import { getAppLocale, tr, trRole } from '../lib/i18n';
import RoleAccessControlPage from './RoleAccessControlPage';
import vehicleInfoIcon from '../assets/icons/nav/vehicleInfo.png';
import bankDatabaseIcon from '../assets/icons/nav/bankDatabase.png';
import rolesAccountsIcon from '../assets/icons/nav/rolesAccounts.png';
import dataCleanupIcon from '../assets/icons/nav/customerRelationships.png';
import rejectCodesIcon from '../assets/icons/nav/rejectCodes.png';
import brandLogoIcon from '../assets/icons/nav/brandLogo.png';
import roleAccessIcon from '../assets/icons/nav/roleAccess.png';
import taskInboxIcon from '../assets/icons/nav/taskInbox.png';
import commissionRulesIcon from '../assets/icons/nav/commissionRules.png';
import { useBrandedDialog } from './BrandedDialogProvider';

// Keep the cleanup implementation available for a future controlled restore,
// but do not expose its debug entry in the normal Setting UI.
const SHOW_DATA_CLEANUP_DEBUG_ENTRY = false;

interface TagsAdminProps {
  applications: LoanApplication[];
  vehicleCatalog: VehicleCatalogItem[];
  vehicleCategories: VehicleCategory[];
  vehicleBrandLogos: Record<string, string>;
  currentStaffName: string;
  financeProfiles: FinanceProfile[];
  bankDefinitions: BankDefinition[];
  vehicleTags: string[];
  vehicleBrandTags: string[];
  errorCodeDefinitions: ErrorCodeDefinition[];
  roleAccounts: RoleAccount[];
  roleNavAccess: RoleNavAccessSetting[];
  defaultAvatars: StaffDefaultAvatar[];
  marketingTagRelationships: MarketingTagRelationship[];
  tagNormalizationRules: TagNormalizationRule[];
  whatsAppTrackingLinks: WhatsAppTrackingLink[];
  whatsAppTrackingClicks: WhatsAppTrackingClick[];
  canManageTags: boolean;
  canAccessGroup?: (group: TagGroup) => boolean;
  commissionRules: CommissionRules;
  onUpdateCommissionRules: (updates: Partial<CommissionRules>) => void;
  onUpdateVehicleTags: (tags: string[]) => void;
  onUpdateVehicleBrandTags: (tags: string[]) => void;
  onAddErrorCodeDefinition: (definition: ErrorCodeDefinition) => void;
  onUpdateErrorCodeDefinition: (code: string, updates: Partial<ErrorCodeDefinition>) => void;
  onDeleteErrorCodeDefinition: (code: string) => void;
  onCreateFirebaseAuthUser: (account: Pick<RoleAccount, 'id' | 'name' | 'email' | 'role' | 'default_avatar_id'> & { password?: string }) => Promise<{
    uid: string;
    temporaryPassword?: string;
    created: boolean;
    email: string;
    dashboardAccountId?: string;
    name?: string;
    role?: RoleAccountRole;
  }>;
  onResetFirebaseAuthPassword: (account: RoleAccount, password: string) => Promise<void>;
  onUpdateRoleAccount: (id: string, updates: Partial<RoleAccount>) => Promise<boolean>;
  onDeleteRoleAccount: (id: string) => Promise<void>;
  onUpdateRoleNavAccess: (settings: RoleNavAccessSetting[]) => void;
  staffWorkload: StaffWorkloadSummary[];
  staffWorkloadCases: StaffWorkloadCase[];
  onTransferWorkload: (sourceName: string, targetName: string) => void;
  onTransferWorkloadCase: (sourceName: string, targetName: string, caseType: StaffWorkloadCase['type'], caseId: string) => void;
  onAddDefaultAvatar: (avatar: StaffDefaultAvatar) => void;
  onDeleteDefaultAvatar: (id: string) => void;
  onAddVehicleCatalogItem: (item: Pick<VehicleCatalogItem, 'model' | 'body_type'> & Partial<VehicleCatalogItem>) => void;
  onRenameVehicleModel: (oldModel: string, newModel: string) => void;
  onOpenApplication: (application: LoanApplication) => void;
  onUpdateVehicleCatalogItem: (id: string, updates: Partial<VehicleCatalogItem>) => void;
  onMergeVehicleCatalogItems: (masterId: string, duplicateIds: string[]) => void;
  onUpdateVehicleCategories: (next: VehicleCategory[]) => void;
  onUpdateVehicleBrandLogo: (brand: string, dataUrl: string) => void;
  onDeleteVehicleCatalogItem: (id: string) => void;
  onUpdateFinanceProfileTerm: (profileId: FinanceProfileId, years: FinanceProfileTerm['years'], updates: Partial<FinanceProfileTerm>) => void;
  onAddBankDefinition: (item: Pick<BankDefinition, 'name' | 'icon_data_url'>) => Promise<boolean>;
  onUpdateBankDefinition: (id: string, updates: Partial<BankDefinition>) => Promise<boolean>;
  onDeleteBankDefinition: (id: string) => void;
  onAddMarketingTagRelationship: (item: Pick<MarketingTagRelationship, 'source' | 'medium' | 'category'>) => void;
  onUpdateMarketingTagRelationship: (id: string, updates: Partial<MarketingTagRelationship>) => void;
  onDeleteMarketingTagRelationship: (id: string) => void;
  onAddTagNormalizationRule: (rule: Omit<TagNormalizationRule, 'id' | 'created_at'>) => void;
  initialGroup?: TagGroup;
  onGroupChange?: (group: TagGroup) => void;
  initialRoleTab?: RoleSettingsTab;
  onRoleTabChange?: (tab: RoleSettingsTab) => void;
  onUpdateTagNormalizationRule: (id: string, updates: Partial<TagNormalizationRule>) => void;
  onDeleteTagNormalizationRule: (id: string) => void;
}

export type TagGroup = 'relationship' | 'info' | 'bank' | 'code' | 'roles' | 'brandLogo' | 'commissionRules';
export type RoleSettingsTab = 'accounts' | 'access' | 'assignments';
type CommissionAmountField = 'leaderboard_first' | 'leaderboard_second' | 'leaderboard_third';
type TagSortKey = 'name';
type BankSortKey = 'name' | 'active' | 'created_at';
type VehicleInfoSortKey = 'model' | 'finance_profile' | 'selling_price' | 'loan_amount' | 'deposit_amount' | 'applications';
type VehicleRelationshipSortKey = 'model' | 'brand' | 'applications' | 'approved';
type MarketingRelationshipSortKey = 'source' | 'medium' | 'category' | 'links' | 'clicks';
type NormalizationRuleSortKey = 'domain' | 'raw_value' | 'normalized_tag' | 'parent_tag' | 'category' | 'active';

const FIXED_TASK_ASSIGNMENTS = [
  { key: 'lead-owner', label_zh: '潜在客户跟进', label_en: 'Lead follow-up', label_ms: 'Susulan prospek', owner_zh: 'Lead 当前负责人', owner_en: 'Current lead owner', owner_ms: 'Pemilik prospek semasa' },
  { key: 'calendar-assignee', label_zh: '日历任务与回复', label_en: 'Calendar tasks and replies', label_ms: 'Tugasan dan balasan kalendar', owner_zh: '日历指定员工', owner_en: 'Named calendar assignee', owner_ms: 'Penerima tugasan kalendar' },
  { key: 'mentions', label_zh: '内部留言与 @ 提醒', label_en: 'Internal comments and @ mentions', label_ms: 'Komen dalaman dan sebutan @', owner_zh: '被 @ 的员工', owner_en: 'Mentioned staff member', owner_ms: 'Kakitangan yang disebut' }
] as const;

const NORMALIZATION_DOMAIN_OPTIONS: { value: TagNormalizationDomain; label: string }[] = [
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'bank_reject', label: 'Bank Reject' },
  { value: 'application_status_reason', label: 'Status Reason' }
];

const MAX_BANK_ICON_SOURCE_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const BANK_ICON_OUTPUT_SIZE = 128;
const BANK_ICON_BACKGROUND_OPTIONS = ['#ffffff', '#f8fafc', '#111827', '#ecfdf5'];
const TRANSPARENT_BRAND_LOGO_BACKGROUND = 'transparent';
const FINANCE_PROFILE_YEARS: FinanceProfileTerm['years'][] = [2, 3, 4, 5, 6, 7];

interface BankIconCropDraft {
  target: 'new' | string;
  sourceDataUrl: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  background: string;
}

interface BankIconUploadButtonProps {
  label: string;
  busyLabel: string;
  className: string;
  onSelect: (file?: File) => Promise<void>;
}

function BankIconUploadButton({
  label,
  busyLabel,
  className,
  onSelect
}: BankIconUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) {
      return;
    }

    setIsReading(true);
    try {
      await onSelect(file);
    } finally {
      setIsReading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isReading}
        aria-busy={isReading}
        className={className}
      >
        <ImageUp className="h-3.5 w-3.5" />
        {isReading ? busyLabel : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          void handleFileChange(event);
        }}
      />
    </>
  );
}

const BRAND_LOGO_SQUARE_SIZE = 256;
const BRAND_LOGO_WIDE_WIDTH = 384;
const BRAND_LOGO_WIDE_HEIGHT = 128;

interface BrandLogoCropDraft {
  brand: string;
  originalSourceDataUrl: string;
  sourceDataUrl: string;
  shape: 'square' | 'wide';
  zoom: number;
  offsetX: number;
  offsetY: number;
  background: string;
}

interface VehicleInfoRow {
  id: string;
  model: string;
  brand: string;
  tag: string;
  finance_profile: FinanceProfileId;
  category_id: string;
  max_tenure?: number;
  interest_rate_override?: number;
  price_history?: VehiclePriceVersion[];
  series: string;
  variant: string;
  selling_price: number;
  loan_amount: number;
  deposit_amount: number;
  installment_2y: number;
  installment_3y: number;
  installment_4y: number;
  installment_5y: number;
  installment_6y: number;
  installment_7y: number;
  installment_formula_base_2y?: 'loan' | 'net_loan';
  installment_formula_base_3y?: 'loan' | 'net_loan';
  installment_formula_base_4y?: 'loan' | 'net_loan';
  installment_formula_base_5y?: 'loan' | 'net_loan';
  installment_formula_base_6y?: 'loan' | 'net_loan';
  installment_formula_base_7y?: 'loan' | 'net_loan';
  installment_multiplier_2y: number;
  installment_multiplier_3y: number;
  installment_multiplier_4y: number;
  installment_multiplier_5y: number;
  installment_multiplier_6y: number;
  installment_multiplier_7y: number;
  cost_price: number;
  profit_amount: number;
  profit_review_month: string;
  profit_reviewed_at: string;
  profit_reviewed_by: string;
  plates: string[];
  applications: number;
  approved: number;
  latest: string;
  catalogRecord: boolean;
}

interface VehicleRelationshipRow extends VehicleCatalogItem {
  applications: number;
  approved: number;
}

interface MarketingRelationshipRow extends MarketingTagRelationship {
  links: number;
  clicks: number;
}

interface MissingBankDefinitionRow {
  name: string;
  applications: number;
  bankApplications: number;
  latest: string;
  statusCounts: Record<string, number>;
}

function normalizePlate(plate: string) {
  return plate.trim().replace(/\s+/g, ' ').toUpperCase();
}

function normalizeMoneyAmount(value: unknown) {
  const numericValue = typeof value === 'number'
    ? value
    : Number(String(value ?? '').replace(/[^\d.-]/g, ''));

  return Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0;
}

function normalizeInstallmentFormulaBase(value: unknown): 'loan' | 'net_loan' | undefined {
  return value === 'loan' || value === 'net_loan' ? value : undefined;
}

function calculateFormulaInstallment(loanAmount: number, depositAmount: number, formulaBase: 'loan' | 'net_loan' | undefined, multiplier: number, years: number) {
  const baseAmount = formulaBase === 'net_loan' ? Math.max(loanAmount - depositAmount, 0) : loanAmount;
  if (!formulaBase || baseAmount <= 0 || multiplier <= 0 || years <= 0) {
    return 0;
  }

  return Math.round((baseAmount * multiplier / (years * 12)) * 100) / 100;
}

function formatMoney(value: unknown) {
  return `RM ${normalizeMoneyAmount(value).toLocaleString('en-MY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

function formatCompactMoney(value: unknown) {
  const amount = normalizeMoneyAmount(value);

  return amount > 0 ? `RM ${amount.toLocaleString('en-MY', { maximumFractionDigits: 0 })}` : '-';
}

function formatInterestRate(multiplier: number) {
  const interestRate = Math.max((normalizeMoneyAmount(multiplier) - 1) * 100, 0);

  return `${interestRate.toLocaleString('en-MY', {
    minimumFractionDigits: interestRate % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })}%`;
}

interface MonthlyPlanItem {
  label: string;
  value: number;
  formulaBase: 'loan' | 'net_loan';
  multiplier: number;
}

function getMonthlyPlanItems(row: VehicleInfoRow, financeProfiles: FinanceProfile[], categories: VehicleCategory[] = []): MonthlyPlanItem[] {
  const category = row.category_id ? categories.find((item) => item.id === row.category_id) : undefined;
  if (row.category_id && category) {
    const catalogItem = {
      loan_amount: row.loan_amount,
      deposit_amount: row.deposit_amount,
      category_id: row.category_id,
      max_tenure: row.max_tenure,
      interest_rate_override: row.interest_rate_override,
      price_history: row.price_history
    } as VehicleCatalogItem;
    const installments = computeVehicleInstallments(catalogItem, category);
    const annualRate = getVehicleEffectiveRate(catalogItem, category);
    return Object.keys(installments)
      .map((year) => Number(year))
      .sort((a, b) => a - b)
      .map((year) => ({
        label: `${year}Y`,
        value: installments[year],
        formulaBase: 'loan' as const,
        multiplier: 1 + annualRate / 100
      }))
      .filter((item) => item.value > 0);
  }

  const profile = findFinanceProfile(row.finance_profile, financeProfiles);

  return (profile?.terms || []).map((term) => ({
    label: `${term.years}Y`,
    value: calculateFormulaInstallment(row.loan_amount, row.deposit_amount, term.base, term.multiplier, term.years),
    formulaBase: term.base,
    multiplier: normalizeMoneyAmount(term.multiplier)
  })).filter((item) => item.value > 0);
}

function formatMonthlyPlan(row: VehicleInfoRow, financeProfiles: FinanceProfile[], categories: VehicleCategory[] = []) {
  return getMonthlyPlanItems(row, financeProfiles, categories)
    .map((item) => [item.label, formatCompactMoney(item.value), item.formulaBase ? formatInterestRate(item.multiplier) : ''].filter(Boolean).join(' '))
    .join(' / ') || '-';
}

function MonthlyPlanChips({ row, financeProfiles, categories }: { row: VehicleInfoRow; financeProfiles: FinanceProfile[]; categories: VehicleCategory[] }) {
  const items = getMonthlyPlanItems(row, financeProfiles, categories);
  const profile = findFinanceProfile(row.finance_profile, financeProfiles);
  const category = row.category_id ? categories.find((item) => item.id === row.category_id) : undefined;

  if (items.length === 0) {
    return <span className="text-xs font-semibold text-slate-300">{category?.name || profile?.label || 'No formula profile'}</span>;
  }

  return (
    <div className="grid w-[260px] grid-cols-2 gap-1.5" title={formatMonthlyPlan(row, financeProfiles, categories)}>
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
            {item.formulaBase ? (
              <p className="font-mono text-[9px] font-bold text-emerald-600">{formatInterestRate(item.multiplier)}</p>
            ) : null}
          </div>
          <p className="mt-0.5 font-mono text-[11px] font-bold text-slate-700">{formatCompactMoney(item.value)}</p>
        </div>
      ))}
    </div>
  );
}

interface MissingVehicleModel {
  model: string;
  brand: string;
  applications: number;
  approved: number;
  applicationList: LoanApplication[];
}

// Models used in loan applications that are NOT yet in the vehicle catalog.
// Surfaced (not auto-created) so Super Admin can add + fill their pricing.
function buildMissingVehicleModels(applications: LoanApplication[], vehicleCatalog: VehicleCatalogItem[], vehicleBrandTags: string[]): MissingVehicleModel[] {
  const allowedBrandSet = new Set(vehicleBrandTags);
  const catalogModelKeys = new Set(vehicleCatalog.map((item) => item.model.trim().toLowerCase()));
  const stats = new Map<string, MissingVehicleModel>();

  applications.forEach((application) => {
    const brand = application.vehicle_brand || 'Other';
    if (!allowedBrandSet.has(brand)) {
      return;
    }
    const model = (application.vehicle_model || '').trim();
    if (!model) {
      return;
    }
    const key = model.toLowerCase();
    if (catalogModelKeys.has(key)) {
      return;
    }
    const entry = stats.get(key) || { model, brand, applications: 0, approved: 0, applicationList: [] };
    entry.applications += 1;
    entry.applicationList.push(application);
    if (application.status === LoanStatus.APPROVE) {
      entry.approved += 1;
    }
    stats.set(key, entry);
  });

  return Array.from(stats.values()).sort((a, b) => b.applications - a.applications);
}

function buildVehicleInfoRows(applications: LoanApplication[], vehicleCatalog: VehicleCatalogItem[], vehicleBrandTags: string[], financeProfiles: FinanceProfile[]): VehicleInfoRow[] {
  const allowedBrandSet = new Set(vehicleBrandTags);
  const applicationStats = new Map<string, {
    model: string;
    brand: string;
    tag: string;
    plates: string[];
    applications: number;
    approved: number;
    latest: string;
  }>();

  applications.forEach((application) => {
    const brand = application.vehicle_brand || 'Other';
    if (!allowedBrandSet.has(brand)) {
      return;
    }

    const model = application.vehicle_model.trim() || 'Unknown model';
    const key = model.toLowerCase();
    const plate = normalizePlate(application.vehicle_plate);
    const stats = applicationStats.get(key) || {
      model,
      brand,
      tag: application.vehicle_tag || 'Motorcycle',
      plates: [],
      applications: 0,
      approved: 0,
      latest: application.submitted_at
    };

    stats.applications += 1;

    if (application.status === LoanStatus.APPROVE) {
      stats.approved += 1;
    }

    if (plate && !stats.plates.includes(plate)) {
      stats.plates.push(plate);
    }

    if (new Date(application.submitted_at).getTime() > new Date(stats.latest).getTime()) {
      stats.latest = application.submitted_at;
      stats.brand = allowedBrandSet.has(application.vehicle_brand) ? application.vehicle_brand : stats.brand;
      stats.tag = application.vehicle_tag || stats.tag;
    }

    applicationStats.set(key, stats);
  });

  const catalogRows = vehicleCatalog.map((item) => {
    const stats = applicationStats.get(item.model.trim().toLowerCase());
    const sellingPrice = normalizeMoneyAmount(item.selling_price);
    const loanAmount = normalizeMoneyAmount(item.loan_amount);
    const depositAmount = normalizeMoneyAmount(item.deposit_amount);
    const brand = item.brand || stats?.brand || 'Other';
    const financeProfile = normalizeFinanceProfileId(item.finance_profile, financeProfiles) || inferFinanceProfileFromVehicle(item.model, brand);
    const seriesInfo = getVehicleSeries(item.model, item.series);
    const installment2Y = normalizeMoneyAmount(item.installment_2y);
    const installment3Y = normalizeMoneyAmount(item.installment_3y);
    const installment4Y = normalizeMoneyAmount(item.installment_4y);
    const installment5Y = normalizeMoneyAmount(item.installment_5y);
    const installment6Y = normalizeMoneyAmount(item.installment_6y);
    const installment7Y = normalizeMoneyAmount(item.installment_7y);
    const formulaBase2Y = normalizeInstallmentFormulaBase(item.installment_formula_base_2y);
    const formulaBase3Y = normalizeInstallmentFormulaBase(item.installment_formula_base_3y);
    const formulaBase4Y = normalizeInstallmentFormulaBase(item.installment_formula_base_4y);
    const formulaBase5Y = normalizeInstallmentFormulaBase(item.installment_formula_base_5y);
    const formulaBase6Y = normalizeInstallmentFormulaBase(item.installment_formula_base_6y);
    const formulaBase7Y = normalizeInstallmentFormulaBase(item.installment_formula_base_7y);
    const multiplier2Y = normalizeMoneyAmount(item.installment_multiplier_2y);
    const multiplier3Y = normalizeMoneyAmount(item.installment_multiplier_3y);
    const multiplier4Y = normalizeMoneyAmount(item.installment_multiplier_4y);
    const multiplier5Y = normalizeMoneyAmount(item.installment_multiplier_5y);
    const multiplier6Y = normalizeMoneyAmount(item.installment_multiplier_6y);
    const multiplier7Y = normalizeMoneyAmount(item.installment_multiplier_7y);
    const costPrice = normalizeMoneyAmount(item.cost_price);

    return {
      id: item.id,
      model: item.model.trim() || 'Unknown model',
      brand,
      tag: item.body_type || stats?.tag || 'Motorcycle',
      finance_profile: financeProfile,
      category_id: item.category_id || '',
      max_tenure: item.max_tenure,
      interest_rate_override: item.interest_rate_override,
      price_history: item.price_history,
      series: seriesInfo.series,
      variant: seriesInfo.variant,
      selling_price: sellingPrice,
      loan_amount: loanAmount,
      deposit_amount: depositAmount,
      installment_2y: formulaBase2Y && multiplier2Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase2Y, multiplier2Y, 2) : installment2Y,
      installment_3y: formulaBase3Y && multiplier3Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase3Y, multiplier3Y, 3) : installment3Y,
      installment_4y: formulaBase4Y && multiplier4Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase4Y, multiplier4Y, 4) : installment4Y,
      installment_5y: formulaBase5Y && multiplier5Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase5Y, multiplier5Y, 5) : installment5Y,
      installment_6y: formulaBase6Y && multiplier6Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase6Y, multiplier6Y, 6) : installment6Y,
      installment_7y: formulaBase7Y && multiplier7Y ? calculateFormulaInstallment(loanAmount, depositAmount, formulaBase7Y, multiplier7Y, 7) : installment7Y,
      installment_formula_base_2y: formulaBase2Y,
      installment_formula_base_3y: formulaBase3Y,
      installment_formula_base_4y: formulaBase4Y,
      installment_formula_base_5y: formulaBase5Y,
      installment_formula_base_6y: formulaBase6Y,
      installment_formula_base_7y: formulaBase7Y,
      installment_multiplier_2y: multiplier2Y,
      installment_multiplier_3y: multiplier3Y,
      installment_multiplier_4y: multiplier4Y,
      installment_multiplier_5y: multiplier5Y,
      installment_multiplier_6y: multiplier6Y,
      installment_multiplier_7y: multiplier7Y,
      cost_price: costPrice,
      profit_amount: item.profit_amount === undefined ? Math.max(sellingPrice - costPrice, 0) : normalizeMoneyAmount(item.profit_amount),
      profit_review_month: item.profit_review_month || '',
      profit_reviewed_at: item.profit_reviewed_at || '',
      profit_reviewed_by: item.profit_reviewed_by || '',
      plates: [...(stats?.plates || [])].sort(),
      applications: stats?.applications || 0,
      approved: stats?.approved || 0,
      latest: stats?.latest || item.created_at,
      catalogRecord: true
    };
  });

  return catalogRows;
}

function normalizeRelationshipValue(value: string, fallback = 'Other') {
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized || fallback;
}

function normalizeBankKey(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function buildMissingBankDefinitionRows(applications: LoanApplication[], bankDefinitions: BankDefinition[]): MissingBankDefinitionRow[] {
  const knownBanks = new Set(bankDefinitions.map((bank) => normalizeBankKey(bank.name)));
  const rows = new Map<string, {
    name: string;
    applicationIds: Set<string>;
    bankApplications: number;
    latest: string;
    statusCounts: Record<string, number>;
  }>();

  applications.forEach((application) => {
    (application.bank_applications || []).forEach((bankApplication) => {
      const bankName = normalizeRelationshipValue(bankApplication.bank_name || '', '');
      const bankKey = normalizeBankKey(bankName);

      if (!bankName || knownBanks.has(bankKey)) {
        return;
      }

      const row = rows.get(bankKey) || {
        name: bankName,
        applicationIds: new Set<string>(),
        bankApplications: 0,
        latest: '',
        statusCounts: {}
      };
      const status = bankApplication.status || 'Submitted';
      const submittedAt = bankApplication.submitted_at || application.submitted_at || '';

      row.applicationIds.add(application.id);
      row.bankApplications += 1;
      row.statusCounts[status] = (row.statusCounts[status] || 0) + 1;
      row.latest = !row.latest || new Date(submittedAt).getTime() > new Date(row.latest).getTime()
        ? submittedAt
        : row.latest;
      rows.set(bankKey, row);
    });
  });

  return Array.from(rows.values())
    .map((row) => ({
      name: row.name,
      applications: row.applicationIds.size,
      bankApplications: row.bankApplications,
      latest: row.latest,
      statusCounts: row.statusCounts
    }))
    .sort((a, b) => b.bankApplications - a.bankApplications || a.name.localeCompare(b.name));
}

function getBankStatusTone(status: string) {
  if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  if (status === 'Rejected') return 'bg-rose-50 text-rose-700 ring-rose-100';
  if (status === 'Pending Review') return 'bg-amber-50 text-amber-700 ring-amber-100';
  if (status === 'Need More Info') return 'bg-blue-50 text-blue-700 ring-blue-100';
  if (status === 'Cancelled') return 'bg-slate-100 text-slate-500 ring-slate-200';
  return 'bg-slate-50 text-slate-600 ring-slate-100';
}

function normalizeSourceKey(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function getDefaultFinanceBase(profileId: FinanceProfileId) {
  return profileId === 'net_loan' || profileId === 'voge_sr3_6_7y' ? 'net_loan' : 'loan';
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

async function downscaleBrandLogoDataUrl(file: File, maxSize = 160): Promise<string> {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth || maxSize, image.naturalHeight || maxSize));
  const width = Math.max(1, Math.round((image.naturalWidth || maxSize) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || maxSize) * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    return sourceDataUrl;
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/png');
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load bank icon image'));
    image.src = dataUrl;
  });
}

async function removeConnectedImageBackground(dataUrl: string, tolerance = 48): Promise<string> {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Unable to create background removal canvas');
  }

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const width = canvas.width;
  const height = canvas.height;
  const cornerIndexes = [0, width - 1, (height - 1) * width, (height * width) - 1];
  const background = cornerIndexes.reduce((rgb, pixelIndex) => {
    const offset = pixelIndex * 4;
    return [rgb[0] + data[offset], rgb[1] + data[offset + 1], rgb[2] + data[offset + 2]];
  }, [0, 0, 0]).map((channel) => channel / cornerIndexes.length);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  const matchesBackground = (pixelIndex: number) => {
    const offset = pixelIndex * 4;
    const deltaRed = data[offset] - background[0];
    const deltaGreen = data[offset + 1] - background[1];
    const deltaBlue = data[offset + 2] - background[2];
    return Math.sqrt((deltaRed * deltaRed) + (deltaGreen * deltaGreen) + (deltaBlue * deltaBlue)) <= tolerance;
  };
  const enqueue = (pixelIndex: number) => {
    if (!visited[pixelIndex] && matchesBackground(pixelIndex)) {
      visited[pixelIndex] = 1;
      queue.push(pixelIndex);
    }
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue(((height - 1) * width) + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue((y * width) + width - 1);
  }

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const pixelIndex = queue[cursor];
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    data[(pixelIndex * 4) + 3] = 0;
    if (x > 0) enqueue(pixelIndex - 1);
    if (x < width - 1) enqueue(pixelIndex + 1);
    if (y > 0) enqueue(pixelIndex - width);
    if (y < height - 1) enqueue(pixelIndex + width);
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

async function createCroppedBrandLogoDataUrl(draft: BrandLogoCropDraft): Promise<string> {
  const image = await loadImage(draft.sourceDataUrl);
  const width = draft.shape === 'wide' ? BRAND_LOGO_WIDE_WIDTH : BRAND_LOGO_SQUARE_SIZE;
  const height = draft.shape === 'wide' ? BRAND_LOGO_WIDE_HEIGHT : BRAND_LOGO_SQUARE_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to create brand logo canvas');
  }

  context.clearRect(0, 0, width, height);
  if (draft.background !== TRANSPARENT_BRAND_LOGO_BACKGROUND) {
    context.fillStyle = draft.background;
    context.fillRect(0, 0, width, height);
  }

  // Contain by default so the whole wordmark/icon fits; zoom lets the user fill.
  const baseScale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const scale = baseScale * draft.zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const maxOffsetX = Math.max(0, (drawWidth - width) / 2);
  const maxOffsetY = Math.max(0, (drawHeight - height) / 2);
  const offsetX = (draft.offsetX / 100) * maxOffsetX;
  const offsetY = (draft.offsetY / 100) * maxOffsetY;

  context.drawImage(
    image,
    (width - drawWidth) / 2 + offsetX,
    (height - drawHeight) / 2 + offsetY,
    drawWidth,
    drawHeight
  );

  return canvas.toDataURL('image/png');
}

async function createCroppedBankIconDataUrl(draft: BankIconCropDraft) {
  const image = await loadImage(draft.sourceDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = BANK_ICON_OUTPUT_SIZE;
  canvas.height = BANK_ICON_OUTPUT_SIZE;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to create bank icon canvas');
  }

  context.fillStyle = draft.background;
  context.fillRect(0, 0, BANK_ICON_OUTPUT_SIZE, BANK_ICON_OUTPUT_SIZE);

  const baseScale = Math.max(
    BANK_ICON_OUTPUT_SIZE / image.naturalWidth,
    BANK_ICON_OUTPUT_SIZE / image.naturalHeight
  );
  const scale = baseScale * draft.zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const maxOffsetX = Math.max(0, (drawWidth - BANK_ICON_OUTPUT_SIZE) / 2);
  const maxOffsetY = Math.max(0, (drawHeight - BANK_ICON_OUTPUT_SIZE) / 2);
  const offsetX = (draft.offsetX / 100) * maxOffsetX;
  const offsetY = (draft.offsetY / 100) * maxOffsetY;

  context.drawImage(
    image,
    (BANK_ICON_OUTPUT_SIZE - drawWidth) / 2 + offsetX,
    (BANK_ICON_OUTPUT_SIZE - drawHeight) / 2 + offsetY,
    drawWidth,
    drawHeight
  );

  return canvas.toDataURL('image/png');
}

function findVehicleInfoRow(rows: VehicleInfoRow[], model: string) {
  return rows.find((row) => row.model.toLowerCase() === model.toLowerCase());
}

function buildVehicleRelationshipRows(vehicleCatalog: VehicleCatalogItem[], vehicleInfoRows: VehicleInfoRow[]): VehicleRelationshipRow[] {
  return vehicleCatalog.map((item) => {
    const info = findVehicleInfoRow(vehicleInfoRows, item.model);

    return {
      ...item,
      applications: info?.applications || 0,
      approved: info?.approved || 0
    };
  });
}

function buildMarketingRelationshipRows(
  relationships: MarketingTagRelationship[],
  links: WhatsAppTrackingLink[],
  clicks: WhatsAppTrackingClick[]
): MarketingRelationshipRow[] {
  return relationships.map((relationship) => {
    const sourceKey = normalizeSourceKey(relationship.source);

    return {
      ...relationship,
      links: links.filter((link) => normalizeSourceKey(link.channel) === sourceKey).length,
      clicks: clicks.filter((click) => normalizeSourceKey(click.channel) === sourceKey).length
    };
  });
}

function formatParentTagLabel(value: string) {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return 'Other Parent Tag';
  }

  if (normalized.toLowerCase() === 'social media') {
    return 'Social Parent Tag';
  }

  return `${normalized} Parent Tag`;
}

function buildMarketingParentGroups(relationships: MarketingTagRelationship[]) {
  const grouped = relationships.reduce<Record<string, string[]>>((acc, relationship) => {
    const parent = relationship.medium.trim() || relationship.category.trim() || 'Other';
    const source = relationship.source.trim();
    if (!source) {
      return acc;
    }

    acc[parent] = acc[parent] || [];
    if (!acc[parent].some((item) => item.toLowerCase() === source.toLowerCase())) {
      acc[parent].push(source);
    }
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([parent, children]) => ({
      parent,
      label: formatParentTagLabel(parent),
      children: children.sort((a, b) => a.localeCompare(b))
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function TagTable({
  title,
  subtitle,
  tags,
  canManageTags,
  searchTerm,
  onUpdateTags
}: {
  title: string;
  subtitle: string;
  tags: string[];
  canManageTags: boolean;
  searchTerm: string;
  onUpdateTags: (tags: string[]) => void;
}) {
  const [newTag, setNewTag] = useState('');
  const [sortState, setSortState] = useState<SortState<TagSortKey>>({
    key: 'name',
    direction: 'asc'
  });

  const visibleTags = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return tags
      .filter((tag) => !query || tag.toLowerCase().includes(query))
      .sort((a, b) => compareSortValues(a.toLowerCase(), b.toLowerCase(), sortState.direction));
  }, [searchTerm, sortState.direction, tags]);

  const handleSort = (key: TagSortKey, defaultDirection: SortDirection = 'asc') => {
    setSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleAddTag = () => {
    const normalized = newTag.trim();
    if (!normalized || tags.some((tag) => tag.toLowerCase() === normalized.toLowerCase())) {
      return;
    }

    onUpdateTags([...tags, normalized]);
    setNewTag('');
  };

  const handleRenameTag = (currentTag: string, nextTag: string) => {
    const normalized = nextTag.trim();
    if (!normalized) {
      return;
    }

    onUpdateTags(tags.map((tag) => (tag === currentTag ? normalized : tag)));
  };

  const handleDeleteTag = (tagToDelete: string) => {
    if (tags.length <= 1) {
      return;
    }

    onUpdateTags(tags.filter((tag) => tag !== tagToDelete));
  };

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100/70 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
        {canManageTags && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(event) => setNewTag(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleAddTag();
                }
              }}
              placeholder="New tag"
              className="w-44 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
            <tr>
              <th className="px-6 py-3.5">
                <SortableHeader sortKey="name" label={tr('标签名称', 'Tag Name', "Nama Tag")} sortState={sortState} onSort={handleSort} />
              </th>
              <th className="px-6 py-3.5 text-right">{tr('操作', 'Action', "Tindakan")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {visibleTags.map((tagName) => (
              <tr key={tagName} className="hover:bg-indigo-50/20">
                <td className="px-6 py-4">
                  {canManageTags ? (
                    <DoubleClickEditField
                      type="text"
                      value={tagName}
                      onCommit={(value) => handleRenameTag(tagName, value)}
                      displayClassName="block w-full max-w-md truncate rounded-lg bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      inputClassName="w-full max-w-md rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                      ariaLabel={`Rename tag ${tagName}`}
                    />
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {tagName}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {canManageTags && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tagName)}
                      disabled={tags.length <= 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Delete ${tagName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visibleTags.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-sm text-slate-400">
                  {tr('没有找到标签', 'No tags found', "Tiada tag ditemui")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// 归一化车型名：去品牌、去空格/符号，用于把「lc135」「Yamaha LC 135」这类
// 同款不同写法的行聚在一起并标记疑似重复。
function getVehicleCleanKey(model: string, brand: string) {
  let key = model.trim().toLowerCase();

  if (brand) {
    key = key.split(brand.trim().toLowerCase()).join(' ');
  }

  return key.replace(/[^a-z0-9]/g, '');
}

export default function TagsAdmin({
  applications,
  vehicleCatalog,
  financeProfiles,
  vehicleCategories,
  vehicleBrandLogos,
  currentStaffName,
  bankDefinitions,
  vehicleTags,
  vehicleBrandTags,
  errorCodeDefinitions,
  roleAccounts,
  roleNavAccess,
  defaultAvatars,
  marketingTagRelationships,
  tagNormalizationRules,
  whatsAppTrackingLinks,
  whatsAppTrackingClicks,
  canManageTags,
  canAccessGroup = () => true,
  onUpdateVehicleTags,
  onUpdateVehicleBrandTags,
  onAddErrorCodeDefinition,
  onUpdateErrorCodeDefinition,
  onDeleteErrorCodeDefinition,
  onCreateFirebaseAuthUser,
  onResetFirebaseAuthPassword,
  onUpdateRoleAccount,
  onDeleteRoleAccount,
  onUpdateRoleNavAccess,
  staffWorkload,
  staffWorkloadCases,
  onTransferWorkload,
  onTransferWorkloadCase,
  onAddDefaultAvatar,
  onDeleteDefaultAvatar,
  onAddVehicleCatalogItem,
  onRenameVehicleModel,
  onOpenApplication,
  onUpdateVehicleCatalogItem,
  onMergeVehicleCatalogItems,
  onUpdateVehicleCategories,
  onUpdateVehicleBrandLogo,
  onDeleteVehicleCatalogItem,
  onUpdateFinanceProfileTerm,
  onAddBankDefinition,
  onUpdateBankDefinition,
  onDeleteBankDefinition,
  onAddMarketingTagRelationship,
  onUpdateMarketingTagRelationship,
  onDeleteMarketingTagRelationship,
  onAddTagNormalizationRule,
  initialGroup = 'info',
  onGroupChange,
  initialRoleTab = 'accounts',
  onRoleTabChange,
  onUpdateTagNormalizationRule,
  onDeleteTagNormalizationRule,
  commissionRules,
  onUpdateCommissionRules
}: TagsAdminProps) {
  const { showAlert, showConfirm } = useBrandedDialog();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const [activeGroup, setActiveGroup] = useState<TagGroup>(initialGroup);
  const [activeRoleTab, setActiveRoleTab] = useState<RoleSettingsTab>(initialRoleTab);
  const [commissionRulesDraft, setCommissionRulesDraft] = useState<CommissionRules>(commissionRules);
  const setActiveSettingGroup = (group: TagGroup) => {
    setActiveGroup(group);
    onGroupChange?.(group);
  };

  // Sidebar deep-links drive initialGroup; internal tab clicks report back up
  // via onGroupChange so the sidebar highlight stays in sync.
  useEffect(() => {
    setActiveGroup(initialGroup);
  }, [initialGroup]);
  useEffect(() => {
    setActiveRoleTab(initialRoleTab);
  }, [initialRoleTab]);
  useEffect(() => {
    setCommissionRulesDraft(commissionRules);
  }, [commissionRules]);
  const [showDataCleanupDebug, setShowDataCleanupDebug] = useState(false);
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleSellingPrice, setNewVehicleSellingPrice] = useState('');
  const [newVehicleLoanAmount, setNewVehicleLoanAmount] = useState('');
  const [newVehicleDepositAmount, setNewVehicleDepositAmount] = useState('');
  const [newVehicleFinanceProfile, setNewVehicleFinanceProfile] = useState<FinanceProfileId>('standard_loan');
  const [newBankName, setNewBankName] = useState('');
  const [newBankIconDataUrl, setNewBankIconDataUrl] = useState('');
  const [isSavingNewBankDefinition, setIsSavingNewBankDefinition] = useState(false);
  const [bankIconCropDraft, setBankIconCropDraft] = useState<BankIconCropDraft | null>(null);
  const [isSavingBankIconCrop, setIsSavingBankIconCrop] = useState(false);
  const [brandLogoCropDraft, setBrandLogoCropDraft] = useState<BrandLogoCropDraft | null>(null);
  const [isSavingBrandLogoCrop, setIsSavingBrandLogoCrop] = useState(false);
  const [isRemovingBrandLogoBackground, setIsRemovingBrandLogoBackground] = useState(false);
  const brandLogoFileInputRef = useRef<HTMLInputElement>(null);
  const pendingBrandLogoRef = useRef('');
  const brandLogoClickRef = useRef<{ brand: string; count: number; timer: ReturnType<typeof setTimeout> | null }>({ brand: '', count: 0, timer: null });
  const [newMarketingSource, setNewMarketingSource] = useState('');
  const [newMarketingMedium, setNewMarketingMedium] = useState('Social media');
  const [newMarketingCategory, setNewMarketingCategory] = useState('Lead source');
  const [newNormalizationDomain, setNewNormalizationDomain] = useState<TagNormalizationDomain>('vehicle');
  const [newNormalizationRaw, setNewNormalizationRaw] = useState('');
  const [newNormalizationTag, setNewNormalizationTag] = useState('');
  const [newNormalizationParent, setNewNormalizationParent] = useState('');
  const [newNormalizationCategory, setNewNormalizationCategory] = useState('');
  const [vehicleInfoSortState, setVehicleInfoSortState] = useState<SortState<VehicleInfoSortKey>>({
    key: 'applications',
    direction: 'desc'
  });
  const [vehicleRelationshipSortState, setVehicleRelationshipSortState] = useState<SortState<VehicleRelationshipSortKey>>({
    key: 'applications',
    direction: 'desc'
  });
  const [marketingRelationshipSortState, setMarketingRelationshipSortState] = useState<SortState<MarketingRelationshipSortKey>>({
    key: 'clicks',
    direction: 'desc'
  });
  const [normalizationRuleSortState, setNormalizationRuleSortState] = useState<SortState<NormalizationRuleSortKey>>({
    key: 'domain',
    direction: 'asc'
  });
  const [bankSortState, setBankSortState] = useState<SortState<BankSortKey>>({
    key: 'name',
    direction: 'asc'
  });

  useEffect(() => {
    if (activeGroup === 'relationship' && (!canManageTags || !showDataCleanupDebug)) {
      setActiveGroup('info');
    }
  }, [activeGroup, canManageTags, showDataCleanupDebug]);

  const missingVehicleModels = useMemo(
    () => buildMissingVehicleModels(applications, vehicleCatalog, vehicleBrandTags),
    [applications, vehicleCatalog, vehicleBrandTags]
  );

  const vehicleInfoRows = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const filteredRows = buildVehicleInfoRows(applications, vehicleCatalog, vehicleBrandTags, financeProfiles).filter((row) => (
      !query ||
      row.model.toLowerCase().includes(query) ||
      row.brand.toLowerCase().includes(query) ||
      row.tag.toLowerCase().includes(query) ||
      (findFinanceProfile(row.finance_profile, financeProfiles)?.label.toLowerCase().includes(query) || false) ||
      row.plates.some((plate) => plate.toLowerCase().includes(query))
    ));

    const getSortValue = (row: VehicleInfoRow) => {
      return row[vehicleInfoSortState.key];
    };

    return filteredRows.sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), vehicleInfoSortState.direction));
  }, [applications, debouncedSearchTerm, financeProfiles, vehicleBrandTags, vehicleCatalog, vehicleInfoSortState]);

  // Vehicle Information groups rows by brand so long catalogs stay scannable.
  // Groups start collapsed; an active search auto-expands matches.
  const [expandedVehicleBrands, setExpandedVehicleBrands] = useState<Record<string, boolean>>({});
  const vehicleInfoQueryActive = debouncedSearchTerm.trim().length > 0;
  const [selectedVariantBySeries, setSelectedVariantBySeries] = useState<Record<string, string>>({});
  const [expandedVehicleSeries, setExpandedVehicleSeries] = useState<Record<string, boolean>>({});
  const [expandedDupKey, setExpandedDupKey] = useState('');
  const [duplicateMasterByGroup, setDuplicateMasterByGroup] = useState<Record<string, string>>({});
  const [showVehicleDuplicateSection, setShowVehicleDuplicateSection] = useState(true);
  const toggleVehicleSeries = (key: string) =>
    setExpandedVehicleSeries((current) => ({ ...current, [key]: !current[key] }));
  const [showPlanColumns, setShowPlanColumns] = useState(false);
  const vehicleColSpan = showPlanColumns ? 8 : 6;
  const reduceSeriesRows = (rows: VehicleInfoRow[]): Array<{ row: VehicleInfoRow; variants: VehicleInfoRow[] }> => {
    const order: string[] = [];
    const groups = new Map<string, VehicleInfoRow[]>();
    rows.forEach((row) => {
      const key = (row.series || row.model).trim().toLowerCase();
      if (!groups.has(key)) {
        groups.set(key, []);
        order.push(key);
      }
      groups.get(key)!.push(row);
    });
    return order.map((key) => {
      const variants = groups.get(key)!;
      if (variants.length <= 1) {
        return { row: variants[0], variants };
      }
      const selected = variants.find((item) => item.id === selectedVariantBySeries[key]) || variants[0];
      return { row: selected, variants };
    });
  };

  const vehicleBrandGroups = useMemo(() => {
    const groups = new Map<string, VehicleInfoRow[]>();

    vehicleInfoRows.forEach((row) => {
      const brand = row.brand || 'Other';
      groups.set(brand, [...(groups.get(brand) || []), row]);
    });

    return Array.from(groups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([brand, rows]) => {
        const cleanKeyCounts = new Map<string, number>();
        const cleanKeyGroups = new Map<string, VehicleInfoRow[]>();

        rows.forEach((row) => {
          const cleanKey = getVehicleCleanKey(row.model, brand);
          cleanKeyCounts.set(cleanKey, (cleanKeyCounts.get(cleanKey) || 0) + 1);
          cleanKeyGroups.set(cleanKey, [...(cleanKeyGroups.get(cleanKey) || []), row]);
        });

        // When sorting by name, cluster same-model aliases next to each other.
        const clusteredRows = vehicleInfoSortState.key === 'model'
          ? [...rows].sort((a, b) => (
            getVehicleCleanKey(a.model, brand).localeCompare(getVehicleCleanKey(b.model, brand)) ||
            a.model.localeCompare(b.model)
          ))
          : rows;

        const duplicateClusterCount = Array.from(cleanKeyCounts.values()).filter((count) => count > 1).length;

        return { brand, rows: clusteredRows, cleanKeyCounts, cleanKeyGroups, duplicateClusterCount };
      });
  }, [vehicleInfoRows, vehicleInfoSortState.key]);

  const vehicleDuplicateGroups = useMemo(() => (
    vehicleBrandGroups
      .flatMap(({ brand, cleanKeyGroups }) => (
        Array.from(cleanKeyGroups.entries())
          .map(([cleanKey, rows]) => [cleanKey, rows.filter((row) => row.catalogRecord)] as const)
          .filter(([, rows]) => rows.length > 1)
          .map(([cleanKey, rows]) => ({
              key: `${brand}::${cleanKey}`,
              brand,
              cleanKey,
              rows: [...rows].sort((a, b) => a.model.localeCompare(b.model) || a.id.localeCompare(b.id))
            }))
      ))
      .sort((a, b) => a.brand.localeCompare(b.brand) || a.rows[0].model.localeCompare(b.rows[0].model))
  ), [vehicleBrandGroups]);

  const toggleVehicleBrandGroup = (brand: string) => {
    setExpandedVehicleBrands((current) => ({ ...current, [brand]: !current[brand] }));
  };

  const marketingParentGroups = useMemo(() => buildMarketingParentGroups(marketingTagRelationships), [marketingTagRelationships]);
  const missingBankRows = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const rows = buildMissingBankDefinitionRows(applications, bankDefinitions);

    return rows.filter((row) => (
      !query ||
      row.name.toLowerCase().includes(query) ||
      Object.keys(row.statusCounts).some((status) => status.toLowerCase().includes(query))
    ));
  }, [applications, bankDefinitions, debouncedSearchTerm]);
  const bankRows = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const rows = bankDefinitions.filter((bank) => (
      !query ||
      bank.name.toLowerCase().includes(query) ||
      (bank.active ? 'active' : 'inactive').includes(query)
    ));

    const getSortValue = (row: BankDefinition) => {
      if (bankSortState.key === 'active') {
        return row.active ? 1 : 0;
      }

      if (bankSortState.key === 'created_at') {
        return new Date(row.created_at).getTime();
      }

      return row.name;
    };

    return rows.sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), bankSortState.direction));
  }, [bankDefinitions, bankSortState, debouncedSearchTerm]);

  const vehicleRelationshipRows = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const rows = buildVehicleRelationshipRows(vehicleCatalog, buildVehicleInfoRows(applications, vehicleCatalog, vehicleBrandTags, financeProfiles)).filter((row) => (
      !query ||
      row.model.toLowerCase().includes(query) ||
      row.brand.toLowerCase().includes(query)
    ));

    const getSortValue = (row: VehicleRelationshipRow) => row[vehicleRelationshipSortState.key];

    return rows.sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), vehicleRelationshipSortState.direction));
  }, [applications, debouncedSearchTerm, financeProfiles, vehicleBrandTags, vehicleCatalog, vehicleRelationshipSortState]);

  const marketingRelationshipRows = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const rows = buildMarketingRelationshipRows(marketingTagRelationships, whatsAppTrackingLinks, whatsAppTrackingClicks).filter((row) => (
      !query ||
      row.source.toLowerCase().includes(query) ||
      row.medium.toLowerCase().includes(query) ||
      row.category.toLowerCase().includes(query)
    ));

    const getSortValue = (row: MarketingRelationshipRow) => row[marketingRelationshipSortState.key];

    return rows.sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), marketingRelationshipSortState.direction));
  }, [debouncedSearchTerm, marketingRelationshipSortState, marketingTagRelationships, whatsAppTrackingClicks, whatsAppTrackingLinks]);

  const normalizationRuleRows = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const rows = tagNormalizationRules.filter((rule) => (
      !query ||
      rule.domain.toLowerCase().includes(query) ||
      rule.raw_value.toLowerCase().includes(query) ||
      rule.normalized_tag.toLowerCase().includes(query) ||
      rule.parent_tag.toLowerCase().includes(query) ||
      rule.category.toLowerCase().includes(query)
    ));

    const getSortValue = (row: TagNormalizationRule) => {
      if (normalizationRuleSortState.key === 'active') {
        return row.active ? 1 : 0;
      }

      return row[normalizationRuleSortState.key];
    };

    return rows.sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), normalizationRuleSortState.direction));
  }, [debouncedSearchTerm, normalizationRuleSortState, tagNormalizationRules]);

  const handleVehicleInfoSort = (
    key: VehicleInfoSortKey,
    defaultDirection: SortDirection = ['plates', 'applications', 'approved', 'latest'].includes(key) ? 'desc' : 'asc'
  ) => {
    setVehicleInfoSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleVehicleRelationshipSort = (
    key: VehicleRelationshipSortKey,
    defaultDirection: SortDirection = ['applications', 'approved'].includes(key) ? 'desc' : 'asc'
  ) => {
    setVehicleRelationshipSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleMarketingRelationshipSort = (
    key: MarketingRelationshipSortKey,
    defaultDirection: SortDirection = ['links', 'clicks'].includes(key) ? 'desc' : 'asc'
  ) => {
    setMarketingRelationshipSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleNormalizationRuleSort = (
    key: NormalizationRuleSortKey,
    defaultDirection: SortDirection = key === 'active' ? 'desc' : 'asc'
  ) => {
    setNormalizationRuleSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleBankSort = (
    key: BankSortKey,
    defaultDirection: SortDirection = key === 'created_at' || key === 'active' ? 'desc' : 'asc'
  ) => {
    setBankSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const readBankIconFile = async (file?: File) => {
    if (!file) {
      return '';
    }

    if (!file.type.startsWith('image/')) {
      await showAlert({
        eyebrow: tr('银行图标', 'Bank Icon', 'Ikon Bank'),
        title: tr('不支持这个文件格式', 'Unsupported file type', 'Jenis fail tidak disokong'),
        message: tr('请上传图片文件作为银行图标。', 'Please upload an image file for the bank icon.', 'Sila muat naik fail imej untuk ikon bank.'),
        tone: 'warning'
      });
      return '';
    }

    if (file.size > MAX_BANK_ICON_SOURCE_FILE_SIZE_BYTES) {
      await showAlert({
        eyebrow: tr('银行图标', 'Bank Icon', 'Ikon Bank'),
        title: tr('图片太大', 'Image is too large', 'Imej terlalu besar'),
        message: tr('银行图标原图必须小于或等于 3MB。', 'Bank icon source image must be 3MB or smaller.', 'Imej sumber ikon bank mestilah 3MB atau lebih kecil.'),
        tone: 'warning'
      });
      return '';
    }

    return readFileAsDataUrl(file);
  };

  const openBankIconCrop = async (target: BankIconCropDraft['target'], file?: File) => {
    try {
      const dataUrl = await readBankIconFile(file);
      if (!dataUrl) {
        return;
      }

      await loadImage(dataUrl);
      setBankIconCropDraft({
        target,
        sourceDataUrl: dataUrl,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        background: '#ffffff'
      });
    } catch {
      await showAlert({
        eyebrow: tr('银行图标', 'Bank Icon', 'Ikon Bank'),
        title: tr('图片无法读取', 'Image could not be read', 'Imej tidak dapat dibaca'),
        message: tr('请改用 PNG、JPG 或 WebP 图片再试。', 'Please try again with a PNG, JPG, or WebP image.', 'Sila cuba lagi dengan imej PNG, JPG atau WebP.'),
        tone: 'danger'
      });
    }
  };

  const handleNewBankIconChange = async (file?: File) => {
    await openBankIconCrop('new', file);
  };

  const handleBankIconChange = async (id: string, file?: File) => {
    await openBankIconCrop(id, file);
  };

  const handleApplyBankIconCrop = async () => {
    if (!bankIconCropDraft) {
      return;
    }

    setIsSavingBankIconCrop(true);
    try {
      const croppedDataUrl = await createCroppedBankIconDataUrl(bankIconCropDraft);
      if (bankIconCropDraft.target === 'new') {
        setNewBankIconDataUrl(croppedDataUrl);
      } else {
        const saved = await onUpdateBankDefinition(bankIconCropDraft.target, { icon_data_url: croppedDataUrl });
        if (!saved) {
          return;
        }
      }
      setBankIconCropDraft(null);
    } catch {
      await showAlert({
        eyebrow: tr('银行图标', 'Bank Icon', 'Ikon Bank'),
        title: tr('图片裁切失败', 'Image crop failed', 'Pangkas imej gagal'),
        message: tr('请换一张图片再试。', 'Please try another image.', 'Sila cuba imej lain.'),
        tone: 'danger'
      });
    } finally {
      setIsSavingBankIconCrop(false);
    }
  };

  const openBrandLogoCrop = async (brand: string, file?: File) => {
    if (!file) {
      return;
    }
    if (file.type !== 'image/png') {
      await showAlert({
        eyebrow: tr('品牌 Logo', 'Brand Logo', 'Logo Jenama'),
        title: tr('不支持这个文件格式', 'Unsupported file type', 'Jenis fail tidak disokong'),
        message: tr('品牌 Logo 只支持 PNG 文件。', 'Brand logos must be PNG files.', "Logo jenama mestilah fail PNG."),
        tone: 'warning'
      });
      return;
    }
    if (file.size > MAX_BANK_ICON_SOURCE_FILE_SIZE_BYTES) {
      await showAlert({
        eyebrow: tr('品牌 Logo', 'Brand Logo', 'Logo Jenama'),
        title: tr('图片太大', 'Image is too large', 'Imej terlalu besar'),
        message: tr('品牌 Logo 必须小于或等于 3MB。', 'Brand logo image must be 3MB or smaller.', 'Imej logo jenama mestilah 3MB atau lebih kecil.'),
        tone: 'warning'
      });
      return;
    }
    const sourceDataUrl = await readFileAsDataUrl(file);
    if (!sourceDataUrl) {
      return;
    }
    setBrandLogoCropDraft({ brand, originalSourceDataUrl: sourceDataUrl, sourceDataUrl, shape: 'square', zoom: 1, offsetX: 0, offsetY: 0, background: TRANSPARENT_BRAND_LOGO_BACKGROUND });
  };

  const handleRemoveBrandLogoBackground = async () => {
    if (!brandLogoCropDraft) {
      return;
    }
    setIsRemovingBrandLogoBackground(true);
    try {
      const sourceDataUrl = await removeConnectedImageBackground(brandLogoCropDraft.originalSourceDataUrl);
      setBrandLogoCropDraft((current) => current ? { ...current, sourceDataUrl, background: TRANSPARENT_BRAND_LOGO_BACKGROUND } : current);
    } catch {
      await showAlert({
        eyebrow: tr('品牌 Logo', 'Brand Logo', 'Logo Jenama'),
        title: tr('无法移除背景', 'Background removal failed', 'Pembuangan latar belakang gagal'),
        message: tr('请换一张背景较单纯的图片。', 'Try an image with a simpler background.', "Cuba imej dengan latar belakang yang lebih ringkas."),
        tone: 'danger'
      });
    } finally {
      setIsRemovingBrandLogoBackground(false);
    }
  };

  const handleApplyBrandLogoCrop = async () => {
    if (!brandLogoCropDraft) {
      return;
    }
    setIsSavingBrandLogoCrop(true);
    try {
      const croppedDataUrl = await createCroppedBrandLogoDataUrl(brandLogoCropDraft);
      // Upload to Firebase Storage and store only the URL — keeps the base64 out
      // of the dashboard_state doc, which has a hard 1MB size limit.
      const url = await uploadBrandLogoToStorage(brandLogoCropDraft.brand, croppedDataUrl);
      if (!url) {
        await showAlert({
          eyebrow: tr('品牌 Logo', 'Brand Logo', 'Logo Jenama'),
          title: tr('Logo 上传失败', 'Logo upload failed', 'Muat naik logo gagal'),
          message: tr('无法连接存储服务，请稍后再试。', 'Storage is unavailable. Please try again later.', 'Storan tidak tersedia. Sila cuba lagi kemudian.'),
          tone: 'danger'
        });
        return;
      }
      onUpdateVehicleBrandLogo(brandLogoCropDraft.brand, url);
      setBrandLogoCropDraft(null);
    } catch {
      await showAlert({
        eyebrow: tr('品牌 Logo', 'Brand Logo', 'Logo Jenama'),
        title: tr('Logo 上传失败', 'Logo upload failed', 'Muat naik logo gagal'),
        message: tr('请换一张图片再试。', 'Please try another image.', 'Sila cuba imej lain.'),
        tone: 'danger'
      });
    } finally {
      setIsSavingBrandLogoCrop(false);
    }
  };

  const openBrandLogoFilePicker = (brand: string) => {
    pendingBrandLogoRef.current = brand;
    brandLogoFileInputRef.current?.click();
  };

  // Buttonless interaction: double-click a brand logo to replace, quadruple-click to remove.
  const handleBrandLogoBoxClick = (brand: string) => {
    if (!canManageTags) {
      return;
    }
    const state = brandLogoClickRef.current;
    if (state.brand !== brand) {
      state.brand = brand;
      state.count = 0;
    }
    state.count += 1;
    if (state.timer) {
      clearTimeout(state.timer);
    }
    state.timer = setTimeout(() => {
      const clicks = state.count;
      state.count = 0;
      state.brand = '';
      state.timer = null;
      if (clicks >= 4) {
        onUpdateVehicleBrandLogo(brand, '');
      } else if (clicks === 2) {
        openBrandLogoFilePicker(brand);
      }
    }, 420);
  };

  const handleAddVehicleRelationship = () => {
    const model = normalizeRelationshipValue(newVehicleModel, '');
    if (!model) {
      return;
    }

    onAddVehicleCatalogItem({
      model,
      body_type: 'Motorcycle',
      finance_profile: newVehicleFinanceProfile,
      selling_price: normalizeMoneyAmount(newVehicleSellingPrice),
      loan_amount: normalizeMoneyAmount(newVehicleLoanAmount),
      deposit_amount: normalizeMoneyAmount(newVehicleDepositAmount)
    });
    setNewVehicleModel('');
    setNewVehicleSellingPrice('');
    setNewVehicleLoanAmount('');
    setNewVehicleDepositAmount('');
    setNewVehicleFinanceProfile('standard_loan');
  };

  const handleAddBankDefinition = async () => {
    const name = normalizeRelationshipValue(newBankName, '');
    if (!name || isSavingNewBankDefinition) {
      return;
    }

    setIsSavingNewBankDefinition(true);
    try {
      const saved = await onAddBankDefinition({
        name,
        icon_data_url: newBankIconDataUrl
      });
      if (!saved) {
        return;
      }
      setNewBankName('');
      setNewBankIconDataUrl('');
    } finally {
      setIsSavingNewBankDefinition(false);
    }
  };

  const handleAddMissingBankDefinition = (name: string) => {
    void onAddBankDefinition({
      name,
      icon_data_url: ''
    });
  };

  const handleAddMarketingRelationship = () => {
    const source = normalizeRelationshipValue(newMarketingSource, '');
    if (!source) {
      return;
    }

    onAddMarketingTagRelationship({
      source,
      medium: normalizeRelationshipValue(newMarketingMedium),
      category: normalizeRelationshipValue(newMarketingCategory, 'Lead source')
    });
    setNewMarketingSource('');
  };

  const handleAddNormalizationRule = () => {
    const rawValue = normalizeRelationshipValue(newNormalizationRaw, '');
    if (!rawValue) {
      return;
    }

    onAddTagNormalizationRule({
      domain: newNormalizationDomain,
      raw_value: rawValue,
      normalized_tag: normalizeRelationshipValue(newNormalizationTag, rawValue),
      parent_tag: normalizeRelationshipValue(newNormalizationParent),
      category: normalizeRelationshipValue(newNormalizationCategory),
      active: true
    });
    setNewNormalizationRaw('');
    setNewNormalizationTag('');
    setNewNormalizationParent('');
    setNewNormalizationCategory('');
  };

  const visibleSettingTabs: Array<[TagGroup, string, React.ReactNode]> = ([
    ['info', tr('车辆信息', 'Vehicle Info', "Maklumat Kenderaan"), <img key="info" src={vehicleInfoIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />],
    ['bank', tr('银行数据库', 'Bank Database', "Pangkalan Data Bank"), <img key="bank" src={bankDatabaseIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />],
    ['roles', tr('角色与账号', 'Roles & Accounts', "Peranan & Akaun"), <img key="roles" src={rolesAccountsIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />],
    ['commissionRules', tr('佣金规则', 'Commission Rules', 'Peraturan Komisen'), <img key="commissionRules" src={commissionRulesIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />]
  ] satisfies Array<[TagGroup, string, React.ReactNode]>).filter(([group]) => canAccessGroup(group));
  const commissionRulesDirty = JSON.stringify(commissionRulesDraft) !== JSON.stringify(commissionRules);

  if (SHOW_DATA_CLEANUP_DEBUG_ENTRY && canManageTags && showDataCleanupDebug) {
    visibleSettingTabs.push(['relationship', tr('数据清理', 'Data Cleanup', "Pembersihan Data"), <img key="relationship" src={dataCleanupIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />]);
  }

  const bankDatabaseTabs = (
    <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-100 bg-white p-1 shadow-2xs">
      {([
        ['bank', tr('银行', 'Banks', "Bank"), bankDatabaseIcon],
        ['code', tr('拒贷原因代码', 'Reject Reason Codes', "Kod Sebab Penolakan"), rejectCodesIcon],
        ...(canAccessGroup('brandLogo') ? [['brandLogo', tr('品牌 Logo', 'Brand Logos', "Logo Jenama"), brandLogoIcon]] : [])
      ] as Array<[TagGroup, string, string]>).map(([key, label, icon]) => (
        <button
          key={key}
          type="button"
          onClick={() => setActiveSettingGroup(key)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${activeGroup === key ? 'bg-red-800 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
        >
          <img src={icon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
          {label}
        </button>
      ))}
    </section>
  );

  const handleMergeDuplicateVehicleGroup = async (groupKey: string, duplicateRows: VehicleInfoRow[]) => {
    const masterId = duplicateMasterByGroup[groupKey];
    const master = duplicateRows.find((row) => row.id === masterId);
    const duplicateIds = duplicateRows.filter((row) => row.id !== masterId).map((row) => row.id);

    if (!master || duplicateIds.length === 0) {
      return;
    }

    const confirmed = await showConfirm({
      eyebrow: tr('车型资料清理', 'Vehicle Data Cleanup', 'Pembersihan Data Kenderaan'),
      title: tr('合并重复车型？', 'Merge duplicate vehicles?', 'Gabungkan kenderaan pendua?'),
      message: tr(
        `保留「${master.model}」作为 Master，并把其余 ${duplicateIds.length} 条记录合并进去？相关 Loan Application 的车型名称也会统一，合并后不能自动还原。`,
        `Keep "${master.model}" as the Master and merge the other ${duplicateIds.length} record(s) into it? Related Loan Application vehicle names will also be unified. This cannot be undone automatically.`,
        `Kekalkan "${master.model}" sebagai Master dan gabungkan ${duplicateIds.length} rekod lain ke dalamnya? Nama kenderaan Loan Application berkaitan juga akan disatukan. Tindakan ini tidak boleh dibuat asal secara automatik.`
      ),
      tone: 'danger',
      confirmLabel: tr('确认合并', 'Merge Records', 'Gabungkan Rekod')
    });

    if (!confirmed) {
      return;
    }

    onMergeVehicleCatalogItems(master.id, duplicateIds);
    setDuplicateMasterByGroup((current) => {
      const next = { ...current };
      delete next[groupKey];
      return next;
    });
    setExpandedDupKey('');
  };

  const renderDuplicateVehicleRows = (duplicateRows: VehicleInfoRow[], groupKey?: string) => (
    <div className="space-y-1.5">
      {duplicateRows.map((duplicateRow) => {
        const isMaster = Boolean(groupKey && duplicateMasterByGroup[groupKey] === duplicateRow.id);

        return (
        <div key={duplicateRow.id} className={`flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 ring-1 ${isMaster ? 'bg-emerald-50 ring-emerald-200' : 'bg-slate-50 ring-slate-100'}`}>
          {groupKey && canManageTags && (
            <button
              type="button"
              onClick={() => setDuplicateMasterByGroup((current) => ({ ...current, [groupKey]: duplicateRow.id }))}
              className={`inline-flex min-w-[88px] items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors ${isMaster ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200'}`}
              aria-pressed={isMaster}
              aria-label={`Select ${duplicateRow.model} as master`}
            >
              {isMaster && <Check className="h-3.5 w-3.5" />}
              {isMaster ? tr('Master', 'Master', "Master") : tr('选为 Master', 'Select Master', "Pilih Master")}
            </button>
          )}
          {duplicateRow.catalogRecord ? (
            <DoubleClickEditField
              value={duplicateRow.model}
              onCommit={(value) => onUpdateVehicleCatalogItem(duplicateRow.id, { model: value })}
              disabled={!canManageTags}
              normalizeValue={(value) => normalizeRelationshipValue(value, duplicateRow.model)}
              displayClassName="min-w-[160px] rounded-lg bg-white px-3 py-1.5 text-left text-xs font-bold text-slate-800 ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
              inputClassName="min-w-[160px] rounded-lg border border-transparent bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50"
              ariaLabel={`Rename ${duplicateRow.model}`}
            />
          ) : (
            <span className="min-w-[160px] text-xs font-bold text-slate-700">{duplicateRow.model}</span>
          )}
          <span className="font-mono text-[10px] font-bold text-emerald-600">RM {Number(duplicateRow.selling_price || 0).toLocaleString()}</span>
          <span className="font-mono text-[10px] font-bold text-amber-600">RM {Number(duplicateRow.loan_amount || 0).toLocaleString()}</span>
          <span className="text-[10px] font-bold text-slate-400">{tr('申请', 'apps', "permohonan")} {duplicateRow.applications}</span>
          {duplicateRow.catalogRecord && canManageTags && (
            <button
              type="button"
              onClick={() => onDeleteVehicleCatalogItem(duplicateRow.id)}
              className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              title={tr('删除此行', 'Delete this row', "Padamkan baris ini")}
              aria-label={`Delete duplicate ${duplicateRow.model}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        );
      })}
    </div>
  );

  return (
    <div id="tags-admin-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('设置', 'Setting', "Tetapan")}</h2>
          <p className="max-w-2xl text-xs font-light leading-relaxed text-slate-500">
            {tr('车辆、银行、代码与账号配置。', 'Vehicle, bank, code, and account settings.', "Tetapan kenderaan, bank, kod dan akaun.")}
          </p>
        </div>

        <div className="relative self-start md:self-auto">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={tr('搜索设置、车型、来源...', 'Search setting, vehicle, source...', "Tetapan carian, kenderaan, sumber...")}
            className="w-72 rounded-lg border border-slate-100 bg-white py-2 pl-9 pr-4 text-xs outline-none transition-all focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100"
          />
        </div>
      </section>

      <section
        data-setting-mobile-tabs
        className={`flex max-w-full flex-col gap-2 rounded-xl border border-slate-100 bg-white p-1 shadow-2xs md:flex-row md:items-center md:justify-end ${SHOW_DATA_CLEANUP_DEBUG_ENTRY && canManageTags ? '' : 'md:hidden'}`}
      >
        {/* Desktop navigates via the flat sidebar; the tab row only shows on mobile. */}
        <div className="flex max-w-full items-center gap-1 overflow-x-auto md:hidden">
          {visibleSettingTabs.map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSettingGroup(key)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeGroup === key
                  ? 'bg-red-800 text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {SHOW_DATA_CLEANUP_DEBUG_ENTRY && canManageTags && (
          <button
            type="button"
            onClick={() => {
              setShowDataCleanupDebug((current) => {
                const next = !current;
                setActiveSettingGroup(next ? 'relationship' : 'info');
                return next;
              });
            }}
            className={`mr-1 inline-flex items-center justify-center rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
              showDataCleanupDebug
                ? 'bg-red-800 text-white hover:bg-red-900'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            {showDataCleanupDebug ? tr('隐藏数据清理', 'Hide Data Cleanup', "Sembunyikan Pembersihan Data") : tr('调试数据清理', 'Debug Data Cleanup', "Nyahpepijat Pembersihan Data")}
          </button>
        )}
      </section>

      {activeGroup === 'commissionRules' ? (
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100/70 px-6 py-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <BadgeDollarSign className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tr('佣金规则', 'Commission Rules', 'Peraturan Komisen')}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {tr(
                      '新成交佣金按最终卖价百分比计算；排行榜奖金继续使用固定金额。',
                      'New-deal commission is a percentage of final selling price; leaderboard bonuses remain fixed amounts.',
                      'Komisen jualan baharu dikira sebagai peratus harga jualan akhir; bonus kedudukan kekal sebagai jumlah tetap.'
                    )}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={!canManageTags || !commissionRulesDirty}
              onClick={() => onUpdateCommissionRules(commissionRulesDraft)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-900 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Save className="h-4 w-4" />
              {tr('保存规则', 'Save Rules', 'Simpan Peraturan')}
            </button>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <label className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700">{tr('新成交佣金率', 'New Deal Commission Rate', 'Kadar Komisen Jualan Baharu')}</span>
              <span className="mt-3 flex items-center overflow-hidden rounded-lg bg-white ring-1 ring-amber-200 focus-within:ring-amber-300">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissionRulesDraft.deal_commission_percent ?? ''}
                  placeholder={tr('未设置', 'Not set', 'Belum ditetapkan')}
                  disabled={!canManageTags}
                  onChange={(event) => setCommissionRulesDraft((current) => ({
                    ...current,
                    deal_commission_percent: event.target.value === ''
                      ? undefined
                      : Math.min(Math.max(Number(event.target.value) || 0, 0), 100)
                  }))}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-right font-mono text-sm font-bold text-slate-900 outline-none placeholder:text-[10px] placeholder:text-slate-300 disabled:text-slate-400"
                />
                <span className="px-3 font-mono text-xs font-bold text-amber-600">%</span>
              </span>
            </label>
            {([
              ['leaderboard_first', tr('排行榜第 1 名', 'Leaderboard #1', 'Kedudukan #1')],
              ['leaderboard_second', tr('排行榜第 2 名', 'Leaderboard #2', 'Kedudukan #2')],
              ['leaderboard_third', tr('排行榜第 3 名', 'Leaderboard #3', 'Kedudukan #3')]
            ] as Array<[CommissionAmountField, string]>).map(([field, label]) => (
              <label key={field} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                <span className="mt-3 flex items-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 focus-within:ring-amber-200">
                  <span className="px-3 font-mono text-xs font-bold text-slate-400">RM</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={commissionRulesDraft[field]}
                    disabled={!canManageTags}
                    onChange={(event) => setCommissionRulesDraft((current) => ({
                      ...current,
                      [field]: Math.max(Number(event.target.value) || 0, 0)
                    }))}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-right font-mono text-sm font-bold text-slate-900 outline-none disabled:text-slate-400"
                  />
                </span>
              </label>
            ))}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <p className="text-xs font-semibold leading-relaxed text-slate-500">
              {tr(
                '新 Finance Deal 会保存当时的佣金百分比，并按最终卖价自动计算金额；已经保存的 Deal 不会因规则更新而被改写。未设置百分比时，旧系统的固定佣金金额会继续生效。',
                'New Finance Deals snapshot this commission rate and calculate the amount from final selling price. Saved deals are not rewritten when rules change. Until a percentage is set, the legacy fixed commission remains in effect.',
                'Finance Deal baharu menyimpan kadar komisen semasa dan mengira jumlah daripada harga jualan akhir. Jualan tersimpan tidak diubah apabila peraturan berubah. Sehingga peratus ditetapkan, komisen tetap lama kekal digunakan.'
              )}
            </p>
          </div>
        </section>
      ) : activeGroup === 'roles' ? (
        <div className="space-y-6">
          <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-100 bg-white p-1 shadow-2xs">
            {([
              ['accounts', tr('角色与账号', 'Roles & Accounts', "Peranan & Akaun"), rolesAccountsIcon],
              ['access', tr('角色访问权限', 'Role Access', "Akses Peranan"), roleAccessIcon],
              ['assignments', tr('任务分配', 'Task Assignment', 'Tugasan Peranan'), taskInboxIcon]
            ] as const).map(([key, label, icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveRoleTab(key);
                  onRoleTabChange?.(key);
                }}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${activeRoleTab === key ? 'bg-red-800 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <img src={icon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
                {label}
              </button>
            ))}
          </section>

          {activeRoleTab === 'accounts' ? (
            <RolesAdmin
              accounts={roleAccounts}
              defaultAvatars={defaultAvatars}
              onCreateFirebaseAuthUser={onCreateFirebaseAuthUser}
              onResetFirebaseAuthPassword={onResetFirebaseAuthPassword}
              onUpdateAccount={onUpdateRoleAccount}
              onDeleteAccount={onDeleteRoleAccount}
              staffWorkload={staffWorkload}
              staffWorkloadCases={staffWorkloadCases}
              onTransferWorkload={onTransferWorkload}
              onTransferWorkloadCase={onTransferWorkloadCase}
              onAddDefaultAvatar={onAddDefaultAvatar}
              onDeleteDefaultAvatar={onDeleteDefaultAvatar}
            />
          ) : activeRoleTab === 'access' ? (
            <RoleAccessControlPage
              settings={roleNavAccess}
              currentStaffName={currentStaffName}
              canManage={canManageTags}
              onUpdate={onUpdateRoleNavAccess}
            />
          ) : (
            <section id="task-assignment-page" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="text-sm font-bold text-slate-900">
                  {tr('任务类型分配', 'Task Type Assignment', 'Tugasan Jenis Kerja')}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {tr(
                    '调整 Sales、Admin 和 Operations 任务的负责角色；指定角色没有 Active 账号时，Super Admin 自动接手。',
                    'Choose the owner role for Sales, Admin, and Operations tasks; Super Admin takes over when that role has no Active account.',
                    'Pilih peranan pemilik tugasan Jualan, Pentadbir dan Operasi; Pentadbir Super mengambil alih jika peranan itu tiada akaun Aktif.'
                  )}
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {Array.from(new Set(TASK_ASSIGNMENT_ITEMS.map((item) => item.group_en))).map((groupName) => {
                  const items = TASK_ASSIGNMENT_ITEMS.filter((item) => item.group_en === groupName);
                  const group = items[0];

                  return (
                    <div key={groupName} className="px-6 py-5">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        {tr(group.group_zh, group.group_en, group.group_ms)}
                      </h4>
                      <div className="space-y-2">
                        {items.map((item) => {
                          const assignedRole = resolveTaskAssignmentRole(item.key, roleNavAccess);
                          const roleOptions: Array<{ value: TaskAssignmentRole; label: string }> = item.allowed_roles.map((role) => ({
                            value: role,
                            label: trRole(role)
                          }));

                          return (
                            <div key={item.key} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 md:grid-cols-[minmax(0,1fr)_minmax(240px,360px)] md:items-center">
                              <span className="text-sm font-semibold text-slate-800">
                                {tr(item.label_zh, item.label_en, item.label_ms)}
                              </span>
                              <ToggleOptionGroup
                                value={assignedRole}
                                options={roleOptions}
                                onChange={(value) => {
                                  const nextRole = value as TaskAssignmentRole;
                                  if (!canManageTags || !item.allowed_roles.includes(nextRole)) return;
                                  onUpdateRoleNavAccess(setTaskAssignmentRole(
                                    roleNavAccess,
                                    item.key,
                                    nextRole,
                                    currentStaffName
                                  ));
                                }}
                                ariaLabel={`${item.label_en} owner role`}
                                disabled={!canManageTags}
                                className="w-full"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="px-6 py-5">
                  <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {tr('按工作负责人自动分配', 'Automatically assigned by work owner', 'Ditugaskan automatik mengikut pemilik kerja')}
                  </h4>
                  <p className="mb-3 text-xs text-slate-500">
                    {tr('这些任务跟随申请、Lead、日历或留言负责人，不在这里改派。', 'These tasks follow the application, lead, calendar, or comment owner.', 'Tugasan ini mengikut pemilik permohonan, prospek, kalendar atau komen.')}
                  </p>
                  <div className="space-y-2">
                    {FIXED_TASK_ASSIGNMENTS.map((item) => (
                      <div key={item.key} className="grid gap-1 rounded-xl border border-slate-100 px-4 py-3 md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
                        <span className="text-sm font-semibold text-slate-700">
                          {tr(item.label_zh, item.label_en, item.label_ms)}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {tr(item.owner_zh, item.owner_en, item.owner_ms)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      ) : activeGroup === 'bank' || activeGroup === 'code' ? (
        <>
        {bankDatabaseTabs}
        {activeGroup === 'bank' && (
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100/70 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{tr('银行数据库', 'Bank Database', "Pangkalan Data Bank")}</h3>
              <p className="mt-1 text-xs text-slate-400">
                {tr('银行名称与图标。', 'Bank names and icons.', "Nama dan ikon bank.")}
              </p>
            </div>
          </div>

          {canManageTags && (
            <div className="grid gap-2 border-b border-slate-100 p-5 md:grid-cols-[minmax(180px,1fr)_180px_auto_auto]">
              <input
                type="text"
                value={newBankName}
                onChange={(event) => setNewBankName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleAddBankDefinition();
                }}
                placeholder="Bank name"
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
              />
              <BankIconUploadButton
                label={tr('上传图标', 'Upload Icon', 'Muat Naik Ikon')}
                busyLabel={tr('读取中…', 'Reading…', 'Membaca…')}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-wait disabled:text-slate-400"
                onSelect={handleNewBankIconChange}
              />
              <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                {newBankIconDataUrl ? (
                  <OptimizedImage
                    src={newBankIconDataUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-300 ring-1 ring-slate-100">
                    <Building2 className="h-3.5 w-3.5" />
                  </span>
                )}
                <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {newBankIconDataUrl ? 'Icon ready' : 'No icon'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleAddBankDefinition();
                }}
                disabled={!newBankName.trim() || isSavingNewBankDefinition}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <Plus className="h-3.5 w-3.5" />
                {isSavingNewBankDefinition ? tr('保存中…', 'Saving…', 'Menyimpan…') : tr('添加', 'Add', 'Tambah')}
              </button>
            </div>
          )}

          {missingBankRows.length > 0 && (
            <div className="border-b border-amber-100 bg-amber-50/40 px-5 py-4">
              <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    {tr('缺少银行资料', 'Missing Bank Information', "Maklumat Bank Hilang")}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {tr('这些银行已出现在贷款申请，但还没加入银行数据库。', 'These banks appear in loan applications but are not in Bank Database yet.', "Bank-bank ini muncul dalam permohonan pinjaman tetapi belum lagi berada dalam Pangkalan Data Bank.")}
                  </p>
                </div>
                <p className="text-[11px] font-bold text-amber-700">
                  {tr(`${missingBankRows.length} 间待补`, `${missingBankRows.length} missing`, `${missingBankRows.length} tiada`)}
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {missingBankRows.map((row) => (
                  <div key={row.name} className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm shadow-amber-100/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <BankIcon bankName={row.name} bankDefinitions={bankDefinitions} size="md" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800" title={row.name}>{row.name}</p>
                          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                            {tr(`${row.applications} 个客户 · ${row.bankApplications} 条银行记录`, `${row.applications} customers · ${row.bankApplications} bank records`, `${row.applications} pelanggan · ${row.bankApplications} rekod bank`)}
                          </p>
                        </div>
                      </div>

                      {canManageTags ? (
                        <button
                          type="button"
                          onClick={() => handleAddMissingBankDefinition(row.name)}
                          className="shrink-0 rounded-lg bg-amber-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-amber-700"
                        >
                          {tr('加入数据库', 'Add', "Tambah")}
                        </button>
                      ) : (
                        <span className="shrink-0 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-400">
                          {tr('待管理员补', 'Admin needed', "Admin diperlukan")}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(row.statusCounts).slice(0, 5).map(([status, count]) => (
                        <span
                          key={status}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${getBankStatusTone(status)}`}
                        >
                          {status} {count}
                        </span>
                      ))}
                    </div>

                    {row.latest && (
                      <p className="mt-2 font-mono text-[10px] text-slate-400">
                        {tr('最新', 'Latest', "Terkini")}: {new Date(row.latest).toLocaleDateString(getAppLocale(), {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full text-left">
              <thead className="border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-6 py-3.5">{tr('图标', 'Icon', "ikon")}</th>
                  <th className="px-6 py-3.5">
                    <SortableHeader sortKey="name" label={tr('银行名称', 'Bank Name', "Nama Bank")} sortState={bankSortState} onSort={handleBankSort} />
                  </th>
                  <th className="px-6 py-3.5">
                    <SortableHeader sortKey="active" label={tr('状态', 'Status', "Status")} sortState={bankSortState} onSort={handleBankSort} defaultDirection="desc" />
                  </th>
                  <th className="px-6 py-3.5">
                    <SortableHeader sortKey="created_at" label={tr('创建时间', 'Created', "Dicipta")} sortState={bankSortState} onSort={handleBankSort} defaultDirection="desc" />
                  </th>
                  <th className="px-6 py-3.5 text-right">{tr('操作', 'Action', "Tindakan")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {bankRows.map((bank) => (
                  <tr key={bank.id} className="hover:bg-indigo-50/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BankIcon bankName={bank.name} bankDefinitions={bankDefinitions} size="md" />
                        {canManageTags && (
                          <BankIconUploadButton
                            label={tr('更换', 'Replace', 'Ganti')}
                            busyLabel={tr('读取中…', 'Reading…', 'Membaca…')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-wait disabled:text-slate-400"
                            onSelect={(file) => handleBankIconChange(bank.id, file)}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DoubleClickEditField
                        value={bank.name}
                        onCommit={(value) => onUpdateBankDefinition(bank.id, { name: value })}
                        disabled={!canManageTags}
                        normalizeValue={(value) => normalizeRelationshipValue(value, bank.name)}
                        displayClassName="block w-full max-w-xs truncate rounded-lg bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                        inputClassName="w-full max-w-xs rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                        ariaLabel={`Edit bank ${bank.name}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <ToggleSwitch
                        checked={bank.active}
                        onChange={(checked) => onUpdateBankDefinition(bank.id, { active: checked })}
                        label={bank.active ? 'Active' : 'Inactive'}
                        disabled={!canManageTags}
                        className={bank.active ? 'bg-emerald-50' : 'bg-slate-50 ring-1 ring-slate-100'}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                      {new Date(bank.created_at).toLocaleDateString(getAppLocale(), {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canManageTags && (
                        <div className="inline-flex items-center gap-1">
                          {bank.icon_data_url && (
                            <button
                              type="button"
                              onClick={() => onUpdateBankDefinition(bank.id, { icon_data_url: '' })}
                              className="inline-flex h-8 items-center justify-center rounded-lg px-2 text-[10px] font-bold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                            >
                              Clear Icon
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteBankDefinition(bank.id)}
                            disabled={bankDefinitions.length <= 1}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Delete ${bank.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {bankRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                      {tr('没有找到银行', 'No banks found', "Tiada bank ditemui")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        )}
        {activeGroup === 'code' && (
        <ErrorCodeAdmin
          definitions={errorCodeDefinitions}
          applications={applications}
          canManageDefinitions={canManageTags}
          onAddDefinition={onAddErrorCodeDefinition}
          onUpdateDefinition={onUpdateErrorCodeDefinition}
          onDeleteDefinition={onDeleteErrorCodeDefinition}
        />
        )}
        </>
      ) : activeGroup === 'brandLogo' ? (
        <>
        {bankDatabaseTabs}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100/70 px-6 py-5">
            <h3 className="text-sm font-bold text-slate-900">{tr('品牌 Logo', 'Brand Logos', "Logo Jenama")}</h3>
            <p className="mt-1 text-xs text-slate-400">
              {tr('上传透明 PNG，Logo 会自动适配浅色与深色模式。', 'Upload a transparent PNG so the logo suits Light and Dark Mode.', "Muat naik PNG lutsinar supaya logo itu sesuai dengan Mod Cerah dan Gelap.")}
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {[...vehicleBrandTags].filter((brand) => brand && brand.trim()).sort((a, b) => a.localeCompare(b)).map((brand) => {
              const logo = getVehicleBrandLogo(vehicleBrandLogos, brand);
              return (
                <div key={brand} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div
                    role={canManageTags ? 'button' : undefined}
                    tabIndex={canManageTags ? 0 : undefined}
                    onClick={() => handleBrandLogoBoxClick(brand)}
                    title={canManageTags ? tr('双击更换，连点四下删除', 'Double-click to replace, quadruple-click to remove', "Klik dua kali untuk menggantikan, klik empat kali untuk mengalih keluar") : brand}
                    className={`flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-100 ${canManageTags ? 'cursor-pointer select-none hover:ring-indigo-200' : ''}`}
                  >
                    {logo ? (
                      <OptimizedImage src={logo} alt={brand} width={80} height={48} className="brand-logo-theme-outline max-h-11 max-w-[76px] object-contain" />
                    ) : (
                      <ImageUp className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800" title={brand}>{brand}</p>
                    {canManageTags ? (
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        {logo ? tr('双击更换 · 连点四下删除', 'Double-click replace · 4× remove', "Klik dua kali ganti · 4× alih keluar") : tr('双击上传', 'Double-click to upload', "Klik dua kali untuk memuat naik")}
                      </p>
                    ) : (
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">{logo ? tr('已设置', 'Set', "Tetapkan") : tr('未设置', 'Not set', "Belum ditetapkan")}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {[...vehicleBrandTags].filter((brand) => brand && brand.trim()).length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-slate-400">{tr('还没有品牌', 'No brands yet', "Tiada jenama lagi")}</p>
            )}
          </div>
          {canManageTags && (
            <input
              ref={brandLogoFileInputRef}
              type="file"
              accept="image/png"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.currentTarget.value = '';
                void openBrandLogoCrop(pendingBrandLogoRef.current, file);
              }}
            />
          )}
        </section>
        </>
      ) : activeGroup === 'info' ? (
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100/70 px-6 py-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{tr('车辆信息', 'Vehicle Info', "Maklumat Kenderaan")}</h3>
              <p className="mt-1 text-xs text-slate-400">
                {tr('价格与贷款方案，月供自动计算。', 'Prices and loan plans; monthly is auto-calculated.', "Harga dan pelan pinjaman; bulanan dikira secara automatik.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPlanColumns((value) => !value)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
              aria-pressed={showPlanColumns}
            >
              {showPlanColumns ? tr('隐藏贷款/月供列', 'Hide plan columns', "Sembunyikan lajur pelan") : tr('显示贷款/月供列', 'Show plan columns', "Tunjukkan lajur rancangan")}
            </button>
          </div>

          <div className="border-b border-slate-100/70 p-5">
            <VehicleCategoryManager
              categories={vehicleCategories}
              currentStaffName={currentStaffName}
              canManage={canManageTags}
              onUpdate={onUpdateVehicleCategories}
            />
          </div>

          {missingVehicleModels.length > 0 && (
            <div className="border-b border-slate-100/70 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">{tr('待补', 'To fill', "Untuk mengisi")}</span>
                <h4 className="text-sm font-bold text-slate-900">{tr('申请里出现、但车辆信息没有的车型', 'Models in applications but missing from Vehicle Info', "Model dalam permohonan tetapi tiada dalam Maklumat Kenderaan")}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingVehicleModels.map((entry) => (
                  <React.Fragment key={`${entry.brand}-${entry.model}`}>
                    <MissingVehicleModelChip
                      model={entry.model}
                      brand={entry.brand}
                      applications={entry.applications}
                      canManage={canManageTags}
                      onAdd={(model) => onAddVehicleCatalogItem({ model, body_type: 'Motorcycle', brand: entry.brand })}
                      onRename={onRenameVehicleModel}
                      applicationList={entry.applicationList}
                      onOpenApplication={onOpenApplication}
                    />
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <VehicleBulkTenure catalog={vehicleCatalog} categories={vehicleCategories} canManage={canManageTags} onUpdate={onUpdateVehicleCatalogItem} />

          {canManageTags && (
            <div className="grid gap-2 border-b border-slate-100 p-5 md:grid-cols-[minmax(220px,1fr)_140px_140px_120px_minmax(220px,1.2fr)_auto]">
              <input
                type="text"
                value={newVehicleModel}
                onChange={(event) => setNewVehicleModel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleAddVehicleRelationship();
                }}
                placeholder="Vehicle name / alias"
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
              />
              <input
                type="number"
                min="0"
                value={newVehicleSellingPrice}
                onChange={(event) => setNewVehicleSellingPrice(event.target.value)}
                placeholder="Cash price"
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
              />
              <input
                type="number"
                min="0"
                value={newVehicleLoanAmount}
                onChange={(event) => setNewVehicleLoanAmount(event.target.value)}
                placeholder="Loan amount"
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
              />
              <input
                type="number"
                min="0"
                value={newVehicleDepositAmount}
                onChange={(event) => setNewVehicleDepositAmount(event.target.value)}
                placeholder="Deposit"
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
              />
              <ToggleOptionGroup
                value={newVehicleFinanceProfile}
                options={financeProfiles.map((profile) => ({ value: profile.id, label: profile.label }))}
                onChange={(value) => setNewVehicleFinanceProfile(value as FinanceProfileId)}
                ariaLabel="New vehicle finance profile"
                className="rounded-lg bg-slate-50 p-1"
              />
              <button
                type="button"
                onClick={handleAddVehicleRelationship}
                disabled={!newVehicleModel.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          )}

          {vehicleDuplicateGroups.length > 0 && (
            <div className="border-b border-slate-100 bg-amber-50/20 p-5">
              <button
                type="button"
                onClick={() => setShowVehicleDuplicateSection((current) => !current)}
                className="flex w-full items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-left ring-1 ring-amber-100 transition-colors hover:bg-amber-50/40"
                aria-expanded={showVehicleDuplicateSection}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <GitBranch className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{tr('重复车型', 'Duplicate Models', "Model Pendua")}</span>
                      <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        {vehicleDuplicateGroups.length} {vehicleDuplicateGroups.length === 1
                          ? tr('组待整理', 'group to tidy', "kumpulan untuk dikemas")
                          : tr('组待整理', 'groups to tidy', "kumpulan untuk dikemas")}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] font-semibold text-slate-400">
                      {tr('选择 Master，一次合并其余重复记录。', 'Select a Master and merge the remaining duplicate records at once.', "Pilih Master dan gabungkan rekod pendua yang lain sekali gus.")}
                    </span>
                  </span>
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-amber-600 transition-transform ${showVehicleDuplicateSection ? '' : '-rotate-90'}`} />
              </button>

              {showVehicleDuplicateSection && (
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {vehicleDuplicateGroups.map((duplicateGroup) => {
                    const groupOpen = expandedDupKey === duplicateGroup.key;
                    const modelNames = Array.from(new Set(duplicateGroup.rows.map((row) => row.model)));
                    const duplicateModelKeys = new Set(duplicateGroup.rows.map((row) => row.model.trim().toLowerCase()));
                    const applicationCount = applications.filter((application) => (
                      duplicateModelKeys.has((application.vehicle_model || '').trim().toLowerCase()) ||
                      (application.vehicle_options || []).some((option) => duplicateModelKeys.has((option.vehicle_model || '').trim().toLowerCase()))
                    )).length;
                    const selectedMasterId = duplicateMasterByGroup[duplicateGroup.key] || '';
                    const selectedMaster = duplicateGroup.rows.find((row) => row.id === selectedMasterId);

                    return (
                      <div key={duplicateGroup.key} className="overflow-hidden rounded-xl bg-white ring-1 ring-amber-100">
                        <button
                          type="button"
                          onClick={() => setExpandedDupKey((current) => current === duplicateGroup.key ? '' : duplicateGroup.key)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-50/40"
                          aria-expanded={groupOpen}
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            {getVehicleBrandLogo(vehicleBrandLogos, duplicateGroup.brand) ? (
                              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center">
                                <OptimizedImage src={getVehicleBrandLogo(vehicleBrandLogos, duplicateGroup.brand)} alt="" width={28} height={28} className="brand-logo-theme-outline h-7 w-7 object-contain" />
                              </span>
                            ) : null}
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-bold text-slate-800" title={modelNames.join(' · ')}>{modelNames.join(' · ')}</span>
                              <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">
                                {duplicateGroup.brand} · {duplicateGroup.rows.length} {tr('条记录', 'records', "rekod")} · {applicationCount} {tr('个申请', 'applications', "permohonan")}
                              </span>
                            </span>
                          </span>
                          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-amber-500 transition-transform ${groupOpen ? '' : '-rotate-90'}`} />
                        </button>
                        {groupOpen && (
                          <div className="border-t border-amber-100 px-3 pb-3 pt-2">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                              {tr('选择一个 Master，然后把其余记录合并进去', 'Select one Master, then merge the remaining records into it', "Pilih satu Master, kemudian gabungkan rekod lain ke dalamnya")}
                            </p>
                            {renderDuplicateVehicleRows(duplicateGroup.rows, duplicateGroup.key)}
                            {canManageTags && (
                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
                                <span className="text-[10px] font-semibold text-slate-500">
                                  {selectedMaster
                                    ? tr(`Master：${selectedMaster.model}`, `Master: ${selectedMaster.model}`, `Master: ${selectedMaster.model}`)
                                    : tr('请先选择 Master', 'Select a Master first', "Pilih Master dahulu")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleMergeDuplicateVehicleGroup(duplicateGroup.key, duplicateGroup.rows)}
                                  disabled={!selectedMaster}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                >
                                  <GitBranch className="h-3.5 w-3.5" />
                                  {tr(`合并其余 ${duplicateGroup.rows.length - 1} 条`, `Merge other ${duplicateGroup.rows.length - 1}`, `Gabung ${duplicateGroup.rows.length - 1} yang lain`)}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-[1140px] w-full text-left">
              <thead className="sticky top-0 z-20 border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-6 py-3.5">
                    <SortableHeader sortKey="model" label={tr('车辆名称', 'Vehicle Name', "Nama Kenderaan")} sortState={vehicleInfoSortState} onSort={handleVehicleInfoSort} />
                  </th>
                  <th className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /><SortableHeader sortKey="selling_price" label={tr('现金价', 'Cash Price', "Harga Tunai")} sortState={vehicleInfoSortState} onSort={handleVehicleInfoSort} defaultDirection="desc" /></span>
                  </th>
                  <th className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /><SortableHeader sortKey="loan_amount" label={tr('贷款额', 'Loan Amount', "Jumlah Pinjaman")} sortState={vehicleInfoSortState} onSort={handleVehicleInfoSort} defaultDirection="desc" /></span>
                  </th>
                  <th className="px-6 py-3.5">
                    <SortableHeader sortKey="deposit_amount" label={tr('订金', 'Deposit', "Deposit")} sortState={vehicleInfoSortState} onSort={handleVehicleInfoSort} defaultDirection="desc" />
                  </th>
                  {showPlanColumns && (
                  <>
                  <th className="px-6 py-3.5">
                    <SortableHeader sortKey="finance_profile" label={tr('贷款方案', 'Loan Plan', "Pelan Pinjaman")} sortState={vehicleInfoSortState} onSort={handleVehicleInfoSort} />
                  </th>
                  <th className="px-6 py-3.5">
                    {tr('月供方案', 'Monthly Plan', "Rancangan Bulanan")}
                  </th>
                  </>
                  )}
                  <th className="px-6 py-3.5">
                    <SortableHeader sortKey="applications" label={tr('申请数', 'Applications', "Permohonan")} sortState={vehicleInfoSortState} onSort={handleVehicleInfoSort} defaultDirection="desc" />
                  </th>
                  <th className="px-6 py-3.5 text-right">{tr('操作', 'Action', "Tindakan")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {vehicleBrandGroups.map(({ brand, rows: brandRows, cleanKeyCounts, cleanKeyGroups, duplicateClusterCount }) => {
                  const isExpanded = vehicleInfoQueryActive || Boolean(expandedVehicleBrands[brand]);

                  return (
                    <React.Fragment key={brand}>
                      <tr
                        className="cursor-pointer select-none bg-slate-50/70 transition-colors hover:bg-slate-100/70"
                        onClick={() => toggleVehicleBrandGroup(brand)}
                      >
                        <td colSpan={vehicleColSpan} className="px-6 py-2.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                            {getVehicleBrandLogo(vehicleBrandLogos, brand) ? (
                              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
                                <OptimizedImage src={getVehicleBrandLogo(vehicleBrandLogos, brand)} alt="" width={24} height={24} className="brand-logo-theme-outline h-6 w-6 object-contain" />
                              </span>
                            ) : null}
                            {brand}
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-400 ring-1 ring-slate-100">
                              {brandRows.length} models
                            </span>
                            {duplicateClusterCount > 0 && (
                              <span
                                className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-100"
                                title={tr('同一车型有多个不同写法的行，建议整理', 'Same model appears with different spellings — consider tidying', "Model yang sama muncul dengan ejaan yang berbeza — pertimbangkan untuk mengemas")}
                              >
                                {duplicateClusterCount} {tr('组同款待整理', 'duplicate groups to tidy', "kumpulan pendua untuk kemas")}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && reduceSeriesRows(brandRows).map(({ row: seriesRow, variants }) => {
                        const seriesKey = (seriesRow.series || seriesRow.model).trim().toLowerCase();
                        const seriesExpanded = vehicleInfoQueryActive || Boolean(expandedVehicleSeries[seriesKey]);
                        const renderRow = (row: VehicleInfoRow, isChild: boolean) => {
                        const dupCleanKey = getVehicleCleanKey(row.model, brand);
                        const dupRows = cleanKeyGroups.get(dupCleanKey) || [];
                        const dupPanelOpen = expandedDupKey === `${brand}::${dupCleanKey}` && dupRows.length > 1;
                        return (
                        <React.Fragment key={row.id}>
                  <tr className={`hover:bg-indigo-50/20 ${isChild ? 'bg-slate-50/40' : ''}`}>
                    <td className={`px-6 py-4 ${isChild ? 'pl-14' : ''}`}>
                      {row.catalogRecord ? (
                        <DoubleClickEditField
                          value={row.model}
                          onCommit={(value) => onUpdateVehicleCatalogItem(row.id, { model: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value, row.model)}
                          displayClassName="block w-full max-w-sm truncate rounded-lg bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-sm rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit vehicle ${row.model}`}
                        />
                      ) : (
                        <p className="truncate text-xs font-bold text-slate-800" title={row.model}>{row.model}</p>
                      )}
                      {(cleanKeyCounts.get(getVehicleCleanKey(row.model, brand)) || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => setExpandedDupKey((current) => (current === `${brand}::${getVehicleCleanKey(row.model, brand)}` ? '' : `${brand}::${getVehicleCleanKey(row.model, brand)}`))}
                          className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600 ring-1 ring-amber-100 transition-colors hover:bg-amber-100"
                          title={tr('点开查看同款各行并可改名统一/删除', 'Open to view duplicate rows, unify names or delete', "Buka untuk melihat baris pendua, menyatukan nama atau memadam")}
                        >
                          {tr('同款', 'Same model', "Model yang sama")} ×{cleanKeyCounts.get(getVehicleCleanKey(row.model, brand))}
                          <ChevronDown className={`h-2.5 w-2.5 transition-transform ${expandedDupKey === `${brand}::${getVehicleCleanKey(row.model, brand)}` ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <DoubleClickEditField
                        type="number"
                        value={row.selling_price}
                        onCommit={(value) => onUpdateVehicleCatalogItem(row.id, { selling_price: normalizeMoneyAmount(value) })}
                        disabled={!canManageTags || !row.catalogRecord}
                        normalizeValue={(value) => String(normalizeMoneyAmount(value))}
                        displayClassName="block w-28 rounded-lg bg-emerald-50 px-3 py-2 text-left font-mono text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                        inputClassName="w-32 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                        formatDisplay={(value) => formatMoney(value)}
                        ariaLabel={`Edit selling price ${row.model}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <DoubleClickEditField
                        type="number"
                        value={row.loan_amount}
                        onCommit={(value) => onUpdateVehicleCatalogItem(row.id, { loan_amount: normalizeMoneyAmount(value) })}
                        disabled={!canManageTags || !row.catalogRecord}
                        normalizeValue={(value) => String(normalizeMoneyAmount(value))}
                        displayClassName="block w-28 rounded-lg bg-amber-50 px-3 py-2 text-left font-mono text-xs font-bold text-amber-700 hover:bg-amber-100"
                        inputClassName="w-32 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                        formatDisplay={(value) => formatMoney(value)}
                        ariaLabel={`Edit loan amount ${row.model}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <DoubleClickEditField
                        type="number"
                        value={row.deposit_amount}
                        onCommit={(value) => onUpdateVehicleCatalogItem(row.id, { deposit_amount: normalizeMoneyAmount(value) })}
                        disabled={!canManageTags || !row.catalogRecord}
                        normalizeValue={(value) => String(normalizeMoneyAmount(value))}
                        displayClassName="block w-24 rounded-lg bg-slate-50 px-3 py-2 text-left font-mono text-xs font-bold text-slate-700 hover:bg-indigo-50"
                        inputClassName="w-28 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                        formatDisplay={(value) => formatMoney(value)}
                        ariaLabel={`Edit deposit ${row.model}`}
                      />
                    </td>
                    {showPlanColumns && (
                    <>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                      <ToggleOptionGroup
                        value={row.category_id || ''}
                        options={[{ value: '', label: tr('未分类', 'Uncategorized', "Tidak dikategorikan") }, ...vehicleCategories.filter((category) => category.active).map((category) => ({ value: category.id, label: category.name }))]}
                        onChange={(value) => onUpdateVehicleCatalogItem(row.id, { category_id: value })}
                        disabled={!canManageTags || !row.catalogRecord}
                        ariaLabel={`Edit vehicle category ${row.model}`}
                        className="max-w-[240px] rounded-lg bg-indigo-50/40 p-1"
                      />
                      <ToggleOptionGroup
                        value={row.finance_profile}
                        options={financeProfiles.map((profile) => ({ value: profile.id, label: profile.label }))}
                        onChange={(value) => onUpdateVehicleCatalogItem(row.id, { finance_profile: value as FinanceProfileId })}
                        disabled={!canManageTags || !row.catalogRecord}
                        ariaLabel={`Edit finance profile ${row.model}`}
                        className="max-w-[240px] rounded-lg bg-slate-50 p-1"
                      />
                      <VehicleModelPriceControls
                        id={row.id}
                        loanAmount={row.loan_amount}
                        depositAmount={row.deposit_amount}
                        priceHistory={row.price_history}
                        maxTenure={row.max_tenure}
                        categoryDefaultTenure={vehicleCategories.find((category) => category.id === row.category_id)?.default_max_tenure}
                        canManage={canManageTags && row.catalogRecord}
                        currentStaffName={currentStaffName}
                        onUpdate={onUpdateVehicleCatalogItem}
                      />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <MonthlyPlanChips row={row} financeProfiles={financeProfiles} categories={vehicleCategories} />
                    </td>
                    </>
                    )}
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{row.applications}</td>
                    <td className="px-6 py-4 text-right">
                      {canManageTags && row.catalogRecord && (
                        <button
                          type="button"
                          onClick={() => onDeleteVehicleCatalogItem(row.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Delete ${row.model}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                  {dupPanelOpen && (
                    <tr className="bg-amber-50/20">
                      <td colSpan={vehicleColSpan} className="px-6 pb-3">
                        <div className="rounded-lg border border-amber-100 bg-white p-3">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">{tr('同款明细 · 双击名称改名统一写法', 'Duplicates · double-click a name to unify spelling', "Pendua · klik dua kali pada nama untuk menyatukan ejaan")}</p>
                          {renderDuplicateVehicleRows(dupRows)}
                        </div>
                      </td>
                    </tr>
                  )}
                        </React.Fragment>
                        );
                        };
                        if (variants.length <= 1) {
                          return <React.Fragment key={seriesKey}>{renderRow(variants[0], false)}</React.Fragment>;
                        }
                        return (
                          <React.Fragment key={seriesKey}>
                            <tr className="cursor-pointer select-none bg-indigo-50/20 transition-colors hover:bg-indigo-50/40" onClick={() => toggleVehicleSeries(seriesKey)}>
                              <td colSpan={vehicleColSpan} className="px-6 py-2.5">
                                <div className="flex items-center gap-2 pl-6 text-xs font-bold text-slate-800">
                                  <ChevronDown className={`h-3.5 w-3.5 text-indigo-400 transition-transform ${seriesExpanded ? '' : '-rotate-90'}`} />
                                  {seriesRow.series || seriesRow.model}
                                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-500 ring-1 ring-indigo-100">
                                    {variants.length} {tr('款', 'variants', "varian")}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {seriesExpanded && variants.map((variant) => renderRow(variant, true))}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {vehicleInfoRows.length === 0 && (
                  <tr>
                    <td colSpan={vehicleColSpan} className="px-6 py-12 text-center text-sm text-slate-400">
                      {tr('没有找到车辆信息', 'No vehicle information found', "Tiada maklumat kenderaan ditemui")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <details className="group border-t border-slate-100 [&>summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer select-none items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{tr('贷款方案公式', 'Loan Plan Formulas', "Formula Pelan Pinjaman")}</h4>
                <p className="mt-1 text-xs text-slate-400">
                  {tr('利息设 0% = 该年限停用。', '0% disables that tenure.', "0% melumpuhkan tempoh tersebut.")}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid gap-3 px-6 pb-5 xl:grid-cols-2">
              {financeProfiles.map((profile) => (
                <div key={profile.id} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="border-b border-slate-100 bg-white px-4 py-3">
                    <p className="text-xs font-bold text-slate-900">{profile.label}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-400">{profile.description}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[420px] w-full text-left">
                      <thead className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-4 py-2">Year</th>
                          <th className="px-4 py-2">Base</th>
                          <th className="px-4 py-2">Interest %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-xs">
                        {FINANCE_PROFILE_YEARS.map((year) => {
                          const term = profile.terms.find((item) => item.years === year);
                          const base = term?.base || getDefaultFinanceBase(profile.id);

                          return (
                            <tr key={year}>
                              <td className="px-4 py-2 font-mono font-bold text-slate-500">{year}Y</td>
                              <td className="px-4 py-2">
                                <ToggleOptionGroup
                                  value={base}
                                  options={[
                                    { value: 'loan', label: 'Loan' },
                                    { value: 'net_loan', label: 'Loan - Deposit' }
                                  ]}
                                  onChange={(value) => onUpdateFinanceProfileTerm(profile.id, year, { base: value as FinanceProfileTerm['base'] })}
                                  disabled={!canManageTags}
                                  ariaLabel={`Edit ${profile.label} ${year}Y base`}
                                  className="rounded-lg bg-slate-50 p-1"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <DoubleClickEditField
                                  type="number"
                                  value={term?.multiplier ? Math.round((term.multiplier - 1) * 10000) / 100 : 0}
                                  onCommit={(value) => {
                                    const percent = normalizeMoneyAmount(value);
                                    onUpdateFinanceProfileTerm(profile.id, year, {
                                      multiplier: percent > 0 ? Math.round((1 + percent / 100) * 10000) / 10000 : 0
                                    });
                                  }}
                                  disabled={!canManageTags}
                                  normalizeValue={(value) => String(normalizeMoneyAmount(value))}
                                  displayClassName="block w-24 rounded-lg bg-emerald-50 px-3 py-2 text-left font-mono text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                                  inputClassName="w-24 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                                  formatDisplay={(value) => {
                                    const percent = normalizeMoneyAmount(value);
                                    return percent > 0 ? `${percent.toLocaleString('en-MY', { maximumFractionDigits: 2 })}%` : 'Off';
                                  }}
                                  ariaLabel={`Edit ${profile.label} ${year}Y interest percent`}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </section>
      ) : (
        <section className="space-y-6">
          <details className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm [&>summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{tr('多层归一化规则', 'Multi-layer Normalisation Rules', "Peraturan Normalisasi Berbilang Lapisan")}</h3>
                <p className="mt-1 text-xs text-slate-400">{tr('原始输入 -> 标准标签 -> 父标签 -> 分类。', 'Raw Input -> Normalized Tag -> Parent Tag -> Category.', "Input Mentah -> Teg Dinormalisasi -> Teg Induk -> Kategori.")}</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {tr('展开', 'Show', "Tunjukkan")}
              </span>
            </summary>

            {canManageTags && (
              <div className="grid gap-2 border-t border-slate-100 p-5 md:grid-cols-[minmax(220px,1.1fr)_minmax(150px,1fr)_minmax(150px,1fr)_150px_150px_auto]">
                <ToggleOptionGroup
                  value={newNormalizationDomain}
                  options={NORMALIZATION_DOMAIN_OPTIONS}
                  onChange={(value) => setNewNormalizationDomain(value as TagNormalizationDomain)}
                  ariaLabel="New normalization domain"
                  className="rounded-lg bg-slate-50 p-1"
                />
                <input
                  type="text"
                  value={newNormalizationRaw}
                  onChange={(event) => setNewNormalizationRaw(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleAddNormalizationRule();
                  }}
                  placeholder="Raw input"
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={newNormalizationTag}
                  onChange={(event) => setNewNormalizationTag(event.target.value)}
                  placeholder="Normalized tag"
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={newNormalizationParent}
                  onChange={(event) => setNewNormalizationParent(event.target.value)}
                  placeholder="Parent tag"
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={newNormalizationCategory}
                  onChange={(event) => setNewNormalizationCategory(event.target.value)}
                  placeholder="Category"
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={handleAddNormalizationRule}
                  disabled={!newNormalizationRaw.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {tr('新增', 'Add', "Tambah")}
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full text-left">
                <thead className="border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="domain" label="Domain" sortState={normalizationRuleSortState} onSort={handleNormalizationRuleSort} />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="raw_value" label="Raw Input" sortState={normalizationRuleSortState} onSort={handleNormalizationRuleSort} />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="normalized_tag" label="Normalized Tag" sortState={normalizationRuleSortState} onSort={handleNormalizationRuleSort} />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="parent_tag" label={tr('父标签', 'Parent Tag', "Tag Ibu Bapa")} sortState={normalizationRuleSortState} onSort={handleNormalizationRuleSort} />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="category" label={tr('分类', 'Category', "kategori")} sortState={normalizationRuleSortState} onSort={handleNormalizationRuleSort} />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="active" label={tr('状态', 'Status', "Status")} sortState={normalizationRuleSortState} onSort={handleNormalizationRuleSort} defaultDirection="desc" />
                    </th>
                    <th className="px-6 py-3.5 text-right">{tr('操作', 'Action', "Tindakan")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {normalizationRuleRows.map((rule) => (
                    <tr key={rule.id} className="hover:bg-indigo-50/20">
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          mode="select"
                          value={rule.domain}
                          options={NORMALIZATION_DOMAIN_OPTIONS}
                          onCommit={(value) => onUpdateTagNormalizationRule(rule.id, { domain: value as TagNormalizationDomain })}
                          disabled={!canManageTags}
                          displayClassName="inline-flex min-w-32 rounded-full bg-slate-100 px-2.5 py-1 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-40 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          formatDisplay={(value) => NORMALIZATION_DOMAIN_OPTIONS.find((option) => option.value === value)?.label || value}
                          ariaLabel={`Edit domain ${rule.raw_value}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={rule.raw_value}
                          onCommit={(value) => onUpdateTagNormalizationRule(rule.id, { raw_value: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value, rule.raw_value)}
                          displayClassName="block w-full max-w-xs truncate rounded-lg bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-xs rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit raw value ${rule.raw_value}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={rule.normalized_tag}
                          onCommit={(value) => onUpdateTagNormalizationRule(rule.id, { normalized_tag: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value, rule.normalized_tag)}
                          displayClassName="block w-full max-w-xs truncate rounded-lg bg-indigo-50 px-3 py-2 text-left text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                          inputClassName="w-full max-w-xs rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit normalized tag ${rule.raw_value}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={rule.parent_tag}
                          onCommit={(value) => onUpdateTagNormalizationRule(rule.id, { parent_tag: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value)}
                          displayClassName="block w-full max-w-xs truncate rounded-full bg-slate-100 px-2.5 py-1 text-left text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-xs rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit parent tag ${rule.raw_value}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={rule.category}
                          onCommit={(value) => onUpdateTagNormalizationRule(rule.id, { category: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value)}
                          displayClassName="block w-full max-w-xs truncate rounded-full bg-emerald-50 px-2.5 py-1 text-left text-[10px] font-bold uppercase tracking-wide text-emerald-700 hover:bg-emerald-100"
                          inputClassName="w-full max-w-xs rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit category ${rule.raw_value}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          mode="select"
                          value={rule.active ? 'active' : 'inactive'}
                          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
                          onCommit={(value) => onUpdateTagNormalizationRule(rule.id, { active: value === 'active' })}
                          disabled={!canManageTags}
                          displayClassName={`inline-flex rounded-full px-2.5 py-1 text-left text-[10px] font-bold uppercase tracking-wide ${rule.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                          inputClassName="w-28 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit active status ${rule.raw_value}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canManageTags && (
                          <button
                            type="button"
                            onClick={() => onDeleteTagNormalizationRule(rule.id)}
                            disabled={tagNormalizationRules.length <= 1}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Delete ${rule.raw_value}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {normalizationRuleRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                        {tr('没有找到归一化规则', 'No normalisation rules found', "Tiada peraturan normalisasi ditemui")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </details>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <details className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm [&>summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tr('社交来源父标签', 'Social Parent Tag', "Tag Ibu Bapa Sosial")}</h3>
                  <p className="mt-1 text-xs text-slate-400">{tr('UTM 来源会归一化到 Social 父标签。', 'UTM sources normalise into the Social parent tag.', "Sumber UTM menjadi normal ke dalam teg induk Sosial.")}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {tr('展开', 'Show', "Tunjukkan")}
                </span>
              </summary>
              <div className="flex flex-wrap gap-2 border-t border-slate-100 p-5">
                {(marketingParentGroups.find((group) => group.label === 'Social Parent Tag')?.children || [])
                  .map((child) => (
                    <span key={child} className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                      {child}
                    </span>
                  ))}
                {!(marketingParentGroups.find((group) => group.label === 'Social Parent Tag')?.children || []).length && (
                  <span className="text-xs text-slate-400">{tr('还没有社交子标签', 'No social child tags yet', "Tiada tag kanak-kanak sosial lagi")}</span>
                )}
              </div>
            </details>

          </div>

          {marketingParentGroups.filter((group) => group.label !== 'Social Parent Tag').length > 0 && (
            <details className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm [&>summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tr('其他父标签', 'Other Parent Tags', "Tag Ibu Bapa yang Lain")}</h3>
                  <p className="mt-1 text-xs text-slate-400">{tr('Search、Offline 等其他来源父组。', 'Other source parent groups such as Search and Offline.', "Kumpulan induk sumber lain seperti Carian dan Luar Talian.")}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {tr('展开', 'Show', "Tunjukkan")}
                </span>
              </summary>
              <div className="grid grid-cols-1 gap-3 border-t border-slate-100 p-5 md:grid-cols-2 xl:grid-cols-3">
                {marketingParentGroups
                  .filter((group) => group.label !== 'Social Parent Tag')
                  .map((group) => (
                    <div key={group.parent} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold text-slate-800">{group.label}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.children.map((child) => (
                          <span key={child} className="inline-flex rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-100">
                            {child}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          )}

          <details className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm [&>summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{tr('车辆归一化关系', 'Vehicle Normalisation Relationships', "Hubungan Normalisasi Kenderaan")}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {tr('车型名称会推算出品牌，例如 Y15ZR -> Yamaha。车型类别固定为 Motorcycle。', 'Vehicle names infer the brand, e.g. Y15ZR -> Yamaha. Body type is always Motorcycle.', "Nama kenderaan membuat kesimpulan jenama, mis. Y15ZR -> Yamaha. Jenis badan sentiasa Motosikal.")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {tr('展开', 'Show', "Tunjukkan")}
              </span>
            </summary>

            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-left">
                <thead className="border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="model" label="Vehicle Name" sortState={vehicleRelationshipSortState} onSort={handleVehicleRelationshipSort} />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="brand" label="Brand" sortState={vehicleRelationshipSortState} onSort={handleVehicleRelationshipSort} />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="applications" label={tr('申请数', 'Applications', "Permohonan")} sortState={vehicleRelationshipSortState} onSort={handleVehicleRelationshipSort} defaultDirection="desc" />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="approved" label={tr('已批核', 'Approved', "Diluluskan")} sortState={vehicleRelationshipSortState} onSort={handleVehicleRelationshipSort} defaultDirection="desc" />
                    </th>
                    <th className="px-6 py-3.5 text-right">{tr('操作', 'Action', "Tindakan")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {vehicleRelationshipRows.map((row) => (
                    <tr key={row.id} className="hover:bg-indigo-50/20">
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={row.model}
                          onCommit={(value) => onUpdateVehicleCatalogItem(row.id, { model: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value, row.model)}
                          displayClassName="block w-full max-w-sm truncate rounded-lg bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-sm rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit vehicle ${row.model}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          mode="select"
                          value={row.brand}
                          options={vehicleBrandTags.map((tag) => ({ value: tag, label: tag }))}
                          onCommit={(value) => onUpdateVehicleCatalogItem(row.id, { brand: value })}
                          disabled={!canManageTags}
                          displayClassName="inline-flex min-w-28 rounded-full bg-slate-100 px-2.5 py-1 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-36 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit vehicle brand ${row.model}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">{row.applications}</td>
                      <td className="px-6 py-4 text-xs font-bold text-emerald-600">{row.approved}</td>
                      <td className="px-6 py-4 text-right">
                        {canManageTags && (
                          <button
                            type="button"
                            onClick={() => onDeleteVehicleCatalogItem(row.id)}
                            disabled={vehicleCatalog.length <= 1}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Delete ${row.model}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {vehicleRelationshipRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                        {tr('没有找到车辆关系', 'No vehicle relationships found', "Tiada hubungan kenderaan ditemui")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </details>

          <details className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm [&>summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{tr('社交 / 来源归一化关系', 'Social / Source Normalisation Relationships', "Hubungan Normalisasi Sosial / Sumber")}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {tr('UTM 来源会归类到父标签，例如 Facebook -> Social。', 'UTM sources map to parent tags, e.g. Facebook -> Social.', "Sumber UTM memetakan kepada teg induk, mis. Facebook -> Sosial.")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {tr('展开', 'Show', "Tunjukkan")}
              </span>
            </summary>

            {canManageTags && (
              <div className="grid gap-2 border-t border-slate-100 p-5 md:grid-cols-[150px_150px_150px_auto]">
                <input
                  type="text"
                  value={newMarketingSource}
                  onChange={(event) => setNewMarketingSource(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleAddMarketingRelationship();
                  }}
                  placeholder="Source"
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={newMarketingMedium}
                  onChange={(event) => setNewMarketingMedium(event.target.value)}
                  placeholder="Parent tag"
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={newMarketingCategory}
                  onChange={(event) => setNewMarketingCategory(event.target.value)}
                  placeholder="Category"
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={handleAddMarketingRelationship}
                  disabled={!newMarketingSource.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-left">
                <thead className="border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="source" label="Source" sortState={marketingRelationshipSortState} onSort={handleMarketingRelationshipSort} />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="medium" label="Parent Tag" sortState={marketingRelationshipSortState} onSort={handleMarketingRelationshipSort} />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="category" label="Category" sortState={marketingRelationshipSortState} onSort={handleMarketingRelationshipSort} />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="links" label={tr('链接', 'Links', "Pautan")} sortState={marketingRelationshipSortState} onSort={handleMarketingRelationshipSort} defaultDirection="desc" />
                    </th>
                    <th className="px-6 py-3.5">
                      <SortableHeader sortKey="clicks" label={tr('点击', 'Clicks', "Klik")} sortState={marketingRelationshipSortState} onSort={handleMarketingRelationshipSort} defaultDirection="desc" />
                    </th>
                    <th className="px-6 py-3.5 text-right">{tr('操作', 'Action', "Tindakan")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {marketingRelationshipRows.map((row) => (
                    <tr key={row.id} className="hover:bg-indigo-50/20">
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={row.source}
                          onCommit={(value) => onUpdateMarketingTagRelationship(row.id, { source: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value, row.source)}
                          displayClassName="block w-full max-w-xs truncate rounded-lg bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-xs rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit source ${row.source}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={row.medium}
                          onCommit={(value) => onUpdateMarketingTagRelationship(row.id, { medium: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value)}
                          displayClassName="block w-full max-w-xs truncate rounded-full bg-indigo-50 px-2.5 py-1 text-left text-[10px] font-bold uppercase tracking-wide text-indigo-600 hover:bg-indigo-100"
                          inputClassName="w-full max-w-xs rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit parent tag ${row.source}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={row.category}
                          onCommit={(value) => onUpdateMarketingTagRelationship(row.id, { category: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value, 'Lead source')}
                          displayClassName="block w-full max-w-xs truncate rounded-full bg-slate-100 px-2.5 py-1 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-xs rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit category ${row.source}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">{row.links}</td>
                      <td className="px-6 py-4 text-xs font-bold text-emerald-600">{row.clicks}</td>
                      <td className="px-6 py-4 text-right">
                        {canManageTags && (
                          <button
                            type="button"
                            onClick={() => onDeleteMarketingTagRelationship(row.id)}
                            disabled={marketingTagRelationships.length <= 1}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Delete ${row.source}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {marketingRelationshipRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                        {tr('没有找到营销关系', 'No marketing relationships found', "Tiada hubungan pemasaran ditemui")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </details>
        </section>
      )}

      {bankIconCropDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-300/40">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{tr('调整银行图标', 'Adjust Bank Icon', "Laraskan Ikon Bank")}</h3>
                <p className="mt-1 text-xs text-slate-400">{tr('保存前裁成正方形，并调整缩放与位置。', 'Crop to square, adjust zoom and position before saving.', "Pangkas ke segi empat sama, laraskan zum dan kedudukan sebelum menyimpan.")}</p>
              </div>
              <button
                type="button"
                onClick={() => setBankIconCropDraft(null)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
              >
                {tr('关闭', 'Close', "Tutup")}
              </button>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-[170px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl ring-1 ring-slate-100" style={{ background: bankIconCropDraft.background }}>
                  <OptimizedImage
                    src={bankIconCropDraft.sourceDataUrl}
                    alt="Bank icon preview"
                    width={144}
                    height={144}
                    loading="eager"
                    className="h-full w-full object-cover"
                    style={{
                      transform: `translate(${bankIconCropDraft.offsetX / 3}px, ${bankIconCropDraft.offsetY / 3}px) scale(${bankIconCropDraft.zoom})`
                    }}
                  />
                </div>
                <p className="text-center text-[10px] font-semibold text-slate-400">{tr('保存输出：128 x 128 PNG', 'Saved output: 128 x 128 PNG', "Output disimpan: 128 x 128 PNG")}</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Zoom', value: bankIconCropDraft.zoom, min: 0.6, max: 2.4, step: 0.05, field: 'zoom' as const },
                  { label: 'Horizontal', value: bankIconCropDraft.offsetX, min: -100, max: 100, step: 1, field: 'offsetX' as const },
                  { label: 'Vertical', value: bankIconCropDraft.offsetY, min: -100, max: 100, step: 1, field: 'offsetY' as const }
                ].map((control) => (
                  <label key={control.field} className="block">
                    <span className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {control.label}
                      <span className="font-mono text-slate-500">{typeof control.value === 'number' ? control.value.toFixed(control.field === 'zoom' ? 2 : 0) : control.value}</span>
                    </span>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={control.value}
                      onChange={(event) => setBankIconCropDraft((current) => current
                        ? { ...current, [control.field]: Number(event.target.value) }
                        : current)}
                      className="w-full accent-emerald-500"
                    />
                  </label>
                ))}

                <div>
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Background</span>
                  <div className="flex flex-wrap gap-2">
                    {BANK_ICON_BACKGROUND_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBankIconCropDraft((current) => current ? { ...current, background: color } : current)}
                        className={`h-8 w-8 rounded-lg ring-2 transition-transform hover:scale-105 ${
                          bankIconCropDraft.background === color ? 'ring-emerald-400' : 'ring-slate-100'
                        }`}
                        style={{ background: color }}
                        aria-label={`Use ${color} background`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
              <button
                type="button"
                onClick={() => setBankIconCropDraft(null)}
                className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-100 transition-colors hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBankIconCrop}
                disabled={isSavingBankIconCrop}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {isSavingBankIconCrop ? 'Saving...' : 'Save Icon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {brandLogoCropDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-300/40">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{tr('调整品牌 Logo', 'Adjust Brand Logo', "Laraskan Logo Jenama")}</h3>
                <p className="mt-1 text-xs text-slate-400">{tr('选择方形或长形，并调整缩放与位置。', 'Pick square or wide, adjust zoom and position.', "Pilih segi empat sama atau lebar, laraskan zum dan kedudukan.")}</p>
              </div>
              <button
                type="button"
                onClick={() => setBrandLogoCropDraft(null)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
              >
                {tr('关闭', 'Close', "Tutup")}
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('形状', 'Shape', "bentuk")}</span>
                <div className="inline-flex rounded-lg bg-slate-100 p-1">
                  {([['square', tr('方形', 'Square', "Segi empat")], ['wide', tr('长形（含名称）', 'Wide (wordmark)', "Lebar (tanda perkataan)")]] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBrandLogoCropDraft((current) => current ? { ...current, shape: value } : current)}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-colors ${brandLogoCropDraft.shape === value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {([['#ffffff', tr('浅色', 'Light', "Cahaya")], ['#111827', tr('深色', 'Dark', "Gelap")]] as const).map(([themeBackground, label]) => (
                  <div key={themeBackground}>
                    <div
                      className="flex items-center justify-center overflow-hidden rounded-2xl ring-1 ring-slate-100"
                      style={{ background: brandLogoCropDraft.background === TRANSPARENT_BRAND_LOGO_BACKGROUND ? themeBackground : brandLogoCropDraft.background, height: 144 }}
                    >
                      <OptimizedImage
                        src={brandLogoCropDraft.sourceDataUrl}
                        alt={`${label} brand logo preview`}
                        width={240}
                        height={144}
                        loading="eager"
                        className={`h-full w-full object-contain ${themeBackground === '#111827' ? 'brand-logo-dark-preview-outline' : ''}`}
                        style={{ transform: `translate(${brandLogoCropDraft.offsetX / 3}px, ${brandLogoCropDraft.offsetY / 3}px) scale(${brandLogoCropDraft.zoom})` }}
                      />
                    </div>
                    <p className="mt-1 text-center text-[10px] font-bold text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-[10px] font-semibold text-slate-400">
                {brandLogoCropDraft.shape === 'wide' ? tr('保存输出：384 x 128 PNG', 'Saved output: 384 x 128 PNG', "Output disimpan: 384 x 128 PNG") : tr('保存输出：256 x 256 PNG', 'Saved output: 256 x 256 PNG', "Output disimpan: 256 x 256 PNG")}
              </p>

              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleRemoveBrandLogoBackground()}
                  disabled={isRemovingBrandLogoBackground}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {isRemovingBrandLogoBackground ? tr('处理中...', 'Removing...', "Mengalih keluar...") : tr('移除背景', 'Remove Background', "Alih Keluar Latar Belakang")}
                </button>
                {brandLogoCropDraft.sourceDataUrl !== brandLogoCropDraft.originalSourceDataUrl && (
                  <button
                    type="button"
                    onClick={() => setBrandLogoCropDraft((current) => current ? { ...current, sourceDataUrl: current.originalSourceDataUrl } : current)}
                    className="rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-slate-500 ring-1 ring-slate-100 transition-colors hover:text-slate-900"
                  >
                    {tr('恢复原图', 'Restore Original', "Pulihkan Asal")}
                  </button>
                )}
              </div>

              {[
                { label: 'Zoom', value: brandLogoCropDraft.zoom, min: 0.5, max: 2.6, step: 0.05, field: 'zoom' as const },
                { label: 'Horizontal', value: brandLogoCropDraft.offsetX, min: -100, max: 100, step: 1, field: 'offsetX' as const },
                { label: 'Vertical', value: brandLogoCropDraft.offsetY, min: -100, max: 100, step: 1, field: 'offsetY' as const }
              ].map((control) => (
                <label key={control.field} className="block">
                  <span className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {control.label}
                    <span className="font-mono text-slate-500">{control.value.toFixed(control.field === 'zoom' ? 2 : 0)}</span>
                  </span>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={control.value}
                    onChange={(event) => setBrandLogoCropDraft((current) => current ? { ...current, [control.field]: Number(event.target.value) } : current)}
                    className="w-full accent-indigo-500"
                  />
                </label>
              ))}

              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Background</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setBrandLogoCropDraft((current) => current ? { ...current, background: TRANSPARENT_BRAND_LOGO_BACKGROUND } : current)}
                    className={`h-8 rounded-lg px-3 text-[10px] font-bold ring-2 transition-transform hover:scale-105 ${brandLogoCropDraft.background === TRANSPARENT_BRAND_LOGO_BACKGROUND ? 'ring-indigo-400' : 'ring-slate-100'}`}
                    style={{ backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px', backgroundSize: '8px 8px' }}
                  >
                    {tr('透明', 'Transparent', "Telus")}
                  </button>
                  {BANK_ICON_BACKGROUND_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBrandLogoCropDraft((current) => current ? { ...current, background: color } : current)}
                      className={`h-8 w-8 rounded-lg ring-2 transition-transform hover:scale-105 ${brandLogoCropDraft.background === color ? 'ring-indigo-400' : 'ring-slate-100'}`}
                      style={{ background: color }}
                      aria-label={`Use ${color} background`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
              <button
                type="button"
                onClick={() => setBrandLogoCropDraft(null)}
                className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-100 transition-colors hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBrandLogoCrop}
                disabled={isSavingBrandLogoCrop}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {isSavingBrandLogoCrop ? 'Saving...' : tr('保存 Logo', 'Save Logo', "Simpan Logo")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
