'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/orders', label: 'Orders', icon: '🧾' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="admin-sidebar w-64 shrink-0 flex flex-col p-4 hidden md:flex">
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-2 no-underline px-3 py-4 mb-6">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: 'var(--sidebar-accent)', color: '#fff' }}
          >
            V
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: '#fff', fontFamily: 'var(--font-sora)' }}>
            VOLT Admin
          </span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`no-underline ${isActive ? 'active' : ''}`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t pt-4 mt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Link href="/" className="no-underline flex items-center gap-3 px-3 py-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
            ← Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-lg cursor-pointer border-none bg-transparent transition-colors"
            style={{ color: 'var(--sidebar-text)' }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4" style={{ background: 'var(--sidebar-bg)' }}>
        <span className="text-lg font-bold" style={{ color: '#fff', fontFamily: 'var(--font-sora)' }}>
          VOLT Admin
        </span>
        <div className="flex gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg no-underline"
              title={item.label}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 md:p-8 p-4 pt-20 md:pt-8" style={{ background: 'var(--bg-secondary)' }}>
        {children}
      </main>
    </div>
  );
}
