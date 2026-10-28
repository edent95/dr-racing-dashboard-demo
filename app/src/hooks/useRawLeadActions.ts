/**
 * Raw lead actions: take via WhatsApp, release, follow-up, import / add,
 * assign private leads and delete. Moved verbatim from App.tsx; every value
 * the handlers used from App's closure is now an explicit dependency under
 * its original name. The only edit: the two dynamic imports in
 * handleImportRawCustomerLeads point one directory up. The stale-lead
 * auto-release effect stays in App and calls the returned releaseRawLeads.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import { tr } from '../lib/i18n';
import type { DashboardState } from '../services/dashboardRepository';
import { AuditLogEntry, CustomerRiskField, LoanApplication, normalizeVehicleModel, RawCustomerLead, RoleAccount } from '../types';
import { newId } from '../utils/id';
import { createTaskCompletionAuditChanges } from '../utils/taskCompletionAnalytics';
import type { StaffSession } from './useStaffSessionAuth';
import { hasAdminWorkAccess } from '../utils/staffRoles';

export interface RawLeadAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface RawLeadActionsDeps {
  currentStaff: StaffSession;
  currentRoleAccount: RoleAccount | undefined;
  rawCustomerLeads: RawCustomerLead[];
  applications: LoanApplication[];
  roleAccounts: RoleAccount[];
  auditLogs: AuditLogEntry[];
  clientContext: { ip_address: string; user_agent: string };
  leadFollowUpDays: number;
  setRawCustomerLeads: (list: RawCustomerLead[]) => void;
  writeLocalDashboardValue: (key: 'rawCustomerLeads', value: RawCustomerLead[]) => void;
  updateRawCustomerLeadsState: (list: RawCustomerLead[]) => unknown;
  updateAuditLogsState: (list: AuditLogEntry[], stateOverrides?: Partial<DashboardState>) => unknown;
  markRawLeadsDeletedForSync: (ids: string[]) => void;
  normalizeRawCustomerLeads: (list: RawCustomerLead[]) => RawCustomerLead[];
  openRawLeadWhatsAppUrl: (lead: RawCustomerLead, target: 'api' | 'web') => void;
  getDefaultLeadFollowUpIso: (days?: number) => string;
  isActiveLead: (lead: RawCustomerLead) => boolean;
  normalizeRiskValue: (field: CustomerRiskField, value: string) => string;
  appendAuditLog: (input: RawLeadAuditInput) => void;
  createAuditChanges: <Before extends object, After extends object>(before: Before, after: After) => AuditLogEntry['changes'];
  triggerToast: (message: string, tone?: 'success' | 'warning' | 'error') => void;
}

export function useRawLeadActions({
  currentStaff,
  currentRoleAccount,
  rawCustomerLeads,
  applications,
  roleAccounts,
  auditLogs,
  clientContext,
  leadFollowUpDays,
  setRawCustomerLeads,
  writeLocalDashboardValue,
  updateRawCustomerLeadsState,
  updateAuditLogsState,
  markRawLeadsDeletedForSync,
  normalizeRawCustomerLeads,
  openRawLeadWhatsAppUrl,
  getDefaultLeadFollowUpIso,
  isActiveLead,
  normalizeRiskValue,
  appendAuditLog,
  createAuditChanges,
  triggerToast
}: RawLeadActionsDeps) {
  const handleOpenRawLeadWhatsApp = (lead: RawCustomerLead, target: 'api' | 'web') => {
    const existingOwner = lead.taken_by_staff_name || '';
    const isTakenByOther = Boolean(existingOwner && existingOwner !== currentStaff.name);

    if (isTakenByOther && currentStaff.role === 'Sales') {
      triggerToast(tr(`这个客户已经是 ${existingOwner} 在跟`, `This lead is already assigned to ${existingOwner}`, `Prospek ini telah diberikan kepada ${existingOwner}`));
      return;
    }

    const now = new Date().toISOString();
    const defaultNextFollowUpAt = getDefaultLeadFollowUpIso(leadFollowUpDays);
    const shouldClaimLead = !existingOwner || existingOwner === currentStaff.name;
    const nextLeads = rawCustomerLeads.map((item) => {
      if (item.id !== lead.id) {
        return item;
      }

      return {
        ...item,
        lead_scope: 'Taken Lead' as const,
        taken_by_staff_id: shouldClaimLead ? normalizeVehicleModel(currentStaff.name).replace(/\s+/g, '-') : item.taken_by_staff_id,
        taken_by_staff_name: shouldClaimLead ? currentStaff.name : item.taken_by_staff_name,
        taken_by_staff_role: shouldClaimLead ? currentStaff.role : item.taken_by_staff_role,
        taken_at: item.taken_at || now,
        follow_up_status: item.follow_up_status && item.follow_up_status !== 'New' ? item.follow_up_status : 'Contacted',
        last_follow_up_at: now,
        next_follow_up_at: item.next_follow_up_at || defaultNextFollowUpAt
      };
    });
    const updatedLead = nextLeads.find((item) => item.id === lead.id) || lead;

    updateRawCustomerLeadsState(nextLeads);

    if (!existingOwner) {
      appendAuditLog({
        action: 'TAKE_RAW_CUSTOMER_LEAD',
        target_type: 'Raw Customer',
        target_id: lead.id,
        target_label: lead.name || lead.phone_no || lead.id,
        changes: createAuditChanges({
          lead_scope: 'Public Lead',
          taken_by_staff_name: '--',
          follow_up_status: lead.follow_up_status || 'New'
        }, {
          lead_scope: 'Taken Lead',
          taken_by_staff_name: currentStaff.name,
          follow_up_status: 'Contacted'
        }),
        stateOverrides: { rawCustomerLeads: nextLeads }
      });
    }

    openRawLeadWhatsAppUrl(updatedLead, target);
    triggerToast(tr(`已交给 ${updatedLead.taken_by_staff_name || existingOwner || currentStaff.name} 跟进，正在打开 WhatsApp`, `Assigned to ${updatedLead.taken_by_staff_name || existingOwner || currentStaff.name} — opening WhatsApp`, `Ditugaskan kepada ${updatedLead.taken_by_staff_name || existingOwner || currentStaff.name} — membuka WhatsApp`));
  };

  const releaseRawLeads = (leadIds: string[], reason: 'manual' | 'auto') => {
    if (leadIds.length === 0) {
      return;
    }

    const idSet = new Set(leadIds);
    const now = new Date().toISOString();
    const releasedLeads = rawCustomerLeads.filter((lead) => idSet.has(lead.id));
    const nextLeads = rawCustomerLeads.map((lead) => (
      idSet.has(lead.id)
        ? {
          ...lead,
          lead_scope: 'Public Lead' as const,
          taken_by_staff_id: '',
          taken_by_staff_name: '',
          taken_by_staff_role: '',
          taken_at: '',
          follow_up_status: 'New' as const,
          next_follow_up_at: '',
          released_at: now
        }
        : lead
    ));

    updateRawCustomerLeadsState(nextLeads);
    releasedLeads.forEach((lead) => {
      appendAuditLog({
        action: reason === 'auto' ? 'AUTO_RELEASE_RAW_CUSTOMER_LEAD' : 'RELEASE_RAW_CUSTOMER_LEAD',
        target_type: 'Raw Customer',
        target_id: lead.id,
        target_label: lead.name || lead.phone_no || lead.id,
        changes: createAuditChanges({
          lead_scope: 'Taken Lead',
          taken_by_staff_name: lead.taken_by_staff_name || '--'
        }, {
          lead_scope: 'Public Lead',
          taken_by_staff_name: '--'
        }),
        stateOverrides: { rawCustomerLeads: nextLeads }
      });
    });
  };

  const handleReleaseRawLead = (lead: RawCustomerLead) => {
    const owner = lead.taken_by_staff_name || '';
    const isAdmin = hasAdminWorkAccess(currentStaff.role);

    if (!owner) {
      return;
    }

    if (lead.lead_visibility === 'Private') {
      triggerToast(tr('私人名单不会放回未分配名单', 'Private leads cannot be returned to the unassigned pool', "Prospek peribadi tidak boleh dikembalikan ke senarai belum ditugaskan"), 'error');
      return;
    }

    if (!isAdmin && owner !== currentStaff.name) {
      triggerToast(tr(`只有 ${owner} 或 Admin 可以把这个名单放回去`, `Only ${owner} or an Admin can return this lead`, `Hanya ${owner} atau Pentadbir boleh memulangkan prospek ini`));
      return;
    }

    releaseRawLeads([lead.id], 'manual');
    triggerToast(tr(`已放回未分配：${lead.name || lead.phone_no || lead.id}`, `Returned to unassigned leads: ${lead.name || lead.phone_no || lead.id}`, `Dikembalikan kepada prospek yang belum ditetapkan: ${lead.name || lead.phone_no || lead.id}`));
  };

  const handleUpdateRawLeadFollowUp = (leadId: string, updates: Partial<RawCustomerLead>) => {
    const previousLead = rawCustomerLeads.find((lead) => lead.id === leadId);
    const hasExplicitNextFollowUp = Object.prototype.hasOwnProperty.call(updates, 'next_follow_up_at');
    const nextLeads = rawCustomerLeads.map((lead) => (
      lead.id === leadId
        ? (() => {
          const updatedLead = {
          ...lead,
          ...updates,
          lead_scope: 'Taken Lead' as const
          };

          return isActiveLead(updatedLead) && !updatedLead.next_follow_up_at && !hasExplicitNextFollowUp
            ? { ...updatedLead, next_follow_up_at: getDefaultLeadFollowUpIso(leadFollowUpDays) }
            : updatedLead;
        })()
        : lead
    ));

    updateRawCustomerLeadsState(nextLeads);
    const updatedLead = nextLeads.find((lead) => lead.id === leadId);
    if (previousLead && updatedLead && previousLead.next_follow_up_at) {
      const now = new Date();
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      const previousDueAt = new Date(previousLead.next_follow_up_at);
      const nextDueAt = updatedLead.next_follow_up_at ? new Date(updatedLead.next_follow_up_at) : null;
      const terminalStatus = ['Submitted Loan', 'Rejected', 'Closed'].includes(updatedLead.follow_up_status || '');
      const wasDue = !Number.isNaN(previousDueAt.getTime()) && previousDueAt.getTime() <= todayEnd.getTime();
      const leavesDueQueue = terminalStatus || !nextDueAt || (
        !Number.isNaN(nextDueAt.getTime()) && nextDueAt.getTime() > todayEnd.getTime()
      );

      if (wasDue && leavesDueQueue) {
        appendAuditLog({
          action: 'COMPLETE_RAW_LEAD_FOLLOW_UP',
          target_type: 'Raw Customer',
          target_id: previousLead.id,
          target_label: previousLead.name || previousLead.phone_no || previousLead.id,
          changes: [
            ...createAuditChanges(
              {
                follow_up_status: previousLead.follow_up_status || 'New',
                next_follow_up_at: previousLead.next_follow_up_at
              },
              {
                follow_up_status: updatedLead.follow_up_status || 'New',
                next_follow_up_at: updatedLead.next_follow_up_at || ''
              }
            ),
            ...createTaskCompletionAuditChanges([{
              category: 'lead',
              task_type: 'Lead Follow-up',
              due_at: previousLead.next_follow_up_at,
              assigned_at: previousLead.taken_at || previousLead.received_at
            }])
          ],
          stateOverrides: { rawCustomerLeads: nextLeads }
        });
      }
    }
  };

  const prepareRawCustomerLeadsForCurrentStaff = (
    leads: RawCustomerLead[],
    targetPool?: 'public' | 'private'
  ) => {
    const now = new Date().toISOString();
    const staffId = currentRoleAccount?.id || normalizeVehicleModel(currentStaff.name).replace(/\s+/g, '-');
    const staffIdSuffix = staffId.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toUpperCase() || 'STAFF';
    const isPrivateLead = targetPool ? targetPool === 'private' : currentStaff.role === 'Sales';

    return leads.map((lead) => ({
      ...lead,
      id: isPrivateLead && lead.entry_method === 'CSV Import'
        ? `${lead.id}-PRIVATE-${staffIdSuffix}`
        : lead.id,
      lead_visibility: isPrivateLead ? 'Private' as const : 'Public' as const,
      created_by_staff_id: staffId,
      created_by_staff_name: currentStaff.name,
      created_by_staff_role: currentStaff.role,
      lead_scope: isPrivateLead ? 'Taken Lead' as const : 'Public Lead' as const,
      taken_by_staff_id: isPrivateLead ? staffId : '',
      taken_by_staff_name: isPrivateLead ? currentStaff.name : '',
      taken_by_staff_role: isPrivateLead ? currentStaff.role : '',
      taken_at: isPrivateLead ? lead.taken_at || now : '',
      follow_up_status: lead.follow_up_status || 'New'
    }));
  };

  const saveIncomingRawCustomerLeads = (
    leads: RawCustomerLead[],
    entryMethod: 'CSV Import' | 'Manual Entry',
    duplicateFields: Array<'ic_no' | 'phone_no'> = [],
    excludedCount = 0,
    targetPool?: 'public' | 'private'
  ) => {
    const effectivePool = targetPool || (currentStaff.role === 'Sales' ? 'private' : 'public');
    const preparedLeads = prepareRawCustomerLeadsForCurrentStaff(
      leads.map((lead) => ({ ...lead, entry_method: entryMethod })),
      effectivePool
    );
    const beforeCount = rawCustomerLeads.length;
    const nextLeads = normalizeRawCustomerLeads([...rawCustomerLeads, ...preparedLeads]);
    const importedCount = Math.max(nextLeads.length - beforeCount, 0);
    const updatedCount = Math.max(preparedLeads.length - importedCount, 0);

    updateRawCustomerLeadsState(nextLeads);
    appendAuditLog({
      action: entryMethod === 'Manual Entry' ? 'ADD_RAW_CUSTOMER_LEAD' : 'IMPORT_RAW_CUSTOMER_LEADS',
      target_type: 'Raw Customer',
      target_id: entryMethod === 'Manual Entry' ? preparedLeads[0]?.id || 'raw_customer_lead' : 'raw_customer_leads',
      target_label: entryMethod === 'Manual Entry' ? preparedLeads[0]?.name || preparedLeads[0]?.phone_no || 'Raw customer lead' : 'Raw customer leads',
      changes: [
        {
          field: 'raw_customer_leads',
          old_value: `${beforeCount} leads`,
          new_value: `${nextLeads.length} leads (${importedCount} new, ${updatedCount} updated, ${excludedCount} excluded; ${effectivePool === 'private' ? 'Private' : 'Public'})`
        }
      ],
      stateOverrides: { rawCustomerLeads: nextLeads }
    });
    if (entryMethod === 'Manual Entry' && duplicateFields.length > 0) {
      const duplicateLabels = duplicateFields.map((field) => tr(
        field === 'ic_no' ? 'IC' : '电话号码',
        field === 'ic_no' ? 'IC' : 'phone number',
        field === 'ic_no' ? 'IC' : 'nombor telefon'
      ));

      triggerToast(tr(
        `名单已新增，但${duplicateLabels.join('和')}与现有 Lead 或客户重复。请先确认资料再跟进。`,
        `Lead added, but duplicate information was found for the ${duplicateLabels.join(' and ')} in an existing lead or customer. Please verify the details before follow-up.`,
        `Prospek ditambah, tetapi ${duplicateLabels.join(' dan ')} sepadan dengan prospek atau pelanggan sedia ada. Sila sahkan butiran sebelum susulan.`
      ), 'warning');
      return;
    }

    triggerToast(entryMethod === 'Manual Entry'
      ? tr('名单已新增', 'Lead added', "prospek ditambah")
      : excludedCount > 0
        ? tr(
          `名单已导入：${importedCount} 新增 / ${updatedCount} 更新 / ${excludedCount} 已排除`,
          `Leads imported: ${importedCount} new / ${updatedCount} updated / ${excludedCount} excluded`,
          `Prospek diimport: ${importedCount} baharu / ${updatedCount} dikemas kini / ${excludedCount} dikecualikan`
        )
        : tr(`名单已导入：${importedCount} 新增 / ${updatedCount} 更新`, `Leads imported: ${importedCount} new / ${updatedCount} updated`, `prospek yang diimport: ${importedCount} baharu / ${updatedCount} dikemas kini`));
  };

  const handleImportRawCustomerLeads = async (
    leads: RawCustomerLead[],
    targetPool?: 'public' | 'private'
  ) => {
    const [{ loadRawLeadImportExclusions }, { isRawLeadImportExcluded }] = await Promise.all([
      import('../services/relationshipMetaStorage'),
      import('../utils/rawLeadImportExclusions')
    ]);
    const exclusions = await loadRawLeadImportExclusions();
    const acceptedLeads = leads.filter((lead) => !isRawLeadImportExcluded(lead, exclusions));
    saveIncomingRawCustomerLeads(
      acceptedLeads,
      'CSV Import',
      [],
      leads.length - acceptedLeads.length,
      targetPool
    );
  };

  const handleAssignPrivateRawLeads = (leads: RawCustomerLead[], assignedStaffId: string) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以分配私人名单。', 'Only Super Admin can assign private leads.', 'Hanya Super Admin boleh memberikan prospek peribadi.'), 'error');
      return 0;
    }

    const assignedAccount = roleAccounts.find((account) => (
      account.id === assignedStaffId &&
      account.status === 'Active' &&
      account.role !== 'Super Admin'
    ));
    if (!assignedAccount) {
      triggerToast(tr('请选择一个 Active Admin 或 Sales。', 'Choose an active Admin or Sales account.', 'Pilih akaun Admin atau Sales yang aktif.'), 'error');
      return 0;
    }

    const currentLeadIds = new Set(rawCustomerLeads.map((lead) => lead.id));
    const assignableLeads = leads.filter((lead) => (
      currentLeadIds.has(lead.id) &&
      lead.lead_visibility === 'Private' &&
      lead.taken_by_staff_name !== assignedAccount.name
    ));
    if (assignableLeads.length === 0) {
      triggerToast(tr('没有可分配的私人名单。', 'No private leads are available to assign.', 'Tiada prospek peribadi untuk diberikan.'), 'error');
      return 0;
    }

    const assignedLeadIds = new Set(assignableLeads.map((lead) => lead.id));
    const assignedAt = new Date().toISOString();
    const nextLeads = normalizeRawCustomerLeads(rawCustomerLeads.map((lead) => (
      assignedLeadIds.has(lead.id)
        ? {
          ...lead,
          lead_scope: 'Taken Lead' as const,
          taken_by_staff_id: assignedAccount.id,
          taken_by_staff_name: assignedAccount.name,
          taken_by_staff_role: assignedAccount.role,
          taken_at: assignedAt
        }
        : lead
    )));
    const assignmentAuditEntries: AuditLogEntry[] = assignableLeads.map((lead, index) => ({
      id: newId('AUDIT'),
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      action: 'ASSIGN_PRIVATE_RAW_CUSTOMER_LEAD',
      target_type: 'Raw Customer',
      target_id: lead.id,
      target_label: lead.name || lead.phone_no || lead.lead_id || 'Raw customer lead',
      changes: createAuditChanges({
        taken_by_staff_id: lead.taken_by_staff_id || '',
        taken_by_staff_name: lead.taken_by_staff_name || '',
        taken_by_staff_role: lead.taken_by_staff_role || ''
      }, {
        taken_by_staff_id: assignedAccount.id,
        taken_by_staff_name: assignedAccount.name,
        taken_by_staff_role: assignedAccount.role
      }),
      ip_address: clientContext.ip_address,
      user_agent: clientContext.user_agent,
      created_at: assignedAt
    }));

    setRawCustomerLeads(nextLeads);
    writeLocalDashboardValue('rawCustomerLeads', nextLeads);
    updateAuditLogsState([...assignmentAuditEntries, ...auditLogs], { rawCustomerLeads: nextLeads });
    triggerToast(tr(
      `${assignableLeads.length} 个私人名单已分配给 ${assignedAccount.name}。`,
      `${assignableLeads.length} private leads assigned to ${assignedAccount.name}.`,
      `${assignableLeads.length} prospek peribadi diberikan kepada ${assignedAccount.name}.`
    ));
    return assignableLeads.length;
  };

  const handleDeleteRawLeads = (leads: RawCustomerLead[]) => {
    const currentLeadIds = new Set(rawCustomerLeads.map((lead) => lead.id));
    const deletableLeads = leads.filter((lead) => (
      currentLeadIds.has(lead.id)
      && (
        currentStaff.role === 'Super Admin'
        || lead.created_by_staff_name === currentStaff.name
        || lead.taken_by_staff_name === currentStaff.name
      )
    ));
    const deletableIds = new Set(deletableLeads.map((lead) => lead.id));

    if (deletableLeads.length === 0) {
      triggerToast(tr('你只能删除自己创建或负责的名单。', 'You can only delete leads you created or own.', "Anda hanya boleh memadam prospek yang anda cipta atau miliki."), 'error');
      return 0;
    }

    markRawLeadsDeletedForSync(Array.from(deletableIds));
    const nextLeads = normalizeRawCustomerLeads(rawCustomerLeads.filter((item) => !deletableIds.has(item.id)));
    setRawCustomerLeads(nextLeads);
    writeLocalDashboardValue('rawCustomerLeads', nextLeads);
    const deletedAt = new Date().toISOString();
    const deletionAuditEntries: AuditLogEntry[] = deletableLeads.map((lead, index) => ({
        id: newId('AUDIT'),
        staff_name: currentStaff.name,
        staff_role: currentStaff.role,
        action: 'DELETE_RAW_CUSTOMER_LEAD',
        target_type: 'Raw Customer',
        target_id: lead.id,
        target_label: lead.name || lead.phone_no || lead.lead_id || 'Raw customer lead',
        changes: [
          {
            field: 'raw_customer_leads',
            old_value: 'Lead present',
            new_value: 'Deleted'
          }
        ],
        ip_address: clientContext.ip_address,
        user_agent: clientContext.user_agent,
        created_at: deletedAt
      }));
    updateAuditLogsState([...deletionAuditEntries, ...auditLogs], { rawCustomerLeads: nextLeads });
    triggerToast(deletableLeads.length === 1
      ? tr('名单已删除。', 'Lead deleted.', "Prospek dipadam.")
      : tr(
        `${deletableLeads.length} 个名单已删除。`,
        `${deletableLeads.length} leads deleted.`,
        `${deletableLeads.length} prospek dipadam.`
      ));
    return deletableLeads.length;
  };

  const handleDeleteRawLead = (lead: RawCustomerLead) => handleDeleteRawLeads([lead]) > 0;

  const handleAddRawCustomerLead = (lead: RawCustomerLead, targetPool?: 'public' | 'private') => {
    const shouldCheckDuplicates = ['Sales', 'Admin', 'Super Admin'].includes(currentStaff.role);
    const candidateIc = normalizeRiskValue('ic_no', lead.ic_no || '');
    const candidatePhone = normalizeRiskValue('phone_no', lead.phone_no || '');
    const duplicateFields: Array<'ic_no' | 'phone_no'> = [];

    if (shouldCheckDuplicates) {
      const duplicateIc = candidateIc.length === 12 && (
        rawCustomerLeads.some((existingLead) => normalizeRiskValue('ic_no', existingLead.ic_no || '') === candidateIc)
        || applications.some((application) => normalizeRiskValue('ic_no', application.ic_no || '') === candidateIc)
      );
      const duplicatePhone = candidatePhone.length >= 7 && (
        rawCustomerLeads.some((existingLead) => normalizeRiskValue('phone_no', existingLead.phone_no || '') === candidatePhone)
        || applications.some((application) => normalizeRiskValue('phone_no', application.phone_no || '') === candidatePhone)
      );

      if (duplicateIc) {
        duplicateFields.push('ic_no');
      }
      if (duplicatePhone) {
        duplicateFields.push('phone_no');
      }
    }

    saveIncomingRawCustomerLeads([lead], 'Manual Entry', duplicateFields, 0, targetPool);
  };

  return {
    handleOpenRawLeadWhatsApp,
    releaseRawLeads,
    handleReleaseRawLead,
    handleUpdateRawLeadFollowUp,
    handleImportRawCustomerLeads,
    handleAssignPrivateRawLeads,
    handleDeleteRawLeads,
    handleDeleteRawLead,
    handleAddRawCustomerLead
  };
}
