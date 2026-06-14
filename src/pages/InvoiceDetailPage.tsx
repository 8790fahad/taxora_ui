import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import type { Invoice } from '../types';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (id) loadInvoice();
    const interval = setInterval(loadInvoice, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const loadInvoice = async () => {
    if (!id) return;
    try {
      const { data } = await api.get<{ invoice: Invoice }>(`/invoices/${id}`);
      setInvoice(data.invoice);
    } catch {
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!id) return;
    setRetrying(true);
    try {
      await api.post(`/invoices/${id}/retry`);
      await loadInvoice();
    } finally {
      setRetrying(false);
    }
  };

  const handleViewDocument = async () => {
    if (!id) return;
    setViewing(true);
    setActionMsg('');
    try {
      const { data } = await api.get<{ html: string }>(`/invoices/${id}/document`);
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Could not load the invoice document';
      setActionMsg(msg);
    } finally {
      setViewing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!id) return;
    // Open the window synchronously so the browser does not treat it as a
    // popup blocked by the later async fetch.
    const win = window.open('', '_blank', 'noopener,noreferrer');
    setDownloading(true);
    setActionMsg('');
    try {
      const { data } = await api.get<{ html: string }>(`/invoices/${id}/document?print=1`);
      if (win) {
        win.document.open();
        win.document.write(data.html);
        win.document.close();
      } else {
        // Popup blocked — fall back to a blob in the same tab.
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (err: unknown) {
      if (win) win.close();
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Could not generate the invoice PDF';
      setActionMsg(msg);
    } finally {
      setDownloading(false);
    }
  };

  const handleSend = async () => {
    if (!id) return;
    const to = window.prompt(
      'Send invoice to (leave blank to use the customer email on the invoice):',
      ''
    );
    if (to === null) return;
    setSending(true);
    setActionMsg('');
    try {
      const { data } = await api.post<{ message: string }>(`/invoices/${id}/send`, {
        to: to.trim() || undefined,
      });
      setActionMsg(data.message);
      await loadInvoice();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Could not send the invoice';
      setActionMsg(msg);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p className="text-slate-500">Loading invoice...</p>;
  }

  if (!invoice) {
    return (
      <div>
        <p className="text-red-600">Invoice not found</p>
        <Link to="/invoices" className="text-primary-600 hover:underline">
          ← Back to invoices
        </Link>
      </div>
    );
  }

  const events = invoice.InvoiceEvents || [];
  const attempts = invoice.SubmissionAttempts || [];

  return (
    <div>
      <Link to="/invoices" className="text-sm text-primary-600 hover:underline">
        ← Back to invoices
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoice detail</h1>
          <p className="mt-1 font-mono text-sm text-slate-500">{invoice.invoice_ref}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={invoice.status} />
          {invoice.nrs_json && (
            <>
              <button
                onClick={handleViewDocument}
                disabled={viewing}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {viewing ? 'Opening…' : 'View NRS invoice'}
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {downloading ? 'Preparing…' : 'Download PDF'}
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send invoice'}
              </button>
            </>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="mt-4 rounded-lg bg-secondary-100 px-4 py-3 text-sm text-secondary-800">
          {actionMsg}
        </div>
      )}

      {invoice.invoice_email_sent_at && (
        <p className="mt-2 text-xs text-slate-400">
          Invoice last emailed: {new Date(invoice.invoice_email_sent_at).toLocaleString()}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">ERP Source</dt>
              <dd>{invoice.erp_source}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">ERP Invoice ID</dt>
              <dd>{invoice.erp_invoice_id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">IRN</dt>
              <dd className="font-mono text-xs">{invoice.irn || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">QR Payload</dt>
              <dd className="max-w-xs truncate text-xs">{invoice.qr_payload || '—'}</dd>
            </div>
          </dl>

          {invoice.error_message && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {invoice.error_message}
            </div>
          )}

          {['REJECTED', 'VALIDATION_FAILED'].includes(invoice.status) && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {retrying ? 'Retrying...' : 'Retry submission'}
            </button>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Event timeline</h2>
          <div className="mt-4 space-y-4">
            {events.length === 0 ? (
              <p className="text-sm text-slate-400">No events yet</p>
            ) : (
              events.map((event, idx) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary-500" />
                    {idx < events.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-slate-900">{event.event_type}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                    {event.payload && Object.keys(event.payload).length > 0 && (
                      <pre className="mt-1 max-h-24 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">NRS submission log</h2>
        <p className="mt-1 text-sm text-slate-500">
          Exact request sent to NRS and the response received, per attempt.
        </p>
        <div className="mt-4 space-y-4">
          {attempts.length === 0 ? (
            <p className="text-sm text-slate-400">No submission attempts yet</p>
          ) : (
            attempts.map((attempt) => (
              <div key={attempt.id} className="rounded-lg border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                  <span className="text-sm font-medium text-slate-900">
                    Attempt #{attempt.attempt_no}
                  </span>
                  <span className="flex items-center gap-3 text-xs text-slate-500">
                    {attempt.http_status != null && (
                      <span
                        className={`rounded px-2 py-0.5 font-medium ${
                          attempt.http_status < 400
                            ? 'bg-primary-50 text-primary-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        HTTP {attempt.http_status}
                      </span>
                    )}
                    {new Date(attempt.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="grid gap-4 p-4 lg:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Request
                    </p>
                    <pre className="max-h-48 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                      {JSON.stringify(attempt.request_json, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Response
                    </p>
                    <pre className="max-h-48 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                      {JSON.stringify(attempt.response_json, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
