"use client";

import { useState } from "react";
import { HabitList } from "@/components/habits/habit-list";
import { CreateHabitDialog } from "@/components/habits/create-habit-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function HabitsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hábitos</h1>
          <p className="text-muted-foreground">
            Tu constancia está construyendo la mejor versión de ti.
          </p>
        </div>
        {!isMobile && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Hábito
          </Button>
        )}
      </div>
      <HabitList />
      {isMobile && (
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="fixed bottom-20 right-4 h-16 w-16 rounded-full shadow-lg"
        >
          <Plus className="h-8 w-8" />
        </Button>
      )}
      <CreateHabitDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
