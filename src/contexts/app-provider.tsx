
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; 
import {
  collection,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import type { Habit, GratitudeEntry } from '@/lib/types';
import { ensureUserSeed } from '@/lib/onboard';
import {
  format,
  subDays,
  differenceInCalendarDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  getWeek,
} from 'date-fns';
import { dailyMotivation } from '@/ai/flows/daily-motivation-flow';
import {
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion as dbToggleHabit,
} from '@/lib/db/habits';
import {
  createGratitude,
  updateGratitude,
  listGratitudesByDate,
} from '@/lib/db/gratitudes';
import { updateUser } from '@/lib/db/users';

interface AppContextType {
  user: User | null;
  loading: boolean;
  ready: boolean;
  habits: Habit[];
  gratitudeEntries: GratitudeEntry[];
  addHabit: (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>) => void;
  updateHabit: (habitId: string, habitData: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  getHabitById: (habitId: string) => Habit | undefined;
  getStreak: (habit: Habit) => number;
  addGratitudeEntry: (content: string, date: Date, note?: string) => void;
  getGratitudeEntry: (date: Date) => GratitudeEntry | undefined;
  getWeekCompletion: (habit: Habit) => { completed: number; total: number };
  getTodaysMotivation: (userName: string) => Promise<string>;
  clearTodaysMotivation: () => void;
  birthday: string | null;
  setBirthday: (date: Date | undefined) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface MotivationalMessage {
  quote: string;
  date: string;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState<MotivationalMessage | null>(
    null
  );
  const [birthday, setBirthdayState] = useState<string | null>(null);

  // Step 1: Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setLoading(true);
        setReady(false);
        setHabits([]);
        setGratitudeEntries([]);

        if (user) {
            setUser(user);
        } else {
            setUser(null);
            setLoading(false);
            setReady(true);
        }
    });
    return () => unsubscribe();
  }, []);

  // Step 2: Seed user and set up data listeners when user is authenticated
  useEffect(() => {
      if (user) {
          let cancelled = false;
          const TIMEOUT_MS = 10_000;

          (async () => {
              const timer = setTimeout(() => {
                  if (!cancelled) {
                      console.warn('Seed timeout, habilitando UI en modo degradado');
                      setReady(true);
                      setLoading(false);
                  }
              }, TIMEOUT_MS);

              try {
                  await ensureUserSeed(user.uid, {
                      email: user.email || undefined,
                      displayName: user.displayName || undefined,
                      photoURL: user.photoURL || undefined,
                  });
              } catch (e) {
                  console.error('ensureUserSeed failed', e);
              } finally {
                  clearTimeout(timer);
                  if (!cancelled) {
                      setReady(true);
                      setLoading(false);
                  }
              }
          })();

          const habitsCollectionRef = collection(db, `users/${user.uid}/habits`);
          const gratitudeCollectionRef = collection(db, `users/${user.uid}/gratitudeEntries`);
          const userDocRef = doc(db, `users/${user.uid}`);

          const unsubscribeHabits = onSnapshot(habitsCollectionRef, (snapshot) => {
              if (cancelled) return;
              const serverHabits = snapshot.docs.map(
                  (doc) => ({ id: doc.id, ...doc.data() } as Habit)
              );
              setHabits(serverHabits);
          });

          const unsubscribeGratitude = onSnapshot(gratitudeCollectionRef, (snapshot) => {
              if (cancelled) return;
              const serverEntries = snapshot.docs.map(
                  (doc) => ({ id: doc.id, ...doc.data() } as GratitudeEntry)
              );
              setGratitudeEntries(serverEntries);
          });

          const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
              if (cancelled || !doc.exists()) return;
              const data = doc.data();
              setBirthdayState(data.birthday || null);
          });

          try {
              const motivationStr = localStorage.getItem(`focusflow-motivation-${user.uid}`);
              if (motivationStr) {
                  setMotivationalMessage(JSON.parse(motivationStr));
              }
          } catch (e) {
              console.error("Failed to parse motivation from localStorage", e);
          }

          return () => {
              cancelled = true;
              unsubscribeHabits();
              unsubscribeGratitude();
              unsubscribeUser();
          };
      }
  }, [user]);
  
    useEffect(() => {
    if (user && motivationalMessage) {
      localStorage.setItem(`focusflow-motivation-${user.uid}`, JSON.stringify(motivationalMessage));
    }
  }, [motivationalMessage, user]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') return;

      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const todayString = format(now, 'yyyy-MM-dd');

      habits.forEach(habit => {
        if (
          habit.reminderEnabled &&
          habit.reminderTime === currentTime &&
          !habit.completedDates.includes(todayString)
        ) {
          new Notification('¡Es hora de tu hábito!', {
            body: `No te olvides de completar: "${habit.name}"`,
            icon: '/logo.png'
          });
        }
      });
    }, 60000);

    return () => clearInterval(intervalId);
  }, [habits]);

  const handleAddHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    if (!user) return;
    await createHabit(user.uid, habitData);
  };

  const handleUpdateHabit = async (habitId: string, habitData: Partial<Omit<Habit, 'id' | 'icon' | 'createdAt' | 'completedDates'>>) => {
    if (!user) return;
    await updateHabit(user.uid, habitId, habitData);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return;
    await deleteHabit(user.uid, habitId);
  };

  const handleToggleHabitCompletion = async (habitId: string, date: Date) => {
    if (!user) return;
    await dbToggleHabit(user.uid, habitId, date, habits);
  };

  const getHabitById = (habitId: string) => {
    return habits.find(h => h.id === habitId);
  };

 const getStreak = (habit: Habit) => {
    if (!habit || habit.completedDates.length === 0) return 0;
    
    const sortedDates = habit.completedDates.map(d => parseISO(d)).sort((a,b) => b.getTime() - a.getTime());

    if (habit.frequency === 'daily') {
        const today = new Date();
        const mostRecentDate = sortedDates[0];
        
        if (differenceInCalendarDays(today, mostRecentDate) > 1) {
            return 0;
        }

        let streak = 0;
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

  const addGratitudeEntry = async (content: string, date: Date, note?: string) => {
    if(!user) return;
    const dateString = format(date, 'yyyy-MM-dd');
    const gratitudes = await listGratitudesByDate(user.uid, dateString);
    const entryData = { content, note, date: dateString };
  
    if (gratitudes.length > 0) {
      const docId = gratitudes[0].id;
      await updateGratitude(user.uid, docId, { content, note });
    } else {
      await createGratitude(user.uid, { content, note, date: dateString });
    }
    
    if (content.trim().length > 0) {
      const habit = habits.find(h => h.id === 'gratitude-habit');
      if (habit && !habit.completedDates.includes(dateString)) {
         await handleToggleHabitCompletion('gratitude-habit', date);
      }
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

  const setBirthday = async (date: Date | undefined) => {
    if (!user) return;
    const birthdayString = date ? format(date, 'yyyy-MM-dd') : null;
    await updateUser(user.uid, { birthday: birthdayString });
    setBirthdayState(birthdayString);
  };


  const value = {
    user,
    loading,
    ready,
    habits,
    gratitudeEntries,
    addHabit: handleAddHabit,
    updateHabit: handleUpdateHabit,
    deleteHabit: handleDeleteHabit,
    toggleHabitCompletion: handleToggleHabitCompletion,
    getHabitById,
    getStreak,
    addGratitudeEntry,
    getGratitudeEntry,
    getWeekCompletion,
    getTodaysMotivation,
    clearTodaysMotivation,
    birthday,
    setBirthday,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppProvider');
  }
  return context;
}
