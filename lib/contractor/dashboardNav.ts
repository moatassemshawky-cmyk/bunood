import type { NavItem } from '../../components/layout/dashboardNav';

/** Sidebar nav for the contractor-specific dashboard (distinct from the generic buyer-side one). */
export const CONTRACTOR_DASHBOARD_NAV: NavItem[] = [
  { href: '/contractor/dashboard',               label: 'Dashboard',     icon: 'overview' },
  { href: '/contractor/dashboard/projects',       label: 'Projects',     icon: 'projects' },
  { href: '/contractor/dashboard/rfqs',           label: 'RFQs',         icon: 'purchase' },
  { href: '/contractor/dashboard/quotations',     label: 'Quotations',  icon: 'compare' },
  { href: '/contractor/dashboard/suppliers',      label: 'Suppliers',    icon: 'suppliers' },
  { href: '/contractor/dashboard/profile',        label: 'Profile',      icon: 'profile' },
  { href: '/contractor/dashboard/notifications',  label: 'Notifications', icon: 'bell' },
];
