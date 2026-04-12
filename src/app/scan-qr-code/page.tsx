"use client";

import { logo1 } from "@/assets/images";
import {
  QrCode,
  Camera,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Smartphone,
  Package,
  Info,
} from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";

export default function ScanQRCodePage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Scan QR Code" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">
          <PageContent />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-3xl mx-auto px-8 py-12">
          <PageContent desktop />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function PageContent({ desktop }: { desktop?: boolean }) {
  return (
    <>
      {/* Scanner Area */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 md:p-10 text-white mb-6 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-4">
            <span className="text-white text-xs font-bold uppercase tracking-wide">Coming Soon</span>
          </div>
          <h1 className={`font-extrabold mb-3 ${desktop ? "text-4xl" : "text-2xl"}`}>
            Scan Your Water Passport
          </h1>
          <p className={`text-white/80 mb-6 max-w-lg mx-auto ${desktop ? "text-base" : "text-sm"}`}>
            Point your camera at the QR code on any MiMaji bottle to instantly see where your water comes from, lab test results, and verification status.
          </p>

          {/* Scanner frame mockup */}
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
            <div className={`relative bg-black/30 rounded-2xl overflow-hidden ${desktop ? "w-64 h-64" : "w-48 h-48"} flex items-center justify-center`}>
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              {/* Scanner icon */}
              <QrCode size={desktop ? 80 : 60} className="text-white/60" />
              {/* Scanning line */}
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-[#2ECC71] shadow-[0_0_12px_#2ECC71]" />
            </div>
          </div>

          <button
            disabled
            className="inline-flex items-center gap-2 bg-white/20 text-white/70 rounded-full px-6 py-3 text-sm font-semibold cursor-not-allowed"
          >
            <Camera size={16} />
            Open Camera to Scan
          </button>
          <p className="text-white/60 text-xs mt-3">Camera scanning launches with our next update</p>
        </div>
      </div>

      {/* New User Notice */}
      <div className="bg-gradient-to-r from-[#FFF5EC] to-[#FFE8D4] rounded-2xl p-5 md:p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Package size={22} className="text-[#E8544E]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-text-primary text-base md:text-lg mb-1">
              No bottle to scan yet?
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Order today to get started. Every MiMaji bottle arrives with a unique QR code that links you to its full Water Passport — vendor, source, lab test results, and KEBS certification.
            </p>
            <Link
              href="/buy"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold rounded-full px-5 py-2.5 text-sm hover:bg-[#1a5a9a] transition-colors"
            >
              Order Your First Jug
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Before & After impact */}
      <figure className="mb-6">
        <img
          src="/qrcode-before-and-after-impact-of-using-mimaji-tool.png"
          alt="Before and after the impact of using the MiMaji QR code water verification tool"
          loading="lazy"
          className="w-full rounded-2xl shadow-card object-cover"
        />
        <figcaption className="text-text-secondary text-xs italic text-center mt-2">
          Before MiMaji: you trust the label. After MiMaji: you see the lab results, the vendor, and the source.
        </figcaption>
      </figure>

      {/* How to Scan */}
      <div className="bg-surface shadow-card rounded-2xl p-5 md:p-6 mb-6">
        <h3 className="font-bold text-text-primary text-base md:text-lg mb-4">How scanning will work</h3>
        <img
          src="/qr-code-how-it-works-step-by-step.png"
          alt="Step by step diagram of how the MiMaji QR code works, from scan to Water Passport"
          loading="lazy"
          className="w-full rounded-xl mb-5 object-cover"
        />
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">Find the QR sticker</p>
              <p className="text-text-secondary text-xs">
                Every MiMaji jug and bottle carries a branded QR sticker on the label.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">Tap to open camera</p>
              <p className="text-text-secondary text-xs">
                Use the button above to launch your phone&apos;s camera and point it at the code.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">See your Water Passport</p>
              <p className="text-text-secondary text-xs">
                Vendor, source, bottling date, TDS, pH, lab test, and KEBS status appear instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What the Water Passport shows */}
      <div className="bg-surface shadow-card rounded-2xl p-5 md:p-6 mb-6">
        <h3 className="font-bold text-text-primary text-base md:text-lg mb-3">What you&apos;ll see in the app</h3>
        <p className="text-text-secondary text-sm mb-4">
          After a scan, the MiMaji Water Passport opens and shows the vendor,
          water source, lab test results, and KEBS certification for that
          specific jug.
        </p>
        <img
          src="/qr-code-function-information-shown-in-the-app.png"
          alt="MiMaji QR code Water Passport showing vendor, source, lab results, and KEBS certification"
          loading="lazy"
          className="w-full rounded-xl object-cover"
        />
        <div className="mt-4 text-center">
          <Link
            href="/blog/the-story-behind-the-mimaji-qr-code"
            className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
          >
            Read the full story of the MiMaji QR code &rarr;
          </Link>
        </div>
      </div>

      {/* Already ordered notice */}
      <div className="bg-primary-light rounded-2xl p-5 md:p-6 mb-6">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-text-primary text-sm mb-1">Already ordered from MiMaji?</p>
            <p className="text-text-secondary text-sm mb-3">
              Your water quality information is already available inside the app. Check any recent order to see the full Water Passport — no scanning required.
            </p>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
            >
              View My Orders &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Learn more */}
      <div className="bg-surface shadow-card rounded-2xl p-5 md:p-6 text-center">
        <Droplets size={28} className="text-primary mx-auto mb-3" />
        <h3 className="font-bold text-text-primary text-base md:text-lg mb-2">
          Want to learn more?
        </h3>
        <p className="text-text-secondary text-sm mb-4 max-w-md mx-auto">
          Read how MiMaji verifies every vendor on our platform and why we built the Water Passport system.
        </p>
        <Link
          href="/know-your-water"
          className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
        >
          <ShieldCheck size={16} />
          Read: Know Your Water
        </Link>
      </div>
    </>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <img src={logo1.src} alt="MiMaji" className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/products" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Products</Link>
          <Link href="/know-your-water" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Know Your Water</Link>
          <Link href="/scan-qr-code" className="text-primary font-medium text-sm">Scan QR Code</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">
            <Smartphone size={14} className="inline-block mr-1" />
            Log In
          </Link>
        </nav>
      </div>
    </header>
  );
}
