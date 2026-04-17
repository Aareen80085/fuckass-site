'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

import { firebaseSignIn } from '@/lib/authService';

export default function LoginPage() {
  const router = useRouter();
  const setCurrentUser = useStore(s => s.setCurrentUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    const result = await firebaseSignIn(email, password);
    setLoading(false);
    
    if ('error' in result) {
      if (result.error.code === 'demo/no-firebase') {
         // Fallback to local store demo login
         const localLogin = useStore.getState().login(email, password);
         if (localLogin) {
            toast.success(`Welcome back, ${localLogin.displayName}! 🎉`);
            router.push('/dashboard');
         } else {
            toast.error('Invalid email or password (demo mode)');
         }
      } else {
        toast.error(result.error.message);
      }
    } else if (result.user) {
      setCurrentUser(result.user);
      toast.success(`Welcome back, ${result.user.displayName || 'Creator'}! 🎉`);
      router.push('/dashboard');
    }
  }

  function demoLogin(role: 'creator' | 'client') {
    const creds = {
      creator: { email: 'creator@demo.com', password: 'demo123' },
      client: { email: 'client@demo.com', password: 'demo123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-purple" style={{ width: 400, height: 400, top: '-10%', right: '-5%' }} />
      <div className="orb orb-pink" style={{ width: 300, height: 300, bottom: '-10%', left: '-5%' }} />
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ display: 'inline-block', textDecoration: 'none', marginBottom: 8 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦ Facet</span>
          </Link>
          <h2 style={{ marginTop: 8 }}>Welcome back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 6 }}>Sign in to your account to continue</p>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label>Email address</label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                <Link href="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--purple-light)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" id="login-submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="spinner" />Signing in...</span> : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontWeight: 600 }}>Create one free →</Link>
        </p>
      </div>
    </div>
  );
}
