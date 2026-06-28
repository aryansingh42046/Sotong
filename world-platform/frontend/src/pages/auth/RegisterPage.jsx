import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #0d0d1a 0%, #020208 100%)' }}>
      <div className="glass rounded-2xl p-8 w-full max-w-sm text-center">
        <span className="text-4xl">📧</span>
        <h2 className="text-xl font-bold text-white mt-4">Check your email</h2>
        <p className="text-sm text-gray-400 mt-2">We sent a verification link to <strong className="text-white">{form.email}</strong></p>
        <Link to="/auth/login" className="block mt-6 text-indigo-400 hover:text-indigo-300 text-sm">Back to login →</Link>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #0d0d1a 0%, #020208 100%)' }}>
      <div className="glass rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🌍</span>
          <h1 className="text-xl font-bold text-white mt-2">Create your world</h1>
          <p className="text-sm text-gray-400 mt-1">Join the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { key: 'username', label: 'Username', type: 'text', placeholder: 'coolexplorer' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
                placeholder={f.placeholder}
                required
              />
            </div>
          ))}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Have an account? <Link to="/auth/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
