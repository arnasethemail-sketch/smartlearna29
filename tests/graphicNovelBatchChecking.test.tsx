// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GraphicNovel } from "../src/features/graphic-novel/GraphicNovel";
import { chapters } from "../src/features/graphic-novel/data";
import * as checking from "../src/features/graphic-novel/checking";
import { createChapterWork, GRAPHIC_PROGRESS_FORMAT, graphicAttemptId, PARAGRAPH_SLOTS } from "../src/features/graphic-novel/progress";
import { createEmptyLearningProgressSnapshot, GUEST_PROGRESS_STORAGE_KEY, LearningProgressProvider } from "../src/features/progress";
import type { ChapterWork } from "../src/features/graphic-novel/types";
import type { AutomaticCheck } from "../src/features/graphic-novel/checking-types";
import type { LearningProgressSnapshot } from "../src/features/progress";

const chapter = chapters[0];
function resultFor(ch: typeof chapter, work: ChapterWork, target: checking.CheckTarget): AutomaticCheck {
  return { schemaVersion: 1, targetKey: checking.checkTargetKey(target), inputFingerprint: checking.currentCheckFingerprint(ch, work, target), checkedAt: new Date().toISOString(), method: "local-semantic-v1", overall: "ready", summary: "Test: this draft was checked.", dimensions: { meaning: { rating: "ready", feedback: "Test meaning" }, support: { rating: "ready", feedback: "Test support" }, clarity: { rating: "ready", feedback: "Test clarity" }, conventions: { rating: "ready", feedback: "Test conventions" } }, strengths: [], nextSteps: [], evidencePanelIds: [] };
}
function seed() {
  const work = createChapterWork(chapter);
  work.readingComplete = true;
  chapter.comprehension.forEach((question) => { work.comprehension[question.id].answer = "A test answer with a relevant detail."; work.comprehension[question.id].type = "Author and You"; });
  chapter.vocabularyPractice.forEach((word) => Object.assign(work.vocabulary[word.wordId], { definition: word.teacherWord.definition, synonyms: word.teacherWord.synonyms.join(", "), sentence: word.teacherWord.exampleSentence, spellings: Array(5).fill(word.word), spellingChecked: Array(5).fill(true) }));
  PARAGRAPH_SLOTS.forEach((slot) => { work.paragraph.sentences[slot] = "The protective father carefully planned a refuge."; work.paragraph.adjectives[slot] = "protective"; work.paragraph.adverbs[slot] = "carefully"; });
  work.paragraph.crossedOut = [chapter.hamburgerParagraph.irrelevantSlot];
  chapter.textFeaturesHunt.boxes.forEach((box) => Object.assign(work.features[box.id], { feature: "Speech bubble", purpose: "It identifies the speaker.", help: "It helps me follow the conversation." }));
  chapter.cumulativeVocabularyBank.wordIds.forEach((id) => { work.bank.definitions[id] = chapter.cumulativeVocabularyBank.definitionChoices[0].id; work.bank.synonyms[id] = chapter.cumulativeVocabularyBank.synonymChoices[0].id; });
  work.bank.submitted = true; work.bank.reflection = "I chose refuge because it means a safe place.";
  const snapshot = createEmptyLearningProgressSnapshot();
  const at = new Date().toISOString();
  snapshot.activeAttempts[graphicAttemptId(chapter.id)] = { attemptId: graphicAttemptId(chapter.id), subject: "English", topic: chapter.title, answered: 5, total: 6, score: 0, status: "in-progress", startedAt: at, updatedAt: at, metadata: { format: GRAPHIC_PROGRESS_FORMAT, work: JSON.stringify(work) } };
  localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(snapshot));
}
function saved() {
  const snapshot = JSON.parse(localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY)!) as LearningProgressSnapshot;
  const attempt = [...Object.values(snapshot.activeAttempts), ...snapshot.completedAttempts].find((item) => item.attemptId === graphicAttemptId(chapter.id));
  return JSON.parse(String(attempt?.metadata?.work)) as ChapterWork;
}
function open() {
  const view = render(<LearningProgressProvider><GraphicNovel onBackToEnglish={vi.fn()} /></LearningProgressProvider>);
  fireEvent.click(screen.queryByRole("button", { name: "Resume chapter 1" }) ?? screen.getByRole("button", { name: "Revisit your work" }));
  fireEvent.click(screen.getByRole("button", { name: "App feedback" }));
  return view;
}

describe("Free chapter-wide app checking", () => {
  beforeEach(() => { localStorage.clear(); window.history.replaceState(null, "", "/"); seed(); });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("checks all 14 activities, saves feedback and restores it without a parent approval", async () => {
    const check = vi.spyOn(checking, "checkWrittenResponse").mockImplementation(async (ch, work, target) => resultFor(ch, work, target));
    const view = open();
    expect(screen.queryByRole("checkbox", { name: /parent|discussed/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Check all written answers" }));
    await waitFor(() => expect(saved().status).toBe("reviewed"));
    expect(check).toHaveBeenCalledTimes(14);
    expect(Object.keys(saved().automaticChecks)).toHaveLength(14);
    expect(saved().completedOnce).toBe(true);
    view.unmount(); open();
    expect(screen.getByRole("status").textContent).toContain("14 of 14");
  });

  it("discards an in-flight batch when the learner leaves the chapter", async () => {
    let finish!: (result: AutomaticCheck) => void;
    let pendingInput!: Parameters<typeof checking.checkWrittenResponse>;
    const check = vi.spyOn(checking, "checkWrittenResponse").mockImplementation((...args) => { pendingInput = args; return new Promise((resolve) => { finish = resolve; }); });
    open(); fireEvent.click(screen.getByRole("button", { name: "Check all written answers" }));
    expect(check).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Chapter library" }));
    finish(resultFor(pendingInput[0], pendingInput[1], pendingInput[2]));
    await waitFor(() => expect(screen.getByRole("heading", { name: /Hotel.*Transylvania/ })).toBeTruthy());
    expect(saved().automaticChecks).toEqual({});
    expect(check).toHaveBeenCalledTimes(1);
  });

  it("keeps a failed check from marking the chapter reviewed or losing answers", async () => {
    vi.spyOn(checking, "checkWrittenResponse").mockRejectedValue(new Error("Test: local model unavailable"));
    open(); const before = saved().comprehension[chapter.comprehension[0].id].answer;
    fireEvent.click(screen.getByRole("button", { name: "Check all written answers" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("could not finish"));
    expect(saved().status).toBe("in-progress");
    expect(saved().comprehension[chapter.comprehension[0].id].answer).toBe(before);
    expect(saved().automaticChecks).toEqual({});
  });
});
