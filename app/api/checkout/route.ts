import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';
import { getDb } from '@/lib/db';
import { Cart } from '@/lib/types';

// Lazy init — avoids module-load failure when env var is absent (e.g. during next build)
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' });
  }
  return _stripe;
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const customerId = new ObjectId(userId);
  const cart = await db.collection<Cart>('carts').findOne({ customerId });

  if (!cart || cart.items.length === 0) {
    return Response.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const total = cart.items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  // Create pending order
  const orderResult = await db.collection('orders').insertOne({
    customerId,
    items: cart.items,
    total,
    status: 'pending',
    stripeSessionId: null,
    createdAt: new Date(),
  });

  const orderId = orderResult.insertedId.toString();

  // Create Stripe Checkout session
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: cart.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: item.unitPrice,
      },
      quantity: item.qty,
    })),
    mode: 'payment',
    metadata: { orderId },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
  });

  // Update order with stripe session id
  await db.collection('orders').updateOne(
    { _id: orderResult.insertedId },
    { $set: { stripeSessionId: session.id } }
  );

  // Clear cart
  await db.collection('carts').deleteOne({ customerId });

  return Response.json({ url: session.url, sessionId: session.id });
}
