import type { GraphicChapter } from "./data";
import type { ChapterWork } from "./types";

function MarkedModel({ text }: { text: string }) {
  return <p>{text.split(/(\[(?:adj|adv):[^\]]+\])/g).map((piece, index) => {
    const match = piece.match(/^\[(adj|adv):([^\]]+)\]$/);
    return match ? <mark key={index} className={match[1] === "adv" ? "gnx-selected-adverb" : "gnx-selected-adjective"} title={match[1] === "adv" ? "Adverb" : "Adjective"}>{match[2]}</mark> : piece;
  })}</p>;
}

/** Mounted only after an explicit self/parent-review action. */
export function ReviewSummary({ chapter, work }: { chapter: GraphicChapter; work: ChapterWork }) {
  return <div className="gnx-review-summary"><h3>Your responses and review guidance</h3><p className="gnx-note">Compare ideas and discuss revisions. The guidance gives possible answers, not sentences you must copy.</p>
    {chapter.comprehension.map((question) => <details key={question.id} className="gnx-story-reference"><summary>Question {question.number}: {question.prompt}</summary><h4>Your answer</h4><p className="gnx-preserve-lines">{work.comprehension[question.id].answer || "No written answer yet."}</p><p className="gnx-note">Your classification: {work.comprehension[question.id].type || "Not selected"}</p><h4>Guidance for discussion</h4><p>{question.answerGuidance}</p><p className="gnx-note">Suggested classification: {question.suggestedType}. A defensible alternative can also fit.</p></details>)}
    <details className="gnx-story-reference"><summary>Vocabulary: meaning, sentences, and spelling</summary>{chapter.vocabularyPractice.map((word) => {
      const answer = work.vocabulary[word.wordId];
      return <article key={word.wordId}><h4>{word.word}</h4><p><b>Your meaning:</b> {answer.definition || "Not written yet"}</p><p><b>Your synonyms:</b> {answer.synonyms || "Not written yet"}</p><p><b>Your sentence:</b> {answer.sentence || "Not written yet"}</p><p><b>Contextual meaning ({word.teacherWord.partOfSpeech}):</b> {word.teacherWord.definition}</p><p><b>Possible synonyms:</b> {word.teacherWord.synonyms.join(" / ")}</p><p><b>Example sentence:</b> {word.teacherWord.exampleSentence}</p><p className="gnx-note">Discuss whether the learner’s sentence makes this particular meaning clear. Spelling results alone do not establish understanding.</p></article>;
    })}</details>
    <details className="gnx-story-reference"><summary>Paragraph: your revision and an annotated example</summary><h4>Your paragraph</h4><p className="gnx-preserve-lines">{Object.values(work.paragraph.sentences).filter(Boolean).join(" ") || "No paragraph yet."}</p><h4>One possible revision</h4><div className="gnx-paragraph-preview"><MarkedModel text={chapter.hamburgerParagraph.modelParagraphMarked} /></div><p className="gnx-marker-key"><span>Adjective: single underline</span><span>Adverb: double underline</span></p><p>This is one possible revision. Other relevant details and natural, clearly written paragraphs can work too.</p><p>{chapter.hamburgerParagraph.relevanceGuidance}</p></details>
    <details className="gnx-story-reference"><summary>Text features: your discoveries and possible examples</summary>{chapter.textFeaturesHunt.boxes.map((box) => <article key={box.id}><h4>Discovery {box.number}</h4><p><b>Feature:</b> {work.features[box.id].feature || "Not identified yet"}</p><p><b>Purpose:</b> {work.features[box.id].purpose || "Not explained yet"}</p><p><b>How it helped:</b> {work.features[box.id].help || "Not explained yet"}</p></article>)}<h4>Examples to discuss</h4>{chapter.textFeaturesHunt.teacherExamples.map((example) => <article key={example.feature}><strong>{example.feature}</strong><p>{example.purpose}</p><p>{example.comprehensionHelp}</p></article>)}<p className="gnx-note">{chapter.textFeaturesHunt.gradingNote}</p></details>
    {work.submittedSnapshots.length > 0 && <details className="gnx-story-reference"><summary>Preserved chapter submissions ({work.submittedSnapshots.length})</summary>{work.submittedSnapshots.map((snapshot, index) => {
      try {
        const previous = JSON.parse(snapshot) as ChapterWork;
        return <article key={index}><h4>Submission {index + 1}</h4>{chapter.comprehension.map((question) => <div key={question.id}><strong>Question {question.number}</strong><p className="gnx-preserve-lines">{previous.comprehension?.[question.id]?.answer || "No answer"}</p></div>)}<h4>Paragraph at submission</h4><p>{Object.values(previous.paragraph?.sentences ?? {}).join(" ")}</p></article>;
      } catch { return <p key={index}>This earlier submission could not be displayed. Your current work is still available.</p>; }
    })}</details>}
  </div>;
}
