"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppData } from "@/contexts/app-provider"
import { format, addDays, subDays, isToday, addMonths } from "date-fns"
import { es } from "date-fns/locale"
import * as LucideIcons from "lucide-react";
import { Target, ChevronLeft, ChevronRight, BookHeart } from "lucide-react"
import { Button } from "../ui/button"
import styles from "@/styles/calendar.module.css"

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target className={className} />;
  return <LucideIcon className={className} />;
};

export function HistoryView() {
  const { gratitudeEntries, habits, isClient } = useAppData()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [month, setMonth] = useState<Date>(new Date())

  const selectedDateString = date ? format(date, "yyyy-MM-dd") : ""

  const selectedGratitudeEntry = gratitudeEntries.find(
    (entry) => entry.dateKey === selectedDateString
  )
  
  const gratitudeItems = selectedGratitudeEntry?.content.split('\n').filter(item => item.trim() !== '') || [];
  const gratitudeNote = selectedGratitudeEntry?.note;


  const completedHabitsOnDate = habits.filter((habit) =>
    habit.completedDates.includes(selectedDateString)
  )

  // Fix: Parse dates safely to avoid timezone issues
  const gratitudeDays = (gratitudeEntries || []).map(entry => {
    const [year, month, day] = entry.dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  const habitDays = (habits || []).flatMap(habit => 
    (habit.completedDates || []).map(d => {
        const [year, month, day] = d.split('-').map(Number);
        return new Date(year, month - 1, day);
    })
  );

  const handlePrevDay = () => {
    if (date) {
      setDate(subDays(date, 1));
    }
  };

  const handleNextDay = () => {
    if (date && !isToday(date)) {
      setDate(addDays(date, 1));
    }
  };


  if (!isClient) {
    return <div className="h-96 bg-muted rounded-md w-full animate-pulse" />;
  }
  
  return (
    <Tabs defaultValue="gratitude" className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex">
        <TabsTrigger value="gratitude">Historial de Gratitud</TabsTrigger>
        <TabsTrigger value="habits">Historial de Hábitos</TabsTrigger>
      </TabsList>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TabsContent value="gratitude" className="mt-0 lg:col-span-3 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <div className="md:col-span-1">
                <Card>
                    <CardContent className={`relative p-0 ${styles.calendarRoot}`}>
                      <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                        <button
                          aria-label="Mes anterior"
                          onClick={() => setMonth(m => addMonths(m, -1))}
                          className="h-8 w-8 rounded-md border border-border/50 bg-transparent hover:bg-accent/20"
                        >
                          <ChevronLeft className="mx-auto h-4 w-4" />
                        </button>
                        <button
                          aria-label="Mes siguiente"
                          onClick={() => setMonth(m => addMonths(m, 1))}
                          className="h-8 w-8 rounded-md border border-border/50 bg-transparent hover:bg-accent/20"
                        >
                          <ChevronRight className="mx-auto h-4 w-4" />
                        </button>
                      </div>
                         <Calendar
                            hideNav
                            month={month}
                            onMonthChange={setMonth}
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            locale={es}
                            weekStartsOn={1}
                            className="p-3 pt-10"
                            modifiers={{ highlighted: gratitudeDays }}
                            modifiersClassNames={{
                                highlighted: 'bg-primary/20 text-primary-foreground rounded-full',
                            }}
                          />
                    </CardContent>
                </Card>
            </div>
          <div className="md:col-span-1 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    Entrada del {date ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : "..."} 🙏✨️
                  </span>
                   <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevDay}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextDay} disabled={date ? isToday(date) : false}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedGratitudeEntry ? (
                    <div className="space-y-4">
                        <ul className="space-y-2">
                            {gratitudeItems.map((item, index) => (
                                <li key={index} className="p-3 bg-primary/10 rounded-md text-sm text-card-foreground/90">
                                    {index + 1}. {item}
                                </li>
                            ))}
                        </ul>
                        {gratitudeNote && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><BookHeart className="h-4 w-4" /> Otras reflexiones</h4>
                                <p className="p-3 bg-secondary/50 rounded-md text-sm text-card-foreground/90 whitespace-pre-wrap">{gratitudeNote}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No hay entrada para este día.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="habits" className="mt-0 lg:col-span-3 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <div className="md:col-span-1">
                 <Card>
                    <CardContent className={`relative p-0 ${styles.calendarRoot}`}>
                        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                          <button
                            aria-label="Mes anterior"
                            onClick={() => setMonth(m => addMonths(m, -1))}
                            className="h-8 w-8 rounded-md border border-border/50 bg-transparent hover:bg-accent/20"
                          >
                            <ChevronLeft className="mx-auto h-4 w-4" />
                          </button>
                          <button
                            aria-label="Mes siguiente"
                            onClick={() => setMonth(m => addMonths(m, 1))}
                            className="h-8 w-8 rounded-md border border-border/50 bg-transparent hover:bg-accent/20"
                          >
                            <ChevronRight className="mx-auto h-4 w-4" />
                          </button>
                        </div>
                        <Calendar
                            hideNav
                            month={month}
                            onMonthChange={setMonth}
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            locale={es}
                            weekStartsOn={1}
                            className="p-3 pt-10"
                            modifiers={{ highlighted: habitDays }}
                            modifiersClassNames={{
                                highlighted: 'bg-primary/20 text-primary-foreground rounded-full',
                            }}
                          />
                    </CardContent>
                </Card>
            </div>
           <div className="md:col-span-1 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    Hábitos del {date ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : "..."} 🎯
                  </span>
                   <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevDay}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextDay} disabled={date ? isToday(date) : false}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedHabitsOnDate.length > 0 ? (
                  <ul className="space-y-2">
                    {completedHabitsOnDate.map((habit) => (
                      <li key={habit.id} className="flex items-center gap-2 text-sm p-2 bg-secondary/50 rounded-md">
                        <Icon name={habit.icon as IconName} className="h-4 w-4 text-primary" />
                        {habit.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No se completaron hábitos este día.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}
