import Link from 'next/link';
import Header from '@/app/components/Header';

export default function CheckoutCancelPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md animate-fade-in">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            style={{ background: '#fee2e2' }}
          >
            ✕
          </div>
          <h1 className="heading-1 mb-4">Payment Cancelled</h1>
          <p className="body-lg mb-8">
            Your payment was cancelled. No charges were made. Your cart items are still saved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cart" className="btn btn-primary no-underline">
              Return to Cart
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
