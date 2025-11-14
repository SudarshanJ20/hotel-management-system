// app/page.tsx
import Link from "next/link";
import Image from "next/image";

function AmenityCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-2 hover:bg-white/10 transition">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <p className="text-xs text-white/70 leading-relaxed">{text}</p>
    </div>
  );
}

export default function HomePage() {
  const rooms = [
    {
      title: "Deluxe King",
      info: "Sleeps 2 • City view",
      price: "From ₹4,999/night",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Executive Suite",
      info: "Sleeps 3 • Living area",
      price: "From ₹7,999/night",
      img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Twin Classic",
      info: "Sleeps 2 • Twin beds",
      price: "From ₹3,999/night",
      img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] pb-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
              Boutique stay • Coastal city
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-semibold leading-tight text-white">
              A calm stay for{" "}
              <span className="text-cyan-300">every guest.</span>
            </h1>
            <p className="mt-4 text-base text-white/75 max-w-xl">
              Elegant rooms, warm service, and a booking experience built with
              modern web technology. Perfect for business, weekend breaks, and
              longer stays.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/rooms"
                className="btn-glow rounded-full px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 text-white shadow-md"
              >
                Explore rooms
              </Link>
              <Link
                href="/my/bookings"
                className="rounded-full px-5 py-2.5 text-sm font-medium border border-white/20 bg-white/10 text-white hover:bg-white/15"
              >
                View my bookings
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/60">
              <div>✓ Instant online confirmation</div>
              <div>✓ Secure payments</div>
              <div>✓ No hidden charges</div>
            </div>
          </div>

         
        </section>

        {/* POPULAR ROOMS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Popular rooms
              </h2>
              <p className="text-sm text-white/65">
                Guest‑favourite categories with the best ratings.
              </p>
            </div>
            <Link
              href="/rooms"
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
            >
              View all rooms
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {rooms.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-white/12 bg-slate-950/75 overflow-hidden hover:border-cyan-400/60 hover:shadow-lg transition"
              >
                <div className="relative h-44 bg-white/[0.06]">
                  <Image
                    src={r.img}
                    alt={r.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <div className="text-sm font-semibold text-white">
                    {r.title}
                  </div>
                  <div className="text-xs text-white/70">
                    {r.info}
                  </div>
                  <div className="mt-2 text-sm font-medium text-emerald-300">
                    {r.price}
                  </div>
                  <div className="mt-3">
                    <Link
                      href="/rooms"
                      className="text-xs font-medium text-cyan-300 hover:underline underline-offset-4"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AMENITIES – CLEANER, CLASSY */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Thoughtful amenities
            </h2>
            <p className="text-sm text-white/65 max-w-2xl">
              Designed to make every stay comfortable—whether it’s a quick
              business trip or a relaxed weekend getaway.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AmenityCard
              icon="📶"
              title="High‑speed Wi‑Fi"
              text="Fast, reliable Wi‑Fi across all rooms and common areas so you can work or stream without interruptions."
            />
            <AmenityCard
              icon="🍳"
              title="Breakfast & dining"
              text="Freshly prepared breakfast with vegetarian options, plus an all‑day à la carte menu."
            />
            <AmenityCard
              icon="🏊"
              title="Pool & leisure"
              text="Rooftop pool with loungers, perfect for unwinding after a long day."
            />
            <AmenityCard
              icon="🏋️"
              title="Fitness studio"
              text="Compact but well‑equipped gym with cardio and strength‑training essentials."
            />
            <AmenityCard
              icon="🅿️"
              title="Secure parking"
              text="On‑site parking with CCTV coverage so your vehicle stays safe throughout your stay."
            />
            <AmenityCard
              icon="🕘"
              title="24×7 front desk"
              text="Round‑the‑clock assistance for late arrivals, early check‑outs, and special requests."
            />
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="space-y-4 pb-4">
          <h2 className="text-xl font-semibold text-white">
            What guests say
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-4">
              <div className="text-yellow-300 text-sm">★★★★★</div>
              <p className="mt-2 text-sm text-white/85">
                “Beautiful rooms, quiet ambience, and a very smooth check‑in
                experience. The staff was super helpful.”
              </p>
              <div className="mt-2 text-xs text-white/60">— A. Rao</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-4">
              <div className="text-yellow-300 text-sm">★★★★★</div>
              <p className="mt-2 text-sm text-white/85">
                “Loved the breakfast and the pool. The location is perfect for
                exploring the city.”
              </p>
              <div className="mt-2 text-xs text-white/60">— V. Shah</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
