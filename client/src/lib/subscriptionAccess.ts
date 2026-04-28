export type SubscriptionAwareUser = {
  subscriptionTier?: string | null;
  subscriptionStatus?: string | null;
};

export function normalizeSubscriptionTier(tier?: string | null) {
  return (tier ?? "free").toLowerCase();
}

export function normalizeSubscriptionStatus(status?: string | null) {
  return (status ?? "inactive").toLowerCase();
}

export function hasActivePaidPlan(user?: SubscriptionAwareUser | null) {
  if (!user) {
    return false;
  }

  const tier = normalizeSubscriptionTier(user.subscriptionTier);
  const status = normalizeSubscriptionStatus(user.subscriptionStatus);

  return tier !== "free" && status === "active";
}

export function canViewPremiumSignalDetails(user?: SubscriptionAwareUser | null) {
  return hasActivePaidPlan(user);
}

export function canUseAutoTrading(user?: SubscriptionAwareUser | null) {
  return hasActivePaidPlan(user);
}

export function getSignalUpgradeMessage(user?: SubscriptionAwareUser | null) {
  if (hasActivePaidPlan(user)) {
    return "Premium signal detail is active on your account.";
  }

  return "Upgrade to a paid plan to unlock full live buy and sell signal detail across your watchlist.";
}

export function getAutoTradingUpgradeMessage(user?: SubscriptionAwareUser | null) {
  if (hasActivePaidPlan(user)) {
    return "Auto trading is available on your account.";
  }

  return "Upgrade to a paid plan to unlock automated paper-trading rounds, wider basket scans, and hands-free virtual execution.";
}

export function getUpgradePlanLabel(user?: SubscriptionAwareUser | null) {
  if (hasActivePaidPlan(user)) {
    return "Manage plan";
  }

  return "View plans";
}
