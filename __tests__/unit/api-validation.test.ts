/**
 * Unit tests for API route input validation logic.
 * Tests the validation rules that guard each route, using mocked DB.
 */
import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next/server for tests
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual };
});

// Mock the DB module — no real MongoDB needed for validation tests
vi.mock('../../lib/db', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(null),
      insertOne: vi.fn().mockResolvedValue({ insertedId: { toString: () => '507f1f77bcf86cd799439011' } }),
      updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    }),
  }),
}));

function makeRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login — validation', () => {
  it('returns 400 when email is missing', async () => {
    const { POST } = await import('../../app/api/auth/login/route');
    const req = makeRequest({ password: 'test123' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns 400 when password is missing', async () => {
    const { POST } = await import('../../app/api/auth/login/route');
    const req = makeRequest({ email: 'user@test.com' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 for non-existent user', async () => {
    const { POST } = await import('../../app/api/auth/login/route');
    const req = makeRequest({ email: 'noone@test.com', password: 'pass' });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/invalid credentials/i);
  });
});

describe('POST /api/auth/register — validation', () => {
  it('returns 400 when name is missing', async () => {
    const { POST } = await import('../../app/api/auth/register/route');
    const req = makeRequest({ email: 'new@test.com', password: 'pass123' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns 400 when email is missing', async () => {
    const { POST } = await import('../../app/api/auth/register/route');
    const req = makeRequest({ name: 'Test', password: 'pass123' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const { POST } = await import('../../app/api/auth/register/route');
    const req = makeRequest({ name: 'Test', email: 'new@test.com' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/cart — auth check', () => {
  it('returns 401 when x-user-id header is missing', async () => {
    const { GET } = await import('../../app/api/cart/route');
    const req = new NextRequest('http://localhost/api/cart', { method: 'GET' });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });
});

describe('POST /api/cart — validation', () => {
  it('returns 401 when x-user-id header is missing', async () => {
    const { POST } = await import('../../app/api/cart/route');
    const req = makeRequest({ productId: '507f1f77bcf86cd799439011', qty: 1 });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when productId is missing', async () => {
    const { POST } = await import('../../app/api/cart/route');
    const req = makeRequest({ qty: 1 }, { 'x-user-id': '507f1f77bcf86cd799439011' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns 400 when qty is less than 1', async () => {
    const { POST } = await import('../../app/api/cart/route');
    const req = makeRequest(
      { productId: '507f1f77bcf86cd799439011', qty: 0 },
      { 'x-user-id': '507f1f77bcf86cd799439011' }
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/cart — validation', () => {
  it('returns 401 when unauthenticated', async () => {
    const { DELETE } = await import('../../app/api/cart/route');
    const req = makeRequest({ productId: '507f1f77bcf86cd799439011' });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when productId is missing', async () => {
    const { DELETE } = await import('../../app/api/cart/route');
    const req = makeRequest({}, { 'x-user-id': '507f1f77bcf86cd799439011' });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });
});
