'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '../../../../components/dashboard/PageHeader';
import { DashboardIcon } from '../../../../components/layout/DashboardIcon';
import { BOQCard } from '../../../../components/engineer/BOQCard';
import { BOQTree } from '../../../../components/engineer/BOQTree';
import { RFQModal } from '../../../../components/engineer/RFQModal';
import {
  MOCK_BOQS, MOCK_PROJECTS, MOCK_SUPPLIERS,
  type Boq, type BoqNode, type BreakdownMaterial,
} from '../../../../lib/mockData/engineerDashboard';

const FILTERS = ['All', 'Draft', 'In Progress', 'Completed', 'Archived'] as const;
type Filter = typeof FILTERS[number];

const STATUS_BY_FILTER: Record<Filter, Boq['status'] | null> = {
  All: null,
  Draft: 'draft',
  'In Progress': 'in-progress',
  Completed: 'completed',
  Archived: 'archived',
};

/** Recursively collect every breakdown material in a tree matching the given ids. */
function findMaterials(tree: BoqNode[], ids: Set<string>): BreakdownMaterial[] {
  const found: BreakdownMaterial[] = [];
  const walk = (nodes: BoqNode[]) => {
    for (const node of nodes) {
      node.breakdown?.forEach(m => { if (ids.has(m.id)) found.push(m); });
      if (node.children) walk(node.children);
    }
  };
  walk(tree);
  return found;
}

export default function BOQsPage() {
  const [boqs, setBoqs] = useState<Boq[]>(MOCK_BOQS);
  const [selectedBoqId, setSelectedBoqId] = useState<string | null>(MOCK_BOQS[0]?.id ?? null);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const projectName = (projectId: string) => MOCK_PROJECTS.find(p => p.id === projectId)?.name ?? 'Unknown project';

  const filteredBoqs = boqs.filter(boq => {
    const statusMatch = STATUS_BY_FILTER[filter] === null || boq.status === STATUS_BY_FILTER[filter];
    const q = search.trim().toLowerCase();
    const searchMatch = !q || boq.name.toLowerCase().includes(q) || projectName(boq.projectId).toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  const selectedBoq = boqs.find(b => b.id === selectedBoqId) ?? null;

  const selectedMaterials = useMemo(
    () => (selectedBoq ? findMaterials(selectedBoq.tree, selectedMaterialIds) : []),
    [selectedBoq, selectedMaterialIds],
  );

  const handleOpen = (id: string) => {
    setSelectedBoqId(id);
    setSelectedMaterialIds(new Set());
  };

  const handleDuplicate = (id: string) => {
    const source = boqs.find(b => b.id === id);
    if (!source) return;
    const copy: Boq = {
      ...source,
      id: `${source.id}-copy-${Date.now()}`,
      name: `${source.name} (Copy)`,
      status: 'draft',
      progress: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setBoqs(prev => [copy, ...prev]);
  };

  const handleArchive = (id: string) => {
    setBoqs(prev => prev.map(b => (b.id === id ? { ...b, status: 'archived' } : b)));
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterialIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendRfq = () => {
    setShowRfqModal(false);
    setSuccessMessage(`RFQ sent for ${selectedMaterialIds.size} material${selectedMaterialIds.size === 1 ? '' : 's'}.`);
    setSelectedMaterialIds(new Set());
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <>
      <PageHeader title="BOQs" action={{ label: 'New BOQ', icon: 'plus' }} />

      {successMessage && <div className="eg-toast">{successMessage}</div>}

      <div className="eg-boqs-layout">
        {/* Center panel — BOQ list */}
        <div className="eg-boq-list-panel">
          <div className="eg-search-row">
            <div className="eg-search-input-wrap">
              <DashboardIcon name="search" size={15} />
              <input
                placeholder="Search BOQs or projects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="eg-filter-chips">
            {FILTERS.map(f => (
              <button
                key={f}
                type="button"
                className={`eg-filter-chip ${filter === f ? 'is-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="eg-boq-list-grid">
            {filteredBoqs.length === 0 && (
              <div className="eg-boq-list-empty">No BOQs match your search or filter.</div>
            )}
            {filteredBoqs.map(boq => (
              <BOQCard
                key={boq.id}
                boq={boq}
                projectName={projectName(boq.projectId)}
                isActive={boq.id === selectedBoqId}
                onOpen={handleOpen}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
              />
            ))}
          </div>
        </div>

        {/* Right panel — BOQ detail */}
        <div className="eg-boq-detail-panel">
          {selectedBoq ? (
            <>
              <div className="eg-boq-detail-header">
                <div>
                  <h2 className="eg-boq-detail-title">{selectedBoq.name}</h2>
                  <p className="eg-boq-detail-sub">{projectName(selectedBoq.projectId)}</p>
                </div>
                <span className={`eg-status-pill eg-status-${selectedBoq.status.replace('-', '')}`}>
                  {selectedBoq.status}
                </span>
              </div>
              <BOQTree
                tree={selectedBoq.tree}
                selectedIds={selectedMaterialIds}
                onToggleSelect={toggleMaterial}
              />
            </>
          ) : (
            <div className="eg-boq-detail-empty">
              <DashboardIcon name="boq" size={32} />
              <p>Select a BOQ from the list to see its breakdown here.</p>
            </div>
          )}
        </div>
      </div>

      {selectedMaterialIds.size > 0 && (
        <button type="button" className="eg-fab-send-rfq" onClick={() => setShowRfqModal(true)}>
          <DashboardIcon name="purchase" size={18} />
          Send RFQ ({selectedMaterialIds.size})
        </button>
      )}

      {showRfqModal && (
        <RFQModal
          selectedMaterials={selectedMaterials}
          suppliers={MOCK_SUPPLIERS}
          onClose={() => setShowRfqModal(false)}
          onSend={handleSendRfq}
        />
      )}
    </>
  );
}
