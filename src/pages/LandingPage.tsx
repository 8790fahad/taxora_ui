import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from '../components/BrandLogo';

const FEATURES = [
  {
    title: 'CAC-verified onboarding',
    text: 'Pull your company profile straight from the CAC database in seconds — no manual typing.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: 'One pipe to NRS / FIRS',
    text: 'Connect any ERP and clear e-invoices through the certified government rail.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
  {
    title: 'Automatic VAT & validation',
    text: '7.5% VAT math, TIN checks and line-item validation run on every document.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m-6 4h6m-6 4h4M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
    ),
  },
  {
    title: 'IRN & QR on every invoice',
    text: 'Cleared invoices return a government IRN and QR payload, ready to share.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 3h3m0 0h3m-3 0v3m0-6v.01" />
    ),
  },
  {
    title: 'Immutable audit trail',
    text: 'Every status change is recorded append-only — fully audit-ready records.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    ),
  },
  {
    title: 'Secrets stay server-side',
    text: 'API keys and tokens never touch the browser — bank-grade security by design.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
];

const STEPS = [
  {
    no: '01',
    title: 'Register & verify',
    text: 'Verify your company with CAC, confirm your email and set your password.',
  },
  {
    no: '02',
    title: 'Connect your ERP',
    text: 'Link QuickBooks, Sage or push invoices manually — then subscribe to a plan.',
  },
  {
    no: '03',
    title: 'Clear & comply',
    text: 'Submit invoices and let Taxora validate, clear and archive them automatically.',
  },
];

const STATS = [
  { value: '7.5%', label: 'VAT handled automatically' },
  { value: '<3s', label: 'Average clearance time' },
  { value: '100%', label: 'Audit-ready records' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white pt-[4.25rem]">
      {/* Fixed nav — stays visible while scrolling */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <BrandLogo markSize="sm" to="/" />
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 sm:gap-8">
            <Link to="/" className="transition hover:text-secondary-900">
              Home
            </Link>
            <a href="#features" className="hidden transition hover:text-secondary-900 md:inline">
              Features
            </a>
            <a href="#how" className="hidden transition hover:text-secondary-900 md:inline">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 font-medium text-secondary-800 transition hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white transition hover:bg-primary-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-20">
        <section>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
            Nigerian e-invoicing compliance
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-secondary-900 sm:text-5xl lg:text-6xl">
            Clear every invoice with{' '}
            <span className="text-primary-600">NRS &amp; FIRS</span> — automatically.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Taxora connects your ERP to the government e-invoicing rail, validates every
            document, and keeps an immutable, audit-ready trail — so compliance just happens.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup" className="btn-primary px-7 py-3 text-base">
              Register your company
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-base font-semibold text-secondary-800 transition hover:border-primary-300 hover:bg-primary-50"
            >
              Sign in
            </Link>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-bold text-secondary-900">{s.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-slate-500">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Hero visual */}
        <section className="relative">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-secondary-200/40 blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-secondary-800 p-8 shadow-2xl shadow-slate-300/50">
            <div className="flex items-center justify-between">
              <BrandLogo variant="light" markSize="sm" />
              <span className="rounded-md bg-primary-500 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
                FIRS COMPLIANT
              </span>
            </div>

            <div className="mt-7 rounded-2xl bg-white/95 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">Invoice TXA-001482</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500" /> Cleared
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  ['TIN validated', true],
                  ['VAT 7.5% computed', true],
                  ['IRN issued', true],
                  ['QR payload generated', true],
                ].map(([label]) => (
                  <div key={label as string} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {label as string}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">Grand total</span>
                <span className="text-lg font-bold text-secondary-900">₦10,750.00</span>
              </div>
            </div>

            <p className="mt-5 flex items-center gap-1.5 text-xs text-secondary-200">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Submitted to NRS in under 3 seconds
            </p>
          </div>
        </section>
      </main>

      {/* Features */}
      <section id="features" className="border-t border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Everything you need
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
              Compliance built into every step
            </h2>
            <p className="mt-4 text-slate-600">
              From onboarding to clearance, Taxora handles the hard parts of Nigerian
              e-invoicing so your team doesn’t have to.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-slate-200/60"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-secondary-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
              Live in three simple steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.no} className="relative rounded-2xl border border-slate-200 bg-white p-7">
                <span className="text-4xl font-bold text-primary-100">{s.no}</span>
                <h3 className="mt-2 text-lg font-semibold text-secondary-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="px-5 pb-20 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-secondary-800 px-8 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get your business ready for NRS e-invoicing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-secondary-200">
              Register your company today and start clearing compliant invoices in minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/signup"
                className="rounded-lg bg-primary-500 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-600"
              >
                Register your company
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-white/20 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row sm:px-8">
          <BrandLogo markSize="sm" to="/" />
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Taxora · Built for Nigerian businesses · NRS / FIRS ready
          </p>
        </div>
      </footer>
    </div>
  );
}
