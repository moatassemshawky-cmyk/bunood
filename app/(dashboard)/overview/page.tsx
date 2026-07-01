import { KpiCard } from '../../../components/dashboard/KpiCard';
import { PlaceholderChart } from '../../../components/dashboard/PlaceholderChart';
import { EmptyState } from '../../../components/dashboard/EmptyState';
import { PageHeader } from '../../../components/dashboard/PageHeader';
import { DashboardIcon } from '../../../components/layout/DashboardIcon';

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" />

      <div className="dc-section dc-grid-4">
        <KpiCard label="Open Requests" value="—" sub="Coming soon" />
        <KpiCard label="Active Projects" value="—" sub="Coming soon" />
        <KpiCard label="Pending Quotes" value="—" sub="Coming soon" />
        <KpiCard label="Avg. Savings" value="—" sub="Coming soon" />
      </div>

      <div className="dc-section dc-grid-2">
        <PlaceholderChart title="Spend Over Time" />
        <PlaceholderChart title="Requests by Category" />
      </div>

      <div className="dc-section">
        <EmptyState
          title="No recent activity yet"
          description="Once you create projects and purchase requests, recent activity will show up here."
          icon={<DashboardIcon name="reports" size={28} />}
        />
      </div>
    </>
  );
}
