/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef } from 'react';
import { CollectionItemVersionConflictError, DashboardStateVersionConflictError, type DashboardState } from '../services/dashboardRepository';

type SyncStatus = 'loading' | 'cached' | 'firebase' | 'local' | 'error';

type DashboardPersistenceValues = Pick<
  DashboardState,
  | 'applications'
  | 'rawCustomerLeads'
  | 'errorCodeDefinitions'
  | 'roleAccounts'
  | 'rolePermissions'
  | 'roleNavAccess'
  | 'defaultAvatarLibrary'
  | 'whatsAppTrackingLinks'
  | 'whatsAppTrackingClicks'
  | 'whatsAppDefaultMessage'
  | 'customerIntakeShortLinks'
  | 'customMissions'
  | 'rewardTeams'
  | 'approvalRequests'
  | 'calendarNotes'
  | 'notifications'
  | 'auditLogs'
  | 'vehicleTags'
  | 'vehicleBrandTags'
  | 'vehicleCatalog'
  | 'vehicleCategories'
  | 'vehicleBrandLogos'
  | 'financeProfiles'
  | 'commissionRules'
  | 'attendancePolicy'
  | 'channelMarketingSpend'
  | 'bankDefinitions'
  | 'marketingTagRelationships'
  | 'tagNormalizationRules'
>;

type DashboardLocalStorageKey = Exclude<keyof DashboardPersistenceValues, 'version'>;

type DashboardLocalStorageConfig = {
  key: string;
  rawString?: boolean;
};

const DASHBOARD_SAVE_DEBOUNCE_MS = 250;
const MAX_LOCAL_STORAGE_VALUE_LENGTH = 2_000_000;
const LARGE_COLLECTION_CACHE_KEYS = new Set<DashboardLocalStorageKey>([
  'applications',
  'rawCustomerLeads',
  'auditLogs'
]);

const DASHBOARD_LOCAL_STORAGE_KEYS: Record<DashboardLocalStorageKey, DashboardLocalStorageConfig> = {
  applications: { key: 'loan_applications_dashboard' },
  rawCustomerLeads: { key: 'raw_customer_leads' },
  errorCodeDefinitions: { key: 'loan_error_code_definitions' },
  roleAccounts: { key: 'loan_role_accounts' },
  rolePermissions: { key: 'role_permissions' },
  roleNavAccess: { key: 'role_nav_access' },
  defaultAvatarLibrary: { key: 'staff_default_avatars' },
  whatsAppTrackingLinks: { key: 'whatsapp_tracking_links' },
  whatsAppTrackingClicks: { key: 'whatsapp_tracking_clicks' },
  whatsAppDefaultMessage: { key: 'whatsapp_default_message', rawString: true },
  customerIntakeShortLinks: { key: 'customer_intake_short_links' },
  customMissions: { key: 'custom_missions' },
  rewardTeams: { key: 'reward_teams' },
  approvalRequests: { key: 'approval_requests' },
  calendarNotes: { key: 'calendar_notes' },
  notifications: { key: 'dashboard_notifications' },
  auditLogs: { key: 'dashboard_audit_logs' },
  vehicleTags: { key: 'vehicle_tags' },
  vehicleBrandTags: { key: 'vehicle_brand_tags' },
  vehicleCatalog: { key: 'vehicle_catalog' },
  vehicleCategories: { key: 'vehicle_categories' },
  vehicleBrandLogos: { key: 'vehicle_brand_logos' },
  financeProfiles: { key: 'finance_profiles' },
  commissionRules: { key: 'commission_rules' },
  attendancePolicy: { key: 'attendance_policy' },
  channelMarketingSpend: { key: 'channel_marketing_spend' },
  bankDefinitions: { key: 'bank_definitions' },
  marketingTagRelationships: { key: 'marketing_tag_relationships' },
  tagNormalizationRules: { key: 'tag_normalization_rules' }
};

const saveDashboardStateToRemote = async (state: DashboardState) => {
  const module = await import('../services/dashboardRepository');
  return module.saveDashboardStateToFirebase(state);
};

function isLikelyOversizedLargeCollection(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return false;

  const sampleCount = Math.min(value.length, 25);
  let sampledLength = 0;

  try {
    for (let index = 0; index < sampleCount; index += 1) {
      const sampleIndex = sampleCount === 1
        ? 0
        : Math.round((index * (value.length - 1)) / (sampleCount - 1));
      sampledLength += JSON.stringify(value[sampleIndex] ?? null).length;
    }
  } catch {
    return false;
  }

  const estimatedLength = (sampledLength / sampleCount) * value.length * 1.25 + 2;
  return estimatedLength > MAX_LOCAL_STORAGE_VALUE_LENGTH;
}

function writeLocalStorageValue(config: DashboardLocalStorageConfig, value: unknown, dashboardKey?: DashboardLocalStorageKey) {
  if (
    dashboardKey &&
    LARGE_COLLECTION_CACHE_KEYS.has(dashboardKey) &&
    isLikelyOversizedLargeCollection(value)
  ) {
    localStorage.removeItem(config.key);
    console.info(`${config.key} local cache skipped because it is estimated to be too large for browser storage.`);
    return;
  }

  const serialized = config.rawString
    ? typeof value === 'string' ? value : String(value || '')
    : JSON.stringify(value ?? null);

  if (dashboardKey && LARGE_COLLECTION_CACHE_KEYS.has(dashboardKey) && serialized.length > MAX_LOCAL_STORAGE_VALUE_LENGTH) {
    localStorage.removeItem(config.key);
    console.info(`${config.key} local cache skipped because it is too large for browser storage.`);
    return;
  }

  try {
    localStorage.setItem(config.key, serialized);
  } catch (error) {
    localStorage.removeItem(config.key);
    console.warn(`${config.key} local cache write skipped.`, error);
  }
}

export interface UseDashboardPersistenceOptions {
  values: DashboardPersistenceValues;
  firebaseConfigured: boolean;
  publicRoute: boolean;
  setSyncStatus: (status: SyncStatus) => void;
  onSaveRecovered: () => void;
  onSaveFailed: (error: unknown) => void;
  onVersionConflict: (error: DashboardStateVersionConflictError) => void;
  onCollectionConflict: (error: CollectionItemVersionConflictError) => void;
}

export function useDashboardPersistence({
  values,
  firebaseConfigured,
  publicRoute,
  setSyncStatus,
  onSaveRecovered,
  onSaveFailed,
  onVersionConflict,
  onCollectionConflict
}: UseDashboardPersistenceOptions) {
  const firebaseSaveQueueRef = useRef<Promise<boolean>>(Promise.resolve(true));
  const hasNotifiedSaveErrorRef = useRef(false);
  const pendingSaveOverridesRef = useRef<Partial<DashboardState>>({});
  const pendingSaveTimerRef = useRef<number | null>(null);
  const pendingSaveResolversRef = useRef<Array<(saved: boolean) => void>>([]);

  const createDashboardState = useCallback((overrides: Partial<DashboardState> = {}): DashboardState => ({
    applications: overrides.applications || values.applications,
    rawCustomerLeads: overrides.rawCustomerLeads || values.rawCustomerLeads,
    errorCodeDefinitions: overrides.errorCodeDefinitions || values.errorCodeDefinitions,
    roleAccounts: overrides.roleAccounts || values.roleAccounts,
    rolePermissions: overrides.rolePermissions || values.rolePermissions,
    roleNavAccess: overrides.roleNavAccess || values.roleNavAccess,
    defaultAvatarLibrary: overrides.defaultAvatarLibrary || values.defaultAvatarLibrary,
    whatsAppTrackingLinks: overrides.whatsAppTrackingLinks || values.whatsAppTrackingLinks,
    whatsAppTrackingClicks: overrides.whatsAppTrackingClicks || values.whatsAppTrackingClicks,
    whatsAppDefaultMessage: overrides.whatsAppDefaultMessage ?? values.whatsAppDefaultMessage,
    customerIntakeShortLinks: overrides.customerIntakeShortLinks || values.customerIntakeShortLinks,
    customMissions: overrides.customMissions || values.customMissions,
    rewardTeams: overrides.rewardTeams || values.rewardTeams,
    approvalRequests: overrides.approvalRequests || values.approvalRequests,
    calendarNotes: overrides.calendarNotes || values.calendarNotes,
    notifications: overrides.notifications || values.notifications,
    auditLogs: overrides.auditLogs || values.auditLogs,
    vehicleTags: overrides.vehicleTags || values.vehicleTags,
    vehicleBrandTags: overrides.vehicleBrandTags || values.vehicleBrandTags,
    vehicleCatalog: overrides.vehicleCatalog || values.vehicleCatalog,
    vehicleCategories: overrides.vehicleCategories || values.vehicleCategories,
    vehicleBrandLogos: overrides.vehicleBrandLogos || values.vehicleBrandLogos,
    financeProfiles: overrides.financeProfiles || values.financeProfiles,
    commissionRules: overrides.commissionRules || values.commissionRules,
    attendancePolicy: overrides.attendancePolicy || values.attendancePolicy,
    channelMarketingSpend: overrides.channelMarketingSpend || values.channelMarketingSpend,
    bankDefinitions: overrides.bankDefinitions || values.bankDefinitions,
    marketingTagRelationships: overrides.marketingTagRelationships || values.marketingTagRelationships,
    tagNormalizationRules: overrides.tagNormalizationRules || values.tagNormalizationRules
  }), [values]);

  const queueDashboardStateSave = useCallback((dashboardState: DashboardState) => {
    firebaseSaveQueueRef.current = firebaseSaveQueueRef.current
      .catch(() => undefined)
      .then(() => saveDashboardStateToRemote(dashboardState))
      .then(() => {
        setSyncStatus('firebase');

        if (hasNotifiedSaveErrorRef.current) {
          hasNotifiedSaveErrorRef.current = false;
          onSaveRecovered();
        }

        return true;
      })
      .catch((error) => {
        if (error instanceof CollectionItemVersionConflictError) {
          console.info('One Firebase collection record conflicted; other sync remains active.', error);
          setSyncStatus('firebase');
          onCollectionConflict(error);
          return false;
        }

        if (error instanceof DashboardStateVersionConflictError) {
          console.info('Firebase dashboard save skipped because remote state changed first.', error);
          onVersionConflict(error);
        } else {
          console.warn('Firebase dashboard save failed, using local state.', error);
        }

        setSyncStatus('error');

        if (!hasNotifiedSaveErrorRef.current) {
          hasNotifiedSaveErrorRef.current = true;
          onSaveFailed(error);
        }

        return false;
      });

    return firebaseSaveQueueRef.current;
  }, [onCollectionConflict, onSaveFailed, onSaveRecovered, onVersionConflict, setSyncStatus]);

  const flushPendingDashboardSave = useCallback(() => {
    if (pendingSaveTimerRef.current !== null) {
      window.clearTimeout(pendingSaveTimerRef.current);
      pendingSaveTimerRef.current = null;
    }

    const pendingOverrides = pendingSaveOverridesRef.current;
    pendingSaveOverridesRef.current = {};

    const pendingResolvers = pendingSaveResolversRef.current;
    pendingSaveResolversRef.current = [];

    const savePromise = queueDashboardStateSave(createDashboardState(pendingOverrides));
    savePromise.then((saved) => {
      pendingResolvers.forEach((resolve) => resolve(saved));
    });

    return savePromise;
  }, [createDashboardState, queueDashboardStateSave]);

  const waitForDashboardPersistenceIdle = useCallback(async () => {
    let allSaved = true;

    while (true) {
      if (pendingSaveTimerRef.current !== null) {
        await flushPendingDashboardSave();
      }

      const activeSave = firebaseSaveQueueRef.current;
      allSaved = (await activeSave.catch(() => false)) && allSaved;

      if (activeSave === firebaseSaveQueueRef.current && pendingSaveTimerRef.current === null) {
        return allSaved;
      }
    }
  }, [flushPendingDashboardSave]);

  const persistDashboardState = useCallback((
    overrides: Partial<DashboardState> = {},
    options: { immediate?: boolean } = {}
  ) => {
    if (!firebaseConfigured) {
      setSyncStatus('local');
      return Promise.resolve(true);
    }

    if (publicRoute) {
      return Promise.resolve(true);
    }

    pendingSaveOverridesRef.current = {
      ...pendingSaveOverridesRef.current,
      ...overrides
    };

    if (options.immediate) {
      return flushPendingDashboardSave();
    }

    const savePromise = new Promise<boolean>((resolve) => {
      pendingSaveResolversRef.current.push(resolve);
    });

    if (pendingSaveTimerRef.current !== null) {
      window.clearTimeout(pendingSaveTimerRef.current);
    }

    pendingSaveTimerRef.current = window.setTimeout(() => {
      flushPendingDashboardSave();
    }, DASHBOARD_SAVE_DEBOUNCE_MS);

    return savePromise;
  }, [firebaseConfigured, flushPendingDashboardSave, publicRoute, setSyncStatus]);

  const writeLocalDashboardValue = useCallback(<Key extends DashboardLocalStorageKey>(
    key: Key,
    value: DashboardPersistenceValues[Key]
  ) => {
    writeLocalStorageValue(DASHBOARD_LOCAL_STORAGE_KEYS[key], value, key);
  }, []);

  const writeLocalDashboardState = useCallback((state: Partial<DashboardPersistenceValues>) => {
    (Object.keys(DASHBOARD_LOCAL_STORAGE_KEYS) as DashboardLocalStorageKey[]).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        writeLocalStorageValue(DASHBOARD_LOCAL_STORAGE_KEYS[key], state[key], key);
      }
    });
  }, []);

  useEffect(() => () => {
    if (pendingSaveTimerRef.current !== null) {
      window.clearTimeout(pendingSaveTimerRef.current);
    }

    pendingSaveResolversRef.current.forEach((resolve) => resolve(false));
    pendingSaveResolversRef.current = [];
  }, []);

  // Flush a debounced save immediately when the tab is hidden or closing, so an
  // edit made within the 250ms debounce window right before navigating away is
  // not silently dropped (it otherwise only reached localStorage and the next
  // hydration would overwrite it with the older remote state).
  useEffect(() => {
    if (!firebaseConfigured || publicRoute) {
      return;
    }

    const flushIfPending = () => {
      if (pendingSaveTimerRef.current !== null) {
        flushPendingDashboardSave();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushIfPending();
      }
    };

    window.addEventListener('pagehide', flushIfPending);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', flushIfPending);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [firebaseConfigured, flushPendingDashboardSave, publicRoute]);

  return {
    createDashboardState,
    persistDashboardState,
    waitForDashboardPersistenceIdle,
    writeLocalDashboardState,
    writeLocalDashboardValue
  };
}
