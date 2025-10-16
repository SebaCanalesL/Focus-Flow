'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { HabitTracker } from '@/components/dashboard/habit-tracker';
import { GratitudeTracker } from '@/components/dashboard/gratitude-journal';
import { RoutineScheduler } from '@/components/dashboard/routine-scheduler';
import { ReorderableCard } from '@/components/dashboard/reorderable-card';
import { useAppData } from '@/contexts/app-provider';
import { useDragSensors, useMobileDragSensors } from '@/hooks/use-drag-sensors';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type DashboardCardType = 'gratitude' | 'habits' | 'routines';

interface DashboardCard {
  id: string;
  type: DashboardCardType;
  component: React.ReactNode;
}

export default function Dashboard() {
  const { user } = useAppData();
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const isMobile = useIsMobile();
  
  const mobileSensors = useMobileDragSensors();
  const desktopSensors = useDragSensors();
  const sensors = isMobile ? mobileSensors : desktopSensors;

  // Initialize cards with default order or user preference
  useEffect(() => {
    const defaultCards: DashboardCard[] = [
      {
        id: 'gratitude',
        type: 'gratitude',
        component: <GratitudeTracker />
      },
      {
        id: 'habits',
        type: 'habits',
        component: <HabitTracker />
      },
      {
        id: 'routines',
        type: 'routines',
        component: <RoutineScheduler />
      }
    ];

    // Load saved order from localStorage
    const savedOrder = localStorage.getItem(`dashboard-order-${user?.uid || 'default'}`);
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        const reorderedCards = order.map((cardId: string) => 
          defaultCards.find(card => card.id === cardId)
        ).filter(Boolean) as DashboardCard[];
        
        // Add any new cards that might not be in saved order
        const missingCards = defaultCards.filter(card => 
          !reorderedCards.some(reorderedCard => reorderedCard.id === card.id)
        );
        
        setCards([...reorderedCards, ...missingCards]);
      } catch (error) {
        console.error('Error parsing saved dashboard order:', error);
        setCards(defaultCards);
      }
    } else {
      setCards(defaultCards);
    }
  }, [user?.uid]);

  const handleDragStart = () => {
    setIsReordering(true);
  };

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;
    setIsReordering(false);

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newCards = arrayMove(items, oldIndex, newIndex);
        
        // Save new order to localStorage
        const order = newCards.map(card => card.id);
        localStorage.setItem(`dashboard-order-${user?.uid || 'default'}`, JSON.stringify(order));
        
        return newCards;
      });
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
        <div className={cn("space-y-8", isReordering && "pointer-events-none")}>
          {cards.map((card) => (
            <ReorderableCard key={card.id} id={card.id}>
              {card.component}
            </ReorderableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
