// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const user = session?.user as any | undefined;
  const name = user?.name || user?.email || "Account";
  const role = (user?.role as string) || "USER";
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";
  const canSeeStaff = isAdmin || isManager;
  const isSignedIn = !!user;
  const isRegularUser = isSignedIn && !canSeeStaff;

  const avatar =
    user?.image ||
    "https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff";

  useEffect(() => {
    setOpen(false);
    setMobileOpen(false);
  }, [pathname]);

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
    ...(canSeeStaff ? [{ href: "/bookings", label: "Bookings" }] as const : []),
    ...(canSeeStaff ? [{ href: "/guests", label: "Guests" }] as const : []),
    ...(isAdmin
      ? [{ href: "/admin/dashboard", label: "Dashboard" }] as const
      : []),
    ...(isRegularUser
      ? [{ href: "/my/bookings", label: "My bookings" }] as const
      : []),
  ];

  return (
    <header className="w-full z-50 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mt-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-5">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-base font-semibold tracking-tight"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 text-sm font-bold text-white shadow-sm">
                  HM
                </span>
                <span className="hidden sm:inline text-white/90">
                  Hotel Management
                </span>
              </Link>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1.5">
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3.5 py-2 rounded-full text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-cyan-300"
                        : "text-white/75 hover:text-cyan-300 hover:bg-white/5"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side: auth + mobile button */}
            <div className="flex items-center gap-2">
              {status === "loading" && (
                <div className="hidden sm:block h-9 w-28 rounded-full bg-white/10 animate-pulse" />
              )}

              {!user && status !== "loading" && (
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    asChild
                    className="h-9 rounded-full px-4 text-sm bg-white/5 hover:bg-white/10"
                  >
                    <Link href="/register">Register</Link>
                  </Button>
                  <Button
                    asChild
                    className="h-9 rounded-full px-4 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white shadow-sm"
                  >
                    <Link href="/login">
                      <LogIn className="mr-1.5 h-4 w-4" /> Login
                    </Link>
                  </Button>
                </div>
              )}

              {user && (
                <div className="hidden sm:block relative" ref={menuRef}>
                  <button
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full px-2.5 py-1.5 hover:bg-white/10"
                    aria-haspopup="menu"
                    aria-expanded={open}
                    aria-label="Account menu"
                  >
                    <span className="hidden md:block text-sm font-medium text-white/90 max-w-[140px] truncate">
                      {name}
                    </span>
                    <Image
                      src={avatar}
                      alt="avatar"
                      width={32}
                      height={32}
                      className="rounded-full bg-white/10"
                    />
                  </button>

                  {open && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-slate-950/95 py-1 text-sm shadow-xl backdrop-blur-xl"
                    >
                      <div className="px-3 py-2 border-b border-white/5">
                        <div className="text-xs text-white/40">
                          Signed in as
                        </div>
                        <div className="text-xs font-medium text-white/80 truncate">
                          {user.email}
                        </div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-wide text-white/40">
                          {role}
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-xs hover:bg-white/5"
                        onClick={() => setOpen(false)}
                        role="menuitem"
                      >
                        Profile
                      </Link>

                      <button
                        className="block w-full px-3 py-2 text-left text-xs text-red-300 hover:bg-red-500/10"
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

              {/* Mobile menu toggle */}
              <button
                className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 text-white/80"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle navigation"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileOpen && (
            <div className="md:hidden border-t border-white/10 px-4 pb-3 pt-2 space-y-3 bg-black/70 rounded-b-[1.75rem]">
              <nav className="flex flex-wrap gap-1.5">
                {links.map((link) => {
                  const active =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
                        active
                          ? "bg-white/10 text-cyan-300"
                          : "text-white/75 hover:text-cyan-300 hover:bg-white/5"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center justify-between pt-1">
                {!user && (
                  <div className="flex gap-2">
                    <Button
                      asChild
                      className="h-9 rounded-full px-4 text-sm bg-white/5 hover:bg-white/10"
                    >
                      <Link href="/register">Register</Link>
                    </Button>
                    <Button
                      asChild
                      className="h-9 rounded-full px-4 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white"
                    >
                      <Link href="/login">
                        <LogIn className="mr-1.5 h-4 w-4" /> Login
                      </Link>
                    </Button>
                  </div>
                )}

                {user && (
                  <div className="flex items-center gap-2">
                    <Image
                      src={avatar}
                      alt="avatar"
                      width={32}
                      height={32}
                      className="rounded-full bg-white/10"
                    />
                    <button
                      onClick={async () => {
                        setMobileOpen(false);
                        await signOut({ callbackUrl: "/login" });
                      }}
                      className="text-xs text-red-300 hover:text-red-200"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
