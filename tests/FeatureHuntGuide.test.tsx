// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeatureHuntGuide } from "../src/features/graphic-novel/FeatureHuntGuide";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("Text feature hunt worked example", () => {
  it("starts open with a separate comic and a full answer for each of the three questions", () => {
    render(<FeatureHuntGuide />);
    const guide = screen.getByText("See a sample question and answer").closest("details") as HTMLDetailsElement;
    expect(guide.open).toBe(true);
    expect(screen.getByText("The missing mooncake")).toBeTruthy();
    expect(screen.getByText("Pip opened the tin. It was empty.")).toBeTruthy();
    expect(screen.getByText("My mooncake is gone!")).toBeTruthy();
    expect(screen.getByText("A speech bubble: “My mooncake is gone!”")).toBeTruthy();
    expect(screen.getByText("It shows Pip’s exact words.")).toBeTruthy();
    expect(screen.getByText("Pip has just noticed that the snack is missing.")).toBeTruthy();
    expect(screen.getByText("The feature’s job:")).toBeTruthy();
    expect(screen.getByText("What I learn:")).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("gives a gentle retry for appearance alone, then explains why the story clue works", () => {
    render(<FeatureHuntGuide />);
    const quickTry = screen.getByText("Try one quick clue").closest("details") as HTMLDetailsElement;
    expect(quickTry.open).toBe(false);
    fireEvent.click(screen.getByText("Try one quick clue"));
    expect(quickTry.open).toBe(true);
    expect(screen.queryByRole("status")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "The speech bubble has a nice shape." }));
    expect(screen.getByRole("status").textContent).toContain("Have another go!");
    expect(screen.getByRole("status").textContent).toContain("Pip or the missing snack");

    fireEvent.click(screen.getByRole("button", { name: "I learn that Pip has noticed the missing mooncake." }));
    expect(screen.getByRole("status").textContent).toContain("You explained what you learned about this scene");
    expect(screen.getByRole("button", { name: "I learn that Pip has noticed the missing mooncake." }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "The speech bubble has a nice shape." }).getAttribute("aria-pressed")).toBe("false");
  });

  it("keeps the optional practice separate from saved chapter progress and external services", () => {
    localStorage.setItem("existing-chapter-progress", "unchanged");
    const save = vi.spyOn(Storage.prototype, "setItem");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<FeatureHuntGuide />);
    fireEvent.click(screen.getByText("Try one quick clue"));
    fireEvent.click(screen.getByRole("button", { name: "The speech bubble has a nice shape." }));
    fireEvent.click(screen.getByRole("button", { name: "I learn that Pip has noticed the missing mooncake." }));
    expect(save).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem("existing-chapter-progress")).toBe("unchanged");
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("lets the learner fold the example away and reopen it for another look", () => {
    render(<FeatureHuntGuide />);
    const summary = screen.getByText("See a sample question and answer");
    const guide = summary.closest("details") as HTMLDetailsElement;
    fireEvent.click(summary);
    expect(guide.open).toBe(false);
    fireEvent.click(summary);
    expect(guide.open).toBe(true);
    expect(screen.getByText("It shows Pip’s exact words.")).toBeTruthy();
  });
});
