import { PageHeader } from '../../../components/dashboard/PageHeader';

const SAMPLE_ENGINEERS = [
  { name: 'Eng. Ahmed Al-Rashidi', rating: '★★★★★', categories: ['Structural', '8 yrs exp.'] },
  { name: 'Eng. Sara Mahmoud',     rating: '★★★★☆', categories: ['Electrical', '5 yrs exp.'] },
  { name: 'Eng. Omar Hassan',      rating: '★★★★☆', categories: ['HVAC', '10 yrs exp.'] },
];

export default function EngineersPage() {
  return (
    <>
      <PageHeader title="Engineers" />
      <div className="dc-directory-grid">
        {SAMPLE_ENGINEERS.map(s => (
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
