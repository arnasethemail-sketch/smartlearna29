import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import the authored lesson data without publishing its raw transcript or
// private worksheet-reference paths. Supply the extracted package directory.
const packageDirectory = process.argv[2];
if (!packageDirectory) throw new Error("Expected the extracted course package directory.");
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const original = JSON.parse(await readFile(path.join(packageDirectory, "content", "lesson_content.json"), "utf8"));
const referenceKeys = new Set(["source", "sourcePolicy", "recapSourceRanges", "layoutReferences"]);
function learnerCourse(value) {
  if (Array.isArray(value)) return value.map(learnerCourse);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([key]) => !referenceKeys.has(key)).map(([key, item]) => [key, learnerCourse(item)]));
  }
  return value;
}
const sanitized = learnerCourse(original);
const destination = path.join(repositoryRoot, "src", "features", "graphic-novel", "course.json");
await mkdir(path.dirname(destination), { recursive: true });
await writeFile(destination, `${JSON.stringify(sanitized, null, 2)}\n`);
process.stdout.write(`Imported ${sanitized.chapters.length} chapters, ${sanitized.chapters.reduce((sum, chapter) => sum + chapter.panels.length, 0)} adapted panels, ${sanitized.vocabulary.length} vocabulary words. Raw source/reference fields excluded.\n`);
