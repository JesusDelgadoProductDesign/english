import { useEffect, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { PracticeItem } from "@/domain/practice";
import type { Verb, VerbField } from "@/domain/verb";
import { primaryFormFor } from "@/domain/verb";
import { useTranslation } from "@/i18n/useTranslation";

interface MixedVerbTurnProps {
  item: PracticeItem;
  verb: Verb;
  isBusy: boolean;
  onSubmit: (answers: Partial<Record<VerbField, string>>, hintsUsedByField: Partial<Record<VerbField, number>>) => void;
}

/**
 * A compact verb question for mixed study sessions (random-mix/learning-route/
 * weakness-based) — no hints or retry-until-correct, unlike the full
 * PracticeView, since those modes are single-topic-focused. Post-answer
 * feedback reuses the existing FeedbackPanel unchanged.
 */
export function MixedVerbTurn({ item, verb, isBusy, onSubmit }: MixedVerbTurnProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Partial<Record<VerbField, string>>>({});

  useEffect(() => {
    setValues({});
  }, [item]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values, {});
  }

  return (
    <Card className="space-y-5">
      <Badge tone="brand">{t("topics.irregularVerbs.title")}</Badge>

      <div className="space-y-2">
        {item.givenFields.map((field) => (
          <div key={field} className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t(`fields.${field}`)}
            </span>
            <p className="text-2xl font-bold">{primaryFormFor(verb, field)}</p>
          </div>
        ))}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {item.askedFields.map((field) => (
          <div key={field}>
            <label htmlFor={`mixed-field-${field}`} className="mb-1 block text-sm font-medium">
              {t(`fields.${field}`)}
            </label>
            <input
              id={`mixed-field-${field}`}
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={values[field] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
        ))}
        <Button type="submit" disabled={isBusy}>
          {isBusy ? t("practice.submitting") : t("practice.submitEnter")}
        </Button>
      </form>
    </Card>
  );
}
