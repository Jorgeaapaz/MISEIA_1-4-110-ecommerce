import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';
import { getDb } from '@/lib/db';
import { Order } from '@/lib/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-03-25.dahlia' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: `Webhook verification failed: ${message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const db = await getDb();

      // Update order status to paid
      const order = await db.collection<Order>('orders').findOne({ _id: new ObjectId(orderId) });
      if (order) {
        await db.collection('orders').updateOne(
          { _id: new ObjectId(orderId) },
          { $set: { status: 'paid' } }
        );

        // Decrement product stock
        for (const item of order.items) {
          await db.collection('products').updateOne(
            { _id: item.productId },
            { $inc: { stock: -item.qty } }
          );
        }
      }
    }
  }

  return Response.json({ received: true });
}
