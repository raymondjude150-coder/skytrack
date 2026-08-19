"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { localDateKey, msUntilNextLocalMidnight, greetingForTimeZone, detectTimeZone } from "@/lib/date";
import ProgressRing from "@/components/ProgressRing";
import HabitCard from "@/components/HabitCard";
import WeekStrip from "@/components/WeekStrip";

type Habit = {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  done: boolean;
};

const EMOJIS = ["🎯", "📝", "💧", "📖", "🏃", "🧘", "🥗", "💪", "🌙", "⏰"];

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weekLogDates, setWeekLogDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const midnightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tz = useMemo(() => detectTimeZone(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    loadData();
  }, [session]);

  // Reschedules itself every time it fires, so the dashboard flips over to
  // a fresh, unchecked "today" automatically at the user's real local
  // midnight, even if the tab has been open since yesterday.
  useEffect(() => {
    if (!session) return;
    function scheduleMidnightRefresh() {
      const delay = msUntilNextLocalMidnight(tz);
      midnightTimer.current = setTimeout(() => {
        loadData();
        scheduleMidnightRefresh();
      }, delay);
    }
    scheduleMidnightRefresh();
    return () => {
      if (midnightTimer.current) clearTimeout(midnightTimer.current);
    };
  }, [session, tz]);

  async function loadData() {
    setLoading(true);
    const today = new Date();
    const todayKey = localDateKey(today, tz);

    const dayOfWeek = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    const mondayKey = localDateKey(monday, tz);

    const { data: habitRows } = await supabase
      .from("habits")
      .select("id, name, emoji, streak")
      .order("created_at", { ascending: true });

    const { data: weekLogs } = await supabase
      .from("habit_logs")
      .select("habit_id, log_date")
      .gte("log_date", mondayKey)
      .lte("log_date", todayKey);

    const doneToday = new Set((weekLogs ?? []).filter((l) => l.log_date === todayKey).map((l) => l.habit_id));
    const daysWithAnyCompletion = new Set((weekLogs ?? []).map((l) => l.log_date as string));

    setHabits(
      (habitRows ?? []).map((h) => ({
        id: h.id,
        name: h.name,
        emoji: h.emoji,
        streak: h.streak,
        done: doneToday.has(h.id),
      }))
    );
    setWeekLogDates(daysWithAnyCompletion);
    setLoading(false);
  }

  async function toggleHabit(id: string, done: boolean) {
    const todayKey = localDateKey(new Date(), tz);
    const habit = habits.find((h) => h.id === id);
    if (!habit || !session) return;

    const newStreak = done ? habit.streak + 1 : Math.max(0, habit.streak - 1);
    setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, done, streak: newStreak } : h)));
    setWeekLogDates((prev) => {
      const next = new Set(prev);
      if (done) next.add(todayKey);
      return next;
    });

    if (done) {
      await supabase.from("habit_logs").insert({ habit_id: id, log_date: todayKey, user_id: session.user.id });
    } else {
      await supabase.from("habit_logs").delete().eq("habit_id", id).eq("log_date", todayKey);
    }
    await supabase.from("habits").update({ streak: newStreak }).eq("id", id);
  }

  async function addHabit() {
    if (!name.trim() || !session) return;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const { data } = await supabase
      .from("habits")
      .insert({ name: name.trim(), emoji, streak: 0, user_id: session.user.id })
      .select()
      .single();
    if (data) {
      setHabits((hs) => [...hs, { id: data.id, name: data.name, emoji: data.emoji, streak: 0, done: false }]);
    }
    setName("");
    setAdding(false);
  }

  async function deleteHabit(id: string) {
    setHabits((hs) => hs.filter((h) => h.id !== id));
    await supabase.from("habits").delete().eq("id", id);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const doneCount = habits.filter((h) => h.done).length;
  const pct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;
  const bestStreak = useMemo(() => (habits.length ? Math.max(...habits.map((h) => h.streak)) : 0), [habits]);

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", timeZone: tz }),
    [tz]
  );

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-8 sm:max-w-lg sm:pt-12">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <div className="text-xl font-black sm:text-2xl">
            {greetingForTimeZone(tz)}
            {session?.user.email ? `, ${session.user.email.split("@")[0]}` : ""}
          </div>
          <div className="text-xs font-medium text-muted">{todayLabel}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-xs font-bold text-accent">
            {bestStreak}d streak
          </span>
          <button onClick={signOut} className="text-xs font-semibold text-muted underline">
            Sign out
          </button>
        </div>
      </div>

      <div className="my-6 flex flex-col items-center sm:my-8">
        <ProgressRing pct={pct} />
        <span className="mt-2 text-sm font-semibold text-muted">
          {doneCount}/{habits.length} today
        </span>
      </div>

      <WeekStrip completedDates={weekLogDates} timeZone={tz} />

      {loading ? (
        <p className="mt-6 text-center text-sm text-muted">Loading…</p>
      ) : habits.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted">No habits yet — add your first one below.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-2.5">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} onToggle={toggleHabit} onDelete={deleteHabit} />
          ))}
        </div>
      )}

      {adding && (
        <div className="mt-3 flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="New habit name"
            className="flex-1 rounded-lg border border-line bg-surface2 px-3 py-2.5 text-sm font-medium outline-none focus:border-accent"
          />
          <button onClick={addHabit} className="rounded-lg bg-accent px-4 text-sm font-bold text-white">
            Add
          </button>
          <button onClick={() => setAdding(false)} className="rounded-lg border border-line px-3 text-muted">
            ×
          </button>
        </div>
      )}

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          aria-label="Add habit"
          className="fixed bottom-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-3xl font-bold text-white shadow-lg"
        >
          +
        </button>
      )}
    </div>
  );
}
