import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { Cart, Product } from '@/lib/types';

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const cart = await db.collection<Cart>('carts').findOne({ customerId: new ObjectId(userId) });

  return Response.json({ cart: cart || { items: [] } });
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, qty } = await request.json();
  if (!productId || !qty || qty < 1) {
    return Response.json({ error: 'productId and qty are required' }, { status: 400 });
  }

  const db = await getDb();
  const product = await db.collection<Product>('products').findOne({ _id: new ObjectId(productId), active: true });

  if (!product) {
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }

  if (product.stock < qty) {
    return Response.json({ error: 'Insufficient stock' }, { status: 400 });
  }

  const customerId = new ObjectId(userId);
  const cart = await db.collection<Cart>('carts').findOne({ customerId });

  if (cart) {
    const existingItem = cart.items.find((item) => item.productId.toString() === productId);
    if (existingItem) {
      await db.collection('carts').updateOne(
        { customerId, 'items.productId': new ObjectId(productId) },
        { $set: { 'items.$.qty': existingItem.qty + qty, 'items.$.unitPrice': product.price, updatedAt: new Date() } }
      );
    } else {
      await db.collection('carts').updateOne(
        { customerId },
        {
          $push: { items: { productId: new ObjectId(productId), name: product.name, qty, unitPrice: product.price } as never },
          $set: { updatedAt: new Date() },
        }
      );
    }
  } else {
    await db.collection('carts').insertOne({
      customerId,
      items: [{ productId: new ObjectId(productId), name: product.name, qty, unitPrice: product.price }],
      updatedAt: new Date(),
    });
  }

  const updatedCart = await db.collection<Cart>('carts').findOne({ customerId });
  return Response.json({ cart: updatedCart });
}

export async function DELETE(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return Response.json({ error: 'productId is required' }, { status: 400 });
  }

  const db = await getDb();
  const customerId = new ObjectId(userId);

  await db.collection('carts').updateOne(
    { customerId },
    {
      $pull: { items: { productId: new ObjectId(productId) } as never },
      $set: { updatedAt: new Date() },
    }
  );

  const updatedCart = await db.collection<Cart>('carts').findOne({ customerId });
  return Response.json({ cart: updatedCart || { items: [] } });
}
