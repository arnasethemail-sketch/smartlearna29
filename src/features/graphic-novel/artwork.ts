import manifest from "./artwork-manifest.json";

export type PanelArtwork = { src: string; alt: string };
export const panelArtwork = manifest as Record<string, PanelArtwork>;
export const artworkCount = Object.keys(panelArtwork).length;
export function artFor(panelId: string) { return panelArtwork[panelId]; }
export function assetUrl(path: string) { return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`; }
