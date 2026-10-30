import { useEffect, useRef, useState } from "react";
import { useLearningProgress } from "../progress";
import {
  countWords,
  createLabSession,
  labProgressInput,
  labScore,
  latestLabSession,
  STORY_LAB_PREFERENCE_ID,
} from "./labProgress";
import { hotelExperience } from "./hotelExperience";
import { observatoryExperience } from "./observatoryExperience";
import { StoryWorldArt } from "./StoryWorldArt";
import type { ExperienceId, LabSession, StoryExperience, StoryPreference } from "./types";
import "./storyLab.css";

export const storyExperiences = [hotelExperience, observatoryExperience];

function LabHeader({ onBack, playing = false }: { onBack: () => void; playing?: boolean }) {
  return (
    <header className="sl-header">
      <a className="sl-wordmark" href="#story-lab" onClick={(event) => { event.preventDefault(); onBack(); }}>
        <span className="sl-logo" aria-hidden="true">✦</span>
        <span>Story Lab<span className="sl-wordmark-small">THE NEXT CHAPTER</span></span>
      </a>
      <button className="sl-button sl-button-quiet" onClick={onBack}>
        {playing ? "Back to both stories" : "Back to English"}
      </button>
    </header>
  );
}

export function StoryLab({ onBackToEnglish }: { onBackToEnglish: () => void }) {
  const { auth } = useLearningProgress();
  return <StoryLabWorkspace key={auth.userId ?? "guest"} onBackToEnglish={onBackToEnglish} />;
}

function StoryLabWorkspace({ onBackToEnglish }: { onBackToEnglish: () => void }) {
  const { snapshot, auth, updatePracticeProgress } = useLearningProgress();
  const [playing, setPlaying] = useState<{ experience: StoryExperience; session: LabSession } | null>(null);
  const attempts = [...Object.values(snapshot.activeAttempts), ...snapshot.completedAttempts];
  const sessions = Object.fromEntries(storyExperiences.map((experience) => [
    experience.id, latestLabSession(attempts, experience),
  ])) as Record<ExperienceId, LabSession | null>;
  const finishedSessions = Object.fromEntries(storyExperiences.map((experience) => [
    experience.id, latestLabSession(snapshot.completedAttempts, experience),
  ])) as Record<ExperienceId, LabSession | null>;
  const completed = (id: ExperienceId) => Boolean(finishedSessions[id]);
  const bothComplete = completed("hotel") && completed("observatory");

  useEffect(() => {
    document.title = playing ? `${playing.experience.title} · Story Lab` : "Story Lab · Try two adventures";
    return () => { document.title = "English Practice"; };
  }, [playing?.experience.id]);

  const launch = (experience: StoryExperience, replay = false) => {
    const session = !replay && sessions[experience.id] ? sessions[experience.id]! : createLabSession(experience);
    updatePracticeProgress(labProgressInput(experience, session));
    setPlaying({ experience, session });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const backToLab = () => {
    setPlaying(null);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  if (playing) return (
    <ExperienceRunner
      key={playing.session.attemptId}
      experience={playing.experience}
      initialSession={playing.session}
      onBack={backToLab}
      onTryOther={() => launch(storyExperiences.find((experience) => experience.id !== playing.experience.id)!)}
      save={(session) => updatePracticeProgress(labProgressInput(playing.experience, session))}
    />
  );

  return (
    <main className="story-lab sl-hub">
      <div className="sl-wrap">
        <LabHeader onBack={onBackToEnglish} />
        <section className="sl-intro" aria-labelledby="lab-heading">
          <p className="sl-kicker"><span aria-hidden="true">✧</span> TWO WORLDS. YOU CHOOSE WHAT COMES NEXT.</p>
          <h1 id="lab-heading">Which story will<br /><em>pull you in?</em></h1>
          <p>One strange hotel. One secret in the stars. Step inside both adventures, then help choose the world we build next.</p>
          <div className="sl-fair-test"><span>About 6 minutes each</span><span>3 English challenges + a short message</span><span>Play in either order</span></div>
        </section>

        <section className="sl-world-grid" aria-label="Choose a sample experience">
          {storyExperiences.map((experience) => {
            const session = sessions[experience.id];
            const finished = Boolean(session && session.stageIndex > experience.scenes.length);
            return (
              <article key={experience.id} className={`sl-world-card sl-theme-${experience.id}`}>
                <div className="sl-card-art">
                  <StoryWorldArt world={experience.id} />
                  <span className="sl-experience-badge">EXPERIENCE {experience.label}</span>
                  {finished && <span className="sl-complete-badge">✓ Finished</span>}
                </div>
                <div className="sl-card-body">
                  <p className="sl-card-tone">{experience.id === "hotel" ? "A LITTLE SPOOKY. VERY SILLY." : "FOLLOW YOUR CURIOSITY."}</p>
                  <h2>{experience.title}</h2>
                  <p className="sl-card-subtitle">{experience.subtitle}</p>
                  <p className="sl-card-hook">{experience.hook}</p>
                  <p className="sl-tone">{experience.tone}</p>
                  <button
                    className="sl-button sl-button-primary sl-card-start"
                    disabled={auth.status === "loading"}
                    onClick={() => launch(experience)}
                    aria-label={`${finished ? "Review" : session ? "Continue" : "Start"} experience ${experience.label}`}
                  >
                    {finished ? "Revisit & rate" : session ? "Continue adventure" : experience.id === "hotel" ? "Check in, if you dare" : "Step into the stars"}
                    <span aria-hidden="true">↗</span>
                  </button>
                  {finished && <button className="sl-replay" onClick={() => launch(experience, true)}>Play experience {experience.label} again</button>}
                </div>
              </article>
            );
          })}
        </section>

        <section className="sl-comparison" aria-labelledby="comparison-heading">
          <div className="sl-section-heading"><p className="sl-kicker">THE READER GETS THE FINAL SAY</p><h2 id="comparison-heading">Your story, your verdict.</h2><p>English scores show practice. Your enjoyment decides the favorite.</p></div>
          <div className="sl-results-grid">
            {storyExperiences.map((experience) => {
              const session = finishedSessions[experience.id];
              return (
                <article className="sl-result" key={experience.id}>
                  <h3><span>{experience.label}</span> {experience.title}</h3>
                  {session && completed(experience.id) ? (
                    <dl><div><dt>English clues solved</dt><dd>{labScore(experience, session)} / 3</dd></div><div><dt>Fun</dt><dd>{session.ratings.fun ? `${session.ratings.fun} / 5` : "Not rated yet"}</dd></div><div><dt>Want the next chapter?</dt><dd>{session.ratings.curiosity ? `${session.ratings.curiosity} / 5` : "Not rated yet"}</dd></div><div><dt>Difficulty</dt><dd>{session.ratings.challenge?.replaceAll("-", " ") ?? "Not rated yet"}</dd></div></dl>
                  ) : <p>{session ? "Your bookmark is ready. Continue whenever you like." : "Your thoughts appear here after the ending."}</p>}
                </article>
              );
            })}
          </div>
          <PreferenceForm enabled={bothComplete} />
        </section>
        <footer className="sl-footer">A small story experiment for Grades 4–5. Your answers and ratings save with your learning progress.</footer>
      </div>
    </main>
  );
}

function PreferenceForm({ enabled }: { enabled: boolean }) {
  const { snapshot, updatePracticeProgress } = useLearningProgress();
  const saved = snapshot.completedAttempts.find((attempt) => attempt.attemptId === STORY_LAB_PREFERENCE_ID);
  const [choice, setChoice] = useState<StoryPreference | null>(null);
  const [reason, setReason] = useState("");
  const [edited, setEdited] = useState(false);
  const [savedNow, setSavedNow] = useState(false);
  const savedChoice = saved?.metadata?.preference;
  const selected = edited ? choice : savedChoice === "hotel" || savedChoice === "observatory" || savedChoice === "both" || savedChoice === "neither" ? savedChoice : null;
  const displayedReason = edited ? reason : typeof saved?.metadata?.reason === "string" ? saved.metadata.reason : "";

  return (
    <form className="sl-verdict" onSubmit={(event) => {
      event.preventDefault();
      if (!enabled || !selected) return;
      updatePracticeProgress({
        attemptId: STORY_LAB_PREFERENCE_ID,
        subject: "English", topic: "Story Lab: reader preference",
        answered: 1, total: 1, score: 0, status: "completed",
        metadata: { format: "story-lab-preference-v1", preference: selected, reason: displayedReason },
      });
      setSavedNow(true);
    }}>
      <fieldset disabled={!enabled}>
        <legend>Which world should get another chapter?</legend>
        {!enabled && <p className="sl-verdict-help">Reach both endings to unlock your final choice. You can start with either story.</p>}
        <div className="sl-preference-options">
          {([
            ["hotel", "Experience A", "The Midnight Hotel", "Choose experience A"],
            ["observatory", "Experience B", "The Observatory Between Stars", "Choose experience B"],
            ["both", "I like both", "Keep both worlds", "I like both"],
            ["neither", "Neither yet", "Let’s try something else", "Neither yet"],
          ] as const).map(([value, title, detail, label]) => (
            <button type="button" key={value} aria-label={label} aria-pressed={selected === value} className="sl-preference-option" onClick={() => { setChoice(value); setReason(displayedReason); setEdited(true); setSavedNow(false); }}>
              <strong>{title}</strong><span>{detail}</span>
            </button>
          ))}
        </div>
        <label className="sl-writing-label" htmlFor="story-lab-reason">What made you choose? <span>(optional)</span></label>
        <textarea id="story-lab-reason" rows={3} maxLength={600} value={displayedReason} placeholder="The funniest moment, a character you liked, something that felt boring…" onChange={(event) => { setChoice(selected); setReason(event.target.value); setEdited(true); setSavedNow(false); }} />
        <button className="sl-button sl-button-dark" disabled={!selected}>Save my choice</button>
      </fieldset>
      {(savedNow || saved) && <p className="sl-saved-verdict" role="status">{savedNow ? "Your choice is saved. Thanks for helping shape the next chapter." : "Your previous choice is saved. You can change it after trying both stories."}</p>}
    </form>
  );
}

function RatingRow({ title, prefix, value, onChange }: { title: string; prefix: string; value: number | null; onChange: (value: number) => void }) {
  return <fieldset className="sl-rating"><legend>{title}</legend><div>{[1,2,3,4,5].map((rating) => <button key={rating} type="button" aria-label={`${prefix}: ${rating} out of 5`} aria-pressed={value === rating} onClick={() => onChange(rating)}>{rating}</button>)}</div><p>1 = not much · 5 = very much</p></fieldset>;
}

function ExperienceRunner({ experience, initialSession, onBack, onTryOther, save }: { experience: StoryExperience; initialSession: LabSession; onBack: () => void; onTryOther: () => void; save: (session: LabSession) => void }) {
  const [session, setSession] = useState(initialSession);
  const heading = useRef<HTMLHeadingElement>(null);
  const scene = experience.scenes[session.stageIndex];
  const writingStep = session.stageIndex === experience.scenes.length;
  const atEnding = session.stageIndex > experience.scenes.length;
  const wordCount = countWords(session.writing);
  const interaction = scene?.interaction;
  const chosen = scene ? session.choices[scene.id] : undefined;
  const choiceResult = interaction?.kind === "choice" ? interaction.options.find((option) => option.id === chosen) : null;
  const correct = interaction?.kind === "question" && chosen === interaction.correctOptionId;
  const clues = experience.scenes.flatMap((item) => {
    const answer = session.choices[item.id];
    if (!answer) return [];
    return item.interaction.kind === "question" ? [item.interaction.clue] : item.interaction.options.filter((option) => option.id === answer).map((option) => option.clue);
  });

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [session.stageIndex]);

  const commit = (next: LabSession) => { setSession(next); save(next); };
  const rate = (key: "fun" | "curiosity", value: number) => commit({ ...session, ratings: { ...session.ratings, [key]: value } });

  return (
    <main className={`story-lab sl-reader sl-theme-${experience.id}`}>
      <div className="sl-wrap">
        <LabHeader onBack={onBack} playing />
        <div className="sl-reader-topline"><span>EXPERIENCE {experience.label} · {experience.title}</span><span>{atEnding ? "The ending" : `Chapter ${session.stageIndex + 1} of 5`}</span></div>
        <div className="sl-chapter-progress" role="progressbar" aria-label="Adventure progress" aria-valuemin={0} aria-valuemax={5} aria-valuenow={Math.min(session.stageIndex, 5)}><span style={{ width: `${Math.min(session.stageIndex / 5, 1) * 100}%` }} /></div>
        <div className="sl-reader-layout">
          <article className="sl-page">
            {session.stageIndex === 0 && <div className="sl-inline-world"><StoryWorldArt world={experience.id} /></div>}
            <div className="sl-page-heading"><p className="sl-kicker">{atEnding ? "CASE CLOSED… FOR NOW" : writingStep ? "LEAVE YOUR MARK ON THE STORY" : scene.location}</p><h1 tabIndex={-1} ref={heading}>{atEnding ? experience.ending.title : writingStep ? "Your words finish the mission" : scene.title}</h1></div>
            <div className="sl-prose">
              {atEnding ? experience.ending.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : writingStep ? <p>{experience.writing.prompt}</p> : scene.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>

            {scene && interaction && (
              <section className="sl-interaction" aria-labelledby="interaction-heading">
                <span className="sl-skill">{interaction.kind === "choice" ? "YOUR MOVE" : interaction.skill}</span>
                <h2 id="interaction-heading">{interaction.prompt}</h2>
                <div className="sl-answer-options">{interaction.options.map((option, index) => (
                  <button key={option.id} type="button" disabled={Boolean(chosen)} aria-pressed={chosen === option.id} className={`sl-answer ${chosen === option.id ? "sl-answer-selected" : ""} ${chosen && interaction.kind === "question" && option.id === interaction.correctOptionId ? "sl-answer-correct" : ""}`} onClick={() => commit({ ...session, choices: { ...session.choices, [scene.id]: option.id } })}>
                    <span className="sl-answer-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option.text}</span>
                  </button>
                ))}</div>
                {chosen && <div className="sl-story-response" role="status"><strong>{interaction.kind === "choice" ? "Here’s what happens…" : correct ? "You found it." : "A clue to help you."}</strong><p>{interaction.kind === "choice" ? choiceResult?.response : correct ? interaction.success : interaction.explanation}</p><p className="sl-new-clue">✧ Notebook updated: {choiceResult?.clue ?? (interaction.kind === "question" ? interaction.clue : "")}</p></div>}
                <button className="sl-button sl-button-primary sl-next" disabled={!chosen} onClick={() => { if (chosen) commit({ ...session, stageIndex: session.stageIndex + 1 }); }}>Continue story <span aria-hidden="true">→</span></button>
              </section>
            )}

            {writingStep && (
              <form className="sl-writing" onSubmit={(event) => { event.preventDefault(); if (wordCount >= experience.writing.minWords) commit({ ...session, stageIndex: session.stageIndex + 1 }); }}>
                <label className="sl-writing-label" htmlFor="lab-message">Your message</label>
                <textarea id="lab-message" value={session.writing} rows={6} maxLength={3000} placeholder={experience.writing.placeholder} onChange={(event) => commit({ ...session, writing: event.target.value })} aria-describedby="lab-writing-help" />
                <div className="sl-word-count"><span>{wordCount} words</span><span>At least {experience.writing.minWords} words</span></div>
                <p className="sl-help" id="lab-writing-help">Use your own words and the clues in your notebook. The word count opens the ending; your writing is not automatically graded.</p>
                <button className="sl-button sl-button-primary sl-next" disabled={wordCount < experience.writing.minWords}>Reveal the ending <span aria-hidden="true">✦</span></button>
              </form>
            )}

            {atEnding && (
              <>
                <details className="sl-your-message"><summary>Read the message you left</summary><p>{session.writing}</p></details>
                <aside className="sl-teaser"><span>ONE MORE THING…</span><p>{experience.ending.teaser}</p><small>A possible next chapter. This sample ends here.</small></aside>
                <section className="sl-feedback" aria-label={`Rate experience ${experience.label}`}>
                  <p className="sl-kicker">NOW BE THE STORY CRITIC</p><h2>Would you come back?</h2><p>You solved {labScore(experience, session)} of 3 English challenges. These ratings are about the story.</p>
                  <RatingRow title="How much fun was it?" prefix="Fun" value={session.ratings.fun} onChange={(value) => rate("fun", value)} />
                  <RatingRow title="How much do you want the next chapter?" prefix="Curiosity" value={session.ratings.curiosity} onChange={(value) => rate("curiosity", value)} />
                  <fieldset className="sl-rating"><legend>How did the English challenges feel?</legend><div className="sl-difficulty">{([ ["too-easy", "Too easy"], ["just-right", "Just right"], ["too-hard", "Too hard"] ] as const).map(([value,label]) => <button key={value} type="button" aria-pressed={session.ratings.challenge === value} onClick={() => commit({ ...session, ratings: { ...session.ratings, challenge: value } })}>{label}</button>)}</div></fieldset>
                  {(session.ratings.fun || session.ratings.curiosity || session.ratings.challenge) && <p className="sl-saved" role="status">Your ratings are saved with this adventure.</p>}
                  <div className="sl-ending-actions"><button className="sl-button sl-button-primary" onClick={onTryOther}>Try the other experience <span aria-hidden="true">↗</span></button><button className="sl-button sl-button-quiet" onClick={onBack}>Compare both stories</button></div>
                </section>
              </>
            )}
          </article>

          <aside className="sl-notebook">
            <div className="sl-notebook-art"><StoryWorldArt world={experience.id} /></div>
            <div className="sl-notebook-content"><p className="sl-kicker">YOUR FIELD NOTES</p><h2>{experience.id === "hotel" ? "The case so far" : "Signs in the starlight"}</h2>{clues.length ? <ol>{clues.map((clue) => <li key={clue}>{clue}</li>)}</ol> : <p>Follow your first clue. Your discoveries will gather here.</p>}
              {session.stageIndex > 0 && <details className="sl-reread"><summary>Reread earlier scenes</summary>{experience.scenes.slice(0, Math.min(session.stageIndex, 4)).map((earlier) => <section key={earlier.id}><h3>{earlier.title}</h3>{earlier.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</details>}
              <p className="sl-bookmark">◇ Your place saves as you go. Come back whenever you like.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
