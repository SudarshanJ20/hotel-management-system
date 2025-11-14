// src/app/guests/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewGuestPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? `Failed: ${res.status} ${res.statusText}`);
      return;
    }

    router.push("/guests");
    router.refresh();
  };

  const label =
    "block text-xs font-medium mb-1 text-white/80 tracking-wide uppercase";
  const input =
    "w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-cyan-400/40";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-white">New guest</h1>
        <p className="mt-1 text-sm text-white/70">
          Create a guest profile to re‑use for future bookings.
        </p>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/15 space-y-5">
        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className={label}>Name</label>
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Guest name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Email</label>
              <input
                className={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@example.com"
                type="email"
              />
            </div>
            <div>
              <label className={label}>Phone</label>
              <input
                className={input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 90000 00000"
              />
            </div>
          </div>

          <div>
            <label className={label}>Address</label>
            <textarea
              className={`${input} min-h-24 py-2 resize-none`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, state, country"
            />
          </div>

          <div>
            <label className={label}>Notes</label>
            <textarea
              className={`${input} min-h-24 py-2 resize-none`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferences, important info, etc."
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="btn-glow inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-6 py-2.5 text-sm font-medium text-white shadow-md disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create guest"}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-transparent px-5 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
