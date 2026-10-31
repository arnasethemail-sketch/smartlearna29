import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { GraphicChapter, GraphicPanel } from "./data";
import { StoryPanel } from "./StoryPanel";
import "./textFeatures.css";

/** Each discovery has its own reference, so the pictures never live in a different activity. */
export function FeatureSource({ chapter, number, children }: { chapter: GraphicChapter; number: number; children: ReactNode | ((panel: GraphicPanel) => ReactNode) }) {
  const [panelIndex, setPanelIndex] = useState(Math.min(number - 1, chapter.panels.length - 1));
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (expanded) dialog.current?.showModal(); }, [expanded]);

  const source = (mode: "inline" | "expanded") => {
    const prefix = `${chapter.id}-discovery-${number}-${mode}-`;
    return <div className="gnx-feature-source">
      <p className="gnx-feature-source-title"><span>CHAPTER {chapter.number.toString().padStart(2, "0")}</span><strong>{chapter.title}</strong></p>
      <div className="gnx-panel-picker">
        <label htmlFor={`${prefix}picker`}>Story panel for discovery {number}
          <select id={`${prefix}picker`} value={chapter.panels[panelIndex].id} onChange={(event) => setPanelIndex(chapter.panels.findIndex((panel) => panel.id === event.target.value))}>
            {chapter.panels.map((panel) => <option key={panel.id} value={panel.id}>Panel {panel.number} of {chapter.panels.length}</option>)}
          </select>
        </label>
        <div className="gnx-panel-arrows">
          <button type="button" aria-label={`Previous story panel for discovery ${number}`} disabled={panelIndex === 0} onClick={() => setPanelIndex((index) => index - 1)}>← <span>Previous</span></button>
          <button type="button" aria-label={`Next story panel for discovery ${number}`} disabled={panelIndex === chapter.panels.length - 1} onClick={() => setPanelIndex((index) => index + 1)}><span>Next</span> →</button>
        </div>
      </div>
      <StoryPanel panel={chapter.panels[panelIndex]} priority={number === 1} idPrefix={prefix} />
    </div>;
  };

  return <div className="gnx-feature-workspace">
    <div className="gnx-feature-source-column">{source("inline")}</div>
    <div className="gnx-feature-answers">
      <div className="gnx-feature-reference-tools"><span>Keep the story close.</span><button type="button" className="gnx-button gnx-button-light" aria-label={`Enlarge story panel ${number}`} onClick={() => setExpanded(true)}>Open story panel <span aria-hidden="true">↗</span></button></div>
      {typeof children === "function" ? children(chapter.panels[panelIndex]) : children}
    </div>
    {expanded && <dialog className="gnx-feature-dialog" ref={dialog} aria-label={`Story reference for discovery ${number}`} onClose={() => setExpanded(false)}>
      <div className="gnx-feature-dialog-toolbar"><strong>Your story reference</strong><button type="button" className="gnx-button gnx-button-light" onClick={() => dialog.current?.close()}>Return to my answers <span aria-hidden="true">×</span></button></div>
      {source("expanded")}
    </dialog>}
  </div>;
}
