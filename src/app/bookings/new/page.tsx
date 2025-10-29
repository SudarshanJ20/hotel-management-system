"use client";
import { useState } from "react";

export default function NewBookingPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
        <div className="text-lg font-medium">Booking created</div>
        <p className="text-white/70 mt-1">A confirmation has been sent to the guest.</p>
        <a href="/bookings" className="mt-4 inline-block text-sm text-cyan-300 hover:underline">Go to Bookings</a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6 space-y-4">
      <div className="text-lg font-medium">Create Booking</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60" placeholder="Guest name" />
        <input className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60" placeholder="Email" />
        <select className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white/90">
          <option className="bg-slate-900">Deluxe King</option>
          <option className="bg-slate-900">Executive Twin</option>
          <option className="bg-slate-900">Suite</option>
        </select>
        <input type="number" min={1} className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60" placeholder="Guests" />
        <input type="date" className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white" />
        <input type="date" className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white" />
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white"
      >
        Create booking
      </button>
    </div>
  );
}
