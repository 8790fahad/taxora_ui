import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import type { ErpConnection } from '../types';

function toDateInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ErpConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ErpConnection | null>(null);
  const [dateDrafts, setDateDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ data: ErpConnection[] }>('/connections');
      setConnections(data.data);
      setDateDrafts(
        Object.fromEntries(
          data.data.map((c) => [c.id, toDateInput(c.config?.initialSyncDate)])
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (id: string) => {
    setTesting(id);
    try {
      await api.post(`/connections/${id}/test`);
      await loadConnections();
    } finally {
      setTesting(null);
    }
  };

  const saveGoLiveDate = async (id: string) => {
    const draft = dateDrafts[id];
    if (!draft) return;
    setSavingDate(id);
    setMessage('');
    try {
      const { data } = await api.patch<{ message: string }>(
        `/connections/${id}/sync-settings`,
        { initialSyncDate: new Date(draft).toISOString() }
      );
      setMessage(data.message);
      await loadConnections();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Could not save go-live date';
      setMessage(msg);
    } finally {
      setSavingDate(null);
    }
  };

  const deleteConnection = async (conn: ErpConnection) => {
    setDeleting(conn.id);
    setMessage('');
    try {
      await api.delete(`/connections/${conn.id}`);
      setMessage(`${conn.connector_type} connection deleted.`);
      setDeleteTarget(null);
      await loadConnections();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Could not delete connection';
      setMessage(msg);
    } finally {
      setDeleting(null);
    }
  };

  const connectedCount = connections.filter((c) => c.status === 'connected').length;
  const hasConnection = connectedCount > 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ERP Connections</h1>
          <p className="text-slate-500">Manage integrations and health checks</p>
        </div>
        <Link
          to="/onboarding?manage=1"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Add ERP connection
        </Link>
      </div>

      {message && (
        <div className="mb-6 rounded-lg bg-secondary-100 px-4 py-3 text-sm text-secondary-800">
          {message}
        </div>
      )}

      {!loading && (
        <div className="mb-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                hasConnection ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {hasConnection ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5m-1.328-4.328a4 4 0 005.656 0l3-3a4 4 0 10-5.656-5.656l-1.5 1.5" />
                )}
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Connection status</p>
              <p className={`text-base font-semibold ${hasConnection ? 'text-primary-700' : 'text-slate-700'}`}>
                {hasConnection ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <p className="text-sm font-medium text-slate-500">ERPs connected</p>
            <p className="text-2xl font-bold text-slate-900">
              {connectedCount}
              <span className="ml-1 text-sm font-normal text-slate-400">
                of {connections.length}
              </span>
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : connections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-500">No connections yet. Add one during onboarding or above.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {connections.map((conn) => {
            const company = conn.config?.company;
            const supportsGoLive = [
              'quickbooks',
              'sage',
              'zoho',
              'odoo',
              'tally',
              'flowbooks',
            ].includes(conn.connector_type);
            return (
              <div
                key={conn.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold capitalize text-slate-900">
                      {conn.connector_type}
                    </h3>
                    {company?.companyName && (
                      <p className="mt-0.5 text-sm text-slate-600">
                        {company.companyName}
                        {company.country ? ` · ${company.country}` : ''}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={conn.status} />
                      {conn.health_status && <StatusBadge status={conn.health_status} />}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {conn.last_sync_at
                        ? `Last sync: ${new Date(conn.last_sync_at).toLocaleString()}`
                        : 'Not synced yet'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => testConnection(conn.id)}
                      disabled={testing === conn.id}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                      {testing === conn.id ? 'Testing...' : 'Test connection'}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(conn)}
                      disabled={deleting === conn.id}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === conn.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>

                {supportsGoLive && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <label className="block text-xs font-medium text-slate-600">
                      Go-live date (sync invoices from this date onward)
                    </label>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        value={dateDrafts[conn.id] || ''}
                        onChange={(e) =>
                          setDateDrafts((prev) => ({ ...prev, [conn.id]: e.target.value }))
                        }
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
                      />
                      <button
                        onClick={() => saveGoLiveDate(conn.id)}
                        disabled={
                          savingDate === conn.id ||
                          !dateDrafts[conn.id] ||
                          dateDrafts[conn.id] === toDateInput(conn.config?.initialSyncDate)
                        }
                        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      >
                        {savingDate === conn.id ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                    {conn.config?.initialSyncDate && (
                      <p className="mt-1 text-xs text-slate-400">
                        Current: {new Date(conn.config.initialSyncDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-connection-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              </span>
              <div>
                <h2 id="delete-connection-title" className="text-lg font-semibold text-slate-900">
                  Delete connection?
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  This will remove the {deleteTarget.connector_type} connection
                  {deleteTarget.config?.company?.companyName
                    ? ` for ${deleteTarget.config.company.companyName}`
                    : ''}
                  . You can reconnect it later if needed.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting === deleteTarget.id}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteConnection(deleteTarget)}
                disabled={deleting === deleteTarget.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting === deleteTarget.id ? 'Deleting…' : 'Delete connection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
