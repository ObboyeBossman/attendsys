# AttendSys — Agent Configuration

This file describes the agent setup, coding standards, and workflow rules for AI-assisted development on the **AttendSys** project.

---

## Project Overview

**AttendSys** is a university attendance management system built with Next.js 16, Supabase, and Tailwind CSS. It serves four user portals: Student, Lecturer, Class Rep, and Admin.

---

## Agent Source of Truth

All agents working on this repository must read these two files before touching any code:

| File | Purpose |
|------|---------|
| `.agents/AGENTS.md` | Design philosophy, visual language, typography system, icon rules, spacing, motion, mobile-first layout |
| `.agents/CLAUDE.md` | Git identity, branching strategy, commit cadence, security rules, validation steps, communication protocol |

**Do not write a single line of code until both files have been read in full.**

---

## Tech Stack

```
Framework:    Next.js 16 (App Router)
Language:     TypeScript
Styling:      Tailwind CSS (all values via CSS custom properties — no hardcoded values)
Database:     Supabase (PostgreSQL + Auth + Storage)
Icons:        lucide-react ONLY (strokeWidth={1.75})
Fonts:        Plus Jakarta Sans (headings), Inter (UI/body), JetBrains Mono (code/IDs)
```

---

## Key Architectural Rules

### Token System (Zero Tolerance)
- ALL visual values (colors, spacing, typography, radii, shadows, motion) live in `src/styles/tokens.css` as CSS custom properties
- ALL tokens are mapped to Tailwind utility classes in `tailwind.config.ts`
- NO hardcoded hex values, raw Tailwind color classes, raw spacing, or raw font sizes anywhere in components or pages
- Violation of this rule is never acceptable — no exceptions

### Component Library
- All UI is built from primitives in `src/components/ui/`
- Pages consume components — they never reimplement their own UI patterns
- Every component handles all 8 states: Default, Hover, Focus, Active, Disabled, Loading, Success, Error
- Every screen has: empty state, loading skeleton, error state

### Commit Cadence (Non-Negotiable)
```
One file → one commit → one push → immediately
```
- Never batch multiple files into one commit
- Never leave a commit unpushed
- Never push multiple commits at once

---

## Branching Strategy

- Never work directly on `main`
- Create a feature branch per feature: `feat/<feature-name>`
- Merge to `main` only when a feature is complete and explicitly requested
- Delete branches after merge (local and remote)

---

## Task Execution Protocol

- Work on **exactly one task per instruction**
- After completing a task: report what was done, confirm all commits are pushed, then **stop**
- Do not anticipate, plan ahead for, or begin the next task until explicitly instructed
- Wait for the next instruction before doing anything

---

## Security Rules

- Never print, log, echo, or commit any PAT, secret, or credential
- Scrub PAT from remote URL immediately after every push
- Never commit `.env.local` or any environment variable file

---

## Directory Structure

```
src/app/          — App Router pages (admin/, student/, lecturer/, rep/, (auth)/)
src/components/   — Shared UI components (single source of truth)
src/components/ui — Primitive components: Button, Card, Badge, Input, Modal, etc.
src/actions/      — Next.js server actions (all Supabase RPC calls live here)
src/lib/          — Utilities and Supabase client
src/styles/       — tokens.css (all CSS custom properties)
supabase/         — Database migrations and edge functions
doc/              — Design system, portal specs, and task lists
.agents/          — Agent configuration and UI inspiration references
```

---

## Infrastructure

- **Supabase** — auto-deploys migrations from `supabase/migrations/` on push to `main`
- **Vercel** — auto-deploys on push to `main`; preview deployments on every feature branch
- Never run `vercel deploy` or `supabase db push` manually — GitHub push is the deployment mechanism
