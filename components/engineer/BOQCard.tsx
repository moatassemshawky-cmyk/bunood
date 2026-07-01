import type { Boq } from '../../lib/mockData/engineerDashboard';
import { DashboardIcon } from '../layout/DashboardIcon';

interface BOQCardProps {
  boq: Boq;
  projectName: string;
  isActive: boolean;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
}

const STATUS_LABEL: Record<Boq['status'], string> = {
  draft: 'Draft',
  'in-progress': 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};

export function BOQCard({ boq, projectName, isActive, onOpen, onDuplicate, onArchive }: BOQCardProps) {
  return (
    <div className={`eg-card eg-boq-card ${isActive ? 'is-active' : ''}`}>
      <div className="eg-boq-card-head">
        <div>
          <h3 className="eg-boq-name">{boq.name}</h3>
          <p className="eg-boq-project">{projectName}</p>
        </div>
        <span className={`eg-status-pill eg-status-${boq.status.replace('-', '')}`}>{STATUS_LABEL[boq.status]}</span>
      </div>

      <div className="eg-boq-progress">
        <div className="eg-boq-progress-bar">
          <div className="eg-boq-progress-fill" style={{ width: `${boq.progress}%` }} />
        </div>
        <span className="eg-boq-progress-label">{boq.progress}%</span>
      </div>

      <div className="eg-boq-meta">
        <span>{boq.itemCount} items</span>
        <span>{boq.totalCost.toLocaleString()} EGP</span>
        <span>Updated {boq.lastUpdated}</span>
      </div>

      <div className="eg-boq-card-actions">
        <button type="button" className="eg-btn-primary-sm" onClick={() => onOpen(boq.id)}>
          Open BOQ
        </button>
        <button type="button" className="eg-btn-icon" title="Duplicate" onClick={() => onDuplicate(boq.id)}>
          <DashboardIcon name="duplicate" size={16} />
        </button>
        <button type="button" className="eg-btn-icon" title="Archive" onClick={() => onArchive(boq.id)}>
          <DashboardIcon name="archive" size={16} />
        </button>
      </div>
    </div>
  );
}
