import { createPracticeAttemptId } from "../practiceAttemptId";
import type { PracticeAttempt, PracticeProgressInput } from "../progress";
import type { LabSession, StoryExperience } from "./types";

export const STORY_LAB_FORMAT = "story-lab-v1";
export const STORY_LAB_PREFERENCE_ID = "story-lab-v1-preference";

export function countWords(text: string) {
  return text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function createLabSession(experience: StoryExperience): LabSession {
  return {
    version: 1,
    experienceId: experience.id,
    attemptId: createPracticeAttemptId(`story-lab-${experience.id}`),
    stageIndex: 0,
    choices: {},
    writing: "",
    ratings: { fun: null, curiosity: null, challenge: null },
  };
}

export function readLabSession(
  attempt: PracticeAttempt,
  experience: StoryExperience,
): LabSession | null {
  if (
    attempt.metadata?.format !== STORY_LAB_FORMAT ||
    attempt.metadata?.experienceId !== experience.id ||
    typeof attempt.metadata?.labState !== "string"
  ) return null;

  try {
    const state: unknown = JSON.parse(attempt.metadata.labState);
    if (!state || typeof state !== "object") return null;
    const value = state as Record<string, unknown>;
    if (
      value.version !== 1 ||
      value.experienceId !== experience.id ||
      value.attemptId !== attempt.attemptId ||
      typeof value.stageIndex !== "number" ||
      !Number.isInteger(value.stageIndex) ||
      value.stageIndex < 0 ||
      value.stageIndex > experience.scenes.length + 1 ||
      typeof value.writing !== "string" ||
      !value.choices || typeof value.choices !== "object" ||
      Array.isArray(value.choices) ||
      !value.ratings || typeof value.ratings !== "object"
    ) return null;

    const choices: Record<string, string> = {};
    for (const scene of experience.scenes) {
      const choice = (value.choices as Record<string, unknown>)[scene.id];
      if (typeof choice === "string" && scene.interaction.options.some((option) => option.id === choice)) {
        choices[scene.id] = choice;
      }
    }
    // A malformed bookmark must not skip unanswered scenes or the writing task.
    if (experience.scenes.slice(0, value.stageIndex).some((scene) => !choices[scene.id])) return null;
    if (value.stageIndex > experience.scenes.length && countWords(value.writing) < experience.writing.minWords) return null;
    const ratings = value.ratings as Record<string, unknown>;
    const readRating = (rating: unknown) =>
      typeof rating === "number" && Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
    return {
      version: 1,
      experienceId: experience.id,
      attemptId: attempt.attemptId,
      stageIndex: value.stageIndex,
      choices,
      writing: value.writing,
      ratings: {
        fun: readRating(ratings.fun),
        curiosity: readRating(ratings.curiosity),
        challenge: ratings.challenge === "too-easy" || ratings.challenge === "just-right" || ratings.challenge === "too-hard" ? ratings.challenge : null,
      },
    };
  } catch {
    return null;
  }
}

export function latestLabSession(
  attempts: PracticeAttempt[],
  experience: StoryExperience,
) {
  for (const attempt of [...attempts].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))) {
    const session = readLabSession(attempt, experience);
    if (session) return session;
  }
  return null;
}

export function labScore(experience: StoryExperience, session: LabSession) {
  return experience.scenes.filter((scene) =>
    scene.interaction.kind === "question" &&
    session.choices[scene.id] === scene.interaction.correctOptionId,
  ).length;
}

export function labProgressInput(
  experience: StoryExperience,
  session: LabSession,
): PracticeProgressInput {
  const completed = session.stageIndex > experience.scenes.length;
  return {
    attemptId: session.attemptId,
    subject: "English",
    topic: `Story Lab ${experience.label}: ${experience.title}`,
    answered: Object.keys(session.choices).length + Number(completed),
    total: experience.scenes.length + 1,
    score: labScore(experience, session),
    status: completed ? "completed" : "in-progress",
    metadata: {
      format: STORY_LAB_FORMAT,
      experienceId: experience.id,
      labState: JSON.stringify(session),
      questionTotal: experience.scenes.filter((scene) => scene.interaction.kind === "question").length,
    },
  };
}
