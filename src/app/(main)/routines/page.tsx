'use client';

import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreateHabitDialog } from '@/components/habits/create-habit-dialog';
import {
  CreateRoutineDialog,
  predefinedSteps as routineSteps,
} from '@/components/routines/create-routine-dialog';
import { RoutineTemplateSelector } from '@/components/routines/routine-template-selector';
import { PerformRoutineSheet } from '@/components/routines/perform-routine-sheet';
import { Routine } from '@/lib/types';
import { useAppData } from '@/contexts/app-provider';
import { groupSchedules } from '@/lib/schedule-utils';

const filters = ['Mis rutinas'];

function RoutineCard({
  routine,
  onSave,
  onDelete,
  isUserRoutine,
}: {
  routine: Routine;
  onSave: (newRoutine: Partial<Routine>) => void;
  onDelete?: (routineId: string) => void;
  isUserRoutine: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const renderDescription = () => {
    if (isUserRoutine) {
      const allSteps: Array<{ id: string; title: string }> = [];
      
      // Usar stepOrder si está disponible, sino usar stepIds
      const stepOrder = routine.stepOrder || routine.stepIds || [];
      
      // ✅ CORRECCIÓN: Solo mostrar pasos SELECCIONADOS en el orden correcto
      const selectedSteps = stepOrder.filter(stepId => 
        routine.stepIds?.includes(stepId)
      );
      
      selectedSteps.forEach((stepId: string) => {
        // Buscar paso (predefinido o personalizado)
        const predefinedStep = routineSteps.find((s) => s.id === stepId);
        const customStep = routine.customSteps?.find((cs) => cs.id === stepId);
        
        const step = predefinedStep || customStep;
        if (step) {
          allSteps.push({
            id: step.id,
            title: step.title.split(' (')[0] // Remover duración si existe
          });
        }
      });

      // Get active reminders and schedules
      const activeReminders = routine.reminders?.filter(r => r.enabled) || [];
      const activeSchedules = routine.schedules?.filter(s => s.executionEnabled) || [];
      const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
      const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

      if (allSteps.length === 0) {
        return <p>Esta rutina no tiene pasos. ¡Edítala para agregarle!</p>;
      }
      
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            {allSteps.map((step) => (
              <p key={step.id} className="text-sm">{step.title}</p>
            ))}
          </div>
          
          {(activeReminders.length > 0 || activeSchedules.length > 0) && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground">⏰ Horarios programados:</span>
              </div>
              <div className="space-y-1">
                {/* Show grouped schedules */}
                {(() => {
                  // Convertir reminders legacy a formato de schedules para agrupar
                  const allSchedules = [
                    ...activeSchedules,
                    ...activeReminders.map(reminder => ({
                      id: reminder.id,
                      day: reminder.day,
                      time: reminder.time,
                      notificationEnabled: true,
                      executionEnabled: true
                    }))
                  ];
                  
                  const groupedSchedules = groupSchedules(allSchedules);
                  
                  return groupedSchedules.map((group, index) => {
                    // Verificar si algún schedule del grupo tiene recordatorios activados
                    const hasActiveReminders = group.days.some(day => {
                      const schedule = allSchedules.find(s => s.day === day);
                      return schedule?.notificationEnabled;
                    });
                    
                    return (
                      <p key={index} className="text-xs text-muted-foreground">
                        {group.label} {hasActiveReminders ? '🔔' : '🔕'}
                      </p>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (routine.description || '').split('\n\n').map((paragraph: string, pIndex: number) => (
        <div key={pIndex} className="space-y-1">
          {paragraph.split('\n').map((line: string, lIndex: number) => {
            if (line.trim() === '') return null;
            if (line.trim().startsWith('* ')) {
              return (
                <div key={lIndex} className="flex items-start pl-4">
                  <span className="mr-2 mt-1">∙</span>
                  <span>{line.trim().substring(2)}</span>
                </div>
              );
            }
            const isKey = /^[☀️💧🤸🧘🥑📝]/.test(line);
            if (isKey && line.includes(':')) {
              const parts = line.split(':');
              const keyTitle = parts[0] + ':';
              const keyDescription = parts.slice(1).join(':').trim();
              return (
                <p key={lIndex}>
                  <span className="font-bold text-primary">{keyTitle}</span>
                  <span className="text-muted-foreground">{` ${keyDescription}`}</span>
                </p>
              );
            }
            const isMainTitle = /^[🌞🌱💡🔑✨🚀]/.test(line);
            if (isMainTitle) {
              return (
                <p key={lIndex} className="font-bold text-primary">
                  {line}
                </p>
              );
            }
            return <p key={lIndex}>{line}</p>;
          })}
        </div>
      ));
    }
  };

  return (
    <Card className="overflow-hidden rounded-lg border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        <CardContent className="p-6">
          {/* Header with title and expand icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">
                {routine.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {routine.stepIds?.length || 0} pasos • {
                  (routine.schedules?.filter(s => s.executionEnabled).length || 0) + 
                  (routine.reminders?.filter(r => r.enabled).length || 0)
                } horarios programados
              </p>
            </div>
            <div className="ml-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Quick preview when collapsed */}
          {!isOpen && (
            <div className="space-y-2">
              {routine.stepOrder?.slice(0, 3).map((stepId: string, index: number) => {
                const predefinedStep = routineSteps.find((s) => s.id === stepId);
                const customStep = routine.customSteps?.find((cs) => cs.id === stepId);
                const step = predefinedStep || customStep;
                if (!step) return null;
                
                return (
                  <div key={stepId} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="truncate">{step.title.split(' (')[0]}</span>
                  </div>
                );
              })}
              {(routine.stepOrder?.length || 0) > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{(routine.stepOrder?.length || 0) - 3} pasos más
                </p>
              )}
            </div>
          )}
        </CardContent>
      </div>
      
      {isOpen && (
        <div className="border-t bg-muted/30">
          <CardContent className="p-6 pt-4">
            <div className="text-muted-foreground mb-6 space-y-4">
              {renderDescription()}
            </div>
            {isUserRoutine ? (
              <div className="flex items-center gap-3">
                <CreateRoutineDialog onSave={onSave} onDelete={onDelete} routineToEdit={routine}>
                  <Button variant="outline" className="flex-1">
                    Editar
                  </Button>
                </CreateRoutineDialog>
                <PerformRoutineSheet routine={routine}>
                  <Button className="flex-1">Realizar rutina</Button>
                </PerformRoutineSheet>
              </div>
            ) : (
              <CreateRoutineDialog onSave={onSave}>
                <Button className="w-full">+ Agregar a mi rutina</Button>
              </CreateRoutineDialog>
            )}
          </CardContent>
        </div>
      )}
    </Card>
  );
}


export default function RoutinesPage() {
  const { user, routines, addRoutine, updateRoutine, deleteRoutine, loading } = useAppData();
  const [selectedFilter, setSelectedFilter] = useState('Mis rutinas');
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [isRoutineDialogOpen, setIsRoutineDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const routineTriggerRef = useRef<HTMLButtonElement>(null);

  // Effect para hacer click automático en el trigger cuando se abre el diálogo
  useEffect(() => {
    if (isRoutineDialogOpen && routineTriggerRef.current) {
      console.log('Routine dialog opened, clicking trigger');
      setTimeout(() => {
        routineTriggerRef.current?.click();
      }, 50);
    }
  }, [isRoutineDialogOpen]);

  const handleSaveRoutine = async (newRoutine: Partial<Routine>) => {
    if (!user || !user.uid) {
      console.error('User not authenticated');
      return;
    }

    try {
      if (newRoutine.id) {
        // Update existing routine
        console.log('=== UPDATING ROUTINE ===');
        console.log('Routine ID:', newRoutine.id);
        console.log('Full routine data:', newRoutine);
        await updateRoutine(newRoutine.id, newRoutine);
        console.log('Routine updated successfully');
      } else {
        // Create new routine
        console.log('Creating new routine with data:', newRoutine);
        // Remove id field if it exists to avoid Firestore error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...routineDataWithoutId } = newRoutine;
        await addRoutine(routineDataWithoutId as Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>);
        console.log('Routine created successfully');
        // Switch to "Mis rutinas" to show the newly created routine
        setSelectedFilter('Mis rutinas');
        
        // Note: No need to navigate since we're already on the routines page
      }
    } catch (error) {
      console.error('Error saving routine:', error);
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (!user || !user.uid) {
      console.error('User not authenticated');
      return;
    }

    try {
      await deleteRoutine(routineId);
      console.log('Routine deleted successfully');
    } catch (error) {
      console.error('Error deleting routine:', error);
    }
  };

  const routinesToShow = routines;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold md:text-3xl">Rutinas</h1>
        {!isMobile && (
          <div className="flex-shrink-0">
            <RoutineTemplateSelector onSave={handleSaveRoutine}>
              <div className={cn(buttonVariants({ size: 'sm' }), "cursor-pointer")}>
                Crear Rutina
              </div>
            </RoutineTemplateSelector>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={cn(
              buttonVariants({
                variant: selectedFilter === filter ? 'default' : 'outline',
                size: 'sm',
              }),
              'rounded-full px-4 whitespace-nowrap'
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center">
            Cargando rutinas...
          </p>
        ) : routinesToShow.length > 0 ? (
          routinesToShow.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onSave={handleSaveRoutine}
              onDelete={handleDeleteRoutine}
              isUserRoutine={true}
            />
          ))
        ) : (
          <div className="col-span-full text-center space-y-4">
            <p className="text-muted-foreground">
              Aún no has creado ninguna rutina. ¡Crea una para empezar!
            </p>
            <p className="text-sm text-muted-foreground">
              También puedes explorar rutinas recomendadas en la sección &quot;Aprender&quot;
            </p>
          </div>
        )}
      </div>
      
      {isMobile && (
        <FloatingActionButton
          onCreateHabit={() => setIsHabitDialogOpen(true)}
          onCreateRoutine={() => setIsRoutineDialogOpen(true)}
        />
      )}
      
      <CreateHabitDialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen} />
      
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
