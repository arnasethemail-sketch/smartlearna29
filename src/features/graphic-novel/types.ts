import type { AutomaticCheck } from "./checking-types";

export type ParagraphSlot = "topicSentence" | "detail1" | "detail2" | "detail3" | "conclusion";

/** Legacy manual notes remain readable; new automatic feedback is stored separately. */
export type WritingReview = {
  meaning: string;
  support: string;
  clarity: string;
  conventions: string;
  notes: string;
  reviewer: string;
};

export type ComprehensionWork = {
  answer: string;
  type: string;
  checks: Record<string, boolean>;
  history: string[];
  help: boolean;
  review: WritingReview;
};

export type VocabularyRevision = {
  definition: string;
  synonyms: string;
  sentence: string;
  spellings: string[];
  savedAt: string;
};

export type VocabularyWork = {
  definition: string;
  synonyms: string;
  sentence: string;
  spellings: string[];
  spellingChecked: boolean[];
  covered: boolean;
  help: boolean;
  history: VocabularyRevision[];
  review: WritingReview;
};

export type ParagraphRevision = {
  sentences: Record<ParagraphSlot, string>;
  crossedOut: string[];
  adjectives: Record<ParagraphSlot, string>;
  adverbs: Record<ParagraphSlot, string>;
  savedAt: string;
};

export type ParagraphWork = {
  sentences: Record<ParagraphSlot, string>;
  crossedOut: string[];
  adjectives: Record<ParagraphSlot, string>;
  adverbs: Record<ParagraphSlot, string>;
  history: ParagraphRevision[];
  help: boolean;
  review: WritingReview;
};

export type FeatureWork = {
  feature: string;
  purpose: string;
  help: string;
  showHelp: boolean;
  history: Array<{ feature: string; purpose: string; help: string; savedAt: string }>;
  review: WritingReview;
};

export type BankAttempt = {
  definitions: Record<string, string>;
  synonyms: Record<string, string>;
  reflection: string;
  savedAt: string;
};

export type BankWork = {
  definitions: Record<string, string>;
  synonyms: Record<string, string>;
  definitionOrder: string[];
  synonymOrder: string[];
  reflection: string;
  submitted: boolean;
  history: BankAttempt[];
};

export type ChapterWork = {
  chapterId: string;
  contentVersion: string;
  revision: number;
  section: number;
  page: number;
  readingView: "page" | "panel";
  panelIndex: number;
  status: "in-progress" | "submitted" | "reviewed";
  completedOnce: boolean;
  readingComplete: boolean;
  largeText: boolean;
  comprehension: Record<string, ComprehensionWork>;
  vocabulary: Record<string, VocabularyWork>;
  paragraph: ParagraphWork;
  features: Record<string, FeatureWork>;
  bank: BankWork;
  checklistLegend: Record<string, string>;
  teacherBannedWords: string[];
  submittedSnapshots: string[];
  automaticChecks: Record<string, AutomaticCheck>;
  review: WritingReview & { parentOverride: boolean };
  updatedAt: string;
};
