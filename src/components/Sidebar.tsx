'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

const creatorNav = [
  { href: '/dashboard', icon: '◈', label: 'Dashboard' },
  { href: '/dashboard/ai-agent', icon: '🤖', label: 'AI Agent', badge: 'AI' },
  { href: '/dashboard/gigs', icon: '🔍', label: 'Explore Jobs' },
  { href: '/dashboard/orders', icon: '🛒', label: 'Orders' },
  { href: '/dashboard/analytics', icon: '📊', label: 'Analytics' },
];

const clientNav = [
  { href: '/dashboard', icon: '◈', label: 'Dashboard' },
  { href: '/dashboard/gigs', icon: '📋', label: 'My Postings' },
  { href: '/dashboard/orders', icon: '🛒', label: 'My Orders' },
  { href: '/dashboard/ai-agent', icon: '🤖', label: 'AI Agent', badge: 'AI' },
];

const bottomNav = [
  { href: '/dashboard/profile', icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useStore();

  const navItems = currentUser?.role === 'creator' ? creatorNav : clientNav;

  function handleLogout() {
    logout();
    toast.success('Logged out. See you soon!');
    router.push('/');
  }

  const isActive = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo">✦ Facet</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Creator Marketplace</div>
      </div>

      {/* User Info */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.15)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              currentUser?.displayName?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.displayName}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              <span style={{ color: currentUser?.role === 'creator' ? 'var(--purple-light)' : 'var(--cyan)' }}>●</span> {currentUser?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-section">Menu</div>
      <nav>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}>
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(236,72,153,0.3))', borderRadius: 999, color: '#c4b5fd', fontWeight: 700, letterSpacing: '0.05em' }}>{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-footer">
        {bottomNav.map(item => (
          <Link key={item.href} href={item.href} className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}>
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button onClick={handleLogout} className="sidebar-item btn-ghost" style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: 4, background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit' }}>
          <span style={{ fontSize: '1rem' }}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
