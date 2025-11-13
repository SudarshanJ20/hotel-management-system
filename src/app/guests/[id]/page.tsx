// src/app/guests/[id]/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";

type Guest = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
};

export const revalidate = 0;

export default async function GuestDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = ["ADMIN", "MANAGER"].includes(role);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";
  const url = `${base}/api/guests/${params.id}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return (
      <div className="p-6 text-white/80">
        Guest not found.
        <div className="mt-4">
          <Link href="/guests" className="underline text-cyan-300">Back to Guests</Link>
        </div>
      </div>
    );
  }

  const guest = (await res.json()) as Guest;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{guest.name}</h1>
          {guest.email && <p className="text-white/70 mt-1">{guest.email}</p>}
          {guest.phone && <p className="text-white/70">{guest.phone}</p>}
        </div>
        <div className="flex gap-2">
          {isPrivileged && (
            <Link href={`/guests/${guest.id}/edit`} className="px-3 py-1.5 bg-blue-600 text-white rounded">
              Edit
            </Link>
          )}
          <Link href="/guests" className="px-3 py-1.5 border border-white/20 text-white rounded">Back</Link>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
        <div className="font-medium">Details</div>
        <div className="mt-3 text-sm text-white/80 space-y-2">
          <div>Address: {guest.address || "—"}</div>
          <div>Notes: {guest.notes || "—"}</div>
        </div>
      </div>
    </div>
  );
}
