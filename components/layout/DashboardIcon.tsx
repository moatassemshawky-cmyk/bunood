export type DashboardIconName =
  | 'overview' | 'projects' | 'purchase' | 'compare' | 'suppliers'
  | 'engineers' | 'contractors' | 'bell' | 'messages' | 'reports'
  | 'settings' | 'profile' | 'logout' | 'search' | 'plus' | 'download'
  | 'boq' | 'chevron' | 'duplicate' | 'archive' | 'close' | 'building';

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Shared stroke-based icon set for the dashboard shell — no icon package dependency. */
export function DashboardIcon({ name, size = 18 }: { name: DashboardIconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {name === 'overview' && (
        <><rect {...common} x="3" y="3" width="7" height="7" /><rect {...common} x="14" y="3" width="7" height="7" />
          <rect {...common} x="14" y="14" width="7" height="7" /><rect {...common} x="3" y="14" width="7" height="7" /></>
      )}
      {name === 'projects' && (
        <><path {...common} d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></>
      )}
      {name === 'purchase' && (
        <><path {...common} d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path {...common} d="M3 6h18" /><path {...common} d="M16 10a4 4 0 0 1-8 0" /></>
      )}
      {name === 'compare' && (
        <><path {...common} d="M3 3v18h18" /><path {...common} d="M7 15l3-4 3 3 4-6" /></>
      )}
      {name === 'suppliers' && (
        <><path {...common} d="M4 8 12 4l8 4v8l-8 4-8-4Z" /><path {...common} d="M4 8l8 4 8-4" /><path {...common} d="M12 12v8" /></>
      )}
      {name === 'engineers' && (
        <><path {...common} d="M5 19 19 19 5 5Z" /><path {...common} d="M5 12 12 12" /></>
      )}
      {name === 'contractors' && (
        <><path {...common} d="M3 18h18" /><path {...common} d="M5 18a7 7 0 0 1 14 0" /><path {...common} d="M11 5h2v3" /></>
      )}
      {name === 'bell' && (
        <><path {...common} d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" /><path {...common} d="M10 19a2 2 0 0 0 4 0" /></>
      )}
      {name === 'messages' && (
        <><path {...common} d="M4 5h16v11H8l-4 4Z" /></>
      )}
      {name === 'reports' && (
        <><path {...common} d="M4 20V10" /><path {...common} d="M11 20V4" /><path {...common} d="M18 20v-7" /></>
      )}
      {name === 'settings' && (
        <><circle {...common} cx="12" cy="12" r="3" /><path {...common} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.2.5.7.9 1.3 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>
      )}
      {name === 'profile' && (
        <><circle {...common} cx="12" cy="8" r="4" /><path {...common} d="M4 20a8 8 0 0 1 16 0" /></>
      )}
      {name === 'logout' && (
        <><path {...common} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline {...common} points="16 17 21 12 16 7" /><line {...common} x1="21" y1="12" x2="9" y2="12" /></>
      )}
      {name === 'search' && (
        <><circle {...common} cx="11" cy="11" r="7" /><line {...common} x1="21" y1="21" x2="16.65" y2="16.65" /></>
      )}
      {name === 'plus' && (
        <><line {...common} x1="12" y1="5" x2="12" y2="19" /><line {...common} x1="5" y1="12" x2="19" y2="12" /></>
      )}
      {name === 'download' && (
        <><path {...common} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline {...common} points="7 10 12 15 17 10" /><line {...common} x1="12" y1="15" x2="12" y2="3" /></>
      )}
      {name === 'boq' && (
        <><path {...common} d="M6 3h9l3 3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path {...common} d="M9 9h6" /><path {...common} d="M9 13h6" /><path {...common} d="M9 17h4" /></>
      )}
      {name === 'chevron' && (
        <polyline {...common} points="9 6 15 12 9 18" />
      )}
      {name === 'duplicate' && (
        <><rect {...common} x="9" y="9" width="12" height="12" rx="2" /><path {...common} d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>
      )}
      {name === 'archive' && (
        <><rect {...common} x="3" y="4" width="18" height="4" rx="1" /><path {...common} d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" /><path {...common} d="M10 13h4" /></>
      )}
      {name === 'close' && (
        <><line {...common} x1="6" y1="6" x2="18" y2="18" /><line {...common} x1="18" y1="6" x2="6" y2="18" /></>
      )}
      {name === 'building' && (
        <><rect {...common} x="4" y="3" width="16" height="18" rx="1" /><path {...common} d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" /></>
      )}
    </svg>
  );
}
