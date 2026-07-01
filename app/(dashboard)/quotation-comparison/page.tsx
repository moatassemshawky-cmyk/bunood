import { PageHeader } from '../../../components/dashboard/PageHeader';

export default function QuotationComparisonPage() {
  return (
    <>
      <PageHeader title="Quotation Comparison" />

      <div className="dc-section dc-card">
        <div className="dc-table-wrap" style={{ border: 'none' }}>
          <table className="dc-table">
            <thead>
              <tr>
                <th>Line Item</th>
                <th>Supplier A</th>
                <th>Supplier B</th>
                <th>Supplier C</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="dc-table-empty" colSpan={4}>
                  Send a purchase request to suppliers to compare quotes side-by-side here.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="dc-section dc-card">
        <div className="dc-chart-title" style={{ marginBottom: 8 }}>AI Recommendation</div>
        <p style={{ fontSize: 13.5, color: '#6b7480', margin: 0 }}>
          Once quotes come in, Bunood will highlight the best offer based on price, delivery time,
          and supplier rating — right here.
        </p>
      </div>
    </>
  );
}
