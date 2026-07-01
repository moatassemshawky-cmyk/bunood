import { PageHeader } from '../../../../components/dashboard/PageHeader';
import { ProjectCard } from '../../../../components/engineer/ProjectCard';
import { MOCK_PROJECTS } from '../../../../lib/mockData/engineerDashboard';

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" action={{ label: 'New Project', icon: 'plus' }} />
      <div className="dc-grid-2">
        {MOCK_PROJECTS.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}
