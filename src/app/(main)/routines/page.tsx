'use client';

import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CreateRoutineDialog,
  routineSteps,
} from '@/components/routines/create-routine-dialog';
import { PerformRoutineSheet } from '@/components/routines/perform-routine-sheet';
import { Routine } from '@/lib/types';
import { useAppData } from '@/contexts/app-provider';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const filters = ['Mis rutinas', 'Todas', 'Partir el día', 'Terminar el día'];

const defaultRoutines: Routine[] = [
  {
    id: 'default-1',
    title: 'Mañana Energizada',
    category: 'Partir el día',
    imageUrl: '/routines/routine-morning-energized.png',
    description:
      '🌞 Rutina de Mañana Energizada\n\n¿Te ha pasado que algunos días comienzan con claridad y energía ✨ y otros parecen arrastrarse desde el primer minuto 😩?\n\nLa diferencia, muchas veces, está en cómo decidimos vivir nuestras primeras horas del día.\n\n🌱 La ciencia detrás de una buena mañana\n\nLos hábitos que cultivas en la mañana impactan directamente en tu nivel de energía ⚡, en tu concentración 🎯 y en el ánimo 💛 que te acompaña todo el día.\n\nLo mejor es que no necesitas grandes cambios ni horas extras ⏱️. Con acciones simples y bien diseñadas puedes transformar tu mañana en un motor de bienestar.\n\n💡 ¿Por qué importa una rutina de mañana?\n\nAl despertar, tu cuerpo y tu mente están más receptivos 🌅. Es el momento en que:\n* Se regula tu reloj biológico 🕰️\n* Se activa tu metabolismo 🔥\n* Tu cerebro prepara el tono emocional 🎶 del día\n\nSi aprovechas esa ventana con pequeños hábitos saludables, mejoras tu vitalidad y tu capacidad de enfocarte en lo importante.\n\n🔑 Claves para una mañana energizada\n\n☀️ Luz natural: sincroniza tu cuerpo con el día y mejora tu ánimo\n\n💧 Hidratación: despierta tu metabolismo y tu mente\n\n🤸 Movimiento ligero: activa la circulación y multiplica tu energía\n\n🧘 Mindfulness: calma el estrés y aclara tu mente\n\n🥑 Desayuno balanceado: el mejor combustible para tu cuerpo\n\n📝 Objetivos claros: evitan la dispersión y aumentan tu productividad\n\n✨ El beneficio real\n\nNo se trata solo de sentirte más despierto, sino de crear un hábito que mejore tu vida día a día 🌟.\n\nCon el tiempo notarás que:\n* Estás más presente en tus mañanas 🌄\n* Tienes más control sobre tu tiempo ⏳\n* Tu energía se refleja en todo lo que haces 💪\n\nY lo mejor: esta rutina no es rígida. Es un marco flexible que puedes adaptar según tu estilo de vida.\n\n🚀 ¿Qué sigue?\n\nAhora que sabes la importancia de una mañana energizada, es momento de pasar a la acción.\n\nEn la siguiente pantalla encontrarás una propuesta de pasos simples y prácticos, basados en evidencia científica, que podrás personalizar y transformar en tu propia rutina diaria.\n\nPorque cada mañana es una nueva oportunidad para llenar tu vida de energía, propósito y vitalidad 🌞💛.',
  },
];

function RoutineCard({
  routine,
  onSave,
  onDelete,
  isUserRoutine,
}: {
  routine: Routine;
  onSave: (newRoutine: Partial<Routine>) => void;
  onDelete?: (routineId: string) => void;
  isUserRoutine: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const renderDescription = () => {
    if (isUserRoutine) {
      const allSteps: Array<{ id: string; title: string }> = [];
      
      // Add predefined steps
      if (routine.stepIds) {
        routine.stepIds.forEach((stepId: string) => {
          const predefinedStep = routineSteps.find((s) => s.id === stepId);
          if (predefinedStep) {
            allSteps.push({
              id: predefinedStep.id,
              title: predefinedStep.title.split(' (')[0]
            });
          }
        });
      }
      
      // Add custom steps
      if (routine.customSteps) {
        routine.customSteps.forEach((customStep) => {
          allSteps.push({
            id: customStep.id,
            title: customStep.title
          });
        });
      }

      // Get active reminders
      const activeReminders = routine.reminders?.filter(r => r.enabled) || [];
      const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
      const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

      if (allSteps.length === 0) {
        return <p>Esta rutina no tiene pasos. ¡Edítala para agregarle!</p>;
      }
      
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            {allSteps.map((step) => (
              <p key={step.id} className="text-sm">{step.title}</p>
            ))}
          </div>
          
          {activeReminders.length > 0 && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground">🔔 Recordatorios activos:</span>
              </div>
              <div className="space-y-1">
                {activeReminders.map((reminder) => {
                  const dayIndex = weekDays.indexOf(reminder.day);
                  const dayName = dayIndex !== -1 ? dayNames[dayIndex] : reminder.day;
                  return (
                    <p key={reminder.id} className="text-xs text-muted-foreground">
                      {dayName} a las {reminder.time}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (routine.description || '').split('\n\n').map((paragraph: string, pIndex: number) => (
        <div key={pIndex} className="space-y-1">
          {paragraph.split('\n').map((line: string, lIndex: number) => {
            if (line.trim() === '') return null;
            if (line.trim().startsWith('* ')) {
              return (
                <div key={lIndex} className="flex items-start pl-4">
                  <span className="mr-2 mt-1">∙</span>
                  <span>{line.trim().substring(2)}</span>
                </div>
              );
            }
            const isKey = /^[☀️💧🤸🧘🥑📝]/.test(line);
            if (isKey && line.includes(':')) {
              const parts = line.split(':');
              const keyTitle = parts[0] + ':';
              const keyDescription = parts.slice(1).join(':').trim();
              return (
                <p key={lIndex}>
                  <span className="font-bold text-primary">{keyTitle}</span>
                  <span className="text-muted-foreground">{` ${keyDescription}`}</span>
                </p>
              );
            }
            const isMainTitle = /^[🌞🌱💡🔑✨🚀]/.test(line);
            if (isMainTitle) {
              return (
                <p key={lIndex} className="font-bold text-primary">
                  {line}
                </p>
              );
            }
            return <p key={lIndex}>{line}</p>;
          })}
        </div>
      ));
    }
  };

  return (
    <Card className="overflow-hidden rounded-lg">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        <div className="relative w-full h-32">
          <Image
            src={routine.imageUrl}
            alt={routine.title}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      {isOpen && (
        <CardContent className="pt-4">
          <div className="text-muted-foreground mb-4 space-y-4">
            {renderDescription()}
          </div>
          {isUserRoutine ? (
            <div className="flex items-center gap-2">
              <CreateRoutineDialog onSave={onSave} onDelete={onDelete} routineToEdit={routine}>
                <Button variant="outline" className="w-full">
                  Editar
                </Button>
              </CreateRoutineDialog>
              <PerformRoutineSheet routine={routine}>
                <Button className="w-full">Realizar rutina</Button>
              </PerformRoutineSheet>
            </div>
          ) : (
            <CreateRoutineDialog onSave={onSave}>
              <Button className="w-full">+ Agregar a mi rutina</Button>
            </CreateRoutineDialog>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Función para limpiar datos antes de enviar a Firestore
function cleanRoutineData(data: any): any {
  const cleaned = { ...data };
  
  // Eliminar el campo 'id' si existe
  delete cleaned.id;
  
  // Recursivamente limpiar campos undefined
  function cleanObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return undefined;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(cleanObject).filter(item => item !== undefined);
    }
    
    if (typeof obj === 'object') {
      const cleanedObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = cleanObject(value);
        if (cleanedValue !== undefined) {
          cleanedObj[key] = cleanedValue;
        }
      }
      return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined;
    }
    
    return obj;
  }
  
  return cleanObject(cleaned);
}

export default function RoutinesPage() {
  const { user } = useAppData();
  const [selectedFilter, setSelectedFilter] = useState('Todas');
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user routines from Firestore using real-time listener
  useEffect(() => {
    if (!user || !user.uid) {
      setUserRoutines([]);
      setIsLoading(false);
      return;
    }

    console.log('🔄 Setting up routines listener for user:', user.uid);
    const routinesQuery = query(collection(db, `users/${user.uid}/routines`), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(routinesQuery, (snapshot) => {
      const serverRoutines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Routine));
      console.log('🔄 Routines loaded from Firestore:', serverRoutines);
      setUserRoutines(serverRoutines);
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading routines:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveRoutine = async (newRoutine: Partial<Routine>) => {
    if (!user || !user.uid) {
      console.error('User not authenticated');
      return;
    }

    try {
      if (newRoutine.id) {
        // Update existing routine
        console.log('✏️ Updating routine:', newRoutine.id, 'with data:', newRoutine);
        
        const routineDocRef = doc(db, `users/${user.uid}/routines`, newRoutine.id);
        
        // Limpiar datos usando la función robusta
        const cleanedData = cleanRoutineData(newRoutine);
        
        console.log('📝 Cleaned update data:', cleanedData);
        console.log('🔍 Custom steps in update:', cleanedData.customSteps);
        console.log('🔔 Reminders in update:', cleanedData.reminders);
        
        await updateDoc(routineDocRef, cleanedData);
        console.log('✅ Routine updated in Firestore');
      } else {
        // Create new routine
        console.log('➕ Creating new routine with data:', newRoutine);
        
        const routinesCollectionRef = collection(db, `users/${user.uid}/routines`);
        
        // Preparar datos para nueva rutina
        const newRoutineData = {
          createdAt: new Date().toISOString(),
          ...newRoutine,
        };
        
        // Limpiar datos usando la función robusta
        const cleanedData = cleanRoutineData(newRoutineData);
        
        console.log('📝 Cleaned routine data:', cleanedData);
        console.log('🔍 Custom steps:', cleanedData.customSteps);
        console.log('🔔 Reminders:', cleanedData.reminders);
        
        await addDoc(routinesCollectionRef, cleanedData);
        console.log('✅ Routine added to Firestore');
        
        // Switch to "Mis rutinas" to show the newly created routine
        setSelectedFilter('Mis rutinas');
      }
    } catch (error) {
      console.error('Error saving routine:', error);
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (!user || !user.uid) {
      console.error('User not authenticated');
      return;
    }

    try {
      console.log('🗑️ Deleting routine:', routineId);
      const routineDocRef = doc(db, `users/${user.uid}/routines`, routineId);
      await deleteDoc(routineDocRef);
      console.log('✅ Routine deleted from Firestore');
    } catch (error) {
      console.error('Error deleting routine:', error);
    }
  };

  const routinesToShow = (() => {
    if (selectedFilter === 'Mis rutinas') {
      return userRoutines;
    }
    if (selectedFilter === 'Todas') {
      return defaultRoutines;
    }
    return defaultRoutines.filter(
      (routine) => routine.category === selectedFilter
    );
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Rutinas</h1>
        <CreateRoutineDialog onSave={handleSaveRoutine}>
          <div className={cn(buttonVariants({ size: 'sm' }), "cursor-pointer")}>
            Crear Rutina
          </div>
        </CreateRoutineDialog>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={cn(
              buttonVariants({
                variant: selectedFilter === filter ? 'default' : 'outline',
                size: 'sm',
              }),
              'rounded-full px-4 whitespace-nowrap'
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {isLoading && selectedFilter === 'Mis rutinas' ? (
          <p className="text-muted-foreground col-span-full text-center">
            Cargando rutinas...
          </p>
        ) : routinesToShow.length > 0 ? (
          routinesToShow.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onSave={handleSaveRoutine}
              onDelete={selectedFilter === 'Mis rutinas' ? handleDeleteRoutine : undefined}
              isUserRoutine={selectedFilter === 'Mis rutinas'}
            />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full text-center">
            {selectedFilter === 'Mis rutinas'
              ? "Aún no has creado ninguna rutina. ¡Crea una para empezar!"
              : "No se encontraron rutinas para este filtro."}
          </p>
        )}
      </div>
    </div>
  );
}
