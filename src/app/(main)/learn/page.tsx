'use client';

import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';
import { CreateRoutineDialog } from '@/components/routines/create-routine-dialog';
import { Routine } from '@/lib/types';
import { useAppData } from '@/contexts/app-provider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const categories = ['Todos', 'Hábitos', 'Organización', 'TDAH', 'Ansiedad', 'Productividad'];

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

const articles = [
  {
    id: 'habits-neuroscience',
    title: 'La neurociencia detrás de los hábitos',
    category: 'Hábitos',
    readTime: '5 min',
    description: 'Descubre cómo tu cerebro forma nuevos hábitos y las estrategias más efectivas para crear rutinas duraderas.',
    content: 'La formación de hábitos es uno de los procesos más fascinantes del cerebro humano. Cuando realizamos una acción repetidamente, nuestro cerebro crea conexiones neuronales más fuertes, haciendo que la acción se vuelva automática.\n\nEl proceso de formación de hábitos consta de cuatro etapas clave:\n\n1. **Señal (Cue)**: El disparador que inicia el hábito\n2. **Antojo (Craving)**: La motivación detrás del hábito\n3. **Respuesta (Response)**: La acción o comportamiento\n4. **Recompensa (Reward)**: El beneficio obtenido\n\n**Estrategias para crear hábitos exitosos:**\n\n• **Empieza pequeño**: Los micro-hábitos son más sostenibles\n• **Ancla a rutinas existentes**: Conecta nuevos hábitos con acciones que ya haces\n• **Hazlo obvio**: Reduce la fricción para el hábito deseado\n• **Celebra los pequeños logros**: La recompensa refuerza el comportamiento\n\nLa clave está en la consistencia, no en la perfección. Es mejor hacer algo pequeño todos los días que algo grande ocasionalmente.',
  },
  {
    id: 'adhd-productivity',
    title: 'Productividad para personas con TDAH',
    category: 'TDAH',
    readTime: '7 min',
    description: 'Técnicas específicas para mejorar la concentración y productividad cuando tienes TDAH.',
    content: 'El TDAH puede hacer que la productividad tradicional no funcione para ti. Aquí hay estrategias específicas que aprovechan las fortalezas del cerebro neurodivergente:\n\n**Técnicas de gestión del tiempo:**\n\n• **Time blocking con descansos**: 25 min trabajo, 5 min descanso\n• **Body doubling**: Trabajar junto a otra persona\n• **Gamificación**: Convertir tareas en juegos\n• **Timers visuales**: Usar temporizadores que puedas ver\n\n**Gestión de la atención:**\n\n• **Música instrumental**: Ayuda con la concentración\n• **Espacios de trabajo limpios**: Reduce distracciones\n• **Listas de tareas físicas**: Mejor que digitales\n• **Recompensas inmediatas**: Celebrar cada logro pequeño\n\n**Aprovecha tu hiperfocus:**\n\n• **Identifica tus horas pico**: Trabaja en tareas importantes cuando tu concentración es máxima\n• **Elimina interrupciones**: Notificaciones en silencio\n• **Prepara snacks y agua**: Para no tener que parar\n\nRecuerda: no estás roto, tu cerebro simplemente funciona diferente. Estas estrategias están diseñadas para trabajar CON tu neurodivergencia, no contra ella.',
  },
  {
    id: 'anxiety-management',
    title: 'Manejo de la ansiedad a través de rutinas',
    category: 'Ansiedad',
    readTime: '6 min',
    description: 'Cómo las rutinas estructuradas pueden ayudarte a reducir la ansiedad y sentir más control.',
    content: 'La ansiedad a menudo surge de la incertidumbre y la falta de control. Las rutinas estructuradas pueden ser una herramienta poderosa para manejar estos sentimientos.\n\n**Beneficios de las rutinas para la ansiedad:**\n\n• **Predecibilidad**: Saber qué viene después reduce la incertidumbre\n• **Control**: Te da una sensación de dominio sobre tu día\n• **Energía mental**: Libera espacio cognitivo para otras tareas\n• **Confianza**: Cada rutina completada refuerza tu autoeficacia\n\n**Elementos clave de rutinas anti-ansiedad:**\n\n• **Rutina matutina**: Comienza el día con estructura\n• **Transiciones suaves**: Momentos de pausa entre actividades\n• **Tiempo de preparación**: 10-15 min para prepararte mentalmente\n• **Rutina nocturna**: Cierra el día con calma\n\n**Técnicas de respiración para incluir:**\n\n• **Respiración 4-7-8**: 4 segundos inhalar, 7 retener, 8 exhalar\n• **Respiración de caja**: 4 segundos en cada fase\n• **Mindfulness**: 5 minutos de atención plena\n\nLas rutinas no deben ser rígidas. Si algo no funciona, ajusta y adapta. El objetivo es crear una estructura que te sirva, no que te limite.',
  },
  {
    id: 'organization-systems',
    title: 'Sistemas de organización que realmente funcionan',
    category: 'Organización',
    readTime: '8 min',
    description: 'Métodos probados para organizar tu vida, espacio y tiempo de manera efectiva.',
    content: 'La organización no es solo sobre tener todo en su lugar, sino sobre crear sistemas que funcionen para tu estilo de vida y personalidad.\n\n**Principios fundamentales:**\n\n• **Menos es más**: Reduce antes de organizar\n• **Todo tiene su lugar**: Designa espacios específicos\n• **Un sistema para todo**: Evita tener múltiples sistemas\n• **Mantenimiento regular**: Revisa y ajusta semanalmente\n\n**Sistemas populares que funcionan:**\n\n**1. Método KonMari:**\n• Guarda solo lo que te da alegría\n• Organiza por categorías, no por ubicación\n• Da gracias antes de desechar\n\n**2. Sistema GTD (Getting Things Done):**\n• Captura todo en un sistema confiable\n• Clarifica qué es cada cosa\n• Organiza por contexto y energía\n• Revisa regularmente\n\n**3. Método de las 5S:**\n• **Seiri** (Clasificar): Separar lo necesario de lo innecesario\n• **Seiton** (Organizar): Todo en su lugar\n• **Seiso** (Limpiar): Mantener limpio\n• **Seiketsu** (Estandarizar): Crear rutinas\n• **Shitsuke** (Disciplinar): Mantener el sistema\n\n**Para el espacio digital:**\n• Nombres de archivos consistentes\n• Carpetas por proyecto o fecha\n• Respaldos automáticos\n• Limpieza mensual\n\nLa clave está en encontrar el sistema que se adapte a tu personalidad y estilo de vida, no en seguir el sistema "perfecto" de otra persona.',
  },
  {
    id: 'morning-routine-science',
    title: 'La ciencia de las rutinas matutinas',
    category: 'Hábitos',
    readTime: '6 min',
    description: 'Evidencia científica sobre por qué las rutinas matutinas son tan poderosas para tu bienestar.',
    content: 'Las rutinas matutinas no son solo una tendencia de bienestar, están respaldadas por décadas de investigación científica.\n\n**Cronobiología y ritmos circadianos:**\n\nTu cuerpo opera en ciclos de 24 horas llamados ritmos circadianos. Estos ciclos regulan:\n• Niveles de energía\n• Estado de ánimo\n• Función cognitiva\n• Metabolismo\n\n**Beneficios comprobados de las rutinas matutinas:**\n\n• **Mejor regulación del cortisol**: La hormona del estrés se libera de manera más equilibrada\n• **Mayor productividad**: Las mañanas son cuando la función ejecutiva está en su punto máximo\n• **Mejor estado de ánimo**: La exposición temprana a la luz natural mejora el humor\n• **Metabolismo optimizado**: Desayunar a la misma hora mejora la sensibilidad a la insulina\n\n**Elementos basados en evidencia:**\n\n• **Exposición a luz natural**: Regula la melatonina y mejora el sueño nocturno\n• **Hidratación**: El cuerpo pierde agua durante la noche\n• **Movimiento ligero**: Activa el sistema nervioso simpático\n• **Mindfulness**: Reduce la reactividad al estrés\n• **Planificación**: Mejora la función ejecutiva y reduce la procrastinación\n\n**Duración óptima:**\n\nLa investigación sugiere que 30-60 minutos es el rango óptimo. Menos tiempo no permite los beneficios completos, más tiempo puede ser insostenible.\n\n**Factores de éxito:**\n\n• Consistencia sobre perfección\n• Adaptación gradual\n• Personalización según cronotipo\n• Flexibilidad para días especiales\n\nLas rutinas matutinas son una inversión en tu bienestar a largo plazo. Los beneficios se acumulan con el tiempo y pueden transformar no solo tus mañanas, sino tu vida completa.',
  },
  {
    id: 'digital-minimalism',
    title: 'Minimalismo digital para la concentración',
    category: 'Productividad',
    readTime: '5 min',
    description: 'Cómo reducir el ruido digital para mejorar tu concentración y bienestar mental.',
    content: 'En un mundo hiperconectado, el minimalismo digital no es una tendencia, es una necesidad para mantener tu salud mental y productividad.\n\n**El problema de la sobrecarga digital:**\n\n• **Fatiga de decisiones**: Cada notificación requiere una decisión\n• **Interrupciones constantes**: Fragmentan tu atención\n• **Comparación social**: Las redes sociales pueden afectar tu autoestima\n• **Sobrecarga cognitiva**: Demasiada información simultánea\n\n**Principios del minimalismo digital:**\n\n• **Intención sobre hábito**: Usa la tecnología con propósito\n• **Calidad sobre cantidad**: Menos apps, mejor experiencia\n• **Presencia sobre distracción**: Estar presente en el momento\n• **Conexión real sobre virtual**: Priorizar relaciones auténticas\n\n**Estrategias prácticas:**\n\n**1. Audit digital:**\n• Revisa todas tus apps y redes sociales\n• Elimina las que no aportan valor\n• Desactiva notificaciones innecesarias\n\n**2. Zonas sin tecnología:**\n• Dormitorio libre de dispositivos\n• Horarios de comida sin pantallas\n• Tiempo en la naturaleza desconectado\n\n**3. Uso intencional:**\n• Establece horarios específicos para redes sociales\n• Usa timers para limitar el tiempo\n• Planifica tu uso en lugar de navegación infinita\n\n**4. Organización digital:**\n• Un solo lugar para cada tipo de información\n• Carpetas organizadas por proyecto\n• Respaldos automáticos\n• Limpieza regular de archivos\n\n**Beneficios del minimalismo digital:**\n\n• Mayor concentración y productividad\n• Mejor calidad del sueño\n• Relaciones más auténticas\n• Menos ansiedad y estrés\n• Más tiempo para actividades significativas\n\nEl minimalismo digital no se trata de rechazar la tecnología, sino de usarla de manera que mejore tu vida en lugar de controlarla.',
  },
];

function ArticleCard({ article }: { article: typeof articles[0] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{article.category}</Badge>
              <span className="text-sm text-muted-foreground">{article.readTime}</span>
            </div>
            <CardTitle className="text-lg">{article.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{article.description}</p>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? 'Leer menos' : 'Leer artículo completo'}
        </Button>
        {isExpanded && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="prose prose-sm max-w-none">
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">
                  {paragraph.split('\n').map((line, lineIndex) => {
                    if (line.trim().startsWith('• ')) {
                      return (
                        <div key={lineIndex} className="flex items-start ml-4 mb-1">
                          <span className="mr-2 mt-1">•</span>
                          <span>{line.trim().substring(2)}</span>
                        </div>
                      );
                    }
                    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                      return (
                        <strong key={lineIndex} className="font-semibold">
                          {line.trim().slice(2, -2)}
                        </strong>
                      );
                    }
                    return <span key={lineIndex}>{line}</span>;
                  })}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoutineCard({
  routine,
  onSave,
}: {
  routine: Routine;
  onSave: (newRoutine: Partial<Routine>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderDescription = () => {
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
  };

  return (
    <Card className="overflow-hidden">
      <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
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
      {isExpanded && (
        <CardContent className="pt-4">
          <div className="text-muted-foreground mb-4 space-y-4">
            {renderDescription()}
          </div>
          <CreateRoutineDialog onSave={onSave}>
            <Button className="w-full">+ Agregar a mi rutina</Button>
          </CreateRoutineDialog>
        </CardContent>
      )}
    </Card>
  );
}

export default function LearnPage() {
  const { addRoutine, updateRoutine } = useAppData();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredArticles = selectedCategory === 'Todos' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const handleSaveRoutine = async (newRoutine: Partial<Routine>) => {
    try {
      if (newRoutine.id) {
        // Update existing routine
        console.log('Updating routine:', newRoutine);
        await updateRoutine(newRoutine.id, newRoutine);
        console.log('Routine updated successfully');
      } else {
        // Create new routine
        console.log('Creating new routine:', newRoutine);
        // Remove id field if it exists to avoid Firestore error
        const { id, ...routineDataWithoutId } = newRoutine;
        await addRoutine(routineDataWithoutId as Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>);
        console.log('Routine created successfully');
        
        // Show success toast
        toast({
          title: "¡Rutina Creada!",
          description: `La rutina "${routineDataWithoutId.title}" ha sido añadida a tu lista.`,
        });
        
        // Navigate to routines page after successful creation
        setTimeout(() => {
          router.push('/routines');
        }, 1000); // Small delay to show the toast
      }
    } catch (error) {
      console.error('Error saving routine:', error);
      toast({
        title: "Error al crear la rutina",
        description: "Hubo un problema al guardar tu rutina. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl mb-2">Aprender</h1>
        <p className="text-muted-foreground">
          Artículos informativos y rutinas predeterminadas para mejorar tu bienestar
        </p>
      </div>

      {/* Articles Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Artículos</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                buttonVariants({
                  variant: selectedCategory === category ? 'default' : 'outline',
                  size: 'sm',
                }),
                'rounded-full px-4 whitespace-nowrap'
              )}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      {/* Routines Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Rutinas Recomendadas</h2>
        <p className="text-muted-foreground mb-4">
          Rutinas predeterminadas basadas en evidencia científica que puedes personalizar
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onSave={handleSaveRoutine}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
