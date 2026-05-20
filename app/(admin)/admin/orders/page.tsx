'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

interface Order {
  _id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const statusOptions = ['pending', 'paid', 'shipped', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders(orders.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="heading-1 mb-2">Orders</h1>
        <p className="body-lg">{orders.length} total orders</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="body-lg">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="heading-3 mb-2">No orders yet</p>
          <p className="body-sm">Orders will appear here as customers make purchases.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="label mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="body-sm">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="heading-3" style={{ color: 'var(--accent-600)' }}>
                    {formatPrice(order.total)}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="input"
                    style={{
                      width: 'auto',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 body-sm">
                    <span>{item.name} × {item.qty}</span>
                    <span className="font-semibold">{formatPrice(item.unitPrice * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
