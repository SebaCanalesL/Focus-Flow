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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Routine } from "@/lib/types";

// Moved routineSteps to be exportable, so other components can use it.
export const routineSteps = [
  {
    id: "step1",
    title: "☀️ Exposición a la luz natural (5–10 min)",
    description:
      "Deja que la luz del sol despierte tu reloj interno. Te ayudará a sentirte más despierto, con mejor humor y mayor energía durante el día.",
  },
  {
    id: "step2",
    title: "💧 Hidratación inmediata",
    description:
      "Un simple vaso de agua al despertar reactiva tu cuerpo después de horas de descanso y mejora tu concentración desde temprano.",
  },
  {
    id: "step3",
    title: "🤸 Movimiento ligero o estiramientos (5–15 min)",
    description:
      "Activa tu circulación, libera tensión y dale a tu cuerpo una dosis de vitalidad. Aunque sean pocos minutos, tu energía se multiplicará.",
  },
  {
    id: "step4",
    title: "🧘 Respiración consciente o mindfulness (5 min)",
    description:
      "Dedica un momento a ti. Reducirás el estrés, aclararás tu mente y empezarás el día con calma y enfoque.",
  },
  {
    id: "step5",
    title: "🥑 Desayuno balanceado",
    description:
      "Dale combustible de calidad a tu cuerpo: proteína, fibra y grasas saludables que te mantendrán saciado y enfocado hasta la próxima comida.",
  },
  {
    id: "step6",
    title: "📝 Revisión breve de objetivos (2–3 min)",
    description:
      "Visualiza tu día. Tener claras 1–3 prioridades no solo evita la procrastinación, también te da una sensación de control y logro desde el inicio.",
  },
];

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function CreateRoutineDialog({
  children,
  onSave,
  routineToEdit,
}: {
  children: React.ReactNode;
  onSave: (newRoutine: Partial<Routine>) => void;
  routineToEdit?: Routine; // Optional: The routine to edit
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSteps, setSelectedSteps] = useState<Set<string>>(new Set());
  const [frequency, setFrequency] = useState<"once" | "recurring">("recurring");
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());

  const isEditMode = routineToEdit != null;

  // Effect to initialize state when the dialog opens
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // If editing, load the data from the routine
        setSelectedSteps(new Set(routineToEdit.stepIds || []));
        setFrequency(routineToEdit.frequency || "recurring");
        setSelectedDays(new Set(routineToEdit.days || []));
      } else {
        // If creating, reset to default (all steps selected)
        setSelectedSteps(new Set(routineSteps.map((step) => step.id)));
        setFrequency("recurring");
        setSelectedDays(new Set());
      }
    } 
  }, [isOpen, isEditMode, routineToEdit]);

  const toggleStep = (stepId: string) => {
    const newSelectedSteps = new Set(selectedSteps);
    if (newSelectedSteps.has(stepId)) {
      newSelectedSteps.delete(stepId);
    } else {
      newSelectedSteps.add(stepId);
    }
    setSelectedSteps(newSelectedSteps);
  };

  const toggleDay = (day: string) => {
    const newSelectedDays = new Set(selectedDays);
    if (newSelectedDays.has(day)) {
      newSelectedDays.delete(day);
    } else {
      newSelectedDays.add(day);
    }
    setSelectedDays(newSelectedDays);
  };

  const handleSelectAll = () => {
    if (selectedSteps.size === routineSteps.length) {
      setSelectedSteps(new Set());
    } else {
      setSelectedSteps(new Set(routineSteps.map((step) => step.id)));
    }
  };

  const handleSaveClick = () => {
    const routineData: Partial<Routine> = {
      id: isEditMode ? routineToEdit.id : undefined,
      title: isEditMode
        ? routineToEdit.title
        : "Mañana Energizada Personalizada",
      category: "Partir el día",
      imageUrl: "/routines/routine-morning-energized.png",
      stepIds: Array.from(selectedSteps), // Save step IDs instead of a description
      frequency,
      days: Array.from(selectedDays),
    };
    onSave(routineData);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild onClick={() => setIsOpen(true)}>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-full md:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{isEditMode ? "Editar Rutina" : "Mañana Energizada"}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Ajusta los detalles de tu rutina como necesites."
              : "Selecciona los pasos que quieres incluir. Personalízala a tu gusto."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto px-6 space-y-4">
          <div className="flex justify-end">
            <Button variant="link" onClick={handleSelectAll} className="p-0">
              {selectedSteps.size === routineSteps.length
                ? "Deseleccionar todo"
                : "Seleccionar todo"}
            </Button>
          </div>

          {routineSteps.map((step) => {
            const isSelected = selectedSteps.has(step.id);
            const titleParts = step.title.split(/\s*\(/);
            const mainTitle = titleParts[0];
            const duration = titleParts[1] ? titleParts[1].replace(")", "") : "";

            return (
              <Card
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={cn(
                  "cursor-pointer transition-colors",
                  isSelected && "border-primary bg-muted/50"
                )}
              >
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex items-start gap-4">
                    <div className="grid gap-1.5">
                      <p className="font-semibold">{mainTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pl-4">
                    {duration && (
                      <p className="text-sm text-muted-foreground whitespace-nowrap">
                        {duration}
                      </p>
                    )}
                    <Checkbox checked={isSelected} />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="space-y-4 pt-4">
            <Label>¿Cuándo quieres realizar esta rutina?</Label>
            <RadioGroup
              value={frequency}
              onValueChange={(value) =>
                setFrequency(value as "once" | "recurring")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="once" id="once" />
                <Label htmlFor="once">Una vez</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recurring" id="recurring" />
                <Label htmlFor="recurring">Recurrente</Label>
              </div>
            </RadioGroup>

            {frequency === "recurring" && (
              <div className="flex justify-around items-center p-2 rounded-lg bg-muted">
                {weekDays.map((day) => (
                  <Button
                    key={day}
                    variant={selectedDays.has(day) ? "default" : "ghost"}
                    size="icon"
                    onClick={() => toggleDay(day)}
                    className="rounded-full"
                  >
                    {day}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="p-6 mt-auto bg-background border-t">
          <Button className="w-full" onClick={handleSaveClick}>
            {isEditMode ? "Guardar Cambios" : "Guardar en mis rutinas"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}