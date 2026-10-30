// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ComponentType } from "react";
import { Comprehension, ParagraphWorkshop, ReviewPanel, TextFeatures, Vocabulary, VocabularyBank, type ExerciseProps } from "../src/features/graphic-novel/Exercises";
import { chapters } from "../src/features/graphic-novel/data";
import { createChapterWork, graphicAttemptId, normalizeChapterWork, useGraphicProgress, GRAPHIC_PROGRESS_FORMAT } from "../src/features/graphic-novel/progress";
import { createEmptyLearningProgressSnapshot, GUEST_PROGRESS_STORAGE_KEY, LearningProgressProvider } from "../src/features/progress";

const chapter = chapters[0];
const questionId = chapter.comprehension[0].id;
const wordId = chapter.vocabularyPractice[0].wordId;
const featureId = chapter.textFeaturesHunt.boxes[0].id;
const longAnswer = "An original answer with evidence and a careful explanation. ".repeat(250);

function damagedHistoryFixture() {
  const work = createChapterWork(chapter);
  work.comprehension[questionId].answer = longAnswer;
  work.comprehension[questionId].history = ["Earlier original answer", null, { unexpected: true }] as never;
  work.vocabulary[wordId].definition = "Current original meaning";
  work.vocabulary[wordId].spellings[0] = "refuge";
  work.vocabulary[wordId].history = [
    { definition: "Earlier original meaning", synonyms: "Shelter", sentence: "A safe place offered refuge.", spellings: null },
    { definition: "", synonyms: "", sentence: "", spellings: ["refug", { unexpected: true }] },
    "old unsupported draft", {},
  ] as never;
  work.paragraph.sentences.detail3 = "The careful builder quietly offered shelter.";
  work.paragraph.history = [
    { sentences: null },
    { sentences: { topicSentence: "Earlier original paragraph." }, adjectives: null, adverbs: {}, crossedOut: ["detail2", { unexpected: true }] },
    "old unsupported draft",
  ] as never;
  work.features[featureId].feature = "Current speech bubble discovery";
  work.features[featureId].history = [
    { feature: "Earlier speech bubble discovery", purpose: { unexpected: true }, help: null },
    "old unsupported draft", {},
  ] as never;
  work.bank.reflection = "Current explanation of a revised match.";
  work.bank.history = [
    { definitions: null, synonyms: { [wordId]: { unexpected: true } }, reflection: "Earlier original match explanation." },
    "old unsupported draft", {},
  ] as never;
  const previous = { ...work, comprehension: { [questionId]: { answer: "Preserved original submitted answer" } }, submittedSnapshots: ["invalid nested entry"] };
  work.submittedSnapshots = ["{broken", JSON.stringify({ chapterId: "not-this-chapter" }), JSON.stringify(previous)];
  return work;
}

function cacheFixture() {
  const snapshot = createEmptyLearningProgressSnapshot();
  const at = "2026-10-30T00:00:00.000Z";
  snapshot.activeAttempts[graphicAttemptId(chapter.id)] = {
    attemptId: graphicAttemptId(chapter.id), subject: "English", topic: chapter.title, answered: 2, total: 6, score: 0,
    status: "in-progress", startedAt: at, updatedAt: at,
    metadata: { format: GRAPHIC_PROGRESS_FORMAT, work: JSON.stringify(damagedHistoryFixture()) },
  };
  localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(snapshot));
}

function ReopenedSection({ Component }: { Component: ComponentType<ExerciseProps> }) {
  const { getWork, updateWork } = useGraphicProgress();
  return <Component chapter={chapter} work={getWork(chapter)} update={(change) => updateWork(chapter, change)} />;
}

describe("Graphic novel saved-history recovery", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("repairs every typed history while preserving current answers and usable earlier drafts", () => {
    const work = normalizeChapterWork(chapter, damagedHistoryFixture())!;
    expect(work.comprehension[questionId].answer).toBe(longAnswer);
    expect(work.comprehension[questionId].history).toEqual(["Earlier original answer"]);
    expect(work.vocabulary[wordId].definition).toBe("Current original meaning");
    expect(work.vocabulary[wordId].spellings[0]).toBe("refuge");
    expect(work.vocabulary[wordId].history).toHaveLength(2);
    expect(work.vocabulary[wordId].history[0]).toMatchObject({ definition: "Earlier original meaning", spellings: ["", "", "", "", ""] });
    expect(work.vocabulary[wordId].history[1].spellings).toEqual(["refug", "", "", "", ""]);
    expect(work.paragraph.sentences.detail3).toBe("The careful builder quietly offered shelter.");
    expect(work.paragraph.history).toHaveLength(1);
    expect(work.paragraph.history[0]).toMatchObject({ sentences: { topicSentence: "Earlier original paragraph." }, crossedOut: ["detail2"] });
    expect(work.features[featureId].history).toEqual([{ feature: "Earlier speech bubble discovery", purpose: "", help: "", savedAt: "" }]);
    expect(work.bank.history).toHaveLength(1);
    expect(work.bank.history[0].reflection).toBe("Earlier original match explanation.");
    expect(Object.values(work.bank.history[0].definitions).every((value) => value === "")).toBe(true);
    expect(work.submittedSnapshots).toHaveLength(1);
    const previous = JSON.parse(work.submittedSnapshots[0]);
    expect(previous.comprehension[questionId].answer).toBe("Preserved original submitted answer");
    expect(previous.submittedSnapshots).toEqual([]);
    expect(normalizeChapterWork(chapter, work)).toEqual(work);
  });

  it.each([
    ["comprehension", Comprehension, "Reading Comprehension"],
    ["vocabulary", Vocabulary, "Vocabulary and Spelling"],
    ["paragraph", ParagraphWorkshop, "Hamburger Paragraph"],
    ["features", TextFeatures, "Text Features Hunt"],
    ["banks", VocabularyBank, "Cumulative Vocabulary Bank / Review"],
    ["review", ReviewPanel, "Your work matters more than a score"],
  ] as const)("reopens %s from persisted damaged history without crashing or losing current text", (_name, Component, heading) => {
    cacheFixture();
    const view = render(<LearningProgressProvider><ReopenedSection Component={Component} /></LearningProgressProvider>);
    expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
    if (Component === Comprehension) expect((screen.getAllByRole("textbox", { name: "Your written answer" })[0] as HTMLTextAreaElement).value).toBe(longAnswer);
    if (Component === Vocabulary) expect((screen.getAllByRole("textbox", { name: "Definition" })[0] as HTMLTextAreaElement).value).toBe("Current original meaning");
    view.unmount();
    render(<LearningProgressProvider><ReopenedSection Component={Component} /></LearningProgressProvider>);
    expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
  });
});
