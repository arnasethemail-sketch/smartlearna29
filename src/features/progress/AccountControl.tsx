import { useState, type FormEvent } from "react";
import { isSupabaseConfigured } from "./supabaseClient";
import { useLearningProgress } from "./LearningProgressProvider";

const syncLabels = {
  idle: "Saved here",
  loading: "Loading…",
  saving: "Saving…",
  synced: "Synced ✓",
  offline: "On this device",
  error: "Saved here",
} as const;

export function AccountControl() {
  const {
    snapshot,
    auth,
    syncStatus,
    syncMessage,
    signIn,
    createAccount,
    signOut,
  } = useLearningProgress();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const runAuthAction = async (action: "sign-in" | "create") => {
    if (!email.trim() || !password) return;
    setIsWorking(true);
    setFeedback(null);
    const result =
      action === "sign-in"
        ? await signIn(email, password)
        : await createAccount(email, password);
    setPassword("");
    setFeedback(result.message);
    setIsWorking(false);
  };

  const submitSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAuthAction("sign-in");
  };

  const handleSignOut = async () => {
    setIsWorking(true);
    const result = await signOut();
    setEmail("");
    setPassword("");
    setFeedback(result.message);
    setIsWorking(false);
  };

  const signedIn = auth.status === "authenticated";
  const completedStoryLessons = Object.values(
    snapshot.storyAdventureState.progressByLesson,
  ).filter((lesson) => lesson.status === "completed").length;

  return (
    <aside className="fixed bottom-4 right-4 z-[80] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2 font-sans">
      {isOpen ? (
        <section
          aria-label="Parent or guardian account"
          className="w-[min(22rem,calc(100vw-2rem))] rounded-3xl border-2 border-[#1b1646] bg-white p-5 text-[#1b1646] shadow-[0_8px_0_#1b1646]"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#526df6]">
                Parent / guardian
              </p>
              <h2 className="mt-1 text-xl font-black">Save learning progress</h2>
            </div>
            <button
              type="button"
              aria-label="Close account panel"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#1b1646] bg-white text-lg font-black"
            >
              ×
            </button>
          </div>

          {signedIn ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#effbd0] p-3">
                <p className="text-sm font-black">Account connected ✓</p>
                <p className="mt-1 break-all text-sm">{auth.email}</p>
                <p className="mt-2 text-xs font-bold text-[#526400]">
                  {snapshot.completedAttempts.length} practice rounds ·{" "}
                  {completedStoryLessons} story lessons saved
                </p>
              </div>
              <p className="text-sm text-[#5f6073]">
                {syncMessage ?? "Progress is ready."}
              </p>
              <button
                type="button"
                disabled={isWorking}
                onClick={() => void handleSignOut()}
                className="w-full rounded-2xl border-2 border-[#1b1646] bg-white px-4 py-3 font-black disabled:opacity-50"
              >
                {isWorking ? "Signing out…" : "Sign out"}
              </button>
            </div>
          ) : isSupabaseConfigured ? (
            <form className="space-y-3" onSubmit={submitSignIn}>
              <p className="text-sm leading-5 text-[#5f6073]">
                Use a parent or guardian email. We do not ask for a child’s
                name or other personal details. Progress already on this device
                is added to the account after sign-in.
              </p>
              <label className="block text-sm font-black">
                Parent or guardian email
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-1 w-full rounded-2xl border-2 border-[#cfd1db] px-3 py-2 font-normal outline-none focus:border-[#526df6]"
                />
              </label>
              <label className="block text-sm font-black">
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  className="mt-1 w-full rounded-2xl border-2 border-[#cfd1db] px-3 py-2 font-normal outline-none focus:border-[#526df6]"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  disabled={isWorking}
                  className="rounded-2xl bg-[#526df6] px-3 py-3 font-black text-white disabled:opacity-50"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  disabled={isWorking || !email.trim() || password.length < 6}
                  onClick={() => void runAuthAction("create")}
                  className="rounded-2xl bg-[#d7ff3f] px-3 py-3 font-black text-[#1b1646] disabled:opacity-50"
                >
                  Create account
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl bg-[#f3f4f8] p-3 text-sm leading-5 text-[#5f6073]">
              Online account sync is not configured yet. Progress still saves
              safely in this browser.
            </div>
          )}

          <p aria-live="polite" className="mt-3 text-sm text-[#5f6073]">
            {feedback}
          </p>
        </section>
      ) : null}

      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full border-2 border-[#1b1646] bg-white px-4 py-2.5 font-black text-[#1b1646] shadow-[0_4px_0_#1b1646]"
      >
        <span aria-hidden="true">☁️</span>
        <span>{signedIn ? "My account" : "Save progress"}</span>
        <span className="rounded-full bg-[#effbd0] px-2 py-1 text-xs">
          {syncLabels[syncStatus]}
        </span>
      </button>
    </aside>
  );
}
