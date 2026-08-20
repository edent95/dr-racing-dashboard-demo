import {
  AuditLogEntry,
  CalendarNote,
  LoanApplication,
  NotificationItem,
  RoleAccount
} from '../types';
import { getLoanPendingAction, getLoanPendingWith } from '../types';
import { getMissingDocumentLabels } from './documentChecklist';

export type CompletedTaskCategory =
  | 'newApplication'
  | 'missing'
  | 'lead'
  | 'cash'
  | 'bank'
  | 'reminder'
  | 'mission'
  | 'vehicle'
  | 'delivery';

export interface TaskCompletionDescriptor {
  category: CompletedTaskCategory;
  task_type: string;
  due_at?: string;
  assigned_at?: string;
}

export interface CompletedTaskEvent extends TaskCompletionDescriptor {
  id: string;
  staff_name: string;
  staff_role: string;
  source_type: string;
  source_id: string;
  source_label: string;
  completed_at: string;
  was_overdue: boolean;
}

const TASK_COMPLETION_FIELD_PREFIX = 'task_completion:';

const parseDateValue = (value?: string) => {
  if (!value) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59.999` : value;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const wasCompletedOverdue = (dueAt: string | undefined, completedAt: string) => {
  const dueDate = parseDateValue(dueAt);
  const completedDate = parseDateValue(completedAt);
  return Boolean(dueDate && completedDate && completedDate.getTime() > dueDate.getTime());
};

const uniqueDescriptors = (descriptors: TaskCompletionDescriptor[]) => {
  const seen = new Set<string>();

  return descriptors.filter((descriptor) => {
    const key = `${descriptor.category}:${descriptor.task_type}:${descriptor.due_at || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getWorkflowCompletionDescriptor = (
  application: LoanApplication,
  action: ReturnType<typeof getLoanPendingAction>
): TaskCompletionDescriptor | null => {
  const isCash = application.purchase_method === 'Cash';

  if (action === 'Complete Application') {
    return { category: 'newApplication', task_type: 'Sales Application Check' };
  }
  if (action === 'Review Application') {
    return isCash
      ? { category: 'cash', task_type: 'Cash Review' }
      : { category: 'newApplication', task_type: 'New Application Review' };
  }
  if (action === 'Provide Documents') {
    return { category: 'missing', task_type: 'Missing Documents' };
  }
  if (action === 'Submit to Bank') {
    return { category: 'bank', task_type: 'Bank Submission' };
  }
  if (action === 'Resubmit to Bank') {
    return { category: 'bank', task_type: 'Bank Resubmission' };
  }
  if (action === 'Follow Up Bank') {
    return { category: 'bank', task_type: 'Bank Decision' };
  }
  if (action === 'Choose Close or Resubmit') {
    return { category: 'missing', task_type: 'Rejected Loan Action' };
  }
  if (action === 'Contact Approved Customer') {
    return isCash
      ? { category: 'cash', task_type: 'Customer Acceptance' }
      : { category: 'reminder', task_type: 'Approved Customer Contact' };
  }

  return null;
};

export function buildLoanTaskCompletionDescriptors(
  previous: LoanApplication,
  next: LoanApplication,
  completedAt: string
): TaskCompletionDescriptor[] {
  const descriptors: TaskCompletionDescriptor[] = [];
  const previousAction = getLoanPendingAction(previous);
  const nextAction = getLoanPendingAction(next);
  const previousOwner = getLoanPendingWith(previous);
  const nextOwner = getLoanPendingWith(next);
  const workflowAdvanced = previousAction !== 'None' && (
    previousAction !== nextAction ||
    previousOwner !== nextOwner
  );

  if (workflowAdvanced) {
    const workflowDescriptor = getWorkflowCompletionDescriptor(previous, previousAction);
    if (workflowDescriptor) {
      descriptors.push({
        ...workflowDescriptor,
        due_at: previous.action_due_at || undefined,
        assigned_at: previous.pending_since || previous.submitted_at
      });
    }
  }

  const previousMissingBasicInfo = !previous.vehicle_condition || !previous.purchase_method;
  const nextHasBasicInfo = Boolean(next.vehicle_condition && next.purchase_method);
  if (previousMissingBasicInfo && nextHasBasicInfo) {
    descriptors.push({
      category: 'missing',
      task_type: 'Missing Information',
      assigned_at: previous.pending_since || previous.submitted_at
    });
  }

  const previousMissingDocuments = getMissingDocumentLabels(previous);
  const nextMissingDocuments = getMissingDocumentLabels(next);
  if (
    previousMissingDocuments.length > 0 &&
    nextMissingDocuments.length === 0 &&
    previousAction !== 'Provide Documents'
  ) {
    descriptors.push({
      category: 'missing',
      task_type: 'Missing Documents',
      assigned_at: previous.pending_since || previous.submitted_at
    });
  }

  if (
    previous.customer_call_back_at &&
    previous.customer_call_back_at !== next.customer_call_back_at &&
    parseDateValue(previous.customer_call_back_at) &&
    parseDateValue(previous.customer_call_back_at)!.getTime() <= parseDateValue(completedAt)!.getTime()
  ) {
    descriptors.push({
      category: 'reminder',
      task_type: 'Customer Call-back',
      due_at: previous.customer_call_back_at,
      assigned_at: previous.submitted_at
    });
  }

  const nextBankById = new Map((next.bank_applications || []).map((bank) => [bank.id, bank]));
  (previous.bank_applications || []).forEach((previousBank) => {
    const nextBank = nextBankById.get(previousBank.id);
    if (!nextBank) return;

    const wasAwaitingDecision = previousBank.status === 'Submitted' || previousBank.status === 'Pending Review';
    const decisionRecorded = wasAwaitingDecision && (
      nextBank.status === 'Approved' ||
      nextBank.status === 'Rejected' ||
      nextBank.status === 'Need More Info' ||
      nextBank.status === 'Cancelled'
    );

    if (decisionRecorded && !workflowAdvanced) {
      descriptors.push({
        category: 'bank',
        task_type: 'Bank Decision',
        due_at: previousBank.next_follow_up_at || previous.action_due_at || undefined,
        assigned_at: previousBank.submitted_at || previous.pending_since || previous.submitted_at
      });
      return;
    }

    const followUpWasDue = Boolean(
      previousBank.next_follow_up_at &&
      parseDateValue(previousBank.next_follow_up_at) &&
      parseDateValue(previousBank.next_follow_up_at)!.getTime() <= parseDateValue(completedAt)!.getTime()
    );
    const followUpRescheduled = previousBank.next_follow_up_at !== nextBank.next_follow_up_at;
    if (wasAwaitingDecision && followUpWasDue && followUpRescheduled && !decisionRecorded) {
      descriptors.push({
        category: 'reminder',
        task_type: 'Bank Follow-up',
        due_at: previousBank.next_follow_up_at,
        assigned_at: previousBank.submitted_at || previous.pending_since || previous.submitted_at
      });
    }
  });

  return uniqueDescriptors(descriptors);
}

export function createTaskCompletionAuditChanges(
  descriptors: TaskCompletionDescriptor[]
): AuditLogEntry['changes'] {
  return uniqueDescriptors(descriptors).map((descriptor, index) => ({
    field: `${TASK_COMPLETION_FIELD_PREFIX}${index}`,
    old_value: '',
    new_value: JSON.stringify(descriptor)
  }));
}

const parseTaskCompletionChanges = (log: AuditLogEntry): TaskCompletionDescriptor[] => (
  log.changes
    .filter((change) => change.field.startsWith(TASK_COMPLETION_FIELD_PREFIX))
    .map((change) => {
      try {
        return JSON.parse(change.new_value) as TaskCompletionDescriptor;
      } catch {
        return null;
      }
    })
    .filter((descriptor): descriptor is TaskCompletionDescriptor => Boolean(
      descriptor?.category && descriptor?.task_type
    ))
);

const inferLegacyLoanCompletion = (
  log: AuditLogEntry,
  application?: LoanApplication
): TaskCompletionDescriptor[] => {
  if (!['UPDATE_LOAN_APPLICATION', 'INLINE_UPDATE_LOAN_APPLICATION'].includes(log.action)) {
    return [];
  }

  const changes = new Map(log.changes.map((change) => [change.field, change]));
  const pendingActionChange = changes.get('pending_action');
  if (!pendingActionChange || pendingActionChange.old_value === pendingActionChange.new_value) {
    return [];
  }

  const fallbackApplication = application || ({
    purchase_method: '',
    submitted_at: log.created_at,
    pending_since: log.created_at,
    action_due_at: ''
  } as LoanApplication);
  const descriptor = getWorkflowCompletionDescriptor(
    fallbackApplication,
    pendingActionChange.old_value as ReturnType<typeof getLoanPendingAction>
  );

  return descriptor ? [{
    ...descriptor,
    due_at: changes.get('action_due_at')?.old_value || undefined,
    assigned_at: fallbackApplication.pending_since || fallbackApplication.submitted_at
  }] : [];
};

export function buildCompletedTaskEvents({
  auditLogs,
  applications,
  calendarNotes,
  notifications,
  roleAccounts
}: {
  auditLogs: AuditLogEntry[];
  applications: LoanApplication[];
  calendarNotes: CalendarNote[];
  notifications: NotificationItem[];
  roleAccounts: RoleAccount[];
}): CompletedTaskEvent[] {
  const applicationById = new Map(applications.map((application) => [application.id, application]));
  const roleByStaff = new Map(roleAccounts.map((account) => [account.name, account.role]));
  const events: CompletedTaskEvent[] = [];

  auditLogs.forEach((log) => {
    let descriptors = parseTaskCompletionChanges(log);

    if (descriptors.length === 0) {
      if (log.action === 'COMPLETE_VEHICLE_PURCHASE_MISSION') {
        descriptors = [{ category: 'missing', task_type: 'Missing Information' }];
      } else if (log.action === 'COMPLETE_RAW_LEAD_FOLLOW_UP') {
        const dueAt = log.changes.find((change) => change.field === 'next_follow_up_at')?.old_value;
        descriptors = [{ category: 'lead', task_type: 'Lead Follow-up', due_at: dueAt || undefined }];
      } else if (log.action === 'ADD_VEHICLE_CATALOG') {
        descriptors = [{ category: 'vehicle', task_type: 'Vehicle Info Added' }];
      } else {
        descriptors = inferLegacyLoanCompletion(log, applicationById.get(log.target_id));
      }
    }

    // Vehicle delivery (交车) closes the deal. Credit EXP to BOTH the Sales
    // handler and the Admin owner of the application (each earns one award),
    // not whoever happened to record the delivery.
    if (log.action === 'UPDATE_DEAL_FINANCE') {
      const saleChange = log.changes.find((change) => change.field === 'sale_status');
      if (saleChange && saleChange.new_value === 'Bike Delivered' && saleChange.old_value !== 'Bike Delivered') {
        const deliveredApplication = applicationById.get(log.target_id);
        const handlerName = deliveredApplication?.handler_name || log.staff_name;
        const deliveryRecipients: Array<{ name: string; role: string }> = [];
        if (handlerName) {
          deliveryRecipients.push({
            name: handlerName,
            role: roleByStaff.get(handlerName) || deliveredApplication?.handler_role || log.staff_role
          });
        }
        const adminOwnerName = deliveredApplication?.admin_owner_name;
        if (adminOwnerName && adminOwnerName !== handlerName) {
          deliveryRecipients.push({
            name: adminOwnerName,
            role: roleByStaff.get(adminOwnerName) || 'Admin'
          });
        }
        deliveryRecipients.forEach((recipient, recipientIndex) => {
          events.push({
            category: 'delivery',
            task_type: 'Bike Delivered',
            id: `${log.id}:delivery:${recipientIndex}`,
            staff_name: recipient.name,
            staff_role: recipient.role,
            source_type: log.target_type,
            source_id: log.target_id,
            source_label: log.target_label,
            completed_at: log.created_at,
            was_overdue: false
          });
        });
      }
    }

    descriptors.forEach((descriptor, index) => {
      events.push({
        ...descriptor,
        id: `${log.id}:${index}`,
        staff_name: log.staff_name,
        staff_role: log.staff_role,
        source_type: log.target_type,
        source_id: log.target_id,
        source_label: log.target_label,
        completed_at: log.created_at,
        was_overdue: wasCompletedOverdue(descriptor.due_at, log.created_at)
      });
    });
  });

  calendarNotes
    .filter((note) => Boolean(note.completed_at && note.completed_by))
    .forEach((note) => {
      const completedAt = note.completed_at || '';
      const completedBy = note.completed_by || note.assigned_to || note.staff_name;
      events.push({
        id: `calendar:${note.id}:${completedAt}`,
        category: 'reminder',
        task_type: 'Calendar Task',
        staff_name: completedBy,
        staff_role: roleByStaff.get(completedBy) || note.assigned_role || note.staff_role,
        source_type: 'calendar_note',
        source_id: note.id,
        source_label: note.title,
        assigned_at: note.created_at,
        due_at: note.date_at,
        completed_at: completedAt,
        was_overdue: wasCompletedOverdue(note.date_at, completedAt)
      });
    });

  notifications
    .filter((notification) => notification.type === 'custom_mission_target_reached')
    .forEach((notification) => {
      notification.recipient_staff_names.forEach((staffName) => {
        events.push({
          id: `mission:${notification.id}:${staffName}`,
          category: 'mission',
          task_type: 'Mission Target Reached',
          staff_name: staffName,
          staff_role: roleByStaff.get(staffName) || '',
          source_type: notification.target_type,
          source_id: notification.target_id,
          source_label: notification.target_label,
          assigned_at: notification.created_at,
          completed_at: notification.created_at,
          was_overdue: false
        });
      });
    });

  return events.sort((left, right) => right.completed_at.localeCompare(left.completed_at));
}
