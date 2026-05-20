import { getDb } from '@/lib/db';
import { Order, Product, User } from '@/lib/types';

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminDashboard() {
  const db = await getDb();

  const [totalProducts, totalOrders, totalCustomers, orders, recentOrders] = await Promise.all([
    db.collection<Product>('products').countDocuments(),
    db.collection<Order>('orders').countDocuments(),
    db.collection<User>('users').countDocuments({ role: 'customer' }),
    db.collection<Order>('orders').find().toArray(),
    db.collection<Order>('orders').find().sort({ createdAt: -1 }).limit(5).toArray(),
  ]);

  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: '💰', color: 'var(--success)' },
    { label: 'Total Orders', value: totalOrders.toString(), icon: '🧾', color: 'var(--accent-500)' },
    { label: 'Products', value: totalProducts.toString(), icon: '📦', color: 'var(--warning)' },
    { label: 'Customers', value: totalCustomers.toString(), icon: '👥', color: 'var(--info)' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="heading-1 mb-2">Dashboard</h1>
        <p className="body-lg">Overview of your store performance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="label">{stat.label}</span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Pending orders alert */}
      {pendingOrders > 0 && (
        <div
          className="p-4 rounded-xl mb-8 flex items-center gap-3"
          style={{ background: '#fef3c7', border: '1px solid #fde68a' }}
        >
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-medium" style={{ color: '#92400e' }}>
            You have {pendingOrders} pending order{pendingOrders > 1 ? 's' : ''} that need attention.
          </p>
        </div>
      )}

      {/* Recent orders */}
      <div className="card">
        <div className="p-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <h2 className="heading-3">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="body-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id.toString()}>
                    <td className="font-mono text-xs">#{order._id.toString().slice(-8).toUpperCase()}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                    <td className="font-semibold">{formatPrice(order.total)}</td>
                    <td>
                      <span className={`badge badge-${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
