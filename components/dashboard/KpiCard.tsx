interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
}

/** Stat card used across dashboard overview/reports pages (mirrors the supplier dashboard's stat cards). */
export function KpiCard({ label, value, sub }: KpiCardProps) {
  return (
    <div className="dc-kpi-card">
      <span className="dc-kpi-label">{label}</span>
      <span className="dc-kpi-value">{value}</span>
      {sub && <span className="dc-kpi-sub">{sub}</span>}
    </div>
  );
}
