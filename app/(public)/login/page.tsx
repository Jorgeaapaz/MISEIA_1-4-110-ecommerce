'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } else {
      setError(data.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-secondary)' }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
              style={{ background: 'var(--accent-600)' }}
            >
              V
            </div>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
            >
              VOLT
            </span>
          </Link>
          <h1 className="heading-2 mt-4">Welcome back</h1>
          <p className="body-sm mt-2">Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div
                className="text-sm font-medium px-4 py-3 rounded-lg animate-fade-in"
                style={{ background: '#fee2e2', color: '#991b1b' }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="label block mb-2">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label block mb-2">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="body-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold no-underline" style={{ color: 'var(--accent-600)' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div
          className="mt-6 p-4 rounded-xl text-center"
          style={{ background: 'var(--accent-50)', border: '1px solid var(--accent-200)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-700)' }}>Demo Credentials</p>
          <p className="text-xs" style={{ color: 'var(--accent-600)' }}>
            Admin: admin@shop.com / admin123
          </p>
          <p className="text-xs" style={{ color: 'var(--accent-600)' }}>
            Customer: customer1@shop.com / pass1234
          </p>
        </div>
      </div>
    </div>
  );
}
