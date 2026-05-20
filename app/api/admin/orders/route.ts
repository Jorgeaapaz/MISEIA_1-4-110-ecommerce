import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { Order } from '@/lib/types';

export async function GET(request: NextRequest) {
  const role = request.headers.get('x-user-role');
  if (role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = await getDb();
  const orders = await db.collection<Order>('orders').find().sort({ createdAt: -1 }).toArray();
  return Response.json({ orders });
}
