'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './page.css';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Login failed.'); setLoading(false); return; }
      router.push(json.redirectTo);
    } catch {
      setError('Network error. Check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="sl-root">
      {/* Brand side */}
      <div className="sl-brand" aria-hidden>
        <Link href="/" className="sl-brand-logo">
          <svg width="40" height="40" viewBox="0 0 96 96" fill="none">
            <g stroke="#2F6FE0" strokeWidth="7" strokeLinecap="round">
              <path d="M20 38 V23 Q20 20 23 20 H38" fill="none"/>
              <path d="M76 58 V73 Q76 76 73 76 H58" fill="none"/>
            </g>
            <g strokeWidth="6.5" strokeLinecap="round">
              <line x1="33" y1="38" x2="66" y2="38" stroke="#2C313A"/>
              <line x1="33" y1="48" x2="58" y2="48" stroke="#2F6FE0"/>
              <line x1="33" y1="58" x2="63" y2="58" stroke="#2C313A"/>
            </g>
          </svg>
          <span className="sl-brand-name">bun<span className="sl-blue">oo</span>d</span>
        </Link>
        <p className="sl-brand-tagline">Construction Procurement OS</p>
      </div>

      {/* Form side */}
      <main className="sl-form-panel">
        <div className="sl-form-inner">
          <h1 className="sl-title">Welcome Back</h1>
          <p className="sl-sub">Sign in to your Bunood account to continue.</p>

          <form className="sl-form" onSubmit={submit} noValidate>
            <div className="sl-field">
              <label className="sl-label" htmlFor="sl-email">Email</label>
              <input
                id="sl-email"
                className="sl-input"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="sl-field">
              <label className="sl-label" htmlFor="sl-password">
                Password
                <a href="/supplier/reset-password" className="sl-forgot">Forgot password?</a>
              </label>
              <div className="sl-pw-wrap">
                <input
                  id="sl-password"
                  className="sl-input"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="sl-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="sl-error" role="alert">{error}</p>}

            <button type="submit" className="sl-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="sl-register">
            Don&apos;t have an account?
            <span className="sl-register-links">
              <a href="/register/engineer" className="sl-link">Engineer</a>
              <span className="sl-sep">|</span>
              <a href="/register/contractor" className="sl-link">Contractor</a>
              <span className="sl-sep">|</span>
              <a href="/register/supplier" className="sl-link">Supplier</a>
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
