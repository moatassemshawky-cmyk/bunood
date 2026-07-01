import { PageHeader } from '../../../../components/dashboard/PageHeader';
import { MOCK_SUPPLIERS } from '../../../../lib/mockData/engineerDashboard';

export default function EngineerSuppliersPage() {
  return (
    <>
      <PageHeader title="Suppliers" />
      <div className="dc-directory-grid">
        {MOCK_SUPPLIERS.map(supplier => (
          <div key={supplier.id} className="dc-directory-card">
            <h3 className="dc-directory-name">{supplier.name}</h3>
            <div className="dc-directory-rating">★ {supplier.rating.toFixed(1)}</div>
            <div className="dc-directory-chips">
              {supplier.categories.map(c => <span key={c} className="dc-directory-chip">{c}</span>)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
