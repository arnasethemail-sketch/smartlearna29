import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { AutoTokenizer, env } from "@huggingface/transformers";
import * as ort from "onnxruntime-web/wasm";
import { packBertPair, entailmentProbability } from "../src/features/graphic-novel/localSemanticCore";
import { chapters } from "../src/features/graphic-novel/data";
import { createChapterWork } from "../src/features/graphic-novel/progress";
import { checkWrittenResponse } from "../src/features/graphic-novel/checking";
import { allCheckTargets, currentCheckFingerprint } from "../src/features/graphic-novel/checking-input";
import { checkTargetKey } from "../src/features/graphic-novel/checking-types";

// Run the real grader with the same bundled CPU model as the browser. The bridge
// replaces only Web Worker transport, which is not available in this Node test.
const cpu = vi.hoisted(() => ({ assess: null as null | ((premise: string, ideas: string[]) => Promise<number[]>) }));
vi.mock("../src/features/graphic-novel/localSemanticModel", () => ({ assessIdeas: (premise: string, ideas: string[]) => cpu.assess!(premise, ideas) }));

let session: ort.InferenceSession;
beforeAll(async () => {
  vi.stubGlobal("fetch", () => { throw new Error("This check must use bundled files, never a paid or remote API."); });
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  env.useFSCache = false;
  env.useBrowserCache = false;
  const assets = new URL("../public/checker-model/", import.meta.url);
  const tokenizer = await AutoTokenizer.from_pretrained(fileURLToPath(new URL("xtremedistil/", assets)), { local_files_only: true });
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;
  ort.env.wasm.wasmPaths = new URL("runtime/", assets).href;
  ort.env.logLevel = "error";
  session = await ort.InferenceSession.create(await readFile(new URL("xtremedistil/onnx/model.onnx", assets)), { executionProviders: ["wasm"] });
  const [cls, sep] = tokenizer.encode("", { add_special_tokens: true });
  cpu.assess = async (premise, ideas) => {
    const results: number[] = [];
    for (const idea of ideas) {
      const pair = packBertPair(tokenizer.encode(premise, { add_special_tokens: false }), tokenizer.encode(idea, { add_special_tokens: false }), cls, sep);
      const tensor = (values: number[]) => new ort.Tensor("int64", BigInt64Array.from(values, BigInt), [1, values.length]);
      const inputs = { input_ids: tensor(pair.inputIds), attention_mask: tensor(pair.attentionMask), token_type_ids: tensor(pair.tokenTypeIds) };
      let output: ort.InferenceSession.OnnxValueMapType | undefined;
      try { output = await session.run(inputs); results.push(entailmentProbability(output.logits.data as ArrayLike<number>)); }
      finally { Object.values(inputs).forEach((value) => value.dispose()); if (output) Object.values(output).forEach((value) => value.dispose()); }
    }
    return results;
  };
}, 30_000);
afterAll(async () => { await session?.release(); vi.unstubAllGlobals(); });

const chapter = chapters[0];
async function check(feature: string, purpose: string, help: string) {
  const work = createChapterWork(chapter);
  const id = chapter.textFeaturesHunt.boxes[0].id;
  Object.assign(work.features[id], { feature, purpose, help });
  const saved = JSON.stringify(work);
  const report = await checkWrittenResponse(chapter, work, { kind: "feature", id });
  expect(JSON.stringify(work)).toBe(saved);
  return report;
}

describe("Real offline checks for a child's text-feature explanations", () => {
  it("accepts the first mission's simple narration explanation and its actual people, action and date", async () => {
    const report = await check("Narration box", "It tells us what is happening.", "I learn that Dracula is playing peekaboo with baby Mavis in 1895.");
    expect(report.overall).toBe("ready");
    expect(report.method).toBe("local-rules-v1");
    expect(report.evidencePanelIds).toEqual(["ch01-p01"]);
  });
  it("accepts a simple speech-bubble job and a true detail learned from Dracula's words", async () => {
    const report = await check("Speech bubble", "It shows Dracula's own words.", "I learn that Dracula wants his baby to laugh.");
    expect(report.overall).toBe("ready");
    expect(report.evidencePanelIds).toEqual(["ch01-p01"]);
  });

  it("accepts an exact native date and the supported baby-before-growing-up sequence", async () => {
    const report = await check("Time label", "Its job is to tell us when the story happened.", "It helps me know the baby scene happened in 1895, before Mavis grew up.");
    expect(report.overall).toBe("ready");
    expect(report.method).toBe("local-rules-v1");
    expect(report.dimensions.support.feedback).toContain("date and panel order directly");
  });

  it.each([
    ["Speech bubble", "It shows Dracula's own words.", "I learn that Dracula wants his baby to cry."],
    ["Speech bubble", "It shows Dracula's own words.", "I learn that Dracula does not want his baby to laugh."],
    ["Speech bubble", "It does not show Dracula's own words.", "I learn that Dracula wants his baby to laugh."],
    ["Speech bubble", "I like pizza because it tastes good.", "I learn that Dracula wants his baby to laugh."],
    ["Speech bubble", "It shows Dracula's own words.", "I learn that Dracula rides a spaceship to Mars and laughs."],
    ["Time label", "Its job is to tell us when the story happened.", "It helps me know the baby scene happened in 2095, before Mavis grew up."],
    ["Time label", "Its job is to tell us when the story happened.", "It helps me know the baby scene happened in 1895, after Mavis grew up."],
    ["Time label", "Its job is to tell us when the story happened.", "I learn that the baby scene happened in 1895 and Dracula lives on Mars."],
    ["Time label", "It does not tell us when the story happened.", "It helps me know the baby scene happened in 1895, before Mavis grew up."],
    ["Narration box", "It tells us what is happening.", "I learn that Dracula is playing peekaboo with baby Mavis in 2095."],
    ["Narration box", "It tells us what is happening.", "I learn that Dracula is not playing peekaboo with baby Mavis in 1895."],
    ["Narration box", "It tells us what is happening.", "I learn that Mavis is playing peekaboo with baby Dracula in 1895."],
    ["Narration box", "It does not tell us what is happening.", "I learn that Dracula is playing peekaboo with baby Mavis in 1895."],
    ["Narration box", "It tells us what is happening.", "I learn that Dracula is playing peekaboo with baby Mavis in 1895 and lives on Mars."],
  ])("keeps an unsupported or contradictory response unapproved: %s / %s / %s", async (feature, purpose, help) => {
    const report = await check(feature, purpose, help);
    expect(report.dimensions.support.rating).not.toBe("ready");
    expect(report.overall).not.toBe("ready");
  });

  it("does not pretend it can confirm every visual interpretation", async () => {
    const report = await check("Illustration", "The picture shows how the characters feel.", "I learn that Dracula gently holds Mavis.");
    expect(report.dimensions.meaning.rating).toBe("ready");
    expect(report.dimensions.support.rating).toBe("uncertain");
  });

  it.each(["I spotted an illustration in panel 3.", "I found a picture in panel 3.", "I noticed the image in panel 3."])("accepts a harmless child's feature-name frame: %s", async (feature) => {
    const report = await check(feature, "The picture shows how the characters feel.", "I learn that Dracula gently holds Mavis.");
    expect(report.dimensions.meaning.rating).toBe("ready");
    expect(report.dimensions.support.rating).toBe("uncertain");
  });

  it.each(["I spotted an illustration in panel 99.", "I spotted no illustration in panel 3.", "I noticed a time label in panel 3."])("does not confirm a missing or wrongly placed feature: %s", async (feature) => {
    const report = await check(feature, "It shows the scene.", "It helps me follow the story.");
    expect(report.dimensions.meaning.rating).not.toBe("ready");
    expect(report.overall).not.toBe("ready");
  });

  it("recognises a framed picture and an illustration as the same repeated discovery", async () => {
    const work = createChapterWork(chapter);
    const [first, second] = chapter.textFeaturesHunt.boxes;
    Object.assign(work.features[first.id], { feature: "I spotted a picture in panel 3.", purpose: "The picture shows how the characters feel.", help: "It helps me follow the story." });
    work.features[second.id].feature = "Illustration";
    const report = await checkWrittenResponse(chapter, work, { kind: "feature", id: first.id });
    expect(report.dimensions.meaning.rating).toBe("developing");
    expect(report.nextSteps.join(" ")).toContain("four different discoveries");
  });

  it("invalidates old feature feedback without changing other activity fingerprints", () => {
    const baseline: Record<string, string> = {
      "comprehension:ch01-q01": "free-check-v1:87e1455a:f982548c:149", "comprehension:ch01-q02": "free-check-v1:ca9ab3eb:99a4356b:149", "comprehension:ch01-q03": "free-check-v1:a67fec34:38a9b166:149", "comprehension:ch01-q04": "free-check-v1:22d831fd:a0a3a8ad:149", "comprehension:ch01-q05": "free-check-v1:68afa65e:a2093868:149",
      "vocabulary:ch01-word1": "free-check-v1:8d1041c7:9fadee7f:170", "vocabulary:ch01-word2": "free-check-v1:557c225c:26c8484:170", "vocabulary:ch01-word3": "free-check-v1:3ec5e321:87909dfd:170", "paragraph:ch01": "free-check-v1:81aeba06:a74e04a0:548", "bank-reflection:ch01": "free-check-v1:5c6c6b6e:f4d71cce:266",
      "feature:ch01-feature1": "free-check-v1:6092676a:a84c3a4c:257", "feature:ch01-feature2": "free-check-v1:be51f1a7:279d5d13:257", "feature:ch01-feature3": "free-check-v1:d9c5e274:89c202f6:257", "feature:ch01-feature4": "free-check-v1:655e5321:430beae5:257",
    };
    const work = createChapterWork(chapter);
    for (const target of allCheckTargets(chapter)) {
      const actual = currentCheckFingerprint(chapter, work, target);
      if (target.kind === "feature") expect(actual).not.toBe(baseline[checkTargetKey(target)]);
      else expect(actual).toBe(baseline[checkTargetKey(target)]);
    }
  });
});
