import { PageHeader } from '../../../components/dashboard/PageHeader';
import { PlaceholderTable } from '../../../components/dashboard/PlaceholderTable';

export default function PurchaseRequestsPage() {
  return (
    <>
      <PageHeader title="Purchase Requests" action={{ label: 'Create Request', icon: 'plus' }} />

      <PlaceholderTable
        columns={[
          { key: 'ref', label: 'Reference' },
          { key: 'project', label: 'Project' },
          { key: 'status', label: 'Status' },
          { key: 'suppliers', label: 'Suppliers Invited' },
          { key: 'date', label: 'Date' },
        ]}
        rows={[]}
        emptyLabel="No purchase requests yet — create one to start collecting quotes."
      />
    </>
  );
}
