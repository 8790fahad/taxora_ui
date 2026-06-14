import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from '../components/BrandLogo';

type Status = 'verifying' | 'ready' | 'error';

function apiError(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { error?: string } } })?.response?.data?.error || fallback
  );
}

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeSetup, logout } = useAuth();
  const token = params.get('token') || '';

  const [status, setStatus] = useState<Status>('verifying');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        setError('Missing verification token.');
        setStatus('error');
        return;
      }
      try {
        const { data } = await api.post('/auth/verify-email', { token });
        if (!active) return;
        setEmail(data.email);
        setStatus('ready');
      } catch (err: unknown) {
        if (!active) return;
        setError(apiError(err, 'This verification link is invalid or has expired.'));
        setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await completeSetup(token, password);
      logout();
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : '';
      navigate(`/registration-complete${emailParam}`, { replace: true });
    } catch (err: unknown) {
      setError(apiError(err, 'Could not set your password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <BrandLogo align="center" markSize="md" to="/" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {status === 'verifying' && (
            <div className="py-6 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
              <p className="mt-4 text-sm text-slate-500">Verifying your email…</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="mt-5 text-lg font-semibold text-secondary-900">
                Verification failed
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{error}</p>
              <Link to="/signup" className="btn-primary mt-6 w-full sm:w-auto">
                Back to registration
              </Link>
            </div>
          )}

          {status === 'ready' && (
            <>
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                Email verified ✓
              </span>
              <h1 className="mt-3 text-xl font-bold text-secondary-900">Set your password</h1>
              <p className="mt-1 text-sm text-slate-600">
                Finish setting up the account for{' '}
                <span className="font-medium text-secondary-900">{email}</span>.
              </p>

              {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="input-field"
                    placeholder="Re-enter password"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Setting up…' : 'Set password & finish'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
