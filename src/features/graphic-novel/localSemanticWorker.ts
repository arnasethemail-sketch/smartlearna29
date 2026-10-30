import { AutoModelForSequenceClassification, AutoTokenizer, Tensor, env } from "@huggingface/transformers";
import manifest from "../../../public/checker-model/manifest.json";
import { entailmentProbability, MODEL_MAX_TOKENS, packBertPair, splitTokenWindows, validateSemanticInput } from "./localSemanticCore";

type Job = { id: number; premise: string; hypotheses: string[] };
const workerScope = self as unknown as { location: Location; postMessage: (message: unknown) => void; onmessage: ((event: MessageEvent<Job>) => void) | null };
const assetBase = new URL(`${import.meta.env.BASE_URL}checker-model/`, workerScope.location.origin).href;
const versionedAsset = (path: string) => {
  const file = manifest.files.find((entry) => entry.path === path);
  const url = new URL(path, assetBase);
  if (file) url.searchParams.set("v", file.sha256.slice(0, 16));
  return url.href;
};
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = assetBase;
env.useBrowserCache = true;
if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
  env.backends.onnx.wasm.proxy = false;
  env.backends.onnx.wasm.wasmPaths = {
    mjs: versionedAsset("runtime/ort-wasm-simd-threaded.mjs"),
    wasm: versionedAsset("runtime/ort-wasm-simd-threaded.wasm"),
  };
}

const tell = (id: number, message: string) => workerScope.postMessage({ id, type: "progress", message });
let resources: Promise<{ tokenizer: Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>>; model: Awaited<ReturnType<typeof AutoModelForSequenceClassification.from_pretrained>> }> | null = null;

async function verifyAndCacheAssets(id: number) {
  const totalBytes = manifest.files.reduce((sum, file) => sum + file.bytes, 0);
  const megabytes = (bytes: number) => (bytes / 1_000_000).toFixed(1);
  tell(id, `Preparing the free on-device checker (${megabytes(totalBytes)} MB). It downloads once on this browser.`);
  let cache: Cache | null = null;
  const modelHash = manifest.files.find((file) => file.path.endsWith(".onnx"))?.sha256.slice(0, 16);
  try { if (typeof caches !== "undefined") cache = await caches.open(`smartlearn-checker-${manifest.revision}-${modelHash}-${manifest.runtimeVersion}`); } catch { /* Private browsing may disallow persistent caches. */ }
  const verified = new Map<string, Response>();
  let completedBytes = 0;
  for (const file of manifest.files) {
    const url = new URL(file.path, assetBase).href;
    let response = await cache?.match(url);
    const cached = Boolean(response);
    if (!response) response = await fetch(versionedAsset(file.path), { credentials: "omit", mode: "same-origin", cache: "force-cache" });
    if (!response.ok) throw new Error("The free checker files could not be downloaded. Please check your connection and try again.");
    const download = response.clone();
    let bytes: ArrayBuffer;
    if (download.body && !cached) {
      const reader = download.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      let reportedAt = 0;
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        chunks.push(part.value);
        received += part.value.byteLength;
        if (received > file.bytes) { await reader.cancel(); throw new Error("A checker file has an unexpected size. Please reload and try again."); }
        const now = performance.now();
        if (now - reportedAt > 250 || received === file.bytes) {
          tell(id, `Downloading the free checker: ${megabytes(completedBytes + received)} / ${megabytes(totalBytes)} MB…`);
          reportedAt = now;
        }
      }
      const combined = new Uint8Array(received);
      let offset = 0;
      for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.byteLength; }
      bytes = combined.buffer;
    } else bytes = await download.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    if (bytes.byteLength !== file.bytes || hash !== file.sha256) throw new Error("A checker file failed its integrity check. Please reload and try again.");
    completedBytes += file.bytes;
    tell(id, `Preparing the free checker: ${Math.round(completedBytes / totalBytes * 100)}%…`);
    verified.set(url, response.clone());
    try { await cache?.put(url, response.clone()); } catch { /* A full cache must not block a downloaded model. */ }
  }
  env.useBrowserCache = false;
  env.useCustomCache = true;
  env.customCache = {
    match: async (key: string) => verified.get(String(key))?.clone(),
    put: async (key: string, response: Response) => { verified.set(String(key), response.clone()); },
  };
}

async function loadResources(id: number) {
  if (!resources) {
    resources = (async () => {
      await verifyAndCacheAssets(id);
      tell(id, "Starting the free checker on this device…");
      const [tokenizer, model] = await Promise.all([
        AutoTokenizer.from_pretrained("xtremedistil", { local_files_only: true }),
        // Download uses lossless half-size weight storage; all compute stays FLOAT32.
        AutoModelForSequenceClassification.from_pretrained("xtremedistil", { dtype: "fp32", device: "wasm", local_files_only: true }),
      ]);
      const labelMap = (model.config as unknown as { id2label?: Record<string, string> }).id2label;
      if (labelMap?.[0] !== "entailment" || labelMap?.[1] !== "not_entailment") throw new Error("The checker model has an unsupported label mapping.");
      return { tokenizer, model };
    })().catch((error) => { resources = null; throw error; });
  }
  return resources;
}

async function check(job: Job) {
  validateSemanticInput(job.premise, job.hypotheses);
  if (!job.hypotheses.length) return [];
  if (!job.premise.trim()) return job.hypotheses.map(() => 0);
  const { tokenizer, model } = await loadResources(job.id);
  const encode = (text: string) => tokenizer.encode(text, { add_special_tokens: false });
  const premiseIds = encode(job.premise);
  const hypotheses = job.hypotheses.map(encode);
  const longest = Math.max(...hypotheses.map((ids) => ids.length));
  const capacity = MODEL_MAX_TOKENS - longest - 3;
  const sentenceEndIds = new Set([".", "?", "!", ";"].flatMap(encode));
  const windows = splitTokenWindows(premiseIds, capacity, sentenceEndIds);
  const emptySentence = tokenizer.encode("", { add_special_tokens: true });
  const [clsId, sepId] = emptySentence;
  if (emptySentence.length !== 2) throw new Error("The checker tokenizer has unsupported sentence boundaries.");
  if (typeof clsId !== "number" || typeof sepId !== "number") throw new Error("The checker tokenizer has unsupported sentence boundaries.");
  const scores = hypotheses.map(() => 0);
  for (let chunkIndex = 0; chunkIndex < windows.length; chunkIndex += 1) {
    tell(job.id, windows.length > 1 ? `Checking section ${chunkIndex + 1} of ${windows.length} on this device…` : "Checking your ideas on this device…");
    for (let ideaIndex = 0; ideaIndex < hypotheses.length; ideaIndex += 1) {
      const pair = packBertPair(windows[chunkIndex].ids, hypotheses[ideaIndex], clsId, sepId);
      const tensor = (values: number[]) => new Tensor("int64", BigInt64Array.from(values, (value) => BigInt(value)), [1, values.length]);
      const inputs = { input_ids: tensor(pair.inputIds), attention_mask: tensor(pair.attentionMask), token_type_ids: tensor(pair.tokenTypeIds) };
      let output: { logits: Tensor } | undefined;
      try {
        output = await model(inputs) as { logits: Tensor };
        scores[ideaIndex] = Math.max(scores[ideaIndex], entailmentProbability(output.logits.data as ArrayLike<number>));
      } finally {
        Object.values(inputs).forEach((value) => value.dispose());
        output?.logits.dispose();
      }
    }
  }
  return scores;
}

let queue = Promise.resolve();
workerScope.onmessage = (event) => {
  const job = event.data;
  queue = queue.then(async () => {
    try { workerScope.postMessage({ id: job.id, type: "result", scores: await check(job) }); }
    catch (error) { workerScope.postMessage({ id: job.id, type: "error", message: error instanceof Error ? error.message : "The local checker could not finish. Your answer is saved." }); }
  });
};
