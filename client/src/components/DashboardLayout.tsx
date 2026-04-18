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

  const activeMenuItem = useMemo(() => {
    return (
      menuItems.find((item) =>
        item.path === "/dashboard"
          ? location === "/dashboard"
          : location.startsWith(item.path)
      ) ?? menuItems[0]
    );
  }, [location]);

  return (
    <div className="dashboard-shell min-h-screen">
      <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
        <div className="h-full px-3 py-3">
          <div className="dashboard-frame h-full overflow-hidden">
            <SidebarHeader className="border-b border-border/70 px-4 py-4">
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

            <SidebarContent className="px-3 py-4 overflow-y-auto scroll-smooth">
              <SidebarGroup>
                <div className="px-3 pb-2 group-data-[collapsible=icon]:hidden pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
                </div>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-2">
                    {menuItems.map((item) => {
                      const isActive =
                        item.path === "/dashboard"
                          ? location === "/dashboard"
                          : location.startsWith(item.path);

                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.label}
                            onClick={() => setLocation(item.path)}
                            className="h-auto rounded-2xl px-3 py-4 md:py-3 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:shadow-primary/20 hover:bg-secondary/80 min-h-[56px] md:min-h-auto"
                          >
                            <item.icon className="h-5 w-5 md:h-4 md:w-4 shrink-0" />
                            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                              <p className="truncate text-sm md:text-sm font-semibold">{item.label}</p>
                              <p className="truncate text-xs opacity-75">{item.description}</p>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="mt-5 px-1 group-data-[collapsible=icon]:hidden">
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
        <div className="sticky top-0 z-40 px-3 pt-0 md:px-4 md:pt-0">
          <div className="dashboard-frame flex min-h-14 items-center justify-between gap-2 px-3 py-1.5 md:px-6 md:py-2">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="h-10 w-10 rounded-xl border border-border/70 bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-lg md:text-xl font-semibold tracking-tight truncate">{activeMenuItem.label}</p>
                  {!isMobile && (
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
                      Premium workspace
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{activeMenuItem.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
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

        <main className="container py-6 md:py-8 lg:py-10">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
