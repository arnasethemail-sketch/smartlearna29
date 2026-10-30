// @vitest-environment jsdom

import { useState } from "react";
import type { ComponentType } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { chapters } from "../src/features/graphic-novel/data";
import type { GraphicChapter } from "../src/features/graphic-novel/data";
import { Comprehension, MarkedSentence, ParagraphWorkshop, TextFeatures, Vocabulary, VocabularyBank } from "../src/features/graphic-novel/Exercises";
import type { ExerciseProps } from "../src/features/graphic-novel/Exercises";
import { createChapterWork } from "../src/features/graphic-novel/progress";
import type { ChapterWork } from "../src/features/graphic-novel/types";
import type { AutomaticCheck, CheckTarget } from "../src/features/graphic-novel/checking-types";

vi.mock("../src/features/graphic-novel/checking", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/features/graphic-novel/checking")>();
  return { ...actual, checkWrittenResponse: vi.fn(async (chapter: GraphicChapter, work: ChapterWork, target: CheckTarget): Promise<AutomaticCheck> => ({
    schemaVersion: 1, targetKey: actual.checkTargetKey(target), inputFingerprint: actual.currentCheckFingerprint(chapter, work, target),
    checkedAt: "2026-10-30T00:00:00.000Z", method: "local-rules-v1", overall: "ready", summary: "Your explanation answers this question.",
    dimensions: { meaning: { rating: "ready", feedback: "The meaning is clear." }, support: { rating: "ready", feedback: "You gave a relevant reason." }, clarity: { rating: "ready", feedback: "The sentence is clear." }, conventions: { rating: "ready", feedback: "The writing is easy to follow." } },
    strengths: ["A clear explanation."], nextSteps: [], evidencePanelIds: [],
  })) };
});

afterEach(cleanup);

function renderSection(Component: ComponentType<ExerciseProps>, chapter: GraphicChapter = chapters[0], initial = createChapterWork(chapter)) {
  let latest = initial;
  function Harness() {
    const [work, update] = useState(initial);
    latest = work;
    return <Component chapter={chapter} work={work} update={update} />;
  }
  const view = render(<Harness />);
  return { ...view, readWork: () => latest };
}

describe("Graphic novel written worksheets", () => {
  it("keeps five written answers alongside classifications/checklists and checks answers without a parent review form", async () => {
    const chapter = chapters[0];
    const view = renderSection(Comprehension);
    expect(screen.getAllByRole("textbox", { name: "Your written answer" })).toHaveLength(5);
    expect(screen.getAllByRole("radio")).toHaveLength(20);
    expect(screen.getAllByRole("checkbox")).toHaveLength(35);
    expect(screen.queryByText(chapter.comprehension[0].answerGuidance)).toBeNull();
    fireEvent.click(screen.getAllByRole("radio", { name: "Right There" })[0]);
    expect((screen.getAllByRole("textbox", { name: "Your written answer" })[0] as HTMLTextAreaElement).value).toBe("");
    expect(view.readWork().comprehension[chapter.comprehension[0].id].type).toBe("Right There");

    fireEvent.click(screen.getByRole("button", { name: "Help with question 1" }));
    expect(screen.getByText(chapter.comprehension[0].hint)).toBeTruthy();
    expect(screen.queryByText(chapter.comprehension[0].answerGuidance)).toBeNull();
    const input = screen.getAllByRole("textbox", { name: "Your written answer" })[0];
    fireEvent.change(input, { target: { value: "The builder wanted the hotel to stay hidden, so he warned against bright fires." } });
    fireEvent.blur(input);
    fireEvent.click(screen.getByRole("button", { name: "Check my answer to question 1" }));
    expect(await screen.findByRole("heading", { name: "Looks good" })).toBeTruthy();
    expect(screen.getByText(chapter.comprehension[0].answerGuidance)).toBeTruthy();
    expect(screen.queryByRole("combobox", { name: /^Meaning/ })).toBeNull();
    expect(view.readWork().automaticChecks[`comprehension:${chapter.comprehension[0].id}`].dimensions.meaning.rating).toBe("ready");
    expect(view.readWork().comprehension[chapter.comprehension[0].id].history).toEqual(["The builder wanted the hotel to stay hidden, so he warned against bright fires."]);
    expect(view.readWork().comprehension[chapter.comprehension[0].id].review.meaning).toBe("");
    fireEvent.change(input, { target: { value: "A revised answer with the reason more clearly explained." } });
    fireEvent.blur(input);
    expect(view.readWork().comprehension[chapter.comprehension[0].id].history).toHaveLength(2);
  });

  it("starts vocabulary meanings blank, retains spelling revisions and checks actual spelling without autocorrection", () => {
    const chapter = chapters[0];
    const view = renderSection(Vocabulary);
    expect(screen.getAllByRole("textbox", { name: "Definition" })).toHaveLength(3);
    expect(screen.getAllByRole("textbox", { name: "Synonyms" })).toHaveLength(3);
    expect(screen.getAllByRole("textbox", { name: "Use it in a sentence that shows the meaning of the word" })).toHaveLength(3);
    expect(screen.getAllByRole("textbox").filter((input) => (input as HTMLInputElement).value !== "")).toHaveLength(0);
    expect(screen.queryByText(chapter.vocabularyPractice[0].teacherWord.definition)).toBeNull();
    const firstAttempt = screen.getAllByRole("textbox", { name: "Attempt 1" })[0];
    expect(firstAttempt.getAttribute("spellcheck")).toBe("false");
    expect(firstAttempt.getAttribute("autocorrect")).toBe("off");
    fireEvent.change(firstAttempt, { target: { value: "refug" } });
    fireEvent.click(screen.getByRole("button", { name: "Check word 1, attempt 1" }));
    expect(screen.getByText("r · e · f · u · g · e")).toBeTruthy();
    expect(view.readWork().vocabulary[chapter.vocabularyPractice[0].wordId].spellings[0]).toBe("refug");
    fireEvent.change(firstAttempt, { target: { value: "REFUGE!" } });
    fireEvent.click(screen.getByRole("button", { name: "Check word 1, attempt 1" }));
    expect(screen.getByText("Spelling matches.")).toBeTruthy();
    expect(view.readWork().vocabulary[chapter.vocabularyPractice[0].wordId].history.map((item) => item.spellings[0])).toEqual(["refug", "REFUGE!"]);
    fireEvent.click(screen.getByRole("button", { name: "Word help 1" }));
    expect(screen.getByText(chapter.vocabularyPractice[0].teacherWord.definition)).toBeTruthy();
    expect((screen.getAllByRole("textbox", { name: "Definition" })[0] as HTMLTextAreaElement).value).toBe("");
  });

  it("shows the authored incomplete paragraph, lets a learner replace/cross out a detail, and highlights chosen language", () => {
    const chapter = chapters[0];
    const view = renderSection(ParagraphWorkshop);
    expect((screen.getByRole("textbox", { name: "Your revised detail #1" }) as HTMLTextAreaElement).value).toBe(chapter.hamburgerParagraph.detail1);
    expect((screen.getByRole("textbox", { name: "Your revised detail #3" }) as HTMLTextAreaElement).value).toBe("");
    expect(screen.queryByText(chapter.hamburgerParagraph.modelParagraph)).toBeNull();
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Cross out this supporting detail" })[1]);
    expect(screen.getAllByText(chapter.hamburgerParagraph.detail2).some((element) => element.tagName === "S")).toBe(true);
    const topic = screen.getByRole("textbox", { name: "Your revised topic sentence" });
    fireEvent.change(topic, { target: { value: "The protective father carefully planned a refuge." } });
    fireEvent.change(screen.getAllByRole("textbox", { name: "Adjective or adjective phrase" })[0], { target: { value: "protective" } });
    fireEvent.change(screen.getAllByRole("textbox", { name: "Adverb or adverb phrase" })[0], { target: { value: "carefully" } });
    expect(screen.getByText("protective").tagName).toBe("MARK");
    expect(screen.getByText("carefully").tagName).toBe("MARK");
    expect(view.readWork().paragraph.adjectives.topicSentence).toBe("protective");
    expect(view.readWork().paragraph.review.meaning).toBe("");
  });

  it("has four feature boxes with all three blank written responses and no prefilled model", () => {
    renderSection(TextFeatures);
    expect(screen.getAllByRole("textbox")).toHaveLength(12);
    expect(screen.getAllByRole("textbox", { name: "Text feature found" })).toHaveLength(4);
    expect(screen.getAllByRole("textbox", { name: "Why do you think the author included this text feature?" })).toHaveLength(4);
    expect(screen.getAllByRole("textbox", { name: "How did this text feature help you understand the text?" })).toHaveLength(4);
    expect(screen.queryByText("An example to compare, not copy")).toBeNull();
    for (const input of screen.getAllByRole("textbox")) expect((input as HTMLTextAreaElement).value).toBe("");
  });

  it("grades saved choice IDs correctly even when both bank orders are reversed and exposes corrections only after submission", () => {
    const chapter = chapters[1];
    const initial = createChapterWork(chapter);
    initial.bank.definitionOrder.reverse();
    initial.bank.synonymOrder.reverse();
    const view = renderSection(VocabularyBank, chapter, initial);
    expect(screen.queryByText(/matches correct/)).toBeNull();
    expect(screen.getByRole("button", { name: "Check my matches" }).matches(":disabled")).toBe(true);
    for (const wordId of chapter.cumulativeVocabularyBank.wordIds) {
      const word = chapter.cumulativeVocabularyBank.definitionChoices.find((choice) => choice.correctWordId === wordId)!;
      const synonym = chapter.cumulativeVocabularyBank.synonymChoices.find((choice) => choice.correctWordId === wordId)!;
      const field = screen.getAllByRole("group").find((element) => within(element).queryByRole("combobox", { name: "Definition match" }) && (element as HTMLFieldSetElement).querySelector("legend")?.textContent === chapters.flatMap((item) => item.newVocabulary).find((item) => item.id === wordId)?.word)!;
      fireEvent.change(within(field).getByRole("combobox", { name: "Definition match" }), { target: { value: word.id } });
      fireEvent.change(within(field).getByRole("combobox", { name: "Synonym match" }), { target: { value: synonym.id } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Check my matches" }));
    expect(screen.getByText(`${chapter.cumulativeVocabularyBank.wordIds.length * 2} of ${chapter.cumulativeVocabularyBank.wordIds.length * 2} matches correct. You can revise and check again.`)).toBeTruthy();
    expect(view.readWork().bank.definitionOrder).toEqual(initial.bank.definitionOrder);
    expect(view.readWork().bank.synonymOrder).toEqual(initial.bank.synonymOrder);
    expect(view.readWork().bank.history).toHaveLength(1);
    const firstDefinition = screen.getAllByRole("combobox", { name: "Definition match" })[0];
    fireEvent.change(firstDefinition, { target: { value: chapter.cumulativeVocabularyBank.definitionChoices.find((choice) => choice.id !== (firstDefinition as HTMLSelectElement).value)!.id } });
    fireEvent.click(screen.getByRole("button", { name: "Check my matches" }));
    expect(screen.getByText(/Definition to revisit:/)).toBeTruthy();
    expect(view.readWork().bank.history).toHaveLength(2);
    expect(chapter.cumulativeVocabularyBank.wordIds.every((id) => Number(id.slice(2, 4)) <= chapter.number)).toBe(true);
  });

  it("does not treat learner-marked parts of speech as automated grammar certification", () => {
    render(<MarkedSentence text="The warm hotel opened quietly." adjective="warm" adverb="quietly" />);
    expect(screen.getByText("warm").getAttribute("title")).toBe("Learner-selected adjective");
    expect(screen.getByText("quietly").getAttribute("title")).toBe("Learner-selected adverb");
  });
});
