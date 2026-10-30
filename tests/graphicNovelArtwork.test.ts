import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { chapters } from "../src/features/graphic-novel/data";
import manifest from "../src/features/graphic-novel/artwork-manifest.json";

const artwork = manifest as Record<string, { src: string; alt: string }>;
const panelIds = chapters.flatMap((chapter) => chapter.panels.map((panel) => panel.id));
const artDirectory = new URL("../public/graphic-novel/", import.meta.url);
const promptDocument = JSON.parse(readFileSync(new URL("../docs/graphic-novel-art-prompts.json", import.meta.url), "utf8")) as {
  mode: string;
  count: number;
  assets: Array<{ id: string; prompt: string; asset: string; alt: string; sha256: string; reviewed: boolean }>;
};

// Read the standard RIFF/VP8 headers directly so CI needs no image library.
function webpInfo(bytes: Buffer) {
  expect(bytes.toString("ascii", 0, 4)).toBe("RIFF");
  expect(bytes.toString("ascii", 8, 12)).toBe("WEBP");
  expect(bytes.readUInt32LE(4) + 8).toBe(bytes.length);
  const chunks: string[] = [];
  let dimensions: { width: number; height: number } | undefined;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const kind = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    expect(start + size).toBeLessThanOrEqual(bytes.length);
    chunks.push(kind);
    if (kind === "VP8X") {
      expect(size).toBeGreaterThanOrEqual(10);
      dimensions = { width: bytes.readUIntLE(start + 4, 3) + 1, height: bytes.readUIntLE(start + 7, 3) + 1 };
    } else if (kind === "VP8L") {
      expect(size).toBeGreaterThanOrEqual(5);
      expect(bytes[start]).toBe(0x2f);
      const bits = bytes.readUInt32LE(start + 1);
      dimensions ??= { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    } else if (kind === "VP8 ") {
      expect(size).toBeGreaterThanOrEqual(10);
      expect([...bytes.subarray(start + 3, start + 6)]).toEqual([0x9d, 0x01, 0x2a]);
      dimensions ??= { width: bytes.readUInt16LE(start + 6) & 0x3fff, height: bytes.readUInt16LE(start + 8) & 0x3fff };
    }
    offset = start + size + (size % 2);
  }
  expect(dimensions).toBeDefined();
  return { ...dimensions!, chunks };
}

describe("Complete production graphic-novel artwork", () => {
  it("maps every canonical panel to exactly one delivered image with descriptive alternative text", () => {
    expect(panelIds).toHaveLength(192);
    expect(Object.keys(artwork).sort()).toEqual([...panelIds].sort());
    expect(readdirSync(artDirectory).sort()).toEqual(panelIds.map((id) => `${id}.webp`).sort());
    for (const id of panelIds) {
      expect(artwork[id].src, id).toBe(`/graphic-novel/${id}.webp`);
      expect(artwork[id].alt.trim().length, id).toBeGreaterThanOrEqual(30);
      expect(artwork[id].alt.trim().split(/\s+/).length, id).toBeGreaterThanOrEqual(6);
      expect(artwork[id].alt, id).not.toMatch(/\b(?:placeholder|TODO|lorem ipsum)\b/i);
    }
  });

  it("delivers 192 distinct full-resolution still images without private image metadata", () => {
    const hashes = new Set<string>();
    for (const id of panelIds) {
      const bytes = readFileSync(new URL(`${id}.webp`, artDirectory));
      expect(bytes.length, id).toBeGreaterThan(1000);
      const info = webpInfo(bytes);
      expect({ width: info.width, height: info.height }, id).toEqual({ width: 1536, height: 1024 });
      expect(info.chunks, id).not.toContain("ANIM");
      expect(info.chunks, id).not.toContain("ANMF");
      expect(info.chunks, id).not.toContain("EXIF");
      expect(info.chunks, id).not.toContain("XMP ");
      hashes.add(createHash("sha256").update(bytes).digest("hex"));
    }
    expect(hashes.size).toBe(192);
  });

  it("matches every delivered asset to its reviewed, sanitized production prompt and checksum", () => {
    expect(promptDocument.mode).toBe("built-in image_gen");
    expect(promptDocument.count).toBe(192);
    expect(promptDocument.assets).toHaveLength(192);
    expect(promptDocument.assets.map((asset) => asset.id).sort()).toEqual([...panelIds].sort());
    for (const asset of promptDocument.assets) {
      expect(asset.reviewed, asset.id).toBe(true);
      expect(asset.asset, asset.id).toBe(`public/graphic-novel/${asset.id}.webp`);
      expect(asset.alt, asset.id).toBe(artwork[asset.id].alt);
      expect(asset.prompt.trim().length, asset.id).toBeGreaterThan(100);
      const bytes = readFileSync(new URL(`${asset.id}.webp`, artDirectory));
      expect(asset.sha256, asset.id).toBe(createHash("sha256").update(bytes).digest("hex"));
    }
    const publishedDocument = JSON.stringify(promptDocument);
    expect(publishedDocument).not.toMatch(/[A-Za-z]:[\\/]|file:\/\/|\/(?:Users|home)\//);
    expect(publishedDocument).not.toMatch(/reference-only[\\/]|original_user_transcript|"source"\s*:/);
  });
});
