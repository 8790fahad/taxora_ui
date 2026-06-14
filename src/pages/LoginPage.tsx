import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from '../components/BrandLogo';

const HIGHLIGHTS = [
  'CAC-verified company onboarding',
  'Direct NRS / FIRS clearance',
  'Automatic VAT, IRN & QR',
  'Immutable, audit-ready trail',
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
            Welcome back to your compliance dashboard.
          </h2>
          <ul className="mt-10 space-y-4">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm text-secondary-100">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-sm text-secondary-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Bank-grade security · Secrets stay server-side
        </p>
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
              <span className="hidden text-slate-500 lg:inline">New to Taxora?</span>
            </nav>
          </div>
          <Link to="/signup" className="link-primary text-sm">
            Register your company →
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold text-secondary-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">
              Access your Taxora compliance dashboard
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              No account?{' '}
              <Link to="/signup" className="link-primary">
                Register your company
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
