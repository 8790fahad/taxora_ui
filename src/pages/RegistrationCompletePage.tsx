import { Link, useSearchParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const LOGIN_STEPS = [
  {
    step: '1',
    title: 'Open the sign-in page',
    text: 'Go to Taxora and click Sign in (or use the button below).',
  },
  {
    step: '2',
    title: 'Enter your email',
    text: 'Use the same company email you registered with.',
  },
  {
    step: '3',
    title: 'Enter your password',
    text: 'Use the password you just created on the verification screen.',
  },
  {
    step: '4',
    title: 'Complete setup',
    text: 'After signing in, finish onboarding (ERP + plan) to start clearing invoices.',
  },
];

export default function RegistrationCompletePage() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex justify-center">
          <BrandLogo align="center" markSize="md" to="/" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="mt-5 text-center text-2xl font-bold text-secondary-900">
            Registration successful!
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Your company account is ready. You can now sign in to Taxora.
          </p>

          {email && (
            <div className="mt-5 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-center text-sm text-primary-800">
              Sign in with{' '}
              <span className="font-semibold text-secondary-900">{email}</span>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              How to sign in
            </h2>
            <ol className="mt-4 space-y-4">
              {LOGIN_STEPS.map((item) => (
                <li key={item.step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-medium text-secondary-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Link
            to="/login"
            className="btn-primary mt-8 w-full"
          >
            Go to sign in
          </Link>

          <p className="mt-4 text-center text-xs text-slate-400">
            Need help? Contact support after you sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
