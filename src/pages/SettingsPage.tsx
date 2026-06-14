import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function SettingsPage() {
  const { tenant, refreshMe } = useAuth();
  const [form, setForm] = useState({
    legal_name: '',
    tin: '',
    rc_number: '',
    address_line: '',
    address_city: '',
    address_country: 'NG',
    address_postal_zone: '',
    nrs_business_id: '',
    nrs_service_id: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenant) {
      setForm({
        legal_name: tenant.legal_name || '',
        tin: tenant.tin || '',
        rc_number: tenant.rc_number || '',
        address_line: tenant.address?.line || '',
        address_city: tenant.address?.city || '',
        address_country: tenant.address?.country || 'NG',
        address_postal_zone: tenant.address?.postalZone || '',
        nrs_business_id: tenant.nrs_business_id || '',
        nrs_service_id: tenant.nrs_service_id || '',
      });
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.patch('/tenants/current', form);
      await refreshMe();
      setMessage('Profile updated successfully');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Update failed';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-slate-500">Company profile and NRS identifiers</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
        {message && (
          <div
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              message.includes('success') ? 'bg-primary-50 text-primary-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['legal_name', 'Legal name'],
            ['tin', 'TIN'],
            ['rc_number', 'RC Number'],
            ['nrs_business_id', 'NRS Business ID'],
            ['nrs_service_id', 'NRS Service ID'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Street address</label>
            <input
              value={form.address_line}
              onChange={(e) => setForm({ ...form, address_line: e.target.value })}
              placeholder="e.g. 12 Marina Road"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
            <input
              value={form.address_city}
              onChange={(e) => setForm({ ...form, address_city: e.target.value })}
              placeholder="e.g. Lagos"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Postal code (optional)
            </label>
            <input
              value={form.address_postal_zone}
              onChange={(e) => setForm({ ...form, address_postal_zone: e.target.value })}
              placeholder="e.g. 101001"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
            <select
              value={form.address_country}
              onChange={(e) => setForm({ ...form, address_country: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="NG">Nigeria (NG)</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
