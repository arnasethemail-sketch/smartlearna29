import type { GraphicChapter } from "./data";
import type { ChapterWork } from "./types";
import { checkTargetKey, type CheckTarget } from "./checking-types";

export const CHECKER_VERSION = "free-check-v1";

export function allCheckTargets(chapter: GraphicChapter): CheckTarget[] {
  return [
    ...chapter.comprehension.map((question) => ({ kind: "comprehension" as const, id: question.id })),
    ...chapter.vocabularyPractice.map((word) => ({ kind: "vocabulary" as const, id: word.wordId })),
    { kind: "paragraph", id: chapter.id },
    ...chapter.textFeaturesHunt.boxes.map((box) => ({ kind: "feature" as const, id: box.id })),
    { kind: "bank-reflection", id: chapter.id },
  ];
}

export function checkInput(chapter: GraphicChapter, work: ChapterWork, target: CheckTarget) {
  if (work.chapterId !== chapter.id || !allCheckTargets(chapter).some((item) => checkTargetKey(item) === checkTargetKey(target))) throw new Error("This answer does not belong to the chapter.");
  switch (target.kind) {
    case "comprehension": {
      const response = work.comprehension[target.id];
      return { answer: response.answer, type: response.type };
    }
    case "vocabulary": {
      const response = work.vocabulary[target.id];
      return { definition: response.definition, synonyms: response.synonyms, sentence: response.sentence };
    }
    case "paragraph": return { sentences: work.paragraph.sentences, adjectives: work.paragraph.adjectives, adverbs: work.paragraph.adverbs, crossedOut: work.paragraph.crossedOut, bannedWords: work.teacherBannedWords };
    case "feature": {
      const response = work.features[target.id];
      return { feature: response.feature, purpose: response.purpose, help: response.help, discoveryNames: Object.fromEntries(Object.entries(work.features).map(([id, feature]) => [id, feature.feature])) };
    }
    case "bank-reflection": return { reflection: work.bank.reflection, definitions: work.bank.definitions, synonyms: work.bank.synonyms };
  }
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

/** Content identity for stale-feedback detection, never an authentication token. */
export function currentCheckFingerprint(chapter: GraphicChapter, work: ChapterWork, target: CheckTarget) {
  const text = stable({ version: CHECKER_VERSION, content: work.contentVersion, chapterId: chapter.id, target, response: checkInput(chapter, work, target) });
  let left = 2166136261, right = 2246822507;
  for (let index = 0; index < text.length; index += 1) {
    left = Math.imul(left ^ text.charCodeAt(index), 16777619);
    right = Math.imul(right ^ text.charCodeAt(index), 3266489909);
  }
  return `${CHECKER_VERSION}:${(left >>> 0).toString(16)}:${(right >>> 0).toString(16)}:${text.length}`;
}

export function checkTargetIsFilled(chapter: GraphicChapter, work: ChapterWork, target: CheckTarget) {
  checkInput(chapter, work, target);
  switch (target.kind) {
    case "comprehension": return Boolean(work.comprehension[target.id].answer.trim());
    case "vocabulary": {
      const response = work.vocabulary[target.id];
      return [response.definition, response.synonyms, response.sentence].every((text) => text.trim());
    }
    case "paragraph": return Object.values(work.paragraph.sentences).every((text) => text.trim());
    case "feature": {
      const response = work.features[target.id];
      return [response.feature, response.purpose, response.help].every((text) => text.trim());
    }
    case "bank-reflection": return Boolean(work.bank.reflection.trim());
  }
}
