import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { getDb } from '@/lib/db';
import { createToken, setAuthCookie } from '@/lib/auth';
import { User } from '@/lib/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection<User>('users').findOne({ email });

  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await createToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const cookie = setAuthCookie(token);

  return new Response(
    JSON.stringify({
      user: { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${cookie.name}=${cookie.value}; HttpOnly; Path=/; Max-Age=${cookie.options.maxAge}; SameSite=Lax`,
      },
    }
  );
}
