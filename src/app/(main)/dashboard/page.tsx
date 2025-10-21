'use client';

import React, { useState, useEffect } from 'react';
import { HabitTracker } from '@/components/dashboard/habit-tracker';
import { GratitudeTracker } from '@/components/dashboard/gratitude-journal';
import { RoutineScheduler } from '@/components/dashboard/routine-scheduler';
import { useAppData } from '@/contexts/app-provider';

type DashboardCardType = 'gratitude' | 'habits' | 'routines';

interface DashboardCard {
  id: string;
  type: DashboardCardType;
  component: React.ReactNode;
}

export default function Dashboard() {
  const { user } = useAppData();
  const [cards, setCards] = useState<DashboardCard[]>([]);

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

  return (
    <div className="space-y-8">
      {cards.map((card) => (
        <div key={card.id}>
          {card.component}
        </div>
      ))}
    </div>
  );
}
