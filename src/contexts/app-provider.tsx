

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Habit, GratitudeEntry, Frequency } from '@/lib/types';
import { INITIAL_HABITS, INITIAL_GRATITUDE_ENTRIES } from '@/lib/data';
import { format, subDays, differenceInCalendarDays, parseISO, startOfWeek, endOfWeek, isWithinInterval, getWeek } from 'date-fns';
import { dailyMotivation } from '@/ai/flows/daily-motivation-flow';


interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  gratitudeEntries: GratitudeEntry[];
  addHabit: (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  updateHabit: (habitId: string, habitData: { name: string; frequency: Frequency; daysPerWeek?: number }) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  getHabitById: (habitId: string) => Habit | undefined;
  getStreak: (habit: Habit) => number;
  addGratitudeEntry: (content: string, date: Date, note?: string) => void;
  getGratitudeEntry: (date: Date) => GratitudeEntry | undefined;
  isClient: boolean;
  getWeekCompletion: (habit: Habit) => { completed: number; total: number };
  getTodaysMotivation: (userName: string) => Promise<string>;
  clearTodaysMotivation: () => void;
  birthday: string | null;
  setBirthday: (date: Date | undefined) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const gratitudeHabitTemplate: Habit = {
  id: 'gratitude-habit',
  name: 'Agradecer 3 aspectos de mi vida',
  icon: 'BookHeart',
  frequency: 'daily',
  createdAt: new Date().toISOString(),
  completedDates: [],
};

interface MotivationalMessage {
  quote: string;
  date: string;
}


export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState<MotivationalMessage | null>(null);
  const [birthday, setBirthdayState] = useState<string | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // Clear cached data on logout
        setHabits([]);
        setGratitudeEntries([]);
        setMotivationalMessage(null);
        setBirthdayState(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && user) {
        let storedHabits: Habit[] = [];
        let storedEntries: GratitudeEntry[] = [];
        
        try {
          const habitsStr = localStorage.getItem(`focusflow-habits-${user.uid}`);
          const entriesStr = localStorage.getItem(`focusflow-gratitudeEntries-${user.uid}`);
          const motivationStr = localStorage.getItem(`focusflow-motivation-${user.uid}`);
          const birthdayStr = localStorage.getItem(`focusflow-birthday-${user.uid}`);


          if (habitsStr) {
            storedHabits = JSON.parse(habitsStr);
          } else {
            storedHabits = INITIAL_HABITS;
          }

          if (entriesStr) {
            storedEntries = JSON.parse(entriesStr);
          } else {
            storedEntries = INITIAL_GRATITUDE_ENTRIES;
          }
          
           if (motivationStr) {
            setMotivationalMessage(JSON.parse(motivationStr));
          }

          if (birthdayStr) {
            setBirthdayState(JSON.parse(birthdayStr));
          }


        } catch (error) {
          console.error("Failed to parse from localStorage", error);
          storedHabits = INITIAL_HABITS;
          storedEntries = INITIAL_GRATITUDE_ENTRIES;
        }
        
        let habitsToSet: Habit[] = [...storedHabits];
        let gratitudeHabit = habitsToSet.find(h => h.id === 'gratitude-habit');
        if (!gratitudeHabit) {
            gratitudeHabit = { ...gratitudeHabitTemplate };
            habitsToSet.unshift(gratitudeHabit);
        }

        const gratitudeDates = new Set(storedEntries.map(e => e.date));
        const gratitudeHabitIndex = habitsToSet.findIndex(h => h.id === 'gratitude-habit');

        if (gratitudeHabitIndex !== -1) {
          const habit = habitsToSet[gratitudeHabitIndex];
          const existingDates = new Set(habit.completedDates);
          const newDates = Array.from(new Set([...Array.from(existingDates), ...Array.from(gratitudeDates)]));
          habitsToSet[gratitudeHabitIndex] = { ...habit, completedDates: newDates.sort() };
        }
        
        setHabits(habitsToSet);
        setGratitudeEntries(storedEntries);
    }
  }, [isClient, user]);

  useEffect(() => {
    if (isClient && user && habits.length > 0) {
      localStorage.setItem(`focusflow-habits-${user.uid}`, JSON.stringify(habits));
    }
  }, [habits, isClient, user]);

  useEffect(() => {
    if (isClient && user && gratitudeEntries.length > 0) {
      localStorage.setItem(`focusflow-gratitudeEntries-${user.uid}`, JSON.stringify(gratitudeEntries));
    }
  }, [gratitudeEntries, isClient, user]);
  
  useEffect(() => {
    if (isClient && user && motivationalMessage) {
      localStorage.setItem(`focusflow-motivation-${user.uid}`, JSON.stringify(motivationalMessage));
    }
  }, [motivationalMessage, isClient, user]);

  useEffect(() => {
    if (isClient && user) {
        if(birthday) {
            localStorage.setItem(`focusflow-birthday-${user.uid}`, JSON.stringify(birthday));
        } else {
            localStorage.removeItem(`focusflow-birthday-${user.uid}`);
        }
    }
  }, [birthday, isClient, user]);


  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedDates: [],
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
          return { ...habit, completedDates: newCompletedDates.sort() };
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
    
    // Always sort dates before calculating streak to avoid order-of-insertion issues.
    const sortedDates = habit.completedDates.map(d => parseISO(d)).sort((a,b) => b.getTime() - a.getTime());

    if (habit.frequency === 'daily') {
        const today = new Date();
        const mostRecentDate = sortedDates[0];
        
        // If the last completion was more than a day ago, the streak is broken.
        if (differenceInCalendarDays(today, mostRecentDate) > 1) {
            return 0;
        }

        let streak = 0;
        // Check if today or yesterday is the most recent completion to start the streak count
        if (differenceInCalendarDays(today, mostRecentDate) <= 1) {
            streak = 1;
        } else {
            return 0;
        }

        for (let i = 1; i < sortedDates.length; i++) {
            const diff = differenceInCalendarDays(sortedDates[i-1], sortedDates[i]);
            if (diff === 1) {
                streak++;
            } else if (diff > 1) {
                // A gap of more than one day breaks the streak.
                break;
            }
            // if diff is 0, it's the same day, so we don't increment but don't break either.
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
        if (sortedWeeks.includes(currentWeek)) {
            streak = 1;
        } else if (sortedWeeks.includes(lastWeek)) {
            streak = 1;
        } else {
          return 0;
        }
        
        const uniqueSortedWeeks = Array.from(new Set(sortedWeeks));


        for (let i=0; i < uniqueSortedWeeks.length - 1; i++) {
          const week = uniqueSortedWeeks[i];
          const prevWeek = uniqueSortedWeeks[i+1];
          // This check works for year boundaries as getWeek is ISO week number
          if (week - prevWeek === 1 || (week === 1 && (prevWeek === 52 || prevWeek === 53))) {
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

  const addGratitudeEntry = (content: string, date: Date, note?: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const existingEntryIndex = gratitudeEntries.findIndex(entry => entry.date === dateString);
  
    const entryData = { content, note };

    if (existingEntryIndex > -1) {
      const updatedEntries = [...gratitudeEntries];
      updatedEntries[existingEntryIndex] = { ...updatedEntries[existingEntryIndex], ...entryData };
      setGratitudeEntries(updatedEntries);
    } else {
      const newEntry: GratitudeEntry = {
        id: Date.now().toString(),
        date: dateString,
        content,
        note,
      };
      setGratitudeEntries(prev => [...prev, newEntry]);
    }
    
    // Auto-complete gratitude habit if there is content
    if (content.trim().length > 0) {
      setHabits(prev => 
        prev.map(h => {
          if (h.id === 'gratitude-habit' && !h.completedDates.includes(dateString)) {
            return {
              ...h,
              completedDates: [...h.completedDates, dateString].sort(),
            };
          }
          return h;
        })
      );
    }
  };

  const getGratitudeEntry = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return gratitudeEntries.find(entry => entry.date === dateString);
  };

  const getTodaysMotivation = useCallback(async (userName: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    if (motivationalMessage && motivationalMessage.date === todayStr) {
      return motivationalMessage.quote;
    }

    const response = await dailyMotivation({ userName });
    const newMotivation: MotivationalMessage = {
      quote: response.quote,
      date: todayStr,
    };
    setMotivationalMessage(newMotivation);
    return newMotivation.quote;
  }, [motivationalMessage]);

  const clearTodaysMotivation = () => {
    setMotivationalMessage(null);
    if(user){
        localStorage.removeItem(`focusflow-motivation-${user.uid}`);
    }
  };

  const setBirthday = (date: Date | undefined) => {
    if (date) {
        setBirthdayState(format(date, 'yyyy-MM-dd'));
    } else {
        setBirthdayState(null);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    habits,
    setHabits,
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
    getTodaysMotivation,
    clearTodaysMotivation,
    birthday,
    setBirthday,
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
