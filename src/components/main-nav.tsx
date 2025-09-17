"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Target, CalendarDays, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const userLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Habits", href: "/habits", icon: Target },
  { name: "History", href: "/history", icon: CalendarDays },
];

const appLinks = [
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
];

export function MainNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {userLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-accent text-accent-foreground"
            )}
            onClick={onLinkClick}
          >
            <link.icon className="h-4 w-4" />
            {link.name}
          </Link>
        );
      })}
      
      <Separator className="my-2" />

      {appLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-accent text-accent-foreground"
            )}
            onClick={onLinkClick}
          >
            <link.icon className="h-4 w-4" />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
