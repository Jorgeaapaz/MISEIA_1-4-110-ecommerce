import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_SECRET = process.env.AUTH_SECRET || 'default_secret_change_me_32chars';
const secret = new TextEncoder().encode(AUTH_SECRET);

async function getTokenPayload(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; email: string; role: string; name: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    const payload = await getTokenPayload(request);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-name', payload.name);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Customer routes protection — success/cancel are public Stripe return URLs
  const isStripeReturn = pathname === '/checkout/success' || pathname === '/checkout/cancel';
  if (!isStripeReturn && (pathname.startsWith('/cart') || pathname.startsWith('/orders') || pathname.startsWith('/checkout'))) {
    const payload = await getTokenPayload(request);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-name', payload.name);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // API routes - pass user info if authenticated
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/stripe/')) {
    const payload = await getTokenPayload(request);
    if (payload) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-name', payload.name);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/cart/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/api/:path*',
  ],
};
