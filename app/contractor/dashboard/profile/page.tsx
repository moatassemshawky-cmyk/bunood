import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PageHeader } from '../../../../components/dashboard/PageHeader';
import { getSessionAccount } from '../../../../lib/auth';

export default async function ContractorProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('bn_contractor_session')?.value;
  const session = await getSessionAccount('contractor', token);
  if (!session) redirect('/login');

  const initials = session.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <PageHeader title="Profile" action={{ label: 'Edit Profile' }} />
      <div className="dc-card dc-profile-card">
        <div className="dc-profile-avatar">{initials}</div>
        <div>
          <h2 className="dc-profile-name">{session.name}</h2>
          <p className="dc-profile-role">Contractor · {session.email}</p>
        </div>
      </div>
    </>
  );
}
