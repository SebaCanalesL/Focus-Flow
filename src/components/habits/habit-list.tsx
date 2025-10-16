'use client';

import React, { useState, useMemo } from 'react';
import { useAppData } from '@/contexts/app-provider';
import { HabitCardWithGrid } from './habit-card-with-grid';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Habit } from '@/lib/types';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// import { format } from 'date-fns';
import { useDragSensors, useMobileDragSensors } from '@/hooks/use-drag-sensors';
import { useIsMobile } from '@/hooks/use-mobile';
import { DragOverlayMobile } from '@/components/ui/drag-overlay-mobile';

function SortableHabitItem({ habit, section = 'default' }: { habit: Habit; section?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: habit.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <HabitCardWithGrid habit={habit} isDragging={isDragging} listeners={listeners} section={section} />
    </div>
  );
}

export function HabitList() {
  const { user, habits: appHabits, setHabits, isClient } = useAppData();
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const isMobile = useIsMobile();

  // const todayString = format(new Date(), 'yyyy-MM-dd');

  const sortedHabits = useMemo(() => {
    return [...appHabits].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [appHabits]);

  const mobileSensors = useMobileDragSensors();
  const desktopSensors = useDragSensors();
  const sensors = isMobile ? mobileSensors : desktopSensors;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const habit = appHabits.find((h) => h.id === active.id);
    if (habit) setActiveHabit(habit);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveHabit(null);

    if (over && active.id !== over.id) {
      const oldIndex = appHabits.findIndex((item) => item.id === active.id);
      const newIndex = appHabits.findIndex((item) => item.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedHabits = arrayMove(appHabits, oldIndex, newIndex);
      const habitsWithUpdatedOrder = reorderedHabits.map((habit, index) => ({ ...habit, order: index }));

      setHabits(habitsWithUpdatedOrder); // Optimistic UI update

      if (user) {
        try {
          const batch = writeBatch(db);
          habitsWithUpdatedOrder.forEach((habit) => {
            const habitRef = doc(db, `users/${user.uid}/habits`, habit.id);
            batch.update(habitRef, { order: habit.order });
          });
          await batch.commit();
        } catch (error) {
          console.error('Failed to update habit order:', error);
          setHabits(appHabits); // Revert on error
        }
      }
    }
  };
  
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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <SortableContext items={sortedHabits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
          {sortedHabits.map((habit, index) => (
            <SortableHabitItem key={`habit-${habit.id}-${index}`} habit={habit} section="default" />
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeHabit ? (
          <DragOverlayMobile>
            <HabitCardWithGrid key={`drag-${activeHabit.id}`} habit={activeHabit} isDragging section="drag" />
          </DragOverlayMobile>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
