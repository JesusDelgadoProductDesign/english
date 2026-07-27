# Verbly — English Irregular Verbs Trainer

A mobile-first web app for mastering English irregular verbs through active recall,
spaced repetition, adaptive practice, and light gamification. Runs entirely
client-side; all progress is stored in `localStorage`.

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
```

To re-import verbs from a Word document (same table shape: Infinitive: meaning |
Past Simple | Past Participle, repeated in groups of 3 columns):

```bash
npm run import-verbs -- "path/to/Verbs.docx"
```

This regenerates `src/data/verbs.json`. The importer is reusable for future
datasets (regular verbs, phrasal verbs, vocabulary sets) with the same 3-column shape.

## Architecture

```
src/
  domain/         Plain types + pure helpers (Verb, SrsCard, GamificationState, ...)
  services/
    storage/       StorageAdapter interface + LocalStorageAdapter (swap for an HTTP
                    adapter later without touching repositories or UI)
    repositories/   One repository per concern (verbs, progress/SRS, gamification,
                    settings, history) — the only code that talks to storage
    srs/            SM-2-inspired spaced repetition engine
    practice/        Item generation, answer checking, hints, verb selection,
                     session orchestration (sessionEngine ties it together)
    gamification/    XP/level/streak/achievement rules
    analytics/       Dashboard stat aggregation
    content/         Template-based example sentences
    tts/             Web Speech API wrapper
  hooks/            React Query hooks bridging services to components
  components/       Reusable UI (buttons, cards, charts) — no business logic
  features/         Practice, dashboard, settings screens
  pages/            Route-level composition
```

Swapping `localStorage` for a real backend later means writing one new
`StorageAdapter` (e.g. `HttpStorageAdapter`) — the repositories, hooks, and UI
don't change.

## What's implemented

- 116 verbs imported from the source document (infinitive, past simple, past
  participle, meaning — all as arrays, so multiple accepted forms/translations
  are supported).
- All 6 practice modes (Mixed Challenge is the default/dominant mode in "auto-mix").
- Random / weighted / adaptive verb selection; adaptive also biases *which field*
  is asked based on the learner's weakest field per verb.
- Full hint system (first letter, letter count, missing vowels/consonants,
  progressive letter reveal on wrong attempts), triggered by Space on an empty field.
- 5 feedback modes, including a genuine retry-until-correct loop.
- SM-2-style spaced repetition driving mastery and adaptive scheduling.
- XP, levels, daily streak, achievements, daily goal.
- Dashboard: progress/performance/learning/review stats, 30-day activity heatmap,
  XP and accuracy sparklines, weakest/strongest verb lists.
- Keyboard shortcuts (Enter to submit, Space for hints, native Tab order),
  ARIA labels, focus management, a skip link, and a screen-reader table
  fallback for both charts.
- Pronunciation playback via the Web Speech API (en-US voice).

## Deliberately deferred (documented, not silently skipped)

- **IPA transcriptions, curated collocations/phrasal verbs, recorded audio**:
  no source data existed for these; the content service is structured so they
  can be added per-verb without changing call sites.
- **Example sentences are template-generated**, not authored per verb — good
  enough for grammatical correctness, but generic. A future pass could curate
  or LLM-generate per-verb sentences.
- **Leaderboard, multiplayer, cloud sync, auth**: explicitly out of scope per
  the "future modules" list; the repository/storage-adapter split exists
  specifically to make these additive later.

## Roadmap

1. Curated example sentences + collocations per verb.
2. Optional backend (`HttpStorageAdapter`) for cross-device sync.
3. Leaderboard once an account system exists.
4. Additional datasets (regular verbs, phrasal verbs) via the same importer.
