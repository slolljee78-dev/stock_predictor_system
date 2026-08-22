/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const setLocation = vi.fn();
const authState = {
  isAuthenticated: false,
};

vi.mock("@/const", () => ({
  getLoginUrl: () => "/mock-login",
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/pricing", setLocation],
}));

describe("PublicSiteHeader", () => {
  afterEach(() => {
    cleanup();
    setLocation.mockReset();
    authState.isAuthenticated = false;
  });

  it("shows the visitor sign-in CTA on public pages and keeps desktop nav links visually consistent", async () => {
    const { PublicSiteHeader } = await import("../client/src/components/PublicSiteHeader.tsx");

    render(React.createElement(PublicSiteHeader, { currentPath: "/pricing" }));

    expect(screen.getByRole("link", { name: /sign in/i }).getAttribute("href")).toBe("/mock-login");

    const pricingLink = screen.getByRole("link", { name: "Pricing" });
    const faqLink = screen.getByRole("link", { name: "FAQ" });

    expect(pricingLink.className).toContain("font-semibold");
    expect(faqLink.className).toContain("font-semibold");
  });

  it("shows the member dashboard CTA when the user is authenticated", async () => {
    authState.isAuthenticated = true;
    const { PublicSiteHeader } = await import("../client/src/components/PublicSiteHeader.tsx");

    render(React.createElement(PublicSiteHeader, { currentPath: "/faq" }));

    expect(screen.getByRole("button", { name: /open dashboard/i })).not.toBeNull();
  });

  it("takes an authenticated user to the dashboard when they select the Vortextrade logo", async () => {
    authState.isAuthenticated = true;
    const { PublicSiteHeader } = await import("../client/src/components/PublicSiteHeader.tsx");

    render(React.createElement(PublicSiteHeader, { currentPath: "/" }));
    fireEvent.click(screen.getByRole("button", { name: "Open Vortextrade dashboard" }));

    expect(setLocation).toHaveBeenCalledWith("/dashboard");
  });

  it("keeps the mobile header compact and gives the navigation drawer one labelled close control", async () => {
    const { PublicSiteHeader } = await import("../client/src/components/PublicSiteHeader.tsx");

    render(React.createElement(PublicSiteHeader, { currentPath: "/" }));

    const homeControl = screen.getByRole("button", { name: "Go to Vortextrade homepage" });
    expect(homeControl.className).not.toContain("flex-1");

    const menuTrigger = screen.getByRole("button", { name: "Open navigation menu" });
    expect(menuTrigger.textContent).toContain("Menu");
    fireEvent.click(menuTrigger);

    expect(screen.getAllByRole("button", { name: "Close navigation menu" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });
});
