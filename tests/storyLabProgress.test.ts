import { describe, expect, it } from "vitest";
import { hotelExperience } from "../src/features/story-lab/hotelExperience";
import { observatoryExperience } from "../src/features/story-lab/observatoryExperience";
import {
  countWords,
  createLabSession,
  labProgressInput,
  labScore,
  latestLabSession,
  readLabSession,
} from "../src/features/story-lab/labProgress";
import type { PracticeAttempt } from "../src/features/progress";
import type { LabSession, StoryExperience } from "../src/features/story-lab/types";

const experiences = [hotelExperience, observatoryExperience];
const keeperNote = "Collect the empty plates and take them to the kitchen. Please leave the silver breakfast bell alone.";

function attemptFor(experience: StoryExperience, session: LabSession, updatedAt = "2026-10-30T12:00:00.000Z"): PracticeAttempt {
  return {
    ...labProgressInput(experience, session),
    startedAt: "2026-10-30T11:00:00.000Z",
    updatedAt,
  };
}

describe("Story Lab content", () => {
  it("gives both experiences the same complete learning structure and valid interactions", () => {
    expect(new Set(experiences.map((experience) => experience.id)).size).toBe(2);
    expect(experiences.map((experience) => experience.label)).toEqual(["A", "B"]);

    for (const experience of experiences) {
      expect(experience.scenes).toHaveLength(4);
      expect(new Set(experience.scenes.map((scene) => scene.id)).size).toBe(4);
      const questions = experience.scenes.flatMap((scene) =>
        scene.interaction.kind === "question" ? [scene.interaction] : [],
      );
      expect(questions.map((question) => question.skill).sort()).toEqual([
        "Grammar", "Reading clues", "Vocabulary",
      ]);
      expect(experience.scenes.filter((scene) => scene.interaction.kind === "choice")).toHaveLength(1);
      for (const scene of experience.scenes) {
        expect(scene.paragraphs.length).toBeGreaterThan(0);
        expect(scene.paragraphs.every((paragraph) => paragraph.trim().length > 0)).toBe(true);
        const optionIds = scene.interaction.options.map((option) => option.id);
        expect(new Set(optionIds).size).toBe(optionIds.length);
        expect(new Set(scene.interaction.options.map((option) => option.text)).size).toBe(optionIds.length);
        if (scene.interaction.kind === "question") {
          expect(optionIds).toContain(scene.interaction.correctOptionId);
          expect(scene.interaction.explanation.trim()).not.toBe("");
        } else {
          expect(scene.interaction.options.every((option) => option.response && option.clue)).toBe(true);
        }
      }
      expect(experience.writing.minWords).toBe(15);
      expect(experience.ending.paragraphs.length).toBeGreaterThan(0);
      expect(experience.ending.teaser.trim()).not.toBe("");
    }
  });
});

describe("Story Lab progress", () => {
  it("round-trips a bookmark, chosen route, writing draft, and ratings through practice metadata", () => {
    const session = createLabSession(hotelExperience);
    session.choices[hotelExperience.scenes[0].id] = hotelExperience.scenes[0].interaction.options[1].id;
    session.stageIndex = 1;
    session.writing = "Please collect the plates.";
    session.ratings = { fun: 4, curiosity: 5, challenge: "just-right" };

    expect(readLabSession(attemptFor(hotelExperience, session), hotelExperience)).toEqual(session);
    expect(labProgressInput(hotelExperience, session)).toMatchObject({
      subject: "English",
      answered: 1,
      total: 5,
      score: 0,
      status: "in-progress",
      metadata: { experienceId: "hotel", questionTotal: 3 },
    });
  });

  it("rejects corrupt or foreign bookmarks and prevents skipped interactions or writing", () => {
    const session = createLabSession(hotelExperience);
    const valid = attemptFor(hotelExperience, session);
    expect(readLabSession(valid, observatoryExperience)).toBeNull();
    expect(readLabSession({ ...valid, metadata: { ...valid.metadata, labState: "not JSON" } }, hotelExperience)).toBeNull();

    const invalidStates = [
      { ...session, attemptId: "another-attempt" },
      { ...session, stageIndex: -1 },
      { ...session, stageIndex: 1.5 },
      { ...session, stageIndex: 99 },
      { ...session, stageIndex: 1, choices: {} },
      { ...session, stageIndex: 1, choices: { [hotelExperience.scenes[0].id]: "missing-option" } },
      {
        ...session,
        stageIndex: 5,
        writing: "Too short",
        choices: Object.fromEntries(hotelExperience.scenes.map((scene) => [scene.id, scene.interaction.options[0].id])),
      },
    ];
    for (const state of invalidStates) {
      expect(readLabSession({
        ...valid,
        metadata: { ...valid.metadata, labState: JSON.stringify(state) },
      }, hotelExperience)).toBeNull();
    }
  });

  it("sanitizes invalid ratings and falls back past a corrupt newer bookmark", () => {
    const session = createLabSession(hotelExperience);
    const saved = attemptFor(hotelExperience, session);
    const invalidRatings = {
      ...saved,
      metadata: {
        ...saved.metadata,
        labState: JSON.stringify({ ...session, ratings: { fun: 6, curiosity: 1.5, challenge: "unknown" } }),
      },
    };
    expect(readLabSession(invalidRatings, hotelExperience)?.ratings).toEqual({ fun: null, curiosity: null, challenge: null });
    const corruptNewer = {
      ...saved,
      updatedAt: "2026-10-30T13:00:00.000Z",
      metadata: { ...saved.metadata, labState: "{" },
    };
    expect(latestLabSession([saved, corruptNewer], hotelExperience)).toEqual(session);
  });

  it("counts only English questions toward score and allows completion after wrong answers", () => {
    const session = createLabSession(hotelExperience);
    for (const scene of hotelExperience.scenes) {
      session.choices[scene.id] = scene.interaction.kind === "question"
        ? scene.interaction.options.find((option) => option.id !== scene.interaction.correctOptionId)!.id
        : scene.interaction.options[0].id;
    }
    session.stageIndex = hotelExperience.scenes.length + 1;
    session.writing = keeperNote;

    expect(labScore(hotelExperience, session)).toBe(0);
    expect(labProgressInput(hotelExperience, session)).toMatchObject({ answered: 5, total: 5, score: 0, status: "completed" });
    expect(readLabSession(attemptFor(hotelExperience, session), hotelExperience)).toEqual(session);
  });

  it("counts natural writing without treating punctuation or repeated whitespace as words", () => {
    expect(countWords("  Nia’s well-written note\nkeeps  Beacon 7 safe. ")).toBe(7);
    expect(countWords("... — !")).toBe(0);
    expect(countWords(keeperNote)).toBeGreaterThanOrEqual(15);
  });
});
