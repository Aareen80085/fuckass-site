'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';

const features = [
  { icon: '🤖', title: 'AI Profile Audit', desc: 'Get a score and actionable improvements for your creator profile', color: 'rgba(124,58,237,0.15)' },
  { icon: '📅', title: 'Content Strategy', desc: 'AI-generated weekly plans for YouTube, Instagram, and TikTok', color: 'rgba(236,72,153,0.15)' },
  { icon: '🎯', title: 'Gig Optimization', desc: 'Smarter titles, pricing strategies, and tags for your services', color: 'rgba(6,182,212,0.15)' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track orders, revenue, and performance in one place', color: 'rgba(16,185,129,0.15)' },
  { icon: '🛒', title: 'Marketplace', desc: 'Sell your editing, scripting, and thumbnail services to clients', color: 'rgba(245,158,11,0.15)' },
  { icon: '🚀', title: 'Growth Playbooks', desc: 'Platform-specific strategies backed by data and trends', color: 'rgba(239,68,68,0.15)' },
];

const stats = [
  { value: '12K+', label: 'Active Creators' },
  { value: '$2.4M', label: 'Earned This Month' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '4.9★', label: 'Average Rating' },
];

const niches = ['📹 YouTube', '📸 Instagram', '🎵 TikTok', '✂️ Video Editing', '🖼️ Thumbnails', '✍️ Scripting', '📱 Reels', '🎙️ Podcasting'];

export default function LandingPage() {
  const router = useRouter();
  const { currentUser } = useStore();

  useEffect(() => {
    if (currentUser) router.replace('/dashboard');
  }, [currentUser, router]);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="landing-nav">
        <span className="logo" style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ✦ Creatify
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="orb orb-purple" style={{ width: 500, height: 500, top: '10%', left: '5%' }} />
        <div className="orb orb-pink" style={{ width: 400, height: 400, top: '20%', right: '10%' }} />
        <div className="orb orb-cyan" style={{ width: 300, height: 300, bottom: '10%', left: '40%' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div className="ai-badge" style={{ marginBottom: 24, display: 'inline-flex' }}>
            🤖 AI-Powered Creator Platform
          </div>
          <h1>
            The Marketplace <span className="gradient-text">Built for Creators</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginTop: 20, lineHeight: 1.8, maxWidth: 600, margin: '20px auto 0' }}>
            Sell your content creation services, grow your personal brand, and let our AI agent audit your profile, generate strategies, and optimize your gigs.
          </p>
          <div className="hero-cta">
            <Link href="/signup" className="btn btn-primary btn-lg">
              ✦ Start for Free
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              View Demo ↗
            </Link>
          </div>
          {/* Niche Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 40 }}>
            {niches.map(n => (
              <span key={n} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 40px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="ai-badge" style={{ marginBottom: 16, display: 'inline-flex' }}>✦ Platform Features</div>
          <h2>Everything a Creator Needs</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>From services to AI-powered growth — all in one place</p>
        </div>
        <div className="grid-3">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
              <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Highlight */}
      <section style={{ padding: '60px 40px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div className="ai-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>🤖 AI Core Feature</div>
          <h2>Your Personal <span className="gradient-text">AI Content Coach</span></h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 16, lineHeight: 1.8 }}>
            Our AI agent analyzes your profile, audits weaknesses, rewrites your bio, generates a custom content calendar, suggests viral hooks, and identifies growth opportunities — powered by GPT-4.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 40 }}>
            {[
              { icon: '🔍', label: 'Profile Score', desc: '0–100 audit with fixes' },
              { icon: '📋', label: 'Weekly Plan', desc: '7-day content calendar' },
              { icon: '💬', label: 'AI Chat', desc: 'Real-time creator advice' },
            ].map(i => (
              <div key={i.label} className="glass-card-inset" style={{ padding: 20, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{i.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{i.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{i.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36 }}>
            <Link href="/signup" className="btn btn-primary btn-lg">Try AI Agent Free →</Link>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Ready to <span className="gradient-text">Level Up?</span></h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Join 12,000+ creators already growing with Creatify</p>
        <Link href="/signup" className="btn btn-primary btn-lg" style={{ padding: '16px 48px', fontSize: '1.05rem' }}>
          ✦ Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦ Creatify</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2025 Creatify. Built for creators, by creators.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Terms', 'Privacy', 'Support'].map(l => <a key={l} href="#" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}
