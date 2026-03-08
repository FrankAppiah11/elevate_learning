# Elevate - Learning with AI

An AI-powered SaaS learning platform where intelligent tutors collaborate with students to build understanding, not just deliver answers.

## Features

- **Role-Based Onboarding** — First-time users choose Student or Instructor on a guided welcome screen
- **Class Code System** — Instructors create classes with auto-generated unique codes; students join by entering the code, linking them to the instructor
- **Clerk Authentication** — Secure login with role-based routing and session management
- **Multi-format Upload** — Screenshots, Word docs, PDFs, text, and web links
- **3 AI Tutor Styles** — Socratic, Structured, and Exploratory with built-in guardrails
- **Interaction Tracking** — Duration, messages, go-backs, and full Q&A history
- **Submit Confirmation** — Students must confirm before submitting to prevent accidental/premature submissions
- **AI Grading** — 60% problem solving, 30% AI competency, 10% correctness
- **Feedback Reports** — AI-generated narrative reports with competency breakdowns
- **Instructor Dashboard** — Activity monitoring, class management, student progress, and final grading
- **Notification System** — Real-time alerts for submissions and grades
- **LMS Integration** — LTI 1.3 support for Canvas, Blackboard, Moodle, and more
- **Supabase Backend** — PostgreSQL database with file storage
- **Vercel Deployment** — Optimized for edge performance

## How It Works

### Onboarding Flow

1. User signs up or signs in via Clerk
2. First-time users are redirected to `/onboarding` to select their role (Student or Instructor)
3. The role is saved to both Supabase and Clerk metadata
4. Users are routed to their respective dashboards

### Instructor Workflow

1. Instructor signs up and selects "Instructor" during onboarding
2. Creates one or more classes from the **My Classes** page
3. Each class gets a unique 6-character code (e.g., `H4KP7N`)
4. Shares the code with students (in-person, email, LMS announcement, etc.)
5. Monitors student AI interactions, reviews submissions, and provides final grades

### Student Workflow

1. Student signs up and selects "Student" during onboarding
2. Joins a class by entering the instructor's code on the **My Classes** page
3. Uploads assignments (screenshot, Word doc, PDF, text, or web link)
4. Selects which class the assignment belongs to
5. Collaborates with an AI tutor to work through the assignment
6. Reviews work and confirms submission via the amber-colored confirmation dialog
7. AI grades the work and generates a feedback report
8. Instructor reviews and provides the final grade

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

## Setup

### 1. Clone and Install

```bash
git clone git@github.com:FrankAppiah11/elevate_learning.git
cd elevate_learning_with_ai
npm install
```

### 2. Environment Variables

Copy `.env.example` and fill in your keys:

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

Run the SQL schema in your Supabase SQL Editor:

```bash
# File: src/lib/supabase-schema.sql
```

If migrating an existing database, run:

```bash
# File: src/lib/migration-class-codes.sql
```

### 4. Clerk Configuration

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Go to **Sessions > Customize session token** and set the claims to:
   ```json
   {
     "metadata": "{{user.public_metadata}}"
   }
   ```
   This allows the middleware to read the user's role and onboarding status.
3. Set up the webhook endpoint: `POST /api/webhooks/clerk`

### 5. Run Development Server

```bash
npm run dev
```

### 6. Deploy to Vercel

```bash
npx vercel
```

Add all environment variables in the Vercel dashboard.

## Grading Scheme

| Criterion | Weight | What It Measures |
|-----------|--------|-----------------|
| Problem Solving | 60% | Student's approach, reasoning, and progression |
| AI Competency | 30% | Quality of questions and use of AI guidance |
| Correctness | 10% | Accuracy of final understanding |

## Class Code System

- Codes are 6-character alphanumeric strings (e.g., `H4KP7N`)
- Characters exclude ambiguous ones (0, O, 1, I, L) for clarity
- Each code is unique across the entire platform
- Instructors can create unlimited classes, each with its own code
- Students can join multiple classes from different instructors
- Assignments are linked to a class, automatically connecting them to the instructor

## LMS Integration

Elevate supports LTI 1.3 for integration with:
- Canvas
- Blackboard
- Moodle
- D2L Brightspace

Configure endpoints in the Instructor Settings page.

## AI Tutor Guardrails

All tutors are bound by strict guardrails:
- Never provide direct answers
- Use different examples from the actual assignment
- Guide through questions, not solutions
- Track learning progress and adapt guidance

## Submit Protection

Students are protected from premature submission:
- The submit button uses an amber/warning color scheme
- Clicking it opens a confirmation modal (not an immediate submit)
- The modal warns that the action cannot be undone
- Students see their session duration and message count before confirming
- A "Go Back" option lets them return to their session
