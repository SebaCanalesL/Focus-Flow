"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

const filters = ["Todas", "Partir el día", "Terminar el día"];

export default function RoutinesPage() {
  const [selectedFilter, setSelectedFilter] = useState("Todas");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Rutinas</h1>
        <Link
          href="/routines/create"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Crear Rutina
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={cn(
              buttonVariants({
                variant: selectedFilter === filter ? "default" : "outline",
                size: "sm",
              }),
              "rounded-full px-4"
            )}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
