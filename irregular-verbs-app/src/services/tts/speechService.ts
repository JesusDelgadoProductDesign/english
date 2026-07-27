/** Thin wrapper over the Web Speech API for American-English pronunciation playback. */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickAmericanVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => v.lang === "en-US") ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
  return cachedVoice;
}

export function speak(text: string): void {
  if (!isSpeechSupported() || !text.trim()) return;

  window.speechSynthesis.cancel(); // avoid overlapping utterances from rapid clicks
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  const voice = pickAmericanVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

// Some browsers load voices asynchronously; refresh the cache once they arrive.
if (isSpeechSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
  };
}
