// /api/login/route.js
import { cookies } from 'next/headers';
import { createJWT } from '@/lib/jwt';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const ok = email === 'moeez@gmail.com' && password === 'police15SA';
    if (!ok) {
      return Response.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createJWT({ sub: email });

    // Set the JWT cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'jwt',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({ ok: true });

  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
