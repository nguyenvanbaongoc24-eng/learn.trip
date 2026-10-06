import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle old /admin route -> redirect to /cms
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace("/admin", "/cms");
    return NextResponse.redirect(url);
  }

  // Check if route is a CMS page or CMS API
  const isCmsPage = pathname.startsWith("/cms");
  const isCmsApi = pathname.startsWith("/api/cms");
  const isCmsLoginPage = pathname === "/cms/login";

  if (!isCmsPage && !isCmsApi) {
    // Regular learner routes (/, /api/ai-generate, etc.) - allowed
    return NextResponse.next();
  }

  // Extract session token from HTTP-only cookie
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = await verifySessionToken(token);

  // If visiting /cms/login:
  if (isCmsLoginPage) {
    // If already logged in as staff, redirect straight to /cms
    if (sessionUser && isStaffRole(sessionUser.role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/cms";
      return NextResponse.redirect(url);
    }
    // Otherwise allow viewing login page
    return NextResponse.next();
  }

  // Case 1: Unauthenticated
  if (!sessionUser) {
    if (isCmsApi) {
      return NextResponse.json({ error: "Không tìm thấy tài nguyên." }, { status: 404 });
    }
    // Redirect unauthenticated staff to CMS login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/cms/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Case 2: Authenticated but NOT Staff (role === "learner")
  if (!isStaffRole(sessionUser.role)) {
    if (isCmsApi) {
      return NextResponse.json({ error: "Không tìm thấy tài nguyên." }, { status: 404 });
    }
    // Return 404 without revealing CMS existence
    const notFoundUrl = req.nextUrl.clone();
    notFoundUrl.pathname = "/not-found";
    return NextResponse.rewrite(notFoundUrl, { status: 404 });
  }

  // Case 3: Staff (creator, reviewer, admin) -> Allow access
  const response = NextResponse.next();
  // Pass user role in header for server components if needed
  response.headers.set("x-user-role", sessionUser.role);
  response.headers.set("x-user-id", sessionUser.id);
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/cms/:path*",
    "/cms",
    "/api/cms/:path*",
  ],
};
