import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #0d0d1a 0%, #020208 100%)' }}>
      <div className="glass rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🌍</span>
          <h1 className="text-xl font-bold text-white mt-2">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          No account? <Link to="/auth/register" className="text-indigo-400 hover:text-indigo-300">Create one</Link>
        </p>
        <p className="text-center text-xs mt-2">
          <Link to="/" className="text-gray-600 hover:text-gray-400">← Back to globe</Link>
        </p>
      </div>
    </div>
  );
}
