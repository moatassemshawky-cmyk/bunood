import type { Supplier } from '../../lib/mockData/engineerDashboard';

interface SupplierSelectorProps {
  suppliers: Supplier[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export function SupplierSelector({ suppliers, selectedIds, onToggle }: SupplierSelectorProps) {
  return (
    <div className="eg-supplier-selector">
      {suppliers.map(supplier => (
        <label key={supplier.id} className="eg-supplier-row">
          <input
            type="checkbox"
            checked={selectedIds.has(supplier.id)}
            onChange={() => onToggle(supplier.id)}
          />
          <span className="eg-supplier-info">
            <span className="eg-supplier-name">{supplier.name}</span>
            <span className="eg-supplier-categories">{supplier.categories.join(', ')}</span>
          </span>
          <span className="eg-supplier-rating">★ {supplier.rating.toFixed(1)}</span>
        </label>
      ))}
    </div>
  );
}
