// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token as any | undefined;
    const role: string | undefined = token?.user?.role ?? token?.role;

    // Redirect legacy /dashboard to the new admin dashboard
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    // ADMIN-only section
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = "/403";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    // Pages where ADMIN or MANAGER can access (UI editing pages)
    const privilegedPages =
      pathname === "/rooms/new" ||
      /^\/rooms\/[^/]+\/edit$/.test(pathname) ||
      pathname === "/guests/new" ||
      /^\/guests\/[^/]+\/edit$/.test(pathname) ||
      /^\/bookings\/[^/]+\/edit$/.test(pathname);

    if (privilegedPages) {
      if (!role || (role !== "ADMIN" && role !== "MANAGER")) {
        const url = req.nextUrl.clone();
        url.pathname = "/403";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    // Default allow
    return NextResponse.next();
  },
  {
    // NextAuth sign-in page for unauthenticated users
    pages: { signIn: "/login" },
  }
);

// Only match what needs protection. Keep /login and public pages free.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/rooms/new",
    "/rooms/:id/edit",
    "/guests/new",
    "/guests/:id/edit",
    "/bookings/:id/edit",
    "/manager/:path*",
  ],
};
