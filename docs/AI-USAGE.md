# AI Assistance Documentation

This project was developed using **Claude Code (claude-sonnet-4-6)** as an AI pair programmer during a single build session on 2026-04-22. This document records what was AI-generated and what critical changes were applied based on review of `RETROSPECTIVA-2026-04-22.md`.

---

## Summary

The full application scaffold was generated with AI assistance. However, four critical issues in the AI drafts were identified and corrected during the session — none of which were obvious from reading the spec alone.

---

## Critical Corrections to AI Drafts

### 1. Stripe API Version — Wrong Version String

**AI Draft:** The Stripe client was initialized without an explicit `apiVersion`, defaulting to an outdated version string `"2025-03-31.basil"` that is not valid for Stripe SDK v22.

**Issue Found:** Build/runtime error — `"2025-03-31.basil"` is not a recognized API version for `stripe@22`.

**Change Applied:** Updated to `"2026-03-25.dahlia"` — the version expected by the installed SDK.

```typescript
// AI draft (wrong):
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Fixed:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});
```

**Why it matters:** Wrong API version causes runtime exceptions on every Stripe API call. The AI had stale training data on the SDK version.

---

### 2. Next.js 16 Breaking Changes — `middleware.ts` → `proxy.ts`

**AI Draft:** Generated a `middleware.ts` file at the project root following the standard Next.js convention for route protection.

**Issue Found:** Next.js 16 renamed the middleware convention to `proxy.ts` with a `proxy()` export function. The `middleware.ts` file is silently ignored in Next.js 16.

**Change Applied:** Renamed file to `proxy.ts` and changed the export from `export function middleware()` to `export function proxy()`.

```typescript
// AI draft (ignored by Next.js 16):
// middleware.ts
export function middleware(request: NextRequest) { ... }

// Fixed:
// proxy.ts
export function proxy(request: NextRequest) { ... }
```

**Why it matters:** With the wrong filename, ALL routes were unprotected — admin panel was publicly accessible without authentication.

---

### 3. Next.js 16 Async APIs — `params` and `cookies()`

**AI Draft:** Route handlers with dynamic segments accessed `params.id` synchronously, and `getSession()` called `cookies()` synchronously.

**Issue Found:** In Next.js 16, both `params` in route handlers and `cookies()` from `next/headers` are now Promises — synchronous access throws a runtime error.

**Change Applied:** Added `await` to both.

```typescript
// AI draft (throws in Next.js 16):
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;  // ❌ TypeError: params is a Promise
}

// Fixed:
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // ✅
}

// Also in lib/auth.ts:
// AI draft: const token = cookies().get(COOKIE_NAME);  ❌
// Fixed:   const token = (await cookies()).get(COOKIE_NAME);  ✅
```

**Why it matters:** Every dynamic API route and the auth session reader were broken. This affected cart, product detail, order, and all admin endpoints.

---

### 4. Stripe Webhook — `localhost` Not Reachable + Success Page Redirect Loop

**AI Draft:** The checkout success page was a simple static page. The webhook handler at `/api/stripe/webhook` was the only mechanism to mark orders as `paid`.

**Issue Found — Problem 1:** Stripe webhooks require a publicly accessible URL. In local development, `localhost:3000` is unreachable from Stripe's servers. Orders remained perpetually `pending` after successful payment.

**Issue Found — Problem 2:** The AI draft had `proxy.ts` protecting `/checkout/success`. Stripe Checkout uses internal iframes during redirect — with `SameSite=Lax` cookies, the auth cookie is not sent in cross-site frames, so the proxy redirected to `/login`, producing a `chrome-error://chromewebdata/` error in the browser.

**Change Applied:**
1. Exempted `/checkout/success` and `/checkout/cancel` from auth protection in `proxy.ts` (they are public confirmation pages with no sensitive data).
2. Made `/checkout/success` a Server Component that verifies payment status directly via the Stripe API using `?session_id=` from the URL, then idempotently marks the order `paid` in MongoDB.

```typescript
// proxy.ts — AI draft (blocked Stripe redirect):
const protectedPaths = ['/cart', '/orders', '/checkout'];

// Fixed — exempt success/cancel:
const protectedPaths = ['/cart', '/orders'];
// /checkout/success and /checkout/cancel explicitly excluded

// success/page.tsx — AI draft (passive page, relied only on webhook):
export default function SuccessPage() {
  return <div>Payment successful!</div>;
}

// Fixed — active verification fallback:
export default async function SuccessPage({ searchParams }) {
  const { session_id } = await searchParams;
  if (session_id) {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid' && session.metadata?.orderId) {
      await db.collection('orders').updateOne(
        { _id: new ObjectId(session.metadata.orderId), status: 'pending' },
        { $set: { status: 'paid' } }
      );
    }
  }
  return <SuccessUI />;
}
```

**Why it matters:** Without this fix, 100% of local development checkouts would show "pending" orders forever. The Stripe webhook remains the production path; the success page fallback makes local development viable.

---

## Lessons Learned

1. **AI drafts lag on breaking changes.** Next.js 16 has multiple breaking changes (`proxy.ts`, async `params`, async `cookies`) that the AI did not know about. Always cross-check against `node_modules/next/dist/docs/` for the installed version.

2. **AI doesn't model deployment constraints.** The webhook/localhost problem is a deployment reality, not a code bug — AI generates code that works in an idealized environment but misses operational constraints like "Stripe can't reach localhost."

3. **Security assumptions in AI drafts need explicit review.** The proxy protecting the success/cancel pages seemed correct from a security standpoint but broke the payment flow. The AI correctly identified those pages as "part of checkout" but didn't model the Stripe iframe redirect mechanism.

---

## What Was NOT Changed

The following AI-generated code required no corrections and was accepted as-is:
- `lib/db.ts` (MongoDB singleton pattern)
- `lib/types.ts` (TypeScript interfaces)
- `scripts/seed.ts` (database seeding logic)
- Admin dashboard layout and CRUD pages
- Cart and order API route logic (once params/cookies were fixed)
- Tailwind CSS design system in `globals.css`
