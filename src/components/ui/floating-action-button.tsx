'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Target, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onCreateHabit?: () => void;
  onCreateRoutine?: () => void;
  className?: string;
}

export function FloatingActionButton({ 
  onCreateHabit, 
  onCreateRoutine, 
  className 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("fixed bottom-20 right-4 flex flex-col-reverse gap-2", className)}>
      {/* Opciones desplegables */}
      {isOpen && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <Button
            onClick={() => {
              onCreateRoutine?.();
              setIsOpen(false);
            }}
            className="h-auto px-4 py-2 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Crear rutina
          </Button>
          <Button
            onClick={() => {
              onCreateHabit?.();
              setIsOpen(false);
            }}
            className="h-auto px-4 py-2 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
          >
            <Target className="h-4 w-4 mr-2" />
            Crear hábito
          </Button>
        </div>
      )}
      
      {/* Botón principal */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 w-12 rounded-full shadow-lg transition-transform duration-200",
          isOpen && "rotate-45"
        )}
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
