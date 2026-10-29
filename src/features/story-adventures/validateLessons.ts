import {
  INFORMATIONAL_LESSON_NUMBERS,
  STORY_LESSON_TITLES,
} from "./lessonTitles";
import type {
  DifficultyBand,
  QuestionClassification,
  StoryLesson,
} from "./types";

const requiredQuestionClassifications = new Set<QuestionClassification>([
  "Right There",
  "Think and Search",
  "Author and You",
  "On My Own",
]);

export type StoryValidationReport = {
  errors: string[];
  warnings: string[];
  storyWordCounts: number[];
};

const expectedBands: Array<{
  first: number;
  last: number;
  band: DifficultyBand;
}> = [
  { first: 1, last: 20, band: "foundation" },
  { first: 21, last: 40, band: "developing" },
  { first: 41, last: 60, band: "intermediate" },
  { first: 61, last: 80, band: "advanced" },
  { first: 81, last: 100, band: "mastery" },
];

export function countStoryWords(lesson: StoryLesson) {
  return lesson.pages
    .flatMap((page) => page.paragraphs)
    .join(" ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean).length;
}

export function validateStoryLessons(
  lessons: readonly StoryLesson[],
): StoryValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const storyWordCounts = lessons.map(countStoryWords);
  const lessonIds = new Set<string>();
  const fullStories = new Set<string>();
  const sceneKeys = new Set<string>();

  if (lessons.length !== 100) {
    errors.push(`Expected 100 lessons; found ${lessons.length}.`);
  }

  lessons.forEach((lesson, index) => {
    const expectedSequence = index + 1;
    const prefix = `Lesson ${expectedSequence}`;
    const expectedBand = expectedBands.find(
      ({ first, last }) => expectedSequence >= first && expectedSequence <= last,
    )?.band;
    const storyText = lesson.pages
      .flatMap((page) => page.paragraphs)
      .join(" ")
      .trim();
    const normalizedStory = storyText.toLocaleLowerCase().replace(/\s+/gu, " ");
    const wordCount = storyWordCounts[index] ?? 0;

    if (lesson.sequence !== expectedSequence) {
      errors.push(`${prefix}: sequence is ${lesson.sequence}.`);
    }
    if (lesson.title !== STORY_LESSON_TITLES[index]) {
      errors.push(`${prefix}: title does not match the required curriculum order.`);
    }
    if (lesson.grade !== 5) errors.push(`${prefix}: grade must be 5.`);
    if (lesson.band !== expectedBand) {
      errors.push(`${prefix}: expected ${expectedBand} band; found ${lesson.band}.`);
    }
    if (lesson.informational !== INFORMATIONAL_LESSON_NUMBERS.has(expectedSequence)) {
      errors.push(`${prefix}: informational flag does not match the curriculum map.`);
    }
    if (lesson.pages.length !== 2 || lesson.pages[0].pageNumber !== 1 || lesson.pages[1].pageNumber !== 2) {
      errors.push(`${prefix}: reading must contain exactly two ordered pages.`);
    }
    if (
      lesson.pages.some(
        (page) =>
          !page.subheading.trim() ||
          page.paragraphs.length < 1 ||
          page.paragraphs.some((paragraph) => !paragraph.trim()) ||
          !page.callout.label.trim() ||
          !page.callout.text.trim(),
      )
    ) {
      errors.push(`${prefix}: both reading pages need a subheading, prose, and a meaningful callout.`);
    }
    if (wordCount < 450 || wordCount > 620) {
      errors.push(`${prefix}: story has ${wordCount} words; expected 450–620.`);
    }
    if (normalizedStory.length < 1 || /\b(todo|placeholder|lorem ipsum)\b/iu.test(storyText)) {
      errors.push(`${prefix}: story is empty or contains placeholder copy.`);
    }
    if (fullStories.has(normalizedStory)) {
      errors.push(`${prefix}: story duplicates another lesson.`);
    }
    fullStories.add(normalizedStory);

    if (lessonIds.has(lesson.id)) errors.push(`${prefix}: duplicate lesson id ${lesson.id}.`);
    lessonIds.add(lesson.id);
    if (sceneKeys.has(lesson.illustration.sceneKey)) {
      errors.push(`${prefix}: illustration sceneKey is not unique.`);
    }
    sceneKeys.add(lesson.illustration.sceneKey);
    if (lesson.illustration.src !== `/story-adventures/illustrations/lesson-${String(expectedSequence).padStart(3, "0")}.svg`) {
      errors.push(`${prefix}: illustration path is not the required lesson-specific asset.`);
    }
    if (!lesson.illustration.alt.trim() || !lesson.illustration.caption.trim()) {
      errors.push(`${prefix}: illustration needs alt text and a caption.`);
    }

    if (lesson.vocabulary.length !== 3) errors.push(`${prefix}: expected 3 vocabulary words.`);
    lesson.vocabulary.forEach((entry) => {
      const wordPattern = new RegExp(`\\b${escapeRegExp(entry.word)}\\b`, "iu");
      if (!wordPattern.test(storyText)) {
        errors.push(`${prefix}: vocabulary word “${entry.word}” is absent from the story.`);
      }
      if (!entry.definition.trim() || entry.synonyms.length !== 2 || entry.synonyms.some((item) => !item.trim())) {
        errors.push(`${prefix}: vocabulary entry “${entry.word}” is incomplete.`);
      }
    });

    if (lesson.comprehension.length !== 5) errors.push(`${prefix}: expected 5 comprehension questions.`);
    if (new Set(lesson.comprehension.map((item) => item.id)).size !== 5) {
      errors.push(`${prefix}: comprehension question ids must be unique.`);
    }
    if (lesson.comprehension.some((item) => !item.prompt.trim() || !item.modelAnswer.trim() || !item.evidence.trim())) {
      errors.push(`${prefix}: comprehension questions require prompts, model answers, and evidence.`);
    }
    const classifications = new Set(
      lesson.comprehension.map((item) => item.classification),
    );
    if (
      [...requiredQuestionClassifications].some(
        (classification) => !classifications.has(classification),
      )
    ) {
      errors.push(`${prefix}: comprehension must cover all four required question classifications.`);
    }
    if (
      lesson.comprehension.some((item) =>
        item.prompt.toLocaleLowerCase().includes(
          item.modelAnswer.toLocaleLowerCase(),
        ),
      )
    ) {
      errors.push(`${prefix}: a question prompt reveals its model answer.`);
    }

    if (lesson.paragraphTask.sentenceOptions.length < 4) {
      errors.push(`${prefix}: paragraph activity needs at least four sentence options.`);
    }
    if (!lesson.paragraphTask.sentenceOptions.some((item) => item.relevant) || !lesson.paragraphTask.sentenceOptions.some((item) => !item.relevant)) {
      errors.push(`${prefix}: paragraph activity needs both relevant and irrelevant choices.`);
    }
    if (
      lesson.paragraphTask.sentenceOptions.filter((item) => item.relevant)
        .length < 3
    ) {
      errors.push(`${prefix}: paragraph activity needs at least three relevant supporting details.`);
    }
    if (!lesson.paragraphTask.modelParagraph.trim()) {
      errors.push(`${prefix}: paragraph activity has no model paragraph.`);
    }
    if (lesson.textFeatures.length !== 4) errors.push(`${prefix}: expected 4 text-feature boxes.`);
    if (lesson.textFeatures.some((item) => !item.feature.trim() || !item.location.trim() || !item.purpose.trim() || !item.helpsBecause.trim())) {
      errors.push(`${prefix}: text-feature references are incomplete.`);
    }
    if (lesson.contentVersion !== "1.0.0") {
      errors.push(`${prefix}: unexpected content version ${lesson.contentVersion}.`);
    }

    if (lesson.informational && lesson.sourceReferences.length < 1) {
      errors.push(`${prefix}: informational lesson needs at least one stored source.`);
    }
    lesson.sourceReferences.forEach((source) => {
      try {
        const url = new URL(source.url);
        if (url.protocol !== "https:") errors.push(`${prefix}: source must use HTTPS.`);
      } catch {
        errors.push(`${prefix}: source URL is invalid.`);
      }
    });

    if (lesson.objective.length < 25) warnings.push(`${prefix}: objective is unusually short.`);
    if (lesson.skillTags.length < 2) warnings.push(`${prefix}: fewer than two skill tags.`);
  });

  return { errors, warnings, storyWordCounts };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
