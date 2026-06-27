export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';
import { getDb } from '@/lib/db';
import { Order } from '@/lib/types';
import Header from '@/app/components/Header';

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'pending': return 'badge-pending';
    case 'paid': return 'badge-paid';
    case 'shipped': return 'badge-shipped';
    case 'cancelled': return 'badge-cancelled';
    default: return 'badge-pending';
  }
}

export default async function OrdersPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');

  const db = await getDb();
  const orders = userId
    ? await db.collection<Order>('orders')
        .find({ customerId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray()
    : [];

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="heading-1 mb-8">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 card p-12">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="heading-3 mb-3">No orders yet</h2>
            <p className="body-sm mb-6">Start shopping to see your orders here.</p>
            <Link href="/" className="btn btn-primary no-underline">Browse Products</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order._id.toString()} className="card p-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="label mb-1">Order #{order._id.toString().slice(-8).toUpperCase()}</p>
                    <p className="body-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="heading-3" style={{ color: 'var(--accent-600)' }}>
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 body-sm">
                      <span>
                        {item.name} × {item.qty}
                      </span>
                      <span className="font-semibold">{formatPrice(item.unitPrice * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
