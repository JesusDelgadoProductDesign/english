import type { DifficultyLevel, FeedbackMode, HintType, PracticeMode, SelectionStrategy } from "./practice";

export interface UserSettings {
  preferredMode: PracticeMode | "auto-mix";
  selectionStrategy: SelectionStrategy;
  difficulty: DifficultyLevel;
  feedbackMode: FeedbackMode;
  enabledHints: HintType[];
  audioEnabled: boolean;
  dailyGoal: number;
}

export function createDefaultSettings(): UserSettings {
  return {
    preferredMode: "auto-mix",
    selectionStrategy: "adaptive",
    difficulty: "medium",
    feedbackMode: "progressive-hints",
    enabledHints: ["first-letter", "letter-count", "missing-vowels", "missing-consonants", "reveal-on-attempt"],
    audioEnabled: true,
    dailyGoal: 20,
  };
}
