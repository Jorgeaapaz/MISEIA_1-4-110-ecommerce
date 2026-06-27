import { describe, it, expect } from 'vitest';
import { createToken, verifyToken, setAuthCookie } from '../../lib/auth';
import type { JWTPayload } from '../../lib/types';

const samplePayload: JWTPayload = {
  userId: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  role: 'customer',
  name: 'Test User',
};

describe('createToken', () => {
  it('returns a non-empty JWT string', async () => {
    const token = await createToken(samplePayload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
  });

  it('creates different tokens for different payloads', async () => {
    const t1 = await createToken(samplePayload);
    const t2 = await createToken({ ...samplePayload, email: 'other@example.com' });
    expect(t1).not.toBe(t2);
  });
});

describe('verifyToken', () => {
  it('returns the original payload for a valid token', async () => {
    const token = await createToken(samplePayload);
    const result = await verifyToken(token);
    expect(result).not.toBeNull();
    expect(result!.userId).toBe(samplePayload.userId);
    expect(result!.email).toBe(samplePayload.email);
    expect(result!.role).toBe(samplePayload.role);
    expect(result!.name).toBe(samplePayload.name);
  });

  it('returns null for an invalid token', async () => {
    const result = await verifyToken('invalid.token.here');
    expect(result).toBeNull();
  });

  it('returns null for an empty string', async () => {
    const result = await verifyToken('');
    expect(result).toBeNull();
  });

  it('returns null for a tampered token', async () => {
    const token = await createToken(samplePayload);
    const tampered = token.slice(0, -5) + 'XXXXX';
    const result = await verifyToken(tampered);
    expect(result).toBeNull();
  });
});

describe('setAuthCookie', () => {
  it('returns correct cookie structure', async () => {
    const token = await createToken(samplePayload);
    const cookie = setAuthCookie(token);
    expect(cookie.name).toBe('auth_token');
    expect(cookie.value).toBe(token);
    expect(cookie.options.httpOnly).toBe(true);
    expect(cookie.options.path).toBe('/');
    expect(typeof cookie.options.maxAge).toBe('number');
    expect(cookie.options.maxAge as number).toBeGreaterThan(0);
  });

  it('sets secure flag based on NODE_ENV', async () => {
    // secure flag reflects whether NODE_ENV === 'production'
    const token = await createToken(samplePayload);
    const cookie = setAuthCookie(token);
    // In test environment (NODE_ENV !== 'production'), secure should be false
    const expectedSecure = process.env.NODE_ENV === 'production';
    expect(cookie.options.secure).toBe(expectedSecure);
  });
});

describe('admin role token', () => {
  it('preserves admin role through token round-trip', async () => {
    const adminPayload: JWTPayload = { ...samplePayload, role: 'admin' };
    const token = await createToken(adminPayload);
    const result = await verifyToken(token);
    expect(result!.role).toBe('admin');
  });
});
