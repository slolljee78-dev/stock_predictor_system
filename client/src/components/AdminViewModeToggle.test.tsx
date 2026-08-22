// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminViewModeToggle } from "@/components/AdminViewModeToggle";

describe("AdminViewModeToggle", () => {
  it("keeps a full-width overflow-safe mobile container and renders both view buttons", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <AdminViewModeToggle
        viewMode="premium"
        description="Premium admin view is active in this browser."
        onChange={handleChange}
      />,
    );

    expect(container.firstElementChild?.className).toContain("w-full");
    expect(container.firstElementChild?.className).toContain("max-w-full");
    expect(container.firstElementChild?.className).toContain("overflow-hidden");
    expect(screen.getByRole("button", { name: /premium view/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /free-plan view/i })).toBeTruthy();
  });

  it("allows the header badges to wrap on small screens", () => {
    const { container } = render(
      <AdminViewModeToggle
        viewMode="free"
        description="Free-plan preview mode is active in this browser."
        onChange={() => undefined}
      />,
    );

    const wrappingBadgeRow = container.querySelector(".flex.flex-wrap.items-center.gap-2");
    expect(wrappingBadgeRow).toBeTruthy();
  });
});
