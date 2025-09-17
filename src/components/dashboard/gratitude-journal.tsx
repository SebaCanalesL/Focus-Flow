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
import { BookHeart, Sparkles, WandSparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function MotivationalMessage({ userName }: { userName: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { getTodaysMotivation } = useAppData();

  useEffect(() => {
    const fetchMessage = async () => {
      setLoading(true);
      try {
        const motivation = await getTodaysMotivation(userName);
        setMessage(motivation);
      } catch (error) {
        console.error("Error fetching motivational message:", error);
        setMessage("¡Sigue así! Mañana te espera un nuevo día para agradecer.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [userName, getTodaysMotivation]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <WandSparkles className="h-4 w-4" />
        Generando tu frase del día...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm text-primary-foreground bg-primary/90 rounded-lg p-3">
        <WandSparkles className="h-6 w-6" />
        <p className="font-medium">{message}</p>
    </div>
  );
}


export function GratitudeJournal() {
  const { user, addGratitudeEntry, getGratitudeEntry } = useAppData()
  const [content, setContent] = useState("")
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const { toast } = useToast()

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    if (currentDate) {
      const entry = getGratitudeEntry(currentDate)
      if (entry) {
        setContent(entry.content)
        setIsSaved(true);
      } else {
        setContent("")
        setIsSaved(false);
      }
    }
  }, [getGratitudeEntry, currentDate])

  const handleSave = () => {
    if (content.trim() && currentDate) {
      addGratitudeEntry(content, currentDate)
      setIsSaved(true);
      toast({
        title: "¡Entrada guardada!",
        description: "Tu entrada de gratitud ha sido guardada.",
      })
    }
  }
  
  const getUsername = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Hola';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookHeart className="text-primary" />
          Gratitud diaria
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
          disabled={isSaved}
        />
      </CardContent>
      <CardFooter>
        {!isSaved ? (
            <Button onClick={handleSave}>
              <Sparkles className="mr-2 h-4 w-4" />
              Guardar lo bonito de hoy
            </Button>
        ) : (
            <MotivationalMessage userName={getUsername()} />
        )}
      </CardFooter>
    </Card>
  )
}
