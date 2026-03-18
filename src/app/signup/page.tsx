"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";
import { useAuth } from "@/lib/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    mpesaSameAsPhone: true,
    mpesaNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const canSubmit =
    form.fullName &&
    form.phone.length >= 9 &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword &&
    (form.mpesaSameAsPhone || form.mpesaNumber.length >= 9);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const result = await signup({
      fullName: form.fullName,
      phone: form.phone,
      password: form.password,
      address: form.address,
      mpesaNumber: form.mpesaSameAsPhone ? `254${form.phone}` : `254${form.mpesaNumber}`,
    });
    setLoading(false);
    if (result.success) {
      const redirect = localStorage.getItem("mimaji-redirect");
      if (redirect) {
        localStorage.removeItem("mimaji-redirect");
        router.push(redirect);
      } else {
        router.push("/");
      }
    } else {
      setError(result.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar minimal />

      <div className="px-4 py-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-1">
            Create your account
          </h1>
          <p className="text-text-mid text-sm">
            Sign up to order fresh water in Nairobi
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-4" style={{ boxShadow: "var(--shadow-elevated)" }}>
          <div>
            <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => updateForm("fullName", e.target.value)}
              placeholder="e.g. Jane Wanjiku"
              className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50"
            />
          </div>

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
                value={form.phone}
                onChange={(e) =>
                  updateForm("phone", e.target.value.replace(/\D/g, "").slice(0, 9))
                }
                placeholder="712 345 678"
                className="flex-1 px-3 py-3 border-none bg-transparent text-sm text-blue-900"
              />
            </div>
          </div>

          <div>
            <button
              onClick={() => updateForm("mpesaSameAsPhone", !form.mpesaSameAsPhone)}
              className="w-full p-3 rounded-2xl bg-blue-50 text-left text-sm font-medium flex items-center gap-3 text-text-mid"
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                  form.mpesaSameAsPhone
                    ? "bg-blue-700 text-white"
                    : "border-2 border-blue-200"
                }`}
              >
                {form.mpesaSameAsPhone && "\u2713"}
              </div>
              This is also my M-Pesa number
            </button>

            {!form.mpesaSameAsPhone && (
              <div className="mt-3 animate-fade-in">
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
                  M-Pesa Number
                </label>
                <div className="flex rounded-2xl overflow-hidden bg-blue-50">
                  <span className="px-3 py-3 bg-blue-100 text-blue-900 text-sm font-semibold">
                    +254
                  </span>
                  <input
                    type="tel"
                    value={form.mpesaNumber}
                    onChange={(e) =>
                      updateForm("mpesaNumber", e.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    placeholder="712 345 678"
                    className="flex-1 px-3 py-3 border-none bg-transparent text-sm text-blue-900"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
              Default Delivery Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateForm("address", e.target.value)}
              placeholder="e.g. Kilimani, Nairobi"
              className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateForm("confirmPassword", e.target.value)}
              placeholder="Re-enter your password"
              className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-error text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="text-error text-sm text-center bg-red-50 rounded-2xl p-3">
              {error}
            </div>
          )}

          <Button size="lg" onClick={handleSubmit} loading={loading} disabled={!canSubmit}>
            Create Account
          </Button>

          <p className="text-center text-sm text-text-mid">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-700 font-semibold">
              Log In
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
