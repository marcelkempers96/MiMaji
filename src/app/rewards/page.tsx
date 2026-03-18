"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

const ranks = [
  { name: "Drop Cadet", minLitres: 0, maxLitres: 99, badge: "💧", perks: ["Basic order tracking", "SMS notifications"] },
  { name: "Stream Scout", minLitres: 100, maxLitres: 499, badge: "🌊", perks: ["5% discount on orders", "Priority customer support", "Early access to promotions"] },
  { name: "River Ranger", minLitres: 500, maxLitres: 1499, badge: "🏞️", perks: ["10% discount on orders", "Free delivery always", "Exclusive seasonal offers", "Birthday bonus: 1 free jug"] },
  { name: "Water Warrior", minLitres: 1500, maxLitres: 4999, badge: "⚔️", perks: ["15% discount on orders", "Free delivery + priority scheduling", "Quarterly bonus jug", "MiMaji merchandise pack", "Name on Impact Wall"] },
  { name: "Ocean Guardian", minLitres: 5000, maxLitres: Infinity, badge: "🌍", perks: ["20% lifetime discount", "VIP delivery scheduling", "Monthly bonus jug", "Annual MiMaji gift box", "Name on Impact Wall + certificate", "Invite to annual impact event"] },
];

const challenges = [
  { title: "First Order Hero", desc: "Place your first order", reward: "+20 litres credit", completed: true },
  { title: "Referral Champion", desc: "Refer 3 friends who order", reward: "+30 litres credit", completed: false, progress: "1/3" },
  { title: "Consistency King", desc: "Order 4 weeks in a row", reward: "+1 free jug", completed: false, progress: "2/4" },
  { title: "Community Builder", desc: "Refer 10 friends", reward: "Water Warrior rank", completed: false, progress: "1/10" },
  { title: "Impact Maker", desc: "Order 500+ litres total", reward: "River Ranger rank", completed: false, progress: "120/500L" },
];

export default function RewardsPage() {
  const { user, isLoading } = useAuth();
  const userLitres = 120;
  const currentRank = ranks.find((r) => userLitres >= r.minLitres && userLitres <= r.maxLitres) || ranks[0];
  const nextRank = ranks[ranks.indexOf(currentRank) + 1];
  const progress = nextRank ? ((userLitres - currentRank.minLitres) / (nextRank.minLitres - currentRank.minLitres)) * 100 : 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="text-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-50 to-bg px-5 pt-10 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">Water Warriors Rewards</h1>
          <p className="text-text-mid text-sm lg:text-base">Earn rewards for every litre you order. Rise through the ranks!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-5 relative z-10 pb-8">
        {/* User Status */}
        {user ? (
          <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{currentRank.badge}</div>
              <div>
                <div className="font-bold text-blue-900 text-lg">{currentRank.name}</div>
                <div className="text-sm text-text-mid">{userLitres} litres ordered</div>
              </div>
            </div>
            {nextRank && (
              <div>
                <div className="flex justify-between text-xs text-text-mid mb-1">
                  <span>{currentRank.name}</span>
                  <span>{nextRank.name} ({nextRank.minLitres}L)</span>
                </div>
                <div className="bg-blue-50 rounded-full h-3">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                <div className="text-xs text-text-light mt-1 text-center">
                  {nextRank.minLitres - userLitres} litres to next rank
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 mb-6 text-center" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <div className="text-4xl mb-3">💧</div>
            <h2 className="font-bold text-blue-900 text-lg mb-2">Join the Water Warriors</h2>
            <p className="text-text-mid text-sm mb-4">Sign in to track your rewards and rise through the ranks!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login" onClick={() => localStorage.setItem("mimaji-redirect", "/rewards")}>
                <Button size="md">Log In</Button>
              </Link>
              <Link href="/signup" onClick={() => localStorage.setItem("mimaji-redirect", "/rewards")}>
                <Button variant="outline" size="md">Sign Up</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Challenges */}
        {user && (
          <div className="bg-white rounded-2xl p-5 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="font-bold text-blue-900 text-lg mb-4">Active Challenges</h2>
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <div
                  key={challenge.title}
                  className={`p-4 rounded-2xl ${challenge.completed ? "bg-emerald-50" : "bg-blue-50"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                        {challenge.title}
                        {challenge.completed && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22A96A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <div className="text-xs text-text-mid">{challenge.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-blue-700">{challenge.reward}</div>
                      {challenge.progress && (
                        <div className="text-[10px] text-text-light">{challenge.progress}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rank Tiers */}
        <div className="bg-white rounded-2xl p-5 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="font-bold text-blue-900 text-lg mb-4">Reward Ranks</h2>
          <div className="space-y-4">
            {ranks.map((rank) => {
              const isCurrentRank = user && rank.name === currentRank.name;
              return (
                <div
                  key={rank.name}
                  className={`p-4 rounded-2xl border-2 ${
                    isCurrentRank ? "border-blue-700 bg-blue-50" : "border-transparent bg-blue-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{rank.badge}</span>
                    <div>
                      <div className="font-bold text-blue-900 text-sm flex items-center gap-2">
                        {rank.name}
                        {isCurrentRank && (
                          <span className="text-[10px] bg-blue-700 text-white px-2 py-0.5 rounded-full">YOU</span>
                        )}
                      </div>
                      <div className="text-xs text-text-mid">
                        {rank.maxLitres === Infinity
                          ? `${rank.minLitres.toLocaleString()}+ litres`
                          : `${rank.minLitres} - ${rank.maxLitres.toLocaleString()} litres`}
                      </div>
                    </div>
                  </div>
                  <div className="ml-10 space-y-1">
                    {rank.perks.map((perk) => (
                      <div key={perk} className="flex items-center gap-2 text-xs text-text-mid">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22A96A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {perk}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referral CTA */}
        <div className="bg-blue-700 rounded-2xl p-6 text-center">
          <h2 className="font-bold text-white text-lg mb-2">Boost Your Rank Faster</h2>
          <p className="text-blue-200 text-sm mb-4">Refer friends and earn bonus litres towards your next rank!</p>
          <Link href="/referrals">
            <Button variant="outline" className="!border-white !text-white hover:!bg-white/10">
              Refer Friends
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
