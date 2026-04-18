import { useState } from "react";
import { useLocation } from "wouter";
import {
  ChevronRight,
  CircleHelp,
  Crown,
  Gauge,
  Home,
  LayoutDashboard,
  LineChart,
  ShieldCheck,
  Sparkles,
  Waves,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MenuItem = {
  label: string;
  href: string;
  description: string;
  icon: typeof LayoutDashboard;
  accent: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    description: "Signals, watchlists, and daily market workflow.",
    icon: LayoutDashboard,
    accent: "from-sky-500/30 to-blue-500/10",
  },
  {
    label: "Signals",
    href: "/signals",
    description: "Review live trade ideas and signal confidence.",
    icon: Waves,
    accent: "from-cyan-500/25 to-sky-500/10",
  },
  {
    label: "Trading Simulator",
    href: "/simulator",
    description: "Pressure-test setups before acting with capital.",
    icon: LineChart,
    accent: "from-emerald-500/25 to-cyan-500/10",
  },
  {
    label: "Validation",
    href: "/validation/dashboard",
    description: "Track live validation progress and outcomes.",
    icon: ShieldCheck,
    accent: "from-violet-500/25 to-blue-500/10",
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
    description: "Answers on the product and workflow.",
    icon: CircleHelp,
    accent: "from-fuchsia-500/20 to-sky-500/10",
  },
  {
    label: "Home",
    href: "/",
    description: "Return to the landing page overview.",
    icon: Home,
    accent: "from-slate-400/20 to-sky-500/10",
  },
];

export function MobileMenuDrawer() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const handleNavigate = (href: string) => {
    setLocation(href);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-[1.15rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(8,15,30,0.94))] text-foreground shadow-[0_14px_34px_rgba(2,8,23,0.32)] backdrop-blur-xl transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary md:hidden"
          aria-label="Open menu"
        >
          <Gauge className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
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
                    Move between signals, simulator, validation, plans, and your dashboard without leaving the premium workflow.
                  </SheetDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          <nav className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {MENU_ITEMS.map((item) => {
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
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
