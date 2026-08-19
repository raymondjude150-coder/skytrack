# SkyTrack — habit tracker

A bold, real habit tracker: public landing page, a real login gate, and daily tracking that resets automatically at *your* local midnight — not a server's UTC clock. Next.js 14 (App Router) + Supabase (auth + database), ready to deploy to Vercel.

## Routing model

- `/` — public landing page. Nobody is redirected away from it.
- `/signup` — the required first step. You cannot sign in without an account that exists first.
- `/login` — for people who already have an account. Wrong/missing credentials show a message pointing to sign-up instead of a generic error.
- `/dashboard` — the actual app. Hard-gated server-side by `middleware.ts` — an unauthenticated request to `/dashboard` is redirected to `/login` before any page HTML is sent. Signed-in users hitting `/login` or `/signup` are bounced straight to `/dashboard`.

## Why the daily reset is real, not cosmetic

`lib/date.ts` detects the visitor's actual IANA timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) and derives every "what day is it" decision from that — not from `toISOString()`, which is UTC and would flip a habit's day at the wrong hour for almost everyone. Two consequences:

1. A habit you complete today is stored against **your local calendar date**, and stays checked only until your local midnight passes.
2. The dashboard schedules its own timer (`msUntilNextLocalMidnight`) and automatically reloads the moment your local day changes — you don't need to refresh the tab for "today" to become tomorrow.

## 1. Create a Supabase project

1. [supabase.com](https://supabase.com) → New project.
2. **SQL Editor** → paste `supabase/schema.sql` → Run.
3. **Project Settings → API** → copy the Project URL and anon public key.
4. **Authentication → Providers** → confirm Email is enabled (turn off "Confirm email" under Authentication → Settings for faster local testing).

## 2. Run locally

```bash
npm install
cp .env.example .env.local
# paste your Supabase URL + anon key into .env.local
npm run dev
```

Visit `/` — it's public. Try `/dashboard` directly while signed out; you'll be bounced to `/login`.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy.

```bash
npm i -g vercel
vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

## Making it yours

* Colors: `tailwind.config.ts` (`bg`, `surface`, `accent`, `success`) and `app/globals.css`.
* Landing page copy/hero: `app/page.tsx`.
* Logo mark: the "S" badge in `app/page.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`.
* Streak rules: `app/dashboard/page.tsx`, inside `toggleHabit`.

## Structure

```
middleware.ts                 gates /dashboard only; "/" stays public
lib/supabase/middleware.ts    the session check the middleware runs
lib/supabase/client.ts        browser Supabase client (cookie-based)
lib/date.ts                   timezone-safe date key + midnight scheduler
app/
  page.tsx                    public landing page
  login/page.tsx              secondary entry — requires an existing account
  signup/page.tsx             primary entry — required before login works
  dashboard/page.tsx          the real app — real dates, real streaks
components/
  ProgressRing.tsx
  HabitCard.tsx
  WeekStrip.tsx                real calendar week, timezone-aware
supabase/schema.sql            tables + row-level security policies
```
