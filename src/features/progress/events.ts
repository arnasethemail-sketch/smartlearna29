export const LEGACY_PROGRESS_CHANGED_EVENT =
  "smartlearna29:legacy-progress-changed";

export const LEARNING_PROGRESS_APPLIED_EVENT =
  "smartlearna29:learning-progress-applied";

export function notifyLegacyProgressChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LEGACY_PROGRESS_CHANGED_EVENT));
}
