// app/login/page.tsx
"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center">
      <div className="animate-[fade-in_0.2s_ease-out] rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur">
        {message}
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState("");

  const redirectTarget = "/"; // or "/my/bookings"

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await signIn("credentials", {
        email,
        password: pwd,
        redirect: false,
      });
      if (res?.error) {
        setErr(res.error);
        return;
      }
      setToast("Logged in successfully");
      setTimeout(() => {
        router.push(redirectTarget);
      }, 900);
    });
  };

  const handleGoogleLogin = () => {
    setToast("Signing you in with Google…");
    setTimeout(() => {
      signIn("google", { callbackUrl: redirectTarget });
    }, 400);
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4">
      <Toast message={toast} />

      <div className="relative flex w-full max-w-5xl items-center gap-10 lg:gap-16">
        {/* Left: welcome text about hotel */}
        <div className="hidden md:block flex-1 text-white space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Welcome
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-snug">
            Sign in to{" "}
            <span className="text-cyan-300">book your stay.</span>
          </h1>
          <p className="text-sm text-white/75 max-w-md">
            Log in to reserve elegant rooms, manage upcoming stays, and keep
            track of every detail of your visit.
          </p>
          <ul className="mt-2 text-xs text-white/70 space-y-1.5">
            <li>• View and manage all your current and past bookings.</li>
            <li>• Choose from deluxe, suite, and classic room categories.</li>
            <li>• Enjoy a smooth check‑in experience when you arrive.</li>
          </ul>
        </div>

        {/* Right: auth card */}
        <div className="flex-1 flex justify-end">
          <div className="w-full max-w-md rounded-3xl bg-slate-950/85 border border-white/12 shadow-[0_24px_70px_rgba(15,23,42,0.9)] backdrop-blur-xl px-6 py-8 sm:px-8 sm:py-9">
            <div className="text-left">
              <h2 className="text-2xl font-semibold text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Sign in to book rooms and manage your stays.
              </p>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100"
            >
              <span className="text-base">G</span>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3 text-[11px] text-white/40">
              <div className="h-px flex-1 bg-white/15" />
              <span>OR SIGN IN WITH EMAIL</span>
              <div className="h-px flex-1 bg-white/15" />
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-white/85"
                >
                  Email address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                    @
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-white/15 bg-white/5 pl-8 pr-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/30"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-white/85"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-white/15 bg-white/5 pl-3 pr-24 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/30"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 hover:bg-white/20"
                  >
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/70">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-white/40 bg-transparent text-cyan-400 focus:ring-cyan-400/60"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-cyan-300 hover:text-cyan-200"
                >
                  Forgot password?
                </button>
              </div>

              {err && (
                <p className="text-xs text-rose-300">
                  {err}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-1 w-full h-11 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(59,130,246,0.7)] hover:opacity-95 disabled:opacity-60"
              >
                {pending ? "Signing in…" : "Sign in securely"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-white/70">
              <span>New to the hotel? </span>
              <Link
                href="/register"
                className="font-medium text-cyan-300 hover:text-cyan-200"
              >
                Create an account to book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
