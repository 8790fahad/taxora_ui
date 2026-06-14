import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import ManualInvoiceModal from '../components/ManualInvoiceModal';
import { useAuth } from '../hooks/useAuth';
import type { ErpConnection, Invoice } from '../types';

const PAGE_SIZE = 20;

const SYNCABLE: Record<string, string> = {
  quickbooks: 'QuickBooks',
  zoho: 'Zoho Books',
  odoo: 'Odoo',
  tally: 'TallyPrime',
  sage: 'Sage',
  flowbooks: 'FlowBooks',
};

export default function InvoicesPage() {
  const { tenant } = useAuth();
  const appReady = tenant ? ['ACTIVE', 'ERP_CONNECTED'].includes(tenant.status) : false;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [connections, setConnections] = useState<ErpConnection[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get<{
        data: Invoice[];
        pagination?: { total: number; totalPages: number };
      }>('/invoices', { params });
      setInvoices(data.data);
      setTotal(data.pagination?.total ?? data.data.length);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      setInvoices([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    try {
      const { data } = await api.get<{ data: ErpConnection[] }>('/connections');
      setConnections(data.data);
    } catch {
      setConnections([]);
    }
  };

  const syncErp = async (connectorType: string) => {
    if (!appReady) return;
    setSyncing(connectorType);
    setMessage('');
    try {
      const { data: result } = await api.post<{ message: string }>(
        `/connections/${connectorType}/sync`,
      );
      setMessage(result.message);
      setTimeout(loadInvoices, 5000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        `${SYNCABLE[connectorType] || connectorType} sync failed`;
      setMessage(msg);
    } finally {
      setSyncing(null);
    }
  };

  const handleManualSubmitted = (msg: string) => {
    setManualOpen(false);
    setMessage(msg);
    setPage(1);
    setTimeout(loadInvoices, 5000);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500">Track clearance status and IRNs</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {appReady && (
            <>
              {connections
                .filter((c) => c.status === 'connected' && SYNCABLE[c.connector_type])
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => syncErp(c.connector_type)}
                    disabled={syncing !== null}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {syncing === c.connector_type
                      ? 'Syncing…'
                      : `Sync from ${SYNCABLE[c.connector_type]}`}
                  </button>
                ))}
              <button
                onClick={() => setManualOpen(true)}
                className="btn-primary px-4 py-2"
              >
                Submit invoice manually
              </button>
            </>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="CLEARED">Cleared</option>
            <option value="PENDING_CLEARANCE">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="VALIDATION_FAILED">Validation failed</option>
          </select>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-lg bg-secondary-100 px-4 py-3 text-sm text-secondary-800">
          {message}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Reference</th>
              <th className="px-5 py-3 font-medium">ERP Source</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">IRN</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link to={`/invoices/${inv.id}`} className="font-medium text-primary-600 hover:underline">
                      {inv.invoice_ref}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{inv.erp_source}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{inv.irn || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(inv.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Showing{' '}
            <span className="font-medium text-slate-700">
              {(page - 1) * PAGE_SIZE + 1}
            </span>
            –
            <span className="font-medium text-slate-700">
              {Math.min(page * PAGE_SIZE, total)}
            </span>{' '}
            of <span className="font-medium text-slate-700">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {manualOpen && (
        <ManualInvoiceModal
          onClose={() => setManualOpen(false)}
          onSubmitted={handleManualSubmitted}
        />
      )}
    </div>
  );
}
