'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  updateDoc, 
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  FieldValue
} from 'firebase/firestore';
import type { Habit, GratitudeEntry } from '@/lib/types';
import { format, subDays, differenceInCalendarDays, parseISO, startOfWeek, endOfWeek, isWithinInterval, getWeek } from 'date-fns';
import { dailyMotivation } from '@/ai/flows/daily-motivation-flow';
import { ensureUserSeed } from '@/lib/onboard';
import { dayKey, toZoned } from '@/lib/dates';
import { useFCM } from '@/hooks/use-fcm';


interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  gratitudeEntries: GratitudeEntry[];
  addHabit: (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'order'>) => Promise<void>;
  updateHabit: (habitId: string, habitData: { [key: string]: string | number | boolean | string[] | FieldValue }) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  getHabitById: (habitId: string) => Habit | undefined;
  getStreak: (habit: Habit) => number;
  addGratitudeEntry: (content: string, date: Date, note?: string) => void;
  getGratitudeEntry: (date: Date) => GratitudeEntry | undefined;
  isClient: boolean;
  getWeekCompletion: (habit: Habit) => { completed: number; total: number };
  todaysMotivation: string | null;
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
  const [isClient, setIsClient] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState<MotivationalMessage | null>(null);
  const [birthday, setBirthdayState] = useState<string | null>(null);
  
  // Initialize FCM
  const { token: fcmToken, isSupported: fcmSupported } = useFCM();

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
    if (isClient && user && user.uid) {
        ensureUserSeed(user.uid, {
          displayName: user.displayName ?? undefined,
          email: user.email ?? undefined,
          photoURL: user.photoURL ?? undefined,
        });

        const habitsQuery = query(collection(db, `users/${user.uid}/habits`), orderBy("order", "asc"));
        const gratitudeQuery = query(collection(db, `users/${user.uid}/gratitudeEntries`), orderBy("createdAt", "desc"));
        const userDocRef = doc(db, `users/${user.uid}`);

        const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
            const serverHabits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
            setHabits(serverHabits);
        });
        
        const unsubscribeGratitude = onSnapshot(gratitudeQuery, (snapshot) => {
            const serverEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GratitudeEntry));
            setGratitudeEntries(serverEntries);
        });

        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setBirthdayState(data.birthday || null);
            }
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
            unsubscribeHabits();
            unsubscribeGratitude();
            unsubscribeUser();
        };
    }
  }, [isClient, user]);

  // New useEffect for calling getTodaysMotivation when user changes
  useEffect(() => {
    if (isClient && user && user.uid) {
      getTodaysMotivation(user.displayName || 'amigo');
    }
  }, [isClient, user, getTodaysMotivation]); // getTodaysMotivation is stable due to useCallback

  useEffect(() => {
    if (!user || !user.uid) return;

    const gratitudeHabit = habits.find(h => h.id === 'gratitude-habit');
    if (gratitudeHabit) {
        const gratitudeDates = new Set(gratitudeEntries.map(e => e.dateKey));
        const newCompletedDates = Array.from(gratitudeDates).sort();

        if (JSON.stringify(gratitudeHabit.completedDates) !== JSON.stringify(newCompletedDates)) {
            const habitDocRef = doc(db, `users/${user.uid}/habits`, 'gratitude-habit');
            updateDoc(habitDocRef, { completedDates: newCompletedDates });
        }
    }
  }, [gratitudeEntries, habits, user]);

  useEffect(() => {
    if (isClient && user && user.uid && motivationalMessage) {
      localStorage.setItem(`focusflow-motivation-${user.uid}`, JSON.stringify(motivationalMessage));
    }
  }, [motivationalMessage, isClient, user]);

  // Save FCM token to user profile
  useEffect(() => {
    if (fcmToken && user && user.uid) {
      const userDocRef = doc(db, 'users', user.uid);
      updateDoc(userDocRef, {
        fcmToken: fcmToken,
        fcmTokenUpdatedAt: serverTimestamp()
      }).catch((error) => {
        console.error('Error saving FCM token:', error);
      });
    }
  }, [fcmToken, user]);
  
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
      // Map day of week to our reminder format (L, M, X, J, V, S, D)
      const dayMap = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
      const currentDay = dayMap[now.getDay()];
      
      habits.forEach(habit => {
        // Check new reminders system first
        if (habit.reminders && habit.reminders.length > 0) {
          habit.reminders.forEach(reminder => {
            if (
              reminder.enabled &&
              reminder.day === currentDay &&
              reminder.time === currentTime &&
              !habit.completedDates.includes(todayString)
            ) {
              new Notification('¡Es hora de tu hábito!', {
                body: `No te olvides de completar: "${habit.name}"`,
                icon: '/logo.png' 
              });
            }
          });
        } else if (
          // Fallback to deprecated system for backward compatibility
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


  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'order'>) => {
    if (!user || !user.uid) return;
    const habitsCollectionRef = collection(db, `users/${user.uid}/habits`);
    
    const newHabit: Omit<Habit, 'id'> = {
      createdAt: new Date().toISOString(),
      completedDates: [],
      order: habits.length,
      ...habitData,
    };
    await addDoc(habitsCollectionRef, newHabit);
  };

  const updateHabit = async (habitId: string, habitData: { [key: string]: string | number | boolean | string[] | FieldValue }) => {
    if (!user || !user.uid) return;
    const habitDocRef = doc(db, `users/${user.uid}/habits`, habitId);
    await updateDoc(habitDocRef, habitData);
  };
  
  const deleteHabit = async (habitId: string) => {
    if (!user || !user.uid) return;
    const habitDocRef = doc(db, `users/${user.uid}/habits`, habitId);
    await deleteDoc(habitDocRef);
  }

  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    if (!user || !user.uid || habitId === 'gratitude-habit') return;
  
    const dateString = format(date, 'yyyy-MM-dd');
    const originalHabits = habits;
    let updatedHabit: Habit | undefined;
  
    // Optimistic UI update
    setHabits(prevHabits => {
      return prevHabits.map(h => {
        if (h.id === habitId) {
          const completed = h.completedDates.includes(dateString);
          const newCompletedDates = completed
            ? h.completedDates.filter(d => d !== dateString)
            : [...h.completedDates, dateString].sort();
          
          updatedHabit = { ...h, completedDates: newCompletedDates };
          return updatedHabit;
        }
        return h;
      });
    });
  
    // Firestore update
    try {
      if (updatedHabit) {
        const habitDocRef = doc(db, `users/${user.uid}/habits`, habitId);
        await updateDoc(habitDocRef, { completedDates: updatedHabit.completedDates });
      }
    } catch (error) {
      console.error("Failed to toggle habit completion:", error);
      // Revert on error
      setHabits(originalHabits);
    }
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

        const currentWeek = getWeek(today, weekOption);
        const lastWeek = getWeek(subDays(today, 7), weekOption);
        
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
    if(!user || !user.uid) return;
    const key = dayKey(toZoned(date));
    const gratitudeCollectionRef = collection(db, `users/${user.uid}/gratitudeEntries`);
    const q = query(gratitudeCollectionRef, where("dateKey", "==", key));
    
    const querySnapshot = await getDocs(q);
    
    const dataToSave = {
      content,
      note,
      dateKey: key,
      createdAt: serverTimestamp()
    }

    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      const docRef = doc(db, `users/${user.uid}/gratitudeEntries`, docId);
      const { content, note, dateKey } = dataToSave;
      const dataToUpdate = { content, note, dateKey };
      await updateDoc(docRef, dataToUpdate);
    } else {
      await addDoc(gratitudeCollectionRef, dataToSave);
    }
  };

  const getGratitudeEntry = (date: Date) => {
    const key = dayKey(toZoned(date));
    return gratitudeEntries.find(entry => entry.dateKey === key);
  };


  const clearTodaysMotivation = () => {
    setMotivationalMessage(null);
    if(user && user.uid){
        localStorage.removeItem(`focusflow-motivation-${user.uid}`);
    }
  };

  const setBirthday = async (date: Date | undefined) => {
    if (!user || !user.uid) return;
    const userDocRef = doc(db, `users/${user.uid}`);
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
    todaysMotivation: motivationalMessage?.quote || null,
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
