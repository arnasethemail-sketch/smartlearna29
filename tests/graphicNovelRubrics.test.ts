import { describe, expect, it } from "vitest";
import { chapters } from "../src/features/graphic-novel/data";
import rubrics from "../src/features/graphic-novel/checking-rubrics.json";

const questions = chapters.flatMap((chapter) => chapter.comprehension);
const byId = new Map(rubrics.map((rubric) => [rubric.questionId, rubric]));
const ideas = (id: string) => byId.get(id)!.expectedIdeas.join(" ");

describe("Authored local comprehension-checking rubrics", () => {
  it("covers all 120 actual questions and points only to their supplied supporting panels", () => {
    expect(rubrics).toHaveLength(120);
    expect(byId.size).toBe(120);
    expect([...byId.keys()].sort()).toEqual(questions.map((question) => question.id).sort());
    for (const question of questions) {
      const rubric = byId.get(question.id)!;
      const chapter = chapters.find((item) => item.comprehension.some((item) => item.id === question.id))!;
      expect(rubric.evidencePanelIds, question.id).toEqual(question.evidencePanels);
      expect(rubric.evidencePanelIds.every((id) => chapter.panels.some((panel) => panel.id === id)), question.id).toBe(true);
      expect(rubric.revisionPrompt.trim().length, question.id).toBeGreaterThan(35);
      expect(rubric.revisionPrompt, question.id).not.toBe(question.answerGuidance);
    }
  });

  it("does not prescribe a preferred opinion or require private experiences", () => {
    for (const question of questions.filter((question) => question.number === 2 || question.number === 3)) {
      const rubric = byId.get(question.id)!;
      expect(rubric.kind, question.id).toBe("opinion");
      expect(rubric.expectedIdeas, question.id).toEqual([]);
      expect(rubric.revisionPrompt, question.id).not.toMatch(/must agree|tell us your (?:real|private)|personal disclosure/i);
      if (question.number === 3) expect(rubric.evidencePanelIds, question.id).toEqual([]);
    }
  });

  it("uses short propositions rather than teacher grading instructions for semantic comparisons", () => {
    for (const rubric of rubrics.filter((rubric) => rubric.kind !== "opinion")) {
      expect(["factual", "interpretive"], rubric.questionId).toContain(rubric.kind);
      expect(rubric.expectedIdeas.length, rubric.questionId).toBeGreaterThan(0);
      expect(rubric.expectedIdeas.length, rubric.questionId).toBeLessThanOrEqual(3);
      for (const idea of rubric.expectedIdeas) {
        expect(idea.length, rubric.questionId).toBeGreaterThan(20);
        expect(idea.length, rubric.questionId).toBeLessThan(210);
        expect(idea, rubric.questionId).not.toMatch(/\b(?:accept|require|reward|learner|grading|possible evidence)\b/i);
      }
    }
  });

  it("retains compound factual requirements and the right character's contribution", () => {
    expect(ideas("ch03-q01")).toMatch(/village.*cemetery/i);
    expect(ideas("ch03-q01")).toMatch(/thirty minutes/i);
    expect(ideas("ch23-q01")).toMatch(/black-and-pink backpack/i);
    expect(ideas("ch23-q01")).toMatch(/Jonathan.*returned/i);
    expect(ideas("ch20-q01")).toMatch(/^Winnie identifies the airport/);
    expect(ideas("ch20-q01")).not.toMatch(/Wayne identifies/);
    expect(ideas("ch18-q01")).toMatch(/rat wipes away.*makeup/i);
  });

  it("keeps a character's suggestion, a false claim, and a legend distinct from confirmed events", () => {
    expect(ideas("ch12-q01")).toMatch(/Jonathan suggests.*might explain/i);
    expect(ideas("ch13-q01")).toMatch(/^Dracula claims/);
    expect(ideas("ch16-q01")).toMatch(/legend claims.*both/i);
    expect(ideas("ch16-q01")).toMatch(/Martha died but he survived/i);
    expect(ideas("ch24-q05")).toMatch(/memories of earlier events/i);
    expect(ideas("ch24-q05")).toMatch(/prevent.*thinking.*after the ending/i);
  });
});
