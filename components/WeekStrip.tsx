"use client";

import { localDateKey } from "@/lib/date";

// Renders the real current week (Mon–Sun) using the user's actual local
// date in their detected timezone, and marks which of those real calendar
// days had at least one habit completed — driven by rows in habit_logs.
export default function WeekStrip({
  completedDates,
  timeZone,
}: {
  completedDates: Set<string>;
  timeZone: string;
}) {
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const todayKey = localDateKey(today, timeZone);

  return (
    <div className="flex justify-between rounded-xl border border-line bg-surface px-3 py-3.5">
      {days.map((d, i) => {
        const key = localDateKey(d, timeZone);
        const isToday = key === todayKey;
        const isFuture = key > todayKey;
        const done = completedDates.has(key);
        return (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted">{labels[i]}</span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold"
              style={{
                background: done ? "#34D399" : isToday ? "#1A2230" : "transparent",
                color: done ? "#0A0E14" : isToday ? "#F1F3F5" : isFuture ? "#3A4250" : "#8B93A1",
                border: isToday && !done ? "2px solid #3B7CFF" : "1px solid transparent",
              }}
            >
              {d.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
