import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import type { Invoice } from '../types';

interface DashboardData {
  stats: { pending: number; cleared: number; rejected: number };
  recentInvoices: Invoice[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: dash } = await api.get<DashboardData>('/dashboard');
      setData(dash);
    } catch {
      setData({ stats: { pending: 0, cleared: 0, rejected: 0 }, recentInvoices: [] });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">NRS e-invoicing pipeline overview</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending', value: data?.stats.pending ?? 0, color: 'border-orange-200 bg-orange-50' },
          { label: 'Cleared', value: data?.stats.cleared ?? 0, color: 'border-primary-200 bg-primary-50' },
          { label: 'Rejected', value: data?.stats.rejected ?? 0, color: 'border-red-200 bg-red-50' },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl border p-5 ${card.color}`}>
            <p className="text-sm font-medium text-slate-600">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Recent invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">ERP</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">IRN</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentInvoices || []).map((inv) => (
                <tr key={inv.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <Link to={`/invoices/${inv.id}`} className="font-medium text-primary-600 hover:underline">
                      {inv.invoice_ref.slice(0, 24)}…
                    </Link>
                  </td>
                  <td className="px-5 py-3">{inv.erp_source}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{inv.irn || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!data?.recentInvoices || data.recentInvoices.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No invoices yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
