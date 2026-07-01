import { PageHeader } from '../../../../components/dashboard/PageHeader';
import { PlaceholderTable, StatusBadge } from '../../../../components/dashboard/PlaceholderTable';
import { MOCK_RFQS } from '../../../../lib/mockData/engineerDashboard';

const STATUS_MAP = { sent: 'pending', quoted: 'active', awarded: 'done' } as const;

export default function RFQsPage() {
  return (
    <>
      <PageHeader title="RFQs" />
      <PlaceholderTable
        columns={[
          { key: 'reference', label: 'Reference' },
          { key: 'boq', label: 'BOQ' },
          { key: 'materials', label: 'Materials' },
          { key: 'status', label: 'Status' },
          { key: 'sentAt', label: 'Sent' },
        ]}
        rows={MOCK_RFQS.map(rfq => ({
          reference: rfq.reference,
          boq: rfq.boqName,
          materials: rfq.materialCount,
          status: <StatusBadge status={STATUS_MAP[rfq.status]} />,
          sentAt: rfq.sentAt,
        }))}
      />
    </>
  );
}
