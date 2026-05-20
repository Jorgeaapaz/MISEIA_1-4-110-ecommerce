import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { Product } from '@/lib/types';

export async function GET(request: NextRequest) {
  const role = request.headers.get('x-user-role');
  if (role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = await getDb();
  const products = await db.collection<Product>('products').find().sort({ name: 1 }).toArray();
  return Response.json({ products });
}

export async function POST(request: NextRequest) {
  const role = request.headers.get('x-user-role');
  if (role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, price, stock, category } = body;

  if (!name || !description || price == null || stock == null || !category) {
    return Response.json({ error: 'All fields are required' }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection('products').insertOne({
    name,
    description,
    price: Math.round(price),
    stock: Math.round(stock),
    category,
    active: true,
  });

  return Response.json({ productId: result.insertedId.toString() }, { status: 201 });
}
