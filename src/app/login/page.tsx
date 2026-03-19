"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Building2 } from "lucide-react";

import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/context/AuthContext";
import { initRewards, updateReferralFriendName } from "@/lib/rewards";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, user } = useAuth();

  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const initialCorporate = searchParams.get("corporate") === "true";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Referral code
  const [referralCode, setReferralCode] = useState("");

  // Corporate account fields
  const [isCorporate, setIsCorporate] = useState(initialCorporate);
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  // Track if we just signed up (to init rewards)
  const [justSignedUp, setJustSignedUp] = useState(false);

  // Redirect authenticated users based on role
  useEffect(() => {
    if (!user) return;

    // If user just signed up, init their rewards
    if (justSignedUp) {
      const rewards = initRewards(user.id, referralCode.trim() || undefined);
      updateReferralFriendName(user.id, user.name);
      setJustSignedUp(false);
    }

    const redirect = searchParams.get("redirect");
    if (redirect) {
      router.push(redirect);
    } else if (user.role === "vendor") {
      router.push("/vendor-portal");
    } else {
      router.push("/dashboard");
    }
  }, [user, router, searchParams, justSignedUp, referralCode]);

  const handleLogin = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 9) {
      setError("Please enter a valid phone number");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    const result = await login(cleaned, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    // Redirect is handled by the useEffect below once user state updates
  };

  const handleSignup = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 9) {
      setError("Please enter a valid phone number");
      return;
    }
    if (name.trim().length < 2) {
      setError("Please enter your name");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (isCorporate && businessName.trim().length < 2) {
      setError("Please enter your business name");
      return;
    }

    setError("");
    setLoading(true);

    const result = await signup(cleaned, password, name.trim(), referralCode.trim() || undefined);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Flag that we just signed up so the useEffect will init rewards (for mock mode)
    setJustSignedUp(true);
  };

  const handleSubmit = () => {
    if (mode === "login") handleLogin();
    else handleSignup();
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title={mode === "login" ? "Log In" : "Sign Up"} />

      <div className="flex flex-col items-center justify-center px-6 pt-16 max-w-md mx-auto md:max-w-lg">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <img src={logo1.src} alt="MiMaji" className="h-10 w-auto" />
        </div>

        {/* Mode Toggle */}
        <div className="flex w-full max-w-sm bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              mode === "login" ? "bg-white text-primary shadow-sm" : "text-text-secondary"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              mode === "signup" ? "bg-white text-primary shadow-sm" : "text-text-secondary"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="w-full max-w-sm">
          {/* Phone */}
          <label className="block text-sm font-medium text-text-primary mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(""); }}
            placeholder="07XX XXX XXX"
            className="rounded-xl border border-gray-200 h-12 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary"
          />

          {/* Name (signup only) */}
          {mode === "signup" && (
            <>
              <label className="block text-sm font-medium text-text-primary mb-2 mt-4">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Enter your name"
                className="rounded-xl border border-gray-200 h-12 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary"
              />
            </>
          )}

          {/* Password */}
          <label className="block text-sm font-medium text-text-primary mb-2 mt-4">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Enter your password"}
              className="rounded-xl border border-gray-200 h-12 px-4 pr-12 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Referral Code (signup only) */}
          {mode === "signup" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Referral Code <span className="text-text-secondary font-normal text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. MAJI123ABC"
                className="rounded-xl border border-gray-200 h-12 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary font-mono"
              />
              <p className="text-text-secondary text-xs mt-1">Got a code from a friend? Enter it to both get 5L free!</p>
            </div>
          )}

          {/* Corporate Account Checkbox (signup only) */}
          {mode === "signup" && (
            <div className="mt-5">
              <label
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  isCorporate
                    ? "border-primary bg-primary-light"
                    : "border-gray-200 bg-surface hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isCorporate}
                  onChange={(e) => setIsCorporate(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-[#2979C1]"
                />
                <Building2 size={20} className={isCorporate ? "text-primary" : "text-text-secondary"} />
                <div>
                  <p className={`text-sm font-bold ${isCorporate ? "text-primary" : "text-text-primary"}`}>
                    Set Up Corporate Account
                  </p>
                  <p className="text-text-secondary text-xs">For business invoicing & bulk orders</p>
                </div>
              </label>

              {isCorporate && (
                <div className="mt-3 bg-surface border border-primary/20 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => { setBusinessName(e.target.value); setError(""); }}
                      placeholder="Enter your business name"
                      className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Registration Number <span className="text-text-secondary font-normal text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. PVT-12345678"
                      className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm"
                    />
                  </div>
                  <p className="text-text-secondary text-xs">
                    Corporate accounts receive business invoices with your company details.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Remember Me */}
          {mode === "login" && (
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-secondary">Remember me</span>
            </label>
          )}

          {error && <p className="text-cta-alt text-xs mt-3">{error}</p>}

          <Button fullWidth className="mt-5" onClick={handleSubmit} disabled={loading}>
            {loading
              ? (mode === "login" ? "Logging in..." : "Creating account...")
              : (mode === "login" ? "Log In" : "Create Account")}
          </Button>

          <p className="text-text-secondary text-xs text-center mt-4">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="text-primary font-semibold"
            >
              {mode === "login" ? "Sign Up" : "Log In"}
            </button>
          </p>

          {mode === "login" && (
            <div className="mt-6 bg-primary-light rounded-xl p-4">
              <p className="text-primary text-xs font-semibold mb-2">Demo Accounts</p>
              <div className="flex flex-col gap-1.5">
                <p className="text-text-secondary text-xs">
                  Admin: <span className="font-mono font-medium text-text-primary">0700000000</span> / <span className="font-mono font-medium text-text-primary">admin123</span>
                </p>
                <p className="text-text-secondary text-xs">
                  Vendor: <span className="font-mono font-medium text-text-primary">0711000000</span> / <span className="font-mono font-medium text-text-primary">vendor123</span>
                </p>
              </div>
            </div>
          )}
        </div>
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
