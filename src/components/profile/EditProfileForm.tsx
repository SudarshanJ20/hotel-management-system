// src/components/profile/EditProfileForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function EditProfileForm({
  initialName,
  initialImage,
}: {
  initialName: string;
  initialImage: string;
}) {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    start(async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, image }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "Failed to update profile");
        }
        setMsg("Profile updated");
        router.refresh();
      } catch (e: any) {
        setErr(e.message || "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2">
        <label className="text-sm text-white/80">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md bg-white/5 border border-white/10 px-3 py-2"
          placeholder="Your name"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-white/80">Avatar URL</label>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="rounded-md bg-white/5 border border-white/10 px-3 py-2"
          placeholder="https://..."
        />
        <p className="text-xs text-white/60">
          Tip: Use your Google photo URL or a service like ui-avatars.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md px-4 py-2 text-sm bg-blue-600 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
        {msg && <span className="text-emerald-300 text-sm">{msg}</span>}
        {err && <span className="text-rose-300 text-sm">{err}</span>}
      </div>
    </form>
  );
}
