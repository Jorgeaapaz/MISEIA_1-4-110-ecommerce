export const dynamic = 'force-dynamic';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { Product } from '@/lib/types';
import Header from '@/app/components/Header';
import AddToCartButton from './AddToCartButton';

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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();

  let product: Product | null = null;
  try {
    product = await db.collection<Product>('products').findOne({ _id: new ObjectId(id) });
  } catch {
    // invalid ObjectId
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="heading-2 mb-4">Product Not Found</h1>
            <p className="body-lg mb-6">The product you are looking for does not exist.</p>
            <a href="/" className="btn btn-primary">Back to Store</a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-2 body-sm no-underline mb-8"
          style={{ color: 'var(--accent-600)' }}
        >
          ← Back to catalog
        </a>

        <div className="grid md:grid-cols-2 gap-12 animate-fade-in">
          {/* Product image placeholder */}
          <div
            className={`cat-placeholder ${getCategoryClass(product.category)} rounded-2xl`}
            style={{ height: '400px', fontSize: '6rem' }}
          >
            {getCategoryIcon(product.category)}
          </div>

          {/* Product info */}
          <div className="flex flex-col justify-center">
            <span className={`badge ${getCategoryClass(product.category)} mb-4 self-start`}>
              {product.category}
            </span>

            <h1 className="heading-1 mb-4">{product.name}</h1>

            <p
              className="text-4xl font-bold mb-6"
              style={{ color: 'var(--accent-600)', fontFamily: 'var(--font-sora)' }}
            >
              {formatPrice(product.price)}
            </p>

            <p className="body-lg mb-8">{product.description}</p>

            <div
              className="flex items-center gap-2 mb-8 p-3 rounded-lg"
              style={{ background: 'var(--neutral-100)' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: product.stock > 0 ? 'var(--success)' : 'var(--danger)',
                }}
              />
              <span className="body-sm" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
              </span>
            </div>

            <AddToCartButton
              productId={product._id.toString()}
              inStock={product.stock > 0}
            />
          </div>
        </div>
      </main>
    </>
  );
}
