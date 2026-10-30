import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const allowPartial = process.argv.includes("--allow-partial");
const course = JSON.parse(await fs.readFile(path.join(root, "src/features/graphic-novel/course.json"), "utf8"));
const ids = course.chapters.flatMap((chapter) => chapter.panels.map((panel) => panel.id));
const entries = [];
for (const group of ["01-08", "09-16", "17-24", "root"]) {
  const file = path.join(root, `work/graphic-art-${group}.json`);
  try {
    const manifest = JSON.parse(await fs.readFile(file, "utf8"));
    entries.push(...(Array.isArray(manifest) ? manifest : manifest.assets));
  } catch (error) {
    if (!allowPartial || error.code !== "ENOENT") throw error;
  }
}
const images = {};
const prompts = [];
const hashes = new Set();
for (const id of ids) {
  const entry = entries.findLast((item) => item.id === id && item.reviewed);
  if (!entry) {
    if (allowPartial) continue;
    throw new Error(`No reviewed illustration for ${id}`);
  }
  const destination = `public/graphic-novel/${id}.webp`;
  if (entry.destination.replaceAll("\\", "/") !== destination) throw new Error(`Unexpected destination for ${id}`);
  if (typeof entry.alt !== "string" || entry.alt.length < 30) throw new Error(`Missing descriptive alternative text for ${id}`);
  const bytes = await fs.readFile(path.join(root, destination));
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") throw new Error(`Invalid WebP asset ${id}`);
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hashes.has(hash)) throw new Error(`Repeated image bytes for ${id}`);
  hashes.add(hash);
  images[id] = { src: `/graphic-novel/${id}.webp`, alt: entry.alt };
  prompts.push({ id, prompt: entry.prompt, asset: destination, alt: entry.alt, sha256: hash, reviewed: true });
}
if (!allowPartial && Object.keys(images).length !== 192) throw new Error("The complete collection needs 192 distinct reviewed assets.");
await fs.writeFile(path.join(root, "src/features/graphic-novel/artwork-manifest.json"), JSON.stringify(images, null, 2) + "\n");
await fs.mkdir(path.join(root, "docs"), { recursive: true });
await fs.writeFile(path.join(root, "docs/graphic-novel-art-prompts.json"), JSON.stringify({ mode: "built-in image_gen", count: prompts.length, reference: "Shared generated character design reference; private production files are not published.", assets: prompts }, null, 2) + "\n");
process.stdout.write(`${Object.keys(images).length}/192 distinct, reviewed WebP illustrations in the manifest.\n`);
