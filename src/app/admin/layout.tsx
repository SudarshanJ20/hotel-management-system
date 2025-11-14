// app/admin/layout.tsx
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Optional admin-specific background overlay */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      <div className="relative z-10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
