export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { Product } from '@/lib/types';
import Header from './components/Header';

function getCategoryClass(category: string): string {
  switch (category.toLowerCase()) {
    case 'electronics': return 'cat-electronics';
    case 'books': return 'cat-books';
    case 'home': return 'cat-home';
    default: return 'cat-electronics';
  }
}

function getCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'electronics': return '⚡';
    case 'books': return '📖';
    case 'home': return '🏠';
    default: return '📦';
  }
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function CatalogPage() {
  const db = await getDb();
  const products = await db.collection<Product>('products')
    .find({ active: true })
    .sort({ category: 1, name: 1 })
    .toArray();

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--accent-950) 0%, var(--accent-800) 50%, var(--accent-600) 100%)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="max-w-2xl animate-fade-in">
              <p
                className="label mb-4"
                style={{ color: 'var(--accent-300)' }}
              >
                Welcome to the store
              </p>
              <h1
                className="heading-1 mb-6"
                style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Quality products,<br />
                <span style={{ color: 'var(--accent-300)' }}>delivered fast.</span>
              </h1>
              <p className="text-lg mb-8" style={{ color: 'var(--accent-200)', lineHeight: 1.7 }}>
                Discover our curated selection of electronics, books, and home essentials.
                Free shipping on orders over $50.
              </p>
              <a href="#catalog" className="btn btn-lg" style={{
                background: '#fff',
                color: 'var(--accent-700)',
                fontWeight: 700,
              }}>
                Browse Catalog
              </a>
            </div>
          </div>
          {/* Decorative circle */}
          <div
            className="absolute -right-32 -top-32 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'var(--accent-300)' }}
          />
          <div
            className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full opacity-5"
            style={{ background: '#fff' }}
          />
        </section>

        {/* Catalog */}
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="heading-3 mb-2">No products available</p>
              <p className="body-lg">Check back soon for new arrivals.</p>
            </div>
          ) : (
            <>
              {/* Category filter pills */}
              <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2">
                <span className="label shrink-0">Categories:</span>
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className={`badge ${getCategoryClass(cat)} shrink-0`}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }}
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, i) => (
                  <Link
                    key={product._id.toString()}
                    href={`/products/${product._id.toString()}`}
                    className="card card-hover no-underline block"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className={`cat-placeholder ${getCategoryClass(product.category)} h-48 rounded-t-2xl text-4xl`}>
                      {getCategoryIcon(product.category)}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="heading-3 text-base">{product.name}</h3>
                        <span
                          className="text-lg font-bold shrink-0"
                          style={{ color: 'var(--accent-600)', fontFamily: 'var(--font-sora)' }}
                        >
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <p className="body-sm line-clamp-2 mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`badge ${getCategoryClass(product.category)}`}>
                          {product.category}
                        </span>
                        <span className="body-sm">
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Footer */}
        <footer
          className="border-t py-8 mt-8"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-primary)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="body-sm" style={{ color: 'var(--text-muted)' }}>
              VOLT Store &copy; 2026. Built with Next.js &amp; MongoDB.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
