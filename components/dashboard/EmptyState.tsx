interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

/** Shared empty-state block (generalized from the supplier dashboard's "No RFQs yet" pattern). */
export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="dc-empty">
      {icon && <div className="dc-empty-icon">{icon}</div>}
      <h3 className="dc-empty-title">{title}</h3>
      <p className="dc-empty-desc">{description}</p>
    </div>
  );
}
