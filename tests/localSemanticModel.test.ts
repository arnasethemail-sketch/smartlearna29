import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { entailmentProbability, packBertPair, splitTokenWindows, validateSemanticInput } from "../src/features/graphic-novel/localSemanticCore";
import manifest from "../public/checker-model/manifest.json";

describe("Free local semantic checker model contract", () => {
  it("ships the pinned MIT model and CPU runtime with exact verified bytes below 40 MB", () => {
    expect(manifest.modelId).toBe("MoritzLaurer/xtremedistil-l6-h256-zeroshot-v1.1-all-33");
    expect(manifest.revision).toBe("c07f66d9cbf781191bee66edfe8ad7856f045781");
    expect(manifest.license).toBe("MIT");
    expect(manifest.dtype).toBe("fp16-storage-fp32-compute");
    expect(manifest.repack.maximumWeightError).toBe(0);
    expect(manifest.repack.sourceSha256).toBe("89ca1f96830106de21fcea15b55685060dd6faafd7864a790594910f2e661e3f");
    expect(manifest.files.some((file) => file.path.endsWith("model_quantized.onnx"))).toBe(false);
    expect(manifest.files.reduce((sum, file) => sum + file.bytes, 0)).toBeLessThan(40_000_000);
    for (const file of manifest.files) {
      expect(file.path).not.toContain("..");
      const bytes = readFileSync(new URL(`../public/checker-model/${file.path}`, import.meta.url));
      expect(bytes.length, file.path).toBe(file.bytes);
      expect(createHash("sha256").update(bytes).digest("hex"), file.path).toBe(file.sha256);
    }
    const config = JSON.parse(readFileSync(new URL("../public/checker-model/xtremedistil/config.json", import.meta.url), "utf8"));
    expect(config.architectures).toEqual(["BertForSequenceClassification"]);
    expect(config.id2label).toEqual({ 0: "entailment", 1: "not_entailment" });
    expect(config.max_position_embeddings).toBe(512);
    expect(readFileSync(new URL("../public/checker-model/xtremedistil/LICENSE.txt", import.meta.url), "utf8")).toContain("MIT License");
    expect(readFileSync(new URL("../public/checker-model/xtremedistil/MODEL-CARD.md", import.meta.url), "utf8")).toMatch(/license:\s*mit/);
  });

  it("covers every token of a long answer and overlaps context instead of truncating its tail", () => {
    const tokens = Array.from({ length: 12_000 }, (_, index) => index + 100);
    const windows = splitTokenWindows(tokens, 450, new Set());
    const covered = new Set(windows.flatMap((window) => window.ids));
    expect(covered.size).toBe(tokens.length);
    expect(windows.at(-1)?.end).toBe(tokens.length);
    expect(windows.every((window) => window.ids.length <= 450)).toBe(true);
    expect(windows[1].start).toBe(windows[0].end - 32);
  });

  it("prefers sentence endings while preserving progress and the entire answer", () => {
    const tokens = Array.from({ length: 300 }, (_, index) => index);
    const windows = splitTokenWindows(tokens, 100, new Set([75, 150, 225]));
    expect(windows[0].end).toBe(76);
    expect(new Set(windows.flatMap((window) => window.ids)).size).toBe(300);
    expect(windows.every((window, index) => !index || window.start > windows[index - 1].start)).toBe(true);
    expect(() => splitTokenWindows(tokens, 10, new Set())).toThrow(/too long/);
  });

  it("packs distinct premise and hypothesis segments with the model's 512-token boundary", () => {
    const pair = packBertPair([2010, 2206], [1996, 2338], 101, 102);
    expect(pair.inputIds).toEqual([101, 2010, 2206, 102, 1996, 2338, 102]);
    expect(pair.tokenTypeIds).toEqual([0, 0, 0, 0, 1, 1, 1]);
    expect(pair.attentionMask).toEqual(Array(7).fill(1));
    expect(() => packBertPair(Array(500).fill(5), Array(10).fill(6), 101, 102)).toThrow(/token limit/);
  });

  it("uses stable binary softmax without treating non-entailment as contradiction certainty", () => {
    expect(entailmentProbability([1000, 999])).toBeCloseTo(0.7310585786);
    expect(entailmentProbability([-1000, -999])).toBeCloseTo(0.2689414214);
    expect(entailmentProbability([4, -4])).toBeGreaterThan(0.99);
    expect(() => entailmentProbability([Number.NaN, 0])).toThrow(/invalid/);
    expect(() => entailmentProbability([0, 1, 2])).toThrow(/invalid/);
    expect(() => validateSemanticInput("answer", [""])).toThrow(/invalid/);
  });
});

class TestWorker {
  static instances: TestWorker[] = [];
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  messages: Array<{ id: number; premise: string; hypotheses: string[] }> = [];
  terminated = false;
  constructor(public url: URL, public options: { type: string }) { TestWorker.instances.push(this); }
  postMessage(message: { id: number; premise: string; hypotheses: string[] }) { this.messages.push(message); }
  terminate() { this.terminated = true; }
  reply(message: unknown) { this.onmessage?.({ data: message }); }
}

describe("Local model worker lifecycle", () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.resetModules(); TestWorker.instances = []; });
  async function setup() {
    vi.stubGlobal("Worker", TestWorker);
    return import("../src/features/graphic-novel/localSemanticModel");
  }

  it("does not load a model for no targets or an empty answer", async () => {
    const { assessIdeas } = await setup();
    expect(await assessIdeas("Any answer", [])).toEqual([]);
    expect(await assessIdeas("  ", ["A factual idea."])).toEqual([0]);
    expect(TestWorker.instances).toHaveLength(0);
  });

  it("reuses one module worker, retains a 12,000-character answer and aligns independent results", async () => {
    const { assessIdeas } = await setup();
    const progress = vi.fn();
    const longAnswer = "A thoughtful answer. ".repeat(600);
    const one = assessIdeas(longAnswer, ["First idea", "Second idea"], progress);
    const two = assessIdeas("Another answer", ["Third idea"]);
    expect(TestWorker.instances).toHaveLength(1);
    const worker = TestWorker.instances[0];
    expect(worker.options.type).toBe("module");
    expect(worker.messages[0].premise).toBe(longAnswer);
    worker.reply({ id: worker.messages[0].id, type: "progress", message: "Checking on this device…" });
    worker.reply({ id: worker.messages[1].id, type: "result", scores: [0.3] });
    worker.reply({ id: worker.messages[0].id, type: "result", scores: [0.91, 0.15] });
    expect(await one).toEqual([0.91, 0.15]); expect(await two).toEqual([0.3]);
    expect(progress).toHaveBeenCalledWith("Checking on this device…");
  });

  it("rejects a malformed result instead of displaying an invented successful check", async () => {
    const { assessIdeas } = await setup();
    const result = assessIdeas("An answer", ["An idea"]);
    const worker = TestWorker.instances[0];
    worker.reply({ id: worker.messages[0].id, type: "result", scores: [Number.NaN] });
    await expect(result).rejects.toThrow(/invalid result/);
  });

  it("terminates a hung worker, rejects all queued jobs and permits a fresh attempt", async () => {
    vi.useFakeTimers();
    const { assessIdeas, LOCAL_CHECKER_TIMEOUT_MS } = await setup();
    const first = assessIdeas("One answer", ["One idea"]);
    const second = assessIdeas("Two answer", ["Two idea"]);
    const firstCheck = expect(first).rejects.toThrow(/too long/);
    const secondCheck = expect(second).rejects.toThrow(/too long/);
    await vi.advanceTimersByTimeAsync(LOCAL_CHECKER_TIMEOUT_MS);
    await Promise.all([firstCheck, secondCheck]);
    expect(TestWorker.instances[0].terminated).toBe(true);
    const retry = assessIdeas("Retry answer", ["One idea"]);
    expect(TestWorker.instances).toHaveLength(2);
    const newWorker = TestWorker.instances[1];
    newWorker.reply({ id: newWorker.messages[0].id, type: "result", scores: [0.8] });
    expect(await retry).toEqual([0.8]);
  });
});
