'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({
  productId,
  inStock,
}: {
  productId: string;
  inStock: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAdd = async () => {
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty }),
    });

    if (res.ok) {
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } else if (res.status === 401) {
      router.push('/login');
    } else {
      const data = await res.json();
      setMessage(data.error || 'Failed to add');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label className="body-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          Qty:
        </label>
        <div className="flex items-center border rounded-lg" style={{ borderColor: 'var(--border-default)' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
          >
            −
          </button>
          <span className="px-4 font-semibold text-sm">{qty}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setQty(qty + 1)}
          >
            +
          </button>
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg w-full"
        onClick={handleAdd}
        disabled={!inStock || loading}
        style={{ opacity: (!inStock || loading) ? 0.5 : 1 }}
      >
        {loading ? 'Adding...' : !inStock ? 'Out of Stock' : 'Add to Cart'}
      </button>

      {message && (
        <p
          className="text-sm font-medium text-center py-2 rounded-lg animate-fade-in"
          style={{
            background: message.includes('Added') ? '#d1fae5' : '#fee2e2',
            color: message.includes('Added') ? '#065f46' : '#991b1b',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
