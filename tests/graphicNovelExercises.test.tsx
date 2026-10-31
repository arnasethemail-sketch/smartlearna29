// @vitest-environment jsdom

import { useState } from "react";
import type { ComponentType } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { chapters } from "../src/features/graphic-novel/data";
import type { GraphicChapter } from "../src/features/graphic-novel/data";
import { artFor, assetUrl } from "../src/features/graphic-novel/artwork";
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
    expect(screen.getAllByRole("textbox", { name: "1. What feature did you spot?" })).toHaveLength(4);
    expect(screen.getAllByRole("textbox", { name: "2. What is its job?" })).toHaveLength(4);
    expect(screen.getAllByRole("textbox", { name: "3. What did you learn from it?" })).toHaveLength(4);
    expect(screen.queryByText("An example to compare, not copy")).toBeNull();
    for (const input of screen.getAllByRole("textbox")) expect((input as HTMLTextAreaElement).value).toBe("");
  });

  it("keeps the illustrated source beside each discovery and lets a learner inspect all eight panels without losing answers", () => {
    const chapter = chapters[0];
    const initial = createChapterWork(chapter);
    initial.panelIndex = 6;
    initial.page = 1;
    const view = renderSection(TextFeatures, chapter, initial);
    const discoveries = chapter.textFeaturesHunt.boxes.map((box) => screen.getByRole("article", { name: `Discovery ${box.number}` }));

    discoveries.forEach((discovery, index) => {
      const panel = chapter.panels[index];
      expect(within(discovery).getByRole("img", { name: artFor(panel.id)!.alt })).toBeTruthy();
      expect(within(discovery).getByText(chapter.title)).toBeTruthy();
      const selector = within(discovery).getByRole("combobox", { name: `Story panel for discovery ${index + 1}` });
      expect(within(selector).getAllByRole("option").map((option) => option.textContent)).toEqual(chapter.panels.map((item) => `Panel ${item.number} of 8`));
    });

    const first = within(discoveries[0]);
    const drafts = [
      ["1. What feature did you spot?", "Narration box"],
      ["2. What is its job?", "It explains what happened before the characters spoke."],
      ["3. What did you learn from it?", "The first narration box tells me when the story begins."],
    ];
    drafts.forEach(([name, value]) => fireEvent.change(first.getByRole("textbox", { name }), { target: { value } }));
    const selector = first.getByRole("combobox", { name: "Story panel for discovery 1" });

    for (const panel of chapter.panels) {
      const option = within(selector).getByRole("option", { name: `Panel ${panel.number} of 8` }) as HTMLOptionElement;
      fireEvent.change(selector, { target: { value: option.value } });
      const image = first.getByRole("img", { name: artFor(panel.id)!.alt });
      expect(image.getAttribute("src")).toBe(assetUrl(artFor(panel.id)!.src));
      expect(first.getByText(panel.narration)).toBeTruthy();
      for (const line of panel.dialogue) {
        expect(first.getAllByText(line.speaker).length).toBeGreaterThan(0);
        expect(first.getByText(line.text)).toBeTruthy();
      }
    }

    drafts.forEach(([name, value]) => expect((first.getByRole("textbox", { name }) as HTMLTextAreaElement).value).toBe(value));
    const saved = view.readWork();
    const response = saved.features[chapter.textFeaturesHunt.boxes[0].id];
    expect([response.feature, response.purpose, response.help]).toEqual(drafts.map(([, value]) => value));
    expect(saved.panelIndex).toBe(6);
    expect(saved.page).toBe(1);
    expect(saved.readingComplete).toBe(initial.readingComplete);
  });

  it("offers progressive clues for the panel being viewed without filling in the learner's answers", () => {
    const view = renderSection(TextFeatures);
    const first = within(screen.getByRole("article", { name: "Discovery 1" }));
    expect(first.queryByRole("status")).toBeNull();
    fireEvent.click(first.getByRole("button", { name: "Give me a clue for discovery 1" }));
    expect(first.getByRole("status").textContent).toContain("CLUE 1 OF 3 · PANEL 1");
    expect(first.getByRole("status").textContent).toContain("cream-coloured narration box");
    fireEvent.click(first.getByRole("button", { name: "Another clue for discovery 1" }));
    expect(first.getByRole("status").textContent).toContain("CLUE 2 OF 3");
    fireEvent.click(first.getByRole("button", { name: "Another clue for discovery 1" }));
    expect(first.getByRole("status").textContent).toContain("CLUE 3 OF 3");
    expect(first.queryByRole("button", { name: "Another clue for discovery 1" })).toBeNull();
    expect(first.getAllByRole("textbox").every((input) => !(input as HTMLTextAreaElement).value)).toBe(true);

    fireEvent.change(first.getByRole("combobox", { name: "Story panel for discovery 1" }), { target: { value: "ch01-p08" } });
    expect(first.getByRole("status").textContent).toContain("CLUE 1 OF 3 · PANEL 8");
    expect(view.readWork().features[chapters[0].textFeaturesHunt.boxes[0].id].showHelp).toBe(true);
    fireEvent.click(first.getByRole("button", { name: "Hide clues for discovery 1" }));
    expect(first.queryByRole("status")).toBeNull();
  });

  it("uses the selected character's actual words for a dialogue clue", () => {
    renderSection(TextFeatures);
    const second = within(screen.getByRole("article", { name: "Discovery 2" }));
    fireEvent.click(second.getByRole("button", { name: "Give me a clue for discovery 2" }));
    fireEvent.click(second.getByRole("button", { name: "Another clue for discovery 2" }));
    expect(second.getByRole("status").textContent).toContain(chapters[0].panels[1].dialogue[0].text);
    fireEvent.change(second.getByRole("combobox", { name: "Story panel for discovery 2" }), { target: { value: "ch01-p03" } });
    fireEvent.click(second.getByRole("button", { name: "Another clue for discovery 2" }));
    expect(second.getByRole("status").textContent).toContain("Mavis says");
    expect(second.getByRole("status").textContent).toContain("What is out there?");
  });

  it("counts written discoveries honestly and keeps practice choices separate from saved chapter work", () => {
    const view = renderSection(TextFeatures);
    const casebook = within(screen.getByLabelText("Your detective casebook"));
    const first = within(screen.getByRole("article", { name: "Discovery 1" }));
    const progress = casebook.getByRole("progressbar", { name: "Discoveries written" });
    expect(progress.getAttribute("value")).toBe("0");
    first.getAllByRole("textbox").slice(0, 2).forEach((input) => fireEvent.change(input, { target: { value: "A short draft." } }));
    expect(progress.getAttribute("value")).toBe("0");
    fireEvent.change(first.getByRole("textbox", { name: "3. What did you learn from it?" }), { target: { value: "I learn a story detail." } });
    expect(casebook.getByRole("status").textContent).toBe("1 of 4 discoveries written");
    expect(progress.getAttribute("value")).toBe("1");
    expect(view.readWork().automaticChecks).toEqual({});
    fireEvent.click(screen.getByText("Try one quick clue"));
    fireEvent.click(screen.getByRole("button", { name: "I learn that Pip has noticed the missing mooncake." }));
    expect(progress.getAttribute("value")).toBe("1");
    expect(view.readWork().automaticChecks).toEqual({});
  });

  it("shows the native time label beside the first chapter's source image", () => {
    renderSection(TextFeatures);
    const discovery = within(screen.getByRole("article", { name: "Discovery 1" }));
    expect(discovery.getByText("1895")).toBeTruthy();
    expect(discovery.getByText(chapters[0].panels[0].narration)).toBeTruthy();
  });

  it("keeps the flying-table object labels available in the worksheet source", () => {
    const chapter = chapters[13];
    renderSection(TextFeatures, chapter);
    const discovery = within(screen.getByRole("article", { name: "Discovery 2" }));
    expect(discovery.getByRole("img", { name: artFor("ch14-p02")!.alt })).toBeTruthy();
    expect(discovery.getByLabelText("Table 57")).toBeTruthy();
    expect(discovery.getByText("Position 23")).toBeTruthy();
    expect(discovery.getByText("Table 57 moves to position 23.")).toBeTruthy();
  });

  it("shows the final chapter's recap label when its source panel is selected", () => {
    const chapter = chapters[23];
    renderSection(TextFeatures, chapter);
    const discovery = within(screen.getByRole("article", { name: "Discovery 1" }));
    const selector = discovery.getByRole("combobox", { name: "Story panel for discovery 1" });
    const option = within(selector).getByRole("option", { name: "Panel 5 of 8" }) as HTMLOptionElement;
    fireEvent.change(selector, { target: { value: option.value } });
    expect(discovery.getByRole("img", { name: artFor("ch24-p05")!.alt })).toBeTruthy();
    expect(discovery.getByText("LOOKING BACK")).toBeTruthy();
    expect(discovery.getByText(chapter.panels[4].narration)).toBeTruthy();
  });

  it("keeps source labels unique when two discoveries show the same panel", () => {
    const view = renderSection(TextFeatures);
    const second = within(screen.getByRole("article", { name: "Discovery 2" }));
    const selector = second.getByRole("combobox", { name: "Story panel for discovery 2" });
    const option = within(selector).getByRole("option", { name: "Panel 1 of 8" }) as HTMLOptionElement;
    fireEvent.change(selector, { target: { value: option.value } });

    const firstHeading = within(screen.getByRole("article", { name: "Discovery 1" })).getByRole("heading", { name: "Panel 1" });
    const secondHeading = second.getByRole("heading", { name: "Panel 1" });
    expect(firstHeading.id).not.toBe("");
    expect(secondHeading.id).not.toBe("");
    expect(firstHeading.id).not.toBe(secondHeading.id);
    const ids = [...view.container.querySelectorAll("[id]")].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
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
