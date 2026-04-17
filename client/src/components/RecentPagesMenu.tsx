import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Clock, BarChart3, CheckSquare, TrendingUp } from "lucide-react";

interface RecentPage {
  path: string;
  label: string;
  icon: React.ReactNode;
  timestamp: number;
}

const PAGE_DEFINITIONS: Record<string, { label: string; icon: React.ReactNode }> = {
  "/dashboard": { label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
  "/simulator": { label: "Trading Simulator", icon: <TrendingUp className="h-4 w-4" /> },
  "/pricing": { label: "Pricing", icon: <BarChart3 className="h-4 w-4" /> },
  "/validation": { label: "Validation", icon: <CheckSquare className="h-4 w-4" /> },
};

const STORAGE_KEY = "recent_pages";
const MAX_RECENT = 3;

export function RecentPagesMenu() {
  const [, setLocation] = useLocation();
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  useEffect(() => {
    // Load recent pages from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentPages(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent pages:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Track current page
    const currentPath = window.location.pathname;
    const pageDef = PAGE_DEFINITIONS[currentPath];

    if (pageDef) {
      setRecentPages((prev) => {
        // Remove if already exists
        const filtered = prev.filter((p) => p.path !== currentPath);
        // Add current page to front
        const updated = [
          {
            path: currentPath,
            label: pageDef.label,
            icon: pageDef.icon,
            timestamp: Date.now(),
          },
          ...filtered,
        ].slice(0, MAX_RECENT);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [window.location.pathname]);

  if (recentPages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Recent</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Recently Visited</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentPages.map((page) => (
          <DropdownMenuItem
            key={page.path}
            onClick={() => setLocation(page.path)}
            className="cursor-pointer gap-2"
          >
            {page.icon}
            <span>{page.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
