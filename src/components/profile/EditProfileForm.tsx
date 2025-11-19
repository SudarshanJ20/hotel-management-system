// src/components/profile/EditProfileForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function EditProfileForm({
  initialName,
  initialImage,
  initialPhone,
}: {
  initialName: string;
  initialImage?: string;
  initialPhone?: string;
}) {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const { update, data: session } = useSession();

  const isGoogleUser = !session?.user || !(session.user as any)?.password; // heuristic; API will enforce

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    start(async () => {
      try {
        const payload: any = {
          name,
          image,
          phone,
        };

        // Send password fields only if user entered a new one
        if (newPassword) {
          payload.currentPassword = currentPassword;
          payload.newPassword = newPassword;
        }

        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "Failed to update profile");
        }
        const updated = await res.json().catch(() => null);

        await update({
          name: updated?.name,
          phone: updated?.phone,
        });

        setMsg("Profile updated");
        setCurrentPassword("");
        setNewPassword("");
        router.refresh();
      } catch (e: any) {
        setErr(e.message || "Something went wrong");
      }
    });
  };

  const label = "text-sm text-white/80";
  const input =
    "rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-cyan-400/50";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {msg && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {err}
        </div>
      )}

      <div className="grid gap-2">
        <label className={label}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={input}
          placeholder="Your name"
        />
      </div>

     

      <div className="grid gap-2">
        <label className={label}>Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={input}
          inputMode="tel"
          placeholder="+91 98765 43210"
        />
      </div>

      {/* Password change (credentials accounts) */}
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-white/85">
          Change password
        </label>
        <p className="text-[11px] text-white/55">
          Not available for Google sign-in accounts.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="password"
            className={input}
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={pending || isGoogleUser}
          />
          <input
            type="password"
            className={input}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={pending || isGoogleUser}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md px-4 py-2 text-sm bg-blue-600 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
