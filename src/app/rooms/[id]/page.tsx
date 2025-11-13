// src/app/rooms/[id]/page.tsx
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/auth"; // getServerSession wrapper

type Room = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  capacity: number;
  status: string;
  image: string | null;
};

export const revalidate = 0;

export default async function RoomDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Get session to decide if admin
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // Next 15: headers() must be awaited
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";
  const url = `${base}/api/rooms/${id}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return (
      <div className="p-6 text-white/80">
        Room not found.
        <div className="mt-4">
            <Link href="/rooms" className="underline text-cyan-300">Back to Rooms</Link>
        </div>
      </div>
    );
  }

  const room = (await res.json()) as Room;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{room.title}</h1>
          <p className="text-white/70 mt-1">Capacity: {room.capacity}</p>
          <div className="text-white/90 mt-1">₹{room.price} / night</div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href={`/rooms/${room.id}/edit`} className="px-3 py-1.5 bg-blue-600 text-white rounded">
              Edit
            </Link>
          )}
          <Link href="/rooms" className="px-3 py-1.5 border border-white/20 text-white rounded">Back</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 lg:col-span-2">
          <div className="h-56 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60">
            Gallery coming soon
          </div>
          {room.description && (
            <p className="mt-4 text-white/80">{room.description}</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
          <div className="font-medium">Actions</div>
          <div className="mt-3 text-sm text-white/80 space-y-2">
            <div>Status: {room.status}</div>
            <Link
              href="/bookings/new"
              className="inline-block rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white"
            >
              Book this room
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
