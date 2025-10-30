// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/bookings", label: "Bookings" },
  { href: "/guests", label: "Guests" },
  { href: "/admin/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const user = session?.user;
  const name = user?.name || user?.email || "Account";
  const avatar =
    user?.image ||
    "https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff";

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
            <Button asChild className="h-9 px-3 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white">
              <Link href="/login">
                <LogIn className="size-4 mr-2" /> Login
              </Link>
            </Button>
          )}

          {user && (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-white/10"
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
                  className="absolute right-0 mt-2 w-44 rounded-md border border-white/10 bg-slate-900 py-1 text-sm shadow-lg"
                  onMouseLeave={() => setOpen(false)}
                >
                  <Link
                    href="/profile"
                    className="block px-3 py-2 hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/admin/dashboard"
                    className="block px-3 py-2 hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    className="block w-full px-3 py-2 text-left hover:bg-white/10"
                    onClick={async () => {
                      setOpen(false);
                      await signOut({ callbackUrl: "/login" });
                    }}
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
