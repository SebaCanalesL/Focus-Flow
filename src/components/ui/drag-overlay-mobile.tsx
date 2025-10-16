'use client';

import React from 'react';
import { DragOverlay as DndDragOverlay } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DragOverlayMobileProps {
  children: React.ReactNode;
  className?: string;
}

export function DragOverlayMobile({ children, className }: DragOverlayMobileProps) {
  return (
    <DndDragOverlay
      className={cn(
        "z-50",
        // Mejoras visuales para móviles
        "transform-gpu", // Acelera las transformaciones
        "will-change-transform", // Optimiza para animaciones
        "backdrop-blur-sm", // Efecto de desenfoque
        "shadow-2xl", // Sombra más pronunciada
        "border-2 border-primary/50", // Borde destacado
        "rounded-lg", // Bordes redondeados
        "opacity-95", // Ligeramente transparente
        className
      )}
      dropAnimation={{
        duration: 200, // Animación más rápida
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Curva suave
      }}
    >
      {children}
    </DndDragOverlay>
  );
}
