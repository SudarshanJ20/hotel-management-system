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
    const snippet = await res
      .text()
      .then((t) => t.slice(0, 200))
      .catch(() => "");
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Guests</h1>
            <p className="text-sm text-white/70 mt-1">
              Manage guest profiles and contact details.
            </p>
          </div>
          {isPrivileged && (
            <Link
              href="/guests/new"
              className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-4 text-xs font-medium text-white shadow-sm"
            >
              + New guest
            </Link>
          )}
        </div>
        <GuestsFilters />
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Failed to load guests: {res.status} {res.statusText}. {snippet}
        </div>
      </div>
    );
  }

  const payload = await res
    .json()
    .catch(() => ({ items: [] as Guest[], pages: 1 }));
  const guests = (payload.items as Guest[]) ?? [];
  const pages = Number(payload.pages ?? 1);

  const script = `
    window.dispatchEvent(new CustomEvent("guests:pages", { detail: { pages: ${JSON.stringify(
      pages
    )} } }));
  `;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Guests</h1>
          <p className="text-sm text-white/70 mt-1">
            View history, contact information, and notes for each guest.
          </p>
        </div>
        {isPrivileged && (
          <Link
            href="/guests/new"
            className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-4 text-xs font-medium text-white shadow-sm"
          >
            + New guest
          </Link>
        )}
      </div>

      {/* Filters */}
      <GuestsFilters />

      {/* List */}
      {guests.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-6 text-sm text-white/70">
          No guests found. Try adjusting your filters or add a new guest.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guests.map((g) => (
            <Link
              key={g.id}
              href={`/guests/${g.id}`}
              className="glass rounded-2xl border border-white/15 p-4 hover:border-cyan-400/60 hover:shadow-lg transition"
            >
              <div className="text-sm font-semibold text-white">
                {g.name}
              </div>
              {g.email && (
                <div className="text-xs text-white/70 mt-1">{g.email}</div>
              )}
              {g.phone && (
                <div className="text-xs text-white/70">{g.phone}</div>
              )}
              {g.address && (
                <div className="mt-2 text-[11px] text-white/60 line-clamp-2">
                  {g.address}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <script dangerouslySetInnerHTML={{ __html: script }} />
    </div>
  );
}
