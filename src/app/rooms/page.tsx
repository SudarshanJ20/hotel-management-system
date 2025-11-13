// src/app/rooms/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";
import RoomsFilters from "./rooms-filters";

type Room = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  capacity: number;
  status: string;
  image: string | null;
};

function formatINR(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${n}`;
  }
}

function RoomCard({ id, title, price, capacity }: Pick<Room, "id" | "title" | "price" | "capacity">) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <Link href={`/rooms/${id}`} className="font-medium hover:underline">
        {title}
      </Link>
      <div className="text-sm text-white/70">Capacity: {capacity}</div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-white/90">{formatINR(price)}/night</div>
        <Link href="/bookings/new" className="text-sm text-cyan-300 hover:underline">
          Book
        </Link>
      </div>
    </div>
  );
}

export const revalidate = 0;

export default async function RoomsPage() {
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = ["ADMIN", "MANAGER"].includes(role);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";

  // Read search params server-side for SSR
  const urlObj = new URL(`${base}/api/rooms${hdrs.get("x-invoke-path")?.includes("?") ? "" : ""}`);
  // If you want query passthrough, Next 15 recommends reading search via request; here we keep simple:
  const listUrl = `${base}/api/rooms${hdrs.get("x-search") ?? ""}`;

  const res = await fetch(listUrl, { cache: "no-store" });
  if (!res.ok) {
    const snippet = await res.text().then((t) => t.slice(0, 200)).catch(() => "");
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Rooms</h1>
            <p className="text-white/70 mt-1">Find the right room and check availability.</p>
          </div>
          {isPrivileged && (
            <Link href="/rooms/new" className="h-10 inline-flex items-center rounded-md bg-blue-600 px-4 text-sm text-white">
              New Room
            </Link>
          )}
        </div>
        <RoomsFilters />
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Failed to load rooms: {res.status} {res.statusText}. {snippet}
        </div>
      </div>
    );
  }

  const payload = await res.json().catch(() => ({ items: [] as Room[], pages: 1, page: 1 }));
  const rooms = (payload.items as Room[]) ?? [];
  const pages = Number(payload.pages ?? 1);
  const page = Number(payload.page ?? 1);

  // Broadcast total pages to client filter for pagination buttons
  const script = `
    window.dispatchEvent(new CustomEvent("rooms:pages", { detail: { pages: ${JSON.stringify(pages)} } }));
  `;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Rooms</h1>
          <p className="text-white/70 mt-1">Find the right room and check availability.</p>
        </div>
        {isPrivileged && (
          <Link href="/rooms/new" className="h-10 inline-flex items-center rounded-md bg-blue-600 px-4 text-sm text-white">
            New Room
          </Link>
        )}
      </div>

      <RoomsFilters />

      {rooms.length === 0 ? (
        <div className="text-white/70">No rooms found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r: Room) => (
            <RoomCard key={r.id} id={r.id} title={r.title} price={r.price} capacity={r.capacity} />
          ))}
        </div>
      )}

      <script dangerouslySetInnerHTML={{ __html: script }} />
    </div>
  );
}
