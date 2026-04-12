"use client";

import {
  logo1,
  qrCodeBeforeAfterImpact,
  qrCodeFunctionInfo,
  qrCodeHowItWorks,
} from "@/assets/images";
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  ClipboardCheck,
  Droplets,
  FileCheck,
  FlaskConical,
  MapPin,
  Calendar,
  BadgeCheck,
  ChevronRight,
  ArrowRight,
  ScanLine,
  Eye,
} from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";

export default function KnowYourWaterPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Know Your Water" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">
          <PageContent />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-5xl mx-auto px-8 py-12">
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
      <HeroSection desktop={desktop} />
      <BeforeAfterImpact desktop={desktop} />
      <HowItWorks desktop={desktop} />
      <WaterPassport desktop={desktop} />
      <WhyWeBuiltThis desktop={desktop} />
      <TrustStrip desktop={desktop} />
      <FAQSection desktop={desktop} />
      <BottomCTA desktop={desktop} />
    </>
  );
}

/* ─── Hero Section ─── */
function HeroSection({ desktop }: { desktop?: boolean }) {
  return (
    <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 md:p-10 text-white mb-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-6 right-8 w-32 h-32 rounded-full border-4 border-white/30" />
        <div className="absolute bottom-4 left-6 w-20 h-20 rounded-full border-2 border-white/20" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Droplets size={24} />
          </div>
          <span className="text-white/70 text-sm font-semibold uppercase tracking-wide">Know Your Water</span>
        </div>
        <h1 className={`font-extrabold leading-tight mb-4 ${desktop ? "text-5xl" : "text-3xl"}`}>
          Every Drop, Verified.
        </h1>
        <p className={`text-white/80 mb-6 max-w-xl ${desktop ? "text-lg" : "text-sm"}`}>
          MiMaji is the only water delivery platform in Nairobi that shows you exactly where your water comes from, when it was bottled, and that it&apos;s been tested safe. Scan. Verify. Drink with confidence.
        </p>
        <Link
          href="/buy"
          className="inline-flex items-center gap-2 bg-white text-primary font-bold rounded-full px-6 py-3 text-sm hover:bg-white/90 transition-colors"
        >
          Order Verified Water
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

/* ─── Before / After Impact ─── */
function BeforeAfterImpact({ desktop }: { desktop?: boolean }) {
  return (
    <div className="mb-8">
      <h2 className={`font-extrabold text-text-primary mb-2 ${desktop ? "text-3xl" : "text-xl"}`}>
        Before and After MiMaji
      </h2>
      <p className="text-text-secondary text-sm mb-5">
        Before MiMaji, you trusted the label on the jug. After MiMaji, you see the vendor, the source, and the lab results &mdash; in seconds.
      </p>
      <figure className="bg-surface shadow-card rounded-2xl overflow-hidden">
        <img
          src={qrCodeBeforeAfterImpact.src}
          alt="Before and after impact of using the MiMaji QR code water verification tool"
          loading="lazy"
          className="w-full object-cover"
        />
        <figcaption className="text-text-secondary text-xs italic text-center px-4 py-3">
          The difference a single scan makes for every Nairobi household.
        </figcaption>
      </figure>
    </div>
  );
}

/* ─── How It Works ─── */
function HowItWorks({ desktop }: { desktop?: boolean }) {
  const steps = [
    {
      icon: <ClipboardCheck size={24} className="text-primary" />,
      title: "We Verify the Source",
      description:
        "Before any vendor joins MiMaji, we collect their water source location, KEBS certification, and latest lab test results. No paperwork, no platform access. If you can\u2019t prove your water is safe, you\u2019re not on MiMaji.",
    },
    {
      icon: <QrCode size={24} className="text-primary" />,
      title: "Every Bottle Gets a QR Code",
      description:
        "Every jug and bottle delivered through MiMaji carries a branded MiMaji QR sticker. It\u2019s your direct link to the water\u2019s story \u2013 not marketing fluff, but real data.",
    },
    {
      icon: <ScanLine size={24} className="text-primary" />,
      title: "Scan and See Everything",
      description:
        "Open the MiMaji app, point your camera at the QR code, and instantly see your Water Passport: vendor name, water source, bottling date, TDS and pH levels, last lab test date, and verification status. All in one screen.",
    },
    {
      icon: <Eye size={24} className="text-primary" />,
      title: "It\u2019s Already in Your Orders",
      description:
        "Don\u2019t want to scan? No problem. Every order in the MiMaji app shows the same water quality information on your orders page automatically. Transparency isn\u2019t a feature you activate \u2013 it\u2019s the default.",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className={`font-extrabold text-text-primary mb-2 ${desktop ? "text-3xl" : "text-xl"}`}>
        How &ldquo;Know Your Water&rdquo; Works
      </h2>
      <p className="text-text-secondary text-sm mb-6">
        We built something no other water delivery service in Nairobi offers: a way to verify your water before you drink it.
      </p>
      <figure className="mb-6">
        <img
          src={qrCodeHowItWorks.src}
          alt="Step by step diagram of how the MiMaji QR code works, from scan to Water Passport"
          loading="lazy"
          className="w-full rounded-2xl shadow-card object-cover"
        />
        <figcaption className="text-text-secondary text-xs italic text-center mt-2">
          Scan, verify, drink &mdash; the three steps from sticker to certainty.
        </figcaption>
      </figure>
      <div className={`grid gap-4 ${desktop ? "grid-cols-2" : "grid-cols-1"}`}>
        {steps.map((step, i) => (
          <div
            key={i}
            className="bg-surface shadow-card rounded-2xl p-5 md:p-6 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">{i + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  {step.icon}
                  <h3 className="font-bold text-text-primary text-base">{step.title}</h3>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Water Passport ─── */
function WaterPassport({ desktop }: { desktop?: boolean }) {
  const fields = [
    { icon: <BadgeCheck size={16} />, label: "Vendor name and verification status" },
    { icon: <MapPin size={16} />, label: "Water source type and location (e.g. Borehole \u2013 Ruiru, Kiambu County)" },
    { icon: <Calendar size={16} />, label: "Bottling or refill date" },
    { icon: <Droplets size={16} />, label: "TDS (Total Dissolved Solids) reading with WHO safe range" },
    { icon: <FlaskConical size={16} />, label: "pH level with WHO safe range" },
    { icon: <FileCheck size={16} />, label: "Last lab test date and testing lab name" },
    { icon: <ShieldCheck size={16} />, label: "KEBS certification status" },
  ];

  return (
    <div className="mb-8">
      <h2 className={`font-extrabold text-text-primary mb-2 ${desktop ? "text-3xl" : "text-xl"}`}>
        What You&apos;ll See: Your Water Passport
      </h2>
      <p className="text-text-secondary text-sm mb-5">
        When you scan the QR code or tap into any order, you&apos;ll see a Water Passport with:
      </p>

      {/* In-app screenshot */}
      <figure className="mb-5">
        <img
          src={qrCodeFunctionInfo.src}
          alt="MiMaji QR code Water Passport showing vendor, source, lab results, and KEBS certification inside the app"
          loading="lazy"
          className="w-full rounded-2xl shadow-card object-cover"
        />
        <figcaption className="text-text-secondary text-xs italic text-center mt-2">
          The Water Passport as it appears inside the MiMaji app after a scan.
        </figcaption>
      </figure>

      {/* Water Passport Card */}
      <div className="bg-surface shadow-card rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-[#1a5a9a] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-white" />
            <span className="text-white font-bold text-sm">Water Passport</span>
          </div>
          <span className="inline-flex items-center gap-1 bg-[#2ECC71] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <ShieldCheck size={12} />
            Verified Partner
          </span>
        </div>
        <div className="p-5">
          {/* Example data */}
          <div className="grid gap-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Vendor</span>
              <span className="font-semibold text-text-primary">Chema Waters</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-[#E0E0E0] pt-3">
              <span className="text-text-secondary">Source</span>
              <span className="font-semibold text-text-primary">Borehole &ndash; Ruiru</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-[#E0E0E0] pt-3">
              <span className="text-text-secondary">Bottled</span>
              <span className="font-semibold text-text-primary">10 April 2026</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-[#E0E0E0] pt-3">
              <span className="text-text-secondary">TDS</span>
              <span className="font-semibold text-[#2ECC71]">180 ppm &ndash; Safe</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-[#E0E0E0] pt-3">
              <span className="text-text-secondary">pH</span>
              <span className="font-semibold text-[#2ECC71]">7.2 &ndash; Safe</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-[#E0E0E0] pt-3">
              <span className="text-text-secondary">Lab Test</span>
              <span className="font-semibold text-text-primary">1 Mar 2026 &ndash; SGS Kenya</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-[#E0E0E0] pt-3">
              <span className="text-text-secondary">KEBS</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#2ECC71]">
                <ShieldCheck size={14} />
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Field descriptions */}
      <div className="mt-5 space-y-2.5">
        {fields.map((field, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="text-primary flex-shrink-0 mt-0.5">{field.icon}</div>
            <p className="text-text-secondary text-sm">{field.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Why We Built This ─── */
function WhyWeBuiltThis({ desktop }: { desktop?: boolean }) {
  return (
    <div className="bg-gradient-to-r from-[#EAF2FB] to-[#D4E8FA] rounded-2xl p-5 md:p-8 mb-8">
      <h2 className={`font-extrabold text-text-primary mb-3 ${desktop ? "text-2xl" : "text-lg"}`}>
        Why We Built This
      </h2>
      <p className="text-text-primary text-sm md:text-base leading-relaxed mb-4">
        In Nairobi, you don&apos;t always know where your water comes from. You trust the vendor, hope the jug is clean, and drink. We think you deserve better.
      </p>
      <p className="text-text-primary text-sm md:text-base leading-relaxed mb-4">
        MiMaji&apos;s &ldquo;Know Your Water&rdquo; feature means every single delivery is backed by real data &ndash; real source, real test results, real accountability.
      </p>
      <p className="text-text-secondary text-sm leading-relaxed">
        We&apos;re not a water brand. We&apos;re a platform that makes sure every vendor on our platform proves they&apos;re safe. That&apos;s the difference.
      </p>
    </div>
  );
}

/* ─── Trust Signals Strip ─── */
function TrustStrip({ desktop }: { desktop?: boolean }) {
  const signals = [
    {
      icon: <ShieldCheck size={28} className="text-primary" />,
      text: "Every vendor verified before they join.",
    },
    {
      icon: <FlaskConical size={28} className="text-primary" />,
      text: "Real lab test data. Not marketing claims.",
    },
    {
      icon: <Smartphone size={28} className="text-primary" />,
      text: "Scan any bottle. See for yourself.",
    },
  ];

  return (
    <div className={`bg-primary-light rounded-2xl p-5 md:p-6 mb-8 ${desktop ? "flex items-center justify-between" : "space-y-4"}`}>
      {signals.map((signal, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-card">
            {signal.icon}
          </div>
          <p className="text-text-primary font-semibold text-sm">{signal.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── FAQ Section ─── */
function FAQSection({ desktop }: { desktop?: boolean }) {
  const faqs = [
    {
      q: "Do I have to scan the QR code every time?",
      a: "No. The same water quality information is shown automatically in your order details inside the MiMaji app. The QR code is an extra physical verification step if you want it.",
    },
    {
      q: "Where does MiMaji get the water quality data?",
      a: "We collect lab test reports, KEBS certifications, and source information directly from each vendor before they\u2019re approved to sell on MiMaji. This data is updated whenever vendors renew their certifications.",
    },
    {
      q: "What if a vendor\u2019s test results are bad?",
      a: "They don\u2019t make it onto the platform. MiMaji only partners with vendors who can provide valid documentation. If a vendor\u2019s certification lapses, their listings are paused until they provide updated proof.",
    },
    {
      q: "Is this the same as testing the actual water in my bottle?",
      a: "The Water Passport shows the most recent lab test data for your vendor\u2019s water source \u2013 not a per-bottle test. Think of it as verifying the source and the standards, which is more than any other delivery platform in Nairobi provides.",
    },
    {
      q: "Can I use this without the app?",
      a: "Yes. Scanning the QR code opens a web page in your phone\u2019s browser if you don\u2019t have the MiMaji app installed. You\u2019ll see the same Water Passport information.",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className={`font-extrabold text-text-primary mb-5 ${desktop ? "text-3xl" : "text-xl"}`}>
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="bg-surface shadow-card rounded-xl overflow-hidden group">
            <summary className="px-4 py-4 flex items-center justify-between cursor-pointer list-none">
              <span className="font-medium text-sm text-text-primary pr-4">{faq.q}</span>
              <ChevronRight size={16} className="text-text-secondary flex-shrink-0 transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-4 pb-4">
              <p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

/* ─── Bottom CTA ─── */
function BottomCTA({ desktop }: { desktop?: boolean }) {
  return (
    <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 md:p-10 text-white text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <QrCode size={200} className="text-white" />
      </div>
      <div className="relative z-10">
        <Droplets size={32} className="mx-auto mb-4" />
        <h2 className={`font-extrabold mb-3 ${desktop ? "text-3xl" : "text-2xl"}`}>
          Your water should come with proof.
        </h2>
        <p className={`text-white/80 mb-6 max-w-lg mx-auto ${desktop ? "text-base" : "text-sm"}`}>
          Order through MiMaji and know exactly what you&apos;re drinking. Every bottle verified. Every delivery transparent.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/buy"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold rounded-full px-6 py-3 text-sm hover:bg-white/90 transition-colors"
          >
            Get Started
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/about"
            className="text-white/70 text-sm font-semibold hover:text-white transition-colors"
          >
            Learn more about how we verify vendors &rarr;
          </Link>
        </div>
      </div>
    </div>
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
          <Link href="/know-your-water" className="text-primary font-medium text-sm">Know Your Water</Link>
          <Link href="/blog" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Blog</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}
