import type { GraphicPanel } from "./data";
import { artFor, assetUrl } from "./artwork";

export function PanelFigure({ panel, priority = false }: { panel: GraphicPanel; priority?: boolean }) {
  const art = artFor(panel.id);
  const numberedTable = panel.id === "ch14-p02";
  return <figure>
    <div className="gn-panel-image">
      {art ? <img src={assetUrl(art.src)} alt={art.alt} width="960" height="640" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} /> : <p className="gn-art-pending">Panel {panel.number} illustration is in production. The complete reading text is available below.</p>}
      {numberedTable && <><span className="gn-table-number" aria-label="Table 57">57</span><span className="gn-table-destination">Position 23</span></>}
    </div>
    {numberedTable && <figcaption className="gn-table-caption">Table 57 moves to position 23.</figcaption>}
  </figure>;
}

/** Keep the worksheet reference identical to the words and features in the reader. */
export function StoryPanel({ panel, priority = false, idPrefix = "" }: { panel: GraphicPanel; priority?: boolean; idPrefix?: string }) {
  const id = `${idPrefix}${panel.id}`;
  const year = panel.narration.match(/^In (\d{4})/)?.[1];
  return <article className="gn-panel" id={id} aria-labelledby={`panel-title-${id}`}>
    <header>
      <h3 id={`panel-title-${id}`}>Panel {panel.number}</h3>
      {panel.narration.startsWith("LOOKING BACK:") && <span>LOOKING BACK</span>}
      {year && <span>{year}</span>}
    </header>
    <PanelFigure panel={panel} priority={priority} />
    <div className="gn-narration"><span>NARRATOR</span><p>{panel.narration}</p></div>
    <div className="gn-dialogue">{panel.dialogue.map((line, index) => <blockquote key={index}><cite>{line.speaker}</cite><p>{line.text}</p></blockquote>)}</div>
  </article>;
}
