// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatUcmasSpokenValue,
  speakUcmasValues,
} from "../src/features/ucmas/ucmasSpeech";

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
let cancelSpeech: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  spokenUtterances = [];
  cancelSpeech = vi.fn();

  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: MockSpeechSynthesisUtterance,
  });
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      cancel: cancelSpeech,
      speak: (utterance: MockSpeechSynthesisUtterance) => {
        spokenUtterances.push(utterance);
      },
    },
  });
});

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(window, "SpeechSynthesisUtterance");
  Reflect.deleteProperty(window, "speechSynthesis");
});

describe("UCMAS speech", () => {
  it.each([
    ["Fast", 100, 2],
    ["Medium", 1500, 1],
    ["Slow", 3000, 0.9],
  ])(
    "speaks values at the exact %s start-to-start interval",
    (_label, delayMs, expectedRate) => {
    const onComplete = vi.fn();

    speakUcmasValues({
      values: [9, -7, 0],
      delayMs,
      onComplete,
      onUnsupported: vi.fn(),
    });

    expect(cancelSpeech).toHaveBeenCalledOnce();
    expect(spokenUtterances[0].text).toBe("nine");
    expect(spokenUtterances[0].rate).toBe(expectedRate);

    vi.advanceTimersByTime(delayMs - 1);
    expect(spokenUtterances).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(spokenUtterances[1].text).toBe("minus seven");

    vi.advanceTimersByTime(delayMs);
    expect(spokenUtterances[2].text).toBe("zero");
    spokenUtterances[2].onend?.();
    expect(onComplete).toHaveBeenCalledOnce();
    },
  );

  it("formats every supported one-digit value", () => {
    expect(formatUcmasSpokenValue(4)).toBe("four");
    expect(formatUcmasSpokenValue(-9)).toBe("minus nine");
    expect(formatUcmasSpokenValue(0)).toBe("zero");
  });

});
