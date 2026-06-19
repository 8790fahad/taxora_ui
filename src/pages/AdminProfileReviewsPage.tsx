import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import BrandLogo from '../components/BrandLogo';
import type { Tenant, User } from '../types';

type PendingProfile = {
  tenant: Tenant;
  owner: User | null;
};

const ADMIN_KEY_STORAGE = 'taxora_admin_key';

const adminApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

export default function AdminProfileReviewsPage() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(ADMIN_KEY_STORAGE) || '');
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canLoad = useMemo(() => adminKey.trim().length > 0, [adminKey]);

  const loadProfiles = async () => {
    if (!canLoad) {
      setError('Enter the admin key to load pending profiles.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      sessionStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
      const { data } = await adminApi.get<{ data: PendingProfile[] }>('/admin/profile-reviews', {
        headers: { 'x-admin-key': adminKey },
      });
      setProfiles(data.data || []);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not load pending profiles'
      );
    } finally {
      setLoading(false);
    }
  };

  const approveProfile = async (tenantId: string) => {
    setApproving(tenantId);
    setError('');
    setMessage('');
    try {
      const { data } = await adminApi.post<{ message: string; devVerifyUrl?: string }>(
        `/admin/tenants/${tenantId}/approve-profile`,
        {},
        { headers: { 'x-admin-key': adminKey } }
      );
      setProfiles((prev) => prev.filter((profile) => profile.tenant.id !== tenantId));
      setMessage(
        data.devVerifyUrl
          ? `${data.message} Dev verification link: ${data.devVerifyUrl}`
          : data.message
      );
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not approve this profile'
      );
    } finally {
      setApproving(null);
    }
  };

  useEffect(() => {
    if (adminKey) {
      loadProfiles();
    }
    // Only auto-load once when a saved session key exists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo markSize="sm" to="/" />
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Admin review
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Profile Reviews</h1>
          <p className="mt-1 text-sm text-slate-500">
            Approve manually registered companies. Approval sends the email-verification link
            to the owner.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-slate-700">Admin key</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="input-field"
              placeholder="Paste ADMIN_API_KEY"
            />
            <button
              type="button"
              disabled={loading}
              onClick={loadProfiles}
              className="btn-primary shrink-0 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load pending'}
            </button>
          </div>
        </section>

        {(message || error) && (
          <div
            className={`mt-5 rounded-lg px-4 py-3 text-sm ${
              error ? 'bg-red-50 text-red-700' : 'bg-primary-50 text-primary-700'
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Pending profiles ({profiles.length})
            </h2>
          </div>

          {profiles.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              {loading ? 'Loading profiles...' : 'No pending profiles to review.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {profiles.map(({ tenant, owner }) => (
                <article key={tenant.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {tenant.legal_name || 'Unnamed company'}
                        </h3>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Pending review
                        </span>
                      </div>
                      <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
                        <div>Owner: {owner?.email || 'Not available'}</div>
                        <div>RC: {tenant.rc_number || 'Not provided'}</div>
                        <div>TIN: {tenant.tin || 'Not provided'}</div>
                        <div>Phone: {tenant.primary_phone || 'Not provided'}</div>
                        <div>State: {tenant.state || 'Not provided'}</div>
                        <div>Method: {tenant.verification_method || 'manual'}</div>
                      </dl>
                      {tenant.address?.line && (
                        <p className="mt-2 text-sm text-slate-500">
                          {tenant.address.line}, {tenant.address.city || ''}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={approving === tenant.id}
                      onClick={() => approveProfile(tenant.id)}
                      className="btn-primary shrink-0 disabled:opacity-50"
                    >
                      {approving === tenant.id ? 'Approving...' : 'Approve & send email'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
