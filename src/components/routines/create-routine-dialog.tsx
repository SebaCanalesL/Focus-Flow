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
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Routine } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, Pencil } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CustomStepDialog, CustomStep, EditCustomStepButton, EditStepButton, EditableStep } from "./custom-step-dialog";
import { RemindersSection } from "./reminders-section";
import { Reminder } from "@/lib/types";

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


// Sortable Step Component for predefined steps
function SortableStep({
  step,
  isSelected,
  onToggle,
  onEdit,
}: {
  step: typeof routineSteps[0];
  isSelected: boolean;
  onToggle: (stepId: string) => void;
  onEdit: (step: typeof routineSteps[0]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const titleParts = step.title.split(/\s*\(/);
  const mainTitle = titleParts[0];
  const duration = titleParts[1] ? titleParts[1].replace(")", "") : "";

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={() => onToggle(step.id)}
      className={cn(
        "cursor-pointer transition-colors",
        isSelected && "border-primary bg-muted/50",
        isDragging && "opacity-50"
      )}
    >
      <CardContent className="flex items-start justify-between p-4">
        <div className="flex items-start gap-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
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
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(step);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Checkbox checked={isSelected} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sortable Custom Step Component
function SortableCustomStep({
  step,
  isSelected,
  onToggle,
  onEdit,
}: {
  step: CustomStep;
  isSelected: boolean;
  onToggle: (stepId: string) => void;
  onEdit: (step: EditableStep) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={() => onToggle(step.id)}
      className={cn(
        "cursor-pointer transition-colors",
        isSelected && "border-primary bg-muted/50",
        isDragging && "opacity-50"
      )}
    >
      <CardContent className="flex items-start justify-between p-4">
        <div className="flex items-start gap-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid gap-1.5">
            <p className="font-semibold">{step.title}</p>
            <p className="text-sm text-muted-foreground">
              {step.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 pl-4">
          {step.duration && (
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              {step.duration}
            </p>
          )}
          <div className="flex items-center gap-2">
            <EditStepButton step={step} onSave={onEdit} />
            <Checkbox checked={isSelected} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CreateRoutineDialog({
  children,
  onSave,
  onDelete,
  routineToEdit,
}: {
  children: React.ReactNode;
  onSave: (newRoutine: Partial<Routine>) => void;
  onDelete?: (routineId: string) => void;
  routineToEdit?: Routine; // Optional: The routine to edit
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSteps, setSelectedSteps] = useState<Set<string>>(new Set());
  const [stepOrder, setStepOrder] = useState<string[]>([]);
  const [customSteps, setCustomSteps] = useState<CustomStep[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const isEditMode = routineToEdit != null;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Effect to initialize state when the dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log('Dialog opened, isEditMode:', isEditMode);
      console.log('routineToEdit:', routineToEdit);
      
      if (isEditMode) {
        // If editing, load the data from the routine
        const stepIds = routineToEdit.stepIds || [];
        const customStepsData = routineToEdit.customSteps || [];
        const remindersData = routineToEdit.reminders || [];
        
        console.log('Loading existing data:');
        console.log('- stepIds:', stepIds);
        console.log('- customSteps:', customStepsData);
        console.log('- reminders:', remindersData);
        
        setSelectedSteps(new Set(stepIds));
        setCustomSteps(customStepsData);
        setReminders(remindersData);
        setStepOrder(stepIds.length > 0 ? stepIds : routineSteps.map(step => step.id));
      } else {
        // If creating, reset to default (all steps selected)
        const allStepIds = routineSteps.map((step) => step.id);
        setSelectedSteps(new Set(allStepIds));
        setCustomSteps([]);
        setReminders([]);
        setStepOrder(allStepIds);
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


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStepOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedSteps.size === routineSteps.length) {
      setSelectedSteps(new Set());
    } else {
      setSelectedSteps(new Set(routineSteps.map((step) => step.id)));
    }
  };

  const handleAddCustomStep = (newStep: CustomStep) => {
    console.log('Adding custom step:', newStep);
    console.log('Current custom steps:', customSteps);
    setCustomSteps(prev => {
      const newSteps = [...prev, newStep];
      console.log('New custom steps:', newSteps);
      return newSteps;
    });
    setStepOrder(prev => [...prev, newStep.id]);
    // Make the new custom step selected by default
    setSelectedSteps(prev => new Set([...prev, newStep.id]));
  };

  const handleEditCustomStep = (updatedStep: CustomStep) => {
    setCustomSteps(prev => 
      prev.map(step => step.id === updatedStep.id ? updatedStep : step)
    );
  };

  const handleEditStep = (updatedStep: EditableStep) => {
    if (updatedStep.isCustom) {
      // It's a custom step
      handleEditCustomStep(updatedStep);
    } else {
      // It's a predefined step being edited - convert to custom step
      const customStep: CustomStep = {
        id: updatedStep.id,
        title: updatedStep.title,
        description: updatedStep.description,
        duration: undefined,
        isCustom: true,
      };
      
      // Remove from predefined steps and add as custom step
      setSelectedSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(updatedStep.id);
        return newSet;
      });
      
      setCustomSteps(prev => [...prev, customStep]);
      setStepOrder(prev => {
        const newOrder = prev.filter(id => id !== updatedStep.id);
        return [...newOrder, customStep.id];
      });
      
      // Make the converted step selected
      setSelectedSteps(prev => new Set([...prev, customStep.id]));
    }
  };

  const handleSaveClick = () => {
    // Get selected steps in the correct order
    const orderedStepIds = stepOrder.filter(stepId => selectedSteps.has(stepId));
    
    const routineData: Partial<Routine> = {
      id: isEditMode ? routineToEdit.id : undefined,
      title: isEditMode
        ? routineToEdit.title
        : "Mañana Energizada Personalizada",
      category: "Partir el día",
      imageUrl: "/routines/routine-morning-energized.png",
      stepIds: orderedStepIds, // Save step IDs in the correct order
      customSteps: customSteps, // Save custom steps
      reminders: reminders, // Save reminders
    };
    
    console.log('Saving routine data:', routineData);
    console.log('Selected steps:', orderedStepIds);
    console.log('Custom steps:', customSteps);
    console.log('Reminders:', reminders);
    
    onSave(routineData);
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    if (isEditMode && routineToEdit?.id && onDelete) {
      onDelete(routineToEdit.id);
      setIsOpen(false);
    }
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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={stepOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {stepOrder.map((stepId) => {
                  // Check if it's a predefined step
                  const predefinedStep = routineSteps.find(s => s.id === stepId);
                  if (predefinedStep) {
                    return (
                      <SortableStep
                        key={predefinedStep.id}
                        step={predefinedStep}
                        isSelected={selectedSteps.has(predefinedStep.id)}
                        onToggle={toggleStep}
                        onEdit={handleEditStep}
                      />
                    );
                  }
                  
                  // Check if it's a custom step
                  const customStep = customSteps.find(s => s.id === stepId);
                  if (customStep) {
                    return (
                      <SortableCustomStep
                        key={customStep.id}
                        step={customStep}
                        isSelected={selectedSteps.has(customStep.id)}
                        onToggle={toggleStep}
                        onEdit={handleEditStep}
                      />
                    );
                  }
                  
                  return null;
                })}
                
                {/* Add Custom Step Button - positioned after all steps */}
                <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                  <CardContent className="p-4">
                    <CustomStepDialog onSave={handleAddCustomStep}>
                      <div className="flex items-center justify-center gap-2 w-full py-2 cursor-pointer">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Agregar paso personalizado</span>
                      </div>
                    </CustomStepDialog>
                  </CardContent>
                </Card>
              </div>
            </SortableContext>
          </DndContext>

          {/* Reminders Section */}
          <div className="pt-6">
            <RemindersSection 
              reminders={reminders} 
              onRemindersChange={setReminders} 
            />
          </div>

        </div>

        <SheetFooter className="p-6 mt-auto bg-background border-t">
          <div className="flex gap-3 w-full">
            {isEditMode && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar rutina?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente la rutina "{routineToEdit?.title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteClick} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('=== DEBUG INFO ===');
                console.log('Current state:');
                console.log('- selectedSteps:', Array.from(selectedSteps));
                console.log('- customSteps:', customSteps);
                console.log('- reminders:', reminders);
                console.log('- stepOrder:', stepOrder);
                console.log('==================');
              }}
            >
              Debug
            </Button>
            <Button className="flex-1" onClick={handleSaveClick}>
              {isEditMode ? "Guardar Cambios" : "Guardar en mis rutinas"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}