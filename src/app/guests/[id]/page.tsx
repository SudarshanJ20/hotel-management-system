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

export default async function GuestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = ["ADMIN", "MANAGER"].includes(role);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";
  const url = `${base}/api/guests/${id}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Guest not found</h1>
        <p className="text-sm text-white/70">
          The guest record you are looking for does not exist or was removed.
        </p>
        <Link
          href="/guests"
          className="inline-flex items-center rounded-full border border-white/25 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
        >
          ← Back to guests
        </Link>
      </div>
    );
  }

  const guest = (await res.json()) as Guest;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            {guest.name}
          </h1>
          {guest.email && (
            <p className="text-sm text-white/70 mt-1">{guest.email}</p>
          )}
          {guest.phone && (
            <p className="text-sm text-white/70">{guest.phone}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPrivileged && (
            <Link
              href={`/guests/${guest.id}/edit`}
              className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10"
            >
              Edit guest
            </Link>
          )}
          <Link
            href="/guests"
            className="inline-flex items-center rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/85 hover:bg-white/10"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Details card */}
      <div className="glass rounded-3xl p-5 border border-white/15">
        <div className="text-sm font-semibold text-white/85">Details</div>
        <div className="mt-3 text-sm text-white/80 space-y-2">
          <div>
            <span className="text-white/60 text-xs uppercase tracking-wide">
              Address
            </span>
            <p className="mt-1">
              {guest.address || "No address information on file."}
            </p>
          </div>
          <div>
            <span className="text-white/60 text-xs uppercase tracking-wide">
              Notes
            </span>
            <p className="mt-1">
              {guest.notes || "No notes added for this guest yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
