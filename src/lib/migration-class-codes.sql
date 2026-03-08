-- Migration: Add class codes and onboarding support
-- Run this in your Supabase SQL Editor if tables already exist

-- Add onboarded flag to profiles
alter table public.profiles add column if not exists onboarded boolean default false;

-- Add class_code to modules
alter table public.modules add column if not exists class_code text unique;

-- Create index on class_code
create index if not exists idx_modules_class_code on public.modules(class_code);
