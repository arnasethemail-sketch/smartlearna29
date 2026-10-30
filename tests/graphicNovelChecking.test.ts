import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chapters } from "../src/features/graphic-novel/data";
import { allCheckTargets, checkTargetIsFilled, checkTargetKey, checkWrittenResponse, currentCheckFingerprint } from "../src/features/graphic-novel/checking";
import { assessIdeas } from "../src/features/graphic-novel/localSemanticModel";
import { createChapterWork } from "../src/features/graphic-novel/progress";
import type { GraphicChapter } from "../src/features/graphic-novel/data";
import type { CheckTarget } from "../src/features/graphic-novel/checking-types";
import type { ChapterWork } from "../src/features/graphic-novel/types";

// These tests check orchestration and its limits. They do not claim to validate
// the real model's understanding; its actual paraphrase quality is tested separately.
vi.mock("../src/features/graphic-novel/localSemanticModel", () => ({ assessIdeas: vi.fn() }));

const slots = ["topicSentence", "detail1", "detail2", "detail3", "conclusion"] as const;
const chapter = chapters[0];
const questionTarget: CheckTarget = { kind: "comprehension", id: chapter.comprehension[0].id };
const paragraphTarget: CheckTarget = { kind: "paragraph", id: chapter.id };

function writtenFixture(source: GraphicChapter = chapter) {
  const work = createChapterWork(source);
  source.comprehension.forEach((question) => {
    work.comprehension[question.id].answer = question.answerGuidance;
    work.comprehension[question.id].type = question.suggestedType;
  });
  source.vocabularyPractice.forEach((word) => Object.assign(work.vocabulary[word.wordId], {
    definition: word.teacherWord.definition, synonyms: word.teacherWord.synonyms.join(", "), sentence: word.teacherWord.exampleSentence,
  }));
  const modelSentences = source.hamburgerParagraph.modelParagraphMarked.match(/[^.!?]+[.!?]/g)!;
  slots.forEach((slot, index) => {
    const sentence = modelSentences[index].trim();
    work.paragraph.sentences[slot] = sentence.replace(/\[(?:adj|adv):([^\]]+)\]/g, "$1");
    work.paragraph.adjectives[slot] = sentence.match(/\[adj:([^\]]+)\]/)?.[1] ?? "";
    work.paragraph.adverbs[slot] = sentence.match(/\[adv:([^\]]+)\]/)?.[1] ?? "";
  });
  work.paragraph.crossedOut = [source.hamburgerParagraph.irrelevantSlot];
  source.textFeaturesHunt.boxes.forEach((box, index) => Object.assign(work.features[box.id], {
    feature: source.textFeaturesHunt.teacherExamples[index].feature,
    purpose: source.textFeaturesHunt.teacherExamples[index].purpose,
    help: source.textFeaturesHunt.teacherExamples[index].comprehensionHelp,
  }));
  work.bank.reflection = `I checked ${source.vocabularyPractice[0].word} because its definition helped me choose a matching word.`;
  return work;
}

describe("Free written-check orchestration", () => {
  beforeEach(() => {
    vi.mocked(assessIdeas).mockReset();
    vi.mocked(assessIdeas).mockImplementation(async (_premise, ideas) => ideas.map(() => .95));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("checks all 14 targets using local modules without mutating answers or calling an API", async () => {
    const fetch = vi.fn(() => { throw new Error("No API calls are allowed in this test."); });
    vi.stubGlobal("fetch", fetch);
    const work = writtenFixture(); const before = JSON.stringify(work);
    const targets = allCheckTargets(chapter);
    expect(targets).toHaveLength(14);
    expect(new Set(targets.map(checkTargetKey)).size).toBe(14);
    for (const target of targets) {
      expect(checkTargetIsFilled(chapter, work, target)).toBe(true);
      const report = await checkWrittenResponse(chapter, work, target);
      expect(report.targetKey).toBe(checkTargetKey(target));
      expect(report.inputFingerprint).toBe(currentCheckFingerprint(chapter, work, target));
      expect(Object.keys(report.dimensions).sort()).toEqual(["clarity", "conventions", "meaning", "support"]);
      expect(["ready", "developing", "revise", "uncertain"]).toContain(report.overall);
    }
    expect(JSON.stringify(work)).toBe(before);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("asks for a blank answer before running the model and rejects a mismatched target", async () => {
    const work = createChapterWork(chapter);
    const report = await checkWrittenResponse(chapter, work, questionTarget);
    expect(report.overall).toBe("revise");
    expect(assessIdeas).not.toHaveBeenCalled();
    await expect(checkWrittenResponse(chapter, work, { kind: "comprehension", id: "ch99-q01" })).rejects.toThrow("does not belong");
    await expect(checkWrittenResponse(chapters[1], work, questionTarget)).rejects.toThrow("does not belong");
  });

  it("keeps unmatched meaning uncertain and keeps a classification alternative advisory", async () => {
    const work = writtenFixture();
    vi.mocked(assessIdeas).mockImplementation(async (_premise, ideas) => ideas.map(() => .2));
    work.comprehension[questionTarget.id].type = "Think and Search";
    const report = await checkWrittenResponse(chapter, work, questionTarget);
    expect(report.dimensions.meaning.rating).toBe("uncertain");
    expect(report.overall).toBe("uncertain");
    expect(report.nextSteps.some((step) => step.includes("Another type can overlap"))).toBe(true);
    expect(report.summary).not.toMatch(/wrong|incorrect/i);
  });

  it("does not turn a well-supported personal or hypothetical opinion into a certified fact", async () => {
    const question = chapter.comprehension.find((item) => item.suggestedType === "On My Own")!;
    const work = writtenFixture();
    work.comprehension[question.id].answer = "I would explore with a friend because we could help each other if we became lost.";
    const report = await checkWrittenResponse(chapter, work, { kind: "comprehension", id: question.id });
    expect(report.dimensions.meaning.rating).toBe("uncertain");
    expect(report.dimensions.support.rating).toBe("ready");
    expect(report.overall).not.toBe("revise");
  });

  it.each(["failure", "invalid-score"])("fails safely when local inference returns %s", async (mode) => {
    const work = writtenFixture();
    if (mode === "failure") vi.mocked(assessIdeas).mockRejectedValue(new Error("Model unavailable"));
    else vi.mocked(assessIdeas).mockImplementation(async () => [Number.NaN]);
    const report = await checkWrittenResponse(chapter, work, questionTarget);
    expect(report.method).toBe("local-rules-v1");
    expect(report.dimensions.meaning.rating).toBe("uncertain");
    expect(report.overall).not.toBe("ready");
    expect(work.comprehension[questionTarget.id].answer).toBe(chapter.comprehension[0].answerGuidance);
  });

  it("keeps long answers intact while declining to certify text beyond the semantic-check limit", async () => {
    const work = writtenFixture();
    work.comprehension[questionTarget.id].answer = "The builder warned against bright fires because people could find the hidden hotel. ".repeat(130);
    const before = work.comprehension[questionTarget.id].answer;
    const report = await checkWrittenResponse(chapter, work, questionTarget);
    expect(report.dimensions.meaning.rating).toBe("uncertain");
    expect(report.dimensions.support.rating).toBe("uncertain");
    expect(report.dimensions.meaning.feedback).toContain("full draft is saved");
    expect(assessIdeas).not.toHaveBeenCalled();
    expect(work.comprehension[questionTarget.id].answer).toBe(before);
  });

  it("invalidates a check after changing the selected question type, while excluding unrelated checklist/history edits", () => {
    const work = writtenFixture(); const initial = currentCheckFingerprint(chapter, work, questionTarget);
    work.comprehension[questionTarget.id].checks.R = true;
    work.comprehension[questionTarget.id].history.push("An earlier draft.");
    expect(currentCheckFingerprint(chapter, work, questionTarget)).toBe(initial);
    work.comprehension[questionTarget.id].type = "Author and You";
    expect(currentCheckFingerprint(chapter, work, questionTarget)).not.toBe(initial);
  });

  it("checks current vocabulary writing without checking its spelling-history or ID metadata as prose", async () => {
    const work = writtenFixture(); const word = chapter.vocabularyPractice[0];
    const target: CheckTarget = { kind: "vocabulary", id: word.wordId };
    const before = currentCheckFingerprint(chapter, work, target);
    work.vocabulary[word.wordId].history.push({ definition: "faverite qwertzzz", synonyms: "qwertzzz", sentence: "qwertzzz", spellings: Array(5).fill("qwertzzz"), savedAt: "not prose" });
    work.vocabulary[word.wordId].spellings[0] = "qwertzzz";
    expect(currentCheckFingerprint(chapter, work, target)).toBe(before);
    const report = await checkWrittenResponse(chapter, work, target);
    expect(report.dimensions.conventions.rating).toBe("ready");
    expect(report.nextSteps.join(" ")).not.toMatch(/qwertzzz|ch01-word1|not prose/);
  });

  it("does not fully approve a paragraph that omits its required practice word", async () => {
    const work = writtenFixture();
    work.paragraph.sentences.topicSentence = "The thoughtful father carefully planned a home for Mavis.";
    work.paragraph.adjectives.topicSentence = "thoughtful";
    work.paragraph.sentences.detail3 = work.paragraph.sentences.detail3.replace("curious", "interested");
    const report = await checkWrittenResponse(chapter, work, paragraphTarget);
    expect(report.nextSteps.join(" ")).toContain("practice words");
    expect(report.overall).not.toBe("ready");
  });

  it("does not fully approve an unconfirmed conclusion after the other model checks pass", async () => {
    const work = writtenFixture(); const conclusion = work.paragraph.sentences.conclusion;
    vi.mocked(assessIdeas).mockImplementation(async (premise, ideas) => ideas.map(() => premise === conclusion ? .15 : .95));
    const report = await checkWrittenResponse(chapter, work, paragraphTarget);
    expect(report.nextSteps.join(" ")).toContain("concluding sentence");
    expect(report.overall).not.toBe("ready");
  });

  it("continues to flag the original grammar construction after a small descriptive edit", async () => {
    const work = writtenFixture();
    work.paragraph.sentences.detail1 = "He carefully choose a quiet hidden place in the forest.";
    work.paragraph.adjectives.detail1 = "hidden"; work.paragraph.adverbs.detail1 = "carefully";
    const report = await checkWrittenResponse(chapter, work, paragraphTarget);
    expect(report.dimensions.conventions.rating).not.toBe("ready");
    expect(report.nextSteps.join(" ")).toContain("grammar");
  });

  it("does not demand the original verb correction after a valid auxiliary-verb revision", async () => {
    const work = writtenFixture();
    work.paragraph.sentences.detail1 = "He did carefully choose a hidden place in the forest.";
    const report = await checkWrittenResponse(chapter, work, paragraphTarget);
    expect(report.dimensions.conventions.rating).toBe("ready");
    expect(report.nextSteps.join(" ")).not.toContain("original grammar issue");
  });

  it("cannot use a negated synonym substring to bypass a failed meaning comparison", async () => {
    const work = writtenFixture(); const word = chapter.vocabularyPractice[0];
    work.vocabulary[word.wordId].synonyms = "not shelter";
    vi.mocked(assessIdeas).mockImplementation(async (premise, ideas) => ideas.map(() => premise.includes("not shelter") ? .05 : .95));
    const report = await checkWrittenResponse(chapter, work, { kind: "vocabulary", id: word.wordId });
    expect(report.dimensions.meaning.rating).toBe("uncertain");
    expect(report.overall).not.toBe("ready");
  });

  it.each(["No speech bubbles", "Italic text", "Italic chapter title"])("does not assert an unverified feature is present: %s", async (feature) => {
    const work = writtenFixture(); const id = chapter.textFeaturesHunt.boxes[0].id;
    work.features[id].feature = feature;
    const report = await checkWrittenResponse(chapter, work, { kind: "feature", id });
    expect(report.dimensions.meaning.rating).not.toBe("ready");
  });

  it("does not fully approve repeated discoveries and stales another box after its feature name changes", async () => {
    const work = writtenFixture(); const [first, second] = chapter.textFeaturesHunt.boxes;
    const target: CheckTarget = { kind: "feature", id: first.id };
    const before = currentCheckFingerprint(chapter, work, target);
    work.features[second.id].feature = work.features[first.id].feature;
    expect(currentCheckFingerprint(chapter, work, target)).not.toBe(before);
    const report = await checkWrittenResponse(chapter, work, target);
    expect(report.nextSteps.join(" ")).toContain("four different discoveries");
    expect(report.dimensions.meaning.rating).not.toBe("ready");
    expect(report.overall).not.toBe("ready");
  });

  it("recognises two names for the same text feature as a repeated discovery", async () => {
    const work = writtenFixture(); const [first, second] = chapter.textFeaturesHunt.boxes;
    work.features[second.id].feature = "Heading";
    const report = await checkWrittenResponse(chapter, work, { kind: "feature", id: first.id });
    expect(report.dimensions.meaning.rating).toBe("developing");
    expect(report.nextSteps.join(" ")).toContain("four different discoveries");
  });

  it("accepts a reflection about an earlier word that is still in the cumulative bank", async () => {
    const source = chapters[1]; const work = writtenFixture(source);
    expect(source.vocabularyPractice.some((word) => word.word === "refuge")).toBe(false);
    work.bank.reflection = "I chose refuge because its meaning is a safe place that offers shelter.";
    const report = await checkWrittenResponse(source, work, { kind: "bank-reflection", id: source.id });
    expect(report.dimensions.support.rating).toBe("ready");
    expect(report.nextSteps.join(" ")).not.toContain("Name one vocabulary word");
  });
});
