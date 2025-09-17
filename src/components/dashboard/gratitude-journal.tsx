"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/contexts/app-provider"
import { BookHeart, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function GratitudeJournal() {
  const { addGratitudeEntry, getGratitudeEntry } = useAppData()
  const [content, setContent] = useState("")
  const today = new Date()
  const { toast } = useToast()

  useEffect(() => {
    const entry = getGratitudeEntry(today)
    if (entry) {
      setContent(entry.content)
    }
  }, [getGratitudeEntry, today])

  const handleSave = () => {
    if (content.trim()) {
      addGratitudeEntry(content, today)
      toast({
        title: "Entry Saved!",
        description: "Your gratitude entry has been saved.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookHeart className="text-primary" />
          Daily Gratitude
        </CardTitle>
        <CardDescription>What are three things you're grateful for today?</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="1. ...
2. ...
3. ..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Entry
        </Button>
      </CardFooter>
    </Card>
  )
}
