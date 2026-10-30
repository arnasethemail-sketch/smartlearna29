/** Token budgets and binary entailment math, shared with the model worker. */
export const MODEL_MAX_TOKENS = 512;
export const MAX_SEMANTIC_CHARACTERS = 100_000;
export const MAX_SEMANTIC_HYPOTHESES = 24;

export function validateSemanticInput(premise: string, hypotheses: string[]) {
  if (typeof premise !== "string" || !Array.isArray(hypotheses) || hypotheses.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error("The answer checker received an invalid answer or idea.");
  }
  if (premise.length > MAX_SEMANTIC_CHARACTERS) throw new Error("This answer is too long for one check. Please check a shorter section; your saved answer has not been shortened.");
  if (hypotheses.length > MAX_SEMANTIC_HYPOTHESES) throw new Error("There are too many ideas for one check. Please check one activity at a time.");
}

export type TokenWindow = { start: number; end: number; ids: number[] };

/** Prefer sentence endings, overlap context, and cover every token without truncation. */
export function splitTokenWindows(tokens: number[], capacity: number, sentenceEndIds: Set<number>, overlap = 32): TokenWindow[] {
  if (!Number.isInteger(capacity) || capacity < 32) throw new Error("The checking idea is too long for this model.");
  if (!tokens.length) return [];
  const windows: TokenWindow[] = [];
  const retained = Math.min(Math.max(0, Math.floor(overlap)), Math.floor(capacity / 4));
  let start = 0;
  while (start < tokens.length) {
    let end = Math.min(start + capacity, tokens.length);
    if (end < tokens.length) {
      const minimumEnd = start + Math.ceil(capacity / 2);
      for (let cursor = end - 1; cursor >= minimumEnd; cursor -= 1) {
        if (sentenceEndIds.has(tokens[cursor])) { end = cursor + 1; break; }
      }
    }
    windows.push({ start, end, ids: tokens.slice(start, end) });
    if (windows.length > 256) throw new Error("This answer needs too many checking sections. Please check a shorter section; your saved answer has not been shortened.");
    if (end === tokens.length) break;
    start = Math.max(start + 1, end - retained);
  }
  return windows;
}

/** Equivalent to the pinned BERT tokenizer's [CLS] premise [SEP] hypothesis [SEP]. */
export function packBertPair(premiseIds: number[], hypothesisIds: number[], clsId: number, sepId: number) {
  const inputIds = [clsId, ...premiseIds, sepId, ...hypothesisIds, sepId];
  if (inputIds.length > MODEL_MAX_TOKENS) throw new Error("A checking section exceeded the model's token limit.");
  const firstLength = premiseIds.length + 2;
  return {
    inputIds,
    attentionMask: inputIds.map(() => 1),
    tokenTypeIds: inputIds.map((_, index) => index < firstLength ? 0 : 1),
  };
}

/** The model's labels are exactly entailment=0 and not_entailment=1. */
export function entailmentProbability(logits: ArrayLike<number>) {
  if (logits.length !== 2 || !Number.isFinite(logits[0]) || !Number.isFinite(logits[1])) throw new Error("The local checker returned an invalid model result.");
  const largest = Math.max(logits[0], logits[1]);
  const yes = Math.exp(logits[0] - largest);
  const no = Math.exp(logits[1] - largest);
  return yes / (yes + no);
}
