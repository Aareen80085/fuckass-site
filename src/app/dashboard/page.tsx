'use client';

import { useStore } from '@/lib/store';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentUser, gigs, orders } = useStore();

  const myGigs = gigs.filter(g => g.creatorId === currentUser?.id);
  const myOrders = orders.filter(o => currentUser?.role === 'creator' ? o.creatorId === currentUser.id : o.clientId === currentUser?.id);
  const pendingOrders = myOrders.filter(o => o.status === 'pending' || o.status === 'in_progress');
  const totalEarnings = myOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const activeGigs = myGigs.filter(g => g.status === 'active').length;

  const isCreator = currentUser?.role === 'creator';

  const creatorStats = [
    { label: 'Total Earnings', value: `$${totalEarnings}`, icon: '💰', color: 'emerald' },
    { label: 'Active Gigs', value: activeGigs, icon: '📦', color: 'purple' },
    { label: 'Active Orders', value: pendingOrders.length, icon: '🛒', color: 'amber' },
    { label: 'Profile Score', value: `${currentUser?.profileScore || 0}%`, icon: '⭐', color: 'cyan' },
  ];

  const clientStats = [
    { label: 'Total Spent', value: `$${myOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (Number(o.amount) || 0), 0)}`, icon: '💸', color: 'purple' },
    { label: 'Active Orders', value: pendingOrders.length, icon: '🛒', color: 'amber' },
    { label: 'Completed', value: myOrders.filter(o => o.status === 'completed').length, icon: '✅', color: 'emerald' },
    { label: 'Total Orders', value: myOrders.length, icon: '📋', color: 'cyan' },
  ];

  const stats = isCreator ? creatorStats : clientStats;

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>
              Welcome back, <span className="gradient-text">{currentUser?.displayName?.split(' ')[0]}</span> 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              {isCreator ? `${currentUser?.niche || 'Content Creator'} · ${activeGigs} active gigs` : `Client Dashboard · ${myOrders.length} total orders`}
            </p>
          </div>
          {isCreator && (
            <Link href="/dashboard/ai-agent" className="btn btn-primary">
              🤖 AI Agent →
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.color}`}>
            <div className="stat-icon" style={{ background: `rgba(${stat.color === 'purple' ? '124,58,237' : stat.color === 'cyan' ? '6,182,212' : stat.color === 'emerald' ? '16,185,129' : '245,158,11'},0.15)` }}>
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent Orders */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Recent Orders</h3>
            <Link href="/dashboard/orders" style={{ fontSize: '0.8rem', color: 'var(--purple-light)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {myOrders.slice(0, 3).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>No orders yet</p>
          ) : myOrders.slice(0, 3).map(order => (
            <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ overflow: 'hidden', marginRight: 12 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.gigTitle.slice(0, 35)}...</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{isCreator ? order.clientName : 'By Alex Rivera'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>${order.amount}</span>
                <span className={`badge ${order.status === 'completed' ? 'badge-emerald' : order.status === 'in_progress' ? 'badge-cyan' : order.status === 'delivered' ? 'badge-amber' : 'badge-gray'}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* AI Agent CTA or Profile Status */}
        <div className="ai-glow-card">
          <div className="ai-badge" style={{ marginBottom: 16 }}>🤖 AI Agent</div>
          <h3 style={{ marginBottom: 8 }}>Your Profile Score</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '20px 0' }}>
            <div className="score-circle">
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="56" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="65" cy="65" r="56"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="351.9"
                  strokeDashoffset={351.9 - (351.9 * (currentUser?.profileScore || 0) / 100)}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="score-text">
                <span className="score-value gradient-text">{currentUser?.profileScore || 0}</span>
                <span className="score-label">/ 100</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {(currentUser?.profileScore || 0) >= 80
                  ? '🔥 Your profile is looking great! Small optimizations can push it to 90+.'
                  : (currentUser?.profileScore || 0) >= 60
                  ? '⚡ Good start! AI has identified key improvements to boost your profile.'
                  : '🚀 Your profile needs work. Let AI help you unlock its full potential!'
                }
              </p>
              <Link href="/dashboard/ai-agent" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
                Audit My Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Creator: Gig Performance */}
      {isCreator && myGigs.length > 0 && (
        <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3>Gig Performance</h3>
            <Link href="/dashboard/gigs" style={{ fontSize: '0.8rem', color: 'var(--purple-light)', textDecoration: 'none' }}>Manage →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {myGigs.slice(0, 3).map(gig => (
              <div key={gig.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{gig.title.slice(0, 50)}...</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>{gig.orders} orders · {gig.views} views</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (gig.orders / 50) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
