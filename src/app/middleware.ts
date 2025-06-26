// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//     const pathname = request.nextUrl.pathname;
//     const token = request.cookies.get('token')?.value;
    
//     // Public routes
//     if (pathname.startsWith('/auth') || pathname === '/') {
//       if (token) {
//         return NextResponse.redirect(new URL('/dashboard', request.url));
//       }
//       return NextResponse.next();
//     }
    
//     // Protected routes
//     if (!token) {
//       return NextResponse.redirect(
//         new URL(`/auth/login?redirect=${pathname}`, request.url)
//       );
//     }
    
//     return NextResponse.next();
//   }











import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isAuthRoute = pathname.startsWith('/auth');
  const isPublicRoute = isAuthRoute || pathname === '/';

  // ✅ If token exists and user is trying to access auth page, redirect to dashboard
  if (isPublicRoute) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ✅ Protected route but no token, redirect to login with redirect back after login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Authenticated and accessing protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/admin/:path*","/dashboard/user/:path*",
    '/((?!_next/static|_next/image|favicon.ico|api/public).*)',
  ],
};
