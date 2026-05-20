'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserData {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  name: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: 'rgba(255,255,255,0.85)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'var(--accent-600)' }}
            >
              V
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-sora), system-ui', color: 'var(--text-primary)' }}
            >
              VOLT
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium no-underline transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Products
            </Link>
            {user && user.role === 'customer' && (
              <>
                <Link
                  href="/cart"
                  className="text-sm font-medium no-underline transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cart
                </Link>
                <Link
                  href="/orders"
                  className="text-sm font-medium no-underline transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Orders
                </Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <Link
                href="/admin"
                className="text-sm font-medium no-underline transition-colors"
                style={{ color: 'var(--accent-600)' }}
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user.name}
                </span>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn btn-ghost btn-sm no-underline">
                  Sign In
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm no-underline">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden btn btn-ghost btn-sm"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                {menuOpen ? (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            <Link href="/" className="btn btn-ghost text-left no-underline" onClick={() => setMenuOpen(false)}>
              Products
            </Link>
            {user && user.role === 'customer' && (
              <>
                <Link href="/cart" className="btn btn-ghost text-left no-underline" onClick={() => setMenuOpen(false)}>
                  Cart
                </Link>
                <Link href="/orders" className="btn btn-ghost text-left no-underline" onClick={() => setMenuOpen(false)}>
                  Orders
                </Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <Link href="/admin" className="btn btn-ghost text-left no-underline" onClick={() => setMenuOpen(false)}>
                Admin Panel
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
