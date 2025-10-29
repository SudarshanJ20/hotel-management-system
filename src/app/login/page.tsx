import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Darker background */}
      <div className="absolute inset-0 animate-gradient z-0" />
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="absolute inset-0 bg-grid z-0" />

      {/* Centered form */}
      <div className="relative z-10 min-h-screen max-w-7xl mx-auto px-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="w-full rounded-2xl glass p-6 sm:p-8 glow ring-1 ring-white/10">
            <AuthForm mode="login" />
          </div>
          <p className="mt-4 text-center text-white/80 text-sm">
            New here? <Link href="/register" className="text-cyan-300 hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
