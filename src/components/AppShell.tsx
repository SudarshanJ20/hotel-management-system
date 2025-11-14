// src/components/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Show footer only on public/guest pages
  const showFooterOn =
    pathname === "/" ||
    pathname.startsWith("/rooms") ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>

      {showFooterOn && <Footer />}
    </div>
  );
}
