// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token as any | undefined;

    // Redirect legacy /dashboard to the new admin dashboard
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    // Admin-only guard
    const role = token?.user?.role ?? token?.role;
    const adminOnly =
      pathname.startsWith("/admin") ||
      pathname === "/rooms/new" ||
      /^\/rooms\/[^/]+\/edit$/.test(pathname) ||
      pathname === "/api/rooms" ||           // POST create
      /^\/api\/rooms\/[^/]+$/.test(pathname); // GET one is ok, but PATCH/DELETE should be admin

    if (adminOnly) {
      if (!role || role !== "ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = "/403";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    // Tell NextAuth where to send unauthenticated users
    pages: { signIn: "/login" },
  }
);

// Only match what needs protection. Leave /login and /register public.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/rooms/new",
    "/rooms/:id/edit",
  ],
};

