'use client';

import type { Habit } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import {
  Target,
  Flame,
  Check,
  CalendarDays,
  CheckCheck,
  Pencil,
  MoreVertical,
} from 'lucide-react';
import { useAppData } from '@/contexts/app-provider';
import { cn } from '@/lib/utils';
import { HabitCompletionGrid } from './habit-completion-grid';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { EditHabitDialog } from './edit-habit-dialog';

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon =
    LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target className={className} />;
  return <LucideIcon className={className} />;
};

export function HabitCardWithGrid({
  habit,
  section = 'default',
  isReordering = false,
}: {
  habit: Habit;
  section?: string;
  isReordering?: boolean;
}) {
  const { toggleHabitCompletion, getStreak, getWeekCompletion } = useAppData();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const editTriggerRef = useRef<HTMLButtonElement>(null);
  const calendarOpenRef = useRef(false);

  // Efecto para abrir el diálogo de editar cuando se solicite desde el menú
  useEffect(() => {
    if (editDialogOpen && editTriggerRef.current) {
      editTriggerRef.current.click();
      setEditDialogOpen(false);
    }
  }, [editDialogOpen]);

  // Efecto para mantener el Popover abierto cuando el hábito se actualiza
  // Esto previene que se cierre durante re-renders causados por toggleHabitCompletion
  const completedDatesString = habit.completedDates.join(',');
  useEffect(() => {
    if (calendarOpenRef.current && !calendarOpen) {
      // Si el ref dice que debería estar abierto pero el estado no, sincronizar
      // Esto puede pasar cuando el componente se re-renderiza debido a cambios en el hábito
      setCalendarOpen(true);
    }
  }, [completedDatesString, calendarOpen]);



  const today = new Date();
  const todayString = format(today, 'yyyy-MM-dd');
  const isCompletedToday = habit.completedDates.includes(todayString);
  const streak = getStreak(habit);

  // Memoizar las fechas completadas para evitar re-renders innecesarios
  const completedDatesAsDates = useMemo(() => {
    return habit.completedDates.map(isoString => parseISO(isoString));
  }, [habit.completedDates]); // Depender directamente de completedDates

  const handleDayClick = useCallback((day: Date | undefined) => {
    if (day) {
      // Marcar que el Popover debe permanecer abierto durante la actualización
      calendarOpenRef.current = true;
      // Actualizar el hábito - esto causará un re-render
      toggleHabitCompletion(habit.id, day);
      // Usar múltiples intentos para asegurar que el Popover permanezca abierto
      // después del re-render causado por toggleHabitCompletion
      requestAnimationFrame(() => {
        if (calendarOpenRef.current) {
          setCalendarOpen(true);
        }
      });
      // Segundo intento después de un pequeño delay para asegurar que se mantenga abierto
      setTimeout(() => {
        if (calendarOpenRef.current && !calendarOpen) {
          setCalendarOpen(true);
        }
      }, 10);
    }
  }, [habit.id, toggleHabitCompletion, calendarOpen]);

  const weekCompletion = getWeekCompletion(habit);
  const isWeekly = habit.frequency === 'weekly';
  const streakUnit = isWeekly
    ? streak === 1
      ? 'semana'
      : 'semanas'
    : streak === 1
    ? 'día'
    : 'días';

  // Render compact version for reordering
  if (isReordering) {
    return (
      <div className="flex items-center gap-3 w-full" data-testid="habit-card-compact">
        <div className="p-2 rounded-lg bg-primary/20 shrink-0">
          <Icon name={habit.icon as IconName} className="h-4 w-4 text-primary" />
        </div>
        <CardTitle className="text-sm font-semibold truncate">{habit.name}</CardTitle>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'flex flex-col transition-shadow',
        isCompletedToday && 'border-green-500 border-2'
      )}
      data-testid="habit-card"
    >
      <CardHeader>
        {/* Título del hábito y botones de acción */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={'p-2 rounded-lg bg-primary/20 shrink-0'}>
              <Icon name={habit.icon as IconName} className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold leading-tight break-words">{habit.name}</CardTitle>
            </div>
          </div>
          
          {/* Botones de acción */}
          {!isReordering && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                size="icon"
                className={cn('h-8 w-8 sm:h-9 sm:w-9 shrink-0', isCompletedToday && 'bg-green-600 text-white hover:bg-green-600/90')}
                variant={isCompletedToday ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHabitCompletion(habit.id, new Date());
                }}
              >
                {isCompletedToday ? (
                  <CheckCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
              
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                    <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Más opciones</span>
                  </Button>
                </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onCloseAutoFocus={(e) => {
              // Prevenir que el foco vuelva al trigger después de cerrar el menú
              e.preventDefault();
            }}>
              <DropdownMenuItem onSelect={(e) => {
                e.preventDefault();
                // Cerrar el menú primero
                setMenuOpen(false);
                // Abrir el calendario inmediatamente después
                calendarOpenRef.current = true;
                // Usar requestAnimationFrame para asegurar que se abre después de que el DOM se actualiza
                requestAnimationFrame(() => {
                  setCalendarOpen(true);
                });
              }}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Ver calendario
              </DropdownMenuItem>
              
              <DropdownMenuItem onSelect={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                setEditDialogOpen(true);
              }}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Popover del calendario separado para mantener la funcionalidad */}
          <Popover 
            open={calendarOpen} 
            onOpenChange={(open) => {
              calendarOpenRef.current = open;
              setCalendarOpen(open);
            }}
          >
            <PopoverTrigger asChild className="sr-only">
              <button />
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0"
              onOpenAutoFocus={(e) => e.preventDefault()}
              side="bottom"
              align="end"
              sideOffset={8}
              onInteractOutside={(e) => {
                // Prevenir que se cierre solo cuando se interactúa con el DropdownMenu
                const target = e.target as HTMLElement;
                
                // Si el clic es en el DropdownMenu que se está cerrando, no cerrar el Popover
                if (target.closest('[role="menu"]') || target.closest('[data-radix-dropdown-menu-content]')) {
                  e.preventDefault();
                  return;
                }
                
                // Permitir que se cierre normalmente cuando se hace clic fuera
              }}
            >
              <CustomCalendar
                selectedDates={completedDatesAsDates}
                onDateClick={handleDayClick}
                habitColor={habit.color || '#10b981'}
              />
            </PopoverContent>
          </Popover>

          {/* Dialog de editar controlado externamente */}
          <EditHabitDialog habit={habit}>
            <button className="sr-only" ref={editTriggerRef} />
          </EditHabitDialog>
          </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-end justify-between gap-4">
        <HabitCompletionGrid habit={habit} section={section} />
        <div className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg bg-secondary/50 shrink-0">
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
            <Flame
              className={cn(
                'h-6 w-6 sm:h-7 sm:w-7',
                streak > 0 ? 'text-orange-500' : 'text-muted-foreground'
              )}
            />
            <span>{streak}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">{streakUnit}</p>
          {isWeekly && (
            <p className="text-xs font-medium text-muted-foreground mt-1 sm:mt-2">
              ({weekCompletion.completed}/{weekCompletion.total} esta semana)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
