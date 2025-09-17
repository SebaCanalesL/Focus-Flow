"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Slider } from "@/components/ui/slider";
import { useAppData } from "@/contexts/app-provider";
import { cn } from "@/lib/utils";
import { PlusCircle, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const habitColors = [
  "hsl(var(--primary))",
  "#4ade80",
  "#facc15",
  "#fb923c",
  "#f87171",
  "#60a5fa",
];

const formSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    frequency: z.enum(["daily", "weekly"], {
      required_error: "Debes seleccionar una frecuencia.",
    }),
    daysPerWeek: z.number().min(1).max(7).optional(),
    color: z.string().min(1, "Debes seleccionar un color."),
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
  );

export function CreateHabitDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { addHabit } = useAppData();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      frequency: "daily",
      color: habitColors[0],
    },
  });

  const frequency = form.watch("frequency");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addHabit({
      name: values.name,
      frequency: values.frequency,
      color: values.color,
      daysPerWeek: values.daysPerWeek,
      // Icon is assigned automatically for now
      icon: "Target",
    });

    toast({
      title: "¡Hábito Creado!",
      description: `El hábito "${values.name}" ha sido añadido a tu lista.`,
    });
    
    setIsOpen(false);
    form.reset();
     form.reset({
      name: "",
      frequency: "daily",
      color: habitColors[0],
    });
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
            Completa los detalles de tu nuevo hábito.
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
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="daily" />
                        </FormControl>
                        <FormLabel className="font-normal">Diaria</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="weekly" />
                        </FormControl>
                        <FormLabel className="font-normal">Semanal</FormLabel>
                      </FormItem>
                    </RadioGroup>
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
                    <FormLabel>Días a la semana ({field.value || 3})</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={7}
                        step={1}
                        defaultValue={[field.value || 3]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Color</FormLabel>
                     <FormControl>
                       <div className="flex gap-2">
                        {habitColors.map(color => (
                            <button
                                type="button"
                                key={color}
                                className={cn("h-8 w-8 rounded-full border-2 transition-all",
                                field.value === color ? 'border-foreground' : 'border-transparent'
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                            />
                        ))}
                       </div>
                    </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Crear Hábito</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
