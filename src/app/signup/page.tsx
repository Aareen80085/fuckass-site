'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

import { firebaseSignUp } from '@/lib/authService';

const niches = ['YouTube Growth', 'Video Editing', 'Thumbnail Design', 'TikTok Creation', 'Instagram Reels', 'Podcast Production', 'Scripting', 'Short-form Content', 'Brand Strategy', 'Social Media Management'];

export default function SignupPage() {
  const router = useRouter();
  const setCurrentUser = useStore(s => s.setCurrentUser);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    displayName: '', role: 'creator' as 'creator' | 'client',
    niche: '', bio: '',
  });

  function update(key: string, val: string) { setForm(prev => ({ ...prev, [key]: val })); }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!form.displayName.trim()) return toast.error('Please enter your name');
    setStep(3);
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const result = await firebaseSignUp(
      form.email,
      form.password,
      form.displayName,
      form.role,
      form.niche,
      form.bio
    );
    
    setLoading(false);

    if ('error' in result) {
      if (result.error.code === 'demo/no-firebase') {
        // Fallback to local store
        const user = useStore.getState().signup({ ...form });
        setCurrentUser(user);
        toast.success('Account created! Welcome to Facet 🎉');
        router.push('/dashboard');
      } else {
        toast.error(result.error.message);
      }
    } else if (result.user) {
      setCurrentUser(result.user);
      toast.success('Account created! Welcome to Facet 🎉');
      router.push('/dashboard');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-purple" style={{ width: 450, height: 450, top: '-15%', left: '-5%' }} />
      <div className="orb orb-cyan" style={{ width: 350, height: 350, bottom: '-10%', right: '5%' }} />
      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦ Facet</span>
          </Link>
          <h2 style={{ marginTop: 10 }}>Create your account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 6 }}>Join 12,000+ content creators</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
          {[1,2,3].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0, background: step >= s ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : 'rgba(255,255,255,0.06)', color: step >= s ? '#fff' : 'var(--text-muted)', border: step === s ? '2px solid var(--purple)' : '1px solid var(--border)', transition: 'all 0.3s' }}>{s}</div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > s ? 'var(--purple)' : 'var(--border)', transition: 'all 0.3s' }} />}
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          {/* Step 1: Credentials */}
          {step === 1 && (
            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3>Account Details</h3>
              <div className="input-group">
                <label>Email address</label>
                <input id="signup-email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input id="signup-password" type="password" className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={e => update('password', e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Confirm password</label>
                <input id="signup-confirm-password" type="password" className="input-field" placeholder="Repeat password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>Continue →</button>
            </form>
          )}

          {/* Step 2: Role & Name */}
          {step === 2 && (
            <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3>Who are you?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {(['creator', 'client'] as const).map(role => (
                  <button key={role} type="button" onClick={() => update('role', role)} style={{ padding: '16px', border: `2px solid ${form.role === role ? 'var(--purple)' : 'var(--border)'}`, borderRadius: 12, background: form.role === role ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{role === 'creator' ? '🎬' : '🛒'}</div>
                    <div style={{ fontWeight: 700, marginBottom: 4, textTransform: 'capitalize' }}>{role}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{role === 'creator' ? 'Offer services & grow' : 'Hire creators'}</div>
                  </button>
                ))}
              </div>
              <div className="input-group">
                <label>Profile photo</label>
                <input id="signup-photo" type="file" accept="image/*" className="input-field" style={{ padding: '8px' }} />
              </div>
              <div className="input-group">
                <label>Display name</label>
                <input id="signup-name" type="text" className="input-field" placeholder="Your full name or brand name" value={form.displayName} onChange={e => update('displayName', e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Continue →</button>
              </div>
            </form>
          )}

          {/* Step 3: Niche & Bio */}
          {step === 3 && (
            <form onSubmit={handleFinish} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3>Your Creator Profile</h3>
              <div className="input-group">
                <label>Your niche</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {niches.map(n => (
                    <button key={n} type="button" onClick={() => update('niche', n)} style={{ padding: '5px 12px', border: `1px solid ${form.niche === n ? 'var(--purple)' : 'var(--border)'}`, borderRadius: 999, background: form.niche === n ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)', color: form.niche === n ? 'var(--purple-light)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s' }}>{n}</button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Short bio <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                <textarea className="input-field" placeholder="Tell clients what you do and why you're great at it..." value={form.bio} onChange={e => update('bio', e.target.value)} style={{ minHeight: 80 }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" id="signup-submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><span className="spinner" />Creating...</span> : '✦ Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
