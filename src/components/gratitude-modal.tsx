'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAppData } from '@/contexts/app-provider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { format, toZoned, isToday, parseISO } from '@/lib/dates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil2Icon, Cross2Icon, SparklesIcon } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';
import { GratitudeEntry } from '@/lib/types';

interface GratitudeModalProps {
  date: Date;
  onClose: () => void;
}

export function GratitudeModal({ date, onClose }: GratitudeModalProps) {
  const { getGratitudeEntry, addGratitudeEntry, todaysMotivation } = useAppData();
  const [entry, setEntry] = useState<GratitudeEntry | null | undefined>(null);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const existingEntry = getGratitudeEntry(date);
    setEntry(existingEntry);
    setContent(existingEntry?.content || '');
    setIsEditing(!existingEntry);
  }, [date, getGratitudeEntry]);

  const handleSave = async () => {
    await addGratitudeEntry(content, date, undefined, todaysMotivation || undefined);
    const existingEntry = getGratitudeEntry(date);
    setEntry(existingEntry);
    setIsEditing(false);
  };

  const gratitudeItems = useMemo(() => {
    if (!entry || !entry.content) return [];
    return entry.content.split('\n').map((item, index) => item.trim());
  }, [entry]);

  const canEdit = isToday(toZoned(date));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <span className="mr-2 text-2xl">♡</span>
            <span>Gratitud del {format(date, 'd MMMM')}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Cross2Icon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="1. Agradezco por...\n2. Hoy fue un buen día porque...\n3. Me siento feliz de..."
                className="h-32"
              />
              <Button onClick={handleSave} className="w-full">Guardar</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {entry?.motivation && (
                <>
                  <div className="text-sm text-gray-400 italic px-4 py-3 bg-gray-800 rounded-lg flex items-center">
                    <SparklesIcon className="mr-2 h-4 w-4 text-yellow-400" />
                    <p>{entry.motivation}</p>
                  </div>
                  <Separator />
                </>
              )}
              <ul className="space-y-2 text-sm list-decimal list-inside">
                {gratitudeItems.map((item, index) => (
                  <li key={index}>{item.split('. ').slice(1).join('. ')}</li>
                ))}
              </ul>
              {canEdit && (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">
                  <Pencil2Icon className="mr-2 h-4 w-4" /> Editar
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
