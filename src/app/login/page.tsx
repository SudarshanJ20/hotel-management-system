// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (res?.error) setError("Invalid email or password");
    else if (res?.ok) window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">Login</h1>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-2 rounded bg-red-600 text-white py-2 hover:bg-red-700"
        >
          Continue with Google
        </button>

        <div className="my-4 text-center text-sm text-gray-500">or</div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
