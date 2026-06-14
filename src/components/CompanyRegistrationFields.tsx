import { useCallback, useState } from 'react';
import api from '../api/client';
import { NIGERIAN_STATES } from '../constants/registration';
import type { CacLookupResult, CompanyRegistrationFormData } from '../constants/registration';

const inputClass = 'input-field';

interface CompanyRegistrationFieldsProps {
  form: CompanyRegistrationFormData;
  onChange: (updates: Partial<CompanyRegistrationFormData>) => void;
  showAccountFields?: boolean;
  hideInlineLookup?: boolean;
  fullName?: string;
  password?: string;
  onFullNameChange?: (v: string) => void;
  onPasswordChange?: (v: string) => void;
}

export default function CompanyRegistrationFields({
  form,
  onChange,
  showAccountFields = false,
  hideInlineLookup = false,
  fullName = '',
  password = '',
  onFullNameChange,
  onPasswordChange,
}: CompanyRegistrationFieldsProps) {
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');

  const lookupCac = useCallback(async () => {
    if (!form.rc_number.trim() || !form.company_classification) {
      setLookupMessage('Enter RC Number and company type first.');
      return;
    }

    setLookupLoading(true);
    setLookupMessage('');
    try {
      const { data } = await api.post<CacLookupResult>('/cac/lookup', {
        rc_number: form.rc_number,
        classification: form.company_classification,
      });

      if (data.found && data.company) {
        onChange({
          company_name: data.company.company_name || form.company_name,
          rc_number: data.company.rc_number || form.rc_number,
          email: data.company.email || form.email,
          primary_phone: data.company.primary_phone || form.primary_phone,
          address_line: data.company.address_line || form.address_line,
          address_city: data.company.address_city || form.address_city,
          address_country: data.company.address_country || form.address_country || 'NG',
          address_postal_zone: data.company.address_postal_zone || form.address_postal_zone,
          state: data.company.state || form.state,
          tin: data.company.tin || form.tin,
        });
        setLookupMessage(
          data.message
            ? `Found: ${data.company.company_name} (${data.status})`
            : 'Company details loaded from CAC.'
        );
      } else {
        setLookupMessage(data.message || 'RC Number not found for this company type.');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'CAC lookup failed';
      setLookupMessage(msg);
    } finally {
      setLookupLoading(false);
    }
  }, [form, onChange]);

  return (
    <div className="space-y-4">
      {!hideInlineLookup && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">RC Number</label>
            <div className="flex gap-2">
              <input
                required
                value={form.rc_number}
                onChange={(e) => onChange({ rc_number: e.target.value })}
                placeholder="e.g. 7329218"
                className={inputClass}
              />
              <button
                type="button"
                onClick={lookupCac}
                disabled={lookupLoading}
                className="shrink-0 rounded-lg border-2 border-primary-600 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 disabled:opacity-50"
              >
                {lookupLoading ? 'Looking up…' : 'Lookup CAC'}
              </button>
            </div>
            {lookupMessage && (
              <p
                className={`mt-1 text-xs ${
                  lookupMessage.includes('Found') || lookupMessage.includes('loaded')
                    ? 'text-primary-600'
                    : 'text-amber-600'
                }`}
              >
                {lookupMessage}
              </p>
            )}
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {hideInlineLookup && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">RC Number</label>
            <input
              required
              value={form.rc_number}
              onChange={(e) => onChange({ rc_number: e.target.value })}
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Company name</label>
          <input
            required
            value={form.company_name}
            onChange={(e) => onChange({ company_name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Primary phone</label>
          <input
            required
            value={form.primary_phone}
            onChange={(e) => onChange({ primary_phone: e.target.value })}
            placeholder="08012345678"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">TIN</label>
          <input
            value={form.tin}
            onChange={(e) => onChange({ tin: e.target.value })}
            placeholder="e.g. 21919238-0001"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">State</label>
          <select
            required
            value={form.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className={inputClass}
          >
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            {form.state &&
              !NIGERIAN_STATES.includes(form.state) &&
              !NIGERIAN_STATES.some((s) => s.toLowerCase() === form.state.toLowerCase()) && (
                <option value={form.state}>{form.state}</option>
              )}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Street address</label>
          <input
            required
            value={form.address_line}
            onChange={(e) => onChange({ address_line: e.target.value })}
            className={inputClass}
            placeholder="e.g. 12 Marina Road"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
          <input
            required
            value={form.address_city}
            onChange={(e) => onChange({ address_city: e.target.value })}
            className={inputClass}
            placeholder="e.g. Lagos"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Postal code (optional)
          </label>
          <input
            value={form.address_postal_zone}
            onChange={(e) => onChange({ address_postal_zone: e.target.value })}
            className={inputClass}
            placeholder="e.g. 101001"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
          <select
            required
            value={form.address_country}
            onChange={(e) => onChange({ address_country: e.target.value })}
            className={inputClass}
          >
            <option value="NG">Nigeria (NG)</option>
          </select>
        </div>
      </div>

      {showAccountFields && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Your full name (account owner)
            </label>
            <input
              required
              value={fullName}
              onChange={(e) => onFullNameChange?.(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => onPasswordChange?.(e.target.value)}
              className={inputClass}
            />
          </div>
        </>
      )}
    </div>
  );
}
