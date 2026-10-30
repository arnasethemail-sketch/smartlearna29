import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
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
import { LEGACY_PROGRESS_CHANGED_EVENT } from "./events";
import {
  isSupabaseConfigured,
  learningProgressSupabase,
  loadRemoteLearningProgress,
  saveRemoteLearningProgress,
} from "./supabaseClient";
import type {
  AuthActionResult,
  LearningProgressAuthState,
  LearningProgressContextValue,
  LearningProgressSnapshot,
  LearningProgressSyncStatus,
  PracticeAttempt,
  PracticeProgressInput,
} from "./types";

function currentTime() {
  return new Date().toISOString();
}

const LEGACY_PROGRESS_OWNER_STORAGE_KEY =
  "smartlearna29.learning-progress.legacy-owner.v1";
const GUEST_LEGACY_OWNER = "guest";

function readLegacyProgressOwner() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LEGACY_PROGRESS_OWNER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function markLegacyProgressOwner(owner: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEGACY_PROGRESS_OWNER_STORAGE_KEY, owner);
  } catch {
    // Progress remains usable in memory when browser storage is unavailable.
  }
}

function withUpdatedTime(snapshot: LearningProgressSnapshot) {
  return { ...snapshot, updatedAt: currentTime() };
}

function initialGuestSnapshot() {
  return (
    readCachedLearningProgress(GUEST_PROGRESS_STORAGE_KEY) ??
    createEmptyLearningProgressSnapshot()
  );
}

const initialSnapshot = createEmptyLearningProgressSnapshot();

const unavailableResult = (): Promise<AuthActionResult> =>
  Promise.resolve({
    ok: false,
    message:
      "Online accounts are not configured yet. Progress is still saved on this device.",
  });

const noOp = () => undefined;

const defaultContext: LearningProgressContextValue = {
  snapshot: initialSnapshot,
  auth: { status: "guest", userId: null, email: null },
  syncStatus: "idle",
  syncMessage: null,
  updatePracticeProgress: noOp,
  resetPracticeAttempt: noOp,
  replacePracticeAttempt: noOp,
  replaceSnapshot: noOp,
  refreshLegacyProgress: noOp,
  syncNow: async () => undefined,
  signIn: unavailableResult,
  createAccount: unavailableResult,
  signOut: unavailableResult,
};

const LearningProgressContext =
  createContext<LearningProgressContextValue>(defaultContext);

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

function isUsableAttempt(attempt: PracticeAttempt) {
  return Boolean(
    attempt.attemptId.trim() &&
      attempt.subject.trim() &&
      attempt.topic.trim() &&
      attempt.startedAt &&
      attempt.updatedAt,
  );
}

function placeAttempt(
  snapshot: LearningProgressSnapshot,
  attempt: PracticeAttempt,
) {
  const activeAttempts = { ...snapshot.activeAttempts };
  delete activeAttempts[attempt.attemptId];
  const completedAttempts = snapshot.completedAttempts.filter(
    (item) => item.attemptId !== attempt.attemptId,
  );

  if (attempt.status === "completed") {
    completedAttempts.unshift(attempt);
  } else {
    activeAttempts[attempt.attemptId] = attempt;
  }

  return {
    ...snapshot,
    updatedAt: currentTime(),
    activeAttempts,
    completedAttempts,
  };
}

export function LearningProgressProvider({
  children,
}: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<LearningProgressSnapshot>(
    initialGuestSnapshot,
  );
  const [auth, setAuth] = useState<LearningProgressAuthState>(() => ({
    status: isSupabaseConfigured ? "loading" : "guest",
    userId: null,
    email: null,
  }));
  const [syncStatus, setSyncStatus] =
    useState<LearningProgressSyncStatus>(() =>
      isSupabaseConfigured ? "loading" : "offline",
    );
  const [syncMessage, setSyncMessage] = useState<string | null>(() =>
    isSupabaseConfigured
      ? "Checking for saved progress…"
      : "Guest progress is saved on this device.",
  );
  const snapshotRef = useRef(snapshot);
  const authRef = useRef(auth);
  const hydrationSequence = useRef(0);
  const lastRemoteSnapshot = useRef<string | null>(null);
  const remoteWritesBlockedForUser = useRef<string | null>(null);

  snapshotRef.current = snapshot;
  authRef.current = auth;

  const activateGuest = useCallback((captureLegacy: boolean) => {
    hydrationSequence.current += 1;
    const cached =
      readCachedLearningProgress(GUEST_PROGRESS_STORAGE_KEY) ??
      createEmptyLearningProgressSnapshot();
    const legacyOwner = readLegacyProgressOwner();
    const mayCaptureLegacy =
      captureLegacy &&
      (legacyOwner === null || legacyOwner === GUEST_LEGACY_OWNER);
    const next = mayCaptureLegacy
      ? mergeLearningProgressSnapshots(cached, readLegacyProgressSnapshot())
      : cached;
    writeCachedLearningProgress(GUEST_PROGRESS_STORAGE_KEY, next);
    applySnapshotToLegacyStorage(next);
    markLegacyProgressOwner(GUEST_LEGACY_OWNER);
    setSnapshot(next);
    setAuth({ status: "guest", userId: null, email: null });
    setSyncStatus(isSupabaseConfigured ? "idle" : "offline");
    setSyncMessage("Guest progress is saved on this device.");
    lastRemoteSnapshot.current = null;
    remoteWritesBlockedForUser.current = null;
  }, []);

  const hydrateForUser = useCallback(async (user: User) => {
    const client = learningProgressSupabase;
    if (!client) return;
    const sequence = hydrationSequence.current + 1;
    hydrationSequence.current = sequence;
    setAuth({ status: "loading", userId: user.id, email: user.email ?? null });
    setSyncStatus("loading");
    setSyncMessage("Combining this device with your account…");
    remoteWritesBlockedForUser.current = user.id;

    const guest =
      readCachedLearningProgress(GUEST_PROGRESS_STORAGE_KEY) ??
      createEmptyLearningProgressSnapshot();
    const cached =
      readCachedLearningProgress(userProgressStorageKey(user.id)) ??
      createEmptyLearningProgressSnapshot();
    const legacyOwner = readLegacyProgressOwner();
    const legacy =
      legacyOwner === null || legacyOwner === user.id
        ? readLegacyProgressSnapshot()
        : createEmptyLearningProgressSnapshot();
    let merged = mergeLearningProgressSnapshots(
      mergeLearningProgressSnapshots(guest, cached),
      legacy,
    );
    let remote: LearningProgressSnapshot | null = null;
    try {
      remote = await loadRemoteLearningProgress(client, user.id);
      if (remote) merged = mergeLearningProgressSnapshots(merged, remote);
    } catch (error) {
      if (hydrationSequence.current !== sequence) return;
      merged = withUpdatedTime(merged);
      writeCachedLearningProgress(userProgressStorageKey(user.id), merged);
      applySnapshotToLegacyStorage(merged);
      markLegacyProgressOwner(user.id);
      setSnapshot(merged);
      setAuth({
        status: "authenticated",
        userId: user.id,
        email: user.email ?? null,
      });
      setSyncStatus("error");
      setSyncMessage(
        `${errorMessage(error)} Cloud progress was not changed; progress remains saved on this device.`,
      );
      return;
    }

    if (hydrationSequence.current !== sequence) return;
    merged = withUpdatedTime(merged);
    writeCachedLearningProgress(userProgressStorageKey(user.id), merged);
    applySnapshotToLegacyStorage(merged);
    markLegacyProgressOwner(user.id);
    setSnapshot(merged);
    setAuth({
      status: "authenticated",
      userId: user.id,
      email: user.email ?? null,
    });

    try {
      const saved = await saveRemoteLearningProgress(client, user.id, merged);
      if (hydrationSequence.current !== sequence) return;
      remoteWritesBlockedForUser.current = null;
      lastRemoteSnapshot.current = JSON.stringify(saved);
      writeCachedLearningProgress(userProgressStorageKey(user.id), saved);
      applySnapshotToLegacyStorage(saved);
      markLegacyProgressOwner(user.id);
      setSnapshot(saved);
      writeCachedLearningProgress(
        GUEST_PROGRESS_STORAGE_KEY,
        createEmptyLearningProgressSnapshot(),
      );
      setSyncStatus("synced");
      setSyncMessage("Progress is synced to your account.");
    } catch (error) {
      if (hydrationSequence.current !== sequence) return;
      setSyncStatus("error");
      setSyncMessage(
        `${errorMessage(error)} Progress remains saved on this device.`,
      );
    }
  }, []);

  useEffect(() => {
    const client = learningProgressSupabase;
    if (!client) {
      activateGuest(true);
      return;
    }
    let active = true;

    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setAuth({ status: "error", userId: null, email: null });
        setSyncStatus("error");
        setSyncMessage(error.message);
      } else if (data.session?.user) {
        void hydrateForUser(data.session.user);
      } else {
        activateGuest(true);
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT" || !session?.user) {
        if (event === "SIGNED_OUT") activateGuest(false);
        return;
      }
      if (
        session.user.id !== authRef.current.userId ||
        authRef.current.status !== "authenticated"
      ) {
        void hydrateForUser(session.user);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [activateGuest, hydrateForUser]);

  useEffect(() => {
    const storageKey =
      auth.status === "authenticated" && auth.userId
        ? userProgressStorageKey(auth.userId)
        : GUEST_PROGRESS_STORAGE_KEY;
    writeCachedLearningProgress(storageKey, snapshot);

    const client = learningProgressSupabase;
    if (
      auth.status !== "authenticated" ||
      !auth.userId ||
      !client ||
      remoteWritesBlockedForUser.current === auth.userId
    ) {
      return;
    }

    const serialized = JSON.stringify(snapshot);
    if (serialized === lastRemoteSnapshot.current) return;
    setSyncStatus("saving");
    setSyncMessage("Saving progress…");
    const userId = auth.userId;
    const timeoutId = window.setTimeout(() => {
      void saveRemoteLearningProgress(
        client,
        userId,
        snapshot,
      )
        .then((saved) => {
          if (authRef.current.userId !== userId) return;
          const reconciled = mergeLearningProgressSnapshots(
            saved,
            snapshotRef.current,
          );
          lastRemoteSnapshot.current = JSON.stringify(saved);
          writeCachedLearningProgress(
            userProgressStorageKey(userId),
            reconciled,
          );
          applySnapshotToLegacyStorage(reconciled);
          markLegacyProgressOwner(userId);
          setSnapshot(reconciled);
          setSyncStatus("synced");
          setSyncMessage("Progress is synced to your account.");
        })
        .catch((error: unknown) => {
          if (authRef.current.userId !== userId) return;
          setSyncStatus("error");
          setSyncMessage(
            `${errorMessage(error)} Progress remains saved on this device.`,
          );
        });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [auth.status, auth.userId, snapshot]);

  const refreshLegacyProgress = useCallback(() => {
    const legacy = readLegacyProgressSnapshot();
    setSnapshot((current) => {
      const merged = mergeLearningProgressSnapshots(current, legacy);
      if (learningProgressSnapshotsEqual(current, merged)) return current;
      return withUpdatedTime(merged);
    });
  }, []);

  useEffect(() => {
    const handleLegacyChange = () => refreshLegacyProgress();
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key.includes("best-time-seconds") ||
        event.key === "smartlearna29.story-adventures.progress.v1"
      ) {
        refreshLegacyProgress();
      }
    };
    window.addEventListener(
      LEGACY_PROGRESS_CHANGED_EVENT,
      handleLegacyChange,
    );
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(
        LEGACY_PROGRESS_CHANGED_EVENT,
        handleLegacyChange,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshLegacyProgress]);

  const updatePracticeProgress = useCallback(
    (input: PracticeProgressInput) => {
      if (!input.attemptId.trim() || !input.subject.trim() || !input.topic.trim()) {
        return;
      }
      setSnapshot((current) => {
        const existing =
          current.activeAttempts[input.attemptId] ??
          current.completedAttempts.find(
            (attempt) => attempt.attemptId === input.attemptId,
          );
        return placeAttempt(current, buildPracticeAttempt(input, existing));
      });
    },
    [],
  );

  const resetPracticeAttempt = useCallback((attemptId: string) => {
    setSnapshot((current) => {
      if (
        !current.activeAttempts[attemptId] &&
        !current.completedAttempts.some(
          (attempt) => attempt.attemptId === attemptId,
        )
      ) {
        return current;
      }
      const activeAttempts = { ...current.activeAttempts };
      delete activeAttempts[attemptId];
      return {
        ...current,
        updatedAt: currentTime(),
        activeAttempts,
        completedAttempts: current.completedAttempts.filter(
          (attempt) => attempt.attemptId !== attemptId,
        ),
      };
    });
  }, []);

  const replacePracticeAttempt = useCallback((attempt: PracticeAttempt) => {
    if (!isUsableAttempt(attempt)) return;
    setSnapshot((current) => placeAttempt(current, { ...attempt }));
  }, []);

  const replaceSnapshot = useCallback(
    (replacement: LearningProgressSnapshot) => {
      const normalized = normalizeLearningProgressSnapshot(replacement);
      if (!normalized) return;
      const next = withUpdatedTime(normalized);
      applySnapshotToLegacyStorage(next);
      markLegacyProgressOwner(
        authRef.current.status === "authenticated" && authRef.current.userId
          ? authRef.current.userId
          : GUEST_LEGACY_OWNER,
      );
      setSnapshot(next);
    },
    [],
  );

  const syncNow = useCallback(async () => {
    const client = learningProgressSupabase;
    const currentAuth = authRef.current;
    if (
      !client ||
      currentAuth.status !== "authenticated" ||
      !currentAuth.userId ||
      remoteWritesBlockedForUser.current === currentAuth.userId
    ) {
      return;
    }
    setSyncStatus("saving");
    setSyncMessage("Saving progress…");
    try {
      const saved = await saveRemoteLearningProgress(
        client,
        currentAuth.userId,
        snapshotRef.current,
      );
      const reconciled = mergeLearningProgressSnapshots(
        saved,
        snapshotRef.current,
      );
      lastRemoteSnapshot.current = JSON.stringify(saved);
      writeCachedLearningProgress(
        userProgressStorageKey(currentAuth.userId),
        reconciled,
      );
      applySnapshotToLegacyStorage(reconciled);
      markLegacyProgressOwner(currentAuth.userId);
      setSnapshot(reconciled);
      setSyncStatus("synced");
      setSyncMessage("Progress is synced to your account.");
    } catch (error) {
      setSyncStatus("error");
      setSyncMessage(
        `${errorMessage(error)} Progress remains saved on this device.`,
      );
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const client = learningProgressSupabase;
      if (!client) return unavailableResult();
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { ok: false, message: error.message };
      if (data.user) await hydrateForUser(data.user);
      return { ok: true, message: "Signed in. Your progress is ready." };
    },
    [hydrateForUser],
  );

  const createAccount = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const client = learningProgressSupabase;
      if (!client) return unavailableResult();
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: new URL(
            import.meta.env.BASE_URL,
            window.location.origin,
          ).toString(),
        },
      });
      if (error) return { ok: false, message: error.message };
      if (data.session?.user) {
        await hydrateForUser(data.session.user);
        return {
          ok: true,
          message: "Account created. Your progress is now synced.",
        };
      }
      return {
        ok: true,
        message: "Account created. Check the parent or guardian email to confirm it.",
      };
    },
    [hydrateForUser],
  );

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    const client = learningProgressSupabase;
    if (!client) return unavailableResult();
    await syncNow();
    const { error } = await client.auth.signOut();
    if (error) return { ok: false, message: error.message };
    activateGuest(false);
    return {
      ok: true,
      message: "Signed out. Guest progress stays on this device.",
    };
  }, [activateGuest, syncNow]);

  const value = useMemo<LearningProgressContextValue>(
    () => ({
      snapshot,
      auth,
      syncStatus,
      syncMessage,
      updatePracticeProgress,
      resetPracticeAttempt,
      replacePracticeAttempt,
      replaceSnapshot,
      refreshLegacyProgress,
      syncNow,
      signIn,
      createAccount,
      signOut,
    }),
    [
      snapshot,
      auth,
      syncStatus,
      syncMessage,
      updatePracticeProgress,
      resetPracticeAttempt,
      replacePracticeAttempt,
      replaceSnapshot,
      refreshLegacyProgress,
      syncNow,
      signIn,
      createAccount,
      signOut,
    ],
  );

  return (
    <LearningProgressContext.Provider value={value}>
      {children}
    </LearningProgressContext.Provider>
  );
}

export function useLearningProgress() {
  return useContext(LearningProgressContext);
}
