// src/components/Footer.tsx
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Small gradient accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="grid gap-10 text-sm text-white/80 md:grid-cols-3">
          {/* Brand + tagline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300">
              Hotelio
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Stay in comfort. Book with confidence.
            </h2>
            <p className="text-base text-white/80">
              A modern hotel experience with streamlined booking, smart room
              management, and a dashboard that works for both guests and staff.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Explore
            </p>
            <div className="flex flex-col gap-2 text-base">
              <a href="/rooms" className="hover:text-cyan-300">
                Rooms & suites
              </a>
              <a href="/my/bookings" className="hover:text-cyan-300">
                My bookings
              </a>
              <a href="/bookings" className="hover:text-cyan-300">
                Manage bookings (staff)
              </a>
              <a href="/guests" className="hover:text-cyan-300">
                Guests directory
              </a>
            </div>
          </div>

          {/* Contact / hotel info */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Hotel details
            </p>
            <div className="space-y-2 text-base text-white/80">
              <p>123 City Center Road, Skyline District</p>
              <p>Open 24/7 for check‑in and support.</p>
              <p>
                Email{" "}
                <span className="font-semibold text-cyan-300">
                  contact@hotelio.stay
                </span>
              </p>
              <p>
                Phone{" "}
                <span className="font-semibold text-cyan-300">
                  +91 90000 00000
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-3 text-sm text-white/65 sm:flex-row sm:items-center">
          <p>© {year} Hotelio. All rights reserved.</p>
          <p className="text-white/60">
            Crafted with care to make planning your next stay feel effortless.
          </p>
        </div>
      </div>
    </footer>
  );
}
