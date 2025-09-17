"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Habit, GratitudeEntry, Frequency } from '@/lib/types';
import { INITIAL_HABITS, INITIAL_GRATITUDE_ENTRIES } from '@/lib/data';
import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns';

interface AppContextType {
  user: User | null;
  loading: boolean;
  habits: Habit[];
  gratitudeEntries: GratitudeEntry[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  getHabitById: (habitId: string) => Habit | undefined;
  getStreak: (habit: Habit) => number;
  addGratitudeEntry: (content: string, date: Date) => void;
  getGratitudeEntry: (date: Date) => GratitudeEntry | undefined;
  isClient: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
    if (!user) {
        setHabits(INITIAL_HABITS);
        setGratitudeEntries(INITIAL_GRATITUDE_ENTRIES);
        return;
    };
    try {
      const storedHabits = localStorage.getItem(`focusflow-habits-${user.uid}`);
      const storedEntries = localStorage.getItem(`focusflow-gratitudeEntries-${user.uid}`);

      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      } else {
        setHabits(INITIAL_HABITS);
      }
      
      if (storedEntries) {
        setGratitudeEntries(JSON.parse(storedEntries));
      } else {
        setGratitudeEntries(INITIAL_GRATITUDE_ENTRIES);
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setHabits(INITIAL_HABITS);
      setGratitudeEntries(INITIAL_GRATITUDE_ENTRIES);
    }
  }, [isClient, user]);

  useEffect(() => {
    if (isClient && user) {
      localStorage.setItem(`focusflow-habits-${user.uid}`, JSON.stringify(habits));
    }
  }, [habits, isClient, user]);

  useEffect(() => {
    if (isClient && user) {
      localStorage.setItem(`focusflow-gratitudeEntries-${user.uid}`, JSON.stringify(gratitudeEntries));
    }
  }, [gratitudeEntries, isClient, user]);

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedDates: [],
    };
    setHabits(prev => [...prev, newHabit]);
  };

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
    if (!habit || habit.completedDates.length === 0) {
      return 0;
    }

    const sortedDates = habit.completedDates
      .map(dateStr => parseISO(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    let mostRecentDate = sortedDates[0];

    // If the most recent completion is not today or yesterday, the streak is broken.
    if (differenceInCalendarDays(today, mostRecentDate) > 1) {
      return 0;
    }

    let streak = 1;
    let currentStreakDate = mostRecentDate;

    for (let i = 1; i < sortedDates.length; i++) {
      const nextDate = sortedDates[i];
      // Check if the next date is exactly one day before the current streak date
      if (differenceInCalendarDays(currentStreakDate, nextDate) === 1) {
        streak++;
        currentStreakDate = nextDate; // Continue the streak
      } else if (differenceInCalendarDays(currentStreakDate, nextDate) > 1) {
        // A day was skipped, so the streak is broken
        break;
      }
      // If difference is 0, it's a duplicate entry for the same day, so we just ignore it and continue.
    }

    // A special case: if the most recent completion was yesterday, but not today, the streak is still valid.
    // The loop above correctly calculates it. We just need to ensure we don't return 0 incorrectly.
    if (differenceInCalendarDays(today, mostRecentDate) === 1) {
      return streak;
    }
    
    // If the most recent completion is today, the calculated streak is also correct.
    if (differenceInCalendarDays(today, mostRecentDate) === 0) {
      return streak;
    }

    return 0; // Should not be reached if logic is correct, but as a fallback.
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
  };

  const getGratitudeEntry = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return gratitudeEntries.find(entry => entry.date === dateString);
  };
  
  const value = {
    user,
    loading,
    habits,
    gratitudeEntries,
    addHabit,
    toggleHabitCompletion,
    getHabitById,
    getStreak,
    addGratitudeEntry,
    getGratitudeEntry,
    isClient,
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
