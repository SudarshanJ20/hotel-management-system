// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { auth } from "@/auth";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;

  const dashboardHref =
    role === "ADMIN" ? "/admin/dashboard" :
    role === "MANAGER" ? "/manager/dashboard" :
    "/";

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">HMS</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/rooms" className="hover:underline">Rooms</Link>
              <Link href="/bookings" className="hover:underline">Bookings</Link>
              <Link href="/guests" className="hover:underline">Guests</Link>
              {(role === "ADMIN" || role === "MANAGER") && (
                <Link href={dashboardHref} className="hover:underline">Dashboard</Link>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
