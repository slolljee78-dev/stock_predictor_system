import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Signals", href: "/signals" },
  { label: "Trading Simulator", href: "/simulator" },
  { label: "Validation", href: "/validation/dashboard" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Home", href: "/" },
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
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-6">
          {MENU_ITEMS.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="justify-start text-base h-10"
              onClick={() => handleNavigate(item.href)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
