export const ADDITION_BEST_TIME_STORAGE_KEY =
  "grade4-math-practice:addition-best-time-seconds";

function normalizeSeconds(seconds: number) {
  return Math.max(0, Math.floor(seconds));
}

export function formatAdditionTime(seconds: number) {
  const normalizedSeconds = normalizeSeconds(seconds);
  const minutes = Math.floor(normalizedSeconds / 60);
  const remainingSeconds = normalizedSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function loadAdditionBestTime(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedValue = window.localStorage.getItem(
      ADDITION_BEST_TIME_STORAGE_KEY,
    );

    if (savedValue === null) {
      return null;
    }

    const parsedValue = Number(savedValue);
    return Number.isFinite(parsedValue) && parsedValue >= 0
      ? normalizeSeconds(parsedValue)
      : null;
  } catch {
    return null;
  }
}

export function saveAdditionBestTime(seconds: number) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      ADDITION_BEST_TIME_STORAGE_KEY,
      String(normalizeSeconds(seconds)),
    );
  } catch {
    // The timer still works when browser storage is unavailable.
  }
}

export function resolveAdditionBestTime(
  completedTime: number,
  savedBestTime: number | null,
) {
  const normalizedCompletedTime = normalizeSeconds(completedTime);
  const isNewBestTime =
    savedBestTime === null || normalizedCompletedTime < savedBestTime;

  return {
    bestTime: isNewBestTime ? normalizedCompletedTime : savedBestTime,
    isNewBestTime,
  };
}
