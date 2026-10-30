// @vitest-environment jsdom

import { createElement, type PropsWithChildren } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as progressModule from "../src/features/progress";
import type { LearningProgressContextValue, PracticeAttempt } from "../src/features/progress";
import { chapters } from "../src/features/graphic-novel/data";
import {
  completionDetails, countBankMatches, createChapterWork, graphicAttemptId,
  hasChapterSubmission, isChapterUnlocked, isCompleteAttempt, nextUnlocked,
  normalizeChapterWork, PARAGRAPH_SLOTS, readGraphicWorks, spellingMatches, useGraphicProgress,
} from "../src/features/graphic-novel/progress";
import type { ChapterWork } from "../src/features/graphic-novel/types";

const chapter = chapters[0];
const wrapper = ({ children }: PropsWithChildren) => createElement(progressModule.LearningProgressProvider, null, children);

function completeFixture(): ChapterWork {
  const work = createChapterWork(chapter);
  work.readingComplete = true;
  for (const question of chapter.comprehension) {
    work.comprehension[question.id].answer = "An attempted explanation for a test fixture, not a learner record.";
    work.comprehension[question.id].type = question.readingTypeChoices[0];
  }
  for (const word of chapter.vocabularyPractice) {
    Object.assign(work.vocabulary[word.wordId], { definition: "Attempted meaning", synonyms: "An equivalent phrase", sentence: "A sentence to review for meaning.", spellings: Array(5).fill("incorrect-attempt"), spellingChecked: Array(5).fill(true) });
  }
  for (const slot of PARAGRAPH_SLOTS) {
    work.paragraph.sentences[slot] = "A careful writer clearly explains a detail.";
    work.paragraph.adjectives[slot] = "careful";
    work.paragraph.adverbs[slot] = "clearly";
  }
  work.paragraph.crossedOut = ["detail2"];
  for (const box of chapter.textFeaturesHunt.boxes) Object.assign(work.features[box.id], { feature: "Speech bubble", purpose: "Shows a speaker's own words", help: "Separates speech from the narration" });
  for (const id of chapter.cumulativeVocabularyBank.wordIds) {
    work.bank.definitions[id] = chapter.cumulativeVocabularyBank.definitionChoices[0].id;
    work.bank.synonyms[id] = chapter.cumulativeVocabularyBank.synonymChoices[0].id;
  }
  work.bank.submitted = true;
  work.bank.reflection = "I checked a meaning and revised my match.";
  return work;
}

describe("Graphic novel chapter progress", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("creates a genuine partial editing scaffold while leaving written responses and examples blank", () => {
    const work = createChapterWork(chapter);
    expect(work.paragraph.sentences).toMatchObject({ topicSentence: chapter.hamburgerParagraph.topicSentence, detail1: chapter.hamburgerParagraph.detail1, detail2: chapter.hamburgerParagraph.detail2, detail3: "", conclusion: "" });
    expect(work.comprehension[chapter.comprehension[0].id].answer).toBe("");
    expect(Object.values(work.vocabulary).every((word) => word.spellings.length === 5 && word.spellings.every((attempt) => attempt === "") && word.definition === "")).toBe(true);
    expect(work.teacherBannedWords).toEqual([]);
    expect(completionDetails(chapter, work).missing.length).toBeGreaterThan(5);
    expect(isChapterUnlocked(1, {})).toBe(true);
    expect(isChapterUnlocked(2, {})).toBe(false);
  });

  it("separates complete attempts from mastery, preserves submitted work during revision, and never skips a chapter", () => {
    const work = completeFixture();
    expect(isCompleteAttempt(chapter, work)).toBe(true);
    expect(countBankMatches(chapter, work).correct).toBeLessThan(countBankMatches(chapter, work).total);
    expect(hasChapterSubmission(chapter, work)).toBe(false);
    work.submittedSnapshots = [JSON.stringify({ ...work, submittedSnapshots: [] })];
    work.status = "submitted";
    expect(hasChapterSubmission(chapter, work)).toBe(true);
    work.status = "in-progress";
    work.comprehension[chapter.comprehension[0].id].answer = "";
    expect(isCompleteAttempt(chapter, work)).toBe(false);
    expect(hasChapterSubmission(chapter, work)).toBe(true);
    const works = { [chapter.id]: work };
    expect(isChapterUnlocked(2, works)).toBe(true);
    expect(isChapterUnlocked(3, works)).toBe(false);
    expect(nextUnlocked(works)?.id).toBe(chapters[1].id);
    const parentReviewed = createChapterWork(chapters[1]);
    parentReviewed.status = "reviewed";
    parentReviewed.review.parentOverride = true;
    expect(hasChapterSubmission(chapters[1], parentReviewed)).toBe(true);
  });

  it("checks bank choice IDs rather than shuffled display positions and accepts real regional spelling variants", () => {
    const work = createChapterWork(chapter);
    work.bank.definitionOrder.reverse();
    work.bank.synonymOrder.reverse();
    for (const choice of chapter.cumulativeVocabularyBank.definitionChoices) work.bank.definitions[choice.correctWordId] = choice.id;
    for (const choice of chapter.cumulativeVocabularyBank.synonymChoices) work.bank.synonyms[choice.correctWordId] = choice.id;
    expect(countBankMatches(chapter, work)).toEqual({ correct: 6, total: 6 });
    expect(spellingMatches("cooperate", "Co-operate!")).toBe(true);
    expect(spellingMatches("favorite", "favourite")).toBe(true);
    expect(spellingMatches("favorite", "faverite")).toBe(false);
    expect(spellingMatches("rhythm", "rythm")).toBe(false);
  });

  it("saves rapid functional edits and all response kinds without truncating long answers or replacing old progress", () => {
    const snapshot = progressModule.createEmptyLearningProgressSnapshot();
    const existing: PracticeAttempt = { attemptId: "existing-math-round", subject: "Math", topic: "Addition", answered: 20, total: 20, score: 18, status: "completed", startedAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:02.000Z" };
    snapshot.completedAttempts.push(existing);
    window.localStorage.setItem(progressModule.GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(snapshot));
    const clock = vi.spyOn(Date, "now").mockReturnValue(1_800_000_000_000);
    const hook = renderHook(useGraphicProgress, { wrapper });
    const longAnswer = "A long original answer. ".repeat(1500);
    act(() => {
      hook.result.current.updateWork(chapter, (old) => { old.comprehension[chapter.comprehension[0].id].answer = longAnswer; return old; });
      hook.result.current.updateWork(chapter, (old) => { old.comprehension[chapter.comprehension[0].id].type = "Author and You"; old.comprehension[chapter.comprehension[0].id].checks.R = true; return old; });
      hook.result.current.updateWork(chapter, (old) => {
        old.section = 4; old.page = 1; old.readingView = "panel"; old.panelIndex = 6; old.largeText = true;
        const word = old.vocabulary[chapter.vocabularyPractice[0].wordId];
        word.definition = "Shelter"; word.synonyms = "Safe place"; word.sentence = "The cave offered refuge."; word.spellings = ["refuge", "refug", "REFUGE", "refuge!", "refuge"]; word.spellingChecked = Array(5).fill(true); word.covered = true;
        old.paragraph.sentences.detail3 = "The watchful builder clearly offered a warning.";
        old.paragraph.adjectives.detail3 = "watchful"; old.paragraph.adverbs.detail3 = "clearly";
        old.features[chapter.textFeaturesHunt.boxes[0].id] = { ...old.features[chapter.textFeaturesHunt.boxes[0].id], feature: "Time label", purpose: "Places the story in time", help: "I followed the sequence" };
        old.bank.reflection = "I revised a match.";
        old.submittedSnapshots.push(JSON.stringify({ fixture: "previous original response" }));
        return old;
      });
    });
    const saved = hook.result.current.getWork(chapter);
    const savedOrders = copyOrders(saved);
    expect(saved.revision).toBe(3);
    expect(saved.comprehension[chapter.comprehension[0].id]).toMatchObject({ answer: longAnswer, type: "Author and You", checks: { R: true } });
    expect(saved.updatedAt).toBe("2027-01-15T08:00:00.002Z");
    const cached = JSON.parse(window.localStorage.getItem(progressModule.GUEST_PROGRESS_STORAGE_KEY)!);
    expect(cached.completedAttempts.find((attempt: PracticeAttempt) => attempt.attemptId === existing.attemptId)).toEqual(existing);
    const storedAttempt = cached.activeAttempts[graphicAttemptId(chapter.id)];
    expect(storedAttempt.startedAt).toBe("2027-01-15T08:00:00.000Z");
    expect(storedAttempt.score).toBe(0);
    expect(cached.schemaVersion).toBe(1);
    hook.unmount();
    clock.mockRestore();
    const reopened = renderHook(useGraphicProgress, { wrapper });
    expect(reopened.result.current.getWork(chapter)).toEqual(saved);
    expect(copyOrders(reopened.result.current.getWork(chapter))).toEqual(savedOrders);
  });

  it.each([
    { auth: { status: "loading", userId: null, email: null }, syncStatus: "idle" },
    { auth: { status: "authenticated", userId: "test-reader", email: null }, syncStatus: "loading" },
  ] as const)("blocks edits through initial account loading ($syncStatus)", ({ auth, syncStatus }) => {
    const context: LearningProgressContextValue = {
      snapshot: progressModule.createEmptyLearningProgressSnapshot(), auth, syncStatus, syncMessage: null,
      replacePracticeAttempt: vi.fn(), updatePracticeProgress: vi.fn(), resetPracticeAttempt: vi.fn(), replaceSnapshot: vi.fn(), refreshLegacyProgress: vi.fn(), syncNow: vi.fn(async () => undefined),
      signIn: vi.fn(async () => ({ ok: true, message: "" })), createAccount: vi.fn(async () => ({ ok: true, message: "" })), signOut: vi.fn(async () => ({ ok: true, message: "" })),
    };
    vi.spyOn(progressModule, "useLearningProgress").mockReturnValue(context);
    const hook = renderHook(useGraphicProgress);
    act(() => hook.result.current.updateWork(chapter, (work) => ({ ...work, section: 3 })));
    expect(hook.result.current.ready).toBe(false);
    expect(context.replacePracticeAttempt).not.toHaveBeenCalled();
    expect(hook.result.current.works).toEqual({});
  });

  it("does not carry the previous reader's answers into an incoming account during hydration", () => {
    const firstWork = createChapterWork(chapter);
    firstWork.comprehension[chapter.comprehension[0].id].answer = "Reader A's private draft";
    const snapshot = progressModule.createEmptyLearningProgressSnapshot();
    snapshot.activeAttempts[graphicAttemptId(chapter.id)] = {
      attemptId: graphicAttemptId(chapter.id), subject: "English", topic: "Graphic novel", answered: 0, total: 6, score: 0, status: "in-progress",
      startedAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
      metadata: { format: "graphic-novel-chapter-v1", work: JSON.stringify(firstWork) },
    };
    const context: LearningProgressContextValue = {
      snapshot, auth: { status: "authenticated", userId: "reader-a", email: null }, syncStatus: "synced", syncMessage: null,
      replacePracticeAttempt: vi.fn(), updatePracticeProgress: vi.fn(), resetPracticeAttempt: vi.fn(), replaceSnapshot: vi.fn(), refreshLegacyProgress: vi.fn(), syncNow: vi.fn(async () => undefined),
      signIn: vi.fn(async () => ({ ok: true, message: "" })), createAccount: vi.fn(async () => ({ ok: true, message: "" })), signOut: vi.fn(async () => ({ ok: true, message: "" })),
    };
    vi.spyOn(progressModule, "useLearningProgress").mockImplementation(() => context);
    const hook = renderHook(useGraphicProgress);
    const previousUpdate = hook.result.current.updateWork;
    expect(hook.result.current.getWork(chapter).comprehension[chapter.comprehension[0].id].answer).toBe("Reader A's private draft");
    context.auth = { status: "loading", userId: "reader-b", email: null };
    context.syncStatus = "loading";
    hook.rerender(); // The provider still has A's snapshot until B is hydrated.
    expect(hook.result.current.works).toEqual({});
    expect(hook.result.current.getWork(chapter).comprehension[chapter.comprehension[0].id].answer).toBe("");
    context.snapshot = progressModule.createEmptyLearningProgressSnapshot();
    context.auth = { status: "authenticated", userId: "reader-b", email: null };
    context.syncStatus = "synced";
    hook.rerender();
    expect(hook.result.current.getWork(chapter).comprehension[chapter.comprehension[0].id].answer).toBe("");
    act(() => previousUpdate(chapter, (work) => ({ ...work, section: 4 })));
    expect(context.replacePracticeAttempt).not.toHaveBeenCalled();
    act(() => hook.result.current.updateWork(chapter, (work) => {
      work.comprehension[chapter.comprehension[0].id].answer = "Reader B's own answer";
      return work;
    }));
    const written = vi.mocked(context.replacePracticeAttempt).mock.calls[0][0];
    expect(written.metadata?.work).toContain("Reader B's own answer");
    expect(written.metadata?.work).not.toContain("Reader A's private draft");
    expect(written.startedAt).not.toBe("2026-01-01T00:00:00.000Z");
  });

  it("ignores broken metadata while restoring older valid records with new defaults", () => {
    const old = createChapterWork(chapter) as unknown as Record<string, unknown>;
    delete old.readingView; delete old.panelIndex; delete old.submittedSnapshots;
    const restored = normalizeChapterWork(chapter, old)!;
    expect(restored.readingView).toBe("page");
    expect(restored.panelIndex).toBe(0);
    const snapshot = progressModule.createEmptyLearningProgressSnapshot();
    snapshot.activeAttempts.bad = { attemptId: graphicAttemptId(chapter.id), subject: "English", topic: "Graphic novel", answered: 0, total: 6, score: 0, status: "in-progress", startedAt: "2026-10-30T00:00:00.000Z", updatedAt: "2026-10-30T00:00:00.000Z", metadata: { format: "graphic-novel-chapter-v1", work: "{broken" } };
    expect(readGraphicWorks(snapshot)).toEqual({});
  });
});

function copyOrders(work: ChapterWork) { return { definitions: [...work.bank.definitionOrder], synonyms: [...work.bank.synonymOrder] }; }
