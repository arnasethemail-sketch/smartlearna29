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

    fireEvent.click(screen.getByRole("button", { name: "Start Addition" }));

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

  it("keeps Subtraction as the existing placeholder", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Start Subtraction" }));
    expect(screen.getByText("You selected Subtraction")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Back to Topics" }));
    expect(
      screen.getByRole("button", { name: "Start Subtraction" }),
    ).toBeTruthy();
  });
});
