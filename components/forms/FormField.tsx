interface FormFieldProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  /** Full class stem shared by a page's fields, e.g. "er" or "cr". */
  classPrefix: string;
}

/** Shared label + error wrapper used by every registration wizard field. */
export function FormField({ label, error, children, classPrefix }: FormFieldProps) {
  return (
    <div className={`${classPrefix}-field`}>
      {label && <label className={`${classPrefix}-label`}>{label}</label>}
      {children}
      {error && <span className={`${classPrefix}-field-error`}>{error}</span>}
    </div>
  );
}
