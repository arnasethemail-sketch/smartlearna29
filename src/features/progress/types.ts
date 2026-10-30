import type { StoryAdventureState } from "../story-adventures/types";

export type PracticeAttemptStatus = "in-progress" | "completed";

export type ProgressMetadataValue = string | number | boolean | null;

export type PracticeProgressInput = {
  attemptId: string;
  subject: string;
  topic: string;
  answered: number;
  total: number;
  score: number;
  status: PracticeAttemptStatus;
  durationSeconds?: number;
  metadata?: Record<string, ProgressMetadataValue>;
};

export type PracticeAttempt = PracticeProgressInput & {
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type LearningProgressSnapshot = {
  schemaVersion: 1;
  updatedAt: string;
  storyAdventureState: StoryAdventureState;
  bestTimesSeconds: {
    addition: number | null;
    subtraction: number | null;
    fractions: number | null;
  };
  activeAttempts: Record<string, PracticeAttempt>;
  completedAttempts: PracticeAttempt[];
};

export type LearningProgressAuthState = {
  status: "loading" | "guest" | "authenticated" | "error";
  userId: string | null;
  email: string | null;
};

export type LearningProgressSyncStatus =
  | "idle"
  | "loading"
  | "saving"
  | "synced"
  | "offline"
  | "error";

export type AuthActionResult = {
  ok: boolean;
  message: string;
};

export type LearningProgressContextValue = {
  snapshot: LearningProgressSnapshot;
  auth: LearningProgressAuthState;
  syncStatus: LearningProgressSyncStatus;
  syncMessage: string | null;
  updatePracticeProgress: (input: PracticeProgressInput) => void;
  resetPracticeAttempt: (attemptId: string) => void;
  replacePracticeAttempt: (attempt: PracticeAttempt) => void;
  replaceSnapshot: (snapshot: LearningProgressSnapshot) => void;
  refreshLegacyProgress: () => void;
  syncNow: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  createAccount: (
    email: string,
    password: string,
  ) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
};
