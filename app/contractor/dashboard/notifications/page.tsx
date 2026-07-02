import { PageHeader } from '../../../../components/dashboard/PageHeader';
import { EmptyState } from '../../../../components/dashboard/EmptyState';
import { DashboardIcon } from '../../../../components/layout/DashboardIcon';

export default function ContractorNotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" />
      <EmptyState
        title="No notifications yet"
        description="Updates on RFQ responses and quotations will appear here."
        icon={<DashboardIcon name="bell" size={28} />}
      />
    </>
  );
}
