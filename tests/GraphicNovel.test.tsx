// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GraphicNovel, PanelFigure } from "../src/features/graphic-novel/GraphicNovel";
import { chapters } from "../src/features/graphic-novel/data";
import { GRAPHIC_PROGRESS_FORMAT, createChapterWork, graphicAttemptId, PARAGRAPH_SLOTS, countBankMatches } from "../src/features/graphic-novel/progress";
import { GUEST_PROGRESS_STORAGE_KEY, LearningProgressProvider, createEmptyLearningProgressSnapshot } from "../src/features/progress";
import type { LearningProgressSnapshot } from "../src/features/progress";
import App from "../src/App";

function renderCollection() {
  return render(<LearningProgressProvider><GraphicNovel onBackToEnglish={vi.fn()} /></LearningProgressProvider>);
}
function savedWork() {
  const snapshot = JSON.parse(localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY) ?? "{}") as LearningProgressSnapshot;
  const attempt = Object.values(snapshot.activeAttempts ?? {}).find((item) => item.metadata?.format === GRAPHIC_PROGRESS_FORMAT);
  return attempt?.metadata?.work ? JSON.parse(String(attempt.metadata.work)) : undefined;
}

describe("Graphic novel collection integration", () => {
  beforeEach(() => { localStorage.clear(); window.history.replaceState(null, "", "/"); });
  afterEach(cleanup);

  it("shows the native object number labels taught by the flying-table text-features activity", () => {
    const panel = chapters[13].panels[1];
    render(<PanelFigure panel={panel} />);
    expect(screen.getByLabelText("Table 57").textContent).toBe("57");
    expect(screen.getByText("Position 23")).toBeTruthy();
    expect(screen.getByText("Table 57 moves to position 23.").tagName).toBe("FIGCAPTION");
    expect(screen.getByRole("img").getAttribute("alt")).toBeTruthy();
  });

  it("keeps every chapter in chronological order and unlocks only the first initially", () => {
    renderCollection();
    expect(screen.getByRole("heading", { name: /Hotel.*Transylvania/ })).toBeTruthy();
    const unitHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(unitHeadings.map((item) => item.textContent)).toEqual(expect.arrayContaining(["Promises and protection"]));
    expect(screen.getAllByRole("heading", { level: 4 }).map((item) => item.textContent)).toEqual(chapters.map((item) => item.title));
    expect(screen.getAllByRole("button", { name: /^Start chapter/ })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Finish chapter 1 to continue" }).matches(":disabled")).toBe(true);
    expect(screen.queryByText(chapters[0].comprehension[0].answerGuidance)).toBeNull();
    expect(screen.queryByText(/Peek-a-boo!/)).toBeNull();
  });

  it("renders full accessible narration and dialogue, saves the page/layout and restores long answers without claiming AI grades", async () => {
    const view = renderCollection();
    fireEvent.click(screen.getByRole("button", { name: "Start a new chapter" }));
    expect(screen.getByRole("heading", { name: chapters[0].title })).toBeTruthy();
    for (const panel of chapters[0].panels.slice(0, 4)) expect(screen.getByText(panel.narration)).toBeTruthy();
    expect(screen.getByText(chapters[0].panels[0].dialogue[0].text)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText(chapters[0].panels[7].narration)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "One panel at a time" }));
    fireEvent.click(screen.getByRole("button", { name: "Larger text" }));
    await waitFor(() => expect(savedWork()).toMatchObject({ page: 1, readingView: "panel", largeText: true }));
    fireEvent.click(screen.getByRole("button", { name: /02.*Reading Comprehension/ }));
    expect(screen.getAllByRole("textbox").length).toBeGreaterThanOrEqual(5);
    const answer = "My carefully reasoned answer with a detail and explanation. ".repeat(200);
    const boxes = screen.getAllByRole("textbox", { name: "Your written answer" });
    fireEvent.change(boxes[0], { target: { value: answer } });
    await waitFor(() => expect(savedWork()?.comprehension[chapters[0].comprehension[0].id].answer).toBe(answer));
    expect(screen.queryByText(chapters[0].comprehension[0].answerGuidance)).toBeNull();
    view.unmount(); renderCollection();
    fireEvent.click(screen.getByRole("button", { name: "Resume chapter 1" }));
    expect(screen.getAllByRole("textbox").some((element) => (element as HTMLTextAreaElement).value === answer)).toBe(true);
    expect(screen.getByRole("button", { name: /02.*Reading Comprehension/ }).getAttribute("aria-current")).toBe("step");
    fireEvent.click(screen.getByRole("button", { name: /06.*Cumulative Vocabulary Bank/ }));
    fireEvent.click(screen.getByRole("button", { name: "Submit chapter" }));
    expect(screen.getByRole("alert").textContent).toContain("A few parts still need an attempt");
    expect(screen.queryByText("Chapter submitted.")).toBeNull();
    expect(screen.getByRole("alert").textContent).not.toContain('"complete"');
  });

  it("opens the direct route and returns to the preserved English collection", async () => {
    window.history.replaceState(null, "", "/#graphic-novel");
    render(<LearningProgressProvider><App /></LearningProgressProvider>);
    expect(await screen.findByRole("heading", { name: /Hotel.*Transylvania/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back to English" }));
    expect(screen.getByRole("heading", { name: "Grade 4 English Practice" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start a New Lesson" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Explore Graphic Novel Lessons" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /All ten stories are here/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Explore Graphic Novel Lessons" }));
    expect(await screen.findByRole("heading", { name: /Hotel.*Transylvania/ })).toBeTruthy();
  });

  it("submits a complete attempt, preserves it for revision and unlocks the next chapter without requiring perfect matching", async () => {
    const chapter = chapters[0];
    const work = createChapterWork(chapter);
    work.section = 5; work.readingComplete = true;
    chapter.comprehension.forEach((question) => { work.comprehension[question.id].answer = "Test fixture: an explained answer."; work.comprehension[question.id].type = "Author and You"; });
    chapter.vocabularyPractice.forEach((word) => { Object.assign(work.vocabulary[word.wordId], { definition: "Test meaning", synonyms: "Test equivalent", sentence: `Test sentence using ${word.word}.`, spellings: Array(5).fill(word.word), spellingChecked: Array(5).fill(true) }); });
    PARAGRAPH_SLOTS.forEach((slot) => { work.paragraph.sentences[slot] = "A careful writer clearly explains a relevant idea."; work.paragraph.adjectives[slot] = "careful"; work.paragraph.adverbs[slot] = "clearly"; });
    work.paragraph.crossedOut = ["detail2"];
    chapter.textFeaturesHunt.boxes.forEach((box) => Object.assign(work.features[box.id], { feature: "Narration", purpose: "Explains the setting", help: "I can follow the action." }));
    chapter.cumulativeVocabularyBank.wordIds.forEach((wordId) => { work.bank.definitions[wordId] = chapter.cumulativeVocabularyBank.definitionChoices[0].id; work.bank.synonyms[wordId] = chapter.cumulativeVocabularyBank.synonymChoices[0].id; });
    work.bank.submitted = true; work.bank.reflection = "Test fixture: I checked the contextual meaning.";
    expect(countBankMatches(chapter, work).correct).toBeLessThan(countBankMatches(chapter, work).total);
    const snapshot = createEmptyLearningProgressSnapshot();
    const at = new Date().toISOString();
    snapshot.activeAttempts[graphicAttemptId(chapter.id)] = { attemptId: graphicAttemptId(chapter.id), subject: "English", topic: chapter.title, answered: 5, total: 6, score: 0, status: "in-progress", startedAt: at, updatedAt: at, metadata: { format: GRAPHIC_PROGRESS_FORMAT, work: JSON.stringify(work) } };
    localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(snapshot));
    renderCollection();
    fireEvent.click(screen.getByRole("button", { name: "Resume chapter 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit chapter" }));
    expect(screen.getByRole("heading", { name: "Chapter submitted." })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Your responses and review guidance" })).toBeTruthy();
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY) ?? "{}") as LearningProgressSnapshot;
      const complete = saved.completedAttempts.find((item) => item.attemptId === graphicAttemptId(chapter.id));
      expect(complete?.score).toBe(0);
      expect(JSON.parse(String(complete?.metadata?.work))).toMatchObject({ status: "submitted", completedOnce: true });
      expect(JSON.parse(String(complete?.metadata?.work)).submittedSnapshots).toHaveLength(1);
    });
    fireEvent.click(screen.getByRole("button", { name: "Next chapter: 2" }));
    expect(screen.getByRole("heading", { name: chapters[1].title })).toBeTruthy();
  });
});
