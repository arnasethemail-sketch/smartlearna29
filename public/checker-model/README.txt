FREE ON-DEVICE ANSWER CHECKER

The application hosts these public model/runtime files on its own static site.
It never sends student answers to an inference service. No API key, subscription,
per-answer charge, server function, or paid provider is needed. The initial lazy
download is 37,753,398 bytes (37.8 decimal MB); the browser caches verified assets.
The model and tokenizer are pinned to the revision in manifest.json. The worker
verifies SHA-256 and exact byte lengths before loading the tokenizer/model.

Model: MoritzLaurer/xtremedistil-l6-h256-zeroshot-v1.1-all-33 (MIT).
Revision: c07f66d9cbf781191bee66edfe8ad7856f045781.
The upstream model card, attribution, and license are retained in xtremedistil/.
ONNXRuntime (MIT) and Transformers.js (Apache-2.0) notices are retained here.

The upstream 13 MB INT8 artifact materially reduced paraphrase accuracy in our
diagnostic cases, so it is not distributed. Instead, we transformed the pinned
51,140,063-byte FLOAT32 source into 25,654,858-byte lossless stored weights:
all 12,750,594 float weights were already exactly representable as FLOAT16.
Each stored initializer is explicitly cast back to FLOAT32 before the original
compute graph uses it. There are no FLOAT16 MatMul operations and no GPU need.
All source values are checked for EXACT equality before the script writes a file.

Reproduce with Node 24+ and the exact npm lockfile dependencies:
1. Download the source ONNX URL recorded in manifest.json.
2. node scripts/repack-local-checker.mjs path/to/source/model.onnx
The script checks both source and output SHA-256 and fails on any changed weight.
The manifest records hashes, tools, provenance, operation and value counts.

Run the actual CPU/WASM diagnostic (no remote inference):
node scripts/check-local-semantic-model.mjs
The 20 authored examples exercise paraphrases, unrelated claims, and negation.
They are packaging/regression diagnostics, not a certified assessment benchmark.
Repacked native CPU scores exactly matched FLOAT32 source scores on all pairs;
single-thread WASM scores matched within 0.00002. Some valid, implicit or
context-dependent answers score low. The model is a binary entailment assistant:
low entailment means uncertainty, not proof an answer is wrong. The app must
combine it conservatively with authored rubrics, grammar and spelling feedback.

The worker reads every token through overlapping windows instead of silently
truncating long answers. A maximum score across windows can miss a contradiction
elsewhere, so the application must not confidently grade long multi-claim text.
WebAssembly unsupported, download failures, and timeouts are reported honestly.
