import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import BrandLogo from './BrandLogo';
import MobileTabBar from './MobileTabBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { tenant } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showBanner = tenant && !['ACTIVE', 'ERP_CONNECTED'].includes(tenant.status);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-auto lg:w-0">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-secondary-900"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <BrandLogo markSize="sm" />
        </div>

        {showBanner && (
          <div className="border-b border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900 sm:px-6">
            Connect an ERP to submit invoices to NRS.{' '}
            <Link to="/onboarding" className="font-semibold text-primary-700 underline hover:text-primary-800">
              Continue onboarding →
            </Link>
          </div>
        )}
        <div className="p-4 pb-20 sm:p-6 lg:p-8 lg:pb-8">{children}</div>
      </main>

      {/* App-style bottom navigation on mobile */}
      <MobileTabBar />
    </div>
  );
}
