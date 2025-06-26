import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const token = request.cookies.get('token')?.value;
    
    // Public routes
    if (pathname.startsWith('/auth') || pathname === '/') {
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }
    
    // Protected routes
    if (!token) {
      return NextResponse.redirect(
        new URL(`/auth/login?redirect=${pathname}`, request.url)
      );
    }
    
    return NextResponse.next();
  }








