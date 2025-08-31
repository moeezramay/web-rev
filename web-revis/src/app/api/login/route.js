import { cookies } from 'next/headers';
import clientPromise from '../../../lib/db';
import { createJWT } from '../../../lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const emailNorm = email.trim().toLowerCase();

    const client = await clientPromise;
    const db = client.db('sprintboard');
    const users = db.collection('users');

    // Only fetch what we need
    const user = await users.findOne(
      { email: emailNorm },
      { projection: { _id: 1, email: 1, passwordHash: 1 } }
    );

    // Compare plaintext password with stored hash
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!valid) {
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
