import {
  ADDITION_BEST_TIME_STORAGE_KEY,
} from "../addition/additionTimer";
import { FRACTION_BEST_TIME_STORAGE_KEY } from "../fractions/fractionRecords";
import {
  createInitialStoryState,
  STORY_PROGRESS_STORAGE_KEY,
} from "../story-adventures/progress";
import type {
  LessonProgress,
  StoryAdventureState,
} from "../story-adventures/types";
import {
  SUBTRACTION_BEST_TIME_STORAGE_KEY,
} from "../subtraction/subtractionTimer";
import type {
  LearningProgressSnapshot,
  PracticeAttempt,
  PracticeProgressInput,
  ProgressMetadataValue,
} from "./types";
import { LEARNING_PROGRESS_APPLIED_EVENT } from "./events";

export const LEARNING_PROGRESS_SCHEMA_VERSION = 1 as const;
export const GUEST_PROGRESS_STORAGE_KEY =
  "smartlearna29.learning-progress.guest.v1";
const USER_PROGRESS_STORAGE_PREFIX =
  "smartlearna29.learning-progress.user.v1.";

export function userProgressStorageKey(userId: string) {
  return `${USER_PROGRESS_STORAGE_PREFIX}${userId}`;
}

function nowIso() {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeNonNegativeInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

function normalizeBestTime(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.floor(value);
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isStoryAdventureState(value: unknown): value is StoryAdventureState {
  if (!isRecord(value)) return false;
  return (
    value.schemaVersion === 1 &&
    (value.region === "US" || value.region === "CA") &&
    (value.textScale === "standard" || value.textScale === "large") &&
    isRecord(value.progressByLesson)
  );
}

function normalizeAttempt(value: unknown): PracticeAttempt | null {
  if (!isRecord(value)) return null;
  const attemptId = normalizeText(value.attemptId);
  const subject = normalizeText(value.subject);
  const topic = normalizeText(value.topic);
  const status = value.status;
  const startedAt = normalizeText(value.startedAt);
  const updatedAt = normalizeText(value.updatedAt);

  if (
    !attemptId ||
    !subject ||
    !topic ||
    (status !== "in-progress" && status !== "completed") ||
    !startedAt ||
    !updatedAt
  ) {
    return null;
  }

  const durationSeconds = normalizeBestTime(value.durationSeconds);
  let metadata: Record<string, ProgressMetadataValue> | undefined;
  if (isRecord(value.metadata)) {
    metadata = {};
    for (const [key, item] of Object.entries(value.metadata)) {
      if (
        item === null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
      ) {
        metadata[key] = item;
      }
    }
  }

  return {
    attemptId,
    subject,
    topic,
    answered: normalizeNonNegativeInteger(value.answered),
    total: normalizeNonNegativeInteger(value.total),
    score: normalizeNonNegativeInteger(value.score),
    status,
    ...(durationSeconds === null ? {} : { durationSeconds }),
    ...(metadata ? { metadata } : {}),
    startedAt,
    updatedAt,
    ...(typeof value.completedAt === "string"
      ? { completedAt: value.completedAt }
      : {}),
  };
}

export function createEmptyLearningProgressSnapshot(
  updatedAt = new Date(0).toISOString(),
): LearningProgressSnapshot {
  return {
    schemaVersion: LEARNING_PROGRESS_SCHEMA_VERSION,
    updatedAt,
    storyAdventureState: createInitialStoryState(),
    bestTimesSeconds: {
      addition: null,
      subtraction: null,
      fractions: null,
    },
    activeAttempts: {},
    completedAttempts: [],
  };
}

export function normalizeLearningProgressSnapshot(
  value: unknown,
): LearningProgressSnapshot | null {
  if (!isRecord(value) || value.schemaVersion !== 1) return null;
  if (!isStoryAdventureState(value.storyAdventureState)) return null;

  const bestTimes = isRecord(value.bestTimesSeconds)
    ? value.bestTimesSeconds
    : {};
  const activeAttempts: Record<string, PracticeAttempt> = {};
  if (isRecord(value.activeAttempts)) {
    for (const candidate of Object.values(value.activeAttempts)) {
      const attempt = normalizeAttempt(candidate);
      if (attempt && attempt.status === "in-progress") {
        activeAttempts[attempt.attemptId] = attempt;
      }
    }
  }

  const completedAttempts: PracticeAttempt[] = [];
  if (Array.isArray(value.completedAttempts)) {
    for (const candidate of value.completedAttempts) {
      const attempt = normalizeAttempt(candidate);
      if (attempt?.status === "completed") completedAttempts.push(attempt);
    }
  }

  return {
    schemaVersion: 1,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : nowIso(),
    storyAdventureState: value.storyAdventureState,
    bestTimesSeconds: {
      addition: normalizeBestTime(bestTimes.addition),
      subtraction: normalizeBestTime(bestTimes.subtraction),
      fractions: normalizeBestTime(bestTimes.fractions),
    },
    activeAttempts,
    completedAttempts,
  };
}

export function readCachedLearningProgress(
  storageKey: string,
): LearningProgressSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return normalizeLearningProgressSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeCachedLearningProgress(
  storageKey: string,
  snapshot: LearningProgressSnapshot,
) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

function readLegacyBestTime(storageKey: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) return null;
    return normalizeBestTime(Number(raw));
  } catch {
    return null;
  }
}

export function readLegacyProgressSnapshot(): LearningProgressSnapshot {
  const snapshot = createEmptyLearningProgressSnapshot(nowIso());
  if (typeof window === "undefined") return snapshot;

  try {
    const savedStory = window.localStorage.getItem(
      STORY_PROGRESS_STORAGE_KEY,
    );
    if (savedStory) {
      const parsed: unknown = JSON.parse(savedStory);
      if (isStoryAdventureState(parsed)) {
        snapshot.storyAdventureState = parsed;
      }
    }
  } catch {
    // A malformed legacy value should not block the other progress values.
  }

  snapshot.bestTimesSeconds = {
    addition: readLegacyBestTime(ADDITION_BEST_TIME_STORAGE_KEY),
    subtraction: readLegacyBestTime(SUBTRACTION_BEST_TIME_STORAGE_KEY),
    fractions: readLegacyBestTime(FRACTION_BEST_TIME_STORAGE_KEY),
  };
  return snapshot;
}

function timestamp(value: string | undefined) {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function mergeBestTime(left: number | null, right: number | null) {
  if (left === null) return right;
  if (right === null) return left;
  return Math.min(left, right);
}

function mergeStoryStates(
  leftSnapshot: LearningProgressSnapshot,
  rightSnapshot: LearningProgressSnapshot,
) {
  const left = leftSnapshot.storyAdventureState;
  const right = rightSnapshot.storyAdventureState;
  const rightIsNewer =
    timestamp(rightSnapshot.updatedAt) >= timestamp(leftSnapshot.updatedAt);
  const progressByLesson: Record<string, LessonProgress> = {
    ...left.progressByLesson,
  };

  for (const [lessonId, incoming] of Object.entries(
    right.progressByLesson,
  )) {
    const current = progressByLesson[lessonId];
    if (
      !current ||
      timestamp(incoming.lastUpdatedAt) >= timestamp(current.lastUpdatedAt)
    ) {
      progressByLesson[lessonId] = incoming;
    }
  }

  return {
    schemaVersion: 1 as const,
    region: rightIsNewer ? right.region : left.region,
    textScale: rightIsNewer ? right.textScale : left.textScale,
    progressByLesson,
  };
}

function mergeAttempts(
  left: LearningProgressSnapshot,
  right: LearningProgressSnapshot,
) {
  const attempts = new Map<string, PracticeAttempt>();
  const add = (attempt: PracticeAttempt) => {
    const current = attempts.get(attempt.attemptId);
    if (
      !current ||
      timestamp(attempt.updatedAt) > timestamp(current.updatedAt) ||
      (timestamp(attempt.updatedAt) === timestamp(current.updatedAt) &&
        attempt.status === "completed")
    ) {
      attempts.set(attempt.attemptId, attempt);
    }
  };

  Object.values(left.activeAttempts).forEach(add);
  left.completedAttempts.forEach(add);
  Object.values(right.activeAttempts).forEach(add);
  right.completedAttempts.forEach(add);

  const activeAttempts: Record<string, PracticeAttempt> = {};
  const completedAttempts: PracticeAttempt[] = [];
  for (const attempt of attempts.values()) {
    if (attempt.status === "completed") {
      completedAttempts.push(attempt);
    } else {
      activeAttempts[attempt.attemptId] = attempt;
    }
  }

  completedAttempts.sort(
    (leftAttempt, rightAttempt) =>
      timestamp(rightAttempt.completedAt ?? rightAttempt.updatedAt) -
      timestamp(leftAttempt.completedAt ?? leftAttempt.updatedAt),
  );
  return { activeAttempts, completedAttempts };
}

export function mergeLearningProgressSnapshots(
  left: LearningProgressSnapshot,
  right: LearningProgressSnapshot,
): LearningProgressSnapshot {
  const attempts = mergeAttempts(left, right);
  return {
    schemaVersion: 1,
    updatedAt:
      timestamp(right.updatedAt) >= timestamp(left.updatedAt)
        ? right.updatedAt
        : left.updatedAt,
    storyAdventureState: mergeStoryStates(left, right),
    bestTimesSeconds: {
      addition: mergeBestTime(
        left.bestTimesSeconds.addition,
        right.bestTimesSeconds.addition,
      ),
      subtraction: mergeBestTime(
        left.bestTimesSeconds.subtraction,
        right.bestTimesSeconds.subtraction,
      ),
      fractions: mergeBestTime(
        left.bestTimesSeconds.fractions,
        right.bestTimesSeconds.fractions,
      ),
    },
    ...attempts,
  };
}

function setOrRemoveLegacyBestTime(storageKey: string, value: number | null) {
  if (value === null) {
    window.localStorage.removeItem(storageKey);
  } else {
    window.localStorage.setItem(storageKey, String(value));
  }
}

export function applySnapshotToLegacyStorage(
  snapshot: LearningProgressSnapshot,
) {
  if (typeof window === "undefined") return false;
  let changed = false;

  try {
    const storyValue = JSON.stringify(snapshot.storyAdventureState);
    if (
      window.localStorage.getItem(STORY_PROGRESS_STORAGE_KEY) !== storyValue
    ) {
      window.localStorage.setItem(STORY_PROGRESS_STORAGE_KEY, storyValue);
      changed = true;
    }

    const bestTimes: Array<[string, number | null]> = [
      [ADDITION_BEST_TIME_STORAGE_KEY, snapshot.bestTimesSeconds.addition],
      [
        SUBTRACTION_BEST_TIME_STORAGE_KEY,
        snapshot.bestTimesSeconds.subtraction,
      ],
      [FRACTION_BEST_TIME_STORAGE_KEY, snapshot.bestTimesSeconds.fractions],
    ];
    for (const [storageKey, value] of bestTimes) {
      const nextValue = value === null ? null : String(value);
      if (window.localStorage.getItem(storageKey) !== nextValue) {
        setOrRemoveLegacyBestTime(storageKey, value);
        changed = true;
      }
    }
  } catch {
    return false;
  }

  if (changed) {
    window.dispatchEvent(
      new CustomEvent(LEARNING_PROGRESS_APPLIED_EVENT, {
        detail: snapshot,
      }),
    );
  }
  return changed;
}

export function learningProgressSnapshotsEqual(
  left: LearningProgressSnapshot,
  right: LearningProgressSnapshot,
) {
  return JSON.stringify({ ...left, updatedAt: "" }) ===
    JSON.stringify({ ...right, updatedAt: "" });
}

export function buildPracticeAttempt(
  input: PracticeProgressInput,
  existing?: PracticeAttempt,
  currentTime = nowIso(),
): PracticeAttempt {
  const total = normalizeNonNegativeInteger(input.total);
  const answered = Math.min(
    normalizeNonNegativeInteger(input.answered),
    total,
  );
  const score = Math.min(normalizeNonNegativeInteger(input.score), answered);
  const durationSeconds = normalizeBestTime(input.durationSeconds);

  return {
    attemptId: input.attemptId.trim(),
    subject: input.subject.trim(),
    topic: input.topic.trim(),
    answered,
    total,
    score,
    status: input.status,
    ...(durationSeconds === null ? {} : { durationSeconds }),
    ...(input.metadata ? { metadata: { ...input.metadata } } : {}),
    startedAt: existing?.startedAt ?? currentTime,
    updatedAt: currentTime,
    ...(input.status === "completed"
      ? { completedAt: existing?.completedAt ?? currentTime }
      : {}),
  };
}
