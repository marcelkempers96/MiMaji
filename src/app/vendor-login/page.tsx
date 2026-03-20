"use client";

import { useState, useEffect } from "react";
import { Droplets, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function VendorLoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect once logged in as vendor
  useEffect(() => {
    if (user) {
      if (user.role === "vendor") {
        router.push("/vendor-portal");
      } else {
        setError("This account is not a vendor account. Please use a vendor login.");
        setLoading(false);
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);

    // Normalize phone number (strip spaces, leading +, handle leading 0)
    let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.slice(1);
    }

    const result = await login(cleaned, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopBar title="Vendor Login" />

      <div className="max-w-md mx-auto md:max-w-lg px-4 pt-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-3">
            <Droplets size={28} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Vendor Portal</h2>
          <p className="text-text-secondary text-sm text-center mt-1">
            Log in to manage your water deliveries
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-text-primary mb-1 block">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(""); }}
              placeholder="0711 000 000"
              className="w-full h-12 px-4 rounded-xl bg-surface border border-[#E0E0E0] text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter your password"
              className="w-full h-12 px-4 rounded-xl bg-surface border border-[#E0E0E0] text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && <p className="text-cta-alt text-xs">{error}</p>}

          <Button variant="primary" fullWidth type="submit" disabled={loading}>
            <LogIn size={18} className="mr-2" />
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="mt-6 bg-primary-light rounded-xl p-4">
          <p className="text-primary text-xs font-semibold mb-1">Demo Vendor Account</p>
          <p className="text-text-secondary text-xs">Phone: <span className="font-mono font-medium text-text-primary">0711000000</span></p>
          <p className="text-text-secondary text-xs">Password: <span className="font-mono font-medium text-text-primary">vendor123</span></p>
        </div>

        <p className="text-center text-text-secondary text-xs mt-6">
          Want to become a vendor?{" "}
          <Link href="/contact" className="text-primary font-semibold">Contact Us</Link>
        </p>
      </div>
    </div>
  );
}
