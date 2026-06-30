# PGB AI Lab 3 — Live Session

Real-time facilitator/participant session app for **PGB AI Lab Series, Lab 3: Build the Platform**.

The facilitator runs a 3-column split screen (slide content · word-for-word script · live participant answers). Participants join from their own device using a 4-digit PIN, see the current slide and question, and submit answers that appear on the facilitator's screen within ~2.5 seconds.

## Stack

- React 18 + Vite
- Supabase (Postgres + REST) for live multi-device sync — polling every 2.5s
- No auth — session-scoped by PIN, matches PGB's existing permissive-RLS tool pattern

## One-time setup

### 1. Supabase schema

Run `supabase_schema.sql` in your Supabase project's SQL Editor (Dashboard → SQL Editor → New Query → paste → Run). This creates three tables: `lab3_sessions`, `lab3_presence`, `lab3_answers`, with permissive RLS policies matching PGB's other tools.

### 2. Supabase credentials

Already wired into `src/supabaseClient.js`:
- Project URL: `https://ppmvfkmltfxmllnlinsl.supabase.co`
- Anon public key: embedded directly (safe — RLS policies control access, and this is the publishable anon key, not a service key)

If you rotate the key or move to a new project, update both values at the top of `src/supabaseClient.js`.

### 3. Install & run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect this GitHub repo directly in the Vercel dashboard (Import Project → select `SCM-AI-LAB3-Session`) for auto-deploy on every push to `main`.

No environment variables are required — Supabase credentials are baked into the client file (this matches the pattern PGB's other Lab Series tools use, since the anon key is safe to expose with RLS in place).

## Usage

**Facilitator:**
1. Open the deployed URL
2. Tap "Start Facilitator Session"
3. Share the 4-digit PIN shown in the top bar with participants
4. Navigate slides with ‹ › buttons, the bottom strip, or arrow keys
5. Watch answers stream into the right column as participants submit
6. Use "📋 Summary" any time to see all Q&A in one printable view
7. Use "⟲ Clear" (per-slide) or "⟲ Reset All" (whole session) to wipe data — both require confirmation

**Participant:**
1. Open the same deployed URL
2. Tap "I'm a Participant"
3. Enter your name + the facilitator's PIN
4. Your screen auto-advances as the facilitator changes slides
5. Type your answer in the box and tap Submit — it appears on the facilitator's screen live

## Data lifecycle

Sessions, presence, and answers persist in Supabase indefinitely (no auto-expiry by default). To clean up old sessions, run periodically in the SQL Editor:

```sql
delete from lab3_sessions where created_at < now() - interval '7 days';
```

(Cascading deletes will also remove associated presence and answer rows.)

## File structure

```
├── index.html              Vite entry HTML
├── src/
│   ├── main.jsx             React root
│   ├── App.jsx              Main app — role select, facilitator view, participant view
│   ├── slidesData.js        All 8 slides + dialogue script + questions
│   ├── SlideComponents.jsx  Shared slide rendering (SlideBody, SlideFrame, DialoguePanel)
│   └── supabaseClient.js    Supabase client + all DB helper functions
├── supabase_schema.sql      Run once in Supabase SQL Editor
├── package.json
└── vite.config.js
```

## Related PGB AI Lab Series materials

- `PGB_AI_Lab3.html` — standalone self-paced learning app (Claude API powered)
- `PGB_AI_Platform_Roadmap_2026.pptx` — source presentation deck
- `PGB_Lab3_Facilitator_Dialogue.docx` / `.pdf` — full word-for-word facilitator script (print format)
- `PGB_Lab3_SideBySide.pdf` — slide + script side-by-side printable reference

---

PGB AI Lab Series · Pagsalig · Hiniusang Pagkugi · Pagpalambo
