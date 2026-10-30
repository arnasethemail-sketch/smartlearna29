export { AccountControl } from "./AccountControl";
export {
  LearningProgressProvider,
  useLearningProgress,
} from "./LearningProgressProvider";
export {
  LEARNING_PROGRESS_APPLIED_EVENT,
  LEGACY_PROGRESS_CHANGED_EVENT,
  notifyLegacyProgressChanged,
} from "./events";
export {
  applySnapshotToLegacyStorage,
  buildPracticeAttempt,
  createEmptyLearningProgressSnapshot,
  GUEST_PROGRESS_STORAGE_KEY,
  learningProgressSnapshotsEqual,
  mergeLearningProgressSnapshots,
  normalizeLearningProgressSnapshot,
  readCachedLearningProgress,
  readLegacyProgressSnapshot,
  userProgressStorageKey,
  writeCachedLearningProgress,
} from "./snapshot";
export {
  isSupabaseConfigured,
  LEARNING_PROGRESS_TABLE,
} from "./supabaseClient";
export type {
  AuthActionResult,
  LearningProgressAuthState,
  LearningProgressContextValue,
  LearningProgressSnapshot,
  LearningProgressSyncStatus,
  PracticeAttempt,
  PracticeAttemptStatus,
  PracticeProgressInput,
  ProgressMetadataValue,
} from "./types";
