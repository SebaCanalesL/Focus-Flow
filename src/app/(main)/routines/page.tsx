'use client';

import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CreateRoutineDialog,
  routineSteps,
} from '@/components/routines/create-routine-dialog';
import { PerformRoutineSheet } from '@/components/routines/perform-routine-sheet';
import { Routine } from '@/lib/types';
import { useAppData } from '@/contexts/app-provider';
import { useRouter } from 'next/navigation';

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
      
      // Add predefined steps
      if (routine.stepIds) {
        routine.stepIds.forEach((stepId: string) => {
          const predefinedStep = routineSteps.find((s) => s.id === stepId);
          if (predefinedStep) {
            allSteps.push({
              id: predefinedStep.id,
              title: predefinedStep.title.split(' (')[0]
            });
          }
        });
      }
      
      // Add custom steps
      if (routine.customSteps) {
        routine.customSteps.forEach((customStep) => {
          allSteps.push({
            id: customStep.id,
            title: customStep.title
          });
        });
      }

      // Get active reminders
      const activeReminders = routine.reminders?.filter(r => r.enabled) || [];
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
          
          {activeReminders.length > 0 && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground">🔔 Recordatorios activos:</span>
              </div>
              <div className="space-y-1">
                {activeReminders.map((reminder) => {
                  const dayIndex = weekDays.indexOf(reminder.day);
                  const dayName = dayIndex !== -1 ? dayNames[dayIndex] : reminder.day;
                  return (
                    <p key={reminder.id} className="text-xs text-muted-foreground">
                      {dayName} a las {reminder.time}
                    </p>
                  );
                })}
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
    <Card className="overflow-hidden rounded-lg">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        <div className="relative w-full h-32">
          <Image
            src={routine.imageUrl}
            alt={routine.title}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      {isOpen && (
        <CardContent className="pt-4">
          <div className="text-muted-foreground mb-4 space-y-4">
            {renderDescription()}
          </div>
          {isUserRoutine ? (
            <div className="flex items-center gap-2">
              <CreateRoutineDialog onSave={onSave} onDelete={onDelete} routineToEdit={routine}>
                <Button variant="outline" className="w-full">
                  Editar
                </Button>
              </CreateRoutineDialog>
              <PerformRoutineSheet routine={routine}>
                <Button className="w-full">Realizar rutina</Button>
              </PerformRoutineSheet>
            </div>
          ) : (
            <CreateRoutineDialog onSave={onSave}>
              <Button className="w-full">+ Agregar a mi rutina</Button>
            </CreateRoutineDialog>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function RoutinesPage() {
  const { user, routines, addRoutine, updateRoutine, deleteRoutine, loading } = useAppData();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('Mis rutinas');

  const handleSaveRoutine = async (newRoutine: Partial<Routine>) => {
    if (!user) {
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
    if (!user) {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Rutinas</h1>
        <CreateRoutineDialog onSave={handleSaveRoutine}>
          <div className={cn(buttonVariants({ size: 'sm' }), "cursor-pointer")}>
            Crear Rutina
          </div>
        </CreateRoutineDialog>
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
              También puedes explorar rutinas recomendadas en la sección "Aprender"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
