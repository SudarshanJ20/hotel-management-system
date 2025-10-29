import Link from "next/link";

function StatusChip({ status }: { status: "confirmed" | "pending" | "cancelled" | "complete" }) {
  const map = {
    confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
    pending: "bg-amber-500/15 text-amber-300 border-amber-400/20",
    cancelled: "bg-rose-500/15 text-rose-300 border-rose-400/20",
    complete: "bg-sky-500/15 text-sky-300 border-sky-400/20",
  } as const;
  return <span className={`px-2.5 py-1 rounded-full text-xs border capitalize ${map[status]}`}>{status}</span>;
}

function BookingRow({
  id,
  guest,
  room,
  dates,
  status,
}: {
  id: string;
  guest: string;
  room: string;
  dates: string;
  status: "confirmed" | "pending" | "cancelled" | "complete";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex items-center justify-between">
      <div>
        <div className="font-medium">{guest}</div>
        <div className="text-sm text-white/70">{room} • {dates}</div>
      </div>
      <div className="flex items-center gap-3">
        <StatusChip status={status} />
        <Link href={`/bookings/${id}`} className="text-sm text-cyan-300 hover:underline">View</Link>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const items = [
    { id: "b1001", guest: "Ananya Rao", room: "Room 302", dates: "Oct 15–18 • 3 nights • 2 guests", status: "confirmed" as const },
    { id: "b1002", guest: "Vikram Shah", room: "Room 415", dates: "Oct 20–22 • 2 nights • 1 guest", status: "pending" as const },
    { id: "b1003", guest: "Rahul S.", room: "Room 518", dates: "Oct 12–13 • 1 night • 1 guest", status: "complete" as const },
    { id: "b1004", guest: "Neha K.", room: "Room 207", dates: "Oct 25–27 • 2 nights • 2 guests", status: "confirmed" as const },
    { id: "b1005", guest: "Arjun P.", room: "Room 116", dates: "Oct 14–16 • 2 nights • 1 guest", status: "cancelled" as const },
    { id: "b1006", guest: "Meera N.", room: "Suite 801", dates: "Nov 01–04 • 3 nights • 2 guests", status: "pending" as const },
    { id: "b1007", guest: "Sanjay T.", room: "Room 234", dates: "Oct 19–20 • 1 night • 1 guest", status: "confirmed" as const },
    { id: "b1008", guest: "Pooja G.", room: "Executive Twin 512", dates: "Oct 22–24 • 2 nights • 2 guests", status: "confirmed" as const },
    { id: "b1009", guest: "Ritika D.", room: "Room 129", dates: "Oct 10–11 • 1 night • 1 guest", status: "complete" as const },
    { id: "b1010", guest: "Ishaan M.", room: "Room 341", dates: "Nov 05–06 • 1 night • 1 guest", status: "pending" as const },
    { id: "b1011", guest: "Farhan A.", room: "Suite 902", dates: "Oct 28–30 • 2 nights • 2 guests", status: "confirmed" as const },
    { id: "b1012", guest: "Divya R.", room: "Room 451", dates: "Oct 17–18 • 1 night • 1 guest", status: "confirmed" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Bookings</h1>
          <p className="text-white/70 mt-1">Track and manage upcoming stays.</p>
        </div>
        <Link href="/bookings/new" className="rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white">
          New Booking
        </Link>
      </div>

      <div className="space-y-3">
        {items.map((b) => (
          <BookingRow key={b.id} {...b} />
        ))}
      </div>
    </div>
  );
}
