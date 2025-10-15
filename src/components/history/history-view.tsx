'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomCalendar } from '@/components/ui/custom-calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppData } from '@/contexts/app-provider'
import { format, addDays, subDays, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import * as LucideIcons from 'lucide-react'
import { Target, ChevronLeft, ChevronRight, BookHeart, WandSparkles } from 'lucide-react'
import { Button } from '../ui/button'

type IconName = keyof typeof LucideIcons

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>
  if (!LucideIcon) return <Target className={className} />
  return <LucideIcon className={className} />
}

export function HistoryView() {
  const { gratitudeEntries, habits, isClient } = useAppData()
  const [date, setDate] = useState<Date | undefined>(new Date())

  const selectedDateString = date ? format(date, 'yyyy-MM-dd') : ''

  const selectedGratitudeEntry = gratitudeEntries.find(
    (entry) => entry.dateKey === selectedDateString
  )

  const gratitudeItems =
    selectedGratitudeEntry?.content.split('\n').filter((item) => item.trim() !== '') || []
  const gratitudeNote = selectedGratitudeEntry?.note
  const motivationalMessage = selectedGratitudeEntry?.motivation

  const completedHabitsOnDate = habits.filter((habit) =>
    habit.completedDates.includes(selectedDateString)
  )

  // Fix: Parse dates safely to avoid timezone issues
  const gratitudeDays = (gratitudeEntries || []).map((entry) => {
    const [year, month, day] = entry.dateKey.split('-').map(Number)
    return new Date(year, month - 1, day)
  })

  const habitDays = (habits || []).flatMap((habit) =>
    (habit.completedDates || []).map((d) => {
      const [year, month, day] = d.split('-').map(Number)
      return new Date(year, month - 1, day)
    })
  )

  const handlePrevDay = () => {
    if (date) {
      setDate(subDays(date, 1))
    }
  }

  const handleNextDay = () => {
    if (date && !isToday(date)) {
      setDate(addDays(date, 1))
    }
  }

  if (!isClient) {
    return <div className="h-96 bg-muted rounded-md w-full animate-pulse" />
  }

  return (
    <Tabs defaultValue="gratitude" className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex">
        <TabsTrigger value="gratitude">Historial de Gratitud</TabsTrigger>
        <TabsTrigger value="habits">Historial de Hábitos</TabsTrigger>
      </TabsList>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TabsContent
          value="gratitude"
          className="mt-0 lg:col-span-3 grid gap-6 md:grid-cols-1 lg:grid-cols-3"
        >
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                <CustomCalendar
                  selectedDates={date ? [date] : []}
                  onDateClick={setDate}
                  highlightedDates={gratitudeDays}
                  highlightColor="#3b82f6"
                  mode="single"
                  fullWidth={true}
                  className="border-0"
                />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    Agradecimientos del{' '}
                    {date ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : '...'}{' '}
                    🙏✨️
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevDay}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextDay}
                      disabled={date ? isToday(date) : false}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedGratitudeEntry ? (
                  <div className="space-y-4">
                    {motivationalMessage && (
                        <div className="flex items-center gap-3 text-sm text-primary-foreground bg-primary/90 rounded-lg p-3">
                            <WandSparkles className="h-6 w-6" />
                            <p className="font-medium">{motivationalMessage}</p>
                        </div>
                    )}
                    <ul className="space-y-2">
                      {gratitudeItems.map((item, index) => (
                        <li
                          key={index}
                          className="p-3 bg-primary/10 rounded-md text-sm text-card-foreground/90"
                        >
                          {index + 1}. {item}
                        </li>
                      ))}
                    </ul>
                    {gratitudeNote && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <BookHeart className="h-4 w-4" /> Otras reflexiones
                        </h4>
                        <p className="p-3 bg-secondary/50 rounded-md text-sm text-card-foreground/90 whitespace-pre-wrap">
                          {gratitudeNote}
                        </p>
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
        <TabsContent
          value="habits"
          className="mt-0 lg:col-span-3 grid gap-6 md:grid-cols-1 lg:grid-cols-3"
        >
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                <CustomCalendar
                  selectedDates={date ? [date] : []}
                  onDateClick={setDate}
                  highlightedDates={habitDays}
                  highlightColor="#10b981"
                  mode="single"
                  fullWidth={true}
                  className="border-0"
                />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    Hábitos cumplidos el {date ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : '...'}{' '}
                    🎯
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevDay}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextDay}
                      disabled={date ? isToday(date) : false}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedHabitsOnDate.length > 0 ? (
                  <ul className="space-y-2">
                    {completedHabitsOnDate.map((habit) => (
                      <li
                        key={habit.id}
                        className="flex items-center gap-2 text-sm p-2 bg-secondary/50 rounded-md"
                      >
                        <Icon name={habit.icon as IconName} className="h-4 w-4 text-primary" />
                        {habit.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No se completaron hábitos este día.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}
