"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("That email/password combo doesn't match an account. New here? Create one below.");
      return;
    }
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-xl font-black text-white">
            S
          </div>
          <h1 className="text-2xl font-black">Sign in to SkyTrack</h1>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-bold text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            You'll need an account to sign in
          </span>
        </Link>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-accent"
          />
          {error && <p className="text-sm font-medium text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-accent py-3.5 text-sm font-bold text-white transition-colors hover:bg-accentDark disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-center">
          <p className="text-sm text-muted">Don't have an account yet?</p>
          <Link href="/signup" className="mt-1 inline-block text-sm font-bold text-accent">
            Create one — takes 30 seconds →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
