import Link from 'next/link';
import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import Header from '@/app/components/Header';
import { getDb } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

async function fulfillOrder(sessionId: string): Promise<void> {
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return;
  }

  if (session.payment_status !== 'paid') return;

  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const db = await getDb();
  const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });

  if (!order || order.status !== 'pending') return;

  await db.collection('orders').updateOne(
    { _id: new ObjectId(orderId) },
    { $set: { status: 'paid', stripeSessionId: session.id } }
  );

  for (const item of order.items) {
    await db.collection('products').updateOne(
      { _id: item.productId },
      { $inc: { stock: -item.qty } }
    );
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (session_id) {
    await fulfillOrder(session_id);
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md animate-fade-in">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            style={{ background: '#d1fae5' }}
          >
            ✓
          </div>
          <h1 className="heading-1 mb-4">Payment Successful!</h1>
          <p className="body-lg mb-8">
            Thank you for your order. You will receive a confirmation soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders" className="btn btn-primary no-underline">
              View Orders
            </Link>
            <Link href="/" className="btn btn-secondary no-underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
