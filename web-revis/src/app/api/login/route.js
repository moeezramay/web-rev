// src/app/api/login/route.js
import { cookies } from 'next/headers';
import clientPromise from '../../../lib/db';
import { createJWT } from '../../../lib/jwt';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('sprintboard'); // your DB name
    const user = await db.collection('users').findOne({ email });

    if (!user || user.password !== password) {
      return Response.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createJWT({ sub: user._id.toString(), email: user.email });
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
  } catch (err) {
    console.error(err);
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
