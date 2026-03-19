"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

// Dev test account - bypasses OTP
const DEV_PHONE = "0700000000";
const DEV_NAME = "Marcel (Dev)";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "name">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = () => {
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 9) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");

    // Dev account - skip OTP entirely
    if (cleaned === DEV_PHONE || cleaned === "254700000000") {
      login(cleaned, DEV_NAME);
      const redirect = searchParams.get("redirect");
      router.push(redirect || "/dashboard");
      return;
    }

    // For all other users, skip OTP (no OTP service available)
    // Just ask for their name and log them in
    setStep("name");
  };

  const handleLogin = () => {
    if (name.trim().length < 2) {
      setError("Please enter your name");
      return;
    }
    setError("");
    setLoading(true);
    login(phone.replace(/\s/g, ""), name.trim());
    const redirect = searchParams.get("redirect");
    router.push(redirect || "/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Log In" />

      <div className="flex flex-col items-center justify-center px-6 pt-20 max-w-md mx-auto md:max-w-lg">
        {/* Logo */}
        <div className="flex items-center mb-10">
          <Image src="/logo1" alt="MiMaji" width={140} height={50} className="h-10 w-auto" />
        </div>

        {step === "phone" && (
          <div className="w-full max-w-sm">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(""); }}
              placeholder="07XX XXX XXX"
              className="rounded-xl border border-gray-200 h-12 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            />
            {error && <p className="text-cta-alt text-xs mt-2">{error}</p>}

            <Button fullWidth className="mt-4" onClick={handleContinue}>
              Continue
            </Button>

            <p className="text-text-secondary text-xs text-center mt-4">
              We&apos;ll use your phone number to identify your account. No OTP required.
            </p>
          </div>
        )}

        {step === "name" && (
          <div className="w-full max-w-sm">
            <p className="text-text-secondary text-sm mb-4 text-center">
              Logging in as <span className="font-semibold text-text-primary">{phone}</span>
            </p>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Enter your name"
              className="rounded-xl border border-gray-200 h-12 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />
            {error && <p className="text-cta-alt text-xs mt-2">{error}</p>}

            <Button fullWidth className="mt-4" onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>

            <button
              onClick={() => { setStep("phone"); setError(""); }}
              className="w-full text-center text-primary text-sm font-semibold mt-3"
            >
              Change number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
