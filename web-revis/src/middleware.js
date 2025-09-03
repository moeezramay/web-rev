import { NextResponse } from 'next/server'; 
import { verifyJWT } from '@/lib/jwt';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/app/')) {
    const jwt = req.cookies.get('jwt')?.value;
    console.log("token:", jwt)
    if (!jwt) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const payload = verifyJWT(jwt);
      req.user = payload;
    } catch (err) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}
