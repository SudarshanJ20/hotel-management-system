import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 animate-gradient z-0" />
      <div className="absolute inset-0 bg-black/55 z-0" />
      <div className="absolute inset-0 bg-grid z-0" />
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex gap-6">
            <Sidebar />
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
