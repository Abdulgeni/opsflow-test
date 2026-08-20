"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActivateAccountPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    router.push("/sign-in");
  }

  return (
    <main className="h-screen flex items-center justify-center bg-ivory">
      <div className="w-full max-w-[480px] p-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="w-8 h-8 rounded bg-charcoal flex items-center justify-center text-gold text-lg">∞</span>
            <span className="font-serif text-2xl text-primary">OpsFlow</span>
          </div>
          <p className="text-sm text-gold">Management Suite</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-container-highest shadow-card p-10">
          <h1 className="font-serif text-2xl text-primary text-center mb-1">Welcome to OpsFlow</h1>
          <p className="text-sm text-on-surface-variant text-center mb-6">
            Set a password to activate your account
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="bg-surface-container-low rounded-lg p-4 mb-6 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-on-surface-variant">Name</span><span className="font-medium">Fahami Jemal Harun</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Email</span><span className="font-medium">fahami@goldenage.com</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Role</span><span className="font-medium">Staff</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Password</label>
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-surface-container-highest px-4 py-3 text-sm focus:border-gold focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Confirm password</label>
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-lg border border-surface-container-highest px-4 py-3 text-sm focus:border-gold focus:ring-gold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-medium text-on-primary bg-charcoal hover:bg-primary-container transition-all"
            >
              Activate account
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-on-surface-variant mt-6">© OpsFlow</p>
      </div>
    </main>
  );
}