import { useState } from "react";
import type { GraphicChapter, GraphicPanel } from "./data";

export const FEATURE_MISSIONS = [
  "Find the narrator’s clue",
  "Catch a character’s voice",
  "Read the picture",
  "Make one more discovery",
];

function cluesFor(chapter: GraphicChapter, panel: GraphicPanel, number: number): string[] {
  const line = panel.dialogue[0];
  if (number === 1 || (number === 2 && !line)) return [
    `Look below the picture in panel ${panel.number}. The cream-coloured narration box marked NARRATOR is the storyteller talking.`,
    "Read that box. Does it explain when, where or why something happens? Pick one detail you learned.",
    `Try: “The narration box gives background information. In panel ${panel.number}, it helps me understand…” Finish with a detail from this scene.`,
  ];
  if (number === 2) return [
    `Find a speech bubble in panel ${panel.number}. Whose name is above the words?`,
    `${line.speaker} says, “${line.text}” What do those words reveal about this character?`,
    `A bubble’s job is to show someone’s words. For your last answer, explain what ${line.speaker}’s words help you learn in this scene.`,
  ];
  if (number === 3) return [
    `Study the picture in panel ${panel.number}. Look at the setting, expressions or objects. Choose one detail that catches your eye.`,
    "Study just the picture for a moment. What can you work out from that detail without reading the words?",
    `Try: “The illustration shows… It helps me understand… because I can see…” Describe something actually visible in panel ${panel.number}.`,
  ];
  const year = panel.narration.match(/^In (\d{4})/)?.[1];
  if (year) return [
    `Can you find the small ${year} label above the picture? Think about what kind of clue a date gives you.`,
    "A date can tell you when a scene happens. How does that help you place this moment in the story?",
    `Try: “The date label tells me… This helps me understand when…” Use the date you can see in panel ${panel.number}.`,
  ];
  if (panel.narration.startsWith("LOOKING BACK:")) return [
    "Look at the LOOKING BACK label. Is this scene happening now, or showing an earlier moment?",
    "A flashback label helps readers keep track of time. What earlier event is this panel reminding you about?",
    "Try: “The LOOKING BACK label shows… It helps me connect this earlier event to…” Add details from the story.",
  ];
  return [
    `Read the chapter title: “${chapter.title}”. What idea or mystery does it make you expect?`,
    "A title gives you a clue before you read. Which event in this chapter connects to these words?",
    "Try: “The chapter title points to… It helps me understand…” Connect it to something that actually happens in this chapter.",
  ];
}

export function FeatureHints({ chapter, panel, number, expanded, onToggle }: { chapter: GraphicChapter; panel: GraphicPanel; number: number; expanded: boolean; onToggle: () => void }) {
  const [step, setStep] = useState(0);
  const clues = cluesFor(chapter, panel, number);
  const hintId = `${chapter.id}-discovery-${number}-clue`;
  return <aside className="gnx-detective-hints" aria-label={`Clues for discovery ${number}`}>
    <button type="button" className="gnx-button gnx-button-light" aria-label={`${expanded ? "Hide clues" : "Give me a clue"} for discovery ${number}`} aria-expanded={expanded} aria-controls={hintId} onClick={() => { setStep(0); onToggle(); }}>{expanded ? "Hide clues" : "Give me a clue"} <span aria-hidden="true">✦</span></button>
    {expanded && <div id={hintId} className="gnx-detective-clue" role="status">
      <span>CLUE {step + 1} OF {clues.length} · PANEL {panel.number}</span><p>{clues[step]}</p>
      {step < clues.length - 1 ? <button type="button" onClick={() => setStep((old) => old + 1)} aria-label={`Another clue for discovery ${number}`}>Another clue →</button> : <p className="gnx-note">Use your own words. These clues stay here while you write.</p>}
    </div>}
  </aside>;
}
