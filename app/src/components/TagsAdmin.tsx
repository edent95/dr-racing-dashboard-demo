/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Bike, Building2, Check, ChevronDown, Ellipsis, FileX2, GitBranch, ImageUp, KeyRound, Landmark, ListChecks, Plus, Search, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import { AttendancePolicy, BankDefinition, CommissionTierPlan, ErrorCodeDefinition, FinanceProfile, FinanceProfileId, FinanceProfileTerm, LoanApplication, LoanStatus, MarketingTagRelationship, RoleAccount, RoleAccountRole, RoleNavAccessSetting, StaffDefaultAvatar, StaffWorkloadCase, StaffWorkloadSummary, TagNormalizationDomain, TagNormalizationRule, VehicleCategory, VehicleCatalogItem, WhatsAppTrackingClick, WhatsAppTrackingLink } from '../types';
import { resolveTaskAssignmentRole, setTaskAssignmentRole, TASK_ASSIGNMENT_ITEMS, type TaskAssignmentRole } from '../data/roleNavAccess';
import BankIcon from './BankIcon';
import DoubleClickEditField from './DoubleClickEditField';
import ErrorCodeAdmin from './ErrorCodeAdmin';
import RolesAdmin from './RolesAdmin';
import SortableHeader, { compareSortValues, getNextSortState, SortDirection, SortState } from './SortableHeader';
import ToggleOptionGroup from './ToggleOptionGroup';
import { useDebouncedValue } from '../utils/tableUx';
import ToggleSwitch from './ToggleSwitch';
import { isBankShownInLoanTable } from '../utils/loanTableBankColumns';
import { getLenderAutoDebitBanks } from '../utils/aeonAutoDebit';
import { normalizeAutoDebitBanks } from '../utils/settingsListNormalizers';
import { getVehicleSeries } from '../data/vehicleCategories';
import MissingVehicleModelChip from './MissingVehicleModelChip';
import { getAppLocale, tr, trRole } from '../lib/i18n';
import RoleAccessControlPage from './RoleAccessControlPage';
import { useBrandedDialog } from './BrandedDialogProvider';

interface TagsAdminProps {
  applications: LoanApplication[];
  vehicleCatalog: VehicleCatalogItem[];
  vehicleCategories: VehicleCategory[];
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
  onAssignMissingAvatars?: () => Promise<void>;
  pendingRoleAccountUpdates?: Record<string, Partial<RoleAccount>>;
  onDeleteRoleAccount: (id: string) => Promise<void>;
  onUpdateRoleNavAccess: (settings: RoleNavAccessSetting[]) => void;
  staffWorkload: StaffWorkloadSummary[];
  staffWorkloadCases: StaffWorkloadCase[];
  onTransferWorkload: (sourceName: string, targetName: string) => void;
  onTransferWorkloadCase: (sourceName: string, targetName: string, caseType: StaffWorkloadCase['type'], caseId: string) => void;
  attendancePolicy?: AttendancePolicy;
  onAssignStaffShop?: (accountId: string, teamId: string) => boolean;
  /** Super Admin only: other shops an Admin also works in. */
  onAssignExtraShops?: (accountId: string, shopIds: string[]) => Promise<boolean>;
  commissionTierPlans?: CommissionTierPlan[];
  /** Super Admin only: which commission tier plan a staff member follows. */
  onAssignCommissionTierPlan?: (accountId: string, planId: string) => Promise<boolean>;
  onAddVehicleCatalogItem: (item: Pick<VehicleCatalogItem, 'model' | 'body_type'> & Partial<VehicleCatalogItem>) => void;
  onRenameVehicleModel: (oldModel: string, newModel: string) => void;
  onOpenApplication: (application: LoanApplication) => void;
  onUpdateVehicleCatalogItem: (id: string, updates: Partial<VehicleCatalogItem>) => void;
  onMergeVehicleCatalogItems: (masterId: string, duplicateIds: string[]) => void;
  onUpdateVehicleCategories: (next: VehicleCategory[]) => void;
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

export type TagGroup = 'info' | 'bank' | 'code' | 'roles';
export type RoleSettingsTab = 'accounts' | 'access' | 'assignments';
type BankSortKey = 'name' | 'active' | 'created_at';
type VehicleInfoSortKey = 'model' | 'applications';
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


interface VehicleInfoRow {
  id: string;
  model: string;
  brand: string;
  tag: string;
  series: string;
  variant: string;
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

interface MissingVehicleModel {
  model: string;
  brand: string;
  applications: number;
  approved: number;
  applicationList: LoanApplication[];
}

// Models used in loan applications that are NOT yet in the vehicle catalog.
// Surfaced (not auto-created) so Super Admin can add them to the model directory.
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

function buildVehicleInfoRows(applications: LoanApplication[], vehicleCatalog: VehicleCatalogItem[], vehicleBrandTags: string[]): VehicleInfoRow[] {
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
    const brand = item.brand || stats?.brand || 'Other';
    const seriesInfo = getVehicleSeries(item.model, item.series);

    return {
      id: item.id,
      model: item.model.trim() || 'Unknown model',
      brand,
      tag: item.body_type || stats?.tag || 'Motorcycle',
      series: seriesInfo.series,
      variant: seriesInfo.variant,
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load bank icon image'));
    image.src = dataUrl;
  });
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
  onAssignMissingAvatars,
  pendingRoleAccountUpdates,
  onDeleteRoleAccount,
  onUpdateRoleNavAccess,
  staffWorkload,
  staffWorkloadCases,
  onTransferWorkload,
  onTransferWorkloadCase,
  attendancePolicy,
  onAssignStaffShop,
  onAssignExtraShops,
  commissionTierPlans,
  onAssignCommissionTierPlan,
  onAddVehicleCatalogItem,
  onRenameVehicleModel,
  onOpenApplication,
  onUpdateVehicleCatalogItem,
  onMergeVehicleCatalogItems,
  onDeleteVehicleCatalogItem,
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
  onDeleteTagNormalizationRule
}: TagsAdminProps) {
  const { showAlert, showConfirm } = useBrandedDialog();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const [activeGroup, setActiveGroup] = useState<TagGroup>(initialGroup);
  const [activeRoleTab, setActiveRoleTab] = useState<RoleSettingsTab>(initialRoleTab);
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
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newBankIconDataUrl, setNewBankIconDataUrl] = useState('');
  const [isSavingNewBankDefinition, setIsSavingNewBankDefinition] = useState(false);
  const [bankIconCropDraft, setBankIconCropDraft] = useState<BankIconCropDraft | null>(null);
  const [isSavingBankIconCrop, setIsSavingBankIconCrop] = useState(false);
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

  const missingVehicleModels = useMemo(
    () => buildMissingVehicleModels(applications, vehicleCatalog, vehicleBrandTags),
    [applications, vehicleCatalog, vehicleBrandTags]
  );

  const vehicleInfoRows = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const filteredRows = buildVehicleInfoRows(applications, vehicleCatalog, vehicleBrandTags).filter((row) => (
      !query ||
      row.model.toLowerCase().includes(query) ||
      row.brand.toLowerCase().includes(query) ||
      row.tag.toLowerCase().includes(query) ||
      row.plates.some((plate) => plate.toLowerCase().includes(query))
    ));

    const getSortValue = (row: VehicleInfoRow) => {
      return row[vehicleInfoSortState.key];
    };

    return filteredRows.sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), vehicleInfoSortState.direction));
  }, [applications, debouncedSearchTerm, vehicleBrandTags, vehicleCatalog, vehicleInfoSortState]);

  // Vehicle Information groups rows by brand so long catalogs stay scannable.
  // Groups start collapsed; an active search auto-expands matches.
  const [expandedVehicleBrands, setExpandedVehicleBrands] = useState<Record<string, boolean>>({});
  const vehicleInfoQueryActive = debouncedSearchTerm.trim().length > 0;
  const [selectedVariantBySeries, setSelectedVariantBySeries] = useState<Record<string, string>>({});
  const [expandedVehicleSeries, setExpandedVehicleSeries] = useState<Record<string, boolean>>({});
  const [expandedDupKey, setExpandedDupKey] = useState('');
  const [duplicateMasterByGroup, setDuplicateMasterByGroup] = useState<Record<string, string>>({});
  const [showVehicleDuplicateSection, setShowVehicleDuplicateSection] = useState(true);
  const [openVehicleActionId, setOpenVehicleActionId] = useState('');
  const toggleVehicleSeries = (key: string) =>
    setExpandedVehicleSeries((current) => ({ ...current, [key]: !current[key] }));
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
    const rows = buildVehicleRelationshipRows(vehicleCatalog, buildVehicleInfoRows(applications, vehicleCatalog, vehicleBrandTags)).filter((row) => (
      !query ||
      row.model.toLowerCase().includes(query) ||
      row.brand.toLowerCase().includes(query)
    ));

    const getSortValue = (row: VehicleRelationshipRow) => row[vehicleRelationshipSortState.key];

    return rows.sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), vehicleRelationshipSortState.direction));
  }, [applications, debouncedSearchTerm, vehicleBrandTags, vehicleCatalog, vehicleRelationshipSortState]);

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
    defaultDirection: SortDirection = key === 'applications' ? 'desc' : 'asc'
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

  const handleAddVehicleRelationship = () => {
    const model = normalizeRelationshipValue(newVehicleModel, '');
    if (!model) {
      return;
    }

    onAddVehicleCatalogItem({
      model,
      body_type: 'Motorcycle'
    });
    setNewVehicleModel('');
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
    ['info', tr('车辆信息', 'Vehicle Info', "Maklumat Kenderaan"), <Bike key="info" aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />],
    ['bank', tr('银行数据库', 'Bank Database', "Pangkalan Data Bank"), <Landmark key="bank" aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />],
    ['roles', tr('角色与账号', 'Roles & Accounts', "Peranan & Akaun"), <UsersRound key="roles" aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />]
  ] satisfies Array<[TagGroup, string, React.ReactNode]>).filter(([group]) => canAccessGroup(group));

  const bankDatabaseTabs = (
    <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-card border border-slate-100 bg-white p-1 shadow-e1">
      {([
        ['bank', tr('银行', 'Banks', "Bank"), Landmark],
        ['code', tr('拒贷原因代码', 'Reject Reason Codes', "Kod Sebab Penolakan"), FileX2]
      ] as const).map(([key, label, Icon]) => (
        <button
          key={key}
          type="button"
          aria-pressed={activeGroup === key}
          onClick={() => setActiveSettingGroup(key)}
          className={`inline-flex items-center gap-2 rounded-control px-4 py-2 text-footnote font-bold transition-colors ${activeGroup === key ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
        >
          <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
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
        <div key={duplicateRow.id} className={`flex flex-wrap items-center gap-2 rounded-control px-3 py-2 ring-1 ${isMaster ? 'bg-emerald-50 ring-emerald-200' : 'bg-slate-50 ring-slate-100'}`}>
          {groupKey && canManageTags && (
            <button
              type="button"
              onClick={() => setDuplicateMasterByGroup((current) => ({ ...current, [groupKey]: duplicateRow.id }))}
              className={`inline-flex min-w-[88px] items-center justify-center gap-1.5 rounded-control px-2.5 py-1.5 text-micro tracking-normal transition-colors ${isMaster ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200'}`}
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
              displayClassName="min-w-[160px] rounded-control bg-white px-3 py-1.5 text-left text-footnote font-bold text-slate-800 ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
              inputClassName="min-w-[160px] rounded-control border border-transparent bg-white px-3 py-1.5 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50"
              ariaLabel={`Rename ${duplicateRow.model}`}
            />
          ) : (
            <span className="min-w-[160px] text-footnote font-bold text-slate-700">{duplicateRow.model}</span>
          )}
          <span className="text-micro tracking-normal text-slate-400">{tr('申请', 'apps', "permohonan")} {duplicateRow.applications}</span>
          {duplicateRow.catalogRecord && canManageTags && (
            <button
              type="button"
              onClick={() => onDeleteVehicleCatalogItem(duplicateRow.id)}
              className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-control text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
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
          <h2 className="text-title-2 text-slate-900">{tr('设置', 'Setting', "Tetapan")}</h2>
          <p className="max-w-2xl text-footnote font-normal leading-relaxed text-slate-500">
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
            className="w-72 rounded-control border border-slate-100 bg-white py-2 pl-9 pr-4 text-footnote outline-none transition-all focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100"
          />
        </div>
      </section>

      <section
        data-setting-mobile-tabs
        className={`flex max-w-full flex-col gap-2 rounded-card border border-slate-100 bg-white p-1 shadow-e1 md:flex-row md:items-center md:justify-end md:hidden`}
      >
        {/* Desktop navigates via the flat sidebar; the tab row only shows on mobile. */}
        <div className="flex max-w-full items-center gap-1 overflow-x-auto md:hidden">
          {visibleSettingTabs.map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSettingGroup(key)}
              className={`inline-flex items-center gap-2 rounded-control px-4 py-2 text-footnote font-bold transition-all ${
                activeGroup === key
                  ? 'bg-brand text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

      </section>

      {activeGroup === 'roles' ? (
        <div className="space-y-6">
          <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-card border border-slate-100 bg-white p-1 shadow-e1">
            {([
              ['accounts', tr('角色与账号', 'Roles & Accounts', "Peranan & Akaun"), UsersRound],
              ['access', tr('角色访问权限', 'Role Access', "Akses Peranan"), KeyRound],
              ['assignments', tr('任务分配', 'Task Assignment', 'Tugasan Peranan'), ListChecks]
            ] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveRoleTab(key);
                  onRoleTabChange?.(key);
                }}
                className={`inline-flex items-center gap-2 rounded-control px-4 py-2 text-footnote font-bold transition-colors ${activeRoleTab === key ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
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
              onAssignMissingAvatars={onAssignMissingAvatars}
              pendingAccountUpdates={pendingRoleAccountUpdates}
              onDeleteAccount={onDeleteRoleAccount}
              staffWorkload={staffWorkload}
              staffWorkloadCases={staffWorkloadCases}
              onTransferWorkload={onTransferWorkload}
              onTransferWorkloadCase={onTransferWorkloadCase}
              attendancePolicy={attendancePolicy}
              onAssignShop={canManageTags ? onAssignStaffShop : undefined}
              onAssignExtraShops={canManageTags ? onAssignExtraShops : undefined}
              commissionTierPlans={commissionTierPlans}
              onAssignCommissionTierPlan={canManageTags ? onAssignCommissionTierPlan : undefined}
            />
          ) : activeRoleTab === 'access' ? (
            <RoleAccessControlPage
              settings={roleNavAccess}
              currentStaffName={currentStaffName}
              canManage={canManageTags}
              onUpdate={onUpdateRoleNavAccess}
            />
          ) : (
            <section id="task-assignment-page" className="overflow-hidden rounded-panel border border-slate-100 bg-white shadow-e1">
              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="text-headline text-slate-900">
                  {tr('任务类型分配', 'Task Type Assignment', 'Tugasan Jenis Kerja')}
                </h3>
                <p className="mt-1 text-footnote text-slate-500">
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
                      <h4 className="mb-3 text-footnote font-bold uppercase tracking-wider text-slate-400">
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
                            <div key={item.key} className="grid gap-3 rounded-card border border-slate-100 bg-slate-50/60 px-4 py-3 md:grid-cols-[minmax(0,1fr)_minmax(240px,360px)] md:items-center">
                              <span className="text-callout text-slate-800">
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
                  <h4 className="mb-1 text-footnote font-bold uppercase tracking-wider text-slate-400">
                    {tr('按工作负责人自动分配', 'Automatically assigned by work owner', 'Ditugaskan automatik mengikut pemilik kerja')}
                  </h4>
                  <p className="mb-3 text-footnote text-slate-500">
                    {tr('这些任务跟随申请、Lead、日历或留言负责人，不在这里改派。', 'These tasks follow the application, lead, calendar, or comment owner.', 'Tugasan ini mengikut pemilik permohonan, prospek, kalendar atau komen.')}
                  </p>
                  <div className="space-y-2">
                    {FIXED_TASK_ASSIGNMENTS.map((item) => (
                      <div key={item.key} className="grid gap-1 rounded-card border border-slate-100 px-4 py-3 md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
                        <span className="text-callout text-slate-700">
                          {tr(item.label_zh, item.label_en, item.label_ms)}
                        </span>
                        <span className="text-footnote font-bold text-slate-500">
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
        <section className="overflow-hidden rounded-panel border border-slate-100 bg-white shadow-e1">
          <div className="flex flex-col gap-3 border-b border-slate-100/70 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-headline text-slate-900">{tr('银行数据库', 'Bank Database', "Pangkalan Data Bank")}</h3>
              <p className="mt-1 text-footnote text-slate-400">
                {tr('银行名称、图标，以及每间贷款公司能从哪些银行自动扣款。', 'Bank names, icons, and which banks each lender can auto-debit from.', "Nama dan ikon bank, serta bank yang boleh dipotong auto oleh setiap pemberi pinjaman.")}
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
                className="rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
              />
              <BankIconUploadButton
                label={tr('上传图标', 'Upload Icon', 'Muat Naik Ikon')}
                busyLabel={tr('读取中…', 'Reading…', 'Membaca…')}
                className="inline-flex items-center justify-center gap-1.5 rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-caption font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-wait disabled:text-slate-400"
                onSelect={handleNewBankIconChange}
              />
              <div className="flex items-center gap-2 rounded-control border border-slate-100 bg-slate-50 px-3 py-2">
                {newBankIconDataUrl ? (
                  <img
                    src={newBankIconDataUrl}
                    alt=""
                    width={28}
                    height={28}
                    loading="lazy"
                    decoding="async"
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-300 ring-1 ring-slate-100">
                    <Building2 className="h-3.5 w-3.5" />
                  </span>
                )}
                <span className="truncate text-micro uppercase text-slate-400">
                  {newBankIconDataUrl ? 'Icon ready' : 'No icon'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleAddBankDefinition();
                }}
                disabled={!newBankName.trim() || isSavingNewBankDefinition}
                className="inline-flex items-center justify-center gap-1.5 rounded-control bg-indigo-600 px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
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
                  <p className="text-micro uppercase text-amber-600">
                    {tr('缺少银行资料', 'Missing Bank Information', "Maklumat Bank Hilang")}
                  </p>
                  <p className="mt-1 text-footnote font-medium text-slate-500">
                    {tr('这些银行已出现在贷款申请，但还没加入银行数据库。', 'These banks appear in loan applications but are not in Bank Database yet.', "Bank-bank ini muncul dalam permohonan pinjaman tetapi belum lagi berada dalam Pangkalan Data Bank.")}
                  </p>
                </div>
                <p className="text-caption font-semibold text-amber-700">
                  {tr(`${missingBankRows.length} 间待补`, `${missingBankRows.length} missing`, `${missingBankRows.length} tiada`)}
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {missingBankRows.map((row) => (
                  <div key={row.name} className="rounded-card border border-amber-100 bg-white p-3 shadow-e1 shadow-amber-100/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <BankIcon bankName={row.name} bankDefinitions={bankDefinitions} size="md" />
                        <div className="min-w-0">
                          <p className="truncate text-headline text-slate-800" title={row.name}>{row.name}</p>
                          <p className="mt-0.5 text-caption text-slate-400">
                            {tr(`${row.applications} 个客户 · ${row.bankApplications} 条银行记录`, `${row.applications} customers · ${row.bankApplications} bank records`, `${row.applications} pelanggan · ${row.bankApplications} rekod bank`)}
                          </p>
                        </div>
                      </div>

                      {canManageTags ? (
                        <button
                          type="button"
                          onClick={() => handleAddMissingBankDefinition(row.name)}
                          className="shrink-0 rounded-control bg-amber-600 px-2.5 py-1.5 text-micro tracking-normal text-white transition-colors hover:bg-amber-700"
                        >
                          {tr('加入数据库', 'Add', "Tambah")}
                        </button>
                      ) : (
                        <span className="shrink-0 rounded-control bg-slate-50 px-2.5 py-1.5 text-micro tracking-normal text-slate-400">
                          {tr('待管理员补', 'Admin needed', "Admin diperlukan")}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(row.statusCounts).slice(0, 5).map(([status, count]) => (
                        <span
                          key={status}
                          className={`rounded-full px-2 py-0.5 text-micro tracking-normal ring-1 ${getBankStatusTone(status)}`}
                        >
                          {status} {count}
                        </span>
                      ))}
                    </div>

                    {row.latest && (
                      <p className="mt-2 font-mono text-micro tracking-normal text-slate-400">
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
            <table className="min-w-[1040px] w-full text-left">
              <thead className="border-b border-slate-300 bg-slate-200/95 text-micro uppercase text-slate-700">
                <tr>
                  <th className="px-6 py-3.5">{tr('图标', 'Icon', "ikon")}</th>
                  <th className="px-6 py-3.5">
                    <SortableHeader sortKey="name" label={tr('银行名称', 'Bank Name', "Nama Bank")} sortState={bankSortState} onSort={handleBankSort} />
                  </th>
                  <th className="px-6 py-3.5">
                    <SortableHeader sortKey="active" label={tr('状态', 'Status', "Status")} sortState={bankSortState} onSort={handleBankSort} defaultDirection="desc" />
                  </th>
                  <th className="px-6 py-3.5">{tr('贷款申请表格', 'Loan Applications table', 'Jadual Permohonan Pinjaman')}</th>
                  <th className="px-6 py-3.5" title={tr('批准后只能从这些银行的户口扣月供。留空 = 任何银行。', 'Once approved, instalments can only be debited from accounts at these banks. Empty = any bank.', 'Selepas lulus, ansuran hanya boleh dipotong dari akaun di bank ini. Kosong = mana-mana bank.')}>
                    {tr('自动扣款银行', 'Auto-debit banks', 'Bank potongan auto')}
                  </th>
                  <th className="px-6 py-3.5">
                    <SortableHeader sortKey="created_at" label={tr('创建时间', 'Created', "Dicipta")} sortState={bankSortState} onSort={handleBankSort} defaultDirection="desc" />
                  </th>
                  <th className="px-6 py-3.5 text-right">{tr('操作', 'Action', "Tindakan")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-body">
                {bankRows.map((bank) => (
                  <tr key={bank.id} className="hover:bg-indigo-50/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BankIcon bankName={bank.name} bankDefinitions={bankDefinitions} size="md" />
                        {canManageTags && (
                          <BankIconUploadButton
                            label={tr('更换', 'Replace', 'Ganti')}
                            busyLabel={tr('读取中…', 'Reading…', 'Membaca…')}
                            className="inline-flex items-center gap-1.5 rounded-control border border-slate-100 px-2.5 py-1.5 text-micro tracking-normal text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-wait disabled:text-slate-400"
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
                        displayClassName="block w-full max-w-xs truncate rounded-control bg-slate-50 px-3 py-2 text-left text-footnote font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                        inputClassName="w-full max-w-xs rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
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
                    <td className="px-6 py-4" data-testid={`bank-loan-table-toggle-${bank.id}`}>
                      <ToggleSwitch
                        checked={isBankShownInLoanTable(bank)}
                        onChange={(checked) => onUpdateBankDefinition(bank.id, { show_in_loan_table: checked })}
                        label={isBankShownInLoanTable(bank) ? tr('显示', 'Shown', 'Ditunjukkan') : tr('隐藏', 'Hidden', 'Disembunyikan')}
                        disabled={!canManageTags}
                        className={isBankShownInLoanTable(bank) ? 'bg-indigo-50' : 'bg-slate-50 ring-1 ring-slate-100'}
                      />
                    </td>
                    <td className="px-6 py-4" data-testid={`bank-auto-debit-${bank.id}`}>
                      <DoubleClickEditField
                        value={getLenderAutoDebitBanks(bank.name, [bank]).join(', ')}
                        onCommit={(value) => onUpdateBankDefinition(bank.id, { auto_debit_banks: normalizeAutoDebitBanks(value.split(',')) })}
                        disabled={!canManageTags}
                        placeholder="Maybank, CIMB, Public Bank"
                        formatDisplay={(value) => (!value.trim() ? tr('任何银行', 'Any bank', 'Mana-mana bank') : (
                          <span className="flex max-w-xs flex-wrap gap-1">
                            {value.split(',').map((name) => name.trim()).filter(Boolean).map((name) => (
                              <span key={name} className="rounded-full bg-amber-50 px-2 py-0.5 text-micro tracking-normal text-amber-800 ring-1 ring-amber-100">{name}</span>
                            ))}
                          </span>
                        ))}
                        displayClassName="block w-full max-w-xs rounded-control bg-slate-50 px-3 py-2 text-left text-footnote text-slate-500 transition-colors hover:bg-indigo-50"
                        inputClassName="w-full max-w-xs rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                        ariaLabel={`Edit auto-debit banks for ${bank.name}`}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-caption text-slate-400">
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
                              className="inline-flex h-8 items-center justify-center rounded-control px-2 text-micro tracking-normal text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                            >
                              Clear Icon
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteBankDefinition(bank.id)}
                            disabled={bankDefinitions.length <= 1}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-control text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
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
                    <td colSpan={6} className="px-6 py-12 text-center text-body text-slate-400">
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
      ) : activeGroup === 'info' ? (
        <section data-testid="vehicle-model-directory" className="overflow-hidden rounded-panel border border-slate-100 bg-white shadow-e1">
          <div className="border-b border-slate-100/70 px-6 py-5">
            <h3 className="text-headline text-slate-900">{tr('车辆信息', 'Vehicle Info', "Maklumat Kenderaan")}</h3>
            <p className="mt-1 text-footnote text-slate-400">
              {tr(
                '这里只维护车型目录；成交价格、贷款额和订金在首页 / Finance Deal 填写。',
                'This page only maintains the model directory. Enter selling price, loan amount, and deposit on Home / Finance Deal.',
                'Halaman ini hanya menyelenggara direktori model. Masukkan harga jualan, jumlah pinjaman dan deposit di Laman Utama / Finance Deal.'
              )}
            </p>
          </div>

          {missingVehicleModels.length > 0 && (
            <div className="border-b border-slate-100/70 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-chip bg-amber-100 px-1.5 py-0.5 text-micro uppercase text-amber-700">{tr('待补', 'To fill', "Untuk mengisi")}</span>
                <h4 className="text-headline text-slate-900">{tr('申请里出现、但车辆信息没有的车型', 'Models in applications but missing from Vehicle Info', "Model dalam permohonan tetapi tiada dalam Maklumat Kenderaan")}</h4>
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

          {canManageTags && (
            <div className="border-b border-slate-100 p-5">
              <div className="grid max-w-3xl gap-2 md:grid-cols-[minmax(260px,1fr)_auto]">
                <input
                  type="text"
                  value={newVehicleModel}
                  onChange={(event) => setNewVehicleModel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleAddVehicleRelationship();
                  }}
                  placeholder="Vehicle name / alias"
                  className="rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={handleAddVehicleRelationship}
                  disabled={!newVehicleModel.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-control bg-indigo-600 px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </div>
          )}

          {vehicleDuplicateGroups.length > 0 && (
            <div className="border-b border-slate-100 bg-amber-50/20 p-5">
              <button
                type="button"
                onClick={() => setShowVehicleDuplicateSection((current) => !current)}
                className="flex w-full items-center justify-between gap-3 rounded-card bg-white px-4 py-3 text-left ring-1 ring-amber-100 transition-colors hover:bg-amber-50/40"
                aria-expanded={showVehicleDuplicateSection}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-amber-100 text-amber-700">
                    <GitBranch className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-headline text-slate-900">{tr('重复车型', 'Duplicate Models', "Model Pendua")}</span>
                      <span className="rounded-chip bg-amber-100 px-1.5 py-0.5 text-micro uppercase text-amber-700">
                        {vehicleDuplicateGroups.length} {vehicleDuplicateGroups.length === 1
                          ? tr('组待整理', 'group to tidy', "kumpulan untuk dikemas")
                          : tr('组待整理', 'groups to tidy', "kumpulan untuk dikemas")}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-caption text-slate-400">
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
                      <div key={duplicateGroup.key} className="overflow-hidden rounded-card bg-white ring-1 ring-amber-100">
                        <button
                          type="button"
                          onClick={() => setExpandedDupKey((current) => current === duplicateGroup.key ? '' : duplicateGroup.key)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-50/40"
                          aria-expanded={groupOpen}
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span className="min-w-0">
                              <span className="block truncate text-footnote font-bold text-slate-800" title={modelNames.join(' · ')}>{modelNames.join(' · ')}</span>
                              <span className="mt-0.5 block text-caption text-slate-400">
                                {duplicateGroup.brand} · {duplicateGroup.rows.length} {tr('条记录', 'records', "rekod")} · {applicationCount} {tr('个申请', 'applications', "permohonan")}
                              </span>
                            </span>
                          </span>
                          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-amber-500 transition-transform ${groupOpen ? '' : '-rotate-90'}`} />
                        </button>
                        {groupOpen && (
                          <div className="border-t border-amber-100 px-3 pb-3 pt-2">
                            <p className="mb-2 text-micro uppercase text-amber-600">
                              {tr('选择一个 Master，然后把其余记录合并进去', 'Select one Master, then merge the remaining records into it', "Pilih satu Master, kemudian gabungkan rekod lain ke dalamnya")}
                            </p>
                            {renderDuplicateVehicleRows(duplicateGroup.rows, duplicateGroup.key)}
                            {canManageTags && (
                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-control bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
                                <span className="text-caption text-slate-500">
                                  {selectedMaster
                                    ? tr(`Master：${selectedMaster.model}`, `Master: ${selectedMaster.model}`, `Master: ${selectedMaster.model}`)
                                    : tr('请先选择 Master', 'Select a Master first', "Pilih Master dahulu")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleMergeDuplicateVehicleGroup(duplicateGroup.key, duplicateGroup.rows)}
                                  disabled={!selectedMaster}
                                  className="inline-flex items-center gap-1.5 rounded-control bg-emerald-600 px-3 py-2 text-micro tracking-normal text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
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

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3">
              <div>
                <p className="text-footnote font-bold text-slate-800">{tr('车型目录', 'Model Directory', "Direktori Model")}</p>
                <p className="mt-0.5 text-caption text-slate-400">
                  {vehicleInfoRows.length} {tr('个车型', 'models', "model")}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-control bg-white p-1 ring-1 ring-slate-100" aria-label={tr('车型排序', 'Model sorting', "Susunan model")}>
                <button
                  type="button"
                  onClick={() => handleVehicleInfoSort('model')}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-chip px-2.5 text-micro tracking-normal transition-colors ${vehicleInfoSortState.key === 'model' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-700'}`}
                  aria-label={tr('按名称排序车型', 'Sort models by name', "Susun model mengikut nama")}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {tr('名称', 'Name', "Nama")}
                  {vehicleInfoSortState.key === 'model' && (
                    <ChevronDown className={`h-3 w-3 transition-transform ${vehicleInfoSortState.direction === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleVehicleInfoSort('applications', 'desc')}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-chip px-2.5 text-micro tracking-normal transition-colors ${vehicleInfoSortState.key === 'applications' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-700'}`}
                  aria-label={tr('按申请数排序车型', 'Sort models by applications', "Susun model mengikut permohonan")}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {tr('申请数', 'Applications', "Permohonan")}
                  {vehicleInfoSortState.key === 'applications' && (
                    <ChevronDown className={`h-3 w-3 transition-transform ${vehicleInfoSortState.direction === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
              </div>
            </div>

            {vehicleBrandGroups.map(({ brand, rows: brandRows, cleanKeyCounts, cleanKeyGroups, duplicateClusterCount }) => {
              const isExpanded = vehicleInfoQueryActive || Boolean(expandedVehicleBrands[brand]);

              return (
                <section key={brand} className="border-b border-slate-100 last:border-b-0">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 bg-slate-50/40 px-5 py-3 text-left transition-colors hover:bg-slate-100/70"
                    onClick={() => toggleVehicleBrandGroup(brand)}
                    aria-expanded={isExpanded}
                  >
                    <span className="flex min-w-0 flex-wrap items-center gap-2 text-footnote font-bold text-slate-700">
                      <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                      <span>{brand}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-micro tracking-normal text-slate-400 ring-1 ring-slate-100">
                        {brandRows.length} models
                      </span>
                      {duplicateClusterCount > 0 && (
                        <span
                          className="rounded-full bg-amber-50 px-2 py-0.5 text-micro tracking-normal text-amber-600 ring-1 ring-amber-100"
                          title={tr('同一车型有多个不同写法的行，建议整理', 'Same model appears with different spellings — consider tidying', "Model yang sama muncul dengan ejaan yang berbeza — pertimbangkan untuk mengemas")}
                        >
                          {duplicateClusterCount} {tr('组同款待整理', 'duplicate groups to tidy', "kumpulan pendua untuk kemas")}
                        </span>
                      )}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                      {reduceSeriesRows(brandRows).map(({ row: seriesRow, variants }) => {
                        const seriesKey = (seriesRow.series || seriesRow.model).trim().toLowerCase();
                        const seriesExpanded = vehicleInfoQueryActive || Boolean(expandedVehicleSeries[seriesKey]);
                        const renderModelCard = (row: VehicleInfoRow, isChild: boolean) => {
                          const dupCleanKey = getVehicleCleanKey(row.model, brand);
                          const dupRows = cleanKeyGroups.get(dupCleanKey) || [];
                          const dupPanelOpen = expandedDupKey === `${brand}::${dupCleanKey}` && dupRows.length > 1;
                          const actionMenuOpen = openVehicleActionId === row.id;

                          return (
                            <article
                              key={row.id}
                              className={`bg-white transition-colors hover:bg-slate-50 ${isChild ? 'bg-slate-50/40' : ''}`}
                            >
                              <div className={`flex min-h-11 items-center gap-2 py-1.5 pr-3 ${isChild ? 'pl-10' : 'pl-5'}`}>
                                <div className="min-w-0 flex-1">
                                  {row.catalogRecord ? (
                                    <DoubleClickEditField
                                      value={row.model}
                                      onCommit={(value) => onUpdateVehicleCatalogItem(row.id, { model: value })}
                                      disabled={!canManageTags}
                                      normalizeValue={(value) => normalizeRelationshipValue(value, row.model)}
                                      displayClassName="block w-full truncate rounded-chip px-2 py-1.5 text-left text-footnote font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                      inputClassName="w-full rounded-chip border border-transparent bg-slate-50 px-2 py-1.5 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                                      ariaLabel={`Edit vehicle ${row.model}`}
                                    />
                                  ) : (
                                    <p className="truncate px-2 text-footnote font-bold text-slate-800" title={row.model}>{row.model}</p>
                                  )}
                                  {(cleanKeyCounts.get(dupCleanKey) || 0) > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedDupKey((current) => (current === `${brand}::${dupCleanKey}` ? '' : `${brand}::${dupCleanKey}`))}
                                      className="ml-2 mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-micro tracking-normal text-amber-600 ring-1 ring-amber-100 transition-colors hover:bg-amber-100"
                                      title={tr('点开查看同款各行并可改名统一/删除', 'Open to view duplicate rows, unify names or delete', "Buka untuk melihat baris pendua, menyatukan nama atau memadam")}
                                    >
                                      {tr('同款', 'Same model', "Model yang sama")} ×{cleanKeyCounts.get(dupCleanKey)}
                                      <ChevronDown className={`h-2.5 w-2.5 transition-transform ${dupPanelOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                  )}
                                </div>

                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-micro tracking-normal text-slate-500 ring-1 ring-slate-100" aria-label={`${row.applications} applications`}>
                                  <span className="font-mono text-slate-700">{row.applications}</span>
                                  {tr('申请', 'apps', "permohonan")}
                                </span>

                                {canManageTags && row.catalogRecord && (
                                  <div
                                    className="relative shrink-0"
                                    onBlur={(event) => {
                                      if (!event.currentTarget.contains(event.relatedTarget)) {
                                        setOpenVehicleActionId('');
                                      }
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setOpenVehicleActionId((current) => current === row.id ? '' : row.id)}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-control text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                                      aria-label={tr(`打开 ${row.model} 操作`, `Open actions for ${row.model}`, `Buka tindakan untuk ${row.model}`)}
                                      aria-haspopup="menu"
                                      aria-expanded={actionMenuOpen}
                                    >
                                      <Ellipsis className="h-4 w-4" />
                                    </button>
                                    {actionMenuOpen && (
                                      <div role="menu" className="absolute right-0 top-9 z-30 w-36 rounded-control border border-slate-100 bg-white p-1 shadow-e2">
                                        <button
                                          type="button"
                                          role="menuitem"
                                          onClick={() => {
                                            setOpenVehicleActionId('');
                                            onDeleteVehicleCatalogItem(row.id);
                                          }}
                                          className="flex w-full items-center gap-2 rounded-chip px-2.5 py-2 text-left text-micro tracking-normal text-rose-600 transition-colors hover:bg-rose-50"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          {tr('删除车型', 'Delete model', "Padam model")}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {dupPanelOpen && (
                                <div className="border-t border-amber-100 bg-amber-50/20 py-3 pl-5 pr-3">
                                  <p className="mb-2 text-micro uppercase text-amber-600">
                                    {tr('同款明细 · 双击名称改名统一写法', 'Duplicates · double-click a name to unify spelling', "Pendua · klik dua kali pada nama untuk menyatukan ejaan")}
                                  </p>
                                  {renderDuplicateVehicleRows(dupRows)}
                                </div>
                              )}
                            </article>
                          );
                        };

                        if (variants.length <= 1) {
                          return renderModelCard(variants[0], false);
                        }

                        return (
                          <div key={seriesKey} className="bg-indigo-50/20">
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 py-2.5 pl-5 pr-3 text-left text-footnote font-bold text-slate-800 transition-colors hover:bg-indigo-50/50"
                              onClick={() => toggleVehicleSeries(seriesKey)}
                              aria-expanded={seriesExpanded}
                            >
                              <ChevronDown className={`h-3.5 w-3.5 text-indigo-400 transition-transform ${seriesExpanded ? '' : '-rotate-90'}`} />
                              {seriesRow.series || seriesRow.model}
                              <span className="rounded-full bg-white px-2 py-0.5 text-micro tracking-normal text-indigo-500 ring-1 ring-indigo-100">
                                {variants.length} {tr('款', 'variants', "varian")}
                              </span>
                            </button>
                            {seriesExpanded && (
                              <div className="divide-y divide-slate-100 border-t border-indigo-100/70">
                                {variants.map((variant) => renderModelCard(variant, true))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}

            {vehicleInfoRows.length === 0 && (
              <div className="px-6 py-12 text-center text-body text-slate-400">
                {tr('没有找到车辆信息', 'No vehicle information found', "Tiada maklumat kenderaan ditemui")}
              </div>
            )}
          </div>

        </section>
      ) : (
        <section className="space-y-6">
          <details className="overflow-hidden rounded-panel border border-slate-100 bg-white shadow-e1 [&>summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
              <div>
                <h3 className="text-headline text-slate-900">{tr('多层归一化规则', 'Multi-layer Normalisation Rules', "Peraturan Normalisasi Berbilang Lapisan")}</h3>
                <p className="mt-1 text-footnote text-slate-400">{tr('原始输入 -> 标准标签 -> 父标签 -> 分类。', 'Raw Input -> Normalized Tag -> Parent Tag -> Category.', "Input Mentah -> Teg Dinormalisasi -> Teg Induk -> Kategori.")}</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-micro uppercase text-slate-500">
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
                  className="rounded-control bg-slate-50 p-1"
                />
                <input
                  type="text"
                  value={newNormalizationRaw}
                  onChange={(event) => setNewNormalizationRaw(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleAddNormalizationRule();
                  }}
                  placeholder="Raw input"
                  className="rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={newNormalizationTag}
                  onChange={(event) => setNewNormalizationTag(event.target.value)}
                  placeholder="Normalized tag"
                  className="rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={newNormalizationParent}
                  onChange={(event) => setNewNormalizationParent(event.target.value)}
                  placeholder="Parent tag"
                  className="rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={newNormalizationCategory}
                  onChange={(event) => setNewNormalizationCategory(event.target.value)}
                  placeholder="Category"
                  className="rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={handleAddNormalizationRule}
                  disabled={!newNormalizationRaw.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-control bg-indigo-600 px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {tr('新增', 'Add', "Tambah")}
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full text-left">
                <thead className="border-b border-slate-300 bg-slate-200/95 text-micro uppercase text-slate-700">
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
                <tbody className="divide-y divide-slate-50 text-body">
                  {normalizationRuleRows.map((rule) => (
                    <tr key={rule.id} className="hover:bg-indigo-50/20">
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          mode="select"
                          value={rule.domain}
                          options={NORMALIZATION_DOMAIN_OPTIONS}
                          onCommit={(value) => onUpdateTagNormalizationRule(rule.id, { domain: value as TagNormalizationDomain })}
                          disabled={!canManageTags}
                          displayClassName="inline-flex min-w-32 rounded-full bg-slate-100 px-2.5 py-1 text-left text-micro uppercase text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-40 rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
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
                          displayClassName="block w-full max-w-xs truncate rounded-control bg-slate-50 px-3 py-2 text-left text-footnote font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-xs rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit raw value ${rule.raw_value}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={rule.normalized_tag}
                          onCommit={(value) => onUpdateTagNormalizationRule(rule.id, { normalized_tag: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value, rule.normalized_tag)}
                          displayClassName="block w-full max-w-xs truncate rounded-control bg-indigo-50 px-3 py-2 text-left text-footnote font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                          inputClassName="w-full max-w-xs rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit normalized tag ${rule.raw_value}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={rule.parent_tag}
                          onCommit={(value) => onUpdateTagNormalizationRule(rule.id, { parent_tag: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value)}
                          displayClassName="block w-full max-w-xs truncate rounded-full bg-slate-100 px-2.5 py-1 text-left text-micro uppercase text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-xs rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit parent tag ${rule.raw_value}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={rule.category}
                          onCommit={(value) => onUpdateTagNormalizationRule(rule.id, { category: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value)}
                          displayClassName="block w-full max-w-xs truncate rounded-full bg-emerald-50 px-2.5 py-1 text-left text-micro uppercase text-emerald-700 hover:bg-emerald-100"
                          inputClassName="w-full max-w-xs rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
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
                          displayClassName={`inline-flex rounded-full px-2.5 py-1 text-left text-micro uppercase ${rule.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                          inputClassName="w-28 rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit active status ${rule.raw_value}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canManageTags && (
                          <button
                            type="button"
                            onClick={() => onDeleteTagNormalizationRule(rule.id)}
                            disabled={tagNormalizationRules.length <= 1}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-control text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
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
                      <td colSpan={7} className="px-6 py-12 text-center text-body text-slate-400">
                        {tr('没有找到归一化规则', 'No normalisation rules found', "Tiada peraturan normalisasi ditemui")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </details>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <details className="overflow-hidden rounded-panel border border-slate-100 bg-white shadow-e1 [&>summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
                <div>
                  <h3 className="text-headline text-slate-900">{tr('社交来源父标签', 'Social Parent Tag', "Tag Ibu Bapa Sosial")}</h3>
                  <p className="mt-1 text-footnote text-slate-400">{tr('UTM 来源会归一化到 Social 父标签。', 'UTM sources normalise into the Social parent tag.', "Sumber UTM menjadi normal ke dalam teg induk Sosial.")}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-micro uppercase text-slate-500">
                  {tr('展开', 'Show', "Tunjukkan")}
                </span>
              </summary>
              <div className="flex flex-wrap gap-2 border-t border-slate-100 p-5">
                {(marketingParentGroups.find((group) => group.label === 'Social Parent Tag')?.children || [])
                  .map((child) => (
                    <span key={child} className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-micro uppercase text-indigo-600">
                      {child}
                    </span>
                  ))}
                {!(marketingParentGroups.find((group) => group.label === 'Social Parent Tag')?.children || []).length && (
                  <span className="text-footnote text-slate-400">{tr('还没有社交子标签', 'No social child tags yet', "Tiada tag kanak-kanak sosial lagi")}</span>
                )}
              </div>
            </details>

          </div>

          {marketingParentGroups.filter((group) => group.label !== 'Social Parent Tag').length > 0 && (
            <details className="overflow-hidden rounded-panel border border-slate-100 bg-white shadow-e1 [&>summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
                <div>
                  <h3 className="text-headline text-slate-900">{tr('其他父标签', 'Other Parent Tags', "Tag Ibu Bapa yang Lain")}</h3>
                  <p className="mt-1 text-footnote text-slate-400">{tr('Search、Offline 等其他来源父组。', 'Other source parent groups such as Search and Offline.', "Kumpulan induk sumber lain seperti Carian dan Luar Talian.")}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-micro uppercase text-slate-500">
                  {tr('展开', 'Show', "Tunjukkan")}
                </span>
              </summary>
              <div className="grid grid-cols-1 gap-3 border-t border-slate-100 p-5 md:grid-cols-2 xl:grid-cols-3">
                {marketingParentGroups
                  .filter((group) => group.label !== 'Social Parent Tag')
                  .map((group) => (
                    <div key={group.parent} className="rounded-card border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-footnote font-bold text-slate-800">{group.label}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.children.map((child) => (
                          <span key={child} className="inline-flex rounded-full bg-white px-2 py-0.5 text-micro uppercase text-slate-500 ring-1 ring-slate-100">
                            {child}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          )}

          <details className="overflow-hidden rounded-panel border border-slate-100 bg-white shadow-e1 [&>summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
              <div>
                <h3 className="text-headline text-slate-900">{tr('车辆归一化关系', 'Vehicle Normalisation Relationships', "Hubungan Normalisasi Kenderaan")}</h3>
                <p className="mt-1 text-footnote text-slate-400">
                  {tr('车型名称会推算出品牌，例如 Y15ZR -> Yamaha。车型类别固定为 Motorcycle。', 'Vehicle names infer the brand, e.g. Y15ZR -> Yamaha. Body type is always Motorcycle.', "Nama kenderaan membuat kesimpulan jenama, mis. Y15ZR -> Yamaha. Jenis badan sentiasa Motosikal.")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-micro uppercase text-slate-500">
                {tr('展开', 'Show', "Tunjukkan")}
              </span>
            </summary>

            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-left">
                <thead className="border-b border-slate-300 bg-slate-200/95 text-micro uppercase text-slate-700">
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
                <tbody className="divide-y divide-slate-50 text-body">
                  {vehicleRelationshipRows.map((row) => (
                    <tr key={row.id} className="hover:bg-indigo-50/20">
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={row.model}
                          onCommit={(value) => onUpdateVehicleCatalogItem(row.id, { model: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value, row.model)}
                          displayClassName="block w-full max-w-sm truncate rounded-control bg-slate-50 px-3 py-2 text-left text-footnote font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-sm rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
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
                          displayClassName="inline-flex min-w-28 rounded-full bg-slate-100 px-2.5 py-1 text-left text-micro uppercase text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-36 rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit vehicle brand ${row.model}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-footnote font-bold text-slate-700">{row.applications}</td>
                      <td className="px-6 py-4 text-footnote font-bold text-emerald-600">{row.approved}</td>
                      <td className="px-6 py-4 text-right">
                        {canManageTags && (
                          <button
                            type="button"
                            onClick={() => onDeleteVehicleCatalogItem(row.id)}
                            disabled={vehicleCatalog.length <= 1}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-control text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
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
                      <td colSpan={5} className="px-6 py-12 text-center text-body text-slate-400">
                        {tr('没有找到车辆关系', 'No vehicle relationships found', "Tiada hubungan kenderaan ditemui")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </details>

          <details className="overflow-hidden rounded-panel border border-slate-100 bg-white shadow-e1 [&>summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
              <div>
                <h3 className="text-headline text-slate-900">{tr('社交 / 来源归一化关系', 'Social / Source Normalisation Relationships', "Hubungan Normalisasi Sosial / Sumber")}</h3>
                <p className="mt-1 text-footnote text-slate-400">
                  {tr('UTM 来源会归类到父标签，例如 Facebook -> Social。', 'UTM sources map to parent tags, e.g. Facebook -> Social.', "Sumber UTM memetakan kepada teg induk, mis. Facebook -> Sosial.")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-micro uppercase text-slate-500">
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
                  className="rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={newMarketingMedium}
                  onChange={(event) => setNewMarketingMedium(event.target.value)}
                  placeholder="Parent tag"
                  className="rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={newMarketingCategory}
                  onChange={(event) => setNewMarketingCategory(event.target.value)}
                  placeholder="Category"
                  className="rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={handleAddMarketingRelationship}
                  disabled={!newMarketingSource.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-control bg-indigo-600 px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-left">
                <thead className="border-b border-slate-300 bg-slate-200/95 text-micro uppercase text-slate-700">
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
                <tbody className="divide-y divide-slate-50 text-body">
                  {marketingRelationshipRows.map((row) => (
                    <tr key={row.id} className="hover:bg-indigo-50/20">
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={row.source}
                          onCommit={(value) => onUpdateMarketingTagRelationship(row.id, { source: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value, row.source)}
                          displayClassName="block w-full max-w-xs truncate rounded-control bg-slate-50 px-3 py-2 text-left text-footnote font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-xs rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit source ${row.source}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={row.medium}
                          onCommit={(value) => onUpdateMarketingTagRelationship(row.id, { medium: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value)}
                          displayClassName="block w-full max-w-xs truncate rounded-full bg-indigo-50 px-2.5 py-1 text-left text-micro uppercase text-indigo-600 hover:bg-indigo-100"
                          inputClassName="w-full max-w-xs rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit parent tag ${row.source}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DoubleClickEditField
                          value={row.category}
                          onCommit={(value) => onUpdateMarketingTagRelationship(row.id, { category: value })}
                          disabled={!canManageTags}
                          normalizeValue={(value) => normalizeRelationshipValue(value, 'Lead source')}
                          displayClassName="block w-full max-w-xs truncate rounded-full bg-slate-100 px-2.5 py-1 text-left text-micro uppercase text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full max-w-xs rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Edit category ${row.source}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-footnote font-bold text-slate-700">{row.links}</td>
                      <td className="px-6 py-4 text-footnote font-bold text-emerald-600">{row.clicks}</td>
                      <td className="px-6 py-4 text-right">
                        {canManageTags && (
                          <button
                            type="button"
                            onClick={() => onDeleteMarketingTagRelationship(row.id)}
                            disabled={marketingTagRelationships.length <= 1}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-control text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
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
                      <td colSpan={6} className="px-6 py-12 text-center text-body text-slate-400">
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
          <div className="w-full max-w-lg overflow-hidden rounded-panel border border-slate-100 bg-white shadow-e3 shadow-slate-300/40">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-headline text-slate-900">{tr('调整银行图标', 'Adjust Bank Icon', "Laraskan Ikon Bank")}</h3>
                <p className="mt-1 text-footnote text-slate-400">{tr('保存前裁成正方形，并调整缩放与位置。', 'Crop to square, adjust zoom and position before saving.', "Pangkas ke segi empat sama, laraskan zum dan kedudukan sebelum menyimpan.")}</p>
              </div>
              <button
                type="button"
                onClick={() => setBankIconCropDraft(null)}
                className="rounded-control px-2 py-1 text-footnote font-bold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
              >
                {tr('关闭', 'Close', "Tutup")}
              </button>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-[170px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-panel ring-1 ring-slate-100" style={{ background: bankIconCropDraft.background }}>
                  <img
                    src={bankIconCropDraft.sourceDataUrl}
                    alt="Bank icon preview"
                    width={144}
                    height={144}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover"
                    style={{
                      transform: `translate(${bankIconCropDraft.offsetX / 3}px, ${bankIconCropDraft.offsetY / 3}px) scale(${bankIconCropDraft.zoom})`
                    }}
                  />
                </div>
                <p className="text-center text-caption text-slate-400">{tr('保存输出：128 x 128 PNG', 'Saved output: 128 x 128 PNG', "Output disimpan: 128 x 128 PNG")}</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Zoom', value: bankIconCropDraft.zoom, min: 0.6, max: 2.4, step: 0.05, field: 'zoom' as const },
                  { label: 'Horizontal', value: bankIconCropDraft.offsetX, min: -100, max: 100, step: 1, field: 'offsetX' as const },
                  { label: 'Vertical', value: bankIconCropDraft.offsetY, min: -100, max: 100, step: 1, field: 'offsetY' as const }
                ].map((control) => (
                  <label key={control.field} className="block">
                    <span className="mb-1 flex items-center justify-between text-micro uppercase text-slate-400">
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
                  <span className="mb-2 block text-micro uppercase text-slate-400">Background</span>
                  <div className="flex flex-wrap gap-2">
                    {BANK_ICON_BACKGROUND_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBankIconCropDraft((current) => current ? { ...current, background: color } : current)}
                        className={`h-8 w-8 rounded-control ring-2 transition-transform hover:scale-105 ${
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
                className="rounded-control bg-white px-4 py-2 text-footnote font-bold text-slate-500 ring-1 ring-slate-100 transition-colors hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBankIconCrop}
                disabled={isSavingBankIconCrop}
                className="rounded-control bg-emerald-600 px-4 py-2 text-footnote font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {isSavingBankIconCrop ? 'Saving...' : 'Save Icon'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
