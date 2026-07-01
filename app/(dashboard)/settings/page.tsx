import { PageHeader } from '../../../components/dashboard/PageHeader';

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="dc-settings-grid">
        <div className="dc-card">
          <h3 className="dc-settings-title">Company Settings</h3>
          <p className="dc-settings-desc">Manage your company profile, logo, and contact details.</p>
          <div className="dc-settings-row"><span>Company name</span><span>—</span></div>
          <div className="dc-settings-row"><span>Company logo</span><span>—</span></div>
          <div className="dc-settings-row"><span>Contact email</span><span>—</span></div>
        </div>

        <div className="dc-card">
          <h3 className="dc-settings-title">User Management</h3>
          <p className="dc-settings-desc">Invite teammates and manage their access to this workspace.</p>
          <div className="dc-settings-row"><span>Team members</span><span>1</span></div>
          <div className="dc-settings-row"><span>Pending invites</span><span>0</span></div>
        </div>

        <div className="dc-card">
          <h3 className="dc-settings-title">Language</h3>
          <p className="dc-settings-desc">Choose the display language for your workspace.</p>
          <div className="dc-settings-row"><span>Interface language</span><span>English</span></div>
        </div>

        <div className="dc-card">
          <h3 className="dc-settings-title">Notifications</h3>
          <p className="dc-settings-desc">Control how you&apos;re notified about activity in your workspace.</p>
          <div className="dc-settings-row"><span>Email notifications</span><span>On</span></div>
          <div className="dc-settings-row"><span>SMS notifications</span><span>Off</span></div>
        </div>
      </div>
    </>
  );
}
