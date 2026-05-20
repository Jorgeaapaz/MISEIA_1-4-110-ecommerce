'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

interface CartItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchCart = async () => {
    const res = await fetch('/api/cart');
    if (res.ok) {
      const data = await res.json();
      setItems(data.cart?.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (productId: string) => {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.cart?.items || []);
    }
  };

  const handleCheckout = async () => {
    setChecking(true);
    const res = await fetch('/api/checkout', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } else {
      const data = await res.json();
      alert(data.error || 'Checkout failed');
    }
    setChecking(false);
  };

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="heading-1 mb-8">Your Cart</h1>

        {loading ? (
          <div className="text-center py-20">
            <p className="body-lg">Loading cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 card p-12">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="heading-3 mb-3">Your cart is empty</h2>
            <p className="body-sm mb-6">Browse our catalog and add some products.</p>
            <button onClick={() => router.push('/')} className="btn btn-primary">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.productId} className="card p-5 flex items-center gap-5 animate-fade-in">
                  <div
                    className="cat-placeholder cat-electronics w-16 h-16 rounded-lg text-xl shrink-0"
                  >
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="heading-3 text-base truncate">{item.name}</h3>
                    <p className="body-sm">
                      {formatPrice(item.unitPrice)} × {item.qty}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg" style={{ color: 'var(--accent-600)', fontFamily: 'var(--font-sora)' }}>
                      {formatPrice(item.unitPrice * item.qty)}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="btn btn-ghost btn-sm mt-1"
                      style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="heading-3 mb-6">Order Summary</h3>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex justify-between body-sm">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between body-sm">
                    <span>Shipping</span>
                    <span className="font-semibold" style={{ color: 'var(--success)' }}>Free</span>
                  </div>
                  <hr style={{ borderColor: 'var(--border-default)' }} />
                  <div className="flex justify-between">
                    <span className="heading-3">Total</span>
                    <span
                      className="heading-3"
                      style={{ color: 'var(--accent-600)' }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn btn-primary btn-lg w-full"
                  disabled={checking}
                >
                  {checking ? 'Processing...' : 'Checkout'}
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="btn btn-ghost w-full mt-3"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
