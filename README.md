# Elevate - Learning with AI

An AI-powered SaaS learning platform where intelligent tutors collaborate with students to build understanding, not just deliver answers.

## Features

- **Role-Based Onboarding** — First-time users choose Student or Instructor on a guided welcome screen
- **Class Code System** — Instructors create classes with auto-generated unique codes; students join by entering the code, linking them to the instructor
- **Clerk Authentication** — Secure login with role-based routing and session management
- **Multi-format Upload** — Screenshots, Word docs, PDFs, text, and web links
- **3 AI Tutor Styles** — Socratic, Structured, and Exploratory with built-in guardrails
- **Interaction Tracking** — Duration, messages, go-backs, and full Q&A history
- **Completed Work Attachment** — Students must attach their finished assignment file (PDF, Word, image, or text) when submitting; instructors can download and review it
- **Submit Confirmation** — Students must confirm before submitting to prevent accidental/premature submissions (amber warning modal)
- **Student Scorecard** — Students click completed or in-review assignments to see their AI grade breakdown, instructor final grade (or pending notice), and a link to the full report
- **Instructor Redo Request** — Instructors can request a student redo an assignment with an optional reason; the student is notified and can rework and resubmit
- **Weekly Study Goals** — Students set and edit weekly assignment targets; the platform tracks real progress with a live progress bar
- **Goal Reminders** — Daily automated checks notify students who are behind on their weekly goal via in-app notifications and email (Resend)
- **AI Grading** — 60% problem solving, 30% AI competency, 10% correctness
- **Feedback Reports** — AI-generated narrative reports with competency breakdowns
- **Live Instructor Data** — All instructor pages (Dashboard, Students, Grading, Activities) display real student data from Supabase, not sample data
- **Notification System** — Real-time alerts for submissions, grades, redo requests, and weekly goal reminders
- **LMS Integration** — LTI 1.3 support for Canvas, Blackboard, Moodle, and more
- **Supabase Backend** — PostgreSQL database with file storage
- **Vercel Deployment** — Optimized for edge performance with scheduled cron jobs

## How It Works

### Onboarding Flow

1. User signs up or signs in via Clerk
2. First-time users are redirected to `/onboarding` to select their role (Student or Instructor)
3. The role is saved to both Supabase (`profiles.role`, `profiles.onboarded`) and Clerk public metadata
4. The Clerk session is reloaded so the middleware sees the updated role
5. Users are routed to their respective dashboards

### Instructor Workflow

1. Instructor signs up and selects **"I'm an Instructor"** during onboarding
2. Creates one or more classes from the **My Classes** page (`/dashboard/instructor/classes`)
3. Each class gets a unique 6-character code (e.g., `WDWDNH`)
4. Shares the code with students (in-person, email, LMS announcement, etc.)
5. As students submit work, it appears in real-time on:
   - **Dashboard** (`/dashboard/instructor`) — Activity feed with pending/completed tabs
   - **Students** (`/dashboard/instructor/students`) — Enrolled roster with progress bars and avg scores
   - **Grading** (`/dashboard/instructor/grading`) — Queue of submissions with AI score breakdown, student's completed work attachment (downloadable), and a grading modal
   - **Activities** (`/dashboard/instructor/activities`) — Full tutoring session details (duration, messages, go-backs)
6. Instructor downloads and reviews the student's attached completed work
7. Reviews AI-generated grades and feedback, then either:
   - **Submits a final grade** with optional notes, or
   - **Requests a redo** with an optional reason — the student is notified and can rework the assignment

### Student Workflow

1. Student signs up and selects **"I'm a Student"** during onboarding
2. Joins a class by entering the instructor's code on the **My Classes** page (`/dashboard/student/classes`)
3. Sets a **weekly study goal** (quick-pick presets or custom number) — the dashboard tracks progress in real time
4. Uploads assignments (screenshot, Word doc, PDF, text, or web link) from **New Assignment** (`/assignments/new`)
5. Selects which class the assignment belongs to (dropdown linked to enrolled classes)
6. Chooses an AI tutor (Socratic Sam, Logical Leah, or Curious Clara)
7. Collaborates with the AI tutor on the **Collaborate** page — all interactions are captured
8. When ready, clicks **Submit Work** — the amber confirmation modal requires the student to:
   - **Attach their completed assignment file** (PDF, Word, image, or text, up to 10 MB)
   - Confirm submission (the button is disabled until a file is attached)
9. AI grades the work (60/30/10 scheme) and generates a detailed feedback report
10. Back on the dashboard, clicks any **submitted/reviewed/graded** assignment to open a **scorecard modal** showing:
    - AI overall score with letter grade
    - Breakdown: Problem Solving (60%), AI Competency (30%), Correctness (10%)
    - Instructor's final grade and feedback — or a "Pending Instructor Review" notice
    - Link to the full feedback report at `/assignments/[id]/feedback`
11. If the instructor requests a **redo**, the assignment shows a "redo requested" badge and the student can click it to return to the collaborate page, rework, and resubmit
12. If the student falls behind on their weekly goal, they receive an **in-app notification** and an **email reminder** with a progress summary

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| AI | OpenAI GPT-4o-mini |
| Styling | Tailwind CSS |
| State | Zustand |
| Email | Resend (optional, for goal reminders) |
| Deployment | Vercel (with cron jobs) |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── onboarding/page.tsx               # Role selection (Student/Instructor)
│   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up
│   ├── sign-out/page.tsx                 # Sign-out handler
│   ├── profile/[[...rest]]/page.tsx      # Clerk user profile
│   ├── notifications/page.tsx            # Notification center (all types incl. goal & redo)
│   ├── dashboard/
│   │   ├── student/page.tsx              # Student home (stats, goal, scorecard modal)
│   │   ├── student/classes/page.tsx      # Join classes via code
│   │   ├── instructor/page.tsx           # Instructor activity monitor
│   │   ├── instructor/classes/page.tsx   # Create/manage classes & codes
│   │   ├── instructor/students/page.tsx  # Enrolled student roster
│   │   ├── instructor/grading/page.tsx   # Grade submissions + attachment + redo
│   │   ├── instructor/activities/page.tsx# View tutoring sessions
│   │   └── instructor/settings/page.tsx  # LMS & notification settings
│   ├── assignments/
│   │   ├── new/page.tsx                  # Upload new assignment
│   │   └── [id]/
│   │       ├── collaborate/page.tsx      # AI tutor chat + submit with attachment
│   │       └── feedback/page.tsx         # Grading report & feedback
│   └── api/
│       ├── onboarding/route.ts           # Set role & onboarded status
│       ├── classes/route.ts              # Create/list classes
│       ├── classes/join/route.ts         # Student joins class via code
│       ├── assignments/route.ts          # List/create assignments (includes grading data for students)
│       ├── assignments/upload/route.ts   # Upload completed work file to Supabase Storage
│       ├── assignments/[id]/route.ts     # Get/update single assignment
│       ├── assignments/[id]/submit/route.ts    # Submit work + attachment + notify instructor
│       ├── assignments/[id]/grade/route.ts     # Get/update grading result
│       ├── assignments/[id]/feedback/route.ts  # Get feedback report
│       ├── assignments/[id]/interactions/route.ts # Get/edit interactions
│       ├── assignments/[id]/redo/route.ts      # Instructor requests student redo
│       ├── student/weekly-goal/route.ts  # GET/PUT student weekly study goal
│       ├── cron/goal-check/route.ts      # Daily cron: check goals, send reminders
│       ├── ai/tutor/route.ts             # AI tutor chat endpoint
│       ├── ai/grade/route.ts             # AI auto-grading
│       ├── ai/feedback/route.ts          # AI feedback generation
│       ├── instructor/activities/route.ts # Real student submissions for instructor
│       ├── instructor/students/route.ts   # Real enrolled students with stats
│       ├── instructor/sessions/route.ts   # Real tutoring session data
│       ├── notifications/route.ts         # Notification CRUD
│       ├── lti/route.ts                   # LTI 1.3 configuration
│       └── webhooks/clerk/route.ts        # Clerk webhook for profile sync
├── components/
│   ├── ui/        # Button, Card, Badge, Modal, ProgressBar, ScoreCircle
│   └── layout/    # AppShell, Sidebar, MobileNav, TopBar
├── lib/
│   ├── supabase.ts              # Supabase client config
│   ├── supabase-schema.sql      # Full database schema
│   ├── migration-class-codes.sql        # Migration: class codes & onboarding
│   ├── migration-weekly-goals.sql       # Migration: weekly goals & goal_reminder notifications
│   ├── migration-completed-attachment.sql # Migration: completed file attachment & redo status
│   ├── ensure-profile.ts        # Auto-create Supabase profile from Clerk
│   ├── class-code.ts            # Unique class code generator
│   ├── email.ts                 # Resend email utility for goal reminders
│   ├── ai-tutors.ts             # AI tutor configurations & system prompts
│   ├── utils.ts                 # Utility functions
│   └── auth.ts                  # Auth helpers
├── store/
│   └── useStore.ts              # Zustand global state
├── types/
│   └── index.ts                 # TypeScript interfaces
└── middleware.ts                 # Clerk auth + onboarding redirect
```

## Setup

### 1. Clone and Install

```bash
git clone git@github.com:FrankAppiah11/elevate_learning.git
cd elevate_learning_with_ai
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```env
# Clerk (https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI (https://platform.openai.com)
OPENAI_API_KEY=sk-...

# Resend Email — optional, for weekly goal reminders (https://resend.com)
RESEND_API_KEY=re_...
EMAIL_FROM=Elevate Learning <noreply@yourdomain.com>

# Cron secret (authenticates the daily goal-check endpoint)
CRON_SECRET=your_random_secret_here

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the full schema in your Supabase SQL Editor:

```
File: src/lib/supabase-schema.sql
```

If migrating an existing database, run these files in order:

```
1. src/lib/migration-class-codes.sql           — Adds class codes & onboarding columns
2. src/lib/migration-weekly-goals.sql           — Adds weekly_goals table & goal_reminder notification type
3. src/lib/migration-completed-attachment.sql   — Adds completed file columns & redo_requested status
```

### 4. Clerk Configuration

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Go to **Sessions > Customize session token** and set the claims to:
   ```json
   {
     "metadata": "{{user.public_metadata}}"
   }
   ```
   This allows the middleware to read the user's role and onboarding status from the session token.
3. Optionally set up the webhook endpoint: `POST /api/webhooks/clerk`

### 5. Run Development Server

```bash
npm run dev
```

### 6. Deploy to Vercel

```bash
npx vercel
```

Add all environment variables in the Vercel dashboard. The daily goal-check cron job is configured in `vercel.json` to run at 6 PM UTC every day.

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles synced from Clerk (role, onboarded flag) |
| `modules` | Classes/courses with unique `class_code` per instructor |
| `enrollments` | Links students to classes (student_id + module_id) |
| `assignments` | Student uploads with status tracking, class linkage, and completed work attachment (`completed_file_url`, `completed_file_name`) |
| `tutor_sessions` | AI tutoring session metadata (duration, messages, go-backs) |
| `tutor_interactions` | Individual chat messages between student and AI tutor |
| `grading_results` | AI-generated scores (60/30/10) plus instructor final grade |
| `feedback_reports` | AI-generated narrative feedback with strengths and suggestions |
| `weekly_goals` | Per-student, per-week assignment targets (editable) |
| `notifications` | Alerts for submissions, grades, redo requests, reviews, and goal reminders |

### Assignment Statuses

| Status | Meaning |
|--------|---------|
| `draft` | Assignment created but not started |
| `in_progress` | Student is actively working with the AI tutor |
| `submitted` | Student submitted with completed work attached; awaiting instructor |
| `graded` | AI grading complete |
| `reviewed` | Instructor provided final grade |
| `redo_requested` | Instructor requested the student redo the assignment |

## Grading Scheme

| Criterion | Weight | What It Measures |
|-----------|--------|-----------------|
| Problem Solving | 60% | Student's approach, reasoning, and progression through the AI interaction |
| AI Competency | 30% | Quality of questions asked and effective use of AI guidance |
| Correctness | 10% | Accuracy of final understanding and conclusions |

## Completed Work Attachment

When submitting an assignment, students are required to attach their completed work:

- The submit confirmation modal includes a **file upload area** (click to browse)
- Accepted formats: PDF, Word (.doc/.docx), images (.png/.jpg/.gif/.webp), and text files
- Maximum file size: 10 MB
- The **Submit** button is disabled until a file is attached
- Files are uploaded to Supabase Storage under `completed/{assignment_id}/`
- Instructors see the attachment as a **downloadable link** on the grading card and inside the grading modal

## Student Scorecard

When a student clicks on a completed or in-review assignment on their dashboard, a modal displays:

- **AI Overall Score** — Weighted total with letter grade in a visual circle
- **Score Breakdown** — Three score circles: Problem Solving (60% weight), AI Competency (30% weight), Correctness (10% weight)
- **Instructor Final Grade** — Displays the grade and any feedback notes in a green card, or shows an amber "Pending Instructor Review" notice if not yet graded
- **View Full Report** — Links to the detailed feedback page with narrative report, competency breakdown, and suggestions
- Inline AI score and instructor grade badges also appear on each assignment card in the dashboard list

## Instructor Redo Request

Instructors can request a student redo an assignment instead of grading it:

1. In the grading modal, expand the **"Request student redo instead"** section
2. Optionally provide a reason explaining what the student should improve
3. Click **Request Redo** — the assignment status changes to `redo_requested`
4. The student receives an **in-app notification** with the reason
5. On the student dashboard, the assignment shows an amber **"redo requested"** badge
6. Clicking it takes the student back to the **Collaborate** page where they can rework and resubmit with a new completed work attachment

## Weekly Study Goals

Students can set and manage their own weekly assignment targets:

1. **First-time setup** — On the dashboard, students see quick-pick buttons (3, 5, 7, 10) or can enter a custom number (1–50)
2. **Live progress bar** — Tracks assignments submitted/graded/reviewed during the current week (Mon–Sun)
3. **Editable anytime** — Click the pencil icon to adjust the target mid-week
4. **Goal completion** — Bar turns green with a celebration message when the target is met
5. **Automated reminders** — A daily cron job (`/api/cron/goal-check`) runs at 6 PM UTC:
   - Checks all students who are behind on their weekly goal
   - Skips students who already received a reminder in the last 24 hours
   - Creates an in-app `goal_reminder` notification on the platform
   - Sends a styled HTML email via Resend with a progress summary and dashboard link
   - Uses more urgent messaging on Fridays and Sundays (end of week)

### Email Setup (Optional)

Goal reminder emails use [Resend](https://resend.com):

1. Sign up at resend.com and get an API key
2. Set `RESEND_API_KEY` in your environment variables
3. Optionally set `EMAIL_FROM` to customize the sender address
4. If `RESEND_API_KEY` is not set, email sending is silently skipped (in-app notifications still work)

### Cron Configuration

The Vercel cron is defined in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/goal-check",
      "schedule": "0 18 * * *"
    }
  ]
}
```

The endpoint is protected by a `CRON_SECRET` environment variable. Vercel automatically sends this as the `Authorization: Bearer <CRON_SECRET>` header for scheduled cron invocations.

## Class Code System

- Codes are 6-character alphanumeric strings (e.g., `WDWDNH`)
- Characters exclude ambiguous ones (0, O, 1, I, L) for clarity
- Each code is unique across the entire platform
- Instructors can create unlimited classes, each with its own code
- Students can join multiple classes from different instructors
- Assignments are linked to a class, automatically connecting them to the instructor
- Instructor dashboards pull real data from all their classes

## Submit Protection

Students are protected from premature submission:
- The **Submit Work** button uses an amber/warning color scheme with an alert icon
- Clicking it opens a confirmation modal (not an immediate submit)
- The modal requires the student to **attach their completed work file** before the submit button becomes active
- The modal warns that the action cannot be undone
- Students see their session duration and message count before confirming
- A **"Go Back"** option lets them return to their session to continue working

## AI Tutor Guardrails

All three tutors (Socratic Sam, Logical Leah, Curious Clara) are bound by strict guardrails:
- Never provide direct answers
- Use different examples from the actual assignment
- Guide through questions, not solutions
- Track learning progress and adapt guidance
- Encourage the student to think critically

## LMS Integration

Elevate supports LTI 1.3 for integration with:
- Canvas
- Blackboard
- Moodle
- D2L Brightspace

Configure LTI endpoints in the Instructor Settings page (`/dashboard/instructor/settings`).

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/onboarding` | POST | Set user role and mark as onboarded |
| `/api/classes` | GET | List classes (instructor's own or student's enrolled) |
| `/api/classes` | POST | Create a new class with auto-generated code (instructor) |
| `/api/classes/join` | POST | Join a class using a code (student) |
| `/api/assignments` | GET | List assignments with grading data (student) or by class (instructor) |
| `/api/assignments` | POST | Create a new assignment |
| `/api/assignments/upload` | POST | Upload completed work file to Supabase Storage (returns public URL) |
| `/api/assignments/[id]` | GET/PATCH | Get or update a single assignment |
| `/api/assignments/[id]/submit` | POST | Submit work with completed file attachment, save interactions, notify instructor |
| `/api/assignments/[id]/grade` | GET/PATCH | Get or update grading result (instructor final grade) |
| `/api/assignments/[id]/feedback` | GET | Get AI-generated feedback report |
| `/api/assignments/[id]/interactions` | GET/PATCH | Get or edit interaction transcripts |
| `/api/assignments/[id]/redo` | POST | Instructor requests student redo (sets status, sends notification) |
| `/api/student/weekly-goal` | GET | Get current week's goal target, progress count, and status |
| `/api/student/weekly-goal` | PUT | Set or update the weekly goal target (1–50) |
| `/api/cron/goal-check` | GET | Daily cron: check all students' goals, send notifications and emails |
| `/api/ai/tutor` | POST | Send a message to the AI tutor |
| `/api/ai/grade` | POST | Trigger AI auto-grading for an assignment |
| `/api/ai/feedback` | POST | Trigger AI feedback report generation |
| `/api/instructor/activities` | GET | Get real student submissions (with attachment URLs) across all instructor's classes |
| `/api/instructor/students` | GET | Get enrolled students with assignment stats and avg scores |
| `/api/instructor/sessions` | GET | Get AI tutoring sessions with duration, messages, go-backs |
| `/api/notifications` | GET/POST/PATCH | Manage notifications (all types including goal_reminder and redo) |
| `/api/lti` | GET/POST | LTI 1.3 tool configuration and registration |
| `/api/webhooks/clerk` | POST | Clerk webhook for profile sync |
