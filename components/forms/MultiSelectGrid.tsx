interface Option {
  id: string;
  en: string;
  ar: string;
}

interface MultiSelectGridProps {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  /** Full class stem, e.g. "er-spec" or "cr-work" — appends -grid/-btn/-en/-ar/-check. */
  classPrefix: string;
  /** Show a checkmark badge on selected items (used for multi-select, not single-select). */
  showCheck?: boolean;
}

/** Shared button-grid picker for both single-select and multi-select option lists. */
export function MultiSelectGrid({ options, selected, onToggle, classPrefix, showCheck }: MultiSelectGridProps) {
  return (
    <div className={`${classPrefix}-grid`}>
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          className={`${classPrefix}-btn ${selected.includes(o.id) ? 'selected' : ''}`}
          onClick={() => onToggle(o.id)}
        >
          <span className={`${classPrefix}-en`}>{o.en}</span>
          <span className={`${classPrefix}-ar`}>{o.ar}</span>
          {showCheck && selected.includes(o.id) && <span className={`${classPrefix}-check`}>✓</span>}
        </button>
      ))}
    </div>
  );
}
