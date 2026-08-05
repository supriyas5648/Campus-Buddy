import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register({
          username: form.username,
          email: form.email,
          password: form.password,
          role: 'student',
        });
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate('/map-buddy', { replace: true });
    } catch (err) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass w-full max-w-md p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">CampusBuddy Access</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to continue to your shared dashboard.</p>
        </div>

        <div className="mb-5 flex rounded-xl border border-white/10 bg-white/5 p-1">
          <button type="button" className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-brand-500 text-white' : 'text-slate-300'}`} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-brand-500 text-white' : 'text-slate-300'}`} onClick={() => setMode('register')}>Register</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="field-label">Username</label>
              <input className="input" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Enter username" required />
            </div>
          )}

          <div>
            <label className="field-label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@campus.edu" required />
          </div>

          <div>
            <label className="field-label">Password</label>
            <input type="password" className="input" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter password" required />
          </div>

          {error && <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
