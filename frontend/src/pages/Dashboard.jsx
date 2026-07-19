import { useEffect, useState, useMemo } from 'react';
import client from '../api/client';
import AppLayout from '../components/AppLayout';
import ComplianceSeal from '../components/ComplianceSeal';
import LedgerRow from '../components/LedgerRow';

const CATEGORY_LABELS = {
  consent_management: 'Consent management',
  data_minimization: 'Data minimization',
  breach_notification: 'Breach notification',
  user_rights: 'User rights',
  documentation: 'Documentation',
  security_safeguards: 'Security safeguards',
  grievance_redressal: 'Grievance redressal',
  children_data: "Children's data",
};

export default function Dashboard() {
  const [company, setCompany] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const companyRes = await client.get('/companies/me');
      setCompany(companyRes.data.data.company);

      let checklistRes = await client.get('/checklist');

      if (checklistRes.data.results === 0) {
        await client.post('/checklist/seed');
        checklistRes = await client.get('/checklist');
        const refreshedCompany = await client.get('/companies/me');
        setCompany(refreshedCompany.data.data.company);
      }

      setItems(checklistRes.data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your dashboard. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = async (item) => {
    // Optimistic update
    setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, isCompleted: !i.isCompleted } : i)));
    try {
      await client.patch(`/checklist/${item._id}/toggle`);
      const companyRes = await client.get('/companies/me');
      setCompany(companyRes.data.data.company);
    } catch {
      // revert on failure
      setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, isCompleted: item.isCompleted } : i)));
    }
  };

  const grouped = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [items]);

  const completedCount = items.filter((i) => i.isCompleted).length;

  if (isLoading) {
    return (
      <AppLayout>
        <p className="text-sm" style={{ color: 'var(--color-slate)' }}>Loading your compliance record…</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-brass)' }}>
          {company?.name}
        </p>
        <h1 className="font-display text-3xl" style={{ color: 'var(--color-ink)' }}>
          Compliance overview
        </h1>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-rust) 10%, transparent)', color: 'var(--color-rust)' }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div
          className="md:col-span-1 rounded-2xl border p-8 flex flex-col items-center justify-center"
          style={{ backgroundColor: 'white', borderColor: 'var(--color-line)' }}
        >
          <ComplianceSeal score={company?.complianceScore || 0} status={company?.complianceStatus} />
        </div>

        <div className="md:col-span-2 rounded-2xl border p-6" style={{ backgroundColor: 'white', borderColor: 'var(--color-line)' }}>
          <h2 className="font-display text-lg mb-4" style={{ color: 'var(--color-ink)' }}>Register summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-2xl" style={{ color: 'var(--color-ink)' }}>{items.length}</p>
              <p className="text-xs" style={{ color: 'var(--color-slate)' }}>Total requirements</p>
            </div>
            <div>
              <p className="font-mono text-2xl" style={{ color: 'var(--color-moss)' }}>{completedCount}</p>
              <p className="text-xs" style={{ color: 'var(--color-slate)' }}>Completed</p>
            </div>
            <div>
              <p className="font-mono text-2xl" style={{ color: 'var(--color-rust)' }}>
                {items.filter((i) => i.priority === 'high' && !i.isCompleted).length}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-slate)' }}>High priority pending</p>
            </div>
            <div>
              <p className="font-mono text-2xl" style={{ color: 'var(--color-slate)' }}>{Object.keys(grouped).length}</p>
              <p className="text-xs" style={{ color: 'var(--color-slate)' }}>Categories tracked</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="font-display text-xl mb-4" style={{ color: 'var(--color-ink)' }}>Compliance register</h2>
      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div key={category} className="rounded-2xl border p-6" style={{ backgroundColor: 'white', borderColor: 'var(--color-line)' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-brass)' }}>
              {CATEGORY_LABELS[category] || category}
            </h3>
            <div>
              {categoryItems.map((item) => (
                <LedgerRow key={item._id} item={item} onToggle={handleToggle} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
