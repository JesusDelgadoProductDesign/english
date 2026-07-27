import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { HintType } from "@/domain/practice";
import { ALL_MODES } from "@/domain/practice";
import type { VerbField } from "@/domain/verb";
import { acceptedAnswersFor, primaryFormFor } from "@/domain/verb";
import { FIELD_LABELS } from "@/domain/fieldLabels";
import { checkAnswer } from "@/services/practice/answerChecking";
import { renderHint, HINT_LABELS } from "@/services/practice/hints";
import { speak, isSpeechSupported } from "@/services/tts/speechService";
import { usePracticeSession } from "@/hooks/usePracticeSession";
import { FeedbackPanel } from "./FeedbackPanel";

type FieldState = {
  value: string;
  revealedHints: HintType[];
  revealedLetters: number;
  attempts: number;
  wrongSinceLastCheck: boolean;
};

function emptyFieldState(): FieldState {
  return { value: "", revealedHints: [], revealedLetters: 0, attempts: 0, wrongSinceLastCheck: false };
}

export function PracticeView() {
  const { item, verb, outcome, settings, isBusy, error, loadNext, answer } = usePracticeSession();
  const [fields, setFields] = useState<Record<string, FieldState>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const itemKey = item ? `${item.verbId}:${item.mode}:${item.askedFields.join(",")}` : null;

  useEffect(() => {
    if (settings && !item) loadNext();
  }, [settings, item, loadNext]);

  useEffect(() => {
    if (!item) return;
    const initial: Record<string, FieldState> = {};
    for (const field of item.askedFields) initial[field] = emptyFieldState();
    setFields(initial);
    const firstField = item.askedFields[0];
    requestAnimationFrame(() => inputRefs.current[firstField]?.focus());
  }, [itemKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const manualHintTypes: HintType[] = useMemo(
    () => (settings?.enabledHints ?? []).filter((h) => h !== "reveal-on-attempt"),
    [settings],
  );
  const autoRevealEnabled = settings?.enabledHints.includes("reveal-on-attempt") ?? false;

  if (!settings || !item || !verb) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Loading your next verb…</p>
      </Card>
    );
  }

  if (outcome) {
    return (
      <FeedbackPanel
        verb={verb}
        outcome={outcome}
        audioEnabled={settings.audioEnabled}
        isBusy={isBusy}
        onNext={() => {
          void loadNext();
        }}
      />
    );
  }

  const modeLabel = ALL_MODES.find((m) => m.id === item.mode)?.label ?? item.mode;

  function revealNextHint(field: VerbField) {
    setFields((prev) => {
      const state = prev[field] ?? emptyFieldState();
      const nextIndex = state.revealedHints.length;
      if (nextIndex >= manualHintTypes.length) return prev;
      return { ...prev, [field]: { ...state, revealedHints: [...state.revealedHints, manualHintTypes[nextIndex]] } };
    });
  }

  function handleChange(field: VerbField, value: string) {
    setFields((prev) => ({ ...prev, [field]: { ...(prev[field] ?? emptyFieldState()), value } }));
  }

  function handleKeyDown(field: VerbField, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === " " && e.currentTarget.value.trim() === "") {
      e.preventDefault();
      revealNextHint(field);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    if (!item || !verb || isBusy) return;

    if (settings!.feedbackMode === "retry-until-correct") {
      // Compute correctness up front (from the current render's `fields`) rather than inside the
      // setFields updater — React 18 StrictMode double-invokes updaters, so a value mutated inside
      // one and read immediately after would be stale/unreliable.
      const checks = item.askedFields.map((field) => {
        const state = fields[field] ?? emptyFieldState();
        const { correct } = checkAnswer(state.value, acceptedAnswersFor(verb, field));
        return { field, correct };
      });
      const allCorrect = checks.every((c) => c.correct);

      if (allCorrect) {
        finalize();
        return;
      }

      setFields((prev) => {
        const next: Record<string, FieldState> = { ...prev };
        for (const { field, correct } of checks) {
          const state = next[field] ?? emptyFieldState();
          if (!correct) {
            const revealedLetters = autoRevealEnabled ? state.revealedLetters + 1 : state.revealedLetters;
            next[field] = { ...state, attempts: state.attempts + 1, wrongSinceLastCheck: true, revealedLetters };
          } else {
            next[field] = { ...state, wrongSinceLastCheck: false };
          }
        }
        return next;
      });
      return;
    }

    finalize();
  }

  function finalize() {
    if (!item) return;
    const answers: Partial<Record<VerbField, string>> = {};
    const hintsUsedByField: Partial<Record<VerbField, number>> = {};
    for (const field of item.askedFields) {
      const state = fields[field] ?? emptyFieldState();
      answers[field] = state.value;
      hintsUsedByField[field] = state.revealedHints.length + state.revealedLetters + state.attempts;
    }
    void answer(answers, hintsUsedByField);
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge tone="brand">{modeLabel}</Badge>
        <span className="text-xs text-slate-400">
          {settings.selectionStrategy === "adaptive" ? "Adaptive" : settings.selectionStrategy === "weighted" ? "Weighted" : "Random"} selection
        </span>
      </div>

      <div className="space-y-2">
        {item.givenFields.map((field) => (
          <div key={field} className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {FIELD_LABELS[field]}
            </span>
            <p className="text-2xl font-bold">{primaryFormFor(verb, field)}</p>
            {settings.audioEnabled && isSpeechSupported() && field !== "meaning" && (
              <button
                type="button"
                aria-label={`Play pronunciation for ${primaryFormFor(verb, field)}`}
                onClick={() => speak(primaryFormFor(verb, field))}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                🔊
              </button>
            )}
          </div>
        ))}
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {item.askedFields.map((field) => {
          const state = fields[field] ?? emptyFieldState();
          return (
            <div key={field}>
              <label htmlFor={`field-${field}`} className="mb-1 block text-sm font-medium">
                {FIELD_LABELS[field]}
              </label>
              <input
                id={`field-${field}`}
                ref={(el) => {
                  inputRefs.current[field] = el;
                }}
                type="text"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={state.value}
                onChange={(e) => handleChange(field, e.target.value)}
                onKeyDown={(e) => handleKeyDown(field, e)}
                aria-describedby={state.revealedHints.length ? `hints-${field}` : undefined}
                aria-invalid={state.wrongSinceLastCheck}
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:bg-slate-800 ${
                  state.wrongSinceLastCheck
                    ? "border-red-400 dark:border-red-500"
                    : "border-slate-300 dark:border-slate-600"
                }`}
              />
              {state.wrongSinceLastCheck && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">Not quite — try again.</p>
              )}
              {(state.revealedHints.length > 0 || state.revealedLetters > 0) && (
                <div id={`hints-${field}`} className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                  {state.revealedHints.map((hint) => (
                    <p key={hint}>
                      <span className="font-medium">{HINT_LABELS[hint]}:</span>{" "}
                      {renderHint(hint, acceptedAnswersFor(verb, field)[0] ?? "")}
                    </p>
                  ))}
                  {state.revealedLetters > 0 && (
                    <p>
                      <span className="font-medium">{HINT_LABELS["reveal-on-attempt"]}:</span>{" "}
                      {renderHint("reveal-on-attempt", acceptedAnswersFor(verb, field)[0] ?? "", state.revealedLetters)}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <Button type="submit" className="w-full sm:w-auto" disabled={isBusy}>
          {isBusy ? "Submitting…" : "Submit (Enter)"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <p className="text-xs text-slate-400">
        Tip: press <kbd className="rounded bg-slate-100 px-1 dark:bg-slate-800">Space</kbd> in an empty field for a
        hint.
      </p>
    </Card>
  );
}
