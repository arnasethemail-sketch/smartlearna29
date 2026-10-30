// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  GUEST_PROGRESS_STORAGE_KEY,
  LearningProgressProvider,
  useLearningProgress,
} from "../src/features/progress";
import {
  createInitialStoryState,
  createLessonProgress,
  STORY_PROGRESS_STORAGE_KEY,
} from "../src/features/story-adventures/progress";

function ProgressHarness() {
  const {
    snapshot,
    updatePracticeProgress,
    resetPracticeAttempt,
  } = useLearningProgress();
  const active = snapshot.activeAttempts["math-addition-round"];
  const completed = snapshot.completedAttempts.find(
    (attempt) => attempt.attemptId === "math-addition-round",
  );

  return (
    <div>
      <output data-testid="state">
        {active ? "active" : completed ? "completed" : "empty"}
      </output>
      <button
        type="button"
        onClick={() =>
          updatePracticeProgress({
            attemptId: "math-addition-round",
            subject: "Math",
            topic: "Addition",
            answered: 4,
            total: 20,
            score: 3,
            status: "in-progress",
            metadata: { level: 2 },
          })
        }
      >
        Save partial
      </button>
      <button
        type="button"
        onClick={() =>
          updatePracticeProgress({
            attemptId: "math-addition-round",
            subject: "Math",
            topic: "Addition",
            answered: 20,
            total: 20,
            score: 18,
            status: "completed",
            durationSeconds: 75,
          })
        }
      >
        Complete
      </button>
      <button
        type="button"
        onClick={() => resetPracticeAttempt("math-addition-round")}
      >
        Reset
      </button>
    </div>
  );
}

describe("LearningProgressProvider", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("keeps the hook safe when a feature is rendered without its provider", () => {
    render(<ProgressHarness />);
    expect(screen.getByTestId("state").textContent).toBe("empty");
    fireEvent.click(screen.getByRole("button", { name: "Save partial" }));
    expect(screen.getByTestId("state").textContent).toBe("empty");
  });

  it("stores partial attempts, moves completed work into history, and resets by id", async () => {
    render(
      <LearningProgressProvider>
        <ProgressHarness />
      </LearningProgressProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save partial" }));
    expect(screen.getByTestId("state").textContent).toBe("active");
    await waitFor(() => {
      const saved = JSON.parse(
        window.localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY) ?? "{}",
      );
      expect(saved.activeAttempts["math-addition-round"]).toMatchObject({
        answered: 4,
        score: 3,
        metadata: { level: 2 },
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Complete" }));
    expect(screen.getByTestId("state").textContent).toBe("completed");
    await waitFor(() => {
      const saved = JSON.parse(
        window.localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY) ?? "{}",
      );
      expect(saved.activeAttempts["math-addition-round"]).toBeUndefined();
      expect(saved.completedAttempts).toHaveLength(1);
      expect(saved.completedAttempts[0]).toMatchObject({
        score: 18,
        durationSeconds: 75,
        status: "completed",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByTestId("state").textContent).toBe("empty");
  });

  it("does not expose account-owned legacy progress through guest storage", async () => {
    const storyState = createInitialStoryState();
    storyState.progressByLesson.privateLesson = {
      ...createLessonProgress("privateLesson"),
      status: "in-progress",
      paragraphDraft: {
        topicSentence: "Account-only writing",
        selectedDetailIds: [],
        missingDetail: "",
        conclusion: "",
        revisedParagraph: "",
      },
    };
    window.localStorage.setItem(
      STORY_PROGRESS_STORAGE_KEY,
      JSON.stringify(storyState),
    );
    window.localStorage.setItem(
      "smartlearna29.learning-progress.legacy-owner.v1",
      "account-a",
    );

    render(
      <LearningProgressProvider>
        <ProgressHarness />
      </LearningProgressProvider>,
    );

    await waitFor(() => {
      const guest = JSON.parse(
        window.localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY) ?? "{}",
      );
      expect(guest.storyAdventureState.progressByLesson.privateLesson).toBeUndefined();
      expect(
        window.localStorage.getItem(
          "smartlearna29.learning-progress.legacy-owner.v1",
        ),
      ).toBe("guest");
    });
  });
});
