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
import { BookHeart, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function GratitudeJournal() {
  const { addGratitudeEntry, getGratitudeEntry } = useAppData()
  const [content, setContent] = useState("")
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  const { toast } = useToast()

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    if (currentDate) {
      const entry = getGratitudeEntry(currentDate)
      if (entry) {
        setContent(entry.content)
      } else {
        setContent("")
      }
    }
  }, [getGratitudeEntry, currentDate])

  const handleSave = () => {
    if (content.trim() && currentDate) {
      addGratitudeEntry(content, currentDate)
      toast({
        title: "¡Entrada guardada!",
        description: "Tu entrada de gratitud ha sido guardada.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookHeart className="text-primary" />
          Gratitud Diaria
        </CardTitle>
        <CardDescription>¿Cuáles son tres cosas por las que estás agradecido hoy?</CardDescription>
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
          <Sparkles className="mr-2 h-4 w-4" />
          Guardar lo bonito de hoy
        </Button>
      </CardFooter>
    </Card>
  )
}
