// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const user = session?.user as any | undefined;
  const name = user?.name || user?.email || "Account";
  const role = user?.role || "USER";
  const isAdmin = role === "ADMIN";
  const avatar =
    user?.image ||
    "https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff";

  // Close menu when navigating
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/rooms", label: "Rooms" },
    { href: "/bookings", label: "Bookings" },
    { href: "/guests", label: "Guests" },
    // Only show Dashboard in top nav for admins
    ...(isAdmin ? [{ href: "/admin/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-black/60 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-white text-lg tracking-tight">
          HMS
        </Link>

        <nav className="hidden md:flex gap-6">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  active ? "text-cyan-300" : "text-white/80 hover:text-cyan-300"
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: auth */}
        <div className="flex items-center gap-2">
          {status === "loading" && (
            <div className="h-9 w-28 rounded bg-white/10 animate-pulse" />
          )}

          {status !== "loading" && !user && (
            <>
              <Button asChild className="h-9 px-3 text-sm bg-white/10 hover:bg-white/15">
                <Link href="/register">Register</Link>
              </Button>
              <Button asChild className="h-9 px-3 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white">
                <Link href="/login">
                  <LogIn className="size-4 mr-2" /> Login
                </Link>
              </Button>
            </>
          )}

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-white/10"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Account menu"
              >
                <span className="hidden sm:block text-sm text-white/90">
                  {name}
                </span>
                <Image
                  src={avatar}
                  alt="avatar"
                  width={28}
                  height={28}
                  className="rounded-full bg-white/10"
                />
              </button>

              {open && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-md border border-white/10 bg-slate-900 py-1 text-sm shadow-lg"
                >
                  <Link
                    href="/profile"
                    className="block px-3 py-2 hover:bg-white/10"
                    onClick={() => setOpen(false)}
                    role="menuitem"
                  >
                    Profile
                  </Link>

                  {/* Always show Dashboard entry; guard is inside the page/middleware */}
                  <Link
                    href="/admin/dashboard"
                    className="block px-3 py-2 hover:bg-white/10"
                    onClick={() => setOpen(false)}
                    role="menuitem"
                  >
                    Dashboard
                  </Link>

                  <button
                    className="block w-full px-3 py-2 text-left hover:bg-white/10"
                    onClick={async () => {
                      setOpen(false);
                      await signOut({ callbackUrl: "/login" });
                    }}
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
