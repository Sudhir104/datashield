import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import client from '../api/client';
import AppLayout from '../components/AppLayout';

const DATA_CATEGORIES = [
  { value: 'name_contact', label: 'Name & contact details' },
  { value: 'financial', label: 'Financial information' },
  { value: 'health', label: 'Health data' },
  { value: 'biometric', label: 'Biometric data' },
  { value: 'location', label: 'Location data' },
  { value: 'behavioral_analytics', label: 'Behavioral / analytics data' },
  { value: 'government_id', label: 'Government ID numbers' },
  { value: 'employment', label: 'Employment records' },
  { value: 'other', label: 'Other' },
];

const emptyForm = {
  dataCategory: 'name_contact',
  purpose: '',
  collectionSource: 'website_form',
  storageLocation: 'india',
  retentionPeriodDays: 365,
  sharedWithThirdParties: false,
  consentObtained: false,
  encryptedAtRest: false,
};

export default function DataAudit() {
  const [flows, setFlows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await client.get('/data-audit');
      setFlows(res.data.data.audit.dataFlows);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your data audit.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await client.post('/data-audit/flows', form);
      setFlows(res.data.data.audit.dataFlows);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this entry.');
    }
  };

  const handleDelete = async (flowId) => {
    try {
      const res = await client.delete(`/data-audit/flows/${flowId}`);
      setFlows(res.data.data.audit.dataFlows);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove this entry.');
    }
  };

  return (
    <AppLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-brass)' }}>
            Data mapping
          </p>
          <h1 className="font-display text-3xl" style={{ color: 'var(--color-ink)' }}>Data audit</h1>
          <p className="text-sm mt-1 max-w-lg" style={{ color: 'var(--color-slate)' }}>
            Record every category of personal data your business collects, why, and where it's stored.
            This becomes the source for your generated policy documents.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white shrink-0"
          style={{ backgroundColor: 'var(--color-ink)' }}
        >
          <Plus size={16} /> Add data flow
        </button>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-rust) 10%, transparent)', color: 'var(--color-rust)' }}
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm" style={{ color: 'var(--color-slate)' }}>Loading…</p>
      ) : flows.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: 'var(--color-line)' }}>
          <p className="text-sm" style={{ color: 'var(--color-slate)' }}>
            No data flows recorded yet. Add your first one to start building your audit trail.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'white', borderColor: 'var(--color-line)' }}>
          {flows.map((flow) => (
            <div key={flow._id} className="ledger-row flex items-start justify-between gap-4 p-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)' }}
                  >
                    {DATA_CATEGORIES.find((c) => c.value === flow.dataCategory)?.label || flow.dataCategory}
                  </span>
                  {flow.consentObtained && (
                    <span className="text-xs" style={{ color: 'var(--color-moss)' }}>Consent obtained</span>
                  )}
                  {!flow.consentObtained && (
                    <span className="text-xs" style={{ color: 'var(--color-rust)' }}>Consent missing</span>
                  )}
                </div>
                <p className="text-sm" style={{ color: 'var(--color-ink)' }}>{flow.purpose}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-slate)' }}>
                  Stored {flow.storageLocation === 'india' ? 'in India' : flow.storageLocation === 'outside_india' ? 'outside India' : 'in India and abroad'}
                  {flow.retentionPeriodDays ? ` · Retained ${flow.retentionPeriodDays} days` : ''}
                  {flow.encryptedAtRest ? ' · Encrypted at rest' : ' · Not encrypted at rest'}
                </p>
              </div>
              <button
                onClick={() => handleDelete(flow._id)}
                aria-label="Remove entry"
                className="p-2 rounded-lg hover:bg-black/5 shrink-0"
                style={{ color: 'var(--color-slate)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'white' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>Add data flow</h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--color-slate)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Data category</label>
                <select
                  value={form.dataCategory}
                  onChange={(e) => setForm({ ...form, dataCategory: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  {DATA_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Purpose of collection</label>
                <input
                  required
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="e.g. Processing customer payments"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--color-line)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Storage location</label>
                  <select
                    value={form.storageLocation}
                    onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white"
                    style={{ borderColor: 'var(--color-line)' }}
                  >
                    <option value="india">In India</option>
                    <option value="outside_india">Outside India</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Retention (days)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.retentionPeriodDays}
                    onChange={(e) => setForm({ ...form, retentionPeriodDays: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--color-line)' }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  ['consentObtained', 'Consent obtained from data subject'],
                  ['sharedWithThirdParties', 'Shared with third parties'],
                  ['encryptedAtRest', 'Encrypted at rest'],
                ].map(([field, label]) => (
                  <label key={field} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-ink)' }}>
                    <input
                      type="checkbox"
                      checked={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="mt-2 py-2.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--color-ink)' }}
              >
                Save entry
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
