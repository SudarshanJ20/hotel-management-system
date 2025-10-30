// app/dashboard/page.tsx
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2">Welcome {session?.user?.name ?? session?.user?.email}</p>
      <pre className="mt-4 text-sm bg-white/5 p-4 rounded">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}
