// Rebuild the distributed, MIT-licensed model without paid services or inference.
// Usage: node scripts/repack-local-checker.mjs path/to/pinned/onnx/model.onnx
// Requires Node 24+ (Float16Array) and this repository's pinned npm dependencies.
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { onnx } = require("../node_modules/onnxruntime-web/lib/onnxjs/ort-schema/protobuf/onnx.js");
const root = new URL("../", import.meta.url);
const expectedSourceHash = "89ca1f96830106de21fcea15b55685060dd6faafd7864a790594910f2e661e3f";
const expectedResultHash = "b44b809cc1dc91d8cec959e47f9c86d51c821bca8252c52fbd4c55dfb686a116";
const sourceUrl = "https://huggingface.co/MoritzLaurer/xtremedistil-l6-h256-zeroshot-v1.1-all-33/resolve/c07f66d9cbf781191bee66edfe8ad7856f045781/onnx/model.onnx";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

if (!process.argv[2]) throw new Error(`Provide the downloaded source ONNX file. Pinned source: ${sourceUrl}`);
if (typeof Float16Array === "undefined") throw new Error("Repacking requires Node 24+ with Float16Array support.");
const source = await readFile(process.argv[2]);
if (hash(source) !== expectedSourceHash) throw new Error("Pinned FP32 source checksum mismatch; no output was written.");
const model = onnx.ModelProto.decode(source);
const casts = [];
let convertedInitializers = 0;
let convertedValues = 0;
for (const tensor of model.graph.initializer) {
  if (tensor.dataType !== 1) continue; // Preserve non-FLOAT initializers exactly.
  if (model.graph.input.some((input) => input.name === tensor.name)) throw new Error("Unexpected initializer input.");
  const original = tensor.rawData?.length
    ? new Float32Array(tensor.rawData.buffer.slice(tensor.rawData.byteOffset, tensor.rawData.byteOffset + tensor.rawData.byteLength))
    : Float32Array.from(tensor.floatData ?? []);
  const stored = new Float16Array(original);
  for (let index = 0; index < original.length; index += 1) {
    // The pinned source already stores exactly half-representable weights.
    // Fail closed rather than introducing quantization error in a new revision.
    if (!Number.isFinite(original[index]) || original[index] !== stored[index]) throw new Error("Source weight cannot be stored losslessly as FLOAT16.");
  }
  const originalName = tensor.name;
  tensor.name = `${originalName}__fp16_storage`;
  tensor.dataType = 10;
  tensor.rawData = Buffer.from(stored.buffer);
  tensor.floatData = [];
  casts.push(onnx.NodeProto.create({
    name: `local_checker_restore_fp32_${convertedInitializers}`,
    opType: "Cast",
    input: [tensor.name],
    output: [originalName],
    attribute: [{ name: "to", type: 2, i: 1 }],
  }));
  convertedInitializers += 1;
  convertedValues += original.length;
}
model.graph.node.unshift(...casts);
const result = onnx.ModelProto.encode(model).finish();
if (hash(result) !== expectedResultHash) throw new Error("Repacked artifact checksum mismatch; no output was written.");
const destination = new URL("public/checker-model/xtremedistil/onnx/", root);
await mkdir(destination, { recursive: true });
await writeFile(new URL("model.onnx", destination), result);
console.log(JSON.stringify({
  output: fileURLToPath(new URL("model.onnx", destination)),
  sourceSha256: hash(source),
  resultSha256: hash(result),
  sourceBytes: source.length,
  resultBytes: result.length,
  convertedInitializers,
  convertedValues,
  maximumWeightError: 0,
  compute: "Original FLOAT32 graph; FLOAT16 stored weights explicitly cast to FLOAT32 before use.",
}, null, 2));
