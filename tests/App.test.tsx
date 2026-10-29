// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("topic selection", () => {
  it("starts an Addition round at Level 1", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Grade 4 Math Practice" }),
    ).toBeTruthy();

    document.documentElement.scrollTop = 600;
    fireEvent.click(screen.getByRole("button", { name: "Start Addition" }));

    expect(document.documentElement.scrollTop).toBe(0);
    expect(
      screen.getByRole("heading", { name: "Question 1 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "1000 + 100" }),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Level 1: 4-digit + 3-digit").length,
    ).toBeGreaterThan(0);
  });

  it("starts a Subtraction round at Level 1", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Start Subtraction" }));
    expect(
      screen.getByRole("heading", { name: "Question 1 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "1000 − 100" }),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Level 1: 4-digit − 3-digit").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByLabelText("Elapsed time"),
    ).toBeTruthy();
  });

  it("opens the UCMAS speed setup from the third topic card", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "UCMAS Mental Maths" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Listen to the numbers and calculate the answer in your head.",
      ),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Start Mental Maths" }),
    );

    expect(screen.getByText("One Digit — 10 Rows")).toBeTruthy();
    expect(screen.getByLabelText("Speaking speed")).toBeTruthy();
  });

  it("starts Fractions practice from the fourth topic card", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Fractions" })).toBeTruthy();
    expect(
      screen.getByText(
        "Explore equal parts and learn how fractions fit together.",
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Start Fractions" }));

    expect(
      screen.getByRole("heading", { name: "Question 1 of 20" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: "Color 1/2 of the rectangle.",
      }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Exit to Topics" }));

    expect(
      screen.getByRole("heading", { name: "Math topics" }),
    ).toBeTruthy();
  });
});
