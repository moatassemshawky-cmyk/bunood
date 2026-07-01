import { PageHeader } from '../../../components/dashboard/PageHeader';

const SAMPLE_SUPPLIERS = [
  { name: 'Delta Steel Co.', rating: '★★★★☆', categories: ['Steel', 'Rebar'] },
  { name: 'Al-Masry Concrete', rating: '★★★★★', categories: ['Ready Mix', 'Cement'] },
  { name: 'Nile Electrical Supplies', rating: '★★★★☆', categories: ['Electrical'] },
];

export default function SuppliersPage() {
  return (
    <>
      <PageHeader title="Suppliers" />
      <div className="dc-directory-grid">
        {SAMPLE_SUPPLIERS.map(s => (
          <div key={s.name} className="dc-directory-card">
            <h3 className="dc-directory-name">{s.name}</h3>
            <div className="dc-directory-rating">{s.rating}</div>
            <div className="dc-directory-chips">
              {s.categories.map(c => <span key={c} className="dc-directory-chip">{c}</span>)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
