import {
  CircleHelp,
  Crown,
  Home,
  LayoutDashboard,
  LineChart,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type PublicAudienceState = "visitor" | "member";
export type PublicCtaSurface = "header" | "hero" | "dashboard_gate";
export type PublicCtaTarget = "login" | "dashboard";

export type PublicPrimaryAction = {
  label: string;
  target: PublicCtaTarget;
};

export type PublicHeaderLink = {
  label: string;
  href: string;
  activePaths: string[];
};

export type PublicMobileNavItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export type PublicMobileNavSection = {
  title: string;
  items: PublicMobileNavItem[];
};

export const PUBLIC_HEADER_LINKS: PublicHeaderLink[] = [
  {
    label: "Features",
    href: "/#features",
    activePaths: ["/"],
  },
  {
    label: "How it works",
    href: "/#workflow",
    activePaths: ["/"],
  },
  {
    label: "Platform tour",
    href: "/#demo",
    activePaths: ["/"],
  },
  {
    label: "Pricing",
    href: "/pricing",
    activePaths: ["/pricing"],
  },
  {
    label: "FAQ",
    href: "/faq",
    activePaths: ["/faq"],
  },
];

export const PUBLIC_MOBILE_NAV_SECTIONS: PublicMobileNavSection[] = [
  {
    title: "Explore",
    items: [
      {
        label: "Home",
        href: "/",
        description: "Return to the landing page overview and value proposition.",
        icon: Home,
        accent: "from-slate-400/20 to-sky-500/10",
      },
      {
        label: "Features",
        href: "/#features",
        description: "See the core signal, watchlist, and alert workflow.",
        icon: LineChart,
        accent: "from-sky-500/30 to-blue-500/10",
      },
      {
        label: "How it works",
        href: "/#workflow",
        description: "Understand the step-by-step review flow from watchlist to validation.",
        icon: ShieldCheck,
        accent: "from-violet-500/25 to-blue-500/10",
      },
      {
        label: "Platform tour",
        href: "/#demo",
        description: "Jump to the walkthrough section and product story.",
        icon: LayoutDashboard,
        accent: "from-cyan-500/25 to-sky-500/10",
      },
      {
        label: "Pricing",
        href: "/pricing",
        description: "Compare premium tiers and feature access.",
        icon: Crown,
        accent: "from-amber-400/25 to-sky-500/10",
      },
      {
        label: "FAQ",
        href: "/faq",
        description: "Review common questions before you subscribe.",
        icon: CircleHelp,
        accent: "from-fuchsia-500/20 to-sky-500/10",
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        description: "Open your signal workspace, watchlists, and daily review flow.",
        icon: LayoutDashboard,
        accent: "from-sky-500/30 to-blue-500/10",
      },
      {
        label: "Validation",
        href: "/validation/dashboard",
        description: "Track validation progress and pressure-test outcomes.",
        icon: ShieldCheck,
        accent: "from-violet-500/25 to-blue-500/10",
      },
    ],
  },
];

export function getPublicAudienceState(isAuthenticated: boolean): PublicAudienceState {
  return isAuthenticated ? "member" : "visitor";
}

export function getPublicPrimaryAction(
  state: PublicAudienceState,
  surface: PublicCtaSurface,
): PublicPrimaryAction {
  if (surface === "hero") {
    return state === "member"
      ? { label: "Go to my dashboard", target: "dashboard" }
      : { label: "Start 7-day free trial", target: "login" };
  }

  if (surface === "dashboard_gate") {
    return state === "member"
      ? { label: "Open dashboard", target: "dashboard" }
      : { label: "Sign in to continue", target: "login" };
  }

  return state === "member"
    ? { label: "Open dashboard", target: "dashboard" }
    : { label: "Sign in", target: "login" };
}

export function isPublicHeaderLinkActive(link: PublicHeaderLink, currentPath: string) {
  return link.activePaths.includes(currentPath);
}

export function isHashNavigation(href: string) {
  return href.includes("#");
}
