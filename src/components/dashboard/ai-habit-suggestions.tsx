"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2 } from "lucide-react"
import { useAppData } from "@/contexts/app-provider"
import { suggestHabitsFromEntries } from "@/ai/flows/suggest-habits-from-gratitude-entries"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "../ui/skeleton"

export function AiHabitSuggestions() {
  const { gratitudeEntries, addHabit } = useAppData()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleGetSuggestions = async () => {
    setIsLoading(true)
    setSuggestions([])
    const allEntries = gratitudeEntries.map(e => e.content).join("\n\n")
    if (!allEntries.trim()) {
      setSuggestions(["No gratitude entries found. Write some entries first to get suggestions."])
      setIsLoading(false)
      return
    }
    
    try {
      const result = await suggestHabitsFromEntries({ gratitudeEntries: allEntries })
      setSuggestions(result.suggestedHabits)
    } catch (error) {
      console.error("AI suggestion error:", error)
      setSuggestions(["Sorry, something went wrong while generating suggestions."])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" onClick={() => setIsOpen(true)}>
          <Sparkles className="mr-2 h-4 w-4" />
          Get AI Habit Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Wand2 /> AI-Powered Habit Suggestions</DialogTitle>
          <DialogDescription>
            Based on your gratitude entries, here are some habits you might enjoy.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {!isLoading && suggestions.length === 0 && (
             <Button onClick={handleGetSuggestions} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze my journal & suggest habits
            </Button>
          )}

          {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-4/5" />
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <Card>
                <CardContent className="p-4 space-y-2">
                    <ul className="list-disc list-inside space-y-2">
                        {suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
