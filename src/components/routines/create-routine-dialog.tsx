'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Routine, CustomStep, Reminder } from "@/lib/types";
import { CustomStepDialog } from "./custom-step-dialog";
import { RemindersSection } from "./reminders-section";

// Pasos predefinidos - IDs fijos que nunca cambian
export const predefinedSteps = [
  {
    id: "step1",
    title: "☀️ Exposición a la luz natural",
    description: "Deja que la luz del sol despierte tu reloj interno. Te ayudará a sentirte más despierto, con mejor humor y mayor energía durante el día.",
    duration: "5–10 min",
  },
  {
    id: "step2", 
    title: "💧 Hidratación inmediata",
    description: "Un simple vaso de agua al despertar reactiva tu cuerpo después de horas de descanso y mejora tu concentración desde temprano.",
  },
  {
    id: "step3",
    title: "🤸 Movimiento ligero o estiramientos",
    description: "Activa tu circulación, libera tensión y dale a tu cuerpo una dosis de vitalidad. Aunque sean pocos minutos, tu energía se multiplicará.",
    duration: "5–15 min",
  },
  {
    id: "step4",
    title: "🧘 Respiración consciente o mindfulness",
    description: "Toma 5 minutos para conectar contigo mismo. La respiración consciente reduce el estrés y mejora tu enfoque para el día.",
    duration: "5 min",
  },
  {
    id: "step5",
    title: "🥑 Desayuno balanceado",
    description: "Dale combustible de calidad a tu cuerpo: proteína, fibra y grasas saludables que te mantendrán saciado y enfocado hasta la próxima comida.",
  },
  {
    id: "step6",
    title: "📝 Revisión breve de objetivos",
    description: "Visualiza tu día. Tener claras 1-3 prioridades no solo evita la procrastinación, también te da una sensación de control y logro desde el inicio.",
    duration: "2-3 min",
  },
];

// Función para generar IDs únicos para pasos personalizados
function generateCustomStepId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Componente para mostrar un paso predefinido
function PredefinedStepCard({
  step,
  isSelected,
  onToggle,
  onEdit,
}: {
  step: typeof predefinedSteps[0];
  isSelected: boolean;
  onToggle: (stepId: string) => void;
  onEdit: (step: CustomStep) => void;
}) {
  return (
    <Card
      className={cn(
        "transition-colors cursor-pointer",
        isSelected && "border-primary bg-muted/50"
      )}
      onClick={() => onToggle(step.id)}
    >
      <CardContent className="flex items-start justify-between p-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="grid gap-1.5">
            <p className="font-semibold">{step.title}</p>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 pl-4">
          {step.duration && (
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              {step.duration}
            </p>
          )}
          <div className="flex items-center gap-2">
            <CustomStepDialog
              stepToEdit={{
                id: step.id,
                title: step.title,
                description: step.description,
                duration: step.duration,
                isCustom: true,
              }}
              onSave={onEdit}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CustomStepDialog>
            <Checkbox 
              checked={isSelected}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para mostrar un paso personalizado
function CustomStepCard({
  step,
  isSelected,
  onToggle,
  onEdit,
}: {
  step: CustomStep;
  isSelected: boolean;
  onToggle: (stepId: string) => void;
  onEdit: (step: CustomStep) => void;
}) {
  return (
    <Card
      className={cn(
        "transition-colors cursor-pointer",
        isSelected && "border-primary bg-muted/50"
      )}
      onClick={() => onToggle(step.id)}
    >
      <CardContent className="flex items-start justify-between p-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="grid gap-1.5">
            <p className="font-semibold">{step.title}</p>
            {step.description && (
              <p className="text-sm text-muted-foreground">{step.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 pl-4">
          {step.duration && (
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              {step.duration}
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
            <Checkbox 
              checked={isSelected}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateRoutineDialog({
  children,
  onSave,
  onDelete,
  routineToEdit,
}: {
  children: React.ReactNode;
  onSave: (newRoutine: Partial<Routine>) => void;
  onDelete?: (routineId: string) => void;
  routineToEdit?: Routine;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedStepIds, setSelectedStepIds] = useState<Set<string>>(new Set());
  const [stepOrder, setStepOrder] = useState<string[]>([]);
  const [customSteps, setCustomSteps] = useState<CustomStep[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const isEditMode = !!routineToEdit;

  // Inicializar datos cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && routineToEdit) {
        console.log('🔍 DEBUG - Cargando rutina para editar:', routineToEdit);
        console.log('🔍 DEBUG - Custom steps en la rutina:', routineToEdit.customSteps);
        console.log('🔍 DEBUG - Step IDs en la rutina:', routineToEdit.stepIds);
        console.log('🔍 DEBUG - Step Order en la rutina:', routineToEdit.stepOrder);
        
        // Modo edición: cargar datos de la rutina
        setRoutineName(routineToEdit.title || "");
        setSelectedStepIds(new Set(routineToEdit.stepIds || []));
        setCustomSteps(routineToEdit.customSteps || []);
        setReminders(routineToEdit.reminders || []);
        
        // ✅ FIX: Usar stepOrder si está disponible, sino crear uno que incluya todos los pasos
        if (routineToEdit.stepOrder && routineToEdit.stepOrder.length > 0) {
          console.log('🔍 DEBUG - Usando stepOrder existente:', routineToEdit.stepOrder);
          setStepOrder(routineToEdit.stepOrder);
        } else {
          // Fallback: crear stepOrder que incluya todos los pasos disponibles
          const allStepIds = [
            ...predefinedSteps.map(step => step.id),
            ...(routineToEdit.customSteps || []).map(step => step.id)
          ];
          console.log('🔍 DEBUG - Creando stepOrder desde fallback:', allStepIds);
          setStepOrder(allStepIds);
        }
      } else {
        // Modo creación: valores por defecto
        console.log('🔍 DEBUG - Creando nueva rutina');
        setRoutineName("Mi Rutina Matutina");
        setSelectedStepIds(new Set(predefinedSteps.map(step => step.id))); // Todos seleccionados por defecto
        setCustomSteps([]);
        setReminders([]);
        setStepOrder(predefinedSteps.map(step => step.id));
      }
    }
  }, [isOpen, isEditMode, routineToEdit]);

  // Asegurar que stepOrder siempre incluya todos los pasos disponibles
  useEffect(() => {
    const allAvailableStepIds = [
      ...predefinedSteps.map(step => step.id),
      ...customSteps.map(step => step.id)
    ];
    
    // Actualizar stepOrder para incluir cualquier paso nuevo
    setStepOrder(prev => {
      const newOrder = [...prev];
      
      // Agregar pasos que no estén en el orden actual
      allAvailableStepIds.forEach(stepId => {
        if (!newOrder.includes(stepId)) {
          newOrder.push(stepId);
        }
      });
      
      // Remover pasos que ya no existen
      return newOrder.filter(stepId => allAvailableStepIds.includes(stepId));
    });
  }, [customSteps]);

  // Toggle de selección de pasos
  const toggleStep = (stepId: string) => {
    setSelectedStepIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        // Deseleccionar: solo remover de selectedStepIds
        newSet.delete(stepId);
      } else {
        // Seleccionar: solo agregar a selectedStepIds
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  // Seleccionar/deseleccionar todos
  const toggleSelectAll = () => {
    const allStepIds = [
      ...predefinedSteps.map(step => step.id),
      ...customSteps.map(step => step.id)
    ];
    
    if (selectedStepIds.size === allStepIds.length) {
      // Deseleccionar todos: solo limpiar selectedStepIds
      setSelectedStepIds(new Set());
    } else {
      // Seleccionar todos: solo actualizar selectedStepIds
      setSelectedStepIds(new Set(allStepIds));
    }
  };

  // Agregar paso personalizado
  const handleAddCustomStep = (newStep: CustomStep) => {
    const stepWithId = {
      ...newStep,
      id: newStep.id || generateCustomStepId(),
    };
    
    setCustomSteps(prev => [...prev, stepWithId]);
    // Automáticamente seleccionar el nuevo paso
    setSelectedStepIds(prev => new Set([...prev, stepWithId.id]));
    // Agregar al stepOrder al final si no existe
    setStepOrder(prev => {
      if (!prev.includes(stepWithId.id)) {
        return [...prev, stepWithId.id];
      }
      return prev;
    });
  };

  // Editar paso personalizado
  const handleEditCustomStep = (updatedStep: CustomStep) => {
    setCustomSteps(prev => 
      prev.map(step => step.id === updatedStep.id ? updatedStep : step)
    );
  };

  // Convertir paso predefinido a personalizado cuando se edita
  const handleEditPredefinedStep = (customStep: CustomStep) => {
    console.log('🔍 DEBUG - Editando paso predefinido:', customStep);
    
    // Remover el paso predefinido de la selección
    setSelectedStepIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(customStep.id); // El ID original del paso predefinido
      console.log('🔍 DEBUG - Removido paso predefinido de selección:', customStep.id);
      return newSet;
    });
    
    // Generar nuevo ID para el paso personalizado
    const newCustomStep: CustomStep = {
      ...customStep,
      id: generateCustomStepId(),
    };
    
    console.log('🔍 DEBUG - Nuevo paso personalizado creado:', newCustomStep);
    
    // Agregar como paso personalizado y seleccionar
    setCustomSteps(prev => {
      const updated = [...prev, newCustomStep];
      console.log('🔍 DEBUG - Custom steps actualizados:', updated);
      return updated;
    });
    
    setSelectedStepIds(prev => {
      const updated = new Set([...prev, newCustomStep.id]);
      console.log('🔍 DEBUG - Selected step IDs actualizados:', Array.from(updated));
      return updated;
    });
    
    // ✅ FIX: Actualizar stepOrder para incluir el nuevo paso personalizado
    setStepOrder(prev => {
      const updated = [...prev, newCustomStep.id];
      console.log('🔍 DEBUG - Step order actualizado:', updated);
      return updated;
    });
  };

  // Guardar rutina
  const handleSave = () => {
    if (!routineName.trim()) return;

    console.log('🔍 DEBUG - Guardando rutina:');
    console.log('- selectedStepIds:', Array.from(selectedStepIds));
    console.log('- stepOrder:', stepOrder);
    console.log('- customSteps:', customSteps);

    // ✅ FIX: Ensure stepOrder only includes selected steps and maintains correct order
    const selectedStepOrder = stepOrder.filter(stepId => selectedStepIds.has(stepId));
    
    const routineData: Partial<Routine> = {
      title: routineName.trim(),
      category: "Partir el día",
      imageUrl: "/routines/routine-morning-energized.png",
      description: "Rutina personalizada creada por el usuario",
      stepIds: Array.from(selectedStepIds),
      stepOrder: selectedStepOrder.length > 0 ? selectedStepOrder : Array.from(selectedStepIds), // ✅ Ensure stepOrder matches selectedStepIds
      customSteps: customSteps.length > 0 ? customSteps : undefined,
      reminders: reminders.length > 0 ? reminders : undefined,
    };

    console.log('🔍 DEBUG - Datos a guardar:', routineData);
    console.log('🔍 DEBUG - Selected step order:', selectedStepOrder);

    if (isEditMode && routineToEdit?.id) {
      routineData.id = routineToEdit.id;
    }

    onSave(routineData);
    setIsOpen(false);
  };

  // Eliminar rutina
  const handleDelete = () => {
    if (isEditMode && routineToEdit?.id && onDelete) {
      onDelete(routineToEdit.id);
      setIsOpen(false);
    }
  };

  // Obtener todos los pasos disponibles
  const allAvailableSteps = [
    ...predefinedSteps.map(step => step.id),
    ...customSteps.map(step => step.id)
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-full md:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{isEditMode ? "Editar Rutina" : "Crear Rutina"}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Ajusta los detalles de tu rutina como necesites."
              : "Selecciona los pasos que quieres incluir. Personalízala a tu gusto."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto px-6 space-y-4">
          {/* Nombre de la rutina */}
          <div className="space-y-2">
            <Label htmlFor="routine-name">Nombre de la rutina</Label>
            <Input
              id="routine-name"
              placeholder="Ej: Mi Rutina Matutina"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
            />
          </div>

          {/* Botón seleccionar todo */}
          <div className="flex justify-end">
            <Button variant="link" onClick={toggleSelectAll} className="p-0">
              {selectedStepIds.size === allAvailableSteps.length
                ? "Deseleccionar todo"
                : "Seleccionar todo"}
            </Button>
          </div>

          {/* Todos los pasos en el orden correcto */}
          <div className="space-y-3">
            {stepOrder.map((stepId) => {
              // Buscar si es un paso predefinido
              const predefinedStep = predefinedSteps.find(step => step.id === stepId);
              if (predefinedStep) {
                return (
                  <PredefinedStepCard
                    key={stepId}
                    step={predefinedStep}
                    isSelected={selectedStepIds.has(stepId)}
                    onToggle={toggleStep}
                    onEdit={handleEditPredefinedStep}
                  />
                );
              }
              
              // Buscar si es un paso personalizado
              const customStep = customSteps.find(step => step.id === stepId);
              if (customStep) {
                return (
                  <CustomStepCard
                    key={stepId}
                    step={customStep}
                    isSelected={selectedStepIds.has(stepId)}
                    onToggle={toggleStep}
                    onEdit={handleEditCustomStep}
                  />
                );
              }
              
              return null;
            })}
          </div>

          {/* Botón agregar paso personalizado */}
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

          {/* Recordatorios */}
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
              <Button variant="destructive" onClick={handleDelete}>
                Eliminar
              </Button>
            )}
            <Button 
              className="flex-1" 
              onClick={handleSave}
              disabled={!routineName.trim()}
            >
              {isEditMode ? "Guardar Cambios" : "Crear Rutina"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Export both the function and with alias for compatibility
export { CreateRoutineDialog, CreateRoutineDialog as CreateRoutineDialogNew };
export { predefinedSteps };
