interface StepProgressProps {
  steps: string[];
  /** 1-indexed current step. */
  current: number;
  classPrefix: string;
}

/** Shared progress bar + numbered step dots header for multi-step wizards. */
export function StepProgress({ steps, current, classPrefix }: StepProgressProps) {
  const pct = Math.round((current / steps.length) * 100);

  return (
    <>
      <div className={`${classPrefix}-progress-bar`}>
        <div className={`${classPrefix}-progress-fill`} style={{ width: `${pct}%` }} />
      </div>
      <div className={`${classPrefix}-steps`}>
        {steps.map((label, i) => (
          <div
            key={i}
            className={`${classPrefix}-step ${current === i + 1 ? 'active' : current > i + 1 ? 'done' : ''}`}
          >
            <div className={`${classPrefix}-step-dot`}>
              {current > i + 1 ? (
                <svg width="10" height="8" viewBox="0 0 10 8">
                  <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`${classPrefix}-step-label`}>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
