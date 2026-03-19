"use client";

import { logo1 } from "@/assets/images";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const redirect = searchParams.get("redirect");
    router.push(redirect || "/dashboard");
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

    setError("");
    setLoading(true);

    const result = await signup(cleaned, password, name.trim());
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const redirect = searchParams.get("redirect");
    router.push(redirect || "/dashboard");
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
