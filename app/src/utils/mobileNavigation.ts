import type { AppPage } from '../hooks/useNavigationState';

// Phones render MobileAppShell; iPad and wider get the desktop layout (owner
// 2026-10-20: "iPad view need same with desktop view"; it was <= 1366px before,
// which sent every iPad, even the 12.9" in landscape, to the phone shell).
// iPad mini portrait is 744px wide, so the shell stops just below it.
export const COMPACT_VIEWPORT_QUERY = '(max-width: 743px)';

// Compact viewports render MobileAppShell with five tabs. Each tab
// owns one AppPage; every other page is shown as a full-screen "subpage" that
// reuses the desktop page content inside a back-button wrapper.
export type MobileTab = 'today' | 'applications' | 'leads' | 'calendar' | 'me';

// Pages the five tabs render natively. `attendance` lives inside the Me tab.
// These pages only become a subpage when a mobile entry point explicitly asks
// for the full desktop version (e.g. Me -> Edit profile opens `user`).
export const MOBILE_TAB_PAGES: readonly AppPage[] = ['taskInbox', 'customers', 'rawCustomers', 'calendar', 'attendance', 'user'];

export type MobileSubpageState = {
  page: AppPage;
  returnTab: MobileTab;
};

const MOBILE_SUBPAGE_STORAGE_KEY = 'dr_racing_mobile_subpage';
const MOBILE_TABS: readonly MobileTab[] = ['today', 'applications', 'leads', 'calendar', 'me'];
const APP_PAGES: readonly AppPage[] = ['taskInbox', 'customers', 'rawCustomers', 'customerRelationships', 'calendar', 'attendance', 'financeCenter', 'settlement', 'pendingStock', 'delivery', 'tags', 'roleAccess', 'tools', 'user'];

export function isMobileTabPage(page: AppPage) {
  return MOBILE_TAB_PAGES.includes(page);
}

export function getMobileTabForPage(page: string): MobileTab {
  if (page === 'customers') return 'applications';
  if (page === 'rawCustomers') return 'leads';
  if (page === 'calendar') return 'calendar';
  if (page === 'user' || page === 'attendance') return 'me';
  return 'today';
}

export function getPageForMobileTab(tab: MobileTab) {
  if (tab === 'applications') return 'customers' as const;
  if (tab === 'leads') return 'rawCustomers' as const;
  if (tab === 'calendar') return 'calendar' as const;
  if (tab === 'me') return 'user' as const;
  return 'taskInbox' as const;
}

/** True when a compact viewport should show `activePage` in the subpage wrapper. */
export function isMobileSubpage(activePage: AppPage, subpage: MobileSubpageState | null) {
  return !isMobileTabPage(activePage) || subpage?.page === activePage;
}

/**
 * Keeps the subpage record in step with navigation that happens inside page
 * content (e.g. Finance -> Vehicle Info): another non-tab page stays a subpage
 * with the same return tab, while landing on a tab page closes the subpage.
 */
export function followMobileSubpage(
  subpage: MobileSubpageState | null,
  activePage: AppPage
): MobileSubpageState | null {
  if (!subpage || subpage.page === activePage) return subpage;
  return isMobileTabPage(activePage) ? null : { page: activePage, returnTab: subpage.returnTab };
}

export function readStoredMobileSubpage(): MobileSubpageState | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MOBILE_SUBPAGE_STORAGE_KEY) || 'null') as Partial<MobileSubpageState> | null;
    if (!parsed || !APP_PAGES.includes(parsed.page as AppPage)) return null;
    return {
      page: parsed.page as AppPage,
      returnTab: MOBILE_TABS.includes(parsed.returnTab as MobileTab) ? parsed.returnTab as MobileTab : 'today'
    };
  } catch {
    return null;
  }
}

export function writeStoredMobileSubpage(subpage: MobileSubpageState | null) {
  if (typeof window === 'undefined') return;
  try {
    if (subpage) {
      window.localStorage.setItem(MOBILE_SUBPAGE_STORAGE_KEY, JSON.stringify(subpage));
    } else {
      window.localStorage.removeItem(MOBILE_SUBPAGE_STORAGE_KEY);
    }
  } catch {
    // Persistence is a convenience; storage failures must not block navigation.
  }
}
