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

    if (!name.trim()) return setError("Name is required");

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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">New Guest</h1>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-1">Name</label>
          <input
            className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Guest name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Email</label>
            <input
              className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guest@example.com"
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Phone</label>
            <input
              className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 90000 00000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1">Address</label>
          <textarea
            className="w-full min-h-24 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1">Notes</label>
          <textarea
            className="w-full min-h-24 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            className="h-10 px-4 rounded-md border border-white/20 text-white text-sm"
            onClick={() => history.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
