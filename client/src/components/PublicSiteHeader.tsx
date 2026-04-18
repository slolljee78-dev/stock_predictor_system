import React from "react";
import { Button } from "@/components/ui/button";
import { MobileMenuDrawer } from "@/components/MobileMenuDrawer";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  getPublicAudienceState,
  getPublicPrimaryAction,
  isPublicHeaderLinkActive,
  PUBLIC_HEADER_LINKS,
} from "@/lib/publicSite";
import { ArrowRight, LineChart } from "lucide-react";
import { useLocation } from "wouter";

type PublicSiteHeaderProps = {
  currentPath: string;
};

export function PublicSiteHeader({ currentPath }: PublicSiteHeaderProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const audienceState = getPublicAudienceState(isAuthenticated);
  const primaryAction = getPublicPrimaryAction(audienceState, "header");

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="container flex max-w-full items-center justify-between gap-2 px-4 py-4 md:px-6">
        <button
          onClick={() => setLocation("/")}
          className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity hover:opacity-80"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-primary">
            <LineChart className="h-6 w-6" />
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/90">Stock Predictor</p>
            <p className="truncate text-sm text-muted-foreground">Premium AI signals for Trading 212</p>
          </div>
        </button>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground lg:flex">
          {PUBLIC_HEADER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`transition ${isPublicHeaderLinkActive(link, currentPath) ? "text-foreground" : "hover:text-foreground"}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <MobileMenuDrawer />
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {primaryAction.target === "dashboard" ? (
            <Button
              onClick={() => setLocation("/dashboard")}
              className="pill-button pill-button-primary h-10 whitespace-nowrap px-4 text-xs sm:h-12 sm:px-5 sm:text-sm md:text-base"
            >
              {primaryAction.label}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild className="pill-button pill-button-primary h-10 whitespace-nowrap px-4 text-xs sm:h-12 sm:px-5 sm:text-sm md:text-base">
              <a href={getLoginUrl()}>
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
