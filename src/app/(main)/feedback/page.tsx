"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim().length === 0) {
      toast({
        title: "Comentario vacío",
        description: "Por favor, escribe tu feedback antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    const recipient = "s.canales123@gmail.com";
    const subject = "Feedback para FocusFlow";
    const body = encodeURIComponent(feedback);

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    
    toast({
        title: "¡Gracias por tu feedback!",
        description: "Se está abriendo tu cliente de correo para que puedas enviar tu comentario.",
    });

    setFeedback("");
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
      <Card className="max-w-2xl mx-auto w-full">
        <CardHeader>
          <CardTitle>Envíanos tus comentarios</CardTitle>
          <CardDescription>
            Tu opinión es muy importante para nosotros. ¡Ayúdanos a mejorar FocusFlow!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSendFeedback}>
          <CardContent>
            <div className="grid w-full gap-2">
              <Label htmlFor="feedback-textarea">Tu comentario</Label>
              <Textarea
                id="feedback-textarea"
                placeholder="Escribe aquí lo que piensas, alguna idea o un problema que encontraste..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={8}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full sm:w-auto">
              <Send className="mr-2 h-4 w-4" />
              Enviar Feedback
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
