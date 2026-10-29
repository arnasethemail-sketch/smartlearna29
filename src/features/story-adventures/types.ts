export type EnglishRegion = "US" | "CA";

export type DifficultyBand =
  | "foundation"
  | "developing"
  | "intermediate"
  | "advanced"
  | "mastery";

export type QuestionClassification =
  | "Right There"
  | "Think and Search"
  | "Author and You"
  | "On My Own";

export type StoryPage = {
  pageNumber: 1 | 2;
  subheading: string;
  paragraphs: string[];
  callout: {
    label: string;
    text: string;
  };
};

export type StoryIllustration = {
  src: string;
  alt: string;
  caption: string;
  sceneKey: string;
  accent: string;
};

export type VocabularyWord = {
  word: string;
  definition: string;
  synonyms: [string, string];
  contextSentence: string;
  hint: string;
  acceptedSpellings?: string[];
};

export type ComprehensionQuestion = {
  id: string;
  classification: QuestionClassification;
  prompt: string;
  modelAnswer: string;
  evidence: string;
  isOpinion?: boolean;
};

export type ParagraphSentenceOption = {
  id: string;
  text: string;
  relevant: boolean;
  reason: string;
};

export type ParagraphTask = {
  prompt: string;
  centralIdea: string;
  topicSentenceStarter: string;
  sentenceOptions: ParagraphSentenceOption[];
  missingDetailPrompt: string;
  conclusionPrompt: string;
  revisionPrompt: string;
  requiredVocabulary: string[];
  modelParagraph: string;
};

export type TextFeature = {
  id: string;
  feature: string;
  location: string;
  purpose: string;
  helpsBecause: string;
};

export type SourceReference = {
  label: string;
  url: string;
};

export type StoryLesson = {
  id: string;
  sequence: number;
  title: string;
  genre: string;
  informational: boolean;
  grade: 5;
  band: DifficultyBand;
  objective: string;
  skillTags: string[];
  pages: [StoryPage, StoryPage];
  illustration: StoryIllustration;
  vocabulary: [VocabularyWord, VocabularyWord, VocabularyWord];
  comprehension: [
    ComprehensionQuestion,
    ComprehensionQuestion,
    ComprehensionQuestion,
    ComprehensionQuestion,
    ComprehensionQuestion,
  ];
  paragraphTask: ParagraphTask;
  textFeatures: [TextFeature, TextFeature, TextFeature, TextFeature];
  sourceReferences: SourceReference[];
  contentVersion: "1.0.0";
};

export type LessonStep =
  | "home"
  | "reading"
  | "vocabulary-bank"
  | "comprehension"
  | "vocabulary-practice"
  | "paragraph-writing"
  | "text-features"
  | "complete";

export type VocabularyMatchAnswer = {
  definition?: string;
  synonym?: string;
};

export type VocabularyPracticeAnswer = {
  ownDefinition: string;
  synonyms: string;
  sentence: string;
  spellingAttempt: string;
};

export type TextFeatureAnswer = {
  feature: string;
  purpose: string;
  help: string;
};

export type ParagraphDraft = {
  topicSentence: string;
  selectedDetailIds: string[];
  missingDetail: string;
  conclusion: string;
  revisedParagraph: string;
};

export type LessonProgress = {
  lessonId: string;
  status: "not-started" | "in-progress" | "completed";
  currentStep: LessonStep;
  readingComplete: boolean;
  vocabularyMatches: Record<string, VocabularyMatchAnswer>;
  comprehensionAnswers: Record<string, string>;
  comprehensionClassifications: Record<string, QuestionClassification>;
  vocabularyPractice: Record<string, VocabularyPracticeAnswer>;
  paragraphDraft: ParagraphDraft;
  textFeatureAnswers: Record<string, TextFeatureAnswer>;
  assessment: {
    vocabularyCorrect: number;
    spellingCorrect: number;
    comprehensionAttempted: number;
    paragraphChecks: number;
  };
  completedAt?: string;
  lastUpdatedAt: string;
};

export type StoryAdventureState = {
  schemaVersion: 1;
  region: EnglishRegion;
  textScale: "standard" | "large";
  progressByLesson: Record<string, LessonProgress>;
};
