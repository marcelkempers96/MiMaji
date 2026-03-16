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
    // In production: POST to Supabase Auth
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar minimal />

      <div className="px-4 py-12 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">💧</div>
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Welcome back</h1>
          <p className="text-text-mid text-sm">Sign in to your MiMaji account</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="flex border-[1.5px] border-blue-200 rounded-xl overflow-hidden bg-blue-50">
              <span className="px-3 py-2.5 bg-blue-200 text-blue-900 text-sm font-semibold">
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
                className="flex-1 px-3 py-2.5 border-none bg-transparent text-sm text-blue-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-blue-200 text-sm text-blue-900 bg-blue-50"
            />
          </div>

          {error && (
            <div className="text-error text-sm text-center bg-red-50 rounded-lg p-2">
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
