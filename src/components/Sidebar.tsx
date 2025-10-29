"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, BedDouble, CalendarCheck2, BarChart3, User2 } from "lucide-react";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/rooms", label: "Rooms", icon: BedDouble },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck2 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-white/10 bg-black/40 backdrop-blur rounded-xl">
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="text-lg font-semibold">HMS</Link>
      </div>
      <nav className="p-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                active
                  ? "bg-white/10 text-cyan-300"
                  : "text-white/80 hover:bg-white/5 hover:text-cyan-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
