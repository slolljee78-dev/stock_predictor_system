import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  ArrowUpRight,
  BarChart3,
  BellRing,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Activity,
  Target,
  Settings,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import NotificationCenter from "./NotificationCenter";
import { UserProfileMenu } from "./UserProfileMenu";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { consumeDashboardMenuRequest } from "@/lib/navigation";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Overview",
    path: "/dashboard",
    description: "Signals, watchlists, and daily market pulse",
  },
  {
    icon: TrendingUp,
    label: "Signals",
    path: "/signals",
    description: "Real-time trading signals and technical analysis",
  },
  {
    icon: BarChart3,
    label: "Simulator",
    path: "/simulator",
    description: "Practice trades and review performance",
  },
  {
    icon: CreditCard,
    label: "Plans",
    path: "/pricing",
    description: "Manage access and premium features",
  },
  {
    icon: ShieldCheck,
    label: "Validation",
    path: "/validation/dashboard",
    description: "Track live validation progress",
  },
  {
    icon: Target,
    label: "Signal Accuracy",
    path: "/signal-accuracy",
    description: "Win rates, P&L, and performance metrics",
  },
  {
    icon: Settings,
    label: "Alert Preferences",
    path: "/alert-preferences",
    description: "Customize alert thresholds and channels",
  },
  {
    icon: BellRing,
    label: "Notifications",
    path: "/alerts",
    description: "View signal alerts history and delivery status",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [loading, setLocation, user]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="dashboard-shell min-h-screen flex items-center justify-center px-6 py-16">
        <div className="premium-card w-full max-w-xl p-8 md:p-10 text-center">
          <div className="eyebrow mb-6 mx-auto w-fit">
            <Sparkles className="h-4 w-4 text-primary" />
            Returning you to the homepage
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">Public visitors start on the landing page</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
            The dashboard is private, so unauthenticated visits are redirected to the public homepage where you can explore the product or choose to sign in.
          </p>
          <Button
            size="lg"
            className="pill-button pill-button-primary h-14 px-7 text-base"
            onClick={() => setLocation("/")}
          >
            Go to homepage
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="mt-3 h-14 rounded-full px-7 text-base"
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
          >
            Sign in instead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  const { data: alertStats } = trpc.alerts.getAlertStats.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const activeMenuItem = useMemo(() => {
    return (
      menuItems.find((item) =>
        item.path === "/dashboard"
          ? location === "/dashboard"
          : location.startsWith(item.path)
      ) ?? menuItems[0]
    );
  }, [location]);

  useEffect(() => {
    if (location !== "/dashboard") {
      return;
    }

    if (!consumeDashboardMenuRequest()) {
      return;
    }

    const openMenu = () => setOpenMobile(true);
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      window.requestAnimationFrame(openMenu);
    } else {
      openMenu()
    }
  }, [location, setOpenMobile]);

  return (
    <div className="dashboard-shell min-h-screen">
      <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
        <div className="h-full px-3 py-3">
          <div className="dashboard-frame h-full overflow-hidden">
            <SidebarHeader className="border-b border-border/70 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/85">Stock Predictor</p>
                  <p className="truncate text-sm text-muted-foreground">AI signals for Trading 212</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-3 overflow-y-auto scroll-smooth">
              <SidebarGroup>
                <div className="px-3 pb-1 group-data-[collapsible=icon]:hidden pt-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
                </div>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1.5">
                    {menuItems.map((item) => {
                      const isActive =
                        item.path === "/dashboard"
                          ? location === "/dashboard"
                          : location.startsWith(item.path);
                      
                      const showBadge = item.path === "/alerts" && alertStats && alertStats.pending > 0;

                      return (
                        <SidebarMenuItem key={item.path}>
                          <div className="relative">
                            <SidebarMenuButton
                              isActive={isActive}
                              tooltip={item.label}
                              onClick={() => setLocation(item.path)}
                              className="h-auto min-h-[72px] items-start rounded-2xl px-3 py-3 md:min-h-auto md:py-3 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:shadow-primary/20 hover:bg-secondary/80"
                            >
                              <item.icon className="h-5 w-5 md:h-4 md:w-4 shrink-0" />
                              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                                <p className="text-sm font-semibold leading-tight md:text-sm">{item.label}</p>
                                <p className="line-clamp-2 text-xs leading-snug opacity-75">{item.description}</p>
                              </div>
                            </SidebarMenuButton>
                            {showBadge && (
                              <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                                {alertStats.pending}
                              </Badge>
                            )}
                          </div>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="mt-4 hidden px-1 group-data-[collapsible=icon]:hidden md:block">
                <div className="rounded-3xl border border-border/70 bg-background/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Guided workflow
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Build a watchlist, review fresh signals, then inspect each stock in detail before acting.
                  </p>
                </div>
              </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-border/70 px-3 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-background/40 px-3 py-3 text-left transition hover:bg-secondary/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-10 w-10 border border-border/80">
                      <AvatarFallback className="bg-primary/15 text-primary font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                      <p className="truncate text-sm font-semibold text-foreground">{user?.name || "User"}</p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email || "No email"}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl">
                  <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </div>
        </div>
      </Sidebar>

      <SidebarInset className="bg-transparent">
        <div className="sticky top-0 z-40 -mt-10 px-2 pt-0 md:mt-0 md:px-4 md:pt-0 bg-background/92 backdrop-blur-xl border-b border-border/40">
          <div className="dashboard-frame flex min-h-[76px] items-center justify-between gap-2 px-3 py-2 md:min-h-14 md:px-6 md:py-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 rounded-[1.35rem] border border-primary/30 bg-[linear-gradient(135deg,rgba(36,99,235,0.16),rgba(14,165,233,0.08))] px-2.5 py-2 shadow-[0_14px_32px_rgba(37,99,235,0.18)] backdrop-blur">
                <SidebarTrigger title="Open menu" className="h-11 w-11 rounded-[1rem] border border-primary/35 bg-background/70 hover:bg-primary/12 flex items-center justify-center text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(15,23,42,0.28)] transition-all" />
                <div className="hidden sm:block">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/90">Workspace</p>
                  <p className="text-xs text-muted-foreground">Open navigation</p>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-base font-semibold leading-tight md:text-xl md:tracking-tight truncate">{activeMenuItem.label}</p>
                  {!isMobile && (
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
                      Premium workspace
                    </Badge>
                  )}
                </div>
                <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground md:truncate md:text-sm">{activeMenuItem.description}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 md:gap-2">
              {!isMobile && (
                <div className="hidden lg:flex items-center gap-2 rounded-full border border-border/70 bg-background/40 px-3 py-2 text-sm text-muted-foreground">
                  <BellRing className="h-4 w-4 text-primary" />
                  Alerts and system updates
                </div>
              )}
              <NotificationCenter />
              <UserProfileMenu />
            </div>
          </div>
        </div>

        <main className="container -mt-2 pt-0 pb-3 md:mt-0 md:py-6 lg:py-8">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
