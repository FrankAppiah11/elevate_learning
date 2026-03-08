-- Migration: Add completed work attachment and redo_requested status
-- Run this in your Supabase SQL Editor if tables already exist

-- Add completed file columns to assignments
alter table public.assignments add column if not exists completed_file_url text;
alter table public.assignments add column if not exists completed_file_name text;

-- Expand status check to include redo_requested
alter table public.assignments drop constraint if exists assignments_status_check;
alter table public.assignments add constraint assignments_status_check
  check (status in ('draft', 'in_progress', 'submitted', 'graded', 'reviewed', 'redo_requested'));
