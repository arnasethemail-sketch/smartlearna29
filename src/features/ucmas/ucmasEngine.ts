export const TOTAL_UCMAS_QUESTIONS = 10;
export const UCMAS_VALUES_PER_QUESTION = 10;
export const UCMAS_ANSWER_SECONDS = 15;
export const UCMAS_MIN_SPEED_MS = 100;
export const UCMAS_MAX_SPEED_MS = 3000;
export const UCMAS_DEFAULT_SPEED_MS = 1500;

export type UcmasQuestion = {
  values: number[];
  correctAnswer: number;
};

function randomInteger(
  minimum: number,
  maximum: number,
  random: () => number,
) {
  const randomValue = Math.min(Math.max(random(), 0), 0.999999999);
  return Math.floor(randomValue * (maximum - minimum + 1)) + minimum;
}

function randomNonZeroInteger(
  minimum: number,
  maximum: number,
  random: () => number,
) {
  const negativeOptionCount = minimum < 0 ? -minimum : 0;
  const positiveOptionCount = maximum > 0 ? maximum : 0;
  const optionIndex = randomInteger(
    0,
    negativeOptionCount + positiveOptionCount - 1,
    random,
  );

  return optionIndex < negativeOptionCount
    ? minimum + optionIndex
    : optionIndex - negativeOptionCount + 1;
}

export function generateUcmasQuestion(
  random: () => number = Math.random,
): UcmasQuestion {
  const firstValue = randomInteger(1, 9, random);
  const firstSubtraction = -randomInteger(1, firstValue, random);
  const values = [firstValue, firstSubtraction];
  let runningTotal = firstValue + firstSubtraction;

  while (values.length < UCMAS_VALUES_PER_QUESTION) {
    const minimumValue = -Math.min(9, runningTotal);
    const nextValue = randomNonZeroInteger(minimumValue, 9, random);
    values.push(nextValue);
    runningTotal += nextValue;
  }

  return {
    values,
    correctAnswer: runningTotal,
  };
}

export function parseUcmasAnswer(value: string): number | null {
  const normalizedValue = value.replace(/[\s,]/g, "");

  if (!/^\d+$/.test(normalizedValue)) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
}

export function getUcmasSpeedLabel(speedMs: number) {
  if (speedMs >= 2200) {
    return "Slow";
  }

  if (speedMs <= 1000) {
    return "Fast";
  }

  return "Medium";
}

export function formatUcmasSpeed(speedMs: number) {
  return `${getUcmasSpeedLabel(speedMs)} · ${(speedMs / 1000).toFixed(1)} seconds`;
}
