
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/contexts/app-provider"
import { BookHeart, WandSparkles, Pencil, PlusCircle, X } from "lucide-react"
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
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse mb-4">
        <WandSparkles className="h-4 w-4" />
        Creando tu motivación diaria...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm text-primary-foreground bg-primary/90 rounded-lg p-3 mb-4">
        <WandSparkles className="h-6 w-6" />
        <p className="font-medium">{message}</p>
    </div>
  );
}


export function GratitudeJournal() {
  const { user, addGratitudeEntry, getGratitudeEntry } = useAppData()
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(["", "", ""]);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const { toast } = useToast()

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    if (currentDate) {
      const entry = getGratitudeEntry(currentDate)
      if (entry && entry.content) {
        setGratitudeItems(entry.content.split('\n').filter(item => item.trim() !== ''));
        setIsSaved(true);
      } else {
        setGratitudeItems(["", "", ""]);
        setIsSaved(false);
      }
    }
  }, [getGratitudeEntry, currentDate])

  const handleSave = () => {
    const contentToSave = gratitudeItems.map(item => item.trim()).filter(item => item !== '').join('\n');
    if (contentToSave && currentDate) {
      addGratitudeEntry(contentToSave, currentDate)
      setIsSaved(true);
      toast({
        title: "¡Entrada guardada!",
        description: "Tu entrada de gratitud ha sido guardada.",
      })
    } else {
       toast({
        title: "Agradecimientos vacíos",
        description: "Escribe al menos un agradecimiento para guardar.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = () => {
    setIsSaved(false);
    if(gratitudeItems.length === 0) {
      setGratitudeItems(["", "", ""]);
    }
  }
  
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...gratitudeItems];
    newItems[index] = value;
    setGratitudeItems(newItems);
  }

  const addItem = () => {
    setGratitudeItems([...gratitudeItems, ""]);
  }

  const removeItem = (index: number) => {
    const newItems = gratitudeItems.filter((_, i) => i !== index);
    setGratitudeItems(newItems);
  }

  const getUsername = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Hola';
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
            <BookHeart className="text-primary" />
            Gratitud diaria
            </CardTitle>
             {isSaved && (
                <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                </Button>
            )}
        </div>
        {!isSaved && (
            <CardDescription>¿Cuáles son las cosas por las que estás agradecido hoy?</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isSaved && (
            <MotivationalMessage userName={getUsername()} />
        )}
        {isSaved ? (
           <ul className="space-y-2">
            {gratitudeItems.map((item, index) => (
              <li key={index} className="p-3 bg-primary/10 rounded-md text-sm text-card-foreground/90">
                {index + 1}. {item}
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-3">
            {gratitudeItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">{index + 1}.</span>
                <Input
                    placeholder={`Agradecimiento #${index + 1}`}
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="h-9 w-9 shrink-0">
                    <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar agradecimiento
            </Button>
          </div>
        )}
      </CardContent>
      {!isSaved && (
        <CardFooter>
            <Button onClick={handleSave}>
              🙏 Agradecimiento y Abundancia ✨️
            </Button>
        </CardFooter>
      )}
    </Card>
  )
}
