import { Fragment, useRef } from "react";
import type { ReactNode } from "react";
import { wordsById } from "./data";
import type { GraphicChapter } from "./data";
import { countBankMatches, spellingMatches } from "./progress";
import type { ChapterWork, ParagraphSlot } from "./types";
import { AutomaticFeedback } from "./AutomaticFeedback";
import "./exercises.css";
import { ReviewSummary } from "./ReviewSummary";
import { FeatureSource } from "./FeatureSource";

export type ExerciseProps = {
  chapter: GraphicChapter;
  work: ChapterWork;
  update: (change: (old: ChapterWork) => ChapterWork) => void;
};

const paragraphSlots: Array<{ id: ParagraphSlot; label: string }> = [
  { id: "topicSentence", label: "Topic Sentence" },
  { id: "detail1", label: "Detail #1" },
  { id: "detail2", label: "Detail #2" },
  { id: "detail3", label: "Detail #3" },
  { id: "conclusion", label: "Concluding Sentence" },
];

function SectionIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <header className="gnx-intro"><p className="gnx-eyebrow">{eyebrow}</p><h2>{title}</h2><div>{children}</div></header>;
}

function PanelsReference({ chapter, ids }: { chapter: GraphicChapter; ids: string[] }) {
  const panels = chapter.panels.filter((panel) => ids.includes(panel.id));
  if (!panels.length) return null;
  return <details className="gnx-story-reference"><summary>Reread the supporting panels ({panels.map((panel) => panel.number).join(", ")})</summary>{panels.map((panel) => <article key={panel.id}><strong>Panel {panel.number}</strong><p>{panel.narration}</p>{panel.dialogue.map((line, index) => <p key={index}><b>{line.speaker}:</b> {line.text}</p>)}</article>)}</details>;
}

function TextHistory({ entries }: { entries: string[] }) {
  return entries.length ? <details className="gnx-history"><summary>Saved drafts ({entries.length})</summary>{entries.map((entry, index) => <blockquote key={index}><strong>Draft {index + 1}</strong><p>{entry}</p></blockquote>)}</details> : null;
}

export function Comprehension({ chapter, work, update }: ExerciseProps) {
  const saveDraft = (id: string) => update((old) => {
    const question = old.comprehension[id];
    if (!question.answer.trim() || question.history.at(-1) === question.answer) return old;
    return { ...old, comprehension: { ...old.comprehension, [id]: { ...question, history: [...question.history, question.answer] } } };
  });
  return <section className="gnx-exercises">
    <SectionIntro eyebrow="02 / THINK IT THROUGH" title="Reading Comprehension"><p>Write your own answer to each question, then choose a question type. Your opinion does not have to match somebody else’s. You can use an imaginary example instead of a private experience.</p></SectionIntro>
    <details className="gnx-legend"><summary>Optional checklist help</summary><p>The worksheet gives the letters R / A / P / C. The editable helper wording below is a convention for this app.</p><div className="gnx-review-grid">{["R", "A", "P", "C"].map((letter) => <label key={letter}>{letter}<input value={work.checklistLegend[letter] ?? ""} onChange={(event) => update((old) => ({ ...old, checklistLegend: { ...old.checklistLegend, [letter]: event.target.value } }))} /></label>)}</div><p className="gnx-note">PN / HL / QP remain optional, unscored checklist labels. No meanings or scoring rules have been assigned to them.</p></details>
    {chapter.comprehension.map((question) => {
      const answer = work.comprehension[question.id];
      const changeAnswer = (value: string) => update((old) => ({ ...old, comprehension: { ...old.comprehension, [question.id]: { ...old.comprehension[question.id], answer: value } } }));
      const reviewOpen = Boolean(work.automaticChecks?.[`comprehension:${question.id}`]);
      return <article key={question.id} className="gnx-question gnx-card" aria-labelledby={`${question.id}-prompt`}>
        <div className="gnx-question-heading"><span aria-hidden="true">{question.number.toString().padStart(2, "0")}</span><h3 id={`${question.id}-prompt`}>{question.prompt}</h3></div>
        <fieldset className="gnx-classifications"><legend>Question type for question {question.number}</legend>{question.readingTypeChoices.map((type) => <label key={type}><input type="radio" name={`${question.id}-type`} value={type} checked={answer.type === type} onChange={() => update((old) => ({ ...old, comprehension: { ...old.comprehension, [question.id]: { ...old.comprehension[question.id], type } } }))} /><span>{type}</span></label>)}</fieldset>
        <label htmlFor={`${question.id}-answer`} className="gnx-answer-label">Your written answer</label><textarea id={`${question.id}-answer`} aria-describedby={`${question.id}-prompt`} rows={5} value={answer.answer} onChange={(event) => changeAnswer(event.target.value)} onBlur={() => saveDraft(question.id)} />
        <fieldset className="gnx-checks"><legend>Your checklist for question {question.number}</legend>{[...question.checklistLabels, "PN", "HL", "QP"].map((letter) => <label key={letter}><input type="checkbox" checked={answer.checks[letter] ?? false} onChange={(event) => update((old) => ({ ...old, comprehension: { ...old.comprehension, [question.id]: { ...old.comprehension[question.id], checks: { ...old.comprehension[question.id].checks, [letter]: event.target.checked } } } }))} /><span>{letter}</span></label>)}</fieldset>
        <AutomaticFeedback chapter={chapter} work={work} target={{ kind: "comprehension", id: question.id }} update={update} label="Check my answer" ariaLabel={`Check my answer to question ${question.number}`} beforeCheck={() => saveDraft(question.id)}><button aria-label={`${answer.help ? "Hide hint" : "Help"} with question ${question.number}`} className="gnx-button gnx-button-light" onClick={() => update((old) => ({ ...old, comprehension: { ...old.comprehension, [question.id]: { ...old.comprehension[question.id], help: !old.comprehension[question.id].help } } }))}>{answer.help ? "Hide hint" : "Help"}<span className="gnx-sr-only">{" "}with question {question.number}</span></button></AutomaticFeedback>
        {answer.help && <aside className="gnx-help"><strong>A clue, not an answer</strong><p>{question.hint}</p><PanelsReference chapter={chapter} ids={question.evidencePanels} /></aside>}
        {reviewOpen && <div className="gnx-review-section"><aside className="gnx-help"><strong>Answer guidance for review</strong><p>{question.answerGuidance}</p><p className="gnx-note">Suggested classification: {question.suggestedType}. Other classifications can overlap; explain why yours fits.</p></aside></div>}
        <TextHistory entries={answer.history} />
      </article>;
    })}
  </section>;
}

export function Vocabulary({ chapter, work, update }: ExerciseProps) {
  const archive = (id: string) => update((old) => {
    const card = old.vocabulary[id];
    const revision = { definition: card.definition, synonyms: card.synonyms, sentence: card.sentence, spellings: [...card.spellings] };
    const previous = card.history.at(-1);
    if (!Object.values(revision).some((value) => Array.isArray(value) ? value.some(Boolean) : value.trim()) || (previous && JSON.stringify({ definition: previous.definition, synonyms: previous.synonyms, sentence: previous.sentence, spellings: previous.spellings }) === JSON.stringify(revision))) return old;
    return { ...old, vocabulary: { ...old.vocabulary, [id]: { ...card, history: [...card.history, { ...revision, savedAt: new Date().toISOString() }] } } };
  });
  return <section className="gnx-exercises"><SectionIntro eyebrow="03 / WORD EXPLORER" title="Vocabulary and Spelling"><p>{chapter.lessonType === "review" ? "These cards revisit words from this unit. No new words are introduced in this review chapter." : "Explore three words from the chapter. Explain their meaning in your own words, then show that meaning in an original sentence."}</p></SectionIntro>{chapter.vocabularyPractice.map((word, wordIndex) => {
    const card = work.vocabulary[word.wordId];
    const write = (field: "definition" | "synonyms" | "sentence", value: string) => update((old) => ({ ...old, vocabulary: { ...old.vocabulary, [word.wordId]: { ...old.vocabulary[word.wordId], [field]: value } } }));
    return <article className="gnx-card gnx-word-card" key={word.wordId} aria-label={`Word card ${wordIndex + 1}`}><header><span className="gnx-eyebrow">WORD {wordIndex + 1} OF 3</span><h3><span className="gnx-note">Word:</span> {card.covered ? <span className="gnx-covered" aria-label="Word covered">Covered</span> : word.word}</h3><button aria-label={`${card.covered ? "Look at word" : "Cover word"} ${wordIndex + 1}`} className="gnx-button gnx-button-light" onClick={() => update((old) => ({ ...old, vocabulary: { ...old.vocabulary, [word.wordId]: { ...old.vocabulary[word.wordId], covered: !old.vocabulary[word.wordId].covered } } }))}>{card.covered ? "Look at word" : "Cover word"}<span className="gnx-sr-only">{" "}{wordIndex + 1}</span></button></header><div className="gnx-two-columns"><label htmlFor={`${word.wordId}-definition`}>Definition<textarea id={`${word.wordId}-definition`} rows={3} value={card.definition} onChange={(event) => write("definition", event.target.value)} onBlur={() => archive(word.wordId)} /></label><label htmlFor={`${word.wordId}-synonyms`}>Synonyms<textarea id={`${word.wordId}-synonyms`} rows={3} value={card.synonyms} onChange={(event) => write("synonyms", event.target.value)} onBlur={() => archive(word.wordId)} /></label></div><label htmlFor={`${word.wordId}-sentence`}>Use it in a sentence that shows the meaning of the word<textarea id={`${word.wordId}-sentence`} rows={3} value={card.sentence} onChange={(event) => write("sentence", event.target.value)} onBlur={() => archive(word.wordId)} /></label><p className="gnx-note">A useful sentence makes the intended meaning clear. Simply including the word is a starting point, not a meaning check.</p><h4>Spelling Word Practice</h4><p className="gnx-note">Look → cover → write → check. Keep all five attempts, and revise a spelling after checking it.</p><div className="gnx-spelling-grid">{Array.from({ length: 5 }, (_, attemptIndex) => {
      const checked = card.spellingChecked[attemptIndex];
      const entered = card.spellings[attemptIndex] ?? "";
      return <div className="gnx-spelling-attempt" key={attemptIndex}><label htmlFor={`${word.wordId}-spelling-${attemptIndex}`}>Attempt {attemptIndex + 1}<input id={`${word.wordId}-spelling-${attemptIndex}`} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} value={entered} onChange={(event) => update((old) => {
        const current = old.vocabulary[word.wordId];
        return { ...old, vocabulary: { ...old.vocabulary, [word.wordId]: { ...current, spellings: current.spellings.map((value, index) => index === attemptIndex ? event.target.value : value), spellingChecked: current.spellingChecked.map((value, index) => index === attemptIndex ? false : value) } } };
      })} onBlur={() => archive(word.wordId)} /></label><button aria-label={`Check word ${wordIndex + 1}, attempt ${attemptIndex + 1}`} className="gnx-spelling-check" disabled={!entered.trim()} onClick={() => { archive(word.wordId); update((old) => ({ ...old, vocabulary: { ...old.vocabulary, [word.wordId]: { ...old.vocabulary[word.wordId], spellingChecked: old.vocabulary[word.wordId].spellingChecked.map((value, index) => index === attemptIndex ? true : value) } } })); }}>Check<span className="gnx-sr-only">{" "}word {wordIndex + 1}, attempt {attemptIndex + 1}</span></button>{checked && <p role="status" className={spellingMatches(word.word, entered) ? "gnx-match" : "gnx-revise"}>{spellingMatches(word.word, entered) ? "Spelling matches." : <>Try again: <strong>{word.word}</strong><small>{word.word.split("").join(" · ")}</small></>}</p>}</div>;
    })}</div><AutomaticFeedback chapter={chapter} work={work} target={{ kind: "vocabulary", id: word.wordId }} update={update} label="Check word card" ariaLabel={`Check word card ${wordIndex + 1}`} beforeCheck={() => archive(word.wordId)}><button aria-label={`${card.help ? "Hide word help" : "Word help"} ${wordIndex + 1}`} className="gnx-button gnx-button-light" onClick={() => update((old) => ({ ...old, vocabulary: { ...old.vocabulary, [word.wordId]: { ...old.vocabulary[word.wordId], help: !old.vocabulary[word.wordId].help } } }))}>{card.help ? "Hide word help" : "Word help"}<span className="gnx-sr-only">{" "}{wordIndex + 1}</span></button></AutomaticFeedback>{card.help && <aside className="gnx-help"><strong>{word.teacherWord.word} · {word.teacherWord.partOfSpeech}</strong><p>{word.teacherWord.definition}</p><p>Synonyms or equivalent phrases: {word.teacherWord.synonyms.join(" / ")}</p><p>Example: {word.teacherWord.exampleSentence}</p><PanelsReference chapter={chapter} ids={word.contextPanelIds} /></aside>}{card.history.length > 0 && <details className="gnx-history"><summary>Saved word-card drafts ({card.history.length})</summary>{card.history.map((revision, index) => <article key={index}><strong>Draft {index + 1}</strong><p>Definition: {revision.definition}</p><p>Synonyms: {revision.synonyms}</p><p>Sentence: {revision.sentence}</p><p>Spelling attempts: {revision.spellings.map((value) => value || "—").join(" / ")}</p></article>)}</details>}</article>;
  })}</section>;
}

/** Highlight only the learner-selected text; this does not infer parts of speech. */
export function MarkedSentence({ text, adjective, adverb }: { text: string; adjective: string; adverb: string }) {
  const ranges: Array<{ start: number; end: number; kind: "adjective" | "adverb" }> = [];
  for (const [selection, kind] of [[adjective, "adjective"], [adverb, "adverb"]] as const) {
    const start = selection.trim() ? text.toLocaleLowerCase().indexOf(selection.trim().toLocaleLowerCase()) : -1;
    if (start >= 0) ranges.push({ start, end: start + selection.trim().length, kind });
  }
  const boundaries = [...new Set([0, text.length, ...ranges.flatMap((range) => [range.start, range.end])])].sort((a, b) => a - b);
  return <>{boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1];
    const kinds = ranges.filter((range) => range.start <= start && range.end >= end).map((range) => range.kind);
    return <Fragment key={`${start}-${end}`}>{kinds.length ? <mark className={`gnx-selected-${kinds.join("-")}`} title={`Learner-selected ${kinds.join(" and ")}`}>{text.slice(start, end)}</mark> : text.slice(start, end)}</Fragment>;
  })}</>;
}

export function ParagraphWorkshop({ chapter, work, update }: ExerciseProps) {
  const inputs = useRef<Partial<Record<ParagraphSlot, HTMLTextAreaElement>>>({});
  const paragraph = work.paragraph;
  const draft = chapter.hamburgerParagraph;
  const archive = () => update((old) => {
    const current = old.paragraph;
    const revision = { sentences: { ...current.sentences }, adjectives: { ...current.adjectives }, adverbs: { ...current.adverbs }, crossedOut: [...current.crossedOut] };
    const previous = current.history.at(-1);
    if (previous && JSON.stringify({ sentences: previous.sentences, adjectives: previous.adjectives, adverbs: previous.adverbs, crossedOut: previous.crossedOut }) === JSON.stringify(revision)) return old;
    return { ...old, paragraph: { ...current, history: [...current.history, { ...revision, savedAt: new Date().toISOString() }] } };
  });
  const markSelection = (slot: ParagraphSlot, kind: "adjectives" | "adverbs") => {
    const input = inputs.current[slot];
    if (!input || input.selectionStart === input.selectionEnd) return;
    const selected = input.value.slice(input.selectionStart, input.selectionEnd);
    update((old) => ({ ...old, paragraph: { ...old.paragraph, [kind]: { ...old.paragraph[kind], [slot]: selected } } }));
  };
  const assembled = paragraphSlots.map((slot) => paragraph.sentences[slot.id]).join(" ");
  const bannedPresent = work.teacherBannedWords.filter((word) => word.trim() && assembled.toLocaleLowerCase().split(/[^\p{L}’'-]+/u).includes(word.trim().toLocaleLowerCase()));
  const practicePresent = chapter.vocabularyPractice.some((word) => assembled.toLocaleLowerCase().split(/[^\p{L}’'-]+/u).includes(word.word.toLocaleLowerCase()));
  return <section className="gnx-exercises"><SectionIntro eyebrow="04 / BUILD A BETTER PARAGRAPH" title="Hamburger Paragraph"><p>Edit the supplied draft. Keep its main idea, replace the detail that does not belong, fill the gaps, and repair the grammar. The five layers will form one finished paragraph.</p></SectionIntro><ol className="gnx-instructions">{draft.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol><div className="gnx-hamburger">{paragraphSlots.map(({ id, label }, index) => {
    const original = draft[id];
    const crossed = paragraph.crossedOut.includes(id);
    return <article key={id} className={`gnx-burger-layer gnx-burger-layer-${index}`}><header><span className="gnx-layer-number">{index + 1}</span><h3>{label}</h3></header><div className="gnx-original"><span>Original draft</span><p>{original ? (crossed ? <s>{original}</s> : original) : <em>Missing — add your sentence below.</em>}</p>{id.startsWith("detail") && <label className="gnx-crossout"><input type="checkbox" checked={crossed} onChange={(event) => update((old) => ({ ...old, paragraph: { ...old.paragraph, crossedOut: event.target.checked ? [...new Set([...old.paragraph.crossedOut, id])] : old.paragraph.crossedOut.filter((slot) => slot !== id) } }))} />Cross out this supporting detail</label>}</div><label htmlFor={`${chapter.id}-${id}`}>Your revised {label.toLocaleLowerCase()}<textarea id={`${chapter.id}-${id}`} ref={(element) => { if (element) inputs.current[id] = element; }} rows={3} value={paragraph.sentences[id]} onChange={(event) => update((old) => ({ ...old, paragraph: { ...old.paragraph, sentences: { ...old.paragraph.sentences, [id]: event.target.value } } }))} onBlur={archive} /></label><div className="gnx-marker-actions"><span>Select words in your sentence, then:</span><button aria-label={`Mark adjective in ${label}`} className="gnx-button gnx-button-light" onClick={() => markSelection(id, "adjectives")}>Mark adjective<span className="gnx-sr-only">{" "}in {label}</span></button><button aria-label={`Mark adverb in ${label}`} className="gnx-button gnx-button-light" onClick={() => markSelection(id, "adverbs")}>Mark adverb<span className="gnx-sr-only">{" "}in {label}</span></button></div><div className="gnx-two-columns gnx-word-markers"><label htmlFor={`${chapter.id}-${id}-adjective`}>Adjective or adjective phrase<input id={`${chapter.id}-${id}-adjective`} value={paragraph.adjectives[id]} onChange={(event) => update((old) => ({ ...old, paragraph: { ...old.paragraph, adjectives: { ...old.paragraph.adjectives, [id]: event.target.value } } }))} onBlur={archive} /></label><label htmlFor={`${chapter.id}-${id}-adverb`}>Adverb or adverb phrase<input id={`${chapter.id}-${id}-adverb`} value={paragraph.adverbs[id]} onChange={(event) => update((old) => ({ ...old, paragraph: { ...old.paragraph, adverbs: { ...old.paragraph.adverbs, [id]: event.target.value } } }))} onBlur={archive} /></label></div>{(["adjectives", "adverbs"] as const).some((kind) => paragraph[kind][id].trim() && !paragraph.sentences[id].toLocaleLowerCase().includes(paragraph[kind][id].trim().toLocaleLowerCase())) && <p className="gnx-revise">One of the marked phrases is missing from this sentence. Update the sentence or your selection.</p>}</article>;
  })}</div><article className="gnx-card gnx-polished"><span className="gnx-eyebrow">YOUR ASSEMBLED PARAGRAPH</span><h3>Read it as one idea.</h3><div className="gnx-paragraph-preview">{paragraphSlots.map((slot) => <Fragment key={slot.id}><MarkedSentence text={paragraph.sentences[slot.id] || `[${slot.label} needed]`} adjective={paragraph.adjectives[slot.id]} adverb={paragraph.adverbs[slot.id]} />{" "}</Fragment>)}</div><p className="gnx-marker-key"><span>Adjective: single underline</span><span>Adverb: double underline</span></p><p className="gnx-note">These highlights show your choices. Check the paragraph for feedback on how those words are used.</p><p className="gnx-note">Practice word to use naturally: {chapter.vocabularyPractice.map((word) => word.word).join(", ")}. {practicePresent ? "A practice word appears in your draft; review its meaning in context." : "Add at least one chapter practice word where it makes sense."}</p>{bannedPresent.length > 0 && <p className="gnx-revise">Teacher-configured words to revise: {bannedPresent.join(", ")}. No automatic score has been deducted.</p>}<AutomaticFeedback chapter={chapter} work={work} target={{ kind: "paragraph", id: chapter.id }} update={update} label="Check paragraph" beforeCheck={archive}><button className="gnx-button gnx-button-light" onClick={() => update((old) => ({ ...old, paragraph: { ...old.paragraph, help: !old.paragraph.help } }))}>{paragraph.help ? "Hide editing help" : "Editing help"}</button></AutomaticFeedback>{paragraph.help && <aside className="gnx-help"><strong>Editing clues</strong><p>{draft.relevanceGuidance}</p><p>Grammar repair to look for: {Object.entries(draft.grammarCorrections).map(([from, to]) => `“${from}” → “${to}”`).join("; ")}</p><p>One possible supporting detail: {draft.suggestedMissingDetail}</p></aside>}{work.automaticChecks?.[`paragraph:${chapter.id}`] && <><aside className="gnx-help"><strong>One possible revision</strong><p>{draft.modelParagraph}</p><p className="gnx-note">This is one possible revision. Other relevant details and natural, clearly written paragraphs can work too.</p></aside></>}{paragraph.history.length > 0 && <details className="gnx-history"><summary>Saved paragraph drafts ({paragraph.history.length})</summary>{paragraph.history.map((revision, index) => <article key={index}><strong>Draft {index + 1}</strong><p>{paragraphSlots.map((slot) => revision.sentences[slot.id]).join(" ")}</p></article>)}</details>}</article></section>;
}

export function TextFeatures({ chapter, work, update }: ExerciseProps) {
  const archive = (id: string) => update((old) => {
    const box = old.features[id];
    const revision = { feature: box.feature, purpose: box.purpose, help: box.help };
    const previous = box.history.at(-1);
    if (!Object.values(revision).some((text) => text.trim()) || (previous && JSON.stringify({ feature: previous.feature, purpose: previous.purpose, help: previous.help }) === JSON.stringify(revision))) return old;
    return { ...old, features: { ...old.features, [id]: { ...box, history: [...box.history, { ...revision, savedAt: new Date().toISOString() }] } } };
  });
  return <section className="gnx-exercises gnx-feature-hunt"><SectionIntro eyebrow="05 / LOOK CLOSER" title="Text Features Hunt"><p>Use the story pictures and words below to make four different discoveries. For each one, name a feature, explain why it is there, and say how it helps you understand the story.</p><p>Browse any of the eight panels beside each discovery. Open the story panel whenever you need a closer look; your answers stay in place.</p></SectionIntro><div className="gnx-feature-grid">{chapter.textFeaturesHunt.boxes.map((box, boxIndex) => {
    const response = work.features[box.id];
    return <article className="gnx-card gnx-feature-box" key={box.id} aria-label={`Discovery ${box.number}`}><header><span className="gnx-eyebrow">DISCOVERY {box.number.toString().padStart(2, "0")}</span><h3>Notice. Explain. Connect.</h3></header><FeatureSource chapter={chapter} number={box.number}>{(["feature", "purpose", "help"] as const).map((field, index) => <label htmlFor={`${box.id}-${field}`} key={field}>{box.prompts[index]}<textarea id={`${box.id}-${field}`} rows={index ? 4 : 2} value={response[field]} onChange={(event) => update((old) => ({ ...old, features: { ...old.features, [box.id]: { ...old.features[box.id], [field]: event.target.value } } }))} onBlur={() => archive(box.id)} /></label>)}<AutomaticFeedback chapter={chapter} work={work} target={{ kind: "feature", id: box.id }} update={update} label="Check text feature" ariaLabel={`Check text feature ${box.number}`} beforeCheck={() => archive(box.id)}><button aria-label={`${response.showHelp ? "Hide feature help" : "Feature help"} ${box.number}`} className="gnx-button gnx-button-light" onClick={() => update((old) => ({ ...old, features: { ...old.features, [box.id]: { ...old.features[box.id], showHelp: !old.features[box.id].showHelp } } }))}>{response.showHelp ? "Hide feature help" : "Feature help"}<span className="gnx-sr-only">{" "}{box.number}</span></button></AutomaticFeedback>{response.showHelp && <aside className="gnx-help"><strong>Look at how the chapter communicates.</strong><p>Who is speaking? What does a narration box explain? Which picture, expression, panel order or title helps you? Choose one specific feature and explain its effect.</p></aside>}{work.automaticChecks?.[`feature:${box.id}`] && <><aside className="gnx-help"><strong>An example to compare, not copy</strong><p>{chapter.textFeaturesHunt.teacherExamples[boxIndex]?.feature}: {chapter.textFeaturesHunt.teacherExamples[boxIndex]?.purpose}</p><p>{chapter.textFeaturesHunt.teacherExamples[boxIndex]?.comprehensionHelp}</p><p className="gnx-note">{chapter.textFeaturesHunt.gradingNote}</p></aside></>}<TextHistory entries={response.history.map((revision) => `${revision.feature}\n${revision.purpose}\n${revision.help}`)} /></FeatureSource></article>;
  })}</div></section>;
}

function orderedChoices<T extends { id: string }>(choices: T[], order: string[]) {
  const ranks = new Map(order.map((id, index) => [id, index]));
  return [...choices].sort((left, right) => (ranks.get(left.id) ?? choices.length) - (ranks.get(right.id) ?? choices.length));
}

export function VocabularyBank({ chapter, work, update }: ExerciseProps) {
  const bank = chapter.cumulativeVocabularyBank;
  const available = bank.wordIds.filter((id) => wordsById[id]?.introducedInChapter <= chapter.number);
  const definitions = orderedChoices(bank.definitionChoices.filter((choice) => available.includes(choice.correctWordId)), work.bank.definitionOrder);
  const synonyms = orderedChoices(bank.synonymChoices.filter((choice) => available.includes(choice.correctWordId)), work.bank.synonymOrder);
  const matches = countBankMatches(chapter, work);
  const allSelected = available.every((id) => work.bank.definitions[id] && work.bank.synonyms[id]);
  const choose = (kind: "definitions" | "synonyms", wordId: string, choiceId: string) => update((old) => ({ ...old, bank: { ...old.bank, submitted: false, [kind]: { ...old.bank[kind], [wordId]: choiceId } } }));
  const submit = () => update((old) => ({ ...old, bank: { ...old.bank, submitted: true, history: [...old.bank.history, { definitions: { ...old.bank.definitions }, synonyms: { ...old.bank.synonyms }, reflection: old.bank.reflection, savedAt: new Date().toISOString() }] } }));
  return <section className="gnx-exercises"><SectionIntro eyebrow="06 / CONNECT YOUR WORDS" title="Cumulative Vocabulary Bank / Review"><p>{bank.prompt}</p><p className="gnx-note">Only words introduced in this unit so far appear here. The definition and synonym banks have separate saved orders.</p></SectionIntro><div className="gnx-bank-grids"><article className="gnx-card"><h3>Definition bank</h3><ol className="gnx-bank-list">{definitions.map((choice, index) => <li key={choice.id}><span>{String.fromCharCode(65 + index)}</span><p>{choice.text}</p></li>)}</ol></article><article className="gnx-card"><h3>Synonym bank</h3><ol className="gnx-bank-list">{synonyms.map((choice, index) => <li key={choice.id}><span>{index + 1}</span><p>{choice.text}</p></li>)}</ol></article></div><article className="gnx-card gnx-bank-matches"><h3>Make your matches</h3>{available.map((wordId) => {
    const word = wordsById[wordId];
    const correctDefinition = definitions.find((choice) => choice.correctWordId === wordId);
    const correctSynonym = synonyms.find((choice) => choice.correctWordId === wordId);
    return <fieldset key={wordId}><legend>{word.word}</legend><div className="gnx-two-columns"><label htmlFor={`${wordId}-bank-definition`}>Definition match<select id={`${wordId}-bank-definition`} value={work.bank.definitions[wordId] ?? ""} onChange={(event) => choose("definitions", wordId, event.target.value)}><option value="">Choose a definition</option>{definitions.map((choice, index) => <option key={choice.id} value={choice.id}>{String.fromCharCode(65 + index)} — {choice.text}</option>)}</select><span className="gnx-selected-choice" aria-hidden="true">{definitions.find((choice) => choice.id === work.bank.definitions[wordId])?.text}</span></label><label htmlFor={`${wordId}-bank-synonym`}>Synonym match<select id={`${wordId}-bank-synonym`} value={work.bank.synonyms[wordId] ?? ""} onChange={(event) => choose("synonyms", wordId, event.target.value)}><option value="">Choose a synonym</option>{synonyms.map((choice, index) => <option key={choice.id} value={choice.id}>{index + 1} — {choice.text}</option>)}</select><span className="gnx-selected-choice" aria-hidden="true">{synonyms.find((choice) => choice.id === work.bank.synonyms[wordId])?.text}</span></label></div>{work.bank.submitted && <div className="gnx-bank-feedback" role="status"><p className={correctDefinition?.id === work.bank.definitions[wordId] ? "gnx-match" : "gnx-revise"}>{correctDefinition?.id === work.bank.definitions[wordId] ? "Definition matches." : `Definition to revisit: ${correctDefinition?.text ?? "Please review this word."}`}</p><p className={correctSynonym?.id === work.bank.synonyms[wordId] ? "gnx-match" : "gnx-revise"}>{correctSynonym?.id === work.bank.synonyms[wordId] ? "Synonym matches." : `Synonym to revisit: ${correctSynonym?.text ?? "Please review this word."}`}</p></div>}</fieldset>;
  })}<label htmlFor={`${chapter.id}-bank-reflection`}>Explain one match you revised or checked<textarea id={`${chapter.id}-bank-reflection`} rows={3} value={work.bank.reflection} onChange={(event) => update((old) => ({ ...old, bank: { ...old.bank, reflection: event.target.value } }))} /></label><div className="gnx-action-row"><button className="gnx-button" disabled={!allSelected} onClick={submit}>Check my matches</button>{work.bank.submitted && <p className="gnx-match" role="status">{matches.correct} of {matches.total} matches correct. You can revise and check again.</p>}</div><AutomaticFeedback chapter={chapter} work={work} target={{ kind: "bank-reflection", id: chapter.id }} update={update} label="Check reflection" />{work.bank.history.length > 0 && <details className="gnx-history"><summary>Previous bank attempts ({work.bank.history.length})</summary>{work.bank.history.map((attempt, index) => <article key={index}><strong>Attempt {index + 1}</strong>{available.map((wordId) => <p key={wordId}>{wordsById[wordId].word}: {definitions.find((choice) => choice.id === attempt.definitions[wordId])?.text ?? "No definition"}; {synonyms.find((choice) => choice.id === attempt.synonyms[wordId])?.text ?? "No synonym"}</p>)}<p>{attempt.reflection}</p></article>)}</details>}</article></section>;
}

export function ReviewPanel({ chapter, work }: ExerciseProps) {
  return <section className="gnx-exercises"><SectionIntro eyebrow="CHECK, REFLECT, REVISE" title="Your work matters more than a score"><p>The app checks your written answers for meaning, support, clarity and conventions. It gives you a next step and says when it cannot confidently judge an idea. Different well-supported opinions are welcome.</p><p className="gnx-note">Checks run on this device for free. Spelling and vocabulary matches are checked separately. Completing a chapter and understanding every idea are different things.</p></SectionIntro><ReviewSummary chapter={chapter} work={work} /></section>;
}
