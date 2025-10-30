// app/page.tsx
import Link from "next/link";
import Image from "next/image";

function Amenity({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 text-white/90">
      <span className="text-2xl">{icon}</span>
      <span className="text-base">{label}</span>
    </div>
  );
}

export default function HomePage() {
const rooms = [
  {
    title: "Deluxe King",
    info: "Sleeps 2 • City view",
    price: "From ₹4,999/night",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80", // modern king bedroom
  },
  {
    title: "Executive Suite",
    info: "Sleeps 3 • Living area",
    price: "From ₹7,999/night",
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80", // suite with living area
  },
  {
    title: "Twin Classic",
    info: "Sleeps 2 • Twin beds",
    price: "From ₹3,999/night",
    img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80", // twin beds
  },
];




  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background (keep your existing classes) */}
      <div className="absolute inset-0 animate-gradient z-0" />
      <div className="absolute inset-0 bg-black/55 z-0" />
      <div className="absolute inset-0 bg-grid z-0" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 space-y-8">
        {/* Hero */}
        <header>
          <h1 className="text-2xl font-semibold">Hotel Management System</h1>
          <p className="text-white/70 mt-2">
            Explore elegant rooms, modern amenities, and seamless bookings.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/rooms"
              className="rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white"
            >
              Browse Rooms
            </Link>
            <Link
              href="/bookings"
              className="rounded-lg px-4 py-2 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              View Bookings
            </Link>
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              Login / Register
            </Link>
          </div>
        </header>

        {/* Popular Rooms */}
        <section>
          <h2 className="text-lg font-medium">Popular Rooms</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {rooms.map((r) => (
              <div key={r.title} className="rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden">
                <div className="relative h-40 bg-white/[0.06]">
                  <Image
                    src={r.img}
                    alt={r.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-sm text-white/70">{r.info}</div>
                  <div className="mt-2">{r.price}</div>
                  <div className="mt-3">
                    <Link href="/rooms" className="text-sm text-cyan-300 hover:underline underline-offset-4">
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Amenities */}
        <section>
          <h2 className="text-lg font-medium">Amenities</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-5">
            <Amenity icon="📶" label="High-speed Wi‑Fi" />
            <Amenity icon="🍳" label="Breakfast" />
            <Amenity icon="🏊" label="Pool" />
            <Amenity icon="🏋️" label="Gym" />
            <Amenity icon="🅿️" label="Parking" />
            <Amenity icon="🕘" label="24×7 Front Desk" />
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-lg font-medium">What guests say</h2>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <div className="text-yellow-300">★★★★★</div>
              <p className="mt-2 text-white/80">“Beautiful rooms and exceptional staff.”</p>
              <div className="mt-2 text-sm text-white/60">— A. Rao</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <div className="text-yellow-300">★★★★★</div>
              <p className="mt-2 text-white/80">“Great location, loved the pool.”</p>
              <div className="mt-2 text-sm text-white/60">— V. Shah</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
