
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  updateDoc, 
  writeBatch,
  getDocs,
  query,
  where,
  documentId
} from 'firebase/firestore';
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
  updateHabit: (habitId: string, habitData: Partial<Omit<Habit, 'id' | 'icon' | 'createdAt' | 'completedDates'>>) => void;
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
        const habitsCollectionRef = collection(firestore, `users/${user.uid}/habits`);
        const gratitudeCollectionRef = collection(firestore, `users/${user.uid}/gratitudeEntries`);
        const userDocRef = doc(firestore, `users/${user.uid}`);

        const unsubscribeHabits = onSnapshot(habitsCollectionRef, async (snapshot) => {
            if (snapshot.empty) {
                // First time user, create initial habits
                const batch = writeBatch(firestore);
                INITIAL_HABITS.forEach(habit => {
                    const newHabitRef = doc(habitsCollectionRef, habit.id);
                    batch.set(newHabitRef, habit);
                });
                await batch.commit();
            } else {
                const serverHabits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
                 // Manually handle gratitude habit completion dates
                const gratitudeHabit = serverHabits.find(h => h.id === 'gratitude-habit') || { ...gratitudeHabitTemplate };
                const gratitudeDates = new Set(gratitudeEntries.map(e => e.date));
                const existingDates = new Set(gratitudeHabit.completedDates);
                const newDates = Array.from(new Set([...Array.from(existingDates), ...Array.from(gratitudeDates)]));
                gratitudeHabit.completedDates = newDates.sort();
                
                const otherHabits = serverHabits.filter(h => h.id !== 'gratitude-habit');
                setHabits([gratitudeHabit, ...otherHabits]);
            }
        });
        
        const unsubscribeGratitude = onSnapshot(gratitudeCollectionRef, (snapshot) => {
            const serverEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GratitudeEntry));
            setGratitudeEntries(serverEntries);

            // Update gratitude habit completion dates when entries change
            setHabits(prevHabits => {
                const gratitudeHabit = prevHabits.find(h => h.id === 'gratitude-habit') || { ...gratitudeHabitTemplate };
                const gratitudeDates = new Set(serverEntries.map(e => e.date));
                const existingDates = new Set(gratitudeHabit.completedDates);
                const newDates = Array.from(new Set([...Array.from(existingDates), ...Array.from(gratitudeDates)]));
                gratitudeHabit.completedDates = newDates.sort();

                const otherHabits = prevHabits.filter(h => h.id !== 'gratitude-habit');
                return [gratitudeHabit, ...otherHabits];
            })
        });

        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setBirthdayState(data.birthday || null);
            }
        });
        
        // Local storage for motivation message (as it's device/day specific)
        try {
            const motivationStr = localStorage.getItem(`focusflow-motivation-${user.uid}`);
            if (motivationStr) {
                setMotivationalMessage(JSON.parse(motivationStr));
            }
        } catch (e) {
            console.error("Failed to parse motivation from localStorage", e);
        }

        return () => {
            unsubscribeHabits();
            unsubscribeGratitude();
            unsubscribeUser();
        };
    }
  }, [isClient, user]);


  useEffect(() => {
    if (isClient && user && motivationalMessage) {
      localStorage.setItem(`focusflow-motivation-${user.uid}`, JSON.stringify(motivationalMessage));
    }
  }, [motivationalMessage, isClient, user]);
  
   // Notifications logic
  useEffect(() => {
    if (!isClient) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const intervalId = setInterval(() => {
      if (Notification.permission !== 'granted') return;

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
  }, [isClient, habits]);


  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    if (!user) return;
    const habitsCollectionRef = collection(firestore, `users/${user.uid}/habits`);
    const newHabit: Omit<Habit, 'id'> = {
      createdAt: new Date().toISOString(),
      completedDates: [],
      ...habitData,
    };
    await addDoc(habitsCollectionRef, newHabit);
  };

  const updateHabit = async (habitId: string, habitData: Partial<Omit<Habit, 'id' | 'icon' | 'createdAt' | 'completedDates'>>) => {
    if (!user) return;
    const habitDocRef = doc(firestore, `users/${user.uid}/habits`, habitId);
    await updateDoc(habitDocRef, habitData);
  };
  
  const deleteHabit = async (habitId: string) => {
    if (!user) return;
    const habitDocRef = doc(firestore, `users/${user.uid}/habits`, habitId);
    await deleteDoc(habitDocRef);
  }

  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    if (!user) return;
    const dateString = format(date, 'yyyy-MM-dd');
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const completed = habit.completedDates.includes(dateString);
    const newCompletedDates = completed
      ? habit.completedDates.filter(d => d !== dateString)
      : [...habit.completedDates, dateString];
    
    const habitDocRef = doc(firestore, `users/${user.uid}/habits`, habitId);
    await updateDoc(habitDocRef, { completedDates: newCompletedDates.sort() });
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
    const gratitudeCollectionRef = collection(firestore, `users/${user.uid}/gratitudeEntries`);
    const q = query(gratitudeCollectionRef, where("date", "==", dateString));
    
    const querySnapshot = await getDocs(q);

    const entryData = { content, note, date: dateString };
  
    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      const docRef = doc(firestore, `users/${user.uid}/gratitudeEntries`, docId);
      await updateDoc(docRef, { content, note });
    } else {
      await addDoc(gratitudeCollectionRef, { content, note, date: dateString });
    }
    
    // Auto-complete gratitude habit if there is content
    if (content.trim().length > 0) {
      const habit = habits.find(h => h.id === 'gratitude-habit');
      if (habit && !habit.completedDates.includes(dateString)) {
         await toggleHabitCompletion('gratitude-habit', date);
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
    const userDocRef = doc(firestore, `users/${user.uid}`);
    const birthdayString = date ? format(date, 'yyyy-MM-dd') : null;
    await setDoc(userDocRef, { birthday: birthdayString }, { merge: true });
    setBirthdayState(birthdayString);
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
