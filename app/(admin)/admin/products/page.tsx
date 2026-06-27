'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  active: boolean;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const res = await fetch('/api/admin/products');
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(products.filter((p) => p._id !== id));
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentActive }),
    });
    if (res.ok) {
      setProducts(products.map((p) => p._id === id ? { ...p, active: !currentActive } : p));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-1 mb-2">Products</h1>
          <p className="body-lg">{products.length} products in catalog</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary no-underline">
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="body-lg">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="heading-3 mb-4">No products yet</p>
          <Link href="/admin/products/new" className="btn btn-primary no-underline">
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="font-semibold">{product.name}</td>
                  <td>
                    <span className={`badge cat-${product.category.toLowerCase()}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="font-semibold">{formatPrice(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      onClick={() => toggleActive(product._id, product.active)}
                      className={`badge cursor-pointer border-none ${product.active ? 'badge-active' : 'badge-inactive'}`}
                    >
                      {product.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product._id}/edit`}
                        className="btn btn-ghost btn-sm no-underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
