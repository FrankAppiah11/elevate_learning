# Elevate - Learning with AI

An AI-powered SaaS learning platform where intelligent tutors collaborate with students to build understanding, not just deliver answers.

## Features

- **Role-Based Onboarding** — First-time users choose Student or Instructor on a guided welcome screen
- **Class Code System** — Instructors create classes with auto-generated unique codes; students join by entering the code, linking them to the instructor
- **Clerk Authentication** — Secure login with role-based routing and session management
- **Multi-format Upload** — Screenshots, Word docs, PDFs, text, and web links
- **3 AI Tutor Styles** — Socratic, Structured, and Exploratory with built-in guardrails
- **Interaction Tracking** — Duration, messages, go-backs, and full Q&A history
- **Submit Confirmation** — Students must confirm before submitting to prevent accidental/premature submissions (amber warning modal)
- **AI Grading** — 60% problem solving, 30% AI competency, 10% correctness
- **Feedback Reports** — AI-generated narrative reports with competency breakdowns
- **Live Instructor Data** — All instructor pages (Dashboard, Students, Grading, Activities) display real student data from Supabase, not sample data
- **Notification System** — Real-time alerts for submissions and grades
- **LMS Integration** — LTI 1.3 support for Canvas, Blackboard, Moodle, and more
- **Supabase Backend** — PostgreSQL database with file storage
- **Vercel Deployment** — Optimized for edge performance

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
   - **Grading** (`/dashboard/instructor/grading`) — Queue of submissions to review and grade
   - **Activities** (`/dashboard/instructor/activities`) — Full tutoring session details (duration, messages, go-backs)
6. Instructor reviews AI-generated grades and feedback, then provides a final grade

### Student Workflow

1. Student signs up and selects **"I'm a Student"** during onboarding
2. Joins a class by entering the instructor's code on the **My Classes** page (`/dashboard/student/classes`)
3. Uploads assignments (screenshot, Word doc, PDF, text, or web link) from **New Assignment** (`/assignments/new`)
4. Selects which class the assignment belongs to (dropdown linked to enrolled classes)
5. Chooses an AI tutor (Socratic Sam, Logical Leah, or Curious Clara)
6. Collaborates with the AI tutor on the **Collaborate** page — all interactions are captured
7. Reviews work and confirms submission via the amber-colored confirmation dialog
8. AI grades the work (60/30/10 scheme) and generates a detailed feedback report
9. Student views their feedback at `/assignments/[id]/feedback`
10. Instructor reviews and provides the final grade

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
| Deployment | Vercel |

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
│   ├── dashboard/
│   │   ├── student/page.tsx              # Student home dashboard
│   │   ├── student/classes/page.tsx      # Join classes via code
│   │   ├── instructor/page.tsx           # Instructor activity monitor
│   │   ├── instructor/classes/page.tsx   # Create/manage classes & codes
│   │   ├── instructor/students/page.tsx  # Enrolled student roster
│   │   ├── instructor/grading/page.tsx   # Grade student submissions
│   │   ├── instructor/activities/page.tsx# View tutoring sessions
│   │   └── instructor/settings/page.tsx  # LMS & notification settings
│   ├── assignments/
│   │   ├── new/page.tsx                  # Upload new assignment
│   │   └── [id]/
│   │       ├── collaborate/page.tsx      # AI tutor chat session
│   │       └── feedback/page.tsx         # Grading report & feedback
│   └── api/
│       ├── onboarding/route.ts           # Set role & onboarded status
│       ├── classes/route.ts              # Create/list classes
│       ├── classes/join/route.ts         # Student joins class via code
│       ├── assignments/route.ts          # List/create assignments
│       ├── assignments/[id]/route.ts     # Get/update single assignment
│       ├── assignments/[id]/submit/route.ts    # Submit work + notify instructor
│       ├── assignments/[id]/grade/route.ts     # Get/update grading result
│       ├── assignments/[id]/feedback/route.ts  # Get feedback report
│       ├── assignments/[id]/interactions/route.ts # Get/edit interactions
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
│   ├── supabase.ts           # Supabase client config
│   ├── supabase-schema.sql   # Full database schema
│   ├── migration-class-codes.sql # Migration for existing databases
│   ├── ensure-profile.ts     # Auto-create Supabase profile from Clerk
│   ├── class-code.ts         # Unique class code generator
│   ├── ai-tutors.ts          # AI tutor configurations & system prompts
│   ├── utils.ts              # Utility functions
│   └── auth.ts               # Auth helpers
├── store/
│   └── useStore.ts           # Zustand global state
├── types/
│   └── index.ts              # TypeScript interfaces
└── middleware.ts              # Clerk auth + onboarding redirect
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

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the full schema in your Supabase SQL Editor:

```
File: src/lib/supabase-schema.sql
```

If migrating an existing database (adding class codes to existing tables), run:

```
File: src/lib/migration-class-codes.sql
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

Add all environment variables in the Vercel dashboard.

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles synced from Clerk (role, onboarded flag) |
| `modules` | Classes/courses with unique `class_code` per instructor |
| `enrollments` | Links students to classes (student_id + module_id) |
| `assignments` | Student uploads with status tracking and class linkage |
| `tutor_sessions` | AI tutoring session metadata (duration, messages, go-backs) |
| `tutor_interactions` | Individual chat messages between student and AI tutor |
| `grading_results` | AI-generated scores (60/30/10) plus instructor final grade |
| `feedback_reports` | AI-generated narrative feedback with strengths and suggestions |
| `notifications` | Alerts for submissions, grades, and reviews |

## Grading Scheme

| Criterion | Weight | What It Measures |
|-----------|--------|-----------------|
| Problem Solving | 60% | Student's approach, reasoning, and progression through the AI interaction |
| AI Competency | 30% | Quality of questions asked and effective use of AI guidance |
| Correctness | 10% | Accuracy of final understanding and conclusions |

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
| `/api/assignments` | GET | List assignments (student's own or instructor's classes) |
| `/api/assignments` | POST | Create a new assignment |
| `/api/assignments/[id]` | GET/PATCH | Get or update a single assignment |
| `/api/assignments/[id]/submit` | POST | Submit work, save interactions, notify instructor |
| `/api/assignments/[id]/grade` | GET/PATCH | Get or update grading result (instructor final grade) |
| `/api/assignments/[id]/feedback` | GET | Get AI-generated feedback report |
| `/api/assignments/[id]/interactions` | GET/PATCH | Get or edit interaction transcripts |
| `/api/ai/tutor` | POST | Send a message to the AI tutor |
| `/api/ai/grade` | POST | Trigger AI auto-grading for an assignment |
| `/api/ai/feedback` | POST | Trigger AI feedback report generation |
| `/api/instructor/activities` | GET | Get real student submissions across all instructor's classes |
| `/api/instructor/students` | GET | Get enrolled students with assignment stats and avg scores |
| `/api/instructor/sessions` | GET | Get AI tutoring sessions with duration, messages, go-backs |
| `/api/notifications` | GET/POST/PATCH | Manage notifications |
| `/api/lti` | GET/POST | LTI 1.3 tool configuration and registration |
| `/api/webhooks/clerk` | POST | Clerk webhook for profile sync |
