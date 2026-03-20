"use client";

import { logo1 } from "@/assets/images";
import { Smartphone, CreditCard, Plus, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import DesktopFooter from "@/components/layout/DesktopFooter";

export default function PaymentMethodsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (!authLoading && !user) {
    router.push("/login?redirect=/payment-methods");
    return null;
  }

  const content = (
    <>
      <p className="text-text-secondary text-sm mb-4">Manage your payment methods for faster checkout.</p>

      {/* M-PESA - Primary */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-3 border-2 border-[#2ECC71]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
            <Smartphone size={24} className="text-[#2ECC71]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-text-primary">M-PESA</p>
              <span className="bg-[#E8F5E9] text-[#2ECC71] text-[10px] px-2 py-0.5 rounded-full font-semibold">Default</span>
            </div>
            <p className="text-text-secondary text-sm">{user?.phone || "Not set"}</p>
            <p className="text-text-secondary text-xs mt-0.5">STK push payments</p>
          </div>
          <CheckCircle2 size={20} className="text-[#2ECC71]" />
        </div>
      </div>

      {/* M-PESA Pay via App */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
            <CreditCard size={24} className="text-[#2ECC71]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-text-primary">Pay via M-PESA App</p>
            <p className="text-text-secondary text-sm">Paybill / Till number</p>
            <p className="text-text-secondary text-xs mt-0.5">Manual payment via M-PESA app</p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-[#FFF5EC] rounded-xl p-4 mt-5">
        <p className="text-text-primary text-sm font-semibold mb-1">About M-PESA Payments</p>
        <p className="text-text-secondary text-xs leading-relaxed">
          MiMaji accepts payments exclusively through M-PESA. You can either receive an STK push to your registered phone number, or pay manually via the M-PESA app using our Paybill/Till number.
        </p>
      </div>

      {/* Change M-PESA number link */}
      <Link
        href="/account-settings"
        className="flex items-center justify-center gap-2 mt-5 text-primary text-sm font-semibold"
      >
        Change M-PESA Number
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="md:hidden">
        <TopBar title="Payment Methods" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
      </div>

      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Payment Methods</h1>
          {content}
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/profile" className="text-primary font-medium text-sm">Account</Link>
        </nav>
      </div>
    </header>
  );
}

