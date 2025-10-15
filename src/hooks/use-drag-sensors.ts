import { useSensors, useSensor, PointerSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/**
 * Hook personalizado para configuración consistente de sensores de drag and drop
 * optimizado para aplicaciones móvil-first
 */
export function useDragSensors() {
  return useSensors(
    // PointerSensor para mouse y stylus
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Distancia mínima antes de activar drag
        delay: 100, // Delay reducido para mejor respuesta en móvil
        tolerance: 5, // Tolerancia para movimientos accidentales
      },
    }),
    // TouchSensor para interacciones táctiles nativas
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
        delay: 80, // Touch más rápido que pointer para mejor UX móvil
        tolerance: 5,
      },
    }),
    // KeyboardSensor para accesibilidad
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
}

/**
 * Hook para configuración de sensores con delay personalizado
 * Útil para casos donde se necesita un delay específico
 */
export function useDragSensorsWithDelay(pointerDelay: number = 100, touchDelay: number = 80) {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: pointerDelay,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
        delay: touchDelay,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
}
