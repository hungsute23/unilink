/**
 * Next.js Proxy — Route Protection & Authentication
 *
 * Next.js 16 renamed `middleware.ts` → `proxy.ts` and `middleware()` → `proxy()`.
 *
 * Responsibilities:
 *  1. Read the Appwrite session cookie.
 *  2. Redirect unauthenticated users away from protected routes.
 *  3. Provide a clean hook for future role-based access control (RBAC).
 *
 * Protected route map:
 *  /dashboard*      → Business Partner  — requires auth
 *  /school-portal*  → School Partner    — requires auth + school role (TODO)
 *  /student-portal* → Student           — requires auth + student role (TODO)
 *  /portal*         → Super Admin       — requires auth + admin role (TODO)
 */

import { type NextRequest, NextResponse } from "next/server";

// ─── Route Config ─────────────────────────────────────────────────────────────

/** Routes that require the user to be authenticated */
const PROTECTED_ROUTES = [
  "/dashboard",    // Business partner portal
  "/school-portal", // School partner portal
  "/student-portal", // Student web portal
  "/portal",       // Super admin portal
];

/** Role-to-route mapping — used for RBAC once role cookies are in place */
// const ADMIN_ONLY_ROUTES   = ["/portal"];
// const SCHOOL_ONLY_ROUTES  = ["/school-portal"];
// const STUDENT_ONLY_ROUTES = ["/student-portal"];
// const BUSINESS_ONLY_ROUTES = ["/dashboard"];

/** Where to send unauthenticated users */
const LOGIN_URL = "/login";

const AUTH_ROUTES = [
  "/login",
  "/register"
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the request has a valid-looking Appwrite session cookie.
 * A full server-side verification (e.g. calling account.get()) should be done
 * inside the page/layout when you need guaranteed authenticity.
 */
function hasSessionCookie(request: NextRequest): boolean {
  const sessionCookie = request.cookies
    .getAll()
    .find((c) => c.name.startsWith("a_session_"));

  return !!sessionCookie?.value;
}

/**
 * Returns true if the pathname starts with any of the given prefixes.
 */
function matchesRoutes(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasSessionCookie(request);

  // ── 1. Unauthenticated access to protected routes ──────────────────────────
  if (matchesRoutes(pathname, PROTECTED_ROUTES) && !isAuthenticated) {
    const loginUrl = new URL(LOGIN_URL, request.url);
    // Preserve the originally requested URL so we can redirect back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 1.b. Authenticated access to auth routes ───────────────────────────────
  if (matchesRoutes(pathname, AUTH_ROUTES) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ── 2. Role-based access control (RBAC) hook ───────────────────────────────
  // TODO: After login, store the user's role in a secure cookie (e.g. a signed JWT).
  // Then decode it here and enforce per-portal access.
  //
  // Role → Allowed portal:
  //   "admin"   → /portal
  //   "school"  → /school-portal
  //   "student" → /student-portal
  //   "business"→ /dashboard
  //
  // Example (pseudocode):
  // const role = getRoleFromCookie(request);
  // if (pathname.startsWith("/portal") && role !== "admin") {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
  // if (pathname.startsWith("/school-portal") && role !== "school") {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // ── 3. Allow request to continue ──────────────────────────────────────────
  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Run middleware on all paths EXCEPT:
     *  - Next.js internals (_next/static, _next/image)
     *  - Public static files (favicon.ico, images, etc.)
     *  - API routes (/api/*)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
