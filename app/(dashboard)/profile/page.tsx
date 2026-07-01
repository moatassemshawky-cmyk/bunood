import { PageHeader } from '../../../components/dashboard/PageHeader';

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" action={{ label: 'Edit Profile' }} />
      <div className="dc-card dc-profile-card">
        <div className="dc-profile-avatar">BU</div>
        <div>
          <h2 className="dc-profile-name">Your Account</h2>
          <p className="dc-profile-role">Contractor · Bunood Workspace</p>
        </div>
      </div>
    </>
  );
}
