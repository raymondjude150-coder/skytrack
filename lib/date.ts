// Every "what day is it for this user" decision in the app runs through
// here. toISOString() is UTC and silently rolls a habit over to the wrong
// day for anyone not on UTC — this uses the browser's real detected
// timezone instead, so "today" always matches the user's actual local day.

export function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

// Returns YYYY-MM-DD for the given date IN the given (or detected) timezone.
export function localDateKey(date: Date = new Date(), timeZone?: string): string {
  const tz = timeZone || detectTimeZone();
  // en-CA formats as YYYY-MM-DD, which matches Postgres `date` columns.
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(date);
}

// Milliseconds until the next local midnight in the given timezone —
// used to auto-flip the dashboard to the next day without a refresh.
export function msUntilNextLocalMidnight(timeZone?: string): number {
  const tz = timeZone || detectTimeZone();
  const now = new Date();
  const todayKey = localDateKey(now, tz);
  // Walk forward in 30-minute steps until the local date key changes —
  // avoids DST/offset math entirely, since it just asks the same
  // formatter that everything else in the app uses.
  let probe = new Date(now.getTime());
  for (let i = 0; i < 96; i++) {
    probe = new Date(probe.getTime() + 30 * 60 * 1000);
    if (localDateKey(probe, tz) !== todayKey) {
      return probe.getTime() - now.getTime();
    }
  }
  return 24 * 60 * 60 * 1000;
}

export function greetingForTimeZone(timeZone?: string): string {
  const tz = timeZone || detectTimeZone();
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(new Date()));
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
