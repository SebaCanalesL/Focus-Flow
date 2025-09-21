"use client"

import React, { useState, useEffect } from "react"
import { useAppData } from "@/contexts/app-provider"
import { HabitCardWithGrid } from "./habit-card-with-grid"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Habit } from "@/lib/types";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";


function SortableHabitItem({ habit }: { habit: Habit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id, disabled: habit.id === 'gratitude-habit' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <HabitCardWithGrid 
        habit={habit}
        isDragging={isDragging}
        listeners={listeners}
       />
    </div>
  );
}

export function HabitList() {
  const { user, habits: appHabits, setHabits, isClient } = useAppData()
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [localHabits, setLocalHabits] = useState<Habit[]>([]);

  useEffect(() => {
    // Sort habits from context by order and update local state
    const sortedHabits = [...appHabits].sort((a,b) => (a.order || 0) - (b.order || 0));
    setLocalHabits(sortedHabits);
  }, [appHabits]);


  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
          distance: 10,
        },
      }),
      useSensor(TouchSensor, {
        activationConstraint: {
          delay: 250,
          tolerance: 5,
        },
      }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const habit = localHabits.find(h => h.id === active.id);
    if (habit) {
        setActiveHabit(habit);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveHabit(null);

    if (over && active.id !== over.id) {
      const oldIndex = localHabits.findIndex(item => item.id === active.id);
      const newIndex = localHabits.findIndex(item => item.id === over.id);
      
      const newHabits = arrayMove(localHabits, oldIndex, newIndex);
      setLocalHabits(newHabits);

      if (user) {
        try {
            const batch = writeBatch(db);
            newHabits.forEach((habit, index) => {
                if(habit.id !== 'gratitude-habit') {
                    const habitRef = doc(db, `users/${user.uid}/habits`, habit.id);
                    batch.update(habitRef, { order: index });
                }
            });
            await batch.commit();
            // Optionally, resync with global state after commit if needed
            setHabits(newHabits);
        } catch (error) {
            console.error("Failed to update habit order:", error);
            // Revert local state on error
            setLocalHabits(appHabits);
        }
      }
    }
  }

  if (!isClient) {
    return (
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-md w-full animate-pulse" />
        ))}
      </div>
    )
  }

  const gratitudeHabit = localHabits.find(h => h.id === 'gratitude-habit');
  const sortableHabits = localHabits.filter(h => h.id !== 'gratitude-habit');

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {gratitudeHabit && <HabitCardWithGrid habit={gratitudeHabit} />}
        <SortableContext items={sortableHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
          {sortableHabits.map((habit) => (
            <SortableHabitItem key={habit.id} habit={habit} />
          ))}
        </SortableContext>
      </div>
      <DragOverlay>
        {activeHabit ? <HabitCardWithGrid habit={activeHabit} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
