// src/app/bookings/[id]/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";

export const revalidate = 0;

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = ["ADMIN", "MANAGER"].includes(role);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";

  const res = await fetch(`${base}/api/bookings/${params.id}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <div className="p-6 text-white/80">
        Booking not found.
        <div className="mt-4">
          <Link href="/bookings" className="underline text-cyan-300">Back to Bookings</Link>
        </div>
      </div>
    );
  }

  const b = await res.json();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Booking</h1>
          <p className="text-white/70 mt-1">
            {new Date(b.checkIn).toDateString()} → {new Date(b.checkOut).toDateString()} · {b.status}
          </p>
        </div>
        <div className="flex gap-2">
          {isPrivileged && (
            <Link href={`/bookings/${b.id}/edit`} className="px-3 py-1.5 bg-blue-600 text-white rounded">
              Edit
            </Link>
          )}
          <Link href="/bookings" className="px-3 py-1.5 border border-white/20 text-white rounded">Back</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
          <div className="font-medium">Guest</div>
          <div className="mt-3 text-sm text-white/80 space-y-1">
            <div>{b.guest?.name}</div>
            <div>{b.guest?.email ?? "—"}</div>
            <div>{b.guest?.phone ?? "—"}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
          <div className="font-medium">Room</div>
          <div className="mt-3 text-sm text-white/80 space-y-1">
            <div>{b.room?.title}</div>
            <div>₹{b.room?.price} / night</div>
            <div>Guests: {b.guests}</div>
            <div>Total: ₹{b.totalPrice}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
