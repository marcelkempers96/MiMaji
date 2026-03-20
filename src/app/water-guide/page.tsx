"use client";

import { logo1, test1 } from "@/assets/images";
import {
  Droplets, Shield, AlertTriangle, Beaker, FlaskConical,
  Pipette, Home, ShoppingCart, CheckCircle, MapPin,
  MessageCircle, Phone, Mail, ChevronDown, ChevronUp,
  BookOpen
} from "lucide-react";

import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useState } from "react";

export default function WaterGuidePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Water Guide" showBack={true} />

      {/* Mobile Layout */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <WaterGuideContent />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-4xl mx-auto px-8 py-12">
          <WaterGuideContent />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function CollapsibleSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-surface rounded-2xl shadow-card mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-bold text-text-primary text-sm md:text-base">{title}</h3>
        </div>
        {open ? <ChevronUp size={20} className="text-text-secondary" /> : <ChevronDown size={20} className="text-text-secondary" />}
      </button>
      {open && <div className="px-4 pb-4 md:px-5 md:pb-5">{children}</div>}
    </div>
  );
}

function WaterGuideContent() {
  return (
    <>
      {/* Hero Image */}
      <div className="rounded-2xl overflow-hidden mb-4">
        <img src={test1.src} alt="Clean water for Kenya" className="w-full h-48 md:h-72 object-cover rounded-2xl" />
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 md:p-10 text-white mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Droplets size={28} className="text-white" />
          <h1 className="text-xl md:text-3xl font-extrabold">Your Guide to Safe Drinking Water in Kenya</h1>
        </div>
        <p className="text-white/80 text-sm md:text-base">
          Written by Marcel Kempers &mdash; Founder, MiMaji
        </p>
        <p className="text-white/70 text-sm mt-3 md:text-base leading-relaxed">
          Water is life. It&apos;s the first thing a newborn needs, the foundation of every meal we cook, the quiet backbone of every healthy family. Yet for millions of Kenyans, the simple act of turning on a tap and trusting what comes out is still not a reality.
        </p>
        <p className="text-white/70 text-sm mt-2 md:text-base leading-relaxed">
          I started MiMaji because I believe that no one should have to wonder whether the water they&apos;re drinking is safe. Not a mother in Kibera, not a student in Westlands, not a family in Kitengela. This guide is my way of putting that knowledge in your hands &mdash; because when you understand your water, you can protect the people you love.
        </p>
      </div>

      {/* Why Water Quality Matters */}
      <div className="bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2] rounded-2xl p-5 md:p-8 mb-6">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle size={22} className="text-[#E65100] flex-shrink-0 mt-0.5" />
          <h2 className="font-bold text-text-primary text-lg">Why Water Quality Matters in Nairobi</h2>
        </div>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed">
          Nairobi faces a chronic gap between water demand and supply. When piped water runs dry, many households turn to vendors, boreholes, kiosks, or tankers &mdash; sources whose quality can vary widely. Contaminated water remains one of the leading causes of preventable illness in the city, particularly typhoid, cholera, and dysentery. Knowing how to assess water quality puts the power back in your hands.
        </p>
      </div>

      {/* The Six Key Measures */}
      <h2 className="font-bold text-text-primary text-lg mb-4 flex items-center gap-2">
        <Beaker size={20} className="text-primary" />
        The Six Key Measures of Water Safety
      </h2>

      {/* 1. Bacterial Contamination */}
      <CollapsibleSection
        icon={<div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><Shield size={16} className="text-red-600" /></div>}
        title="1. Bacterial Contamination (E. coli & Coliforms)"
      >
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <div>
            <p className="font-semibold text-text-primary mb-1">What it is</p>
            <p>Escherichia coli (E. coli) is a group of bacteria that naturally live in the intestines of humans and animals. Most strains are harmless, but certain types can cause severe gastrointestinal illness. When E. coli is detected in water, it signals that the water has come into contact with faecal matter &mdash; a warning sign that other dangerous pathogens (such as Salmonella or Vibrio cholerae) may also be present.</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <p className="font-semibold text-red-700 mb-1">Safe level: Zero</p>
            <p className="text-red-600 text-xs">The Kenya Bureau of Standards (KEBS) and the World Health Organization (WHO) both require that drinking water contains no detectable E. coli or total coliforms per 100ml sample.</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">Why it matters in Nairobi</p>
            <p>Broken pipes, illegal connections, and proximity of sewage lines to water mains mean that even piped water can become contaminated. Borehole water is also at risk where pit latrines sit close to the water table.</p>
          </div>
          <div className="bg-primary/5 rounded-xl p-3">
            <p className="font-semibold text-primary mb-1">How MiMaji helps</p>
            <p>Every supplier on MiMaji must demonstrate compliance with KEBS drinking water standards. We conduct periodic spot checks and any supplier whose water tests positive for bacterial contamination is immediately suspended.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* 2. TDS */}
      <CollapsibleSection
        icon={<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Beaker size={16} className="text-blue-600" /></div>}
        title="2. Total Dissolved Solids (TDS)"
      >
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <div>
            <p className="font-semibold text-text-primary mb-1">What it is</p>
            <p>TDS measures the combined concentration of all dissolved minerals, salts, metals, and other inorganic compounds in water. Common contributors include calcium, magnesium, sodium, potassium, chlorides, and sulphates. TDS is expressed in milligrams per litre (mg/L) or parts per million (ppm).</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="font-semibold text-blue-700 mb-1">Safe level</p>
            <p className="text-blue-600 text-xs">The WHO recommends drinking water with TDS below 600 mg/L for good palatability. Water above 1,000 mg/L is generally considered unacceptable. KEBS permits up to 1,500 mg/L, though lower is better.</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">What you&apos;ll notice</p>
            <p>High TDS can make water taste salty, metallic, or bitter. Very low TDS (below 50 mg/L) can taste flat or &ldquo;empty.&rdquo; The ideal range for pleasant-tasting water is typically 100&ndash;400 mg/L.</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">How to check</p>
            <p>Inexpensive TDS meters are available in Nairobi for KSh 500&ndash;1,500. Dip the probe into a glass of water and it gives a reading in seconds. It&apos;s a good first-pass indicator, though it does not detect bacteria.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* 3. pH Level */}
      <CollapsibleSection
        icon={<div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><FlaskConical size={16} className="text-green-600" /></div>}
        title="3. pH Level"
      >
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <div>
            <p className="font-semibold text-text-primary mb-1">What it is</p>
            <p>pH measures how acidic or alkaline water is on a scale from 0 (extremely acidic) to 14 (extremely alkaline), with 7.0 being perfectly neutral. The measurement reflects the concentration of hydrogen ions in the water.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="font-semibold text-green-700 mb-1">Safe level: pH 6.5 &ndash; 8.5</p>
            <p className="text-green-600 text-xs">Both KEBS and the WHO recommend this range. Most Nairobi piped water falls between 6.8 and 7.5.</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">Why it matters</p>
            <p>Water that is too acidic (below 6.5) can corrode metal pipes, releasing harmful metals like lead and copper. Water that is too alkaline (above 8.5) can taste soapy and may reduce the effectiveness of chlorine disinfection. Extremely low or high pH can also irritate skin and eyes.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* 4. Turbidity */}
      <CollapsibleSection
        icon={<div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><Droplets size={16} className="text-amber-600" /></div>}
        title="4. Turbidity"
      >
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <div>
            <p className="font-semibold text-text-primary mb-1">What it is</p>
            <p>Turbidity is a measure of water&apos;s cloudiness or haziness. It is caused by tiny suspended particles &mdash; silt, clay, organic matter, algae, or microscopic organisms &mdash; that scatter light passing through the water. Turbidity is measured in Nephelometric Turbidity Units (NTU).</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <p className="font-semibold text-amber-700 mb-1">Safe level: Below 1 NTU</p>
            <p className="text-amber-600 text-xs">The WHO recommends turbidity below 1 NTU for effective disinfection. KEBS allows up to 5 NTU, though ideally it should be below 1 NTU.</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">Why it matters</p>
            <p>Turbid water is not just unappealing to look at. The suspended particles can shield bacteria from disinfectants (like chlorine), making treatment less effective. High turbidity often indicates that the water source has been disturbed or that filtration has failed.</p>
          </div>
          <div className="bg-surface border border-[#E0E0E0] rounded-xl p-3">
            <p className="font-semibold text-text-primary mb-1">Quick home test</p>
            <p>Fill a clean glass and hold it up to natural light. Safe water should be completely clear with no visible particles. If you can see floating specks, haziness, or a brownish tint, the turbidity is likely too high for safe drinking without treatment.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* 5. Fluoride */}
      <CollapsibleSection
        icon={<div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><Pipette size={16} className="text-purple-600" /></div>}
        title="5. Fluoride"
      >
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <div>
            <p className="font-semibold text-text-primary mb-1">What it is</p>
            <p>Fluoride is a naturally occurring mineral found in rocks, soil, and groundwater. In small amounts, it strengthens tooth enamel and helps prevent cavities. However, excessive fluoride intake over time can cause dental fluorosis (mottled, discoloured teeth) and, in severe cases, skeletal fluorosis (weakened bones and joints).</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="font-semibold text-purple-700 mb-1">Safe level: &le; 1.5 mg/L (WHO)</p>
            <p className="text-purple-600 text-xs">Kenya&apos;s WASREB guidelines allow up to 1.5&ndash;3.0 mg/L, which is notably higher than the international standard. Some borehole water in the Nairobi region and the Rift Valley has been found to contain fluoride levels well above 3 mg/L.</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">What this means for you</p>
            <p>If your primary water source is a borehole, particularly in areas like Ngong, Ongata Rongai, Kitengela, or the Rift Valley corridor, it is worth testing for fluoride specifically. Standard reverse osmosis filtration effectively removes excess fluoride.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* 6. Chlorine Residual */}
      <CollapsibleSection
        icon={<div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center"><Shield size={16} className="text-teal-600" /></div>}
        title="6. Chlorine Residual"
      >
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <div>
            <p className="font-semibold text-text-primary mb-1">What it is</p>
            <p>When water is treated at a plant, chlorine is added to kill bacteria and viruses. A small amount of chlorine remains in the water as it travels through the pipe network &mdash; this is the &ldquo;residual&rdquo; that continues to protect the water from recontamination during distribution.</p>
          </div>
          <div className="bg-teal-50 rounded-xl p-3">
            <p className="font-semibold text-teal-700 mb-1">Safe level: 0.2 &ndash; 0.5 mg/L</p>
            <p className="text-teal-600 text-xs">Water with a strong chlorine smell or taste (above 0.5 mg/L) is still safe but may be unpleasant. Allowing the water to stand in an open container for 30 minutes will dissipate excess chlorine.</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">Why it matters</p>
            <p>If your piped water has zero chlorine residual, it means the protective disinfection has worn off &mdash; and the water may have been recontaminated during its journey through old or broken pipes. This is common in estates far from treatment plants or served by aged infrastructure.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* How to Protect Yourself */}
      <h2 className="font-bold text-text-primary text-lg mt-8 mb-4 flex items-center gap-2">
        <Home size={20} className="text-primary" />
        How to Protect Yourself
      </h2>

      {/* At Home */}
      <div className="bg-surface rounded-2xl shadow-card p-5 md:p-6 mb-4">
        <h3 className="font-bold text-text-primary text-base mb-3">At Home</h3>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Store water properly</p>
              <p>Use clean, food-grade containers with lids. Never store drinking water in containers previously used for chemicals, fuel, or non-food liquids. Keep containers off the ground and away from direct sunlight.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Boil if in doubt</p>
              <p>Bringing water to a rolling boil for at least one minute kills virtually all disease-causing bacteria, viruses, and parasites. Let it cool naturally in a covered container.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Consider a filter</p>
              <p>Ceramic filters (KSh 2,000&ndash;5,000), activated carbon filters, and reverse osmosis systems (KSh 15,000&ndash;50,000+) each offer different levels of protection. Reverse osmosis is the most comprehensive, removing bacteria, dissolved minerals, fluoride, and heavy metals.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Clean your tank</p>
              <p>If you have a water storage tank, have it professionally cleaned at least twice a year. Bacteria multiply rapidly in stagnant, warm water &mdash; a dirty tank can recontaminate even high-quality water.</p>
            </div>
          </div>
        </div>
      </div>

      {/* When Ordering Water */}
      <div className="bg-surface rounded-2xl shadow-card p-5 md:p-6 mb-4">
        <h3 className="font-bold text-text-primary text-base mb-3">When Ordering Water</h3>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Ask for the source</p>
              <p>Reputable suppliers can tell you where their water comes from and what treatment it has undergone. If a vendor cannot or will not answer, consider an alternative.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Check the seal</p>
              <p>Delivered jugs and bottles should arrive with an intact, tamper-evident seal. Never accept a container with a broken, loose, or missing seal.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Look for KEBS certification</p>
              <p>The Kenya Bureau of Standards issues a Standardisation Mark (SM) to water products that meet national quality requirements. The SM number should be visible on the container label.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Use MiMaji</p>
              <p>All suppliers listed on MiMaji hold valid KEBS certification and undergo periodic quality verification. We display supplier ratings, quality badges, and customer reviews so you can order with confidence.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Standards Table */}
      <h2 className="font-bold text-text-primary text-lg mt-8 mb-4 flex items-center gap-2">
        <BookOpen size={20} className="text-primary" />
        Nairobi Water Quality Standards at a Glance
      </h2>

      <div className="bg-surface rounded-2xl shadow-card overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-primary/10 text-text-primary">
                <th className="text-left p-3 font-semibold">Parameter</th>
                <th className="text-left p-3 font-semibold">WHO</th>
                <th className="text-left p-3 font-semibold">KEBS</th>
                <th className="text-left p-3 font-semibold">Watch For</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-t border-[#E0E0E0]">
                <td className="p-3 font-medium text-text-primary">E. coli</td>
                <td className="p-3">0 / 100ml</td>
                <td className="p-3">0 / 100ml</td>
                <td className="p-3 text-red-600">Any = unsafe</td>
              </tr>
              <tr className="border-t border-[#E0E0E0] bg-[#FAFAFA]">
                <td className="p-3 font-medium text-text-primary">Total Coliforms</td>
                <td className="p-3">0 / 100ml</td>
                <td className="p-3">0 / 100ml</td>
                <td className="p-3">Contamination risk</td>
              </tr>
              <tr className="border-t border-[#E0E0E0]">
                <td className="p-3 font-medium text-text-primary">TDS</td>
                <td className="p-3">&lt; 600 mg/L</td>
                <td className="p-3">&le; 1,500 mg/L</td>
                <td className="p-3">&gt; 1,000 = unpleasant</td>
              </tr>
              <tr className="border-t border-[#E0E0E0] bg-[#FAFAFA]">
                <td className="p-3 font-medium text-text-primary">pH</td>
                <td className="p-3">6.5 &ndash; 8.5</td>
                <td className="p-3">6.5 &ndash; 8.5</td>
                <td className="p-3">&lt; 6.5 corrosive</td>
              </tr>
              <tr className="border-t border-[#E0E0E0]">
                <td className="p-3 font-medium text-text-primary">Turbidity</td>
                <td className="p-3">&lt; 1 NTU</td>
                <td className="p-3">&le; 5 NTU</td>
                <td className="p-3">Cloudy = too high</td>
              </tr>
              <tr className="border-t border-[#E0E0E0] bg-[#FAFAFA]">
                <td className="p-3 font-medium text-text-primary">Fluoride</td>
                <td className="p-3">&le; 1.5 mg/L</td>
                <td className="p-3">1.5 &ndash; 3.0 mg/L</td>
                <td className="p-3">Test boreholes</td>
              </tr>
              <tr className="border-t border-[#E0E0E0]">
                <td className="p-3 font-medium text-text-primary">Chlorine</td>
                <td className="p-3">0.2 &ndash; 0.5 mg/L</td>
                <td className="p-3">0.2 &ndash; 0.5 mg/L</td>
                <td className="p-3">0 = no protection</td>
              </tr>
              <tr className="border-t border-[#E0E0E0] bg-[#FAFAFA]">
                <td className="p-3 font-medium text-text-primary">Iron</td>
                <td className="p-3">&le; 0.3 mg/L</td>
                <td className="p-3">&le; 0.3 mg/L</td>
                <td className="p-3">Rusty colour/taste</td>
              </tr>
              <tr className="border-t border-[#E0E0E0]">
                <td className="p-3 font-medium text-text-primary">Nitrates</td>
                <td className="p-3">&le; 50 mg/L</td>
                <td className="p-3">&le; 45 mg/L</td>
                <td className="p-3">High in boreholes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Testing Labs */}
      <h2 className="font-bold text-text-primary text-lg mt-8 mb-4 flex items-center gap-2">
        <MapPin size={20} className="text-primary" />
        Where to Get Your Water Tested in Nairobi
      </h2>

      <div className="space-y-3 mb-6">
        {[
          { name: "KEBS Testing Labs", tests: "Full drinking water analysis (chemical + microbiological)", cost: "KSh 3,000 – 8,000", location: "Popo Road, South C" },
          { name: "Government Chemist", tests: "Comprehensive chemical and biological analysis", cost: "KSh 2,500 – 6,000", location: "Ngong Road" },
          { name: "SGS Kenya", tests: "International-standard water testing", cost: "KSh 5,000 – 15,000", location: "Industrial Area" },
          { name: "University of Nairobi", tests: "Research-grade analysis, may accept public samples", cost: "KSh 2,000 – 5,000", location: "Main Campus" },
          { name: "Crop Nutrition Labs", tests: "Agricultural and water testing", cost: "KSh 3,000 – 7,000", location: "Limuru Road" },
        ].map((lab) => (
          <div key={lab.name} className="bg-surface rounded-2xl shadow-card p-4 md:p-5">
            <h4 className="font-bold text-text-primary text-sm mb-1">{lab.name}</h4>
            <p className="text-text-secondary text-xs mb-2">{lab.tests}</p>
            <div className="flex items-center justify-between">
              <span className="text-primary font-semibold text-xs">{lab.cost}</span>
              <span className="text-text-secondary text-xs flex items-center gap-1">
                <MapPin size={12} /> {lab.location}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MiMaji's Commitment */}
      <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-2xl p-5 md:p-8 mb-6">
        <h2 className="font-bold text-text-primary text-lg mb-4">MiMaji&apos;s Commitment to Quality</h2>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Verified Suppliers Only</p>
              <p>Every vendor on MiMaji must hold a valid KEBS Standardisation Mark and active business registration before being listed.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Periodic Quality Checks</p>
              <p>We conduct unannounced quality spot-checks on supplier products at least quarterly. Suppliers who fail are immediately suspended.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">MiMaji Verified Badge</p>
              <p>Suppliers who consistently pass quality testing and maintain a 4.5+ star rating earn our &ldquo;MiMaji Verified&rdquo; badge &mdash; displayed prominently on their listing.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Customer Protection</p>
              <p>If you receive water that tastes off, appears cloudy, or has a broken seal, report it through the app. We will arrange a free replacement or full refund, no questions asked.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={16} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Transparent Ratings</p>
              <p>Every supplier&apos;s customer rating is public. You choose who you trust with your family&apos;s water.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 md:p-8 text-white text-center mb-6">
        <Droplets size={32} className="mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">MiMaji &mdash; Clean Water, One Tap Away</h2>
        <p className="text-white/80 text-sm mb-4">Download the app at mimaji.co.ke</p>
        <p className="text-white/60 text-xs">
          Questions? WhatsApp{" "}
          <a href="https://wa.me/254758434076" target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-semibold hover:underline">
            +254 758 434 076
          </a>
        </p>
      </div>

      {/* Order CTA */}
      <Link href="/buy" className="block bg-primary text-white rounded-2xl p-4 text-center font-bold text-base hover:bg-[#1a5a9a] transition-colors mb-4">
        <ShoppingCart size={18} className="inline mr-2 -mt-0.5" />
        Order Safe Water Now
      </Link>
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
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/water-guide" className="text-primary font-medium text-sm">Water Guide</Link>
          <Link href="/contact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Contact</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}

function DesktopFooter() {
  return (
    <footer className="bg-[#1A2A3A] text-white py-12">
      <div className="max-w-6xl mx-auto px-8 text-center">
        <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
      </div>
    </footer>
  );
}
