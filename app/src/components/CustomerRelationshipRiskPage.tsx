/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Archive, ArchiveRestore, ArrowUpRight, CheckCircle2, Clock3, EyeOff, Link2, MessageSquare, Search, ShieldAlert, Trash2, Users } from 'lucide-react';
import type { CustomerRawMatch, CustomerRiskField, LoanApplication, RawCustomerLead, RoleAccount } from '../types';
import { getAppLocale, tr } from '../lib/i18n';
import {
  createEmptyRelationshipMeta,
  loadRelationshipMetaResult,
  saveRelationshipMeta,
  type RelationshipCaseState,
  type RelationshipCaseStatus,
  type RelationshipComment,
  type RelationshipMeta,
  type RelationshipResolution
} from '../services/relationshipMetaStorage';
import { createRawLeadImportFingerprint } from '../utils/rawLeadImportExclusions';
import { normalizeMalaysiaPhoneNationalDigits } from '../utils/malaysiaPhone';
import StaffAvatar from './StaffAvatar';
import ToggleOptionGroup from './ToggleOptionGroup';

type RiskKind = 'application_duplicate' | 'lead_duplicate' | 'lead_application_match';
type RiskSeverity = 'high' | 'warning' | 'relationship';

interface RiskPerson {
  id: string;
  name: string;
  phone: string;
  source: 'application' | 'lead';
  sourceLabel: string;
  handler: string;
  date?: string;
  application?: LoanApplication;
  lead?: RawCustomerLead;
  privateOwner?: string;
}

interface RiskEvidence {
  id: string;
  kind: RiskKind;
  severity: RiskSeverity;
  field: CustomerRiskField;
  value: string;
  people: RiskPerson[];
}

interface RelationshipCase {
  id: string;
  kind: RiskKind;
  severity: RiskSeverity;
  people: RiskPerson[];
  matches: Array<{ field: CustomerRiskField; value: string }>;
  legacyAlertIds: string[];
  createdAt: string;
}

interface CaseView {
  item: RelationshipCase;
  state: RelationshipCaseState;
  comments: RelationshipComment[];
}

interface CustomerRelationshipRiskPageProps {
  applications: LoanApplication[];
  rawCustomerLeads: RawCustomerLead[];
  rawCustomerMatches: CustomerRawMatch[];
  roleAccounts: RoleAccount[];
  currentStaffName: string;
  currentStaffRole: RoleAccount['role'];
  onOpenApplication: (application: LoanApplication) => void;
  onOpenLeadPool: () => void;
  onDeleteLead: (lead: RawCustomerLead) => boolean;
  onActiveIssueCountChange?: (count: number) => void;
}

const FIELD_LABELS: Record<CustomerRiskField, [string, string, string]> = {
  ic_no: ['身份证号码', 'IC Number', 'Nombor IC'],
  phone_no: ['电话号码', 'Phone Number', 'Nombor Telefon'],
  account_number: ['银行户口', 'Bank Account', 'Akaun Bank'],
  email: ['电邮', 'Email', 'E-mel']
};

const KIND_LABELS: Record<RiskKind, [string, string, string]> = {
  application_duplicate: ['贷款申请重复', 'Duplicate Applications', 'Permohonan Pendua'],
  lead_duplicate: ['潜在客户重复', 'Duplicate Leads', 'Prospek Pendua'],
  lead_application_match: ['名单与申请关系', 'Lead–Application Link', 'Hubungan Prospek–Permohonan']
};

const STATUS_LABELS: Record<RelationshipCaseStatus, [string, string, string]> = {
  new: ['待处理', 'Pending', 'Belum Diproses'],
  investigating: ['调查中', 'Investigating', 'Dalam Siasatan'],
  closed: ['已结案', 'Closed', 'Ditutup'],
  hidden: ['已隐藏', 'Hidden', 'Tersembunyi']
};

const RESOLUTION_LABELS: Record<RelationshipResolution, [string, string, string]> = {
  confirmed_duplicate: ['确认重复客户', 'Confirmed duplicate customer', 'Pelanggan pendua disahkan'],
  same_customer_multiple_applications: ['同一客户不同申请', 'Same customer, multiple applications', 'Pelanggan sama, beberapa permohonan'],
  family_or_shared_contact: ['家庭成员／共同联系方式', 'Family or shared contact', 'Keluarga atau hubungan dikongsi'],
  data_entry_error: ['资料输入错误', 'Data-entry error', 'Ralat kemasukan data'],
  legitimate_no_risk: ['合法关系，无风险', 'Legitimate relationship, no risk', 'Hubungan sah, tiada risiko']
};

const FIELD_PILL_CLASS: Record<CustomerRiskField, string> = {
  ic_no: 'bg-violet-50 text-violet-700',
  phone_no: 'bg-emerald-50 text-emerald-700',
  account_number: 'bg-orange-50 text-orange-700',
  email: 'bg-sky-50 text-sky-700'
};

const SEVERITY_RANK: Record<RiskSeverity, number> = { relationship: 1, warning: 2, high: 3 };
const ALL_FIELDS = Object.keys(FIELD_LABELS) as CustomerRiskField[];

const normalizeRiskValue = (field: CustomerRiskField, value: string) => {
  if (field === 'email') return value.trim().toLowerCase();
  if (field === 'phone_no') return normalizeMalaysiaPhoneNationalDigits(value);
  return value.replace(/\D/g, '');
};

const getApplicationFieldValues = (application: LoanApplication): Record<CustomerRiskField, string[]> => ({
  ic_no: [application.ic_no || ''],
  phone_no: [application.phone_no || ''],
  account_number: [application.personal_info?.account_number || ''],
  email: [application.personal_info?.email || '']
});

const getLeadFieldValues = (lead: RawCustomerLead): Record<CustomerRiskField, string[]> => ({
  ic_no: [lead.ic_no || ''],
  phone_no: [lead.phone_no || '', lead.whatsapp || '', lead.work_phone || ''],
  account_number: [lead.account_number || ''],
  email: [lead.email || '', lead.work_email || '']
});

const getPersonFieldValues = (person: RiskPerson) => {
  if (person.application) return getApplicationFieldValues(person.application);
  if (person.lead) return getLeadFieldValues(person.lead);
  return {
    ic_no: [],
    phone_no: [person.phone],
    account_number: [],
    email: []
  } satisfies Record<CustomerRiskField, string[]>;
};

const getSeverity = (kind: RiskKind, field: CustomerRiskField): RiskSeverity => {
  if (kind === 'lead_application_match') return field === 'ic_no' || field === 'account_number' ? 'high' : 'relationship';
  return field === 'ic_no' || field === 'account_number' ? 'high' : 'warning';
};

const getSourcePillClass = (label: string): string => {
  const value = (label || '').toLowerCase();
  if (value.includes('申请') || value.includes('application')) return 'bg-red-50 text-red-700';
  if (value.includes('tiktok')) return 'bg-slate-900 text-white';
  if (value.includes('facebook')) return 'bg-blue-50 text-blue-700';
  if (value.includes('instagram')) return 'bg-pink-50 text-pink-700';
  if (value.includes('whatsapp')) return 'bg-emerald-50 text-emerald-700';
  if (value.includes('messenger')) return 'bg-indigo-50 text-indigo-700';
  if (value.includes('google')) return 'bg-amber-50 text-amber-700';
  if (value.includes('walk')) return 'bg-teal-50 text-teal-700';
  return 'bg-slate-100 text-slate-600';
};

const getLatestDate = (values: Array<string | undefined>) => {
  const valid = values
    .map((value) => ({ value: value || '', time: new Date(value || '').getTime() }))
    .filter((entry) => Number.isFinite(entry.time))
    .sort((a, b) => b.time - a.time);
  return valid[0]?.value || '';
};

const getElapsedDays = (start?: string, end?: string) => {
  const startTime = new Date(start || '').getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return 0;
  return Math.max(Math.floor((endTime - startTime) / 86400000), 0);
};

const formatElapsed = (days: number, closed: boolean) => closed
  ? tr(`${days} 天结案`, `Closed in ${days}d`, `Ditutup dalam ${days}h`)
  : tr(`已等待 ${days} 天`, `Open ${days}d`, `Dibuka ${days}h`);

export default function CustomerRelationshipRiskPage({
  applications,
  rawCustomerLeads,
  rawCustomerMatches,
  roleAccounts,
  currentStaffName,
  currentStaffRole,
  onOpenApplication,
  onOpenLeadPool,
  onDeleteLead,
  onActiveIssueCountChange
}: CustomerRelationshipRiskPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | RiskKind>('all');
  const [fieldFilter, setFieldFilter] = useState<'all' | CustomerRiskField>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | RiskSeverity>('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<RelationshipCaseStatus>('new');
  const [visibleCount, setVisibleCount] = useState(6);
  const [relationshipMeta, setRelationshipMeta] = useState<RelationshipMeta>(() => createEmptyRelationshipMeta());
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>({});
  const [closingCaseId, setClosingCaseId] = useState('');
  const [resolutionDrafts, setResolutionDrafts] = useState<Record<string, RelationshipResolution | ''>>({});
  const [pendingDeleteLeadId, setPendingDeleteLeadId] = useState('');
  const [metaStatus, setMetaStatus] = useState<'loading' | 'ready' | 'readonly' | 'saving' | 'error'>('loading');
  const canViewAll = currentStaffRole === 'Super Admin';
  const canViewAllPublicRelationships = currentStaffRole === 'Super Admin' || currentStaffRole === 'Admin';
  const canManageRelationshipMeta = canViewAllPublicRelationships && metaStatus === 'ready';
  const canDeleteDuplicatedLeads = canManageRelationshipMeta;

  useEffect(() => {
    if (!canViewAllPublicRelationships) {
      setMetaStatus('readonly');
      return;
    }

    let active = true;
    setMetaStatus('loading');
    void loadRelationshipMetaResult().then((result) => {
      if (!active) return;
      if (result.status === 'error' || result.status === 'local') {
        setMetaStatus('error');
        return;
      }
      setRelationshipMeta(result.meta);
      setMetaStatus('ready');
    });
    return () => {
      active = false;
    };
  }, [canViewAllPublicRelationships]);

  const persistRelationshipMeta = async (next: RelationshipMeta) => {
    if (!canManageRelationshipMeta) return false;
    setMetaStatus('saving');
    const saved = await saveRelationshipMeta(next);
    if (!saved) {
      setMetaStatus('error');
      return false;
    }
    setRelationshipMeta(next);
    setMetaStatus('ready');
    return true;
  };

  const evidence = useMemo<RiskEvidence[]>(() => {
    const result: RiskEvidence[] = [];
    const applicationById = new Map(applications.map((application) => [application.id, application]));
    const leadById = new Map(rawCustomerLeads.map((lead) => [lead.id, lead]));

    const applicationMaps = Object.fromEntries(ALL_FIELDS.map((field) => [field, new Map<string, LoanApplication[]>()])) as Record<CustomerRiskField, Map<string, LoanApplication[]>>;
    applications.forEach((application) => {
      const values = getApplicationFieldValues(application);
      ALL_FIELDS.forEach((field) => {
        new Set(values[field].map((value) => normalizeRiskValue(field, value)).filter((value) => value.length >= 3)).forEach((value) => {
          applicationMaps[field].set(value, [...(applicationMaps[field].get(value) || []), application]);
        });
      });
    });
    ALL_FIELDS.forEach((field) => {
      applicationMaps[field].forEach((matches, value) => {
        if (matches.length < 2) return;
        result.push({
          id: `application:${field}:${value}`,
          kind: 'application_duplicate',
          severity: getSeverity('application_duplicate', field),
          field,
          value,
          people: matches.map((application) => ({
            id: application.id,
            name: application.applicant_name,
            phone: application.phone_no,
            source: 'application',
            sourceLabel: tr('贷款申请', 'Loan Application', "Permohonan Pinjaman"),
            handler: application.handler_name,
            date: application.submitted_at,
            application
          }))
        });
      });
    });

    const leadMaps = Object.fromEntries(ALL_FIELDS.map((field) => [field, new Map<string, RawCustomerLead[]>()])) as Record<CustomerRiskField, Map<string, RawCustomerLead[]>>;
    rawCustomerLeads.forEach((lead) => {
      const values = getLeadFieldValues(lead);
      ALL_FIELDS.forEach((field) => {
        new Set(values[field].map((value) => normalizeRiskValue(field, value)).filter((value) => value.length >= 3)).forEach((value) => {
          leadMaps[field].set(value, [...(leadMaps[field].get(value) || []), lead]);
        });
      });
    });
    ALL_FIELDS.forEach((field) => {
      leadMaps[field].forEach((matches, value) => {
        if (matches.length < 2) return;
        result.push({
          id: `lead:${field}:${value}`,
          kind: 'lead_duplicate',
          severity: getSeverity('lead_duplicate', field),
          field,
          value,
          people: matches.map((lead) => ({
            id: lead.id,
            name: lead.name || lead.username || lead.lead_id || tr('未命名潜在客户', 'Unnamed lead', "Prospek tanpa nama"),
            phone: lead.phone_no,
            source: 'lead',
            sourceLabel: lead.channel,
            handler: lead.taken_by_staff_name || tr('未分配', 'Unassigned', "Belum Ditugaskan"),
            date: lead.received_at,
            lead,
            privateOwner: lead.lead_visibility === 'Private' ? lead.created_by_staff_name || lead.taken_by_staff_name || '' : undefined
          }))
        });
      });
    });

    rawCustomerMatches.forEach((match) => {
      const application = applicationById.get(match.customer_id);
      const lead = leadById.get(match.raw_customer_id);
      match.matched_fields.forEach((field) => {
        const applicationValue = application ? getApplicationFieldValues(application)[field][0] : '';
        const leadValue = lead ? getLeadFieldValues(lead)[field].find((value) => normalizeRiskValue(field, value)) || '' : '';
        result.push({
          id: `relationship:${match.raw_customer_id}:${match.customer_id}:${field}`,
          kind: 'lead_application_match',
          severity: getSeverity('lead_application_match', field),
          field,
          value: normalizeRiskValue(field, applicationValue || leadValue),
          people: [
            {
              id: match.raw_customer_id,
              name: match.raw_customer_name,
              phone: match.raw_customer_phone,
              source: 'lead',
              sourceLabel: match.raw_customer_channel,
              handler: lead?.taken_by_staff_name || tr('未分配', 'Unassigned', "Belum Ditugaskan"),
              date: lead?.received_at,
              lead,
              privateOwner: lead?.lead_visibility === 'Private' ? lead.created_by_staff_name || lead.taken_by_staff_name || '' : undefined
            },
            {
              id: match.customer_id,
              name: match.customer_name,
              phone: match.customer_phone,
              source: 'application',
              sourceLabel: tr('贷款申请', 'Loan Application', "Permohonan Pinjaman"),
              handler: match.handler_name,
              date: application?.submitted_at,
              application
            }
          ]
        });
      });
    });

    return result.filter((alert) => {
      if (canViewAll) return true;
      const privateOwners = alert.people.map((person) => person.privateOwner).filter(Boolean);
      if (privateOwners.length > 0) return privateOwners.includes(currentStaffName);
      return canViewAllPublicRelationships || alert.people.some((person) => person.handler === currentStaffName);
    });
  }, [applications, canViewAll, canViewAllPublicRelationships, currentStaffName, rawCustomerLeads, rawCustomerMatches]);

  const cases = useMemo<RelationshipCase[]>(() => {
    const grouped = new Map<string, RelationshipCase>();
    evidence.forEach((alert) => {
      const personKey = alert.people.map((person) => `${person.source}:${person.id}`).sort().join('|');
      const id = `case:${alert.kind}:${personKey}`;
      const existing = grouped.get(id);
      if (!existing) {
        grouped.set(id, {
          id,
          kind: alert.kind,
          severity: alert.severity,
          people: alert.people,
          matches: [{ field: alert.field, value: alert.value }],
          legacyAlertIds: [alert.id],
          createdAt: getLatestDate(alert.people.map((person) => person.date))
        });
        return;
      }
      if (!existing.matches.some((match) => match.field === alert.field && match.value === alert.value)) {
        existing.matches.push({ field: alert.field, value: alert.value });
      }
      existing.legacyAlertIds.push(alert.id);
      if (SEVERITY_RANK[alert.severity] > SEVERITY_RANK[existing.severity]) existing.severity = alert.severity;
    });
    return Array.from(grouped.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [evidence]);

  const caseViews = useMemo<CaseView[]>(() => cases.map((item) => {
    const commentIds = [item.id, ...item.legacyAlertIds];
    const comments = Array.from(new Map(
      commentIds.flatMap((id) => relationshipMeta.comments[id] || []).map((comment) => [comment.id, comment])
    ).values()).sort((a, b) => a.created_at.localeCompare(b.created_at));
    const stored = relationshipMeta.case_states[item.id];
    if (stored) return { item, state: stored, comments };

    const legacyClosed = item.legacyAlertIds.map((id) => relationshipMeta.closed[id]).filter(Boolean).sort((a, b) => b.closed_at.localeCompare(a.closed_at))[0];
    const legacyHidden = item.legacyAlertIds.some((id) => relationshipMeta.hidden.includes(id));
    const state: RelationshipCaseState = legacyClosed
      ? { status: 'closed', assigned_to: legacyClosed.staff_name, updated_at: legacyClosed.closed_at, closed_by: legacyClosed.staff_name, closed_at: legacyClosed.closed_at }
      : legacyHidden
        ? { status: 'hidden', assigned_to: '', updated_at: comments.at(-1)?.created_at || item.createdAt }
        : comments.length > 0
          ? { status: 'investigating', assigned_to: comments.at(-1)?.staff_name || '', updated_at: comments.at(-1)?.created_at || item.createdAt }
          : { status: 'new', assigned_to: '', updated_at: item.createdAt };
    return { item, state, comments };
  }), [cases, relationshipMeta]);

  const activeRoleAccounts = useMemo(() => roleAccounts.filter((account) => account.status === 'Active'), [roleAccounts]);
  const roleAccountByName = useMemo(() => new Map(roleAccounts.map((account) => [account.name, account])), [roleAccounts]);
  const rawLeadById = useMemo(() => new Map(rawCustomerLeads.map((lead) => [lead.id, lead])), [rawCustomerLeads]);
  const staffOptions = [
    { value: 'all', label: tr('全部员工', 'All Staff', "Semua Kakitangan"), leading: <Users className="h-4 w-4" /> },
    ...activeRoleAccounts.map((account) => ({ value: account.name, label: account.name, leading: <StaffAvatar name={account.name} avatarDataUrl={account.avatar_data_url} className="h-6 w-6" textClassName="text-[8px]" /> }))
  ];
  const assignmentOptions = [
    { value: '', label: tr('未分配', 'Unassigned', "Belum Ditugaskan") },
    ...activeRoleAccounts.map((account) => ({ value: account.name, label: account.name, leading: <StaffAvatar name={account.name} avatarDataUrl={account.avatar_data_url} className="h-6 w-6" textClassName="text-[8px]" /> }))
  ];
  const resolutionOptions = Object.entries(RESOLUTION_LABELS).map(([value, labels]) => ({ value, label: tr(labels[0], labels[1], labels[2]) }));

  const updateCaseState = (view: CaseView, updates: Partial<RelationshipCaseState>) => {
    const nextState: RelationshipCaseState = { ...view.state, ...updates, updated_at: new Date().toISOString() };
    if (!nextState.resolution) delete nextState.resolution;
    if (!nextState.closed_by) delete nextState.closed_by;
    if (!nextState.closed_at) delete nextState.closed_at;
    return persistRelationshipMeta({
      ...relationshipMeta,
      case_states: {
        ...relationshipMeta.case_states,
        [view.item.id]: nextState
      }
    });
  };

  const handleAddComment = async (view: CaseView) => {
    const text = (commentDrafts[view.item.id] || '').trim();
    if (!text) return;
    const comment: RelationshipComment = {
      id: `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
      text,
      staff_name: currentStaffName,
      created_at: new Date().toISOString()
    };
    const saved = await persistRelationshipMeta({
      ...relationshipMeta,
      comments: { ...relationshipMeta.comments, [view.item.id]: [...view.comments, comment] },
      case_states: {
        ...relationshipMeta.case_states,
        [view.item.id]: {
          ...view.state,
          status: view.state.status === 'closed' ? 'closed' : 'investigating',
          assigned_to: view.state.assigned_to || currentStaffName,
          updated_at: comment.created_at
        }
      }
    });
    if (saved) {
      setCommentDrafts((drafts) => ({ ...drafts, [view.item.id]: '' }));
    }
  };

  const handleCloseCase = async (view: CaseView) => {
    const resolution = resolutionDrafts[view.item.id];
    if (!resolution || view.comments.length === 0) return;
    const now = new Date().toISOString();
    const closed = await updateCaseState(view, { status: 'closed', resolution, closed_by: currentStaffName, closed_at: now, assigned_to: view.state.assigned_to || currentStaffName });
    if (closed) setClosingCaseId('');
  };

  const handleDeleteDuplicatedLead = async (lead: RawCustomerLead) => {
    const fingerprint = createRawLeadImportFingerprint(lead);
    const nextMeta: RelationshipMeta = {
      ...relationshipMeta,
      raw_lead_import_exclusions: [
        ...relationshipMeta.raw_lead_import_exclusions.filter((entry) => entry.fingerprint !== fingerprint),
        {
          fingerprint,
          excluded_at: new Date().toISOString(),
          excluded_by: currentStaffName
        }
      ]
    };
    if (await persistRelationshipMeta(nextMeta) && onDeleteLead(lead)) {
      setPendingDeleteLeadId('');
    }
  };

  const statusCounts = useMemo(() => ({
    new: caseViews.filter((view) => view.state.status === 'new').length,
    investigating: caseViews.filter((view) => view.state.status === 'investigating').length,
    closed: caseViews.filter((view) => view.state.status === 'closed').length,
    hidden: caseViews.filter((view) => view.state.status === 'hidden').length
  }), [caseViews]);
  const highRiskCount = caseViews.filter((view) => view.item.severity === 'high' && (view.state.status === 'new' || view.state.status === 'investigating')).length;
  const activeIssueCount = statusCounts.new + statusCounts.investigating;

  useEffect(() => {
    onActiveIssueCountChange?.(metaStatus === 'loading' ? 0 : activeIssueCount);
  }, [activeIssueCount, metaStatus, onActiveIssueCountChange]);

  const filteredCases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return caseViews.filter((view) => {
      if (view.state.status !== statusFilter) return false;
      if (kindFilter !== 'all' && view.item.kind !== kindFilter) return false;
      if (fieldFilter !== 'all' && !view.item.matches.some((match) => match.field === fieldFilter)) return false;
      if (severityFilter !== 'all' && view.item.severity !== severityFilter) return false;
      if (staffFilter !== 'all' && view.state.assigned_to !== staffFilter && !view.item.people.some((person) => person.handler === staffFilter)) return false;
      if (!query) return true;
      return view.item.matches.some((match) => match.value.toLowerCase().includes(query)) || view.item.people.some((person) => (
        person.name.toLowerCase().includes(query) || person.phone.toLowerCase().includes(query) || person.id.toLowerCase().includes(query)
      ));
    });
  }, [caseViews, fieldFilter, kindFilter, searchTerm, severityFilter, staffFilter, statusFilter]);

  useEffect(() => setVisibleCount(6), [fieldFilter, kindFilter, searchTerm, severityFilter, staffFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('潜在客户关系', 'Potential Customer Relationships', "Hubungan Pelanggan Berpotensi")}</h2>
        <p className="mt-1 text-xs font-light text-slate-500">{tr('一组关联人只建立一个案件，集中核对所有相同资料。', 'One case per related group, with every matching field in one place.', "Satu kes bagi setiap kumpulan berkaitan, dengan semua medan sepadan di satu tempat.")}</p>
      </section>

      {metaStatus === 'error' && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {tr('关系案件云端资料加载或保存失败；为防止覆盖现有评论与结案记录，编辑已停用。请刷新后重试。', 'Relationship case metadata could not be loaded or saved. Editing is disabled to prevent overwriting existing comments and case history. Refresh to retry.', "Metadata kes hubungan gagal dimuatkan atau disimpan. Penyuntingan dilumpuhkan untuk mengelakkan ulasan dan sejarah kes sedia ada ditulis ganti. Muat semula untuk mencuba lagi.")}
        </div>
      )}
      {(metaStatus === 'loading' || metaStatus === 'saving') && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
          {metaStatus === 'loading'
            ? tr('正在载入关系案件云端资料…', 'Loading relationship case metadata…', "Memuatkan metadata kes hubungan…")
            : tr('正在保存关系案件…', 'Saving relationship case…', "Menyimpan kes hubungan…")}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: tr('待处理', 'Pending', "Belum Diproses"), value: statusCounts.new, tone: 'text-slate-900', icon: <Clock3 className="h-5 w-5 text-slate-400" /> },
          { label: tr('高风险', 'High Risk', "Berisiko Tinggi"), value: highRiskCount, tone: 'text-rose-600', icon: <ShieldAlert className="h-5 w-5 text-rose-500" /> },
          { label: tr('调查中', 'Investigating', "Dalam Siasatan"), value: statusCounts.investigating, tone: 'text-amber-600', icon: <Search className="h-5 w-5 text-amber-500" /> },
          { label: tr('已结案', 'Closed', "Ditutup"), value: statusCounts.closed, tone: 'text-emerald-600', icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" /> }
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">{card.label}</span>
              {card.icon}
            </div>
            <p className={`mt-2 text-2xl font-bold ${card.tone}`}>{card.value.toLocaleString()}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABELS) as RelationshipCaseStatus[]).map((status) => (
            <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${statusFilter === status ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {tr(STATUS_LABELS[status][0], STATUS_LABELS[status][1], STATUS_LABELS[status][2])}
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${statusFilter === status ? 'bg-white/15' : 'bg-white'}`}>{statusCounts[status]}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <label className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={tr('搜索姓名、电话、编号或相同资料', 'Search name, phone, ID or matched value', "Cari nama, telefon, ID atau nilai sepadan")} className="h-10 w-full rounded-lg bg-slate-50 pl-9 pr-3 text-xs outline-none ring-1 ring-slate-100 focus:ring-red-100" />
          </label>
          <ToggleOptionGroup value={kindFilter} onChange={(value) => setKindFilter(value as 'all' | RiskKind)} ariaLabel={tr('关系类型', 'Relationship type', "Jenis hubungan")} className="min-w-[190px] rounded-lg bg-slate-50 p-1 ring-1 ring-slate-100" options={[
            { value: 'all', label: tr('全部关系类型', 'All relationship types', "Semua jenis hubungan") },
            ...Object.entries(KIND_LABELS).map(([value, labels]) => ({ value, label: tr(labels[0], labels[1], labels[2]) }))
          ]} />
          <ToggleOptionGroup value={fieldFilter} onChange={(value) => setFieldFilter(value as 'all' | CustomerRiskField)} ariaLabel={tr('资料类型', 'Data field', "Medan data")} className="min-w-[150px] rounded-lg bg-slate-50 p-1 ring-1 ring-slate-100" options={[
            { value: 'all', label: tr('全部资料', 'All fields', "Semua medan") },
            ...Object.entries(FIELD_LABELS).map(([value, labels]) => ({ value, label: tr(labels[0], labels[1], labels[2]) }))
          ]} />
          {(canViewAll || canViewAllPublicRelationships) && <ToggleOptionGroup value={staffFilter} onChange={setStaffFilter} ariaLabel={tr('员工筛选', 'Staff filter', "Penapis kakitangan")} className="min-w-[170px] rounded-lg bg-slate-50 p-1 ring-1 ring-slate-100" options={staffOptions} />}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {([['all', tr('全部等级', 'All severity', "Semua tahap")], ['high', tr('高风险', 'High Risk', "Berisiko Tinggi")], ['warning', tr('提醒', 'Warning', "Amaran")], ['relationship', tr('关系', 'Relationship', "Hubungan")]] as const).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setSeverityFilter(value)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${severityFilter === value ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{label}</button>
          ))}
          <span className="ml-auto self-center text-[10px] font-semibold text-slate-400">{tr(`${filteredCases.length} 个案件`, `${filteredCases.length} cases`, `${filteredCases.length} kes`)}</span>
        </div>
      </section>

      <section className="space-y-3">
        {filteredCases.slice(0, visibleCount).map((view) => {
          const { item, state, comments } = view;
          const assignedAccount = state.assigned_to ? roleAccountByName.get(state.assigned_to) : undefined;
          const isExpanded = Boolean(expandedCases[item.id]);
          const isActive = state.status === 'new' || state.status === 'investigating';
          const ageDays = getElapsedDays(item.createdAt, state.status === 'closed' ? state.closed_at : undefined);
          const isOverSla = isActive && (item.severity === 'high' ? ageDays >= 2 : ageDays >= 5);

          return (
            <article key={item.id} className={`rounded-xl border bg-white p-4 shadow-sm ${item.severity === 'high' ? 'border-rose-100' : item.severity === 'warning' ? 'border-amber-100' : 'border-blue-100'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${item.severity === 'high' ? 'bg-rose-50 text-rose-600' : item.severity === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{item.severity === 'high' ? tr('高风险', 'High Risk', "Berisiko Tinggi") : item.severity === 'warning' ? tr('提醒', 'Warning', "Amaran") : tr('关系', 'Relationship', "Hubungan")}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">{tr(KIND_LABELS[item.kind][0], KIND_LABELS[item.kind][1], KIND_LABELS[item.kind][2])}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${isOverSla ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}`}><Clock3 className="h-3 w-3" />{formatElapsed(ageDays, state.status === 'closed')}</span>
                    {state.resolution && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">{tr(RESOLUTION_LABELS[state.resolution][0], RESOLUTION_LABELS[state.resolution][1], RESOLUTION_LABELS[state.resolution][2])}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.matches.map((match) => <span key={`${match.field}:${match.value}`} className={`rounded-full px-2 py-1 text-[9px] font-bold ${FIELD_PILL_CLASS[match.field]}`}>{tr(FIELD_LABELS[match.field][0], FIELD_LABELS[match.field][1], FIELD_LABELS[match.field][2])} · {match.value}</span>)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {isActive && canManageRelationshipMeta ? (
                    <ToggleOptionGroup value={state.assigned_to} onChange={(value) => updateCaseState(view, { assigned_to: value, status: value && state.status === 'new' ? 'investigating' : state.status })} ariaLabel={tr('案件负责人', 'Case owner', "Pemilik kes")} className="min-w-[155px] rounded-lg bg-slate-50 p-1 ring-1 ring-slate-100" options={assignmentOptions} />
                  ) : state.assigned_to ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
                      <StaffAvatar name={state.assigned_to} avatarDataUrl={assignedAccount?.avatar_data_url} className="h-5 w-5" textClassName="text-[7px]" />{state.assigned_to}
                    </span>
                  ) : isActive && canManageRelationshipMeta ? (
                    <button type="button" onClick={() => updateCaseState(view, { assigned_to: currentStaffName, status: 'investigating' })} className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-[10px] font-bold text-violet-700">{tr('由我处理', 'Assign to me', "Tugaskan kepada saya")}</button>
                  ) : null}
                  {canManageRelationshipMeta && state.status === 'new' && <button type="button" onClick={() => updateCaseState(view, { status: 'investigating', assigned_to: state.assigned_to || currentStaffName })} className="rounded-lg bg-amber-600 px-2.5 py-1.5 text-[10px] font-bold text-white">{tr('开始调查', 'Start investigation', "Mulakan siasatan")}</button>}
                  {canManageRelationshipMeta && isActive && comments.length > 0 && <button type="button" onClick={() => setClosingCaseId(closingCaseId === item.id ? '' : item.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white"><Archive className="h-3 w-3" />{tr('结案', 'Close Case', "Tutup Kes")}</button>}
                  {canManageRelationshipMeta && isActive && <button type="button" onClick={() => updateCaseState(view, { status: 'hidden' })} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-400 ring-1 ring-slate-100"><EyeOff className="h-3 w-3" />{tr('隐藏', 'Hide', "Sembunyi")}</button>}
                  {canManageRelationshipMeta && state.status === 'closed' && <button type="button" onClick={() => updateCaseState(view, { status: comments.length > 0 ? 'investigating' : 'new', resolution: undefined, closed_by: undefined, closed_at: undefined })} className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-100"><ArchiveRestore className="h-3 w-3" />{tr('重新开启', 'Reopen', "Buka semula")}</button>}
                  {canManageRelationshipMeta && state.status === 'hidden' && <button type="button" onClick={() => updateCaseState(view, { status: comments.length > 0 ? 'investigating' : 'new' })} className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-100"><ArchiveRestore className="h-3 w-3" />{tr('恢复', 'Restore', "Pulihkan")}</button>}
                </div>
              </div>

              {closingCaseId === item.id && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800">{tr('选择结案结果', 'Select resolution', "Pilih keputusan")}</span>
                  <ToggleOptionGroup value={resolutionDrafts[item.id] || ''} onChange={(value) => setResolutionDrafts((current) => ({ ...current, [item.id]: value as RelationshipResolution }))} ariaLabel={tr('结案结果', 'Resolution', "Keputusan")} className="min-w-[250px] rounded-lg bg-white p-1 ring-1 ring-emerald-100" options={resolutionOptions} />
                  <button type="button" disabled={!resolutionDrafts[item.id]} onClick={() => handleCloseCase(view)} className="rounded-lg bg-emerald-700 px-3 py-2 text-[10px] font-bold text-white disabled:bg-emerald-200">{tr('确认结案', 'Confirm close', "Sahkan tutup")}</button>
                </div>
              )}

              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                {item.people.map((person) => {
                  const handlerAccount = roleAccountByName.get(person.handler);
                  const sourceLead = person.lead || (person.source === 'lead' ? rawLeadById.get(person.id) : undefined);
                  const values = getPersonFieldValues(sourceLead && !person.lead ? { ...person, lead: sourceLead } : person);
                  return (
                    <div key={`${item.id}:${person.source}:${person.id}`} className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${person.source === 'application' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{person.source === 'application' ? <ShieldAlert className="h-4 w-4" /> : <Users className="h-4 w-4" />}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-xs font-bold text-slate-800" title={person.name}>{person.name}</p>
                            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${getSourcePillClass(person.sourceLabel)}`}>{person.sourceLabel}</span>
                            {person.privateOwner && <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[8px] font-bold text-violet-700">{tr('私人关联', 'Private Link', "Pautan Peribadi")}</span>}
                          </div>
                          <p className="mt-0.5 text-[9px] font-medium text-slate-400">{person.id}{person.date ? ` · ${new Date(person.date).toLocaleDateString(getAppLocale())}` : ''}</p>
                          <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-bold text-violet-600"><StaffAvatar name={person.handler} avatarDataUrl={handlerAccount?.avatar_data_url} className="h-5 w-5" textClassName="text-[7px]" />{person.handler}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {item.kind === 'lead_duplicate' && sourceLead && canDeleteDuplicatedLeads && (
                            pendingDeleteLeadId === sourceLead.id ? (
                              <>
                                <button type="button" onClick={() => handleDeleteDuplicatedLead(sourceLead)} className="rounded-lg bg-rose-600 px-2.5 py-2 text-[9px] font-bold text-white">{tr('确认删除', 'Confirm delete', "Sahkan padam")}</button>
                                <button type="button" onClick={() => setPendingDeleteLeadId('')} className="rounded-lg bg-white px-2.5 py-2 text-[9px] font-bold text-slate-500 ring-1 ring-slate-100">{tr('取消', 'Cancel', "Batal")}</button>
                              </>
                            ) : (
                              <button type="button" onClick={() => setPendingDeleteLeadId(sourceLead.id)} className="inline-flex h-8 items-center gap-1 rounded-lg bg-white px-2 text-[9px] font-bold text-rose-600 ring-1 ring-rose-100 hover:bg-rose-50" title={tr('删除并排除未来导入', 'Delete and exclude from future imports', "Padam dan kecualikan daripada import akan datang")}><Trash2 className="h-3.5 w-3.5" />{tr('删除名单', 'Delete Lead', "Padam Prospek")}</button>
                            )
                          )}
                          {(person.application ? canViewAllPublicRelationships || person.handler === currentStaffName : !person.privateOwner || person.privateOwner === currentStaffName || canViewAll) && (
                            <button type="button" onClick={() => person.application ? onOpenApplication(person.application) : onOpenLeadPool()} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-100 hover:text-red-700" title={person.source === 'application' ? tr('打开贷款申请', 'Open application', "Buka permohonan") : tr('打开潜在客户', 'Open lead pool', "Buka kumpulan prospek")}><ArrowUpRight className="h-4 w-4" /></button>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        {ALL_FIELDS.map((field) => {
                          const displayValues = values[field].filter(Boolean);
                          const isMatched = displayValues.some((value) => item.matches.some((match) => match.field === field && normalizeRiskValue(field, value) === match.value));
                          return (
                            <div key={field} className={`rounded-md px-2 py-1.5 ${isMatched ? FIELD_PILL_CLASS[field] : 'bg-white text-slate-500'}`}>
                              <p className="text-[8px] font-bold uppercase opacity-70">{tr(FIELD_LABELS[field][0], FIELD_LABELS[field][1], FIELD_LABELS[field][2])}</p>
                              <p className="mt-0.5 truncate font-mono text-[9px] font-semibold" title={displayValues.join(' / ')}>{displayValues.join(' / ') || tr('未填写', 'Not filled', "Belum diisi")}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button type="button" onClick={() => setExpandedCases((current) => ({ ...current, [item.id]: !current[item.id] }))} className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-400 hover:text-slate-600">
                <MessageSquare className="h-3 w-3" />{comments.length > 0 ? tr(`${comments.length} 条评论`, `${comments.length} comments`, `${comments.length} ulasan`) : tr('添加调查评论', 'Add investigation comment', "Tambah ulasan siasatan")}<span className="font-medium text-slate-300">· {isExpanded ? tr('收起', 'Hide', "Sembunyi") : tr('展开', 'Open', "Buka")}</span>
              </button>
              {isExpanded && (
                <div className="mt-2" onDoubleClick={(event) => event.stopPropagation()}>
                  {comments.map((comment) => (
                    <div key={comment.id} className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold text-violet-600">{comment.staff_name || tr('员工', 'Staff', "Kakitangan")}</span><span className="text-[9px] font-medium text-slate-400">{comment.created_at ? new Date(comment.created_at).toLocaleString(getAppLocale(), { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span></div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-700">{comment.text}</p>
                    </div>
                  ))}
                  {canManageRelationshipMeta && state.status !== 'closed' && state.status !== 'hidden' && (
                    <div className="mt-2 flex items-start gap-2">
                      <textarea value={commentDrafts[item.id] || ''} onChange={(event) => setCommentDrafts((drafts) => ({ ...drafts, [item.id]: event.target.value }))} rows={1} placeholder={tr('记录调查结果…', 'Record investigation findings…', "Catat dapatan siasatan…")} className="min-h-[38px] flex-1 resize-y rounded-lg bg-slate-50 px-3 py-2 text-xs outline-none ring-1 ring-slate-100 focus:ring-red-100" />
                      <button type="button" onClick={() => handleAddComment(view)} disabled={!(commentDrafts[item.id] || '').trim()} className="shrink-0 rounded-lg bg-red-800 px-3 py-2 text-[11px] font-bold text-white disabled:bg-slate-200 disabled:text-slate-400">{tr('提交', 'Submit', "Hantar")}</button>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}

        {filteredCases.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center"><Link2 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">{tr('这个状态没有关系案件', 'No relationship cases in this status', "Tiada kes hubungan dalam status ini")}</p></div>}
        {filteredCases.length > 6 && <div className="flex gap-2">{visibleCount < filteredCases.length && <button type="button" onClick={() => setVisibleCount((count) => count + 6)} className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600">{tr(`显示更多（还有 ${filteredCases.length - visibleCount} 个）`, `Show more (${filteredCases.length - visibleCount} remaining)`, `Tunjukkan lagi (${filteredCases.length - visibleCount} berbaki)`)}</button>}{visibleCount > 6 && <button type="button" onClick={() => setVisibleCount(6)} className="rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-500 ring-1 ring-slate-100">{tr('收起', 'Show less', "Tunjukkan kurang")}</button>}</div>}
      </section>
    </div>
  );
}
