import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

// Mechanical image preparation only: preserve the generated composition.
const [sharpRoot, destination, ...pairs] = process.argv.slice(2);
if (!sharpRoot || !destination || pairs.length % 2) throw new Error("Expected Sharp package root, destination, then name/source pairs.");
const require = createRequire(import.meta.url);
const sharp = require(path.join(sharpRoot, "sharp"));
await mkdir(destination, { recursive: true });
for (let index = 0; index < pairs.length; index += 2) {
  const [name, source] = pairs.slice(index, index + 2);
  if (!/^(hero|story-\d\d)\.webp$/.test(name)) throw new Error("Unexpected asset filename.");
  const image = await sharp(source).resize({ width: name === "hero.webp" ? 1536 : 1200, withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
  await writeFile(path.join(destination, name), image);
  const metadata = await sharp(image).metadata();
  process.stdout.write(`${name}: ${metadata.width}x${metadata.height}, ${image.length} bytes\n`);
}
