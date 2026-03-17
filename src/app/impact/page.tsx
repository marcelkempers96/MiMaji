"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";

const stories = [
  {
    title: "Turkana County — Clean Water for Napuu Village",
    description:
      "Through MiMaji donations, 500 families in Napuu village now have access to clean water. Previously, women and children walked over 5km daily to fetch water from contaminated sources.",
    litres: "12,000",
    families: "500",
  },
  {
    title: "Garissa — School Water Program",
    description:
      "MiMaji partnered with 3 schools in Garissa County to install water purification systems. Over 1,200 students now drink clean water every school day.",
    litres: "8,500",
    families: "1,200 students",
  },
  {
    title: "Marsabit — Emergency Drought Relief",
    description:
      "During the 2024 drought, MiMaji dispatched emergency water supplies to Marsabit. Our community of customers helped deliver over 5,000 litres to families in need.",
    litres: "5,000",
    families: "200",
  },
  {
    title: "Kitui — Community Borehole Project",
    description:
      "MiMaji funded the drilling of a community borehole in Kitui, providing sustainable water access for an entire sub-location of over 2,000 people.",
    litres: "25,000+",
    families: "2,000+",
  },
];

const stats = [
  { value: "50,500", label: "Litres donated" },
  { value: "3,900", label: "Families reached" },
  { value: "8", label: "Counties served" },
  { value: "15", label: "Partner organisations" },
];

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-50 to-bg px-5 pt-10 pb-12">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">Our Impact</h1>
        <p className="text-text-mid text-sm leading-relaxed">
          Every order makes a difference
        </p>
      </div>

      {/* Pledge */}
      <div className="-mt-5 mx-4 bg-white rounded-2xl p-6 relative z-10 mb-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <p className="text-text-mid text-sm leading-relaxed text-center">
          For every <strong className="text-blue-900">100 litres</strong> ordered
          through MiMaji, we donate{" "}
          <strong className="text-blue-700">5 litres</strong> to organisations
          across Kenya serving communities facing severe drought and lack of
          water access infrastructure.
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 mb-8">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 text-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="text-xl font-bold text-blue-900 mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs text-text-mid">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stories */}
      <div className="px-4 mb-8">
        <h2 className="text-lg font-bold text-blue-900 mb-4">
          Stories of Impact
        </h2>
        <div className="space-y-4">
          {stories.map((story) => (
            <div
              key={story.title}
              className="bg-white rounded-2xl p-5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h3 className="font-bold text-blue-900 text-sm mb-2">
                {story.title}
              </h3>
              <p className="text-text-mid text-sm leading-relaxed mb-3">
                {story.description}
              </p>
              <div className="flex gap-3 text-xs">
                <div className="bg-blue-50 rounded-full px-3 py-1.5">
                  <span className="font-bold text-blue-700">{story.litres}</span>
                  <span className="text-text-mid"> litres</span>
                </div>
                <div className="bg-blue-50 rounded-full px-3 py-1.5">
                  <span className="font-bold text-blue-700">{story.families}</span>
                  <span className="text-text-mid"> reached</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How you help */}
      <div className="mx-4 mb-8 bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <h2 className="font-bold text-blue-900 text-lg mb-3">
          How your order helps
        </h2>
        <div className="space-y-3">
          {[
            { qty: "5 jugs (100L)", donation: "5 litres donated" },
            { qty: "10 jugs (200L)", donation: "10 litres donated" },
            { qty: "50 jugs (1,000L)", donation: "50 litres donated" },
          ].map((tier) => (
            <div
              key={tier.qty}
              className="bg-blue-50 rounded-2xl p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-blue-900 text-sm">
                  {tier.qty}
                </div>
                <div className="text-xs text-text-mid">{tier.donation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner CTA */}
      <div className="mx-4 mb-8 bg-blue-700 rounded-2xl p-6 text-center">
        <h2 className="font-bold text-white text-lg mb-2">
          Partner with us
        </h2>
        <p className="text-blue-200 text-sm mb-4 leading-relaxed">
          Are you an NGO or community organisation working on water access in
          Kenya? We&apos;d love to work with you.
        </p>
        <div className="text-white text-sm mb-4">
          <a href="https://wa.me/254758434076" className="underline">+254 758 434 076</a>
        </div>
        <div className="text-white text-sm mb-4">
          impact@mimaji.co.ke
        </div>
        <Button
          variant="outline"
          className="!border-white !text-white hover:!bg-white/10"
          onClick={() => window.open("https://wa.me/254758434076")}
        >
          Get in touch
        </Button>
      </div>

      <Footer />
    </div>
  );
}
