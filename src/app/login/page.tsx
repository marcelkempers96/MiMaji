"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (phone.length < 9 || !password) return;
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar minimal />

      <div className="px-4 py-12 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Welcome back</h1>
          <p className="text-text-mid text-sm">Sign in to your MiMaji account</p>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-4" style={{ boxShadow: "var(--shadow-elevated)" }}>
          <div>
            <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <div className="flex rounded-2xl overflow-hidden bg-blue-50">
              <span className="px-3 py-3 bg-blue-100 text-blue-900 text-sm font-semibold">
                +254
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 9));
                  setError("");
                }}
                placeholder="712 345 678"
                className="flex-1 px-3 py-3 border-none bg-transparent text-sm text-blue-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50"
            />
          </div>

          {error && (
            <div className="text-error text-sm text-center bg-red-50 rounded-2xl p-3">
              {error}
            </div>
          )}

          <Button
            size="lg"
            onClick={handleLogin}
            loading={loading}
            disabled={phone.length < 9 || !password}
          >
            Log In
          </Button>

          <p className="text-center text-sm text-text-mid">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
