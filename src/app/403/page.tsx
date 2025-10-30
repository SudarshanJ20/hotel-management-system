// app/403/page.tsx
export default function ForbiddenPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="mt-2 text-white/70">You don’t have permission to view this page.</p>
    </div>
  );
}
