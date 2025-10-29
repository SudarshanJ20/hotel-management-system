import Link from "next/link";

function RoomsFilters() {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex flex-wrap gap-3">
      <input
        className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60 outline-none"
        placeholder="City or hotel"
      />
      <input
        type="date"
        className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
      />
      <input
        type="date"
        className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
      />
      <select className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white/90 outline-none">
        <option className="bg-slate-900">1 Guest</option>
        <option className="bg-slate-900">2 Guests</option>
        <option className="bg-slate-900">3 Guests</option>
      </select>
      <button className="h-10 px-4 rounded-md bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white text-sm">
        Search
      </button>
    </div>
  );
}

function RoomCard({
  id,
  name,
  price,
  type,
}: {
  id: string;
  name: string;
  price: string;
  type: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <Link href={`/rooms/${id}`} className="font-medium hover:underline">
        {name}
      </Link>
      <div className="text-sm text-white/70">{type}</div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-white/90">{price}/night</div>
        <Link
          href="/bookings/new"
          className="text-sm text-cyan-300 hover:underline"
        >
          Book
        </Link>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Rooms</h1>
        <p className="text-white/70 mt-1">
          Find the right room and check availability.
        </p>
      </div>

      <RoomsFilters />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RoomCard id="1" name="Deluxe King" price="₹7,500" type="King • City view" />
        <RoomCard id="2" name="Executive Twin" price="₹6,200" type="Twin • Garden view" />
        <RoomCard id="3" name="Suite" price="₹12,000" type="Suite • Lounge access" />
      </div>
    </div>
  );
}
