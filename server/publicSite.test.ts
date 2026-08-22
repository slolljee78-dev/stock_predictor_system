import { describe, expect, it } from "vitest";
import {
  getPublicAudienceState,
  getPublicPrimaryAction,
  isHashNavigation,
  isPublicHeaderLinkActive,
  PUBLIC_HEADER_LINKS,
  PUBLIC_MOBILE_NAV_SECTIONS,
} from "../client/src/lib/publicSite";

describe("public site helpers", () => {
  it("maps authentication state to the correct audience state", () => {
    expect(getPublicAudienceState(true)).toBe("member");
    expect(getPublicAudienceState(false)).toBe("visitor");
  });

  it("returns stable primary actions for each CTA surface", () => {
    expect(getPublicPrimaryAction("visitor", "header")).toEqual({
      label: "Sign in",
      target: "login",
    });

    expect(getPublicPrimaryAction("visitor", "hero")).toEqual({
      label: "Start 7-day free trial",
      target: "login",
    });

    expect(getPublicPrimaryAction("member", "header")).toEqual({
      label: "Open dashboard",
      target: "dashboard",
    });

    expect(getPublicPrimaryAction("visitor", "dashboard_gate")).toEqual({
      label: "Sign in to continue",
      target: "login",
    });
  });

  it("keeps the public header links aligned to the current top-level destinations", () => {
    expect(PUBLIC_HEADER_LINKS.map((link) => link.label)).toEqual([
      "Features",
      "Signal Engine",
      "How it works",
      "Platform tour",
      "Pricing",
      "FAQ",
      "Live Signals",
      "Free Tools",
    ]);
  });

  it("marks only the matching secondary route as active", () => {
    const pricingLink = PUBLIC_HEADER_LINKS.find((link) => link.label === "Pricing");
    const faqLink = PUBLIC_HEADER_LINKS.find((link) => link.label === "FAQ");

    expect(pricingLink).toBeDefined();
    expect(faqLink).toBeDefined();
    expect(isPublicHeaderLinkActive(pricingLink!, "/pricing")).toBe(true);
    expect(isPublicHeaderLinkActive(pricingLink!, "/faq")).toBe(false);
    expect(isPublicHeaderLinkActive(faqLink!, "/faq")).toBe(true);
  });

  it("preserves both Explore and Workspace mobile drawer sections", () => {
    expect(PUBLIC_MOBILE_NAV_SECTIONS.map((section) => section.title)).toEqual([
      "Explore",
      "Workspace",
    ]);
    expect(PUBLIC_MOBILE_NAV_SECTIONS[0].items.some((item) => item.href === "/pricing")).toBe(true);
    expect(PUBLIC_MOBILE_NAV_SECTIONS[1].items.some((item) => item.href === "/dashboard")).toBe(true);
  });

  it("distinguishes between hash navigation and normal route navigation", () => {
    expect(isHashNavigation("/#features")).toBe(true);
    expect(isHashNavigation("/pricing")).toBe(false);
  });
});
