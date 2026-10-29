import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(scriptDirectory);

async function loadLessonBatch(filename, exportName) {
  const source = await readFile(join(projectRoot, filename), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
  const sandbox = { exports: {}, module: { exports: {} } };
  sandbox.module.exports = sandbox.exports;
  vm.runInNewContext(compiled, sandbox, { filename });
  const lessons = sandbox.module.exports[exportName];
  if (!Array.isArray(lessons)) {
    throw new Error(`Could not load ${exportName} from ${filename}.`);
  }
  return lessons;
}

const lessonBatches = [
  [
    "src/features/story-adventures/content/lessons-001-034.ts",
    "lessons001To034",
  ],
  [
    "src/features/story-adventures/content/lessons-035-067.ts",
    "lessons035To067",
  ],
  [
    "src/features/story-adventures/content/lessons-068-100.ts",
    "lessons068To100",
  ],
];
const lessons = (
  await Promise.all(
    lessonBatches.map(([filename, exportName]) =>
      loadLessonBatch(filename, exportName),
    ),
  )
)
  .flat()
  .sort((left, right) => left.sequence - right.sequence);

if (
  lessons.length !== 100 ||
  lessons.some((lesson, index) => lesson.sequence !== index + 1)
) {
  throw new Error("Expected a complete, sequential set of 100 story lessons.");
}

const outputDirectory = join(
  projectRoot,
  "public/story-adventures/illustrations",
);
await mkdir(outputDirectory, { recursive: true });

const palettes = [
  ["#4f6df5", "#dfff38", "#36d3a0", "#ff6b45"],
  ["#246bfd", "#ffd84d", "#19c6b3", "#ff7d89"],
  ["#6658e8", "#ffd45a", "#2fc9a2", "#ff7956"],
  ["#2576d9", "#f6df52", "#3ac7b3", "#f2765b"],
  ["#3859d8", "#f7cf3f", "#31b998", "#ef6c67"],
];
const ink = "#17223b";

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function titleHash(title) {
  let hash = 2166136261;
  for (const character of title) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// These rules search the complete illustration contract, not merely the title.
// Each short label appears with its pictogram so visual QA can compare an SVG
// to the lesson's scene key, alt text, and caption without turning it into a
// text-heavy worksheet.
const cueDefinitions = [
  { key: "paw", label: "paw print", pattern: /paw print|pawprints?|footprints?|tracks?|muddy paw/ },
  { key: "trophy", label: "trophy", pattern: /trophy/ },
  { key: "door", label: "closet", pattern: /closet|cupboard|door\b/ },
  { key: "backpack", label: "backpack", pattern: /backpack/ },
  { key: "sound", label: "sound", pattern: /bark|sound|chime|thump|waveform|audio|microphone|recording|voice-memo/ },
  { key: "school", label: "school", pattern: /school|classroom|gym\b|hallway/ },
  { key: "shadow", label: "shadow", pattern: /shadow|sun angle/ },
  { key: "sun", label: "sun", pattern: /sunlight|sun angle|\bsun\b|sunshine/ },
  { key: "robot", label: "robot", pattern: /robot|rollo/ },
  { key: "map", label: "map", pattern: /map|blueprint|coordinate grid|compass rose|route/ },
  { key: "shoe", label: "shoes", pattern: /shoe|footwear/ },
  { key: "duck", label: "ducklings", pattern: /duckling/ },
  { key: "rain", label: "rain", pattern: /rainy|rainwater|rain travelling|heavy snow|runoff|raindrop/ },
  { key: "bee", label: "bee", pattern: /\bbee|pollination|pollen/ },
  { key: "flower", label: "flower", pattern: /flower|sunflower|bud\b|plant|garden/ },
  { key: "light", label: "light", pattern: /light up|lamp|beacon|lighting|flashing light|emergency lights|ultraviolet/ },
  { key: "clock", label: "clock", pattern: /clock|timestamp|time offset|displayed time/ },
  { key: "crown", label: "crown", pattern: /crown/ },
  { key: "stage", label: "stage", pattern: /stage|theatre|orchestra|scenery|carnival/ },
  { key: "music", label: "music", pattern: /music|cymbal|drum band/ },
  { key: "book", label: "book", pattern: /book|diary|library|letter|newspaper|article|ledger|patent/ },
  { key: "moon", label: "moon", pattern: /moon|moonlight/ },
  { key: "skateboard", label: "skateboard", pattern: /skateboard|wheel track|cart wheel/ },
  { key: "water", label: "water", pattern: /water|lake|creek|ocean|tide|wetland|meltwater|underwater/ },
  { key: "code", label: "code", pattern: /code|symbol|message|letters?|signature|inscription/ },
  { key: "snack", label: "snacks", pattern: /snack|cracker|apple ring|biscuit|dessert/ },
  { key: "chart", label: "chart", pattern: /chart|graph|criteria|diagram|timeline|labelled|checklist|schedule|legend|scale|elevation|cutaway/ },
  { key: "compare", label: "compare", pattern: /compare|comparison|different views|two maps|two plans|two stories|two good answers/ },
  { key: "balloon", label: "balloon", pattern: /balloon/ },
  { key: "hat", label: "hat", pattern: /\bhat\b/ },
  { key: "tree", label: "tree", pattern: /tree|leaves|leaf|forest|rainforest|wooden/ },
  { key: "volcano", label: "volcano", pattern: /volcano|magma|tectonic|hot spot/ },
  { key: "photo", label: "photos", pattern: /photograph|photo\b|frame/ },
  { key: "camera", label: "camera", pattern: /camera/ },
  { key: "screen", label: "forecast", pattern: /forecast screen|computer screen|laptop|monitor/ },
  { key: "radar", label: "radar", pattern: /radar/ },
  { key: "paper", label: "wrapper", pattern: /paper wrapper|paper scraps|printed paper/ },
  { key: "archive", label: "archive", pattern: /archive|historic|history|old records|preserved/ },
  { key: "fox", label: "fox", pattern: /\bfox\b/ },
  { key: "mirror", label: "mirror", pattern: /mirror|reflection|glass maze/ },
  { key: "museum", label: "museum", pattern: /museum|display|artifact/ },
  { key: "earth", label: "Earth", pattern: /earth|planet|orbit|hemisphere|world-ocean|satellite/ },
  { key: "parade", label: "parade", pattern: /parade/ },
  { key: "bell", label: "bell", pattern: /bell|clapper/ },
  { key: "paint", label: "paint", pattern: /paint|mural|colour|pigment/ },
  { key: "magnet", label: "magnet", pattern: /magnet/ },
  { key: "coin", label: "coins", pattern: /coin|medal/ },
  { key: "snow", label: "snow", pattern: /snow|glacier|ice\b|icy/ },
  { key: "sled", label: "sled", pattern: /sled/ },
  { key: "recycle", label: "recycle", pattern: /recycl|blue bin|sorting|processing|manufacturing/ },
  { key: "lighthouse", label: "lighthouse", pattern: /lighthouse|tower/ },
  { key: "bridge", label: "bridge", pattern: /bridge|truss|suspension|beam|arch/ },
  { key: "current", label: "current", pattern: /current|upwelling|surface arrows|deep arrows/ },
  { key: "bird", label: "bird", pattern: /eagle|birds?|wing|moth/ },
  { key: "ant", label: "ants", pattern: /ant colony|ant nest|pheromone|queen chamber/ },
  { key: "meteor", label: "meteorite", pattern: /meteorite/ },
  { key: "storm", label: "storm", pattern: /storm|thunder|lightning|cumulonimbus|forecast/ },
  { key: "rescue", label: "rescue", pattern: /rescue|life-jacket|officer|shelter|safe route/ },
  { key: "probability", label: "chance", pattern: /probability|prediction|nine blue tiles|result/ },
  { key: "medal", label: "medal", pattern: /medal|race/ },
  { key: "magnifier", label: "evidence", pattern: /magnifying|evidence|clue|detective|investigation|mystery|puzzle|secret|riddle/ },
  { key: "people", label: "people", pattern: /nia|bark bolt|students?|classmates?|teams?|witness|residents|council members|officer|engineer|archivist/ },
  { key: "glacier", label: "glacier", pattern: /glacier|flowing ice|moraine|esker|bedrock/ },
  { key: "chest", label: "chest", pattern: /treasure|time-capsule|memory chest|donation box|container/ },
  { key: "sculpture", label: "sculpture", pattern: /sculpture|metal-flower|model/ },
  { key: "forces", label: "forces", pattern: /load|tension|compression|weight|foundation/ },
  { key: "speech", label: "speech", pattern: /speech bubble|rumour|debate|argument|claim|counterclaim/ },
  { key: "link", label: "chain", pattern: /chain|connect|combine|corroborate|shared|link|process|cycle|stages|network|pathway/ },
  { key: "playground", label: "playground", pattern: /playground|recess/ },
  { key: "migration", label: "migration", pattern: /migrat|caribou|monarch|routes by land and air/ },
  { key: "box", label: "box", pattern: /box|case\b|envelope|bag\b/ },
  { key: "filter", label: "filter", pattern: /filter|treatment|settling|disinfect|distribution pipes/ },
  { key: "coral", label: "coral", pattern: /coral|reef|polyp|fish habitat/ },
  { key: "garden", label: "garden", pattern: /garden|raised bed|planter|roots|seedling/ },
  { key: "blueprint", label: "blueprint", pattern: /blueprint|technical drawing|scale bar|plan\b/ },
  { key: "rainforest", label: "rainforest", pattern: /rainforest|canopy|understory|forest floor/ },
  { key: "alarm", label: "alarm", pattern: /alarm|detector|sensor/ },
  { key: "satellite", label: "satellite", pattern: /satellite|orbital|scanning strips/ },
  { key: "checklist", label: "records", pattern: /checklist|blank line|sign-out sheet|form|record|log\b|notes?|minutes|entry/ },
  { key: "wetland", label: "wetland", pattern: /wetland|sediment|plant roots|downstream/ },
  { key: "city", label: "city", pattern: /city|urban|town|community|building/ },
  { key: "ramp", label: "ramp", pattern: /ramp|accessible path/ },
  { key: "gear", label: "inventor", pattern: /inventor|invention|prototype/ },
  { key: "radio", label: "radio", pattern: /radio|waveform/ },
  { key: "cart", label: "cart", pattern: /cart|trolley|bookmobile|vehicle/ },
];

const cueByKey = new Map(cueDefinitions.map((cue) => [cue.key, cue]));

// These are the visual smoke-test lessons. Explicit priority makes the most
// identifying object largest while still deriving every cue from its metadata.
const priorityCues = new Map([
  [1, ["paw", "trophy", "door", "school"]],
  [20, ["snack", "chart", "compare", "school"]],
  [40, ["lighthouse", "light", "photo", "code"]],
  [60, ["magnifier", "sound", "chart", "paper"]],
  [68, ["speech", "link", "playground", "school"]],
  [80, ["storm", "radar", "chart", "screen"]],
  [100, ["chest", "map", "radio", "cart"]],
]);

function metadataText(lesson) {
  return [
    lesson.title,
    lesson.illustration.sceneKey.replaceAll("-", " "),
    lesson.illustration.alt,
    lesson.illustration.caption,
  ]
    .join(" ")
    .toLowerCase();
}

function cuesFor(lesson) {
  const text = metadataText(lesson);
  const keys = [];
  for (const key of priorityCues.get(lesson.sequence) ?? []) {
    if (!cueByKey.has(key)) throw new Error(`Unknown priority cue: ${key}`);
    keys.push(key);
  }
  for (const cue of cueDefinitions) {
    if (cue.pattern.test(text) && !keys.includes(cue.key)) keys.push(cue.key);
  }
  if (keys.length < 3) {
    throw new Error(
      `Lesson ${lesson.sequence} (${lesson.title}) produced only ${keys.length} visual cues: ${keys.join(", ")}`,
    );
  }
  return keys.slice(0, 4).map((key) => cueByKey.get(key));
}

function cueIcon(key, accent, warm, teal) {
  const s = ink;
  const common = `fill="none" stroke="${s}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;
  switch (key) {
    case "paw": return `<g fill="${accent}" stroke="${s}" stroke-width="5"><ellipse cx="50" cy="62" rx="25" ry="21"/><circle cx="24" cy="35" r="10"/><circle cx="44" cy="25" r="10"/><circle cx="66" cy="27" r="10"/><circle cx="81" cy="43" r="10"/></g>`;
    case "trophy": return `<g ${common}><path d="M30 16h40v25q0 25-20 25T30 41Z" fill="${warm}"/><path d="M30 25H14q0 24 21 24M70 25h16q0 24-21 24M50 66v15M31 86h38"/></g>`;
    case "door": return `<g ${common}><path d="M24 10h52v80H24Z" fill="#fff"/><path d="M31 18h38v72H31Z" fill="${teal}"/><circle cx="59" cy="55" r="4" fill="${warm}"/></g>`;
    case "backpack": return `<g ${common}><path d="M31 29q0-18 19-18t19 18M22 39q0-13 13-13h30q13 0 13 13v48H22Z" fill="${teal}"/><path d="M22 48H11v27h11M78 48h11v27H78M34 55h32v22H34Z" fill="${warm}"/></g>`;
    case "sound": return `<g ${common}><path d="M14 42h18l24-19v54L32 58H14Z" fill="${accent}"/><path d="M67 39q16 11 0 22M78 27q31 23 0 46"/></g>`;
    case "school": return `<g ${common}><path d="M12 88h76V37H12Z" fill="#fff"/><path d="M6 37h88L50 10Z" fill="${accent}"/><path d="M42 88V61h16v27M22 53h11M67 53h11"/></g>`;
    case "shadow": return `<g ${common}><circle cx="25" cy="24" r="13" fill="${warm}"/><path d="M55 20v52M55 72l-24 17h55Z" fill="${accent}" opacity=".42"/></g>`;
    case "sun": return `<g ${common}><circle cx="50" cy="50" r="23" fill="${warm}"/><path d="M50 7v13M50 80v13M7 50h13M80 50h13M20 20l9 9M71 71l9 9M80 20l-9 9M29 71l-9 9"/></g>`;
    case "robot": return `<g ${common}><path d="M25 31h50v52H25Z" fill="#fff"/><path d="M50 31V17M40 17h20"/><circle cx="39" cy="51" r="6" fill="${accent}"/><circle cx="61" cy="51" r="6" fill="${warm}"/><path d="M38 69q12 10 24 0M25 46H12M75 46h13"/></g>`;
    case "map": return `<g ${common}><path d="M10 21l27-8 26 8 27-8v66l-27 8-26-8-27 8Z" fill="#fff"/><path d="M37 13v66M63 21v66M19 56q20-30 39 0t24-17" stroke="${accent}" stroke-dasharray="7 7"/><circle cx="82" cy="39" r="6" fill="${warm}"/></g>`;
    case "shoe": return `<g ${common}><path d="M14 63q19-1 26-32l17 11q6 17 28 20l5 5q-2 17-21 17H22q-11 0-8-21Z" fill="${accent}"/><path d="M48 48l13-5M53 55l13-5"/></g>`;
    case "duck": return `<g ${common}><ellipse cx="48" cy="66" rx="31" ry="19" fill="${warm}"/><circle cx="65" cy="40" r="18" fill="${warm}"/><path d="M81 40l14 7-14 7" fill="${accent}"/><circle cx="69" cy="36" r="3" fill="${s}"/><path d="M24 84l-6 8M48 84l-4 8"/></g>`;
    case "rain": return `<g ${common}><path d="M22 48q-6-25 20-27 9-20 29-7 18 0 18 19 10 7 2 20H23" fill="#fff"/><path d="M31 65l-7 15M52 65l-7 15M73 65l-7 15" stroke="${accent}"/></g>`;
    case "bee": return `<g ${common}><ellipse cx="50" cy="55" rx="26" ry="18" fill="${warm}"/><path d="M41 38V72M54 38V72"/><ellipse cx="33" cy="32" rx="15" ry="12" fill="#fff"/><ellipse cx="66" cy="32" rx="15" ry="12" fill="#fff"/><path d="M76 55h13M24 55H12"/></g>`;
    case "flower":
    case "garden": return `<g ${common}><path d="M50 89V52M49 69q-22-17-29 4 17 10 29-4M51 75q22-17 29 4-17 10-29-4" fill="${teal}"/><g fill="${accent}"><circle cx="50" cy="27" r="13"/><circle cx="31" cy="39" r="13"/><circle cx="69" cy="39" r="13"/><circle cx="38" cy="17" r="13"/><circle cx="62" cy="17" r="13"/></g><circle cx="50" cy="30" r="11" fill="${warm}"/></g>`;
    case "light": return `<g ${common}><path d="M29 42q0-24 21-27 21 3 21 27 0 13-13 22v11H42V64Q29 55 29 42Z" fill="${warm}"/><path d="M40 84h20M43 91h14M50 4V0M17 15l8 8M83 15l-8 8"/></g>`;
    case "clock": return `<g ${common}><circle cx="50" cy="51" r="39" fill="#fff"/><path d="M50 23v30l21 14M50 7v7M50 88v7M6 51h8M86 51h8"/><circle cx="50" cy="51" r="5" fill="${accent}"/></g>`;
    case "crown": return `<g ${common}><path d="M13 29l19 18 18-30 18 30 19-18-8 53H21Z" fill="${warm}"/><path d="M22 69h56"/></g>`;
    case "stage": return `<g ${common}><path d="M8 87h84M17 87V25h66v62" fill="#fff"/><path d="M17 25q20 25 33 0 13 25 33 0" fill="${accent}"/><path d="M32 58h36"/></g>`;
    case "music": return `<g ${common}><path d="M43 20v51q0 14-15 14t-15-11q0-12 17-12 8 0 13 4V31l39-8v41q0 14-15 14T52 67q0-12 17-12 8 0 13 4V15Z" fill="${accent}"/></g>`;
    case "book":
    case "archive": return `<g ${common}><path d="M8 22q21-9 42 4v61Q29 75 8 83ZM92 22q-21-9-42 4v61q21-12 42-4Z" fill="#fff"/><path d="M50 26v61M18 42h21M18 55h21M61 42h21M61 55h21" stroke="${accent}"/></g>`;
    case "moon": return `<g ${common}><path d="M68 12q-26 11-26 38t26 38Q19 91 16 51T68 12Z" fill="${warm}"/><path d="M78 21l3 8 9 1-7 6 2 9-7-5-8 5 3-9-7-6 9-1Z" fill="${accent}"/></g>`;
    case "skateboard":
    case "cart": return `<g ${common}><path d="M13 55q36 20 74 0-3 20-19 20H31Q16 75 13 55Z" fill="${accent}"/><circle cx="32" cy="83" r="7" fill="${warm}"/><circle cx="69" cy="83" r="7" fill="${warm}"/></g>`;
    case "water":
    case "current": return `<g ${common}><path d="M50 8Q19 47 19 65a31 31 0 0 0 62 0Q81 47 50 8Z" fill="${accent}"/><path d="M28 67q22-18 44 0" stroke="#fff"/></g>`;
    case "code": return `<g ${common}><path d="M34 25L9 50l25 25M66 25l25 25-25 25M58 14L42 86" stroke="${accent}"/></g>`;
    case "snack": return `<g ${common}><circle cx="38" cy="53" r="27" fill="${warm}"/><circle cx="38" cy="53" r="10" fill="#fff"/><path d="M65 30q18-19 25 0-9 17-25 0Z" fill="${teal}"/><path d="M61 81h30M66 65h20"/></g>`;
    case "chart": return `<g ${common}><path d="M13 12v75h77"/><path d="M25 70l17-19 15 10 24-34" stroke="${accent}"/><circle cx="25" cy="70" r="4" fill="${warm}"/><circle cx="42" cy="51" r="4" fill="${warm}"/><circle cx="57" cy="61" r="4" fill="${warm}"/><circle cx="81" cy="27" r="4" fill="${warm}"/></g>`;
    case "compare": return `<g ${common}><path d="M12 50h76M50 20v60M18 50l12-12M18 50l12 12M82 50L70 38M82 50L70 62" stroke="${accent}"/><circle cx="50" cy="20" r="9" fill="${warm}"/><circle cx="50" cy="80" r="9" fill="${teal}"/></g>`;
    case "balloon": return `<g ${common}><ellipse cx="50" cy="35" rx="27" ry="31" fill="${accent}"/><path d="M44 66h12l-6 9ZM50 75q18 8 0 20"/></g>`;
    case "hat": return `<g ${common}><path d="M30 22h40l9 47H21Z" fill="${warm}"/><ellipse cx="50" cy="72" rx="43" ry="13" fill="${accent}"/></g>`;
    case "tree":
    case "rainforest": return `<g ${common}><path d="M44 60h12v31H44Z" fill="#9b633d"/><circle cx="50" cy="32" r="25" fill="${teal}"/><circle cx="28" cy="49" r="20" fill="${teal}"/><circle cx="72" cy="49" r="20" fill="${teal}"/></g>`;
    case "volcano": return `<g ${common}><path d="M12 88l29-55 12 17 10-17 25 55Z" fill="${accent}"/><path d="M42 31q-9-11 2-18M55 32q12-13 1-24M67 35q12-8 7-19" stroke="${warm}"/><path d="M41 33l12 17 10-17" fill="#fff"/></g>`;
    case "photo":
    case "camera": return `<g ${common}><path d="M11 30h22l8-12h22l8 12h18v55H11Z" fill="#fff"/><circle cx="50" cy="57" r="19" fill="${accent}"/><circle cx="50" cy="57" r="7" fill="${warm}"/></g>`;
    case "screen": return `<g ${common}><rect x="10" y="17" width="80" height="58" rx="6" fill="#fff"/><path d="M42 75v12M30 88h40M22 57l13-13 12 8 20-22 11 8" stroke="${accent}"/><circle cx="67" cy="30" r="5" fill="${warm}"/></g>`;
    case "radar": return `<g ${common}><circle cx="50" cy="50" r="39" fill="#e8f6ff"/><circle cx="50" cy="50" r="25"/><circle cx="50" cy="50" r="10"/><path d="M50 50L80 25A39 39 0 0 1 88 59Z" fill="${teal}" opacity=".7"/><circle cx="70" cy="38" r="5" fill="${warm}"/></g>`;
    case "paper": return `<g ${common}><path d="M20 9h48l12 13v69l-10-7-10 7-10-7-10 7-10-7-10 7Z" fill="#fff"/><path d="M68 9v14h12M32 38h36M32 52h29M32 66h34" stroke="${accent}"/></g>`;
    case "fox": return `<g ${common}><path d="M16 21l22 15q12-8 24 0l22-15-8 43q-5 25-26 25T24 64Z" fill="${accent}"/><path d="M35 59l15 25 15-25" fill="#fff"/><circle cx="36" cy="52" r="4"/><circle cx="64" cy="52" r="4"/><circle cx="50" cy="72" r="5" fill="${s}"/></g>`;
    case "mirror": return `<g ${common}><ellipse cx="50" cy="43" rx="31" ry="37" fill="#dff4ff"/><path d="M50 80v13M35 93h30M37 24l-9 18M53 15l-14 28" stroke="#fff"/></g>`;
    case "museum": return `<g ${common}><path d="M8 34h84L50 9ZM14 34v49M35 34v49M65 34v49M86 34v49M7 84h86" fill="#fff"/><circle cx="50" cy="22" r="5" fill="${warm}"/></g>`;
    case "earth": return `<g ${common}><circle cx="50" cy="50" r="39" fill="#5cc8ff"/><path d="M21 34l17-15 11 8-3 13 17 6 8 17-13 18-17-9-10 8-12-19Z" fill="${teal}"/></g>`;
    case "parade": return `<g ${common}><path d="M23 11v80M25 18q25-12 48 4-22 11-48 1" fill="${accent}"/><path d="M23 73q30-20 57 0" stroke="${warm}" stroke-dasharray="5 8"/></g>`;
    case "bell": return `<g ${common}><path d="M23 65h54Q68 56 68 38q0-20-18-20T32 38q0 18-9 27Z" fill="${warm}"/><path d="M38 73q12 17 24 0"/><circle cx="50" cy="67" r="6" fill="${accent}"/></g>`;
    case "paint": return `<g ${common}><path d="M17 16h45v19H17ZM27 35v18h28V35M40 53v34" fill="${accent}"/><path d="M18 86h44"/><circle cx="76" cy="37" r="13" fill="${warm}"/><circle cx="79" cy="66" r="10" fill="${teal}"/></g>`;
    case "magnet": return `<g ${common}><path d="M18 18v43a32 32 0 0 0 64 0V18H60v43a10 10 0 0 1-20 0V18Z" fill="${accent}"/><path d="M18 35h22M60 35h22" stroke="${warm}"/></g>`;
    case "coin":
    case "medal": return `<g ${common}><path d="M32 8l18 25L68 8" fill="${accent}"/><circle cx="50" cy="62" r="29" fill="${warm}"/><path d="M50 43l6 12 13 2-10 10 3 14-12-7-12 7 3-14-10-10 13-2Z" fill="${accent}"/></g>`;
    case "snow":
    case "glacier": return `<g ${common}><path d="M9 84l22-50 17 19 13-35 30 66Z" fill="#c9efff"/><path d="M31 34l17 19 13-35 9 21-10 11-10-8-8 9Z" fill="#fff"/></g>`;
    case "sled": return `<g ${common}><path d="M23 27v42h53V27M23 49h53M11 79q12 12 30 0h47" fill="${warm}"/><path d="M34 27V15M65 27V15"/></g>`;
    case "recycle": return `<g ${common}><path d="M46 12l14 20H48q-18 0-23 15M83 48l-13 21-6-11q-9-16-27-11M33 85H10l6-11q9-16 0-32" stroke="${teal}"/><path d="M45 12l2 18M83 48L66 57M33 85L18 73"/></g>`;
    case "lighthouse": return `<g ${common}><path d="M36 88h29L60 28H41Z" fill="#fff"/><path d="M35 28h31L58 12H43ZM41 48h20M38 66h25" stroke="${accent}"/><path d="M68 22l24-8M32 22L8 14" stroke="${warm}"/></g>`;
    case "bridge": return `<g ${common}><path d="M7 78h86M18 78V32h64v46M18 44q32 42 64 0M32 62h36"/><path d="M13 87q18-10 36 0t38 0" stroke="${accent}"/></g>`;
    case "bird": return `<g ${common}><path d="M8 55q22-31 42-5 20-26 42 5-23-8-42 25Q31 47 8 55Z" fill="${accent}"/><circle cx="52" cy="48" r="3" fill="${s}"/></g>`;
    case "ant": return `<g ${common}><circle cx="26" cy="51" r="13" fill="${accent}"/><circle cx="50" cy="51" r="16" fill="${accent}"/><ellipse cx="78" cy="51" rx="18" ry="23" fill="${accent}"/><path d="M16 41L7 27M16 61L7 75M42 39L32 22M42 63L32 80M64 35L59 16M64 67L59 86M16 45L8 34M16 57L8 68"/></g>`;
    case "meteor": return `<g ${common}><path d="M73 19L34 54M84 31L45 66M61 8L23 43" stroke="${warm}"/><path d="M24 43q-18 19 0 37t37 0q17-21-16-36Z" fill="${accent}"/><circle cx="32" cy="63" r="7" fill="${warm}"/></g>`;
    case "storm": return `<g ${common}><path d="M18 48q-4-24 21-25 8-18 27-7 20 0 20 20 12 6 4 19H20" fill="#fff"/><path d="M48 55L35 78h15l-7 17 24-29H52l8-11Z" fill="${warm}"/></g>`;
    case "rescue": return `<g ${common}><circle cx="50" cy="50" r="37" fill="#fff"/><circle cx="50" cy="50" r="17" fill="${accent}"/><path d="M24 24l14 14M76 24L62 38M24 76l14-14M76 76L62 62" stroke="${warm}"/></g>`;
    case "probability": return `<g ${common}><rect x="16" y="16" width="68" height="68" rx="13" fill="#fff"/><circle cx="34" cy="34" r="6" fill="${accent}"/><circle cx="66" cy="34" r="6" fill="${warm}"/><circle cx="50" cy="50" r="6" fill="${teal}"/><circle cx="34" cy="66" r="6" fill="${warm}"/><circle cx="66" cy="66" r="6" fill="${accent}"/></g>`;
    case "magnifier": return `<g ${common}><circle cx="42" cy="42" r="27" fill="#fff"/><path d="M62 62l26 26" stroke="${accent}"/><circle cx="36" cy="38" r="7" fill="${warm}"/><path d="M47 53l8-8"/></g>`;
    case "people": return `<g ${common}><circle cx="50" cy="27" r="14" fill="${warm}"/><path d="M28 82q2-35 22-35t22 35Z" fill="${accent}"/><circle cx="20" cy="42" r="10" fill="${teal}"/><circle cx="80" cy="42" r="10" fill="${teal}"/><path d="M6 83q2-25 14-25t14 25M66 83q2-25 14-25t14 25"/></g>`;
    case "chest":
    case "box": return `<g ${common}><path d="M14 42h72v44H14ZM18 42q0-28 32-28t32 28" fill="${warm}"/><path d="M14 58h72M43 53h14v19H43Z" fill="${accent}"/></g>`;
    case "sculpture": return `<g ${common}><path d="M18 87h64M27 87V70h46v17M50 70q-28-8-20-31 5-17 20-26 15 9 20 26 8 23-20 31Z" fill="${accent}"/><path d="M50 13v57"/></g>`;
    case "forces": return `<g ${common}><rect x="32" y="32" width="36" height="36" fill="${warm}"/><path d="M50 5v22M43 13l7-8 7 8M50 95V73M43 87l7 8 7-8M5 50h22M13 43l-8 7 8 7M95 50H73M87 43l8 7-8 7" stroke="${accent}"/></g>`;
    case "speech": return `<g ${common}><path d="M12 17h59v45H35L18 77l4-15H12Z" fill="#fff"/><path d="M30 34h25M30 46h17" stroke="${accent}"/><path d="M61 56h28v25H77l-9 8 2-8h-9" fill="${warm}"/></g>`;
    case "link": return `<g ${common}><path d="M41 59L29 71Q15 85 4 74T8 52l17-17q11-11 23-3M59 41l12-12q14-14 25-3t-4 22L75 65q-11 11-23 3M34 66l32-32" stroke="${accent}"/></g>`;
    case "playground": return `<g ${common}><path d="M13 86L38 15l25 71M26 49h49M75 49l13 37M31 49v28M70 49v28"/><path d="M31 77q20 18 39 0" stroke="${accent}"/></g>`;
    case "migration": return `<g ${common}><path d="M12 77Q33 11 76 30" stroke="${accent}" stroke-dasharray="7 8"/><path d="M69 17l19 14-21 10" fill="${warm}"/><path d="M15 77l11-2-7 10" fill="${teal}"/></g>`;
    case "filter": return `<g ${common}><path d="M15 15h70L61 50v32L39 91V50Z" fill="#fff"/><path d="M25 30h50M31 42h38" stroke="${accent}"/><circle cx="50" cy="64" r="6" fill="${teal}"/></g>`;
    case "coral": return `<g ${common}><path d="M50 89V48M50 62L31 43M31 43V25M50 71l24-21M74 50V28M31 53L16 42M74 61l13-12" stroke="${accent}"/><path d="M9 90q21-13 42 0t40 0" stroke="${teal}"/></g>`;
    case "blueprint": return `<g ${common}><path d="M12 13h76v74H12Z" fill="#dceaff"/><path d="M24 70V35h29v35M53 48h22v22M21 23h56" stroke="${accent}"/><path d="M17 80h66" stroke-dasharray="4 5"/></g>`;
    case "alarm": return `<g ${common}><path d="M30 64h40Q65 57 65 41q0-18-15-18T35 41q0 16-5 23Z" fill="${warm}"/><path d="M23 75h54M50 9V1M18 22l-7-7M82 22l7-7" stroke="${accent}"/></g>`;
    case "satellite": return `<g ${common}><path d="M37 37h26v26H37Z" fill="${warm}"/><path d="M13 18h25v20H13ZM62 62h25v20H62Z" fill="${accent}"/><path d="M20 18l42 44M63 37l18-18M81 19q11 11 4 24"/></g>`;
    case "checklist": return `<g ${common}><path d="M20 10h60v80H20Z" fill="#fff"/><path d="M30 30l6 6 10-13M30 52l6 6 10-13M30 73l6 6 10-13" stroke="${teal}"/><path d="M54 31h16M54 53h16M54 74h16" stroke="${accent}"/></g>`;
    case "wetland": return `<g ${common}><path d="M10 83q20-12 40 0t40 0" stroke="${accent}"/><path d="M26 78V35M26 48L15 31M26 58l14-18M56 79V30M56 45l-12-16M56 57l15-19M80 80V43M80 57l10-12" stroke="${teal}"/></g>`;
    case "city": return `<g ${common}><path d="M10 88V43h25v45M35 88V21h31v67M66 88V51h24v37" fill="#fff"/><path d="M18 56h8M18 69h8M45 36h11M45 52h11M45 68h11M75 64h7" stroke="${accent}"/></g>`;
    case "ramp": return `<g ${common}><path d="M10 82h80M17 73h13l50-42h10v42"/><path d="M30 73h50V31Z" fill="${accent}" opacity=".35"/><circle cx="52" cy="33" r="9" fill="${warm}"/><path d="M52 42v15l13 10M52 49l-12 10"/></g>`;
    case "gear": return `<g ${common}><path d="M50 8l8 10 13-3 4 13 13 4-3 13 10 8-10 8 3 13-13 4-4 13-13-3-8 10-8-10-13 3-4-13-13-4 3-13-10-8 10-8-3-13 13-4 4-13 13 3Z" fill="${accent}"/><circle cx="50" cy="53" r="17" fill="#fff"/></g>`;
    case "radio": return `<g ${common}><path d="M14 31h72v54H14Z" fill="#fff"/><path d="M24 31L68 12M27 57h15M27 69h15"/><circle cx="66" cy="59" r="14" fill="${warm}"/><path d="M16 23q15-12 30 0t30 0" stroke="${accent}"/></g>`;
    default: throw new Error(`No SVG pictogram implemented for cue: ${key}`);
  }
}

function cueCard(cue, x, y, size, accent, warm, teal, featured = false) {
  const scale = size / 100;
  const labelWidth = featured ? 184 : 126;
  const labelX = 50 - labelWidth / (2 * scale);
  return `<g data-cue="${cue.key}" transform="translate(${x} ${y}) scale(${scale})">
    <circle cx="50" cy="50" r="49" fill="#fff" stroke="${accent}" stroke-width="${featured ? 6 : 4}"/>
    <g transform="translate(14 14) scale(.72)">${cueIcon(cue.key, accent, warm, teal)}</g>
    <rect x="${labelX}" y="102" width="${labelWidth / scale}" height="${featured ? 26 : 24}" rx="12" fill="#fff" stroke="${ink}" stroke-width="${3 / scale}"/>
    <text x="50" y="${featured ? 120 : 119}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${featured ? 15 : 13}" font-weight="700" fill="${ink}">${xmlEscape(cue.label)}</text>
  </g>`;
}

function settingFor(keys, accent, warm, teal) {
  if (keys.some((key) => ["water", "current", "storm", "wetland", "coral", "glacier"].includes(key))) {
    return `<path d="M390 570q75-45 150 0t150 0t150 0" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity=".35"/><path d="M420 610q75-38 150 0t150 0" fill="none" stroke="${teal}" stroke-width="12" stroke-linecap="round" opacity=".3"/>`;
  }
  if (keys.some((key) => ["flower", "garden", "tree", "rainforest", "bee", "fox", "migration"].includes(key))) {
    return `<path d="M390 610q105-95 210 0 105-120 220 0Z" fill="${teal}" opacity=".2"/><path d="M430 590q14-38 28 0M760 585q14-42 28 0" fill="none" stroke="${teal}" stroke-width="9"/>`;
  }
  if (keys.some((key) => ["school", "museum", "stage", "city", "lighthouse", "bridge"].includes(key))) {
    return `<path d="M390 610h430v-32h-55v-60h-62v60h-82v-90h-72v90h-59Z" fill="${accent}" opacity=".12"/><path d="M390 610h430" stroke="${accent}" stroke-width="10" opacity=".3"/>`;
  }
  return `<path d="M405 596q55-36 110 0t110 0t110 0" fill="none" stroke="${warm}" stroke-width="12" stroke-linecap="round" stroke-dasharray="3 24" opacity=".55"/>`;
}

function barkBolt(side, accent, yellow) {
  const flip = side === "right" ? "translate(1200 0) scale(-1 1)" : "";
  return `<g data-character="Bark Bolt" transform="${flip}"><path d="M180 360Q75 430 92 590Q160 555 205 490Z" fill="${accent}" stroke="${ink}" stroke-width="9"/><ellipse cx="245" cy="430" rx="105" ry="145" fill="#b96836" stroke="${ink}" stroke-width="10"/><ellipse cx="245" cy="485" rx="58" ry="80" fill="#fff6e9"/><circle cx="238" cy="235" r="112" fill="#b96836" stroke="${ink}" stroke-width="10"/><path d="M150 175Q82 130 90 240Q125 255 165 230ZM330 175Q398 130 390 240Q355 255 315 230Z" fill="#8d472a" stroke="${ink}" stroke-width="10"/><ellipse cx="238" cy="268" rx="70" ry="57" fill="#fff6e9"/><path d="M142 220Q238 150 334 220L316 276Q238 235 160 276Z" fill="${accent}"/><circle cx="198" cy="222" r="17" fill="#fff"/><circle cx="278" cy="222" r="17" fill="#fff"/><circle cx="202" cy="224" r="8"/><circle cx="282" cy="224" r="8"/><ellipse cx="238" cy="260" rx="19" ry="15" fill="${ink}"/><path d="M215 286q23 24 48 0" fill="none" stroke="${ink}" stroke-width="8" stroke-linecap="round"/><path d="M210 350l28 42 28-42 38 45-66 68-66-68Z" fill="${yellow}" stroke="${ink}" stroke-width="8"/><circle cx="238" cy="400" r="13" fill="${accent}"/><path d="M180 555l-25 80M300 555l30 80" stroke="${ink}" stroke-width="24" stroke-linecap="round"/></g>`;
}

function nia(side, accent, yellow) {
  const flip = side === "left" ? "translate(1200 0) scale(-1 1)" : "";
  return `<g data-character="Nia" transform="${flip}"><path d="M920 390q-85 75-70 230h160q18-150-70-230Z" fill="${yellow}" stroke="${ink}" stroke-width="10"/><circle cx="930" cy="245" r="100" fill="#8d4b2f" stroke="${ink}" stroke-width="10"/><circle cx="865" cy="155" r="55" fill="#34231f"/><circle cx="995" cy="155" r="55" fill="#34231f"/><path d="M840 235q90-120 180 0q-20-145-90-145t-90 145Z" fill="#34231f"/><circle cx="892" cy="245" r="13" fill="${ink}"/><circle cx="968" cy="245" r="13" fill="${ink}"/><path d="M902 300q28 20 56 0" fill="none" stroke="#5c2e25" stroke-width="8" stroke-linecap="round"/><path d="M858 410l72-48 72 48-25 85h-94Z" fill="${accent}" stroke="${ink}" stroke-width="9"/><path d="M875 605l-8 55M980 605l12 55" stroke="${ink}" stroke-width="24" stroke-linecap="round"/><circle cx="815" cy="420" r="48" fill="none" stroke="${ink}" stroke-width="12"/><path d="M845 455l55 70" stroke="${ink}" stroke-width="14" stroke-linecap="round"/></g>`;
}

for (const lesson of lessons) {
  const number = lesson.sequence;
  const cues = cuesFor(lesson);
  const hash = titleHash(`${lesson.title}|${lesson.illustration.sceneKey}`);
  const [blue, yellow, teal, coral] = palettes[(number - 1) % palettes.length];
  const accent = lesson.illustration.accent || (number % 2 === 0 ? teal : blue);
  const warm = number % 3 === 0 ? coral : yellow;
  const dogSide = number % 2 === 0 ? "right" : "left";
  const niaSide = dogSide === "left" ? "right" : "left";
  const mainRotation = (hash % 9) - 4;
  const clueConstellation = Array.from({ length: 7 }, (_, bit) => {
    const active = (number & (1 << bit)) !== 0;
    const x = 890 + bit * 34;
    const y = 75 + ((hash >>> (bit + 3)) % 3) * 12;
    return `<circle cx="${x}" cy="${y}" r="${active ? 10 : 6}" fill="${active ? warm : "#ffffff"}" stroke="${ink}" stroke-width="4" opacity="${active ? 1 : 0.72}"/>`;
  }).join("");
  const cueKeys = cues.map((cue) => cue.key);
  const scene = `${settingFor(cueKeys, accent, warm, teal)}
    <path d="M500 365C560 420 635 420 690 355M690 355c30 55 64 68 98 60" fill="none" stroke="${accent}" stroke-width="7" stroke-dasharray="10 14" opacity=".48"/>
    <g transform="rotate(${mainRotation} 610 260)">${cueCard(cues[0], 520, 150, 180, accent, warm, teal, true)}</g>
    ${cueCard(cues[1], 405, 430, 104, accent, warm, teal)}
    ${cueCard(cues[2], 565, 445, 104, accent, warm, teal)}
    ${cues[3] ? cueCard(cues[3], 725, 420, 104, accent, warm, teal) : ""}`;
  const description = `${lesson.title}. ${lesson.illustration.alt}. ${lesson.illustration.caption}`;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc" data-lesson="${number}" data-scene-key="${xmlEscape(lesson.illustration.sceneKey)}">
  <title id="title">${xmlEscape(lesson.title)}</title>
  <desc id="desc">${xmlEscape(description)}</desc>
  <metadata data-alt="${xmlEscape(lesson.illustration.alt)}" data-caption="${xmlEscape(lesson.illustration.caption)}" data-cues="${cueKeys.join(",")}"/>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7fbff"/><stop offset="1" stop-color="${accent}" stop-opacity=".22"/></linearGradient>
    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="4" fill="${accent}" opacity=".12"/></pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="${ink}" flood-opacity=".2"/></filter>
  </defs>
  <rect width="1200" height="720" rx="48" fill="url(#bg)"/>
  <rect x="24" y="24" width="1152" height="672" rx="38" fill="url(#dots)" stroke="${accent}" stroke-width="8"/>
  <circle cx="105" cy="105" r="50" fill="${warm}"/><path d="M84 105l14 15 30-38" fill="none" stroke="${ink}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <g aria-hidden="true">${clueConstellation}</g>
  <g data-scene="${xmlEscape(lesson.illustration.sceneKey)}" filter="url(#shadow)">${scene}</g>
  ${barkBolt(dogSide, accent, warm)}
  ${nia(niaSide, accent, warm)}
  <path d="M70 650Q300 615 470 650T820 650T1130 650" fill="none" stroke="${accent}" stroke-width="14" stroke-linecap="round" opacity=".45"/>
</svg>`;
  const filename = `lesson-${String(number).padStart(3, "0")}.svg`;
  await writeFile(join(outputDirectory, filename), svg, "utf8");
}

console.log(
  `Generated ${lessons.length} metadata-driven lesson illustrations with at least three visible story cues each.`,
);
