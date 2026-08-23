"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await res.json();
      localStorage.setItem("opsflow_token", data.accessToken);
      localStorage.setItem("opsflow_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="h-screen flex items-center justify-center bg-ivory">
      <div className="w-full max-w-[480px] p-10">
        <div className="bg-white rounded-xl border border-surface-container-highest shadow-card p-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="w-8 h-8 rounded bg-charcoal flex items-center justify-center text-gold text-lg">
                ∞
              </span>
              <h1 className="font-serif text-4xl text-primary tracking-tight">OpsFlow</h1>
            </div>
            <p className="font-sans text-sm text-gold mt-2">Management Suite</p>
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-surface-container-highest px-4 py-3 bg-white text-on-surface focus:border-gold focus:ring-gold text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-on-surface">
                  Password
                </label>
                <a href="#" className="text-sm text-on-surface-variant hover:text-gold transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-surface-container-highest px-4 py-3 bg-white text-on-surface focus:border-gold focus:ring-gold text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant hover:text-gold"
                >
                  👁
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-on-primary bg-charcoal hover:bg-primary-container transition-all disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-container-highest text-center">
            <p className="text-sm text-on-surface-variant">
              Accounts are created by your administrator.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}