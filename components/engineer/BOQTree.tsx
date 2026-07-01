'use client';

import { useState } from 'react';
import type { BoqNode } from '../../lib/mockData/engineerDashboard';
import { BOQNode } from './BOQNode';

interface BOQTreeProps {
  tree: BoqNode[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

/** Renders a BOQ's node hierarchy and owns which nodes are expanded. */
export function BOQTree({ tree, selectedIds, onToggleSelect }: BOQTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(tree.map(n => n.id)));

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="eg-tree">
      {tree.map(node => (
        <BOQNode
          key={node.id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
