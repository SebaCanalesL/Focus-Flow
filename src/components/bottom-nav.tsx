"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Target, CalendarDays } from "lucide-react";

const userLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Hábitos", href: "/habits", icon: Target },
  { name: "Historial", href: "/history", icon: CalendarDays },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex justify-around">
        {userLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 text-xs text-muted-foreground transition-all hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
