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

export function assertAutoTradingAccess(user?: SubscriptionAwareUser | null) {
  if (hasActivePaidPlan(user)) {
    return;
  }

  throw new Error("Auto trading is available on paid plans only. Upgrade to continue.");
}
