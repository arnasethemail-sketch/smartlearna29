import type { EnglishRegion } from "./types";

const toUS: Array<[RegExp, string]> = [
  [/\bcolour\b/gi, "color"],
  [/\bcolours\b/gi, "colors"],
  [/\brumour\b/gi, "rumor"],
  [/\brumours\b/gi, "rumors"],
  [/\bneighbour\b/gi, "neighbor"],
  [/\bneighbours\b/gi, "neighbors"],
  [/\bfavourite\b/gi, "favorite"],
  [/\bfavourites\b/gi, "favorites"],
  [/\bcentre\b/gi, "center"],
  [/\bcentres\b/gi, "centers"],
  [/\btheatre\b/gi, "theater"],
  [/\btheatres\b/gi, "theaters"],
  [/\btravelling\b/gi, "traveling"],
  [/\btravelled\b/gi, "traveled"],
  [/\btraveller\b/gi, "traveler"],
  [/\btravellers\b/gi, "travelers"],
  [/\bpractised\b/gi, "practiced"],
  [/\bpractising\b/gi, "practicing"],
  [/\bpractises\b/gi, "practices"],
  [/\bbehaviour\b/gi, "behavior"],
  [/\bbehaviours\b/gi, "behaviors"],
  [/\bhumour\b/gi, "humor"],
  [/\blabelled\b/gi, "labeled"],
  [/\blabelling\b/gi, "labeling"],
  [/\bgrey\b/gi, "gray"],
  [/\bdefence\b/gi, "defense"],
  [/\bprogramme\b/gi, "program"],
  [/\bprogrammes\b/gi, "programs"],
  [/\bcatalogue\b/gi, "catalog"],
  [/\bcatalogues\b/gi, "catalogs"],
  [/\bcatalogued\b/gi, "cataloged"],
  [/\bcataloguing\b/gi, "cataloging"],
];

const toCA: Array<[RegExp, string]> = [
  [/\bcolor\b/gi, "colour"],
  [/\bcolors\b/gi, "colours"],
  [/\brumor\b/gi, "rumour"],
  [/\brumors\b/gi, "rumours"],
  [/\bneighbor\b/gi, "neighbour"],
  [/\bneighbors\b/gi, "neighbours"],
  [/\bfavorite\b/gi, "favourite"],
  [/\bfavorites\b/gi, "favourites"],
  [/\bcenter\b/gi, "centre"],
  [/\bcenters\b/gi, "centres"],
  [/\btheater\b/gi, "theatre"],
  [/\btheaters\b/gi, "theatres"],
  [/\btraveling\b/gi, "travelling"],
  [/\btraveled\b/gi, "travelled"],
  [/\btraveler\b/gi, "traveller"],
  [/\btravelers\b/gi, "travellers"],
  [/\bpracticed\b/gi, "practised"],
  [/\bpracticing\b/gi, "practising"],
  [/\bbehavior\b/gi, "behaviour"],
  [/\bbehaviors\b/gi, "behaviours"],
  [/\bhumor\b/gi, "humour"],
  [/\blabeled\b/gi, "labelled"],
  [/\blabeling\b/gi, "labelling"],
  [/\bgray\b/gi, "grey"],
  [/\bdefense\b/gi, "defence"],
];

function preserveInitialCase(original: string, replacement: string) {
  if (original === original.toLocaleUpperCase()) {
    return replacement.toLocaleUpperCase();
  }
  return /^[A-Z]/.test(original)
    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
    : replacement;
}

export function regionalizeText(text: string, region: EnglishRegion) {
  const replacements = region === "US" ? toUS : toCA;
  return replacements.reduce(
    (current, [pattern, replacement]) =>
      current.replace(pattern, (match) => preserveInitialCase(match, replacement)),
    text,
  );
}
