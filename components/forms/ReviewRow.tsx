interface ReviewRowProps {
  label: string;
  value: string;
  classPrefix: string;
}

/** Shared label/value row for a wizard's final review step. */
export function ReviewRow({ label, value, classPrefix }: ReviewRowProps) {
  return (
    <div className={`${classPrefix}-review-row`}>
      <span className={`${classPrefix}-review-label`}>{label}</span>
      <span className={`${classPrefix}-review-value`}>{value}</span>
    </div>
  );
}
