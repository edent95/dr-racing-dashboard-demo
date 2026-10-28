/**
 * Realtime sync for the two collections App still listens to directly:
 * customers (incremental changes merged into applications, with conflict
 * recovery and a batched flush) and calendar_tasks. Moved unchanged from
 * App.tsx, including their useStableCallback / useEffect calls and the
 * effects' dependency lists, and called where the code used to be so React
 * hook order is unchanged. The state stays in App: it is part of the
 * dashboard_state persistence and hydration loop.
 */
import type * as React from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type * as Repository from '../services/dashboardRepository';
import type { DashboardState } from '../services/dashboardRepository';
import { tr } from '../lib/i18n';
import { type CustomerRealtimeChange } from '../services/dashboardRepository';
import { type BankApplication, type BankApplicationStatus, type BankOfferStatus, type CalendarNote, type CustomerActivityEntry, type CustomerDocumentChecklistItem, type CustomerDocumentKey, type CustomerEmploymentDetails, type CustomerIntakeTracking, type CustomerPersonalInfo, type CustomerPreferences, type DealFinance, type EmergencyContact, LoanApplication, type LoanPendingAction, type LoanPendingWith, type LoanStatus, type LoanWorkflowUndoCheckpoint, type PayslipDocument, type PurchaseMethod, type RejectNextStepType, type TagNormalizationRule, type VehicleBrandTag, type VehicleCatalogItem, type VehicleCondition, type VehiclePurchaseOption, type VehicleTag } from '../types';
import { areJsonLikeValuesEqual } from './useDashboardNotifications';
import { type useDashboardPersistence } from './useDashboardPersistence';
import { useStableCallback } from './useStableCallback';
import { type StaffSession } from './useStaffSessionAuth';
import { useEffect } from 'react';


export interface RealtimeSyncActionsDeps {
  currentStaff: StaffSession;
  applicationsRef: React.RefObject<LoanApplication[]>;
  hydrateApplications: (list: LoanApplication[], catalog?: VehicleCatalogItem[], rules?: TagNormalizationRule[], initialApplications?: LoanApplication[]) => { ic_no: string; vehicle_plate: string; vehicle_model: string; vehicle_tag: string; vehicle_brand: string; vehicle_condition: VehicleCondition; purchase_method: PurchaseMethod; vehicle_options: VehiclePurchaseOption[]; handler_name: string; handler_role: string; admin_owner_name: string; pending_with: LoanPendingWith; pending_action: LoanPendingAction; pending_since: string; action_due_at: string; active_bank_application_id: string; status: LoanStatus; error_code: string; error_codes: string[]; customer_call_back_at: string; personal_info: CustomerPersonalInfo; emergency_contacts: EmergencyContact[]; employment_details: CustomerEmploymentDetails; preferences: CustomerPreferences; payslip_documents: PayslipDocument[]; document_checklist: CustomerDocumentChecklistItem[]; bank_applications: { decision_at: string; reason_category: string; status_reason: string; next_action: string; next_follow_up_at: string; id: string; bank_name: string; round_no: number; submitted_by: string; submitted_at: string; status: BankApplicationStatus; reject_code: string; reject_reason: string; offer_amount: string; interest_rate: string; tenure: string; monthly_installment: string; approved_at: string; offer_status: BankOfferStatus; reject_next_step?: RejectNextStepType; notes: string; }[]; id: string; applicant_name: string; phone_no: string; remarks: string; submitted_at: string; deal_finance?: DealFinance; workflow_undo?: LoanWorkflowUndoCheckpoint; customer_intake_tracking?: CustomerIntakeTracking; activity_thread?: CustomerActivityEntry[]; }[];
  isFirebaseConfigured: boolean;
  isLoggedIn: boolean;
  isPublicRoutePath: boolean;
  preserveLoadedApplicationFileData: (application: LoanApplication, currentApplication?: LoanApplication) => LoanApplication;
  realtimeApplicationConflictIdsRef: React.RefObject<Set<string>>;
  realtimeApplicationFlushScheduledRef: React.RefObject<boolean>;
  realtimeApplicationRecoveryIdsRef: React.RefObject<Set<string>>;
  reloadCustomerFromFirebase: typeof Repository.reloadCustomerFromFirebase;
  setApplications: React.Dispatch<React.SetStateAction<LoanApplication[]>>;
  setCalendarNotes: React.Dispatch<React.SetStateAction<CalendarNote[]>>;
  setSelectedApplication: React.Dispatch<React.SetStateAction<LoanApplication>>;
  setSyncStatus: React.Dispatch<React.SetStateAction<"error" | "loading" | "cached" | "firebase" | "local">>;
  skipNextRealtimeNotificationSaveRef: React.RefObject<boolean>;
  stripApplicationFileDataForComparison: (application: LoanApplication) => { payslip_documents: { file_data_url: string; id: string; document_key?: CustomerDocumentKey; file_name: string; file_type: string; file_size: number; uploaded_by: string; uploaded_at: string; download_url?: string; storage_path?: string; }[]; id: string; applicant_name: string; phone_no: string; ic_no: string; vehicle_plate: string; vehicle_model: string; vehicle_tag: VehicleTag; vehicle_brand: VehicleBrandTag; vehicle_condition?: VehicleCondition; purchase_method?: PurchaseMethod; vehicle_options?: VehiclePurchaseOption[]; handler_name: string; handler_role: string; admin_owner_name?: string; pending_with?: LoanPendingWith; pending_action?: LoanPendingAction; pending_since?: string; action_due_at?: string; active_bank_application_id?: string; status: LoanStatus; error_code: string; error_codes?: string[]; remarks: string; submitted_at: string; customer_call_back_at?: string; document_checklist?: CustomerDocumentChecklistItem[]; bank_applications: BankApplication[]; personal_info?: CustomerPersonalInfo; emergency_contacts?: EmergencyContact[]; employment_details?: CustomerEmploymentDetails; preferences?: CustomerPreferences; deal_finance?: DealFinance; workflow_undo?: LoanWorkflowUndoCheckpoint; customer_intake_tracking?: CustomerIntakeTracking; activity_thread?: CustomerActivityEntry[]; };
  subscribeToCalendarTasksFromFirebase: typeof Repository.subscribeToCalendarTasksFromFirebase;
  syncStatus: "error" | "loading" | "cached" | "firebase" | "local";
  tagNormalizationRules: TagNormalizationRule[];
  triggerToast: (message: string, tone?: "success" | "warning" | "error") => void;
  vehicleCatalog: VehicleCatalogItem[];
  waitForDashboardPersistenceIdle: () => Promise<boolean>;
  writeLocalDashboardValue: ReturnType<typeof useDashboardPersistence>['writeLocalDashboardValue'];
}

export function useDashboardRealtimeSync({
  currentStaff,
  applicationsRef,
  hydrateApplications,
  isFirebaseConfigured,
  isLoggedIn,
  isPublicRoutePath,
  preserveLoadedApplicationFileData,
  realtimeApplicationConflictIdsRef,
  realtimeApplicationFlushScheduledRef,
  realtimeApplicationRecoveryIdsRef,
  reloadCustomerFromFirebase,
  setApplications,
  setCalendarNotes,
  setSelectedApplication,
  setSyncStatus,
  skipNextRealtimeNotificationSaveRef,
  stripApplicationFileDataForComparison,
  subscribeToCalendarTasksFromFirebase,
  syncStatus,
  tagNormalizationRules,
  triggerToast,
  vehicleCatalog,
  waitForDashboardPersistenceIdle,
  writeLocalDashboardValue
}: RealtimeSyncActionsDeps) {
  const scheduleRealtimeApplicationsFlush = useStableCallback(() => {
    if (realtimeApplicationFlushScheduledRef.current) return;

    realtimeApplicationFlushScheduledRef.current = true;
    queueMicrotask(() => {
      realtimeApplicationFlushScheduledRef.current = false;
      const nextApplications = applicationsRef.current;
      skipNextRealtimeNotificationSaveRef.current = true;
      setApplications(nextApplications);
      writeLocalDashboardValue('applications', nextApplications);
    });
  });

  const recoverRealtimeCustomer = useStableCallback(async (
    applicationId: string,
    applicantName: string,
    remoteWasRemoved = false
  ) => {
    if (realtimeApplicationRecoveryIdsRef.current.has(applicationId)) return;

    realtimeApplicationRecoveryIdsRef.current.add(applicationId);
    setSyncStatus('loading');
    triggerToast(tr(
      `发现 ${applicantName} 的较新云端资料，正在自动同步…`,
      `Newer cloud data was found for ${applicantName}. Syncing automatically…`,
      `Data awan lebih baharu ditemui untuk ${applicantName}. Menyegerak secara automatik…`
    ), 'warning');

    try {
      await waitForDashboardPersistenceIdle();
      // A listener "removed" event also means this staff member no longer has
      // access through their role-scoped query. Do not issue a document get
      // that Firestore Rules may correctly reject after reassignment.
      let remoteApplication: LoanApplication | null = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          remoteApplication = await reloadCustomerFromFirebase(applicationId, {
            knownRemoved: remoteWasRemoved
          });
          break;
        } catch (error) {
          if (attempt === 2) throw error;
          await new Promise((resolve) => window.setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
      const currentApplications = applicationsRef.current;
      const currentApplication = currentApplications.find((application) => application.id === applicationId);
      const hydratedApplication = remoteApplication
        ? preserveLoadedApplicationFileData(
          hydrateApplications([remoteApplication], vehicleCatalog, tagNormalizationRules)[0],
          currentApplication
        )
        : null;
      const nextApplications = hydratedApplication
        ? currentApplication
          ? currentApplications.map((application) => (
            application.id === applicationId ? hydratedApplication : application
          ))
          : [hydratedApplication, ...currentApplications]
        : currentApplications.filter((application) => application.id !== applicationId);

      applicationsRef.current = nextApplications;
      setSelectedApplication((current) => (
        current?.id === applicationId
          ? hydratedApplication
            ? preserveLoadedApplicationFileData(hydratedApplication, current)
            : null
          : current
      ));
      scheduleRealtimeApplicationsFlush();
      realtimeApplicationConflictIdsRef.current.delete(applicationId);
      setSyncStatus('firebase');
      triggerToast(tr(
        `已同步 ${applicantName} 的最新资料；已完成任务已自动清除。`,
        `Latest data for ${applicantName} synced; completed tasks were removed automatically.`,
        `Data terkini untuk ${applicantName} telah disegerakkan; tugas selesai dibuang secara automatik.`
      ));
    } catch (error) {
      console.warn('Customer realtime recovery failed.', error);
      realtimeApplicationConflictIdsRef.current.delete(applicationId);
      setSyncStatus('error');
      triggerToast(tr(
        `${applicantName} 自动同步失败，请点击同步状态重试或刷新页面。`,
        `Automatic sync failed for ${applicantName}. Retry from the sync status or refresh the page.`,
        `Penyegerakan automatik gagal untuk ${applicantName}. Cuba lagi melalui status penyegerakan atau muat semula halaman.`
      ), 'error');
    } finally {
      realtimeApplicationRecoveryIdsRef.current.delete(applicationId);
    }
  });

  const handleRealtimeCustomerChange = useStableCallback((change: CustomerRealtimeChange) => {
    const currentApplications = applicationsRef.current;
    const currentApplication = currentApplications.find((application) => application.id === change.id);
    const normalizeRealtimeApplication = (application: LoanApplication) => preserveLoadedApplicationFileData(
      hydrateApplications([application], vehicleCatalog, tagNormalizationRules)[0],
      currentApplication
    );
    const previousApplication = change.previousApplication
      ? normalizeRealtimeApplication(change.previousApplication)
      : undefined;
    const incomingApplication = change.application
      ? normalizeRealtimeApplication(change.application)
      : undefined;
    const currentComparable = currentApplication
      ? stripApplicationFileDataForComparison(currentApplication)
      : undefined;
    const previousComparable = previousApplication
      ? stripApplicationFileDataForComparison(previousApplication)
      : undefined;
    const incomingComparable = incomingApplication
      ? stripApplicationFileDataForComparison(incomingApplication)
      : undefined;
    const currentMatchesPrevious = Boolean(
      currentComparable && previousComparable &&
      areJsonLikeValuesEqual(currentComparable, previousComparable)
    );
    const currentMatchesIncoming = Boolean(
      currentComparable && incomingComparable &&
      areJsonLikeValuesEqual(currentComparable, incomingComparable)
    );

    if (change.type === 'removed') {
      if (!currentApplication) {
        realtimeApplicationConflictIdsRef.current.delete(change.id);
        return true;
      }

      if (!currentMatchesPrevious) {
        if (!realtimeApplicationConflictIdsRef.current.has(change.id)) {
          realtimeApplicationConflictIdsRef.current.add(change.id);
          void recoverRealtimeCustomer(change.id, currentApplication.applicant_name, true);
        }
        return false;
      }

      const nextApplications = currentApplications.filter((application) => application.id !== change.id);
      applicationsRef.current = nextApplications;
      scheduleRealtimeApplicationsFlush();
      realtimeApplicationConflictIdsRef.current.delete(change.id);
      return true;
    }

    if (!incomingApplication) {
      return false;
    }

    if (currentMatchesIncoming) {
      realtimeApplicationConflictIdsRef.current.delete(change.id);
      return true;
    }

    if (currentApplication && !currentMatchesPrevious) {
      if (!realtimeApplicationConflictIdsRef.current.has(change.id)) {
        realtimeApplicationConflictIdsRef.current.add(change.id);
        void recoverRealtimeCustomer(change.id, currentApplication.applicant_name);
      }
      return false;
    }

    const nextApplications = currentApplication
      ? currentApplications.map((application) => application.id === change.id ? incomingApplication : application)
      : [incomingApplication, ...currentApplications];

    applicationsRef.current = nextApplications;
    // Keep an already-open Application Detail drawer on the same realtime
    // customer object. Without this, the table received Sales' new document
    // reference but the Admin drawer stayed on its stale selectedApplication,
    // so the lazy Storage restore never saw or downloaded the uploaded IC.
    setSelectedApplication((current) => (
      current?.id === change.id
        ? preserveLoadedApplicationFileData(incomingApplication, current)
        : current
    ));
    scheduleRealtimeApplicationsFlush();
    realtimeApplicationConflictIdsRef.current.delete(change.id);
    return true;
  });

  useEffect(() => {
    if (
      !isFirebaseConfigured ||
      isPublicRoutePath ||
      !isLoggedIn ||
      syncStatus !== 'firebase'
    ) {
      return;
    }

    let disposed = false;
    let unsubscribe = () => undefined;

    // Every signed-in staff role receives only the customer scope selected by
    // subscribeToCustomerChangesFromFirebase: Sales listens to its Handler
    // rows, Admin listens to owned/unassigned Admin work, and Super Admin
    // listens to all customers. The stream carries metadata only; document
    // bytes remain lazy-loaded from Storage when a preview is opened.
    void import('../services/dashboardRepository')
      .then((module) => module.subscribeToCustomerChangesFromFirebase(
        handleRealtimeCustomerChange,
        () => {
          if (!disposed) {
            triggerToast(
              tr(
                '实时更新连接已停止，请刷新页面重新连接。',
                'Live updates stopped. Refresh the page to reconnect.',
                'Kemas kini langsung terhenti. Muat semula halaman untuk menyambung semula.'
              ),
              'error'
            );
          }
        }
      ))
      .then((stopListening) => {
        if (disposed) {
          stopListening();
          return;
        }

        unsubscribe = stopListening;
      })
      .catch((error) => {
        console.warn('Customer realtime listener could not start.', error);
      });

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [currentStaff.role, handleRealtimeCustomerChange, isLoggedIn, isPublicRoutePath, syncStatus]);

  useEffect(() => {
    if (
      !isFirebaseConfigured ||
      isPublicRoutePath ||
      !isLoggedIn ||
      syncStatus !== 'firebase'
    ) {
      return;
    }

    let disposed = false;
    let unsubscribe = () => undefined;

    void subscribeToCalendarTasksFromFirebase(
      (nextCalendarNotes) => {
        if (disposed) {
          return;
        }

        setCalendarNotes((current) => {
          if (areJsonLikeValuesEqual(current, nextCalendarNotes)) {
            return current;
          }

          writeLocalDashboardValue('calendarNotes', nextCalendarNotes);
          return nextCalendarNotes;
        });
      },
      (error) => {
        if (!disposed) {
          console.warn('Calendar task realtime listener stopped.', error);
          triggerToast(
            tr(
              '日历任务实时更新已停止，请刷新页面重新连接。',
              'Calendar task live updates stopped. Refresh the page to reconnect.',
              'Kemas kini langsung tugasan kalendar terhenti. Muat semula halaman untuk menyambung semula.'
            ),
            'error'
          );
        }
      }
    ).then((stopListening) => {
      if (disposed) {
        stopListening();
        return;
      }

      unsubscribe = stopListening;
    }).catch((error) => {
      console.warn('Calendar task realtime listener could not start.', error);
    });

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [currentStaff.name, currentStaff.role, isLoggedIn, isPublicRoutePath, syncStatus, writeLocalDashboardValue]);

  return {

  };
}
