interface PlaceholderChartProps {
  title: string;
  caption?: string;
}

/**
 * Styled empty-chart placeholder — intentionally not backed by a charting library.
 * Swap the inner box for a real chart once there's real data to plot.
 */
export function PlaceholderChart({ title, caption }: PlaceholderChartProps) {
  return (
    <div className="dc-chart">
      <div className="dc-chart-head">
        <span className="dc-chart-title">{title}</span>
      </div>
      <div className="dc-chart-body">
        <svg width="100%" height="100%" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden>
          <polyline
            points="0,100 40,80 80,90 120,55 160,65 200,35 240,45 280,20 320,30"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            opacity="0.25"
          />
        </svg>
        <span className="dc-chart-caption">{caption ?? 'Coming soon'}</span>
      </div>
    </div>
  );
}
