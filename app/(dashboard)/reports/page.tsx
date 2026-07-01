import { PageHeader } from '../../../components/dashboard/PageHeader';
import { PlaceholderChart } from '../../../components/dashboard/PlaceholderChart';

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" action={{ label: 'Export', icon: 'download' }} />
      <div className="dc-section dc-grid-2">
        <PlaceholderChart title="Procurement Spend by Month" />
        <PlaceholderChart title="Savings vs. Market Rate" />
      </div>
    </>
  );
}
