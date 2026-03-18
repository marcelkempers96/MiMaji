"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Droplets } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = () => {
    if (phone.trim().length > 0) {
      setStep("otp");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = () => {
    login(phone, "Jane");
    const redirect = searchParams.get("redirect");
    router.push(redirect || "/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Log In" />

      <div className="flex flex-col items-center justify-center px-6 pt-20">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <Droplets size={48} className="text-primary" />
          <span className="text-[24px] font-bold text-primary">MiMaji</span>
        </div>

        {/* Phone Input */}
        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            className="rounded-xl border border-gray-200 h-12 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary"
          />

          {step === "phone" && (
            <Button
              fullWidth
              className="mt-4"
              onClick={handleSendOtp}
            >
              Send OTP
            </Button>
          )}
        </div>

        {/* OTP Section */}
        {step === "otp" && (
          <div className="w-full max-w-sm mt-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Enter OTP
            </label>
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-200 text-center text-xl font-bold text-text-primary outline-none focus:border-primary"
                />
              ))}
            </div>
            <Button
              fullWidth
              className="mt-4"
              onClick={handleVerify}
            >
              Verify
            </Button>
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
