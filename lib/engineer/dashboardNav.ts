import type { NavItem } from '../../components/layout/dashboardNav';

/** Sidebar nav for the engineer-specific dashboard (distinct from the generic buyer-side one). */
export const ENGINEER_DASHBOARD_NAV: NavItem[] = [
  { href: '/engineer/dashboard',               label: 'Dashboard',     icon: 'overview' },
  { href: '/engineer/dashboard/projects',       label: 'Projects',     icon: 'projects' },
  { href: '/engineer/dashboard/boqs',           label: 'BOQs',         icon: 'boq' },
  { href: '/engineer/dashboard/rfqs',           label: 'RFQs',         icon: 'purchase' },
  { href: '/engineer/dashboard/suppliers',      label: 'Suppliers',    icon: 'suppliers' },
  { href: '/engineer/dashboard/notifications',  label: 'Notifications', icon: 'bell' },
  { href: '/engineer/dashboard/settings',       label: 'Settings',     icon: 'settings' },
];
