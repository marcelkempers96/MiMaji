"use client";

import { useState } from "react";
import { Droplets, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";

export default function VendorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    // For now, allow any login to go to vendor portal
    router.push("/vendor-portal");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
            <label className="text-sm font-medium text-text-primary mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="vendor@example.com"
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

          <Button variant="primary" fullWidth type="submit">
            <LogIn size={18} className="mr-2" />
            Log In
          </Button>
        </form>

        <p className="text-center text-text-secondary text-xs mt-6">
          Want to become a vendor?{" "}
          <Link href="/contact" className="text-primary font-semibold">Contact Us</Link>
        </p>
      </div>
    </div>
  );
}
