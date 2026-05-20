import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { getDb } from '@/lib/db';
import { createToken, setAuthCookie } from '@/lib/auth';
import { User } from '@/lib/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return Response.json({ error: 'Name, email, and password are required' }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.collection<User>('users').findOne({ email });

  if (existing) {
    return Response.json({ error: 'Email already registered' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db.collection('users').insertOne({
    email,
    passwordHash,
    role: 'customer',
    name,
    createdAt: new Date(),
  });

  const token = await createToken({
    userId: result.insertedId.toString(),
    email,
    role: 'customer',
    name,
  });

  const cookie = setAuthCookie(token);

  return new Response(
    JSON.stringify({
      user: { id: result.insertedId.toString(), email, role: 'customer', name },
    }),
    {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${cookie.name}=${cookie.value}; HttpOnly; Path=/; Max-Age=${cookie.options.maxAge}; SameSite=Lax`,
      },
    }
  );
}
