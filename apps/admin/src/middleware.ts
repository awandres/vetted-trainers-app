import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/access-expired"];

// API routes that should be accessible without auth (for login, etc.)
const PUBLIC_API_ROUTES = ["/api/auth", "/api/debug"];

// Portal routes (for members only)
const PORTAL_ROUTES = ["/portal"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session token (Better Auth uses this cookie)
  const sessionToken = request.cookies.get("better-auth.session_token");

  // If no session, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    // Optionally add redirect back URL
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Note: Role-based access is enforced at the page level since we can't
  // query the database in Edge middleware. The portal layout handles
  // redirects for non-members trying to access portal routes.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
};
