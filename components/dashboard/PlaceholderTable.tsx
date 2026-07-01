interface Column {
  key: string;
  label: string;
}

interface PlaceholderTableProps {
  columns: Column[];
  /** Sample rows — plain strings per column, rendered as-is (a status column can pass a badge element instead). */
  rows: Array<Record<string, React.ReactNode>>;
  emptyLabel?: string;
}

/** Shared table shell for list-style dashboard pages (Projects, Purchase Requests, etc.). */
export function PlaceholderTable({ columns, rows, emptyLabel }: PlaceholderTableProps) {
  return (
    <div className="dc-table-wrap">
      <table className="dc-table">
        <thead>
          <tr>
            {columns.map(c => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="dc-table-empty" colSpan={columns.length}>
                {emptyLabel ?? 'Nothing here yet'}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                {columns.map(c => <td key={c.key}>{row[c.key]}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }: { status: 'pending' | 'active' | 'done' }) {
  return <span className={`dc-status-badge dc-status-${status}`}>{status}</span>;
}
