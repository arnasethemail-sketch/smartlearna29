import { useCallback, useRef, useState } from "react";
import { useLearningProgress } from "../progress";
import type { LearningProgressSnapshot, PracticeAttempt } from "../progress";
import { chapters, graphicCourse, type GraphicChapter } from "./data";
import type { ChapterWork, ParagraphSlot, WritingReview } from "./types";

export const GRAPHIC_PROGRESS_FORMAT = "graphic-novel-chapter-v1";
export const PARAGRAPH_SLOTS: ParagraphSlot[] = ["topicSentence", "detail1", "detail2", "detail3", "conclusion"];

export function emptyWritingReview(): WritingReview {
  return { meaning: "", support: "", clarity: "", conventions: "", notes: "", reviewer: "" };
}

function shuffleIds(ids: string[], random = Math.random) {
  const shuffled = [...ids];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

const blankParagraphStrings = () => Object.fromEntries(PARAGRAPH_SLOTS.map((slot) => [slot, ""])) as Record<ParagraphSlot, string>;

export function createChapterWork(chapter: GraphicChapter, random = Math.random): ChapterWork {
  return {
    chapterId: chapter.id,
    contentVersion: graphicCourse.config.contentVersion,
    revision: 0,
    section: 0,
    page: 0,
    readingView: "page",
    panelIndex: 0,
    status: "in-progress",
    completedOnce: false,
    readingComplete: false,
    largeText: false,
    comprehension: Object.fromEntries(chapter.comprehension.map((question) => [question.id, {
      answer: "", type: "", checks: Object.fromEntries([...question.checklistLabels, "PN", "HL", "QP"].map((label) => [label, false])), history: [], help: false, review: emptyWritingReview(),
    }])),
    vocabulary: Object.fromEntries(chapter.vocabularyPractice.map((word) => [word.wordId, {
      definition: "", synonyms: "", sentence: "", spellings: Array(5).fill(""), spellingChecked: Array(5).fill(false), covered: false, help: false, history: [], review: emptyWritingReview(),
    }])),
    paragraph: {
      sentences: Object.fromEntries(PARAGRAPH_SLOTS.map((slot) => [slot, chapter.hamburgerParagraph[slot]])) as Record<ParagraphSlot, string>,
      crossedOut: [], adjectives: blankParagraphStrings(), adverbs: blankParagraphStrings(), history: [], help: false, review: emptyWritingReview(),
    },
    features: Object.fromEntries(chapter.textFeaturesHunt.boxes.map((box) => [box.id, {
      feature: "", purpose: "", help: "", showHelp: false, history: [], review: emptyWritingReview(),
    }])),
    bank: {
      definitions: Object.fromEntries(chapter.cumulativeVocabularyBank.wordIds.map((id) => [id, ""])),
      synonyms: Object.fromEntries(chapter.cumulativeVocabularyBank.wordIds.map((id) => [id, ""])),
      definitionOrder: shuffleIds(chapter.cumulativeVocabularyBank.definitionChoices.map((choice) => choice.id), random),
      synonymOrder: shuffleIds(chapter.cumulativeVocabularyBank.synonymChoices.map((choice) => choice.id), random),
      reflection: "", submitted: false, history: [],
    },
    checklistLegend: { ...graphicCourse.config.worksheetPolicy.optionalProvisionalHelp },
    teacherBannedWords: [],
    submittedSnapshots: [],
    review: { ...emptyWritingReview(), parentOverride: false },
    updatedAt: new Date(0).toISOString(),
  };
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Fill newly introduced fields without replacing earlier answers. Only types
// present in the current schema are accepted; text is never trimmed/truncated.
function withDefaults<T>(defaults: T, value: unknown): T {
  if (Array.isArray(defaults)) {
    if (!Array.isArray(value)) return copy(defaults);
    if (defaults.length) return defaults.map((item, index) => withDefaults(item, value[index])) as T;
    return value.filter((item) => typeof item === "string" || record(item)).map(copy) as T;
  }
  if (record(defaults)) {
    const source = record(value) ? value : {};
    return Object.fromEntries(Object.entries(defaults).map(([key, item]) => [key, withDefaults(item, source[key])])) as T;
  }
  if (typeof defaults === "number") return (typeof value === "number" && Number.isFinite(value) ? value : defaults) as T;
  return (typeof value === typeof defaults ? value : defaults) as T;
}

function validOrder(value: string[], expected: string[]) {
  return value.length === expected.length && new Set(value).size === expected.length && value.every((id) => expected.includes(id));
}

function revisionHistory<T>(entries: unknown[], defaults: T, hasContent: (entry: T) => boolean): T[] {
  return entries.filter(record).map((entry) => withDefaults(defaults, entry)).filter(hasContent);
}

export function normalizeChapterWork(chapter: GraphicChapter, value: unknown): ChapterWork | null {
  if (!record(value) || value.chapterId !== chapter.id) return null;
  const defaults = createChapterWork(chapter, () => 0.5);
  const work = withDefaults(defaults, value);
  work.section = Math.min(5, Math.max(0, Math.floor(work.section)));
  work.page = Math.min(1, Math.max(0, Math.floor(work.page)));
  work.panelIndex = Math.min(7, Math.max(0, Math.floor(work.panelIndex)));
  work.revision = Math.max(0, Math.floor(work.revision));
  work.readingView = work.readingView === "panel" ? "panel" : "page";
  work.status = ["submitted", "reviewed"].includes(work.status) ? work.status : "in-progress";
  if (!Number.isFinite(Date.parse(work.updatedAt))) work.updatedAt = defaults.updatedAt;
  work.teacherBannedWords = work.teacherBannedWords.filter((word) => typeof word === "string");
  // Historical entries need their own schemas: an empty default array cannot
  // establish the types of nested fields from an older or damaged record.
  // Repair usable drafts and ignore unusable entries without losing current work.
  work.submittedSnapshots = work.submittedSnapshots.filter((item) => typeof item === "string").flatMap((saved) => {
    try {
      const parsed: unknown = JSON.parse(saved);
      if (!record(parsed)) return [];
      const previous = normalizeChapterWork(chapter, { ...parsed, submittedSnapshots: [] });
      return previous ? [JSON.stringify(previous)] : [];
    } catch { return []; }
  });
  work.paragraph.crossedOut = work.paragraph.crossedOut.filter((slot) => PARAGRAPH_SLOTS.includes(slot as ParagraphSlot));
  for (const response of Object.values(work.comprehension)) response.history = response.history.filter((answer) => typeof answer === "string");
  for (const response of Object.values(work.vocabulary)) {
    response.history = revisionHistory(response.history, { definition: "", synonyms: "", sentence: "", spellings: Array(5).fill("") as string[], savedAt: "" },
      (draft) => [draft.definition, draft.synonyms, draft.sentence, ...draft.spellings].some((text) => text.trim()));
  }
  work.paragraph.history = revisionHistory(work.paragraph.history, {
    sentences: blankParagraphStrings(), adjectives: blankParagraphStrings(), adverbs: blankParagraphStrings(), crossedOut: [] as string[], savedAt: "",
  }, (draft) => [...Object.values(draft.sentences), ...Object.values(draft.adjectives), ...Object.values(draft.adverbs)].some((text) => text.trim()))
    .map((draft) => ({ ...draft, crossedOut: draft.crossedOut.filter((slot) => PARAGRAPH_SLOTS.includes(slot as ParagraphSlot)) }));
  for (const response of Object.values(work.features)) {
    response.history = revisionHistory(response.history, { feature: "", purpose: "", help: "", savedAt: "" },
      (draft) => [draft.feature, draft.purpose, draft.help].some((text) => text.trim()));
  }
  work.bank.history = revisionHistory(work.bank.history, {
    definitions: { ...defaults.bank.definitions }, synonyms: { ...defaults.bank.synonyms }, reflection: "", savedAt: "",
  }, (draft) => [...Object.values(draft.definitions), ...Object.values(draft.synonyms), draft.reflection].some((text) => text.trim()));
  if (!validOrder(work.bank.definitionOrder, defaults.bank.definitionOrder)) work.bank.definitionOrder = defaults.bank.definitionOrder;
  if (!validOrder(work.bank.synonymOrder, defaults.bank.synonymOrder)) work.bank.synonymOrder = defaults.bank.synonymOrder;
  return work;
}

export function graphicAttemptId(chapterId: string) {
  return `${GRAPHIC_PROGRESS_FORMAT}:${graphicCourse.config.collectionId}:${chapterId}`;
}

export function readGraphicWorks(snapshot: LearningProgressSnapshot): Record<string, ChapterWork> {
  const result: Record<string, ChapterWork> = {};
  const attempts = [...Object.values(snapshot.activeAttempts), ...snapshot.completedAttempts].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  for (const attempt of attempts) {
    if (attempt.metadata?.format !== GRAPHIC_PROGRESS_FORMAT || typeof attempt.metadata.work !== "string") continue;
    const chapter = chapters.find((item) => graphicAttemptId(item.id) === attempt.attemptId);
    if (!chapter) continue;
    try {
      const work = normalizeChapterWork(chapter, JSON.parse(attempt.metadata.work));
      if (work) result[chapter.id] = work;
    } catch { /* A malformed feature record must not damage any other progress. */ }
  }
  return result;
}

export function normalizeSpelling(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("en-CA").trim().replace(/^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu, "");
}

const standardVariants = [
  ["cooperate", "co-operate"], ["cooperation", "co-operation"],
  ["color", "colour"], ["favorite", "favourite"], ["center", "centre"],
  ["gray", "grey"], ["behavior", "behaviour"], ["honor", "honour"],
  ["neighbor", "neighbour"], ["defense", "defence"], ["traveling", "travelling"],
  ["organize", "organise"], ["recognize", "recognise"],
];

export function spellingMatches(expected: string, actual: string) {
  const target = normalizeSpelling(expected);
  const answer = normalizeSpelling(actual);
  return Boolean(target && answer) && (target === answer || standardVariants.some((pair) => pair.includes(target) && pair.includes(answer)));
}

export function countBankMatches(chapter: GraphicChapter, work: ChapterWork) {
  const bank = chapter.cumulativeVocabularyBank;
  let correct = 0;
  for (const wordId of bank.wordIds) {
    if (bank.definitionChoices.some((choice) => choice.id === work.bank.definitions[wordId] && choice.correctWordId === wordId)) correct += 1;
    if (bank.synonymChoices.some((choice) => choice.id === work.bank.synonyms[wordId] && choice.correctWordId === wordId)) correct += 1;
  }
  return { correct, total: bank.wordIds.length * 2 };
}

function filled(value: string | undefined) { return Boolean(value?.trim()); }

export function completionDetails(chapter: GraphicChapter, work: ChapterWork) {
  const missing: string[] = [];
  if (!work.readingComplete) missing.push("Read both graphic-novel pages.");
  for (const question of chapter.comprehension) {
    const response = work.comprehension[question.id];
    if (!filled(response?.answer) || !question.readingTypeChoices.includes(response?.type)) missing.push(`Write an answer and choose a classification for question ${question.number}.`);
  }
  for (const word of chapter.vocabularyPractice) {
    const response = work.vocabulary[word.wordId];
    if (!response || ![response.definition, response.synonyms, response.sentence].every(filled)) missing.push(`Complete the meaning, synonyms, and sentence for “${word.word}”.`);
    if (!response || response.spellings.length !== 5 || !response.spellings.every(filled) || !response.spellingChecked.every(Boolean)) missing.push(`Write and check all five spelling attempts for “${word.word}”.`);
  }
  if (!PARAGRAPH_SLOTS.every((slot) => filled(work.paragraph.sentences[slot]))) missing.push("Complete all five parts of the revised paragraph.");
  if (!work.paragraph.crossedOut.length) missing.push("Identify the irrelevant supporting detail in the original paragraph.");
  if (!PARAGRAPH_SLOTS.every((slot) => filled(work.paragraph.adjectives[slot]) && filled(work.paragraph.adverbs[slot]))) missing.push("Identify an adjective and an adverb in each revised sentence.");
  for (const box of chapter.textFeaturesHunt.boxes) {
    const response = work.features[box.id];
    if (!response || ![response.feature, response.purpose, response.help].every(filled)) missing.push(`Complete the three responses in text-feature box ${box.number}.`);
  }
  const bank = chapter.cumulativeVocabularyBank;
  const validChoice = bank.wordIds.every((id) => bank.definitionChoices.some((choice) => choice.id === work.bank.definitions[id]) && bank.synonymChoices.some((choice) => choice.id === work.bank.synonyms[id]));
  if (!validChoice || !work.bank.submitted) missing.push("Attempt every definition and synonym match, then check the banks.");
  if (!filled(work.bank.reflection)) missing.push("Explain one vocabulary match you checked or revised.");
  return { complete: missing.length === 0, missing };
}

/** Completeness is an attempt check, never a semantic writing grade. */
export function isCompleteAttempt(chapter: GraphicChapter, work: ChapterWork) {
  return completionDetails(chapter, work).complete;
}

export function hasChapterSubmission(chapter: GraphicChapter, work: ChapterWork | undefined) {
  if (!work) return false;
  if (work.completedOnce) return true;
  if (work.status === "reviewed" && work.review.parentOverride) return true;
  if ((work.status === "submitted" || work.status === "reviewed") && isCompleteAttempt(chapter, work)) return true;
  return work.submittedSnapshots.some((saved) => {
    try {
      const previous = normalizeChapterWork(chapter, JSON.parse(saved));
      return previous !== null && (isCompleteAttempt(chapter, previous) || (previous.status === "reviewed" && previous.review.parentOverride));
    } catch { return false; }
  });
}

export function isChapterUnlocked(chapterNumber: number, works: Record<string, ChapterWork>) {
  return Number.isInteger(chapterNumber) && chapterNumber >= 1 && chapterNumber <= chapters.length &&
    chapters.slice(0, chapterNumber - 1).every((chapter) => hasChapterSubmission(chapter, works[chapter.id]));
}

export function nextUnlocked(works: Record<string, ChapterWork>) {
  return chapters.find((chapter) => !hasChapterSubmission(chapter, works[chapter.id]) && isChapterUnlocked(chapter.number, works)) ?? null;
}

function newer(left: ChapterWork, right: ChapterWork) {
  const difference = Date.parse(left.updatedAt) - Date.parse(right.updatedAt);
  return difference > 0 || (difference === 0 && left.revision > right.revision);
}

export function useGraphicProgress() {
  const { snapshot, auth, syncStatus, replacePracticeAttempt } = useLearningProgress();
  const ready = auth.status !== "loading" && syncStatus !== "loading";
  const owner = auth.userId ?? "guest";
  const local = useRef({ owner, works: ready ? readGraphicWorks(snapshot) : {}, drafts: {} as Record<string, ChapterWork> });
  const writtenAttempts = useRef({ owner, attempts: {} as Record<string, PracticeAttempt> });
  const readiness = useRef(ready);
  const [, rerender] = useState(0);
  readiness.current = ready;
  // During account hydration the provider may still expose the previous
  // account's snapshot. Never seed the incoming account's local merge with it.
  if (!ready) local.current = { owner, works: {}, drafts: {} };
  else if (local.current.owner !== owner) local.current = { owner, works: readGraphicWorks(snapshot), drafts: {} };
  else {
    const fromSnapshot = readGraphicWorks(snapshot);
    for (const [id, work] of Object.entries(local.current.works)) {
      if (!fromSnapshot[id] || newer(work, fromSnapshot[id])) fromSnapshot[id] = work;
    }
    local.current.works = fromSnapshot;
  }
  if (!ready || writtenAttempts.current.owner !== owner) writtenAttempts.current = { owner, attempts: {} };

  const getWork = useCallback((chapter: GraphicChapter) => {
    return local.current.works[chapter.id] ?? (local.current.drafts[chapter.id] ??= createChapterWork(chapter));
  }, []);

  const updateWork = useCallback((chapter: GraphicChapter, update: (old: ChapterWork) => ChapterWork) => {
    if (!readiness.current || local.current.owner !== owner) return;
    const previous = getWork(chapter);
    const proposed = update(copy(previous));
    const currentTime = new Date(Math.max(Date.now(), Date.parse(previous.updatedAt) + 1)).toISOString();
    const work = normalizeChapterWork(chapter, { ...proposed, chapterId: chapter.id, revision: previous.revision + 1, updatedAt: currentTime });
    if (!work) return;
    work.completedOnce = previous.completedOnce || hasChapterSubmission(chapter, work);
    local.current.works = { ...local.current.works, [chapter.id]: work };
    delete local.current.drafts[chapter.id];
    const id = graphicAttemptId(chapter.id);
    const existing = writtenAttempts.current.attempts[id] ?? snapshot.activeAttempts[id] ?? snapshot.completedAttempts.find((attempt) => attempt.attemptId === id);
    const completed = hasChapterSubmission(chapter, work);
    const attempt: PracticeAttempt = {
      attemptId: id, subject: "English", topic: `Hotel Transylvania ${chapter.number}: ${chapter.title}`,
      answered: completed ? 6 : work.section,
      total: 6, score: 0, status: completed ? "completed" : "in-progress",
      startedAt: existing?.startedAt ?? currentTime,
      updatedAt: currentTime,
      ...(completed ? { completedAt: existing?.completedAt ?? currentTime } : {}),
      metadata: { format: GRAPHIC_PROGRESS_FORMAT, collectionId: graphicCourse.config.collectionId, contentVersion: graphicCourse.config.contentVersion, chapterId: chapter.id, work: JSON.stringify(work), questionTotal: chapter.comprehension.length },
    };
    writtenAttempts.current.attempts[id] = attempt;
    replacePracticeAttempt(attempt);
    rerender((revision) => revision + 1);
  }, [getWork, owner, replacePracticeAttempt, snapshot.activeAttempts, snapshot.completedAttempts]);

  return { works: local.current.works, getWork, updateWork, ready };
}
