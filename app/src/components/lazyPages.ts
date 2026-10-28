import { lazy } from 'react';

// Lazily loaded pages and panels, one code-split chunk each. Moved unchanged
// from App.tsx so App and the extracted page-content builder share the same
// lazy component instances.
export const CustomerList = lazy(() => import('./CustomerList'));
export const DetailDrawer = lazy(() => import('./DetailDrawer'));
export const NotificationCenter = lazy(() => import('./NotificationCenter'));
export const PublicCustomerIntakePage = lazy(() => import('./PublicCustomerIntakePage'));
export const PublicSeoLandingPage = lazy(() => import('./PublicSeoLandingPage'));
export const PublicStockDetailPage = lazy(() => import('./PublicStockDetailPage'));
export const PublicStockIndexPage = lazy(() => import('./PublicStockIndexPage'));
export const PublicBlogIndexPage = lazy(() =>
  import('./PublicBlogPage').then((module) => ({ default: module.PublicBlogIndexPage }))
);
export const PublicBlogPostPage = lazy(() =>
  import('./PublicBlogPage').then((module) => ({ default: module.PublicBlogPostPage }))
);
export const PublicCalculatorPage = lazy(() => import('./PublicCalculatorPage'));
export const StaffVehicleInfoMissionPanel = lazy(() => import('./StaffVehicleInfoMissionPanel'));
export const TaskInboxPage = lazy(() => import('./TaskInboxPage'));
export const MobileAppShell = lazy(() => import('./MobileAppShell'));
export const MobileSubpageFrame = lazy(() => import('./MobileSubpageFrame'));
export const RawCustomerDatabase = lazy(() => import('./RawCustomerDatabase'));
export const CustomerRelationshipRiskPage = lazy(() => import('./CustomerRelationshipRiskPage'));
export const CalendarPage = lazy(() => import('./CalendarPage'));
export const AttendancePage = lazy(() => import('./AttendancePage'));
export const TagsAdmin = lazy(() => import('./TagsAdmin'));
export const WhatsAppTrackingAdmin = lazy(() => import('./WhatsAppTrackingAdmin'));
export const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
export const RewardCommissionCenter = lazy(() => import('./RewardCommissionCenter'));
export const AuditLogAdmin = lazy(() => import('./AuditLogAdmin'));
export const DataExportCenter = lazy(() => import('./DataExportCenter'));
export const UserProfilePage = lazy(() => import('./UserProfilePage'));
export const RoleAccessControlPage = lazy(() => import('./RoleAccessControlPage'));
export const FinanceCenter = lazy(() => import('./FinanceCenter'));
export const SettlementPage = lazy(() => import('./SettlementPage'));
export const StockPage = lazy(() => import('./StockPage'));
export const DeliveryPage = lazy(() => import('./DeliveryPage'));
export const StaffHandbookPage = lazy(() => import('./StaffHandbookPage'));
