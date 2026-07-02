import { PageHeader } from '../../../components/dashboard/PageHeader';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import { EmptyState } from '../../../components/dashboard/EmptyState';
import { DashboardIcon } from '../../../components/layout/DashboardIcon';

export default function ContractorDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />

      <div className="dc-section dc-grid-4">
        <KpiCard label="Active Projects" value="—" sub="Coming soon" />
        <KpiCard label="Open RFQs" value="—" sub="Coming soon" />
        <KpiCard label="Quotations" value="—" sub="Coming soon" />
        <KpiCard label="Connected Suppliers" value="—" sub="Coming soon" />
      </div>

      <div className="dc-section">
        <EmptyState
          title="No recent activity yet"
          description="Updates on your projects, RFQs, and supplier quotations will show up here."
          icon={<DashboardIcon name="building" size={28} />}
        />
      </div>
    </>
  );
}
