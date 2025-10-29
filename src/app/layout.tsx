import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";


export const metadata: Metadata = {
  title: "Hotel Management System",
  description: "Auth UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
