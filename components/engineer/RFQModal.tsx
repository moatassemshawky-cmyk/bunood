'use client';

import { useState } from 'react';
import type { BreakdownMaterial, Supplier } from '../../lib/mockData/engineerDashboard';
import { DashboardIcon } from '../layout/DashboardIcon';
import { SupplierSelector } from './SupplierSelector';

interface RFQModalProps {
  selectedMaterials: BreakdownMaterial[];
  suppliers: Supplier[];
  onClose: () => void;
  onSend: () => void;
}

type SendMode = 'all' | 'manual';

export function RFQModal({ selectedMaterials, suppliers, onClose, onSend }: RFQModalProps) {
  const [sendMode, setSendMode] = useState<SendMode>('all');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(new Set());
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [notes, setNotes] = useState('');

  const toggleSupplier = (id: string) => {
    setSelectedSupplierIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSend = sendMode === 'all' || selectedSupplierIds.size > 0;

  return (
    <div className="eg-modal-backdrop" onClick={onClose}>
      <div className="eg-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="rfq-modal-title">
        <div className="eg-modal-head">
          <h2 id="rfq-modal-title" className="eg-modal-title">Send RFQ</h2>
          <button type="button" className="eg-modal-close" onClick={onClose} aria-label="Close">
            <DashboardIcon name="close" size={16} />
          </button>
        </div>

        <div className="eg-modal-body">
          <section className="eg-modal-section">
            <h3 className="eg-modal-section-title">Selected Materials ({selectedMaterials.length})</h3>
            <div className="eg-modal-materials">
              {selectedMaterials.map(m => (
                <div key={m.id} className="eg-modal-material-chip">
                  {m.name} <span className="eg-modal-material-qty">{m.quantity} {m.unit}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="eg-modal-section">
            <h3 className="eg-modal-section-title">Supplier Selection</h3>
            <label className="eg-radio-row">
              <input type="radio" checked={sendMode === 'all'} onChange={() => setSendMode('all')} />
              Send to all suppliers
            </label>
            <label className="eg-radio-row">
              <input type="radio" checked={sendMode === 'manual'} onChange={() => setSendMode('manual')} />
              Select suppliers manually
            </label>
            {sendMode === 'manual' && (
              <SupplierSelector suppliers={suppliers} selectedIds={selectedSupplierIds} onToggle={toggleSupplier} />
            )}
          </section>

          <section className="eg-modal-section eg-modal-row-2">
            <div className="eg-modal-field">
              <label className="eg-modal-label" htmlFor="rfq-address">Delivery Address</label>
              <input
                id="rfq-address"
                className="eg-modal-input"
                type="text"
                placeholder="Site address"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
              />
            </div>
            <div className="eg-modal-field">
              <label className="eg-modal-label" htmlFor="rfq-date">Required Delivery Date</label>
              <input
                id="rfq-date"
                className="eg-modal-input"
                type="date"
                value={requiredDate}
                onChange={e => setRequiredDate(e.target.value)}
              />
            </div>
          </section>

          <section className="eg-modal-section">
            <label className="eg-modal-label" htmlFor="rfq-notes">Notes</label>
            <textarea
              id="rfq-notes"
              className="eg-modal-textarea"
              rows={3}
              placeholder="Anything suppliers should know…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </section>
        </div>

        <div className="eg-modal-footer">
          <button type="button" className="eg-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="eg-btn-primary" disabled={!canSend} onClick={onSend}>
            Send RFQ
          </button>
        </div>
      </div>
    </div>
  );
}
