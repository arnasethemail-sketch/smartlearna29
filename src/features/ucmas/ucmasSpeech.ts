const DIGIT_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
] as const;

export function formatUcmasSpokenValue(value: number) {
  const digitWord = DIGIT_WORDS[Math.abs(value)];
  return value < 0 ? `minus ${digitWord}` : digitWord;
}

type SpeakUcmasValuesOptions = {
  values: readonly number[];
  delayMs: number;
  onComplete: () => void;
  onUnsupported: () => void;
};

export function speakUcmasValues({
  values,
  delayMs,
  onComplete,
  onUnsupported,
}: SpeakUcmasValuesOptions) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    !("SpeechSynthesisUtterance" in window)
  ) {
    onUnsupported();
    return () => undefined;
  }

  const speech = window.speechSynthesis;
  let cancelled = false;
  let delayTimer: number | null = null;
  let valueIndex = 0;

  speech.cancel();

  const speakNextValue = () => {
    if (cancelled) {
      return;
    }

    const isLastValue = valueIndex === values.length - 1;
    const utterance = new window.SpeechSynthesisUtterance(
      formatUcmasSpokenValue(values[valueIndex]),
    );
    utterance.rate =
      delayMs <= 200
        ? 2
        : delayMs <= 1000
          ? 1.15
          : delayMs >= 2200
            ? 0.9
            : 1;

    if (isLastValue) {
      let finalUtteranceFinished = false;
      const finishSequence = () => {
        if (cancelled || finalUtteranceFinished) {
          return;
        }

        finalUtteranceFinished = true;
        onComplete();
      };
      utterance.onend = finishSequence;
      utterance.onerror = finishSequence;
    }

    speech.speak(utterance);
    valueIndex += 1;

    if (!isLastValue) {
      // Schedule from the start of this value so the selected speed is the
      // actual start-to-start interval, not the interval plus speaking time.
      delayTimer = window.setTimeout(speakNextValue, delayMs);
    }
  };

  speakNextValue();

  return () => {
    cancelled = true;
    if (delayTimer !== null) {
      window.clearTimeout(delayTimer);
    }
    speech.cancel();
  };
}
