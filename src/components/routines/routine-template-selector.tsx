'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles, Moon, Dumbbell, Coffee, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Routine } from "@/lib/types";
import { CreateRoutineDialog } from "./create-routine-dialog";

// Predefined routine templates
export const routineTemplates = [
  {
    id: "morning-energized",
    title: "Rutina de Mañana Energizada",
    description: "Despierta con energía y propósito cada día",
    icon: Sparkles,
    color: "bg-gradient-to-br from-yellow-400 to-orange-500",
    imageUrl: "/routines/routine-morning-energized.png",
    steps: [
      {
        id: "step1",
        title: "☀️ Exposición a la luz natural",
        description: "Deja que la luz del sol despierte tu reloj interno. Te ayudará a sentirte más despierto, con mejor humor y mayor energía durante el día.",
        duration: "5–10 min",
      },
      {
        id: "step2", 
        title: "💧 Hidratación inmediata",
        description: "Un simple vaso de agua al despertar reactiva tu cuerpo después de horas de descanso y mejora tu concentración desde temprano.",
      },
      {
        id: "step3",
        title: "🤸 Movimiento ligero o estiramientos",
        description: "Activa tu circulación, libera tensión y dale a tu cuerpo una dosis de vitalidad. Aunque sean pocos minutos, tu energía se multiplicará.",
        duration: "5–15 min",
      },
      {
        id: "step4",
        title: "🧘 Respiración consciente o mindfulness",
        description: "Toma 5 minutos para conectar contigo mismo. La respiración consciente reduce el estrés y mejora tu enfoque para el día.",
        duration: "5 min",
      },
      {
        id: "step5",
        title: "🥑 Desayuno balanceado",
        description: "Dale combustible de calidad a tu cuerpo: proteína, fibra y grasas saludables que te mantendrán saciado y enfocado hasta la próxima comida.",
      },
      {
        id: "step6",
        title: "📝 Revisión breve de objetivos",
        description: "Visualiza tu día. Tener claras 1-3 prioridades no solo evita la procrastinación, también te da una sensación de control y logro desde el inicio.",
        duration: "2-3 min",
      },
    ]
  },
  {
    id: "evening-relaxing",
    title: "Rutina Nocturna Relajante",
    description: "Cierra el día de manera tranquila y prepara tu descanso",
    icon: Moon,
    color: "bg-gradient-to-br from-purple-500 to-indigo-600",
    imageUrl: "/routines/routine-morning-energized.png",
    steps: [
      {
        id: "step7",
        title: "📝 Reflexión del día",
        description: "Toma 5 minutos para revisar cómo fue tu día y qué aprendiste.",
        duration: "5 min",
      },
      {
        id: "step8",
        title: "🧘 Meditación o respiración profunda",
        description: "Relaja tu mente y prepara tu cuerpo para el descanso.",
        duration: "10 min",
      },
      {
        id: "step9",
        title: "📚 Lectura ligera",
        description: "Lee algo que te guste para desconectar del día.",
        duration: "15 min",
      },
      {
        id: "step10",
        title: "💤 Preparación para dormir",
        description: "Aplica tu rutina de cuidado personal nocturna.",
      },
    ]
  },
  {
    id: "workout-focus",
    title: "Rutina de Ejercicio",
    description: "Mantente activo y en forma con esta rutina completa",
    icon: Dumbbell,
    color: "bg-gradient-to-br from-green-500 to-teal-600",
    imageUrl: "/routines/routine-morning-energized.png",
    steps: [
      {
        id: "step11",
        title: "🔥 Calentamiento",
        description: "Prepara tu cuerpo con movimientos dinámicos.",
        duration: "5–10 min",
      },
      {
        id: "step12",
        title: "💪 Ejercicio principal",
        description: "Realiza tu rutina de ejercicio preferida.",
        duration: "20–45 min",
      },
      {
        id: "step13",
        title: "🧘 Enfriamiento y estiramientos",
        description: "Relaja los músculos y previene lesiones.",
        duration: "10 min",
      },
      {
        id: "step14",
        title: "💧 Hidratación post-ejercicio",
        description: "Recupera los líquidos perdidos durante el ejercicio.",
      },
    ]
  },
  {
    id: "productivity-boost",
    title: "Rutina de Productividad",
    description: "Maximiza tu enfoque y rendimiento durante el día",
    icon: Coffee,
    color: "bg-gradient-to-br from-blue-500 to-cyan-600",
    imageUrl: "/routines/routine-morning-energized.png",
    steps: [
      {
        id: "step15",
        title: "🎯 Planificación del día",
        description: "Define tus 3 tareas más importantes del día.",
        duration: "5 min",
      },
      {
        id: "step16",
        title: "☕ Toma de café o té",
        description: "Disfruta tu bebida favorita para energizar tu mente.",
      },
      {
        id: "step17",
        title: "📚 Aprendizaje o lectura",
        description: "Dedica tiempo a aprender algo nuevo o leer.",
        duration: "15–30 min",
      },
      {
        id: "step18",
        title: "📊 Revisión de progreso",
        description: "Evalúa tu avance y ajusta tu plan si es necesario.",
        duration: "5 min",
      },
    ]
  },
  {
    id: "study-session",
    title: "Rutina de Estudio",
    description: "Optimiza tu tiempo de estudio y aprendizaje",
    icon: BookOpen,
    color: "bg-gradient-to-br from-emerald-500 to-green-600",
    imageUrl: "/routines/routine-morning-energized.png",
    steps: [
      {
        id: "step19",
        title: "📝 Organización del espacio",
        description: "Prepara tu área de estudio y materiales necesarios.",
        duration: "5 min",
      },
      {
        id: "step20",
        title: "🎯 Definición de objetivos",
        description: "Establece qué quieres lograr en esta sesión.",
        duration: "3 min",
      },
      {
        id: "step21",
        title: "📚 Estudio enfocado",
        description: "Dedica tiempo concentrado a tu material de estudio.",
        duration: "25–50 min",
      },
      {
        id: "step22",
        title: "🧠 Repaso y consolidación",
        description: "Repasa lo aprendido y toma notas clave.",
        duration: "10 min",
      },
    ]
  }
];

function RoutineTemplateSelector({
  children,
  onSave,
}: {
  children: React.ReactNode;
  onSave: (newRoutine: Partial<Routine>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsOpen(false);
    // Open the create routine dialog with the selected template
    setShowCustomDialog(true);
  };

  const handleCustomRoutine = () => {
    setSelectedTemplate(null);
    setIsOpen(false);
    setShowCustomDialog(true);
  };

  const handleSaveFromTemplate = (newRoutine: Partial<Routine>) => {
    if (Object.keys(newRoutine).length > 0) {
      // Only save if there's actual routine data
      onSave(newRoutine);
    }
    setShowCustomDialog(false);
    setSelectedTemplate(null);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild onClick={() => setIsOpen(true)}>
          {children}
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-full md:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle>Crear Nueva Rutina</SheetTitle>
            <SheetDescription>
              Elige una plantilla predefinida o crea tu rutina personalizada desde cero.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-grow overflow-y-auto px-6 space-y-4">
            {/* Custom Routine Option */}
            <Card 
              className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
              onClick={handleCustomRoutine}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">Crear rutina personalizada</h3>
                    <p className="text-sm text-muted-foreground">
                      Diseña tu rutina desde cero con pasos completamente personalizados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predefined Templates */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Plantillas predefinidas</h3>
              {routineTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <Card 
                    key={template.id}
                    className="transition-colors cursor-pointer hover:shadow-md"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white", template.color)}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-semibold text-base">{template.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{template.steps.length} pasos</span>
                            <span>•</span>
                            <span>Plantilla</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <SheetFooter className="p-6 mt-auto bg-background border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Cancelar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Create Routine Dialog with Template */}
      <CreateRoutineDialog 
        onSave={handleSaveFromTemplate}
        templateId={selectedTemplate || undefined}
        forceOpen={showCustomDialog}
      >
        <div style={{ display: 'none' }} />
      </CreateRoutineDialog>
    </>
  );
}

export { RoutineTemplateSelector };
