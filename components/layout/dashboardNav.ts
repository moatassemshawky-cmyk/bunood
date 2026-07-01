import type { DashboardIconName } from './DashboardIcon';

export interface NavItem {
  href: string;
  label: string;
  icon: DashboardIconName;
}

/**
 * Single source of truth for the dashboard's nav. Adding/removing an item later
 * is a one-line change here, not a markup edit in the sidebar.
 */
export const DASHBOARD_NAV: NavItem[] = [
  { href: '/overview',              label: 'Overview',              icon: 'overview' },
  { href: '/projects',              label: 'Projects',              icon: 'projects' },
  { href: '/purchase-requests',     label: 'Purchase Requests',     icon: 'purchase' },
  { href: '/quotation-comparison',  label: 'Quotation Comparison',  icon: 'compare' },
  { href: '/suppliers',             label: 'Suppliers',             icon: 'suppliers' },
  { href: '/engineers',             label: 'Engineers',             icon: 'engineers' },
  { href: '/contractors',           label: 'Contractors',           icon: 'contractors' },
  { href: '/notifications',         label: 'Notifications',         icon: 'bell' },
  { href: '/messages',              label: 'Messages',              icon: 'messages' },
  { href: '/reports',               label: 'Reports',               icon: 'reports' },
  { href: '/settings',              label: 'Settings',              icon: 'settings' },
  { href: '/profile',               label: 'Profile',               icon: 'profile' },
];
