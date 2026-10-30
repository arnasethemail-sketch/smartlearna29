import nlp from "compromise";
import nspell from "nspell";
import americanAffixes from "./checker-data/en-US.aff?raw";
import americanWords from "./checker-data/en-US.dic?raw";
import britishAffixes from "./checker-data/en-GB.aff?raw";
import britishWords from "./checker-data/en-GB.dic?raw";
import type { CheckDimension } from "./checking-types";

// Dictionary data is bundled with this lazy-loaded module, not fetched from an
// inference API. Original notices are published under /legal/.
const american = nspell({ aff: americanAffixes, dic: americanWords });
const british = nspell({ aff: britishAffixes, dic: britishWords });
const storyNames = new Set([
  "dracula", "mavis", "jonathan", "johnny", "quasimodo", "quasi", "griffin", "wayne", "frank", "frankenstein", "murray", "martha", "transylvania", "hawaii", "esmeralda", "wanda", "winnie", "bigfoot", "bela", "béla", "zing", "zinged",
]);

for (const name of storyNames) { american.add(name); british.add(name); }

const normalize = (value: string) => value.normalize("NFKC").replace(/[’‘]/g, "'");
const lower = (value: string) => normalize(value).toLocaleLowerCase("en-CA");
const wordsIn = (value: string) => normalize(value).match(/\p{L}[\p{L}\p{M}'-]*/gu) ?? [];

/** Recognise inflections, while never accepting an unrelated substring. */
export function wordAppears(text: string, word: string): boolean {
  const canonical = lower(word).trim();
  if (!canonical) return false;
  if (wordsIn(text).some((token) => lower(token) === canonical)) return true;
  if (!/^\p{L}[\p{L}\p{M}'-]*$/u.test(canonical)) return false;
  return nlp(normalize(text)).has(`{${canonical}}`);
}

function spellingKnown(word: string): boolean {
  if (word.length > 80) return false;
  const baseName = lower(word).replace(/(?:'s|s')$/, "");
  if (storyNames.has(baseName)) return true;
  if (american.correct(word) || british.correct(word) || american.correct(lower(word)) || british.correct(lower(word))) return true;
  return word.includes("-") && word.split("-").every((part) => part.length > 0 && spellingKnown(part));
}

type TaggedTerm = { text: string; tags: string[] };
type TaggedSentence = { text: string; terms: TaggedTerm[] };

export type WritingAnalysis = {
  clarity: CheckDimension;
  conventions: CheckDimension;
  issues: string[];
  wordCount: number;
  hasReason: boolean;
};

/** Limited language checks; word counts never establish meaning or correctness. */
export function analyzeWriting(text: string, { sentences = true }: { sentences?: boolean } = {}): WritingAnalysis {
  const normalized = normalize(text).trim();
  const words = wordsIn(normalized);
  if (!words.length) return {
    clarity: { rating: "revise", feedback: "Write your idea in words so the app can check it." },
    conventions: { rating: "uncertain", feedback: "There is not enough writing to check yet." },
    issues: ["Add a written response."], wordCount: 0, hasReason: false,
  };

  const document = nlp(normalized);
  const parsed = document.json() as TaggedSentence[];
  const conventionIssues: string[] = [];
  const unknownWords = [...new Map(words.filter((word) => !spellingKnown(word)).map((word) => [lower(word), word])).values()];
  for (const word of unknownWords.slice(0, 3)) {
    const suggestions = word.length <= 40 ? [...new Set([...american.suggest(lower(word)), ...british.suggest(lower(word))])].slice(0, 3) : [];
    const displayed = word.length <= 40 ? word : `${word.slice(0, 37)}…`;
    conventionIssues.push(suggestions.length ? `Check the spelling of “${displayed}”; possible spellings include ${suggestions.map((item) => `“${item}”`).join(", ")}.` : `Check the spelling of “${displayed}”. It could also be a name or a word this dictionary does not know.`);
  }
  if (unknownWords.length > 3) conventionIssues.push("There are other words to check for spelling too.");

  if (sentences) {
    if (parsed.some((sentence) => { const firstLetter = sentence.text.match(/\p{L}/u)?.[0]; return firstLetter && firstLetter !== firstLetter.toLocaleUpperCase("en-CA"); })) conventionIssues.push("Begin each sentence with a capital letter.");
    if (!/[.!?](?:["”’')\]])*$/u.test(normalized)) conventionIssues.push("Finish the last sentence with a full stop, question mark or exclamation mark.");
    if (/\bi\b/u.test(normalized)) conventionIssues.push("Use a capital I when you mean yourself.");
    if (/\b(?:he|she|it)\s+(?:always\s+|often\s+|sometimes\s+)?(?:are|have|do|go|want|need|like|walk|build|say|think)\b/iu.test(normalized) || /\b(?:we|they|you)\s+is\b|\bI\s+(?:is|are)\b/u.test(normalized)) conventionIssues.push("Check that the subject and its verb agree, such as “he goes” or “they go”.");
    const repeated = normalized.match(/\b(the|a|an|is|to|of|and)\s+\1\b/iu)?.[1];
    if (repeated) conventionIssues.push(`Check whether you meant to repeat “${repeated}”.`);
  }

  const missingVerb = sentences && parsed.some((sentence) => !sentence.terms.some((term) => term.tags.includes("Verb")));
  const clarity: CheckDimension = missingVerb
    ? { rating: "developing", feedback: "Check that each sentence gives a complete idea with an action or a linking verb. The app may not recognise every valid sentence." }
    : { rating: "ready", feedback: sentences ? "The sentence structure passed these basic checks. Read it aloud to check that your idea is easy to follow." : "Short phrases are fine in this field. Their meaning is checked separately." };
  const conventions: CheckDimension = conventionIssues.length
    ? { rating: "developing", feedback: conventionIssues.slice(0, 3).join(" ") }
    : { rating: "ready", feedback: sentences ? "Spelling, capitals and end punctuation passed these basic checks. This is not a complete grammar check." : "Spelling passed these dictionary checks. A definition or synonym can be a short phrase." };
  return {
    clarity, conventions, issues: [...conventionIssues, ...(missingVerb ? [clarity.feedback] : [])], wordCount: words.length,
    hasReason: /\b(?:because|since|therefore|so|for example|as a result|this shows|this means|that means|which means)\b/iu.test(normalized) && document.has("#Verb"),
  };
}

/** A contextual tag is a useful clue, not a certified grammar judgement. */
export function selectionIsPartOfSpeech(sentence: string, selection: string, part: "adjective" | "adverb"): { present: boolean; likely: boolean } {
  const source = lower(sentence);
  const chosen = lower(selection).trim();
  if (!chosen || !wordsIn(chosen).length) return { present: false, likely: false };
  const spans: Array<{ start: number; end: number }> = [];
  let from = 0;
  while (from <= source.length) {
    const start = source.indexOf(chosen, from);
    if (start < 0) break;
    const end = start + chosen.length;
    if ((!source[start - 1] || !/[\p{L}\p{M}\p{N}_]/u.test(source[start - 1])) && (!source[end] || !/[\p{L}\p{M}\p{N}_]/u.test(source[end]))) spans.push({ start, end });
    from = start + Math.max(1, chosen.length);
  }
  if (!spans.length) return { present: false, likely: false };

  const document = nlp(normalize(sentence));
  const parsed = document.json() as TaggedSentence[];
  const terms: Array<TaggedTerm & { start: number; end: number }> = [];
  let cursor = 0;
  for (const term of parsed.flatMap((item) => item.terms)) {
    const token = lower(term.text);
    const start = source.indexOf(token, cursor);
    if (start < 0) continue;
    const end = start + token.length;
    terms.push({ ...term, start, end }); cursor = end;
  }
  const likely = spans.some((span) => {
    const selected = terms.filter((term) => term.start >= span.start && term.end <= span.end);
    if (!selected.length || selected.some((term) => term.tags.includes("Verb"))) return false;
    const last = selected.at(-1)!;
    if (part === "adjective") {
      return (last.tags.includes("Adjective") && selected.every((term) => term.tags.some((tag) => ["Adjective", "Adverb", "Conjunction"].includes(tag)))) || (selected[0].tags.includes("Adjective") && selected.some((term) => term.tags.includes("Preposition")));
    }
    const precedingVerb = terms.some((term) => term.end <= span.start && term.tags.includes("Verb"));
    const possibleAdverbialPhrase = selected.length > 1 && selected[0].tags.includes("Preposition") && lower(selected[0].text) !== "of" && precedingVerb;
    return (last.tags.includes("Adverb") && selected.every((term) => term.tags.some((tag) => ["Adverb", "Conjunction"].includes(tag)))) || possibleAdverbialPhrase;
  });
  return { present: true, likely };
}
