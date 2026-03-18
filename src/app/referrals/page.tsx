"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "MAJI-K7X2";
  const referralLink = `https://mimaji.co.ke/signup?ref=${referralCode}`;

  const referrals = [
    { name: "Mary W.", status: "ordered", litres: 10 },
    { name: "Peter K.", status: "signed_up", litres: 0 },
    { name: "Jane M.", status: "ordered", litres: 10 },
  ];

  const totalEarned = referrals.filter((r) => r.status === "ordered").length * 10;
  const friendsReferred = referrals.length;
  const friendsOrdered = referrals.filter((r) => r.status === "ordered").length;
  const bonusUnlocked = friendsOrdered >= 5;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-50 to-bg px-5 pt-10 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">
            Refer &amp; Earn Free Water
          </h1>
          <p className="text-text-mid text-sm lg:text-base">
            Share MiMaji, get free water for you and your friends
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="-mt-5 mx-4 max-w-4xl lg:mx-auto bg-white rounded-2xl p-5 relative z-10 mb-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <h2 className="font-bold text-blue-900 mb-4">How it works</h2>
        <div className="space-y-3">
          {[
            { step: "1", title: "Share your code", desc: "Send your referral code to friends" },
            { step: "2", title: "Friend signs up & orders", desc: "They use your code when signing up" },
            { step: "3", title: "You BOTH get 10 litres free", desc: "That's half a 20L jug each!" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {s.step}
              </div>
              <div>
                <div className="font-semibold text-blue-900 text-sm">{s.title}</div>
                <div className="text-xs text-text-mid">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reward tiers */}
      <div className="px-4 mb-6 max-w-4xl lg:mx-auto">
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-bold text-blue-900 mb-3">Reward tiers</h3>
          <div className="space-y-2">
            {[
              { friends: "1 friend", reward: "10 litres free" },
              { friends: "2 friends", reward: "20 litres free" },
              { friends: "3 friends", reward: "30 litres free" },
              { friends: "4 friends", reward: "40 litres free" },
              { friends: "5 friends", reward: "50 + 10 bonus = 60 litres!" },
            ].map((tier) => (
              <div
                key={tier.friends}
                className="bg-blue-50 rounded-2xl p-3 flex items-center justify-between"
              >
                <span className="text-sm text-text-mid font-medium">{tier.friends}</span>
                <span className="text-sm font-bold text-blue-700">{tier.reward}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-text-mid text-center">
            Maximum: 60 litres (3 free 20L jugs) from referrals
          </div>
        </div>
      </div>

      {/* Your referral code */}
      <div className="px-4 mb-6 max-w-4xl lg:mx-auto">
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-bold text-blue-900 mb-3">Your referral code</h3>
          <div className="bg-blue-50 rounded-2xl p-4 text-center mb-4">
            <div className="text-2xl font-bold text-blue-700 tracking-wider font-mono">
              {referralCode}
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <Button size="md" className="flex-1" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Join MiMaji!",
                    text: `Use my code ${referralCode} to get 10 litres free on MiMaji!`,
                    url: referralLink,
                  });
                }
              }}
            >
              Share
            </Button>
          </div>
          <div className="text-xs text-text-light text-center">
            Share via WhatsApp, SMS, or any messaging app
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 mb-6 max-w-4xl lg:mx-auto">
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-bold text-blue-900 mb-3">Your progress</h3>
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div className="bg-blue-50 rounded-2xl p-3">
              <div className="text-xl font-bold text-blue-900">{friendsReferred}</div>
              <div className="text-[10px] text-text-mid">Referred</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-3">
              <div className="text-xl font-bold text-blue-900">{friendsOrdered}</div>
              <div className="text-[10px] text-text-mid">Ordered</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-3">
              <div className="text-xl font-bold text-blue-700">{totalEarned}L</div>
              <div className="text-[10px] text-text-mid">Earned</div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-xs text-text-mid mb-1">
              <span>{friendsOrdered}/5 friends</span>
              <span>{bonusUnlocked ? "Bonus unlocked!" : `${5 - friendsOrdered} more for bonus`}</span>
            </div>
            <div className="bg-blue-50 rounded-full h-2">
              <div
                className="h-full bg-blue-700 rounded-full transition-all"
                style={{ width: `${Math.min(100, (friendsOrdered / 5) * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {referrals.map((ref, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-blue-50 rounded-2xl text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {ref.name[0]}
                  </div>
                  <span className="text-blue-900 font-medium">{ref.name}</span>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    ref.status === "ordered"
                      ? "bg-emerald-50 text-success"
                      : "bg-amber-50 text-warning"
                  }`}
                >
                  {ref.status === "ordered" ? "+10L earned" : "Signed up"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
