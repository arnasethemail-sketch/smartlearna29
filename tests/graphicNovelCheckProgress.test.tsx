// @vitest-environment jsdom

import { createElement, type PropsWithChildren } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  GUEST_PROGRESS_STORAGE_KEY, LearningProgressProvider, createEmptyLearningProgressSnapshot,
} from "../src/features/progress";
import { chapters } from "../src/features/graphic-novel/data";
import {
  GRAPHIC_PROGRESS_FORMAT, createChapterWork, graphicAttemptId, hasChapterSubmission,
  isChapterUnlocked, normalizeChapterWork, readGraphicWorks, useGraphicProgress,
} from "../src/features/graphic-novel/progress";
import { allCheckTargets, currentCheckFingerprint } from "../src/features/graphic-novel/checking-input";
import { checkTargetKey, type AutomaticCheck, type CheckTarget } from "../src/features/graphic-novel/checking-types";
import type { ChapterWork } from "../src/features/graphic-novel/types";

const chapter = chapters[0];
const questionTarget: CheckTarget = { kind: "comprehension", id: chapter.comprehension[0].id };
const questionKey = checkTargetKey(questionTarget);
const wordTarget: CheckTarget = { kind: "vocabulary", id: chapter.vocabularyPractice[0].wordId };
const wordKey = checkTargetKey(wordTarget);
const wrapper = ({ children }: PropsWithChildren) => createElement(LearningProgressProvider, null, children);

function feedback(work: ChapterWork, target: CheckTarget, method: AutomaticCheck["method"] = "local-semantic-v1", source = chapter): AutomaticCheck {
  return {
    schemaVersion: 1, targetKey: checkTargetKey(target), inputFingerprint: currentCheckFingerprint(source, work, target),
    checkedAt: "2026-10-30T12:30:00.000Z", method, overall: "developing",
    summary: "Fixture feedback: an additional relevant detail would help.",
    dimensions: {
      meaning: { rating: "developing", feedback: "Fixture feedback: explain the main idea more directly." },
      support: { rating: "revise", feedback: "Fixture feedback: add a detail from the chapter." },
      clarity: { rating: "ready", feedback: "Fixture feedback: your sentence can be followed." },
      conventions: { rating: "uncertain", feedback: "Fixture feedback: some conventions need another look." },
    },
    strengths: ["Fixture feedback: the response attempts the question."],
    nextSteps: ["Fixture feedback: add one relevant explanation."], evidencePanelIds: [source.panels[0].id],
  };
}

function fixture() {
  const work = createChapterWork(chapter);
  work.comprehension[questionTarget.id].answer = "A complete original test answer with a relevant reason.";
  work.comprehension[questionTarget.id].type = "Right There";
  work.comprehension[questionTarget.id].history = ["An earlier original draft."];
  work.vocabulary[wordTarget.id].definition = "An original test meaning.";
  work.vocabulary[wordTarget.id].synonyms = "A related test phrase.";
  work.vocabulary[wordTarget.id].sentence = "A test sentence offers the intended meaning.";
  for (const target of allCheckTargets(chapter)) work.automaticChecks[checkTargetKey(target)] = feedback(work, target);
  return work;
}

function cacheReviewedWork(work: ChapterWork) {
  const snapshot = createEmptyLearningProgressSnapshot();
  snapshot.completedAttempts.push({
    attemptId: graphicAttemptId(chapter.id), subject: "English", topic: chapter.title, answered: 6, total: 6, score: 0,
    status: "completed", startedAt: "2026-10-30T12:30:00.000Z", updatedAt: "2026-10-30T12:35:00.000Z",
    metadata: { format: GRAPHIC_PROGRESS_FORMAT, work: JSON.stringify(work) },
  });
  localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(snapshot));
}

describe("Saved automatic graphic-novel checking", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("adds a blank result map to older records without replacing their answers, drafts or manual notes", () => {
    const old = fixture();
    delete (old as Partial<ChapterWork>).automaticChecks;
    old.comprehension[questionTarget.id].review.notes = "Earlier personal review notes.";
    old.review.notes = "Earlier overall review notes.";
    const restored = normalizeChapterWork(chapter, old)!;
    expect(restored.automaticChecks).toEqual({});
    expect(restored.comprehension[questionTarget.id]).toMatchObject({
      answer: old.comprehension[questionTarget.id].answer,
      history: ["An earlier original draft."], review: { notes: "Earlier personal review notes." },
    });
    expect(restored.review.notes).toBe("Earlier overall review notes.");
  });

  it("keeps all 14 result types and both free checking methods across JSON normalization and submitted versions", () => {
    const work = fixture();
    work.automaticChecks[wordKey].method = "local-rules-v1";
    work.automaticChecks[wordKey].strengths = [];
    work.submittedSnapshots = [JSON.stringify({ ...work, automaticChecks: { [questionKey]: work.automaticChecks[questionKey] }, submittedSnapshots: [] })];
    const restored = normalizeChapterWork(chapter, JSON.parse(JSON.stringify(work)))!;
    expect(Object.keys(restored.automaticChecks)).toHaveLength(14);
    expect(restored.automaticChecks).toEqual(work.automaticChecks);
    expect(JSON.parse(restored.submittedSnapshots[0]).automaticChecks[questionKey]).toEqual(work.automaticChecks[questionKey]);
    expect(normalizeChapterWork(chapter, restored)).toEqual(restored);
    restored.automaticChecks[questionKey].dimensions.meaning.feedback = "A later mutable test value.";
    expect(work.automaticChecks[questionKey].dimensions.meaning.feedback).not.toBe("A later mutable test value.");
  });

  it("accepts every chapter's canonical targets, including earlier word IDs reused by unit reviews", () => {
    for (const source of chapters) {
      const work = createChapterWork(source);
      const targets = allCheckTargets(source);
      expect(targets, source.id).toHaveLength(14);
      for (const target of targets) work.automaticChecks[checkTargetKey(target)] = feedback(work, target, "local-rules-v1", source);
      const restored = normalizeChapterWork(source, work)!;
      expect(restored.automaticChecks, source.id).toEqual(work.automaticChecks);
      expect(Object.keys(restored.automaticChecks), source.id).toHaveLength(14);
    }
    expect(chapters.filter((item) => item.lessonType === "review").some((item) => item.vocabularyPractice.some((word) => !word.wordId.startsWith(item.id)))).toBe(true);
  });

  it.each([
    ["unknown schema", { schemaVersion: 2 }],
    ["paid or unknown method", { method: "remote-ai-v1" }],
    ["different response target", { targetKey: wordKey }],
    ["missing fingerprint", { inputFingerprint: "" }],
    ["damaged fingerprint", { inputFingerprint: "free-check-v1:not-a-hash" }],
    ["invalid time", { checkedAt: "not a date" }],
    ["impossible day", { checkedAt: "2026-02-31T12:30:00.000Z" }],
    ["impossible hour", { checkedAt: "2026-10-30T24:00:00.000Z" }],
    ["unknown overall rating", { overall: "perfect" }],
    ["missing summary", { summary: " " }],
    ["missing dimensions", { dimensions: null }],
    ["partial dimensions", { dimensions: { meaning: { rating: "ready", feedback: "One criterion only." } } }],
    ["malformed strengths", { strengths: [{ text: "Wrong shape" }] }],
    ["malformed next steps", { nextSteps: null }],
    ["wrong chapter evidence", { evidencePanelIds: ["ch24-p01"] }],
  ])("ignores %s feedback while retaining the answer and a different valid check", (_name, damage) => {
    const work = fixture();
    work.automaticChecks = { [questionKey]: { ...work.automaticChecks[questionKey], ...damage } as AutomaticCheck, [wordKey]: work.automaticChecks[wordKey] };
    const restored = normalizeChapterWork(chapter, work)!;
    expect(restored.automaticChecks[questionKey]).toBeUndefined();
    expect(restored.automaticChecks[wordKey]).toEqual(work.automaticChecks[wordKey]);
    expect(restored.comprehension[questionTarget.id].answer).toBe(work.comprehension[questionTarget.id].answer);
    expect(restored.comprehension[questionTarget.id].history).toEqual(["An earlier original draft."]);
  });

  it("drops unknown targets, malformed maps and unknown extra fields instead of copying arbitrary metadata", () => {
    const work = fixture();
    const raw = {
      ...work,
      automaticChecks: {
        [questionKey]: { ...work.automaticChecks[questionKey], unusedExtra: { misleading: true } },
        "comprehension:ch02-q01": { ...work.automaticChecks[questionKey], targetKey: "comprehension:ch02-q01" },
        "vocabulary:ch01-word999": { ...work.automaticChecks[wordKey], targetKey: "vocabulary:ch01-word999" },
      },
    };
    const restored = normalizeChapterWork(chapter, raw)!;
    expect(Object.keys(restored.automaticChecks)).toEqual([questionKey]);
    expect(restored.automaticChecks[questionKey]).not.toHaveProperty("unusedExtra");
    expect(normalizeChapterWork(chapter, { ...work, automaticChecks: [work.automaticChecks[questionKey]] })?.automaticChecks).toEqual({});
    expect(normalizeChapterWork(chapter, { ...work, automaticChecks: null })?.automaticChecks).toEqual({});
  });

  it("keeps earlier feedback identifiable as stale after a relevant edit, without confusing a page change with an answer change", () => {
    const work = fixture();
    const original = work.automaticChecks[questionKey];
    work.section = 4; work.page = 1; work.largeText = true;
    expect(currentCheckFingerprint(chapter, work, questionTarget)).toBe(original.inputFingerprint);
    work.comprehension[questionTarget.id].answer += " A new explanation.";
    const changed = normalizeChapterWork(chapter, work)!;
    expect(changed.automaticChecks[questionKey]).toEqual(original);
    expect(currentCheckFingerprint(chapter, changed, questionTarget)).not.toBe(original.inputFingerprint);
    changed.comprehension[questionTarget.id].answer = fixture().comprehension[questionTarget.id].answer;
    changed.comprehension[questionTarget.id].type = "Author and You";
    expect(currentCheckFingerprint(chapter, changed, questionTarget)).not.toBe(original.inputFingerprint);
  });

  it("saves checks through the existing guest progress store and restores current and stale feedback after a full reload", () => {
    const hook = renderHook(useGraphicProgress, { wrapper });
    act(() => hook.result.current.updateWork(chapter, () => fixture()));
    const first = hook.result.current.getWork(chapter);
    expect(first.automaticChecks[questionKey].inputFingerprint).toBe(currentCheckFingerprint(chapter, first, questionTarget));
    act(() => hook.result.current.updateWork(chapter, (old) => {
      old.comprehension[questionTarget.id].answer += " A saved revision after checking.";
      return old;
    }));
    const saved = hook.result.current.getWork(chapter);
    const snapshot = JSON.parse(localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY)!);
    expect(JSON.parse(snapshot.activeAttempts[graphicAttemptId(chapter.id)].metadata.work).automaticChecks).toEqual(saved.automaticChecks);
    hook.unmount();
    const reopened = renderHook(useGraphicProgress, { wrapper });
    const restored = reopened.result.current.getWork(chapter);
    expect(restored.automaticChecks).toEqual(saved.automaticChecks);
    expect(restored.comprehension[questionTarget.id].answer).toBe(saved.comprehension[questionTarget.id].answer);
    expect(restored.automaticChecks[questionKey].inputFingerprint).not.toBe(currentCheckFingerprint(chapter, restored, questionTarget));
    expect(restored.automaticChecks[wordKey].inputFingerprint).toBe(currentCheckFingerprint(chapter, restored, wordTarget));
  });

  it("reopens a reviewed draft after an answer edit while preserving the completed attempt, earlier checks and continuation", () => {
    const reviewed = fixture();
    reviewed.status = "reviewed";
    reviewed.completedOnce = true;
    reviewed.submittedSnapshots = [JSON.stringify({ ...reviewed, submittedSnapshots: [] })];
    cacheReviewedWork(reviewed);
    const hook = renderHook(useGraphicProgress, { wrapper });
    expect(hook.result.current.getWork(chapter).status).toBe("reviewed");
    act(() => hook.result.current.updateWork(chapter, (old) => {
      old.comprehension[questionTarget.id].answer += " A new explanation after the review.";
      return old;
    }));
    const changed = hook.result.current.getWork(chapter);
    expect(changed.status).toBe("in-progress");
    expect(changed.completedOnce).toBe(true);
    expect(changed.submittedSnapshots).toEqual(normalizeChapterWork(chapter, reviewed)!.submittedSnapshots);
    expect(changed.automaticChecks[questionKey]).toEqual(reviewed.automaticChecks[questionKey]);
    expect(currentCheckFingerprint(chapter, changed, questionTarget)).not.toBe(changed.automaticChecks[questionKey].inputFingerprint);
    expect(isChapterUnlocked(2, { [chapter.id]: changed })).toBe(true);
    const stored = JSON.parse(localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY)!);
    expect(stored.completedAttempts.find((attempt: { attemptId: string }) => attempt.attemptId === graphicAttemptId(chapter.id)).status).toBe("completed");
    hook.unmount();
    const reopened = renderHook(useGraphicProgress, { wrapper });
    expect(reopened.result.current.getWork(chapter).status).toBe("in-progress");
    expect(isChapterUnlocked(2, reopened.result.current.works)).toBe(true);
  });

  it("retains reviewed status for layout, help, checklist and feedback metadata changes", () => {
    const reviewed = fixture();
    reviewed.status = "reviewed";
    reviewed.completedOnce = true;
    cacheReviewedWork(reviewed);
    const hook = renderHook(useGraphicProgress, { wrapper });
    act(() => hook.result.current.updateWork(chapter, (old) => {
      old.section = 4; old.page = 1; old.panelIndex = 6; old.readingView = "panel"; old.largeText = true;
      old.comprehension[questionTarget.id].help = true;
      old.comprehension[questionTarget.id].checks.R = true;
      old.vocabulary[wordTarget.id].covered = true;
      old.vocabulary[wordTarget.id].help = true;
      old.review.notes = "A saved review note.";
      old.automaticChecks[questionKey] = { ...old.automaticChecks[questionKey], method: "local-rules-v1", summary: "Updated fixture feedback.", checkedAt: "2026-10-30T12:40:00.000Z" };
      return old;
    }));
    const changed = hook.result.current.getWork(chapter);
    expect(changed.status).toBe("reviewed");
    expect(changed.completedOnce).toBe(true);
    expect(changed.automaticChecks[questionKey].summary).toBe("Updated fixture feedback.");
    expect(changed.review.notes).toBe("A saved review note.");
    expect(currentCheckFingerprint(chapter, changed, questionTarget)).toBe(reviewed.automaticChecks[questionKey].inputFingerprint);
  });

  it("keeps legacy parent-reviewed continuation when the first later edit invalidates its review badge", () => {
    const legacy = createChapterWork(chapter);
    legacy.status = "reviewed";
    legacy.review.parentOverride = true;
    legacy.review.reviewer = "parent";
    expect(legacy.completedOnce).toBe(false);
    cacheReviewedWork(legacy);
    const hook = renderHook(useGraphicProgress, { wrapper });
    act(() => hook.result.current.updateWork(chapter, (old) => {
      old.comprehension[questionTarget.id].answer = "A later learner revision after an older parent review.";
      return old;
    }));
    const changed = hook.result.current.getWork(chapter);
    expect(changed.status).toBe("in-progress");
    expect(changed.review.parentOverride).toBe(true);
    expect(changed.completedOnce).toBe(true);
    expect(isChapterUnlocked(2, { [chapter.id]: changed })).toBe(true);
  });

  it("preserves old completed and parent-reviewed attempts so adding automatic checks never relocks them", () => {
    const oldParentWork = createChapterWork(chapter);
    oldParentWork.status = "reviewed";
    oldParentWork.review.parentOverride = true;
    oldParentWork.review.reviewer = "parent";
    delete (oldParentWork as Partial<ChapterWork>).automaticChecks;
    const restoredParent = normalizeChapterWork(chapter, oldParentWork)!;
    expect(hasChapterSubmission(chapter, restoredParent)).toBe(true);
    expect(isChapterUnlocked(2, { [chapter.id]: restoredParent })).toBe(true);
    expect(restoredParent.review.parentOverride).toBe(true);
    const oldComplete = { ...oldParentWork, completedOnce: true, status: "in-progress", review: { ...oldParentWork.review, parentOverride: false } };
    const snapshot = createEmptyLearningProgressSnapshot();
    snapshot.completedAttempts.push({
      attemptId: graphicAttemptId(chapter.id), subject: "English", topic: chapter.title, answered: 6, total: 6, score: 0,
      status: "completed", startedAt: "2026-10-30T12:30:00.000Z", updatedAt: "2026-10-30T12:35:00.000Z",
      metadata: { format: GRAPHIC_PROGRESS_FORMAT, work: JSON.stringify(oldComplete) },
    });
    const works = readGraphicWorks(snapshot);
    expect(works[chapter.id].automaticChecks).toEqual({});
    expect(isChapterUnlocked(2, works)).toBe(true);
  });
});
