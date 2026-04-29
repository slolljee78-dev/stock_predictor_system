import { Eye, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type AdminViewMode } from "@/lib/adminViewMode";

interface AdminViewModeToggleProps {
  viewMode: AdminViewMode;
  description: string;
  onChange: (mode: AdminViewMode) => void;
}

export function AdminViewModeToggle({ viewMode, description, onChange }: AdminViewModeToggleProps) {
  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Admin test mode
            </Badge>
            <Badge variant="outline" className="rounded-full border-primary/35 bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
              <Eye className="mr-1 h-3.5 w-3.5" />
              {viewMode === "free" ? "Free view" : "Premium view"}
            </Badge>
          </div>
          <p className="text-sm text-foreground">
            Switch this browser between the locked free-plan experience and the unlocked premium admin view.
          </p>
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-[320px]">
          <Button
            type="button"
            variant={viewMode === "premium" ? "default" : "outline"}
            className="w-full"
            onClick={() => onChange("premium")}
          >
            Premium view
          </Button>
          <Button
            type="button"
            variant={viewMode === "free" ? "default" : "outline"}
            className="w-full"
            onClick={() => onChange("free")}
          >
            Free-plan view
          </Button>
        </div>
      </div>
    </div>
  );
}
