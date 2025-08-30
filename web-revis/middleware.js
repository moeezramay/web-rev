export function middleware(request) {
  // ...your middleware logic...
  return Response.next();
}

// OR

export default function middleware(request) {
  // ...your middleware logic...
  return Response.next();
}