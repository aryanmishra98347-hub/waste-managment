import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Middleware routing handles server-side headers and path checks
  // Full client-side role checks are enforced in layouts as well
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/citizen/:path*',
    '/admin/:path*',
  ],
};
