/**
 * Calendar task actions: add, complete / reopen, reply and delete. Moved
 * verbatim from App.tsx; every value the handlers used from App's closure,
 * including the Firestore calls and the pending-reply ref, is now an explicit
 * dependency under its original name. The ref itself stays in App.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import type { MutableRefObject } from 'react';
import { tr } from '../lib/i18n';
import type * as Repository from '../services/dashboardRepository';
import type { DashboardState } from '../services/dashboardRepository';
import { AuditLogEntry, CalendarNote } from '../types';
import { appendCommentOnce, getCommentIdForAttempt, type PendingCommentAttempt } from '../utils/calendarTaskComments';
import { newId } from '../utils/id';
import { removeItemById, replaceItemById } from '../utils/latestListPatch';
import type { StaffSession } from './useStaffSessionAuth';

export interface CalendarTaskAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface CalendarTaskActionsDeps {
  currentStaff: StaffSession;
  calendarNotes: CalendarNote[];
  calendarNotesRef: MutableRefObject<CalendarNote[]>;
  pendingCalendarReplyAttemptsRef: MutableRefObject<Map<string, PendingCommentAttempt>>;
  saveCalendarNoteToFirebase: typeof Repository.saveCalendarNoteToFirebase;
  setCalendarTaskCompletionInFirebase: typeof Repository.setCalendarTaskCompletionInFirebase;
  appendCalendarTaskCommentToFirebase: typeof Repository.appendCalendarTaskCommentToFirebase;
  deleteCalendarNoteFromFirebase: typeof Repository.deleteCalendarNoteFromFirebase;
  updateCalendarNotesState: (list: CalendarNote[]) => Promise<unknown>;
  isFirebaseWriteOutcomeUnknown: (error: unknown) => boolean;
  appendAuditLog: (input: CalendarTaskAuditInput) => void;
  triggerToast: (message: string, tone?: 'success' | 'warning' | 'error') => void;
}

export function useCalendarTaskActions({
  currentStaff,
  calendarNotes,
  calendarNotesRef,
  pendingCalendarReplyAttemptsRef,
  saveCalendarNoteToFirebase,
  setCalendarTaskCompletionInFirebase,
  appendCalendarTaskCommentToFirebase,
  deleteCalendarNoteFromFirebase,
  updateCalendarNotesState,
  isFirebaseWriteOutcomeUnknown,
  appendAuditLog,
  triggerToast
}: CalendarTaskActionsDeps) {
  const handleAddCalendarNote = async (note: Pick<CalendarNote, 'title' | 'body' | 'date_at' | 'assigned_to' | 'assigned_role'>) => {
    const now = new Date().toISOString();
    const canAssignToOthers = currentStaff.role === 'Super Admin';
    const assignedTo = canAssignToOthers ? note.assigned_to || currentStaff.name : currentStaff.name;
    const assignedRole = canAssignToOthers ? note.assigned_role || currentStaff.role : currentStaff.role;
    const newNote: CalendarNote = {
      id: newId('NOTE'),
      title: note.title.trim(),
      body: note.body.trim(),
      date_at: note.date_at,
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      assigned_to: assignedTo,
      assigned_role: assignedRole,
      created_at: now
    };
    await saveCalendarNoteToFirebase(newNote);

    // Rebase on the latest notes: the realtime calendar listener may have
    // changed other tasks while the save was in flight.
    const updatedNotes = [newNote, ...removeItemById(calendarNotesRef.current, newNote.id)]
      .sort((a, b) => a.date_at.localeCompare(b.date_at));

    appendAuditLog({
      action: 'ADD_CALENDAR_NOTE',
      target_type: 'calendar_note',
      target_id: newNote.id,
      target_label: newNote.title,
      changes: [
        { field: 'date_at', old_value: '', new_value: newNote.date_at },
        { field: 'title', old_value: '', new_value: newNote.title },
        { field: 'assigned_to', old_value: '', new_value: assignedTo }
      ],
      stateOverrides: { calendarNotes: updatedNotes }
    });

    await updateCalendarNotesState(updatedNotes);
  };

  const handleSetCalendarNoteCompleted = async (noteId: string, completed: boolean) => {
    const note = calendarNotes.find((item) => item.id === noteId);
    if (!note) return;

    const completedAt = completed ? new Date().toISOString() : undefined;
    const completedBy = completed ? currentStaff.name : undefined;
    try {
      // Writes only completed_at / completed_by, so replies another staff
      // member added since the last snapshot survive, and Rules accept it from
      // the assignee as well as from Super Admin.
      await setCalendarTaskCompletionInFirebase(note.id, { completed_at: completedAt, completed_by: completedBy });
    } catch (error) {
      console.error('Calendar task completion save failed.', error);
      triggerToast(
        isFirebaseWriteOutcomeUnknown(error)
          ? tr(
            '任务状态保存超时，结果未确认。请重新载入确认。',
            'Saving the task status timed out; the result is pending. Reload to check.',
            'Menyimpan status tugasan tamat masa; keputusannya belum disahkan. Muat semula untuk menyemak.'
          )
          : tr(
            '任务状态没有保存，你可能没有权限更改这个任务。',
            'The task status was not saved. You may not have permission to change this task.',
            'Status tugasan tidak disimpan. Anda mungkin tiada kebenaran untuk mengubah tugasan ini.'
          ),
        'error'
      );
      return;
    }

    // Patch only the completion fields onto the LATEST copy of this task.
    const latestNote = calendarNotesRef.current.find((item) => item.id === noteId) || note;
    const updatedNote: CalendarNote = {
      ...latestNote,
      completed_at: completedAt,
      completed_by: completedBy
    };
    const updatedNotes = replaceItemById(calendarNotesRef.current, updatedNote);

    appendAuditLog({
      action: completed ? 'COMPLETE_CALENDAR_NOTE' : 'REOPEN_CALENDAR_NOTE',
      target_type: 'calendar_note',
      target_id: note.id,
      target_label: note.title,
      changes: [{ field: 'completed_at', old_value: note.completed_at || '', new_value: completedAt || '' }],
      stateOverrides: { calendarNotes: updatedNotes }
    });

    await updateCalendarNotesState(updatedNotes);
  };

  const handleAddCalendarTaskComment = async (noteId: string, rawBody: string) => {
    const note = calendarNotes.find((item) => item.id === noteId);
    const body = rawBody.trim();
    const canReply = Boolean(note) && (
      currentStaff.role === 'Super Admin' ||
      note?.staff_name === currentStaff.name ||
      note?.assigned_to === currentStaff.name
    );

    if (!note || !body || !canReply) {
      triggerToast(
        tr(
          '你只能回复自己参与的日历任务。',
          'You can only reply to calendar tasks you are part of.',
          'Anda hanya boleh membalas tugasan kalendar yang melibatkan anda.'
        ),
        'error'
      );
      return false;
    }

    // Rules keep at most 100 replies on one task.
    if ((note.comments?.length || 0) >= 100) {
      triggerToast(
        tr(
          '这个任务已有 100 条回复，不能再回复了。请新建一个任务继续。',
          'This task already has 100 replies. Create a new task to continue.',
          'Tugasan ini sudah ada 100 balasan. Cipta tugasan baharu untuk meneruskan.'
        ),
        'error'
      );
      return false;
    }

    const commentBody = body.slice(0, 2000);
    const comment = {
      // Reused while this reply is unconfirmed, so a retry after a timeout
      // that did commit is skipped by the transaction instead of stored twice.
      id: getCommentIdForAttempt(pendingCalendarReplyAttemptsRef.current, noteId, commentBody),
      body: commentBody,
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      created_at: new Date().toISOString()
    };
    try {
      const remoteComments = await appendCalendarTaskCommentToFirebase(note.id, comment);
      // The comment write only touches `comments`; keep every other field of
      // the latest local copy (another staff member may have completed it).
      const latestNote = calendarNotesRef.current.find((item) => item.id === noteId) || note;
      const updatedNote: CalendarNote = {
        ...latestNote,
        comments: remoteComments || appendCommentOnce(latestNote.comments, comment).comments
      };
      const updatedNotes = replaceItemById(calendarNotesRef.current, updatedNote);

      appendAuditLog({
        action: 'ADD_CALENDAR_TASK_COMMENT',
        target_type: 'calendar_note',
        target_id: note.id,
        target_label: note.title,
        changes: [{ field: 'comments', old_value: `${note.comments?.length || 0}`, new_value: `${updatedNote.comments?.length || 0}` }],
        stateOverrides: { calendarNotes: updatedNotes }
      });

      pendingCalendarReplyAttemptsRef.current.delete(noteId);
      await updateCalendarNotesState(updatedNotes);
      triggerToast(tr('任务回复已发送。', 'Task reply sent.', 'Balasan tugasan dihantar.'));
      return true;
    } catch (error) {
      console.error('Calendar task reply save failed.', error);
      triggerToast(
        tr(
          '任务回复无法同步，请稍后再试。',
          'Task reply could not sync. Please try again.',
          'Balasan tugasan tidak dapat disegerakkan. Sila cuba lagi.'
        ),
        'error'
      );
      return false;
    }
  };

  const handleDeleteCalendarNote = async (noteId: string) => {
    const note = calendarNotes.find((item) => item.id === noteId);
    if (!note) return;

    try {
      await deleteCalendarNoteFromFirebase(noteId);
    } catch (error) {
      console.error('Calendar note delete failed.', error);
      triggerToast(
        isFirebaseWriteOutcomeUnknown(error)
          ? tr('删除结果未确认，请重新载入日历确认。', 'Deletion was not confirmed. Reload the calendar to check.', 'Pemadaman belum disahkan. Muat semula kalendar untuk menyemak.')
          : tr('日历笔记无法删除，请检查权限或网络后再试。', 'The calendar note could not be deleted. Check your access or connection and try again.', 'Nota kalendar tidak dapat dipadam. Semak akses atau sambungan anda dan cuba lagi.'),
        'error'
      );
      return;
    }

    const updatedNotes = removeItemById(calendarNotesRef.current, noteId);

    appendAuditLog({
      action: 'DELETE_CALENDAR_NOTE',
      target_type: 'calendar_note',
      target_id: note.id,
      target_label: note.title,
      changes: [
        { field: 'title', old_value: note.title, new_value: '' }
      ],
      stateOverrides: { calendarNotes: updatedNotes }
    });

    await updateCalendarNotesState(updatedNotes);
  };

  return {
    handleAddCalendarNote,
    handleSetCalendarNoteCompleted,
    handleAddCalendarTaskComment,
    handleDeleteCalendarNote
  };
}
