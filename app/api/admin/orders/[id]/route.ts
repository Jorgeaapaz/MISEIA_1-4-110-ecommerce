import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = request.headers.get('x-user-role');
  if (role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const validStatuses = ['pending', 'paid', 'shipped', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection('orders').updateOne(
    { _id: new ObjectId(id) },
    { $set: { status } }
  );

  if (result.matchedCount === 0) {
    return Response.json({ error: 'Order not found' }, { status: 404 });
  }

  return Response.json({ success: true });
}
