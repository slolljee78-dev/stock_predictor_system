/**
 * Owner-only admin link component
 * Displays admin dashboard link only for the platform owner
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export function OwnerAdminLink() {
  const { user } = useAuth();

  // Only show for admin users
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <Button asChild variant="outline" className="text-foreground gap-2">
      <a href="/admin">
        <Settings className="h-4 w-4" />
        Admin Dashboard
      </a>
    </Button>
  );
}
