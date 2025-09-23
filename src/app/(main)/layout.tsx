'use client'

import Link from "next/link"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  NotebookPen,
} from "lucide-react"

import { UserNav } from "@/components/user-nav"
import { useAppData } from "@/contexts/app-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <NotebookPen className="h-12 w-12 text-primary animate-pulse" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <NotebookPen className="h-6 w-6 text-primary" />
          <span className="">FocusFlow</span>
        </Link>
        <div className="w-full flex-1">
          {/* Header content can go here */}
        </div>
        <UserNav />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
