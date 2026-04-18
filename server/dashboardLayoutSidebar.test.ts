/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const setLocation = vi.fn();
const setOpenMobile = vi.fn();
const sidebarProviderSpy = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    loading: false,
    user: {
      name: "Test User",
      email: "test@example.com",
    },
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    alerts: {
      getAlertStats: {
        useQuery: () => ({ data: { pending: 0 } }),
      },
    },
  },
}));

vi.mock("@/hooks/useMobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/const", () => ({
  getLoginUrl: () => "/mock-login",
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/dashboard", setLocation],
}));

vi.mock("@/components/ui/dropdown-menu", () => {
  const passthrough = ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  return {
    DropdownMenu: passthrough,
    DropdownMenuContent: passthrough,
    DropdownMenuItem: passthrough,
    DropdownMenuTrigger: passthrough,
  };
});

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.createElement("button", props, children),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => React.createElement("span", null, children),
}));

vi.mock("@/components/ui/sidebar", () => {
  const wrap = (tag: string) => ({ children, ...props }: { children?: React.ReactNode }) => React.createElement(tag, props, children);
  return {
    Sidebar: wrap("aside"),
    SidebarContent: wrap("div"),
    SidebarFooter: wrap("div"),
    SidebarGroup: wrap("section"),
    SidebarGroupContent: wrap("div"),
    SidebarHeader: wrap("div"),
    SidebarInset: wrap("div"),
    SidebarMenu: wrap("div"),
    SidebarMenuButton: ({ children, ...props }: { children?: React.ReactNode }) => React.createElement("button", props, children),
    SidebarMenuItem: wrap("div"),
    SidebarProvider: ({ children, defaultOpen }: { children: React.ReactNode; defaultOpen?: boolean }) => {
      sidebarProviderSpy(defaultOpen);
      return React.createElement("div", { "data-testid": "sidebar-provider", "data-default-open": String(defaultOpen) }, children);
    },
    SidebarTrigger: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.createElement("button", props),
    useSidebar: () => ({ setOpenMobile }),
  };
});

vi.mock("../client/src/components/DashboardLayoutSkeleton", () => ({
  DashboardLayoutSkeleton: () => React.createElement("div", null, "loading"),
}));

vi.mock("../client/src/components/NotificationCenter", () => ({
  default: () => React.createElement("div", null, "notifications"),
}));

vi.mock("../client/src/components/UserProfileMenu", () => ({
  UserProfileMenu: () => React.createElement("div", null, "profile"),
}));

describe("DashboardLayout sidebar behavior", () => {
  it("keeps the desktop sidebar collapsed by default on first dashboard load", async () => {
    const { default: DashboardLayout } = await import("../client/src/components/DashboardLayout.tsx");

    render(React.createElement(DashboardLayout, null, React.createElement("div", null, "content")));

    expect(screen.getByTestId("sidebar-provider").getAttribute("data-default-open")).toBe("false");
    expect(sidebarProviderSpy).toHaveBeenCalledWith(false);
  });
});
