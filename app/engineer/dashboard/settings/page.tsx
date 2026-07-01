import { PageHeader } from '../../../../components/dashboard/PageHeader';

export default function EngineerSettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="dc-settings-grid">
        <div className="dc-card">
          <h3 className="dc-settings-title">Profile</h3>
          <p className="dc-settings-desc">Your engineer profile and specialization details.</p>
          <div className="dc-settings-row"><span>Full name</span><span>—</span></div>
          <div className="dc-settings-row"><span>Specialization</span><span>—</span></div>
          <div className="dc-settings-row"><span>Syndicate number</span><span>—</span></div>
        </div>

        <div className="dc-card">
          <h3 className="dc-settings-title">Notifications</h3>
          <p className="dc-settings-desc">Control how you&apos;re notified about RFQ and BOQ activity.</p>
          <div className="dc-settings-row"><span>Email notifications</span><span>On</span></div>
          <div className="dc-settings-row"><span>SMS notifications</span><span>Off</span></div>
        </div>

        <div className="dc-card">
          <h3 className="dc-settings-title">Language</h3>
          <p className="dc-settings-desc">Choose the display language for your workspace.</p>
          <div className="dc-settings-row"><span>Interface language</span><span>English</span></div>
        </div>

        <div className="dc-card">
          <h3 className="dc-settings-title">Account</h3>
          <p className="dc-settings-desc">Manage your account security.</p>
          <div className="dc-settings-row"><span>Password</span><span>••••••••</span></div>
        </div>
      </div>
    </>
  );
}
