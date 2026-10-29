// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FractionPractice } from "../src/features/fractions/FractionPractice";

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Fractions practice round", () => {
  it("shows a running timer, best time, and empty stars at the start", () => {
    vi.useFakeTimers();
    render(<FractionPractice onBackToTopics={vi.fn()} />);

    expect(screen.getByLabelText("Elapsed time").textContent).toBe("00:00");
    expect(screen.getByLabelText("Best time").textContent).toBe("--");
    expect(screen.getByLabelText("Stars").textContent).toBe("☆☆☆☆☆");

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByLabelText("Elapsed time").textContent).toBe("00:05");
  });

  it("lets the child shade and unshade equal parts", () => {
    render(<FractionPractice onBackToTopics={vi.fn()} />);

    expect(
      screen.getByRole("heading", {
        name: "Color 1/2 of the rectangle.",
      }),
    ).toBeTruthy();

    const firstPart = screen.getByRole("button", { name: "Part 1 of 2" });

    expect(firstPart.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(firstPart);
    expect(firstPart.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("You colored 1 of 2 parts.")).toBeTruthy();

    fireEvent.click(firstPart);
    expect(firstPart.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("You colored 0 of 2 parts.")).toBeTruthy();
  });

  it("allows one retry and accepts a correct second attempt", () => {
    render(<FractionPractice onBackToTopics={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Check My Fraction" }),
    );
    expect(screen.getByText("Not quite. Try again!")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Part 1 of 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Check Again" }));

    expect(screen.getByText("Correct! Great coloring!")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next Question" }));
    expect(
      screen.getByRole("heading", { name: "Question 2 of 20" }),
    ).toBeTruthy();
    expect(screen.queryByText("Score")).toBeNull();
  });

  it("reveals the answer and moves on after a second mistake", () => {
    render(<FractionPractice onBackToTopics={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Check My Fraction" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Check Again" }));

    expect(
      screen.getByText(
        "The correct answer was 1 of 2 parts, which is equal to 1/2.",
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next Question" }));

    expect(
      screen.getByRole("heading", { name: "Question 2 of 20" }),
    ).toBeTruthy();
    expect(screen.queryByText("Score")).toBeNull();
  });

  it("finishes after exactly 20 questions and supports both result actions", () => {
    const onBackToTopics = vi.fn();
    render(<FractionPractice onBackToTopics={onBackToTopics} />);

    for (
      let questionNumber = 1;
      questionNumber <= 20;
      questionNumber += 1
    ) {
      expect(
        screen.getByRole("heading", {
          name: `Question ${questionNumber} of 20`,
        }),
      ).toBeTruthy();

      const partitionMultiplier =
        questionNumber <= 5
          ? 1
          : questionNumber <= 10
            ? 2
            : questionNumber <= 15
              ? 3
              : 4;
      const denominator = questionNumber <= 15 ? 2 : 3;
      const totalParts = denominator * partitionMultiplier;

      for (let partNumber = 1; partNumber <= partitionMultiplier; partNumber += 1) {
        fireEvent.click(
          screen.getByRole("button", {
            name: `Part ${partNumber} of ${totalParts}`,
          }),
        );
      }
      fireEvent.click(
        screen.getByRole("button", { name: "Check My Fraction" }),
      );
      fireEvent.click(
        screen.getByRole("button", {
          name:
            questionNumber === 20 ? "See My Results" : "Next Question",
        }),
      );
    }

    expect(
      screen.getByRole("heading", {
        name: "Fraction practice finished!",
      }),
    ).toBeTruthy();
    expect(screen.getByText("20 / 20")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
    expect(screen.getByText("New Best Time!")).toBeTruthy();
    expect(screen.getByLabelText("Star rating").textContent).toBe("★★★★★");
    expect(screen.getByText("You earned 5 stars!")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Practice Fractions Again" }),
    );
    expect(
      screen.getByRole("heading", { name: "Question 1 of 20" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Exit to Topics" }));
    expect(onBackToTopics).toHaveBeenCalledOnce();
  });
});
