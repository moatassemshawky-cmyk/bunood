import type { BoqNode } from '../../lib/mockData/engineerDashboard';
import { DashboardIcon } from '../layout/DashboardIcon';
import { BreakdownTable } from './BreakdownTable';

interface BOQNodeProps {
  node: BoqNode;
  depth: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

/** One row in the BOQ tree — recurses into child bands, or expands into a materials breakdown. */
export function BOQNode({ node, depth, expandedIds, onToggleExpand, selectedIds, onToggleSelect }: BOQNodeProps) {
  const isExpandable = Boolean(node.children?.length || node.breakdown?.length);
  const isExpanded = expandedIds.has(node.id);
  const selectedCount = node.breakdown?.filter(m => selectedIds.has(m.id)).length ?? 0;

  return (
    <div className="eg-node">
      <button
        type="button"
        className="eg-node-row"
        style={{ paddingInlineStart: `${16 + depth * 20}px` }}
        onClick={() => isExpandable && onToggleExpand(node.id)}
        aria-expanded={isExpandable ? isExpanded : undefined}
      >
        <span className={`eg-node-chevron ${isExpandable ? '' : 'is-hidden'} ${isExpanded ? 'is-open' : ''}`}>
          <DashboardIcon name="chevron" size={14} />
        </span>
        <span className="eg-node-name">{node.name}</span>
        {node.breakdown && <span className="eg-node-count">{node.breakdown.length} materials</span>}
        {selectedCount > 0 && <span className="eg-node-selected-badge">{selectedCount} selected</span>}
      </button>

      {isExpanded && node.children && (
        <div className="eg-node-children">
          {node.children.map(child => (
            <BOQNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}

      {isExpanded && node.breakdown && (
        <div className="eg-node-breakdown-wrap" style={{ paddingInlineStart: `${16 + depth * 20}px` }}>
          <span className="eg-breakdown-label">▾ Breakdown</span>
          <BreakdownTable materials={node.breakdown} selectedIds={selectedIds} onToggle={onToggleSelect} />
        </div>
      )}
    </div>
  );
}
