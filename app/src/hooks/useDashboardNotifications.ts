import { useEffect, useMemo } from 'react';
import { getLoanPendingAction, getLoanPendingWith, LoanStatus, type CalendarNote, type CustomMission, type CustomerRawMatch, type LoanApplication, type NotificationItem, type RawCustomerLead, type RoleAccount, type RoleAccountRole, type RoleNavAccessSetting, type VehicleCatalogItem } from '../types';
import { resolveTaskAssignmentRole, type TaskAssignmentKey } from '../data/roleNavAccess';
import type { DashboardState } from '../services/dashboardRepository';
import type { StaffSession } from './useStaffSessionAuth';
import { shouldTrackRejectedLoanMissingCode } from '../utils/rejectCodes';
import { getApplicationIdsRequiringVehicleStock } from '../utils/vehicleStock';

type NotificationCandidate = Omit<NotificationItem, 'id' | 'created_at' | 'read_by' | 'resolved_at'> & { created_at?: string };

const MISSION_DUE_SOON_MS = 3 * 24 * 60 * 60 * 1000;
const RAW_LEAD_ASSIGNMENT_NOTIFICATION_BASELINE = new Date('2026-07-12T05:58:34.000Z').getTime();

const parseNotificationDate = (value: string) => {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    return new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]));
  }
  return new Date(value);
};

export const createNotificationId = () => `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const uniqueStrings = (values: string[]) => Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

export const uniqueRoles = (values: RoleAccountRole[]) => Array.from(new Set(values));

export const normalizeNotificationList = (list: NotificationItem[]) => (
  list
    .filter((notification) => notification && notification.id && notification.dedupe_key)
    .map((notification) => ({
      ...notification,
      recipient_staff_names: uniqueStrings(notification.recipient_staff_names || []),
      recipient_roles: uniqueRoles(notification.recipient_roles || []),
      read_by: uniqueStrings(notification.read_by || [])
    }))
    .sort((left, right) => (
      Number(Boolean(left.resolved_at)) - Number(Boolean(right.resolved_at)) ||
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    ))
    .slice(0, 500)
);

const isNotificationVisibleToStaff = (notification: NotificationItem, staff: StaffSession) => (
  notification.recipient_staff_names.includes(staff.name) ||
  notification.recipient_roles.includes(staff.role)
);

const isResolvableByStaff = (notification: NotificationItem, staff: StaffSession) => (
  notification.recipient_staff_names.includes(staff.name) ||
  (
    notification.recipient_staff_names.length === 0 &&
    notification.recipient_roles.includes(staff.role)
  )
);

const getCustomMissionRange = (mission: CustomMission) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (mission.timeframe === 'this_month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (mission.timeframe === 'last_month') {
    start.setMonth(start.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (mission.timeframe === 'last_30_days') {
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const customStart = parseNotificationDate(mission.custom_start_date || '');
  const customEnd = parseNotificationDate(mission.custom_end_date || '');

  if (!Number.isNaN(customStart.getTime()) && !Number.isNaN(customEnd.getTime())) {
    customStart.setHours(0, 0, 0, 0);
    customEnd.setHours(23, 59, 59, 999);
    return { start: customStart, end: customEnd };
  }

  return { start, end };
};

const isWithinCustomMissionRange = (dateValue: string, mission: CustomMission) => {
  const date = parseNotificationDate(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const { start, end } = getCustomMissionRange(mission);
  return date >= start && date <= end;
};

const getScopedMissionStaffNames = (mission: CustomMission, roleAccounts: RoleAccount[]) => {
  const activeAccounts = roleAccounts.filter((account) => account.status === 'Active');
  const scopedAccounts = activeAccounts.filter((account) => {
    if (mission.scope_type === 'all_staff') {
      return account.role === 'Sales' || account.role === 'Admin' || account.role === 'Operations Manager' || account.role === 'Super Admin';
    }

    if (mission.scope_type === 'role') {
      return account.role === mission.scope_value;
    }

    return account.name === mission.scope_value;
  });

  return uniqueStrings(scopedAccounts.map((account) => account.name));
};

const getCustomMissionProgressValue = (
  mission: CustomMission,
  staffName: string,
  applications: LoanApplication[],
  rawCustomerLeads: RawCustomerLead[],
  matchedRawLeadIds: Set<string>
) => {
  if (mission.metric_type === 'top_sales_approved') {
    return applications.filter((application) => (
      application.handler_name === staffName &&
      application.status === LoanStatus.APPROVE &&
      isWithinCustomMissionRange(application.submitted_at, mission)
    )).length;
  }

  if (mission.metric_type === 'raw_lead_conversion') {
    return rawCustomerLeads.filter((lead) => (
      lead.taken_by_staff_name === staffName &&
      Boolean(lead.taken_at && isWithinCustomMissionRange(lead.taken_at, mission)) &&
      matchedRawLeadIds.has(lead.id)
    )).length;
  }

  const responseMinutes = rawCustomerLeads
    .filter((lead) => (
      lead.taken_by_staff_name === staffName &&
      Boolean(lead.taken_at && lead.last_follow_up_at && isWithinCustomMissionRange(lead.taken_at, mission))
    ))
    .map((lead) => {
      const takenTime = new Date(lead.taken_at || '').getTime();
      const responseTime = new Date(lead.last_follow_up_at || '').getTime();
      return Math.max(Math.round((responseTime - takenTime) / 60000), 0);
    })
    .filter((minutes) => Number.isFinite(minutes));

  if (responseMinutes.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.round(responseMinutes.reduce((sum, minutes) => sum + minutes, 0) / responseMinutes.length);
};

const isCustomMissionTargetReached = (
  mission: CustomMission,
  value: number
) => {
  const target = Math.max(Number(mission.target_value) || 1, 1);

  if (mission.metric_type === 'fast_response') {
    return Number.isFinite(value) && value <= target;
  }

  return value >= target;
};

const formatCustomMissionProgressValue = (mission: CustomMission, value: number) => {
  if (mission.metric_type === 'fast_response') {
    return Number.isFinite(value) ? `${value} min avg` : 'No response yet';
  }

  if (mission.metric_type === 'raw_lead_conversion') {
    return `${value} converted`;
  }

  return `${value} approved`;
};

const buildNotificationCandidates = ({
  applications,
  calendarNotes,
  rawCustomerLeads,
  rawCustomerMatches,
  roleAccounts,
  roleNavAccess,
  customMissions,
  auditLogs,
  vehicleCatalog
}: {
  applications: LoanApplication[];
  calendarNotes: CalendarNote[];
  rawCustomerLeads: RawCustomerLead[];
  rawCustomerMatches: CustomerRawMatch[];
  roleAccounts: RoleAccount[];
  roleNavAccess: RoleNavAccessSetting[];
  customMissions: CustomMission[];
  auditLogs: DashboardState['auditLogs'];
  vehicleCatalog: VehicleCatalogItem[];
}): NotificationCandidate[] => {
  const candidates: NotificationCandidate[] = [];
  const matchedRawLeadIds = new Set(rawCustomerMatches.map((match) => match.raw_customer_id));
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const isDueByToday = (value?: string) => {
    if (!value) {
      return false;
    }

    const date = parseNotificationDate(value);
    return !Number.isNaN(date.getTime()) && date.getTime() <= endOfToday.getTime();
  };
  const formatReminderDate = (value?: string) => {
    if (!value) {
      return 'today';
    }

    const date = parseNotificationDate(value);
    return Number.isNaN(date.getTime())
      ? 'today'
      : date.toLocaleString('en-MY', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
  };

  rawCustomerLeads.forEach((lead) => {
    const assignedAt = new Date(lead.taken_at || '').getTime();
    const assignedRole = lead.taken_by_staff_role || roleAccounts.find((account) => (
      account.name === lead.taken_by_staff_name
    ))?.role;

    if (
      !lead.taken_by_staff_name ||
      assignedRole === 'Super Admin' ||
      !Number.isFinite(assignedAt) ||
      assignedAt < RAW_LEAD_ASSIGNMENT_NOTIFICATION_BASELINE
    ) {
      return;
    }

    candidates.push({
      type: 'raw_lead_assigned',
      severity: 'info',
      title: 'New raw lead assigned',
      message: `${lead.name || lead.phone_no || lead.lead_id || 'Raw lead'} is assigned to ${lead.taken_by_staff_name}.`,
      recipient_staff_names: [lead.taken_by_staff_name],
      recipient_roles: [],
      target_type: 'raw_lead',
      target_id: lead.id,
      target_label: lead.name || lead.phone_no || lead.lead_id || lead.id,
      created_at: lead.taken_at,
      dedupe_key: `raw_lead_assigned:${lead.id}:${lead.taken_by_staff_name}`
    });
  });

  calendarNotes
    .filter((note) => note.staff_role === 'Super Admin' && Boolean(note.assigned_to) && !note.completed_at)
    .forEach((note) => {
      const assignedTo = note.assigned_to || note.staff_name;
      const taskDate = parseNotificationDate(note.date_at);
      const taskDateLabel = Number.isNaN(taskDate.getTime())
        ? note.date_at
        : taskDate.toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });

      candidates.push({
        type: 'calendar_task_assigned',
        severity: 'warning',
        title: 'New calendar task assigned',
        message: `${note.title} was assigned by ${note.staff_name} for ${taskDateLabel}.${note.body ? ` ${note.body}` : ''}`,
        recipient_staff_names: [assignedTo],
        recipient_roles: [],
        target_type: 'calendar_note',
        target_id: note.id,
        target_label: note.title,
        created_at: note.created_at,
        dedupe_key: `calendar_task_assigned:${note.id}:${assignedTo}`
      });

      (note.comments || []).forEach((comment) => {
        const recipient = comment.staff_name === note.staff_name
          ? assignedTo
          : note.staff_name;

        if (!recipient || recipient === comment.staff_name) {
          return;
        }

        candidates.push({
          type: 'calendar_task_comment',
          severity: 'info',
          title: 'New calendar task reply',
          message: `${comment.staff_name} replied to ${note.title}: ${comment.body}`,
          recipient_staff_names: [recipient],
          recipient_roles: [],
          target_type: 'calendar_note',
          target_id: note.id,
          target_label: note.title,
          created_at: comment.created_at,
          dedupe_key: `calendar_task_comment:${note.id}:${comment.id}`
        });
      });
    });

  const getTaskRecipientRoles = (taskKey: TaskAssignmentKey): RoleAccountRole[] => {
    const assignedRole = resolveTaskAssignmentRole(taskKey, roleNavAccess);
    const hasActiveAssignedRole = roleAccounts.some((account) => (
      account.status === 'Active' && account.role === assignedRole
    ));

    return assignedRole === 'Super Admin' || hasActiveAssignedRole
      ? [assignedRole]
      : ['Super Admin'];
  };
  const getTaskRecipients = (taskKey: TaskAssignmentKey, namedOwners: string[] = []) => {
    const [effectiveRole] = getTaskRecipientRoles(taskKey);
    const configuredRole = resolveTaskAssignmentRole(taskKey, roleNavAccess);

    return effectiveRole === configuredRole && effectiveRole !== 'Super Admin' && namedOwners.length > 0
      ? { recipient_staff_names: namedOwners, recipient_roles: [] as RoleAccountRole[] }
      : { recipient_staff_names: [] as string[], recipient_roles: [effectiveRole] };
  };
  const applicationIdsRequiringStock = getApplicationIdsRequiringVehicleStock(applications, vehicleCatalog);

  applications.forEach((application) => {
    const pendingWith = getLoanPendingWith(application);
    const pendingAction = getLoanPendingAction(application);
    const isCashPurchase = application.purchase_method === 'Cash';
    const salesTaskRecipients = getTaskRecipients('sales_application_follow_up', [application.handler_name]);
    const adminTaskRecipients = getTaskRecipients(
      'admin_application_review',
      application.admin_owner_name ? [application.admin_owner_name] : []
    );
    const pendingKey = application.pending_since || application.submitted_at;
    const bankNeedsMoreInfo = (application.bank_applications || []).some((bank) => bank.status === 'Need More Info');
    const latestRejectedBank = [...(application.bank_applications || [])].reverse().find((bank) => bank.status === 'Rejected');

    if (pendingWith === 'Handler' && pendingAction === 'Complete Application') {
      candidates.push({
        type: 'loan_sales_review_required',
        severity: 'warning',
        title: 'New application needs Sales review',
        message: `${application.applicant_name} submitted an application. Check and complete all details before notifying Admin.`,
        ...salesTaskRecipients,
        target_type: 'loan',
        target_id: application.id,
        target_label: application.applicant_name,
        created_at: application.pending_since || application.submitted_at,
        dedupe_key: `loan_sales_review_required:${application.id}:${pendingKey}`
      });
    }

    if (pendingWith === 'Admin' && pendingAction !== 'None') {
      candidates.push({
        type: 'loan_admin_action_required',
        severity: 'warning',
        title: isCashPurchase
          ? 'New cash purchase review'
          : pendingAction === 'Review Application' ? 'New loan application review' : 'Loan application ready for Admin',
        message: isCashPurchase
          ? `${application.applicant_name} is waiting for Admin cash review. No bank submission is required.`
          : pendingAction === 'Submit to Bank' && latestRejectedBank?.next_action
            ? `${application.applicant_name} is waiting for Admin after ${latestRejectedBank.bank_name || 'the bank'} rejected the application. Next step: ${latestRejectedBank.next_action}.`
            : `${application.applicant_name} is waiting for Admin: ${pendingAction}.`,
        ...adminTaskRecipients,
        target_type: 'loan',
        target_id: application.id,
        target_label: application.applicant_name,
        created_at: application.pending_since || application.submitted_at,
        dedupe_key: `loan_admin_action_required:${application.id}:${pendingAction}:${pendingKey}`
      });
    }

    if (applicationIdsRequiringStock.has(application.id)) {
      candidates.push({
        type: 'vehicle_stock_required',
        severity: 'warning',
        title: 'Stock and costing required',
        message: `${application.handler_name} completed ${application.applicant_name}'s application, but "${application.vehicle_model}" has no available stock. Add a stock unit and record its cost.`,
        recipient_staff_names: [],
        recipient_roles: getTaskRecipientRoles('stock_replenishment'),
        target_type: 'loan',
        target_id: application.id,
        target_label: application.applicant_name,
        created_at: application.pending_since || application.submitted_at,
        dedupe_key: `vehicle_stock_required:${application.id}`
      });
    }

    if (pendingWith === 'Handler' && pendingAction === 'Provide Documents' && !bankNeedsMoreInfo) {
      candidates.push({
        type: 'loan_documents_required',
        severity: 'warning',
        title: isCashPurchase ? 'Cash purchase documents required' : 'Loan documents required',
        message: isCashPurchase
          ? `${application.applicant_name} needs cash purchase documents from ${application.handler_name}.`
          : latestRejectedBank?.next_action
            ? `${application.applicant_name} is waiting for ${application.handler_name}. Next step: ${latestRejectedBank.next_action}.${latestRejectedBank.status_reason ? ` ${latestRejectedBank.status_reason}` : ''}`
            : `${application.applicant_name} is waiting for documents from ${application.handler_name}.`,
        ...salesTaskRecipients,
        target_type: 'loan',
        target_id: application.id,
        target_label: application.applicant_name,
        created_at: application.pending_since || application.submitted_at,
        dedupe_key: `loan_documents_required:${application.id}:${pendingKey}`
      });

      const pendingSinceMs = new Date(pendingKey).getTime();
      const latestHandlerDocument = [...(application.payslip_documents || [])]
        .filter((document) => {
          const uploadedAtMs = new Date(document.uploaded_at).getTime();
          return document.uploaded_by === application.handler_name &&
            !Number.isNaN(uploadedAtMs) &&
            (Number.isNaN(pendingSinceMs) || uploadedAtMs >= pendingSinceMs);
        })
        .sort((left, right) => new Date(right.uploaded_at).getTime() - new Date(left.uploaded_at).getTime())[0];

      if (latestHandlerDocument) {
        candidates.push({
          type: 'loan_documents_uploaded',
          severity: 'info',
          title: 'Customer documents uploaded',
          message: `${application.handler_name} uploaded ${latestHandlerDocument.file_name} for ${application.applicant_name}.`,
          ...adminTaskRecipients,
          target_type: 'loan',
          target_id: application.id,
          target_label: application.applicant_name,
          created_at: latestHandlerDocument.uploaded_at,
          dedupe_key: `loan_documents_uploaded:${application.id}:${latestHandlerDocument.id}`
        });
      }
    }

    if (pendingWith === 'Handler' && pendingAction === 'Choose Close or Resubmit') {
      candidates.push({
        type: 'loan_rejected_action_required',
        severity: 'critical',
        title: 'Rejected loan needs Sales action',
        message: latestRejectedBank?.next_action
          ? `${application.applicant_name} was rejected by ${latestRejectedBank.bank_name || 'the bank'}. Next step: ${latestRejectedBank.next_action}.`
          : `${application.applicant_name} was rejected. Close the file or submit updated documents.`,
        ...salesTaskRecipients,
        target_type: 'loan',
        target_id: application.id,
        target_label: application.applicant_name,
        created_at: application.pending_since || application.submitted_at,
        dedupe_key: `loan_rejected_action_required:${application.id}:${pendingKey}`
      });
    }

    if (application.status === LoanStatus.APPROVE && pendingWith === 'Handler' && pendingAction === 'Contact Approved Customer') {
      candidates.push({
        type: 'loan_approved',
        severity: 'success',
        title: isCashPurchase ? 'Cash purchase approved' : 'Loan approved',
        message: isCashPurchase
          ? `${application.applicant_name}'s cash purchase passed Admin review. Confirm customer acceptance.`
          : `${application.applicant_name} has an approved bank application. Contact the customer.`,
        ...salesTaskRecipients,
        target_type: 'loan',
        target_id: application.id,
        target_label: application.applicant_name,
        created_at: application.pending_since || application.submitted_at,
        dedupe_key: `loan_approved:${application.id}:${pendingKey}`
      });
    }

    if (isDueByToday(application.customer_call_back_at) && ![LoanStatus.APPROVE, LoanStatus.CANCELLED].includes(application.status)) {
      candidates.push({
        type: 'customer_call_back_due',
        severity: 'warning',
        title: 'Customer call-back due',
        message: `${application.applicant_name} has a customer call-back due ${formatReminderDate(application.customer_call_back_at)}.`,
        ...salesTaskRecipients,
        target_type: 'customer',
        target_id: application.id,
        target_label: application.applicant_name,
        dedupe_key: `customer_call_back_due:${application.id}:${(application.customer_call_back_at || '').slice(0, 10)}`
      });
    }

    (application.bank_applications || []).forEach((bank) => {
      if (pendingWith === 'Closed') {
        return;
      }

      if (bank.status !== 'Need More Info') {
        if (
          pendingWith === 'Bank' &&
          (!application.active_bank_application_id || application.active_bank_application_id === bank.id) &&
          isDueByToday(bank.next_follow_up_at) &&
          !['Approved', 'Rejected', 'Cancelled'].includes(bank.status)
        ) {
          candidates.push({
            type: 'bank_follow_up_due',
            severity: bank.status === 'Submitted' || bank.status === 'Pending Review' ? 'warning' : 'info',
            title: 'Bank follow-up due',
            message: `${bank.bank_name || 'Bank'} follow-up for ${application.applicant_name} is due ${formatReminderDate(bank.next_follow_up_at)}. ${bank.next_action || bank.status_reason || 'Check bank application details.'}`,
            ...adminTaskRecipients,
            target_type: 'loan',
            target_id: application.id,
            target_label: application.applicant_name,
            dedupe_key: `bank_follow_up_due:${application.id}:${bank.id}:${(bank.next_follow_up_at || '').slice(0, 10)}`
          });
        }

        return;
      }

      if (
        pendingWith !== 'Handler' ||
        (application.active_bank_application_id && application.active_bank_application_id !== bank.id)
      ) {
        return;
      }

      candidates.push({
        type: 'bank_need_more_info',
        severity: 'warning',
        title: 'Bank Need More Info',
        message: `${bank.bank_name || 'Bank'} needs more info for ${application.applicant_name}. ${bank.next_action || bank.status_reason || 'Check bank application details.'}`,
        ...salesTaskRecipients,
        target_type: 'loan',
        target_id: application.id,
        target_label: application.applicant_name,
        dedupe_key: `bank_need_more_info:${application.id}:${bank.id}`
      });
    });

    if (shouldTrackRejectedLoanMissingCode(application, auditLogs)) {
      candidates.push({
        type: 'rejected_loan_missing_code',
        severity: 'critical',
        title: 'Rejected loan missing CODE',
        message: `${application.applicant_name} is rejected but the final loan CODE is still empty.`,
        ...adminTaskRecipients,
        target_type: 'loan',
        target_id: application.id,
        target_label: application.applicant_name,
        dedupe_key: `rejected_loan_missing_code:${application.id}`
      });
    }
  });

  customMissions
    .filter((mission) => mission.status === 'Active')
    .forEach((mission) => {
      const { end } = getCustomMissionRange(mission);
      const millisecondsToEnd = end.getTime() - now.getTime();
      const scopedStaffNames = getScopedMissionStaffNames(mission, roleAccounts);

      if (millisecondsToEnd >= 0 && millisecondsToEnd <= MISSION_DUE_SOON_MS) {
        candidates.push({
          type: 'mission_due_soon',
          severity: 'warning',
          title: 'Mission due soon',
          message: `${mission.title} ends on ${end.toLocaleDateString('en-MY')}. Check current staff progress before it closes.`,
          recipient_staff_names: scopedStaffNames,
          recipient_roles: ['Admin', 'Super Admin'],
          target_type: 'mission',
          target_id: mission.id,
          target_label: mission.title,
          dedupe_key: `mission_due_soon:${mission.id}:${end.toISOString().slice(0, 10)}`
        });
      }

      scopedStaffNames.forEach((staffName) => {
        const value = getCustomMissionProgressValue(mission, staffName, applications, rawCustomerLeads, matchedRawLeadIds);

        if (!isCustomMissionTargetReached(mission, value)) {
          return;
        }

        candidates.push({
          type: 'custom_mission_target_reached',
          severity: 'success',
          title: 'Custom Mission target reached',
          message: `${staffName} reached ${mission.title}: ${formatCustomMissionProgressValue(mission, value)} / target ${mission.target_value}.`,
          recipient_staff_names: [staffName],
          recipient_roles: getTaskRecipientRoles('mission_target_review'),
          target_type: 'mission',
          target_id: mission.id,
          target_label: mission.title,
          dedupe_key: `custom_mission_target_reached:${mission.id}:${staffName}`
        });
      });
    });

  return candidates;
};

const mergeSystemNotifications = (
  currentNotifications: NotificationItem[],
  candidates: NotificationCandidate[]
) => {
  const now = new Date().toISOString();
  const candidatesByKey = new Map(candidates.map((candidate) => [candidate.dedupe_key, candidate]));
  const existingByKey = new Map(currentNotifications.map((notification) => [notification.dedupe_key, notification]));
  const mergedByKey = new Map<string, NotificationItem>();

  currentNotifications.forEach((notification) => {
    const activeCandidate = candidatesByKey.get(notification.dedupe_key);

    if (
      (
        notification.type === 'rejected_loan_missing_code' ||
        notification.type === 'raw_lead_assigned' ||
        notification.type === 'bank_submission_required'
      ) &&
      !activeCandidate
    ) {
      return;
    }

    if (activeCandidate) {
      const assignedHandlerHasRead = (
        notification.type === 'raw_lead_assigned' &&
        notification.recipient_staff_names.some((staffName) => notification.read_by.includes(staffName))
      );
      const uploadedDocumentHasBeenAcknowledged = (
        notification.type === 'loan_documents_uploaded' &&
        notification.read_by.length > 0
      );
      const nextNotification: NotificationItem = {
        ...notification,
        ...activeCandidate,
        id: notification.id,
        created_at: notification.created_at,
        read_by: notification.read_by || []
      };

      if (assignedHandlerHasRead || uploadedDocumentHasBeenAcknowledged) {
        nextNotification.resolved_at = notification.resolved_at || now;
      } else if (notification.type === 'raw_lead_assigned' && notification.resolved_at) {
        nextNotification.resolved_at = notification.resolved_at;
      } else {
        delete nextNotification.resolved_at;
      }

      mergedByKey.set(notification.dedupe_key, nextNotification);
      return;
    }

    // Comment mentions are event notifications rather than state-derived
    // candidates. Keep them active until the named recipient acknowledges
    // the notification instead of resolving them on the next reconciliation.
    if (notification.type === 'internal_comment_tagged') {
      mergedByKey.set(notification.dedupe_key, notification);
      return;
    }

    mergedByKey.set(notification.dedupe_key, {
      ...notification,
      resolved_at: notification.resolved_at || now
    });
  });

  candidates.forEach((candidate) => {
    if (existingByKey.has(candidate.dedupe_key)) {
      return;
    }

    mergedByKey.set(candidate.dedupe_key, {
      ...candidate,
      id: createNotificationId(),
      created_at: candidate.created_at || now,
      read_by: []
    });
  });

  return normalizeNotificationList(Array.from(mergedByKey.values()));
};

export const areJsonLikeValuesEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) {
    return true;
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
      return false;
    }

    return left.every((item, index) => areJsonLikeValuesEqual(item, right[index]));
  }

  if (
    left &&
    right &&
    typeof left === 'object' &&
    typeof right === 'object'
  ) {
    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKeys = Object.keys(leftRecord);
    const rightKeys = Object.keys(rightRecord);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every((key) => (
      Object.prototype.hasOwnProperty.call(rightRecord, key) &&
      areJsonLikeValuesEqual(leftRecord[key], rightRecord[key])
    ));
  }

  return false;
};

const areNotificationsEqual = (left: NotificationItem[], right: NotificationItem[]) => (
  areJsonLikeValuesEqual(left, right)
);

type UseDashboardNotificationsOptions = {
  applications: LoanApplication[];
  auditLogs: DashboardState['auditLogs'];
  calendarNotes: CalendarNote[];
  currentStaff: StaffSession;
  customMissions: CustomMission[];
  notifications: NotificationItem[];
  rawCustomerLeads: RawCustomerLead[];
  rawCustomerMatches: CustomerRawMatch[];
  roleAccounts: RoleAccount[];
  roleNavAccess: RoleNavAccessSetting[];
  vehicleCatalog: VehicleCatalogItem[];
  syncStatus: 'loading' | 'cached' | 'firebase' | 'local' | 'error';
  consumeCloudOriginatedReconciliation: () => boolean;
  updateNotificationsState: (updatedList: NotificationItem[], stateOverrides?: Partial<DashboardState>, skipRemoteSave?: boolean) => void;
};

export function useDashboardNotifications({
  applications,
  auditLogs,
  calendarNotes,
  currentStaff,
  customMissions,
  notifications,
  rawCustomerLeads,
  rawCustomerMatches,
  roleAccounts,
  roleNavAccess,
  vehicleCatalog,
  syncStatus,
  consumeCloudOriginatedReconciliation,
  updateNotificationsState
}: UseDashboardNotificationsOptions) {
  useEffect(() => {
    if (syncStatus !== 'firebase' && syncStatus !== 'local') {
      return;
    }

    const skipRemoteSave = consumeCloudOriginatedReconciliation();

    const nextNotifications = mergeSystemNotifications(
      notifications,
      buildNotificationCandidates({
        applications,
        calendarNotes,
        rawCustomerLeads,
        rawCustomerMatches,
        roleAccounts,
        roleNavAccess,
        customMissions,
        auditLogs,
        vehicleCatalog
      })
    );

    if (areNotificationsEqual(notifications, nextNotifications)) {
      return;
    }

    updateNotificationsState(nextNotifications, {
      applications,
      calendarNotes,
      rawCustomerLeads,
      roleAccounts,
      customMissions,
      auditLogs
    }, skipRemoteSave);
  }, [applications, auditLogs, calendarNotes, consumeCloudOriginatedReconciliation, customMissions, notifications, rawCustomerLeads, rawCustomerMatches, roleAccounts, roleNavAccess, syncStatus, updateNotificationsState, vehicleCatalog]);

  const visibleNotifications = useMemo(() => (
    notifications.filter((notification) => isNotificationVisibleToStaff(notification, currentStaff))
  ), [currentStaff, notifications]);

  const unreadNotificationCount = useMemo(() => (
    visibleNotifications.filter((notification) => (
      !notification.resolved_at &&
      !notification.read_by.includes(currentStaff.name)
    )).length
  ), [currentStaff.name, visibleNotifications]);

  const handleMarkNotificationRead = (notificationId: string) => {
    const now = new Date().toISOString();
    const nextNotifications = notifications.map((notification) => (
      notification.id === notificationId
        ? {
          ...notification,
          read_by: uniqueStrings([...(notification.read_by || []), currentStaff.name]),
          resolved_at: (
            notification.type === 'raw_lead_assigned' ||
            notification.type === 'internal_comment_tagged' ||
            notification.type === 'loan_documents_uploaded'
          ) && isResolvableByStaff(notification, currentStaff)
            ? notification.resolved_at || now
            : notification.resolved_at
        }
        : notification
    ));

    updateNotificationsState(nextNotifications);
  };

  const handleMarkAllNotificationsRead = (notificationIds?: string[]) => {
    const now = new Date().toISOString();
    const visibleNotificationIds = new Set(notificationIds || visibleNotifications.map((notification) => notification.id));
    const nextNotifications = notifications.map((notification) => (
      visibleNotificationIds.has(notification.id)
        ? {
          ...notification,
          read_by: uniqueStrings([...(notification.read_by || []), currentStaff.name]),
          resolved_at: (
            notification.type === 'raw_lead_assigned' ||
            notification.type === 'internal_comment_tagged' ||
            notification.type === 'loan_documents_uploaded'
          ) && isResolvableByStaff(notification, currentStaff)
            ? notification.resolved_at || now
            : notification.resolved_at
        }
        : notification
    ));

    updateNotificationsState(nextNotifications);
  };

  return {
    handleMarkAllNotificationsRead,
    handleMarkNotificationRead,
    unreadNotificationCount,
    visibleNotifications
  };
}
