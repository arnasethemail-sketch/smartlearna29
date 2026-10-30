// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MidnightHotel } from "../src/features/midnight-hotel/MidnightHotel";
import { hotelStories } from "../src/features/midnight-hotel";
import { GUEST_PROGRESS_STORAGE_KEY, LearningProgressProvider } from "../src/features/progress";
import * as progressModule from "../src/features/progress";
import type { LearningProgressContextValue, LearningProgressSnapshot } from "../src/features/progress";

function renderHotel() {
  return render(<LearningProgressProvider><MidnightHotel onBackToEnglish={vi.fn()} /></LearningProgressProvider>);
}

function savedSnapshot(): LearningProgressSnapshot {
  return JSON.parse(window.localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY) ?? "{}");
}

describe("Midnight Hotel reading experience", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it.each([
    { phase: "auth initialization", auth: { status: "loading", userId: null, email: null }, syncStatus: "idle" },
    { phase: "initial account save", auth: { status: "authenticated", userId: "hotel-reader", email: "reader@example.test" }, syncStatus: "loading" },
  ] as const)("waits for $phase before showing controls that change reading progress", ({ auth, syncStatus }) => {
    const context: LearningProgressContextValue = {
      snapshot: progressModule.createEmptyLearningProgressSnapshot(),
      auth,
      syncStatus,
      syncMessage: null,
      updatePracticeProgress: vi.fn(),
      resetPracticeAttempt: vi.fn(),
      replacePracticeAttempt: vi.fn(),
      replaceSnapshot: vi.fn(),
      refreshLegacyProgress: vi.fn(),
      syncNow: vi.fn(async () => undefined),
      signIn: vi.fn(async () => ({ ok: true, message: "" })),
      createAccount: vi.fn(async () => ({ ok: true, message: "" })),
      signOut: vi.fn(async () => ({ ok: true, message: "" })),
    };
    const hook = vi.spyOn(progressModule, "useLearningProgress").mockReturnValue(context);
    const onBack = vi.fn();
    const view = render(<MidnightHotel onBackToEnglish={onBack} />);

    expect(screen.getByRole("status").textContent).toContain("Finding your bookmark");
    expect(screen.queryByRole("button", { name: /start story|read story|open story|continue story|next part|finish story/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Back to English" }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(context.updatePracticeProgress).not.toHaveBeenCalled();

    hook.mockReturnValue({ ...context, auth: { ...auth, status: auth.userId ? "authenticated" : "guest" }, syncStatus: "synced" });
    view.rerender(<MidnightHotel onBackToEnglish={onBack} />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("button", { name: "Start story 1" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /^Read story \d+$/ })).toHaveLength(10);
  });

  it("offers all ten stories freely and keeps the reading flow free of exercises", () => {
    renderHotel();
    expect(screen.getByRole("heading", { name: /Welcome to the\s*Midnight Hotel\./ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start story 1" }).matches(":disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "Read story 10" }).matches(":disabled")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Read story 10" }));
    expect(screen.getByRole("heading", { name: hotelStories[9].title })).toBeTruthy();
    expect(screen.getByRole("heading", { name: hotelStories[9].sections[0].title })).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("button", { name: /check answer|submit answer|reveal the ending|rate experience/i })).toBeNull();
    expect(screen.getByRole("button", { name: "Next part" }).matches(":disabled")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Larger text" }));
    expect(screen.getByRole("button", { name: "Larger text" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Standard text" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("restores a bookmark after reopening and records completion only when the reader finishes", async () => {
    const view = renderHotel();
    fireEvent.click(screen.getByRole("button", { name: "Start story 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Next part" }));
    expect(screen.getByRole("heading", { name: hotelStories[0].sections[1].title })).toBeTruthy();
    await waitFor(() => {
      const attempt = Object.values(savedSnapshot().activeAttempts).find((item) => item.metadata?.storyId === hotelStories[0].id);
      expect(attempt?.metadata).toMatchObject({ format: "midnight-hotel-reader-v1", sectionIndex: 1 });
      expect(savedSnapshot().completedAttempts.some((item) => item.metadata?.storyId === hotelStories[0].id)).toBe(false);
    });

    view.unmount();
    renderHotel();
    fireEvent.click(screen.getAllByRole("button", { name: "Continue story 1" })[0]);
    expect(screen.getByRole("heading", { name: hotelStories[0].sections[1].title })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Previous part" }));
    expect(screen.getByRole("heading", { name: hotelStories[0].sections[0].title })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next part" }));
    fireEvent.click(screen.getByRole("button", { name: "Next part" }));
    fireEvent.click(screen.getByRole("button", { name: "Next part" }));
    expect(screen.getByRole("heading", { name: hotelStories[0].sections[3].title })).toBeTruthy();
    expect(savedSnapshot().completedAttempts.some((item) => item.metadata?.storyId === hotelStories[0].id)).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Finish story" }));
    expect(screen.getByRole("heading", { name: "Tucked in. Story finished." })).toBeTruthy();
    await waitFor(() => {
      const attempt = savedSnapshot().completedAttempts.find((item) => item.metadata?.storyId === hotelStories[0].id);
      expect(attempt).toMatchObject({ status: "completed", total: 4, score: 0 });
    });
    fireEvent.click(screen.getByRole("button", { name: "Next story" }));
    expect(screen.getByRole("heading", { name: hotelStories[1].title })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "All 10 stories" }));
    fireEvent.click(screen.getByRole("button", { name: "Read story 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Next part" }));
    await waitFor(() => {
      expect(savedSnapshot().completedAttempts.find((item) => item.metadata?.storyId === hotelStories[0].id)?.status).toBe("completed");
    });
    fireEvent.click(screen.getByRole("button", { name: "All 10 stories" }));
    expect(screen.getByText("1 of 10 finished")).toBeTruthy();
  });
});
