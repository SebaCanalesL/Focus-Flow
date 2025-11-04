'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useState } from 'react';
import Image from 'next/image';

const categories = ['Hábitos', 'Organización', 'TDAH', 'Ansiedad', 'Productividad'];


const articles = [
  {
    id: 'habits-neuroscience',
    title: 'La neurociencia detrás de los hábitos',
    category: 'Hábitos',
    readTime: '5 min',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    description: 'Descubre cómo tu cerebro forma nuevos hábitos y las estrategias más efectivas para crear rutinas duraderas.',
    content: 'La formación de hábitos es uno de los procesos más fascinantes del cerebro humano. Cuando realizamos una acción repetidamente, nuestro cerebro crea conexiones neuronales más fuertes, haciendo que la acción se vuelva automática.\n\nEl proceso de formación de hábitos consta de cuatro etapas clave:\n\n1. **Señal (Cue)**: El disparador que inicia el hábito\n2. **Antojo (Craving)**: La motivación detrás del hábito\n3. **Respuesta (Response)**: La acción o comportamiento\n4. **Recompensa (Reward)**: El beneficio obtenido\n\n**Estrategias para crear hábitos exitosos:**\n\n• **Empieza pequeño**: Los micro-hábitos son más sostenibles\n• **Ancla a rutinas existentes**: Conecta nuevos hábitos con acciones que ya haces\n• **Hazlo obvio**: Reduce la fricción para el hábito deseado\n• **Celebra los pequeños logros**: La recompensa refuerza el comportamiento\n\nLa clave está en la consistencia, no en la perfección. Es mejor hacer algo pequeño todos los días que algo grande ocasionalmente.',
  },
  {
    id: 'adhd-productivity',
    title: 'Productividad para personas con TDAH',
    category: 'TDAH',
    readTime: '7 min',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
    description: 'Técnicas específicas para mejorar la concentración y productividad cuando tienes TDAH.',
    content: 'El TDAH puede hacer que la productividad tradicional no funcione para ti. Aquí hay estrategias específicas que aprovechan las fortalezas del cerebro neurodivergente:\n\n**Técnicas de gestión del tiempo:**\n\n• **Time blocking con descansos**: 25 min trabajo, 5 min descanso\n• **Body doubling**: Trabajar junto a otra persona\n• **Gamificación**: Convertir tareas en juegos\n• **Timers visuales**: Usar temporizadores que puedas ver\n\n**Gestión de la atención:**\n\n• **Música instrumental**: Ayuda con la concentración\n• **Espacios de trabajo limpios**: Reduce distracciones\n• **Listas de tareas físicas**: Mejor que digitales\n• **Recompensas inmediatas**: Celebrar cada logro pequeño\n\n**Aprovecha tu hiperfocus:**\n\n• **Identifica tus horas pico**: Trabaja en tareas importantes cuando tu concentración es máxima\n• **Elimina interrupciones**: Notificaciones en silencio\n• **Prepara snacks y agua**: Para no tener que parar\n\nRecuerda: no estás roto, tu cerebro simplemente funciona diferente. Estas estrategias están diseñadas para trabajar CON tu neurodivergencia, no contra ella.',
  },
  {
    id: 'adhd-routines',
    title: 'Rutinas adaptadas para TDAH',
    category: 'TDAH',
    readTime: '6 min',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
    description: 'Cómo diseñar rutinas flexibles que funcionen con tu cerebro neurodivergente.',
    content: 'Las rutinas tradicionales pueden sentirse restrictivas para personas con TDAH. Aquí te mostramos cómo crear rutinas que respeten tu neurodivergencia.\n\n**Principios de rutinas para TDAH:**\n\n• **Flexibilidad sobre rigidez**: Las rutinas deben ser guías, no reglas\n• **Estructura visual**: Usa señales visuales y recordatorios físicos\n• **Momentos de transición**: Incluye tiempo de buffer entre actividades\n• **Rutinas mínimas**: Menos pasos = más sostenible\n\n**Diseño de rutinas efectivas:**\n\n**1. Rutinas modulares:**\nEn lugar de una rutina completa, crea módulos pequeños que puedes combinar:\n• Módulo de energía: 5 min movimiento\n• Módulo de enfoque: 3 min respiración\n• Módulo de preparación: 2 min planificación\n\n**2. Sistemas de recordatorios múltiples:**\n• Alarmas en el teléfono\n• Notas físicas en lugares visibles\n• Listas de verificación en el espejo\n• Recordatorios de voz\n\n**3. Rutinas "si-entonces":**\nSi [condición], entonces [acción]\n• Si me despierto antes de las 7am, entonces hago ejercicio\n• Si tengo energía baja, entonces hago 5 min de movimiento\n• Si me siento abrumado, entonces hago respiración\n\n**Ajustes para diferentes días:**\n\n• **Días de alta energía**: Rutina completa con extras\n• **Días de baja energía**: Versión mínima de la rutina\n• **Días ocupados**: Solo los elementos esenciales\n• **Días libres**: Rutina flexible y creativa\n\n**Errores comunes a evitar:**\n\n• Intentar hacer demasiado a la vez\n• Comparar tus rutinas con las de neurotípicos\n• Ser rígido cuando necesitas flexibilidad\n• Abandonar todo si fallas un día\n\nRecuerda: el mejor día para reiniciar una rutina es hoy. No necesitas esperar al lunes, al primer día del mes, o al año nuevo.',
  },
  {
    id: 'adhd-task-management',
    title: 'Gestión de tareas para TDAH',
    category: 'TDAH',
    readTime: '5 min',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    description: 'Sistemas de gestión de tareas que funcionan con tu estilo de pensamiento neurodivergente.',
    content: 'La gestión de tareas tradicional puede ser abrumadora para personas con TDAH. Estos sistemas están diseñados para trabajar con tu cerebro.\n\n**Sistemas que funcionan:**\n\n**1. Método del "Bote de Cerebro":**\nCaptura todo en un solo lugar sin categorizar:\n• Escríbelo todo sin pensar\n• Revísalo una vez al día\n• Decide qué hacer hoy (solo 1-3 cosas)\n• El resto puede esperar\n\n**2. Sistema de Energía:**\nOrganiza tareas por nivel de energía necesario:\n• **Alta energía**: Tareas complejas, creativas, importantes\n• **Media energía**: Tareas rutinarias, administrativas\n• **Baja energía**: Tareas simples, automáticas\n\n**3. Método de las 3 tareas:**\nCada día, elige solo 3 tareas:\n• 1 tarea importante\n• 1 tarea urgente\n• 1 tarea que quieres hacer\n\n**Técnicas específicas:**\n\n• **Time boxing visual**: Usa timers físicos que puedas ver\n• **Body doubling**: Trabaja junto a alguien (presencial o virtual)\n• **Pomodoro adaptado**: 15-25 min trabajo, 5-10 min descanso\n• **Tareas de 2 minutos**: Si toma menos de 2 min, hazla ahora\n• **Batch processing**: Agrupa tareas similares\n\n**Herramientas recomendadas:**\n\n• **Físicas**: Pizarra blanca, post-its de colores, cuaderno\n• **Digitales simples**: Apps minimalistas sin muchas funciones\n• **Híbridas**: Combinar físico y digital según el contexto\n\n**Manejo de la procrastinación:**\n\n• **Desglosa tareas grandes**: En pasos de 5-10 minutos\n• **Empieza con el paso más pequeño**: El primer paso es el más difícil\n• **Usa la regla de los 5 minutos**: Comprométete a 5 min, luego decide si continuar\n• **Identifica bloqueos**: ¿Es falta de claridad, energía, o miedo?\n\nLa clave es encontrar el sistema que se sienta natural para ti, no el que "debería" funcionar.',
  },
  {
    id: 'anxiety-management',
    title: 'Manejo de la ansiedad a través de rutinas',
    category: 'Ansiedad',
    readTime: '6 min',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    description: 'Cómo las rutinas estructuradas pueden ayudarte a reducir la ansiedad y sentir más control.',
    content: 'La ansiedad a menudo surge de la incertidumbre y la falta de control. Las rutinas estructuradas pueden ser una herramienta poderosa para manejar estos sentimientos.\n\n**Beneficios de las rutinas para la ansiedad:**\n\n• **Predecibilidad**: Saber qué viene después reduce la incertidumbre\n• **Control**: Te da una sensación de dominio sobre tu día\n• **Energía mental**: Libera espacio cognitivo para otras tareas\n• **Confianza**: Cada rutina completada refuerza tu autoeficacia\n\n**Elementos clave de rutinas anti-ansiedad:**\n\n• **Rutina matutina**: Comienza el día con estructura\n• **Transiciones suaves**: Momentos de pausa entre actividades\n• **Tiempo de preparación**: 10-15 min para prepararte mentalmente\n• **Rutina nocturna**: Cierra el día con calma\n\n**Técnicas de respiración para incluir:**\n\n• **Respiración 4-7-8**: 4 segundos inhalar, 7 retener, 8 exhalar\n• **Respiración de caja**: 4 segundos en cada fase\n• **Mindfulness**: 5 minutos de atención plena\n\nLas rutinas no deben ser rígidas. Si algo no funciona, ajusta y adapta. El objetivo es crear una estructura que te sirva, no que te limite.',
  },
  {
    id: 'anxiety-breathing',
    title: 'Técnicas de respiración para calmar la ansiedad',
    category: 'Ansiedad',
    readTime: '5 min',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    description: 'Ejercicios de respiración simples y efectivos que puedes usar en cualquier momento para reducir la ansiedad.',
    content: 'La respiración es una de las herramientas más accesibles y efectivas para manejar la ansiedad. Cuando estás ansioso, tu respiración se vuelve superficial y rápida, lo que intensifica los síntomas físicos.\n\n**Por qué funciona:**\n\n• **Activa el sistema nervioso parasimpático**: La rama de "descanso y digestión"\n• **Reduce el ritmo cardíaco**: Calma la respuesta física del estrés\n• **Oxigena el cerebro**: Mejora la claridad mental\n• **Ancla en el presente**: Te trae de vuelta al momento actual\n\n**Técnicas básicas:**\n\n**1. Respiración 4-7-8:**\n• Inhala por la nariz durante 4 segundos\n• Retén la respiración durante 7 segundos\n• Exhala por la boca durante 8 segundos\n• Repite 4-8 veces\n\n**2. Respiración de caja (Box Breathing):**\n• Inhala durante 4 segundos\n• Retén durante 4 segundos\n• Exhala durante 4 segundos\n• Retén durante 4 segundos\n• Repite 4-6 veces\n\n**3. Respiración diafragmática:**\n• Coloca una mano en el pecho y otra en el abdomen\n• Inhala profundamente, sintiendo que el abdomen se expande\n• Exhala lentamente, sintiendo que el abdomen se contrae\n• Repite 5-10 veces\n\n**Cuándo usar cada técnica:**\n\n• **4-7-8**: Antes de dormir o cuando necesitas calma rápida\n• **Box Breathing**: Durante momentos de estrés o antes de situaciones importantes\n• **Diafragmática**: Para práctica diaria y prevención\n\n**Integración en tu día:**\n\n• **Mañana**: 5 minutos de respiración al despertar\n• **Transiciones**: 3 respiraciones profundas entre actividades\n• **Antes de situaciones estresantes**: 2 minutos de box breathing\n• **Noche**: 10 minutos de respiración 4-7-8 antes de dormir\n\nLa práctica regular es clave. No esperes a tener ansiedad para usar estas técnicas. Practícalas cuando estés calmado para que sean más efectivas cuando las necesites.',
  },
  {
    id: 'anxiety-grounding',
    title: 'Técnicas de grounding para ataques de ansiedad',
    category: 'Ansiedad',
    readTime: '4 min',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Ejercicios de grounding prácticos que puedes usar durante momentos de ansiedad intensa.',
    content: 'Las técnicas de grounding te ayudan a reconectar con el presente cuando la ansiedad te lleva a un estado de preocupación o pánico. Son especialmente útiles durante ataques de ansiedad.\n\n**Qué es el grounding:**\n\nEl grounding es una técnica que usa tus sentidos para anclarte en el momento presente. Cuando estás ansioso, tu mente puede quedar atrapada en pensamientos sobre el futuro o el pasado. El grounding te trae de vuelta al aquí y ahora.\n\n**Técnica 5-4-3-2-1:**\n\nIdentifica:\n• **5 cosas que puedes ver**: Un objeto rojo, la textura de la pared, la luz entrando por la ventana...\n• **4 cosas que puedes tocar**: La textura de tu ropa, la superficie de tu escritorio, tu propio cabello...\n• **3 cosas que puedes oír**: El sonido de un ventilador, voces lejanas, tu propia respiración...\n• **2 cosas que puedes oler**: El perfume en el aire, el olor de tu café...\n• **1 cosa que puedes saborear**: Tu saliva, un sabor residual en tu boca...\n\n**Otros ejercicios de grounding:**\n\n**Método del cuerpo:**\n• Nombra las partes de tu cuerpo desde los dedos de los pies hasta la cabeza\n• Siente cada parte mientras la nombras\n• Nota la temperatura, el peso, la posición\n\n**Método de los colores:**\n• Elige un color\n• Encuentra 5 objetos de ese color en tu entorno\n• Repite con otro color\n\n**Método de la temperatura:**\n• Toca algo frío (hielo, metal)\n• Toca algo cálido (taza de té, tu propia mano)\n• Alterna entre ambos\n• Enfócate en la sensación física\n\n**Cuándo usar grounding:**\n\n• Durante ataques de ansiedad\n• Cuando sientes disociación\n• Antes de situaciones estresantes\n• Cuando te sientes abrumado\n• Como práctica diaria preventiva\n\n**Señales de que necesitas grounding:**\n\n• Sensación de estar "fuera de tu cuerpo"\n• Pensamientos acelerados\n• Sensación de irrealidad\n• Palpitaciones o dificultad para respirar\n• Preocupación excesiva sobre el futuro\n\nEl grounding es una habilidad que se fortalece con la práctica. Empieza a usarlo en momentos de baja ansiedad para que esté disponible cuando más lo necesites.',
  },
  {
    id: 'organization-systems',
    title: 'Sistemas de organización que realmente funcionan',
    category: 'Organización',
    readTime: '8 min',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
    description: 'Métodos probados para organizar tu vida, espacio y tiempo de manera efectiva.',
    content: 'La organización no es solo sobre tener todo en su lugar, sino sobre crear sistemas que funcionen para tu estilo de vida y personalidad.\n\n**Principios fundamentales:**\n\n• **Menos es más**: Reduce antes de organizar\n• **Todo tiene su lugar**: Designa espacios específicos\n• **Un sistema para todo**: Evita tener múltiples sistemas\n• **Mantenimiento regular**: Revisa y ajusta semanalmente\n\n**Sistemas populares que funcionan:**\n\n**1. Método KonMari:**\n• Guarda solo lo que te da alegría\n• Organiza por categorías, no por ubicación\n• Da gracias antes de desechar\n\n**2. Sistema GTD (Getting Things Done):**\n• Captura todo en un sistema confiable\n• Clarifica qué es cada cosa\n• Organiza por contexto y energía\n• Revisa regularmente\n\n**3. Método de las 5S:**\n• **Seiri** (Clasificar): Separar lo necesario de lo innecesario\n• **Seiton** (Organizar): Todo en su lugar\n• **Seiso** (Limpiar): Mantener limpio\n• **Seiketsu** (Estandarizar): Crear rutinas\n• **Shitsuke** (Disciplinar): Mantener el sistema\n\n**Para el espacio digital:**\n• Nombres de archivos consistentes\n• Carpetas por proyecto o fecha\n• Respaldos automáticos\n• Limpieza mensual\n\nLa clave está en encontrar el sistema que se adapte a tu personalidad y estilo de vida, no en seguir el sistema "perfecto" de otra persona.',
  },
  {
    id: 'space-organization',
    title: 'Organización de espacios físicos',
    category: 'Organización',
    readTime: '6 min',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    description: 'Estrategias prácticas para organizar tus espacios físicos y crear un ambiente que promueva la productividad.',
    content: 'Un espacio organizado reduce la carga cognitiva y mejora tu capacidad de concentración. Aquí te mostramos cómo transformar tus espacios físicos.\n\n**Principios de organización espacial:**\n\n• **Zonas de función**: Asigna áreas específicas para actividades específicas\n• **Visibilidad**: Mantén lo que usas frecuentemente a la vista\n• **Accesibilidad**: Lo más usado debe ser lo más accesible\n• **Sistemas de contenedores**: Usa cajas, cestas y organizadores claramente etiquetados\n\n**Áreas clave para organizar:**\n\n**1. Espacio de trabajo:**\n• **Zona de escritorio**: Solo lo esencial para trabajar\n• **Zona de almacenamiento**: Cerca pero fuera del campo visual\n• **Zona de referencia**: Materiales que consultas ocasionalmente\n• **Sistema de cables**: Organizadores y etiquetas para cables\n\n**2. Dormitorio:**\n• **Ropa por temporada**: Rota la ropa según la estación\n• **Cajones organizados**: Por tipo de prenda, no por color\n• **Superficies limpias**: Cama hecha, superficies despejadas\n• **Zona de relajación**: Separada del área de trabajo\n\n**3. Cocina:**\n• **Zonas de trabajo**: Preparación, cocción, almacenamiento\n• **Herramientas a mano**: Lo que usas más cerca de donde lo usas\n• **Rotación de alimentos**: Sistema FIFO (primero en entrar, primero en salir)\n• **Limpieza diaria**: 5 minutos al final del día\n\n**Sistemas de organización:**\n\n**Método de las zonas:**\n• Zona A: Uso diario (accesible inmediatamente)\n• Zona B: Uso semanal (accesible con un paso)\n• Zona C: Uso mensual (almacenamiento)\n• Zona D: Raramente usado (almacenamiento profundo)\n\n**Método del flujo:**\n• Organiza según el flujo natural de uso\n• Puntos de entrada y salida claros\n• Minimiza el movimiento innecesario\n• Agrupa por función, no por tipo\n\n**Mantenimiento:**\n\n• **5 minutos diarios**: Limpieza rápida al final del día\n• **15 minutos semanales**: Revisión y ajuste de sistemas\n• **1 hora mensual**: Reorganización profunda de una zona\n• **Evaluación trimestral**: Revisa qué sistemas funcionan y cuáles no\n\nUn espacio organizado es un espacio que trabaja para ti, no contra ti.',
  },
  {
    id: 'time-organization',
    title: 'Organización del tiempo y calendario',
    category: 'Organización',
    readTime: '7 min',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    description: 'Sistemas efectivos para organizar tu tiempo y crear un calendario que realmente funcione para tu vida.',
    content: 'La organización del tiempo va más allá de tener un calendario. Es sobre crear sistemas que respeten tu energía y prioridades.\n\n**Principios de organización temporal:**\n\n• **Time blocking**: Asigna bloques específicos para actividades\n• **Buffer time**: Siempre deja espacio entre compromisos\n• **Batching**: Agrupa tareas similares\n• **Energía sobre urgencia**: Haz tareas importantes cuando tu energía es alta\n\n**Sistemas de calendario:**\n\n**1. Calendario por colores:**\n• Rojo: Trabajo/obligaciones\n• Azul: Personal/desarrollo\n• Verde: Salud/ejercicio\n• Amarillo: Social/familia\n• Gris: Tiempo libre/buffer\n\n**2. Time blocking temático:**\n• Lunes: Planificación y administración\n• Martes: Trabajo profundo\n• Miércoles: Reuniones y colaboración\n• Jueves: Trabajo profundo\n• Viernes: Revisión y preparación\n\n**3. Sistema de bloques de energía:**\n• **Bloque de alta energía** (mañana): Tareas creativas, importantes, complejas\n• **Bloque de media energía** (tarde): Reuniones, comunicación, tareas rutinarias\n• **Bloque de baja energía** (tarde/noche): Tareas simples, organización, lectura\n\n**Técnicas específicas:**\n\n**Pomodoro adaptado:**\n• 25-50 min trabajo profundo\n• 5-15 min descanso\n• 4 pomodoros = descanso largo\n\n**Time blocking flexible:**\n• Bloque de 2 horas para trabajo profundo\n• Bloque de 30 min para tareas pequeñas\n• Bloque de 15 min para transiciones\n• Bloque de buffer para imprevistos\n\n**Revisión semanal:**\n\n• **Domingo**: Revisa la semana pasada\n• **Planifica la semana entrante**: Asigna bloques de tiempo\n• **Identifica prioridades**: 3 tareas importantes\n• **Deja espacio para lo inesperado**: 20% del tiempo libre\n\n**Herramientas recomendadas:**\n\n• **Calendario digital**: Google Calendar, Notion Calendar\n• **Calendario físico**: Para visualización y planificación\n• **Time tracker**: Para entender dónde va tu tiempo\n• **Timer físico**: Para bloques de trabajo\n\nLa organización del tiempo no se trata de llenar cada minuto, sino de crear estructura que te permita ser flexible y productivo.',
  },
  {
    id: 'morning-routine-science',
    title: 'La ciencia de las rutinas matutinas',
    category: 'Hábitos',
    readTime: '6 min',
    imageUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80',
    description: 'Evidencia científica sobre por qué las rutinas matutinas son tan poderosas para tu bienestar.',
    content: 'Las rutinas matutinas no son solo una tendencia de bienestar, están respaldadas por décadas de investigación científica.\n\n**Cronobiología y ritmos circadianos:**\n\nTu cuerpo opera en ciclos de 24 horas llamados ritmos circadianos. Estos ciclos regulan:\n• Niveles de energía\n• Estado de ánimo\n• Función cognitiva\n• Metabolismo\n\n**Beneficios comprobados de las rutinas matutinas:**\n\n• **Mejor regulación del cortisol**: La hormona del estrés se libera de manera más equilibrada\n• **Mayor productividad**: Las mañanas son cuando la función ejecutiva está en su punto máximo\n• **Mejor estado de ánimo**: La exposición temprana a la luz natural mejora el humor\n• **Metabolismo optimizado**: Desayunar a la misma hora mejora la sensibilidad a la insulina\n\n**Elementos basados en evidencia:**\n\n• **Exposición a luz natural**: Regula la melatonina y mejora el sueño nocturno\n• **Hidratación**: El cuerpo pierde agua durante la noche\n• **Movimiento ligero**: Activa el sistema nervioso simpático\n• **Mindfulness**: Reduce la reactividad al estrés\n• **Planificación**: Mejora la función ejecutiva y reduce la procrastinación\n\n**Duración óptima:**\n\nLa investigación sugiere que 30-60 minutos es el rango óptimo. Menos tiempo no permite los beneficios completos, más tiempo puede ser insostenible.\n\n**Factores de éxito:**\n\n• Consistencia sobre perfección\n• Adaptación gradual\n• Personalización según cronotipo\n• Flexibilidad para días especiales\n\nLas rutinas matutinas son una inversión en tu bienestar a largo plazo. Los beneficios se acumulan con el tiempo y pueden transformar no solo tus mañanas, sino tu vida completa.',
  },
  {
    id: 'habit-stacking',
    title: 'Habit Stacking: Construye hábitos sobre hábitos',
    category: 'Hábitos',
    readTime: '4 min',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    description: 'Aprende a apilar hábitos nuevos sobre los existentes para crear rutinas más poderosas y sostenibles.',
    content: 'El habit stacking es una técnica poderosa que consiste en anclar nuevos hábitos a hábitos que ya tienes establecidos. Es como construir una cadena de comportamientos.\n\n**Cómo funciona el habit stacking:**\n\nLa fórmula es simple: Después de [hábito actual], haré [nuevo hábito].\n\nPor ejemplo:\n• Después de preparar mi café, haré 5 minutos de meditación\n• Después de lavarme los dientes, escribiré 3 cosas por las que estoy agradecido\n• Después de cerrar mi laptop al final del día, haré 10 minutos de estiramientos\n\n**Por qué funciona:**\n\n• **Aprovecha rutas neuronales existentes**: Tu cerebro ya tiene el camino establecido para el hábito ancla\n• **Reduce la fricción**: No necesitas recordar cuándo hacer el nuevo hábito\n• **Crea secuencias naturales**: Los hábitos fluyen uno tras otro automáticamente\n• **Aumenta la probabilidad**: Si el hábito ancla es sólido, el nuevo hábito tendrá más éxito\n\n**Estrategias efectivas:**\n\n• **Empieza con hábitos pequeños**: Apila micro-hábitos de 2 minutos o menos\n• **Elige anclas fuertes**: Usa hábitos que ya haces sin pensar\n• **Mantén el orden**: La secuencia es importante para crear la asociación\n• **Refuerza la cadena**: Visualiza la secuencia completa antes de hacerla\n\n**Ejemplos de cadenas de hábitos:**\n\n**Rutina matutina:**\n1. Despertar\n2. Tomar un vaso de agua\n3. Hacer 5 minutos de respiración\n4. Escribir intenciones del día\n5. Hacer ejercicio ligero\n\n**Rutina nocturna:**\n1. Apagar dispositivos\n2. Preparar ropa del día siguiente\n3. Escribir en el diario\n4. Leer 10 páginas\n5. Meditación antes de dormir\n\nEl habit stacking convierte acciones individuales en sistemas poderosos que se refuerzan mutuamente.',
  },
  {
    id: 'digital-minimalism',
    title: 'Minimalismo digital para la concentración',
    category: 'Productividad',
    readTime: '5 min',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    description: 'Cómo reducir el ruido digital para mejorar tu concentración y bienestar mental.',
    content: 'En un mundo hiperconectado, el minimalismo digital no es una tendencia, es una necesidad para mantener tu salud mental y productividad.\n\n**El problema de la sobrecarga digital:**\n\n• **Fatiga de decisiones**: Cada notificación requiere una decisión\n• **Interrupciones constantes**: Fragmentan tu atención\n• **Comparación social**: Las redes sociales pueden afectar tu autoestima\n• **Sobrecarga cognitiva**: Demasiada información simultánea\n\n**Principios del minimalismo digital:**\n\n• **Intención sobre hábito**: Usa la tecnología con propósito\n• **Calidad sobre cantidad**: Menos apps, mejor experiencia\n• **Presencia sobre distracción**: Estar presente en el momento\n• **Conexión real sobre virtual**: Priorizar relaciones auténticas\n\n**Estrategias prácticas:**\n\n**1. Audit digital:**\n• Revisa todas tus apps y redes sociales\n• Elimina las que no aportan valor\n• Desactiva notificaciones innecesarias\n\n**2. Zonas sin tecnología:**\n• Dormitorio libre de dispositivos\n• Horarios de comida sin pantallas\n• Tiempo en la naturaleza desconectado\n\n**3. Uso intencional:**\n• Establece horarios específicos para redes sociales\n• Usa timers para limitar el tiempo\n• Planifica tu uso en lugar de navegación infinita\n\n**4. Organización digital:**\n• Un solo lugar para cada tipo de información\n• Carpetas organizadas por proyecto\n• Respaldos automáticos\n• Limpieza regular de archivos\n\n**Beneficios del minimalismo digital:**\n\n• Mayor concentración y productividad\n• Mejor calidad del sueño\n• Relaciones más auténticas\n• Menos ansiedad y estrés\n• Más tiempo para actividades significativas\n\nEl minimalismo digital no se trata de rechazar la tecnología, sino de usarla de manera que mejore tu vida en lugar de controlarla.',
  },
  {
    id: 'deep-work',
    title: 'Trabajo profundo: Maximizando tu concentración',
    category: 'Productividad',
    readTime: '6 min',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    description: 'Cómo crear las condiciones ideales para el trabajo profundo y alcanzar tu máximo potencial de productividad.',
    content: 'El trabajo profundo es la capacidad de enfocarse sin distracciones en tareas cognitivamente demandantes. Es una habilidad cada vez más valiosa en un mundo lleno de interrupciones.\n\n**Qué es el trabajo profundo:**\n\nEl trabajo profundo es el estado de concentración absoluta donde produces tu mejor trabajo. Es diferente al trabajo superficial (emails, reuniones, tareas administrativas) que requiere menos concentración.\n\n**Por qué es importante:**\n\n• **Calidad sobre cantidad**: Una hora de trabajo profundo puede valer más que 4 horas de trabajo superficial\n• **Aprendizaje acelerado**: La concentración profunda acelera la adquisición de habilidades\n• **Satisfacción**: El trabajo profundo es intrínsecamente gratificante\n• **Ventaja competitiva**: Pocas personas pueden hacerlo consistentemente\n\n**Condiciones para el trabajo profundo:**\n\n**1. Ambiente:**\n• Espacio libre de distracciones\n• Temperatura cómoda\n• Iluminación adecuada\n• Herramientas preparadas\n\n**2. Tiempo:**\n• Bloque de 90-120 minutos\n• Horarios de alta energía\n• Sin interrupciones programadas\n• Buffer de 10 min antes y después\n\n**3. Mental:**\n• Tareas claramente definidas\n• Objetivos específicos\n• Sin multitasking\n• Estado de flow\n\n**Estrategias para entrar en trabajo profundo:**\n\n**Ritual de entrada:**\n• 5 min de preparación del espacio\n• 3 respiraciones profundas\n• Revisión del objetivo\n• Inicio del temporizador\n\n**Eliminación de distracciones:**\n• Teléfono en modo avión o en otra habitación\n• Notificaciones desactivadas\n• Navegador con bloqueador de distracciones\n• Espacio físico limpio y organizado\n\n**Técnicas de mantenimiento:**\n\n• **Pomodoro extendido**: 90 min trabajo, 20 min descanso\n• **Check-ins cada 30 min**: ¿Estoy enfocado?\n• **Técnica de los 5 minutos**: Si pierdes el foco, comprométete a 5 min más\n• **Anotar distracciones**: Escribe pensamientos que te distraen y vuelve después\n\n**Construyendo la capacidad:**\n\nEmpieza con 20-30 minutos y aumenta gradualmente. La capacidad de trabajo profundo es como un músculo: se fortalece con la práctica regular.',
  },
  {
    id: 'energy-management',
    title: 'Gestión de energía para productividad sostenible',
    category: 'Productividad',
    readTime: '7 min',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    description: 'Aprende a gestionar tu energía, no solo tu tiempo, para mantener una productividad sostenible.',
    content: 'La productividad no se trata solo de gestionar tu tiempo, sino de gestionar tu energía. Identificar tus ritmos naturales y trabajar con ellos puede transformar tu productividad.\n\n**La diferencia entre tiempo y energía:**\n\nTienes 24 horas cada día, pero tu energía fluctúa. Trabajar cuando tu energía es baja es ineficiente. Trabajar cuando tu energía es alta es multiplicador.\n\n**Tipos de energía:**\n\n**1. Energía física:**\n• Niveles de actividad y vitalidad\n• Afectada por sueño, ejercicio, nutrición\n• Pico típicamente en la mañana\n\n**2. Energía mental:**\n• Capacidad de concentración y enfoque\n• Afectada por estrés, decisiones, distracciones\n• Limitada y se agota con el uso\n\n**3. Energía emocional:**\n• Estado de ánimo y motivación\n• Afectada por relaciones, ambiente, propósito\n• Puede ser renovada o drenada\n\n**4. Energía espiritual:**\n• Sensación de propósito y significado\n• Afectada por valores, conexión, contribución\n• Fuente de motivación a largo plazo\n\n**Identificando tus ritmos:**\n\n**Cronotipos comunes:**\n\n• **Alondra**: Máxima energía en la mañana temprano\n• **Búho**: Máxima energía en la tarde/noche\n• **Colibrí**: Energía distribuida durante el día\n\n**Mapeo de energía:**\n\nDurante una semana, registra:\n• Nivel de energía cada 2 horas (1-10)\n• Tipo de trabajo que hiciste\n• Qué tan productivo te sentiste\n• Factores que afectaron tu energía\n\n**Estrategias de gestión:**\n\n**1. Alinear tareas con energía:**\n• **Alta energía**: Trabajo creativo, decisiones importantes, tareas complejas\n• **Media energía**: Reuniones, comunicación, tareas rutinarias\n• **Baja energía**: Organización, lectura, planificación\n\n**2. Renovación de energía:**\n• **Micro-descansos**: 5-10 min cada hora\n• **Descansos de movimiento**: Caminar, estirar\n• **Descansos de naturaleza**: Tiempo al aire libre\n• **Descansos sociales**: Conexión breve con otros\n\n**3. Protección de energía:**\n• **Límites claros**: Di no a lo que drena tu energía\n• **Transiciones**: Buffer entre actividades\n• **Recuperación**: Tiempo para restaurar después de esfuerzo\n• **Rituales**: Rutinas que restauran energía\n\n**Rituales de renovación:**\n\n• **Mañana**: Ejercicio, meditación, planificación\n• **Medio día**: Comida nutritiva, descanso activo\n• **Tarde**: Transición, revisión del día\n• **Noche**: Desconexión, reflexión, preparación para mañana\n\nLa gestión de energía es sobre trabajar con tu biología, no contra ella. Cuando respetas tus ritmos naturales, la productividad se vuelve sostenible y gratificante.',
  },
];

function ArticleCard({ article }: { article: typeof articles[0] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card 
      className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Imagen en la parte superior */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={article.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Contenido: Título y Metadata */}
      <CardContent className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {article.category} • {article.readTime}
        </p>

        {/* Contenido expandido */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <p className="text-muted-foreground text-sm">{article.description}</p>
            <div className="prose prose-sm max-w-none text-sm space-y-3">
              {article.content.split('\n\n').map((paragraph, index) => {
                const lines = paragraph.split('\n');
                const hasBullets = lines.some(line => line.trim().startsWith('• '));
                const hasBold = lines.some(line => line.trim().startsWith('**') && line.trim().endsWith('**'));
                
                // Si el párrafo tiene viñetas o contenido complejo, usar div
                if (hasBullets || hasBold) {
                  return (
                    <div key={index} className="mb-3 last:mb-0">
                      {lines.map((line, lineIndex) => {
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
                            <strong key={lineIndex} className="font-semibold block mb-1">
                              {line.trim().slice(2, -2)}
                            </strong>
                          );
                        }
                        if (line.trim()) {
                          return <p key={lineIndex} className="mb-1">{line}</p>;
                        }
                        return null;
                      })}
                    </div>
                  );
                }
                
                // Para párrafos simples, usar p directamente
                return (
                  <p key={index} className="mb-3 last:mb-0">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function LearnPage() {
  // Agrupar artículos por categoría
  const articlesByCategory = categories.reduce((acc, category) => {
    const categoryArticles = articles.filter(article => article.category === category);
    if (categoryArticles.length > 0) {
      acc[category] = categoryArticles;
    }
    return acc;
  }, {} as Record<string, typeof articles>);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl mb-2">Aprender</h1>
        <p className="text-muted-foreground">
          Artículos informativos para mejorar tu bienestar y productividad
        </p>
      </div>

      {/* Secciones por categoría con carruseles */}
      <div className="flex flex-col gap-8">
        {categories.map((category) => {
          const categoryArticles = articlesByCategory[category];
          if (!categoryArticles || categoryArticles.length === 0) {
            return null;
          }

          return (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold">{category}</h2>
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {categoryArticles.map((article) => (
                    <CarouselItem key={article.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                      <ArticleCard article={article} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {categoryArticles.length > 1 && (
                  <>
                    <CarouselPrevious className="hidden md:flex -left-12" />
                    <CarouselNext className="hidden md:flex -right-12" />
                  </>
                )}
              </Carousel>
            </div>
          );
        })}
      </div>
    </div>
  );
}
