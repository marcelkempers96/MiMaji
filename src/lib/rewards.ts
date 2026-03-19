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
 */

const REWARDS_KEY = "mimaji_rewards";

export interface ReferralRecord {
  friendUserId: string;
  friendName: string;
  signedUpAt: string;
  qualified: boolean;   // true once they ordered >= 10L
  qualifiedAt?: string;
}

export interface UserRewards {
  userId: string;
  /** Free litres available to spend */
  freeLitres: number;
  /** Total free litres ever earned (for cap tracking) */
  totalEarnedFromReferrals: number;
  /** Whether the 60L milestone bonus (extra 10L) has been awarded */
  milestoneBonusAwarded: boolean;
  /** This user's referral code (share with friends) */
  referralCode: string;
  /** Who referred this user (null if organic) */
  referredByUserId: string | null;
  /** Whether this user's referral reward has been paid out to their referrer */
  referralQualified: boolean;
  /** History of friends this user referred */
  referrals: ReferralRecord[];
  /** Timestamps */
  createdAt: string;
}

// ── Persistence helpers ──

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

/**
 * Generate a short referral code from a user ID.
 */
export function generateReferralCode(userId: string): string {
  // Use last 6 chars of ID, uppercased — simple & unique per user
  const base = userId.replace(/[^a-zA-Z0-9]/g, "");
  return "MAJI" + base.slice(-6).toUpperCase();
}

/**
 * Look up which userId owns a given referral code.
 */
export function findUserByReferralCode(code: string): string | null {
  const all = loadAllRewards();
  const upper = code.toUpperCase().trim();
  for (const entry of Object.values(all)) {
    if (entry.referralCode === upper) return entry.userId;
  }
  return null;
}

/**
 * Get rewards for a user. Returns null if not initialised yet.
 */
export function getRewards(userId: string): UserRewards | null {
  const all = loadAllRewards();
  return all[userId] || null;
}

/**
 * Initialise rewards for a new user (called at signup).
 * Awards 1L welcome bonus. Records referrer if provided.
 */
export function initRewards(userId: string, referredByCode?: string): UserRewards {
  const all = loadAllRewards();

  // Don't re-init if already exists
  if (all[userId]) return all[userId];

  let referredByUserId: string | null = null;
  if (referredByCode) {
    referredByUserId = findUserByReferralCode(referredByCode);
    // Don't let users refer themselves
    if (referredByUserId === userId) referredByUserId = null;
  }

  const rewards: UserRewards = {
    userId,
    freeLitres: 1, // 1L welcome bonus
    totalEarnedFromReferrals: 0,
    milestoneBonusAwarded: false,
    referralCode: generateReferralCode(userId),
    referredByUserId,
    referralQualified: false,
    referrals: [],
    createdAt: new Date().toISOString(),
  };

  all[userId] = rewards;

  // If there's a valid referrer, add this user to their referral list
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
 * Update the friend's name in the referrer's referral list
 * (called after we know the user's name from signup).
 */
export function updateReferralFriendName(userId: string, friendName: string) {
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

/**
 * Calculate total litres in an order from its items.
 */
export function calculateOrderLitres(orderItems: Array<{ name: string; quantity: number }>): number {
  let total = 0;
  for (const item of orderItems) {
    // Extract litre amount from product name, e.g. "20L Hard", "5L Soft", "10L Soft"
    const match = item.name.match(/(\d+)L/i);
    if (match) {
      total += parseInt(match[1], 10) * item.quantity;
    }
  }
  return total;
}

/**
 * Called after a successful order. Checks if this order qualifies
 * the user for referral rewards (>= 10L and was referred).
 * Awards 5L to both the referrer and this user.
 */
export function processOrderRewards(
  userId: string,
  orderItems: Array<{ name: string; quantity: number }>
): { referrerRewarded: boolean; userRewarded: boolean; milestoneHit: boolean } {
  const all = loadAllRewards();
  const rewards = all[userId];
  if (!rewards) return { referrerRewarded: false, userRewarded: false, milestoneHit: false };

  const litres = calculateOrderLitres(orderItems);
  let referrerRewarded = false;
  let userRewarded = false;
  let milestoneHit = false;

  // Check if this user was referred, hasn't qualified yet, and ordered >= 10L
  if (
    rewards.referredByUserId &&
    !rewards.referralQualified &&
    litres >= 10
  ) {
    const referrer = all[rewards.referredByUserId];
    if (referrer) {
      // Check referrer hasn't hit the 50L referral cap
      if (referrer.totalEarnedFromReferrals < 50) {
        // Award 5L to referrer
        referrer.freeLitres += 5;
        referrer.totalEarnedFromReferrals += 5;

        // Check if referrer just hit 50L milestone → extra 10L bonus
        if (referrer.totalEarnedFromReferrals >= 50 && !referrer.milestoneBonusAwarded) {
          referrer.freeLitres += 10;
          referrer.milestoneBonusAwarded = true;
          milestoneHit = true;
        }

        // Mark the referral as qualified
        const ref = referrer.referrals.find((r) => r.friendUserId === userId);
        if (ref) {
          ref.qualified = true;
          ref.qualifiedAt = new Date().toISOString();
        }

        referrerRewarded = true;
      }

      // Award 5L to the friend (this user) — no cap on receiving
      rewards.freeLitres += 5;
      userRewarded = true;
    }

    rewards.referralQualified = true;
  }

  saveAllRewards(all);
  return { referrerRewarded, userRewarded, milestoneHit };
}

/**
 * Use free litres from a user's balance (e.g., at checkout).
 * Returns how many litres were actually deducted.
 */
export function useFreeLitres(userId: string, litres: number): number {
  const all = loadAllRewards();
  const rewards = all[userId];
  if (!rewards || rewards.freeLitres <= 0) return 0;

  const used = Math.min(litres, rewards.freeLitres);
  rewards.freeLitres -= used;
  saveAllRewards(all);
  return used;
}

/**
 * Get a summary for display on the rewards page.
 */
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
