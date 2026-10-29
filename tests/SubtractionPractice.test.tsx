// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SubtractionPractice } from "../src/features/subtraction/SubtractionPractice";

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const PLACE_LABELS_FROM_RIGHT = [
  "Ones digit",
  "Tens digit",
  "Hundreds digit",
  "Thousands digit",
  "Ten-thousands digit",
  "Hundred-thousands digit",
  "Millions digit",
];

function submitAnswer(answer: string) {
  answer
    .split("")
    .reverse()
    .forEach((digit, index) => {
      fireEvent.change(screen.getByLabelText(PLACE_LABELS_FROM_RIGHT[index]), {
        target: { value: digit },
      });
    });
  fireEvent.click(screen.getByRole("button", { name: "Check Answer" }));
}

function completeFiveQuestions(answer: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    submitAnswer(answer);
    fireEvent.click(screen.getByRole("button", { name: "Next Question" }));
  }
}

describe("Subtraction practice round", () => {
  it("starts at Level 1 with seven boxes focused from the ones place", () => {
    render(<SubtractionPractice onBackToTopics={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Question 1 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "1000 − 100" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("textbox")).toHaveLength(7);
    expect(document.activeElement).toBe(screen.getByLabelText("Ones digit"));
    expect(screen.getByLabelText("Elapsed time").textContent).toBe("00:00");
    expect(screen.getByLabelText("Best time").textContent).toBe("--");
  });

  it("levels up after five correct answers and moves down after a miss", () => {
    render(<SubtractionPractice onBackToTopics={vi.fn()} />);

    completeFiveQuestions("900");

    expect(
      screen.getByRole("heading", { name: "Question 6 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "10000 − 1000" }),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Level 2: 5-digit − 4-digit").length,
    ).toBeGreaterThan(0);

    submitAnswer("0");
    expect(screen.getByText("The correct answer is 9000.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next Question" }));

    expect(
      screen.getByRole("heading", { name: "Question 7 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "1000 − 100" }),
    ).toBeTruthy();
    expect(screen.getByText("0 / 5")).toBeTruthy();
  });

  it("reaches Level 4 and finishes exactly 20 questions", () => {
    render(<SubtractionPractice onBackToTopics={vi.fn()} />);

    completeFiveQuestions("900");
    completeFiveQuestions("9000");
    completeFiveQuestions("90000");

    expect(
      screen.getByRole("heading", { name: "Question 16 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "1000000 − 100000" }),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Level 4: 7-digit − 6-digit").length,
    ).toBeGreaterThan(0);

    for (let questionNumber = 16; questionNumber <= 20; questionNumber += 1) {
      submitAnswer("900000");
      fireEvent.click(
        screen.getByRole("button", {
          name: questionNumber === 20 ? "See Results" : "Next Question",
        }),
      );
    }

    expect(
      screen.getByRole("heading", { name: "Subtraction practice finished!" }),
    ).toBeTruthy();
    expect(screen.getByText("20 out of 20")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
    expect(screen.getByLabelText("Final time")).toBeTruthy();
    expect(
      screen.getByText(
        "Perfect score! Your golden egg hatched into a Legendary Dragon!",
      ),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Practice Subtraction Again" }),
    );
    expect(
      screen.getByRole("heading", { name: "Question 1 of 20" }),
    ).toBeTruthy();
  });
});
