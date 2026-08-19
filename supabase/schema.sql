-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create extension if not exists "uuid-ossp";

create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '🔥',
  streak int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

alter table habits enable row level security;
alter table habit_logs enable row level security;

create policy "Users manage their own habits"
  on habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own logs"
  on habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
