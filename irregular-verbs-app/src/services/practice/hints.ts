import type { HintType } from "@/domain/practice";

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function maskWith(answer: string, predicate: (char: string) => boolean, revealCount = 0): string {
  let revealed = 0;
  return answer
    .split("")
    .map((char) => {
      if (char === " ") return " ";
      if (predicate(char)) return char;
      if (revealed < revealCount) {
        revealed += 1;
        return char;
      }
      return "_";
    })
    .join("");
}

/** Renders a single hint for the given answer. `progressiveLettersRevealed` powers "reveal one new letter" mode. */
export function renderHint(hint: HintType, answer: string, progressiveLettersRevealed = 0): string {
  switch (hint) {
    case "first-letter":
      return `${answer[0]}${"_".repeat(Math.max(0, answer.length - 1))}`;
    case "letter-count":
      return String(answer.length);
    case "missing-vowels":
      return maskWith(answer, (c) => !VOWELS.has(c));
    case "missing-consonants":
      return maskWith(answer, (c) => VOWELS.has(c));
    case "reveal-on-attempt":
      return maskWith(answer, () => false, progressiveLettersRevealed);
  }
}
