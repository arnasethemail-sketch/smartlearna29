import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { GraphicChapter } from "./data";
import type { ChapterWork } from "./types";
import type { AutomaticCheck, CheckRating, CheckTarget } from "./checking-types";
import { checkTargetKey } from "./checking-types";
import { checkTargetIsFilled, checkWrittenResponse, currentCheckFingerprint } from "./checking";
import "./automaticFeedback.css";

const ratingLabels: Record<CheckRating, string> = {
  ready: "Looks good",
  developing: "Almost there",
  revise: "Try a revision",
  uncertain: "Let’s look more closely",
};

const dimensions = [
  ["meaning", "Meaning"],
  ["support", "Support / reasoning"],
  ["clarity", "Clarity"],
  ["conventions", "Conventions"],
] as const;

function feedbackLabel(chapter: GraphicChapter, target: CheckTarget) {
  if (target.kind === "comprehension") return `App feedback for question ${chapter.comprehension.find((item) => item.id === target.id)?.number ?? "answer"}`;
  if (target.kind === "vocabulary") return `App feedback for the word ${chapter.vocabularyPractice.find((item) => item.wordId === target.id)?.word ?? "card"}`;
  if (target.kind === "feature") return `App feedback for discovery ${chapter.textFeaturesHunt.boxes.find((item) => item.id === target.id)?.number ?? "answer"}`;
  return target.kind === "paragraph" ? "App feedback for your paragraph" : "App feedback for your vocabulary explanation";
}

function FeedbackReport({ chapter, check, stale, label }: { chapter: GraphicChapter; check: AutomaticCheck; stale: boolean; label: string }) {
  const evidence = chapter.panels.filter((panel) => check.evidencePanelIds.includes(panel.id));
  return <section className={`gnx-automatic-result gnx-rating-${check.overall} ${stale ? "gnx-feedback-stale" : ""}`} aria-label={label}>
    {stale && <p className="gnx-stale-notice" role="status">You changed this answer. Check it again. The feedback below is for an earlier draft.</p>}
    <header><span className="gnx-eyebrow">{stale ? "EARLIER APP FEEDBACK" : "APP FEEDBACK"}</span><h4>{ratingLabels[check.overall]}</h4><p>{check.summary}</p></header>
    <dl className="gnx-feedback-dimensions">{dimensions.map(([id, label]) => <div key={id}><dt>{label}<span className={`gnx-dimension-rating gnx-rating-${check.dimensions[id].rating}`}>{ratingLabels[check.dimensions[id].rating]}</span></dt><dd>{check.dimensions[id].feedback}</dd></div>)}</dl>
    {check.strengths.length > 0 && <div className="gnx-feedback-list"><strong>What works</strong><ul>{check.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
    {check.nextSteps.length > 0 && <div className="gnx-feedback-list"><strong>Your next step</strong><ul>{check.nextSteps.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
    {evidence.length > 0 && <details className="gnx-story-reference"><summary>Reread the supporting panels ({evidence.map((panel) => panel.number).join(", ")})</summary>{evidence.map((panel) => <article key={panel.id}><strong>Panel {panel.number}</strong><p>{panel.narration}</p>{panel.dialogue.map((line, index) => <p key={index}><b>{line.speaker}:</b> {line.text}</p>)}</article>)}</details>}
    <p className="gnx-note gnx-check-method">{check.method === "local-semantic-v1" ? "Checked on this device with a free language model and lesson checks." : "Checked on this device with lesson and writing rules. Meaning checks that could not run are marked uncertain."} The app can miss things; an uncertain result does not mean your idea is wrong.</p>
  </section>;
}

export function SavedAutomaticFeedback({ chapter, work, target, showEmpty = false }: { chapter: GraphicChapter; work: ChapterWork; target: CheckTarget; showEmpty?: boolean }) {
  const check = work.automaticChecks?.[checkTargetKey(target)];
  if (!check) return showEmpty ? <p className="gnx-note gnx-unchecked">Not checked yet. Use the check button beside your answer, or check the chapter above.</p> : null;
  return <FeedbackReport chapter={chapter} check={check} stale={check.inputFingerprint !== currentCheckFingerprint(chapter, work, target)} label={feedbackLabel(chapter, target)} />;
}

export type AutomaticFeedbackProps = {
  chapter: GraphicChapter;
  work: ChapterWork;
  target: CheckTarget;
  update: (change: (old: ChapterWork) => ChapterWork) => void;
  label: string;
  ariaLabel?: string;
  beforeCheck?: () => void;
  children?: ReactNode;
};

/** Pending work stays local to this mounted response; only current results are saved. */
export function AutomaticFeedback({ chapter, work, target, update, label, ariaLabel, beforeCheck, children }: AutomaticFeedbackProps) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const active = useRef(true);
  const generation = useRef(0);
  const key = checkTargetKey(target);
  const live = useRef({ chapter, work, target, update, key });
  live.current = { chapter, work, target, update, key };

  useEffect(() => {
    active.current = true;
    setBusy(false); setProgress(""); setError("");
    return () => { active.current = false; generation.current += 1; };
  }, [chapter.id, key]);

  async function checkAnswer() {
    const original = live.current;
    if (!checkTargetIsFilled(original.chapter, original.work, original.target)) return;
    const currentGeneration = ++generation.current;
    const fingerprint = currentCheckFingerprint(original.chapter, original.work, original.target);
    beforeCheck?.();
    setBusy(true); setProgress("Checking your writing…"); setError("");
    try {
      const result = await checkWrittenResponse(original.chapter, JSON.parse(JSON.stringify(original.work)) as ChapterWork, original.target, (message: string) => {
        if (active.current && generation.current === currentGeneration) setProgress(message);
      });
      if (!active.current || generation.current !== currentGeneration) return;
      if (live.current.key !== original.key || live.current.chapter.id !== original.chapter.id || currentCheckFingerprint(live.current.chapter, live.current.work, live.current.target) !== fingerprint) {
        setError("You changed this answer while it was being checked. Check your latest draft again.");
        return;
      }
      if (result.targetKey !== original.key || result.inputFingerprint !== fingerprint) throw new Error("The check did not match this draft.");
      original.update((old) => currentCheckFingerprint(original.chapter, old, original.target) !== fingerprint ? old : ({ ...old, automaticChecks: { ...old.automaticChecks, [original.key]: result } }));
    } catch {
      if (active.current && generation.current === currentGeneration) setError("The check could not finish. Your writing is still saved. Try checking again.");
    } finally {
      if (active.current && generation.current === currentGeneration) { setBusy(false); setProgress(""); }
    }
  }

  return <div className="gnx-automatic-feedback" aria-busy={busy}><div className="gnx-action-row">{children}<button className="gnx-button" aria-label={ariaLabel ?? label} disabled={busy || !checkTargetIsFilled(chapter, work, target)} onClick={checkAnswer}>{busy ? "Checking…" : label}</button>{busy && <p className="gnx-note" role="status">{progress}</p>}</div>{error && <p className="gnx-check-error" role="alert">{error}</p>}<SavedAutomaticFeedback chapter={chapter} work={work} target={target} /></div>;
}
