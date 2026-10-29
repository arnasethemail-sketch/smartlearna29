export const FRACTION_BEST_TIME_STORAGE_KEY =
  "grade4-math-practice:fraction-best-time-seconds";

function normalizeSeconds(seconds: number) {
  return Math.max(0, Math.floor(seconds));
}

function loadStoredNumber(storageKey: string): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedValue = window.localStorage.getItem(storageKey);
    if (savedValue === null) {
      return null;
    }

    const parsedValue = Number(savedValue);
    return Number.isFinite(parsedValue) && parsedValue >= 0
      ? parsedValue
      : null;
  } catch {
    return null;
  }
}

function saveStoredNumber(storageKey: string, value: number) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, String(value));
  } catch {
    // Practice still works when browser storage is unavailable.
  }
}

export function formatFractionTime(seconds: number) {
  const normalizedSeconds = normalizeSeconds(seconds);
  const minutes = Math.floor(normalizedSeconds / 60);
  const remainingSeconds = normalizedSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function loadFractionBestTime() {
  const savedTime = loadStoredNumber(FRACTION_BEST_TIME_STORAGE_KEY);
  return savedTime === null ? null : normalizeSeconds(savedTime);
}

export function saveFractionBestTime(seconds: number) {
  saveStoredNumber(
    FRACTION_BEST_TIME_STORAGE_KEY,
    normalizeSeconds(seconds),
  );
}

export function resolveFractionBestTime(
  completedTime: number,
  savedBestTime: number | null,
) {
  const normalizedTime = normalizeSeconds(completedTime);
  const isNewBestTime =
    savedBestTime === null || normalizedTime < savedBestTime;

  return {
    bestTime: isNewBestTime ? normalizedTime : savedBestTime,
    isNewBestTime,
  };
}
