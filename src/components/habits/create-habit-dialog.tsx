"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppData } from "@/contexts/app-provider";
import { PlusCircle, WandSparkles, Bell, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { suggestHabitIcon } from "@/ai/flows/suggest-habit-icon-flow";
import { Switch } from "../ui/switch";
import { createHabit } from "@/lib/db/habits";

const formSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    frequency: z.enum(["daily", "weekly"], {
      required_error: "Debes seleccionar una frecuencia.",
    }),
    daysPerWeek: z.number().min(1).max(7).optional(),
    reminderEnabled: z.boolean().default(false),
    reminderTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.frequency === "weekly") {
        return data.daysPerWeek !== undefined && data.daysPerWeek >= 1;
      }
      return true;
    },
    {
      message: "Debes especificar cuántos días a la semana.",
      path: ["daysPerWeek"],
    }
  ).refine(
    (data) => {
        if (data.reminderEnabled) {
            return !!data.reminderTime;
        }
        return true;
    },
    {
        message: "Debes seleccionar una hora para el recordatorio.",
        path: ["reminderTime"],
    }
  );

export function CreateHabitDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAppData();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      frequency: "daily",
      reminderEnabled: false,
      reminderTime: "09:00",
    },
  });

  const frequency = form.watch("frequency");
  const daysPerWeek = form.watch("daysPerWeek");
  const reminderEnabled = form.watch("reminderEnabled");

  useEffect(() => {
    if (daysPerWeek === 7) {
      form.setValue("frequency", "daily");
    }
  }, [daysPerWeek, form]);

  useEffect(() => {
    if (frequency === "daily") {
      form.setValue("daysPerWeek", 7);
    } else if (frequency === 'weekly' && daysPerWeek === 7) {
      form.setValue("daysPerWeek", 6);
    }
  }, [frequency, daysPerWeek, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { iconName } = await suggestHabitIcon({ habitName: values.name });

      await createHabit(user.uid, {
        name: values.name,
        frequency: values.frequency,
        daysPerWeek: values.frequency === 'weekly' ? values.daysPerWeek : undefined,
        icon: iconName,
        reminderEnabled: values.reminderEnabled,
        reminderTime: values.reminderEnabled ? values.reminderTime : undefined,
      });

      toast({
        title: "¡Hábito Creado!",
        description: `El hábito "${values.name}" ha sido añadido a tu lista.`,
      });

      setIsOpen(false);
      form.reset({
        name: "",
        frequency: "daily",
        reminderEnabled: false,
        reminderTime: "09:00",
      });
    } catch (error) {
      console.error("Error creating habit:", error);
      // Fallback for when AI fails
      await createHabit(user.uid, {
        name: values.name,
        frequency: values.frequency,
        daysPerWeek: values.frequency === 'weekly' ? values.daysPerWeek : undefined,
        icon: "Target", // Default icon
        reminderEnabled: values.reminderEnabled,
        reminderTime: values.reminderEnabled ? values.reminderTime : undefined,
      });
      toast({
        title: "¡Hábito Creado!",
        description: `El hábito "${values.name}" fue creado (no se pudo sugerir un ícono).`,
        variant: "default",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Hábito
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear un nuevo hábito</DialogTitle>
          <DialogDescription>
            Completa los detalles de tu nuevo hábito y la IA sugerirá un ícono para ti.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Hábito</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Leer por 15 minutos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Frecuencia</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={field.value === 'daily' ? 'default' : 'outline'}
                        onClick={() => field.onChange('daily')}
                      >
                        Diaria
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === 'weekly' ? 'default' : 'outline'}
                        onClick={() => field.onChange('weekly')}
                      >
                        Semanal
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {frequency === "weekly" && (
              <FormField
                control={form.control}
                name="daysPerWeek"
                defaultValue={3}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días a la semana</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        className="grid grid-cols-6 gap-2 pt-2 justify-center"
                      >
                        {[...Array(6)].map((_, i) => (
                          <FormItem key={i + 1}>
                            <FormControl>
                              <RadioGroupItem value={(i + 1).toString()} className="sr-only" />
                            </FormControl>
                            <FormLabel className={cn(
                              "cursor-pointer rounded-full border-2 border-transparent px-3 py-1 transition-colors flex items-center justify-center",
                              field.value === i + 1
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted hover:bg-muted/80"
                            )}>
                              {i + 1}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="space-y-4 rounded-lg border p-4">
                <FormField
                control={form.control}
                name="reminderEnabled"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                         <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Recordatorio
                            </FormLabel>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
                />
                {reminderEnabled && (
                  <FormField
                    control={form.control}
                    name="reminderTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora del recordatorio</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="time" {...field} className="pr-10" />
                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
            </div>


            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <WandSparkles className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Hábito"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
