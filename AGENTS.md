<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ecommerce-microprompt -->
# Ecommerce App – Build Specification

## Stack
- **Framework**: Next.js (App Router – read `node_modules/next/dist/docs/` before coding)
- **Database**: MongoDB via native Node.js driver (`mongodb` package) – no Mongoose, no ORM
- **Payments**: Stripe (Checkout Sessions + Webhooks)
- **Design**: invoke the `frontend-design` skill for every UI component/page – aim for production-grade, distinctive UI
- **Images**: none – use placeholder text/icons/color blocks only

## Architecture

### Auth
- Simple session-based auth using a cookie (`httpOnly`, signed with `AUTH_SECRET`)
- Two roles: `admin` and `customer`
- Hardcode one admin user in the seed; customers self-register
- No third-party auth library – implement manually with `bcrypt` for passwords
- Use jose para jwt token

### MongoDB collections
| Collection | Key fields |
|----|----|
| `users` | `_id`, `email`, `passwordHash`, `role` (`admin`\|`customer`), `name`, `createdAt` |
| `products` | `_id`, `name`, `description`, `price` (cents), `stock`, `category`, `active` |
| `orders` | `_id`, `customerId`, `items` `[{productId, name, qty, unitPrice}]`, `total`, `status` (`pending`\|`paid`\|`shipped`\|`cancelled`), `stripeSessionId`, `createdAt` |
| `carts` | `_id`, `customerId`, `items` `[{productId, name, qty, unitPrice}]`, `updatedAt` |

All `_id` fields use MongoDB `ObjectId`. Use `mongo.ts` (or `lib/db.ts`) as a singleton client.

### Route structure
```
app/
  (public)/
    page.tsx                        ← landing / product catalog
    products/[id]/page.tsx          ← product detail
    login/page.tsx
    register/page.tsx
  (customer)/
    cart/page.tsx
    checkout/success/page.tsx
    checkout/cancel/page.tsx
    orders/page.tsx                 ← order history
  (admin)/
    admin/page.tsx                  ← dashboard summary
    admin/products/page.tsx         ← list + CRUD
    admin/products/new/page.tsx
    admin/products/[id]/edit/page.tsx
    admin/customers/page.tsx        ← list customers
    admin/orders/page.tsx           ← all orders with status update
api/
  auth/login/route.ts
  auth/logout/route.ts
  auth/register/route.ts
  cart/route.ts                     ← GET, POST (add item), DELETE (remove item)
  checkout/route.ts                 ← POST → create Stripe Checkout Session
  stripe/webhook/route.ts           ← handle payment_intent.succeeded
  admin/products/route.ts           ← GET list, POST create
  admin/products/[id]/route.ts      ← GET, PUT, DELETE
  admin/orders/[id]/route.ts        ← PUT (status update)
```

### Middleware, YA NO SE LLAMA middleware, se llama proxy.ts
`proxy.ts` at root: protect `/admin/*` (admin only) and `/cart`, `/orders` (customer only). Redirect unauthenticated users to `/login`.

## Stripe integration
- Use **Stripe Checkout** (hosted page), not Elements
- On order creation: create a `pending` order in MongoDB, then create a Checkout Session with `metadata: { orderId }`
- Webhook `checkout.session.completed` → update order status to `paid`, decrement product `stock`
- Environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Seed script
File: `scripts/seed.ts` (run with `npx tsx scripts/seed.ts`)

Seed must create:
- 1 admin user: `admin@shop.com` / `admin123`
- 5 customer users: `customer1@shop.com` … `customer5@shop.com` / `pass1234`
- 15 products across 3 categories (Electronics, Books, Home)
- 5 sample orders in various statuses (pending, paid, shipped)

## Design guidelines (for `frontend-design` skill)
- Dark sidebar for admin, light main area
- Customer-facing: clean, modern storefront feel – bold typography, clear CTAs
- Color palette: pick one accent color and stay consistent
- No images anywhere – use category-colored icon placeholders (CSS only)
- Mobile-responsive layouts

## Environment variables required
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ecommerce
AUTH_SECRET=<random 32-char string>
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your_publishable_key>
STRIPE_PUBLISHABLE_KEY=pk_test_<your_publishable_key>
STRIPE_SECRET_KEY=sk_test_<your_secret_key>
```

## Coding rules
1. Read the Next.js docs in `node_modules/next/dist/docs/` before using any API
2. All DB access goes through `lib/db.ts` singleton – never create a new `MongoClient` inline
3. All money values stored and computed in **cents** (integers) – format for display only at render time
4. API routes return `{ error: string }` on failure with the appropriate HTTP status
5. No `any` types – use proper TypeScript interfaces in `lib/types.ts`
6. Server Components fetch data directly from MongoDB; Client Components call API routes
7. Use `frontend-design` skill for every new page/component – do not write plain unstyled HTML

<!-- END:ecommerce-microprompt -->

