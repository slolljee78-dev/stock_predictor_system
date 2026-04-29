import { useEffect, useMemo, useState } from "react";

import { isAdminUser, type SubscriptionAwareUser } from "@/lib/subscriptionAccess";

export type AdminViewMode = "premium" | "free";

const ADMIN_VIEW_MODE_STORAGE_KEY = "stock-predictor-admin-view-mode";

function normalizeAdminViewMode(value: string | null | undefined): AdminViewMode {
  return value === "free" ? "free" : "premium";
}

export function getStoredAdminViewMode(): AdminViewMode {
  if (typeof window === "undefined") {
    return "premium";
  }

  return normalizeAdminViewMode(window.localStorage.getItem(ADMIN_VIEW_MODE_STORAGE_KEY));
}

export function resolveAccessUserForAdminViewMode(
  user?: SubscriptionAwareUser | null,
  mode: AdminViewMode = "premium",
): SubscriptionAwareUser | null | undefined {
  if (!user || !isAdminUser(user)) {
    return user;
  }

  if (mode === "free") {
    return {
      ...user,
      role: "user",
      subscriptionTier: "free",
      subscriptionStatus: "inactive",
    };
  }

  return user;
}

export function getAdminViewModeDescription(mode: AdminViewMode) {
  return mode === "free"
    ? "Free-plan preview mode is active in this browser. Upgrade prompts and locked premium states are being shown for testing."
    : "Premium admin view is active in this browser. Premium signals and auto-trading tools are shown as unlocked for testing.";
}

export function useAdminViewMode(user?: SubscriptionAwareUser | null) {
  const [viewMode, setViewMode] = useState<AdminViewMode>(() => getStoredAdminViewMode());
  const isAdmin = isAdminUser(user);

  useEffect(() => {
    if (!isAdmin || typeof window === "undefined") {
      return;
    }

    setViewMode(getStoredAdminViewMode());
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ADMIN_VIEW_MODE_STORAGE_KEY, viewMode);
  }, [isAdmin, viewMode]);

  const effectiveUser = useMemo(
    () => resolveAccessUserForAdminViewMode(user, viewMode),
    [user, viewMode],
  );

  return {
    effectiveUser,
    showAdminViewModeToggle: isAdmin,
    viewMode,
    setViewMode,
    description: getAdminViewModeDescription(viewMode),
  };
}
