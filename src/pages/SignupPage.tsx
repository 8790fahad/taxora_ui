import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from '../components/BrandLogo';
import VerifyCacModal from '../components/VerifyCacModal';
import { NIGERIAN_STATES } from '../constants/registration';
import type { CompanyRegistrationFormData } from '../constants/registration';

const emptyForm = (): CompanyRegistrationFormData => ({
  company_classification: '2',
  rc_number: '',
  company_name: '',
  email: '',
  primary_phone: '',
  address_line: '',
  address_city: '',
  address_country: 'NG',
  address_postal_zone: '',
  state: '',
  tin: '',
  nrs_business_id: '',
  nrs_service_id: '',
});

const HIGHLIGHTS = [
  {
    title: 'Verify with CAC instantly',
    text: 'Pull your company profile straight from the CAC database — no manual typing.',
  },
  {
    title: 'One pipe to NRS / FIRS',
    text: 'Connect any ERP and clear e-invoices through the certified government rail.',
  },
  {
    title: 'Compliant by default',
    text: 'Validation, IRN, QR and an immutable audit trail on every invoice.',
  },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState<CompanyRegistrationFormData>(emptyForm());
  const [cacVerified, setCacVerified] = useState(false);
  const [manualMode, setManualMode] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<{ email: string; devVerifyUrl?: string } | null>(null);

  const showForm = cacVerified || manualMode;

  const handleVerified = (data: CompanyRegistrationFormData) => {
    setForm(data);
    setCacVerified(true);
    setManualMode(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await signup({
        email: form.email,
        company_name: form.company_name,
        rc_number: form.rc_number,
        primary_phone: form.primary_phone,
        address_line: form.address_line,
        address_city: form.address_city,
        address_country: form.address_country || 'NG',
        address_postal_zone: form.address_postal_zone || undefined,
        state: form.state,
        company_classification: form.company_classification,
        tin: form.tin || undefined,
        nrs_business_id: form.nrs_business_id || undefined,
        nrs_service_id: form.nrs_service_id || undefined,
      });
      setSent({ email: res.email, devVerifyUrl: res.devVerifyUrl });
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof CompanyRegistrationFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-slate-50">
      {/* Brand panel */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-secondary-800 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />

        <div className="relative">
          <BrandLogo variant="light" markSize="md" to="/" />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Get your business ready for NRS e-invoicing in minutes.
          </h2>
          <ul className="mt-10 space-y-6">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">{h.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-secondary-200">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-sm text-secondary-200">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </span>
          Bank-grade security · Secrets stay server-side
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md lg:px-10">
          <div className="flex items-center gap-6">
            <div className="lg:hidden">
              <BrandLogo compact markSize="sm" to="/" />
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link to="/" className="transition hover:text-secondary-900">
                Home
              </Link>
              <span className="hidden text-slate-500 lg:inline">Already onboarded?</span>
            </nav>
          </div>
          <Link to="/login" className="link-primary text-sm">
            Sign in instead →
          </Link>
        </header>

        <div className="flex flex-1 justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
          <div className="w-full max-w-2xl">
            {error && (
              <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Confirmation — check your email */}
            {sent && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="mt-5 text-lg font-semibold text-secondary-900">Check your email</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  We sent a verification link to{' '}
                  <span className="font-medium text-secondary-900">{sent.email}</span>. Click it to
                  verify your address and set your password.
                </p>
                {sent.devVerifyUrl && (
                  <a
                    href={sent.devVerifyUrl}
                    className="btn-primary mt-6 w-full sm:mx-auto sm:w-auto"
                  >
                    Open verification link (dev)
                  </a>
                )}
                <p className="mt-4 text-sm text-slate-400">
                  Didn’t get it?{' '}
                  <button
                    type="button"
                    onClick={() => setSent(null)}
                    className="link-primary"
                  >
                    Go back
                  </button>
                </p>
              </div>
            )}

            {/* Company details */}
            {!sent && showForm && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-secondary-900">Company details</h2>
                    {cacVerified ? (
                      <span className="badge-success">✓ Verified with CAC</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="link-primary text-sm"
                      >
                        Verify with CAC
                      </button>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="RC Number">
                      <input
                        required
                        value={form.rc_number}
                        onChange={(e) => update('rc_number', e.target.value)}
                        readOnly={cacVerified}
                        className="input-field read-only:bg-slate-50"
                        placeholder="e.g. 7329218"
                      />
                    </Field>

                    <Field label="TIN">
                      <input
                        required
                        value={form.tin}
                        onChange={(e) => update('tin', e.target.value)}
                        className="input-field"
                        placeholder="e.g. 21919238-0001"
                      />
                    </Field>

                    <Field label="NRS Business ID">
                      <input
                        required
                        value={form.nrs_business_id}
                        onChange={(e) => update('nrs_business_id', e.target.value)}
                        className="input-field"
                        placeholder="e.g. CON7B60C"
                      />
                    </Field>

                    <Field label="NRS Service ID">
                      <input
                        required
                        value={form.nrs_service_id}
                        onChange={(e) => update('nrs_service_id', e.target.value)}
                        className="input-field"
                        placeholder="e.g. SERVICE-001"
                      />
                    </Field>

                    <Field label="Company name" className="sm:col-span-2">
                      <input
                        required
                        value={form.company_name}
                        onChange={(e) => update('company_name', e.target.value)}
                        className="input-field"
                        placeholder="Company Name"
                      />
                    </Field>

                    <Field label="Email address">
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        className="input-field"
                        placeholder="company@example.com"
                      />
                    </Field>

                    <Field label="Primary phone">
                      <input
                        required
                        value={form.primary_phone}
                        onChange={(e) => update('primary_phone', e.target.value)}
                        className="input-field"
                        placeholder="08012345678"
                      />
                    </Field>

                    <Field label="Country">
                      <select
                        required
                        value={form.address_country}
                        onChange={(e) => update('address_country', e.target.value)}
                        className="input-field"
                      >
                        <option value="NG">Nigeria (NG)</option>
                      </select>
                    </Field>

                    <Field label="State">
                      <select
                        required
                        value={form.state}
                        onChange={(e) => update('state', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select state</option>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                        {form.state && !NIGERIAN_STATES.includes(form.state) && (
                          <option value={form.state}>{form.state}</option>
                        )}
                      </select>
                    </Field>

                    <Field label="Street address" className="sm:col-span-2">
                      <input
                        required
                        value={form.address_line}
                        onChange={(e) => update('address_line', e.target.value)}
                        className="input-field"
                        placeholder="e.g. 12 Marina Road"
                      />
                    </Field>

                    <Field label="City">
                      <input
                        required
                        value={form.address_city}
                        onChange={(e) => update('address_city', e.target.value)}
                        className="input-field"
                        placeholder="e.g. Lagos"
                      />
                    </Field>

                    <Field label="Postal code (optional)">
                      <input
                        value={form.address_postal_zone}
                        onChange={(e) => update('address_postal_zone', e.target.value)}
                        className="input-field"
                        placeholder="e.g. 101001"
                      />
                    </Field>
                  </div>
                </section>

                <div className="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  We’ll send a verification link to your email. You’ll set your password after
                  confirming it.
                </div>

                <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>
                    I have read and agree to Taxora’s{' '}
                    <Link to="/terms" target="_blank" className="link-primary font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" className="link-primary font-medium">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(emptyForm());
                      setCacVerified(false);
                      setError('');
                    }}
                    className="py-1 text-sm text-slate-500 hover:text-secondary-700"
                  >
                    ← Clear form
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !acceptedTerms}
                    className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
                  >
                    {loading ? 'Sending…' : 'Register & verify email'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <VerifyCacModal open={modalOpen} onClose={() => setModalOpen(false)} onVerified={handleVerified} />
    </div>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
