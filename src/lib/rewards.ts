/**
 * MiMaji Rewards & Referral System
 *
 * Rules:
 * - New users get 1L free on signup.
 * - Each user has a unique referral code (derived from their ID).
 * - When a referred friend signs up AND places an order of >= 10L,
 *   both the referrer and the friend get 5L free.
 * - A user can earn up to 50L via referrals. Once they hit 50L they
 *   receive an extra 10L bonus (total cap becomes 60L from referrals).
 * - Free litres are tracked per-user and decremented when used.
 *
 * Supports both localStorage (mock) and Supabase backends.
 */

import { supabase } from "./supabase";

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

const REWARDS_KEY = "mimaji_rewards";

export interface ReferralRecord {
  friendUserId: string;
  friendName: string;
  signedUpAt: string;
  qualified: boolean;
  qualifiedAt?: string;
}

export interface UserRewards {
  userId: string;
  freeLitres: number;
  totalEarnedFromReferrals: number;
  milestoneBonusAwarded: boolean;
  referralCode: string;
  referredByUserId: string | null;
  referralQualified: boolean;
  referrals: ReferralRecord[];
  createdAt: string;
}

// ── localStorage helpers (mock mode) ──

function loadAllRewards(): Record<string, UserRewards> {
  try {
    const raw = localStorage.getItem(REWARDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveAllRewards(data: Record<string, UserRewards>) {
  try { localStorage.setItem(REWARDS_KEY, JSON.stringify(data)); } catch {}
}

// ── Public API ──

export function generateReferralCode(userId: string): string {
  const base = userId.replace(/[^a-zA-Z0-9]/g, "");
  return "MAJI" + base.slice(-6).toUpperCase();
}

export function findUserByReferralCode(code: string): string | null {
  if (hasSupabaseConfig) return null; // Use async version for Supabase
  const all = loadAllRewards();
  const upper = code.toUpperCase().trim();
  for (const entry of Object.values(all)) {
    if (entry.referralCode === upper) return entry.userId;
  }
  return null;
}

export async function findUserByReferralCodeAsync(code: string): Promise<string | null> {
  if (!hasSupabaseConfig) return findUserByReferralCode(code);

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("referral_code", code.toUpperCase().trim())
    .single();

  return data?.id || null;
}

export function getRewards(userId: string): UserRewards | null {
  if (hasSupabaseConfig) return null; // Use async version
  const all = loadAllRewards();
  return all[userId] || null;
}

export async function getRewardsAsync(userId: string): Promise<UserRewards | null> {
  if (!hasSupabaseConfig) return getRewards(userId);

  const { data: reward } = await supabase
    .from("rewards")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, referred_by")
    .eq("id", userId)
    .single();

  const { data: referrals } = await supabase
    .from("referrals")
    .select("friend_id, friend_name, qualified, qualified_at, created_at")
    .eq("referrer_id", userId);

  if (!reward) return null;

  return {
    userId,
    freeLitres: Number(reward.free_litres),
    totalEarnedFromReferrals: Number(reward.total_earned_from_referrals),
    milestoneBonusAwarded: reward.milestone_bonus_awarded,
    referralCode: profile?.referral_code || generateReferralCode(userId),
    referredByUserId: profile?.referred_by || null,
    referralQualified: reward.referral_qualified,
    referrals: (referrals || []).map((r: Record<string, unknown>) => ({
      friendUserId: r.friend_id as string,
      friendName: (r.friend_name as string) || "",
      signedUpAt: r.created_at as string,
      qualified: r.qualified as boolean,
      qualifiedAt: r.qualified_at as string | undefined,
    })),
    createdAt: reward.created_at,
  };
}

/**
 * Initialise rewards for a new user (called at signup).
 * Awards 1L welcome bonus. Records referrer if provided.
 */
export function initRewards(userId: string, referredByCode?: string): UserRewards {
  if (hasSupabaseConfig) {
    // Supabase: rewards are auto-created by DB trigger. Just return a stub.
    return {
      userId,
      freeLitres: 1,
      totalEarnedFromReferrals: 0,
      milestoneBonusAwarded: false,
      referralCode: generateReferralCode(userId),
      referredByUserId: null,
      referralQualified: false,
      referrals: [],
      createdAt: new Date().toISOString(),
    };
  }

  const all = loadAllRewards();
  if (all[userId]) return all[userId];

  let referredByUserId: string | null = null;
  if (referredByCode) {
    referredByUserId = findUserByReferralCode(referredByCode);
    if (referredByUserId === userId) referredByUserId = null;
  }

  const rewards: UserRewards = {
    userId,
    freeLitres: 1,
    totalEarnedFromReferrals: 0,
    milestoneBonusAwarded: false,
    referralCode: generateReferralCode(userId),
    referredByUserId,
    referralQualified: false,
    referrals: [],
    createdAt: new Date().toISOString(),
  };

  all[userId] = rewards;

  if (referredByUserId && all[referredByUserId]) {
    all[referredByUserId].referrals.push({
      friendUserId: userId,
      friendName: "",
      signedUpAt: new Date().toISOString(),
      qualified: false,
    });
  }

  saveAllRewards(all);
  return rewards;
}

/**
 * Async init for Supabase mode — sets up referral relationship.
 */
export async function initRewardsAsync(userId: string, userName: string, referredByCode?: string): Promise<void> {
  if (!hasSupabaseConfig) {
    initRewards(userId, referredByCode);
    updateReferralFriendName(userId, userName);
    return;
  }

  // Rewards row is auto-created by DB trigger. Handle referral link.
  if (referredByCode) {
    const referrerId = await findUserByReferralCodeAsync(referredByCode);
    if (referrerId && referrerId !== userId) {
      // Update profile with referred_by
      await supabase.from("profiles").update({ referred_by: referrerId }).eq("id", userId);
      // Create referral record
      await supabase.from("referrals").upsert({
        referrer_id: referrerId,
        friend_id: userId,
        friend_name: userName,
      }, { onConflict: "referrer_id,friend_id" });
    }
  }
}

export function updateReferralFriendName(userId: string, friendName: string) {
  if (hasSupabaseConfig) return; // Handled in initRewardsAsync
  const all = loadAllRewards();
  const rewards = all[userId];
  if (!rewards || !rewards.referredByUserId) return;

  const referrer = all[rewards.referredByUserId];
  if (!referrer) return;

  const ref = referrer.referrals.find((r) => r.friendUserId === userId);
  if (ref) {
    ref.friendName = friendName;
    saveAllRewards(all);
  }
}

export function calculateOrderLitres(orderItems: Array<{ name: string; quantity: number }>): number {
  let total = 0;
  for (const item of orderItems) {
    const match = item.name.match(/(\d+)L/i);
    if (match) {
      total += parseInt(match[1], 10) * item.quantity;
    }
  }
  return total;
}

/**
 * Called after a successful order.
 */
export function processOrderRewards(
  userId: string,
  orderItems: Array<{ name: string; quantity: number }>
): { referrerRewarded: boolean; userRewarded: boolean; milestoneHit: boolean } {
  if (hasSupabaseConfig) {
    // Fire and forget the async version
    processOrderRewardsAsync(userId, orderItems).catch(console.error);
    return { referrerRewarded: false, userRewarded: false, milestoneHit: false };
  }

  const all = loadAllRewards();
  const rewards = all[userId];
  if (!rewards) return { referrerRewarded: false, userRewarded: false, milestoneHit: false };

  const litres = calculateOrderLitres(orderItems);
  let referrerRewarded = false;
  let userRewarded = false;
  let milestoneHit = false;

  if (rewards.referredByUserId && !rewards.referralQualified && litres >= 10) {
    const referrer = all[rewards.referredByUserId];
    if (referrer) {
      if (referrer.totalEarnedFromReferrals < 50) {
        referrer.freeLitres += 5;
        referrer.totalEarnedFromReferrals += 5;

        if (referrer.totalEarnedFromReferrals >= 50 && !referrer.milestoneBonusAwarded) {
          referrer.freeLitres += 10;
          referrer.milestoneBonusAwarded = true;
          milestoneHit = true;
        }

        const ref = referrer.referrals.find((r) => r.friendUserId === userId);
        if (ref) {
          ref.qualified = true;
          ref.qualifiedAt = new Date().toISOString();
        }
        referrerRewarded = true;
      }

      rewards.freeLitres += 5;
      userRewarded = true;
    }
    rewards.referralQualified = true;
  }

  saveAllRewards(all);
  return { referrerRewarded, userRewarded, milestoneHit };
}

async function processOrderRewardsAsync(
  userId: string,
  orderItems: Array<{ name: string; quantity: number }>
): Promise<void> {
  const litres = calculateOrderLitres(orderItems);
  if (litres < 10) return;

  // Check if user was referred and hasn't qualified yet
  const { data: reward } = await supabase.from("rewards").select("referral_qualified").eq("user_id", userId).single();
  if (!reward || reward.referral_qualified) return;

  const { data: profile } = await supabase.from("profiles").select("referred_by").eq("id", userId).single();
  if (!profile?.referred_by) return;

  const referrerId = profile.referred_by;

  // Award 5L to friend (this user)
  await supabase.rpc("increment_free_litres", { target_user_id: userId, amount: 5 }).then(() => {});
  // Fallback if RPC doesn't exist: direct update
  const { data: userReward } = await supabase.from("rewards").select("free_litres").eq("user_id", userId).single();
  if (userReward) {
    await supabase.from("rewards").update({
      free_litres: Number(userReward.free_litres) + 5,
      referral_qualified: true,
    }).eq("user_id", userId);
  }

  // Award 5L to referrer (if under cap)
  const { data: referrerReward } = await supabase.from("rewards").select("*").eq("user_id", referrerId).single();
  if (referrerReward && Number(referrerReward.total_earned_from_referrals) < 50) {
    const newTotal = Number(referrerReward.total_earned_from_referrals) + 5;
    let bonusLitres = 5;
    let milestoneBonus = referrerReward.milestone_bonus_awarded;

    if (newTotal >= 50 && !milestoneBonus) {
      bonusLitres += 10;
      milestoneBonus = true;
    }

    await supabase.from("rewards").update({
      free_litres: Number(referrerReward.free_litres) + bonusLitres,
      total_earned_from_referrals: newTotal,
      milestone_bonus_awarded: milestoneBonus,
    }).eq("user_id", referrerId);
  }

  // Mark referral as qualified
  await supabase.from("referrals").update({
    qualified: true,
    qualified_at: new Date().toISOString(),
  }).eq("referrer_id", referrerId).eq("friend_id", userId);
}

export function useFreeLitres(userId: string, litres: number): number {
  if (hasSupabaseConfig) return 0; // Use async version
  const all = loadAllRewards();
  const rewards = all[userId];
  if (!rewards || rewards.freeLitres <= 0) return 0;
  const used = Math.min(litres, rewards.freeLitres);
  rewards.freeLitres -= used;
  saveAllRewards(all);
  return used;
}

export async function useFreeLitresAsync(userId: string, litres: number): Promise<number> {
  if (!hasSupabaseConfig) return useFreeLitres(userId, litres);

  const { data } = await supabase.from("rewards").select("free_litres").eq("user_id", userId).single();
  if (!data || Number(data.free_litres) <= 0) return 0;

  const used = Math.min(litres, Number(data.free_litres));
  await supabase.from("rewards").update({
    free_litres: Number(data.free_litres) - used,
  }).eq("user_id", userId);

  return used;
}

export function getRewardsSummary(userId: string) {
  const rewards = getRewards(userId);
  if (!rewards) {
    return {
      freeLitres: 0,
      referralCode: "",
      referralsCount: 0,
      qualifiedReferrals: 0,
      pendingReferrals: 0,
      totalEarnedFromReferrals: 0,
      referralCapReached: false,
      milestoneBonusAwarded: false,
      referrals: [] as ReferralRecord[],
    };
  }

  const qualifiedReferrals = rewards.referrals.filter((r) => r.qualified).length;
  const pendingReferrals = rewards.referrals.filter((r) => !r.qualified).length;

  return {
    freeLitres: rewards.freeLitres,
    referralCode: rewards.referralCode,
    referralsCount: rewards.referrals.length,
    qualifiedReferrals,
    pendingReferrals,
    totalEarnedFromReferrals: rewards.totalEarnedFromReferrals,
    referralCapReached: rewards.totalEarnedFromReferrals >= 50,
    milestoneBonusAwarded: rewards.milestoneBonusAwarded,
    referrals: rewards.referrals,
  };
}

export async function getRewardsSummaryAsync(userId: string) {
  if (!hasSupabaseConfig) return getRewardsSummary(userId);

  const rewards = await getRewardsAsync(userId);
  if (!rewards) {
    return {
      freeLitres: 0,
      referralCode: generateReferralCode(userId),
      referralsCount: 0,
      qualifiedReferrals: 0,
      pendingReferrals: 0,
      totalEarnedFromReferrals: 0,
      referralCapReached: false,
      milestoneBonusAwarded: false,
      referrals: [] as ReferralRecord[],
    };
  }

  const qualifiedReferrals = rewards.referrals.filter((r) => r.qualified).length;
  const pendingReferrals = rewards.referrals.filter((r) => !r.qualified).length;

  return {
    freeLitres: rewards.freeLitres,
    referralCode: rewards.referralCode,
    referralsCount: rewards.referrals.length,
    qualifiedReferrals,
    pendingReferrals,
    totalEarnedFromReferrals: rewards.totalEarnedFromReferrals,
    referralCapReached: rewards.totalEarnedFromReferrals >= 50,
    milestoneBonusAwarded: rewards.milestoneBonusAwarded,
    referrals: rewards.referrals,
  };
}
