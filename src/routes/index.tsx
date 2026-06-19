import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import RegistrationCompletePage from '../pages/RegistrationCompletePage';
import OnboardingPage from '../pages/OnboardingPage';
import DashboardPage from '../pages/DashboardPage';
import InvoicesPage from '../pages/InvoicesPage';
import InvoiceDetailPage from '../pages/InvoiceDetailPage';
import ConnectionsPage from '../pages/ConnectionsPage';
import SettingsPage from '../pages/SettingsPage';
import BillingPage from '../pages/BillingPage';
import LegalPage from '../pages/LegalPage';
import AdminProfileReviewsPage from '../pages/AdminProfileReviewsPage';

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, tenant, loading } = useAuth();
  // `?manage=1` lets already-active tenants revisit the ERP connect screen to
  // add another integration without being bounced back to the dashboard.
  const manageMode = new URLSearchParams(window.location.search).get('manage') === '1';
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (
    !manageMode &&
    tenant &&
    ['ACTIVE', 'ERP_CONNECTED'].includes(tenant.status)
  ) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/terms" element={<LegalPage type="terms" />} />
      <Route path="/privacy" element={<LegalPage type="privacy" />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/registration-complete" element={<RegistrationCompletePage />} />
      <Route path="/admin/profile-reviews" element={<AdminProfileReviewsPage />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingGuard>
            <OnboardingPage />
          </OnboardingGuard>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/billing" element={<BillingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
