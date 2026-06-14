import { useState } from 'react';
import api from '../api/client';
import { COMPANY_CLASSIFICATIONS } from '../constants/registration';
import type { CacLookupResult, CompanyRegistrationFormData } from '../constants/registration';

interface VerifyCacModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: (data: CompanyRegistrationFormData) => void;
}

export default function VerifyCacModal({ open, onClose, onVerified }: VerifyCacModalProps) {
  const [cacNumber, setCacNumber] = useState('');
  const [classification, setClassification] = useState('2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleVerify = async () => {
    if (!cacNumber.trim()) {
      setError('Enter CAC Number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<CacLookupResult>('/cac/lookup', {
        rc_number: cacNumber,
        classification,
      });

      if (data.found && data.company) {
        onVerified({
          company_classification: classification,
          rc_number: data.company.rc_number,
          company_name: data.company.company_name,
          email: data.company.email,
          primary_phone: data.company.primary_phone,
          address_line: data.company.address_line,
          address_city: data.company.address_city,
          address_country: data.company.address_country || 'NG',
          address_postal_zone: data.company.address_postal_zone || '',
          state: data.company.state,
          tin: data.company.tin || '',
          nrs_business_id: '',
          nrs_service_id: '',
        });
        setCacNumber('');
        setError('');
        onClose();
      } else {
        setError(data.message || 'RC Number not found for this company type.');
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Verification failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-secondary-900/40 sm:items-center sm:p-4">
      <div
        className="flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-xl"
        role="dialog"
        aria-labelledby="verify-cac-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="verify-cac-title" className="text-lg font-semibold text-secondary-800">
            Verify CAC Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-secondary-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">CAC Number</label>
          <input
            type="text"
            value={cacNumber}
            onChange={(e) => setCacNumber(e.target.value)}
            placeholder="Enter CAC Number"
            className="input-field mb-5"
            autoFocus
          />

          <div className="space-y-3">
            {Object.entries(COMPANY_CLASSIFICATIONS).map(([code, label]) => (
              <label
                key={code}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 hover:border-primary-300 hover:bg-primary-50"
              >
                <input
                  type="radio"
                  name="classification"
                  value={code}
                  checked={classification === code}
                  onChange={() => setClassification(code)}
                  className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-800">{label}</span>
              </label>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button type="button" onClick={handleVerify} disabled={loading} className="btn-primary mt-6 w-full">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {loading ? 'Verifying…' : 'Verify CAC'}
          </button>
        </div>
      </div>
    </div>
  );
}
