import { PageHeader } from '../../../components/dashboard/PageHeader';

const SAMPLE_CONTRACTORS = [
  { name: 'Al-Rashidi Construction Co.', rating: '★★★★☆', categories: ['Building', '51-200 employees'] },
  { name: 'Cairo Infrastructure Group',  rating: '★★★★★', categories: ['Roads', '200+ employees'] },
  { name: 'Nile Finishing Works',        rating: '★★★★☆', categories: ['Finishing', '21-50 employees'] },
];

export default function ContractorsPage() {
  return (
    <>
      <PageHeader title="Contractors" />
      <div className="dc-directory-grid">
        {SAMPLE_CONTRACTORS.map(s => (
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
