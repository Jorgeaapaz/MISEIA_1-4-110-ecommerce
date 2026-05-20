'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Electronics',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: Math.round(parseFloat(form.price) * 100),
        stock: parseInt(form.stock),
        category: form.category,
      }),
    });

    if (res.ok) {
      router.push('/admin/products');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create product');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <button onClick={() => router.back()} className="btn btn-ghost btn-sm mb-6" style={{ color: 'var(--accent-600)' }}>
        ← Back to products
      </button>

      <h1 className="heading-1 mb-8">New Product</h1>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="text-sm font-medium px-4 py-3 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
              {error}
            </div>
          )}

          <div>
            <label className="label block mb-2">Product Name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label block mb-2">Description</label>
            <textarea
              className="input"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label block mb-2">Stock</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label block mb-2">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Home">Home</option>
            </select>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn btn-primary btn-lg flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn btn-secondary btn-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
