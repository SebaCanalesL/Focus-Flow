"use client";

import { useState, useRef, useEffect } from "react";
import { HabitList, HabitListRef } from "@/components/habits/habit-list";
import { CreateHabitDialog } from "@/components/habits/create-habit-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Plus, GripVertical, X, Check, Info } from "lucide-react";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { RoutineTemplateSelector } from "@/components/routines/routine-template-selector";
import { useAppData } from "@/contexts/app-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export default function HabitsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isRoutineDialogOpen, setIsRoutineDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { habits, updateHabit } = useAppData();
  const { toast } = useToast();
  const habitListRef = useRef<HabitListRef>(null);
  const routineTriggerRef = useRef<HTMLButtonElement>(null);

  const handleSaveOrder = async () => {
    if (habitListRef.current) {
      await habitListRef.current.saveOrder();
      setIsReordering(false);
    }
  };

  const handleCancelOrder = () => {
    if (habitListRef.current) {
      habitListRef.current.cancelOrder();
      setIsReordering(false);
    }
  };

  const { addRoutine, updateRoutine } = useAppData();

  // Effect para hacer click automático en el trigger cuando se abre el diálogo
  useEffect(() => {
    if (isRoutineDialogOpen && routineTriggerRef.current) {
      console.log('Routine dialog opened, clicking trigger');
      setTimeout(() => {
        routineTriggerRef.current?.click();
      }, 50);
    }
  }, [isRoutineDialogOpen]);

  const handleSaveRoutine = async (newRoutine: any) => {
    try {
      if (newRoutine.id) {
        // Update existing routine
        await updateRoutine(newRoutine.id, newRoutine);
        console.log('Routine updated successfully');
      } else {
        // Create new routine
        const { id, ...routineDataWithoutId } = newRoutine;
        await addRoutine(routineDataWithoutId);
        console.log('Routine created successfully');
      }
      setIsRoutineDialogOpen(false);
    } catch (error) {
      console.error('Error saving routine:', error);
    }
  };



  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Hábitos</h1>
            <TooltipProvider>
              <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-60 hover:opacity-100"
                    onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold">Colores del grid de completado:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        <span>Completado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                        <span>Se perdió la racha</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                        <span>No completado</span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-muted-foreground">
            {isReordering ? "Arrastra y ordena tus hábitos como prefieras" : "Tu constancia está construyendo la mejor versión de ti."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isReordering ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleSaveOrder}
                title="Guardar orden"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleCancelOrder}
                title="Cancelar reordenamiento"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-60 hover:opacity-100"
                onClick={() => setIsReordering(true)}
                title="Reordenar hábitos"
              >
                <GripVertical className="h-4 w-4" />
              </Button>
              {!isMobile && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Hábito
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <HabitList 
        ref={habitListRef}
        isReordering={isReordering} 
        onReorderComplete={() => setIsReordering(false)}
      />
      {isMobile && !isReordering && (
        <FloatingActionButton
          onCreateHabit={() => setIsDialogOpen(true)}
          onCreateRoutine={() => setIsRoutineDialogOpen(true)}
        />
      )}
      <CreateHabitDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      
      {isRoutineDialogOpen && (
        <RoutineTemplateSelector onSave={handleSaveRoutine}>
          <Button ref={routineTriggerRef} className="hidden" style={{ display: 'none' }}>
            Crear Rutina
          </Button>
        </RoutineTemplateSelector>
      )}
    </div>
  );
}
