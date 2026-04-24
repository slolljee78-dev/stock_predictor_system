export interface PricingRecommendation {
  tier: "Starter" | "Pro" | "Elite";
  badge: string;
  reason: string;
}

export function getPricingRecommendation(
  watchlistCount: number,
  signalCount: number,
): PricingRecommendation {
  if (!watchlistCount) {
    return {
      tier: "Starter",
      badge: "Good place to begin",
      reason:
        "A lighter daily-review workflow is the most sensible starting point before you build out a larger watchlist.",
    };
  }

  if (watchlistCount > 50 || signalCount > 25) {
    return {
      tier: "Elite",
      badge: "Best fit right now",
      reason:
        "Your current activity suggests you will benefit most from advanced validation, exports, and broader workflow control.",
    };
  }

  if (watchlistCount > 15 || signalCount > 8) {
    return {
      tier: "Pro",
      badge: "Recommended upgrade",
      reason:
        "Your watchlist size and live signal volume point to faster alerts and broader coverage becoming more useful.",
    };
  }

  return {
    tier: "Starter",
    badge: "Recommended upgrade",
    reason:
      "Your current activity still fits a focused daily-review plan without adding unnecessary complexity.",
  };
}
