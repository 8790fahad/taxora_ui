import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { payWithRemita } from "../lib/remita";
import { useAuth } from "../hooks/useAuth";
import ErpIcon from "../components/ErpIcon";
import {
  ERP_CATALOG,
  ERP_LABELS,
  type ErpStatus,
} from "../constants/erpCatalog";
import type { ErpConnection, OnboardingStatus } from "../types";

type Step = "erp";

type ErpCard = {
  type: string;
  name: string;
  desc: string;
  status: ErpStatus;
};

const ERP_GROUPS = ERP_CATALOG.map((group) => ({
  title: group.title,
  description: group.description,
  erps: group.integrations.map((i) => ({
    type: i.connectorType,
    name: i.name,
    desc: i.description,
    status: i.status,
  })),
}));

export default function OnboardingPage() {
  const { tenant, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("erp");
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [connections, setConnections] = useState<ErpConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [odooModalOpen, setOdooModalOpen] = useState(false);
  const [odooSubmitting, setOdooSubmitting] = useState(false);
  const [odooForm, setOdooForm] = useState({
    baseUrl: "",
    database: "",
    username: "",
    apiKey: "",
  });
  const [tallyModalOpen, setTallyModalOpen] = useState(false);
  const [tallySubmitting, setTallySubmitting] = useState(false);
  const [tallyTesting, setTallyTesting] = useState(false);
  const [tallyTestResult, setTallyTestResult] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [tallyForm, setTallyForm] = useState({
    mode: "local",
    url: "http://localhost:9000",
    companyName: "",
    port: 9000,
  });

  // Post-connect flow: Go-live date → Fund account.
  const [goLive, setGoLive] = useState<{
    connectionId: string;
    connectorType: string;
  } | null>(null);
  const [goLiveDate, setGoLiveDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [goLiveSaving, setGoLiveSaving] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  const [wallet, setWallet] = useState<{
    balance_ngn: number;
    per_invoice_rate_ngn: number;
    min_funding_ngn: number;
  } | null>(null);
  const [fundTokens, setFundTokens] = useState(0);
  const [fundProcessing, setFundProcessing] = useState(false);
  const [fundMessage, setFundMessage] = useState("");
  // Set synchronously the moment a connect starts/returns, so the auto-redirect
  // to dashboard never pre-empts the post-connect flow.
  const [blockRedirect, setBlockRedirect] = useState(false);

  const manageMode = searchParams.get("manage") === "1";
  // When returning from an OAuth connect, keep the user here so the post-connect
  // flow (go-live date → fund account) can run instead of bouncing to dashboard.
  const oauthReturn =
    searchParams.has("qb") ||
    searchParams.has("zoho") ||
    searchParams.has("sage") ||
    searchParams.has("flowbooks");
  const postConnectActive = !!goLive || fundOpen || oauthReturn || blockRedirect;

  useEffect(() => {
    if (
      !manageMode &&
      !postConnectActive &&
      tenant &&
      ["ACTIVE", "ERP_CONNECTED"].includes(tenant.status)
    ) {
      navigate("/dashboard");
    }
  }, [tenant, navigate, manageMode, postConnectActive]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const { data } = await api.get<OnboardingStatus>(
      "/tenants/current/onboarding",
    );
    setStatus(data);
    if (!data.onboarding.erp) setStep("erp");
  };

  const loadConnections = async () => {
    const { data } = await api.get<{ data: ErpConnection[] }>("/connections");
    setConnections(data.data);
    return data.data;
  };

  // Kick off the post-connect flow: ask for a go-live date for the newly
  // connected ERP, then prompt the user to fund their wallet.
  const startPostConnectFlow = (
    connectorType: string,
    conns: ErpConnection[],
  ) => {
    const conn = conns.find(
      (c) => c.connector_type === connectorType && c.status === "connected",
    );
    if (!conn) return;
    const existing = conn.config?.initialSyncDate;
    setGoLiveDate(
      existing
        ? new Date(existing).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    );
    setGoLive({ connectionId: conn.id, connectorType });
  };

  const saveGoLiveAndContinue = async () => {
    if (!goLive) return;
    setGoLiveSaving(true);
    try {
      await api.patch(`/connections/${goLive.connectionId}/sync-settings`, {
        initialSyncDate: new Date(goLiveDate).toISOString(),
      });
      await loadConnections();
    } catch {
      // Non-fatal — they can set it later on the Connections page.
    } finally {
      setGoLiveSaving(false);
      setGoLive(null);
      openFundModal();
    }
  };

  const openFundModal = async () => {
    setFundMessage("");
    try {
      const { data: billing } = await api.get<{
        wallet: {
          balance_ngn: number;
          per_invoice_rate_ngn: number;
          min_funding_ngn: number;
        };
      }>("/billing/current");
      setWallet(billing.wallet);
      const tokenRate = billing.wallet?.per_invoice_rate_ngn || 10;
      const minNgn = billing.wallet?.min_funding_ngn || 50000;
      setFundTokens(Math.ceil(minNgn / tokenRate));
    } catch {
      setWallet(null);
      setFundTokens(5000);
    }
    setFundOpen(true);
  };

  const fundAccount = async () => {
    const tokenRate = wallet?.per_invoice_rate_ngn ?? 10;
    const fundAmountNgn = fundTokens * tokenRate;
    setFundProcessing(true);
    setFundMessage("");
    try {
      const { data: res } = await api.post<{
        payment: {
          rrr: string;
          orderId: string;
          mock: boolean;
          publicKey: string;
          inlineScript: string;
          amount: number;
        };
      }>("/billing/checkout", {
        plan_code: "per_invoice",
        fund_amount: fundAmountNgn,
      });
      const payment = res.payment;

      const confirm = async () => {
        await api.post("/billing/verify", { rrr: payment.rrr });
        await refreshMe();
      };

      if (payment.mock) {
        await confirm();
        setFundOpen(false);
        navigate("/invoices");
        return;
      }

      setFundMessage("Opening Remita secure payment…");
      const result = await payWithRemita({
        publicKey: payment.publicKey,
        rrr: payment.rrr,
        orderId: payment.orderId,
        inlineScript: payment.inlineScript,
      });

      if (result.status === "success") {
        await confirm();
        setFundOpen(false);
        navigate("/invoices");
      } else if (result.status === "closed") {
        setFundMessage("Payment window closed before completing. You can try again.");
      } else {
        setFundMessage("Payment could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Payment failed";
      setFundMessage(msg);
    } finally {
      setFundProcessing(false);
    }
  };

  useEffect(() => {
    if (step === "erp") loadConnections();
  }, [step]);

  // Handle the return redirect from an ERP OAuth flow (?qb=, ?zoho=, ?sage=).
  // The param is only a hint — we confirm against the actual connection state.
  useEffect(() => {
    const oauthReturns: { param: string; connectorType: string; label: string }[] = [
      { param: 'qb', connectorType: 'quickbooks', label: 'QuickBooks' },
      { param: 'zoho', connectorType: 'zoho', label: 'Zoho Books' },
      { param: 'sage', connectorType: 'sage', label: 'Sage' },
      { param: 'flowbooks', connectorType: 'flowbooks', label: 'FlowBooks' },
    ];
    const hit = oauthReturns.find((r) => searchParams.get(r.param));
    if (!hit) return;
    const hintConnected = searchParams.get(hit.param) === 'connected';
    if (hintConnected) setBlockRedirect(true);
    (async () => {
      await refreshMe();
      await loadStatus();
      let connected = false;
      let conns: ErpConnection[] = [];
      try {
        const { data } = await api.get<{ data: ErpConnection[] }>('/connections');
        conns = data.data;
        setConnections(conns);
        connected = conns.some(
          (c) => c.connector_type === hit.connectorType && c.status === 'connected',
        );
      } catch {
        connected = hintConnected;
      }

      if (connected) {
        setMessage(`${hit.label} connected successfully!`);
        startPostConnectFlow(hit.connectorType, conns);
      } else {
        setMessage(`Could not connect ${hit.label}. Please try again.`);
      }
    })();
    searchParams.delete(hit.param);
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectErp = async (connectorType: string) => {
    setLoading(true);
    setMessage("");
    try {
      if (
        connectorType === "quickbooks" ||
        connectorType === "zoho" ||
        connectorType === "sage" ||
        connectorType === "flowbooks"
      ) {
        const { data } = await api.get<{ url: string }>(
          `/connections/${connectorType}/authorize`,
        );
        window.location.href = data.url;
        return;
      }

      if (connectorType === "odoo") {
        setLoading(false);
        setOdooModalOpen(true);
        return;
      }

      if (connectorType === "tally") {
        setLoading(false);
        setTallyTestResult(null);
        setTallyModalOpen(true);
        return;
      }

      const { data } = await api.post<{ connection: ErpConnection }>(
        "/connections",
        {
          connector_type: connectorType,
        },
      );
      await api.post(`/connections/${data.connection.id}/test`);
      await refreshMe();
      await loadStatus();
      setMessage(`${connectorType} connected successfully!`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Connection failed";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const disconnectErp = async (connectorType: string) => {
    const conn = connections.find(
      (c) => c.connector_type === connectorType && c.status === "connected",
    );
    if (!conn) return;
    setLoading(true);
    setMessage("");
    try {
      await api.delete(`/connections/${conn.id}`);
      await refreshMe();
      await loadConnections();
      await loadStatus();
      setMessage(`${connectorType} disconnected.`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Disconnect failed";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitOdoo = async (e: React.FormEvent) => {
    e.preventDefault();
    setOdooSubmitting(true);
    setMessage("");
    setBlockRedirect(true);
    try {
      await api.post("/connections/odoo/connect", odooForm);
      await refreshMe();
      const conns = await loadConnections();
      await loadStatus();
      setOdooModalOpen(false);
      setOdooForm({ baseUrl: "", database: "", username: "", apiKey: "" });
      setMessage("Odoo connected successfully!");
      startPostConnectFlow("odoo", conns);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Could not connect to Odoo. Check your credentials.";
      setMessage(msg);
    } finally {
      setOdooSubmitting(false);
    }
  };

  const testTally = async () => {
    setTallyTesting(true);
    setTallyTestResult(null);
    try {
      const { data } = await api.post<{
        connectionStatus: string;
        companies?: string[];
      }>("/connections/tally/test", {
        url: tallyForm.url,
        mode: tallyForm.mode,
      });
      const companies = data.companies || [];
      if (companies.length && !tallyForm.companyName) {
        setTallyForm((p) => ({ ...p, companyName: companies[0] }));
      }
      setTallyTestResult({
        ok: true,
        text: companies.length
          ? `Connected. Found: ${companies.join(", ")}`
          : "Connected to Tally.",
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Could not reach Tally. Make sure it is running.";
      setTallyTestResult({ ok: false, text: msg });
    } finally {
      setTallyTesting(false);
    }
  };

  const submitTally = async (e: React.FormEvent) => {
    e.preventDefault();
    setTallySubmitting(true);
    setMessage("");
    setBlockRedirect(true);
    try {
      await api.post("/connections/tally/connect", tallyForm);
      await refreshMe();
      const conns = await loadConnections();
      await loadStatus();
      setTallyModalOpen(false);
      setTallyTestResult(null);
      setMessage("Tally connected successfully!");
      startPostConnectFlow("tally", conns);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Could not connect to Tally. Check the URL and try again.";
      setMessage(msg);
    } finally {
      setTallySubmitting(false);
    }
  };

  const steps = [{ key: "erp", label: "Connect ERP", num: 1 }];

  const connectedErps = connections
    .filter((c) => c.status === "connected")
    .map((c) => c.connector_type);

  const statusBadge = (status: ErpStatus) => {
    if (status === "available") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
          Available
        </span>
      );
    }
    if (status === "beta") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          Beta
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
        Coming soon
      </span>
    );
  };

  const renderErpCard = (erp: ErpCard, cardKey: string) => {
    if (erp.status === "coming_soon") {
      return (
        <div
          key={cardKey}
          className="flex flex-col rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="opacity-70 grayscale">
              <ErpIcon type={erp.type} />
            </span>
            {statusBadge(erp.status)}
          </div>
          <h3 className="mt-3 font-semibold text-slate-700">{erp.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{erp.desc}</p>
        </div>
      );
    }

    const isConnected = connectedErps.includes(erp.type);
    if (isConnected) {
      return (
        <div
          key={cardKey}
          className="flex flex-col rounded-xl border border-primary-500 bg-primary-50 p-4"
        >
          <div className="flex items-center justify-between">
            <ErpIcon type={erp.type} />
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Connected
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900">{erp.name}</h3>
              <p className="truncate text-xs text-slate-500">{erp.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => disconnectErp(erp.type)}
              disabled={loading}
              title="Disconnect"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5M4 4l16 16"
                />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        key={cardKey}
        onClick={() => connectErp(erp.type)}
        disabled={loading}
        className="rounded-xl border border-slate-200 p-4 text-left hover:border-primary-500 hover:bg-primary-50 disabled:opacity-50"
      >
        <div className="flex items-center justify-between">
          <ErpIcon type={erp.type} />
          <div className="flex items-center gap-2">
            {erp.status === "beta" && statusBadge(erp.status)}
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5m-1.328-4.328a4 4 0 005.656 0l3-3a4 4 0 10-5.656-5.656l-1.5 1.5"
                />
              </svg>
              Connect
            </span>
          </div>
        </div>
        <h3 className="mt-3 font-semibold text-slate-900">{erp.name}</h3>
        <p className="mt-1 text-xs text-slate-500">{erp.desc}</p>
      </button>
    );
  };

  return (
    <div className="surface-brand min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-secondary-900"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Go to dashboard
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-secondary-900">
            Welcome to Taxora
          </h1>
          <p className="mt-2 text-slate-600">
            Complete the steps below to activate e-invoice clearance with the
            Nigeria Revenue Service (NRS)
          </p>
        </div>

        <div className="mb-8 flex justify-center gap-4">
          {steps.map((s) => (
            <div
              key={s.key}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                step === s.key
                  ? "bg-primary-600 text-white"
                  : status?.onboarding[s.key as keyof typeof status.onboarding]
                    ? "bg-primary-100 text-primary-700"
                    : "bg-white text-slate-500 ring-1 ring-slate-200"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                {status?.onboarding[s.key as keyof typeof status.onboarding]
                  ? "✓"
                  : s.num}
              </span>
              {s.label}
            </div>
          ))}
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              message.includes("live") || message.includes("connected")
                ? "bg-primary-50 text-primary-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {step === "erp" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Connect your ERP (Enterprise Resource Planning)
            </h2>
            <p className="mb-6 mt-1 text-sm text-slate-500">
              Connect one or more ERPs. After connection, buy tokens from Billing;
              each invoice uses 1 token (1 token = ₦10).
            </p>
            <div className="space-y-8">
              {ERP_GROUPS.map((group) => (
                <section key={group.title}>
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      {group.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {group.description}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.erps.map((erp, idx) =>
                      renderErpCard(erp, `${group.title}-${erp.type}-${idx}`),
                    )}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-900">
              Buy tokens to process invoices — 1 token = ₦10. Each invoice uses
              1 token.
            </div>
          </div>
        )}
      </div>

      {odooModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="odoo-connect-title"
        >
          <form
            onSubmit={submitOdoo}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <ErpIcon type="odoo" className="h-9 w-9" />
              <div>
                <h2
                  id="odoo-connect-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Connect Odoo
                </h2>
                <p className="text-xs text-slate-500">
                  Works with Odoo Online and self-hosted (JSON-RPC).
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Base URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://yourcompany.odoo.com"
                  value={odooForm.baseUrl}
                  onChange={(e) =>
                    setOdooForm((p) => ({ ...p, baseUrl: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Database name
                </label>
                <input
                  type="text"
                  required
                  placeholder="yourcompany"
                  value={odooForm.database}
                  onChange={(e) =>
                    setOdooForm((p) => ({ ...p, database: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Username (email)
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin@yourcompany.com"
                  value={odooForm.username}
                  onChange={(e) =>
                    setOdooForm((p) => ({ ...p, username: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  API key or password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={odooForm.apiKey}
                  onChange={(e) =>
                    setOdooForm((p) => ({ ...p, apiKey: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Generate an API key in Odoo under Preferences → Account
                  Security. Stored encrypted.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOdooModalOpen(false)}
                disabled={odooSubmitting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={odooSubmitting}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {odooSubmitting ? "Connecting…" : "Connect Odoo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {tallyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tally-connect-title"
        >
          <form
            onSubmit={submitTally}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <ErpIcon type="tally" className="h-9 w-9" />
              <div>
                <h2
                  id="tally-connect-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Connect TallyPrime
                </h2>
                <p className="text-xs text-slate-500">
                  Tally must be running with the XML gateway port open.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Connection type
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "local", label: "Local" },
                    { value: "network", label: "Network" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setTallyForm((p) => ({
                          ...p,
                          mode: opt.value,
                          url:
                            opt.value === "local"
                              ? "http://localhost:9000"
                              : p.url.includes("localhost")
                                ? ""
                                : p.url,
                        }));
                        setTallyTestResult(null);
                      }}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                        tallyForm.mode === opt.value
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Tally URL
                </label>
                <input
                  type="url"
                  required
                  placeholder={
                    tallyForm.mode === "local"
                      ? "http://localhost:9000"
                      : "http://192.168.1.10:9000"
                  }
                  value={tallyForm.url}
                  onChange={(e) => {
                    const url = e.target.value;
                    const portMatch = url.match(/:(\d+)/);
                    setTallyForm((p) => ({
                      ...p,
                      url,
                      port: portMatch ? Number(portMatch[1]) : p.port,
                    }));
                    setTallyTestResult(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Company name (optional)
                </label>
                <input
                  type="text"
                  placeholder="Auto-detected from Tally"
                  value={tallyForm.companyName}
                  onChange={(e) =>
                    setTallyForm((p) => ({ ...p, companyName: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Leave blank to use the first company Tally reports.
                </p>
              </div>

              <button
                type="button"
                onClick={testTally}
                disabled={tallyTesting || !tallyForm.url}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {tallyTesting ? "Testing…" : "Test connection"}
              </button>
              {tallyTestResult && (
                <div
                  className={`rounded-lg px-3 py-2 text-xs ${
                    tallyTestResult.ok
                      ? "bg-primary-50 text-primary-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {tallyTestResult.text}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setTallyModalOpen(false)}
                disabled={tallySubmitting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={tallySubmitting}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {tallySubmitting ? "Connecting…" : "Connect TallyPrime"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step: Go-live date (after a successful connect) */}
      {goLive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="golive-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <ErpIcon type={goLive.connectorType} className="h-9 w-9" />
              <div>
                <h2
                  id="golive-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {ERP_LABELS[goLive.connectorType] || goLive.connectorType}{" "}
                  connected
                </h2>
                <p className="text-xs text-slate-500">
                  Set your go-live date to start syncing.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Go-live date (sync invoices from this date onward)
              </label>
              <input
                type="date"
                value={goLiveDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setGoLiveDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-slate-400">
                Only invoices dated on or after this date will be pulled on the
                first sync.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setGoLive(null);
                  openFundModal();
                }}
                disabled={goLiveSaving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={saveGoLiveAndContinue}
                disabled={goLiveSaving || !goLiveDate}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {goLiveSaving ? "Saving…" : "Save & continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Buy tokens (after go-live date) */}
      {fundOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fund-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2m-6-4h8a1 1 0 011 1v2a1 1 0 01-1 1h-8a2 2 0 110-4z"
                  />
                </svg>
              </span>
              <div>
                <h2
                  id="fund-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Buy tokens
                </h2>
                <p className="text-xs text-slate-500">
                  1 token = ₦{wallet?.per_invoice_rate_ngn ?? 10}. Each invoice
                  uses 1 token.
                </p>
              </div>
            </div>

            {fundMessage && (
              <div
                className={`mt-4 rounded-lg px-3 py-2 text-xs ${
                  fundMessage.toLowerCase().includes("fail") ||
                  fundMessage.toLowerCase().includes("could not") ||
                  fundMessage.toLowerCase().includes("closed")
                    ? "bg-red-50 text-red-700"
                    : "bg-primary-50 text-primary-800"
                }`}
              >
                {fundMessage}
              </div>
            )}

            <div className="mt-5">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Tokens to buy
              </label>
              <div className="flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-primary-500">
                <input
                  type="number"
                  min={
                    wallet
                      ? Math.ceil(
                          wallet.min_funding_ngn / (wallet.per_invoice_rate_ngn || 10),
                        )
                      : 5000
                  }
                  step={100}
                  value={fundTokens}
                  onChange={(e) => setFundTokens(Number(e.target.value))}
                  className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                />
                <span className="text-sm text-slate-500">tokens</span>
              </div>
              {wallet &&
                fundTokens >=
                  Math.ceil(
                    wallet.min_funding_ngn / (wallet.per_invoice_rate_ngn || 10),
                  ) && (
                  <p className="mt-1 text-xs text-slate-400">
                    Cost: ₦
                    {(
                      fundTokens * (wallet.per_invoice_rate_ngn || 10)
                    ).toLocaleString()}{" "}
                    · ≈ {fundTokens.toLocaleString()} invoices
                  </p>
                )}
              {wallet &&
                fundTokens > 0 &&
                fundTokens <
                  Math.ceil(
                    wallet.min_funding_ngn / (wallet.per_invoice_rate_ngn || 10),
                  ) && (
                  <p className="mt-1 text-xs text-red-600">
                    Minimum purchase is{" "}
                    {Math.ceil(
                      wallet.min_funding_ngn / (wallet.per_invoice_rate_ngn || 10),
                    ).toLocaleString()}{" "}
                    tokens (₦{wallet.min_funding_ngn.toLocaleString()}).
                  </p>
                )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setFundOpen(false);
                  navigate("/invoices");
                }}
                disabled={fundProcessing}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                I’ll do this later
              </button>
              <button
                type="button"
                onClick={fundAccount}
                disabled={
                  fundProcessing ||
                  (!!wallet &&
                    fundTokens <
                      Math.ceil(
                        wallet.min_funding_ngn / (wallet.per_invoice_rate_ngn || 10),
                      ))
                }
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {fundProcessing ? "Processing…" : "Buy tokens with Remita"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
