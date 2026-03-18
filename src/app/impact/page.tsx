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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">Our Impact</h1>
          <p className="text-text-mid text-sm lg:text-base leading-relaxed">
            Water is life. Every order you place helps bring clean water to communities across Kenya.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-5 relative z-10 pb-8">
        {/* Pledge - Updated with correct 10% info */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
          <p className="text-text-mid text-sm leading-relaxed text-center lg:text-base">
            For every <strong className="text-blue-900">100 litres</strong> ordered through MiMaji, we supply{" "}
            <strong className="text-blue-700">10% — that&apos;s 10 litres</strong> — to communities in rural Kenya facing water scarcity.
            That means every time you order 5 jugs, a family somewhere gets a full jug of clean water.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 text-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="text-xl lg:text-2xl font-bold text-blue-900 mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs text-text-mid">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* MajiMap Section */}
        <div className="bg-white rounded-2xl p-6 mb-8" style={{ boxShadow: "var(--shadow-elevated)" }}>
          <div className="lg:flex lg:items-start lg:gap-8">
            <div className="lg:flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-blue-900 text-lg">MajiMap Project</h2>
                  <p className="text-xs text-text-mid">Mapping water access across Kenya</p>
                </div>
              </div>
              <p className="text-text-mid text-sm leading-relaxed mb-4">
                MajiMap is our initiative to map water access points and scarcity zones across Kenya. By combining data from our delivery network, government sources, and community reports, we&apos;re building the most comprehensive water access map in East Africa.
              </p>
              <p className="text-text-mid text-sm leading-relaxed mb-4">
                This data helps us target our 10% pledge where it&apos;s needed most — ensuring that every litre donated reaches communities with the greatest need. Our goal is to map every county in Kenya by 2027.
              </p>
            </div>
            <div className="lg:w-72">
              <div className="bg-blue-50 rounded-2xl p-5">
                <h3 className="font-bold text-blue-900 text-sm mb-3">MajiMap Progress</h3>
                <div className="space-y-2">
                  {[
                    { label: "Counties mapped", value: "8 / 47" },
                    { label: "Water points logged", value: "2,340" },
                    { label: "Communities surveyed", value: "156" },
                    { label: "Data partners", value: "12" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-text-mid">{item.label}</span>
                      <span className="font-bold text-blue-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stories */}
        <h2 className="text-lg font-bold text-blue-900 mb-4">Stories of Impact</h2>
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 mb-8">
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

        {/* How your order helps - Updated with 10% */}
        <div className="bg-white rounded-2xl p-5 mb-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="font-bold text-blue-900 text-lg mb-3">
            How your order helps
          </h2>
          <p className="text-text-mid text-sm mb-4">
            For every 100 litres you order, we donate 10 litres (10%) to rural communities.
          </p>
          <div className="space-y-3">
            {[
              { qty: "5 jugs (100L)", donation: "10 litres donated" },
              { qty: "10 jugs (200L)", donation: "20 litres donated" },
              { qty: "25 jugs (500L)", donation: "50 litres donated" },
              { qty: "50 jugs (1,000L)", donation: "100 litres donated (5 full jugs!)" },
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
                <div className="text-blue-700 font-bold text-xs">10%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner CTA */}
        <div className="bg-blue-700 rounded-2xl p-6 text-center">
          <h2 className="font-bold text-white text-lg mb-2">
            Partner with us
          </h2>
          <p className="text-blue-200 text-sm mb-4 leading-relaxed">
            Are you an NGO or community organisation working on water access in
            Kenya? We&apos;d love to work with you.
          </p>
          <div className="text-white text-sm mb-2">
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
      </div>

      <Footer />
    </div>
  );
}
