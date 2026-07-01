import type { BreakdownMaterial } from '../../lib/mockData/engineerDashboard';

interface MaterialRowProps {
  material: BreakdownMaterial;
  selected: boolean;
  onToggle: (id: string) => void;
}

const AVAILABILITY_LABEL: Record<BreakdownMaterial['availability'], string> = {
  available: 'Available',
  limited: 'Limited stock',
  unavailable: 'Unavailable',
};

export function MaterialRow({ material, selected, onToggle }: MaterialRowProps) {
  return (
    <tr className={`eg-mat-row ${selected ? 'is-selected' : ''}`}>
      <td className="eg-mat-check">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(material.id)}
          aria-label={`Select ${material.name} for RFQ`}
        />
      </td>
      <td className="eg-mat-name">{material.name}</td>
      <td className="eg-mat-unit">{material.unit}</td>
      <td className="eg-mat-qty">{material.quantity}</td>
      <td className="eg-mat-cost">{material.estimatedCost.toLocaleString()} EGP</td>
      <td className="eg-mat-avail">
        <span className={`eg-avail-badge eg-avail-${material.availability}`}>
          {AVAILABILITY_LABEL[material.availability]}
        </span>
      </td>
    </tr>
  );
}
