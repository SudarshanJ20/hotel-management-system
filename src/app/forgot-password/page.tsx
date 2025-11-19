"use client";

import { useState, useTransition } from "react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    start(async () => {
      try {
        const res = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "Unable to send reset email");
        }

        setMsg("Password reset link sent to your email");
        setToast("Check your inbox!");
      } catch (e: any) {
        setErr(e.message || "Something went wrong");
      }
    });
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4">
      <Toast message={toast} />

      <div className="relative flex w-full max-w-4xl items-center gap-10 lg:gap-16">

        {/* LEFT TEXT */}
        <div className="hidden md:block flex-1 text-white space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Reset password
          </p>

          <h1 className="text-3xl sm:text-4xl font-semibold leading-snug">
            Forgotten your password?{" "}
            <span className="text-cyan-300">Let’s help you fix it.</span>
          </h1>

          <p className="text-sm text-white/80 max-w-md">
            Enter your email address and we’ll send you a secure link to reset your password.
          </p>

          <ul className="mt-2 text-xs text-white/75 space-y-1.5">
            <li>• Reset access to your booking profile.</li>
            <li>• Keep track of upcoming and past stays.</li>
            <li>• Quick and secure recovery process.</li>
          </ul>
        </div>

        {/* RIGHT – GLASS CARD */}
        <div className="flex-1 flex justify-end">
          <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.45)] px-6 py-8 sm:px-8 sm:py-9">

            <div className="text-left">
              <h2 className="text-2xl font-semibold text-white">Forgot password</h2>
              <p className="mt-2 text-sm text-white/80">
                Enter your email and we’ll send you a password reset link.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={onSubmit} className="mt-6 space-y-4">

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-white/90">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-white/25 bg-white/10 text-white px-4 text-sm placeholder:text-white/50 outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/40"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {msg && <p className="text-xs text-emerald-300">{msg}</p>}
              {err && <p className="text-xs text-rose-300">{err}</p>}

              <button
                type="submit"
                disabled={pending}
                className="mt-1 w-full h-11 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(59,130,246,0.5)] hover:brightness-110 transition disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-white/80">
              <span>Remember your password? </span>
              <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
                Sign in
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
