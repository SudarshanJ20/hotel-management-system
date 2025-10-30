// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token as any | undefined;

    if (pathname.startsWith("/admin")) {
      const role = token?.user?.role || token?.role; // cover both shapes
      if (role !== "ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = "/403";
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  },
  { pages: { signIn: "/login" } }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
