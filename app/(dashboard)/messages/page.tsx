import { PageHeader } from '../../../components/dashboard/PageHeader';
import { EmptyState } from '../../../components/dashboard/EmptyState';
import { DashboardIcon } from '../../../components/layout/DashboardIcon';

export default function MessagesPage() {
  return (
    <>
      <PageHeader title="Messages" />
      <EmptyState
        title="No messages yet"
        description="Conversations with suppliers, engineers, and contractors will show up here."
        icon={<DashboardIcon name="messages" size={28} />}
      />
    </>
  );
}
