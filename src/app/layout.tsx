// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";

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

          {/* App shell */}
          <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
              {/* Full width, just with some padding */}
              <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </div>
            </main>

            <footer className="border-t border-white/10 mt-4">
              <div className="w-full px-4 sm:px-6 lg:px-8 py-4 text-xs text-white/50 flex items-center justify-between">
                <span>
                  © {new Date().getFullYear()} Hotel Management System
                </span>
                <span>Built with Next.js &amp; Tailwind CSS</span>
              </div>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
