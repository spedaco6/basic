import { decodeJwt } from 'jose';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { RefreshTokenPayload } from './lib/server/tokens';

const adminRoutes = ["/auth/users", "/auth/diagnostics"];

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh");
  if (!refreshToken) return NextResponse.redirect(new URL('/login', request.url));
  const { userRole } = decodeJwt<RefreshTokenPayload>(refreshToken.value);
  const pathname = new URL(request.url).pathname;
  
  // protect admin routes from other authorized users
  if (userRole >= 30 && adminRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/dashboard", request.url));
  }
}
 
// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }
 
export const config = {
  matcher: '/auth/(.*)',
}