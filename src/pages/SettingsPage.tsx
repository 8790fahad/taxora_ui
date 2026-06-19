import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';

const MAX_LOGO_BYTES = 512 * 1024; // 512 KB

type FormState = {
  legal_name: string;
  tin: string;
  rc_number: string;
  primary_phone: string;
  address_line: string;
  address_city: string;
  address_country: string;
  address_postal_zone: string;
  logo_url: string;
  logo_width: number;
  logo_height: number;
};

const EMPTY: FormState = {
  legal_name: '',
  tin: '',
  rc_number: '',
  primary_phone: '',
  address_line: '',
  address_city: '',
  address_country: 'NG',
  address_postal_zone: '',
  logo_url: '',
  logo_width: 120,
  logo_height: 120,
};

export default function SettingsPage() {
  const { tenant, refreshMe } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tenant) {
      setForm({
        legal_name: tenant.legal_name || '',
        tin: tenant.tin || '',
        rc_number: tenant.rc_number || '',
        primary_phone: tenant.primary_phone || '',
        address_line: tenant.address?.line || '',
        address_city: tenant.address?.city || '',
        address_country: tenant.address?.country || 'NG',
        address_postal_zone: tenant.address?.postalZone || '',
        logo_url: tenant.logo_url || '',
        logo_width: tenant.logo_width || 120,
        logo_height: tenant.logo_height || 120,
      });
    }
  }, [tenant]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogoFile = (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, or SVG).');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError('Logo is too large. Please use an image under 512 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      // Default the display size to the image's natural aspect (capped at 160px).
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(160 / img.width, 160 / img.height, 1);
        setForm((prev) => ({
          ...prev,
          logo_url: dataUrl,
          logo_width: Math.round(img.width * scale) || 120,
          logo_height: Math.round(img.height * scale) || 120,
        }));
      };
      img.onerror = () => update('logo_url', dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await api.patch('/tenants/current', form);
      await refreshMe();
      setMessage('Profile updated successfully.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Update failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const initials = (form.legal_name || 'Co')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl pb-24 lg:pb-8">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your company profile and branding.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="hidden rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50 sm:inline-flex"
        >
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {(message || error) && (
        <div
          className={`mt-5 rounded-lg px-4 py-3 text-sm ${
            error ? 'bg-red-50 text-red-700' : 'bg-primary-50 text-primary-700'
          }`}
        >
          {error || message}
        </div>
      )}

      {/* Branding / Logo */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">Company logo</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Shown on invoices and in your workspace. PNG, JPG or SVG, up to 512 KB.
          </p>
        </div>
        <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
            style={{ width: 96, height: 96 }}
          >
            {form.logo_url ? (
              <img
                src={form.logo_url}
                alt="Company logo"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-slate-400">{initials}</span>
            )}
          </div>

          <div className="flex-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoFile(file);
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {form.logo_url ? 'Replace logo' : 'Upload logo'}
              </button>
              {form.logo_url && (
                <button
                  type="button"
                  onClick={() => update('logo_url', '')}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="mt-4 grid max-w-xs grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Width (px)
                </label>
                <input
                  type="number"
                  min={16}
                  max={600}
                  value={form.logo_width}
                  onChange={(e) => update('logo_width', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Height (px)
                </label>
                <input
                  type="number"
                  min={16}
                  max={600}
                  value={form.logo_height}
                  onChange={(e) => update('logo_height', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company profile */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">Company profile</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Legal identifiers used on your NRS e-invoices.
          </p>
        </div>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
          <Field label="Legal name" className="sm:col-span-2">
            <input
              value={form.legal_name}
              onChange={(e) => update('legal_name', e.target.value)}
              className="input-field"
              placeholder="e.g. Nexifour Ltd"
            />
          </Field>
          <Field label="TIN">
            <input
              value={form.tin}
              onChange={(e) => update('tin', e.target.value)}
              className="input-field"
              placeholder="e.g. 21919238-0001"
            />
          </Field>
          <Field label="RC Number">
            <input
              value={form.rc_number}
              onChange={(e) => update('rc_number', e.target.value)}
              className="input-field"
              placeholder="e.g. 7329218"
            />
          </Field>
          <Field label="Phone" className="sm:col-span-2">
            <input
              value={form.primary_phone}
              onChange={(e) => update('primary_phone', e.target.value)}
              className="input-field"
              placeholder="e.g. +234 800 000 0000"
            />
          </Field>
        </div>
      </section>

      {/* Address */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">Business address</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
          <Field label="Street address" className="sm:col-span-2">
            <input
              value={form.address_line}
              onChange={(e) => update('address_line', e.target.value)}
              className="input-field"
              placeholder="e.g. 12 Marina Road"
            />
          </Field>
          <Field label="City">
            <input
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
          <Field label="Country">
            <select
              value={form.address_country}
              onChange={(e) => update('address_country', e.target.value)}
              className="input-field"
            >
              <option value="NG">Nigeria (NG)</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Mobile sticky save bar */}
      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
