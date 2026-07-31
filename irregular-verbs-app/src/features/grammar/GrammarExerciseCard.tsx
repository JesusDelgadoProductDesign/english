import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { GrammarExerciseItem } from "@/domain/grammarExercise";
import type { GrammarAnswer } from "@/services/practice/grammarSessionEngine";
import { useTranslation } from "@/i18n/useTranslation";

interface GrammarExerciseCardProps {
  item: GrammarExerciseItem;
  isBusy: boolean;
  onSubmit: (answer: GrammarAnswer) => void;
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function GrammarExerciseCard({ item, isBusy, onSubmit }: GrammarExerciseCardProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  useEffect(() => {
    setText("");
    setSelectedChoiceId(null);
  }, [item.id]);

  const choices = useMemo(() => (item.kind === "multiple-choice" ? shuffled(item.choices) : []), [item]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (item.kind === "typed") {
      if (!text.trim()) return;
      onSubmit({ kind: "typed", text });
    } else {
      if (!selectedChoiceId) return;
      onSubmit({ kind: "multiple-choice", choiceId: selectedChoiceId });
    }
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {item.kind === "typed" ? (
          <>
            {item.promptContext && <p className="text-sm text-slate-500">{item.promptContext}</p>}
            <p className="text-lg font-medium">{item.blankTemplate}</p>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("grammarPractice.typeYourAnswer")}
              autoFocus
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-600 dark:bg-slate-800"
            />
          </>
        ) : (
          <>
            <p className="text-lg font-medium">{item.prompt}</p>
            <p className="text-xs text-slate-500">{t("grammarPractice.chooseCorrectAnswer")}</p>
            <div className="grid gap-2">
              {choices.map((choice) => (
                <label
                  key={choice.id}
                  className={`flex items-center gap-2 rounded-xl border p-3 ${
                    selectedChoiceId === choice.id
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="grammar-choice"
                    checked={selectedChoiceId === choice.id}
                    onChange={() => setSelectedChoiceId(choice.id)}
                  />
                  <span>{choice.text}</span>
                </label>
              ))}
            </div>
          </>
        )}

        <Button type="submit" disabled={isBusy}>
          {isBusy ? t("practice.submitting") : t("grammarPractice.checkAnswer")}
        </Button>
      </form>
    </Card>
  );
}
