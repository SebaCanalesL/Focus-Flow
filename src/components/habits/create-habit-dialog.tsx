"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppData } from "@/contexts/app-provider"
import type { Frequency } from "@/lib/types"
import { PlusCircle, Target } from "lucide-react"
import * as LucideIcons from "lucide-react";

const iconNames = Object.keys(LucideIcons).filter(key => /^[A-Z]/.test(key) && key !== 'default' && key !== 'createLucideIcon' && key !== 'icons');
type IconName = keyof typeof LucideIcons;

const Icon = ({ name, ...props }: { name: IconName;[key: string]: any }) => {
  const LucideIcon = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target {...props} />;
  return <LucideIcon {...props} />;
};


export function CreateHabitDialog() {
  const { addHabit } = useAppData()
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("Target")
  const [frequency, setFrequency] = useState<Frequency>("daily")
  const [daysPerWeek, setDaysPerWeek] = useState<number | undefined>(5);
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      addHabit({ 
        name, 
        icon, 
        frequency,
        daysPerWeek: frequency === 'weekly' ? daysPerWeek : undefined,
      })
      setName("")
      setIcon("Target")
      setFrequency("daily")
      setDaysPerWeek(5);
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new habit</DialogTitle>
            <DialogDescription>
              Add a new habit to track. Choose a name, icon, and how often you want to do it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Meditate for 10 minutes"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
               <Select onValueChange={setIcon} defaultValue={icon}>
                <SelectTrigger className="col-span-3">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                       <Icon name={icon as IconName} className="h-4 w-4" />
                       {icon}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                   {iconNames.map(iconName => (
                    <SelectItem key={iconName} value={iconName}>
                       <div className="flex items-center gap-2">
                          <Icon name={iconName as IconName} className="h-4 w-4" />
                          {iconName}
                       </div>
                    </SelectItem>
                   ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Frequency
              </Label>
              <Select onValueChange={(v) => setFrequency(v as Frequency)} defaultValue={frequency}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {frequency === 'weekly' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="days-per-week" className="text-right">
                  Days / Week
                </Label>
                <Input
                  id="days-per-week"
                  type="number"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(parseInt(e.target.value, 10))}
                  className="col-span-3"
                  placeholder="e.g. 5"
                  min="1"
                  max="7"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create Habit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
