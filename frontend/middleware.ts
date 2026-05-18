import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware runs on the Edge runtime (no access to localStorage).
 * We check for the `barber_token` cookie which the login page sets
 * in addition to localStorage.
 *
 * The dashboard page also performs a client-side guard as a second
 * safety layer for cases where the cookie is absent but localStorage
 * still has a token (e.g. after a hard-refresh without the cookie).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isOnDashboard = pathname.startsWith("/dashboard");
  const isOnLoginPage = pathname === "/dashboard/login";

  // Allow the login page through unconditionally
  if (isOnLoginPage) {
    return NextResponse.next();
  }

  // Protect all other /dashboard routes
  if (isOnDashboard) {
    const token = request.cookies.get("barber_token")?.value;
    if (!token) {
      const loginUrl = new URL("/dashboard/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
