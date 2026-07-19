import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INDUSTRIES = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'edtech', label: 'Edtech' },
  { value: 'saas', label: 'SaaS' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    industry: 'other',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: 'var(--color-paper)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck size={28} strokeWidth={1.75} color="var(--color-ink)" />
          <span className="font-display text-2xl" style={{ color: 'var(--color-ink)' }}>DataShield</span>
        </div>

        <div className="rounded-2xl p-8 border" style={{ backgroundColor: 'white', borderColor: 'var(--color-line)' }}>
          <h1 className="font-display text-2xl mb-1" style={{ color: 'var(--color-ink)' }}>Create your account</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-slate)' }}>Start your DPDP compliance journey</p>

          {error && (
            <div
              className="mb-4 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-rust) 10%, transparent)', color: 'var(--color-rust)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Your name</label>
              <input
                required
                value={form.name}
                onChange={update('name')}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-line)' }}
                placeholder="Sudhir Kumar"
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Work email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={update('email')}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-line)' }}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={update('password')}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-line)' }}
                placeholder="At least 8 characters"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-slate)' }}>
                Must include a number and an uppercase letter.
              </p>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Company name</label>
              <input
                required
                value={form.companyName}
                onChange={update('companyName')}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-line)' }}
                placeholder="Acme Pvt Ltd"
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Industry</label>
              <select
                value={form.industry}
                onChange={update('industry')}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 bg-white"
                style={{ borderColor: 'var(--color-line)' }}
              >
                {INDUSTRIES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-ink)' }}
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-slate)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--color-ink)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
