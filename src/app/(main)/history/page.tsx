
"use client";

import { HistoryView } from "@/components/history/history-view";

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Mis registros ✍️</h1>
      <HistoryView />
    </div>
  );
}
