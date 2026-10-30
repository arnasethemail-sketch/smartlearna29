import { useEffect, useRef, useState } from "react";
import { useLearningProgress } from "../progress";
import { chapters, graphicCourse, GRAPHIC_SECTIONS } from "./data";
import type { GraphicChapter, GraphicPanel } from "./data";
import { useGraphicProgress, isCompleteAttempt, isChapterUnlocked, completionDetails, hasChapterSubmission } from "./progress";
import type { ChapterWork } from "./types";
import { Comprehension, Vocabulary, ParagraphWorkshop, TextFeatures, VocabularyBank, ReviewPanel } from "./Exercises";
import { artFor, artworkCount, assetUrl } from "./artwork";
import "./graphicNovel.css";

function Artwork({ panel, priority = false }: { panel: GraphicPanel; priority?: boolean }) {
  const art = artFor(panel.id);
  return art ? <img src={assetUrl(art.src)} alt={art.alt} width="960" height="640" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} /> : <p className="gn-art-pending">Panel {panel.number} illustration is in production. The complete reading text is available below.</p>;
}

export function PanelFigure({ panel, priority = false }: { panel: GraphicPanel; priority?: boolean }) {
  const numberedTable = panel.id === "ch14-p02";
  return <figure><div className="gn-panel-image"><Artwork panel={panel} priority={priority} />{numberedTable && <><span className="gn-table-number" aria-label="Table 57">57</span><span className="gn-table-destination">Position 23</span></>}</div>{numberedTable && <figcaption className="gn-table-caption">Table 57 moves to position 23.</figcaption>}</figure>;
}

function ChapterStatus({ work }: { work?: ChapterWork }) {
  const label = !work ? "Not started" : work.status === "reviewed" ? "Reviewed" : work.status === "submitted" ? "Submitted" : "In progress";
  return <span className={`gn-status gn-status-${work?.status ?? "new"}`}>{label}</span>;
}

function Header({ reading, onBack }: { reading: boolean; onBack: () => void }) {
  return <header className="gn-header"><button className="gn-logo" onClick={onBack} aria-label={reading ? "Graphic novel chapter library" : "Back to English topics"}><span aria-hidden="true">HT</span><span>GRAPHIC NOVEL LESSONS<small>ONE STORY. A WORLD OF WORDS.</small></span></button><button className="gn-button gn-outline" onClick={onBack}>{reading ? "Chapter library" : "Back to English"}</button></header>;
}

export function GraphicNovel({ onBackToEnglish }: { onBackToEnglish: () => void }) {
  const { auth } = useLearningProgress();
  useEffect(() => () => { document.title = "Grade 4 English Practice"; }, []);
  return <Collection key={auth.userId ?? "guest"} onBackToEnglish={onBackToEnglish} />;
}

function Collection({ onBackToEnglish }: { onBackToEnglish: () => void }) {
  const { works, getWork, updateWork, ready } = useGraphicProgress();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const chapter = chapters.find((item) => item.id === currentId);
  const work = chapter ? getWork(chapter) : undefined;
  const completed = chapters.filter((item) => hasChapterSubmission(item, works[item.id]));
  const recent = [...Object.values(works)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).find((item) => item.status === "in-progress");
  const newChapter = chapters.find((item) => !works[item.id] && isChapterUnlocked(item.number, works));
  const cover = artFor("ch01-p08");

  useEffect(() => {
    document.title = chapter ? `${chapter.title} · Graphic Novel Lessons` : "Hotel Transylvania · Graphic Novel Lessons";
    titleRef.current?.focus({ preventScroll: true });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentId, work?.section, work?.page, work?.panelIndex, reviewing, ready]);

  function openChapter(item: GraphicChapter) {
    if (!ready || !isChapterUnlocked(item.number, works)) return;
    updateWork(item, (old) => old);
    setCurrentId(item.id); setReviewing(false); setReviewConfirmed(false); setShowMissing(false);
  }

  const backToLibrary = () => { setCurrentId(null); setReviewing(false); setShowMissing(false); };

  if (!ready) return <main className="graphic-novel"><div className="gn-shell"><Header reading={false} onBack={onBackToEnglish} /><section className="gn-loading" role="status"><h1 ref={titleRef} tabIndex={-1}>Finding your saved chapter…</h1><p>Your lesson will be ready when your progress finishes loading.</p></section></div></main>;

  if (!chapter || !work) return (
    <main className="graphic-novel"><div className="gn-shell">
      <Header reading={false} onBack={onBackToEnglish} />
      <section className="gn-collection-hero">
        <div className="gn-hero-copy"><p className="gn-eyebrow">GRADE 5 ENGLISH · AN ILLUSTRATED COLLECTION</p><h1 ref={titleRef} tabIndex={-1} aria-label="Hotel Transylvania">Hotel<br /><em>Transylvania</em></h1><p>A hidden hotel. An unexpected guest. A birthday that changes everything.</p><p className="gn-hero-note">Follow the story, then explore its words, ideas, and illustrations through six connected activities.</p><div className="gn-hero-actions">{recent && <button className="gn-button gn-gold" onClick={() => openChapter(chapters.find((item) => item.id === recent.chapterId)!)}>Resume chapter {chapters.find((item) => item.id === recent.chapterId)?.number}<span aria-hidden="true">↗</span></button>}<button className={`gn-button ${recent ? "gn-outline-light" : "gn-gold"}`} disabled={!newChapter} onClick={() => newChapter && openChapter(newChapter)}>Start a new chapter <span aria-hidden="true">→</span></button></div><div className="gn-hero-stats"><span><strong>24</strong> chapters</span><span><strong>{artworkCount}</strong> illustrated panels</span><span><strong>6</strong> learning activities</span></div></div>
        {cover ? <figure className="gn-hero-image"><img src={assetUrl(cover.src)} alt={cover.alt} width="960" height="640" fetchPriority="high" /><figcaption>A new way into the story.</figcaption></figure> : <div className="gn-hero-production"><h2>Illustrations are in production</h2><p>This is a text-reading preview. {artworkCount} of 192 panel illustrations are ready.</p></div>}
      </section>
      <div className="gn-library-toolbar"><div><p className="gn-eyebrow">YOUR COLLECTION</p><h2>{showProgress ? "Every bit of work has a place." : "The next chapter is waiting."}</h2></div><div className="gn-view-switch" role="group" aria-label="Collection view"><button aria-pressed={!showProgress} onClick={() => setShowProgress(false)}>Chapters</button><button aria-pressed={showProgress} onClick={() => setShowProgress(true)}>My progress</button></div></div>
      <section className="gn-progress-overview" aria-label="Collection progress"><div><strong>{completed.length}<small> / 24</small></strong><span>chapters submitted</span></div><div><strong>{Object.values(works).filter((item) => item.status === "reviewed").length}</strong><span>chapters reviewed</span></div><p>Completion records your work.<br />Understanding is discussed in self or parent review.</p><progress value={completed.length} max={24} aria-label="Chapters submitted" /></section>
      {showProgress ? <section className="gn-progress-list" aria-label="Saved chapter progress">{chapters.map((item) => <article key={item.id}><span className="gn-chapter-index">{String(item.number).padStart(2,"0")}</span><div><h3>{item.title}</h3><p>{works[item.id] ? `${GRAPHIC_SECTIONS[works[item.id].section]} · ${works[item.id].readingComplete ? "Reading finished" : "Reading in progress"}` : "Your work will appear here when you begin."}</p></div><ChapterStatus work={works[item.id]} /><button className="gn-button gn-outline" disabled={!isChapterUnlocked(item.number, works)} onClick={() => openChapter(item)}>{works[item.id] ? "Open saved work" : "Start chapter"}</button></article>)}</section> : <div className="gn-units">{graphicCourse.units.map((unit) => <section key={unit.id} className="gn-unit" aria-labelledby={`heading-${unit.id}`}><header><span>UNIT {unit.number}</span><h3 id={`heading-${unit.id}`}>{unit.title}</h3><p>Three word-building chapters, then a nine-word review.</p></header><div className="gn-chapter-grid">{chapters.filter((item) => item.unit === unit.number).map((item) => {
        const unlocked = isChapterUnlocked(item.number, works); const saved = works[item.id]; const cardArt = artFor(item.panels[0].id);
        return <article key={item.id} className={`gn-chapter-card ${!unlocked ? "gn-locked" : ""}`}><div className="gn-card-art">{cardArt ? <img src={assetUrl(cardArt.src)} alt={cardArt.alt} width="960" height="640" loading="lazy" /> : <div className="gn-card-number" aria-hidden="true">{String(item.number).padStart(2,"0")}</div>}<span className="gn-card-tag">CHAPTER {String(item.number).padStart(2,"0")}</span></div><div className="gn-card-copy"><ChapterStatus work={saved} /><h4>{item.title}</h4><p>{item.lessonType === "review" || item.newVocabulary.length === 0 ? "STORY + UNIT WORD REVIEW" : "STORY + THREE NEW WORDS"}</p><button className="gn-read-link" disabled={!unlocked} onClick={() => openChapter(item)}>{!unlocked ? `Finish chapter ${item.number - 1} to continue` : saved ? saved.status === "in-progress" ? "Resume chapter" : "Revisit your work" : "Start chapter"}<span aria-hidden="true">{unlocked ? "↗" : "○"}</span></button></div></article>;
      })}</div></section>)}</div>}
      <aside className="gn-about"><h2>Read. Notice. Think. Make it your own.</h2><p>Each chapter moves through the graphic novel, written comprehension, vocabulary and spelling, a paragraph workshop, a Text Features Hunt, and a vocabulary review. Your answers and reading position save as you work.</p><p className="gn-adaptation-note">Grade 5 adaptation of a supplied Hotel Transylvania transcript. Narration and speech are adapted; they are not exact film dialogue. Illustrations were created with AI image generation.</p></aside>
    </div></main>
  );

  const update = (fn: (old: ChapterWork) => ChapterWork) => updateWork(chapter, (old) => {
    const next = fn(old);
    if (next.readingView !== old.readingView) {
      if (next.readingView === "panel") next.panelIndex = old.page * 4;
      else next.page = Math.floor(old.panelIndex / 4);
    }
    return next;
  });
  const section = Math.max(0, Math.min(5, work.section));
  const nextChapter = chapters[chapter.number];
  const canSubmit = isCompleteAttempt(chapter, work);
  const sectionComponents = [null, <Comprehension key="comprehension" chapter={chapter} work={work} update={update} />, <Vocabulary key="vocabulary" chapter={chapter} work={work} update={update} />, <ParagraphWorkshop key="paragraph" chapter={chapter} work={work} update={update} />, <TextFeatures key="features" chapter={chapter} work={work} update={update} />, <VocabularyBank key="bank" chapter={chapter} work={work} update={update} />];

  function submitChapter() {
    if (!chapter) return;
    if (!canSubmit) { setShowMissing(true); return; }
    update((old) => {
      const { submittedSnapshots, ...snapshot } = old;
      return { ...old, status: "submitted", submittedSnapshots: [...submittedSnapshots, JSON.stringify(snapshot)] };
    });
    setShowMissing(false); setReviewing(true);
  }

  return <main className={`graphic-novel gn-lesson ${work.largeText ? "gn-large-text" : ""}`}><div className="gn-shell">
    <Header reading onBack={backToLibrary} />
    <header className="gn-lesson-title"><div><p className="gn-eyebrow">HOTEL TRANSYLVANIA · UNIT {chapter.unit} · CHAPTER {String(chapter.number).padStart(2,"0")} OF 24</p><h1 ref={titleRef} tabIndex={-1}>{chapter.title}</h1><p>{chapter.learningFocus}</p></div><ChapterStatus work={work} /></header>
    <nav className="gn-section-nav" aria-label="Chapter activities">{GRAPHIC_SECTIONS.map((label, index) => <button key={label} aria-current={!reviewing && index === section ? "step" : undefined} onClick={() => { update((old) => ({ ...old, section: index })); setReviewing(false); setShowMissing(false); }}><span>{String(index + 1).padStart(2,"0")}</span>{label}</button>)}</nav>
    <div className="gn-section-tools"><span>{reviewing ? "SELF / PARENT REVIEW" : `ACTIVITY ${section + 1} OF 6`}</span><div><button aria-pressed={work.largeText} onClick={() => update((old) => ({ ...old, largeText: !old.largeText }))}>{work.largeText ? "Standard text" : "Larger text"}</button><button aria-pressed={reviewing} onClick={() => { setReviewing(!reviewing); setReviewConfirmed(false); }}>Self / parent review</button></div></div>
    {reviewing ? <section className="gn-review-page"><h2>Reflect on your work</h2><p>Writing needs a thoughtful reader. These are self or parent review notes, not an automatic AI grade. A different opinion can be a strong answer when it is clearly explained.</p><ReviewPanel chapter={chapter} work={work} update={update} /><div className="gn-review-confirm"><label><input type="checkbox" checked={reviewConfirmed} onChange={(event) => setReviewConfirmed(event.target.checked)} /> I have discussed the answers and revisions using the review guidance.</label><button className="gn-button gn-dark" disabled={!reviewConfirmed || (!canSubmit && !work.review.parentOverride)} onClick={() => update((old) => ({ ...old, status: "reviewed" }))}>Mark chapter reviewed</button>{!canSubmit && <label><input type="checkbox" checked={work.review.parentOverride} onChange={(event) => update((old) => ({ ...old, review: { ...old.review, parentOverride: event.target.checked } }))} /> Parent review: allow continuation after discussing this attempt, even with unfinished fields.</label>}</div><button className="gn-button gn-outline" onClick={() => setReviewing(false)}>Return to my work</button></section> : section === 0 ? <section className="gn-reading" aria-label="Graphic novel reading"><div className="gn-reading-heading"><div><h2>Step inside the story.</h2><p>Read the narration boxes and speech bubbles in panel order.</p></div><div className="gn-view-switch" role="group" aria-label="Reading layout"><button aria-pressed={work.readingView === "page"} onClick={() => update((old) => ({ ...old, readingView: "page" }))}>Page view</button><button aria-pressed={work.readingView === "panel"} onClick={() => update((old) => ({ ...old, readingView: "panel" }))}>One panel at a time</button></div></div><p className="gn-adaptation-note">Adapted reading · {work.readingView === "panel" ? `Panel ${work.panelIndex + 1} of 8` : `Page ${work.page + 1} of 2`}</p><div className={`gn-panels ${work.readingView === "panel" ? "gn-single-panel" : ""}`}>{(work.readingView === "panel" ? [chapter.panels[work.panelIndex]] : chapter.panels.filter((panel) => panel.page === work.page + 1)).map((panel) => <article className="gn-panel" id={panel.id} key={panel.id} aria-labelledby={`panel-title-${panel.id}`}><header><h3 id={`panel-title-${panel.id}`}>Panel {panel.number}</h3>{panel.narration.startsWith("LOOKING BACK:") && <span>LOOKING BACK</span>}{/^In (\d{4})/.test(panel.narration) && <span>{panel.narration.match(/^In (\d{4})/)?.[1]}</span>}</header><PanelFigure panel={panel} priority={panel.number === 1} /><div className="gn-narration"><span>NARRATOR</span><p>{panel.narration}</p></div><div className="gn-dialogue">{panel.dialogue.map((line, index) => <blockquote key={index}><cite>{line.speaker}</cite><p>{line.text}</p></blockquote>)}</div></article>)}</div><nav className="gn-reading-pages" aria-label="Reading pages"><button className="gn-button gn-outline" disabled={work.readingView === "panel" ? work.panelIndex === 0 : work.page === 0} onClick={() => update((old) => old.readingView === "panel" ? ({ ...old, panelIndex: Math.max(0, old.panelIndex - 1) }) : ({ ...old, page: 0 }))}>Previous {work.readingView === "panel" ? "panel" : "page"}</button>{(work.readingView === "panel" ? work.panelIndex < 7 : work.page < 1) ? <button className="gn-button gn-dark" onClick={() => update((old) => old.readingView === "panel" ? ({ ...old, panelIndex: Math.min(7, old.panelIndex + 1) }) : ({ ...old, page: 1 }))}>Next {work.readingView === "panel" ? "panel" : "page"} <span aria-hidden="true">→</span></button> : <button className="gn-button gn-dark" onClick={() => update((old) => ({ ...old, readingComplete: true, section: 1 }))}>Finish reading <span aria-hidden="true">→</span></button>}</nav></section> : <section className="gn-worksheet">{sectionComponents[section]}</section>}
    {!reviewing && section > 0 && <nav className="gn-activity-actions" aria-label="Move between activities"><button className="gn-button gn-outline" onClick={() => update((old) => ({ ...old, section: old.section - 1 }))}>Previous activity</button>{section < 5 ? <button className="gn-button gn-dark" onClick={() => update((old) => ({ ...old, section: old.section + 1 }))}>Next activity <span aria-hidden="true">→</span></button> : <button className="gn-button gn-dark" onClick={submitChapter}>Submit chapter</button>}</nav>}
    {showMissing && <section className="gn-missing" role="alert"><h2>A few parts still need an attempt.</h2><p>You can keep revising. Completion checks whether the activities were attempted; it does not grade your opinions.</p><ul>{completionDetails(chapter, work).missing.map((message) => <li key={message}>{message}</li>)}</ul></section>}
    {work.status !== "in-progress" && <section className="gn-submitted"><div><p className="gn-eyebrow">YOUR WORK IS SAVED</p><h2>{work.status === "reviewed" ? "Chapter reviewed." : "Chapter submitted."}</h2><p>Your answers remain available for revision. Writing mastery is separate from completing a chapter.</p></div>{nextChapter ? <button className="gn-button gn-gold" disabled={!isChapterUnlocked(nextChapter.number, works)} onClick={() => openChapter(nextChapter)}>Next chapter: {nextChapter.number} <span aria-hidden="true">→</span></button> : <button className="gn-button gn-gold" onClick={backToLibrary}>Return to the collection</button>}</section>}
    <footer className="gn-lesson-footer">Your answers save as you work. Use the main Save progress control for account and sync details.</footer>
  </div></main>;
}
