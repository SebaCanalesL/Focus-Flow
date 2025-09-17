"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Target, CalendarDays, User } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Habits", href: "/habits", icon: Target },
  { name: "History", href: "/history", icon: CalendarDays },
  { name: "Profile", href: "/profile", icon: User },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-accent text-primary"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
