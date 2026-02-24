# Elevate - Learning with AI

An AI-powered SaaS learning platform where intelligent tutors collaborate with students to build understanding, not just deliver answers.

## Features

- **Clerk Authentication** — Student and Instructor roles with secure login
- **Multi-format Upload** — Screenshots, Word docs, PDFs, text, and web links
- **3 AI Tutor Styles** — Socratic, Structured, and Exploratory with built-in guardrails
- **Interaction Tracking** — Duration, messages, go-backs, and full Q&A history
- **AI Grading** — 60% problem solving, 30% AI competency, 10% correctness
- **Feedback Reports** — AI-generated narrative reports with competency breakdowns
- **Instructor Dashboard** — Activity monitoring, student management, and final grading
- **Notification System** — Real-time alerts for submissions and grades
- **LMS Integration** — LTI 1.3 support for Canvas, Blackboard, Moodle, and more
- **Supabase Backend** — PostgreSQL database with file storage
- **Vercel Deployment** — Optimized for edge performance

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
git clone <repo-url>
cd elevate_learning_with_ai
npm install
```

### 2. Environment Variables

Copy `.env.local` and fill in your keys:

```env
# Clerk (https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI (https://platform.openai.com)
OPENAI_API_KEY=sk-...
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# File: src/lib/supabase-schema.sql
```

### 4. Clerk Configuration

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Add `role` to user public metadata (`student` or `instructor`)
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
