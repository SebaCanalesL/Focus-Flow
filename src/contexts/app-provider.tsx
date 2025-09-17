"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Habit, GratitudeEntry, Frequency } from '@/lib/types';
import { INITIAL_HABITS, INITIAL_GRATITUDE_ENTRIES } from '@/lib/data';
import { formatISO } from 'date-fns';

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
    const dateString = formatISO(date, { representation: 'date' });
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
    if (!habit) return 0;
    const sortedDates = habit.completedDates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    let streak = 0;
    let today = new Date();
    today.setHours(0,0,0,0);

    const todayCompleted = sortedDates.some(date => {
        const d = new Date(date);
        d.setHours(0,0,0,0);
        return d.getTime() === today.getTime();
    });

    if (todayCompleted) {
        streak = 1;
        let lastDate = new Date(today);
        for (let i = 0; i < sortedDates.length; i++) {
            const currentDate = sortedDates[i];
            const prevDate = new Date(lastDate);
            prevDate.setDate(prevDate.getDate() - 1);
            if (currentDate.getTime() === prevDate.getTime()) {
                streak++;
                lastDate = currentDate;
            } else if (currentDate.getTime() < prevDate.getTime()) {
                break;
            }
        }
    } else { // Check if streak ended yesterday
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0,0,0,0);
       const yesterdayCompleted = sortedDates.some(date => {
        const d = new Date(date);
        d.setHours(0,0,0,0);
        return d.getTime() === yesterday.getTime();
      });

      if (yesterdayCompleted) {
        streak = 1;
        let lastDate = new Date(yesterday);
         for (let i = 0; i < sortedDates.length; i++) {
            if (sortedDates[i].getTime() === lastDate.getTime()) {
                let prevDate = new Date(lastDate);
                prevDate.setDate(prevDate.getDate() - 1);
                
                // look for prevDate in the rest of the array
                if (sortedDates.slice(i+1).some(d => d.getTime() === prevDate.getTime())) {
                    streak++;
                    lastDate = prevDate;
                }
            }
         }
      }
    }

    return streak;
  };

  const addGratitudeEntry = (content: string, date: Date) => {
    const dateString = formatISO(date, { representation: 'date' });
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
    const dateString = formatISO(date, { representation: 'date' });
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
