'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Electronics',
    active: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/admin/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          name: data.product.name,
          description: data.product.description,
          price: (data.product.price / 100).toFixed(2),
          stock: data.product.stock.toString(),
          category: data.product.category,
          active: data.product.active,
        });
      }
      setFetching(false);
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: Math.round(parseFloat(form.price) * 100),
        stock: parseInt(form.stock),
        category: form.category,
        active: form.active,
      }),
    });

    if (res.ok) {
      router.push('/admin/products');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to update product');
    }

    setLoading(false);
  };

  if (fetching) {
    return <div className="py-20 text-center"><p className="body-lg">Loading product...</p></div>;
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <button onClick={() => router.back()} className="btn btn-ghost btn-sm mb-6" style={{ color: 'var(--accent-600)' }}>
        ← Back to products
      </button>

      <h1 className="heading-1 mb-8">Edit Product</h1>

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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="active" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Active (visible in store)
            </label>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn btn-primary btn-lg flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
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
