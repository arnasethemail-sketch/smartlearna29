// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "../src/App";

describe("Story Adventures entry flow", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("adds Story Adventures as the fifth English topic and opens lesson 1", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Choose subject" }));
    fireEvent.click(
      screen.getByRole("menuitemradio", {
        name: "English, 6 practice topics",
      }),
    );

    expect(screen.getByRole("heading", { name: "Story Adventures" })).toBeTruthy();
    expect(screen.getByText("100 lessons")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Start a New Lesson/i }));
    expect(
      await screen.findByRole(
        "heading",
        { name: "Story Adventures" },
        { timeout: 15_000 },
      ),
    ).toBeTruthy();
    expect(screen.getByText("0 / 100")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Start a New Lesson" }));
    expect(
      screen.getAllByRole("heading", {
        name: "Who Is Bark Bolt? A School Mystery",
      }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Lesson 1 of 100").length).toBeGreaterThan(0);
  });
});
