"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function Toast({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center">
      <div className="animate-[fade-in_0.2s_ease-out] rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur">
        {message}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [toast, setToast] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Invalid or missing token.
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (pwd.length < 6) {
      setErr("Password must be at least 6 characters long");
      return;
    }

    if (pwd !== confirm) {
      setErr("Passwords do not match");
      return;
    }

    start(async () => {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pwd }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data.error || "Failed to reset password");
        return;
      }

      setToast("Password updated successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 900);
    });
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4">
      <Toast message={toast} />

      <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.45)] px-6 py-8 sm:px-8 sm:py-9">

        <h2 className="text-2xl font-semibold text-white">Reset Password</h2>
        <p className="mt-2 text-sm text-white/80">
          Enter a new password below.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/90">
              New password
            </label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full h-11 rounded-2xl border border-white/25 bg-white/10 text-white px-4 text-sm placeholder:text-white/50 outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/40"
              placeholder="New password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/90">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full h-11 rounded-2xl border border-white/25 bg-white/10 text-white px-4 text-sm placeholder:text-white/50 outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/40"
              placeholder="Confirm password"
              required
            />
          </div>

          {err && <p className="text-xs text-rose-300">{err}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 w-full h-11 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(59,130,246,0.5)] hover:brightness-110 transition disabled:opacity-60"
          >
            {pending ? "Updating…" : "Update password"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-white/80">
          <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
            Back to login
          </Link>
        </div>

      </div>
    </div>
  );
}
