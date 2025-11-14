// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Hotel Management System",
  description: "Hotel booking and management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-white antialiased">
        <SessionProvider>
          {/* Global animated background using your CSS helpers */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 animate-gradient opacity-80" />
            <div className="absolute inset-0 bg-grid opacity-40" />
            <div className="absolute inset-0 bg-slate-900/65" />
          </div>

          {/* App shell with conditional footer */}
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
