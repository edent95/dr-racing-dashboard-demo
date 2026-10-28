import { useCallback, useEffect, useState } from 'react';
import type { RoleSettingsTab, TagGroup } from '../components/TagsAdmin';
import type { RoleAccountRole, RoleNavAccessSetting } from '../types';
import { resolveNavAccess } from '../data/roleNavAccess';

export type ToolsView = 'analytics' | 'whatsapp' | 'audit' | 'dataExport';
export type AppPage = 'taskInbox' | 'customers' | 'rawCustomers' | 'customerRelationships' | 'calendar' | 'attendance' | 'financeCenter' | 'settlement' | 'pendingStock' | 'delivery' | 'tags' | 'roleAccess' | 'tools' | 'user';

const NAVIGATION_STORAGE_KEY = 'dr_racing_last_navigation';
const APP_PAGES: readonly AppPage[] = ['taskInbox', 'customers', 'rawCustomers', 'customerRelationships', 'calendar', 'attendance', 'financeCenter', 'settlement', 'pendingStock', 'delivery', 'tags', 'roleAccess', 'tools', 'user'];
const TOOLS_VIEWS: readonly ToolsView[] = ['analytics', 'whatsapp', 'audit', 'dataExport'];
const SETTING_GROUPS: readonly TagGroup[] = ['info', 'bank', 'code', 'roles'];
const ROLE_SETTINGS_TABS: readonly RoleSettingsTab[] = ['accounts', 'access', 'assignments'];

type StoredNavigationState = {
  activePage: AppPage;
  activeToolsView: ToolsView;
  activeSettingGroup: TagGroup;
  activeRoleTab: RoleSettingsTab;
};

const DEFAULT_NAVIGATION_STATE: StoredNavigationState = {
  activePage: 'taskInbox',
  activeToolsView: 'analytics',
  activeSettingGroup: 'info',
  activeRoleTab: 'accounts'
};

const isStoredValue = <Value extends string>(
  value: unknown,
  allowedValues: readonly Value[]
): value is Value => (
  typeof value === 'string' && allowedValues.includes(value as Value)
);

const readStoredNavigationState = (): StoredNavigationState => {
  if (typeof window === 'undefined') {
    return DEFAULT_NAVIGATION_STATE;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(NAVIGATION_STORAGE_KEY) || '{}') as Partial<StoredNavigationState>;
    return {
      activePage: isStoredValue(parsed.activePage, APP_PAGES) ? parsed.activePage : DEFAULT_NAVIGATION_STATE.activePage,
      activeToolsView: isStoredValue(parsed.activeToolsView, TOOLS_VIEWS) ? parsed.activeToolsView : DEFAULT_NAVIGATION_STATE.activeToolsView,
      activeSettingGroup: isStoredValue(parsed.activeSettingGroup, SETTING_GROUPS) ? parsed.activeSettingGroup : DEFAULT_NAVIGATION_STATE.activeSettingGroup,
      activeRoleTab: isStoredValue(parsed.activeRoleTab, ROLE_SETTINGS_TABS) ? parsed.activeRoleTab : DEFAULT_NAVIGATION_STATE.activeRoleTab
    };
  } catch {
    return DEFAULT_NAVIGATION_STATE;
  }
};

// Baseline hard gate. Configurable pages (see src/data/roleNavAccess.ts) layer
// Super-Admin overrides on top of these defaults; the privilege/owner pages
// below stay Super-Admin-only and cannot be handed to another role.
const NAV_ROLE_ACCESS: Record<string, RoleAccountRole[]> = {
  vehicleInfo: ['Super Admin'],
  bankDatabase: ['Super Admin', 'Admin'],
  rolesAccounts: ['Super Admin'],
  roleAccess: ['Super Admin'],
  financeCenter: ['Super Admin', 'Admin'],
  audit: ['Super Admin', 'Admin']
};

export const SETTING_GROUP_NAV_KEY: Record<TagGroup, string> = {
  info: 'vehicleInfo',
  bank: 'bankDatabase',
  code: 'bankDatabase',
  roles: 'rolesAccounts'
};

export function useNavigationState(
  currentStaffRole: RoleAccountRole,
  roleNavAccess: RoleNavAccessSetting[] = []
) {
  const [storedNavigation] = useState(readStoredNavigationState);
  const [activePage, setActivePage] = useState<AppPage>(storedNavigation.activePage);
  const [activeToolsView, setActiveToolsView] = useState<ToolsView>(storedNavigation.activeToolsView);
  const [activeSettingGroup, setActiveSettingGroup] = useState<TagGroup>(storedNavigation.activeSettingGroup);
  const [activeRoleTab, setActiveRoleTab] = useState<RoleSettingsTab>(storedNavigation.activeRoleTab);

  const canAccessNavKey = useCallback((key: string) => {
    // The Settlement and Pending Stock pages write deal finance / stock like Finance Center, so they follow
    // that access (and its Rules capability).
    const accessKey = key === 'settlement' || key === 'pendingStock' ? 'financeCenter' : key;
    return resolveNavAccess(currentStaffRole, accessKey, roleNavAccess, NAV_ROLE_ACCESS[accessKey]);
  }, [currentStaffRole, roleNavAccess]);

  useEffect(() => {
    try {
      window.localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify({
        activePage,
        activeToolsView,
        activeSettingGroup,
        activeRoleTab
      } satisfies StoredNavigationState));
    } catch {
      // Navigation persistence is a convenience; storage failures must not block the dashboard.
    }
  }, [activePage, activeRoleTab, activeSettingGroup, activeToolsView]);

  return {
    activePage,
    activeRoleTab,
    activeSettingGroup,
    activeToolsView,
    canAccessNavKey,
    setActivePage,
    setActiveRoleTab,
    setActiveSettingGroup,
    setActiveToolsView
  };
}
