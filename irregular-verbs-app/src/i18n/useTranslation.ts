import { useCallback } from "react";
import { translations } from "./translations";
import { useSettings } from "@/hooks/useSettings";
import type { UiLanguage } from "@/domain/settings";

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

/** Translates a dot-path key (e.g. "dashboard.totalVerbs") and interpolates `{{param}}` placeholders. */
export function translate(language: UiLanguage, key: string, params?: Record<string, string | number>): string {
  const value = getByPath(translations[language], key);
  const raw = typeof value === "string" ? value : key;
  if (!params) return raw;
  return Object.entries(params).reduce((acc, [k, v]) => acc.split(`{{${k}}}`).join(String(v)), raw);
}

/** UI language reads from settings (falls back to English while settings are loading/unavailable). */
export function useUiLanguage(): UiLanguage {
  const { settings } = useSettings();
  return settings?.language ?? "en";
}

export function useTranslation() {
  const language = useUiLanguage();
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(language, key, params),
    [language],
  );
  return { t, language };
}
