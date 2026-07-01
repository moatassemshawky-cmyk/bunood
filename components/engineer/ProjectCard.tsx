import type { Project } from '../../lib/mockData/engineerDashboard';

const STATUS_LABEL: Record<Project['status'], string> = {
  active: 'Active',
  planning: 'Planning',
  completed: 'Completed',
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="eg-card eg-project-card">
      <div className="eg-project-card-head">
        <h3 className="eg-project-name">{project.name}</h3>
        <span className={`eg-status-pill eg-status-${project.status}`}>{STATUS_LABEL[project.status]}</span>
      </div>
      <p className="eg-project-location">{project.location}</p>
      <p className="eg-project-date">Created {project.createdAt}</p>
    </div>
  );
}
