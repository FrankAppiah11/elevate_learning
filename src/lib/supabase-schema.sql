-- Elevate Learning with AI - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles (synced from Clerk)
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  clerk_id text unique not null,
  email text not null,
  full_name text not null,
  role text not null check (role in ('student', 'instructor')),
  avatar_url text,
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Modules / Courses (each has a unique class code)
create table public.modules (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  instructor_id uuid references public.profiles(id),
  class_code text unique not null,
  created_at timestamptz default now()
);

create index idx_modules_class_code on public.modules(class_code);

-- Module enrollments (links students to classes via instructor)
create table public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id),
  module_id uuid references public.modules(id),
  enrolled_at timestamptz default now(),
  unique(student_id, module_id)
);

-- Assignments
create table public.assignments (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  student_id uuid references public.profiles(id) not null,
  instructor_id uuid references public.profiles(id),
  module_id uuid references public.modules(id),
  upload_type text not null check (upload_type in ('screenshot', 'document', 'pdf', 'text', 'weblink')),
  file_url text,
  file_name text,
  text_content text,
  web_url text,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'submitted', 'graded', 'reviewed')),
  folder_label text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tutor sessions
create table public.tutor_sessions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references public.assignments(id) not null,
  student_id uuid references public.profiles(id) not null,
  tutor_id text not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_seconds integer default 0,
  total_messages integer default 0,
  go_backs integer default 0,
  status text default 'active' check (status in ('active', 'paused', 'completed'))
);

-- Individual tutor interactions (chat messages)
create table public.tutor_interactions (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.tutor_sessions(id) not null,
  assignment_id uuid references public.assignments(id) not null,
  student_id uuid references public.profiles(id) not null,
  tutor_id text not null,
  role text not null check (role in ('student', 'tutor')),
  content text not null,
  interaction_type text not null check (interaction_type in ('question', 'answer', 'hint', 'example', 'clarification', 'go_back')),
  created_at timestamptz default now()
);

-- Grading results
create table public.grading_results (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references public.assignments(id) not null unique,
  student_id uuid references public.profiles(id) not null,
  problem_solving_score numeric(5,2) not null,
  ai_competency_score numeric(5,2) not null,
  correctness_score numeric(5,2) not null,
  weighted_total numeric(5,2) not null,
  letter_grade text not null,
  grading_details jsonb not null default '{}',
  ai_graded_at timestamptz default now(),
  instructor_grade text,
  instructor_notes text,
  instructor_graded_at timestamptz
);

-- Feedback reports
create table public.feedback_reports (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references public.assignments(id) not null unique,
  student_id uuid references public.profiles(id) not null,
  narrative_report text not null,
  strengths jsonb not null default '[]',
  areas_for_improvement jsonb not null default '[]',
  key_suggestions jsonb not null default '[]',
  competency_breakdown jsonb not null default '{}',
  generated_at timestamptz default now()
);

-- Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,
  title text not null,
  message text not null,
  type text not null check (type in ('submission', 'grade', 'feedback', 'review')),
  related_assignment_id uuid references public.assignments(id),
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_assignments_student on public.assignments(student_id);
create index idx_assignments_instructor on public.assignments(instructor_id);
create index idx_assignments_status on public.assignments(status);
create index idx_tutor_sessions_assignment on public.tutor_sessions(assignment_id);
create index idx_tutor_interactions_session on public.tutor_interactions(session_id);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;
create index idx_profiles_clerk on public.profiles(clerk_id);
create index idx_enrollments_student on public.enrollments(student_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.assignments enable row level security;
alter table public.tutor_sessions enable row level security;
alter table public.tutor_interactions enable row level security;
alter table public.grading_results enable row level security;
alter table public.feedback_reports enable row level security;
alter table public.notifications enable row level security;
alter table public.modules enable row level security;
alter table public.enrollments enable row level security;

-- Policies: profiles
create policy "Users can view own profile" on public.profiles for select using (true);
create policy "Service role manages profiles" on public.profiles for all using (true);

-- Policies: assignments (students see own, instructors see assigned)
create policy "View own or instructed assignments" on public.assignments for select using (true);
create policy "Students create assignments" on public.assignments for insert with check (true);
create policy "Update own assignments" on public.assignments for update using (true);

-- Policies: allow all for other tables (tighten for production)
create policy "Allow all tutor_sessions" on public.tutor_sessions for all using (true);
create policy "Allow all tutor_interactions" on public.tutor_interactions for all using (true);
create policy "Allow all grading_results" on public.grading_results for all using (true);
create policy "Allow all feedback_reports" on public.feedback_reports for all using (true);
create policy "Allow all notifications" on public.notifications for all using (true);
create policy "Allow all modules" on public.modules for all using (true);
create policy "Allow all enrollments" on public.enrollments for all using (true);

-- Storage bucket for assignment files
insert into storage.buckets (id, name, public) values ('assignments', 'assignments', true);

create policy "Allow public read on assignments bucket"
  on storage.objects for select using (bucket_id = 'assignments');
create policy "Allow authenticated uploads to assignments bucket"
  on storage.objects for insert with check (bucket_id = 'assignments');
