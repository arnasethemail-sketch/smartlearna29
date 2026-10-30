// Actual free CPU/WASM inference against the bundled production model.
// No student data, model download, hosted inference, or API calls are used.
// Run: node scripts/check-local-semantic-model.mjs
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { AutoTokenizer, env } from "@huggingface/transformers";
import * as ort from "onnxruntime-web/wasm";
import { entailmentProbability, packBertPair } from "../src/features/graphic-novel/localSemanticCore.ts";

async function main() {
  const assets = new URL("../public/checker-model/", import.meta.url);
  const manifest = JSON.parse(await readFile(new URL("manifest.json", assets), "utf8"));
  const fixtures = JSON.parse(await readFile(new URL("../tests/fixtures/local-semantic-cases.json", import.meta.url), "utf8"));
  for (const entry of manifest.files) {
    const bytes = await readFile(new URL(entry.path, assets));
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256, entry.path);
  }
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  env.useFSCache = false;
  env.useBrowserCache = false;
  const tokenizer = await AutoTokenizer.from_pretrained(fileURLToPath(new URL("xtremedistil/", assets)), { local_files_only: true });
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;
  ort.env.wasm.wasmPaths = new URL("runtime/", assets).href;
  ort.env.logLevel = "error";
  const session = await ort.InferenceSession.create(await readFile(new URL("xtremedistil/onnx/model.onnx", assets)), { executionProviders: ["wasm"] });
  const [clsId, sepId] = tokenizer.encode("", { add_special_tokens: true });
  const score = async (premise, hypothesis) => {
    const pair = packBertPair(tokenizer.encode(premise, { add_special_tokens: false }), tokenizer.encode(hypothesis, { add_special_tokens: false }), clsId, sepId);
    const make = (values) => new ort.Tensor("int64", BigInt64Array.from(values, BigInt), [1, values.length]);
    const inputs = { input_ids: make(pair.inputIds), attention_mask: make(pair.attentionMask), token_type_ids: make(pair.tokenTypeIds) };
    let output;
    try { output = await session.run(inputs); return entailmentProbability(output.logits.data); }
    finally { Object.values(inputs).forEach((tensor) => tensor.dispose()); if (output) Object.values(output).forEach((tensor) => tensor.dispose()); }
  };
  const results = [];
  try {
    for (const example of fixtures.cases) {
      const forward = await score(example.premise, example.hypothesis);
      const reverse = await score(example.hypothesis, example.premise);
      assert.ok(Math.abs(forward - example.sourceFP32.forward) < 0.00002, `${example.id}: forward differs from pinned source`);
      assert.ok(Math.abs(reverse - example.sourceFP32.reverse) < 0.00002, `${example.id}: reverse differs from pinned source`);
      results.push({ id: example.id, humanMeaning: example.humanMeaning, forward, reverse });
    }
    for (const result of results.filter((example) => example.humanMeaning === "not-entailed")) {
      assert.ok(Math.max(result.forward, result.reverse) < 0.1, `${result.id}: wrong/negated diagnostic was falsely accepted`);
    }
    const byId = Object.fromEntries(results.map((result) => [result.id, result]));
    assert.ok(Math.max(byId["refuge-paraphrase"].forward, byId["refuge-paraphrase"].reverse) > 0.9);
    assert.ok(byId["coop-paraphrase"].forward > 0.8);
    assert.ok(byId["builder-paraphrase"].forward > byId["builder-negated"].forward + 0.5);
    console.log(JSON.stringify({
      passed: true,
      mode: "Actual single-thread CPU WASM, same bundled files as the browser, no API",
      pairs: results.length,
      sourceTolerance: 0.00002,
      results,
      limitation: "Some context-dependent valid paraphrases score low. This diagnostic verifies packaging and conservative separation; it does not prove universal grading accuracy.",
    }, null, 2));
  } finally { await session.release(); }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
