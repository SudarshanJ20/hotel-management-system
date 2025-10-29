"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/bookings", label: "Bookings" },
  { href: "/guests", label: "Guests" },
  { href: "/admin/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();

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

        <div className="flex items-center gap-2">
          <Button asChild className="h-9 px-3 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white">
            <Link href="/login">
              <LogIn className="size-4 mr-2" /> Login
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
