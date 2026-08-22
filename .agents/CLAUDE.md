# Claude Agent Rules — Attendsys

> These rules apply specifically to **Claude (Anthropic) and all remote/external agents** when operating as a development agent on this project.
> They do **NOT** apply to Antigravity / Gemini — those agents operate under their own system instructions.
> These rules extend and are subordinate to the design and quality standards defined in `AGENTS.md`.
> **Read `AGENTS.md` first. Read this file second. Do not begin implementation until both are understood.**

---

## Session Startup (Required Every Chat — Do Not Skip Any Step)

1. Clone or pull the repository so the local copy is on the latest `main` commit.
2. Read `.agents/AGENTS.md` in full.
3. Read this file (`CLAUDE.md`) in full.
4. Set **and verify** git identity (see **Git Identity** below) — this is a hard gate before any commit or push.
5. Confirm the current branch and last commit before writing any code.
6. Run `git log --oneline origin/main..HEAD` — if any unpushed commits exist from a previous session, push them immediately before starting new work.
7. **Explicitly acknowledge the commit-and-push-after-every-file rule before beginning any task.**

---

## Git Identity

**This is a hard gate. No commit or push may occur until these values are confirmed correct.**

Configure and verify these values at the start of every session, and re-verify before the very first `git push` of any session:

```bash
git config user.name "Obboye Bossman"
git config user.email "obboyebossman@gmail.com"
```

After setting, always confirm with:

```bash
git config user.name   # must print: Obboye Bossman
git config user.email  # must print: obboyebossman@gmail.com
```

If either value does not match exactly, fix it and re-verify before touching any file or running any git command. **Never commit as Claude, Gemini, Antigravity, or any other identity.** Commits authored under the wrong identity will misrepresent the repository history and are not acceptable.

---

## Branching Strategy

- **Never work directly on `main` for new features or serious edits.**
- Create a feature branch at the start of every new feature or significant change:

```bash
git checkout -b feat/<feature-name>
```

- Work on that branch. Commit and push **every file change** to the feature branch as you go (see **Commit Cadence** below).
- When the full feature or objective is complete and the user explicitly asks for a build, run build and all checks on the branch.
- Only after all checks pass clean, and only when the user explicitly requests it, merge into `main`:

```bash
git checkout main
git merge feat/<feature-name>
git push origin main
```

- Delete both the local and remote feature branch after a successful merge:

```bash
git branch -d feat/<feature-name>
git push origin --delete feat/<feature-name>
```

- Work directly on `main` **only** for trivial, single-line fixes where a branch would add no value — and only if explicitly agreed by the user.

---

## Commit Cadence — Commit & Push on Every Change

This is the **primary workflow rule** for all development on this project. Violating this rule is not acceptable under any circumstance.

### The Law: One File = One Commit = One Push. Immediately.

The sequence is:

```
0. Before the FIRST push of any session — verify git identity:
     git config user.name   → must be: Obboye Bossman
     git config user.email  → must be: obboyebossman@gmail.com
   If wrong, fix and re-verify. Then continue.
1. Write or modify ONE file
2. git add <that file>
3. git commit -m "<type>(<scope>): <description>"
4. git push origin <branch>
5. ONLY THEN move to the next file or task
```

**There is no step 5 without step 4. No exceptions.**

### Hard Rules — These Are Non-Negotiable

- **NEVER** touch a second file before committing and pushing the first.
- **NEVER** leave a commit unpushed. A local commit that has not been pushed does not exist as far as this project is concerned.
- **NEVER** batch multiple file changes into one commit unless they are a single atomic unit (e.g., a component file and its co-located type definition that cannot function independently).
- **NEVER** push multiple commits in one `git push`. Push after every single commit.
- **NEVER** proceed to the next task, next file, or next step in a plan until the previous file is committed AND pushed and the push has returned successfully.
- Each commit message must describe exactly what changed in that one file — not what the feature does overall.

### What a Violation Looks Like — Never Do This

❌ Write 3 files, then commit them all together, then push once.
❌ Write a file, commit it, then write another file before pushing.
❌ Finish a feature, then push all commits at the end.
❌ Say "I'll push when the feature is done."

### What Correct Behaviour Looks Like — Always Do This

✅ Write `components/MyComponent.tsx` → commit → push → confirm push succeeded → then open the next file.
✅ If a push fails, fix the push error immediately before touching any other file.
✅ If unsure whether the last push succeeded, run `git status` and `git log --oneline origin/<branch>..HEAD` to verify — zero unpushed commits before continuing.

### Verification After Every Push

After every `git push`, confirm it succeeded by checking the output. If it did not succeed:
1. Stop all other work immediately.
2. Fix the push error.
3. Push again.
4. Only then continue.

### Build — Never Run Unless Explicitly Asked

- **NEVER run `npm run build` automatically.**
- **NEVER run `npm run build` as part of a commit-and-push cycle.**
- **ONLY run `npm run build` when the user explicitly asks for it.**

### After the Full Feature or Objective Is Complete (and the user asks for a build)

Only once **all files for the feature have been individually committed and pushed** do you:

1. Run the build (ONLY when user explicitly requests):

```bash
npm run build
```

2. Fix **every** build error — committing and pushing each fix individually before moving to the next error.

3. Run lint and type-check if available:

```bash
npm run lint       # if present
npm run typecheck  # if present
```

4. Fix any errors, committing and pushing each fix individually.

5. Only when all checks pass clean, and user explicitly requests a merge, merge into `main` and push:

```bash
git checkout main
git merge feat/<feature-name>
git push origin main
```

6. Delete the feature branch locally and remotely:

```bash
git branch -d feat/<feature-name>
git push origin --delete feat/<feature-name>
```

### Summary

| Phase | Action |
|---|---|
| Start of feature | Create feature branch |
| Every single file added or changed | Commit that file → Push immediately → Confirm push → Then and only then move on |
| Build execution | **NEVER run `npm run build` unless explicitly asked by the user** |
| Build error fix (if user asks for build) | Commit the fix → Push → Confirm → Move to next error |
| Full feature complete | Wait for user to explicitly request build and merge |
| Merge | **NEVER merge to `main` unless user explicitly asks** |

---

## Security — Credentials & Secrets

- **Never** print, log, echo, commit, or expose any credential (PAT, API key, password, secret).
- Use secrets only for the operation they were provided for.
- After any `git push` that required a PAT embedded in the remote URL, immediately scrub it:

```bash
git remote set-url origin https://github.com/ObboyeBossman/attendsys.git
```

- Do not store or reuse credentials across sessions.

---

## Validation — Must Pass After Every Feature (Only When User Asks)

Build and lint checks run **only when the user explicitly requests them** — never automatically. See the **Commit Cadence** section above for the full workflow.

```bash
npm run build
```

- Resolve **all** build errors, committing and pushing each fix individually.
- Also run lint and type-check if they exist in `package.json`:

```bash
npm run lint       # if present
npm run typecheck  # if present
```

- All checks must pass clean before the feature is declared done.
- **Never** leave the repository in a broken state at the end of a session.

---

## Implementation Standards

Follow the conventions established in `AGENTS.md` as the source of truth for design and code quality.
Additionally, as Claude:

- Keep diffs minimal and focused — only change what is required for the task.
- Do not refactor unrelated code unless it directly blocks the task.
- Maintain backward compatibility unless instructed otherwise.
- Write production-ready, readable, maintainable code.
- Prefer semantic HTML, accessible patterns, and mobile-first layout — as defined in `AGENTS.md`.

---

## Communication Protocol

**Before non-trivial work:**
- State the implementation plan in 2–4 sentences.
- Call out assumptions and risks upfront.

**After completing work:**
- Summarise the changes made (what files, what changed, why).
- Report build and lint results explicitly (only when asked to run them).
- Note any remaining issues or follow-up recommendations.

---

## Context Limit Handling

If the session is approaching its context limit:

1. Do **not** leave the repository mid-file or in an incoherent state.
2. Finish the current file change, commit, and push it to the feature branch.
3. Do **not** merge into `main` — the feature branch is the safe holding place.
4. Leave a clear written summary covering:
   - What was completed
   - What files were committed and pushed
   - What remains before the branch can be merged
   - Assumptions made
   - Recommended next steps for the next session

Every committed file should be pushed to the feature branch — never leave unpushed local commits at session end.

---

## Agent Memory — Notion Session Log

The project maintains a persistent memory document in Notion that survives across sessions. Every agent **must** read it at session start and write to it actively during work.

**Notion page:** https://app.notion.com/p/3c498408449f812f8be4dcdc942a3627

### Session Start — Required Steps (in order)

1. Open the Agent Memory page in Notion (URL above).
2. Read every section: Current Task, Status, Active Branch, What Was Just Done, What Remains, Backlog.
3. If Status is `in-progress` or there is an Active Branch — resume that work immediately without asking for a recap.
4. If the user says **"Continue"** — this means: read the memory doc, understand exactly where you left off, and proceed. No further explanation from the user is needed.
5. Only after reading the memory doc do you proceed to clone/pull the repo, read `AGENTS.md`, and read `CLAUDE.md`.

### During Work — Write Actively

Update the Notion memory page **proactively** as you work. Do not wait until the end of the session. Write to it at each of these milestones:

| Milestone | What to update |
|---|---|
| Feature branch created | Active Branch, Status → `in-progress` |
| Each file committed and pushed | Append row to Session Log, update "What Was Just Done" |
| Build passes | Note in Session Log |
| Branch merged to main | Status → `idle`, Active Branch → `main`, clear "What Remains" |
| Task completed | Move task out of Backlog, update Current Task to next item |
| Session ending | Write end-of-session summary row in Session Log, update "What Remains" with exact next steps |

### Memory Page Structure

The memory page contains these sections — keep them accurate at all times:

- **Current Task** — one sentence describing what is being worked on right now
- **Status** — one of: `in-progress` / `ready-to-start` / `blocked` / `ready-to-merge` / `idle`
- **Active Branch** — current feature branch name, or `main` if none
- **What Was Just Done** — last 3–5 completed actions, most recent first
- **What Remains** — ordered steps still needed to finish the current task
- **Backlog** — future tasks in priority order
- **Project Context** — stable reference info (repo, stack, rules) — do not modify unless something changes
- **Session Log** — append-only timestamped history of every action taken; never delete rows

### Rules

- **Never skip reading the memory doc** at session start. It is as mandatory as reading `AGENTS.md` and `CLAUDE.md`.
- **Never skip writing** to the memory doc during work. Silent sessions that produce no memory updates are a violation.
- Write to Notion **before** moving to the next file or task — the same discipline as commit-and-push.
- If the Notion connection is unavailable, note this in your opening message and proceed — but write double-detailed summaries in the chat so the user can manually update the doc.
- The Session Log is append-only. Never edit or delete past rows.

---

## Relationship to AGENTS.md

| Concern | Source of truth |
|---|---|
| Design philosophy & visual language | `AGENTS.md` |
| Interaction & motion principles | `AGENTS.md` |
| Mobile-first & responsive rules | `AGENTS.md` |
| Git identity, branching, security | `CLAUDE.md` (this file) |
| Build validation & push rules | `CLAUDE.md` (this file) |
| Communication & session workflow | `CLAUDE.md` (this file) |
| Persistent session memory | Notion — Agent Memory page (URL in this file) |

When there is any conflict, `AGENTS.md` wins on design decisions; `CLAUDE.md` wins on workflow and process decisions.
