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
import { Pencil, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Routine, CustomStep, Reminder, RoutineSchedule } from "@/lib/types";
import { CustomStepDialog } from "./custom-step-dialog";

import { FrequencySelector } from "./frequency-selector";
import { routineTemplates } from "./routine-template-selector";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Función para obtener todos los pasos únicos de todas las plantillas
const getAllTemplateSteps = () => {
  const allSteps = new Map();
  
  routineTemplates.forEach(template => {
    template.steps.forEach(step => {
      // Usar una clave única basada en título y descripción para evitar duplicados
      const key = `${step.title}-${step.description}`;
      if (!allSteps.has(key)) {
        allSteps.set(key, step);
      }
    });
  });
  
  return Array.from(allSteps.values());
};

// Pasos predefinidos - IDs fijos que nunca cambian (mantenidos para compatibilidad)
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PredefinedStepCard({
  step,
  isSelected,
  onToggle,
  onEditStep,
}: {
  step: typeof predefinedSteps[0];
  isSelected: boolean;
  onToggle: (stepId: string) => void;
  onEditStep: (step: CustomStep) => void;
}) {
  return (
    <Card
      className={cn(
        "transition-colors cursor-pointer",
        isSelected && "border-primary bg-muted/50"
      )}
      onClick={() => onToggle(step.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base">{step.title}</p>
            {step.duration && (
              <p className="text-xs text-muted-foreground mt-1">{step.duration}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEditStep({
                  id: step.id,
                  title: step.title,
                  description: step.description,
                  duration: step.duration,
                  isCustom: true,
                });
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
        <div className="w-full">
          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para mostrar un paso personalizado
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CustomStepCard({
  step,
  isSelected,
  onToggle,
  onEditStep,
}: {
  step: CustomStep;
  isSelected: boolean;
  onToggle: (stepId: string) => void;
  onEditStep: (step: CustomStep) => void;
}) {
  return (
    <Card
      className={cn(
        "transition-colors cursor-pointer",
        isSelected && "border-primary bg-muted/50"
      )}
      onClick={() => onToggle(step.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base">{step.title}</p>
            {step.duration && (
              <p className="text-xs text-muted-foreground mt-1">{step.duration}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(step);
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
        {step.description && (
          <div className="w-full">
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para mostrar un paso personalizado ordenable (drag and drop)
function SortableStepCard({
  step,
  isSelected,
  onToggle,
  onEditStep,
}: {
  step: CustomStep;
  isSelected: boolean;
  onToggle: (stepId: string) => void;
  onEditStep: (step: CustomStep) => void;
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          "transition-colors cursor-pointer",
          isSelected && "border-primary bg-muted/50",
          isDragging && "shadow-lg"
        )}
        onClick={() => onToggle(step.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label="Reordenar paso"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-base">{step.title}</p>
                {step.duration && (
                  <p className="text-xs text-muted-foreground mt-1">{step.duration}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditStep(step);
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
          {step.description && (
            <div className="w-full">
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateRoutineDialog({
  children,
  onSave,
  onDelete,
  routineToEdit,
  templateId,
  forceOpen,
}: {
  children: React.ReactNode;
  onSave: (newRoutine: Partial<Routine>) => void;
  onDelete?: (routineId: string) => void;
  routineToEdit?: Routine;
  templateId?: string;
  forceOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedStepIds, setSelectedStepIds] = useState<Set<string>>(new Set());
  const [stepOrder, setStepOrder] = useState<string[]>([]);
  const [customSteps, setCustomSteps] = useState<CustomStep[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [schedules, setSchedules] = useState<RoutineSchedule[]>([]);
  const [editingStep, setEditingStep] = useState<CustomStep | null>(null);

  const isEditMode = !!routineToEdit;

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requiere 8px de movimiento antes de activar el drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Manejar el final del arrastre
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

  // Handle forceOpen prop
  const isDialogOpen = forceOpen !== undefined ? forceOpen : isOpen;
  const handleOpenChange = (open: boolean) => {
    if (forceOpen !== undefined) {
      // If forceOpen is provided, let the parent handle the state
      if (!open) {
        onSave({}); // Call onSave with empty object to trigger close
      }
    } else {
      setIsOpen(open);
    }
  };

  // Inicializar datos cuando se abre el diálogo
  useEffect(() => {
    if (isDialogOpen) {
      if (isEditMode && routineToEdit) {
        console.log('🔍 DEBUG - Cargando rutina para editar:', routineToEdit);
        console.log('🔍 DEBUG - Custom steps en la rutina:', routineToEdit.customSteps);
        console.log('🔍 DEBUG - Step IDs en la rutina:', routineToEdit.stepIds);
        console.log('🔍 DEBUG - Step Order en la rutina:', routineToEdit.stepOrder);
        
        // Modo edición: cargar datos de la rutina
        setRoutineName(routineToEdit.title || "");
        
        // Convertir todos los pasos a personalizados con IDs únicos para evitar duplicación
        const existingCustomSteps = routineToEdit.customSteps || [];
        const existingStepIds = routineToEdit.stepIds || [];
        
        // Crear pasos personalizados para todos los pasos, incluyendo los que tienen IDs predefinidos
        const allCustomSteps: CustomStep[] = [];
        const newSelectedIds: string[] = [];
        
        existingStepIds.forEach(stepId => {
          // Buscar si ya es un paso personalizado
          const existingCustomStep = existingCustomSteps.find(step => step.id === stepId);
          
          if (existingCustomStep) {
            // Ya es un paso personalizado, mantenerlo
            allCustomSteps.push(existingCustomStep);
            newSelectedIds.push(existingCustomStep.id);
          } else {
            // Es un paso predefinido, convertir a personalizado
            const predefinedStep = predefinedSteps.find(step => step.id === stepId);
            if (predefinedStep) {
              const newCustomStep: CustomStep = {
                id: generateCustomStepId(),
                title: predefinedStep.title,
                description: predefinedStep.description,
                duration: predefinedStep.duration,
                isCustom: true,
              };
              allCustomSteps.push(newCustomStep);
              newSelectedIds.push(newCustomStep.id);
            }
          }
        });
        
        setCustomSteps(allCustomSteps);
        setSelectedStepIds(new Set(newSelectedIds));
        setReminders(routineToEdit.reminders || []);
        setSchedules(routineToEdit.schedules || []);
        
        // ✅ FIX: Usar los nuevos IDs únicos para el stepOrder
        const newStepOrder = allCustomSteps.map(step => step.id);
        console.log('🔍 DEBUG - Nuevo stepOrder con IDs únicos:', newStepOrder);
        setStepOrder(newStepOrder);
      } else if (templateId) {
        // Modo creación desde plantilla
        console.log('🔍 DEBUG - Creando rutina desde plantilla:', templateId);
        const template = routineTemplates.find(t => t.id === templateId);
        if (template) {
          setRoutineName(template.title);
          
          // Para todas las plantillas, convertir a pasos personalizados para evitar duplicación
          // Esto evita conflictos entre predefinedSteps y routineTemplates
          const templateCustomSteps: CustomStep[] = template.steps.map(step => ({
            id: generateCustomStepId(), // Generar nuevo ID único para evitar duplicación
            title: step.title,
            description: step.description,
            duration: step.duration,
            isCustom: true,
          }));
          setCustomSteps(templateCustomSteps);
          setSelectedStepIds(new Set(templateCustomSteps.map(step => step.id)));
          setStepOrder(templateCustomSteps.map(step => step.id));
          setReminders([]);
          setSchedules([]);
        }
      } else {
        // Modo creación: rutina personalizada vacía
        console.log('🔍 DEBUG - Creando nueva rutina personalizada');
        setRoutineName("Mi Rutina Matutina");
        setCustomSteps([]); // Empezar sin pasos
        setSelectedStepIds(new Set()); // Sin pasos seleccionados
        setStepOrder([]); // Sin orden de pasos
        setReminders([]);
        setSchedules([]);
      }
      
      // ✅ FIX: Desenfocar cualquier input que pueda estar enfocado automáticamente
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
          activeElement.blur();
        }
      }, 100);
    }
  }, [isDialogOpen, isEditMode, routineToEdit, templateId]);

  // Asegurar que stepOrder solo incluya pasos personalizados que existen
  useEffect(() => {
    setStepOrder(prev => {
      const customStepIds = customSteps.map(step => step.id);
      
      // Solo mantener pasos personalizados que existen
      return prev.filter(stepId => customStepIds.includes(stepId));
    });
  }, [customSteps]);

  // Toggle de selección de pasos
  const toggleStep = (stepId: string) => {
    setSelectedStepIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        // Deseleccionar: solo remover de selectedStepIds, mantener en stepOrder
        newSet.delete(stepId);
        // NO remover del stepOrder para que aparezca en "Pasos deseleccionados"
      } else {
        // Seleccionar: agregar a selectedStepIds y al stepOrder si no está presente
        newSet.add(stepId);
        setStepOrder(currentOrder => {
          if (!currentOrder.includes(stepId)) {
            return [...currentOrder, stepId];
          }
          return currentOrder;
        });
      }
      return newSet;
    });
  };

  // Seleccionar/deseleccionar todos
  const toggleSelectAll = () => {
    const allStepIds = customSteps.map(step => step.id);
    
    if (selectedStepIds.size === allStepIds.length && allStepIds.length > 0) {
      // Deseleccionar todos: limpiar selectedStepIds
      setSelectedStepIds(new Set());
    } else {
      // Seleccionar todos: actualizar selectedStepIds
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

  // Eliminar paso personalizado
  const handleDeleteCustomStep = (stepId: string) => {
    setCustomSteps(prev => prev.filter(step => step.id !== stepId));
    setSelectedStepIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
    setStepOrder(prev => prev.filter(id => id !== stepId));
  };



  // Manejar edición de pasos
  const handleEditStep = (step: CustomStep) => {
    setEditingStep(step);
  };

  // Manejar guardado de edición
  const handleSaveEdit = (updatedStep: CustomStep) => {
    // Todos los pasos son personalizados, solo actualizar
    handleEditCustomStep(updatedStep);
    setEditingStep(null);
  };

  // Manejar cancelación de edición
  const handleCancelEdit = () => {
    setEditingStep(null);
  };


  // Guardar rutina
  const handleSave = () => {
    if (!routineName.trim()) return;

    console.log('🔍 DEBUG - Guardando rutina:');
    console.log('- selectedStepIds:', Array.from(selectedStepIds));
    console.log('- stepOrder:', stepOrder);
    console.log('- customSteps:', customSteps);
    console.log('- schedules:', schedules);

    // ✅ FIX: Ensure stepOrder only includes selected steps and maintains correct order
    const selectedStepOrder = stepOrder.filter(stepId => selectedStepIds.has(stepId));
    
    const routineData: Partial<Routine> = {
      title: routineName.trim(),
      category: "Partir el día",
      imageUrl: "/routines/routine-morning-energized.png",
      stepIds: Array.from(selectedStepIds),
      stepOrder: selectedStepOrder.length > 0 ? selectedStepOrder : Array.from(selectedStepIds), // ✅ Ensure stepOrder matches selectedStepIds
      customSteps: customSteps.length > 0 ? customSteps : undefined,
      reminders: reminders.length > 0 ? reminders : undefined,
      schedules: schedules.length > 0 ? schedules : undefined, // Only include schedules if there are any
    };

    console.log('🔍 DEBUG - Datos a guardar:', routineData);
    console.log('🔍 DEBUG - Selected step order:', selectedStepOrder);

    if (isEditMode && routineToEdit?.id) {
      routineData.id = routineToEdit.id;
    }

    onSave(routineData);
    if (forceOpen === undefined) {
      setIsOpen(false);
    }
  };

  // Eliminar rutina
  const handleDelete = () => {
    if (isEditMode && routineToEdit?.id && onDelete) {
      onDelete(routineToEdit.id);
      if (forceOpen === undefined) {
        setIsOpen(false);
      }
    }
  };

  // Obtener todos los pasos disponibles (solo personalizados)
  const allAvailableSteps = customSteps.map(step => step.id);

  return (
    <Sheet open={isDialogOpen} onOpenChange={handleOpenChange}>
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
              autoFocus={false}
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

          {/* Pasos seleccionados */}
          {(() => {
            const selectedStepIdsArray = stepOrder.filter(stepId => selectedStepIds.has(stepId));
            
            if (selectedStepIdsArray.length === 0) {
              return null;
            }

            return (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedStepIdsArray}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {selectedStepIdsArray.map((stepId) => {
                      const customStep = customSteps.find(step => step.id === stepId);
                      if (customStep) {
                        return (
                          <SortableStepCard
                            key={stepId}
                            step={customStep}
                            isSelected={selectedStepIds.has(stepId)}
                            onToggle={toggleStep}
                            onEditStep={handleEditStep}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            );
          })()}

          {/* Pasos deseleccionados al final */}
          {(() => {
            // Solo mostrar pasos que están en stepOrder pero no seleccionados
            const deselectedSteps = stepOrder.filter(stepId => !selectedStepIds.has(stepId));
            if (deselectedSteps.length > 0) {
              return (
                <div className="space-y-3 pt-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Pasos deseleccionados:
                  </div>
                  {deselectedSteps.map((stepId) => {
                    const customStep = customSteps.find(step => step.id === stepId);
                    if (customStep) {
                      return (
                        <Card
                          key={stepId}
                          className="transition-colors cursor-pointer opacity-60 hover:opacity-80"
                          onClick={() => toggleStep(stepId)}
                        >
                          <CardContent className="flex items-start justify-between p-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="grid gap-1.5">
                                <p className="font-semibold">{customStep.title}</p>
                                {customStep.description && (
                                  <p className="text-sm text-muted-foreground">{customStep.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 pl-4">
                              {customStep.duration && (
                                <p className="text-sm text-muted-foreground whitespace-nowrap">
                                  {customStep.duration}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditStep(customStep);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Checkbox 
                                  checked={false}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            }
            return null;
          })()}

          {/* Pasos disponibles para agregar - Diseño de chips */}
          {(() => {
            // Solo mostrar pasos disponibles cuando se está creando una rutina personalizada nueva
            if (isEditMode || templateId) {
              return null;
            }
            
            // Obtener todos los pasos de todas las plantillas
            const allTemplateSteps = getAllTemplateSteps();
            
            // Filtrar pasos que no están ya seleccionados
            const availableSteps = allTemplateSteps.filter(step => {
              // Verificar si ya existe un paso personalizado con el mismo contenido Y está seleccionado
              const hasSelectedEquivalentCustomStep = customSteps.some(customStep => 
                customStep.title === step.title && 
                customStep.description === step.description && 
                customStep.duration === step.duration &&
                selectedStepIds.has(customStep.id)
              );
              
              return !hasSelectedEquivalentCustomStep;
            });
            
            if (availableSteps.length > 0) {
              return (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Pasos disponibles para agregar:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSteps.map((step) => (
                      <div
                        key={`available-${step.id}`}
                        className="group inline-flex flex-col items-start gap-1 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/60 border border-muted-foreground/20 hover:border-muted-foreground/40 transition-all duration-200 cursor-pointer text-sm hover:shadow-sm"
                        onClick={() => {
                          // Verificar si ya existe un paso con el mismo contenido
                          const existingStep = customSteps.find(customStep => 
                            customStep.title === step.title && 
                            customStep.description === step.description && 
                            customStep.duration === step.duration
                          );
                          
                          if (existingStep) {
                            // Si ya existe, solo seleccionarlo si no está ya seleccionado
                            if (!selectedStepIds.has(existingStep.id)) {
                              setSelectedStepIds(prev => new Set([...prev, existingStep.id]));
                              setStepOrder(prev => {
                                if (!prev.includes(existingStep.id)) {
                                  return [...prev, existingStep.id];
                                }
                                return prev;
                              });
                            }
                          } else {
                            // Si no existe, crear uno nuevo
                            const newCustomStep: CustomStep = {
                              id: generateCustomStepId(),
                              title: step.title,
                              description: step.description,
                              duration: step.duration,
                              isCustom: true,
                            };
                            
                            // Agregar como paso personalizado
                            setCustomSteps(prev => [...prev, newCustomStep]);
                            // Agregar al stepOrder
                            setStepOrder(prev => [...prev, newCustomStep.id]);
                            // Seleccionarlo automáticamente
                            setSelectedStepIds(prev => new Set([...prev, newCustomStep.id]));
                          }
                        }}
                      >
                        <span className="font-medium text-foreground group-hover:text-foreground/90">
                          {step.title}
                        </span>
                        {step.duration && (
                          <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                            {step.duration}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

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

          {/* Selector de frecuencia y recordatorios */}
          <div className="pt-6">
            <FrequencySelector 
              schedules={schedules} 
              onSchedulesChange={setSchedules} 
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
      
      {/* Diálogo de edición de pasos */}
      <CustomStepDialog
        stepToEdit={editingStep || undefined}
        onSave={handleSaveEdit}
        onDelete={(stepId) => {
          handleDeleteCustomStep(stepId);
          setEditingStep(null);
        }}
        onCancel={handleCancelEdit}
        triggerText=""
      >
        <div style={{ display: 'none' }} />
      </CustomStepDialog>
    </Sheet>
  );
}

// Export both the function and with alias for compatibility
export { CreateRoutineDialog, CreateRoutineDialog as CreateRoutineDialogNew };
