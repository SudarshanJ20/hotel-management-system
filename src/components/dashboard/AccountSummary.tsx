// src/components/dashboard/AccountSummary.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AccountSummary({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null; id?: string | null; role?: string | null };
}) {
  const name = user?.name ?? "Unnamed user";
  const email = user?.email ?? "No email";
  const role = (user as any)?.role ?? "USER";
  const id = user?.id ?? "—";

  return (
    <section className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
          {user?.image ? (
            <Image src={user.image} alt="User avatar" width={56} height={56} />
          ) : (
            <div className="h-full w-full grid place-items-center text-white/60 text-xs">No image</div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{name}</h3>
            {role === "ADMIN" && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-600/40">
                Admin
              </span>
            )}
          </div>
          <p className="text-sm text-white/70 truncate">{email}</p>
        </div>
      </div>

      {/* Details */}
      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <dt className="text-xs text-white/60">User ID</dt>
          <dd className="text-sm text-white/90 break-all">{id}</dd>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <dt className="text-xs text-white/60">Role</dt>
          <dd className="text-sm text-white/90">{role}</dd>
        </div>
      </dl>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/profile"
          aria-label="Edit profile"
          className="px-3 py-1.5 rounded-md text-sm border border-white/15 bg-white/5 hover:bg-white/10"
        >
          Edit profile
        </Link>
        <Link
          href="/api/auth/session"
          aria-label="View session JSON"
          className="px-3 py-1.5 rounded-md text-sm border border-white/15 bg-white/5 hover:bg-white/10"
        >
          View session
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Sign out"
          className="px-3 py-1.5 rounded-md text-sm bg-rose-600 hover:bg-rose-500 text-white"
        >
          Sign out
        </button>
      </div>
    </section>
  );
}
