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
    if (pathname.startsWith("/admin")) {
      const role = token?.user?.role ?? token?.role;
      if (role !== "ADMIN") {
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
    "/dashboard/:path*", // legacy path, redirects to /admin/dashboard
    "/admin/:path*",     // protect admin area
  ],
};
