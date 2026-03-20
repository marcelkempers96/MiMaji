"use client";

import { logo1 } from "@/assets/images";
import { Droplets, Gift, Copy, CheckCircle2, Users, Crown, Share2 } from "lucide-react";
import { useState, useEffect } from "react";

import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getRewardsSummary, initRewards, type ReferralRecord } from "@/lib/rewards";

export default function RewardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const [summary, setSummary] = useState({
    freeLitres: 0,
    referralCode: "",
    referralsCount: 0,
    qualifiedReferrals: 0,
    pendingReferrals: 0,
    totalEarnedFromReferrals: 0,
    referralCapReached: false,
    milestoneBonusAwarded: false,
    referrals: [] as ReferralRecord[],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/rewards");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.id) {
      // Ensure rewards record exists
      initRewards(user.id);
      setSummary(getRewardsSummary(user.id));
    }
  }, [user?.id]);

  const handleCopyCode = () => {
    if (!summary.referralCode) return;
    navigator.clipboard.writeText(summary.referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (!summary.referralCode) return;
    const text = `Join MiMaji and get 1L of free water! Use my referral code ${summary.referralCode} when you sign up, and we both get 5L free when you order 10L+. Download at mimaji.co.ke`;
    if (navigator.share) {
      navigator.share({ title: "MiMaji Referral", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!user) return null;

  const referralCapLitres = 50;
  const referralProgress = Math.min(summary.totalEarnedFromReferrals / referralCapLitres, 1) * 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="md:hidden">
        <TopBar title="Rewards & Referrals" showBack={true} />
      </div>

      {/* Mobile Layout */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <RewardsContent
          user={user}
          summary={summary}
          referralProgress={referralProgress}
          referralCapLitres={referralCapLitres}
          copied={copied}
          onCopyCode={handleCopyCode}
          onShare={handleShare}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Rewards & Referrals</h1>
          <p className="text-text-secondary mb-8">Share MiMaji with friends and earn free water.</p>
          <RewardsContent
            user={user}
            summary={summary}
            referralProgress={referralProgress}
            referralCapLitres={referralCapLitres}
            copied={copied}
            onCopyCode={handleCopyCode}
            onShare={handleShare}
          />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function RewardsContent({
  user,
  summary,
  referralProgress,
  referralCapLitres,
  copied,
  onCopyCode,
  onShare,
}: {
  user: { name: string };
  summary: ReturnType<typeof getRewardsSummary>;
  referralProgress: number;
  referralCapLitres: number;
  copied: boolean;
  onCopyCode: () => void;
  onShare: () => void;
}) {
  return (
    <>
      {/* Free Litres Balance */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-5 text-white mb-5">
        <p className="text-white/70 text-xs font-medium mb-1">Your Free Water Balance</p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-extrabold">{summary.freeLitres}</span>
          <span className="text-white/80 text-lg font-semibold">litres</span>
        </div>
        <p className="text-white/60 text-xs">Free litres are applied at checkout</p>

        <div className="mt-4 bg-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/70 text-xs">Referral earnings</span>
            <span className="text-white text-xs font-bold">{summary.totalEarnedFromReferrals}L / {referralCapLitres}L</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${referralProgress}%` }} />
          </div>
          {summary.referralCapReached && summary.milestoneBonusAwarded && (
            <div className="flex items-center gap-1 mt-2">
              <Crown size={12} className="text-yellow-300" />
              <span className="text-yellow-200 text-[10px] font-semibold">50L milestone reached! +10L bonus awarded</span>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-5">
        <h2 className="font-bold text-base text-text-primary mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
              <Gift size={16} className="text-[#2ECC71]" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary">1L Welcome Bonus</p>
              <p className="text-text-secondary text-xs">Every new user gets 1 litre free on sign up</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <Users size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary">Refer a Friend → 5L Each</p>
              <p className="text-text-secondary text-xs">When your friend signs up with your code and orders at least 10 litres, you <span className="font-semibold">both</span> get 5L free</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFF5EC] flex items-center justify-center flex-shrink-0">
              <Crown size={16} className="text-[#F5A623]" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary">50L Milestone → +10L Bonus</p>
              <p className="text-text-secondary text-xs">Earn up to 50L from referrals. Once you hit 50L, you get an extra 10L bonus!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-5">
        <h2 className="font-bold text-base text-text-primary mb-3">Your Referral Code</h2>
        <div className="bg-background rounded-xl p-4 flex items-center justify-between mb-3">
          <span className="font-mono font-extrabold text-xl text-primary tracking-wider">{summary.referralCode}</span>
          <button onClick={onCopyCode} className="flex items-center gap-1 text-primary text-sm font-semibold hover:text-[#1a5a9a] transition-colors">
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <button
          onClick={onShare}
          className="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1a5a9a] transition-colors"
        >
          <Share2 size={16} />
          Share with Friends
        </button>
        <p className="text-text-secondary text-xs text-center mt-2">
          Your friend enters this code during sign up
        </p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-primary">{summary.referralsCount}</p>
          <p className="text-text-secondary text-xs">Friends Invited</p>
        </div>
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-[#2ECC71]">{summary.qualifiedReferrals}</p>
          <p className="text-text-secondary text-xs">Qualified</p>
        </div>
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-[#F5A623]">{summary.pendingReferrals}</p>
          <p className="text-text-secondary text-xs">Pending</p>
        </div>
      </div>

      {/* Referral History */}
      {summary.referrals.length > 0 && (
        <div className="bg-surface shadow-card rounded-xl p-5 mb-5">
          <h2 className="font-bold text-sm text-text-primary mb-3">Referral History</h2>
          <div className="space-y-3">
            {summary.referrals.map((ref) => (
              <div key={ref.friendUserId} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ref.qualified ? "bg-[#E8F5E9]" : "bg-gray-100"}`}>
                  <Users size={14} className={ref.qualified ? "text-[#2ECC71]" : "text-text-secondary"} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{ref.friendName || "Friend"}</p>
                  <p className="text-text-secondary text-xs">
                    Joined {new Date(ref.signedUpAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  ref.qualified
                    ? "bg-[#E8F5E9] text-[#2ECC71]"
                    : "bg-gray-100 text-text-secondary"
                }`}>
                  {ref.qualified ? "+5L earned" : "Pending"}
                </span>
              </div>
            ))}
          </div>
          {summary.pendingReferrals > 0 && (
            <p className="text-text-secondary text-xs mt-3">
              Pending friends need to order at least 10 litres to qualify.
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      <Link
        href="/buy"
        className="block w-full bg-primary text-white text-center rounded-xl py-4 font-bold text-sm hover:bg-[#1a5a9a] transition-colors"
      >
        <Droplets size={16} className="inline mr-2" />
        Order Water Now
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
          <Link href="/rewards" className="text-primary font-medium text-sm">Rewards</Link>
          <Link href="/impact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Impact</Link>
          <Link href="/contact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Contact</Link>
        </nav>
      </div>
    </header>
  );
}

