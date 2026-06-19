export interface User {
  id: string;
  email: string;
  full_name: string | null;
  email_verified?: boolean;
}

export interface Tenant {
  id: string;
  legal_name: string | null;
  tin: string | null;
  rc_number: string | null;
  primary_phone: string | null;
  state: string | null;
  company_classification: string | null;
  incorporation_date: string | null;
  address: {
    line: string | null;
    city: string | null;
    country: string | null;
    postalZone: string | null;
  } | null;
  nrs_business_id: string | null;
  nrs_service_id: string | null;
  logo_url: string | null;
  logo_width: number | null;
  logo_height: number | null;
  profile_status?: 'verified' | 'pending_review';
  verification_method?: string | null;
  status: string;
  onboarding: {
    register: boolean;
    erp: boolean;
    subscribe: boolean;
  };
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  price_ngn: number;
  invoice_quota_monthly: number;
  billing_type: 'per_invoice' | 'flat';
  billing_period: string;
  unlimited: boolean;
}

export interface Invoice {
  id: string;
  invoice_ref: string;
  erp_source: string;
  erp_invoice_id: string;
  status: string;
  irn: string | null;
  qr_payload: string | null;
  error_message: string | null;
  nrs_json: Record<string, unknown> | null;
  invoice_email_sent_at: string | null;
  created_at: string;
  InvoiceEvents?: InvoiceEvent[];
  SubmissionAttempts?: SubmissionAttempt[];
}

export interface InvoiceEvent {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface SubmissionAttempt {
  id: string;
  attempt_no: number;
  request_json: Record<string, unknown> | null;
  response_json: Record<string, unknown> | null;
  http_status: number | null;
  created_at: string;
}

export interface ErpConnectionCompany {
  companyName?: string | null;
  legalName?: string | null;
  country?: string | null;
  email?: string | null;
}

export type SyncSchedule = 'hourly' | 'daily' | 'weekly' | 'off';

export interface ErpConnection {
  id: string;
  connector_type: string;
  status: string;
  health_status: string | null;
  last_sync_at: string | null;
  config?: {
    mode?: string;
    realmId?: string;
    hasToken?: boolean;
    company?: ErpConnectionCompany | null;
    initialSyncDate?: string | null;
    syncSchedule?: SyncSchedule;
  };
}

export interface OnboardingStatus {
  status: string;
  onboarding: Tenant['onboarding'];
  steps: { key: string; label: string; complete: boolean; description: string }[];
  blockers: { step: string; message: string }[];
  canSubmitInvoices: boolean;
}

export interface ApiError {
  error: string;
  code: string;
}
