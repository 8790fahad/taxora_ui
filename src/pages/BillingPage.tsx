import { useEffect, useState } from 'react';
import api from '../api/client';
import { payWithRemita } from '../lib/remita';
import { useAuth } from '../hooks/useAuth';
import type { Plan } from '../types';

interface WalletInfo {
  balance_ngn: number;
  per_invoice_rate_ngn: number;
  min_funding_ngn: number;
}

interface BillingData {
  subscription: {
    id: string;
    status: string;
    active_until: string;
    Plan?: Plan;
  } | null;
  plans: Plan[];
  wallet: WalletInfo;
}

interface CheckoutPayment {
  rrr: string;
  orderId: string;
  mock: boolean;
  publicKey: string;
  inlineScript: string;
  amount: number;
}

export default function BillingPage() {
  const { refreshMe } = useAuth();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [fundTokens, setFundTokens] = useState(0);

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    setLoading(true);
    try {
      const { data: billing } = await api.get<BillingData>('/billing/current');
      setData(billing);
      const tokenRate = billing.wallet?.per_invoice_rate_ngn || 10;
      const minNgn = billing.wallet?.min_funding_ngn || 50000;
      setFundTokens((prev) => prev || Math.ceil(minNgn / tokenRate));
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (rrr: string) => {
    await api.post('/billing/verify', { rrr });
    await refreshMe();
    await loadBilling();
  };

  const checkout = async (planCode: string, amount?: number) => {
    const tokenRate = data?.wallet?.per_invoice_rate_ngn ?? 10;
    const tokensAdded = Math.floor((amount || 0) / tokenRate);
    setProcessing(true);
    setMessage('');
    try {
      const { data: res } = await api.post<{ payment: CheckoutPayment }>(
        '/billing/checkout',
        { plan_code: planCode, fund_amount: amount },
      );
      const payment = res.payment;

      if (payment.mock) {
        await confirmPayment(payment.rrr);
        setMessage(
          planCode === 'per_invoice'
            ? `${tokensAdded.toLocaleString()} tokens added to your account.`
            : 'Annual Unlimited plan activated.',
        );
        return;
      }

      setMessage('Opening Remita secure payment…');
      const result = await payWithRemita({
        publicKey: payment.publicKey,
        rrr: payment.rrr,
        orderId: payment.orderId,
        inlineScript: payment.inlineScript,
      });

      if (result.status === 'success') {
        await confirmPayment(payment.rrr);
        setMessage(
          planCode === 'per_invoice'
            ? `${tokensAdded.toLocaleString()} tokens added to your account.`
            : 'Annual Unlimited plan activated.',
        );
      } else if (result.status === 'closed') {
        setMessage('Payment window closed before completing. You can try again.');
      } else {
        setMessage('Payment could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Payment failed';
      setMessage(msg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading billing...</p>;

  const wallet = data?.wallet;
  const rate = wallet?.per_invoice_rate_ngn ?? 10;
  const minFunding = wallet?.min_funding_ngn ?? 50000;
  const minTokens = Math.ceil(minFunding / rate);
  const balanceNgn = wallet?.balance_ngn ?? 0;
  const tokenBalance = rate > 0 ? Math.floor(balanceNgn / rate) : 0;
  const fundAmountNgn = fundTokens * rate;
  const currentPlan = data?.subscription?.Plan;
  const onUnlimited = !!currentPlan?.unlimited;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
      <p className="mt-1 text-slate-500">
        Fund your account with tokens — 1 token = ₦{rate}. Each invoice uses 1 token.
      </p>

      {message && (
        <div
          className={`mt-6 rounded-lg px-4 py-3 text-sm ${
            message.toLowerCase().includes('fail') ||
            message.toLowerCase().includes('could not') ||
            message.toLowerCase().includes('closed')
              ? 'bg-red-50 text-red-700'
              : 'bg-primary-50 text-primary-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Token balance</h2>
          <p className="mt-3 text-3xl font-bold text-primary-700">
            {tokenBalance.toLocaleString()} tokens
          </p>
          {onUnlimited ? (
            <p className="mt-2 text-sm text-primary-700">
              Annual Unlimited active — no per-invoice charges.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-500">
                ≈ {tokenBalance.toLocaleString()} invoices remaining
              </p>
              <p className="mt-1 text-xs text-slate-400">
                1 token = ₦{rate} · Balance value ₦{balanceNgn.toLocaleString()}
              </p>
            </>
          )}
          {data?.subscription?.active_until && (
            <p className="mt-1 text-xs text-slate-400">
              Active until {new Date(data.subscription.active_until).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Buy tokens</h2>
          <p className="mt-1 text-sm text-slate-500">
            Minimum {minTokens.toLocaleString()} tokens (₦{minFunding.toLocaleString()}). Paid securely via Remita.
          </p>

          <label className="mt-4 block text-xs font-medium text-slate-600">
            Tokens to buy
          </label>
          <div className="mt-1 flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-primary-500">
            <input
              type="number"
              min={minTokens}
              step={100}
              value={fundTokens}
              onChange={(e) => setFundTokens(Number(e.target.value))}
              className="w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
            <span className="text-sm text-slate-500">tokens</span>
          </div>
          {fundTokens >= minTokens && (
            <p className="mt-1 text-xs text-slate-400">
              Cost: ₦{fundAmountNgn.toLocaleString()} · ≈ {fundTokens.toLocaleString()} invoices
            </p>
          )}
          {fundTokens > 0 && fundTokens < minTokens && (
            <p className="mt-1 text-xs text-red-600">
              Minimum purchase is {minTokens.toLocaleString()} tokens (₦{minFunding.toLocaleString()}).
            </p>
          )}

          <button
            onClick={() => checkout('per_invoice', fundAmountNgn)}
            disabled={processing || fundTokens < minTokens}
            className="mt-4 w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {processing ? 'Processing…' : 'Buy tokens with Remita'}
          </button>
        </div>
      </div>
    </div>
  );
}
