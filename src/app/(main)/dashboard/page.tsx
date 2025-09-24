'use client';

import { HabitTracker } from '@/components/dashboard/habit-tracker';
import { GratitudeTracker } from '@/components/dashboard/gratitude-journal';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <GratitudeTracker />
      <HabitTracker />
    </div>
  );
}
