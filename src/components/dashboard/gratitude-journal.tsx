
"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/contexts/app-provider"
import { BookHeart, WandSparkles, Pencil, PlusCircle, X, StickyNote } from "lucide-react"
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
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast()
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    if (currentDate) {
      const entry = getGratitudeEntry(currentDate)
      if (entry) {
        const items = entry.content.split('\n').filter(item => item.trim() !== '');
        setGratitudeItems(items.length >= 3 ? items : ["", "", ""]);
        setNote(entry.note || "");
        setShowNote(!!entry.note);
        setIsSaved(true);
      } else {
        setGratitudeItems(["", "", ""]);
        setNote("");
        setShowNote(false);
        setIsSaved(false);
      }
    }
  }, [getGratitudeEntry, currentDate])

  useEffect(() => {
    if(!isSaved) {
        const lastIndex = gratitudeItems.length - 1;
        const lastInput = inputRefs.current[lastIndex];
        if (lastInput) {
            const previousIndex = lastIndex - 1;
            if (previousIndex >= 0 && gratitudeItems[previousIndex] !== "") {
                 lastInput.focus();
            }
        }
    }
  }, [gratitudeItems.length, isSaved]);


  const handleSave = () => {
    const contentToSave = gratitudeItems.map(item => item.trim()).filter(item => item !== '').join('\n');
    if ((contentToSave || note) && currentDate) {
      addGratitudeEntry(contentToSave, currentDate, note)
      setIsSaved(true);
      toast({
        title: "¡Entrada guardada!",
        description: "Tu entrada de gratitud ha sido guardada.",
      })
    } else {
       toast({
        title: "Campos vacíos",
        description: "Escribe al menos un agradecimiento o una nota para guardar.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = () => {
    setIsSaved(false);
    if(gratitudeItems.length < 3) {
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
    if (gratitudeItems.length <= 3) return;
    const newItems = gratitudeItems.filter((_, i) => i !== index);
    setGratitudeItems(newItems);
    inputRefs.current = inputRefs.current.filter((_,i) => i !== index);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (index === gratitudeItems.length - 1) {
            addItem();
        } else {
            const nextInput = inputRefs.current[index + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
    } else if (e.key === 'Backspace') {
        if (gratitudeItems[index] === "" && index > 2) {
            e.preventDefault();
            removeItem(index);
            const prevInput = inputRefs.current[index - 1];
            if (prevInput) {
                prevInput.focus();
            }
        }
    }
  };

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
            <div className="flex items-center gap-2">
              {!isSaved && (
                <Button variant="ghost" size="icon" onClick={() => setShowNote(!showNote)} className="h-8 w-8">
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">Agregar Nota</span>
                </Button>
              )}
              {isSaved && (
                  <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                  </Button>
              )}
            </div>
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
           <div className="space-y-4">
                <ul className="space-y-2">
                    {gratitudeItems.map((item, index) => (
                      item && <li key={index} className="p-3 bg-primary/10 rounded-md text-sm text-card-foreground/90">
                          {index + 1}. {item}
                      </li>
                    ))}
                </ul>
                {note && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><StickyNote className="h-4 w-4" /> Otras reflexiones</h4>
                        <p className="p-3 bg-secondary/50 rounded-md text-sm text-card-foreground/90 whitespace-pre-wrap">{note}</p>
                    </div>
                )}
           </div>
        ) : (
          <div className="space-y-3">
            {gratitudeItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">{index + 1}.</span>
                <Input
                    ref={el => inputRefs.current[index] = el}
                    placeholder={`Agradecimiento #${index + 1}`}
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                />
                {index >= 2 && (
                     <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="h-9 w-9 shrink-0">
                        <X className="h-4 w-4" />
                    </Button>
                )}
              </div>
            ))}
             {showNote && (
                <div className="pt-2">
                    <Textarea 
                        placeholder="Escribe aquí una nota más extensa, tus reflexiones o lo que sientas..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                    />
                </div>
            )}
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
