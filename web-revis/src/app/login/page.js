'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Login failed');
      }
      router.push('/app/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }
  

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100svh', padding: '2rem' }}>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.75rem', width: 'min(360px, 100%)' }}>
        <h1 style={{ margin: 0 }}>Sign in</h1>

        <label>
          <div>Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ width: '100%', padding: '0.5rem'  , border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </label>

        <label>
          <div>Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: '0.5rem' , border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </label>

        {error && <p style={{ color: 'crimson', margin: 0 }}>{error}</p>}

        <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1rem' }}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
