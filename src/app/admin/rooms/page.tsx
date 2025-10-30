import Link from "next/link";
import { headers } from "next/headers";

async function absolute(path: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}${path}`;
}

async function getRooms() {
  const url = await absolute("/api/rooms");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Rooms</h1>
        <Link href="/admin/rooms/new" className="rounded-lg px-3 py-2 text-sm bg-cyan-600 text-white hover:bg-cyan-500">
          + New Room
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((r: any) => (
          <div key={r.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <div className="font-medium">{r.title}</div>
            <div className="text-sm text-white/70">₹{r.price} • Sleeps {r.capacity}</div>
            <div className="text-xs mt-1 text-white/60">Status: {r.status}</div>
            <div className="mt-3 flex gap-2">
              <Link href={`/admin/rooms/${r.id}`} className="text-sm text-cyan-300 hover:underline">Edit</Link>
              <form action={`/admin/rooms/${r.id}/delete`} method="post">
                <button className="text-sm text-rose-300 hover:underline">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="text-white/70">No rooms yet. Create your first room.</div>
        )}
      </div>
    </div>
  );
}
