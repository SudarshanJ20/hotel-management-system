import Link from "next/link";

export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Room #{id}</h1>
        <p className="text-white/70 mt-1">Deluxe King • City view • 28 m²</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 lg:col-span-2">
          <div className="h-56 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60">
            Gallery coming soon
          </div>
          <p className="mt-4 text-white/80">
            Spacious room with king bed, work desk, high-speed Wi‑Fi, and modern bathroom.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
          <div className="font-medium">Amenities</div>
          <ul className="mt-2 text-sm text-white/80 space-y-1">
            <li>• Free Wi‑Fi</li>
            <li>• Breakfast included</li>
            <li>• City view</li>
            <li>• Air conditioning</li>
          </ul>
          <Link
            href="/bookings/new"
            className="mt-4 inline-block rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white"
          >
            Book this room
          </Link>
        </div>
      </div>
    </div>
  );
}
