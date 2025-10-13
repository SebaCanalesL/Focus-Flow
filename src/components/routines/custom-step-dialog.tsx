'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";

export interface CustomStep {
  id: string;
  title: string;
  description: string;
  duration?: string;
  isCustom: true;
}

export interface PredefinedStep {
  id: string;
  title: string;
  description: string;
  isCustom?: false;
}

export type EditableStep = CustomStep | PredefinedStep;

export function CustomStepDialog({
  children,
  onSave,
  stepToEdit,
  triggerText = "Agregar paso personalizado",
}: {
  children?: React.ReactNode;
  onSave: (step: CustomStep) => void;
  stepToEdit?: CustomStep;
  triggerText?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");

  const isEditMode = stepToEdit != null;

  // Initialize form when dialog opens or stepToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && stepToEdit) {
        setTitle(stepToEdit.title);
        setDescription(stepToEdit.description);
        setDuration(stepToEdit.duration || "");
      } else {
        setTitle("");
        setDescription("");
        setDuration("");
      }
    }
  }, [isOpen, isEditMode, stepToEdit]);

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    const customStep: CustomStep = {
      id: isEditMode ? stepToEdit!.id : `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      duration: duration.trim() || undefined,
      isCustom: true,
    };

    onSave(customStep);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when closing
      setTitle("");
      setDescription("");
      setDuration("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full">
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar paso personalizado" : "Agregar paso personalizado"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del paso</Label>
            <Input
              id="title"
              placeholder="Ej: Meditación matutina"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe qué hacer en este paso..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (opcional)</Label>
            <Input
              id="duration"
              placeholder="Ej: 10 min, 5-10 min"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || !description.trim()}
          >
            {isEditMode ? "Guardar cambios" : "Agregar paso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component for editing any type of step
export function EditStepDialog({
  children,
  onSave,
  stepToEdit,
}: {
  children?: React.ReactNode;
  onSave: (step: EditableStep) => void;
  stepToEdit?: EditableStep;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");

  const isEditMode = stepToEdit != null;
  const isCustomStep = stepToEdit?.isCustom === true;

  // Initialize form when dialog opens or stepToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && stepToEdit) {
        setTitle(stepToEdit.title);
        setDescription(stepToEdit.description);
        setDuration(isCustomStep ? (stepToEdit as CustomStep).duration || "" : "");
      } else {
        setTitle("");
        setDescription("");
        setDuration("");
      }
    }
  }, [isOpen, isEditMode, stepToEdit, isCustomStep]);

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    if (isCustomStep) {
      // Editing a custom step
      const customStep: CustomStep = {
        id: stepToEdit!.id,
        title: title.trim(),
        description: description.trim(),
        duration: duration.trim() || undefined,
        isCustom: true,
      };
      onSave(customStep);
    } else {
      // Editing a predefined step - convert to custom step
      const customStep: CustomStep = {
        id: stepToEdit!.id,
        title: title.trim(),
        description: description.trim(),
        duration: duration.trim() || undefined,
        isCustom: true,
      };
      onSave(customStep);
    }
    
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when closing
      setTitle("");
      setDescription("");
      setDuration("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full">
            Editar paso
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar paso" : "Agregar paso personalizado"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del paso</Label>
            <Input
              id="title"
              placeholder="Ej: Meditación matutina"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe qué hacer en este paso..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (opcional)</Label>
            <Input
              id="duration"
              placeholder="Ej: 10 min, 5-10 min"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || !description.trim()}
          >
            {isEditMode ? "Guardar cambios" : "Agregar paso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component for editing existing custom steps
export function EditCustomStepButton({
  step,
  onSave,
}: {
  step: CustomStep;
  onSave: (step: CustomStep) => void;
}) {
  return (
    <CustomStepDialog stepToEdit={step} onSave={onSave}>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Pencil className="h-4 w-4" />
      </Button>
    </CustomStepDialog>
  );
}

// Component for editing any step (predefined or custom)
export function EditStepButton({
  step,
  onSave,
}: {
  step: EditableStep;
  onSave: (step: EditableStep) => void;
}) {
  return (
    <EditStepDialog stepToEdit={step} onSave={onSave}>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Pencil className="h-4 w-4" />
      </Button>
    </EditStepDialog>
  );
}
