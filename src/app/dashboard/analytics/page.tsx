'use client';

import { useStore } from '@/lib/store';

const MONTHLY_REVENUE = [1200, 1800, 2200, 1900, 3100, 2800, 3600, 4100, 3800, 4500, 5200, 4900];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AnalyticsPage() {
  const { currentUser, gigs, orders } = useStore();
  const myGigs = gigs.filter(g => g.creatorId === currentUser?.id);
  const myOrders = orders.filter(o => o.creatorId === currentUser?.id);
  const completedOrders = myOrders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0);
  const totalViews = myGigs.reduce((s, g) => s + g.views, 0);
  const totalOrders = myOrders.length;
  const conversionRate = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(1) : '0.0';
  const maxRevenue = Math.max(...MONTHLY_REVENUE);

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Track your performance and growth metrics</p>
      </div>

      {/* Top Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: '💰', color: 'emerald', sub: '+24% vs last month' },
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: '👁️', color: 'cyan', sub: `${myGigs.length} gigs` },
          { label: 'Total Orders', value: totalOrders, icon: '🛒', color: 'purple', sub: `${completedOrders.length} completed` },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: '📈', color: 'amber', sub: 'views to orders' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-icon" style={{ fontSize: '1.2rem' }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--emerald)', marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3>Revenue Overview</h3>
          <span className="badge badge-emerald">Last 12 months</span>
        </div>
        <div style={{ position: 'relative', height: 200 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: '100%' }}>
            {MONTHLY_REVENUE.map((val, i) => {
              const height = (val / maxRevenue) * 100;
              const isCurrentMonth = i === new Date().getMonth();
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: isCurrentMonth ? 1 : 0.6 }}>${(val/1000).toFixed(1)}k</div>
                  <div
                    style={{
                      width: '100%',
                      height: `${height}%`,
                      background: isCurrentMonth ? 'linear-gradient(180deg,#7c3aed,#ec4899)' : 'linear-gradient(180deg,rgba(124,58,237,0.5),rgba(236,72,153,0.3))',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s',
                      minHeight: 4,
                      boxShadow: isCurrentMonth ? '0 0 12px var(--purple-glow)' : 'none',
                    }}
                  />
                  <div style={{ fontSize: '0.65rem', color: isCurrentMonth ? 'var(--purple-light)' : 'var(--text-muted)', fontWeight: isCurrentMonth ? 700 : 400 }}>{MONTHS[i]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Gig Performance */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}>📦 Gig Performance</h3>
          {myGigs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No gigs yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {myGigs.map(gig => (
                <div key={gig.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{gig.title.slice(0, 40)}...</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>{gig.orders} orders</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (gig.orders / 50) * 100)}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{gig.views} views</span>
                    {gig.rating > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--amber)' }}>★ {gig.rating.toFixed(1)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Social Media Analytics */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}>📱 Social Media</h3>
          {(currentUser?.socialLinks?.length || 0) === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No social links added yet. <a href="/dashboard/profile" style={{ color: 'var(--purple-light)', textDecoration: 'none' }}>Add them in Profile →</a></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {currentUser!.socialLinks.map(link => {
                const icons: Record<string, string> = { youtube: '📺', instagram: '📸', tiktok: '🎵', twitter: '🐦', website: '🌐' };
                const colors: Record<string, string> = { youtube: '#ef4444', instagram: '#ec4899', tiktok: '#06b6d4', twitter: '#1d9bf0', website: '#7c3aed' };
                return (
                  <div key={link.platform}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{icons[link.platform] || '🔗'}</span>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.875rem' }}>{link.platform}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{link.followers?.toLocaleString() || 0}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>followers</div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, ((link.followers || 0) / 100000) * 100)}%`, background: `${colors[link.platform] || 'var(--purple)'}` }} />
                    </div>
                    {link.engagementRate && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--emerald)', marginTop: 4 }}>
                        {link.engagementRate}% engagement rate
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Profile Completeness */}
      <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ marginBottom: 20 }}>⭐ Profile Completeness</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Bio', done: (currentUser?.bio?.length || 0) > 0, tip: 'Add a bio' },
            { label: 'Skills', done: (currentUser?.skills?.length || 0) > 0, tip: 'Add skills' },
            { label: 'Portfolio', done: (currentUser?.portfolio?.length || 0) > 0, tip: 'Add portfolio' },
            { label: 'Social Links', done: (currentUser?.socialLinks?.length || 0) > 0, tip: 'Link socials' },
            { label: 'Niche', done: !!currentUser?.niche, tip: 'Set your niche' },
            { label: 'Gigs', done: myGigs.length > 0, tip: 'Create a gig' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${item.done ? 'rgba(16,185,129,0.25)' : 'var(--border)'}` }}>
              <span style={{ fontSize: '1.2rem' }}>{item.done ? '✅' : '⬜'}</span>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: item.done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.label}</div>
                {!item.done && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.tip}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
