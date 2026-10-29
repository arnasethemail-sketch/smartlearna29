// @vitest-environment jsdom

import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { storyLessons } from "../src/features/story-adventures/content";
import { LessonRunner } from "../src/features/story-adventures/LessonRunner";
import {
  createInitialStoryState,
  createLessonProgress,
  loadStoryState,
  saveStoryState,
} from "../src/features/story-adventures/progress";
import { regionalizeText } from "../src/features/story-adventures/regionalize";
import { StoryAdventures } from "../src/features/story-adventures/StoryAdventures";
import type {
  LessonProgress,
  LessonStep,
  StoryLesson,
} from "../src/features/story-adventures/types";

function makeFilledProgress(
  lesson: StoryLesson,
  currentStep: LessonStep,
): LessonProgress {
  const base = createLessonProgress(lesson.id);
  return {
    ...base,
    status: currentStep === "complete" ? "completed" : "in-progress",
    currentStep,
    readingComplete: currentStep !== "reading" && currentStep !== "home",
    vocabularyMatches: Object.fromEntries(
      lesson.vocabulary.map((entry) => [
        entry.word,
        { definition: entry.definition, synonym: entry.synonyms[0] },
      ]),
    ),
    comprehensionAnswers: Object.fromEntries(
      lesson.comprehension.map((question) => [
        question.id,
        `My complete response uses relevant evidence for question ${question.id}.`,
      ]),
    ),
    comprehensionClassifications: Object.fromEntries(
      lesson.comprehension.map((question) => [
        question.id,
        question.classification,
      ]),
    ),
    vocabularyPractice: Object.fromEntries(
      lesson.vocabulary.map((entry) => [
        entry.word,
        {
          ownDefinition: `A clear meaning for ${entry.word}`,
          synonyms: entry.synonyms.join(", "),
          sentence: `I used ${entry.word} correctly in this complete practice sentence.`,
          spellingAttempt: entry.word,
        },
      ]),
    ),
    paragraphDraft: {
      topicSentence: "This topic sentence clearly introduces the central idea.",
      selectedDetailIds: lesson.paragraphTask.sentenceOptions
        .filter((option) => option.relevant)
        .map((option) => option.id),
      missingDetail: "This added detail gives specific evidence from the reading.",
      conclusion: "This conclusion restates the main idea in a clear way.",
      revisedParagraph:
        "This revised paragraph has a topic sentence, three relevant details, smooth transitions, precise vocabulary, and a clear concluding sentence.",
    },
    textFeatureAnswers: Object.fromEntries(
      lesson.textFeatures.map((feature) => [
        feature.id,
        {
          feature: feature.feature,
          purpose: `The author included this feature to ${feature.purpose.toLowerCase()}`,
          help: `It helped me understand the text because ${feature.helpsBecause.toLowerCase()}`,
        },
      ]),
    ),
    assessment: {
      vocabularyCorrect: 6,
      spellingCorrect: 3,
      comprehensionAttempted: 5,
      paragraphChecks: 4,
    },
    completedAt:
      currentStep === "complete" ? "2026-10-29T12:00:00.000Z" : undefined,
    lastUpdatedAt: "2026-10-29T12:00:00.000Z",
  };
}

function RunnerHarness({
  lesson,
  initialProgress,
  onProgress,
}: {
  lesson: StoryLesson;
  initialProgress: LessonProgress;
  onProgress?: (progress: LessonProgress) => void;
}) {
  const [progress, setProgress] = useState(initialProgress);

  return (
    <LessonRunner
      lesson={lesson}
      lessons={storyLessons}
      progress={progress}
      region="US"
      textScale="standard"
      updateLesson={(_lessonId, update) => {
        setProgress((current) => {
          const patch =
            typeof update === "function" ? update(current) : update;
          const next = {
            ...current,
            ...patch,
            lastUpdatedAt: "2026-10-29T12:01:00.000Z",
          };
          onProgress?.(next);
          return next;
        });
      }}
      onExit={vi.fn()}
      onOpenLesson={vi.fn()}
    />
  );
}

function renderStaticRunner(progress: LessonProgress) {
  const lesson = storyLessons[0];
  return render(
    <LessonRunner
      lesson={lesson}
      lessons={storyLessons}
      progress={progress}
      region="US"
      textScale="standard"
      updateLesson={vi.fn()}
      onExit={vi.fn()}
      onOpenLesson={vi.fn()}
    />,
  );
}

describe("Story Adventures progress and lesson flow", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("round-trips saved answers and settings through local persistence", () => {
    const lesson = storyLessons[0];
    const progress = makeFilledProgress(lesson, "comprehension");
    const state = {
      ...createInitialStoryState(),
      region: "CA" as const,
      textScale: "large" as const,
      progressByLesson: { [lesson.id]: progress },
    };

    saveStoryState(state);
    const restored = loadStoryState();

    expect(restored.region).toBe("CA");
    expect(restored.textScale).toBe("large");
    expect(restored.progressByLesson[lesson.id]).toEqual(progress);
  });

  it("resumes the most recently saved lesson at its saved step and answer", () => {
    const lesson = storyLessons[0];
    const progress = makeFilledProgress(lesson, "comprehension");
    const savedAnswer = progress.comprehensionAnswers[lesson.comprehension[0].id];
    saveStoryState({
      ...createInitialStoryState(),
      progressByLesson: { [lesson.id]: progress },
    });

    render(<StoryAdventures onBackToEnglish={vi.fn()} />);
    expect(
      screen.getByText("Lesson 1 is saved and ready to continue."),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Continue Lesson" }));

    expect(screen.getByText("Step 3 · Reading Comprehension")).toBeTruthy();
    expect(
      (screen.getAllByLabelText("Your answer")[0] as HTMLTextAreaElement).value,
    ).toBe(savedAnswer);
  });

  it("unlocks only the lesson immediately after the completed sequence", () => {
    const firstLesson = storyLessons[0];
    saveStoryState({
      ...createInitialStoryState(),
      progressByLesson: {
        [firstLesson.id]: makeFilledProgress(firstLesson, "complete"),
      },
    });

    render(<StoryAdventures onBackToEnglish={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "My Lessons" }));

    const lessonTwo = screen.getByRole("button", {
      name: /Lesson 2.*The Backpack That Barked/s,
    }) as HTMLButtonElement;
    const lessonThree = screen.getByRole("button", {
      name: /Lesson 3.*The Case of the Blue Footprints/s,
    }) as HTMLButtonElement;

    expect(lessonTwo.disabled).toBe(false);
    expect(lessonThree.disabled).toBe(true);
  });

  it("gates every required lesson step until its responses are populated", () => {
    const lesson = storyLessons[0];

    const assertContinueGate = (
      step: LessonStep,
      progress: LessonProgress,
      disabled: boolean,
    ) => {
      const view = renderStaticRunner({ ...progress, currentStep: step });
      const button = screen.getByRole("button", {
        name: /Save & Continue/,
      }) as HTMLButtonElement;
      expect(button.disabled).toBe(disabled);
      view.unmount();
    };

    const blank = createLessonProgress(lesson.id);
    const filled = makeFilledProgress(lesson, "reading");

    assertContinueGate("reading", blank, false);
    assertContinueGate("vocabulary-bank", blank, true);
    assertContinueGate("vocabulary-bank", filled, false);
    assertContinueGate("comprehension", blank, true);
    assertContinueGate("comprehension", filled, false);
    assertContinueGate("vocabulary-practice", blank, true);
    assertContinueGate("vocabulary-practice", filled, false);
    assertContinueGate("paragraph-writing", blank, true);
    assertContinueGate("paragraph-writing", filled, false);

    const blankFeaturesView = renderStaticRunner({
      ...blank,
      currentStep: "text-features",
    });
    expect(
      (screen.getByRole("button", {
        name: "Complete Lesson 1",
      }) as HTMLButtonElement).disabled,
    ).toBe(true);
    blankFeaturesView.unmount();

    const filledFeaturesView = renderStaticRunner({
      ...filled,
      currentStep: "text-features",
    });
    expect(
      (screen.getByRole("button", {
        name: "Complete Lesson 1",
      }) as HTMLButtonElement).disabled,
    ).toBe(false);
    filledFeaturesView.unmount();
  });

  it("allows lesson 100 to reach the real completion summary", () => {
    const lesson = storyLessons[99];
    const initialProgress = makeFilledProgress(lesson, "text-features");
    let latestProgress = initialProgress;

    render(
      <RunnerHarness
        lesson={lesson}
        initialProgress={initialProgress}
        onProgress={(progress) => {
          latestProgress = progress;
        }}
      />,
    );

    const completeButton = screen.getByRole("button", {
      name: "Complete Lesson 100",
    }) as HTMLButtonElement;
    expect(completeButton.disabled).toBe(false);
    fireEvent.click(completeButton);

    expect(
      screen.getByRole("heading", {
        name: "You completed the Grade 5 Story Adventures!",
      }),
    ).toBeTruthy();
    expect(latestProgress.status).toBe("completed");
    expect(latestProgress.currentStep).toBe("complete");
    expect(latestProgress.completedAt).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Start Next Lesson" }),
    ).toBeNull();
  });
});

describe("Story Adventures regional English", () => {
  afterEach(cleanup);

  it("converts common US and Canadian variants in both directions", () => {
    expect(
      regionalizeText(
        "The neighbor's favorite color filled the theater center.",
        "CA",
      ),
    ).toBe("The neighbour's favourite colour filled the theatre centre.");
    expect(
      regionalizeText(
        "The neighbour's favourite colour filled the theatre centre.",
        "US",
      ),
    ).toBe("The neighbor's favorite color filled the theater center.");
    expect(
      regionalizeText(
        "The labelled grey programme was practised while travellers catalogued it.",
        "US",
      ),
    ).toBe(
      "The labeled gray program was practiced while travelers cataloged it.",
    );
    expect(
      regionalizeText(
        "The labeled gray behavior was practiced while travelers watched.",
        "CA",
      ),
    ).toBe(
      "The labelled grey behaviour was practised while travellers watched.",
    );
  });

  it("renders the required Canadian lesson title and its US title variant", () => {
    const lesson = storyLessons[13];
    const progress = makeFilledProgress(lesson, "reading");
    const commonProps = {
      lesson,
      lessons: storyLessons,
      progress,
      textScale: "standard" as const,
      updateLesson: vi.fn(),
      onExit: vi.fn(),
      onOpenLesson: vi.fn(),
    };
    const view = render(<LessonRunner {...commonProps} region="CA" />);

    expect(
      screen.getAllByRole("heading", { name: "Why Leaves Change Colour" })
        .length,
    ).toBeGreaterThan(0);

    view.rerender(<LessonRunner {...commonProps} region="US" />);
    expect(
      screen.getAllByRole("heading", { name: "Why Leaves Change Color" })
        .length,
    ).toBeGreaterThan(0);
  });
});
