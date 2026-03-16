"use client";

import { useRouter } from "next/navigation";
import OTPLogin from "@/components/shared/OTPLogin";

export default function DistributorLoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="text-4xl mb-3">💧</div>
        <h1 className="text-2xl font-bold text-blue-900 mb-1">
          Distributor Portal
        </h1>
        <p className="text-text-mid text-sm">
          Sign in to manage deliveries
        </p>
      </div>

      <OTPLogin
        title="Distributor Sign In"
        onVerified={() => {
          router.push("/distributor/dashboard");
        }}
      />

      <div className="mt-8 text-center">
        <div className="w-12 mx-auto border-t border-blue-200 mb-4" />
        <p className="text-text-light text-xs">
          Need access? Contact{" "}
          <span className="text-blue-500 font-semibold">mimaji.co.ke</span>
        </p>
      </div>
    </div>
  );
}
