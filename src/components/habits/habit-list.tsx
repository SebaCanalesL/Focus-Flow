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
import { firestore } from "@/lib/firebase";


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
  const { user, habits, loading, ready } = useAppData();
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [orderedHabits, setOrderedHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (habits) {
        const sortableHabits = habits
            .filter(h => h.id !== 'gratitude-habit')
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        setOrderedHabits(sortableHabits);
    }
  }, [habits]);

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
    const habit = habits?.find(h => h.id === active.id);
    if (habit) {
        setActiveHabit(habit as Habit);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveHabit(null);

    if (over && active.id !== over.id) {
      const oldIndex = orderedHabits.findIndex(item => item.id === active.id);
      const newIndex = orderedHabits.findIndex(item => item.id === over.id);
      
      const newHabits = arrayMove(orderedHabits, oldIndex, newIndex);
      setOrderedHabits(newHabits);

      if (user) {
        const batch = writeBatch(firestore);
        newHabits.forEach((habit, index) => {
          if (habit.id !== 'gratitude-habit') {
            const habitRef = doc(firestore, `users/${user.uid}/habits`, habit.id);
            batch.update(habitRef, { order: index });
          }
        });
        await batch.commit();
      }
    }
  }

  if (loading && !ready) {
    return (
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-md w-full animate-pulse" />
        ))}
      </div>
    )
  }

  const gratitudeHabit = habits?.find(h => h.id === 'gratitude-habit');

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {gratitudeHabit && <HabitCardWithGrid habit={gratitudeHabit as Habit} />}
        <SortableContext items={orderedHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
          {orderedHabits.map((habit) => (
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
