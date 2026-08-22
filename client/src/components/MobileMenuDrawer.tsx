import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, ChevronRight, Gauge, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  getPublicAudienceState,
  getPublicPrimaryAction,
  isHashNavigation,
  PUBLIC_MOBILE_NAV_SECTIONS,
} from "@/lib/publicSite";

export function MobileMenuDrawer() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const audienceState = getPublicAudienceState(isAuthenticated);
  const primaryAction = getPublicPrimaryAction(audienceState, "header");

  const handleNavigate = (href: string) => {
    if (isHashNavigation(href)) {
      window.location.href = href;
    } else {
      setLocation(href);
    }

    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(8,15,30,0.94))] px-3 text-sm font-semibold text-foreground shadow-[0_10px_28px_rgba(2,8,23,0.28)] backdrop-blur-xl transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary md:hidden"
          aria-label="Open navigation menu"
        >
          <Gauge className="h-4 w-4" />
          <span>Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[88vw] max-w-[380px] border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_35%),linear-gradient(180deg,rgba(4,10,24,0.98),rgba(2,6,18,0.98))] p-0 text-white shadow-[0_32px_90px_rgba(2,6,23,0.75)]"
      >
        <div className="flex h-full flex-col overflow-hidden">
          <SheetHeader className="border-b border-white/8 px-5 pb-5 pt-5 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/90">
                  <Sparkles className="h-3.5 w-3.5" />
                  Workspace navigation
                </div>
                <div>
                  <SheetTitle className="text-3xl font-semibold tracking-tight text-white">
                    Navigate the platform
                  </SheetTitle>
                  <SheetDescription className="mt-2 max-w-[26ch] text-sm leading-6 text-slate-300">
                    Move through the product story, pricing, FAQ, and your dashboard with the same navigation pattern used across the public site.
                  </SheetDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
            {PUBLIC_MOBILE_NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-3">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {section.title}
                </p>
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => handleNavigate(item.href)}
                        className="group flex w-full items-center gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-left transition-all hover:border-primary/25 hover:bg-white/[0.06] hover:shadow-[0_18px_38px_rgba(14,165,233,0.12)]"
                      >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${item.accent} text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-base font-semibold text-white">{item.label}</p>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-400">{item.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/8 px-4 pb-5 pt-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Next step</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {primaryAction.target === "dashboard"
                  ? "Return to your dashboard and continue your trading workflow."
                  : "Sign in to unlock your signal workspace, watchlists, and validation tools."}
              </p>
              <div className="mt-4">
                {primaryAction.target === "dashboard" ? (
                  <Button
                    type="button"
                    onClick={() => handleNavigate("/dashboard")}
                    className="pill-button pill-button-primary h-12 w-full"
                  >
                    {primaryAction.label}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button asChild className="pill-button pill-button-primary h-12 w-full">
                    <a href={getLoginUrl()} onClick={() => setOpen(false)}>
                      {primaryAction.label}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
