'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Users, ArrowLeftRight, LayoutDashboard, Library, LogOut } from 'lucide-react';

const links = [
  { href: '/',        label: 'Dashboard', icon: LayoutDashboard },
  { href: '/books',   label: 'Books',     icon: BookOpen },
  { href: '/members', label: 'Members',   icon: Users },
  { href: '/loans',   label: 'Loans',     icon: ArrowLeftRight },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '220px',
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Library size={18} color="#0e0e0f" />
          </div>
          <span className="font-display" style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: 700 }}>
            Libris
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 12px', flex: 1 }}>
        <div style={{ marginBottom: 6, padding: '0 4px 8px', fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
          Navigation
        </div>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname === href ? 'active' : ''}`}
            style={{ marginBottom: 3 }}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', gap: 10 }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
