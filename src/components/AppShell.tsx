// src/components/AppShell.tsx
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import FooterWrapper from "@/components/FooterWrapper";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>

      {/* Footer logic is now client-side and separate */}
      <FooterWrapper />
    </div>
  );
}
