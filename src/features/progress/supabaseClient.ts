import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LearningProgressSnapshot } from "./types";
import {
  mergeLearningProgressSnapshots,
  normalizeLearningProgressSnapshot,
} from "./snapshot";

export const LEARNING_PROGRESS_TABLE = "learning_progress";

type LearningProgressRow = {
  user_id: string;
  snapshot: unknown;
  revision: number;
  updated_at: string;
};

type RemoteLearningProgress = {
  snapshot: LearningProgressSnapshot;
  revision: number;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey,
);

export const learningProgressSupabase: SupabaseClient | null =
  isSupabaseConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

async function loadRemoteLearningProgressRow(
  client: SupabaseClient,
  userId: string,
): Promise<RemoteLearningProgress | null> {
  const { data, error } = await client
    .from(LEARNING_PROGRESS_TABLE)
    .select("snapshot, revision, updated_at")
    .eq("user_id", userId)
    .maybeSingle<
      Pick<LearningProgressRow, "snapshot" | "revision" | "updated_at">
    >();

  if (error) throw error;
  if (!data) return null;
  const snapshot = normalizeLearningProgressSnapshot(data.snapshot);
  if (!snapshot) {
    throw new Error("Cloud progress has an unsupported format.");
  }
  return {
    snapshot,
    revision:
      typeof data.revision === "number" && Number.isFinite(data.revision)
        ? data.revision
        : 0,
  };
}

export async function loadRemoteLearningProgress(
  client: SupabaseClient,
  userId: string,
) {
  return (await loadRemoteLearningProgressRow(client, userId))?.snapshot ?? null;
}

export async function saveRemoteLearningProgress(
  client: SupabaseClient,
  userId: string,
  snapshot: LearningProgressSnapshot,
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const remote = await loadRemoteLearningProgressRow(client, userId);
    const merged = remote
      ? mergeLearningProgressSnapshots(remote.snapshot, snapshot)
      : snapshot;

    if (!remote) {
      const { data, error } = await client
        .from(LEARNING_PROGRESS_TABLE)
        .insert({
          user_id: userId,
          snapshot: merged,
          revision: 0,
          updated_at: merged.updatedAt,
        })
        .select("snapshot, revision, updated_at")
        .maybeSingle();

      if (!error && data) {
        return normalizeLearningProgressSnapshot(data.snapshot) ?? merged;
      }
      if (error?.code === "23505") continue;
      if (error) throw error;
      continue;
    }

    const { data, error } = await client
      .from(LEARNING_PROGRESS_TABLE)
      .update({
        snapshot: merged,
        revision: remote.revision + 1,
        updated_at: merged.updatedAt,
      })
      .eq("user_id", userId)
      .eq("revision", remote.revision)
      .select("snapshot, revision, updated_at")
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return normalizeLearningProgressSnapshot(data.snapshot) ?? merged;
    }
  }

  throw new Error(
    "Progress changed on another device. Please try syncing again.",
  );
}
