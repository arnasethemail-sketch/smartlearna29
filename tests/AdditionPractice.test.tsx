// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdditionPractice } from "../src/features/addition/AdditionPractice";
import { AdditionResults } from "../src/features/addition/AdditionResults";
import { ADDITION_BEST_TIME_STORAGE_KEY } from "../src/features/addition/additionTimer";

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function enterAnswerFromRight(answer: string) {
  const placeLabelsFromRight = [
    "Ones digit",
    "Tens digit",
    "Hundreds digit",
    "Thousands digit",
    "Ten-thousands digit",
  ];
  answer
    .split("")
    .reverse()
    .forEach((digit, index) => {
      fireEvent.change(screen.getByLabelText(placeLabelsFromRight[index]), {
        target: { value: digit },
      });
    });
}

function submitAnswer(answer: string) {
  enterAnswerFromRight(answer);
  fireEvent.click(screen.getByRole("button", { name: "Check Answer" }));
}

function getPerfectAnswer(questionNumber: number) {
  if (questionNumber <= 5) return "1100";
  if (questionNumber <= 10) return "2000";
  if (questionNumber <= 15) return "1200";
  return "3000";
}

describe("Addition practice round", () => {
  it("highlights only incorrect place-value boxes with a bright red border", () => {
    render(<AdditionPractice onBackToTopics={vi.fn()} />);

    submitAnswer("1200");

    const hundredsInput = screen.getByLabelText("Hundreds digit");
    const tensInput = screen.getByLabelText("Tens digit");

    expect(hundredsInput.getAttribute("aria-invalid")).toBe("true");
    expect(hundredsInput.className).toContain("border-4");
    expect(hundredsInput.className).toContain("border-[#ff1f1f]");
    expect(tensInput.getAttribute("aria-invalid")).toBe("false");
    expect(tensInput.className).not.toContain("border-[#ff1f1f]");
  });

  it("starts in the ones box, moves left after input, and moves right on backspace", () => {
    render(<AdditionPractice onBackToTopics={vi.fn()} />);

    const onesInput = screen.getByLabelText("Ones digit") as HTMLInputElement;
    const tensInput = screen.getByLabelText("Tens digit");

    expect(screen.getAllByRole("textbox")).toHaveLength(5);
    screen.getAllByRole("textbox").forEach((input) => {
      expect(input.className).toContain("focus:border-[#ff6633]");
    });
    expect(document.activeElement).toBe(onesInput);

    fireEvent.change(onesInput, { target: { value: "5" } });
    expect(onesInput.value).toBe("5");
    expect(document.activeElement).toBe(tensInput);

    fireEvent.keyDown(tensInput, { key: "Backspace" });
    expect(document.activeElement).toBe(onesInput);

    fireEvent.change(onesInput, { target: { value: "" } });
    enterAnswerFromRight("1100");
    fireEvent.click(screen.getByRole("button", { name: "Check Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Next Question" }));

    expect(document.activeElement).toBe(
      screen.getByLabelText("Ones digit"),
    );
  });

  it("levels up after five correct answers and goes back after a Level 2 miss", () => {
    render(<AdditionPractice onBackToTopics={vi.fn()} />);

    for (let questionNumber = 1; questionNumber <= 5; questionNumber += 1) {
      expect(
        screen.getByRole("heading", {
          name: `Question ${questionNumber} of 20`,
        }),
      ).toBeTruthy();
      submitAnswer("1100");
      expect(screen.getByText("Correct! Great work!")).toBeTruthy();
      fireEvent.click(
        screen.getByRole("button", { name: "Next Question" }),
      );
    }

    expect(
      screen.getByRole("heading", { name: "Question 6 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "1000 + 1000" }),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Level 2: 4-digit + 4-digit").length,
    ).toBeGreaterThan(0);

    submitAnswer("0");
    expect(screen.getByText("The correct answer is 2000.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next Question" }));

    expect(
      screen.getByRole("heading", { name: "Question 7 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "1000 + 100" }),
    ).toBeTruthy();
    expect(screen.getByText("5 / 20")).toBeTruthy();
    expect(screen.getByText("0 / 5")).toBeTruthy();
  });

  it("moves through all four levels after five correct answers at each level", () => {
    render(<AdditionPractice onBackToTopics={vi.fn()} />);

    const completeFiveQuestions = (answer: string) => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        submitAnswer(answer);
        fireEvent.click(screen.getByRole("button", { name: "Next Question" }));
      }
    };

    completeFiveQuestions("1100");
    expect(
      screen.getByRole("heading", { name: "Question 6 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "1000 + 1000" }),
    ).toBeTruthy();
    expect(screen.getByText("0 / 5")).toBeTruthy();

    completeFiveQuestions("2000");
    expect(
      screen.getByRole("heading", { name: "Question 11 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "1000 + 100 + 100" }),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Level 3: 4-digit + 3-digit + 3-digit").length,
    ).toBeGreaterThan(0);

    completeFiveQuestions("1200");
    expect(
      screen.getByRole("heading", { name: "Question 16 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "1000 + 1000 + 1000" }),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Level 4: 4-digit + 4-digit + 4-digit").length,
    ).toBeGreaterThan(0);

    submitAnswer("3000");
    fireEvent.click(screen.getByRole("button", { name: "Next Question" }));
    expect(
      screen.getByRole("heading", { name: "Question 17 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Level 4: 4-digit + 4-digit + 4-digit").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("1 / 5")).toBeTruthy();
  });

  it("ends after exactly 20 questions with the correct score and accuracy", () => {
    render(<AdditionPractice onBackToTopics={vi.fn()} />);

    for (let questionNumber = 1; questionNumber <= 20; questionNumber += 1) {
      expect(
        screen.getByRole("heading", {
          name: `Question ${questionNumber} of 20`,
        }),
      ).toBeTruthy();

      submitAnswer(getPerfectAnswer(questionNumber));

      fireEvent.click(
        screen.getByRole("button", {
          name: questionNumber === 20 ? "See Results" : "Next Question",
        }),
      );
    }

    expect(
      screen.getByRole("heading", { name: "Addition practice finished!" }),
    ).toBeTruthy();
    expect(screen.getByText("20 out of 20")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
    expect(
      screen.getByText(
        "Perfect score! Your golden egg hatched into a Legendary Dragon!",
      ),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Practice Addition Again" }),
    );
    expect(
      screen.getByRole("heading", { name: "Question 1 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Level 1: 4-digit + 3-digit").length,
    ).toBeGreaterThan(0);
  });

  it("runs the timer through the round, saves a faster time, and stops on results", () => {
    vi.useFakeTimers();
    window.localStorage.setItem(ADDITION_BEST_TIME_STORAGE_KEY, "30");
    render(<AdditionPractice onBackToTopics={vi.fn()} />);

    expect(screen.getByLabelText("Elapsed time").textContent).toBe("00:00");
    expect(screen.getByLabelText("Best time").textContent).toBe("00:30");

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByLabelText("Elapsed time").textContent).toBe("00:05");

    for (let questionNumber = 1; questionNumber <= 20; questionNumber += 1) {
      submitAnswer(getPerfectAnswer(questionNumber));
      fireEvent.click(
        screen.getByRole("button", {
          name: questionNumber === 20 ? "See Results" : "Next Question",
        }),
      );
    }

    expect(screen.getByLabelText("Final time").textContent).toBe("00:05");
    expect(screen.getByLabelText("Best time").textContent).toBe("00:05");
    expect(screen.getByText("New Best Time!")).toBeTruthy();
    expect(window.localStorage.getItem(ADDITION_BEST_TIME_STORAGE_KEY)).toBe(
      "5",
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByLabelText("Final time").textContent).toBe("00:05");
  });

  it("wires both results actions", () => {
    const onRestart = vi.fn();
    const onBackToTopics = vi.fn();

    render(
      <AdditionResults
        score={14}
        elapsedSeconds={92}
        bestTimeSeconds={80}
        isNewBestTime={false}
        onRestart={onRestart}
        onBackToTopics={onBackToTopics}
      />,
    );

    expect(screen.getByText("70%")).toBeTruthy();
    expect(screen.getByLabelText("Final time").textContent).toBe("01:32");
    expect(screen.getByLabelText("Best time").textContent).toBe("01:20");
    fireEvent.click(
      screen.getByRole("button", { name: "Practice Addition Again" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Choose Another Topic" }),
    );

    expect(onRestart).toHaveBeenCalledOnce();
    expect(onBackToTopics).toHaveBeenCalledOnce();
  });
});
