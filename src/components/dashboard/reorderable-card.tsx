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
      data-testid="reorderable-card"
    >
      {/* Drag handle - positioned in top-left corner, to the left of title icon */}
      <div
        className={cn(
          "absolute top-2 left-2 z-10",
          "opacity-90 hover:opacity-100 active:opacity-100 transition-opacity duration-200",
          "cursor-grab active:cursor-grabbing",
          "p-3 rounded-lg hover:bg-muted/70 active:bg-muted/80", // Increased padding for better touch target
          "flex items-center justify-center",
          "border border-muted-foreground/40 hover:border-muted-foreground/60 active:border-primary/50",
          "bg-background/95 backdrop-blur-sm shadow-md",
          "touch-manipulation select-none", // Improves touch interaction on mobile
          "min-w-[44px] min-h-[44px]", // Increased size for better touch target (44px minimum)
          "ring-0 hover:ring-2 hover:ring-primary/20 active:ring-2 active:ring-primary/30", // Visual feedback
          "transition-all duration-200 ease-in-out", // Smooth transitions
          "scale-100 hover:scale-105 active:scale-95", // Subtle scale feedback for mobile
          "touch-action-none" // Prevent default touch behaviors
        )}
        {...attributes}
        {...listeners}
        title="Arrastra para reordenar"
        role="button"
        aria-label="Arrastra para reordenar"
        tabIndex={0}
        onTouchStart={(e) => {
          // Prevent scrolling during drag
          e.preventDefault();
        }}
        onTouchMove={(e) => {
          // Prevent scrolling during drag
          e.preventDefault();
        }}
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
