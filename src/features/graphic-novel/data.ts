import course from "./course.json";

// The source transcript and private worksheet photographs stay in the supplied
// reference package. This module contains only the authored course/adaptation.
export const graphicCourse = course;
export const chapters = graphicCourse.chapters;
export type GraphicChapter = (typeof chapters)[number];
export type GraphicPanel = GraphicChapter["panels"][number];
export type GraphicQuestion = GraphicChapter["comprehension"][number];
export type GraphicWord = (typeof graphicCourse.vocabulary)[number];
export const wordsById = Object.fromEntries(graphicCourse.vocabulary.map((word) => [word.id, word])) as Record<string, GraphicWord>;
export const chapterById = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter])) as Record<string, GraphicChapter>;

export const GRAPHIC_SECTIONS = [
  "Graphic Novel Reading",
  "Reading Comprehension",
  "Vocabulary and Spelling",
  "Hamburger Paragraph",
  "Text Features Hunt",
  "Cumulative Vocabulary Bank / Review",
] as const;
