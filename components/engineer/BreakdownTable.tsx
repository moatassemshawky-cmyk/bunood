import type { BreakdownMaterial } from '../../lib/mockData/engineerDashboard';
import { MaterialRow } from './MaterialRow';

interface BreakdownTableProps {
  materials: BreakdownMaterial[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export function BreakdownTable({ materials, selectedIds, onToggle }: BreakdownTableProps) {
  return (
    <div className="eg-breakdown">
      <table className="eg-mat-table">
        <thead>
          <tr>
            <th className="eg-mat-check" />
            <th>Material</th>
            <th>Unit</th>
            <th>Quantity</th>
            <th>Est. Cost</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          {materials.map(material => (
            <MaterialRow
              key={material.id}
              material={material}
              selected={selectedIds.has(material.id)}
              onToggle={onToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
