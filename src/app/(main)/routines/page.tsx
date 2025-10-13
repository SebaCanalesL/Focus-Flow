'use client';

import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';
import {
  CreateRoutineDialog,
  routineSteps,
} from '@/components/routines/create-routine-dialog';
import { PerformRoutineSheet } from '@/components/routines/perform-routine-sheet';
import { Routine } from '@/lib/types';

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
  isUserRoutine,
}: {
  routine: Routine;
  onSave: (newRoutine: Partial<Routine>) => void;
  isUserRoutine: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const renderDescription = () => {
    if (isUserRoutine) {
      const stepsToDisplay = (routine.stepIds || [])
        .map((stepId: string) => routineSteps.find((s) => s.id === stepId))
        .filter(Boolean);

      if (stepsToDisplay.length === 0) {
        return <p>Esta rutina no tiene pasos. ¡Edítala para agregarle!</p>;
      }
      return (
        <div className="space-y-2">
          {stepsToDisplay.map((step) => (
            <p key={step!.id}>{step!.title.split(' (')[0]}</p>
          ))}
        </div>
      );
    } else {
      return routine.description.split('\n\n').map((paragraph: string, pIndex: number) => (
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
        <div className="relative w-full aspect-square">
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
              <CreateRoutineDialog onSave={onSave} routineToEdit={routine}>
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

export default function RoutinesPage() {
  const [selectedFilter, setSelectedFilter] = useState('Todas');
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);

  const handleSaveRoutine = (newRoutine: Partial<Routine>) => {
    if (newRoutine.id) {
      setUserRoutines((prev) =>
        prev.map((r) => (r.id === newRoutine.id ? { ...r, ...newRoutine } as Routine : r))
      );
    } else {
      const routineWithId = { ...newRoutine, id: `user-${Date.now()}` } as Routine;
      setUserRoutines((prev) => [...prev, routineWithId]);
    }
    setSelectedFilter('Mis rutinas');
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
        {routinesToShow.length > 0 ? (
          routinesToShow.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onSave={handleSaveRoutine}
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
