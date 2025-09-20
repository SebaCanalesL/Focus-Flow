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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Habit } from "@/lib/types";
import { Switch } from "../ui/switch";
import { Bell, Clock } from "lucide-react";
import { updateHabit, deleteHabit } from "@/lib/db/habits";

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

export function EditHabitDialog({ habit, children }: { habit: Habit, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAppData();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: habit.name,
      frequency: habit.frequency,
      daysPerWeek: habit.daysPerWeek,
      reminderEnabled: habit.reminderEnabled || false,
      reminderTime: habit.reminderTime || "09:00",
    },
  });

  const frequency = form.watch("frequency");
  const daysPerWeek = form.watch("daysPerWeek");
  const reminderEnabled = form.watch("reminderEnabled");

  useEffect(() => {
    form.reset({
        name: habit.name,
        frequency: habit.frequency,
        daysPerWeek: habit.daysPerWeek || (habit.frequency === 'daily' ? 7 : undefined),
        reminderEnabled: habit.reminderEnabled || false,
        reminderTime: habit.reminderTime || "09:00",
    });
  }, [habit, form, isOpen]);

  useEffect(() => {
    if(daysPerWeek === 7) {
        form.setValue("frequency", "daily");
    }
  }, [daysPerWeek, form]);
  
  useEffect(() => {
    if(frequency === "daily") {
        form.setValue("daysPerWeek", 7);
    } else if (frequency === 'weekly' && daysPerWeek === 7) {
        form.setValue("daysPerWeek", 6);
    }
  }, [frequency, daysPerWeek, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    await updateHabit(user.uid, habit.id, {
      name: values.name,
      frequency: values.frequency,
      daysPerWeek: values.frequency === 'weekly' ? values.daysPerWeek : undefined,
      reminderEnabled: values.reminderEnabled,
      reminderTime: values.reminderEnabled ? values.reminderTime : undefined,
    });

    toast({
      title: "¡Hábito Actualizado!",
      description: `El hábito "${values.name}" ha sido actualizado.`,
    });
    
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (!user) return;
    await deleteHabit(user.uid, habit.id);
    toast({
        title: "¡Hábito Eliminado!",
        description: `El hábito "${habit.name}" ha sido eliminado.`,
        variant: "destructive"
      });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Hábito</DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu hábito.
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
            
            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto">Eliminar Hábito</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de que quieres eliminar este hábito?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu hábito y todo su historial de progreso.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              <Button type="submit" className="w-full sm:w-auto">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
