"use client";

type Habit = {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  done: boolean;
};

export default function HabitCard({
  habit,
  onToggle,
  onDelete,
}: {
  habit: Habit;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 ${habit.done ? "opacity-80" : ""}`}
    >
      <button
        onClick={() => onToggle(habit.id, !habit.done)}
        aria-label={habit.done ? "Mark not done" : "Mark done"}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors"
        style={{
          borderColor: habit.done ? "#34D399" : "#232C3B",
          background: habit.done ? "#34D399" : "transparent",
        }}
      >
        {habit.done && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#0A0E14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span className="text-lg">{habit.emoji}</span>

      <button onClick={() => onToggle(habit.id, !habit.done)} className="flex-1 text-left">
        <span className={`text-[15px] font-semibold ${habit.done ? "text-muted line-through" : "text-ink"}`}>{habit.name}</span>
      </button>

      {habit.streak > 0 && (
        <span className="font-mono text-xs font-bold text-accent flex items-center gap-1">
          {habit.streak}d
        </span>
      )}

      <button
        onClick={() => onDelete(habit.id)}
        aria-label="Delete habit"
        className="text-muted hover:text-ink text-sm px-1"
      >
        ×
      </button>
    </div>
  );
}
