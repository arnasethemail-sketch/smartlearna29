// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UcmasPractice } from "../src/features/ucmas/UcmasPractice";

class MockSpeechSynthesisUtterance {
  text: string;
  rate = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

let spokenUtterances: MockSpeechSynthesisUtterance[];

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  spokenUtterances = [];

  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: MockSpeechSynthesisUtterance,
  });
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      cancel: vi.fn(),
      speak: (utterance: MockSpeechSynthesisUtterance) => {
        spokenUtterances.push(utterance);
      },
    },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "SpeechSynthesisUtterance");
  Reflect.deleteProperty(window, "speechSynthesis");
});

function finishCurrentSpokenSequence(speedMs = 1500) {
  for (let valueIndex = 0; valueIndex < 10; valueIndex += 1) {
    const currentUtterance = spokenUtterances.at(-1);
    expect(currentUtterance).toBeTruthy();
    act(() => currentUtterance?.onend?.());

    if (valueIndex < 9) {
      act(() => vi.advanceTimersByTime(speedMs));
    }
  }
}

function startRound() {
  fireEvent.click(
    screen.getByRole("button", { name: "Start Mental Maths" }),
  );
}

describe("UCMAS Mental Maths practice", () => {
  it("keeps values hidden, speaks after Start, then opens a 15-second answer", () => {
    render(<UcmasPractice onBackToTopics={vi.fn()} />);

    expect(screen.getByText("One Digit — 10 Rows")).toBeTruthy();
    expect(screen.getByText("Medium · 1.5 seconds")).toBeTruthy();

    startRound();

    expect(screen.getByRole("heading", { name: "Listen carefully" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Cancel and Back to Topics" }),
    ).toBeTruthy();
    expect(screen.getByText("Question 1 of 10")).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(document.body.textContent).not.toContain("minus one");
    expect(spokenUtterances[0].text).toBe("one");

    finishCurrentSpokenSequence();

    const answerInput = screen.getByLabelText(
      "Your final answer",
    ) as HTMLInputElement;
    expect(document.activeElement).toBe(answerInput);
    expect(screen.getByLabelText("Answer time remaining").textContent).toBe(
      "15",
    );

    for (let second = 0; second < 15; second += 1) {
      act(() => vi.advanceTimersByTime(1000));
    }
    expect(screen.getByRole("heading", { name: "Time is up!" })).toBeTruthy();
    expect(screen.getByText("The correct answer is 0.")).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText("Question 2 of 10")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Listen carefully" })).toBeTruthy();
  });

  it("cancels speech and returns to topics from the listening screen", () => {
    const onBackToTopics = vi.fn();
    render(<UcmasPractice onBackToTopics={onBackToTopics} />);
    startRound();

    const speechCancel = window.speechSynthesis.cancel as ReturnType<
      typeof vi.fn
    >;
    const cancellationCountBeforeExit = speechCancel.mock.calls.length;

    fireEvent.click(
      screen.getByRole("button", { name: "Cancel and Back to Topics" }),
    );

    expect(speechCancel.mock.calls.length).toBeGreaterThan(
      cancellationCountBeforeExit,
    );
    expect(onBackToTopics).toHaveBeenCalledOnce();

    act(() => spokenUtterances.at(-1)?.onend?.());
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.queryByLabelText("Your final answer")).toBeNull();
  });

  it("locks the selected fast speed into the complete round", () => {
    render(<UcmasPractice onBackToTopics={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Speaking speed"), {
      target: { value: "100" },
    });
    expect(screen.getByText("Fast · 0.1 seconds")).toBeTruthy();

    startRound();
    expect(screen.getByText("Speed: Fast · 0.1 seconds")).toBeTruthy();
    expect(spokenUtterances).toHaveLength(1);

    act(() => vi.advanceTimersByTime(99));
    expect(spokenUtterances).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(spokenUtterances).toHaveLength(2);
  });

  it("finishes after exactly 10 submitted questions", () => {
    render(<UcmasPractice onBackToTopics={vi.fn()} />);
    startRound();

    for (let questionNumber = 1; questionNumber <= 10; questionNumber += 1) {
      expect(screen.getByText(`Question ${questionNumber} of 10`)).toBeTruthy();
      finishCurrentSpokenSequence();

      fireEvent.change(screen.getByLabelText("Your final answer"), {
        target: { value: "0" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
      expect(
        screen.getByRole("heading", { name: "Correct! Great listening!" }),
      ).toBeTruthy();
      fireEvent.click(
        screen.getByRole("button", {
          name: questionNumber === 10 ? "See Results" : "Next Question",
        }),
      );
    }

    expect(
      screen.getByRole("heading", { name: "Mental Maths finished!" }),
    ).toBeTruthy();
    expect(screen.getByText("10 out of 10")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
    expect(document.body.textContent).not.toContain("minus one");
  });
});
