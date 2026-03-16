"use client";

import { useState, useRef, KeyboardEvent } from "react";
import Button from "./Button";

interface OTPLoginProps {
  onVerified: (phone: string) => void;
  title?: string;
}

export default function OTPLogin({
  onVerified,
  title = "Sign in with your phone",
}: OTPLoginProps) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOTP = async () => {
    if (phone.length < 9) return;
    setLoading(true);
    // In production: call Supabase Auth signInWithOtp
    await new Promise((r) => setTimeout(r, 1000));
    setOtpSent(true);
    setLoading(false);
    setCountdown(45);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (newOtp.every((d) => d !== "")) {
        handleVerify(newOtp.join(""));
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    setLoading(true);
    const otpCode = code || otp.join("");
    // In production: call Supabase Auth verifyOtp
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onVerified(`254${phone}`);
    console.log("OTP verified:", otpCode);
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl p-6 shadow-md border border-blue-200">
      <h2 className="font-display font-bold text-xl text-blue-900 text-center mb-1">
        {title}
      </h2>

      {!otpSent ? (
        <>
          <p className="text-text-mid text-sm text-center mb-6">
            We&apos;ll send a verification code to your phone
          </p>
          <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="flex border-[1.5px] border-blue-200 rounded-xl overflow-hidden mb-4">
            <span className="px-3 py-2.5 bg-blue-200 text-blue-900 text-sm font-semibold">
              +254
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
              }
              placeholder="712 345 678"
              className="flex-1 px-3 py-2.5 text-sm bg-blue-50 border-none text-blue-900"
            />
          </div>
          <Button
            size="lg"
            onClick={handleSendOTP}
            loading={loading}
            disabled={phone.length < 9}
          >
            Send verification code
          </Button>
        </>
      ) : (
        <>
          <p className="text-text-mid text-sm text-center mb-6">
            Enter the 6-digit code sent to
            <br />
            <strong className="text-blue-700">+254 {phone.slice(0, 3)} *** ***</strong>
          </p>
          <div className="flex gap-2 justify-center mb-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOTPChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-bold border-[1.5px] border-blue-200 rounded-lg bg-blue-50 text-blue-900"
              />
            ))}
          </div>
          <Button
            size="lg"
            onClick={() => handleVerify()}
            loading={loading}
            disabled={otp.some((d) => d === "")}
          >
            Verify
          </Button>
          <div className="text-center mt-3">
            {countdown > 0 ? (
              <span className="text-text-light text-xs">
                Resend code ({Math.floor(countdown / 60)}:
                {(countdown % 60).toString().padStart(2, "0")})
              </span>
            ) : (
              <button
                onClick={handleSendOTP}
                className="text-blue-500 text-xs font-semibold"
              >
                Resend code
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
