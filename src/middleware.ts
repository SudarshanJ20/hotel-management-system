// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token as any | undefined;
    const role: string | undefined = token?.user?.role ?? token?.role;

    // Redirect legacy /dashboard
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    // ADMIN-only
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = "/403";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    // User/self area
    const isMyArea = pathname === "/my" || pathname.startsWith("/my/");

    // Explicitly allow /bookings/new for all signed-in users
    const isBookingsNew = pathname === "/bookings/new";

    // If you want users to be able to see the booking detail after create, allow /bookings/:id
    // Set to false if detail pages must be staff-only.
    const isBookingsShow = /^\/bookings\/[^/]+$/.test(pathname);

    // Staff-only sections: /bookings and /guests, except the exemptions
    const staffRoots = ["/bookings", "/guests"];
    const isStaffArea = staffRoots.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    if (isStaffArea && !isMyArea && !isBookingsNew && !isBookingsShow) {
      if (!role || (role !== "ADMIN" && role !== "MANAGER")) {
        const url = req.nextUrl.clone();
        url.pathname = "/403";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    // Editing-only pages (staff)
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

    return NextResponse.next();
  },
  { pages: { signIn: "/login" } }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",

    // put explicit booking routes first
    "/bookings/new",
    "/bookings/:id/edit",
    "/bookings/:path*",

    // guests and rooms
    "/guests/new",
    "/guests/:id/edit",
    "/guests/:path*",
    "/rooms/new",
    "/rooms/:id/edit",

    "/manager/:path*",
    "/my/:path*",
  ],
};
