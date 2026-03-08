-- Migration: Add weekly study goals and goal_reminder notification type
-- Run this in your Supabase SQL Editor if tables already exist

-- Weekly study goals table
create table if not exists public.weekly_goals (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id) not null,
  target integer not null default 5,
  week_start date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, week_start)
);

create index if not exists idx_weekly_goals_student on public.weekly_goals(student_id);
create index if not exists idx_weekly_goals_week on public.weekly_goals(student_id, week_start);

alter table public.weekly_goals enable row level security;
create policy "Allow all weekly_goals" on public.weekly_goals for all using (true);

-- Expand notifications type check to include goal_reminder
-- (drop and recreate the constraint)
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('submission', 'grade', 'feedback', 'review', 'goal_reminder'));
