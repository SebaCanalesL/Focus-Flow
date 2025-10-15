'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReorderableCardProps {
  id: string;
  children: React.ReactNode;
}

export function ReorderableCard({ id, children }: ReorderableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50 shadow-lg"
      )}
    >
      {/* Drag handle - positioned in bottom-left corner, avoiding card icons and buttons */}
      <div
        className={cn(
          "absolute bottom-2 left-2 z-10",
          "opacity-90 hover:opacity-100 active:opacity-100 transition-opacity duration-200",
          "cursor-grab active:cursor-grabbing",
          "p-2.5 rounded-lg hover:bg-muted/70 active:bg-muted/80",
          "flex items-center justify-center",
          "border border-muted-foreground/40 hover:border-muted-foreground/60 active:border-primary/50",
          "bg-background/95 backdrop-blur-sm shadow-md",
          "touch-manipulation select-none", // Improves touch interaction on mobile
          "min-w-[40px] min-h-[40px]", // Ensures adequate touch target size
          "ring-0 hover:ring-2 hover:ring-primary/20 active:ring-2 active:ring-primary/30" // Visual feedback
        )}
        {...attributes}
        {...listeners}
        title="Arrastra para reordenar"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
      </div>
      
      {/* Card content */}
      <div className="relative">
        {children}
      </div>
      
      {/* Drag overlay hint */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 pointer-events-none" />
      )}
    </div>
  );
}
