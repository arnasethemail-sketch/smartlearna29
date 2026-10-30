import { describe, expect, it } from "vitest";
import { analyzeWriting, selectionIsPartOfSpeech, wordAppears } from "../src/features/graphic-novel/language-checks";

describe("Free bundled writing and spelling checks", () => {
  it("recognises a practice word and inflected forms without matching a substring", () => {
    expect(wordAppears("Mavis protected her friend.", "protect")).toBe(true);
    expect(wordAppears("They are protecting the hotel.", "protect")).toBe(true);
    expect(wordAppears("She cooperated with him.", "cooperate")).toBe(true);
    expect(wordAppears("The protection kept her safe.", "protect")).toBe(false);
    expect(wordAppears("The uncurious guest left.", "curious")).toBe(false);
    expect(wordAppears("The curious guest arrived.", "curious")).toBe(true);
    expect(wordAppears("The hotel stood nearby.", "hot")).toBe(false);
  });
  it("finds the reported spelling typo without rewriting the answer", () => {
    const text = "My faverite story has a friendly vampire.";
    const result = analyzeWriting(text);
    expect(result.conventions.rating).toBe("developing");
    expect(result.issues.join(" ")).toContain("faverite");
    expect(result.issues.join(" ")).toContain("favorite");
    expect(text).toBe("My faverite story has a friendly vampire.");
  });

  it.each([
    "My favorite color is gray.", "My favourite colour is grey.",
    "Mavis travelled to the centre of the colourful theatre.",
    "Dracula and Jonathan found refuge in the hotel.",
    "Quasimodo watched Mavis’s backpack while Griffin waited.",
  ])("accepts standard spellings and known story names: %s", (text) => {
    expect(analyzeWriting(text).issues.filter((issue) => issue.includes("spelling"))).toEqual([]);
  });

  it("checks capital letters, end punctuation and a clear subject/verb disagreement", () => {
    const result = analyzeWriting("he go to the hotel");
    expect(result.issues.join(" ")).toContain("capital letter");
    expect(result.issues.join(" ")).toContain("Finish the last sentence");
    expect(result.issues.join(" ")).toContain("subject and its verb agree");
  });

  it("allows short definition and synonym phrases without requiring sentences", () => {
    const result = analyzeWriting("a safe place", { sentences: false });
    expect(result.clarity.rating).toBe("ready");
    expect(result.conventions.rating).toBe("ready");
    expect(result.issues).toEqual([]);
  });

  it("flags a possible sentence fragment without claiming complete grammar certification", () => {
    const result = analyzeWriting("The hidden castle.");
    expect(result.clarity.rating).toBe("developing");
    expect(result.clarity.feedback).toContain("may not recognise every valid sentence");
    expect(analyzeWriting("The hotel opened quietly.").conventions.feedback).toContain("not a complete grammar check");
  });

  it("does not approve punctuation-only writing and exposes reason markers as a signal", () => {
    expect(analyzeWriting("...").clarity.rating).toBe("revise");
    expect(analyzeWriting("The hotel stayed hidden because bright fires could attract people.").hasReason).toBe(true);
    expect(analyzeWriting("The hotel stood in a forest.").hasReason).toBe(false);
  });

  it("uses contextual adjective/adverb tags rather than an -ly suffix rule", () => {
    const text = "The friendly guest quietly entered the warm hotel.";
    expect(selectionIsPartOfSpeech(text, "friendly", "adjective")).toEqual({ present: true, likely: true });
    expect(selectionIsPartOfSpeech(text, "friendly", "adverb")).toEqual({ present: true, likely: false });
    expect(selectionIsPartOfSpeech(text, "quietly", "adverb")).toEqual({ present: true, likely: true });
    expect(selectionIsPartOfSpeech(text, "quietly", "adjective")).toEqual({ present: true, likely: false });
    expect(selectionIsPartOfSpeech(text, "hotel", "adjective")).toEqual({ present: true, likely: false });
  });

  it("requires the marked word to appear as a whole word and accepts contextual phrases", () => {
    const text = "The very careful father moved very quietly with great care.";
    expect(selectionIsPartOfSpeech(text, "very careful", "adjective")).toEqual({ present: true, likely: true });
    expect(selectionIsPartOfSpeech(text, "very quietly", "adverb")).toEqual({ present: true, likely: true });
    expect(selectionIsPartOfSpeech(text, "with great care", "adverb")).toEqual({ present: true, likely: true });
    expect(selectionIsPartOfSpeech(text, "care", "adjective")).toEqual({ present: true, likely: false });
    expect(selectionIsPartOfSpeech("The hotel opened.", "hot", "adjective")).toEqual({ present: false, likely: false });
    expect(selectionIsPartOfSpeech(text, "quickly", "adverb")).toEqual({ present: false, likely: false });
    expect(selectionIsPartOfSpeech("The roof of the hotel collapsed.", "of the hotel", "adverb")).toEqual({ present: true, likely: false });
  });
});
