import { PageHeader } from '../../../components/dashboard/PageHeader';
import { EmptyState } from '../../../components/dashboard/EmptyState';
import { DashboardIcon } from '../../../components/layout/DashboardIcon';

export default function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" />
      <EmptyState
        title="No notifications yet"
        description="You'll see updates about your projects, quotes, and messages here."
        icon={<DashboardIcon name="bell" size={28} />}
      />
    </>
  );
}
