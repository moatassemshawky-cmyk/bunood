import { PageHeader } from '../../../../components/dashboard/PageHeader';
import { EmptyState } from '../../../../components/dashboard/EmptyState';
import { DashboardIcon } from '../../../../components/layout/DashboardIcon';

export default function ContractorQuotationsPage() {
  return (
    <>
      <PageHeader title="Quotations" />
      <EmptyState
        title="No quotations to compare yet"
        description="Once suppliers respond to your RFQs, their quotations will appear here for side-by-side comparison."
        icon={<DashboardIcon name="compare" size={28} />}
      />
    </>
  );
}
