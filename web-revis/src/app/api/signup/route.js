import clientPromise from '../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({ message: 'Email and password are required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ message: 'Invalid email format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('sprintboard');
    const users = db.collection('users');

    // Ensure unique emails (no-op if it already exists)
    await users.createIndex({ email: 1 }, { unique: true });

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    const result = await users.insertOne({
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: now,
    });

    return Response.json({ ok: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    if (err?.code === 11000) {
      return Response.json({ message: 'Email already in use' }, { status: 409 });
    }
    console.error(err);
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
