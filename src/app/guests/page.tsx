// src/app/guests/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";
import GuestsFilters from "./guests-filters";

type Guest = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
};

export const revalidate = 0;

export default async function GuestsPage() {
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = ["ADMIN", "MANAGER"].includes(role);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";

  const listUrl = `${base}/api/guests`;

  const res = await fetch(listUrl, { cache: "no-store" });
  if (!res.ok) {
    const snippet = await res.text().then((t) => t.slice(0, 200)).catch(() => "");
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Guests</h1>
            <p className="text-white/70 mt-1">Manage guest records.</p>
          </div>
          {isPrivileged && (
            <Link href="/guests/new" className="h-10 inline-flex items-center rounded-md bg-blue-600 px-4 text-sm text-white">
              New Guest
            </Link>
          )}
        </div>
        <GuestsFilters />
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Failed to load guests: {res.status} {res.statusText}. {snippet}
        </div>
      </div>
    );
  }

  const payload = await res.json().catch(() => ({ items: [] as Guest[], pages: 1 }));
  const guests = (payload.items as Guest[]) ?? [];
  const pages = Number(payload.pages ?? 1);

  const script = `
    window.dispatchEvent(new CustomEvent("guests:pages", { detail: { pages: ${JSON.stringify(pages)} } }));
  `;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Guests</h1>
          <p className="text-white/70 mt-1">Manage guest records.</p>
        </div>
        {isPrivileged && (
          <Link href="/guests/new" className="h-10 inline-flex items-center rounded-md bg-blue-600 px-4 text-sm text-white">
            New Guest
          </Link>
        )}
      </div>

      <GuestsFilters />

      {guests.length === 0 ? (
        <div className="text-white/70">No guests found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guests.map((g) => (
            <Link
              key={g.id}
              href={`/guests/${g.id}`}
              className="rounded-xl border border-white/10 bg-slate-900/50 p-4 hover:border-white/20 transition-colors"
            >
              <div className="font-medium">{g.name}</div>
              {g.email && <div className="text-sm text-white/70">{g.email}</div>}
              {g.phone && <div className="text-sm text-white/70">{g.phone}</div>}
            </Link>
          ))}
        </div>
      )}

      <script dangerouslySetInnerHTML={{ __html: script }} />
    </div>
  );
}
