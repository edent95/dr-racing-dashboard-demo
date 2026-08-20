import { useCallback, useEffect, useState } from 'react';
import type { RoleSettingsTab, TagGroup } from '../components/TagsAdmin';
import type { RoleAccountRole, RoleNavAccessSetting } from '../types';
import { resolveNavAccess } from '../data/roleNavAccess';

export type ToolsView = 'analytics' | 'missions' | 'approvals' | 'whatsapp' | 'audit' | 'dataExport';
export type RewardCenterView = 'payouts' | 'missions' | 'team_battle';
export type AppPage = 'taskInbox' | 'staffView' | 'customers' | 'rawCustomers' | 'customerRelationships' | 'calendar' | 'attendance' | 'financeCenter' | 'staffExperience' | 'tags' | 'permissions' | 'roleAccess' | 'notificationSettings' | 'rewards' | 'salesBudget' | 'tools' | 'flow' | 'user';

const NAVIGATION_STORAGE_KEY = 'dr_racing_last_navigation';
const APP_PAGES: readonly AppPage[] = ['taskInbox', 'staffView', 'customers', 'rawCustomers', 'customerRelationships', 'calendar', 'attendance', 'financeCenter', 'staffExperience', 'tags', 'permissions', 'roleAccess', 'notificationSettings', 'rewards', 'salesBudget', 'tools', 'flow', 'user'];
const TOOLS_VIEWS: readonly ToolsView[] = ['analytics', 'missions', 'approvals', 'whatsapp', 'audit', 'dataExport'];
const SETTING_GROUPS: readonly TagGroup[] = ['info', 'brandLogo', 'bank', 'code', 'roles', 'commissionRules', 'relationship'];
const REWARD_CENTER_VIEWS: readonly RewardCenterView[] = ['payouts', 'missions', 'team_battle'];
const ROLE_SETTINGS_TABS: readonly RoleSettingsTab[] = ['accounts', 'access', 'assignments'];

type StoredNavigationState = {
  activePage: AppPage;
  activeToolsView: ToolsView;
  activeSettingGroup: TagGroup;
  activeRoleTab: RoleSettingsTab;
  activeRewardCenterView: RewardCenterView;
};

const DEFAULT_NAVIGATION_STATE: StoredNavigationState = {
  activePage: 'taskInbox',
  activeToolsView: 'analytics',
  activeSettingGroup: 'info',
  activeRoleTab: 'accounts',
  activeRewardCenterView: 'payouts'
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
      activeRoleTab: isStoredValue(parsed.activeRoleTab, ROLE_SETTINGS_TABS) ? parsed.activeRoleTab : DEFAULT_NAVIGATION_STATE.activeRoleTab,
      activeRewardCenterView: isStoredValue(parsed.activeRewardCenterView, REWARD_CENTER_VIEWS) ? parsed.activeRewardCenterView : DEFAULT_NAVIGATION_STATE.activeRewardCenterView
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
  brandLogo: ['Super Admin'],
  bankDatabase: ['Super Admin', 'Admin'],
  rolesAccounts: ['Super Admin'],
  permissions: ['Super Admin'],
  roleAccess: ['Super Admin'],
  notificationSettings: ['Super Admin'],
  commissionRules: ['Super Admin'],
  financeCenter: ['Super Admin', 'Admin'],
  audit: ['Super Admin', 'Admin'],
  salesBudget: ['Super Admin'],
  staffExperience: ['Super Admin']
};

export const SETTING_GROUP_NAV_KEY: Record<TagGroup, string> = {
  info: 'vehicleInfo',
  brandLogo: 'brandLogo',
  bank: 'bankDatabase',
  code: 'bankDatabase',
  roles: 'rolesAccounts',
  commissionRules: 'commissionRules',
  relationship: 'vehicleInfo'
};

export function useNavigationState(
  currentStaffRole: RoleAccountRole,
  roleNavAccess: RoleNavAccessSetting[] = []
) {
  const [storedNavigation] = useState(readStoredNavigationState);
  const [activePage, setActivePage] = useState<AppPage>(storedNavigation.activePage);
  const [activeToolsView, setActiveToolsView] = useState<ToolsView>(storedNavigation.activeToolsView);
  const [approvalPreset, setApprovalPreset] = useState<{ filter: 'active' | 'mine'; token: number }>({ filter: 'active', token: 0 });
  const [activeSettingGroup, setActiveSettingGroup] = useState<TagGroup>(storedNavigation.activeSettingGroup);
  const [activeRoleTab, setActiveRoleTab] = useState<RoleSettingsTab>(storedNavigation.activeRoleTab);
  const [activeRewardCenterView, setActiveRewardCenterView] = useState<RewardCenterView>(storedNavigation.activeRewardCenterView);

  const canAccessNavKey = useCallback((key: string) => (
    resolveNavAccess(currentStaffRole, key, roleNavAccess, NAV_ROLE_ACCESS[key])
  ), [currentStaffRole, roleNavAccess]);

  useEffect(() => {
    try {
      window.localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify({
        activePage,
        activeToolsView,
        activeSettingGroup,
        activeRoleTab,
        activeRewardCenterView
      } satisfies StoredNavigationState));
    } catch {
      // Navigation persistence is a convenience; storage failures must not block the dashboard.
    }
  }, [activePage, activeRewardCenterView, activeRoleTab, activeSettingGroup, activeToolsView]);

  return {
    activePage,
    activeRewardCenterView,
    activeRoleTab,
    activeSettingGroup,
    activeToolsView,
    approvalPreset,
    canAccessNavKey,
    setActivePage,
    setActiveRewardCenterView,
    setActiveRoleTab,
    setActiveSettingGroup,
    setActiveToolsView,
    setApprovalPreset
  };
}
