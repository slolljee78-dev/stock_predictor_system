/**
 * Affiliate Program System
 * 
 * Manages affiliate referrals, tracking, and rewards
 */

export interface AffiliateUser {
  id: string;
  userId: string;
  affiliateCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number; // Users still active
  totalEarnings: number;
  pendingEarnings: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  referredUserId: string;
  referredEmail: string;
  status: 'pending' | 'active' | 'inactive';
  signupDate: Date;
  firstPurchaseDate?: Date;
  totalSpent: number;
  commissionEarned: number;
  createdAt: Date;
}

export interface AffiliateReward {
  id: string;
  affiliateId: string;
  referralId: string;
  type: 'signup_bonus' | 'revenue_share' | 'monthly_bonus';
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  payoutDate?: Date;
  createdAt: Date;
}

/**
 * Affiliate commission structure
 */
export const AFFILIATE_COMMISSION = {
  signup_bonus: 10, // $10 per signup
  revenue_share: 0.2, // 20% of subscription revenue
  monthly_bonus: 50, // $50 for 5+ active referrals
  tier_bonus: {
    tier1: { referrals: 5, bonus: 50 }, // 5 referrals = $50
    tier2: { referrals: 10, bonus: 150 }, // 10 referrals = $150
    tier3: { referrals: 25, bonus: 500 }, // 25 referrals = $500
  },
};

/**
 * Generate unique affiliate code
 */
export function generateAffiliateCode(userId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${userId.substring(0, 3)}${timestamp}${random}`.toUpperCase();
}

/**
 * Create affiliate referral link
 */
export function createReferralLink(baseUrl: string, affiliateCode: string): string {
  return `${baseUrl}?ref=${affiliateCode}`;
}

/**
 * Calculate commission for referral
 */
export function calculateCommission(
  referral: AffiliateReferral,
  type: 'signup' | 'revenue' | 'monthly'
): number {
  switch (type) {
    case 'signup':
      return AFFILIATE_COMMISSION.signup_bonus;

    case 'revenue':
      return referral.totalSpent * AFFILIATE_COMMISSION.revenue_share;

    case 'monthly':
      return AFFILIATE_COMMISSION.monthly_bonus;

    default:
      return 0;
  }
}

/**
 * Calculate tier bonus
 */
export function calculateTierBonus(activeReferrals: number): number {
  if (activeReferrals >= 25) {
    return AFFILIATE_COMMISSION.tier_bonus.tier3.bonus;
  } else if (activeReferrals >= 10) {
    return AFFILIATE_COMMISSION.tier_bonus.tier2.bonus;
  } else if (activeReferrals >= 5) {
    return AFFILIATE_COMMISSION.tier_bonus.tier1.bonus;
  }
  return 0;
}

/**
 * Get affiliate statistics
 */
export function getAffiliateStats(affiliate: AffiliateUser, referrals: AffiliateReferral[]) {
  const activeReferrals = referrals.filter((r) => r.status === 'active').length;
  const inactiveReferrals = referrals.filter((r) => r.status === 'inactive').length;
  const totalCommission = referrals.reduce((sum, r) => sum + r.commissionEarned, 0);

  const conversionRate =
    affiliate.totalReferrals > 0
      ? (referrals.filter((r) => r.firstPurchaseDate).length / affiliate.totalReferrals) * 100
      : 0;

  const avgRevenuePerReferral =
    activeReferrals > 0 ? referrals.reduce((sum, r) => sum + r.totalSpent, 0) / activeReferrals : 0;

  return {
    totalReferrals: affiliate.totalReferrals,
    activeReferrals,
    inactiveReferrals,
    totalCommission,
    pendingEarnings: affiliate.pendingEarnings,
    conversionRate: conversionRate.toFixed(1),
    avgRevenuePerReferral: avgRevenuePerReferral.toFixed(2),
    nextTierAt: getNextTierThreshold(activeReferrals),
  };
}

/**
 * Get next tier threshold
 */
function getNextTierThreshold(currentReferrals: number): number {
  if (currentReferrals < 5) return 5;
  if (currentReferrals < 10) return 10;
  if (currentReferrals < 25) return 25;
  return currentReferrals;
}

/**
 * Validate affiliate code
 */
export function isValidAffiliateCode(code: string): boolean {
  // Code should be 12-15 characters, alphanumeric
  return /^[A-Z0-9]{12,15}$/.test(code);
}

/**
 * Get affiliate dashboard data
 */
export function getAffiliateDashboard(affiliate: AffiliateUser, referrals: AffiliateReferral[]) {
  const stats = getAffiliateStats(affiliate, referrals);
  const tierBonus = calculateTierBonus(stats.activeReferrals);

  return {
    affiliate,
    stats,
    tierBonus,
    referrals: referrals.map((r) => ({
      id: r.id,
      email: r.referredEmail,
      status: r.status,
      signupDate: r.signupDate,
      firstPurchaseDate: r.firstPurchaseDate,
      totalSpent: r.totalSpent,
      commissionEarned: r.commissionEarned,
    })),
    payoutHistory: [], // Would be populated from database
  };
}

/**
 * Format commission for display
 */
export function formatCommission(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Get affiliate tier name
 */
export function getAffiliateTier(activeReferrals: number): string {
  if (activeReferrals >= 25) return 'Platinum';
  if (activeReferrals >= 10) return 'Gold';
  if (activeReferrals >= 5) return 'Silver';
  return 'Bronze';
}

/**
 * Get affiliate tier benefits
 */
export function getAffiliateTierBenefits(tier: string): string[] {
  switch (tier) {
    case 'Platinum':
      return [
        '20% revenue share (vs 20%)',
        '$100 monthly bonus',
        'Dedicated support',
        'Co-marketing opportunities',
      ];
    case 'Gold':
      return [
        '20% revenue share',
        '$50 monthly bonus',
        'Priority support',
        'Featured on affiliate page',
      ];
    case 'Silver':
      return [
        '20% revenue share',
        '$25 monthly bonus',
        'Standard support',
        'Affiliate resources',
      ];
    case 'Bronze':
    default:
      return [
        '20% revenue share',
        '$10 signup bonus',
        'Basic support',
        'Marketing materials',
      ];
  }
}
