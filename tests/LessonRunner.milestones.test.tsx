// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonRunner } from "../src/features/story-adventures/LessonRunner";
import { storyLessons } from "../src/features/story-adventures/content";
import { createLessonProgress } from "../src/features/story-adventures/progress";

const milestoneSequences = [1, 20, 40, 60, 80, 100] as const;

describe("LessonRunner milestone reading spreads", () => {
  afterEach(cleanup);

  it.each(milestoneSequences)(
    "renders lesson %i with both pages and its story-specific illustration",
    (sequence) => {
      const lesson = storyLessons.find(
        (candidate) => candidate.sequence === sequence,
      );

      expect(lesson, `Expected lesson ${sequence} to exist`).toBeTruthy();
      if (!lesson) return;

      render(
        <LessonRunner
          lesson={lesson}
          lessons={storyLessons}
          progress={{
            ...createLessonProgress(lesson.id),
            currentStep: "reading",
          }}
          region="US"
          textScale="standard"
          updateLesson={() => undefined}
          onExit={() => undefined}
          onOpenLesson={() => undefined}
        />,
      );

      expect(
        screen.getAllByRole("heading", { name: lesson.title }).length,
      ).toBeGreaterThan(0);
      expect(screen.getByText(`Lesson ${sequence} · Page 1`)).toBeTruthy();
      expect(screen.getByText(`Lesson ${sequence} · Page 2`)).toBeTruthy();
      expect(screen.getByText("Page 1 of 2")).toBeTruthy();
      expect(screen.getByText("Page 2 of 2")).toBeTruthy();

      const storyImage = screen.getByRole("img", {
        name: lesson.illustration.alt,
      });
      expect(storyImage).toBeTruthy();
      expect(storyImage.getAttribute("src")).toContain(
        lesson.illustration.src.replace(/^\//, ""),
      );
      expect(screen.getByText(lesson.illustration.caption)).toBeTruthy();
    },
  );
});
