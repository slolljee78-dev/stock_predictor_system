/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const setLocation = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
  }),
}));

vi.mock("@/const", () => ({
  getLoginUrl: () => "/mock-login",
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/", setLocation],
}));

vi.mock("../client/src/components/PublicSiteHeader", () => ({
  PublicSiteHeader: () => React.createElement("div", { "data-testid": "public-header" }),
}));

describe("Home marketing copy", () => {
  afterEach(() => {
    setLocation.mockReset();
  });

  it("renders the supported signal-review workflow and public risk notice", async () => {
    const { default: Home } = await import("../client/src/pages/Home.tsx");

    render(React.createElement(Home));

    expect(screen.getByText("A smoother way to move from ideas to action.")).not.toBeNull();
    expect(screen.getByText("A clearer signal-review workflow")).not.toBeNull();
    expect(screen.getByText(/Explore the tools, understand the limitations, and validate ideas/i)).not.toBeNull();
    expect(screen.getByText("Create a watchlist that suits you")).not.toBeNull();
    expect(screen.getByText("Check your strongest opportunities")).not.toBeNull();
    expect(screen.getByText("Important: Please Read Before Trading")).not.toBeNull();
    expect(screen.getByText(/Vortextrade is not authorised or regulated by the Financial Conduct Authority/i)).not.toBeNull();
  });
});
