'use client';

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import React, { useState, useMemo } from "react";
import { predefinedSteps as routineSteps } from "./create-routine-dialog";
import { Routine, CustomStep } from "@/lib/types";

export function PerformRoutineSheet({
  children,
  routine,
  onComplete,
}: {
  children: React.ReactNode;
  routine: Routine;
  onComplete?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const stepsInRoutine = useMemo(() => {
    const allSteps: Array<typeof routineSteps[0] | CustomStep> = [];
    
    // Usar stepOrder si está disponible, sino usar stepIds
    const stepOrder = routine.stepOrder || routine.stepIds || [];
    
    // ✅ CORRECCIÓN: Solo incluir pasos SELECCIONADOS
    const selectedSteps = stepOrder.filter(stepId => 
      routine.stepIds?.includes(stepId)
    );
    
    selectedSteps.forEach((stepId: string) => {
      const predefinedStep = routineSteps.find((s) => s.id === stepId);
      const customStep = routine.customSteps?.find((cs) => cs.id === stepId);
      
      const step = predefinedStep || customStep;
      if (step) {
        allSteps.push(step);
      }
    });
    
    return allSteps;
  }, [routine]);

  const totalSteps = stepsInRoutine.length;
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;
  const currentStep = stepsInRoutine[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Last step completed, mark as completed and close
      onComplete?.();
      setIsOpen(false);
    }
  };

  // Reset the step index when the sheet is opened or closed
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Siempre reiniciar desde el principio cuando se abre
      setCurrentStepIndex(0);
    }
    setIsOpen(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-full md:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{routine.title}</SheetTitle>
          <SheetDescription>Sigue los pasos para completar tu rutina.</SheetDescription>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto px-6 space-y-4">
          {totalSteps > 0 && currentStep ? (
            <>
              <div className="space-y-2 pt-4">
                <p className="text-sm text-muted-foreground">
                  Paso {currentStepIndex + 1} de {totalSteps}
                </p>
                <Progress value={progress} />
              </div>
              <div className="py-8 text-center space-y-2">
                <h3 className="text-xl font-bold">
                  {'isCustom' in currentStep 
                    ? currentStep.title 
                    : currentStep.title.split(' (')[0]
                  }
                </h3>
                <p className="text-muted-foreground">{currentStep.description}</p>
                {'duration' in currentStep && currentStep.duration && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Duración: {currentStep.duration}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Esta rutina no tiene pasos. Puedes editarla para agregarle algunos.
            </p>
          )}
        </div>

        <SheetFooter className="p-6 mt-auto bg-background border-t">
          {totalSteps > 0 && (
            <Button className="w-full" onClick={handleNext}>
              {currentStepIndex < totalSteps - 1
                ? "Siguiente Paso"
                : "Finalizar Rutina"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}