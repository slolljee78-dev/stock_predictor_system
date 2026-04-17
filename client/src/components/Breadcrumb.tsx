import { ChevronRight, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const [, setLocation] = useLocation();

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 gap-1"
        onClick={() => setLocation("/")}
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Button>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          {index === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setLocation(item.href)}
            >
              {item.label}
            </Button>
          )}
        </div>
      ))}
    </nav>
  );
}
