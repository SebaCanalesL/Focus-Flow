'use client';

import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

const filters = ['Todas', 'Partir el día', 'Terminar el día'];

const routines = [
  {
    title: 'Mañana Energizada',
    category: 'Partir el día',
    imageUrl: '/routines/routine-morning-energized.png',
    description:
      'Comienza tu día con energía y positividad. Esta rutina está diseñada para despertar tu cuerpo y mente, preparándote para un día productivo y lleno de vitalidad. Incluye estiramientos suaves, meditación y un desayuno saludable.',
  },
];

function RoutineCard({ routine }: { routine: (typeof routines)[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden rounded-lg">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        <div className="relative w-full aspect-square">
          <Image
            src={routine.imageUrl}
            alt={routine.title}
            fill
            className="object-contain"
          />
        </div>
      </div>
      {isOpen && (
        <CardContent className="pt-4">
          <p className="text-muted-foreground mb-4">{routine.description}</p>
          <Button className="w-full">+ Agregar a mi rutina</Button>
        </CardContent>
      )}
    </Card>
  );
}

export default function RoutinesPage() {
  const [selectedFilter, setSelectedFilter] = useState('Todas');

  const filteredRoutines = routines.filter(
    (routine) =>
      selectedFilter === 'Todas' || routine.category === selectedFilter
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Rutinas</h1>
        <Link
          href="/routines/create"
          className={cn(buttonVariants({ size: 'sm' }))}
        >
          Crear Rutina
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={cn(
              buttonVariants({
                variant: selectedFilter === filter ? 'default' : 'outline',
                size: 'sm',
              }),
              'rounded-full px-4'
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {filteredRoutines.map((routine) => (
          <RoutineCard key={routine.title} routine={routine} />
        ))}
      </div>
    </div>
  );
}
