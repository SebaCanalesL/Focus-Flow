"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Habit, GratitudeEntry, Frequency } from '@/lib/types';
import { INITIAL_HABITS, INITIAL_GRATITUDE_ENTRIES } from '@/lib/data';
import { format, subDays, differenceInCalendarDays, parseISO, startOfWeek, endOfWeek, isWithinInterval, getWeek } from 'date-fns';

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  habits: Habit[];
  gratitudeEntries: GratitudeEntry[];
  addHabit: (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'icon'>) => void;
  updateHabit: (habitId: string, habitData: { name: string; frequency: Frequency; daysPerWeek?: number }) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  getHabitById: (habitId: string) => Habit | undefined;
  getStreak: (habit: Habit) => number;
  addGratitudeEntry: (content: string, date: Date) => void;
  getGratitudeEntry: (date: Date) => GratitudeEntry | undefined;
  isClient: boolean;
  getWeekCompletion: (habit: Habit) => { completed: number; total: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const gratitudeHabitTemplate: Habit = {
  id: 'gratitude-habit',
  name: 'Agradecer',
  icon: 'BookHeart',
  frequency: 'daily',
  createdAt: new Date().toISOString(),
  completedDates: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsClient(true);
    
    let baseHabits = INITIAL_HABITS;
    let baseEntries = INITIAL_GRATITUDE_ENTRIES;

    if (user) {
      try {
        const storedHabits = localStorage.getItem(`focusflow-habits-${user.uid}`);
        const storedEntries = localStorage.getItem(`focusflow-gratitudeEntries-${user.uid}`);
        
        if (storedHabits) {
          baseHabits = JSON.parse(storedHabits);
        }
        if (storedEntries) {
          baseEntries = JSON.parse(storedEntries);
        }
      } catch (error) {
        console.error("Failed to parse from localStorage", error);
      }
    }
    
    // Ensure gratitude habit exists
    const gratitudeHabitExists = baseHabits.some(h => h.id === 'gratitude-habit');
    if (!gratitudeHabitExists) {
      baseHabits = [gratitudeHabitTemplate, ...baseHabits];
    }
    
    setHabits(baseHabits);
    setGratitudeEntries(baseEntries);

  }, [isClient, user]);

  useEffect(() => {
    if (isClient && user) {
      localStorage.setItem(`focusflow-habits-${user.uid}`, JSON.stringify(habits));
    } else if (isClient && !user && habits.length > 0) {
        // Handle saving for non-logged-in users if needed, or clear storage
    }
  }, [habits, isClient, user]);

  useEffect(() => {
    if (isClient && user) {
      localStorage.setItem(`focusflow-gratitudeEntries-${user.uid}`, JSON.stringify(gratitudeEntries));
    } else if (isClient && !user && gratitudeEntries.length > 0) {
        // Handle saving for non-logged-in users if needed, or clear storage
    }
  }, [gratitudeEntries, isClient, user]);

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'icon'>) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedDates: [],
      icon: "Target", // Default icon
      ...habitData,
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (habitId: string, habitData: { name: string; frequency: Frequency; daysPerWeek?: number }) => {
    setHabits(prev =>
      prev.map(habit =>
        habit.id === habitId ? { ...habit, ...habitData } : habit
      )
    );
  };
  
  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  }

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === habitId) {
          const completed = habit.completedDates.includes(dateString);
          const newCompletedDates = completed
            ? habit.completedDates.filter(d => d !== dateString)
            : [...habit.completedDates, dateString];
          return { ...habit, completedDates: newCompletedDates };
        }
        return habit;
      })
    );
  };
  
  const getHabitById = (habitId: string) => {
    return habits.find(h => h.id === habitId);
  }

 const getStreak = (habit: Habit) => {
    if (!habit || habit.completedDates.length === 0) return 0;
    
    const sortedDates = habit.completedDates.map(d => parseISO(d)).sort((a,b) => b.getTime() - a.getTime());

    if (habit.frequency === 'daily') {
        const today = new Date();
        const mostRecentDate = sortedDates[0];

        if (differenceInCalendarDays(today, mostRecentDate) > 1) {
            return 0;
        }

        let streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const diff = differenceInCalendarDays(sortedDates[i-1], sortedDates[i]);
            if (diff === 1) {
                streak++;
            } else if (diff > 1) {
                break;
            }
        }
        return streak;

    } else if (habit.frequency === 'weekly') {
        const today = new Date();
        const weekOption = { weekStartsOn: 1 as const };
        const target = habit.daysPerWeek || 1;

        const completedWeeks = new Set<number>();
        
        for (const date of sortedDates) {
            const completionsInWeek = sortedDates.filter(d => 
                isWithinInterval(d, {
                    start: startOfWeek(date, weekOption),
                    end: endOfWeek(date, weekOption)
                })
            ).length;

            if (completionsInWeek >= target) {
                completedWeeks.add(getWeek(date, weekOption));
            }
        }

        if (completedWeeks.size === 0) return 0;

        const sortedWeeks = Array.from(completedWeeks).sort((a,b) => b - a);

        let currentWeek = getWeek(today, weekOption);
        let lastWeek = getWeek(subDays(today, 7), weekOption);
        
        if (!sortedWeeks.includes(currentWeek) && !sortedWeeks.includes(lastWeek)) {
          return 0;
        }

        let streak = 0;
        if (sortedWeeks.includes(currentWeek)) streak++;
        else if (sortedWeeks.includes(lastWeek)) streak++;
        else return 0;
        
        for (let i=0; i<sortedWeeks.length -1; i++) {
          const week = sortedWeeks[i];
          const prevWeek = sortedWeeks[i+1];
          if (week - prevWeek === 1) {
            streak++;
          } else {
            break;
          }
        }
        
        return streak;
    }
    return 0;
  };
  
  const getWeekCompletion = (habit: Habit) => {
    if (habit.frequency !== 'weekly' || !habit.daysPerWeek) {
      return { completed: 0, total: 0 };
    }
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    
    const completedThisWeek = habit.completedDates.filter(dateStr => {
      const d = parseISO(dateStr);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    }).length;

    return { completed: completedThisWeek, total: habit.daysPerWeek };
  };

  const addGratitudeEntry = (content: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const existingEntryIndex = gratitudeEntries.findIndex(entry => entry.date === dateString);

    if (existingEntryIndex > -1) {
      const updatedEntries = [...gratitudeEntries];
      updatedEntries[existingEntryIndex] = { ...updatedEntries[existingEntryIndex], content };
      setGratitudeEntries(updatedEntries);
    } else {
      const newEntry: GratitudeEntry = {
        id: Date.now().toString(),
        date: dateString,
        content,
      };
      setGratitudeEntries(prev => [...prev, newEntry]);
    }
    
    // Auto-complete gratitude habit
    setHabits(prev => 
      prev.map(h => {
        if (h.id === 'gratitude-habit' && !h.completedDates.includes(dateString)) {
          return {
            ...h,
            completedDates: [...h.completedDates, dateString],
          };
        }
        return h;
      })
    );
  };

  const getGratitudeEntry = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return gratitudeEntries.find(entry => entry.date === dateString);
  };
  
  const value = {
    user,
    setUser,
    loading,
    habits,
    gratitudeEntries,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    getHabitById,
    getStreak,
    addGratitudeEntry,
    getGratitudeEntry,
    isClient,
    getWeekCompletion,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppProvider');
  }
  return context;
}
