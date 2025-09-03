import { SignJWT, jwtVerify } from 'jose';

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('Missing JWT_SECRET');
  return new TextEncoder().encode(s);
}

export async function createJWT(payload, exp = '7d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getSecret());
}

export async function verifyJWT(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload; // { sub, email, iat, exp, ... }
}