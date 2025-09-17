"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppData } from "@/contexts/app-provider"
import { format } from "date-fns"
import * as LucideIcons from "lucide-react";
import { Target } from "lucide-react"

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target className={className} />;
  return <LucideIcon className={className} />;
};

export function HistoryView() {
  const { gratitudeEntries, habits, isClient } = useAppData()
  const [date, setDate] = useState<Date | undefined>(new Date())

  const selectedDateString = date ? format(date, "yyyy-MM-dd") : ""

  const selectedGratitudeEntry = gratitudeEntries.find(
    (entry) => entry.date === selectedDateString
  )

  const completedHabitsOnDate = habits.filter((habit) =>
    habit.completedDates.includes(selectedDateString)
  )

  // Fix: Parse dates safely to avoid timezone issues
  const gratitudeDays = (gratitudeEntries || []).map(entry => {
    const [year, month, day] = entry.date.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  const habitDays = (habits || []).flatMap(habit => 
    (habit.completedDates || []).map(d => {
        const [year, month, day] = d.split('-').map(Number);
        return new Date(year, month - 1, day);
    })
  );


  if (!isClient) {
    return <div className="h-96 bg-muted rounded-md w-full animate-pulse" />;
  }
  
  return (
    <Tabs defaultValue="gratitude" className="space-y-4">
      <TabsList>
        <TabsTrigger value="gratitude">Gratitude History</TabsTrigger>
        <TabsTrigger value="habits">Habit History</TabsTrigger>
      </TabsList>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TabsContent value="gratitude" className="lg:col-span-3 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card>
                    <CardContent className="p-0">
                         <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            modifiers={{ highlighted: gratitudeDays }}
                            modifiersClassNames={{
                                highlighted: 'bg-primary/20 text-primary-foreground rounded-full',
                            }}
                            className="p-3"
                            weekStartsOn={1}
                          />
                    </CardContent>
                </Card>
            </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Gratitude Entry for {date ? format(date, "MMMM d, yyyy") : "..."}
                </CardTitle>
              </CardHeader>
              <CardContent style={{whiteSpace: 'pre-line'}}>
                {selectedGratitudeEntry ? selectedGratitudeEntry.content : "No entry for this day."}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="habits" className="lg:col-span-3 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1">
                 <Card>
                    <CardContent className="p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            modifiers={{ highlighted: habitDays }}
                            modifiersClassNames={{
                                highlighted: 'bg-primary/20 text-primary-foreground rounded-full',
                            }}
                            className="p-3"
                            weekStartsOn={1}
                          />
                    </CardContent>
                </Card>
            </div>
           <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Completed Habits on {date ? format(date, "MMMM d, yyyy") : "..."}
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
                  "No habits completed on this day."
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}
