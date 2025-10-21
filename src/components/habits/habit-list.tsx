'use client';

import React, { useMemo, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useAppData } from '@/contexts/app-provider';
import { HabitCardWithGrid } from './habit-card-with-grid';
import { Button } from '@/components/ui/button';
import { Check, X, GripVertical, Target } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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

interface HabitListProps {
  isReordering?: boolean;
  onReorderComplete?: () => void;
  onSaveOrder?: () => Promise<void>;
  onCancelOrder?: () => void;
}

export interface HabitListRef {
  saveOrder: () => Promise<void>;
  cancelOrder: () => void;
}

// Componente para elementos sortables en modo reordenamiento
function SortableHabit({ habit }: { habit: Habit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "opacity-50 z-50"
      )}
    >
      <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-background">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted/50 rounded shrink-0 select-none"
          style={{ 
            touchAction: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-primary/20 shrink-0">
            {(() => {
              const LucideIcon = LucideIcons[habit.icon as keyof typeof LucideIcons] as React.FC<React.SVGProps<SVGSVGElement>>;
              const IconComponent = LucideIcon || Target;
              return <IconComponent className="h-4 w-4 text-primary" />;
            })()}
          </div>
          <span className="text-sm font-semibold truncate">{habit.name}</span>
        </div>
      </div>
    </div>
  );
}

export const HabitList = forwardRef<HabitListRef, HabitListProps>(({ isReordering = false, onReorderComplete, onSaveOrder, onCancelOrder }, ref) => {
  const { habits: appHabits, isClient, updateHabit } = useAppData();
  const { toast } = useToast();
  const [reorderedHabits, setReorderedHabits] = useState<Habit[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedHabits = useMemo(() => {
    return [...appHabits].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [appHabits]);

  // Initialize reorderedHabits when entering reorder mode
  React.useEffect(() => {
    if (isReordering) {
      console.log('Setting reorderedHabits:', sortedHabits);
      setReorderedHabits([...sortedHabits]);
    } else {
      setReorderedHabits([]);
    }
  }, [isReordering, sortedHabits]);

  // Manejar el inicio del drag
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    console.log('Drag start:', event.active.id);
  }, []);

  // Manejar el final del drag
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    console.log('Drag end:', { 
      activeId: active.id, 
      overId: over?.id,
    });

    setActiveId(null);

    if (over && active.id !== over.id) {
      setReorderedHabits((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        
        console.log('Reordering:', { 
          oldIndex, 
          newIndex, 
          oldId: active.id, 
          newId: over.id,
          currentItemsLength: currentItems.length 
        });
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newItems = arrayMove(currentItems, oldIndex, newIndex);
          console.log('New order:', newItems.map(item => item.id));
          return newItems;
        }
        
        return currentItems;
      });
    }
  }, []);

  const handleSaveOrderInternal = async () => {
    try {
      // Update the order property for each habit based on new position
      for (let i = 0; i < reorderedHabits.length; i++) {
        const habit = reorderedHabits[i];
        const newOrder = i;
        if (habit.order !== newOrder) {
          await updateHabit(habit.id, { order: newOrder });
        }
      }
      
      toast({
        title: "¡Orden actualizado!",
        description: "Los hábitos se han reordenado correctamente.",
      });
      
      onReorderComplete?.();
    } catch (error) {
      console.error("Error updating habit order:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el orden. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleCancelInternal = () => {
    setReorderedHabits([]);
    onReorderComplete?.();
  };

  // Use external functions if provided, otherwise use internal ones
  const handleSaveOrder = onSaveOrder || handleSaveOrderInternal;
  const handleCancel = onCancelOrder || handleCancelInternal;

  // Expose functions through ref
  useImperativeHandle(ref, () => ({
    saveOrder: handleSaveOrder,
    cancelOrder: handleCancel,
  }), [handleSaveOrder, handleCancel]);
  
  if (!isClient) {
    return (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-md w-full animate-pulse"/>
            ))}
        </div>
    );
  }


  return (
    <div className="space-y-6">
      {isReordering ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={reorderedHabits.map(habit => habit.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3 touch-pan-y">
              {reorderedHabits.map((habit) => (
                <SortableHabit key={habit.id} habit={habit} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 shadow-lg">
                <div className="p-2 rounded-lg bg-primary/20 shrink-0">
                  {(() => {
                    const activeHabit = reorderedHabits.find(h => h.id === activeId);
                    if (activeHabit) {
                      const LucideIcon = LucideIcons[activeHabit.icon as keyof typeof LucideIcons] as React.FC<React.SVGProps<SVGSVGElement>>;
                      const IconComponent = LucideIcon || Target;
                      return <IconComponent className="h-4 w-4 text-primary" />;
                    }
                    return <Target className="h-4 w-4 text-primary" />;
                  })()}
                </div>
                <span className="text-sm font-semibold">
                  {reorderedHabits.find(h => h.id === activeId)?.name || ''}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {sortedHabits.map((habit) => (
            <HabitCardWithGrid
              key={habit.id}
              habit={habit}
              section="default"
              isReordering={false}
            />
          ))}
        </div>
      )}
    </div>
  );
});

HabitList.displayName = 'HabitList';
