import { getDb } from '@/lib/db';
import { User } from '@/lib/types';

export default async function AdminCustomersPage() {
  const db = await getDb();
  const customers = await db.collection<User>('users')
    .find({ role: 'customer' })
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="heading-1 mb-2">Customers</h1>
        <p className="body-lg">{customers.length} registered customers</p>
      </div>

      {customers.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="heading-3 mb-2">No customers yet</p>
          <p className="body-sm">Customers will appear here after they register.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id.toString()}>
                  <td className="font-semibold">{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>
                    {new Date(customer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {customer._id.toString().slice(-8)}
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
