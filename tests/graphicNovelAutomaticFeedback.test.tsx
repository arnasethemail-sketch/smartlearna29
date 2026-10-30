// @vitest-environment jsdom
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutomaticFeedback } from "../src/features/graphic-novel/AutomaticFeedback";
import { Comprehension, ParagraphWorkshop, ReviewPanel, TextFeatures, Vocabulary, VocabularyBank, type ExerciseProps } from "../src/features/graphic-novel/Exercises";
import { chapters } from "../src/features/graphic-novel/data";
import { checkTargetKey, checkWrittenResponse, currentCheckFingerprint } from "../src/features/graphic-novel/checking";
import type { AutomaticCheck, CheckRating, CheckTarget } from "../src/features/graphic-novel/checking-types";
import { createChapterWork } from "../src/features/graphic-novel/progress";
import type { ChapterWork } from "../src/features/graphic-novel/types";
import type { ComponentType } from "react";

vi.mock("../src/features/graphic-novel/checking", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/features/graphic-novel/checking")>();
  return { ...actual, checkWrittenResponse: vi.fn() };
});

const chapter = chapters[0];
const target: CheckTarget = { kind: "comprehension", id: chapter.comprehension[0].id };
const key = checkTargetKey(target);
const originalAnswer = "The builder warned against bright fires because people could discover the hidden hotel.";

function preparedWork() {
  const work = createChapterWork(chapter);
  work.comprehension[target.id].answer = originalAnswer;
  work.comprehension[target.id].type = "Right There";
  return work;
}

function resultFor(work: ChapterWork, rating: CheckRating = "ready"): AutomaticCheck {
  return {
    schemaVersion: 1, targetKey: key, inputFingerprint: currentCheckFingerprint(chapter, work, target),
    checkedAt: "2026-10-30T00:00:00.000Z", method: "local-rules-v1", overall: rating,
    summary: rating === "uncertain" ? "I cannot confidently judge the meaning of this answer yet." : "You answered the question and gave a relevant reason.",
    dimensions: { meaning: { rating, feedback: "Consider the builder’s warning." }, support: { rating: "ready", feedback: "You explained why the warning matters." }, clarity: { rating: "ready", feedback: "Your idea is easy to follow." }, conventions: { rating: "ready", feedback: "Your sentence begins with a capital." } },
    strengths: ["You explained the reason for staying hidden."], nextSteps: rating === "uncertain" ? ["Reread panel 7 and explain the warning in your own words."] : [], evidencePanelIds: ["ch01-p07"],
  };
}

function renderCheck(initial = preparedWork()) {
  let latest = initial;
  function Harness() {
    const [work, update] = useState(initial);
    latest = work;
    return <><label>Test answer<textarea value={work.comprehension[target.id].answer} onChange={(event) => update((old) => ({ ...old, comprehension: { ...old.comprehension, [target.id]: { ...old.comprehension[target.id], answer: event.target.value } } }))} /></label><AutomaticFeedback chapter={chapter} work={work} target={target} update={update} label="Check my answer" /></>;
  }
  return { ...render(<Harness />), read: () => latest };
}

describe("Free automatic written-answer feedback", () => {
  beforeEach(() => { vi.mocked(checkWrittenResponse).mockReset(); });
  afterEach(cleanup);

  it("shows and saves four kinds of feedback without changing the learner's answer or requiring a reviewer", async () => {
    vi.mocked(checkWrittenResponse).mockImplementation(async (_chapter, work) => resultFor(work));
    const view = renderCheck();
    fireEvent.click(screen.getByRole("button", { name: "Check my answer" }));
    expect(await screen.findByRole("heading", { name: "Looks good" })).toBeTruthy();
    expect(screen.getByText("Meaning")).toBeTruthy();
    expect(screen.getByText("Support / reasoning")).toBeTruthy();
    expect(screen.getByText("Clarity")).toBeTruthy();
    expect(screen.getByText("Conventions")).toBeTruthy();
    expect(view.read().comprehension[target.id].answer).toBe(originalAnswer);
    expect(view.read().automaticChecks[key]).toMatchObject({ targetKey: key, overall: "ready" });
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("shows progress and discards a result if the learner edits while checking", async () => {
    let finish!: (result: AutomaticCheck) => void;
    const initial = preparedWork();
    vi.mocked(checkWrittenResponse).mockImplementation((_chapter, _work, _target, onProgress) => {
      onProgress?.("Getting the free checker ready…");
      return new Promise((resolve) => { finish = resolve; });
    });
    const view = renderCheck(initial);
    fireEvent.click(screen.getByRole("button", { name: "Check my answer" }));
    expect(screen.getByRole("status").textContent).toBe("Getting the free checker ready…");
    expect(screen.getByRole("button", { name: "Check my answer" }).matches(":disabled")).toBe(true);
    fireEvent.change(screen.getByRole("textbox", { name: "Test answer" }), { target: { value: "My newer draft explains another point." } });
    await act(async () => finish(resultFor(initial)));
    expect(screen.getByRole("alert").textContent).toContain("Check your latest draft again");
    expect(view.read().automaticChecks[key]).toBeUndefined();
    expect(view.read().comprehension[target.id].answer).toBe("My newer draft explains another point.");
  });

  it("marks saved feedback as belonging to an earlier draft after an edit", () => {
    const initial = preparedWork(); initial.automaticChecks[key] = resultFor(initial);
    renderCheck(initial);
    expect(screen.queryByText(/feedback below is for an earlier draft/)).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Test answer" }), { target: { value: "A revised answer with a different explanation." } });
    expect(screen.getByRole("status").textContent).toContain("feedback below is for an earlier draft");
    expect(screen.getByText("EARLIER APP FEEDBACK")).toBeTruthy();
  });

  it("keeps the draft and offers retry when checking fails", async () => {
    vi.mocked(checkWrittenResponse).mockRejectedValue(new Error("Model could not load"));
    const view = renderCheck();
    fireEvent.click(screen.getByRole("button", { name: "Check my answer" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Your writing is still saved");
    expect(view.read().comprehension[target.id].answer).toBe(originalAnswer);
    expect(view.read().automaticChecks[key]).toBeUndefined();
    expect(screen.getByRole("button", { name: "Check my answer" }).matches(":disabled")).toBe(false);
  });

  it("does not save a late result after the response or account component unmounts", async () => {
    let finish!: (result: AutomaticCheck) => void;
    vi.mocked(checkWrittenResponse).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const work = preparedWork(); const update = vi.fn();
    const view = render(<AutomaticFeedback chapter={chapter} work={work} target={target} update={update} label="Check my answer" />);
    fireEvent.click(screen.getByRole("button", { name: "Check my answer" }));
    view.unmount();
    await act(async () => finish(resultFor(work)));
    expect(update).not.toHaveBeenCalled();
  });

  it("refuses feedback that belongs to another target or fingerprint", async () => {
    vi.mocked(checkWrittenResponse).mockImplementation(async (_chapter, work) => ({ ...resultFor(work), targetKey: "comprehension:somebody-else" }));
    const view = renderCheck();
    fireEvent.click(screen.getByRole("button", { name: "Check my answer" }));
    expect((await screen.findByRole("alert")).textContent).toContain("The check could not finish");
    expect(view.read().automaticChecks[key]).toBeUndefined();
  });

  it("shows uncertainty honestly when only free writing rules were available", async () => {
    vi.mocked(checkWrittenResponse).mockImplementation(async (_chapter, work) => resultFor(work, "uncertain"));
    renderCheck();
    fireEvent.click(screen.getByRole("button", { name: "Check my answer" }));
    expect(await screen.findByRole("heading", { name: "Let’s look more closely" })).toBeTruthy();
    expect(screen.getByText(/Meaning checks that could not run are marked uncertain/)).toBeTruthy();
    expect(screen.queryByText(/needs a parent|parent review|choose a reviewer/i)).toBeNull();
  });

  it.each([
    [Comprehension, /^Check my answer to question/, 5],
    [Vocabulary, /^Check word card/, 3],
    [ParagraphWorkshop, /^Check paragraph$/, 1],
    [TextFeatures, /^Check text feature/, 4],
    [VocabularyBank, /^Check reflection$/, 1],
  ] as const)("provides checking controls for every written response in a section", (Component, name, count) => {
    const work = createChapterWork(chapter);
    render(<Component chapter={chapter} work={work} update={vi.fn()} />);
    expect(screen.getAllByRole("button", { name })).toHaveLength(count);
    expect(screen.getAllByRole("button", { name }).every((button) => button.matches(":disabled"))).toBe(true);
    expect(checkWrittenResponse).not.toHaveBeenCalled();
  });

  it("shows a read-only review summary without manual grading fields", () => {
    const work = preparedWork(); work.automaticChecks[key] = resultFor(work);
    const Component: ComponentType<ExerciseProps> = ReviewPanel;
    render(<Component chapter={chapter} work={work} update={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Your work matters more than a score" })).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getAllByText(/Not checked yet\. Use the check button/)).toHaveLength(13);
  });
});
