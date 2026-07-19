import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-paper)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck size={28} strokeWidth={1.75} color="var(--color-ink)" />
          <span className="font-display text-2xl" style={{ color: 'var(--color-ink)' }}>DataShield</span>
        </div>

        <div
          className="rounded-2xl p-8 border"
          style={{ backgroundColor: 'white', borderColor: 'var(--color-line)' }}
        >
          <h1 className="font-display text-2xl mb-1" style={{ color: 'var(--color-ink)' }}>Welcome back</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-slate)' }}>Sign in to your compliance dashboard</p>

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
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Work email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-line)' }}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-ink)' }}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-slate)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium" style={{ color: 'var(--color-ink)' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
