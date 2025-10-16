import { useSensors, useSensor, PointerSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useIsMobile } from './use-mobile';

/**
 * Hook personalizado para configuración consistente de sensores de drag and drop
 * optimizado para aplicaciones móvil-first
 */
export function useDragSensors() {
  const isMobile = useIsMobile();
  
  return useSensors(
    // PointerSensor para mouse y stylus
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 3 : 5, // Más reducido en móvil
        delay: isMobile ? 30 : 50, // Más rápido en móvil
        tolerance: isMobile ? 2 : 3, // Más preciso en móvil
      },
    }),
    // TouchSensor para interacciones táctiles nativas
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: isMobile ? 2 : 3, // Muy reducido para touch en móvil
        delay: isMobile ? 20 : 30, // Touch muy rápido en móvil
        tolerance: isMobile ? 1 : 2, // Tolerancia mínima en móvil
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
export function useDragSensorsWithDelay(pointerDelay: number = 50, touchDelay: number = 30) {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: pointerDelay,
        tolerance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 3,
        delay: touchDelay,
        tolerance: 2,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
}

/**
 * Hook para configuración de sensores ultra-optimizada para móviles
 * Con feedback visual mejorado y detección de gestos
 */
export function useMobileDragSensors() {
  const isMobile = useIsMobile();
  
  return useSensors(
    // PointerSensor optimizado para móvil
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2, // Mínima distancia para activación
        delay: 20, // Delay muy corto
        tolerance: 1, // Máxima precisión
      },
    }),
    // TouchSensor ultra-optimizado
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 1, // Distancia mínima absoluta
        delay: 10, // Delay mínimo para touch
        tolerance: 0, // Sin tolerancia para máxima precisión
      },
    }),
    // KeyboardSensor para accesibilidad
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
}
