'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    toast.success('Reset link sent! Check your inbox.');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦ Facet</span>
        </Link>
        <div style={{ fontSize: '3rem', margin: '24px 0 8px' }}>🔑</div>
        <h2 style={{ marginBottom: 8 }}>Reset Password</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 28 }}>Enter your email and we'll send you a reset link</p>
        <div className="glass-card" style={{ padding: 28 }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✉️</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Check <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> for your reset link.</p>
              <Link href="/login" className="btn btn-primary btn-full">← Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Email address</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <button type="submit" className="btn btn-primary btn-full">Send Reset Link →</button>
              <Link href="/login" className="btn btn-ghost btn-full">← Back to Login</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
