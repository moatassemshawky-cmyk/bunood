import { PageHeader } from '../../../../components/dashboard/PageHeader';
import { EmptyState } from '../../../../components/dashboard/EmptyState';
import { DashboardIcon } from '../../../../components/layout/DashboardIcon';

export default function ContractorRfqsPage() {
  return (
    <>
      <PageHeader title="RFQs" action={{ label: 'New RFQ', icon: 'plus' }} />
      <EmptyState
        title="No RFQs sent yet"
        description="Requests for quotation you send to suppliers will appear here, along with their status."
        icon={<DashboardIcon name="purchase" size={28} />}
      />
    </>
  );
}
